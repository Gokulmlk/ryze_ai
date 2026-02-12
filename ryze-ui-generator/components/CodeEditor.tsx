import React from 'react';

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  readOnly?: boolean;
}

export default function CodeEditor({ code, onChange, readOnly = false }: CodeEditorProps) {
  return (
    <div className="h-full flex flex-col bg-gray-900">
      <div className="px-4 py-2 bg-gray-800 border-b border-gray-700">
        <h3 className="text-sm font-semibold text-gray-200">Generated Code</h3>
      </div>
      <div className="flex-1 overflow-auto">
        <textarea
          value={code}
          onChange={(e) => onChange(e.target.value)}
          readOnly={readOnly}
          className="w-full h-full p-4 bg-gray-900 text-gray-100 font-mono text-sm focus:outline-none resize-none"
          style={{ minHeight: '100%' }}
          spellCheck={false}
        />
      </div>
    </div>
  );
}
