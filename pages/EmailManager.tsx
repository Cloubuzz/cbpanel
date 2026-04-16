import React, { useState } from 'react';
import { 
  Type, 
  Image as ImageIcon, 
  MousePointer2, 
  Minus, 
  LayoutList,
  Clock,
  Save,
  Monitor,
  Smartphone,
  Trash2,
  GripVertical,
  AlignLeft,
  AlignCenter,
  AlignRight,
  LayoutTemplate,
  Undo2,
  Redo2,
  Copy,
  Settings,
  Video,
  Code,
  Share2,
  Heading,
  ArrowUp,
  ArrowDown,
  Box,
  Palette,
  Layers,
  PenTool
} from 'lucide-react';

// --- Types ---

type BlockType = 'text' | 'image' | 'button' | 'divider' | 'spacer' | 'social' | 'video' | 'hero' | 'html' | 'heading';

interface BlockStyle {
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  backgroundColor?: string;
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  width?: string;
  height?: number;
  fontFamily?: string;
}

interface BlockContent {
  text?: string;
  src?: string;
  url?: string;
  html?: string;
  iconStyle?: 'circle' | 'square' | 'none';
  networks?: string[]; // for social
  alt?: string;
}

interface EmailBlock {
  id: string;
  type: BlockType;
  label: string;
  content: BlockContent;
  style: BlockStyle;
}

interface GlobalSettings {
  backgroundColor: string;
  canvasColor: string;
  contentWidth: number;
  fontFamily: string;
  primaryColor: string;
}

interface Template {
  id: string;
  name: string;
  lastModified: string;
  thumbnail: string;
  blocks: EmailBlock[];
  settings: GlobalSettings;
}

// --- Constants & Defaults ---

const DEFAULT_SETTINGS: GlobalSettings = {
  backgroundColor: '#f1f5f9', // Slate 100
  canvasColor: '#ffffff',
  contentWidth: 600,
  fontFamily: 'Helvetica, Arial, sans-serif',
  primaryColor: '#2dd4bf', // Teal 400
};

const INITIAL_BLOCKS: EmailBlock[] = [
  {
    id: 'b1',
    type: 'hero',
    label: 'Hero Section',
    content: {
      src: 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=800&q=80',
      text: 'Summer Collection',
      url: '#'
    },
    style: { paddingTop: 60, paddingBottom: 60, textAlign: 'center', backgroundColor: '#000000', borderRadius: 0, color: '#ffffff', fontSize: 32, fontWeight: 'bold' }
  },
  {
    id: 'b2',
    type: 'text',
    label: 'Intro Text',
    content: {
      text: 'Hi there,\n\nWe are excited to announce our new lineup of summer essentials. From beachwear to evening attire, we have everything you need to look your best.'
    },
    style: { paddingTop: 30, paddingBottom: 20, paddingLeft: 20, paddingRight: 20, textAlign: 'left', fontSize: 16, color: '#334155', backgroundColor: 'transparent' }
  },
  {
    id: 'b3',
    type: 'button',
    label: 'CTA Button',
    content: { text: 'Shop Now', url: '#' },
    style: { paddingTop: 10, paddingBottom: 30, textAlign: 'center', backgroundColor: '#2dd4bf', color: '#ffffff', borderRadius: 8, fontSize: 16, fontWeight: 'bold' }
  }
];

const MOCK_TEMPLATES: Template[] = [
  {
    id: 't1',
    name: 'Summer Sale 2024',
    lastModified: '2024-03-01',
    thumbnail: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=400&q=80',
    blocks: INITIAL_BLOCKS,
    settings: DEFAULT_SETTINGS
  },
  {
    id: 't2',
    name: 'Welcome Series',
    lastModified: '2024-02-15',
    thumbnail: 'https://images.unsplash.com/photo-1512428559083-a40ce12b26f0?auto=format&fit=crop&w=400&q=80',
    blocks: [
      {
        id: 'w1',
        type: 'heading',
        label: 'Welcome',
        content: { text: 'Welcome to Cloubuzz!' },
        style: { paddingTop: 40, paddingBottom: 20, textAlign: 'center', fontSize: 28, fontWeight: 'bold' }
      },
      {
        id: 'w2',
        type: 'text',
        label: 'Body',
        content: { text: 'We are thrilled to have you on board. Start exploring our latest features today.' },
        style: { paddingTop: 10, paddingBottom: 30, textAlign: 'center', fontSize: 16, color: '#64748b' }
      }
    ],
    settings: DEFAULT_SETTINGS
  },
  {
    id: 't3',
    name: 'Monthly Newsletter',
    lastModified: '2024-02-28',
    thumbnail: 'https://images.unsplash.com/photo-1557200134-90327ee9fafa?auto=format&fit=crop&w=400&q=80',
    blocks: INITIAL_BLOCKS,
    settings: DEFAULT_SETTINGS
  }
];

// --- Helpers ---

const generateId = () => Math.random().toString(36).substr(2, 9);

const ToolboxButton = ({ type, icon: Icon, label, onDragStart }: { type: BlockType, icon: React.ElementType, label: string, onDragStart: (e: React.DragEvent, type: BlockType) => void }) => (
  <div 
    draggable 
    onDragStart={(e) => onDragStart(e, type)}
    onClick={() => {
        // Fallback for touch/click to add
        // In a real app, this would need a context or callback to addBlock directly without drag
    }}
    className="flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl cursor-grab active:cursor-grabbing hover:border-teal-500 hover:shadow-md hover:scale-[1.02] transition-all group gap-2 h-24"
  >
    <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg text-slate-500 dark:text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
      <Icon size={20} />
    </div>
    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{label}</span>
  </div>
);

// --- Main Component ---

export const EmailManager: React.FC = () => {
  // State
  const [isSaving, setIsSaving] = useState(false);
  const [view, setView] = useState<'list' | 'editor'>('list');
  const [templates, setTemplates] = useState<Template[]>(MOCK_TEMPLATES);
  const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(null);

  const [blocks, setBlocks] = useState<EmailBlock[]>(INITIAL_BLOCKS);
  const [settings, setSettings] = useState<GlobalSettings>(DEFAULT_SETTINGS);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'blocks' | 'layers' | 'style'>('blocks');
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [mobileView, setMobileView] = useState<'tools' | 'canvas' | 'inspector'>('canvas');
  
  // History for Undo/Redo
  const [history, setHistory] = useState<{blocks: EmailBlock[], settings: GlobalSettings}[]>([{blocks: INITIAL_BLOCKS, settings: DEFAULT_SETTINGS}]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const selectedBlock = blocks.find(b => b.id === selectedBlockId);

  // --- Actions ---

  const handleCreateNew = () => {
    const newTemplate: Template = {
      id: generateId(),
      name: 'Untitled Template',
      lastModified: new Date().toISOString().split('T')[0],
      thumbnail: 'https://placehold.co/400x300/e2e8f0/94a3b8?text=New+Template',
      blocks: [],
      settings: DEFAULT_SETTINGS
    };
    setBlocks([]);
    setSettings(DEFAULT_SETTINGS);
    setHistory([{ blocks: [], settings: DEFAULT_SETTINGS }]);
    setHistoryIndex(0);
    setCurrentTemplateId(newTemplate.id);
    setView('editor');
  };

  const handleEditTemplate = (template: Template) => {
    setBlocks(template.blocks);
    setSettings(template.settings);
    setHistory([{ blocks: template.blocks, settings: template.settings }]);
    setHistoryIndex(0);
    setCurrentTemplateId(template.id);
    setView('editor');
  };

  const handleSaveTemplate = async () => {
    if (currentTemplateId) {
      setIsSaving(true);
      const payload = {
        type: 'email_template',
        action: 'update',
        data: {
          id: currentTemplateId,
          blocks,
          settings,
          lastModified: new Date().toISOString()
        },
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
          setTemplates(prev => prev.map(t => 
            t.id === currentTemplateId 
              ? { ...t, blocks, settings, lastModified: new Date().toISOString().split('T')[0] } 
              : t
          ));
          setView('list');
          alert('Email template saved and submitted successfully!');
        } else {
          throw new Error('Failed to submit to webhook');
        }
      } catch (error) {
        console.error('Error saving email template:', error);
        alert('Email template saved locally, but webhook submission failed.');
        // Still save locally even if webhook fails
        setTemplates(prev => prev.map(t => 
          t.id === currentTemplateId 
            ? { ...t, blocks, settings, lastModified: new Date().toISOString().split('T')[0] } 
            : t
        ));
        setView('list');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const addToHistory = (newBlocks: EmailBlock[], newSettings: GlobalSettings) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ blocks: newBlocks, settings: newSettings });
    // Limit history size to 50
    if (newHistory.length > 50) newHistory.shift();
    
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setBlocks(prevState.blocks);
      setSettings(prevState.settings);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setBlocks(nextState.blocks);
      setSettings(nextState.settings);
      setHistoryIndex(historyIndex + 1);
    }
  };

  const updateBlock = (id: string, updates: Partial<EmailBlock> | { style: Partial<BlockStyle> } | { content: Partial<BlockContent> }) => {
    const newBlocks = blocks.map(b => {
      if (b.id !== id) return b;
      
      // Deep merge for style/content
      if ('style' in updates) return { ...b, style: { ...b.style, ...updates.style } };
      if ('content' in updates) return { ...b, content: { ...b.content, ...updates.content } };
      return { ...b, ...updates };
    });
    setBlocks(newBlocks);
  };
  
  const commitState = (newBlocks: EmailBlock[] = blocks, newSettings: GlobalSettings = settings) => {
    addToHistory(newBlocks, newSettings);
  };

  const addBlock = (type: BlockType) => {
    const newBlock: EmailBlock = {
      id: generateId(),
      type,
      label: type.charAt(0).toUpperCase() + type.slice(1),
      content: getDefaultContent(type),
      style: getDefaultStyle(type, settings)
    };
    
    const newBlocks = [...blocks, newBlock];
    setBlocks(newBlocks);
    commitState(newBlocks, settings);
    setSelectedBlockId(newBlock.id);
    
    // On mobile, auto-switch to inspector after adding
    if (window.innerWidth < 1024) {
        setMobileView('inspector');
    }
  };

  const deleteBlock = (id: string) => {
    const newBlocks = blocks.filter(b => b.id !== id);
    setBlocks(newBlocks);
    commitState(newBlocks, settings);
    if (selectedBlockId === id) setSelectedBlockId(null);
  };

  const duplicateBlock = (id: string) => {
    const block = blocks.find(b => b.id === id);
    if (!block) return;
    
    const newBlock = { ...block, id: generateId(), label: block.label + ' (Copy)' };
    const index = blocks.findIndex(b => b.id === id);
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, newBlock);
    
    setBlocks(newBlocks);
    commitState(newBlocks, settings);
    setSelectedBlockId(newBlock.id);
  };

  const moveBlock = (id: string, direction: 'up' | 'down') => {
    const index = blocks.findIndex(b => b.id === id);
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === blocks.length - 1)) return;
    
    const newBlocks = [...blocks];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[swapIndex]] = [newBlocks[swapIndex], newBlocks[index]];
    
    setBlocks(newBlocks);
    commitState(newBlocks, settings);
  };

  // --- Drag and Drop ---

  const handleDragStart = (e: React.DragEvent, type: BlockType) => {
    e.dataTransfer.setData('blockType', type);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('blockType') as BlockType;
    if (type) addBlock(type);
  };

  // --- Defaults ---

  const getDefaultContent = (type: BlockType): BlockContent => {
    switch(type) {
      case 'text': return { text: 'Edit this text block...' };
      case 'image': return { src: 'https://placehold.co/600x300/e2e8f0/94a3b8?text=Image+Placeholder' };
      case 'button': return { text: 'Click Here', url: '#' };
      case 'hero': return { src: 'https://placehold.co/800x400/1e293b/ffffff?text=Hero+Image', text: 'Hero Headline', url: '#' };
      case 'social': return { networks: ['facebook', 'twitter', 'instagram'] };
      case 'video': return { src: '', url: '' };
      case 'html': return { html: '<div style="padding:10px; border:1px dashed #ccc;">Custom HTML</div>' };
      case 'heading': return { text: 'Heading Title' };
      default: return {};
    }
  };

  const getDefaultStyle = (type: BlockType, global: GlobalSettings): BlockStyle => {
    const base = {
      paddingTop: 10, paddingBottom: 10, paddingLeft: 0, paddingRight: 0,
      backgroundColor: 'transparent'
    };
    switch(type) {
      case 'button': return { ...base, backgroundColor: global.primaryColor, color: '#ffffff', borderRadius: 4, paddingTop: 12, paddingBottom: 12, textAlign: 'center', fontWeight: 'bold' };
      case 'divider': return { ...base, paddingTop: 20, paddingBottom: 20, borderColor: '#cbd5e1', borderWidth: 1 };
      case 'spacer': return { ...base, height: 30 };
      case 'heading': return { ...base, fontSize: 24, fontWeight: 'bold', color: '#0f172a' };
      default: return base;
    }
  };

  // --- Renderers ---

  const renderBlockPreview = (block: EmailBlock) => {
    const { style, content } = block;
    
    const containerStyle: React.CSSProperties = {
      paddingTop: style.paddingTop,
      paddingBottom: style.paddingBottom,
      paddingLeft: style.paddingLeft,
      paddingRight: style.paddingRight,
      backgroundColor: style.backgroundColor,
      textAlign: style.textAlign,
    };

    switch (block.type) {
      case 'text':
        return (
          <div style={{...containerStyle, color: style.color, fontSize: style.fontSize, fontFamily: settings.fontFamily, whiteSpace: 'pre-wrap'}}>
            {content.text}
          </div>
        );
      case 'image':
        return (
          <div style={containerStyle}>
             <img src={content.src} alt="img" style={{ maxWidth: '100%', height: 'auto', borderRadius: style.borderRadius }} />
          </div>
        );
      case 'button':
        return (
          <div style={containerStyle}>
             <a href={content.url} style={{ 
               display: 'inline-block', 
               backgroundColor: style.backgroundColor, 
               color: style.color, 
               padding: '12px 24px', 
               borderRadius: style.borderRadius, 
               textDecoration: 'none',
               fontWeight: style.fontWeight,
               fontSize: style.fontSize
             }}>
               {content.text}
             </a>
          </div>
        );
      case 'divider':
        return (
           <div style={containerStyle}>
             <hr style={{ border: 'none', borderTop: `${style.borderWidth}px solid ${style.borderColor}` }} />
           </div>
        );
      case 'spacer':
        return <div style={{ height: style.height, backgroundColor: style.backgroundColor }} />;
      case 'hero':
         return (
            <div style={{ 
               ...containerStyle, 
               backgroundImage: `url(${content.src})`, 
               backgroundSize: 'cover', 
               backgroundPosition: 'center',
               minHeight: '200px',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               flexDirection: 'column'
            }}>
               {content.text && (
                 <div style={{ backgroundColor: 'rgba(0,0,0,0.4)', padding: '20px', borderRadius: '8px' }}>
                   <h2 style={{ margin: 0, color: style.color, fontSize: style.fontSize, fontWeight: style.fontWeight }}>{content.text}</h2>
                 </div>
               )}
            </div>
         );
      case 'social':
         return (
           <div style={containerStyle}>
              <div style={{ display: 'inline-flex', gap: '10px' }}>
                 {content.networks?.map(net => (
                   <div key={net} style={{ width: 32, height: 32, backgroundColor: '#cbd5e1', borderRadius: '50%' }}></div>
                 ))}
              </div>
           </div>
         );
      case 'html':
         return (
           <div style={containerStyle} dangerouslySetInnerHTML={{ __html: content.html || '' }} />
         );
      case 'heading':
         return (
           <h2 style={{...containerStyle, color: style.color, fontSize: style.fontSize, fontFamily: settings.fontFamily, fontWeight: style.fontWeight, margin: 0}}>
             {content.text}
           </h2>
         );
      default:
        return <div>Unknown Block</div>;
    }
  };

  const renderInspector = () => {
    if (!selectedBlock) {
       return (
         <div className="flex flex-col items-center justify-center h-full text-center p-8 text-slate-400">
            <MousePointer2 size={48} className="mb-4 opacity-50" />
            <p>Select a block to edit its properties</p>
         </div>
       );
    }

    return (
      <div className="space-y-6 pb-20 lg:pb-0">
         {/* Common Header */}
         <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
               <Settings size={20} className="text-teal-600 dark:text-teal-400" />
            </div>
            <div>
               <h3 className="text-sm font-bold text-slate-900 dark:text-white">{selectedBlock.label}</h3>
               <p className="text-xs text-slate-500">ID: {selectedBlock.id}</p>
            </div>
            <button 
              className="ml-auto lg:hidden p-2 text-slate-400" 
              onClick={() => setMobileView('canvas')}
            >
              <ArrowDown size={20}/>
            </button>
         </div>

         {/* Content Fields */}
         <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Content</h4>
            
            {(selectedBlock.type === 'text' || selectedBlock.type === 'button' || selectedBlock.type === 'hero' || selectedBlock.type === 'heading') && (
               <div className="space-y-1">
                 <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Text</label>
                 <textarea 
                   value={selectedBlock.content.text || ''} 
                   onChange={(e) => updateBlock(selectedBlock.id, { content: { text: e.target.value } })}
                   rows={3}
                   className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                 />
               </div>
            )}

            {(selectedBlock.type === 'image' || selectedBlock.type === 'hero') && (
               <div className="space-y-1">
                 <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Image URL</label>
                 <input 
                   type="text"
                   value={selectedBlock.content.src || ''} 
                   onChange={(e) => updateBlock(selectedBlock.id, { content: { src: e.target.value } })}
                   className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                 />
               </div>
            )}

            {selectedBlock.type === 'button' && (
               <div className="space-y-1">
                 <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Link URL</label>
                 <input 
                   type="text"
                   value={selectedBlock.content.url || ''} 
                   onChange={(e) => updateBlock(selectedBlock.id, { content: { url: e.target.value } })}
                   className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                 />
               </div>
            )}
            
            {selectedBlock.type === 'html' && (
               <div className="space-y-1">
                 <label className="text-xs font-medium text-slate-600 dark:text-slate-300">HTML Code</label>
                 <textarea 
                   value={selectedBlock.content.html || ''} 
                   onChange={(e) => updateBlock(selectedBlock.id, { content: { html: e.target.value } })}
                   rows={6}
                   className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-teal-500"
                 />
               </div>
            )}
         </div>

         {/* Style Fields */}
         <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Appearance</h4>
            
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Background</label>
                  <div className="flex items-center gap-2">
                     <input 
                       type="color" 
                       value={selectedBlock.style.backgroundColor || '#ffffff'}
                       onChange={(e) => updateBlock(selectedBlock.id, { style: { backgroundColor: e.target.value } })}
                       className="w-8 h-8 rounded border-none cursor-pointer"
                     />
                     <input 
                       type="text" 
                       value={selectedBlock.style.backgroundColor}
                       onChange={(e) => updateBlock(selectedBlock.id, { style: { backgroundColor: e.target.value } })}
                       className="flex-1 w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 text-xs"
                     />
                  </div>
               </div>
               {selectedBlock.style.color !== undefined && (
                 <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Text Color</label>
                    <div className="flex items-center gap-2">
                       <input 
                         type="color" 
                         value={selectedBlock.style.color || '#000000'}
                         onChange={(e) => updateBlock(selectedBlock.id, { style: { color: e.target.value } })}
                         className="w-8 h-8 rounded border-none cursor-pointer"
                       />
                       <input 
                         type="text" 
                         value={selectedBlock.style.color}
                         onChange={(e) => updateBlock(selectedBlock.id, { style: { color: e.target.value } })}
                         className="flex-1 w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 text-xs"
                       />
                    </div>
                 </div>
               )}
            </div>

            <div className="space-y-1">
               <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Alignment</label>
               <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                  {['left', 'center', 'right'].map((align) => (
                    <button 
                      key={align}
                      onClick={() => updateBlock(selectedBlock.id, { style: { textAlign: align as 'left' | 'center' | 'right' } })}
                      className={`flex-1 flex items-center justify-center p-1.5 rounded ${selectedBlock.style.textAlign === align ? 'bg-white dark:bg-slate-600 shadow-sm text-teal-600' : 'text-slate-400'}`}
                    >
                      {align === 'left' ? <AlignLeft size={16}/> : align === 'center' ? <AlignCenter size={16}/> : <AlignRight size={16}/>}
                    </button>
                  ))}
               </div>
            </div>

            <div className="space-y-1">
               <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Padding (Top/Bottom)</label>
               <div className="grid grid-cols-2 gap-2">
                 <input 
                   type="number" 
                   value={selectedBlock.style.paddingTop}
                   onChange={(e) => updateBlock(selectedBlock.id, { style: { paddingTop: parseInt(e.target.value) } })}
                   className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs"
                   placeholder="Top"
                 />
                 <input 
                   type="number" 
                   value={selectedBlock.style.paddingBottom}
                   onChange={(e) => updateBlock(selectedBlock.id, { style: { paddingBottom: parseInt(e.target.value) } })}
                   className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs"
                   placeholder="Bottom"
                 />
               </div>
            </div>
         </div>
         
         <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
           <button 
             onClick={() => deleteBlock(selectedBlock.id)}
             className="w-full py-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 rounded-lg text-xs font-bold hover:bg-rose-100 transition-colors flex items-center justify-center gap-2"
           >
             <Trash2 size={14} /> Delete Block
           </button>
         </div>
      </div>
    );
  };

  if (view === 'list') {
    return (
      <div className="p-8 bg-slate-50 dark:bg-slate-950 min-h-[calc(100vh-80px)] overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Email Templates</h1>
              <p className="text-slate-500 mt-1">Manage and design your marketing email campaigns</p>
            </div>
            <button 
              onClick={handleCreateNew}
              className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-500 transition-all shadow-lg shadow-teal-900/20"
            >
              <PenTool size={20} /> Create New Template
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {templates.map(template => (
              <div 
                key={template.id} 
                className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="aspect-[4/3] overflow-hidden relative">
                  <img 
                    src={template.thumbnail} 
                    alt={template.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button 
                      onClick={() => handleEditTemplate(template)}
                      className="p-3 bg-white text-slate-900 rounded-full hover:bg-teal-500 hover:text-white transition-all shadow-lg"
                    >
                      <PenTool size={20} />
                    </button>
                    <button className="p-3 bg-white text-slate-900 rounded-full hover:bg-rose-500 hover:text-white transition-all shadow-lg">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-1 truncate">{template.name}</h3>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Clock size={12} /> {template.lastModified}</span>
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full">{template.blocks.length} Blocks</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans relative">
      
      {/* 1. Left Sidebar: Toolbox & Layers */}
      <div className={`
         w-full lg:w-80 flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-teal-900/30 flex flex-col z-20 shadow-xl
         ${mobileView === 'tools' ? 'flex' : 'hidden'} lg:flex
      `}>
        
        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button onClick={() => setActiveTab('blocks')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'blocks' ? 'text-teal-600 dark:text-teal-400 border-b-2 border-teal-500 bg-teal-50/50 dark:bg-teal-900/10' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Blocks</button>
          <button onClick={() => setActiveTab('layers')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'layers' ? 'text-teal-600 dark:text-teal-400 border-b-2 border-teal-500 bg-teal-50/50 dark:bg-teal-900/10' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Layers</button>
          <button onClick={() => setActiveTab('style')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'style' ? 'text-teal-600 dark:text-teal-400 border-b-2 border-teal-500 bg-teal-50/50 dark:bg-teal-900/10' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Global</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar pb-20 lg:pb-4">
          {activeTab === 'blocks' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Content</h3>
                <div className="grid grid-cols-3 gap-2">
                  {/* On mobile, direct click works due to lack of drag support in some browsers, but keeping drag for desktop */}
                  <div onClick={() => addBlock('text')}><ToolboxButton type="text" label="Text" icon={Type} onDragStart={handleDragStart} /></div>
                  <div onClick={() => addBlock('image')}><ToolboxButton type="image" label="Image" icon={ImageIcon} onDragStart={handleDragStart} /></div>
                  <div onClick={() => addBlock('button')}><ToolboxButton type="button" label="Button" icon={MousePointer2} onDragStart={handleDragStart} /></div>
                  <div onClick={() => addBlock('heading')}><ToolboxButton type="heading" label="Header" icon={Heading} onDragStart={handleDragStart} /></div>
                  <div onClick={() => addBlock('hero')}><ToolboxButton type="hero" label="Hero" icon={LayoutTemplate} onDragStart={handleDragStart} /></div>
                  <div onClick={() => addBlock('html')}><ToolboxButton type="html" label="HTML" icon={Code} onDragStart={handleDragStart} /></div>
                </div>
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Layout & Media</h3>
                <div className="grid grid-cols-3 gap-2">
                  <div onClick={() => addBlock('divider')}><ToolboxButton type="divider" label="Divider" icon={Minus} onDragStart={handleDragStart} /></div>
                  <div onClick={() => addBlock('spacer')}><ToolboxButton type="spacer" label="Spacer" icon={LayoutList} onDragStart={handleDragStart} /></div>
                  <div onClick={() => addBlock('social')}><ToolboxButton type="social" label="Social" icon={Share2} onDragStart={handleDragStart} /></div>
                  <div onClick={() => addBlock('video')}><ToolboxButton type="video" label="Video" icon={Video} onDragStart={handleDragStart} /></div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'layers' && (
            <div className="space-y-1">
              {blocks.map((block, idx) => (
                <div 
                  key={block.id}
                  onClick={() => { setSelectedBlockId(block.id); setMobileView('inspector'); }}
                  className={`
                    flex items-center gap-3 p-2 rounded-lg cursor-pointer text-sm font-medium transition-colors group
                    ${selectedBlockId === block.id 
                      ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800' 
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 border border-transparent'}
                  `}
                >
                  <GripVertical size={14} className="text-slate-400 cursor-move" />
                  <span className="flex-1 truncate">{idx + 1}. {block.label}</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                     <button onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'up') }} className="p-1 hover:text-teal-500"><ArrowUp size={12} /></button>
                     <button onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'down') }} className="p-1 hover:text-teal-500"><ArrowDown size={12} /></button>
                     <button onClick={(e) => { e.stopPropagation(); deleteBlock(block.id); }} className="p-1 hover:text-rose-500"><Trash2 size={12} /></button>
                  </div>
                </div>
              ))}
              {blocks.length === 0 && <p className="text-sm text-slate-400 text-center py-4">No blocks added.</p>}
            </div>
          )}

          {activeTab === 'style' && (
             <div className="space-y-4">
                <div className="space-y-2">
                   <label className="text-xs font-bold text-slate-500 uppercase">Canvas Background</label>
                   <div className="flex items-center gap-2">
                      <input type="color" value={settings.backgroundColor} onChange={(e) => { setSettings({...settings, backgroundColor: e.target.value}); commitState(blocks, {...settings, backgroundColor: e.target.value}); }} className="h-8 w-8 rounded border-0 cursor-pointer" />
                      <input type="text" value={settings.backgroundColor} onChange={(e) => { setSettings({...settings, backgroundColor: e.target.value}); commitState(blocks, {...settings, backgroundColor: e.target.value}); }} className="flex-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1.5 text-xs font-mono" />
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="text-xs font-bold text-slate-500 uppercase">Email Content Width</label>
                   <input 
                     type="range" 
                     min="400" max="800" step="10" 
                     value={settings.contentWidth} 
                     onChange={(e) => { setSettings({...settings, contentWidth: parseInt(e.target.value)}); }}
                     onMouseUp={() => commitState()}
                     className="w-full accent-teal-500"
                   />
                   <div className="flex justify-between text-xs text-slate-400">
                      <span>400px</span>
                      <span>{settings.contentWidth}px</span>
                      <span>800px</span>
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="text-xs font-bold text-slate-500 uppercase">Primary Brand Color</label>
                   <div className="flex items-center gap-2">
                      <input type="color" value={settings.primaryColor} onChange={(e) => { setSettings({...settings, primaryColor: e.target.value}); commitState(blocks, {...settings, primaryColor: e.target.value}); }} className="h-8 w-8 rounded border-0 cursor-pointer" />
                      <input type="text" value={settings.primaryColor} onChange={(e) => { setSettings({...settings, primaryColor: e.target.value}); commitState(blocks, {...settings, primaryColor: e.target.value}); }} className="flex-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1.5 text-xs font-mono" />
                   </div>
                </div>
             </div>
          )}
        </div>
      </div>

      {/* 2. Center: Canvas */}
      <div className={`
        flex-1 flex flex-col bg-slate-100 dark:bg-[#0f172a] relative transition-colors duration-300
        ${mobileView === 'canvas' ? 'flex' : 'hidden'} lg:flex
      `}>
        
        {/* Toolbar */}
        <div className="h-14 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 z-10">
          
          <div className="flex items-center gap-2">
             <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
                <button onClick={handleUndo} disabled={historyIndex === 0} className="p-1.5 text-slate-500 hover:text-teal-600 disabled:opacity-30"><Undo2 size={16}/></button>
                <button onClick={handleRedo} disabled={historyIndex === history.length - 1} className="p-1.5 text-slate-500 hover:text-teal-600 disabled:opacity-30"><Redo2 size={16}/></button>
             </div>
             <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>
             <div className="hidden sm:flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
                <button onClick={() => setDevice('desktop')} className={`p-1.5 rounded ${device === 'desktop' ? 'bg-white dark:bg-slate-600 shadow-sm text-teal-600 dark:text-teal-400' : 'text-slate-500'}`}><Monitor size={16}/></button>
                <button onClick={() => setDevice('mobile')} className={`p-1.5 rounded ${device === 'mobile' ? 'bg-white dark:bg-slate-600 shadow-sm text-teal-600 dark:text-teal-400' : 'text-slate-500'}`}><Smartphone size={16}/></button>
             </div>
          </div>

          <div className="flex items-center gap-2">
             <span className="text-xs text-slate-400 hidden sm:inline mr-2">
               {blocks.length} blocks • Autosaved
             </span>
             <button 
               onClick={() => setView('list')}
               className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-rose-500 transition-colors text-xs font-bold"
             >
               Cancel
             </button>
             <button 
               onClick={handleSaveTemplate}
               disabled={isSaving}
               className="flex items-center gap-2 px-3 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-500 transition-all text-xs font-bold shadow-lg shadow-teal-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
             >
               {isSaving ? (
                 <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
               ) : (
                 <Save size={14} />
               )}
               <span className="hidden sm:inline">{isSaving ? 'Saving...' : 'Save'}</span>
             </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div 
          className="flex-1 overflow-y-auto p-4 lg:p-8 flex justify-center pb-20 lg:pb-8"
          style={{ backgroundColor: settings.backgroundColor }}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <div 
            className="bg-white transition-all duration-300 shadow-2xl relative min-h-[600px] mb-8"
            style={{ 
              width: window.innerWidth < 1024 || device === 'mobile' ? '100%' : `${settings.contentWidth}px`,
              maxWidth: device === 'mobile' ? '375px' : '600px',
              backgroundColor: settings.canvasColor 
            }}
          >
            {blocks.length === 0 && (
               <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 pointer-events-none border-2 border-dashed border-slate-200 m-4 rounded-xl">
                  <Box size={48} className="mb-2" />
                  <p className="text-sm">Add blocks to build your email</p>
               </div>
            )}

            {blocks.map((block) => (
              <div 
                key={block.id}
                onClick={(e) => { e.stopPropagation(); setSelectedBlockId(block.id); setMobileView('inspector'); }}
                className={`
                  relative group cursor-pointer border-2 transition-all
                  ${selectedBlockId === block.id ? 'border-teal-500 z-10' : 'border-transparent hover:border-teal-500/30'}
                `}
              >
                {/* Block Hover/Select Actions */}
                <div className={`
                   absolute -top-3 right-2 flex gap-1 bg-teal-600 text-white rounded shadow-lg p-0.5 z-20 transition-opacity
                   ${selectedBlockId === block.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                `}>
                   <button onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'up'); }} className="p-1 hover:bg-teal-500 rounded"><ArrowUp size={12}/></button>
                   <button onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'down'); }} className="p-1 hover:bg-teal-500 rounded"><ArrowDown size={12}/></button>
                   <button onClick={(e) => { e.stopPropagation(); duplicateBlock(block.id); }} className="p-1 hover:bg-teal-500 rounded"><Copy size={12}/></button>
                   <button onClick={(e) => { e.stopPropagation(); deleteBlock(block.id); }} className="p-1 hover:bg-rose-500 rounded bg-rose-600 ml-1"><Trash2 size={12}/></button>
                </div>
                
                {renderBlockPreview(block)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Right Sidebar: Inspector */}
      <div className={`
        w-full lg:w-80 flex-shrink-0 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-teal-900/30 flex flex-col z-20 shadow-xl overflow-y-auto custom-scrollbar
        ${mobileView === 'inspector' ? 'flex' : 'hidden'} lg:flex
      `}>
         <div className="p-5">
           {renderInspector()}
         </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-around items-center z-50">
         <button 
           onClick={() => setMobileView('tools')}
           className={`flex flex-col items-center gap-1 text-xs font-bold ${mobileView === 'tools' ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'}`}
         >
           <Palette size={20} /> Tools
         </button>
         <button 
           onClick={() => setMobileView('canvas')}
           className={`flex flex-col items-center gap-1 text-xs font-bold ${mobileView === 'canvas' ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'}`}
         >
           <Layers size={20} /> Canvas
         </button>
         <button 
           onClick={() => setMobileView('inspector')}
           className={`flex flex-col items-center gap-1 text-xs font-bold ${mobileView === 'inspector' ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'}`}
         >
           <PenTool size={20} /> Edit
         </button>
      </div>

    </div>
  );
};