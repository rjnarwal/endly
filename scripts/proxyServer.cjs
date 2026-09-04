/**
 * Endly Mobile Proxy Interceptor & Traffic Engine (Full SSL MITM Decryption Edition)
 * Decrypts HTTPS traffic on-the-fly, extracts complete URLs + query params + decompressed response bodies.
 * Run with: npm run proxy
 */

const http = require('http');
const https = require('https');
const net = require('net');
const tls = require('tls');
const url = require('url');
const os = require('os');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { execSync } = require('child_process');
const { WebSocketServer } = require('ws');

let PROXY_PORT = 8888;
const WS_PORT = 8889;

// Certificate paths & in-memory SNI cache
const ROOT_CA_CERT = path.resolve(__dirname, '../public/endly-root-ca.crt');
const ROOT_CA_KEY = path.resolve(__dirname, '../public/endly-root-ca.key');
const CERT_CACHE_DIR = path.join(os.tmpdir(), 'endly_mitm_certs');

if (!fs.existsSync(CERT_CACHE_DIR)) {
  fs.mkdirSync(CERT_CACHE_DIR, { recursive: true });
}

const secureContextCache = new Map();

// Generate dynamic SSL cert signed by Endly Root CA
function getOrCreateSecureContext(rawHostname) {
  if (!rawHostname) return null;
  const hostname = rawHostname.split(':')[0].toLowerCase();

  if (secureContextCache.has(hostname)) {
    return secureContextCache.get(hostname);
  }

  const keyPath = path.join(CERT_CACHE_DIR, `${hostname}.key`);
  const csrPath = path.join(CERT_CACHE_DIR, `${hostname}.csr`);
  const crtPath = path.join(CERT_CACHE_DIR, `${hostname}.crt`);
  const extPath = path.join(CERT_CACHE_DIR, `${hostname}.ext`);

  try {
    if (!fs.existsSync(crtPath) || !fs.existsSync(keyPath)) {
      const extContent = `authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = ${hostname}
DNS.2 = *.${hostname}
IP.1 = 127.0.0.1
`;
      fs.writeFileSync(extPath, extContent);

      execSync(`openssl genrsa -out "${keyPath}" 2048`, { stdio: 'ignore' });
      execSync(`openssl req -new -key "${keyPath}" -out "${csrPath}" -subj "/CN=${hostname}/O=Endly Mobile Proxy"`, { stdio: 'ignore' });
      execSync(`openssl x509 -req -in "${csrPath}" -CA "${ROOT_CA_CERT}" -CAkey "${ROOT_CA_KEY}" -CAcreateserial -out "${crtPath}" -days 365 -sha256 -extfile "${extPath}"`, { stdio: 'ignore' });
    }

    const ctx = tls.createSecureContext({
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(crtPath),
    });

    secureContextCache.set(hostname, ctx);
    return ctx;
  } catch (err) {
    console.error(`Failed to generate MITM certificate for ${hostname}:`, err.message);
    return null;
  }
}

// High-speed persistent connection agents
const httpAgent = new http.Agent({ keepAlive: true, keepAliveMsecs: 10000, maxSockets: 100 });
const httpsAgent = new https.Agent({ keepAlive: true, keepAliveMsecs: 10000, maxSockets: 100, rejectUnauthorized: false });

let activeMocks = [];
let activeBreakpoints = [];
let activeMapRemote = [];
let activeMapLocal = [];
let activeThrottling = { enabled: false, latencyMs: 0, packetLossPercent: 0 };
let activeDomainFilter = { whitelist: [], blacklist: [], onlyWhitelisted: false };

let isProxyRunning = false;
let proxyServer = null;
let mitmServer = null;
let mitmPort = 0;
let wsClients = new Set();

// 1. Get Local LAN IP Addresses
function getLocalIps() {
  const interfaces = os.networkInterfaces();
  const ips = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        ips.push(iface.address);
      }
    }
  }
  if (ips.length === 0) ips.push('127.0.0.1');
  return ips;
}

// 2. Broadcast traffic log to connected Endly UI clients
function broadcast(data) {
  const msg = JSON.stringify(data);
  for (const client of wsClients) {
    if (client.readyState === 1) { // OPEN
      client.send(msg);
    }
  }
}

function logConsole(level, stage, message) {
  broadcast({ type: 'CONSOLE_EVENT', level, stage, message });
}

// Helper to decompress HTTP body for readable JSON viewing
function decompressBody(buffer, encoding) {
  if (!buffer || buffer.length === 0) return '';
  try {
    const enc = (encoding || '').toLowerCase();
    let decompressed = buffer;
    if (enc.includes('gzip')) {
      decompressed = zlib.gunzipSync(buffer);
    } else if (enc.includes('br')) {
      decompressed = zlib.brotliDecompressSync(buffer);
    } else if (enc.includes('deflate')) {
      decompressed = zlib.inflateSync(buffer);
    }
    return decompressed.toString('utf8');
  } catch {
    return buffer.toString('utf8');
  }
}

// 3. Common Decrypted Request Processor (Handles both direct HTTP and decrypted HTTPS)
async function handleDecryptedRequest(req, res, isHttps = false) {
  if (req.socket) req.socket.setNoDelay(true);

  const startTime = Date.now();
  const host = req.headers.host || (req.socket && req.socket.servername) || 'localhost';
  const protocol = isHttps ? 'https' : 'http';
  let fullUrl = req.url.startsWith('http') ? req.url : `${protocol}://${host}${req.url}`;
  let isMappedRemote = false;
  let originalUrl = undefined;

  // Collect request body
  const reqChunks = [];
  req.on('data', (chunk) => reqChunks.push(chunk));

  req.on('end', async () => {
    const reqBodyBuf = Buffer.concat(reqChunks);
    const reqBodyText = decompressBody(reqBodyBuf, req.headers['content-encoding']);

    // Check Throttling
    if (activeThrottling && activeThrottling.enabled && activeThrottling.latencyMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, activeThrottling.latencyMs));
    }

    if (activeThrottling && activeThrottling.enabled && activeThrottling.packetLossPercent > 0) {
      if (Math.random() * 100 < activeThrottling.packetLossPercent) {
        res.socket.destroy();
        return;
      }
    }

    // 1. Check Map Remote
    const matchedMapRemote = activeMapRemote.find((r) => r.enabled && fullUrl.toLowerCase().includes(r.fromPattern.toLowerCase()));
    if (matchedMapRemote) {
      originalUrl = fullUrl;
      fullUrl = fullUrl.replace(new RegExp(matchedMapRemote.fromPattern, 'i'), matchedMapRemote.toUrl);
      isMappedRemote = true;
    }

    const parsedUrl = url.parse(fullUrl);

    // 2. Check Map Local
    const matchedMapLocal = activeMapLocal.find((l) => {
      if (!l.enabled) return false;
      const targetPath = (parsedUrl.pathname || '').toLowerCase();
      const match = (l.matchPattern || '').toLowerCase();
      return targetPath === match || targetPath.endsWith(match) || fullUrl.toLowerCase().includes(match);
    });

    if (matchedMapLocal) {
      if (matchedMapLocal.delayMs) {
        await new Promise((resolve) => setTimeout(resolve, matchedMapLocal.delayMs));
      }

      const responseHeaders = {
        'content-type': 'application/json',
        'x-served-by': 'Endly-Map-Local',
        'access-control-allow-origin': '*',
      };

      (matchedMapLocal.headers || []).forEach((h) => {
        if (h.enabled) responseHeaders[h.key.toLowerCase()] = h.value;
      });

      res.writeHead(matchedMapLocal.statusCode || 200, responseHeaders);
      res.end(matchedMapLocal.responseBody || '{}');

      broadcast({
        type: 'TRAFFIC_EVENT',
        log: {
          id: Math.random().toString(36).substring(2, 9),
          timestamp: Date.now(),
          method: req.method,
          url: fullUrl,
          path: parsedUrl.path || '/',
          statusCode: matchedMapLocal.statusCode || 200,
          statusText: 'OK (Map Local)',
          isMocked: true,
          timeMs: Date.now() - startTime,
          sizeBytes: Buffer.byteLength(matchedMapLocal.responseBody || ''),
          requestHeaders: req.headers,
          responseHeaders,
          requestBody: reqBodyText,
          responseBody: matchedMapLocal.responseBody,
          clientIp: req.socket ? req.socket.remoteAddress : '',
        },
      });
      return;
    }

    // 3. Check Mock Rules
    const matchedMock = activeMocks.find((m) => {
      if (!m.enabled) return false;
      if (m.method && m.method !== req.method) return false;
      const targetPath = (parsedUrl.pathname || '').toLowerCase();
      const mockPath = (m.path || '').toLowerCase();
      return targetPath === mockPath || targetPath.endsWith(mockPath) || fullUrl.toLowerCase().includes(mockPath);
    });

    if (matchedMock) {
      if (matchedMock.delayMs) {
        await new Promise((resolve) => setTimeout(resolve, matchedMock.delayMs));
      }

      const responseHeaders = {
        'content-type': 'application/json',
        'x-mocked-by': 'Endly-Mobile-Interceptor',
        'access-control-allow-origin': '*',
      };

      (matchedMock.headers || []).forEach((h) => {
        if (h.enabled) responseHeaders[h.key.toLowerCase()] = h.value;
      });

      res.writeHead(matchedMock.statusCode || 200, responseHeaders);
      res.end(matchedMock.body || '{}');

      broadcast({
        type: 'TRAFFIC_EVENT',
        log: {
          id: Math.random().toString(36).substring(2, 9),
          timestamp: Date.now(),
          method: req.method,
          url: fullUrl,
          path: parsedUrl.path || '/',
          statusCode: matchedMock.statusCode || 200,
          statusText: 'OK (Endly Mock)',
          isMocked: true,
          mockId: matchedMock.id,
          timeMs: Date.now() - startTime,
          sizeBytes: Buffer.byteLength(matchedMock.body || ''),
          requestHeaders: req.headers,
          responseHeaders,
          requestBody: reqBodyText,
          responseBody: matchedMock.body,
          clientIp: req.socket ? req.socket.remoteAddress : '',
        },
      });
      return;
    }

    // 4. Forward to Upstream Server
    const isTargetHttps = parsedUrl.protocol === 'https:' || isHttps;
    const clientModule = isTargetHttps ? https : http;
    const targetPort = parsedUrl.port || (isTargetHttps ? 443 : 80);

    const fwdHeaders = { ...req.headers };
    fwdHeaders.host = parsedUrl.host || host;
    delete fwdHeaders['proxy-connection'];

    const options = {
      hostname: parsedUrl.hostname,
      port: targetPort,
      path: parsedUrl.path,
      method: req.method,
      headers: fwdHeaders,
      agent: isTargetHttps ? httpsAgent : httpAgent,
      rejectUnauthorized: false,
    };

    const upstreamReq = clientModule.request(options, (upstreamRes) => {
      res.writeHead(upstreamRes.statusCode, upstreamRes.headers);

      const resChunks = [];
      let totalBytes = 0;

      upstreamRes.on('data', (chunk) => {
        res.write(chunk);
        resChunks.push(chunk);
        totalBytes += chunk.length;
      });

      upstreamRes.on('end', () => {
        res.end();

        const rawResBuf = Buffer.concat(resChunks);
        const decodedResponseBody = decompressBody(rawResBuf, upstreamRes.headers['content-encoding']);

        broadcast({
          type: 'TRAFFIC_EVENT',
          log: {
            id: Math.random().toString(36).substring(2, 9),
            timestamp: Date.now(),
            method: req.method,
            url: fullUrl,
            path: parsedUrl.path || '/',
            statusCode: upstreamRes.statusCode,
            statusText: upstreamRes.statusMessage || 'OK',
            isMocked: false,
            isMappedRemote,
            originalUrl,
            timeMs: Date.now() - startTime,
            sizeBytes: totalBytes,
            requestHeaders: req.headers,
            responseHeaders: upstreamRes.headers,
            requestBody: reqBodyText,
            responseBody: decodedResponseBody.slice(0, 100000), // Full decompressed body
            clientIp: req.socket ? req.socket.remoteAddress : '',
          },
        });
      });
    });

    upstreamReq.on('error', (err) => {
      if (!res.headersSent) {
        res.writeHead(502, { 'Content-Type': 'text/plain' });
      }
      res.end(`Endly Proxy Error: ${err.message}`);
    });

    if (reqBodyBuf.length > 0) {
      upstreamReq.write(reqBodyBuf);
    }
    upstreamReq.end();
  });
}

// 4. Start Internal HTTPS MITM Server
function startMitmServer() {
  if (mitmServer) {
    try { mitmServer.close(); } catch {}
  }

  const defaultContext = tls.createSecureContext({
    key: fs.readFileSync(ROOT_CA_KEY),
    cert: fs.readFileSync(ROOT_CA_CERT),
  });

  mitmServer = https.createServer(
    {
      SNICallback: (servername, cb) => {
        try {
          const ctx = getOrCreateSecureContext(servername);
          cb(null, ctx || defaultContext);
        } catch (e) {
          cb(e, defaultContext);
        }
      },
    },
    (req, res) => handleDecryptedRequest(req, res, true)
  );

  mitmServer.listen(0, '127.0.0.1', () => {
    mitmPort = mitmServer.address().port;
    console.log(`🔒 Endly SSL Decryption MITM Engine listening on 127.0.0.1:${mitmPort}`);
  });
}

// 5. Create High-Performance HTTP & CONNECT Proxy Server
function startHttpProxy(port) {
  if (proxyServer) {
    try { proxyServer.close(); } catch {}
  }

  startMitmServer();

  PROXY_PORT = port || 8888;

  proxyServer = http.createServer((req, res) => handleDecryptedRequest(req, res, false));

  // HTTPS CONNECT Tunneling with Automated SSL MITM Decryption
  proxyServer.on('connect', (req, clientSocket, head) => {
    clientSocket.setNoDelay(true);
    clientSocket.setKeepAlive(true, 10000);

    const [host, portStr] = req.url.split(':');
    const port = parseInt(portStr, 10) || 443;

    // Apple / System pinned services that refuse MITM certs -> transparent TCP bypass
    const isPinnedHost = ['apple.com', 'icloud.com', 'push.apple.com'].some((d) => host.endsWith(d));

    if (isPinnedHost) {
      const serverSocket = net.connect(port, host, () => {
        clientSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
        if (head && head.length > 0) serverSocket.write(head);
        serverSocket.pipe(clientSocket);
        clientSocket.pipe(serverSocket);
      });
      serverSocket.on('error', () => clientSocket.end());
      clientSocket.on('error', () => serverSocket.destroy());
      return;
    }

    // Intercept with MITM Server for full URL, query param & body inspection
    const mitmSocket = net.connect(mitmPort, '127.0.0.1', () => {
      clientSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
      if (head && head.length > 0) {
        mitmSocket.write(head);
      }
      serverSocketPiping(clientSocket, mitmSocket);
    });

    mitmSocket.on('error', (err) => {
      logConsole('error', 'tunnel', `MITM Tunnel error for ${host}: ${err.message}`);
      clientSocket.end();
    });

    clientSocket.on('error', () => {
      mitmSocket.destroy();
    });
  });

  proxyServer.listen(PROXY_PORT, '0.0.0.0', () => {
    isProxyRunning = true;
    console.log(`\n⚡ Endly Turbo Proxy listening on 0.0.0.0:${PROXY_PORT}`);
    console.log(`📱 Phone Wi-Fi proxy:`);
    getLocalIps().forEach((ip) => {
      console.log(`   👉 Host: ${ip}  Port: ${PROXY_PORT}`);
    });
    console.log('');
  });
}

function serverSocketPiping(clientSocket, mitmSocket) {
  clientSocket.pipe(mitmSocket);
  mitmSocket.pipe(clientSocket);
}

// 6. WebSocket Control Server for Endly Web UI
try {
  const wss = new WebSocketServer({ port: WS_PORT });

  wss.on('connection', (ws) => {
    wsClients.add(ws);

    // Send initial status
    ws.send(
      JSON.stringify({
        type: 'STATUS',
        isRunning: isProxyRunning,
        port: PROXY_PORT,
        localIps: getLocalIps(),
      })
    );

    ws.on('message', (msg) => {
      try {
        const data = JSON.parse(msg);
        if (data.type === 'START_PROXY') {
          if (data.mocks) activeMocks = data.mocks;
          if (data.breakpoints) activeBreakpoints = data.breakpoints;
          if (data.mapRemote) activeMapRemote = data.mapRemote;
          if (data.mapLocal) activeMapLocal = data.mapLocal;
          if (data.throttling) activeThrottling = data.throttling;
          if (data.domainFilter) activeDomainFilter = data.domainFilter;

          startHttpProxy(data.port || 8888);
          ws.send(
            JSON.stringify({
              type: 'STATUS',
              isRunning: true,
              port: PROXY_PORT,
              localIps: getLocalIps(),
            })
          );
        } else if (data.type === 'STOP_PROXY') {
          if (proxyServer) proxyServer.close();
          if (mitmServer) mitmServer.close();
          isProxyRunning = false;
          ws.send(
            JSON.stringify({
              type: 'STATUS',
              isRunning: false,
              port: PROXY_PORT,
              localIps: getLocalIps(),
            })
          );
        } else if (data.type === 'SYNC_ALL_RULES') {
          if (data.breakpoints) activeBreakpoints = data.breakpoints;
          if (data.mapRemote) activeMapRemote = data.mapRemote;
          if (data.mapLocal) activeMapLocal = data.mapLocal;
          if (data.throttling) activeThrottling = data.throttling;
          if (data.domainFilter) activeDomainFilter = data.domainFilter;
        } else if (data.type === 'GET_STATUS') {
          ws.send(
            JSON.stringify({
              type: 'STATUS',
              isRunning: isProxyRunning,
              port: PROXY_PORT,
              localIps: getLocalIps(),
            })
          );
        }
      } catch (e) {
        console.error('WS message error', e);
      }
    });

    ws.on('close', () => {
      wsClients.delete(ws);
    });
  });

  console.log(`📡 Endly UI Bridge listening on ws://localhost:${WS_PORT}`);
} catch (err) {
  console.error('Failed to start WebSocket bridge', err);
}

// Start proxy immediately on launch
startHttpProxy(PROXY_PORT);
