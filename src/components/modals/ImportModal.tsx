import React, { useState } from 'react';
import { X, UploadCloud, Terminal, FileCode2, Layers, Check, AlertCircle } from 'lucide-react';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { useCollectionStore } from '../../store/useCollectionStore';
import { useEnvironmentStore } from '../../store/useEnvironmentStore';
import {
  importPostmanCollection,
  importPostmanEnvironment,
  importOpenApi,
} from '../../services/importExport';
import { parseCurlCommand } from '../../services/curlParser';

export const ImportModal: React.FC = () => {
  const { isImportModalOpen, closeImportModal, openTab } = useWorkspaceStore();
  const { importCollection } = useCollectionStore();
  const { addEnvironment } = useEnvironmentStore();

  const [activeImportTab, setActiveImportTab] = useState<'postman' | 'openapi' | 'curl' | 'env'>('postman');
  const [importText, setImportText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isImportModalOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        setImportText(text);
      };
      reader.readAsText(file);
    }
  };

  const handleImport = () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!importText.trim()) {
      setErrorMsg('Please paste text or upload a file first.');
      return;
    }

    try {
      if (activeImportTab === 'postman') {
        const col = importPostmanCollection(importText);
        importCollection(col);
        setSuccessMsg(`Successfully imported collection "${col.name}" with ${col.requests.length} requests!`);
        setTimeout(() => closeImportModal(), 1200);
      } else if (activeImportTab === 'openapi') {
        const col = importOpenApi(importText);
        importCollection(col);
        setSuccessMsg(`Successfully imported OpenAPI specification "${col.name}"!`);
        setTimeout(() => closeImportModal(), 1200);
      } else if (activeImportTab === 'curl') {
        const parsed = parseCurlCommand(importText);
        const newReq = openTab({
          id: Math.random().toString(36).substring(2, 9),
          name: parsed.name || 'Imported cURL',
          method: parsed.method || 'GET',
          url: parsed.url || 'https://api.example.com',
          params: parsed.params || [],
          headers: parsed.headers || [],
          body: parsed.body || { type: 'none' },
          auth: parsed.auth || { type: 'none' },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        setSuccessMsg('cURL imported directly into new Request tab!');
        setTimeout(() => closeImportModal(), 1000);
      } else if (activeImportTab === 'env') {
        const env = importPostmanEnvironment(importText);
        useEnvironmentStore.getState().addEnvironment(env.name);
        setSuccessMsg(`Imported environment "${env.name}"!`);
        setTimeout(() => closeImportModal(), 1200);
      }
    } catch (err: any) {
      setErrorMsg(`Import failed: ${err.message || String(err)}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 select-none">
      <div className="bg-background-elevated border border-border rounded-xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-background-secondary">
          <div className="flex items-center space-x-2">
            <UploadCloud className="w-5 h-5 text-accent" />
            <h2 className="text-sm font-bold text-text">Import into Endly</h2>
          </div>
          <button
            onClick={closeImportModal}
            className="p-1 rounded-md text-text-muted hover:text-text hover:bg-background-tertiary"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center px-5 pt-3 border-b border-border bg-background-secondary/40 text-xs">
          <button
            onClick={() => {
              setActiveImportTab('postman');
              setErrorMsg(null);
            }}
            className={`flex items-center space-x-1.5 py-2 px-3 border-b-2 font-medium transition-colors ${
              activeImportTab === 'postman'
                ? 'border-accent text-accent'
                : 'border-transparent text-text-secondary hover:text-text'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Postman Collection (v2.1)</span>
          </button>

          <button
            onClick={() => {
              setActiveImportTab('openapi');
              setErrorMsg(null);
            }}
            className={`flex items-center space-x-1.5 py-2 px-3 border-b-2 font-medium transition-colors ${
              activeImportTab === 'openapi'
                ? 'border-accent text-accent'
                : 'border-transparent text-text-secondary hover:text-text'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>OpenAPI 3.0 / Swagger</span>
          </button>

          <button
            onClick={() => {
              setActiveImportTab('curl');
              setErrorMsg(null);
            }}
            className={`flex items-center space-x-1.5 py-2 px-3 border-b-2 font-medium transition-colors ${
              activeImportTab === 'curl'
                ? 'border-accent text-accent'
                : 'border-transparent text-text-secondary hover:text-text'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Raw cURL Command</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex flex-col space-y-4 text-xs">
          {/* File drop / select */}
          {activeImportTab !== 'curl' && (
            <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-border hover:border-accent rounded-lg cursor-pointer bg-background-secondary/50 transition-colors">
              <UploadCloud className="w-6 h-6 text-accent mb-1.5" />
              <span className="font-semibold text-text">Choose file or drag & drop</span>
              <span className="text-[11px] text-text-muted mt-0.5">
                {activeImportTab === 'postman' && 'Postman collection .json'}
                {activeImportTab === 'openapi' && 'OpenAPI .json or .yaml'}
                {activeImportTab === 'env' && 'Postman environment .json'}
              </span>
              <input type="file" className="hidden" onChange={handleFileUpload} />
            </label>
          )}

          {/* Raw Text / JSON / YAML / cURL Input */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-medium text-text-secondary">
              {activeImportTab === 'curl' ? 'Paste cURL command:' : 'Or paste Raw JSON / YAML:'}
            </label>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder={
                activeImportTab === 'curl'
                  ? 'curl -X POST https://httpbin.org/post -H "Content-Type: application/json" -d \'{"hello":"world"}\''
                  : '{\n  "info": {\n    "name": "My API Collection"\n  } ...\n}'
              }
              rows={8}
              className="w-full p-3 font-mono text-xs bg-background border border-border rounded-lg text-text focus:outline-none focus:border-accent resize-none"
            />
          </div>

          {/* Feedback messages */}
          {errorMsg && (
            <div className="flex items-center space-x-2 p-2.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center space-x-2 p-2.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Bottom Actions */}
          <div className="flex justify-end space-x-2 pt-2 border-t border-border">
            <button
              onClick={closeImportModal}
              className="px-4 py-2 rounded-md text-xs text-text-secondary hover:text-text bg-background-tertiary"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              className="px-5 py-2 rounded-md text-xs font-semibold text-white bg-accent hover:bg-accent-hover shadow-md shadow-orange-500/20"
            >
              Import
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
