import { Mail, MessageCircle, MessageSquare, PauseCircle, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import type { Channel, CampaignStatus } from './types';

export const getChannelIcon = (channel: Channel) => {
  if (channel === 'EMAIL') return <Mail size={16} />;
  if (channel === 'SMS') return <MessageSquare size={16} />;
  return <MessageCircle size={16} />;
};

export const getChannelColor = (channel: Channel) => {
  if (channel === 'EMAIL') return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
  if (channel === 'SMS') return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800';
  return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
};

export const getStatusBadge = (status: CampaignStatus) => {
  if (status === 'ACTIVE') return (
    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400 border border-teal-200 dark:border-teal-900">
      <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span></span>
      Active
    </span>
  );
  if (status === 'PAUSED') return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-900"><PauseCircle size={12} /> Paused</span>;
  if (status === 'SCHEDULED') return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900"><Clock size={12} /> Scheduled</span>;
  if (status === 'COMPLETED') return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700"><CheckCircle2 size={12} /> Completed</span>;
  return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 dark:bg-slate-800/50 dark:text-slate-500 border border-slate-200 dark:border-slate-700"><AlertCircle size={12} /> Draft</span>;
};
