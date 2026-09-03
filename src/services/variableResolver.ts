import { VariableItem } from '../types';

export interface VariableContext {
  globals?: VariableItem[];
  environment?: VariableItem[];
  collection?: VariableItem[];
  request?: Record<string, string>;
  runtime?: Record<string, string>;
}

// Generate random UUID v4
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const FIRST_NAMES = ['Alex', 'Emma', 'Liam', 'Olivia', 'Noah', 'Sophia', 'Ethan', 'Ava', 'Mason', 'Isabella', 'Lucas', 'Mia'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
const CITIES = ['San Francisco', 'New York', 'London', 'Berlin', 'Tokyo', 'Singapore', 'Sydney', 'Paris', 'Toronto', 'Amsterdam'];
const COUNTRIES = ['United States', 'United Kingdom', 'Germany', 'Japan', 'Singapore', 'Australia', 'France', 'Canada', 'Netherlands'];
const WORDS = ['developer', 'pipeline', 'gateway', 'router', 'client', 'server', 'protocol', 'database', 'request', 'response', 'payload', 'schema'];

export function getDynamicVariableValue(name: string): string | null {
  const lower = name.toLowerCase();
  switch (lower) {
    case '$guid':
    case '$uuid':
      return generateUUID();
    case '$timestamp':
      return Math.floor(Date.now() / 1000).toString();
    case '$isotimestamp':
      return new Date().toISOString();
    case '$randomint':
      return Math.floor(Math.random() * 1000 + 1).toString();
    case '$randomemail': {
      const fn = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)].toLowerCase();
      const num = Math.floor(Math.random() * 900 + 100);
      return `${fn}${num}@example.com`;
    }
    case '$randomname': {
      const fn = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
      const ln = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
      return `${fn} ${ln}`;
    }
    case '$randomfirstname':
      return FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    case '$randomlastname':
      return LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    case '$randomcity':
      return CITIES[Math.floor(Math.random() * CITIES.length)];
    case '$randomcountry':
      return COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
    case '$randomurl': {
      const word = WORDS[Math.floor(Math.random() * WORDS.length)];
      return `https://${word}-api.example.com`;
    }
    case '$randomcolor': {
      return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    }
    case '$randomprice':
      return (Math.random() * 100 + 5).toFixed(2);
    case '$randomboolean':
      return Math.random() > 0.5 ? 'true' : 'false';
    case '$randomword':
      return WORDS[Math.floor(Math.random() * WORDS.length)];
    case '$randomphonenumber': {
      const p1 = Math.floor(Math.random() * 900 + 100);
      const p2 = Math.floor(Math.random() * 900 + 100);
      const p3 = Math.floor(Math.random() * 9000 + 1000);
      return `+1-${p1}-${p2}-${p3}`;
    }
    default:
      return null;
  }
}

/**
 * Builds a merged lookup dictionary with priority:
 * Runtime > Request > Collection > Environment > Globals
 */
export function buildVariableMap(context: VariableContext): Map<string, { value: string; scope: string }> {
  const map = new Map<string, { value: string; scope: string }>();

  // 1. Globals (lowest priority)
  if (context.globals) {
    for (const v of context.globals) {
      if (v.enabled && v.key.trim()) {
        map.set(v.key.trim(), { value: v.value, scope: 'Global' });
      }
    }
  }

  // 2. Environment
  if (context.environment) {
    for (const v of context.environment) {
      if (v.enabled && v.key.trim()) {
        map.set(v.key.trim(), { value: v.value, scope: 'Environment' });
      }
    }
  }

  // 3. Collection
  if (context.collection) {
    for (const v of context.collection) {
      if (v.enabled && v.key.trim()) {
        map.set(v.key.trim(), { value: v.value, scope: 'Collection' });
      }
    }
  }

  // 4. Request
  if (context.request) {
    for (const [k, v] of Object.entries(context.request)) {
      if (k.trim()) {
        map.set(k.trim(), { value: v, scope: 'Request' });
      }
    }
  }

  // 5. Runtime (e.g. set by scripts in current run)
  if (context.runtime) {
    for (const [k, v] of Object.entries(context.runtime)) {
      if (k.trim()) {
        map.set(k.trim(), { value: v, scope: 'Runtime' });
      }
    }
  }

  return map;
}

/**
 * Resolves all {{variable}} patterns in text using the given variable context.
 * Supports nested replacements up to maxDepth iterations.
 */
export function resolveVariables(text: string, context: VariableContext, maxDepth = 5): string {
  if (!text || typeof text !== 'string') return text || '';
  if (!text.includes('{{')) return text;

  const varMap = buildVariableMap(context);
  let currentText = text;
  let depth = 0;

  while (currentText.includes('{{') && depth < maxDepth) {
    let replacedAny = false;
    currentText = currentText.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
      const trimmedKey = key.trim();
      
      // Dynamic variables
      if (trimmedKey.startsWith('$')) {
        const dynVal = getDynamicVariableValue(trimmedKey);
        if (dynVal !== null) {
          replacedAny = true;
          return dynVal;
        }
      }

      // Context variables
      const lookup = varMap.get(trimmedKey);
      if (lookup !== undefined) {
        replacedAny = true;
        return lookup.value;
      }

      // If unresolved, leave placeholder
      return match;
    });

    if (!replacedAny) break;
    depth++;
  }

  return currentText;
}

/**
 * Finds all {{variable}} tokens in a string and returns info about their resolution.
 */
export function inspectVariablesInText(text: string, context: VariableContext): Array<{
  token: string;
  name: string;
  isResolved: boolean;
  value?: string;
  scope?: string;
  isDynamic: boolean;
}> {
  if (!text || typeof text !== 'string') return [];
  const results: Array<{
    token: string;
    name: string;
    isResolved: boolean;
    value?: string;
    scope?: string;
    isDynamic: boolean;
  }> = [];

  const varMap = buildVariableMap(context);
  const regex = /\{\{([^}]+)\}\}/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const token = match[0];
    const name = match[1].trim();
    
    if (name.startsWith('$')) {
      const dynVal = getDynamicVariableValue(name);
      results.push({
        token,
        name,
        isResolved: dynVal !== null,
        value: dynVal !== null ? '(Dynamic Value)' : undefined,
        scope: 'Dynamic',
        isDynamic: true,
      });
    } else {
      const item = varMap.get(name);
      results.push({
        token,
        name,
        isResolved: item !== undefined,
        value: item?.value,
        scope: item?.scope,
        isDynamic: false,
      });
    }
  }

  return results;
}
