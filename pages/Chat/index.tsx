import React, { useState, useEffect, useRef } from 'react';
import { ChatSidebar } from './components/ChatSidebar';
import { ChatWindow } from './components/ChatWindow';
import { ProfilePanel } from './components/ProfilePanel';
import type { ChatSession, Message } from './types';

export const Chat: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [chats, setChats] = useState<ChatSession[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const selectedChat = chats.find(c => c.id === selectedId);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [selectedChat?.messages]);

  const handleSend = () => {
    if (!inputText.trim() || !selectedId) return;
    const msg: Message = { id: Date.now().toString(), text: inputText, sender: 'me', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), status: 'sent', type: 'text' };
    setChats(prev => prev.map(c => c.id === selectedId ? { ...c, messages: [...c.messages, msg], lastMessage: inputText, timestamp: 'Just now' } : c));
    setInputText('');
    setTimeout(() => setChats(prev => prev.map(c => c.id === selectedId ? { ...c, messages: c.messages.map(m => m.id === msg.id ? { ...m, status: 'read' } : m) } : c)), 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-slate-50 dark:bg-slate-950">
      <ChatSidebar chats={chats} selectedId={selectedId} onSelect={setSelectedId} />

      {selectedChat ? (
        <ChatWindow
          chat={selectedChat}
          selectedId={selectedId}
          inputText={inputText}
          scrollRef={scrollRef}
          showProfile={showProfile}
          onBack={() => setSelectedId(null)}
          onInputChange={setInputText}
          onSend={handleSend}
          onKeyDown={handleKeyDown}
          onToggleProfile={() => setShowProfile(p => !p)}
        />
      ) : (
        <div className="flex-1 hidden md:flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 border-b-[6px] border-b-[#25D366]">
          <div className="w-64 h-64 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mb-8">
            <img src="https://cdni.iconscout.com/illustration/premium/thumb/web-chat-illustration-download-in-svg-png-gif-file-formats--online-communication-conversation-messaging-business-pack-illustrations-3560757.png" alt="Select Chat" className="w-48 opacity-80 mix-blend-multiply dark:mix-blend-screen" />
          </div>
          <h2 className="text-3xl font-light text-slate-700 dark:text-slate-200 mb-4">Broadway Pizza Web</h2>
          <p className="text-slate-500 text-center max-w-md">Send and receive messages without keeping your phone online.<br />Use WhatsApp, SMS, and Email from one console.</p>
        </div>
      )}

      {selectedChat && showProfile && (
        <ProfilePanel chat={selectedChat} onClose={() => setShowProfile(false)} />
      )}
    </div>
  );
};
