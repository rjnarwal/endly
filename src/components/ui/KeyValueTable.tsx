import React, { useState } from 'react';
import { KeyValuePair, FormDataItem } from '../../types';
import { Plus, Trash2, Edit3, Table, Upload } from 'lucide-react';

interface KeyValueTableProps {
  items: (KeyValuePair | FormDataItem)[];
  onChange: (items: any[]) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  allowFileUpload?: boolean;
  suggestions?: string[];
  title?: string;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export const KeyValueTable: React.FC<KeyValueTableProps> = ({
  items = [],
  onChange,
  keyPlaceholder = 'Key',
  valuePlaceholder = 'Value',
  allowFileUpload = false,
  suggestions = [],
  title,
}) => {
  const [isBulkEdit, setIsBulkEdit] = useState(false);
  const [bulkText, setBulkText] = useState('');

  const handleToggle = (index: number) => {
    const next = [...items];
    next[index] = { ...next[index], enabled: !next[index].enabled };
    onChange(next);
  };

  const handleUpdate = (index: number, field: string, val: any) => {
    const next = [...items];
    next[index] = { ...next[index], [field]: val };
    onChange(next);
  };

  const handleDelete = (index: number) => {
    const next = items.filter((_, i) => i !== index);
    onChange(next);
  };

  const handleAdd = () => {
    const newItem: any = {
      id: generateId(),
      key: '',
      value: '',
      enabled: true,
      description: '',
    };
    if (allowFileUpload) {
      newItem.type = 'text';
    }
    onChange([...items, newItem]);
  };

  const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const next = [...items];
      next[index] = {
        ...next[index],
        file,
        fileName: file.name,
        value: file.name,
      };
      onChange(next);
    }
  };

  const openBulkEdit = () => {
    const text = items
      .map((item) => {
        const prefix = item.enabled ? '' : '//';
        return `${prefix}${item.key}:${item.value}`;
      })
      .join('\n');
    setBulkText(text);
    setIsBulkEdit(true);
  };

  const saveBulkEdit = () => {
    const lines = bulkText.split('\n');
    const newItems: any[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      let enabled = true;
      let cleanLine = trimmed;
      if (cleanLine.startsWith('//')) {
        enabled = false;
        cleanLine = cleanLine.substring(2).trim();
      }

      const colonIdx = cleanLine.indexOf(':');
      if (colonIdx >= 0) {
        const key = cleanLine.substring(0, colonIdx).trim();
        const value = cleanLine.substring(colonIdx + 1).trim();
        newItems.push({
          id: generateId(),
          key,
          value,
          enabled,
          type: 'text',
        });
      } else if (cleanLine) {
        newItems.push({
          id: generateId(),
          key: cleanLine,
          value: '',
          enabled,
          type: 'text',
        });
      }
    }

    onChange(newItems);
    setIsBulkEdit(false);
  };

  return (
    <div className="flex flex-col w-full text-xs">
      {/* Header controls */}
      <div className="flex items-center justify-between py-1.5 px-1 mb-1 text-text-secondary">
        <span className="font-medium text-text-muted">{title}</span>
        <button
          type="button"
          onClick={isBulkEdit ? saveBulkEdit : openBulkEdit}
          className="flex items-center space-x-1 text-xs text-text-secondary hover:text-accent font-medium px-2 py-0.5 rounded hover:bg-background-secondary transition-colors"
        >
          {isBulkEdit ? <Table className="w-3 h-3" /> : <Edit3 className="w-3 h-3" />}
          <span>{isBulkEdit ? 'Key-Value Edit' : 'Bulk Edit'}</span>
        </button>
      </div>

      {isBulkEdit ? (
        <div className="flex flex-col space-y-2">
          <textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder="key:value&#10;//disabled_key:value"
            className="w-full h-44 p-2.5 font-mono text-xs bg-background-secondary border border-border rounded-md text-text focus:outline-none focus:border-accent"
          />
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsBulkEdit(false)}
              className="px-3 py-1 text-xs text-text-secondary hover:text-text rounded bg-background-tertiary"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveBulkEdit}
              className="px-3 py-1 text-xs text-white bg-accent hover:bg-accent-hover rounded font-medium"
            >
              Apply Changes
            </button>
          </div>
        </div>
      ) : (
        <div className="border border-border rounded-md overflow-hidden bg-background-secondary">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-background-tertiary/70 border-b border-border text-text-muted text-[11px]">
                <th className="w-8 py-1.5 px-2 text-center"></th>
                <th className="py-1.5 px-2.5 text-left font-medium">{keyPlaceholder}</th>
                <th className="py-1.5 px-2.5 text-left font-medium">{valuePlaceholder}</th>
                <th className="py-1.5 px-2.5 text-left font-medium w-1/4">Description</th>
                <th className="w-8 py-1.5 px-2"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => {
                const isFormFile = allowFileUpload && (item as FormDataItem).type === 'file';
                return (
                  <tr
                    key={item.id || idx}
                    className="border-b border-border/40 hover:bg-background-tertiary/30 transition-colors group"
                  >
                    {/* Active Checkbox */}
                    <td className="py-1 px-2 text-center align-middle">
                      <input
                        type="checkbox"
                        checked={item.enabled}
                        onChange={() => handleToggle(idx)}
                        className="rounded border-border bg-background text-accent focus:ring-0 cursor-pointer accent-accent"
                      />
                    </td>

                    {/* Key input with suggestions */}
                    <td className="py-1 px-2">
                      <input
                        type="text"
                        value={item.key}
                        onChange={(e) => handleUpdate(idx, 'key', e.target.value)}
                        placeholder="Key"
                        list={suggestions.length > 0 ? `suggestions-${idx}` : undefined}
                        className={`w-full bg-transparent px-1.5 py-1 rounded text-text placeholder:text-text-muted/60 focus:bg-background focus:outline-none ${
                          !item.enabled ? 'line-through opacity-50' : ''
                        }`}
                      />
                      {suggestions.length > 0 && (
                        <datalist id={`suggestions-${idx}`}>
                          {suggestions.map((s) => (
                            <option key={s} value={s} />
                          ))}
                        </datalist>
                      )}
                    </td>

                    {/* Value or File input */}
                    <td className="py-1 px-2">
                      <div className="flex items-center space-x-1.5">
                        {allowFileUpload && (
                          <select
                            value={(item as FormDataItem).type || 'text'}
                            onChange={(e) => handleUpdate(idx, 'type', e.target.value)}
                            className="bg-background-tertiary border border-border/50 text-[10px] rounded px-1 py-0.5 text-text-secondary focus:outline-none"
                          >
                            <option value="text">Text</option>
                            <option value="file">File</option>
                          </select>
                        )}

                        {isFormFile ? (
                          <label className="flex-1 flex items-center space-x-1.5 px-2 py-1 border border-dashed border-border rounded cursor-pointer hover:border-accent text-text-secondary">
                            <Upload className="w-3 h-3 text-accent" />
                            <span className="truncate text-xs">
                              {(item as FormDataItem).fileName || 'Choose File...'}
                            </span>
                            <input
                              type="file"
                              className="hidden"
                              onChange={(e) => handleFileChange(idx, e)}
                            />
                          </label>
                        ) : (
                          <input
                            type="text"
                            value={item.value}
                            onChange={(e) => handleUpdate(idx, 'value', e.target.value)}
                            placeholder="Value"
                            className={`flex-1 bg-transparent px-1.5 py-1 rounded text-text placeholder:text-text-muted/60 focus:bg-background focus:outline-none ${
                              !item.enabled ? 'line-through opacity-50' : ''
                            }`}
                          />
                        )}
                      </div>
                    </td>

                    {/* Description */}
                    <td className="py-1 px-2">
                      <input
                        type="text"
                        value={item.description || ''}
                        onChange={(e) => handleUpdate(idx, 'description', e.target.value)}
                        placeholder="Description"
                        className="w-full bg-transparent px-1.5 py-1 rounded text-text-secondary placeholder:text-text-muted/40 focus:bg-background focus:outline-none"
                      />
                    </td>

                    {/* Delete action */}
                    <td className="py-1 px-2 text-center align-middle">
                      <button
                        type="button"
                        onClick={() => handleDelete(idx)}
                        title="Remove row"
                        className="opacity-0 group-hover:opacity-100 p-1 text-text-muted hover:text-red-400 rounded transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {/* Add Row Button */}
              <tr>
                <td colSpan={5} className="p-1">
                  <button
                    type="button"
                    onClick={handleAdd}
                    className="flex items-center space-x-1 w-full px-3 py-1.5 text-text-secondary hover:text-accent hover:bg-background-tertiary/50 rounded transition-colors text-xs font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add {keyPlaceholder}</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
