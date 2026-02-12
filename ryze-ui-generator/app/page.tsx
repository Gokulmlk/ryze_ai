'use client';

import React, { useState, useEffect } from 'react';
import ChatPanel from '@/components/ChatPanel';
import CodeEditor from '@/components/CodeEditor';
import LivePreview from '@/components/LivePreview';
import { History, RotateCcw, Download, Settings } from 'lucide-react';
import * as ComponentLibrary from '@/components/ComponentLibrary';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Version {
  id: string;
  timestamp: number;
  code: string;
  userIntent: string;
  explanation: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentCode, setCurrentCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(true);
  const [versions, setVersions] = useState<Version[]>([]);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [currentExplanation, setCurrentExplanation] = useState('');

  // Load API key from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('anthropic_api_key');
    if (stored) {
      setApiKey(stored);
      setShowApiKeyInput(false);
    }

    // Expose Component Library to window for preview
    if (typeof window !== 'undefined') {
      (window as any).ComponentLibrary = ComponentLibrary;
      (window as any).React = React;
    }
  }, []);

  const handleSendMessage = async (message: string) => {
    if (!apiKey) {
      alert('Please enter your Anthropic API key first');
      return;
    }

    const userMessage: Message = { role: 'user', content: message };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Call the server-side API route
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userIntent: message,
          currentCode: currentCode || '',
          apiKey: apiKey,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Generation failed');
      }

      const result = await response.json();

      // Create explanation message
      const explanation = `✅ **Generated Successfully**

**Layout Strategy:** ${result.explanation.layoutRationale}

**Components Used:** ${result.explanation.componentChoices}

**Key Decisions:**
${result.explanation.decisions.map((d: string, i: number) => `${i + 1}. ${d}`).join('\n')}`;

      const assistantMessage: Message = {
        role: 'assistant',
        content: explanation,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setCurrentCode(result.code.code);
      setCurrentExplanation(explanation);

      // Save version
      const version: Version = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        code: result.code.code,
        userIntent: message,
        explanation,
      };
      setVersions((prev) => [...prev, version]);
    } catch (error: any) {
      const errorMessage: Message = {
        role: 'assistant',
        content: `❌ Error: ${error.message}`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveApiKey = () => {
    if (apiKey) {
      localStorage.setItem('anthropic_api_key', apiKey);
      setShowApiKeyInput(false);
    }
  };

  const handleLoadVersion = (version: Version) => {
    setCurrentCode(version.code);
    setCurrentExplanation(version.explanation);
    setShowVersionHistory(false);

    // Add system message
    const message: Message = {
      role: 'assistant',
      content: `🔄 Restored version from ${new Date(version.timestamp).toLocaleString()}`,
    };
    setMessages((prev) => [...prev, message]);
  };

  const handleDownload = () => {
    const blob = new Blob([currentCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated-ui.tsx';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRegenerate = () => {
    if (messages.length > 0) {
      const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
      if (lastUserMessage) {
        handleSendMessage(lastUserMessage.content);
      }
    }
  };

  if (showApiKeyInput) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Ryze UI Generator</h1>
          <p className="text-gray-600 mb-6">
            Enter your Anthropic API key to get started
          </p>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-ant-..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          />
          <button
            onClick={handleSaveApiKey}
            disabled={!apiKey}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Continue
          </button>
          <p className="text-xs text-gray-500 mt-4">
            Your API key is stored locally and never sent to our servers
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Ryze UI Generator</h1>
            <p className="text-sm text-gray-600">AI-powered deterministic UI builder</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRegenerate}
              disabled={!currentCode || isLoading}
              className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <RotateCcw size={16} />
              Regenerate
            </button>
            <button
              onClick={() => setShowVersionHistory(!showVersionHistory)}
              className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <History size={16} />
              History ({versions.length})
            </button>
            <button
              onClick={handleDownload}
              disabled={!currentCode}
              className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Download size={16} />
              Download
            </button>
            <button
              onClick={() => setShowApiKeyInput(true)}
              className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Settings size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Chat Panel */}
        <div className="w-96 border-r border-gray-200">
          <ChatPanel
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
        </div>

        {/* Middle: Code Editor */}
        <div className="flex-1 border-r border-gray-200">
          <CodeEditor code={currentCode} onChange={setCurrentCode} />
        </div>

        {/* Right: Live Preview */}
        <div className="flex-1">
          <LivePreview code={currentCode} />
        </div>
      </div>

      {/* Version History Modal */}
      {showVersionHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Version History</h2>
              <button
                onClick={() => setShowVersionHistory(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {versions.length === 0 ? (
                <p className="text-gray-500 text-center">No versions yet</p>
              ) : (
                <div className="space-y-4">
                  {[...versions].reverse().map((version) => (
                    <div
                      key={version.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 cursor-pointer transition-colors"
                      onClick={() => handleLoadVersion(version)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-medium text-gray-900">{version.userIntent}</p>
                        <span className="text-xs text-gray-500">
                          {new Date(version.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {version.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
