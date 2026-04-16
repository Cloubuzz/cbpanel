import { ReactNode } from 'react';

export type View = 
  | 'dashboard' 
  | 'automations' 
  | 'automation-detail' 
  | 'campaigns' 
  | 'segments' 
  | 'settings' 
  | 'analytics' 
  | 'email-manager' 
  | 'whatsapp-manager' 
  | 'chat' 
  | 'live-orders'
  | 'menus'
  | 'categories'
  | 'menu-items'
  | 'modifiers'
  | 'reports'
  | 'report-detail'
  | 'outlets'
  | 'outlet-detail'
  | 'banners'
  | 'vouchers'
  | 'discounts'
  | 'marketing'
  | 'help-desk';

export type TicketStatus = 'open' | 'in-progress' | 'resolved';

export interface NavItem {
  id: View | 'menu-manager';
  label: string;
  icon: ReactNode;
  subItems?: { id: View; label: string }[];
}

export interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  icon: ReactNode;
  color?: string;
}

export interface ActivityItem {
  id: number;
  user: string;
  action: string;
  time: string;
  type: 'campaign' | 'segment' | 'system';
}

export interface JourneyNodeData {
  label: string;
  type?: string;
}