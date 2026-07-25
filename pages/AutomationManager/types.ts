export interface Automation {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'draft';
  nodes: number;
  enrolled: number;
  completed: number;
  lastModified: string;
  type: 'marketing' | 'operational' | 'support';
}

export interface AutomationManagerProps {
  onAdd: () => void;
  onEdit: (id: string) => void;
}
