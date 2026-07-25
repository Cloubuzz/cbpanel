import React from 'react';
import { X, Phone, Tag, ShoppingBag, Check } from 'lucide-react';
import type { ChatSession } from '../types';

interface Props {
  chat: ChatSession;
  onClose: () => void;
}

export const ProfilePanel: React.FC<Props> = ({ chat, onClose }) => (
  <div className="w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-teal-900/30 hidden xl:flex flex-col overflow-y-auto shadow-xl z-20">
    <div className="p-6 flex flex-col items-center border-b border-slate-100 dark:border-slate-800">
      <button onClick={onClose} className="absolute left-4 top-4 text-slate-400 hover:text-slate-600 xl:hidden"><X size={20} /></button>
      <img src={chat.user.avatar} className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-white dark:border-slate-800 shadow-lg" alt={chat.user.name} />
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">{chat.user.name}</h2>
      <p className="text-slate-500 text-sm">{chat.user.location}</p>
      <div className="flex gap-4 mt-6 w-full">
        <div className="flex-1 text-center p-2 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
          <div className="text-teal-600 dark:text-teal-400 text-xs font-bold uppercase tracking-wide mb-1">LTV</div>
          <div className="font-bold text-slate-800 dark:text-white">RS {chat.user.ltv}</div>
        </div>
        <div className="flex-1 text-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <div className="text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-wide mb-1">Orders</div>
          <div className="font-bold text-slate-800 dark:text-white">12</div>
        </div>
      </div>
    </div>

    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Contact Info</h3>
        <div className="space-y-3">
          {chat.user.email && (
            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"><Check size={14} /></div>
              <div><p className="text-xs text-slate-400">Email</p><p>{chat.user.email}</p></div>
            </div>
          )}
          {chat.user.phone && (
            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"><Phone size={14} /></div>
              <div><p className="text-xs text-slate-400">Phone</p><p>{chat.user.phone}</p></div>
            </div>
          )}
        </div>
      </div>

      {chat.user.tags && chat.user.tags.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {chat.user.tags.map(tag => (
              <span key={tag} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs rounded-md border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                <Tag size={10} /> {tag}
              </span>
            ))}
            <button className="px-2 py-1 border border-dashed border-slate-300 dark:border-slate-600 text-slate-400 text-xs rounded-md hover:text-teal-500 hover:border-teal-500 transition-colors">+ Add Tag</button>
          </div>
        </div>
      )}

      {chat.user.lastOrder && (
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2"><ShoppingBag size={14} /> Last Order</h3>
            <span className="text-xs text-teal-600 font-bold bg-teal-100 dark:bg-teal-900/30 px-2 py-0.5 rounded-full">{chat.user.lastOrder.status}</span>
          </div>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-white">{chat.user.lastOrder.id}</p>
              <p className="text-xs text-slate-500">{chat.user.lastOrder.date}</p>
            </div>
            <p className="text-sm font-bold text-slate-800 dark:text-white">RS {chat.user.lastOrder.amount}</p>
          </div>
          <button className="w-full mt-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded text-xs font-bold text-slate-600 dark:text-slate-300 shadow-sm hover:text-teal-600 transition-colors">View Order Details</button>
        </div>
      )}

      <div className="space-y-2">
        <button className="w-full py-2.5 bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 text-sm font-bold rounded-lg border border-rose-100 dark:border-rose-900/30 hover:bg-rose-100 transition-colors">Block User</button>
        <button className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-bold rounded-lg hover:bg-slate-200 transition-colors">Export Chat</button>
      </div>
    </div>
  </div>
);
