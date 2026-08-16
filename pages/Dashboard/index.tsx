import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../../store/hooks';
import { selectToken } from '../../store/selectors/appSelectors';
import { useDashboardData } from './hooks/useDashboardData';
import { DashboardHeader } from './components/DashboardHeader';
import { KPIRow } from './components/KPIRow';
import { ChartLoadGate } from './components/ChartLoadGate';
import { HourlyPerformanceChart } from './components/HourlyPerformanceChart';
import { TopSellingChart } from './components/TopSellingChart';
import { OrderChannelsChart } from './components/OrderChannelsChart';
import { PaymentSplitChart } from './components/PaymentSplitChart';
import { OrderFulfillmentChart } from './components/OrderFulfillmentChart';
import { AOVChart } from './components/AOVChart';
import { BranchPerformanceTable } from './components/BranchPerformanceTable';
import { SalesByCityChart } from './components/SalesByCityChart';
import { TopDeliveryAreasChart } from './components/TopDeliveryAreasChart';
import { ProductCombosChart } from './components/ProductCombosChart';
import { CustomerJourneyChart } from './components/CustomerJourneyChart';
import { fetchOutletList, type OutletListItem } from '../../services/outletsApi';

export const Dashboard: React.FC = () => {
  const token = useAppSelector(selectToken);
  const [dateFilter, setDateFilter] = useState('Last 7 Days');
  const [shiftStartHour, setShiftStartHour] = useState('08:00');
  const [branches, setBranches] = useState<OutletListItem[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);

  useEffect(() => {
    if (!token) return;
    fetchOutletList(token)
      .then(setBranches)
      .catch(err => console.error('Error fetching branches:', err));
  }, [token]);

  const { chartStatus, loadChart, refreshChart, kpiLoading, ...data } = useDashboardData(token, dateFilter, selectedBranchId, shiftStartHour);

  return (
    <div className="p-6 md:p-8 space-y-8 animate-fade-in pb-20 max-w-[1600px] mx-auto min-h-screen font-sans bg-slate-50 dark:bg-slate-950">
      <DashboardHeader
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        branches={branches}
        selectedBranchId={selectedBranchId}
        onBranchChange={setSelectedBranchId}
        shiftStartHour={shiftStartHour}
        onShiftStartHourChange={setShiftStartHour}
      />

      {/* KPI row — always loads on visit */}
      <KPIRow
        salesRevenue={data.salesRevenue}
        salesCount={data.salesCount}
        rejectedCount={data.rejectedCount}
        rejectedRevenue={data.rejectedRevenue}
        aovBox={data.aovBox}
        successRateBox={data.successRateBox}
        newOrdersBox={data.newOrdersBox}
        isLoading={kpiLoading}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        <ChartLoadGate
          status={chartStatus.hourly}
          onLoad={() => loadChart('hourly')} onRefresh={() => refreshChart('hourly')}
          title="Hourly Performance"
          colSpan="lg:col-span-8"
          height="h-[300px]"
        >
          <HourlyPerformanceChart data={data.hourlyData} isLoading={chartStatus.hourly === 'loading'} />
        </ChartLoadGate>

        <div className="lg:col-span-4 glass-card rounded-xl p-5 border border-slate-200 dark:border-slate-800">
          <ChartLoadGate
            status={chartStatus.topSelling}
            onLoad={() => loadChart('topSelling')} onRefresh={() => refreshChart('topSelling')}
            title="Top Selling Items"
            height="h-[260px]"
            inline
          >
            <TopSellingChart data={data.topSelling} isLoading={chartStatus.topSelling === 'loading'} />
          </ChartLoadGate>
        </div>

        <ChartLoadGate
          status={chartStatus.orderChannels}
          onLoad={() => loadChart('orderChannels')}
          onRefresh={() => refreshChart('orderChannels')}
          title="Order Channels"
          colSpan="lg:col-span-3"
        >
          <OrderChannelsChart data={data.orderChannels} isLoading={chartStatus.orderChannels === 'loading'} />
        </ChartLoadGate>

        <ChartLoadGate
          status={chartStatus.paymentSplit}
          onLoad={() => loadChart('paymentSplit')}
          onRefresh={() => refreshChart('paymentSplit')}
          title="Payment Split"
          colSpan="lg:col-span-3"
        >
          <PaymentSplitChart data={data.paymentSplit} isLoading={chartStatus.paymentSplit === 'loading'} />
        </ChartLoadGate>

        <ChartLoadGate
          status={chartStatus.salesByCity}
          onLoad={() => loadChart('salesByCity')}
          onRefresh={() => refreshChart('salesByCity')}
          title="Sales By City"
          colSpan="lg:col-span-3"
        >
          <SalesByCityChart data={data.salesByCity} isLoading={chartStatus.salesByCity === 'loading'} />
        </ChartLoadGate>

        <ChartLoadGate
          status={chartStatus.orderFulfillment}
          onLoad={() => loadChart('orderFulfillment')}
          onRefresh={() => refreshChart('orderFulfillment')}
          title="Order Fulfillment"
          colSpan="lg:col-span-3"
        >
          <OrderFulfillmentChart data={data.orderFulfillment} isLoading={chartStatus.orderFulfillment === 'loading'} />
        </ChartLoadGate>

        <ChartLoadGate
          status={chartStatus.topDeliveryAreas}
          onLoad={() => loadChart('topDeliveryAreas')}
          onRefresh={() => refreshChart('topDeliveryAreas')}
          title="Top Delivery Areas"
          colSpan="lg:col-span-4"
        >
          <TopDeliveryAreasChart data={data.topDeliveryAreas} isLoading={chartStatus.topDeliveryAreas === 'loading'} />
        </ChartLoadGate>

        <ChartLoadGate
          status={chartStatus.productCombos}
          onLoad={() => loadChart('productCombos')}
          onRefresh={() => refreshChart('productCombos')}
          title="Frequently Bought Together"
          colSpan="lg:col-span-4"
        >
          <ProductCombosChart data={data.productCombos} isLoading={chartStatus.productCombos === 'loading'} />
        </ChartLoadGate>

        <ChartLoadGate
          status={chartStatus.customerJourney}
          onLoad={() => loadChart('customerJourney')}
          onRefresh={() => refreshChart('customerJourney')}
          title="Customer Journey"
          colSpan="lg:col-span-4"
        >
          <CustomerJourneyChart data={data.customerJourney} isLoading={chartStatus.customerJourney === 'loading'} />
        </ChartLoadGate>

        <ChartLoadGate
          status={chartStatus.aov}
          onLoad={() => loadChart('aov')}
          onRefresh={() => refreshChart('aov')}
          title="Average Order Value (AOV)"
          colSpan="lg:col-span-12"
          height="h-[200px]"
        >
          <AOVChart data={data.aovData} isLoading={chartStatus.aov === 'loading'} />
        </ChartLoadGate>

        <ChartLoadGate
          status={chartStatus.branchPerformance}
          onLoad={() => loadChart('branchPerformance')}
          onRefresh={() => refreshChart('branchPerformance')}
          title="Branch Performance Matrix"
          colSpan="lg:col-span-12"
          height="h-[200px]"
        >
          <BranchPerformanceTable data={data.branchPerformance} isLoading={chartStatus.branchPerformance === 'loading'} />
        </ChartLoadGate>

      </div>
    </div>
  );
};
