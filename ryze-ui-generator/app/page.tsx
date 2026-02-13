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

  // Load API key
  useEffect(() => {
    const stored = localStorage.getItem('openai_api_key');
    if (stored) {
      setApiKey(stored);
      setShowApiKeyInput(false);
    }
    if (typeof window !== "undefined") {
    (window as any).__RYZE_LIB__ = ComponentLibrary;
  }
  }, []);

  const handleSendMessage = async (message: string) => {
    if (!apiKey) {
      alert('Enter your OpenAI API key to get started');
      return;
    }

    const userMessage: Message = { role: 'user', content: message };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

      const explanation = `✅ **Generated Successfully**

Layout: ${result.explanation.layoutRationale}

Components: ${result.explanation.componentChoices}

Decisions:
${result.explanation.decisions
  .map((d: string, i: number) => `${i + 1}. ${d}`)
  .join('\n')}`;

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: explanation },
      ]);

      setCurrentCode(result.code.code);
      setCurrentExplanation(explanation);

      setVersions((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          timestamp: Date.now(),
          code: result.code.code,
          userIntent: message,
          explanation,
        },
      ]);
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `❌ ${error.message}` },
      ]);
    } finally {
      setIsLoading(false);
    }
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
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUser) handleSendMessage(lastUser.content);
  };

  if (showApiKeyInput) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <input
          type="password"
          placeholder="OpenAI API Key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="border p-2"
        />
        <button
          onClick={() => {
            localStorage.setItem('openai_api_key', apiKey);
            setShowApiKeyInput(false);
          }}
        >
          Continue
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b px-6 py-3 flex justify-between">
        <h1 className="font-bold">Ryze UI Generator</h1>
        <div className="flex gap-2">
          <button onClick={handleRegenerate}>
            <RotateCcw size={16} />
          </button>
          <button onClick={handleDownload}>
            <Download size={16} />
          </button>
        </div>
      </header>

      {/* Layout */}
      <div className="flex-1 flex overflow-hidden">
        <div className="w-96 border-r">
          <ChatPanel
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
        </div>

        <div className="flex-1 border-r">
          <CodeEditor code={currentCode} onChange={setCurrentCode} />
        </div>

        {/* FINAL FIX HERE */}
        <div className="flex-1">
          <LivePreview
            code={currentCode}   // ✅ FIXED
            componentLibrary={ComponentLibrary}
          />
        </div>
      </div>
    </div>
  );
}
