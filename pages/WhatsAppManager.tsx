import React, { useState } from 'react';
import { 
  MessageCircle, 
  Type, 
  Plus, 
  Trash2, 
  Eye, 
  Send, 
  MoreVertical,
  ArrowLeft,
  Smile,
  Mic,
  Camera,
  X
} from 'lucide-react';

interface Button {
  type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER';
  text: string;
  value?: string;
}

interface WhatsAppTemplate {
  id: string;
  name: string;
  category: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  lastModified: string;
  headerType: 'NONE' | 'TEXT' | 'IMAGE';
  headerContent: string;
  headerText: string;
  bodyText: string;
  footerText: string;
  buttons: Button[];
}

const MOCK_WHATSAPP_TEMPLATES: WhatsAppTemplate[] = [
  {
    id: 'w1',
    name: 'summer_sale_promo',
    category: 'MARKETING',
    status: 'APPROVED',
    lastModified: '2024-03-05',
    headerType: 'IMAGE',
    headerContent: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=600&q=80',
    headerText: 'Summer Sale ☀️',
    bodyText: 'Hi {{1}}, our Summer Sale is finally here! \n\nGet up to 50% OFF on your favorite items. Offer valid until {{2}}.',
    footerText: 'Reply STOP to unsubscribe',
    buttons: [
      { type: 'QUICK_REPLY', text: 'Shop Now' },
      { type: 'QUICK_REPLY', text: 'View Catalog' }
    ]
  },
  {
    id: 'w2',
    name: 'order_confirmation',
    category: 'UTILITY',
    status: 'PENDING',
    lastModified: '2024-03-04',
    headerType: 'TEXT',
    headerContent: '',
    headerText: 'Order Confirmed!',
    bodyText: 'Hello {{1}}, your order #{{2}} has been confirmed and is being prepared.',
    footerText: 'Thank you for shopping with us!',
    buttons: [
      { type: 'URL', text: 'Track Order', value: 'https://cloubuzz.com/track' }
    ]
  },
  {
    id: 'w3',
    name: 'auth_otp_code',
    category: 'AUTHENTICATION',
    status: 'APPROVED',
    lastModified: '2024-03-01',
    headerType: 'NONE',
    headerContent: '',
    headerText: '',
    bodyText: 'Your verification code is {{1}}. Do not share this code with anyone.',
    footerText: 'Valid for 5 minutes',
    buttons: []
  }
];

export const WhatsAppManager: React.FC = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [view, setView] = useState<'list' | 'editor'>('list');
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>(MOCK_WHATSAPP_TEMPLATES);
  const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(null);

  const [templateName, setTemplateName] = useState('summer_sale_promo');
  const [category, setCategory] = useState('MARKETING');
  
  const [headerType, setHeaderType] = useState<'NONE' | 'TEXT' | 'IMAGE'>('IMAGE');
  const [headerContent, setHeaderContent] = useState('https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=600&q=80');
  const [headerText, setHeaderText] = useState('Summer Sale ☀️');
  
  const [bodyText, setBodyText] = useState('Hi {{1}}, our Summer Sale is finally here! \n\nGet up to 50% OFF on your favorite items. Offer valid until {{2}}.');
  const [footerText, setFooterText] = useState('Reply STOP to unsubscribe');
  
  const [buttons, setButtons] = useState<Button[]>([
    { type: 'QUICK_REPLY', text: 'Shop Now' },
    { type: 'QUICK_REPLY', text: 'View Catalog' }
  ]);

  const handleCreateNew = () => {
    setTemplateName('new_template_name');
    setCategory('MARKETING');
    setHeaderType('NONE');
    setHeaderContent('');
    setHeaderText('');
    setBodyText('Hello {{1}}, your message here...');
    setFooterText('');
    setButtons([]);
    setCurrentTemplateId(null);
    setView('editor');
  };

  const handleEditTemplate = (template: WhatsAppTemplate) => {
    setTemplateName(template.name);
    setCategory(template.category);
    setHeaderType(template.headerType);
    setHeaderContent(template.headerContent);
    setHeaderText(template.headerText);
    setBodyText(template.bodyText);
    setFooterText(template.footerText);
    setButtons(template.buttons);
    setCurrentTemplateId(template.id);
    setView('editor');
  };

  const handleSaveTemplate = async () => {
    setIsSaving(true);
    const updatedTemplate: WhatsAppTemplate = {
      id: currentTemplateId || Math.random().toString(36).substr(2, 9),
      name: templateName,
      category,
      status: 'PENDING',
      lastModified: new Date().toISOString().split('T')[0],
      headerType,
      headerContent,
      headerText,
      bodyText,
      footerText,
      buttons
    };

    const payload = {
      type: 'whatsapp_template',
      action: currentTemplateId ? 'update' : 'create',
      data: updatedTemplate,
      timestamp: new Date().toISOString()
    };

    try {
      const response = await fetch('https://automate.megnus.app/webhook/bwv3api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        if (currentTemplateId) {
          setTemplates(prev => prev.map(t => t.id === currentTemplateId ? updatedTemplate : t));
        } else {
          setTemplates(prev => [...prev, updatedTemplate]);
        }
        setView('list');
        alert('WhatsApp template saved and submitted successfully!');
      } else {
        throw new Error('Failed to submit to webhook');
      }
    } catch (error) {
      console.error('Error saving WhatsApp template:', error);
      alert('WhatsApp template saved locally, but webhook submission failed.');
      // Still save locally even if webhook fails
      if (currentTemplateId) {
        setTemplates(prev => prev.map(t => t.id === currentTemplateId ? updatedTemplate : t));
      } else {
        setTemplates(prev => [...prev, updatedTemplate]);
      }
      setView('list');
    } finally {
      setIsSaving(false);
    }
  };

  const [showMobilePreview, setShowMobilePreview] = useState(false);

  const addButton = () => {
    if (buttons.length < 3) {
      setButtons([...buttons, { type: 'QUICK_REPLY', text: 'New Button' }]);
    }
  };

  const removeButton = (index: number) => {
    setButtons(buttons.filter((_, i) => i !== index));
  };

  const updateButton = (index: number, key: keyof Button, value: string) => {
    const newButtons = [...buttons];
    newButtons[index] = { ...newButtons[index], [key]: value };
    setButtons(newButtons);
  };

  // Helper to format body text with variable highlighting
  const renderFormattedBody = (text: string) => {
    const parts = text.split(/(\{\{\d+\}\})/g);
    return parts.map((part, index) => {
      if (part.match(/^\{\{\d+\}\}$/)) {
        return (
          <span key={index} className="bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-1 rounded mx-0.5 font-mono text-xs border border-slate-300 dark:border-slate-600">
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderPreviewContent = () => (
      <div className="w-[380px] h-[750px] bg-white dark:bg-[#111b21] rounded-[40px] shadow-2xl border-[8px] border-slate-800 dark:border-slate-700 relative overflow-hidden flex flex-col z-10 ring-1 ring-white/10 scale-90 sm:scale-100 origin-center">
           
           {/* Phone Status Bar */}
           <div className="h-7 bg-[#008069] flex items-center justify-between px-5 pt-1">
              <span className="text-[10px] text-white/90 font-medium">9:41</span>
              <div className="flex gap-1.5">
                 <div className="w-3 h-3 bg-white/90 rounded-full opacity-20"></div>
                 <div className="w-3 h-3 bg-white/90 rounded-full opacity-20"></div>
              </div>
           </div>

           {/* WA Header */}
           <div className="h-14 bg-[#008069] flex items-center px-3 gap-2 shadow-sm flex-shrink-0 z-20">
              <ArrowLeft size={20} className="text-white" />
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">C</div>
              <div className="flex-1">
                 <h4 className="text-white font-bold text-sm leading-tight">Cloubuzz Store</h4>
                 <p className="text-white/80 text-[10px]">Business Account</p>
              </div>
              <div className="flex gap-4 text-white pr-2">
                 <Camera size={20} />
                 <MoreVertical size={20} />
              </div>
           </div>

           {/* Chat Area */}
           <div className="flex-1 bg-[#efeae2] dark:bg-[#0b141a] relative overflow-y-auto p-4 flex flex-col">
              <div className="absolute inset-0 opacity-[0.4] bg-repeat pointer-events-none" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundSize: '350px' }}></div>
              
              <div className="self-center bg-[#eef3f5] dark:bg-[#1f2c34] text-slate-500 dark:text-slate-400 text-[10px] px-2 py-1 rounded-md mb-4 shadow-sm relative z-10 uppercase font-medium">
                 Today
              </div>

              {/* Message Bubble */}
              <div className="self-start max-w-[90%] bg-white dark:bg-[#202c33] rounded-lg shadow-sm relative z-10 flex flex-col">
                 {/* 1. Header Media */}
                 {headerType === 'IMAGE' && (
                   <div className="p-1 pb-0">
                     <div className="rounded-lg overflow-hidden relative aspect-video bg-slate-100">
                       <img src={headerContent} className="w-full h-full object-cover" alt="header" referrerPolicy="no-referrer" />
                     </div>
                   </div>
                 )}
                 {headerType === 'TEXT' && headerText && (
                   <div className="px-3 pt-3 pb-1">
                     <p className="font-bold text-slate-900 dark:text-white text-[15px] leading-snug">{headerText}</p>
                   </div>
                 )}

                 {/* 2. Body */}
                 <div className="px-3 pt-2 pb-1">
                   <p className="text-slate-800 dark:text-white text-[14px] leading-relaxed whitespace-pre-line">
                     {renderFormattedBody(bodyText)}
                   </p>
                 </div>

                 {/* 3. Footer */}
                 {footerText && (
                   <div className="px-3 pt-1 pb-2">
                     <p className="text-[11px] text-slate-400 dark:text-slate-500">{footerText}</p>
                   </div>
                 )}

                 {/* Time & Status */}
                 <div className="flex justify-end px-3 pb-2 gap-1 items-end">
                    <span className="text-[10px] text-slate-400">{getCurrentTime()}</span>
                 </div>
              </div>

              {/* Buttons Stack */}
              {buttons.length > 0 && (
                <div className="self-start max-w-[90%] w-full mt-1 space-y-1 relative z-10">
                   {buttons.map((btn, i) => (
                     <div key={i} className="bg-white dark:bg-[#202c33] rounded-lg shadow-sm py-2.5 px-4 text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-[#2a3942] transition-colors">
                        <div className="flex items-center justify-center gap-2 text-[#00a884] dark:text-[#53bdeb] font-medium text-[14px]">
                           {btn.type === 'URL' && <ArrowUpRightMini />}
                           {btn.type === 'PHONE_NUMBER' && <PhoneMini />}
                           {btn.type === 'QUICK_REPLY' && <ReplyMini />}
                           {btn.text}
                        </div>
                     </div>
                   ))}
                </div>
              )}

           </div>

           {/* Input Area (Mock) */}
           <div className="h-16 bg-[#f0f2f5] dark:bg-[#202c33] flex items-center px-2 gap-2 z-20">
              <button className="p-2 text-slate-500 dark:text-slate-400"><Smile size={24} /></button>
              <button className="p-2 text-slate-500 dark:text-slate-400"><Plus size={24} /></button>
              <div className="flex-1 bg-white dark:bg-[#2a3942] h-10 rounded-lg px-3 flex items-center">
                 <span className="text-slate-400 text-sm">Message</span>
              </div>
              <button className="p-2 text-slate-500 dark:text-slate-400"><Mic size={24} /></button>
           </div>
           
           {/* Home Indicator */}
           <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-300 rounded-full z-30"></div>
     </div>
  );

  if (view === 'list') {
    return (
      <div className="p-8 bg-slate-50 dark:bg-slate-950 min-h-[calc(100vh-80px)] overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center text-white shadow-lg shadow-green-500/20">
                  <MessageCircle size={22} fill="white" />
                </div>
                WhatsApp Templates
              </h1>
              <p className="text-slate-500 mt-1">Manage your business message templates for WhatsApp campaigns.</p>
            </div>
            <button 
              onClick={handleCreateNew}
              className="flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white rounded-xl font-bold hover:bg-[#20bd5a] transition-all shadow-lg shadow-green-900/20"
            >
              <Plus size={20} /> Create New Template
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Template Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Category</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Last Modified</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {templates.map(template => (
                  <tr key={template.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{template.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">ID: {template.id}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">
                        {template.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                        template.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500' :
                        template.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500' :
                        'bg-rose-500/10 text-rose-500'
                      }`}>
                        {template.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {template.lastModified}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleEditTemplate(template)}
                          className="p-2 text-slate-400 hover:text-[#25D366] hover:bg-[#25D366]/10 rounded-lg transition-all"
                        >
                          <Type size={18} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] overflow-hidden bg-slate-50 dark:bg-slate-950">
      
      {/* --- Left: Configuration Panel --- */}
      <div className="w-full lg:w-[500px] flex-shrink-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-r border-slate-200 dark:border-teal-900/30 flex flex-col z-10 overflow-hidden shadow-xl">
        
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center text-white shadow-lg shadow-green-500/20">
              <MessageCircle size={22} fill="white" />
            </div>
            WhatsApp Template
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Design message templates for approval.</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide pb-24 lg:pb-6">
          
          {/* 1. Template Info */}
          <div className="space-y-4">
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Template Details</h3>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                   <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Name</label>
                   <input 
                     type="text" 
                     value={templateName}
                     onChange={(e) => setTemplateName(e.target.value)}
                     className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366] transition-all"
                   />
                </div>
                <div className="space-y-1.5">
                   <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Category</label>
                   <select 
                     value={category}
                     onChange={(e) => setCategory(e.target.value)}
                     className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366] transition-all"
                   >
                     <option value="MARKETING">Marketing</option>
                     <option value="UTILITY">Utility</option>
                     <option value="AUTHENTICATION">Authentication</option>
                   </select>
                </div>
             </div>
          </div>

          <hr className="border-slate-100 dark:border-slate-800"/>

          {/* 2. Header */}
          <div className="space-y-4">
             <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Header <span className="text-slate-300 font-normal normal-case">(Optional)</span></h3>
                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                   {(['NONE', 'TEXT', 'IMAGE'] as const).map(t => (
                      <button 
                        key={t}
                        onClick={() => setHeaderType(t)}
                        className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${headerType === t ? 'bg-white dark:bg-slate-600 shadow text-slate-900 dark:text-white' : 'text-slate-500'}`}
                      >
                        {t}
                      </button>
                   ))}
                </div>
             </div>

             {headerType === 'TEXT' && (
               <input 
                 type="text" 
                 value={headerText}
                 onChange={(e) => setHeaderText(e.target.value)}
                 placeholder="Enter header text..."
                 maxLength={60}
                 className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366]"
               />
             )}

             {headerType === 'IMAGE' && (
               <div className="space-y-3">
                 <div className="relative group aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                    <img src={headerContent} alt="Header" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <button className="px-4 py-2 bg-white/20 backdrop-blur text-white rounded-lg text-xs font-bold hover:bg-white/30">Change Image</button>
                    </div>
                 </div>
                 <input 
                   type="text" 
                   value={headerContent}
                   onChange={(e) => setHeaderContent(e.target.value)}
                   placeholder="Image URL..."
                   className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#25D366]"
                 />
               </div>
             )}
          </div>

          <hr className="border-slate-100 dark:border-slate-800"/>

          {/* 3. Body */}
          <div className="space-y-4">
             <div className="flex justify-between">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Body Message</h3>
                <div className="flex gap-2">
                   <button 
                    onClick={() => setBodyText(prev => prev + ' {{1}}')}
                    className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center gap-1"
                   >
                     <Plus size={10}/> Add Variable
                   </button>
                   <button className="text-slate-400 hover:text-slate-600"><Smile size={14}/></button>
                   <button className="text-slate-400 hover:text-slate-600"><Type size={14}/></button>
                </div>
             </div>
             <textarea 
               value={bodyText}
               onChange={(e) => setBodyText(e.target.value)}
               rows={6}
               className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366] resize-none"
               placeholder="Enter your message text here..."
             />
             <p className="text-[10px] text-slate-400">
               Use <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-slate-600 dark:text-slate-300">{`{{1}}`}</code>, <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-slate-600 dark:text-slate-300">{`{{2}}`}</code>, etc. for dynamic variables.
             </p>
          </div>

          <hr className="border-slate-100 dark:border-slate-800"/>

          {/* 4. Footer */}
          <div className="space-y-4">
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Footer <span className="text-slate-300 font-normal normal-case">(Optional)</span></h3>
             <input 
               type="text" 
               value={footerText}
               onChange={(e) => setFooterText(e.target.value)}
               placeholder="Add a short footer..."
               className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366]"
             />
          </div>

          <hr className="border-slate-100 dark:border-slate-800"/>

          {/* 5. Buttons */}
          <div className="space-y-4">
             <div className="flex justify-between items-center">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Buttons</h3>
               <button 
                 onClick={addButton}
                 disabled={buttons.length >= 3}
                 className="text-[10px] bg-[#25D366]/10 text-[#25D366] font-bold px-2 py-1 rounded hover:bg-[#25D366]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
               >
                 <Plus size={10}/> Add Button
               </button>
             </div>
             
             {buttons.length === 0 && (
               <div className="text-center py-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
                 <p className="text-xs text-slate-400">No buttons added</p>
               </div>
             )}

             <div className="space-y-3">
               {buttons.map((btn, idx) => (
                 <div key={idx} className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 relative group">
                    <button 
                      onClick={() => removeButton(idx)}
                      className="absolute top-2 right-2 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>
                    
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-1">
                        <select 
                          value={btn.type}
                          onChange={(e) => updateButton(idx, 'type', e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded px-2 py-1.5 text-xs focus:outline-none"
                        >
                          <option value="QUICK_REPLY">Quick Reply</option>
                          <option value="URL">Visit Website</option>
                          <option value="PHONE_NUMBER">Call Phone</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <input 
                          type="text" 
                          value={btn.text}
                          onChange={(e) => updateButton(idx, 'text', e.target.value)}
                          placeholder="Button Text"
                          maxLength={25}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded px-2 py-1.5 text-xs focus:outline-none"
                        />
                      </div>
                    </div>
                 </div>
               ))}
             </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex gap-3">
           <button 
             onClick={() => setView('list')}
             className="flex-1 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
           >
             Cancel
           </button>
           <button 
             onClick={handleSaveTemplate}
             disabled={isSaving}
             className="flex-1 py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-xl shadow-lg shadow-green-900/10 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
           >
             {isSaving ? (
               <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
             ) : (
               <Send size={16} />
             )}
             <span>{isSaving ? 'Saving...' : 'Save & Submit'}</span>
           </button>
        </div>
      </div>

      {/* --- Right: Preview Area (Desktop) --- */}
      <div className="flex-1 bg-[#f0f2f5] dark:bg-[#0b141a] relative hidden lg:flex items-center justify-center p-8 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.06] dark:opacity-[0.06] bg-repeat" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundSize: '400px' }}></div>
        
        <div className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur rounded-full shadow-sm z-20">
           <Eye size={16} className="text-slate-500" />
           <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Live Preview</span>
        </div>

        {renderPreviewContent()}

      </div>

      {/* --- Mobile Preview Toggle & Overlay --- */}
      <button 
        onClick={() => setShowMobilePreview(true)}
        className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-teal-600 rounded-full text-white shadow-2xl flex items-center justify-center z-50 hover:bg-teal-500 active:scale-95 transition-all"
      >
        <Eye size={24} />
      </button>

      {showMobilePreview && (
        <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
           <button 
             onClick={() => setShowMobilePreview(false)}
             className="absolute top-4 right-4 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
           >
             <X size={24} />
           </button>
           {renderPreviewContent()}
        </div>
      )}

    </div>
  );
};

// Simple icons for the preview
const ArrowUpRightMini = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17l9.2-9.2M17 17V7H7"/></svg>
);
const PhoneMini = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
);
const ReplyMini = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>
);