export type HttpRequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export interface KeyValuePair {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
  description?: string;
}

export type HeaderItem = KeyValuePair;
export type ParamItem = KeyValuePair;
export type UrlEncodedItem = KeyValuePair;

export interface FormDataItem {
  id: string;
  key: string;
  value: string;
  type: 'text' | 'file';
  file?: File;
  fileName?: string;
  fileData?: string; // base64 or text representation
  enabled: boolean;
  description?: string;
}

export type BodyType = 'none' | 'raw' | 'form-data' | 'x-www-form-urlencoded' | 'binary' | 'graphql';
export type RawLanguage = 'json' | 'xml' | 'html' | 'text' | 'javascript';

export interface GraphQLBody {
  query: string;
  variables: string;
}

export interface BinaryFile {
  name: string;
  size: number;
  type: string;
  data?: string; // base64
}

export interface BodyDefinition {
  type: BodyType;
  raw?: string;
  rawLanguage?: RawLanguage;
  formData?: FormDataItem[];
  urlEncoded?: UrlEncodedItem[];
  graphql?: GraphQLBody;
  binaryFile?: BinaryFile;
}

export type AuthType = 'none' | 'inherit' | 'bearer' | 'basic' | 'apikey' | 'oauth2' | 'awssig';

export interface AuthBearer {
  token: string;
}

export interface AuthBasic {
  username: string;
  password: string;
}

export interface AuthApiKey {
  key: string;
  value: string;
  addTo: 'header' | 'query';
}

export interface AuthOAuth2 {
  accessToken: string;
  tokenType?: string;
  headerPrefix?: string;
}

export interface AuthAwsSig {
  accessKey: string;
  secretKey: string;
  region: string;
  service: string;
  sessionToken?: string;
}

export interface AuthDefinition {
  type: AuthType;
  bearer?: AuthBearer;
  basic?: AuthBasic;
  apiKey?: AuthApiKey;
  oauth2?: AuthOAuth2;
  awsSig?: AuthAwsSig;
}

export interface RequestSettings {
  followRedirects?: boolean;
  rejectUnauthorized?: boolean; // SSL check
  timeoutMs?: number;
  useProxy?: boolean;
  proxyUrl?: string;
}

export interface RequestItem {
  id: string;
  name: string;
  method: HttpRequestMethod;
  url: string;
  params: ParamItem[];
  headers: HeaderItem[];
  body: BodyDefinition;
  auth: AuthDefinition;
  preRequestScript?: string;
  testScript?: string;
  settings?: RequestSettings;
  description?: string;
  folderId?: string | null;
  collectionId?: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface ResponseCookie {
  name: string;
  value: string;
  domain?: string;
  path?: string;
  expires?: string;
  httpOnly?: boolean;
  secure?: boolean;
}

export interface ResponseTimings {
  start: number;
  ttfb: number; // time to first byte
  download: number;
  total: number;
}

export interface ResponseData {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  cookies?: ResponseCookie[];
  body: string;
  sizeBytes: number;
  timeMs: number;
  timestamp: number;
  contentType: string;
  isError?: boolean;
  errorDetails?: string;
  timings?: ResponseTimings;
}

export interface TestAssertion {
  name: string;
  passed: boolean;
  error?: string;
  durationMs?: number;
}

export interface TestResultSummary {
  total: number;
  passed: number;
  failed: number;
  assertions: TestAssertion[];
}

export interface TabItem {
  id: string;
  requestId: string;
  name: string;
  method: HttpRequestMethod;
  isDirty: boolean;
  request: RequestItem;
  response?: ResponseData | null;
  testResults?: TestResultSummary | null;
  isLoading?: boolean;
  activeSubTab?: 'params' | 'auth' | 'headers' | 'body' | 'scripts' | 'tests' | 'settings';
  activeResponseTab?: 'pretty' | 'raw' | 'preview' | 'headers' | 'cookies' | 'tests' | 'timings';
}

export interface FolderItem {
  id: string;
  name: string;
  parentId?: string | null;
  collectionId: string;
  description?: string;
  auth?: AuthDefinition;
  preRequestScript?: string;
  testScript?: string;
  variables?: VariableItem[];
}

export interface CollectionItem {
  id: string;
  name: string;
  description?: string;
  folders: FolderItem[];
  requests: RequestItem[];
  auth?: AuthDefinition;
  preRequestScript?: string;
  testScript?: string;
  variables?: VariableItem[];
  createdAt: number;
  updatedAt: number;
}

export interface VariableItem {
  id: string;
  key: string;
  value: string;
  initialValue?: string;
  enabled: boolean;
  type?: 'string' | 'secret';
  description?: string;
}

export interface EnvironmentItem {
  id: string;
  name: string;
  variables: VariableItem[];
  createdAt: number;
  updatedAt: number;
}

export interface HistoryItem {
  id: string;
  requestId?: string;
  name: string;
  method: HttpRequestMethod;
  url: string;
  status: number;
  statusText: string;
  timeMs: number;
  sizeBytes: number;
  timestamp: number;
  requestSnapshot: RequestItem;
  responseSnapshot?: ResponseData;
}

export interface MockEndpoint {
  id: string;
  name: string;
  method: HttpRequestMethod;
  path: string;
  statusCode: number;
  headers: HeaderItem[];
  body: string;
  delayMs: number;
  enabled: boolean;
}

export interface RunnerStepResult {
  requestId: string;
  requestName: string;
  method: HttpRequestMethod;
  url: string;
  iteration: number;
  status: number;
  statusText: string;
  timeMs: number;
  sizeBytes: number;
  testResults: TestResultSummary;
  error?: string;
}

export interface RunnerResult {
  id: string;
  collectionName: string;
  startTime: number;
  endTime?: number;
  totalRequests: number;
  passedRequests: number;
  failedRequests: number;
  totalAssertions: number;
  passedAssertions: number;
  failedAssertions: number;
  durationMs: number;
  steps: RunnerStepResult[];
}

export interface AppSettings {
  theme: 'dark' | 'midnight' | 'light' | 'contrast';
  responseOrientation: 'horizontal' | 'vertical';
  sendNoCache: boolean;
  followRedirects: boolean;
  requestTimeout: number; // in seconds
  proxyEnabled: boolean;
  proxyUrl: string;
  fontSize: number;
  autoSaveTabs: boolean;
}
