import { resolveVariables, getDynamicVariableValue, inspectVariablesInText } from '../src/services/variableResolver.ts';
import { parseCurlCommand } from '../src/services/curlParser.ts';
import { executeScript } from '../src/services/scriptEngine.ts';
import { generateCodeSnippet } from '../src/services/codeGenerator.ts';
import { importPostmanCollection, exportToPostmanCollection, importOpenApi } from '../src/services/importExport.ts';

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

console.log('\n--- 1. Testing Variable Resolver & Dynamic Variables ---');
const dynGuid = getDynamicVariableValue('$guid');
assert(dynGuid && dynGuid.length === 36, 'Dynamic $guid generates valid UUID');

const dynTime = getDynamicVariableValue('$timestamp');
assert(dynTime && parseInt(dynTime) > 1700000000, 'Dynamic $timestamp generates Unix epoch');

const context = {
  globals: [{ id: '1', key: 'globalKey', value: 'globalVal', enabled: true }],
  environment: [{ id: '2', key: 'envKey', value: 'envVal', enabled: true }],
  collection: [{ id: '3', key: 'colKey', value: 'colVal', enabled: true }],
};

const resolved = resolveVariables('{{globalKey}}/{{envKey}}/{{colKey}}', context);
assert(resolved === 'globalVal/envVal/colVal', 'Scoped variable resolution');

console.log('\n--- 2. Testing cURL Parser ---');
const sampleCurl = `curl -X POST "https://httpbin.org/post?tag=developer" -H "Content-Type: application/json" -H "Authorization: Bearer my-secret-token" -d '{"username":"endly_user"}'`;
const parsedReq = parseCurlCommand(sampleCurl);

assert(parsedReq.method === 'POST', 'cURL method parsed as POST');
assert(parsedReq.url === 'https://httpbin.org/post', 'cURL url parsed cleanly without query params');
assert(parsedReq.params?.some((p) => p.key === 'tag' && p.value === 'developer'), 'cURL query param parsed');
assert(parsedReq.auth?.type === 'bearer' && parsedReq.auth.bearer?.token === 'my-secret-token', 'Bearer token parsed from Authorization header');
assert(parsedReq.body?.type === 'raw' && parsedReq.body.raw?.includes('endly_user'), 'Raw body parsed');

console.log('\n--- 3. Testing Script Engine (pm.* & Chai Assertions) ---');
const testScript = `
pm.test("Status is 200", function () {
  pm.response.to.have.status(200);
});

pm.test("User name matches", function () {
  const json = pm.response.json();
  pm.expect(json.user).to.equal("Alice");
  pm.expect(json.score).to.be.above(90);
  pm.expect(json.active).to.be.true;
});

pm.environment.set("session_token", "abc-123");
`;

const mockResponse = {
  status: 200,
  statusText: 'OK',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ user: 'Alice', score: 95, active: true }),
  sizeBytes: 45,
  timeMs: 80,
  timestamp: Date.now(),
  contentType: 'application/json',
};

const scriptRes = executeScript(testScript, {
  request: { method: 'GET', url: 'https://api.test', params: [], headers: [], body: { type: 'none' }, auth: { type: 'none' } },
  response: mockResponse,
  environmentVariables: {},
  globalVariables: {},
  collectionVariables: {},
  runtimeVariables: {},
});

assert(scriptRes.summary.total === 2, 'Total 2 assertions ran');
assert(scriptRes.summary.passed === 2, 'Both assertions passed');
assert(scriptRes.mutatedEnvironment.session_token === 'abc-123', 'pm.environment.set() mutated environment');

console.log('\n--- 4. Testing Code Generator ---');
const testReq = {
  id: 'r1',
  name: 'Test Request',
  method: 'POST',
  url: 'https://api.example.com/v1/orders',
  params: [{ id: 'p1', key: 'sort', value: 'desc', enabled: true }],
  headers: [{ id: 'h1', key: 'X-Client', value: 'Endly', enabled: true }],
  body: { type: 'raw', rawLanguage: 'json', raw: '{"item":"laptop","qty":1}' },
  auth: { type: 'bearer', bearer: { token: 'sample-jwt' } },
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

const curlSnippet = generateCodeSnippet(testReq, 'curl');
assert(curlSnippet.includes('curl -X POST') && curlSnippet.includes('https://api.example.com/v1/orders?sort=desc'), 'cURL snippet generated correctly');

const pySnippet = generateCodeSnippet(testReq, 'python_requests');
assert(pySnippet.includes('requests.post') && pySnippet.includes('headers ='), 'Python Requests snippet generated');

const jsSnippet = generateCodeSnippet(testReq, 'javascript_axios');
assert(jsSnippet.includes("import axios from 'axios'") && jsSnippet.includes("method: 'post'"), 'Axios snippet generated');

const rustSnippet = generateCodeSnippet(testReq, 'rust_reqwest');
assert(rustSnippet.includes('reqwest::Client') && rustSnippet.includes('.post('), 'Rust reqwest snippet generated');

console.log('\n--- 5. Testing Postman & OpenAPI Import/Export ---');
const samplePostmanJson = JSON.stringify({
  info: { name: 'Sample API Test', schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json' },
  item: [
    {
      name: 'Ping',
      request: {
        method: 'GET',
        url: { raw: 'https://httpbin.org/get?msg=hello' },
        header: [{ key: 'Accept', value: 'application/json' }],
      },
    },
  ],
});

const importedCol = importPostmanCollection(samplePostmanJson);
assert(importedCol.name === 'Sample API Test', 'Postman collection name imported');
assert(importedCol.requests.length === 1, 'Postman request count imported');
assert(importedCol.requests[0].url === 'https://httpbin.org/get', 'Postman request URL parsed');

const exportedPostman = exportToPostmanCollection(importedCol);
assert(exportedPostman.includes('Sample API Test') && exportedPostman.includes('https://httpbin.org/get'), 'Postman export v2.1 structure valid');

console.log('\n🎉 ALL CORE TEST VERIFICATIONS PASSED SUCCESSFULLY!\n');
