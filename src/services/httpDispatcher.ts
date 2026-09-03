import { RequestItem, ResponseData, ResponseCookie, RequestSettings } from '../types';
import { resolveVariables, VariableContext } from './variableResolver';

// Check if running strictly inside Tauri native desktop environment
export function isTauriEnvironment(): boolean {
  return typeof window !== 'undefined' && ('__TAURI_INTERNALS__' in window || '__TAURI__' in window);
}

// Check if running strictly inside Electron desktop environment
export function isElectronEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    navigator.userAgent.toLowerCase().includes('electron') ||
    'electron' in window ||
    (typeof process !== 'undefined' && Boolean(process?.versions?.electron))
  );
}

// Check if running in ANY desktop environment (Tauri or Electron)
export function isDesktopEnvironment(): boolean {
  return isTauriEnvironment() || isElectronEnvironment();
}

// Check if running on macOS Desktop specifically
export function isMacDesktopEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  const isMac = (
    navigator.userAgent.toLowerCase().includes('macintosh') ||
    navigator.userAgent.toLowerCase().includes('mac os x') ||
    (typeof navigator.platform === 'string' && navigator.platform.toLowerCase().includes('mac'))
  );
  return isDesktopEnvironment() && isMac;
}

function parseCookiesFromHeaders(headers: Record<string, string>): ResponseCookie[] {
  const cookies: ResponseCookie[] = [];
  const setCookieHeader = headers['set-cookie'] || headers['Set-Cookie'];

  if (setCookieHeader) {
    const rawCookies = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
    for (const raw of rawCookies) {
      const parts = raw.split(';').map((p: string) => p.trim());
      if (parts.length > 0) {
        const [nameVal, ...attrs] = parts;
        const eqIdx = nameVal.indexOf('=');
        if (eqIdx > 0) {
          const name = nameVal.substring(0, eqIdx);
          const value = nameVal.substring(eqIdx + 1);
          const cookieObj: ResponseCookie = { name, value };

          for (const attr of attrs) {
            const [k, v] = attr.split('=');
            const lowerK = k.toLowerCase();
            if (lowerK === 'domain') cookieObj.domain = v;
            else if (lowerK === 'path') cookieObj.path = v;
            else if (lowerK === 'expires') cookieObj.expires = v;
            else if (lowerK === 'httponly') cookieObj.httpOnly = true;
            else if (lowerK === 'secure') cookieObj.secure = true;
          }
          cookies.push(cookieObj);
        }
      }
    }
  }

  return cookies;
}

export interface DispatchOptions {
  request: RequestItem;
  variableContext: VariableContext;
  globalSettings?: RequestSettings;
  abortSignal?: AbortSignal;
}

export async function dispatchHttpRequest(options: DispatchOptions): Promise<ResponseData> {
  const { request, variableContext, globalSettings, abortSignal } = options;

  // 1. Resolve variables in URL
  let resolvedUrl = resolveVariables(request.url, variableContext).trim();
  if (!resolvedUrl.startsWith('http://') && !resolvedUrl.startsWith('https://')) {
    resolvedUrl = `https://${resolvedUrl}`;
  }

  // 2. Resolve & construct Query Params
  const activeParams = (request.params || []).filter((p) => p.enabled && p.key.trim() !== '');
  if (activeParams.length > 0) {
    const queryString = activeParams
      .map((p) => {
        const k = encodeURIComponent(resolveVariables(p.key, variableContext));
        const v = encodeURIComponent(resolveVariables(p.value, variableContext));
        return `${k}=${v}`;
      })
      .join('&');

    resolvedUrl += (resolvedUrl.includes('?') ? '&' : '?') + queryString;
  }

  // 3. Resolve & build Headers
  const headers: Record<string, string> = {};
  (request.headers || []).forEach((h) => {
    if (h.enabled && h.key.trim()) {
      const k = resolveVariables(h.key, variableContext).trim();
      const v = resolveVariables(h.value, variableContext);
      headers[k] = v;
    }
  });

  // 4. Handle Auth headers/params
  if (request.auth) {
    if (request.auth.type === 'bearer' && request.auth.bearer?.token) {
      const token = resolveVariables(request.auth.bearer.token, variableContext);
      headers['Authorization'] = `Bearer ${token}`;
    } else if (request.auth.type === 'basic' && request.auth.basic) {
      const user = resolveVariables(request.auth.basic.username, variableContext);
      const pass = resolveVariables(request.auth.basic.password, variableContext);
      headers['Authorization'] = `Basic ${btoa(`${user}:${pass}`)}`;
    } else if (request.auth.type === 'apikey' && request.auth.apiKey?.key) {
      const key = resolveVariables(request.auth.apiKey.key, variableContext);
      const val = resolveVariables(request.auth.apiKey.value, variableContext);
      if (request.auth.apiKey.addTo === 'header') {
        headers[key] = val;
      } else {
        resolvedUrl += (resolvedUrl.includes('?') ? '&' : '?') + `${encodeURIComponent(key)}=${encodeURIComponent(val)}`;
      }
    } else if (request.auth.type === 'oauth2' && request.auth.oauth2?.accessToken) {
      const prefix = request.auth.oauth2.headerPrefix || 'Bearer';
      const token = resolveVariables(request.auth.oauth2.accessToken, variableContext);
      headers['Authorization'] = `${prefix} ${token}`;
    }
  }

  // 5. Build Body
  let bodyPayload: BodyInit | null = null;
  const method = request.method;
  const isBodyAllowed = !['GET', 'HEAD'].includes(method);

  if (isBodyAllowed && request.body) {
    if (request.body.type === 'raw') {
      const rawText = resolveVariables(request.body.raw || '', variableContext);
      bodyPayload = rawText;
      const lang = request.body.rawLanguage || 'json';
      if (lang === 'json' && !headers['Content-Type'] && !headers['content-type']) {
        headers['Content-Type'] = 'application/json';
      } else if (lang === 'xml' && !headers['Content-Type'] && !headers['content-type']) {
        headers['Content-Type'] = 'application/xml';
      }
    } else if (request.body.type === 'x-www-form-urlencoded') {
      const searchParams = new URLSearchParams();
      (request.body.urlEncoded || []).forEach((item) => {
        if (item.enabled && item.key.trim()) {
          const k = resolveVariables(item.key, variableContext);
          const v = resolveVariables(item.value, variableContext);
          searchParams.append(k, v);
        }
      });
      bodyPayload = searchParams.toString();
      if (!headers['Content-Type'] && !headers['content-type']) {
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
      }
    } else if (request.body.type === 'form-data') {
      const formData = new FormData();
      (request.body.formData || []).forEach((item) => {
        if (item.enabled && item.key.trim()) {
          const k = resolveVariables(item.key, variableContext);
          if (item.type === 'file' && item.file) {
            formData.append(k, item.file, item.fileName || item.file.name);
          } else {
            const v = resolveVariables(item.value, variableContext);
            formData.append(k, v);
          }
        }
      });
      bodyPayload = formData;
      // Do not set Content-Type header manually for FormData, browser will add boundary!
      delete headers['Content-Type'];
      delete headers['content-type'];
    } else if (request.body.type === 'graphql') {
      const query = resolveVariables(request.body.graphql?.query || '', variableContext);
      const rawVars = resolveVariables(request.body.graphql?.variables || '{}', variableContext);
      let parsedVars = {};
      try {
        parsedVars = JSON.parse(rawVars);
      } catch {
        parsedVars = {};
      }
      bodyPayload = JSON.stringify({ query, variables: parsedVars });
      if (!headers['Content-Type'] && !headers['content-type']) {
        headers['Content-Type'] = 'application/json';
      }
    }
  }

  // 6. Handle Proxy if enabled in Web mode
  let targetUrl = resolvedUrl;
  const useProxy = globalSettings?.useProxy;
  const proxyUrl = globalSettings?.proxyUrl;

  if (!isDesktopEnvironment() && useProxy && proxyUrl) {
    targetUrl = `${proxyUrl.trim()}${encodeURIComponent(resolvedUrl)}`;
  }

  const startTime = performance.now();
  let ttfb = 0;

  try {
    let fetchFn = window.fetch;

    // If Tauri is available, dynamically use Tauri HTTP plugin
    if (isTauriEnvironment()) {
      try {
        const tauriHttp = await import('@tauri-apps/plugin-http');
        if (tauriHttp && tauriHttp.fetch) {
          fetchFn = tauriHttp.fetch as any;
        }
      } catch {
        // Fallback to standard fetch
        fetchFn = window.fetch;
      }
    }

    const response = await fetchFn(targetUrl, {
      method,
      headers,
      body: bodyPayload,
      signal: abortSignal,
    });

    ttfb = Math.round(performance.now() - startTime);

    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((val, key) => {
      responseHeaders[key] = val;
    });

    const responseBlob = await response.blob();
    const responseText = await responseBlob.text();
    const totalTime = Math.round(performance.now() - startTime);
    const sizeBytes = responseBlob.size;
    const contentType = response.headers.get('content-type') || 'text/plain';
    const cookies = parseCookiesFromHeaders(responseHeaders);

    return {
      status: response.status,
      statusText: response.statusText || (response.status === 200 ? 'OK' : ''),
      headers: responseHeaders,
      cookies,
      body: responseText,
      sizeBytes,
      timeMs: totalTime,
      timestamp: Date.now(),
      contentType,
      isError: !response.ok && response.status === 0,
      timings: {
        start: Math.round(startTime),
        ttfb,
        download: Math.max(0, totalTime - ttfb),
        total: totalTime,
      },
    };
  } catch (error: any) {
    const totalTime = Math.round(performance.now() - startTime);
    const isAborted = error.name === 'AbortError';

    return {
      status: 0,
      statusText: isAborted ? 'Request Aborted' : 'Network Error',
      headers: {},
      cookies: [],
      body: isAborted
        ? 'The request was aborted by the user.'
        : `Could not send request.\n\nError details: ${error.message || String(error)}\n\n` +
          (!isDesktopEnvironment()
            ? '💡 Web Browser Note: This error may be due to CORS (Cross-Origin Resource Sharing) restrictions on this API. To bypass CORS:\n1. Enable the Web Proxy in Settings (or top bar)\n2. Or run Endly in the Desktop app (macOS / Windows) for native zero-CORS requests.'
            : ''),
      sizeBytes: 0,
      timeMs: totalTime,
      timestamp: Date.now(),
      contentType: 'text/plain',
      isError: true,
      errorDetails: error.message || String(error),
      timings: {
        start: Math.round(startTime),
        ttfb: 0,
        download: 0,
        total: totalTime,
      },
    };
  }
}
