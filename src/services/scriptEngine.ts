import { RequestItem, ResponseData, TestAssertion, TestResultSummary, VariableItem } from '../types';

export interface ScriptExecutionContext {
  request: RequestItem;
  response?: ResponseData;
  environmentVariables: Record<string, string>;
  globalVariables: Record<string, string>;
  collectionVariables: Record<string, string>;
  runtimeVariables: Record<string, string>;
}

export interface ScriptExecutionResult {
  assertions: TestAssertion[];
  summary: TestResultSummary;
  logs: string[];
  mutatedEnvironment: Record<string, string>;
  mutatedGlobals: Record<string, string>;
  mutatedCollection: Record<string, string>;
  mutatedRuntime: Record<string, string>;
}

/**
 * Lightweight Chai-compatible expect assertion implementation
 */
class AssertionChain {
  private actual: any;
  private isNot: boolean;
  private messagePrefix: string;

  constructor(actual: any, isNot = false, messagePrefix = '') {
    this.actual = actual;
    this.isNot = isNot;
    this.messagePrefix = messagePrefix;
  }

  get not(): AssertionChain {
    return new AssertionChain(this.actual, !this.isNot, this.messagePrefix);
  }

  get to(): AssertionChain {
    return this;
  }

  get be(): AssertionChain {
    return this;
  }

  get have(): AssertionChain {
    return this;
  }

  get at(): AssertionChain {
    return this;
  }

  get is(): AssertionChain {
    return this;
  }

  private assert(condition: boolean, passMsg: string, failMsg: string) {
    const passed = this.isNot ? !condition : condition;
    if (!passed) {
      throw new Error(this.messagePrefix ? `${this.messagePrefix}: ${failMsg}` : failMsg);
    }
  }

  equal(expected: any) {
    this.assert(
      this.actual === expected,
      `expected ${JSON.stringify(this.actual)} to equal ${JSON.stringify(expected)}`,
      `expected ${JSON.stringify(this.actual)} to equal ${JSON.stringify(expected)}`
    );
    return this;
  }

  eql(expected: any) {
    this.assert(
      JSON.stringify(this.actual) === JSON.stringify(expected),
      `expected ${JSON.stringify(this.actual)} to deeply equal ${JSON.stringify(expected)}`,
      `expected ${JSON.stringify(this.actual)} to deeply equal ${JSON.stringify(expected)}`
    );
    return this;
  }

  a(type: string) {
    const actualType = Array.isArray(this.actual) ? 'array' : typeof this.actual;
    this.assert(
      actualType === type.toLowerCase(),
      `expected ${JSON.stringify(this.actual)} to be a ${type}`,
      `expected ${JSON.stringify(this.actual)} to be a ${type}, but got ${actualType}`
    );
    return this;
  }

  an(type: string) {
    return this.a(type);
  }

  property(prop: string, val?: any) {
    const hasProp = this.actual !== null && this.actual !== undefined && prop in this.actual;
    if (val !== undefined) {
      this.assert(
        hasProp && this.actual[prop] === val,
        `expected property '${prop}' to equal ${JSON.stringify(val)}`,
        `expected property '${prop}' to equal ${JSON.stringify(val)}, but got ${JSON.stringify(this.actual?.[prop])}`
      );
    } else {
      this.assert(
        hasProp,
        `expected object to have property '${prop}'`,
        `expected object to have property '${prop}'`
      );
    }
    return this;
  }

  lengthOf(len: number) {
    const actualLen = this.actual?.length;
    this.assert(
      actualLen === len,
      `expected length to be ${len}`,
      `expected length to be ${len}, but got ${actualLen}`
    );
    return this;
  }

  above(val: number) {
    this.assert(
      this.actual > val,
      `expected ${this.actual} to be above ${val}`,
      `expected ${this.actual} to be above ${val}`
    );
    return this;
  }

  below(val: number) {
    this.assert(
      this.actual < val,
      `expected ${this.actual} to be below ${val}`,
      `expected ${this.actual} to be below ${val}`
    );
    return this;
  }

  least(val: number) {
    this.assert(
      this.actual >= val,
      `expected ${this.actual} to be at least ${val}`,
      `expected ${this.actual} to be at least ${val}`
    );
    return this;
  }

  most(val: number) {
    this.assert(
      this.actual <= val,
      `expected ${this.actual} to be at most ${val}`,
      `expected ${this.actual} to be at most ${val}`
    );
    return this;
  }

  include(val: any) {
    let includes = false;
    if (typeof this.actual === 'string' || Array.isArray(this.actual)) {
      includes = this.actual.includes(val);
    } else if (typeof this.actual === 'object' && this.actual !== null) {
      includes = val in this.actual;
    }
    this.assert(
      includes,
      `expected ${JSON.stringify(this.actual)} to include ${JSON.stringify(val)}`,
      `expected ${JSON.stringify(this.actual)} to include ${JSON.stringify(val)}`
    );
    return this;
  }

  contain(val: any) {
    return this.include(val);
  }

  match(regex: RegExp) {
    this.assert(
      regex.test(String(this.actual)),
      `expected ${this.actual} to match ${regex}`,
      `expected ${this.actual} to match ${regex}`
    );
    return this;
  }

  get true() {
    this.assert(this.actual === true, `expected true`, `expected true, but got ${this.actual}`);
    return this;
  }

  get false() {
    this.assert(this.actual === false, `expected false`, `expected false, but got ${this.actual}`);
    return this;
  }

  get null() {
    this.assert(this.actual === null, `expected null`, `expected null, but got ${this.actual}`);
    return this;
  }

  get undefined() {
    this.assert(this.actual === undefined, `expected undefined`, `expected undefined, but got ${this.actual}`);
    return this;
  }

  get ok() {
    this.assert(!!this.actual, `expected truthy value`, `expected truthy value, but got ${this.actual}`);
    return this;
  }
}

export function executeScript(script: string, context: ScriptExecutionContext): ScriptExecutionResult {
  const assertions: TestAssertion[] = [];
  const logs: string[] = [];

  const envMutations: Record<string, string> = { ...context.environmentVariables };
  const globalMutations: Record<string, string> = { ...context.globalVariables };
  const colMutations: Record<string, string> = { ...context.collectionVariables };
  const runtimeMutations: Record<string, string> = { ...context.runtimeVariables };

  if (!script || !script.trim()) {
    return {
      assertions,
      summary: { total: 0, passed: 0, failed: 0, assertions: [] },
      logs,
      mutatedEnvironment: envMutations,
      mutatedGlobals: globalMutations,
      mutatedCollection: colMutations,
      mutatedRuntime: runtimeMutations,
    };
  }

  // Response helper
  let parsedJsonBody: any = null;
  if (context.response?.body) {
    try {
      parsedJsonBody = JSON.parse(context.response.body);
    } catch {
      parsedJsonBody = null;
    }
  }

  const pm = {
    test: (name: string, fn: () => void) => {
      const startTime = performance.now();
      try {
        fn();
        assertions.push({
          name,
          passed: true,
          durationMs: Math.round(performance.now() - startTime),
        });
      } catch (err: any) {
        assertions.push({
          name,
          passed: false,
          error: err.message || String(err),
          durationMs: Math.round(performance.now() - startTime),
        });
      }
    },
    expect: (actual: any, message?: string) => new AssertionChain(actual, false, message || ''),
    environment: {
      get: (k: string) => envMutations[k],
      set: (k: string, v: any) => {
        envMutations[k] = String(v);
      },
      unset: (k: string) => {
        delete envMutations[k];
      },
    },
    globals: {
      get: (k: string) => globalMutations[k],
      set: (k: string, v: any) => {
        globalMutations[k] = String(v);
      },
      unset: (k: string) => {
        delete globalMutations[k];
      },
    },
    collectionVariables: {
      get: (k: string) => colMutations[k],
      set: (k: string, v: any) => {
        colMutations[k] = String(v);
      },
    },
    variables: {
      get: (k: string) => runtimeMutations[k] || colMutations[k] || envMutations[k] || globalMutations[k],
      set: (k: string, v: any) => {
        runtimeMutations[k] = String(v);
      },
    },
    request: {
      url: context.request.url,
      method: context.request.method,
      headers: context.request.headers,
    },
    response: context.response
      ? {
          code: context.response.status,
          status: context.response.statusText,
          time: context.response.timeMs,
          responseTime: context.response.timeMs,
          headers: context.response.headers,
          text: () => context.response?.body || '',
          json: () => {
            if (parsedJsonBody !== null) return parsedJsonBody;
            return JSON.parse(context.response?.body || '{}');
          },
          to: {
            have: {
              status: (code: number) => {
                if (context.response?.status !== code) {
                  throw new Error(`expected response status ${code} but got ${context.response?.status}`);
                }
              },
              header: (name: string) => {
                const found = Object.keys(context.response?.headers || {}).some(
                  (h) => h.toLowerCase() === name.toLowerCase()
                );
                if (!found) {
                  throw new Error(`expected response to have header '${name}'`);
                }
              },
            },
            be: {
              success: () => {
                const s = context.response?.status || 0;
                if (s < 200 || s >= 300) {
                  throw new Error(`expected status 2xx but got ${s}`);
                }
              },
              ok: () => {
                if (context.response?.status !== 200) {
                  throw new Error(`expected status 200 but got ${context.response?.status}`);
                }
              },
              json: () => {
                const ct = context.response?.contentType || '';
                if (!ct.includes('application/json') && parsedJsonBody === null) {
                  throw new Error(`expected JSON response`);
                }
              },
            },
          },
        }
      : null,
  };

  const consoleProxy = {
    log: (...args: any[]) => {
      logs.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
    },
    error: (...args: any[]) => {
      logs.push('[ERROR] ' + args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
    },
    warn: (...args: any[]) => {
      logs.push('[WARN] ' + args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
    },
    info: (...args: any[]) => {
      logs.push('[INFO] ' + args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
    },
  };

  try {
    const sandboxFn = new Function('pm', 'console', script);
    sandboxFn(pm, consoleProxy);
  } catch (err: any) {
    logs.push(`[Script Runtime Error] ${err.message || String(err)}`);
  }

  const passed = assertions.filter((a) => a.passed).length;
  const failed = assertions.length - passed;

  return {
    assertions,
    summary: {
      total: assertions.length,
      passed,
      failed,
      assertions,
    },
    logs,
    mutatedEnvironment: envMutations,
    mutatedGlobals: globalMutations,
    mutatedCollection: colMutations,
    mutatedRuntime: runtimeMutations,
  };
}

export interface ScriptSnippet {
  id: string;
  name: string;
  category: 'pre' | 'test';
  code: string;
}

export const PRE_REQUEST_SNIPPETS: ScriptSnippet[] = [
  {
    id: 'set-env-var',
    name: 'Set an environment variable',
    category: 'pre',
    code: `pm.environment.set("variable_key", "variable_value");\n`,
  },
  {
    id: 'get-env-var',
    name: 'Get an environment variable',
    category: 'pre',
    code: `const myVar = pm.environment.get("variable_key");\nconsole.log("Current var:", myVar);\n`,
  },
  {
    id: 'set-timestamp',
    name: 'Generate and set dynamic timestamp',
    category: 'pre',
    code: `pm.variables.set("request_timestamp", Date.now());\n`,
  },
  {
    id: 'clear-env-var',
    name: 'Clear an environment variable',
    category: 'pre',
    code: `pm.environment.unset("variable_key");\n`,
  },
];

export const TEST_SNIPPETS: ScriptSnippet[] = [
  {
    id: 'status-200',
    name: 'Status code: Code is 200',
    category: 'test',
    code: `pm.test("Status code is 200", function () {\n    pm.response.to.have.status(200);\n});\n`,
  },
  {
    id: 'status-successful',
    name: 'Status code: Successful 2xx',
    category: 'test',
    code: `pm.test("Successful POST/PUT request", function () {\n    pm.expect(pm.response.code).to.be.oneOf([200, 201, 202, 204]);\n});\n`,
  },
  {
    id: 'response-time',
    name: 'Response time is less than 200ms',
    category: 'test',
    code: `pm.test("Response time is less than 200ms", function () {\n    pm.expect(pm.response.responseTime).to.be.below(200);\n});\n`,
  },
  {
    id: 'json-value-check',
    name: 'Response body: JSON value check',
    category: 'test',
    code: `pm.test("JSON value check", function () {\n    const jsonData = pm.response.json();\n    pm.expect(jsonData.id).to.not.be.undefined;\n});\n`,
  },
  {
    id: 'header-present',
    name: 'Response headers: Content-Type header present',
    category: 'test',
    code: `pm.test("Content-Type header is present", function () {\n    pm.response.to.have.header("Content-Type");\n});\n`,
  },
  {
    id: 'set-env-from-response',
    name: 'Set an environment variable from response',
    category: 'test',
    code: `const jsonData = pm.response.json();\npm.environment.set("auth_token", jsonData.token || jsonData.access_token);\n`,
  },
];
