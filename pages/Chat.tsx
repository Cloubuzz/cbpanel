import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  MoreVertical, 
  Phone, 
  Paperclip, 
  Smile, 
  Mic, 
  Send, 
  Check, 
  CheckCheck,
  Info,
  X,
  Tag,
  ShoppingBag,
  Star,
  ArrowLeft
} from 'lucide-react';

// --- Types ---
interface Message {
  id: string;
  text: string;
  sender: 'me' | 'them';
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  type: 'text' | 'image' | 'template';
}

interface User {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'typing';
  lastSeen?: string;
  email?: string;
  phone?: string;
  location?: string;
  ltv?: number;
  tags?: string[];
  lastOrder?: {
    id: string;
    date: string;
    amount: number;
    status: string;
  };
}

interface ChatSession {
  id: string;
  user: User;
  lastMessage: string;
  unreadCount: number;
  timestamp: string; // ISO or relative
  messages: Message[];
  channel: 'whatsapp' | 'sms' | 'email';
}

// --- Mock Data ---
const mockChats: ChatSession[] = [
  {
    id: '1',
    user: {
      id: 'u1',
      name: 'Alice Freeman',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      status: 'online',
      email: 'alice.f@example.com',
      phone: '+1 (555) 123-4567',
      location: 'New York, USA',
      ltv: 1250.00,
      tags: ['VIP', 'Repeat Buyer'],
      lastOrder: { id: '#ORD-4821', date: '2 days ago', amount: 124.50, status: 'Shipped' }
    },
    lastMessage: 'Is the summer sale still on?',
    unreadCount: 2,
    timestamp: '10:42 AM',
    channel: 'whatsapp',
    messages: [
      { id: 'm1', text: 'Hi Alice! Thanks for your order.', sender: 'me', timestamp: 'Yesterday', status: 'read', type: 'text' },
      { id: 'm2', text: 'I received the package, but I have a question about the sizing.', sender: 'them', timestamp: '10:30 AM', status: 'read', type: 'text' },
      { id: 'm3', text: 'Is the summer sale still on? I might want to exchange it.', sender: 'them', timestamp: '10:42 AM', status: 'read', type: 'text' }
    ]
  },
  {
    id: '2',
    user: {
      id: 'u2',
      name: 'Marcus Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      status: 'offline',
      lastSeen: '2 hours ago',
      email: 'marcus.c@example.com',
      phone: '+1 (555) 987-6543',
      location: 'San Francisco, CA',
      ltv: 450.00,
      tags: ['New Customer'],
      lastOrder: { id: '#ORD-4901', date: '5 days ago', amount: 89.00, status: 'Delivered' }
    },
    lastMessage: 'Thanks, that helps a lot!',
    unreadCount: 0,
    timestamp: 'Yesterday',
    channel: 'sms',
    messages: [
       { id: 'm1', text: 'Your order #ORD-4901 has been delivered.', sender: 'me', timestamp: '5 days ago', status: 'read', type: 'template' },
       { id: 'm2', text: 'Thanks, that helps a lot!', sender: 'them', timestamp: 'Yesterday', status: 'read', type: 'text' }
    ]
  },
  {
    id: '3',
    user: {
      id: 'u3',
      name: 'Sarah Jones',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
      status: 'typing',
      email: 's.jones@design.co',
      ltv: 0,
      tags: ['Lead'],
      location: 'London, UK'
    },
    lastMessage: 'typing...',
    unreadCount: 0,
    timestamp: 'Just now',
    channel: 'whatsapp',
    messages: [
      { id: 'm1', text: 'Hello! I saw your ad on Instagram.', sender: 'them', timestamp: '1 min ago', status: 'read', type: 'text' }
    ]
  }
];

export const Chat: React.FC = () => {
  const [selectedChatId, setSelectedChatId] = useState<string | null>('1');
  const [inputText, setInputText] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [activeChats, setActiveChats] = useState(mockChats);
  const scrollRef = useRef<HTMLDivElement>(null);

  const selectedChat = activeChats.find(c => c.id === selectedChatId);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedChat?.messages]);

  const handleSendMessage = () => {
    if (!inputText.trim() || !selectedChatId) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'me',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
      type: 'text'
    };

    setActiveChats(prev => prev.map(chat => {
      if (chat.id === selectedChatId) {
        return {
          ...chat,
          messages: [...chat.messages, newMessage],
          lastMessage: inputText,
          timestamp: 'Just now'
        };
      }
      return chat;
    }));

    setInputText('');
    
    // Simulate read status after delay
    setTimeout(() => {
        setActiveChats(prev => prev.map(chat => {
            if (chat.id === selectedChatId) {
                return {
                    ...chat,
                    messages: chat.messages.map(m => m.id === newMessage.id ? { ...m, status: 'read' } : m)
                };
            }
            return chat;
        }));
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-slate-50 dark:bg-slate-950">
      
      {/* 1. Sidebar List */}
      <div className={`
        flex-col border-r border-slate-200 dark:border-teal-900/30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl w-full md:w-80 lg:w-96 flex-shrink-0 z-20 transition-all duration-300
        ${selectedChatId ? 'hidden md:flex' : 'flex'}
      `}>
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
             <h2 className="text-xl font-bold text-slate-900 dark:text-white">Inbox</h2>
             <span className="px-2 py-0.5 bg-rose-500 text-white text-[10px] font-bold rounded-full">3 New</span>
          </div>
          <div className="flex gap-2">
            <button className="p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"><MoreVertical size={18}/></button>
          </div>
        </div>

        {/* Search */}
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search or start new chat"
              className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-1 focus:ring-teal-500 text-slate-700 dark:text-slate-200"
            />
          </div>
          {/* Filters */}
          <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide">
            {['All', 'Unread', 'Groups', 'WhatsApp', 'SMS'].map(f => (
              <button key={f} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs rounded-full hover:bg-teal-50 dark:hover:bg-teal-900/30 hover:text-teal-600 transition-colors whitespace-nowrap border border-slate-200 dark:border-slate-700">
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {activeChats.map(chat => (
            <div 
              key={chat.id}
              onClick={() => setSelectedChatId(chat.id)}
              className={`
                flex items-center gap-3 p-4 border-b border-slate-50 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors relative
                ${selectedChatId === chat.id ? 'bg-teal-50 dark:bg-teal-900/10 border-l-4 border-l-teal-500' : 'border-l-4 border-l-transparent'}
              `}
            >
              <div className="relative">
                <img src={chat.user.avatar} alt={chat.user.name} className="w-12 h-12 rounded-full object-cover" />
                {chat.user.status === 'online' && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
                )}
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
                    <span className="w-5 h-5 bg-teal-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                      {chat.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Main Chat Window */}
      {selectedChat ? (
        <div className={`
           flex-1 flex flex-col relative transition-all duration-300
           ${selectedChatId ? 'flex' : 'hidden md:flex'}
        `}>
          {/* Header */}
          <div className="h-16 px-4 py-2 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-10">
            <div className="flex items-center gap-3">
              <button onClick={() => setSelectedChatId(null)} className="md:hidden text-slate-500"><ArrowLeft size={20}/></button>
              <img src={selectedChat.user.avatar} className="w-10 h-10 rounded-full object-cover cursor-pointer" onClick={() => setShowProfile(!showProfile)}/>
              <div className="cursor-pointer" onClick={() => setShowProfile(!showProfile)}>
                <h3 className="font-bold text-slate-900 dark:text-white leading-tight">{selectedChat.user.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedChat.user.status === 'online' ? 'Online' : selectedChat.user.status === 'typing' ? 'Typing...' : `Last seen ${selectedChat.user.lastSeen}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
               <button className="hover:text-teal-600 transition-colors"><Search size={20} /></button>
               <button 
                 onClick={() => setShowProfile(!showProfile)} 
                 className={`transition-colors ${showProfile ? 'text-teal-600' : 'hover:text-teal-600'}`}
               >
                 <Info size={20} />
               </button>
            </div>
          </div>

          {/* Messages Area */}
          <div 
             className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#e5ddd5]/50 dark:bg-black/40 space-y-4 relative" 
             ref={scrollRef}
          >
            {/* Chat BG Pattern */}
            <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.03] bg-repeat pointer-events-none" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundSize: '400px' }}></div>

            {selectedChat.messages.map((msg) => {
              const isMe = msg.sender === 'me';
              return (
                <div key={msg.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} relative z-10 group`}>
                   <div 
                     className={`
                       max-w-[80%] md:max-w-[60%] rounded-lg px-3 py-2 shadow-sm text-sm relative
                       ${isMe 
                         ? 'bg-teal-500 text-white rounded-tr-none' 
                         : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none'}
                     `}
                   >
                     {/* Template Highlight */}
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
                     
                     {/* Tail SVG mock could go here */}
                   </div>
                </div>
              );
            })}
          </div>

          {/* Input Area */}
          <div className="min-h-[70px] bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 py-3 flex items-end gap-3 z-10">
             <button className="p-2 text-slate-500 hover:text-teal-600 transition-colors mb-1"><Smile size={24} /></button>
             <button className="p-2 text-slate-500 hover:text-teal-600 transition-colors mb-1"><Paperclip size={24} /></button>
             
             <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 min-h-[45px] flex items-center px-4 py-2 shadow-sm focus-within:ring-2 focus-within:ring-teal-500/50 transition-all">
                <textarea 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type a message..."
                  className="w-full bg-transparent border-none focus:ring-0 resize-none h-[24px] max-h-[100px] text-slate-800 dark:text-white placeholder:text-slate-400 text-sm scrollbar-hide"
                  style={{ height: Math.max(24, Math.min(100, inputText.split('\n').length * 24)) + 'px' }}
                />
             </div>

             {inputText.trim() ? (
               <button 
                 onClick={handleSendMessage}
                 className="p-3 bg-teal-600 text-white rounded-full hover:bg-teal-500 shadow-lg transition-all active:scale-95 mb-1"
               >
                 <Send size={20} className="ml-0.5" />
               </button>
             ) : (
               <button className="p-3 bg-slate-200 dark:bg-slate-800 text-slate-500 rounded-full hover:bg-teal-500 hover:text-white transition-all mb-1">
                 <Mic size={20} />
               </button>
             )}
          </div>
        </div>
      ) : (
        <div className="flex-1 hidden md:flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 border-b-[6px] border-b-[#25D366]">
           <div className="w-64 h-64 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mb-8">
             <img src="https://cdni.iconscout.com/illustration/premium/thumb/web-chat-illustration-download-in-svg-png-gif-file-formats--online-communication-conversation-messaging-business-pack-illustrations-3560757.png" alt="Select Chat" className="w-48 opacity-80 mix-blend-multiply dark:mix-blend-screen" />
           </div>
           <h2 className="text-3xl font-light text-slate-700 dark:text-slate-200 mb-4">Cloubuzz Web</h2>
           <p className="text-slate-500 text-center max-w-md">Send and receive messages without keeping your phone online.<br/>Use WhatsApp, SMS, and Email from one console.</p>
        </div>
      )}

      {/* 3. Right Sidebar (CRM Profile) */}
      {selectedChat && showProfile && (
         <div className="w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-teal-900/30 hidden xl:flex flex-col overflow-y-auto shadow-xl z-20">
            <div className="p-6 flex flex-col items-center border-b border-slate-100 dark:border-slate-800">
               <button onClick={() => setShowProfile(false)} className="absolute left-4 top-4 text-slate-400 hover:text-slate-600 xl:hidden"><X size={20}/></button>
               <img src={selectedChat.user.avatar} className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-white dark:border-slate-800 shadow-lg" />
               <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedChat.user.name}</h2>
               <p className="text-slate-500 text-sm">{selectedChat.user.location}</p>
               
               <div className="flex gap-4 mt-6 w-full">
                  <div className="flex-1 text-center p-2 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                     <div className="text-teal-600 dark:text-teal-400 text-xs font-bold uppercase tracking-wide mb-1">LTV</div>
                     <div className="font-bold text-slate-800 dark:text-white">RS {selectedChat.user.ltv}</div>
                  </div>
                  <div className="flex-1 text-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                     <div className="text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-wide mb-1">Orders</div>
                     <div className="font-bold text-slate-800 dark:text-white">12</div>
                  </div>
               </div>
            </div>

            <div className="p-6 space-y-6">
               {/* Contact Info */}
               <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Contact Info</h3>
                  <div className="space-y-3">
                     <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"><Check size={14}/></div>
                        <div>
                          <p className="text-xs text-slate-400">Email</p>
                          <p>{selectedChat.user.email}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"><Phone size={14}/></div>
                        <div>
                          <p className="text-xs text-slate-400">Phone</p>
                          <p>{selectedChat.user.phone}</p>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Tags */}
               <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                     {selectedChat.user.tags?.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs rounded-md border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                           <Tag size={10} /> {tag}
                        </span>
                     ))}
                     <button className="px-2 py-1 border border-dashed border-slate-300 dark:border-slate-600 text-slate-400 text-xs rounded-md hover:text-teal-500 hover:border-teal-500 transition-colors">
                        + Add Tag
                     </button>
                  </div>
               </div>

               {/* Last Order */}
               {selectedChat.user.lastOrder && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                     <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2">
                           <ShoppingBag size={14} /> Last Order
                        </h3>
                        <span className="text-xs text-teal-600 font-bold bg-teal-100 dark:bg-teal-900/30 px-2 py-0.5 rounded-full">{selectedChat.user.lastOrder.status}</span>
                     </div>
                     <div className="flex justify-between items-end">
                        <div>
                           <p className="text-sm font-bold text-slate-800 dark:text-white">{selectedChat.user.lastOrder.id}</p>
                           <p className="text-xs text-slate-500">{selectedChat.user.lastOrder.date}</p>
                        </div>
                        <div className="text-right">
                           <p className="text-sm font-bold text-slate-800 dark:text-white">RS {selectedChat.user.lastOrder.amount}</p>
                        </div>
                     </div>
                     <button className="w-full mt-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded text-xs font-bold text-slate-600 dark:text-slate-300 shadow-sm hover:text-teal-600 transition-colors">
                        View Order Details
                     </button>
                  </div>
               )}

               {/* Actions */}
               <div className="space-y-2">
                  <button className="w-full py-2.5 bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 text-sm font-bold rounded-lg border border-rose-100 dark:border-rose-900/30 hover:bg-rose-100 transition-colors">
                     Block User
                  </button>
                  <button className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-bold rounded-lg hover:bg-slate-200 transition-colors">
                     Export Chat
                  </button>
               </div>
            </div>
         </div>
      )}

    </div>
  );
};