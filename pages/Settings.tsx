import React, { useState } from 'react';
import { 
  Store, 
  MessageCircle, 
  MessageSquare, 
  Mail, 
  Users, 
  CreditCard, 
  CheckCircle2, 
  RefreshCw, 
  Plus, 
  Save, 
  Trash2, 
  Shield, 
  Building,
  Upload,
  Eye,
  EyeOff,
  Clock
} from 'lucide-react';

// --- Types ---
type Tab = 'general' | 'integrations' | 'team' | 'billing';

interface Integration {
  id: string;
  name: string;
  provider: string;
  icon: React.ElementType;
  status: 'connected' | 'disconnected' | 'error';
  color: string;
  description: string;
  fields: { label: string; value: string; type: 'text' | 'password' }[];
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Editor' | 'Viewer';
  avatar: string;
  status: 'Active' | 'Pending';
}

// --- Mock Data ---
const initialIntegrations: Integration[] = [
  {
    id: 'shopify',
    name: 'Shopify Store',
    provider: 'Shopify',
    icon: Store,
    status: 'connected',
    color: 'text-[#96bf48] bg-[#96bf48]',
    description: 'Sync products, orders, and customer data.',
    fields: [
      { label: 'Shop Domain', value: 'cloubuzz.myshopify.com', type: 'text' },
      { label: 'Admin API Token', value: 'shpat_xxxxxxxxxxxx', type: 'password' }
    ]
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    provider: 'Meta',
    icon: MessageCircle,
    status: 'connected',
    color: 'text-[#25D366] bg-[#25D366]',
    description: 'Send campaigns and automated messages.',
    fields: [
      { label: 'Phone Number ID', value: '1092837465', type: 'text' },
      { label: 'WABA ID', value: '8827364519', type: 'text' },
      { label: 'System User Token', value: 'EAAG...', type: 'password' }
    ]
  },
  {
    id: 'sms',
    name: 'SMS Gateway',
    provider: 'Twilio',
    icon: MessageSquare,
    status: 'disconnected',
    color: 'text-[#F22F46] bg-[#F22F46]',
    description: 'Send SMS notifications globally.',
    fields: [
      { label: 'Account SID', value: '', type: 'text' },
      { label: 'Auth Token', value: '', type: 'password' },
      { label: 'Sender ID / Phone', value: '', type: 'text' }
    ]
  },
  {
    id: 'email',
    name: 'Email Service',
    provider: 'AWS SES',
    icon: Mail,
    status: 'connected',
    color: 'text-[#FF9900] bg-[#FF9900]',
    description: 'High deliverability transactional emails.',
    fields: [
      { label: 'Region', value: 'us-east-1', type: 'text' },
      { label: 'Access Key ID', value: 'AKIA...', type: 'password' },
      { label: 'Secret Access Key', value: 'wJalr...', type: 'password' }
    ]
  },
];

const initialTeam: TeamMember[] = [
  { id: '1', name: 'Alex C.', email: 'alex@cloubuzz.com', role: 'Admin', status: 'Active', avatar: 'https://i.pravatar.cc/150?u=1' },
  { id: '2', name: 'Sarah Jenkins', email: 'sarah@cloubuzz.com', role: 'Editor', status: 'Active', avatar: 'https://i.pravatar.cc/150?u=2' },
  { id: '3', name: 'Mike Ross', email: 'mike@cloubuzz.com', role: 'Viewer', status: 'Pending', avatar: 'https://i.pravatar.cc/150?u=3' },
];

// --- Sub-components ---

const IntegrationCard: React.FC<{ integration: Integration }> = ({ integration }) => {
  const [expanded, setExpanded] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);

  return (
    <div className={`
      glass-card rounded-2xl overflow-hidden transition-all duration-300
      ${expanded ? 'ring-2 ring-teal-500/20' : ''}
    `}>
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex gap-4">
             <div className={`p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm ${integration.status === 'connected' ? 'grayscale-0' : 'grayscale opacity-70'}`}>
                <integration.icon size={28} className={integration.color.split(' ')[0]} />
             </div>
             <div>
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                   {integration.name}
                   {integration.status === 'connected' && <CheckCircle2 size={14} className="text-emerald-500" />}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{integration.description}</p>
                <div className="flex items-center gap-2 mt-2">
                   <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-500 border border-slate-200 dark:border-slate-700">
                     {integration.provider}
                   </span>
                   <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                     integration.status === 'connected' 
                       ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800' 
                       : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                   }`}>
                     {integration.status === 'connected' ? 'Active' : 'Not Connected'}
                   </span>
                </div>
             </div>
          </div>
          <button 
            onClick={() => setExpanded(!expanded)}
            className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all ${
              integration.status === 'connected' 
                ? 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300' 
                : 'bg-teal-600 text-white border-transparent hover:bg-teal-500 shadow-lg shadow-teal-900/20'
            }`}
          >
            {integration.status === 'connected' ? (expanded ? 'Close' : 'Configure') : 'Connect'}
          </button>
        </div>

        {/* Configuration Form (Expandable) */}
        {expanded && (
           <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4 animate-fade-in">
              {integration.fields.map((field, idx) => (
                <div key={idx}>
                   <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">
                     {field.label}
                   </label>
                   <div className="relative">
                     <input 
                       type={field.type === 'password' && !showSecrets ? 'password' : 'text'} 
                       defaultValue={field.value}
                       className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all text-slate-800 dark:text-slate-200"
                     />
                     {field.type === 'password' && (
                       <button 
                         onClick={() => setShowSecrets(!showSecrets)}
                         className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                       >
                         {showSecrets ? <EyeOff size={16}/> : <Eye size={16}/>}
                       </button>
                     )}
                   </div>
                </div>
              ))}
              
              <div className="flex justify-end gap-3 pt-2">
                 {integration.status === 'connected' && (
                   <button className="px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors">
                     Disconnect
                   </button>
                 )}
                 <button className="px-4 py-2 text-xs font-bold text-white bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 rounded-lg transition-colors flex items-center gap-2">
                   <Save size={14} /> Save Changes
                 </button>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('integrations');
  const [team] = useState(initialTeam);

  const renderContent = () => {
    switch(activeTab) {
      case 'general':
        return (
          <div className="max-w-4xl space-y-6 animate-fade-in">
             {/* Profile Card */}
             <div className="glass-card rounded-2xl p-8">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <Building size={20} className="text-teal-500" /> Company Profile
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                   {/* Logo Upload */}
                   <div className="flex flex-col items-center gap-4">
                      <div className="w-32 h-32 rounded-full bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-900 shadow-xl flex items-center justify-center overflow-hidden group relative cursor-pointer">
                         <div className="text-3xl font-bold text-slate-300 dark:text-slate-600">Logo</div>
                         <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                           <Upload size={20} className="mb-1" /> Change
                         </div>
                      </div>
                      <p className="text-xs text-slate-500 text-center">Recommended: 400x400px<br/>PNG or JPG</p>
                   </div>

                   {/* Fields */}
                   <div className="md:col-span-2 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Company Name</label>
                            <input type="text" defaultValue="Cloubuzz Inc." className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-slate-800 dark:text-slate-200" />
                         </div>
                         <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Store URL</label>
                            <input type="text" defaultValue="https://cloubuzz.com" className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-slate-800 dark:text-slate-200" />
                         </div>
                      </div>
                      
                      <div>
                         <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Support Email</label>
                         <input type="email" defaultValue="support@cloubuzz.com" className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-slate-800 dark:text-slate-200" />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Timezone</label>
                            <select className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-slate-800 dark:text-slate-200">
                               <option>(GMT-05:00) Eastern Time</option>
                               <option>(GMT-08:00) Pacific Time</option>
                               <option>(GMT+00:00) UTC</option>
                            </select>
                         </div>
                         <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Currency</label>
                            <select className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-slate-800 dark:text-slate-200">
                               <option>USD ($)</option>
                               <option>EUR (€)</option>
                               <option>GBP (£)</option>
                            </select>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="mt-8 flex justify-end pt-6 border-t border-slate-100 dark:border-slate-800">
                   <button className="px-6 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl shadow-lg shadow-teal-900/20 transition-all flex items-center gap-2">
                     <Save size={18} /> Save Profile
                   </button>
                </div>
             </div>
          </div>
        );

      case 'integrations':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl animate-fade-in">
             {initialIntegrations.map(integration => (
               <IntegrationCard 
                 key={integration.id} 
                 integration={integration}
               />
             ))}
             
             {/* Coming Soon Card */}
             <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center opacity-60 hover:opacity-100 transition-opacity">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center mb-3">
                   <Plus size={24} className="text-slate-400" />
                </div>
                <h3 className="font-bold text-slate-300 dark:text-slate-300">Request Integration</h3>
                <p className="text-xs text-slate-400 mt-1">Need a specific provider?<br/>Let us know.</p>
             </div>
          </div>
        );

      case 'team':
        return (
          <div className="max-w-5xl animate-fade-in">
             <div className="glass-card rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                   <div>
                     <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                       <Users size={20} className="text-teal-500"/> Team Members
                     </h3>
                     <p className="text-xs text-slate-500 mt-1">Manage access and roles.</p>
                   </div>
                   <button className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs rounded-lg shadow-md hover:opacity-90 transition-opacity flex items-center gap-2">
                     <Plus size={14} /> Invite Member
                   </button>
                </div>
                
                <table className="w-full text-left text-sm">
                   <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                      <tr>
                         <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">User</th>
                         <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Role</th>
                         <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Status</th>
                         <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {team.map(member => (
                        <tr key={member.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                           <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                 <img src={member.avatar} alt={member.name} className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-700" />
                                 <div>
                                    <div className="font-bold text-slate-900 dark:text-white">{member.name}</div>
                                    <div className="text-xs text-slate-500">{member.email}</div>
                                 </div>
                              </div>
                           </td>
                           <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                member.role === 'Admin' ? 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800' :
                                member.role === 'Editor' ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' :
                                'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                              }`}>
                                <Shield size={10} />
                                {member.role}
                              </span>
                           </td>
                           <td className="px-6 py-4">
                              {member.status === 'Active' ? (
                                <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1"><CheckCircle2 size={12}/> Active</span>
                              ) : (
                                <span className="text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center gap-1"><Clock size={12}/> Pending</span>
                              )}
                           </td>
                           <td className="px-6 py-4 text-right">
                              <button className="text-slate-400 hover:text-rose-500 transition-colors p-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg">
                                <Trash2 size={16} />
                              </button>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        );

      case 'billing':
        return (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
             <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                <CreditCard size={40} className="text-slate-400" />
             </div>
             <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Billing & Plans</h3>
             <p className="text-slate-500 max-w-md">Manage your subscription, payment methods, and invoices.<br/>This section uses a secure external portal.</p>
             <button className="mt-6 px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl shadow-lg hover:transform hover:-translate-y-0.5 transition-all">
               Open Billing Portal
             </button>
          </div>
        );

      default: return null;
    }
  };

  return (
    <div className="p-6 md:p-8 pb-20 max-w-[1600px] mx-auto min-h-screen">
      
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          Settings
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage your workspace configuration and connections.</p>
      </div>

      {/* Tabs Layout */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Sidebar Nav */}
        <div className="w-full lg:w-64 flex-shrink-0 space-y-1 sticky top-8">
           {[
             { id: 'general', label: 'General', icon: Building },
             { id: 'integrations', label: 'Integrations', icon: RefreshCw },
             { id: 'team', label: 'Team Members', icon: Users },
             { id: 'billing', label: 'Billing', icon: CreditCard },
           ].map(item => (
             <button 
               key={item.id}
               onClick={() => setActiveTab(item.id as Tab)}
               className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                 activeTab === item.id 
                   ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 shadow-sm border border-teal-100 dark:border-teal-900/50' 
                   : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800'
               }`}
             >
               <item.icon size={18} />
               {item.label}
             </button>
           ))}

           <div className="pt-6 mt-6 border-t border-slate-200 dark:border-slate-800">
             <div className="px-4">
               <h4 className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-3">System</h4>
               <div className="flex items-center justify-between text-sm text-slate-400 dark:text-slate-300 mb-2">
                 <span>Version</span>
                 <span className="font-mono text-xs opacity-70">2.4.0-beta</span>
               </div>
               <div className="flex items-center justify-between text-sm text-slate-400 dark:text-slate-300">
                 <span>Environment</span>
                 <span className="text-teal-500 font-bold text-xs">Production</span>
               </div>
             </div>
           </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 w-full">
           {renderContent()}
        </div>

      </div>

    </div>
  );
};