import React, { useState, useRef } from 'react';
import {
  Send,
  Save,
  Copy,
  Check,
  Code2,
  StopCircle,
  HelpCircle,
  KeyRound,
  FileCode2,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { useCollectionStore } from '../../store/useCollectionStore';
import { useEnvironmentStore } from '../../store/useEnvironmentStore';
import { useHistoryStore } from '../../store/useHistoryStore';
import { useMockStore } from '../../store/useMockStore';
import {
  HttpRequestMethod,
  HeaderItem,
  ParamItem,
  BodyType,
  RawLanguage,
  AuthType,
  FormDataItem,
  UrlEncodedItem,
  TabItem,
} from '../../types';
import { KeyValueTable } from '../ui/KeyValueTable';
import { CodeEditor } from '../ui/CodeEditor';
import { dispatchHttpRequest } from '../../services/httpDispatcher';
import { executeScript, PRE_REQUEST_SNIPPETS, TEST_SNIPPETS } from '../../services/scriptEngine';
import { generateCodeSnippet } from '../../services/codeGenerator';
import { inspectVariablesInText } from '../../services/variableResolver';

const HTTP_METHODS: HttpRequestMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

const COMMON_HEADERS = [
  'Accept',
  'Accept-Encoding',
  'Accept-Language',
  'Authorization',
  'Cache-Control',
  'Content-Type',
  'Cookie',
  'Host',
  'Origin',
  'Referer',
  'User-Agent',
  'X-API-Key',
  'X-Request-ID',
];

export const RequestBuilder: React.FC = () => {
  const {
    tabs,
    activeTabId,
    updateTabRequest,
    setTabResponse,
    setTabLoading,
    setTabSubTab,
    markTabSaved,
    settings,
    openSnippetModal,
  } = useWorkspaceStore();

  const { collections, updateRequest, addRequest } = useCollectionStore();
  const { getVariableContext } = useEnvironmentStore();
  const { addHistoryItem } = useHistoryStore();
  const { mocks } = useMockStore();

  const [copiedCurl, setCopiedCurl] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveColId, setSaveColId] = useState('');
  const [saveReqName, setSaveReqName] = useState('');
  const abortControllerRef = useRef<AbortController | null>(null);

  const REQUEST_SUBTABS: TabItem['activeSubTab'][] = ['params', 'auth', 'headers', 'body', 'scripts', 'tests'];

  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null || !activeTab) return;
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;

    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
      const currentIdx = REQUEST_SUBTABS.indexOf(activeTab.activeSubTab);
      if (deltaX < 0 && currentIdx < REQUEST_SUBTABS.length - 1) {
        setTabSubTab(activeTab.id, REQUEST_SUBTABS[currentIdx + 1]);
      } else if (deltaX > 0 && currentIdx > 0) {
        setTabSubTab(activeTab.id, REQUEST_SUBTABS[currentIdx - 1]);
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  const activeTab = tabs.find((t) => t.id === activeTabId);
  if (!activeTab) {
    return (
      <div className="flex-1 flex items-center justify-center text-text-muted text-xs">
        No active request tab
      </div>
    );
  }

  const { request, activeSubTab = 'params', isLoading } = activeTab;

  const handleMethodChange = (method: HttpRequestMethod) => {
    updateTabRequest(activeTab.id, { method });
  };

  const handleUrlChange = (url: string) => {
    // When typing URL with query params, parse them automatically into params table
    let cleanUrl = url;
    let newParams = [...(request.params || [])];

    if (url.includes('?')) {
      const [base, queryString] = url.split('?');
      cleanUrl = base;
      const qParams = queryString.split('&');
      
      const parsedParams: ParamItem[] = qParams.map((q) => {
        const [k, v] = q.split('=');
        return {
          id: Math.random().toString(36).substring(2, 9),
          key: k ? decodeURIComponent(k) : '',
          value: v ? decodeURIComponent(v) : '',
          enabled: true,
        };
      });

      newParams = parsedParams;
    }

    updateTabRequest(activeTab.id, { url: cleanUrl, params: newParams });
  };

  const handleParamsChange = (newParams: ParamItem[]) => {
    updateTabRequest(activeTab.id, { params: newParams });
  };

  const handleHeadersChange = (newHeaders: HeaderItem[]) => {
    updateTabRequest(activeTab.id, { headers: newHeaders });
  };

  // Execute Request (Send)
  const handleSend = async () => {
    if (isLoading) {
      // Abort
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      setTabLoading(activeTab.id, false);
      return;
    }

    setTabLoading(activeTab.id, true);
    abortControllerRef.current = new AbortController();

    try {
      // 1. Build Variable Context
      const activeCol = collections.find((c) => c.id === request.collectionId);
      const varContext = getVariableContext(activeCol?.variables);

      // 2. Execute Pre-request Script (Collection + Request level)
      const combinedPreScript = `${activeCol?.preRequestScript || ''}\n${request.preRequestScript || ''}`;
      if (combinedPreScript.trim()) {
        const preResult = executeScript(combinedPreScript, {
          request,
          environmentVariables: Object.fromEntries(
            (varContext.environment || []).filter((v) => v.enabled).map((v) => [v.key, v.value])
          ),
          globalVariables: Object.fromEntries(
            (varContext.globals || []).filter((v) => v.enabled).map((v) => [v.key, v.value])
          ),
          collectionVariables: Object.fromEntries(
            (varContext.collection || []).filter((v) => v.enabled).map((v) => [v.key, v.value])
          ),
          runtimeVariables: {},
        });

        // Apply mutations
        varContext.runtime = preResult.mutatedRuntime;
      }

      // 3. Check for Local Mock match
      const matchedMock = mocks.find(
        (m) =>
          m.enabled &&
          m.method === request.method &&
          request.url.toLowerCase().includes(m.path.toLowerCase())
      );

      let responseData;
      if (matchedMock) {
        // Return simulated mock response
        await new Promise((resolve) => setTimeout(resolve, matchedMock.delayMs || 100));
        const mockHeaders: Record<string, string> = {};
        (matchedMock.headers || []).forEach((h) => {
          if (h.enabled) mockHeaders[h.key] = h.value;
        });

        responseData = {
          status: matchedMock.statusCode,
          statusText: matchedMock.statusCode === 200 ? 'OK (Mock Server)' : 'Mock Response',
          headers: mockHeaders,
          cookies: [],
          body: matchedMock.body,
          sizeBytes: new Blob([matchedMock.body]).size,
          timeMs: matchedMock.delayMs || 100,
          timestamp: Date.now(),
          contentType: mockHeaders['Content-Type'] || 'application/json',
          timings: {
            start: Date.now(),
            ttfb: matchedMock.delayMs || 100,
            download: 1,
            total: matchedMock.delayMs || 100,
          },
        };
      } else {
        // Dispatch live HTTP request
        responseData = await dispatchHttpRequest({
          request,
          variableContext: varContext,
          globalSettings: {
            useProxy: settings.proxyEnabled,
            proxyUrl: settings.proxyUrl,
            timeoutMs: settings.requestTimeout * 1000,
          },
          abortSignal: abortControllerRef.current.signal,
        });
      }

      // 4. Execute Tests Script (Collection + Request level)
      const combinedTestScript = `${activeCol?.testScript || ''}\n${request.testScript || ''}`;
      let testSummary = null;

      if (combinedTestScript.trim() && !responseData.isError) {
        const testResult = executeScript(combinedTestScript, {
          request,
          response: responseData,
          environmentVariables: Object.fromEntries(
            (varContext.environment || []).filter((v) => v.enabled).map((v) => [v.key, v.value])
          ),
          globalVariables: Object.fromEntries(
            (varContext.globals || []).filter((v) => v.enabled).map((v) => [v.key, v.value])
          ),
          collectionVariables: Object.fromEntries(
            (varContext.collection || []).filter((v) => v.enabled).map((v) => [v.key, v.value])
          ),
          runtimeVariables: varContext.runtime || {},
        });
        testSummary = testResult.summary;
      }

      // 5. Store response & log to history
      setTabResponse(activeTab.id, responseData, testSummary);
      addHistoryItem(request, responseData);
    } catch (err: any) {
      console.error('Send error:', err);
      setTabResponse(activeTab.id, {
        status: 0,
        statusText: 'Client Error',
        headers: {},
        cookies: [],
        body: `Execution error: ${err.message || String(err)}`,
        sizeBytes: 0,
        timeMs: 0,
        timestamp: Date.now(),
        contentType: 'text/plain',
        isError: true,
      });
    } finally {
      setTabLoading(activeTab.id, false);
      abortControllerRef.current = null;
    }
  };

  const handleSave = () => {
    if (request.collectionId) {
      updateRequest(request.id, request);
      markTabSaved(activeTab.id);
    } else {
      setSaveReqName(request.name || 'New Request');
      setSaveColId(collections[0]?.id || '');
      setSaveModalOpen(true);
    }
  };

  const handleConfirmSaveModal = () => {
    if (saveColId) {
      const created = addRequest(saveColId, null, {
        ...request,
        name: saveReqName,
      });
      markTabSaved(activeTab.id, created.id);
      setSaveModalOpen(false);
    }
  };

  const handleCopyCurl = () => {
    const curl = generateCodeSnippet(request, 'curl');
    navigator.clipboard.writeText(curl);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 1500);
  };

  // Inspect dynamic variables in URL
  const inspectedVars = inspectVariablesInText(request.url, getVariableContext());

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="flex flex-col h-full bg-background select-none overflow-hidden"
    >
      {/* Top URL & Action Bar */}
      <div className="flex items-center space-x-2 p-3 bg-background border-b border-border">
        {/* Method Picker */}
        <div className="relative">
          <select
            value={request.method}
            onChange={(e) => handleMethodChange(e.target.value as HttpRequestMethod)}
            className="appearance-none font-bold text-xs rounded-md pl-3 pr-7 py-2 bg-background-secondary border border-border focus:border-accent text-accent cursor-pointer tracking-wider"
          >
            {HTTP_METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* URL Input */}
        <div className="flex-1 relative flex items-center min-w-0">
          <input
            type="text"
            value={request.url}
            onChange={(e) => handleUrlChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleSend();
              }
            }}
            placeholder="Enter request URL or {{variable}}"
            className="w-full bg-background-secondary border border-border rounded-md px-3 py-2 text-xs text-text placeholder:text-text-muted focus:border-accent focus:outline-none font-mono"
          />

          {/* Inspected variable tags */}
          {inspectedVars.length > 0 && (
            <div className="absolute right-2 hidden sm:flex items-center space-x-1 pointer-events-none">
              {inspectedVars.slice(0, 2).map((v, i) => (
                <span
                  key={i}
                  className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                    v.isResolved ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  }`}
                  title={`${v.name}: ${v.value || 'Unresolved'}`}
                >
                  {v.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Send / Cancel Button */}
        <button
          onClick={handleSend}
          className={`flex items-center space-x-1.5 px-3 sm:px-4 py-2 rounded-md font-medium text-xs text-white transition-all shadow-sm shrink-0 ${
            isLoading
              ? 'bg-rose-600 hover:bg-rose-700'
              : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
          }`}
          title="Send Request (Cmd/Ctrl + Enter)"
        >
          {isLoading ? (
            <>
              <StopCircle className="w-3.5 h-3.5 animate-spin" />
              <span>Cancel</span>
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </>
          )}
        </button>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className={`flex items-center space-x-1 px-2.5 sm:px-3 py-2 rounded-md text-xs font-medium border transition-colors shrink-0 ${
            activeTab.isDirty
              ? 'bg-background-tertiary border-accent text-accent'
              : 'bg-background-secondary border-border text-text-secondary hover:text-text'
          }`}
          title="Save Request (Cmd/Ctrl + S)"
        >
          <Save className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Save</span>
        </button>

        {/* Quick cURL Button */}
        <button
          onClick={handleCopyCurl}
          className="p-2 rounded-md bg-background-secondary border border-border text-text-secondary hover:text-text hover:bg-background-tertiary transition-colors shrink-0"
          title="Copy as cURL"
        >
          {copiedCurl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Subtabs Navigation */}
      <div className="flex items-center px-3 border-b border-border bg-background-secondary/50 text-xs overflow-x-auto no-scrollbar shrink-0">
        <div className="flex space-x-1 shrink-0">
          {/* Params Tab */}
          <button
            onClick={() => setTabSubTab(activeTab.id, 'params')}
            className={`flex items-center space-x-1.5 py-2 px-3 border-b-2 font-medium transition-colors ${
              activeSubTab === 'params'
                ? 'border-accent text-accent'
                : 'border-transparent text-text-secondary hover:text-text'
            }`}
          >
            <span>Params</span>
            {(request.params || []).filter((p) => p.enabled && p.key).length > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            )}
          </button>

          {/* Authorization Tab */}
          <button
            onClick={() => setTabSubTab(activeTab.id, 'auth')}
            className={`flex items-center space-x-1.5 py-2 px-3 border-b-2 font-medium transition-colors ${
              activeSubTab === 'auth'
                ? 'border-accent text-accent'
                : 'border-transparent text-text-secondary hover:text-text'
            }`}
          >
            <span>Authorization</span>
            {request.auth?.type && request.auth.type !== 'none' && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            )}
          </button>

          {/* Headers Tab */}
          <button
            onClick={() => setTabSubTab(activeTab.id, 'headers')}
            className={`flex items-center space-x-1.5 py-2 px-3 border-b-2 font-medium transition-colors ${
              activeSubTab === 'headers'
                ? 'border-accent text-accent'
                : 'border-transparent text-text-secondary hover:text-text'
            }`}
          >
            <span>Headers</span>
            {(request.headers || []).filter((h) => h.enabled && h.key).length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-background-elevated text-text-muted">
                {(request.headers || []).filter((h) => h.enabled && h.key).length}
              </span>
            )}
          </button>

          {/* Body Tab */}
          <button
            onClick={() => setTabSubTab(activeTab.id, 'body')}
            className={`flex items-center space-x-1.5 py-2 px-3 border-b-2 font-medium transition-colors ${
              activeSubTab === 'body'
                ? 'border-accent text-accent'
                : 'border-transparent text-text-secondary hover:text-text'
            }`}
          >
            <span>Body</span>
            {request.body?.type && request.body.type !== 'none' && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-accent/20 text-accent uppercase font-mono">
                {request.body.type === 'raw' ? request.body.rawLanguage : request.body.type}
              </span>
            )}
          </button>

          {/* Scripts (Pre-request) */}
          <button
            onClick={() => setTabSubTab(activeTab.id, 'scripts')}
            className={`flex items-center space-x-1.5 py-2 px-3 border-b-2 font-medium transition-colors ${
              activeSubTab === 'scripts'
                ? 'border-accent text-accent'
                : 'border-transparent text-text-secondary hover:text-text'
            }`}
          >
            <span>Pre-request Script</span>
            {request.preRequestScript && <span className="w-1.5 h-1.5 rounded-full bg-accent" />}
          </button>

          {/* Tests Tab */}
          <button
            onClick={() => setTabSubTab(activeTab.id, 'tests')}
            className={`flex items-center space-x-1.5 py-2 px-3 border-b-2 font-medium transition-colors ${
              activeSubTab === 'tests'
                ? 'border-accent text-accent'
                : 'border-transparent text-text-secondary hover:text-text'
            }`}
          >
            <span>Tests</span>
            {request.testScript && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Subtab Content Panels */}
      <div className="flex-1 p-3 overflow-y-auto">
        {/* 1. Params Tab */}
        {activeSubTab === 'params' && (
          <div className="flex flex-col space-y-2">
            <div className="text-xs text-text-muted mb-1">
              Query parameters are appended to the URL automatically.
            </div>
            <KeyValueTable
              items={request.params || []}
              onChange={handleParamsChange}
              keyPlaceholder="Parameter"
              valuePlaceholder="Value"
              title="Query Parameters"
            />
          </div>
        )}

        {/* 2. Authorization Tab */}
        {activeSubTab === 'auth' && (
          <div className="flex flex-col space-y-4 max-w-2xl">
            <div className="flex items-center space-x-3">
              <label className="text-xs font-medium text-text-secondary w-28">Type:</label>
              <select
                value={request.auth?.type || 'none'}
                onChange={(e) =>
                  updateTabRequest(activeTab.id, {
                    auth: { ...request.auth, type: e.target.value as AuthType },
                  })
                }
                className="bg-background-secondary border border-border rounded-md px-3 py-1.5 text-xs text-text focus:border-accent focus:outline-none"
              >
                <option value="none">No Auth</option>
                <option value="bearer">Bearer Token</option>
                <option value="basic">Basic Auth</option>
                <option value="apikey">API Key</option>
                <option value="oauth2">OAuth 2.0 (Bearer)</option>
              </select>
            </div>

            {/* Bearer Token */}
            {request.auth?.type === 'bearer' && (
              <div className="p-3 bg-background-secondary border border-border rounded-md space-y-3">
                <div className="text-xs text-text-muted">
                  The token will be sent in the <code>Authorization: Bearer &lt;token&gt;</code> header.
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-xs text-text-secondary">Token (supports {'{{token}}'}):</label>
                  <input
                    type="password"
                    value={request.auth.bearer?.token || ''}
                    onChange={(e) =>
                      updateTabRequest(activeTab.id, {
                        auth: { ...request.auth, bearer: { token: e.target.value } },
                      })
                    }
                    placeholder="eyJhbGciOi..."
                    className="w-full bg-background border border-border rounded px-3 py-1.5 text-xs font-mono text-text focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
            )}

            {/* Basic Auth */}
            {request.auth?.type === 'basic' && (
              <div className="p-3 bg-background-secondary border border-border rounded-md space-y-3">
                <div className="text-xs text-text-muted">
                  Credentials are Base64 encoded into <code>Authorization: Basic ...</code>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col space-y-1">
                    <label className="text-xs text-text-secondary">Username:</label>
                    <input
                      type="text"
                      value={request.auth.basic?.username || ''}
                      onChange={(e) =>
                        updateTabRequest(activeTab.id, {
                          auth: {
                            ...request.auth,
                            basic: { username: e.target.value, password: request.auth?.basic?.password || '' },
                          },
                        })
                      }
                      placeholder="user"
                      className="bg-background border border-border rounded px-3 py-1.5 text-xs text-text focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-xs text-text-secondary">Password:</label>
                    <input
                      type="password"
                      value={request.auth.basic?.password || ''}
                      onChange={(e) =>
                        updateTabRequest(activeTab.id, {
                          auth: {
                            ...request.auth,
                            basic: { username: request.auth?.basic?.username || '', password: e.target.value },
                          },
                        })
                      }
                      placeholder="password"
                      className="bg-background border border-border rounded px-3 py-1.5 text-xs text-text focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* API Key */}
            {request.auth?.type === 'apikey' && (
              <div className="p-3 bg-background-secondary border border-border rounded-md space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col space-y-1">
                    <label className="text-xs text-text-secondary">Key Name:</label>
                    <input
                      type="text"
                      value={request.auth.apiKey?.key || ''}
                      onChange={(e) =>
                        updateTabRequest(activeTab.id, {
                          auth: {
                            ...request.auth,
                            apiKey: {
                              key: e.target.value,
                              value: request.auth?.apiKey?.value || '',
                              addTo: request.auth?.apiKey?.addTo || 'header',
                            },
                          },
                        })
                      }
                      placeholder="X-API-Key"
                      className="bg-background border border-border rounded px-3 py-1.5 text-xs text-text focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-xs text-text-secondary">Value:</label>
                    <input
                      type="text"
                      value={request.auth.apiKey?.value || ''}
                      onChange={(e) =>
                        updateTabRequest(activeTab.id, {
                          auth: {
                            ...request.auth,
                            apiKey: {
                              key: request.auth?.apiKey?.key || '',
                              value: e.target.value,
                              addTo: request.auth?.apiKey?.addTo || 'header',
                            },
                          },
                        })
                      }
                      placeholder="api_key_value"
                      className="bg-background border border-border rounded px-3 py-1.5 text-xs text-text focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-3 pt-1">
                  <label className="text-xs text-text-secondary">Add To:</label>
                  <label className="flex items-center space-x-1.5 text-xs text-text cursor-pointer">
                    <input
                      type="radio"
                      name="apiKeyAddTo"
                      checked={request.auth.apiKey?.addTo !== 'query'}
                      onChange={() =>
                        updateTabRequest(activeTab.id, {
                          auth: {
                            ...request.auth,
                            apiKey: {
                              key: request.auth?.apiKey?.key || '',
                              value: request.auth?.apiKey?.value || '',
                              addTo: 'header',
                            },
                          },
                        })
                      }
                      className="accent-accent"
                    />
                    <span>Header</span>
                  </label>
                  <label className="flex items-center space-x-1.5 text-xs text-text cursor-pointer">
                    <input
                      type="radio"
                      name="apiKeyAddTo"
                      checked={request.auth.apiKey?.addTo === 'query'}
                      onChange={() =>
                        updateTabRequest(activeTab.id, {
                          auth: {
                            ...request.auth,
                            apiKey: {
                              key: request.auth?.apiKey?.key || '',
                              value: request.auth?.apiKey?.value || '',
                              addTo: 'query',
                            },
                          },
                        })
                      }
                      className="accent-accent"
                    />
                    <span>Query Params</span>
                  </label>
                </div>
              </div>
            )}

            {/* OAuth 2.0 */}
            {request.auth?.type === 'oauth2' && (
              <div className="p-3 bg-background-secondary border border-border rounded-md space-y-3">
                <div className="flex flex-col space-y-1">
                  <label className="text-xs text-text-secondary">Access Token:</label>
                  <input
                    type="password"
                    value={request.auth.oauth2?.accessToken || ''}
                    onChange={(e) =>
                      updateTabRequest(activeTab.id, {
                        auth: { ...request.auth, oauth2: { accessToken: e.target.value } },
                      })
                    }
                    placeholder="access_token"
                    className="w-full bg-background border border-border rounded px-3 py-1.5 text-xs font-mono text-text focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. Headers Tab */}
        {activeSubTab === 'headers' && (
          <div className="flex flex-col space-y-2">
            <KeyValueTable
              items={request.headers || []}
              onChange={handleHeadersChange}
              keyPlaceholder="Header"
              valuePlaceholder="Value"
              suggestions={COMMON_HEADERS}
              title="Request Headers"
            />
          </div>
        )}

        {/* 4. Body Tab */}
        {activeSubTab === 'body' && (
          <div className="flex flex-col space-y-3">
            {/* Body Mode Selector */}
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <div className="flex items-center space-x-4 text-xs">
                {(['none', 'form-data', 'x-www-form-urlencoded', 'raw', 'graphql'] as BodyType[]).map((mode) => (
                  <label key={mode} className="flex items-center space-x-1.5 cursor-pointer text-text">
                    <input
                      type="radio"
                      name="bodyMode"
                      checked={(request.body?.type || 'none') === mode}
                      onChange={() =>
                        updateTabRequest(activeTab.id, {
                          body: { ...request.body, type: mode },
                        })
                      }
                      className="accent-accent"
                    />
                    <span className="capitalize">{mode}</span>
                  </label>
                ))}
              </div>

              {/* Raw Language Picker */}
              {request.body?.type === 'raw' && (
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-text-muted">Type:</span>
                  <select
                    value={request.body.rawLanguage || 'json'}
                    onChange={(e) =>
                      updateTabRequest(activeTab.id, {
                        body: { ...request.body, rawLanguage: e.target.value as RawLanguage },
                      })
                    }
                    className="bg-background-secondary border border-border rounded px-2 py-1 text-xs text-text focus:outline-none focus:border-accent"
                  >
                    <option value="json">JSON</option>
                    <option value="xml">XML</option>
                    <option value="html">HTML</option>
                    <option value="text">Text</option>
                    <option value="javascript">JavaScript</option>
                  </select>
                </div>
              )}
            </div>

            {/* Body Sub-renderers */}
            {request.body?.type === 'none' && (
              <div className="py-8 text-center text-xs text-text-muted italic">
                This request does not have a body.
              </div>
            )}

            {request.body?.type === 'raw' && (
              <CodeEditor
                value={request.body.raw || ''}
                onChange={(raw) =>
                  updateTabRequest(activeTab.id, {
                    body: { ...request.body, raw },
                  })
                }
                language={request.body.rawLanguage || 'json'}
                placeholder="Enter raw request body..."
                minHeight="220px"
              />
            )}

            {request.body?.type === 'form-data' && (
              <KeyValueTable
                items={request.body.formData || []}
                onChange={(formData) =>
                  updateTabRequest(activeTab.id, {
                    body: { ...request.body, formData },
                  })
                }
                allowFileUpload={true}
                keyPlaceholder="Key"
                valuePlaceholder="Value / File"
                title="Multipart Form Data"
              />
            )}

            {request.body?.type === 'x-www-form-urlencoded' && (
              <KeyValueTable
                items={request.body.urlEncoded || []}
                onChange={(urlEncoded) =>
                  updateTabRequest(activeTab.id, {
                    body: { ...request.body, urlEncoded },
                  })
                }
                keyPlaceholder="Key"
                valuePlaceholder="Value"
                title="URL-encoded Body"
              />
            )}

            {request.body?.type === 'graphql' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex flex-col space-y-1">
                  <span className="text-xs font-medium text-text-muted">Query:</span>
                  <CodeEditor
                    value={request.body.graphql?.query || ''}
                    onChange={(query) =>
                      updateTabRequest(activeTab.id, {
                        body: {
                          ...request.body,
                          graphql: { query, variables: request.body?.graphql?.variables || '' },
                        },
                      })
                    }
                    language="graphql"
                    placeholder="query { users { id name } }"
                    minHeight="200px"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-xs font-medium text-text-muted">Variables (JSON):</span>
                  <CodeEditor
                    value={request.body.graphql?.variables || ''}
                    onChange={(variables) =>
                      updateTabRequest(activeTab.id, {
                        body: {
                          ...request.body,
                          graphql: { query: request.body?.graphql?.query || '', variables },
                        },
                      })
                    }
                    language="json"
                    placeholder="{}"
                    minHeight="200px"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* 5. Pre-request Script Tab */}
        {activeSubTab === 'scripts' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div className="lg:col-span-2 flex flex-col space-y-2">
              <div className="text-xs text-text-muted">
                Pre-request scripts execute in a JavaScript sandbox before the HTTP request is sent.
              </div>
              <CodeEditor
                value={request.preRequestScript || ''}
                onChange={(preRequestScript) => updateTabRequest(activeTab.id, { preRequestScript })}
                language="javascript"
                placeholder="// JavaScript code executed before request..."
                minHeight="240px"
              />
            </div>

            {/* Snippets Palette */}
            <div className="flex flex-col bg-background-secondary border border-border rounded-md p-3 space-y-2">
              <span className="text-xs font-semibold text-text flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                <span>Pre-request Snippets</span>
              </span>
              <div className="flex flex-col space-y-1 overflow-y-auto">
                {PRE_REQUEST_SNIPPETS.map((snippet) => (
                  <button
                    key={snippet.id}
                    onClick={() => {
                      const current = request.preRequestScript || '';
                      updateTabRequest(activeTab.id, {
                        preRequestScript: current ? `${current}\n${snippet.code}` : snippet.code,
                      });
                    }}
                    className="text-left px-2 py-1.5 rounded hover:bg-background-tertiary text-xs text-text-secondary hover:text-accent transition-colors"
                  >
                    + {snippet.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 6. Tests Tab */}
        {activeSubTab === 'tests' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div className="lg:col-span-2 flex flex-col space-y-2">
              <div className="text-xs text-text-muted">
                Tests evaluate assertions on the response using standard Postman <code>pm.test()</code> syntax.
              </div>
              <CodeEditor
                value={request.testScript || ''}
                onChange={(testScript) => updateTabRequest(activeTab.id, { testScript })}
                language="javascript"
                placeholder="// pm.test('Status is 200', () => { pm.response.to.have.status(200); });"
                minHeight="240px"
              />
            </div>

            {/* Test Snippets Palette */}
            <div className="flex flex-col bg-background-secondary border border-border rounded-md p-3 space-y-2">
              <span className="text-xs font-semibold text-text flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Test Snippets</span>
              </span>
              <div className="flex flex-col space-y-1 overflow-y-auto">
                {TEST_SNIPPETS.map((snippet) => (
                  <button
                    key={snippet.id}
                    onClick={() => {
                      const current = request.testScript || '';
                      updateTabRequest(activeTab.id, {
                        testScript: current ? `${current}\n${snippet.code}` : snippet.code,
                      });
                    }}
                    className="text-left px-2 py-1.5 rounded hover:bg-background-tertiary text-xs text-text-secondary hover:text-emerald-400 transition-colors"
                  >
                    + {snippet.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Save Request Modal */}
      {saveModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-background-elevated border border-border rounded-xl shadow-2xl w-full max-w-md p-5 flex flex-col space-y-4">
            <h3 className="text-sm font-bold text-text">Save Request to Collection</h3>
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs text-text-secondary">Request Name:</label>
              <input
                type="text"
                value={saveReqName}
                onChange={(e) => setSaveReqName(e.target.value)}
                className="bg-background border border-border rounded-md px-3 py-1.5 text-xs text-text focus:outline-none focus:border-accent"
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs text-text-secondary">Save to Collection:</label>
              <select
                value={saveColId}
                onChange={(e) => setSaveColId(e.target.value)}
                className="bg-background border border-border rounded-md px-3 py-1.5 text-xs text-text focus:outline-none focus:border-accent"
              >
                {collections.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setSaveModalOpen(false)}
                className="px-3 py-1.5 text-xs text-text-secondary hover:text-text rounded-md bg-background-tertiary"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSaveModal}
                className="px-4 py-1.5 text-xs font-medium text-white bg-accent hover:bg-accent-hover rounded-md"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
