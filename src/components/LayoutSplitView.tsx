'use client';

import { useState } from 'react';
import { MessageSquare, Eye } from 'lucide-react';

export default function LayoutSplitView({ left, right, children }: any) {
  const [activeTab, setActiveTab] = useState<'chat' | 'preview'>('chat');

  return (
    <div className="h-screen flex flex-col">
      {/* ✅ Mobile: Tabs para alternar entre Chat e Preview */}
      <div className="lg:hidden flex border-b border-gray-200 bg-white">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 px-4 py-3 flex items-center justify-center space-x-2 transition-colors ${
            activeTab === 'chat'
              ? 'bg-blue-500 text-white border-b-2 border-blue-600'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="font-medium">Chat</span>
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`flex-1 px-4 py-3 flex items-center justify-center space-x-2 transition-colors ${
            activeTab === 'preview'
              ? 'bg-blue-500 text-white border-b-2 border-blue-600'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Eye className="w-5 h-5" />
          <span className="font-medium">Preview</span>
        </button>
      </div>

      {/* ✅ Desktop: Grid lado a lado | Mobile: Mostrar apenas aba ativa */}
      <div className="lg:grid lg:grid-cols-2 flex-1 overflow-hidden">
        <div className={`border-r border-gray-200 bg-white relative overflow-auto ${
          activeTab === 'chat' ? 'block' : 'hidden'
        } lg:block`}>
          {left}
        </div>
        <div className={`bg-gray-50 overflow-auto ${
          activeTab === 'preview' ? 'block' : 'hidden'
        } lg:block`}>
          {right}
        </div>
      </div>
      {children}
    </div>
  );
}

