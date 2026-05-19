import React from 'react';
import { DollarSign, ShoppingBag, Users, Truck, XCircle } from 'lucide-react';
import { MetricCard } from './MetricCard';
import type { DashboardState } from '../hooks/useDashboardData';

type Props = Pick<DashboardState, 'salesRevenue' | 'salesCount' | 'customers' | 'rejectedCount' | 'rejectedRevenue' | 'isLoading'>;

const pct = (n: number) => `${n > 0 ? '+' : ''}${n}%`;

export const KPIRow: React.FC<Props> = ({ salesRevenue, salesCount, customers, rejectedCount, rejectedRevenue, isLoading }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
    <MetricCard
      title="Sales"
      value={salesRevenue ? `RS ${(salesRevenue.TotalSales / 1_000_000).toFixed(1)}M` : '—'}
      trend={salesRevenue ? pct(salesRevenue.ChangePercent) : undefined}
      trendUp={salesRevenue ? salesRevenue.ChangePercent >= 0 : undefined}
      icon={<DollarSign size={16} />}
      isLoading={isLoading}
    />
    <MetricCard
      title="Orders"
      value={salesCount ? salesCount.TotalOrders.toLocaleString() : '—'}
      trend={salesCount ? pct(salesCount.ChangePercent) : undefined}
      trendUp={salesCount ? salesCount.ChangePercent >= 0 : undefined}
      icon={<ShoppingBag size={16} />}
      isLoading={isLoading}
    />
    <MetricCard
      title="Customers"
      value={customers ? customers.TotalCustomers.toLocaleString() : '—'}
      trend={customers ? pct(customers.ChangePercent) : undefined}
      trendUp={customers ? customers.ChangePercent >= 0 : undefined}
      icon={<Users size={16} />}
      isLoading={isLoading}
    />
    <MetricCard
      title="Rejected Orders"
      value={rejectedCount ? rejectedCount.TotalRejected.toLocaleString() : '—'}
      trend={rejectedCount ? pct(rejectedCount.ChangePercent) : undefined}
      trendUp={rejectedCount ? rejectedCount.ChangePercent <= 0 : undefined}
      icon={<Truck size={16} />}
      isLoading={isLoading}
    />
    <MetricCard
      title="Rejected Revenue"
      value={rejectedRevenue ? `RS ${(rejectedRevenue.TotalRejectedAmount / 1000).toFixed(1)}k` : '—'}
      trend={rejectedRevenue ? pct(rejectedRevenue.ChangePercent) : undefined}
      trendUp={rejectedRevenue ? rejectedRevenue.ChangePercent <= 0 : undefined}
      icon={<XCircle size={16} />}
      isLoading={isLoading}
    />
  </div>
);
