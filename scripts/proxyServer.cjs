/**
 * Endly Mobile Proxy Interceptor & Proxyman Engine (High-Performance Turbo Edition)
 * Run with: npm run proxy
 */

const http = require('http');
const https = require('https');
const net = require('net');
const url = require('url');
const os = require('os');
const { WebSocketServer } = require('ws');

let PROXY_PORT = 8888;
const WS_PORT = 8889;

// High-speed persistent connection agents
const httpAgent = new http.Agent({ keepAlive: true, keepAliveMsecs: 10000, maxSockets: 100 });
const httpsAgent = new https.Agent({ keepAlive: true, keepAliveMsecs: 10000, maxSockets: 100 });

let activeMocks = [];
let activeBreakpoints = [];
let activeMapRemote = [];
let activeMapLocal = [];
let activeThrottling = { enabled: false, latencyMs: 0, packetLossPercent: 0 };
let activeDomainFilter = { whitelist: [], blacklist: [], onlyWhitelisted: false };

let isProxyRunning = false;
let proxyServer = null;
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

// 3. Create High-Performance HTTP & CONNECT Proxy Server
function startHttpProxy(port) {
  if (proxyServer) {
    try {
      proxyServer.close();
    } catch {}
  }

  PROXY_PORT = port || 8888;

  proxyServer = http.createServer(async (req, res) => {
    // Disable Nagle's algorithm for instant socket throughput
    if (req.socket) req.socket.setNoDelay(true);

    const startTime = Date.now();
    let reqUrl = req.url.startsWith('http') ? req.url : `http://${req.headers.host}${req.url}`;
    let isMappedRemote = false;
    let originalUrl = undefined;

    // Apply Simulated Throttling Delay ONLY if explicitly enabled
    if (activeThrottling && activeThrottling.enabled && activeThrottling.latencyMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, activeThrottling.latencyMs));
    }

    // Apply Simulated Packet Loss
    if (activeThrottling && activeThrottling.enabled && activeThrottling.packetLossPercent > 0) {
      if (Math.random() * 100 < activeThrottling.packetLossPercent) {
        res.socket.destroy();
        return;
      }
    }

    // 1. Check Map Remote Rule
    const matchedMapRemote = activeMapRemote.find((r) => r.enabled && reqUrl.toLowerCase().includes(r.fromPattern.toLowerCase()));
    if (matchedMapRemote) {
      originalUrl = reqUrl;
      reqUrl = reqUrl.replace(new RegExp(matchedMapRemote.fromPattern, 'i'), matchedMapRemote.toUrl);
      isMappedRemote = true;
    }

    const parsedUrl = url.parse(reqUrl);

    // 2. Check Map Local Rule
    const matchedMapLocal = activeMapLocal.find((l) => {
      if (!l.enabled) return false;
      const targetPath = (parsedUrl.pathname || '').toLowerCase();
      const match = (l.matchPattern || '').toLowerCase();
      return targetPath === match || targetPath.endsWith(match) || reqUrl.toLowerCase().includes(match);
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

      const logItem = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: Date.now(),
        method: req.method,
        url: reqUrl,
        path: parsedUrl.pathname || '/',
        statusCode: matchedMapLocal.statusCode || 200,
        statusText: 'OK (Map Local)',
        isMocked: true,
        timeMs: Date.now() - startTime,
        sizeBytes: Buffer.byteLength(matchedMapLocal.responseBody || ''),
        requestHeaders: req.headers,
        responseHeaders,
        responseBody: matchedMapLocal.responseBody,
        clientIp: req.socket ? req.socket.remoteAddress : '',
      };

      broadcast({ type: 'TRAFFIC_EVENT', log: logItem });
      return;
    }

    // 3. Check for Matching Mock Rule
    const matchedMock = activeMocks.find((m) => {
      if (!m.enabled) return false;
      if (m.method && m.method !== req.method) return false;
      const targetPath = (parsedUrl.pathname || '').toLowerCase();
      const mockPath = (m.path || '').toLowerCase();
      return targetPath === mockPath || targetPath.endsWith(mockPath) || reqUrl.toLowerCase().includes(mockPath);
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

      const logItem = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: Date.now(),
        method: req.method,
        url: reqUrl,
        path: parsedUrl.pathname || '/',
        statusCode: matchedMock.statusCode || 200,
        statusText: 'OK (Endly Mock)',
        isMocked: true,
        mockId: matchedMock.id,
        timeMs: Date.now() - startTime,
        sizeBytes: Buffer.byteLength(matchedMock.body || ''),
        requestHeaders: req.headers,
        responseHeaders,
        responseBody: matchedMock.body,
        clientIp: req.socket ? req.socket.remoteAddress : '',
      };

      broadcast({ type: 'TRAFFIC_EVENT', log: logItem });
      return;
    }

    // 4. Pass-through to Remote Server with DIRECT STREAMING (Zero Buffering Delay)
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 80,
      path: parsedUrl.path,
      method: req.method,
      headers: { ...req.headers },
      agent: httpAgent,
    };
    delete options.headers['proxy-connection'];

    const proxyReq = http.request(options, (proxyRes) => {
      // Send response headers to phone immediately!
      res.writeHead(proxyRes.statusCode, proxyRes.headers);

      let totalBytes = 0;
      let bodyPreview = '';

      proxyRes.on('data', (chunk) => {
        // Stream chunk immediately to phone with zero latency
        res.write(chunk);
        totalBytes += chunk.length;
        if (bodyPreview.length < 15000) {
          bodyPreview += chunk.toString('utf8');
        }
      });

      proxyRes.on('end', () => {
        res.end();

        const logItem = {
          id: Math.random().toString(36).substring(2, 9),
          timestamp: Date.now(),
          method: req.method,
          url: reqUrl,
          path: parsedUrl.pathname || '/',
          statusCode: proxyRes.statusCode,
          statusText: proxyRes.statusMessage || 'OK',
          isMocked: false,
          isMappedRemote,
          originalUrl,
          timeMs: Date.now() - startTime,
          sizeBytes: totalBytes,
          requestHeaders: req.headers,
          responseHeaders: proxyRes.headers,
          responseBody: bodyPreview.slice(0, 10000),
          clientIp: req.socket ? req.socket.remoteAddress : '',
        };

        broadcast({ type: 'TRAFFIC_EVENT', log: logItem });
      });
    });

    proxyReq.on('error', (err) => {
      if (!res.headersSent) {
        res.writeHead(502, { 'Content-Type': 'text/plain' });
      }
      res.end(`Proxy Error: ${err.message}`);
    });

    req.pipe(proxyReq);
  });

  // HTTPS CONNECT Tunneling (Direct Zero-Latency TCP Pipe)
  proxyServer.on('connect', (req, clientSocket, head) => {
    clientSocket.setNoDelay(true);
    clientSocket.setKeepAlive(true, 10000);

    const [host, portStr] = req.url.split(':');
    const port = parseInt(portStr, 10) || 443;

    const serverSocket = net.connect(port, host, () => {
      serverSocket.setNoDelay(true);
      serverSocket.setKeepAlive(true, 10000);

      clientSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
      if (head && head.length > 0) {
        serverSocket.write(head);
      }
      serverSocket.pipe(clientSocket);
      clientSocket.pipe(serverSocket);

      broadcast({
        type: 'TRAFFIC_EVENT',
        log: {
          id: Math.random().toString(36).substring(2, 9),
          timestamp: Date.now(),
          method: 'CONNECT',
          url: `https://${host}:${port}`,
          path: `https://${host}:${port}`,
          statusCode: 200,
          statusText: 'Tunnel Established',
          isMocked: false,
          timeMs: 1,
          sizeBytes: 0,
          requestHeaders: req.headers,
          responseHeaders: {},
          clientIp: clientSocket.remoteAddress || '',
        },
      });
    });

    serverSocket.on('error', () => {
      clientSocket.end('HTTP/1.1 502 Bad Gateway\r\n\r\n');
    });

    clientSocket.on('error', () => {
      serverSocket.destroy();
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

// 4. WebSocket Control Server for Endly Web UI
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
