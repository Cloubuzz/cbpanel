import React from 'react';
import { Search, MoreVertical } from 'lucide-react';
import type { ChatSession } from '../types';

interface Props {
  chats: ChatSession[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export const ChatSidebar: React.FC<Props> = ({ chats, selectedId, onSelect }) => (
  <div className={`flex-col border-r border-slate-200 dark:border-teal-900/30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl w-full md:w-80 lg:w-96 flex-shrink-0 z-20 transition-all duration-300 ${selectedId ? 'hidden md:flex' : 'flex'}`}>
    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Inbox</h2>
        {chats.filter(c => c.unreadCount > 0).length > 0 && (
          <span className="px-2 py-0.5 bg-rose-500 text-white text-[10px] font-bold rounded-full">
            {chats.filter(c => c.unreadCount > 0).length} New
          </span>
        )}
      </div>
      <button className="p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"><MoreVertical size={18} /></button>
    </div>

    <div className="p-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input type="text" placeholder="Search or start new chat" className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-1 focus:ring-teal-500 text-slate-700 dark:text-slate-200" />
      </div>
      <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide">
        {['All', 'Unread', 'Groups', 'WhatsApp', 'SMS'].map(f => (
          <button key={f} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs rounded-full hover:bg-teal-50 dark:hover:bg-teal-900/30 hover:text-teal-600 transition-colors whitespace-nowrap border border-slate-200 dark:border-slate-700">{f}</button>
        ))}
      </div>
    </div>

    <div className="flex-1 overflow-y-auto">
      {chats.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-center gap-2 text-slate-400 p-10">
          <Search size={32} className="opacity-50" />
          <p className="text-sm font-medium">No conversations yet.</p>
        </div>
      )}
      {chats.map(chat => (
        <div key={chat.id} onClick={() => onSelect(chat.id)}
          className={`flex items-center gap-3 p-4 border-b border-slate-50 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors relative ${selectedId === chat.id ? 'bg-teal-50 dark:bg-teal-900/10 border-l-4 border-l-teal-500' : 'border-l-4 border-l-transparent'}`}
        >
          <div className="relative">
            <img src={chat.user.avatar} alt={chat.user.name} className="w-12 h-12 rounded-full object-cover" />
            {chat.user.status === 'online' && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-baseline mb-1">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">{chat.user.name}</h3>
              <span className={`text-[10px] ${chat.unreadCount > 0 ? 'text-teal-600 font-bold' : 'text-slate-400'}`}>{chat.timestamp}</span>
            </div>
            <div className="flex justify-between items-center">
              <p className={`text-sm truncate max-w-[180px] ${chat.unreadCount > 0 ? 'text-slate-900 dark:text-white font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                {chat.user.status === 'typing' ? <span className="text-teal-500 italic">typing...</span> : chat.lastMessage}
              </p>
              {chat.unreadCount > 0 && (
                <span className="w-5 h-5 bg-teal-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">{chat.unreadCount}</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);
