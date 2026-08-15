import React from 'react';
import { DollarSign, ShoppingBag, TrendingUp, CheckCircle, UserPlus, RefreshCw, XCircle, AlertOctagon } from 'lucide-react';
import { MetricCard } from './MetricCard';
import type {
  DashboardSalesRevenue,
  DashboardSalesCount,
  DashboardRejectedCount,
  DashboardRejectedRevenue,
  DashboardAOVBox,
  DashboardSuccessRateBox,
  DashboardNewOrdersBox,
} from '../../../services/dashboardApi';

interface Props {
  salesRevenue: DashboardSalesRevenue | null;
  salesCount: DashboardSalesCount | null;
  rejectedCount: DashboardRejectedCount | null;
  rejectedRevenue: DashboardRejectedRevenue | null;
  aovBox: DashboardAOVBox | null;
  successRateBox: DashboardSuccessRateBox | null;
  newOrdersBox: DashboardNewOrdersBox | null;
  isLoading: boolean;
}

const toNum = (v: number | Record<string, never> | undefined): number | null => {
  if (v === undefined) return null;
  return typeof v === 'number' ? v : null;
};

//const pct = (n: number) => `${Math.abs(n).toFixed(1)}%`;

// const getSparkline = (trendUp: boolean, seed: number) => {
//   const points = [];
//   let current = 50;
//   points.push({ val: current });
//   for (let i = 1; i <= 10; i++) {
//     const fluctuation = Math.sin(i * seed) * 12;
//     const trend = trendUp ? i * 2.5 : -i * 2.5;
//     points.push({ val: Math.max(10, current + fluctuation + trend) });
//   }
//   return points;
// };

export const KPIRow: React.FC<Props> = ({
  salesRevenue,
  salesCount,
  rejectedCount,
  rejectedRevenue,
  aovBox,
  successRateBox,
  newOrdersBox,
  isLoading,
}) => {
  // Extract values
  const totalSales = salesRevenue ? toNum(salesRevenue.TotalSales) : null;
  //const salesTrend = salesRevenue ? toNum(salesRevenue.ChangePercent) : null;

  const totalOrders = salesCount ? toNum(salesCount.TotalOrders) : null;
  //const ordersTrend = salesCount ? toNum(salesCount.ChangePercent) : null;

  const totalAOV = aovBox ? toNum(aovBox.TotalAOV) : null;
  //const aovTrend = aovBox ? toNum(aovBox.ChangePercent) : null;

  const successRate = successRateBox ? toNum(successRateBox.SuccessRate) : null;
  //const successTrend = successRateBox ? toNum(successRateBox.ChangePercent) : null;

  const newOrdersPercent = newOrdersBox ? toNum(newOrdersBox.NewOrdersPercent) : null;
  //const newOrdersTrend = newOrdersBox ? toNum(newOrdersBox.ChangePercent) : null;

  // Calculate repeat orders stats from new orders
  const repeatOrdersPercent = newOrdersPercent !== null ? 100 - newOrdersPercent : null;
  //const repeatOrdersTrend = newOrdersTrend !== null ? -newOrdersTrend : null;

  // Rejections
  const totalRejected = rejectedCount ? toNum(rejectedCount.TotalRejected) : null;
  //const rejectedTrend = rejectedCount ? toNum(rejectedCount.ChangePercent) : null;

  const totalRejectedAmount = rejectedRevenue ? toNum(rejectedRevenue.TotalRejectedAmount) : null;
  //const rejectedAmountTrend = rejectedRevenue ? toNum(rejectedRevenue.ChangePercent) : null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
      <MetricCard
        title="Sales"
        value={totalSales !== null ? `Rs. ${Math.round(totalSales).toLocaleString()}` : '—'}
        icon={<DollarSign size={16} />}
        isLoading={isLoading}
      />
      <MetricCard
        title="Orders"
        value={totalOrders !== null ? totalOrders.toLocaleString() : '0'}
        icon={<ShoppingBag size={16} />}
        isLoading={isLoading}
      />
      <MetricCard
        title="Avg Order"
        value={totalAOV !== null ? `Rs. ${Math.round(totalAOV).toLocaleString()}` : '—'}
        icon={<TrendingUp size={16} />}
        isLoading={isLoading}
      />
      <MetricCard
        title="Success Rate"
        value={successRate !== null ? `${successRate.toFixed(1)}%` : '—'}
        icon={<CheckCircle size={16} />}
        isLoading={isLoading}
      />
      <MetricCard
        title="New Orders"
        value={newOrdersPercent !== null ? `${newOrdersPercent.toFixed(2)}%` : '—'}
        icon={<UserPlus size={16} />}
        isLoading={isLoading}
      />
      <MetricCard
        title="Repeat Orders"
        value={repeatOrdersPercent !== null ? `${repeatOrdersPercent.toFixed(2)}%` : '—'}
        icon={<RefreshCw size={16} />}
        isLoading={isLoading}
      />
      <MetricCard
        title="Rejected Orders"
        value={totalRejected !== null ? totalRejected.toLocaleString() : '0'}
        icon={<XCircle size={16} />}
        isLoading={isLoading}
      />
      <MetricCard
        title="Rejected Revenue"
        value={totalRejectedAmount !== null ? `Rs. ${Math.round(totalRejectedAmount).toLocaleString()}` : '—'}
        icon={<AlertOctagon size={16} />}
        isLoading={isLoading}
      />
    </div>
  );
};
