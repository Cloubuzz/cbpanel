import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  MoreVertical, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Send,
  Paperclip,
  ChevronRight,
  LifeBuoy,
  Zap,
  History,
  MessageSquare,
  Tag
} from 'lucide-react';
import { TicketStatus } from '../types';

interface ActivityLog {
  id: number;
  action: string;
  user: string;
  time: string;
  icon?: React.ReactNode;
  comment?: string;
}

interface Ticket {
  id: string;
  subject: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    avatar: string;
  };
  status: TicketStatus | 'Rejected';
  priority: 'Low' | 'Medium' | 'High';
  category: string;
  createdAt: string;
  lastUpdate: string;
  description: string;
  activityLogs: ActivityLog[];
}

const mockTickets: Ticket[] = [
  {
    id: 'TKT-8291',
    subject: 'Issue with menu synchronization',
    customer: {
      name: 'John Smith',
      email: 'john@example.com',
      phone: '03361054954',
      avatar: 'https://picsum.photos/seed/john/100/100'
    },
    status: 'open',
    priority: 'High',
    category: 'Technical',
    createdAt: '2024-04-05 10:30 AM',
    lastUpdate: '2 mins ago',
    description: "Hi, I'm having trouble syncing my menu with the main branch. It keeps showing an error code ERR_SYNC_404.",
    activityLogs: [
      { id: 1, action: 'Ticket Created', user: 'Customer', time: '10:30 AM', icon: <Plus size={14} /> },
      { id: 2, action: 'System Assigned', user: 'Auto-Assigner', time: '10:31 AM', icon: <Zap size={14} /> },
    ]
  },
  {
    id: 'TKT-8292',
    subject: 'Voucher code not working',
    customer: {
      name: 'Sarah Wilson',
      email: 'sarah@example.com',
      phone: '03363454264',
      avatar: 'https://picsum.photos/seed/sarah/100/100'
    },
    status: 'in-progress',
    priority: 'Medium',
    category: 'Billing',
    createdAt: '2024-04-05 09:15 AM',
    lastUpdate: '1 hour ago',
    description: "The voucher code 'SPRING20' is not being applied to orders. Getting 'Invalid Code' error.",
    activityLogs: [
      { id: 1, action: 'Ticket Created', user: 'Customer', time: '09:15 AM', icon: <Plus size={14} /> },
      { id: 2, action: 'Agent Responded', user: 'Alex (Support)', time: '09:45 AM', icon: <MessageSquare size={14} />, comment: "Hello Sarah, I'm looking into this for you. Could you please provide an example order ID?" },
    ]
  },
  {
    id: 'TKT-8293',
    subject: 'Request for new feature: AI Insights',
    customer: {
      name: 'Michael Chen',
      email: 'michael@example.com',
      phone: '03003608668',
      avatar: 'https://picsum.photos/seed/michael/100/100'
    },
    status: 'resolved',
    priority: 'Low',
    category: 'Feature Request',
    createdAt: '2024-04-04 02:20 PM',
    lastUpdate: 'Yesterday',
    description: "It would be great to have AI-driven insights for my weekly sales reports to identify trends automatically.",
    activityLogs: [
      { id: 1, action: 'Ticket Created', user: 'Customer', time: '02:20 PM', icon: <Plus size={14} /> },
      { id: 2, action: 'Moved to Backlog', user: 'Product Team', time: '04:00 PM', icon: <History size={14} /> },
      { id: 3, action: 'Ticket Resolved', user: 'Product Team', time: '05:30 PM', icon: <CheckCircle2 size={14} />, comment: "Feature added to Q3 roadmap. Closing ticket." },
    ]
  }
];

export const HelpDesk: React.FC = () => {
  const [selectedTicketId, setSelectedTicketId] = useState<string>(mockTickets[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [newMessage, setNewMessage] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState<{ show: boolean, type: 'Resolve' | null }>({ show: false, type: null });
  const [ticketPriority, setTicketPriority] = useState<string>('');
  const [ticketTags, setTicketTags] = useState<string[]>(['Technical', 'Sync']);
  const [newTag, setNewTag] = useState('');

  const filteredTickets = mockTickets.filter(ticket => {
    const matchesSearch = 
      ticket.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'All' || 
                         (filterStatus === 'Open' && ticket.status === 'open') ||
                         (filterStatus === 'In Progress' && ticket.status === 'in-progress') ||
                         (filterStatus === 'Resolved' && ticket.status === 'resolved');
    
    return matchesSearch && matchesStatus;
  });

  const selectedTicket = mockTickets.find(t => t.id === selectedTicketId) || mockTickets[0];

  // Initialize local state when ticket changes
  React.useEffect(() => {
    setTicketPriority(selectedTicket.priority);
    // In a real app, tags would come from the ticket object
    setTicketTags([selectedTicket.category]);
  }, [selectedTicketId, selectedTicket.priority, selectedTicket.category]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'resolved': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'open': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'in-progress': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'text-rose-500 bg-rose-500/10';
      case 'medium': return 'text-amber-500 bg-amber-500/10';
      case 'low': return 'text-emerald-500 bg-emerald-500/10';
      default: return 'text-slate-500 bg-slate-500/10';
    }
  };

  return (
    <div className="flex h-full bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans">
      
      {/* Left Column: Ticket List */}
      <div className="w-80 lg:w-96 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-white dark:bg-slate-900 z-10">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
              <LifeBuoy size={24} className="text-teal-500" />
              Help Desk
            </h2>
            <span className="px-2.5 py-1 bg-teal-500 text-white text-[10px] font-black rounded-lg shadow-lg shadow-teal-500/20">
              {mockTickets.filter(t => t.status === 'open').length} NEW
            </span>
          </div>
          
          <div className="relative mb-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search ID, Subject, Name..." 
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:ring-2 focus:ring-teal-500/30 transition-all shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Horizontal Status Tiles */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {[
              { id: 'All', icon: <LifeBuoy size={16} />, label: 'All' },
              { id: 'Open', icon: <AlertCircle size={16} />, label: 'Open' },
              { id: 'In Progress', icon: <Clock size={16} />, label: 'Active' },
              { id: 'Resolved', icon: <CheckCircle2 size={16} />, label: 'Done' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setFilterStatus(item.id)}
                className={`flex-shrink-0 px-3 py-2 rounded-xl flex items-center gap-2 transition-all border ${
                  filterStatus === item.id 
                  ? 'bg-teal-500 text-white border-teal-500 shadow-md shadow-teal-500/20' 
                  : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-teal-500/50'
                }`}
              >
                {item.icon}
                <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/50 custom-scrollbar bg-white dark:bg-slate-900">
          {filteredTickets.length > 0 ? filteredTickets.map(ticket => (
            <button 
              key={ticket.id}
              onClick={() => setSelectedTicketId(ticket.id)}
              className={`w-full p-5 text-left transition-all relative group ${
                selectedTicketId === ticket.id 
                ? 'bg-slate-50 dark:bg-slate-800/50' 
                : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/20'
              }`}
            >
              {selectedTicketId === ticket.id && (
                <div className="absolute left-0 top-2 bottom-2 w-1.5 bg-teal-500 rounded-r-full"></div>
              )}
              
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest">{ticket.id}</span>
                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5">
                  <Clock size={12} /> {ticket.lastUpdate}
                </span>
              </div>
              
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate pr-2 group-hover:text-teal-500 transition-colors">{ticket.subject}</h3>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                   <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase border ${getStatusColor(ticket.status)}`}>
                    {ticket.status}
                  </span>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${getPriorityColor(ticket.priority)} bg-transparent`}>
                    {ticket.priority}
                  </span>
                </div>
                <ChevronRight size={16} className={`text-slate-300 transition-transform ${selectedTicketId === ticket.id ? 'translate-x-1 text-teal-500' : 'group-hover:translate-x-1'}`} />
              </div>
            </button>
          )) : (
            <div className="p-10 text-center">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                <Search size={32} />
              </div>
              <p className="text-slate-400 text-sm font-medium">No tickets found matching your search.</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Ticket Details */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
        
        {/* Detail Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 shadow-sm z-20">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-teal-500 text-white flex items-center justify-center shadow-lg shadow-teal-500/20">
              <LifeBuoy size={28} />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1.5">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{selectedTicket.id}: {selectedTicket.subject}</h1>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusColor(selectedTicket.status)}`}>
                  {selectedTicket.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-4 font-medium">
                <span className="flex items-center gap-1.5"><Clock size={14} className="text-teal-500" /> Created {selectedTicket.createdAt}</span>
                <span className="flex items-center gap-1.5"><Tag size={14} className="text-teal-500" /> {selectedTicket.category}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-3 text-slate-400 hover:text-teal-500 hover:bg-teal-500/10 rounded-2xl transition-all border border-transparent hover:border-teal-500/20" title="Add Note">
              <Plus size={22} />
            </button>
            <button className="p-3 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all">
              <MoreVertical size={22} />
            </button>
            <div className="w-px h-10 bg-slate-200 dark:bg-slate-800 mx-2"></div>
            <button 
              onClick={() => setShowConfirmModal({ show: true, type: 'Resolve' })}
              className="px-8 py-3.5 bg-teal-500 hover:bg-teal-600 text-white rounded-2xl text-sm font-black shadow-xl shadow-teal-500/30 transition-all flex items-center gap-2.5 active:scale-95"
            >
              <CheckCircle2 size={20} /> Resolve
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-5xl mx-auto space-y-8">
            
            {/* Bento Metadata Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Customer Info */}
              <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Customer</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-500 overflow-hidden">
                    <img src={selectedTicket.customer.avatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-base font-bold text-slate-900 dark:text-white truncate">{selectedTicket.customer.name}</p>
                    <p className="text-xs text-slate-500 font-medium truncate">{selectedTicket.customer.email}</p>
                  </div>
                </div>
              </div>

              {/* Priority Selector */}
              <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Set Priority</p>
                <div className="flex flex-wrap gap-2">
                  {['Low', 'Medium', 'High'].map((p) => (
                    <button
                      key={p}
                      onClick={() => setTicketPriority(p)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                        ticketPriority === p 
                        ? getPriorityColor(p) + ' border-current shadow-sm' 
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags Section */}
              <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Tags</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {ticketTags.map((tag, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-500/10 text-blue-500 text-[10px] font-bold rounded-lg flex items-center gap-1.5">
                      {tag}
                      <button onClick={() => setTicketTags(ticketTags.filter((_, i) => i !== idx))} className="hover:text-blue-700">×</button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Add tag..." 
                    className="flex-1 bg-slate-50 dark:bg-slate-800 border-none rounded-lg px-3 py-1.5 text-[10px] font-medium focus:ring-1 focus:ring-teal-500/50 outline-none"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newTag.trim()) {
                        setTicketTags([...ticketTags, newTag.trim()]);
                        setNewTag('');
                      }
                    }}
                  />
                  <button 
                    onClick={() => {
                      if (newTag.trim()) {
                        setTicketTags([...ticketTags, newTag.trim()]);
                        setNewTag('');
                      }
                    }}
                    className="p-1.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-all"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Main Inquiry Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 flex items-center justify-between">
                <h3 className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-widest">Original Inquiry</h3>
                <span className="text-[10px] font-bold text-slate-400">{selectedTicket.createdAt}</span>
              </div>
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 flex-shrink-0">
                    <MessageSquare size={20} />
                  </div>
                  <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed font-medium pt-1">
                    {selectedTicket.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Timeline & Response Section */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 flex items-center justify-between">
                <h3 className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                  <History size={14} className="text-teal-500" />
                  Activity Timeline
                </h3>
              </div>

              <div className="p-6">
                <div className="relative space-y-8 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
                  {selectedTicket.activityLogs.map((log) => (
                    <div key={log.id} className="relative pl-10 group">
                      <div className="absolute left-0 top-1 w-8 h-8 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 group-hover:border-teal-500 group-hover:text-teal-500 transition-all z-10 shadow-sm">
                        {log.icon || <Clock size={14} />}
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{log.action}</p>
                          <span className="text-[10px] text-slate-400 font-medium">{log.time}</span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">By <span className="text-teal-500 font-bold">{log.user}</span></p>
                        {log.comment && (
                          <div className="mt-2 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            {log.comment}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Add Response / Note */}
              <div className="p-6 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Post a Response</label>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-bold text-slate-500 hover:text-teal-500 transition-all">Internal Note</button>
                    <button className="px-3 py-1.5 bg-teal-500 text-white rounded-lg text-[10px] font-bold shadow-lg shadow-teal-500/20">Public Reply</button>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <textarea 
                      className="w-full px-5 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:ring-2 focus:ring-teal-500/50 transition-all min-h-[120px] font-medium shadow-sm outline-none resize-none"
                      placeholder="Write your response..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <div className="absolute bottom-3 right-4 flex items-center gap-2">
                      <button className="p-2 text-slate-400 hover:text-teal-500 transition-all">
                        <Paperclip size={18} />
                      </button>
                      <button className="px-5 py-2 bg-teal-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-teal-500/20 active:scale-95 flex items-center gap-2">
                        <Send size={14} /> Send
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[40px] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-10 text-center">
              <div className="w-24 h-24 rounded-full mx-auto mb-8 flex items-center justify-center bg-emerald-500/10 text-emerald-500">
                <CheckCircle2 size={48} />
              </div>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
                Resolve Ticket?
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-10 leading-relaxed font-medium">
                Are you sure you want to resolve ticket <span className="font-black text-slate-900 dark:text-white">{selectedTicket.id}</span>? 
                This will notify the customer and close the inquiry.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowConfirmModal({ show: false, type: null })}
                  className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-black hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => setShowConfirmModal({ show: false, type: null })}
                  className="flex-1 py-4 bg-teal-500 hover:bg-teal-600 text-white rounded-2xl font-black transition-all shadow-xl shadow-teal-500/30"
                >
                  Confirm Resolve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


