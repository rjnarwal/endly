import { RequestItem, HeaderItem, ParamItem } from '../types';

export type SupportedLanguage =
  | 'curl'
  | 'javascript_fetch'
  | 'javascript_axios'
  | 'nodejs_native'
  | 'python_requests'
  | 'python_http_client'
  | 'go_native'
  | 'rust_reqwest'
  | 'java_okhttp'
  | 'php_curl'
  | 'ruby_net_http'
  | 'csharp_httpclient'
  | 'swift_urlsession';

export interface CodeLanguageOption {
  id: SupportedLanguage;
  name: string;
  category: string;
  syntax: string;
}

export const SUPPORTED_LANGUAGES: CodeLanguageOption[] = [
  { id: 'curl', name: 'cURL', category: 'Shell', syntax: 'bash' },
  { id: 'javascript_fetch', name: 'JavaScript - Fetch', category: 'JavaScript', syntax: 'javascript' },
  { id: 'javascript_axios', name: 'JavaScript - Axios', category: 'JavaScript', syntax: 'javascript' },
  { id: 'nodejs_native', name: 'Node.js - Native Fetch', category: 'Node.js', syntax: 'javascript' },
  { id: 'python_requests', name: 'Python - Requests', category: 'Python', syntax: 'python' },
  { id: 'python_http_client', name: 'Python - http.client', category: 'Python', syntax: 'python' },
  { id: 'go_native', name: 'Go - net/http', category: 'Go', syntax: 'go' },
  { id: 'rust_reqwest', name: 'Rust - reqwest', category: 'Rust', syntax: 'rust' },
  { id: 'java_okhttp', name: 'Java - OkHttp', category: 'Java', syntax: 'java' },
  { id: 'php_curl', name: 'PHP - cURL', category: 'PHP', syntax: 'php' },
  { id: 'ruby_net_http', name: 'Ruby - Net::HTTP', category: 'Ruby', syntax: 'ruby' },
  { id: 'csharp_httpclient', name: 'C# - HttpClient', category: 'C#', syntax: 'csharp' },
  { id: 'swift_urlsession', name: 'Swift - URLSession', category: 'Swift', syntax: 'swift' },
];

function buildFullUrl(url: string, params: ParamItem[]): string {
  const activeParams = (params || []).filter((p) => p.enabled && p.key.trim() !== '');
  if (activeParams.length === 0) return url;

  const hasQuery = url.includes('?');
  const qs = activeParams
    .map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
    .join('&');

  return `${url}${hasQuery ? '&' : '?'}${qs}`;
}

function getActiveHeaders(request: RequestItem): Record<string, string> {
  const headers: Record<string, string> = {};

  (request.headers || []).forEach((h) => {
    if (h.enabled && h.key.trim()) {
      headers[h.key.trim()] = h.value;
    }
  });

  // Handle Auth
  if (request.auth) {
    if (request.auth.type === 'bearer' && request.auth.bearer?.token) {
      headers['Authorization'] = `Bearer ${request.auth.bearer.token}`;
    } else if (request.auth.type === 'basic' && request.auth.basic) {
      const creds = btoa(`${request.auth.basic.username}:${request.auth.basic.password}`);
      headers['Authorization'] = `Basic ${creds}`;
    } else if (request.auth.type === 'apikey' && request.auth.apiKey?.addTo === 'header' && request.auth.apiKey.key) {
      headers[request.auth.apiKey.key] = request.auth.apiKey.value;
    } else if (request.auth.type === 'oauth2' && request.auth.oauth2?.accessToken) {
      const prefix = request.auth.oauth2.headerPrefix || 'Bearer';
      headers['Authorization'] = `${prefix} ${request.auth.oauth2.accessToken}`;
    }
  }

  // Handle Body content type
  if (request.body) {
    if (request.body.type === 'raw') {
      const lang = request.body.rawLanguage || 'json';
      if (lang === 'json' && !headers['Content-Type']) headers['Content-Type'] = 'application/json';
      else if (lang === 'xml' && !headers['Content-Type']) headers['Content-Type'] = 'application/xml';
      else if (lang === 'html' && !headers['Content-Type']) headers['Content-Type'] = 'text/html';
      else if (lang === 'text' && !headers['Content-Type']) headers['Content-Type'] = 'text/plain';
      else if (lang === 'javascript' && !headers['Content-Type']) headers['Content-Type'] = 'application/javascript';
    } else if (request.body.type === 'x-www-form-urlencoded' && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
    } else if (request.body.type === 'graphql' && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }
  }

  return headers;
}

function getRawBodyString(request: RequestItem): string | null {
  if (!request.body || request.body.type === 'none') return null;

  if (request.body.type === 'raw') {
    return request.body.raw || '';
  }

  if (request.body.type === 'x-www-form-urlencoded') {
    return (request.body.urlEncoded || [])
      .filter((item) => item.enabled && item.key.trim())
      .map((item) => `${encodeURIComponent(item.key)}=${encodeURIComponent(item.value)}`)
      .join('&');
  }

  if (request.body.type === 'graphql') {
    return JSON.stringify({
      query: request.body.graphql?.query || '',
      variables: request.body.graphql?.variables ? JSON.parse(request.body.graphql.variables || '{}') : {},
    });
  }

  return null;
}

export function generateCodeSnippet(request: RequestItem, language: SupportedLanguage): string {
  const fullUrl = buildFullUrl(request.url, request.params);
  const headers = getActiveHeaders(request);
  const rawBody = getRawBodyString(request);
  const method = request.method;

  switch (language) {
    case 'curl': {
      let code = `curl -X ${method} "${fullUrl}"`;
      for (const [k, v] of Object.entries(headers)) {
        code += ` \\\n  -H "${k}: ${v.replace(/"/g, '\\"')}"`;
      }
      if (rawBody) {
        code += ` \\\n  -d '${rawBody.replace(/'/g, "\\'")}'`;
      }
      return code;
    }

    case 'javascript_fetch': {
      const hasHeaders = Object.keys(headers).length > 0;
      const opts: string[] = [`  method: "${method}"`];

      if (hasHeaders) {
        opts.push(`  headers: ${JSON.stringify(headers, null, 4).replace(/\n/g, '\n  ')}`);
      }

      if (rawBody) {
        opts.push(`  body: JSON.stringify(${rawBody})`);
      }

      return `// JavaScript Fetch
const response = await fetch("${fullUrl}", {
${opts.join(',\n')}
});

const data = await response.json();
console.log(data);`;
    }

    case 'javascript_axios': {
      const hasHeaders = Object.keys(headers).length > 0;
      let config = `{\n  method: '${method.toLowerCase()}',\n  url: '${fullUrl}'`;

      if (hasHeaders) {
        config += `,\n  headers: ${JSON.stringify(headers, null, 4).replace(/\n/g, '\n  ')}`;
      }

      if (rawBody) {
        try {
          const parsed = JSON.parse(rawBody);
          config += `,\n  data: ${JSON.stringify(parsed, null, 4).replace(/\n/g, '\n  ')}`;
        } catch {
          config += `,\n  data: ${JSON.stringify(rawBody)}`;
        }
      }
      config += '\n}';

      return `// Axios
import axios from 'axios';

try {
  const response = await axios(${config});
  console.log(response.data);
} catch (error) {
  console.error(error);
}`;
    }

    case 'nodejs_native': {
      return `// Node.js (v18+ Native Fetch)
const response = await fetch("${fullUrl}", {
  method: "${method}",
  headers: ${JSON.stringify(headers, null, 4)},
  ${rawBody ? `body: ${JSON.stringify(rawBody)}` : ''}
});

const result = await response.text();
console.log(result);`;
    }

    case 'python_requests': {
      let code = `import requests\n\nurl = "${fullUrl}"\n`;
      if (Object.keys(headers).length > 0) {
        code += `headers = ${JSON.stringify(headers, null, 4)}\n`;
      }
      if (rawBody) {
        code += `payload = ${rawBody.startsWith('{') ? rawBody : JSON.stringify(rawBody)}\n`;
      }

      const args = [`url`];
      if (Object.keys(headers).length > 0) args.push('headers=headers');
      if (rawBody) {
        if (headers['Content-Type']?.includes('application/json')) {
          args.push('json=payload');
        } else {
          args.push('data=payload');
        }
      }

      code += `\nresponse = requests.${method.toLowerCase()}(${args.join(', ')})\nprint(response.status_code)\nprint(response.json())`;
      return code;
    }

    case 'python_http_client': {
      return `import http.client
import urllib.parse
import json

parsed = urllib.parse.urlparse("${fullUrl}")
conn = http.client.HTTPSConnection(parsed.netloc) if parsed.scheme == 'https' else http.client.HTTPConnection(parsed.netloc)
path = parsed.path + ('?' + parsed.query if parsed.query else '')

headers = ${JSON.stringify(headers, null, 2)}
payload = ${rawBody ? JSON.stringify(rawBody) : 'None'}

conn.request("${method}", path, payload, headers)
res = conn.getresponse()
data = res.read()
print(data.decode("utf-8"))`;
    }

    case 'go_native': {
      return `package main

import (
\t"fmt"
\t"io"
\t"net/http"
\t"strings"
)

func main() {
\turl := "${fullUrl}"
\tmethod := "${method}"

\tvar payload io.Reader
\t${rawBody ? `payload = strings.NewReader(\`${rawBody.replace(/`/g, '\\`')}\`)` : `payload = nil`}

\tclient := &http.Client{}
\treq, err := http.NewRequest(method, url, payload)
\tif err != nil {
\t\tfmt.Println(err)
\t\treturn
\t}
${Object.entries(headers)
  .map(([k, v]) => `\treq.Header.Add("${k}", "${v}")`)
  .join('\n')}

\tres, err := client.Do(req)
\tif err != nil {
\t\tfmt.Println(err)
\t\treturn
\t}
\tdefer res.Body.Close()

\tbody, err := io.ReadAll(res.Body)
\tif err != nil {
\t\tfmt.Println(err)
\t\treturn
\t}
\tfmt.Println(string(body))
}`;
    }

    case 'rust_reqwest': {
      return `// Cargo.toml: reqwest = { version = "0.12", features = ["json"] }, tokio = { version = "1", features = ["full"] }
use reqwest::Client;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = Client::new();
    let response = client
        .${method.toLowerCase()}("${fullUrl}")
${Object.entries(headers)
  .map(([k, v]) => `        .header("${k}", "${v}")`)
  .join('\n')}
${rawBody ? `        .body(r#"${rawBody}"#)\n` : ''}        .send()
        .await?;

    let body = response.text().await?;
    println!("{body}");
    Ok(())
}`;
    }

    case 'java_okhttp': {
      return `// OkHttp 4
import okhttp3.*;
import java.io.IOException;

public class Main {
    public static void main(String[] args) throws IOException {
        OkHttpClient client = new OkHttpClient().newBuilder().build();
        ${
          rawBody
            ? `MediaType mediaType = MediaType.parse("${headers['Content-Type'] || 'text/plain'}");\n        RequestBody body = RequestBody.create(mediaType, "${rawBody.replace(/"/g, '\\"').replace(/\n/g, '\\n')}");`
            : `RequestBody body = ${['POST', 'PUT', 'PATCH'].includes(method) ? 'RequestBody.create(null, new byte[0])' : 'null'};`
        }

        Request request = new Request.Builder()
            .url("${fullUrl}")
            .method("${method}", body)
${Object.entries(headers)
  .map(([k, v]) => `            .addHeader("${k}", "${v}")`)
  .join('\n')}
            .build();

        Response response = client.newCall(request).execute();
        System.out.println(response.body().string());
    }
}`;
    }

    case 'php_curl': {
      return `<?php

$curl = curl_init();

curl_setopt_array($curl, array(
  CURLOPT_URL => '${fullUrl}',
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_ENCODING => '',
  CURLOPT_MAXREDIRS => 10,
  CURLOPT_TIMEOUT => 30,
  CURLOPT_FOLLOWLOCATION => true,
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  CURLOPT_CUSTOMREQUEST => '${method}',
  ${rawBody ? `CURLOPT_POSTFIELDS => '${rawBody.replace(/'/g, "\\'")}',` : ''}
  CURLOPT_HTTPHEADER => array(
${Object.entries(headers)
  .map(([k, v]) => `    '${k}: ${v}'`)
  .join(',\n')}
  ),
));

$response = curl_exec($curl);
curl_close($curl);
echo $response;`;
    }

    case 'ruby_net_http': {
      return `require "uri"
require "json"
require "net/http"

url = URI("${fullUrl}")
https = Net::HTTP.new(url.host, url.port)
https.use_ssl = (url.scheme == "https")

request = Net::HTTP::${method.charAt(0) + method.slice(1).toLowerCase()}.new(url)
${Object.entries(headers)
  .map(([k, v]) => `request["${k}"] = "${v}"`)
  .join('\n')}
${rawBody ? `request.body = ${JSON.stringify(rawBody)}` : ''}

response = https.request(request)
puts response.read_body`;
    }

    case 'csharp_httpclient': {
      return `using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

class Program
{
    static async Task Main()
    {
        using var client = new HttpClient();
        using var request = new HttpRequestMessage(HttpMethod.${method.charAt(0) + method.slice(1).toLowerCase()}, "${fullUrl}");
        
${Object.entries(headers)
  .map(([k, v]) => `        request.Headers.TryAddWithoutValidation("${k}", "${v}");`)
  .join('\n')}
${rawBody ? `        request.Content = new StringContent("${rawBody.replace(/"/g, '""')}", Encoding.UTF8, "${headers['Content-Type'] || 'application/json'}");\n` : ''}
        using var response = await client.SendAsync(request);
        response.EnsureSuccessStatusCode();
        var responseBody = await response.Content.ReadAsStringAsync();
        Console.WriteLine(responseBody);
    }
}`;
    }

    case 'swift_urlsession': {
      return `import Foundation

let url = URL(string: "${fullUrl}")!
var request = URLRequest(url: url)
request.httpMethod = "${method}"
${Object.entries(headers)
  .map(([k, v]) => `request.addValue("${v}", forHTTPHeaderField: "${k}")`)
  .join('\n')}
${rawBody ? `request.httpBody = "${rawBody.replace(/"/g, '\\"')}".data(using: .utf8)\n` : ''}
let task = URLSession.shared.dataTask(with: request) { data, response, error in
    guard let data = data else {
        print(String(describing: error))
        return
    }
    print(String(data: data, encoding: .utf8)!)
}

task.resume()`;
    }

    default:
      return `// Code generator for ${language} coming soon`;
  }
}
