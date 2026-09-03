import yaml from 'js-yaml';
import {
  CollectionItem,
  FolderItem,
  RequestItem,
  EnvironmentItem,
  VariableItem,
  HttpRequestMethod,
  HeaderItem,
  ParamItem,
  BodyDefinition,
  AuthDefinition,
} from '../types';

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

// Convert Postman URL to string and params
function parsePostmanUrl(postmanUrl: any): { url: string; params: ParamItem[] } {
  const params: ParamItem[] = [];

  if (typeof postmanUrl === 'string') {
    let cleanUrl = postmanUrl;
    if (cleanUrl.includes('?')) {
      const [base, query] = cleanUrl.split('?');
      cleanUrl = base;
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
    return { url: cleanUrl, params };
  }

  if (postmanUrl && typeof postmanUrl === 'object') {
    let rawUrl = postmanUrl.raw || '';
    if (postmanUrl.query && Array.isArray(postmanUrl.query)) {
      for (const q of postmanUrl.query) {
        params.push({
          id: generateId(),
          key: q.key || '',
          value: q.value || '',
          enabled: q.disabled !== true,
          description: q.description,
        });
      }
    }

    if (rawUrl.includes('?')) {
      rawUrl = rawUrl.split('?')[0];
    } else if (!rawUrl && postmanUrl.host) {
      const host = Array.isArray(postmanUrl.host) ? postmanUrl.host.join('.') : postmanUrl.host;
      const path = Array.isArray(postmanUrl.path) ? postmanUrl.path.join('/') : postmanUrl.path || '';
      const protocol = postmanUrl.protocol || 'https';
      rawUrl = `${protocol}://${host}/${path}`;
    }

    return { url: rawUrl, params };
  }

  return { url: 'https://api.example.com', params: [] };
}

// Parse Postman Headers
function parsePostmanHeaders(headers: any): HeaderItem[] {
  if (!headers || !Array.isArray(headers)) return [];
  return headers.map((h: any) => ({
    id: generateId(),
    key: h.key || '',
    value: h.value || '',
    enabled: h.disabled !== true,
    description: h.description,
  }));
}

// Parse Postman Body
function parsePostmanBody(body: any): BodyDefinition {
  if (!body) return { type: 'none' };

  const mode = body.mode;
  if (mode === 'raw') {
    const rawLang = body.options?.raw?.language || 'json';
    return {
      type: 'raw',
      raw: body.raw || '',
      rawLanguage: rawLang,
    };
  }

  if (mode === 'urlencoded') {
    return {
      type: 'x-www-form-urlencoded',
      urlEncoded: (body.urlencoded || []).map((item: any) => ({
        id: generateId(),
        key: item.key || '',
        value: item.value || '',
        enabled: item.disabled !== true,
        description: item.description,
      })),
    };
  }

  if (mode === 'formdata') {
    return {
      type: 'form-data',
      formData: (body.formdata || []).map((item: any) => ({
        id: generateId(),
        key: item.key || '',
        value: item.value || '',
        type: item.type === 'file' ? 'file' : 'text',
        fileName: item.src,
        enabled: item.disabled !== true,
        description: item.description,
      })),
    };
  }

  if (mode === 'graphql') {
    return {
      type: 'graphql',
      graphql: {
        query: body.graphql?.query || '',
        variables: body.graphql?.variables || '',
      },
    };
  }

  return { type: 'none' };
}

// Parse Postman Auth
function parsePostmanAuth(auth: any): AuthDefinition {
  if (!auth) return { type: 'none' };

  const type = auth.type;
  if (type === 'bearer') {
    const token = auth.bearer?.find((b: any) => b.key === 'token')?.value || '';
    return {
      type: 'bearer',
      bearer: { token },
    };
  }

  if (type === 'basic') {
    const username = auth.basic?.find((b: any) => b.key === 'username')?.value || '';
    const password = auth.basic?.find((b: any) => b.key === 'password')?.value || '';
    return {
      type: 'basic',
      basic: { username, password },
    };
  }

  if (type === 'apikey') {
    const key = auth.apikey?.find((b: any) => b.key === 'key')?.value || '';
    const value = auth.apikey?.find((b: any) => b.key === 'value')?.value || '';
    const inWhat = auth.apikey?.find((b: any) => b.key === 'in')?.value || 'header';
    return {
      type: 'apikey',
      apiKey: { key, value, addTo: inWhat === 'query' ? 'query' : 'header' },
    };
  }

  return { type: 'none' };
}

// Parse Postman Scripts (Events)
function parsePostmanEvents(events: any[]): { preRequestScript?: string; testScript?: string } {
  if (!events || !Array.isArray(events)) return {};
  let preRequestScript: string | undefined;
  let testScript: string | undefined;

  for (const ev of events) {
    if (ev.listen === 'prerequest' && ev.script?.exec) {
      preRequestScript = Array.isArray(ev.script.exec) ? ev.script.exec.join('\n') : String(ev.script.exec);
    } else if (ev.listen === 'test' && ev.script?.exec) {
      testScript = Array.isArray(ev.script.exec) ? ev.script.exec.join('\n') : String(ev.script.exec);
    }
  }

  return { preRequestScript, testScript };
}

/**
 * Imports a Postman Collection JSON (v2.0 or v2.1)
 */
export function importPostmanCollection(jsonString: string): CollectionItem {
  const data = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
  const collectionId = generateId();
  const collectionName = data.info?.name || 'Imported Postman Collection';
  const description = typeof data.info?.description === 'string' ? data.info.description : data.info?.description?.content || '';

  const folders: FolderItem[] = [];
  const requests: RequestItem[] = [];

  function processItems(items: any[], parentFolderId: string | null = null) {
    if (!items || !Array.isArray(items)) return;

    for (const item of items) {
      // If it's a folder (has nested item array)
      if (item.item && Array.isArray(item.item)) {
        const folderId = generateId();
        const scripts = parsePostmanEvents(item.event);
        folders.push({
          id: folderId,
          name: item.name || 'Untitled Folder',
          collectionId,
          parentId: parentFolderId,
          description: typeof item.description === 'string' ? item.description : item.description?.content,
          auth: parsePostmanAuth(item.auth),
          preRequestScript: scripts.preRequestScript,
          testScript: scripts.testScript,
        });

        processItems(item.item, folderId);
      } else if (item.request) {
        // It's a request
        const { url, params } = parsePostmanUrl(item.request.url);
        const headers = parsePostmanHeaders(item.request.header);
        const body = parsePostmanBody(item.request.body);
        const auth = parsePostmanAuth(item.request.auth);
        const scripts = parsePostmanEvents(item.event);

        requests.push({
          id: generateId(),
          name: item.name || `${item.request.method || 'GET'} Request`,
          method: (item.request.method || 'GET').toUpperCase() as HttpRequestMethod,
          url,
          params,
          headers,
          body,
          auth,
          preRequestScript: scripts.preRequestScript,
          testScript: scripts.testScript,
          description: typeof item.request.description === 'string' ? item.request.description : item.request.description?.content,
          folderId: parentFolderId,
          collectionId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }
    }
  }

  processItems(data.item || []);

  const colEvents = parsePostmanEvents(data.event);
  const colVariables: VariableItem[] = (data.variable || []).map((v: any) => ({
    id: generateId(),
    key: v.key || '',
    value: v.value || '',
    enabled: v.disabled !== true,
    type: v.type === 'secret' ? 'secret' : 'string',
    description: v.description,
  }));

  return {
    id: collectionId,
    name: collectionName,
    description,
    folders,
    requests,
    auth: parsePostmanAuth(data.auth),
    preRequestScript: colEvents.preRequestScript,
    testScript: colEvents.testScript,
    variables: colVariables,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

/**
 * Imports a Postman Environment JSON
 */
export function importPostmanEnvironment(jsonString: string): EnvironmentItem {
  const data = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
  return {
    id: generateId(),
    name: data.name || 'Imported Environment',
    variables: (data.values || []).map((v: any) => ({
      id: generateId(),
      key: v.key || '',
      value: v.value || '',
      initialValue: v.value || '',
      enabled: v.enabled !== false,
      type: v.type === 'secret' ? 'secret' : 'string',
    })),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

/**
 * Imports OpenAPI 3.0 / Swagger 2.0 (YAML or JSON)
 */
export function importOpenApi(specString: string): CollectionItem {
  let doc: any;
  try {
    doc = JSON.parse(specString);
  } catch {
    doc = yaml.load(specString);
  }

  if (!doc || typeof doc !== 'object') {
    throw new Error('Invalid OpenAPI/Swagger specification');
  }

  const collectionId = generateId();
  const collectionName = doc.info?.title || 'OpenAPI Specification';
  const description = doc.info?.description || '';

  // Determine base URL
  let baseUrl = 'https://api.example.com';
  if (doc.servers && doc.servers.length > 0) {
    baseUrl = doc.servers[0].url || baseUrl;
  } else if (doc.host) {
    const scheme = (doc.schemes && doc.schemes[0]) || 'https';
    const basePath = doc.basePath || '';
    baseUrl = `${scheme}://${doc.host}${basePath}`;
  }

  const foldersMap = new Map<string, string>(); // tag -> folderId
  const folders: FolderItem[] = [];
  const requests: RequestItem[] = [];

  const paths = doc.paths || {};
  const methods = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'];

  for (const [pathKey, pathObj] of Object.entries<any>(paths)) {
    for (const method of methods) {
      if (pathObj[method]) {
        const operation = pathObj[method];
        const tags = operation.tags || ['Default'];
        const tag = tags[0] || 'Default';

        let folderId: string | null = null;
        if (tag) {
          if (!foldersMap.has(tag)) {
            const fId = generateId();
            foldersMap.set(tag, fId);
            folders.push({
              id: fId,
              name: tag,
              collectionId,
              description: `Endpoints categorized under ${tag}`,
            });
          }
          folderId = foldersMap.get(tag) || null;
        }

        const params: ParamItem[] = [];
        const headers: HeaderItem[] = [];

        // Parameters
        const allParams = [...(pathObj.parameters || []), ...(operation.parameters || [])];
        for (const p of allParams) {
          if (p.in === 'query') {
            params.push({
              id: generateId(),
              key: p.name,
              value: p.example !== undefined ? String(p.example) : (p.schema?.default !== undefined ? String(p.schema.default) : ''),
              enabled: p.required === true,
              description: p.description,
            });
          } else if (p.in === 'header') {
            headers.push({
              id: generateId(),
              key: p.name,
              value: p.example !== undefined ? String(p.example) : '',
              enabled: p.required === true,
              description: p.description,
            });
          }
        }

        // Body
        let body: BodyDefinition = { type: 'none' };
        if (operation.requestBody?.content) {
          const content = operation.requestBody.content;
          if (content['application/json']) {
            const schema = content['application/json'].schema || {};
            const example = content['application/json'].example || schema.example;
            body = {
              type: 'raw',
              raw: example ? JSON.stringify(example, null, 2) : '{\n  \n}',
              rawLanguage: 'json',
            };
          } else if (content['application/x-www-form-urlencoded']) {
            body = {
              type: 'x-www-form-urlencoded',
              urlEncoded: [],
            };
          } else if (content['multipart/form-data']) {
            body = {
              type: 'form-data',
              formData: [],
            };
          }
        }

        const reqUrl = `${baseUrl}${pathKey.startsWith('/') ? pathKey : '/' + pathKey}`;

        requests.push({
          id: generateId(),
          name: operation.summary || operation.operationId || `${method.toUpperCase()} ${pathKey}`,
          method: method.toUpperCase() as HttpRequestMethod,
          url: reqUrl,
          params,
          headers,
          body,
          auth: { type: 'none' },
          description: operation.description,
          folderId,
          collectionId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }
    }
  }

  return {
    id: collectionId,
    name: collectionName,
    description,
    folders,
    requests,
    variables: [
      {
        id: generateId(),
        key: 'baseUrl',
        value: baseUrl,
        enabled: true,
      },
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

/**
 * Exports a Collection to Postman v2.1.0 format JSON string
 */
export function exportToPostmanCollection(collection: CollectionItem): string {
  function serializeRequest(req: RequestItem) {
    const postmanReq: any = {
      name: req.name,
      request: {
        method: req.method,
        header: (req.headers || []).map((h) => ({
          key: h.key,
          value: h.value,
          disabled: !h.enabled,
          description: h.description,
        })),
        url: {
          raw: req.url,
          query: (req.params || []).map((p) => ({
            key: p.key,
            value: p.value,
            disabled: !p.enabled,
            description: p.description,
          })),
        },
        description: req.description,
      },
      event: [] as any[],
    };

    // Body
    if (req.body && req.body.type !== 'none') {
      if (req.body.type === 'raw') {
        postmanReq.request.body = {
          mode: 'raw',
          raw: req.body.raw || '',
          options: {
            raw: {
              language: req.body.rawLanguage || 'json',
            },
          },
        };
      } else if (req.body.type === 'x-www-form-urlencoded') {
        postmanReq.request.body = {
          mode: 'urlencoded',
          urlencoded: (req.body.urlEncoded || []).map((u) => ({
            key: u.key,
            value: u.value,
            disabled: !u.enabled,
            description: u.description,
          })),
        };
      } else if (req.body.type === 'form-data') {
        postmanReq.request.body = {
          mode: 'formdata',
          formdata: (req.body.formData || []).map((f) => ({
            key: f.key,
            value: f.value,
            type: f.type,
            src: f.fileName,
            disabled: !f.enabled,
          })),
        };
      }
    }

    // Scripts
    if (req.preRequestScript) {
      postmanReq.event.push({
        listen: 'prerequest',
        script: {
          type: 'text/javascript',
          exec: req.preRequestScript.split('\n'),
        },
      });
    }
    if (req.testScript) {
      postmanReq.event.push({
        listen: 'test',
        script: {
          type: 'text/javascript',
          exec: req.testScript.split('\n'),
        },
      });
    }

    return postmanReq;
  }

  const rootItems: any[] = [];
  const folderMap = new Map<string, any>();

  for (const f of collection.folders || []) {
    const fObj = {
      name: f.name,
      description: f.description,
      item: [],
      event: [] as any[],
    };
    folderMap.set(f.id, fObj);
  }

  // Nest folders
  for (const f of collection.folders || []) {
    const fObj = folderMap.get(f.id);
    if (f.parentId && folderMap.has(f.parentId)) {
      folderMap.get(f.parentId).item.push(fObj);
    } else {
      rootItems.push(fObj);
    }
  }

  // Attach requests to folders or root
  for (const req of collection.requests || []) {
    const serialized = serializeRequest(req);
    if (req.folderId && folderMap.has(req.folderId)) {
      folderMap.get(req.folderId).item.push(serialized);
    } else {
      rootItems.push(serialized);
    }
  }

  const postmanDoc = {
    info: {
      name: collection.name,
      description: collection.description,
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
      _exporter_id: 'endly-api-client',
    },
    item: rootItems,
    variable: (collection.variables || []).map((v) => ({
      key: v.key,
      value: v.value,
      type: v.type || 'string',
      disabled: !v.enabled,
    })),
  };

  return JSON.stringify(postmanDoc, null, 2);
}
