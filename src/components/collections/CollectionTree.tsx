import React, { useState } from 'react';
import {
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Plus,
  MoreVertical,
  Play,
  BookOpen,
  Download,
  Trash2,
  Edit2,
  Copy,
  FolderPlus,
  FilePlus,
} from 'lucide-react';
import { useCollectionStore } from '../../store/useCollectionStore';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { CollectionItem, FolderItem, RequestItem, HttpRequestMethod } from '../../types';
import { exportToPostmanCollection } from '../../services/importExport';

const METHOD_COLORS: Record<HttpRequestMethod, { text: string }> = {
  GET: { text: 'text-emerald-400' },
  POST: { text: 'text-amber-400' },
  PUT: { text: 'text-blue-400' },
  PATCH: { text: 'text-purple-400' },
  DELETE: { text: 'text-rose-400' },
  HEAD: { text: 'text-cyan-400' },
  OPTIONS: { text: 'text-pink-400' },
};

interface CollectionTreeProps {
  searchFilter?: string;
}

export const CollectionTree: React.FC<CollectionTreeProps> = ({ searchFilter = '' }) => {
  const {
    collections,
    deleteCollection,
    updateCollection,
    addFolder,
    updateFolder,
    deleteFolder,
    addRequest,
    deleteRequest,
    duplicateRequest,
  } = useCollectionStore();

  const { openTab, openRunnerModal, openDocsModal, activeTabId, tabs } = useWorkspaceStore();

  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    'col-sample-1': true,
    'col-sample-2': true,
    'f-methods': true,
    'f-auth': true,
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const toggleExpand = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedFolders((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const startRename = (id: string, currentName: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingId(id);
    setEditingName(currentName);
    setActiveMenuId(null);
  };

  const saveRename = (type: 'collection' | 'folder' | 'request', id: string) => {
    if (editingName.trim()) {
      if (type === 'collection') updateCollection(id, { name: editingName.trim() });
      else if (type === 'folder') updateFolder(id, { name: editingName.trim() });
    }
    setEditingId(null);
  };

  const handleExport = (collection: CollectionItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const jsonStr = exportToPostmanCollection(collection);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${collection.name.replace(/\s+/g, '_')}_collection.json`;
    a.click();
    URL.revokeObjectURL(url);
    setActiveMenuId(null);
  };

  const handleAddRequest = (collectionId: string, folderId: string | null = null, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const req = addRequest(collectionId, folderId, { name: 'New Request', method: 'GET' });
    openTab(req);
    // Expand parent folder/collection
    setExpandedFolders((prev) => ({ ...prev, [collectionId]: true, ...(folderId ? { [folderId]: true } : {}) }));
    setActiveMenuId(null);
  };

  const handleAddFolder = (collectionId: string, parentId: string | null = null, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    addFolder(collectionId, 'New Folder', parentId);
    setExpandedFolders((prev) => ({ ...prev, [collectionId]: true, ...(parentId ? { [parentId]: true } : {}) }));
    setActiveMenuId(null);
  };

  // Check if active tab request matches
  const activeReqId = tabs.find((t) => t.id === activeTabId)?.requestId;

  // Render Requests
  const renderRequestItem = (req: RequestItem, depth = 1) => {
    const isEditing = editingId === req.id;
    const isSelected = activeReqId === req.id;
    const methodStyle = METHOD_COLORS[req.method] || METHOD_COLORS.GET;

    // Filter check
    if (
      searchFilter &&
      !req.name.toLowerCase().includes(searchFilter.toLowerCase()) &&
      !req.url.toLowerCase().includes(searchFilter.toLowerCase())
    ) {
      return null;
    }

    return (
      <div
        key={req.id}
        onClick={() => openTab(req)}
        style={{ paddingLeft: `${depth * 14 + 10}px` }}
        className={`group flex items-center justify-between py-1 pr-2 rounded cursor-pointer transition-colors text-xs ${
          isSelected
            ? 'bg-accent/15 text-accent font-medium'
            : 'text-text-secondary hover:bg-background-tertiary hover:text-text'
        }`}
      >
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          <span className={`text-[10px] font-bold uppercase font-mono ${methodStyle.text}`}>
            {req.method}
          </span>
          {isEditing ? (
            <input
              type="text"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onBlur={() => {
                useCollectionStore.getState().updateRequest(req.id, { name: editingName });
                setEditingId(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  useCollectionStore.getState().updateRequest(req.id, { name: editingName });
                  setEditingId(null);
                }
              }}
              className="bg-background border border-accent rounded px-1 text-xs text-text focus:outline-none"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="truncate">{req.name}</span>
          )}
        </div>

        {/* Action icons on hover */}
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              const dup = duplicateRequest(req.id);
              if (dup) openTab(dup);
            }}
            title="Duplicate Request"
            className="p-1 hover:text-text rounded"
          >
            <Copy className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => startRename(req.id, req.name, e)}
            title="Rename"
            className="p-1 hover:text-text rounded"
          >
            <Edit2 className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteRequest(req.id);
            }}
            title="Delete Request"
            className="p-1 hover:text-red-400 rounded"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  };

  // Render Folders
  const renderFolderItem = (folder: FolderItem, collection: CollectionItem, depth = 1) => {
    const isExpanded = expandedFolders[folder.id];
    const isEditing = editingId === folder.id;
    const subFolders = (collection.folders || []).filter((f) => f.parentId === folder.id);
    const folderRequests = (collection.requests || []).filter((r) => r.folderId === folder.id);

    return (
      <div key={folder.id} className="flex flex-col">
        <div
          onClick={(e) => toggleExpand(folder.id, e)}
          style={{ paddingLeft: `${depth * 14 + 6}px` }}
          className="group flex items-center justify-between py-1 pr-2 rounded hover:bg-background-tertiary cursor-pointer text-xs text-text-secondary hover:text-text transition-colors"
        >
          <div className="flex items-center space-x-1.5 min-w-0 flex-1">
            <span className="text-text-muted">
              {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </span>
            {isExpanded ? (
              <FolderOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            ) : (
              <Folder className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            )}
            {isEditing ? (
              <input
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onBlur={() => saveRename('folder', folder.id)}
                onKeyDown={(e) => e.key === 'Enter' && saveRename('folder', folder.id)}
                className="bg-background border border-accent rounded px-1 text-xs text-text focus:outline-none"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="truncate font-medium">{folder.name}</span>
            )}
          </div>

          <div className="flex items-center space-x-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => handleAddRequest(collection.id, folder.id, e)}
              title="Add Request inside folder"
              className="p-1 hover:text-accent rounded"
            >
              <Plus className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => startRename(folder.id, folder.name, e)}
              title="Rename Folder"
              className="p-1 hover:text-text rounded"
            >
              <Edit2 className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteFolder(folder.id);
              }}
              title="Delete Folder"
              className="p-1 hover:text-red-400 rounded"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="flex flex-col">
            {subFolders.map((sub) => renderFolderItem(sub, collection, depth + 1))}
            {folderRequests.map((req) => renderRequestItem(req, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col space-y-1 p-2">
      {collections.map((col) => {
        const isExpanded = expandedFolders[col.id];
        const isEditing = editingId === col.id;
        const rootFolders = (col.folders || []).filter((f) => !f.parentId);
        const rootRequests = (col.requests || []).filter((r) => !r.folderId);

        return (
          <div key={col.id} className="flex flex-col select-none">
            {/* Collection Header */}
            <div
              onClick={(e) => toggleExpand(col.id, e)}
              className="group flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-background-tertiary cursor-pointer text-xs font-semibold text-text transition-colors relative"
            >
              <div className="flex items-center space-x-1.5 min-w-0 flex-1">
                <span className="text-text-muted">
                  {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </span>
                {isEditing ? (
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={() => saveRename('collection', col.id)}
                    onKeyDown={(e) => e.key === 'Enter' && saveRename('collection', col.id)}
                    className="bg-background border border-accent rounded px-1.5 text-xs text-text focus:outline-none"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span className="truncate text-text font-medium">{col.name}</span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openRunnerModal(col.id);
                  }}
                  title="Run Collection"
                  className="p-1 hover:text-emerald-400 rounded"
                >
                  <Play className="w-3 h-3" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openDocsModal(col.id);
                  }}
                  title="View Collection Docs"
                  className="p-1 hover:text-blue-400 rounded"
                >
                  <BookOpen className="w-3 h-3" />
                </button>

                <button
                  onClick={(e) => handleAddRequest(col.id, null, e)}
                  title="Add Request"
                  className="p-1 hover:text-accent rounded"
                >
                  <Plus className="w-3 h-3" />
                </button>

                {/* More dropdown */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuId(activeMenuId === col.id ? null : col.id);
                    }}
                    className="p-1 hover:text-text rounded"
                  >
                    <MoreVertical className="w-3 h-3" />
                  </button>

                  {activeMenuId === col.id && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 top-full mt-1 w-44 py-1 bg-background-elevated border border-border rounded-lg shadow-2xl z-50 text-xs font-normal"
                    >
                      <button
                        onClick={(e) => handleAddRequest(col.id, null, e)}
                        className="w-full text-left px-3 py-1.5 hover:bg-background-tertiary flex items-center space-x-2 text-text"
                      >
                        <FilePlus className="w-3.5 h-3.5 text-accent" />
                        <span>Add Request</span>
                      </button>
                      <button
                        onClick={(e) => handleAddFolder(col.id, null, e)}
                        className="w-full text-left px-3 py-1.5 hover:bg-background-tertiary flex items-center space-x-2 text-text"
                      >
                        <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
                        <span>Add Folder</span>
                      </button>
                      <button
                        onClick={(e) => startRename(col.id, col.name, e)}
                        className="w-full text-left px-3 py-1.5 hover:bg-background-tertiary flex items-center space-x-2 text-text"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Rename</span>
                      </button>
                      <button
                        onClick={(e) => handleExport(col, e)}
                        className="w-full text-left px-3 py-1.5 hover:bg-background-tertiary flex items-center space-x-2 text-text"
                      >
                        <Download className="w-3.5 h-3.5 text-blue-400" />
                        <span>Export (Postman v2.1)</span>
                      </button>
                      <div className="h-px bg-border my-1" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteCollection(col.id);
                          setActiveMenuId(null);
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-background-tertiary flex items-center space-x-2 text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Collection</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Collection Items */}
            {isExpanded && (
              <div className="flex flex-col mt-0.5">
                {rootFolders.map((f) => renderFolderItem(f, col, 1))}
                {rootRequests.map((r) => renderRequestItem(r, 1))}
                {rootFolders.length === 0 && rootRequests.length === 0 && (
                  <div className="py-2 pl-6 text-text-muted text-[11px] italic">
                    Empty collection. Click + to add request.
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
