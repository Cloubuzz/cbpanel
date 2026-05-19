import React, { useState } from 'react';
import { useAppSelector } from '../../store/hooks';
import { selectToken } from '../../store/selectors/appSelectors';
import { useDashboardData } from './hooks/useDashboardData';
import { DashboardHeader } from './components/DashboardHeader';
import { KPIRow } from './components/KPIRow';
import { HourlyPerformanceChart } from './components/HourlyPerformanceChart';
import { TopSellingChart } from './components/TopSellingChart';
import { BranchBenchmarkingChart } from './components/BranchBenchmarkingChart';
import { OrderChannelsChart } from './components/OrderChannelsChart';
import { PaymentSplitChart } from './components/PaymentSplitChart';
import { PrepTimeTrendChart } from './components/PrepTimeTrendChart';
import { CustomerLoyaltyChart } from './components/CustomerLoyaltyChart';
import { StoreTrafficChart } from './components/StoreTrafficChart';
import { OrderFulfillmentChart } from './components/OrderFulfillmentChart';
import { AOVChart } from './components/AOVChart';
import { BranchPerformanceTable } from './components/BranchPerformanceTable';
import { LiveKitchenMonitor } from './components/LiveKitchenMonitor';

export const Dashboard: React.FC = () => {
  const token = useAppSelector(selectToken);
  const [dateFilter, setDateFilter] = useState('Last 7 Days');
  const data = useDashboardData(token, dateFilter);

  return (
    <div className="p-3 md:p-6 space-y-4 animate-fade-in pb-20 bg-slate-50 dark:bg-slate-950 min-h-screen font-sans">
      <DashboardHeader dateFilter={dateFilter} onDateFilterChange={setDateFilter} />

      <KPIRow
        salesRevenue={data.salesRevenue}
        salesCount={data.salesCount}
        customers={data.customers}
        rejectedCount={data.rejectedCount}
        rejectedRevenue={data.rejectedRevenue}
        isLoading={data.isLoading}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <HourlyPerformanceChart data={data.hourlyData} isLoading={data.isLoading} />

        {/* Top Selling + Benchmarking sidebar */}
        <div className="lg:col-span-4 glass-card rounded-xl p-5 border border-slate-200 dark:border-slate-800">
          <TopSellingChart data={data.topSelling} isLoading={data.isLoading} />
        </div>

        <BranchBenchmarkingChart />

        <OrderChannelsChart data={data.orderChannels} isLoading={data.isLoading} />

        <PaymentSplitChart data={data.paymentSplit} isLoading={data.isLoading} />

        <PrepTimeTrendChart />

        <CustomerLoyaltyChart data={data.customerLoyalty} isLoading={data.isLoading} />

        <StoreTrafficChart />

        <OrderFulfillmentChart data={data.orderFulfillment} isLoading={data.isLoading} />

        <AOVChart data={data.aovData} isLoading={data.isLoading} />

        <BranchPerformanceTable data={data.branchPerformance} isLoading={data.isLoading} />

        <LiveKitchenMonitor />
      </div>

      <style>{`@keyframes progress { from { width: 0%; } to { width: 100%; } }`}</style>
    </div>
  );
};
