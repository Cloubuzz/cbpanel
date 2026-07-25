import React from 'react';
import { DollarSign, ShoppingBag, Users, Truck, XCircle } from 'lucide-react';
import { MetricCard } from './MetricCard';
import type { DashboardSalesRevenue, DashboardSalesCount, DashboardCustomers, DashboardRejectedCount, DashboardRejectedRevenue } from '../../../services/dashboardApi';

interface Props {
  salesRevenue: DashboardSalesRevenue | null;
  salesCount: DashboardSalesCount | null;
  customers: DashboardCustomers | null;
  rejectedCount: DashboardRejectedCount | null;
  rejectedRevenue: DashboardRejectedRevenue | null;
  isLoading: boolean;
}

const toNum = (v: number | Record<string, never>): number | null =>
  typeof v === 'number' ? v : null;

const pct = (n: number) => `${n > 0 ? '+' : ''}${n}%`;

export const KPIRow: React.FC<Props> = ({ salesRevenue, salesCount, customers, rejectedCount, rejectedRevenue, isLoading }) => {
  const totalSales = salesRevenue ? toNum(salesRevenue.TotalSales) : null;
  const totalOrders = salesCount ? toNum(salesCount.TotalOrders) : null;
  const totalCustomers = customers ? toNum(customers.TotalCustomers) : null;
  const totalRejected = rejectedCount ? toNum(rejectedCount.TotalRejected) : null;
  const totalRejectedAmount = rejectedRevenue ? toNum(rejectedRevenue.TotalRejectedAmount) : null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      <MetricCard
        title="Sales"
        value={totalSales !== null ? `RS ${(totalSales / 1_000_000).toFixed(1)}M` : '—'}
        trend={salesRevenue && toNum(salesRevenue.ChangePercent) != null ? pct(toNum(salesRevenue.ChangePercent)!) : undefined}
        trendUp={salesRevenue && toNum(salesRevenue.ChangePercent) != null ? toNum(salesRevenue.ChangePercent)! >= 0 : undefined}
        icon={<DollarSign size={16} />}
        isLoading={isLoading}
      />
      <MetricCard
        title="Orders"
        value={totalOrders !== null ? totalOrders.toLocaleString() : '—'}
        trend={salesCount && toNum(salesCount.ChangePercent) != null ? pct(toNum(salesCount.ChangePercent)!) : undefined}
        trendUp={salesCount && toNum(salesCount.ChangePercent) != null ? toNum(salesCount.ChangePercent)! >= 0 : undefined}
        icon={<ShoppingBag size={16} />}
        isLoading={isLoading}
      />
      <MetricCard
        title="Customers"
        value={totalCustomers !== null ? totalCustomers.toLocaleString() : '—'}
        trend={customers && toNum(customers.ChangePercent) != null ? pct(toNum(customers.ChangePercent)!) : undefined}
        trendUp={customers && toNum(customers.ChangePercent) != null ? toNum(customers.ChangePercent)! >= 0 : undefined}
        icon={<Users size={16} />}
        isLoading={isLoading}
      />
      <MetricCard
        title="Rejected Orders"
        value={totalRejected !== null ? totalRejected.toLocaleString() : '—'}
        trend={rejectedCount && toNum(rejectedCount.ChangePercent) != null ? pct(toNum(rejectedCount.ChangePercent)!) : undefined}
        trendUp={rejectedCount && toNum(rejectedCount.ChangePercent) != null ? toNum(rejectedCount.ChangePercent)! <= 0 : undefined}
        icon={<Truck size={16} />}
        isLoading={isLoading}
      />
      <MetricCard
        title="Rejected Revenue"
        value={totalRejectedAmount !== null ? `RS ${(totalRejectedAmount / 1000).toFixed(1)}k` : '—'}
        trend={rejectedRevenue && toNum(rejectedRevenue.ChangePercent) != null ? pct(toNum(rejectedRevenue.ChangePercent)!) : undefined}
        trendUp={rejectedRevenue && toNum(rejectedRevenue.ChangePercent) != null ? toNum(rejectedRevenue.ChangePercent)! <= 0 : undefined}
        icon={<XCircle size={16} />}
        isLoading={isLoading}
      />
    </div>
  );
};
