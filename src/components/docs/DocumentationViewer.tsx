import React, { useState } from 'react';
import { X, BookOpen, ExternalLink, Play, Search, Layers, ChevronRight } from 'lucide-react';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { useCollectionStore } from '../../store/useCollectionStore';
import { CollectionItem, RequestItem, HttpRequestMethod } from '../../types';

const METHOD_COLORS: Record<HttpRequestMethod, { text: string; bg: string }> = {
  GET: { text: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  POST: { text: 'text-amber-400', bg: 'bg-amber-500/10' },
  PUT: { text: 'text-blue-400', bg: 'bg-blue-500/10' },
  PATCH: { text: 'text-purple-400', bg: 'bg-purple-500/10' },
  DELETE: { text: 'text-rose-400', bg: 'bg-rose-500/10' },
  HEAD: { text: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  OPTIONS: { text: 'text-pink-400', bg: 'bg-pink-500/10' },
};

export const DocumentationViewer: React.FC = () => {
  const { isDocsModalOpen, closeDocsModal, selectedCollectionForDocs, openTab } = useWorkspaceStore();
  const { collections } = useCollectionStore();

  const [selectedColId, setSelectedColId] = useState<string>(
    selectedCollectionForDocs || collections[0]?.id || ''
  );
  const [searchDoc, setSearchDoc] = useState('');

  if (!isDocsModalOpen) return null;

  const collection = collections.find((c) => c.id === selectedColId) || collections[0];
  const allRequests = collection?.requests || [];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 select-none">
      <div className="bg-background-elevated border border-border rounded-xl shadow-2xl w-full max-w-5xl h-[680px] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-background-secondary">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <h2 className="text-sm font-bold text-text">Interactive API Documentation</h2>
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={selectedColId}
              onChange={(e) => setSelectedColId(e.target.value)}
              className="bg-background border border-border rounded-md px-3 py-1 text-xs text-text focus:outline-none focus:border-accent"
            >
              {collections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <button
              onClick={closeDocsModal}
              className="p-1 rounded-md text-text-muted hover:text-text hover:bg-background-tertiary"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body: Left Sidebar TOC + Right Markdown Documentation */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Table of Contents */}
          <div className="w-64 border-r border-border bg-background-secondary p-3 flex flex-col space-y-2 overflow-y-auto">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-text-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchDoc}
                onChange={(e) => setSearchDoc(e.target.value)}
                placeholder="Search endpoints..."
                className="w-full bg-background border border-border rounded-md pl-8 pr-2 py-1 text-xs text-text placeholder:text-text-muted focus:outline-none"
              />
            </div>

            <div className="flex flex-col space-y-1 pt-2">
              <span className="text-[10px] font-bold uppercase text-text-muted px-2">Endpoints</span>
              {allRequests
                .filter(
                  (r) =>
                    !searchDoc ||
                    r.name.toLowerCase().includes(searchDoc.toLowerCase()) ||
                    r.url.toLowerCase().includes(searchDoc.toLowerCase())
                )
                .map((req) => {
                  const style = METHOD_COLORS[req.method] || METHOD_COLORS.GET;
                  return (
                    <a
                      key={req.id}
                      href={`#doc-req-${req.id}`}
                      className="flex items-center space-x-2 px-2.5 py-1.5 rounded-md hover:bg-background-tertiary text-xs text-text-secondary hover:text-text transition-colors"
                    >
                      <span className={`text-[9px] font-bold font-mono ${style.text}`}>
                        {req.method}
                      </span>
                      <span className="truncate">{req.name}</span>
                    </a>
                  );
                })}
            </div>
          </div>

          {/* Right Documentation Content */}
          <div className="flex-1 p-6 overflow-y-auto space-y-8 select-text">
            {collection ? (
              <>
                {/* Collection Overview */}
                <div className="border-b border-border pb-5">
                  <h1 className="text-xl font-bold text-text">{collection.name}</h1>
                  <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                    {collection.description || 'API documentation auto-generated with Endly.'}
                  </p>
                </div>

                {/* Requests Documentation */}
                <div className="flex flex-col space-y-8">
                  {allRequests.map((req) => {
                    const style = METHOD_COLORS[req.method] || METHOD_COLORS.GET;

                    return (
                      <div
                        key={req.id}
                        id={`doc-req-${req.id}`}
                        className="p-5 rounded-xl bg-background-secondary border border-border space-y-4 shadow-sm"
                      >
                        {/* Title & Method */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2.5">
                            <span
                              className={`text-xs font-bold px-2 py-0.5 rounded uppercase font-mono ${style.bg} ${style.text}`}
                            >
                              {req.method}
                            </span>
                            <h3 className="text-sm font-bold text-text">{req.name}</h3>
                          </div>

                          <button
                            onClick={() => {
                              openTab(req);
                              closeDocsModal();
                            }}
                            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-accent/15 text-accent hover:bg-accent hover:text-white transition-colors"
                          >
                            <Play className="w-3 h-3" />
                            <span>Try Request</span>
                          </button>
                        </div>

                        {/* URL Bar */}
                        <div className="p-2.5 rounded-lg bg-background border border-border font-mono text-xs text-text">
                          {req.url}
                        </div>

                        {req.description && (
                          <p className="text-xs text-text-secondary">{req.description}</p>
                        )}

                        {/* Query Parameters */}
                        {req.params && req.params.length > 0 && (
                          <div className="space-y-1.5">
                            <h4 className="text-xs font-semibold text-text uppercase tracking-wider">
                              Query Parameters
                            </h4>
                            <div className="border border-border rounded-lg overflow-hidden bg-background">
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="bg-background-tertiary border-b border-border text-text-muted text-[11px]">
                                    <th className="py-1.5 px-3 text-left">Key</th>
                                    <th className="py-1.5 px-3 text-left">Default Value</th>
                                    <th className="py-1.5 px-3 text-left">Description</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {req.params.map((p) => (
                                    <tr key={p.id} className="border-b border-border/40">
                                      <td className="py-1.5 px-3 font-mono font-semibold text-text">
                                        {p.key}
                                      </td>
                                      <td className="py-1.5 px-3 font-mono text-text-secondary">
                                        {p.value || '-'}
                                      </td>
                                      <td className="py-1.5 px-3 text-text-muted">
                                        {p.description || '-'}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* Request Body */}
                        {req.body && req.body.type === 'raw' && req.body.raw && (
                          <div className="space-y-1.5">
                            <h4 className="text-xs font-semibold text-text uppercase tracking-wider">
                              Request Body ({req.body.rawLanguage || 'json'})
                            </h4>
                            <pre className="p-3 rounded-lg bg-background border border-border font-mono text-xs text-text overflow-x-auto leading-relaxed">
                              {req.body.raw}
                            </pre>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
