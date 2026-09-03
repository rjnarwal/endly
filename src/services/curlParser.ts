import { HttpRequestMethod, RequestItem, HeaderItem, ParamItem, BodyDefinition, AuthDefinition } from '../types';

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

/**
 * Tokenizes a command line string respecting single/double quotes and escapes.
 */
export function tokenizeCommandLine(cmd: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let isEscaped = false;

  for (let i = 0; i < cmd.length; i++) {
    const char = cmd[i];

    if (isEscaped) {
      current += char;
      isEscaped = false;
      continue;
    }

    if (char === '\\') {
      // If at end of line (continuation)
      if (i + 1 < cmd.length && (cmd[i + 1] === '\n' || cmd[i + 1] === '\r')) {
        i++;
        continue;
      }
      isEscaped = true;
      continue;
    }

    if (char === "'" && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote;
      continue;
    }

    if (char === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote;
      continue;
    }

    if (/\s/.test(char) && !inSingleQuote && !inDoubleQuote) {
      if (current.length > 0) {
        tokens.push(current);
        current = '';
      }
      continue;
    }

    current += char;
  }

  if (current.length > 0) {
    tokens.push(current);
  }

  return tokens;
}

/**
 * Parses a cURL command into Endly request structures.
 */
export function parseCurlCommand(rawCurl: string): Partial<RequestItem> {
  const cleanCmd = rawCurl.trim().replace(/^[\$#]\s*/, '');
  const tokens = tokenizeCommandLine(cleanCmd);

  let method: HttpRequestMethod = 'GET';
  let url = '';
  const headers: HeaderItem[] = [];
  const params: ParamItem[] = [];
  let body: BodyDefinition = { type: 'none' };
  let auth: AuthDefinition = { type: 'none' };
  let methodExplicit = false;

  const dataParts: string[] = [];
  const formParts: Array<{ key: string; value: string; type: 'text' | 'file' }> = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token === 'curl') continue;

    // Method: -X, --request
    if (token === '-X' || token === '--request') {
      if (i + 1 < tokens.length) {
        method = tokens[++i].toUpperCase() as HttpRequestMethod;
        methodExplicit = true;
      }
      continue;
    }

    // Headers: -H, --header
    if (token === '-H' || token === '--header') {
      if (i + 1 < tokens.length) {
        const headerStr = tokens[++i];
        const colonIdx = headerStr.indexOf(':');
        if (colonIdx > 0) {
          const key = headerStr.substring(0, colonIdx).trim();
          const val = headerStr.substring(colonIdx + 1).trim();

          // Detect Bearer token auth header
          if (key.toLowerCase() === 'authorization' && val.toLowerCase().startsWith('bearer ')) {
            auth = {
              type: 'bearer',
              bearer: { token: val.substring(7).trim() },
            };
          } else if (key.toLowerCase() === 'authorization' && val.toLowerCase().startsWith('basic ')) {
            try {
              const decoded = atob(val.substring(6).trim());
              const [u, p] = decoded.split(':');
              auth = {
                type: 'basic',
                basic: { username: u || '', password: p || '' },
              };
            } catch {
              headers.push({ id: generateId(), key, value: val, enabled: true });
            }
          } else {
            headers.push({ id: generateId(), key, value: val, enabled: true });
          }
        }
      }
      continue;
    }

    // Basic Auth: -u, --user
    if (token === '-u' || token === '--user') {
      if (i + 1 < tokens.length) {
        const userPass = tokens[++i];
        const colonIdx = userPass.indexOf(':');
        if (colonIdx >= 0) {
          auth = {
            type: 'basic',
            basic: {
              username: userPass.substring(0, colonIdx),
              password: userPass.substring(colonIdx + 1),
            },
          };
        } else {
          auth = {
            type: 'basic',
            basic: { username: userPass, password: '' },
          };
        }
      }
      continue;
    }

    // Body Data: -d, --data, --data-raw, --data-binary, --data-urlencode
    if (
      token === '-d' ||
      token === '--data' ||
      token === '--data-raw' ||
      token === '--data-binary' ||
      token === '--data-urlencode'
    ) {
      if (i + 1 < tokens.length) {
        dataParts.push(tokens[++i]);
        if (!methodExplicit) method = 'POST';
      }
      continue;
    }

    // Form data: -F, --form
    if (token === '-F' || token === '--form') {
      if (i + 1 < tokens.length) {
        const formStr = tokens[++i];
        const eqIdx = formStr.indexOf('=');
        if (eqIdx > 0) {
          const k = formStr.substring(0, eqIdx);
          let v = formStr.substring(eqIdx + 1);
          const isFile = v.startsWith('@');
          if (isFile) v = v.substring(1);
          formParts.push({ key: k, value: v, type: isFile ? 'file' : 'text' });
        }
        if (!methodExplicit) method = 'POST';
      }
      continue;
    }

    // URL: --url or positional argument
    if (token === '--url') {
      if (i + 1 < tokens.length) {
        url = tokens[++i];
      }
      continue;
    }

    if (!token.startsWith('-') && !url) {
      url = token;
    }
  }

  // Parse URL and extract Query Parameters into table
  if (url) {
    try {
      // If URL doesn't have scheme, prepend http:// to parse cleanly
      const urlToParse = url.startsWith('http://') || url.startsWith('https://') ? url : `http://${url}`;
      const parsed = new URL(urlToParse);
      
      parsed.searchParams.forEach((val, key) => {
        params.push({
          id: generateId(),
          key,
          value: val,
          enabled: true,
        });
      });
      
      // Clean url base without search query
      const cleanUrl = url.split('?')[0];
      url = cleanUrl;
    } catch {
      // Keep as-is if raw template variable like {{baseUrl}}/path
      if (url.includes('?')) {
        const [base, query] = url.split('?');
        url = base;
        const qParts = query.split('&');
        for (const q of qParts) {
          const [k, v] = q.split('=');
          if (k) {
            params.push({
              id: generateId(),
              key: decodeURIComponent(k),
              value: v ? decodeURIComponent(v) : '',
              enabled: true,
            });
          }
        }
      }
    }
  }

  // Construct Body
  if (formParts.length > 0) {
    body = {
      type: 'form-data',
      formData: formParts.map((f) => ({
        id: generateId(),
        key: f.key,
        value: f.value,
        type: f.type,
        fileName: f.type === 'file' ? f.value : undefined,
        enabled: true,
      })),
    };
  } else if (dataParts.length > 0) {
    const rawData = dataParts.join('&');
    const isJson = rawData.trim().startsWith('{') || rawData.trim().startsWith('[');
    const isXml = rawData.trim().startsWith('<');
    body = {
      type: 'raw',
      raw: rawData,
      rawLanguage: isJson ? 'json' : isXml ? 'xml' : 'text',
    };
  }

  return {
    name: url ? `${method} ${url.split('/').pop() || url}` : 'cURL Request',
    method,
    url: url || 'https://api.example.com',
    headers,
    params,
    body,
    auth,
  };
}
