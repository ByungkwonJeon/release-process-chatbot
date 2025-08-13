import React, { useState, useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import ReleaseDashboard from './components/ReleaseDashboard';
import Sidebar from './components/Sidebar';
import { ChatProvider } from './contexts/ChatContext';
import { ReleaseProvider } from './contexts/ReleaseContext';

function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ChatProvider>
      <ReleaseProvider>
        <div className="flex h-screen bg-gray-50">
          {/* Sidebar */}
          <Sidebar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab}
            isOpen={sidebarOpen}
            setIsOpen={setSidebarOpen}
          />

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center">
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  <h1 className="ml-4 text-xl font-semibold text-gray-900">
                    Release Process Chatbot
                  </h1>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-500">Connected</span>
                  </div>
                </div>
              </div>
            </header>

            {/* Content Area */}
            <main className="flex-1 overflow-hidden">
              {activeTab === 'chat' && <ChatInterface />}
              {activeTab === 'dashboard' && <ReleaseDashboard />}
            </main>
          </div>
        </div>
      </ReleaseProvider>
    </ChatProvider>
  );
}

export default App;
