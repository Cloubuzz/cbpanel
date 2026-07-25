import React, { RefObject } from 'react';
import { Search, Info, ArrowLeft, Smile, Paperclip, Send, Mic, Check, CheckCheck, Star } from 'lucide-react';
import type { ChatSession } from '../types';

interface Props {
  chat: ChatSession;
  selectedId: string | null;
  inputText: string;
  scrollRef: RefObject<HTMLDivElement>;
  showProfile: boolean;
  onBack: () => void;
  onInputChange: (text: string) => void;
  onSend: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onToggleProfile: () => void;
}

export const ChatWindow: React.FC<Props> = ({ chat, selectedId, inputText, scrollRef, showProfile, onBack, onInputChange, onSend, onKeyDown, onToggleProfile }) => (
  <div className={`flex-1 flex flex-col relative transition-all duration-300 ${selectedId ? 'flex' : 'hidden md:flex'}`}>
    <div className="h-16 px-4 py-2 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-10">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="md:hidden text-slate-500"><ArrowLeft size={20} /></button>
        <img src={chat.user.avatar} className="w-10 h-10 rounded-full object-cover cursor-pointer" onClick={onToggleProfile} alt={chat.user.name} />
        <div className="cursor-pointer" onClick={onToggleProfile}>
          <h3 className="font-bold text-slate-900 dark:text-white leading-tight">{chat.user.name}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {chat.user.status === 'online' ? 'Online' : chat.user.status === 'typing' ? 'Typing...' : `Last seen ${chat.user.lastSeen}`}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
        <button className="hover:text-teal-600 transition-colors"><Search size={20} /></button>
        <button onClick={onToggleProfile} className={`transition-colors ${showProfile ? 'text-teal-600' : 'hover:text-teal-600'}`}><Info size={20} /></button>
      </div>
    </div>

    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#e5ddd5]/50 dark:bg-black/40 space-y-4 relative" ref={scrollRef}>
      <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.03] bg-repeat pointer-events-none" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundSize: '400px' }} />
      {chat.messages.map(msg => {
        const isMe = msg.sender === 'me';
        return (
          <div key={msg.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} relative z-10 group`}>
            <div className={`max-w-[80%] md:max-w-[60%] rounded-lg px-3 py-2 shadow-sm text-sm relative ${isMe ? 'bg-teal-500 text-white rounded-tr-none' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none'}`}>
              {msg.type === 'template' && (
                <div className="text-[10px] uppercase font-bold opacity-70 mb-1 flex items-center gap-1">
                  <Star size={10} fill="currentColor" /> Automated Template
                </div>
              )}
              <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${isMe ? 'text-teal-100' : 'text-slate-400'}`}>
                <span>{msg.timestamp}</span>
                {isMe && (
                  <span>
                    {msg.status === 'sent' && <Check size={14} />}
                    {msg.status === 'delivered' && <CheckCheck size={14} />}
                    {msg.status === 'read' && <CheckCheck size={14} className="text-blue-200" />}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>

    <div className="min-h-[70px] bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 py-3 flex items-end gap-3 z-10">
      <button className="p-2 text-slate-500 hover:text-teal-600 transition-colors mb-1"><Smile size={24} /></button>
      <button className="p-2 text-slate-500 hover:text-teal-600 transition-colors mb-1"><Paperclip size={24} /></button>
      <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 min-h-[45px] flex items-center px-4 py-2 shadow-sm focus-within:ring-2 focus-within:ring-teal-500/50 transition-all">
        <textarea
          value={inputText}
          onChange={e => onInputChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Type a message..."
          className="w-full bg-transparent border-none focus:ring-0 resize-none h-[24px] max-h-[100px] text-slate-800 dark:text-white placeholder:text-slate-400 text-sm scrollbar-hide"
          style={{ height: Math.max(24, Math.min(100, inputText.split('\n').length * 24)) + 'px' }}
        />
      </div>
      {inputText.trim() ? (
        <button onClick={onSend} className="p-3 bg-teal-600 text-white rounded-full hover:bg-teal-500 shadow-lg transition-all active:scale-95 mb-1">
          <Send size={20} className="ml-0.5" />
        </button>
      ) : (
        <button className="p-3 bg-slate-200 dark:bg-slate-800 text-slate-500 rounded-full hover:bg-teal-500 hover:text-white transition-all mb-1">
          <Mic size={20} />
        </button>
      )}
    </div>
  </div>
);
