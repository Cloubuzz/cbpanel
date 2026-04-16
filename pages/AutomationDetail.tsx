import React, { useCallback, useRef, useState } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Node,
  Edge,
  Connection,
  MarkerType,
  Handle,
  Position,
  NodeProps,
  Panel,
  ReactFlowInstance
} from 'reactflow';
import { 
  Mail, 
  MessageSquare, 
  Clock, 
  GitFork, 
  Save, 
  Play, 
  Users,
  Bell,
  Cpu,
  Layers,
  Zap,
  Database,
  ShoppingBag,
  Filter,
  X,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Settings2,
  CalendarClock,
  Plus,
  ArrowLeft
} from 'lucide-react';

// --- Types ---
type NodeData = {
  label: string;
  subLabel?: string;
  icon?: React.ElementType;
  config?: { filters?: string[] }; // Store configuration state
};

// --- Custom Node Components ---

// 1. Trigger Node (The Start)
const TriggerNode = ({ data, selected }: NodeProps<NodeData>) => {
  return (
    <div className={`relative min-w-[240px] rounded-2xl bg-white dark:bg-slate-900 border-2 transition-all duration-300 group
      ${selected 
        ? 'border-teal-500 shadow-md dark:shadow-[0_0_20px_rgba(45,212,191,0.4)]' 
        : 'border-teal-100 dark:border-teal-900/50 hover:border-teal-400/50'
      }
    `}>
      <div className="absolute -top-3 left-4 px-3 py-1 bg-teal-500 rounded-full text-[10px] font-bold text-white dark:text-slate-950 uppercase tracking-wider shadow-sm dark:shadow-neon-sm">
        Trigger
      </div>
      
      <div className="p-5 flex items-start gap-4">
        <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 shadow-inner ring-1 ring-teal-500/20">
          {data.icon ? <data.icon size={24} /> : <Zap size={24} />}
        </div>
        <div>
          <h3 className="text-slate-900 dark:text-slate-100 font-bold text-sm leading-tight">{data.label}</h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">{data.subLabel || "Starts the journey"}</p>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-teal-500 !w-3 !h-3 !border-2 !border-white dark:!border-slate-900" />
    </div>
  );
};

// 2. Data/Segment Node (The Filter/Narrowing)
const SegmentNode = ({ data, selected }: NodeProps<NodeData>) => {
  return (
    <div className={`relative min-w-[240px] rounded-2xl bg-white dark:bg-slate-900 border-2 transition-all duration-300
      ${selected 
        ? 'border-rose-500 shadow-md dark:shadow-[0_0_20px_rgba(244,63,94,0.4)]' 
        : 'border-rose-100 dark:border-rose-900/50 hover:border-rose-400/50'
      }
    `}>
      <Handle type="target" position={Position.Top} className="!bg-rose-500 !w-3 !h-3 !border-2 !border-white dark:!border-slate-900" />
      
      <div className="absolute -top-3 left-4 px-3 py-1 bg-rose-500 rounded-full text-[10px] font-bold text-white uppercase tracking-wider shadow-sm dark:shadow-[0_0_10px_rgba(244,63,94,0.5)]">
        Data Segment
      </div>

      <div className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-500 dark:text-rose-400">
            {data.icon ? <data.icon size={20} /> : <Database size={20} />}
          </div>
          <span className="text-rose-600 dark:text-rose-200 font-semibold text-sm">Audience Filter</span>
        </div>
        
        <div className="bg-slate-50 dark:bg-slate-950/50 rounded-lg p-3 border border-rose-100 dark:border-rose-900/30">
           <h3 className="text-slate-800 dark:text-slate-200 font-bold text-sm">{data.label}</h3>
           {/* Mock Visualization of Active Filters */}
           {data.config?.filters ? (
             <div className="mt-2 space-y-1">
               {data.config.filters.map((f: string, i: number) => (
                 <div key={i} className="flex items-center gap-1.5 text-[10px] text-rose-600 dark:text-rose-300/80 bg-rose-100 dark:bg-rose-900/20 px-2 py-1 rounded">
                   <CheckCircle2 size={10} />
                   <span>{f}</span>
                 </div>
               ))}
             </div>
           ) : (
             <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500 italic">
               <AlertCircle size={12} />
               <span>Click to configure filters</span>
             </div>
           )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-rose-500 !w-3 !h-3 !border-2 !border-white dark:!border-slate-900" />
    </div>
  );
};

// 3. Action Node (The Output)
const ActionNode = ({ data, selected }: NodeProps<NodeData>) => {
  return (
    <div className={`relative min-w-[200px] rounded-2xl bg-white dark:bg-slate-900 border-2 transition-all duration-300
      ${selected 
        ? 'border-blue-500 shadow-md dark:shadow-[0_0_20px_rgba(59,130,246,0.4)]' 
        : 'border-blue-100 dark:border-blue-900/50 hover:border-blue-400/50'
      }
    `}>
      <Handle type="target" position={Position.Top} className="!bg-blue-500 !w-3 !h-3 !border-2 !border-white dark:!border-slate-900" />
      
      <div className="p-4 flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-lg">
          {data.icon ? <data.icon size={18} /> : <Mail size={18} />}
        </div>
        <div>
          <h3 className="text-slate-900 dark:text-slate-100 font-bold text-sm">{data.label}</h3>
          <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mt-0.5">Action</p>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-blue-500 !w-3 !h-3 !border-2 !border-white dark:!border-slate-900" />
    </div>
  );
};

const nodeTypes = {
  triggerNode: TriggerNode,
  segmentNode: SegmentNode,
  actionNode: ActionNode,
};

// --- Mock Initial Data (Complex Zoomed Out Workflow) ---
const initialNodes: Node[] = [
  // 1. Root Trigger
  {
    id: '1',
    type: 'triggerNode',
    data: { label: 'Cart Abandoned', subLabel: 'User leaves checkout', icon: ShoppingBag },
    position: { x: 450, y: 0 },
  },
  // 2. Logic Split
  {
    id: '2',
    type: 'segmentNode',
    data: { 
      label: 'High Value Cart', 
      icon: Database,
      config: { filters: ['Cart > RS 100', 'Currency = PKR'] } 
    },
    position: { x: 450, y: 200 },
  },
  
  // --- Left Branch (High Value) ---
  {
    id: '3',
    type: 'actionNode',
    data: { label: 'Send VIP Discount', icon: Mail },
    position: { x: 100, y: 450 },
  },
  {
    id: '4',
    type: 'actionNode',
    data: { label: 'Wait 4 Hours', icon: Clock },
    position: { x: 100, y: 620 },
  },
  {
    id: '5',
    type: 'actionNode',
    data: { label: 'SMS Reminder', icon: MessageSquare },
    position: { x: 100, y: 790 },
  },
  {
    id: '5b',
    type: 'actionNode',
    data: { label: 'Wait 1 Day', icon: Clock },
    position: { x: 100, y: 960 },
  },
  {
    id: '5c',
    type: 'actionNode',
    data: { label: 'Last Chance Email', icon: Mail },
    position: { x: 100, y: 1130 },
  },

  // --- Right Branch (Standard) ---
  {
    id: '6',
    type: 'actionNode',
    data: { label: 'Send Nudge Email', icon: Mail },
    position: { x: 800, y: 450 },
  },
  {
    id: '7',
    type: 'actionNode',
    data: { label: 'Wait 24 Hours', icon: Clock },
    position: { x: 800, y: 620 },
  },
  {
    id: '8',
    type: 'actionNode',
    data: { label: 'Push Notification', icon: Bell },
    position: { x: 800, y: 790 },
  },
  {
    id: '9',
    type: 'segmentNode',
    data: { label: 'Check: Purchased?', icon: ShoppingBag, config: { filters: ['Order Count > 0'] } },
    position: { x: 800, y: 960 },
  },
  {
    id: '10',
    type: 'actionNode',
    data: { label: 'Send Survey', icon: MessageSquare },
    position: { x: 1150, y: 1200 }, // Far right branch
  },
  {
    id: '11',
    type: 'actionNode',
    data: { label: 'Exit Flow', icon: X },
    position: { x: 600, y: 1200 }, // Middle termination
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', type: 'smoothstep', animated: true, style: { stroke: '#94a3b8', strokeWidth: 2 } },
  
  // Left Branch (Yes)
  { id: 'e2-3', source: '2', target: '3', type: 'smoothstep', label: 'Yes', animated: true, style: { stroke: '#2dd4bf', strokeWidth: 2 } },
  { id: 'e3-4', source: '3', target: '4', type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } },
  { id: 'e4-5', source: '4', target: '5', type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } },
  { id: 'e5-5b', source: '5', target: '5b', type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } },
  { id: 'e5b-5c', source: '5b', target: '5c', type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } },

  // Right Branch (No)
  { id: 'e2-6', source: '2', target: '6', type: 'smoothstep', label: 'No', animated: true, style: { stroke: '#f43f5e', strokeWidth: 2 } },
  { id: 'e6-7', source: '6', target: '7', type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } },
  { id: 'e7-8', source: '7', target: '8', type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } },
  { id: 'e8-9', source: '8', target: '9', type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } },
  
  // Sub-branch on right
  { id: 'e9-10', source: '9', target: '10', type: 'smoothstep', label: 'Yes', style: { stroke: '#2dd4bf', strokeWidth: 2 } },
  { id: 'e9-11', source: '9', target: '11', type: 'smoothstep', label: 'No', style: { stroke: '#f43f5e', strokeWidth: 2 } },
];

let id = 0;
const getId = () => `dndnode_${id++}`;

// --- Helper Components ---

interface DraggableBlockProps {
  label: string;
  subLabel?: string;
  icon: React.ReactNode;
  onDragStart: (event: React.DragEvent) => void;
  color: 'teal' | 'rose' | 'blue' | 'amber';
  compact?: boolean;
}

const DraggableBlock: React.FC<DraggableBlockProps> = ({ label, subLabel, icon, onDragStart, color, compact }) => {
  const colorStyles = {
    teal: 'bg-teal-50 dark:bg-teal-950/30 border-teal-200 dark:border-teal-900/50 hover:border-teal-500 text-teal-700 dark:text-teal-400 group-hover:text-teal-600 dark:group-hover:text-teal-200',
    rose: 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50 hover:border-rose-500 text-rose-700 dark:text-rose-400 group-hover:text-rose-600 dark:group-hover:text-rose-200',
    blue: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/50 hover:border-blue-500 text-blue-700 dark:text-blue-400 group-hover:text-blue-600 dark:group-hover:text-blue-200',
    amber: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50 hover:border-amber-500 text-amber-700 dark:text-amber-400 group-hover:text-amber-600 dark:group-hover:text-amber-200',
  };

  return (
    <div 
      className={`
        relative border rounded-xl cursor-grab active:cursor-grabbing transition-all duration-300 group
        ${colorStyles[color]}
        ${compact ? 'p-3' : 'p-3.5'}
        hover:shadow-lg hover:-translate-y-0.5 bg-opacity-50 dark:bg-opacity-100
      `}
      draggable
      onDragStart={onDragStart}
    >
      <div className="flex items-center gap-3">
        <div className={`p-1.5 rounded-md bg-white dark:bg-slate-950/50 shadow-sm ${compact ? 'hidden' : ''}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-black dark:group-hover:text-white truncate">{label}</p>
          {subLabel && <p className="text-[10px] text-slate-500 truncate mt-0.5">{subLabel}</p>}
        </div>
        {compact && <div className="text-current opacity-70">{icon}</div>}
      </div>
      
      {/* Drag Indicator */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <MoreVertical size={12} className="text-slate-400 dark:text-slate-500" />
      </div>
    </div>
  );
};

interface AutomationDetailProps {
  automationId?: string;
  onBack: () => void;
}

const AutomationDetailContent: React.FC<AutomationDetailProps> = ({ automationId, onBack }) => {
  const [isSaving, setIsSaving] = useState(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ 
      ...params, 
      type: 'smoothstep',
      markerEnd: { type: MarkerType.ArrowClosed }, 
      style: { stroke: '#94a3b8', strokeWidth: 2 },
      animated: true
    }, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      const label = event.dataTransfer.getData('application/label');
      const meta = event.dataTransfer.getData('application/meta'); // 'trigger' | 'segment' | 'action'

      if (typeof type === 'undefined' || !type) {
        return;
      }

      if (!reactFlowInstance) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      
      let nodeType = 'default';
      let icon = null;

      // Map icons based on label (simplified for demo)
      if (label.includes('Customer')) icon = Users;
      if (label.includes('Cart')) icon = ShoppingBag;
      if (label.includes('Email')) icon = Mail;
      if (label.includes('Segment')) icon = Database;
      if (label.includes('Schedule')) icon = CalendarClock;

      if (meta === 'trigger') nodeType = 'triggerNode';
      else if (meta === 'segment') nodeType = 'segmentNode';
      else if (meta === 'action') nodeType = 'actionNode';

      const newNode: Node = {
        id: getId(),
        type: nodeType,
        position,
        data: { label, icon },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const onDragStart = (event: React.DragEvent, nodeType: string, label: string, meta: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/label', label);
    event.dataTransfer.setData('application/meta', meta);
    event.dataTransfer.effectAllowed = 'move';
  };

  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  };

  const onPaneClick = () => {
    setSelectedNode(null);
  };

  const handleSave = async (isPublish: boolean = false) => {
    setIsSaving(true);
    const payload = {
      type: 'automation',
      action: isPublish ? 'publish' : 'save_draft',
      data: {
        id: automationId,
        nodes,
        edges
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
        alert(`Automation ${isPublish ? 'published' : 'saved as draft'} and submitted successfully!`);
      } else {
        throw new Error('Failed to submit to webhook');
      }
    } catch (error) {
      console.error('Error saving automation:', error);
      alert(`Automation ${isPublish ? 'published' : 'saved'} locally, but webhook submission failed.`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-slate-50 dark:bg-slate-950 relative">
      
      {/* 1. Left Sidebar: Builder Toolkit */}
      <div className="w-80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-r border-slate-200 dark:border-teal-900/30 flex flex-col z-10 shadow-lg dark:shadow-[5px_0_30px_rgba(0,0,0,0.5)]">
        
        <div className="p-5 border-b border-slate-200 dark:border-teal-900/30 bg-slate-50/50 dark:bg-slate-900/50">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-500 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400 transition-colors mb-4 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-medium">Back to Automations</span>
          </button>
          <div className="flex items-center gap-2">
            <Layers className="text-teal-600 dark:text-teal-400" size={20} />
            <h2 className="text-lg font-bold text-slate-800 dark:text-white tracking-wide">
              {automationId ? 'Edit Automation' : 'New Automation'}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">Drag blocks to build your flow</p>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-8 scrollbar-hide">
          
          {/* Section: Triggers */}
          <div>
            <h3 className="text-[11px] font-bold text-teal-600 dark:text-teal-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Zap size={12} /> Triggers
            </h3>
            <div className="grid grid-cols-1 gap-2">
              <DraggableBlock 
                label="New Customer" 
                icon={<Users size={16} />} 
                onDragStart={(e) => onDragStart(e, 'triggerNode', 'New Customer', 'trigger')}
                color="teal"
              />
              <DraggableBlock 
                label="Cart Abandoned" 
                icon={<ShoppingBag size={16} />} 
                onDragStart={(e) => onDragStart(e, 'triggerNode', 'Cart Abandoned', 'trigger')}
                color="teal"
              />
              <DraggableBlock 
                label="Scheduled Time" 
                subLabel="Start at specific date/time"
                icon={<CalendarClock size={16} />} 
                onDragStart={(e) => onDragStart(e, 'triggerNode', 'Scheduled Start', 'trigger')}
                color="teal"
              />
            </div>
          </div>

          {/* Section: Data Intelligence (NEW) */}
          <div className="relative">
            <div className="absolute -left-5 top-0 bottom-0 w-[2px] bg-gradient-to-b from-rose-500/0 via-rose-500/50 to-rose-500/0"></div>
            <h3 className="text-[11px] font-bold text-rose-600 dark:text-rose-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Database size={12} /> Data Segments
            </h3>
            <p className="text-[10px] text-slate-500 mb-3 leading-tight">
              Narrow down your audience using advanced logic filters.
            </p>
            <div className="grid grid-cols-1 gap-2">
              <DraggableBlock 
                label="Customer Segment" 
                subLabel="Filter by attributes & behavior"
                icon={<Filter size={16} />} 
                onDragStart={(e) => onDragStart(e, 'segmentNode', 'Customer Segment', 'segment')}
                color="rose"
              />
              <DraggableBlock 
                label="Product Segment" 
                subLabel="Filter by purchase history"
                icon={<ShoppingBag size={16} />} 
                onDragStart={(e) => onDragStart(e, 'segmentNode', 'Product Segment', 'segment')}
                color="rose"
              />
            </div>
          </div>

          {/* Section: Actions */}
          <div>
            <h3 className="text-[11px] font-bold text-blue-600 dark:text-blue-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Cpu size={12} /> Actions
            </h3>
            <div className="grid grid-cols-1 gap-2">
              <DraggableBlock 
                label="Send Email" 
                icon={<Mail size={16} />} 
                onDragStart={(e) => onDragStart(e, 'actionNode', 'Send Email', 'action')}
                color="blue"
              />
              <DraggableBlock 
                label="Send SMS" 
                icon={<MessageSquare size={16} />} 
                onDragStart={(e) => onDragStart(e, 'actionNode', 'Send SMS', 'action')}
                color="blue"
              />
               <DraggableBlock 
                label="Push Notification" 
                icon={<Bell size={16} />} 
                onDragStart={(e) => onDragStart(e, 'actionNode', 'Push Notification', 'action')}
                color="blue"
              />
            </div>
          </div>

           {/* Section: Logic */}
           <div>
            <h3 className="text-[11px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <GitFork size={12} /> Logic
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <DraggableBlock 
                label="Delay" 
                icon={<Clock size={16} />} 
                onDragStart={(e) => onDragStart(e, 'default', 'Wait', 'logic')}
                color="amber"
                compact
              />
              <DraggableBlock 
                label="Split" 
                icon={<GitFork size={16} />} 
                onDragStart={(e) => onDragStart(e, 'default', 'Split', 'logic')}
                color="amber"
                compact
              />
            </div>
          </div>

        </div>
      </div>

      {/* 2. Main Canvas */}
      <div className="flex-1 h-full bg-slate-50 dark:bg-slate-950 relative" ref={reactFlowWrapper}>
        {/* Futuristic Background Grid (Dark) / Subtle Dot (Light) */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] opacity-50 dark:opacity-20"></div>
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_800px_at_50%_200px,#ccfbf1,transparent)] dark:bg-[radial-gradient(circle_800px_at_50%_200px,#115e59,transparent)] opacity-40 dark:opacity-20"></div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.2}
          className="bg-transparent"
        >
          <Controls className="!bg-white dark:!bg-slate-900 !border-slate-200 dark:!border-slate-800 !fill-teal-600 dark:!fill-teal-400 !rounded-xl overflow-hidden shadow-lg" />
          <MiniMap 
            className="!bg-white dark:!bg-slate-900 !border-slate-200 dark:!border-slate-800 !rounded-xl overflow-hidden shadow-xl !bottom-8 !right-8" 
            maskColor="rgba(2, 6, 23, 0.1)"
            nodeColor={(n) => {
              if (n.type === 'triggerNode') return '#2dd4bf';
              if (n.type === 'segmentNode') return '#f43f5e';
              if (n.type === 'actionNode') return '#3b82f6';
              return '#64748b';
            }}
          />
          <Panel position="top-right" className="flex gap-3 mr-4 mt-4">
             <button 
                onClick={() => handleSave(false)}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur text-slate-700 dark:text-slate-300 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 hover:border-teal-500/50 hover:text-teal-600 dark:hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
             >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
            </button>
            <button 
                onClick={() => handleSave(true)}
                disabled={isSaving}
                className="flex items-center gap-2 px-5 py-2 bg-teal-600 text-white rounded-lg shadow-md hover:bg-teal-500 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Play size={16} />
                )}
                <span>{isSaving ? 'Publishing...' : 'Publish Journey'}</span>
            </button>
          </Panel>
        </ReactFlow>
      </div>

      {/* 3. Right Configuration Panel (Slide-in) */}
      <div 
        className={`absolute top-0 right-0 bottom-0 w-96 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-l border-slate-200 dark:border-teal-900/30 shadow-2xl transform transition-transform duration-300 z-20 flex flex-col
          ${selectedNode ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {selectedNode ? (
          <>
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
               <div className="flex items-center gap-3">
                 <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    {selectedNode.type === 'segmentNode' ? <Database size={18} className="text-rose-500" /> : <Settings2 size={18} className="text-teal-600 dark:text-teal-500"/>}
                 </div>
                 <div>
                   <h3 className="text-slate-900 dark:text-white font-bold">Configure Block</h3>
                   <p className="text-xs text-slate-500 dark:text-slate-400">{selectedNode.data.label}</p>
                 </div>
               </div>
               <button onClick={() => setSelectedNode(null)} className="text-slate-500 hover:text-slate-900 dark:hover:text-white"><X size={20}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {/* Dynamic Content based on Node Type */}
              {selectedNode.type === 'segmentNode' ? (
                <div className="space-y-6">
                  <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 rounded-xl p-4">
                    <h4 className="text-rose-600 dark:text-rose-400 text-xs font-bold uppercase tracking-widest mb-3">Define Audience Logic</h4>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">Select users who match the following criteria:</p>
                    
                    {/* Mock Filter Builder */}
                    <div className="space-y-3">
                       <div className="flex items-center gap-2">
                          <select className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs rounded-lg p-2 w-1/3 outline-none focus:border-rose-500">
                            <option>Total Spend</option>
                            <option>Last Visit</option>
                            <option>Product Tag</option>
                          </select>
                          <select className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs rounded-lg p-2 w-1/4 outline-none focus:border-rose-500">
                            <option>Greater than</option>
                            <option>Equals</option>
                          </select>
                          <input type="text" value="RS 500" className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs rounded-lg p-2 w-1/3 outline-none focus:border-rose-500" />
                       </div>
                       
                       <div className="flex items-center gap-2">
                          <select className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs rounded-lg p-2 w-1/3 outline-none focus:border-rose-500">
                            <option>Location</option>
                          </select>
                          <select className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs rounded-lg p-2 w-1/4 outline-none focus:border-rose-500">
                            <option>Is</option>
                          </select>
                          <input type="text" value="New York" className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs rounded-lg p-2 w-1/3 outline-none focus:border-rose-500" />
                       </div>

                       <button className="w-full py-2 border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 text-xs rounded-lg hover:border-rose-500 hover:text-rose-500 transition-colors flex items-center justify-center gap-2 mt-2">
                         <Plus size={14} /> Add AND Rule
                       </button>
                    </div>
                  </div>

                  <div className="bg-slate-100 dark:bg-slate-800/50 rounded-xl p-4">
                     <div className="flex justify-between items-center mb-2">
                       <span className="text-slate-600 dark:text-slate-300 text-sm font-medium">Estimated Reach</span>
                       <span className="text-emerald-600 dark:text-emerald-400 text-sm font-bold">~1,240 Users</span>
                     </div>
                     <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                       <div className="bg-emerald-500 h-full w-[45%]"></div>
                     </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-slate-400 dark:text-slate-500 mt-10">
                   <Settings2 size={48} className="mx-auto mb-4 opacity-50 dark:opacity-20" />
                   <p>Configuration options for <b>{selectedNode.data.label}</b> would appear here.</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-200 dark:border-slate-800">
               <button className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl shadow-lg shadow-teal-900/20 transition-all">
                 Apply Changes
               </button>
            </div>
          </>
        ) : null}
      </div>

    </div>
  );
};

export const AutomationDetail: React.FC<AutomationDetailProps> = (props) => (
  <ReactFlowProvider>
    <AutomationDetailContent {...props} />
  </ReactFlowProvider>
);
