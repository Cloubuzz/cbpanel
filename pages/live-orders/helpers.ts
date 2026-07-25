import React from 'react';
import { Clock, CheckCircle2, CreditCard, Ban, AlertCircle, XCircle } from 'lucide-react';
import type { OrderTab } from '../../services/ordersApi';

export const getRelativeTime = (isoString: string): string => {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} Min${diffMins > 1 ? 's' : ''}`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs} Hr${diffHrs > 1 ? 's' : ''}`;
  return `${Math.floor(diffHrs / 24)}d`;
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'Confirmed': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    case 'Accepted':  return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    case 'Pending':   return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    case 'Rejected':  return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
    default:          return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
  }
};

export interface TabConfig {
  id: OrderTab;
  label: string;
  icon: React.ReactNode;
}

export const TABS: TabConfig[] = [
  { id: 'Pending',          label: 'Pending',  icon: React.createElement(Clock, { size: 20 }) },
  { id: 'Accepted',         label: 'Accepted', icon: React.createElement(CheckCircle2, { size: 20 }) },
  { id: 'CreditCard',       label: 'Card',     icon: React.createElement(CreditCard, { size: 20 }) },
  { id: 'Rejected',         label: 'Rejected', icon: React.createElement(Ban, { size: 20 }) },
  { id: 'POS',              label: 'POS',      icon: React.createElement(AlertCircle, { size: 20 }) },
  { id: 'UndefinedDecline', label: 'Declined', icon: React.createElement(XCircle, { size: 20 }) },
];
