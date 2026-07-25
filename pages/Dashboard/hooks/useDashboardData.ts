import { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchDashboardSalesRevenue,
  fetchDashboardSalesCount,
  fetchDashboardCustomers,
  fetchDashboardRejectedCount,
  fetchDashboardRejectedRevenue,
  fetchDashboardHourlyPerformance,
  fetchDashboardOrderChannels,
  fetchDashboardOrderFulfillment,
  fetchDashboardPaymentSplit,
  fetchDashboardCustomerLoyalty,
  fetchDashboardBranchPerformance,
  fetchDashboardTopSelling,
  fetchDashboardAOV,
  type DashboardSalesRevenue,
  type DashboardSalesCount,
  type DashboardCustomers,
  type DashboardRejectedCount,
  type DashboardRejectedRevenue,
  type DashboardHourlyPerformance,
  type DashboardBranchPerformance,
  type DashboardTopSellingItem,
  type DashboardAOV,
} from '../../../services/dashboardApi';
import { CHART_COLORS, getFulfillmentColor } from '../constants';
import { getDateRange } from '../utils';

export interface ChartItem {
  name: string;
  value: number;
  fill: string;
  totalSale: number;
}

export interface FulfillmentItem {
  name: string;
  value: number;
  fill: string;
}

export interface CustomerLoyaltyItem {
  month: string;
  new: number;
  repeat: number;
}

export type ChartName =
  | 'hourly'
  | 'topSelling'
  | 'orderChannels'
  | 'paymentSplit'
  | 'customerLoyalty'
  | 'orderFulfillment'
  | 'aov'
  | 'branchPerformance';

export type ChartStatus = 'idle' | 'loading' | 'loaded';

const ALL_CHARTS: ChartName[] = [
  'hourly', 'topSelling', 'orderChannels', 'paymentSplit',
  'customerLoyalty', 'orderFulfillment', 'aov', 'branchPerformance',
];

const initialChartStatus = (): Record<ChartName, ChartStatus> =>
  Object.fromEntries(ALL_CHARTS.map(n => [n, 'idle'])) as Record<ChartName, ChartStatus>;

export interface DashboardState {
  // KPI — auto-fetched
  salesRevenue: DashboardSalesRevenue | null;
  salesCount: DashboardSalesCount | null;
  customers: DashboardCustomers | null;
  rejectedCount: DashboardRejectedCount | null;
  rejectedRevenue: DashboardRejectedRevenue | null;
  kpiLoading: boolean;
  // Charts — on-demand
  hourlyData: DashboardHourlyPerformance[];
  orderChannels: ChartItem[];
  paymentSplit: ChartItem[];
  customerLoyalty: CustomerLoyaltyItem[];
  orderFulfillment: FulfillmentItem[];
  branchPerformance: DashboardBranchPerformance[];
  topSelling: DashboardTopSellingItem[];
  aovData: DashboardAOV[];
  // Chart control
  chartStatus: Record<ChartName, ChartStatus>;
  loadChart: (name: ChartName) => void;
  refreshChart: (name: ChartName) => void;
}

export const useDashboardData = (
  token: string | null,
  dateFilter: string,
  branchId: number | null
): DashboardState => {
  // --- KPI state ---
  const [kpiLoading, setKpiLoading] = useState(false);
  const [salesRevenue, setSalesRevenue] = useState<DashboardSalesRevenue | null>(null);
  const [salesCount, setSalesCount] = useState<DashboardSalesCount | null>(null);
  const [customers, setCustomers] = useState<DashboardCustomers | null>(null);
  const [rejectedCount, setRejectedCount] = useState<DashboardRejectedCount | null>(null);
  const [rejectedRevenue, setRejectedRevenue] = useState<DashboardRejectedRevenue | null>(null);

  // --- Chart state ---
  const [chartStatus, setChartStatus] = useState<Record<ChartName, ChartStatus>>(initialChartStatus);
  const [hourlyData, setHourlyData] = useState<DashboardHourlyPerformance[]>([]);
  const [orderChannels, setOrderChannels] = useState<ChartItem[]>([]);
  const [paymentSplit, setPaymentSplit] = useState<ChartItem[]>([]);
  const [customerLoyalty, setCustomerLoyalty] = useState<CustomerLoyaltyItem[]>([]);
  const [orderFulfillment, setOrderFulfillment] = useState<FulfillmentItem[]>([]);
  const [branchPerformance, setBranchPerformance] = useState<DashboardBranchPerformance[]>([]);
  const [topSelling, setTopSelling] = useState<DashboardTopSellingItem[]>([]);
  const [aovData, setAovData] = useState<DashboardAOV[]>([]);

  // Ref so the loadChart callback always uses latest token/dateFilter/branchId
  const optsRef = useRef({ ...getDateRange(dateFilter), branchId: branchId ?? undefined });
  const tokenRef = useRef(token);
  useEffect(() => {
    optsRef.current = { ...getDateRange(dateFilter), branchId: branchId ?? undefined };
    tokenRef.current = token;
  }, [token, dateFilter, branchId]);

  // --- Fetcher map ---
  const fetchChart = useCallback((name: ChartName) => {
    const t = tokenRef.current;
    const opts = optsRef.current;
    if (!t) return Promise.resolve();

    const map: Record<ChartName, () => Promise<void>> = {
      hourly: () => fetchDashboardHourlyPerformance(t, opts).then(setHourlyData).catch(() => setHourlyData([])),
      topSelling: () => fetchDashboardTopSelling(t, { ...opts, pageSize: 10 }).then(setTopSelling).catch(() => setTopSelling([])),
      orderChannels: () => fetchDashboardOrderChannels(t, opts)
        .then(d => setOrderChannels(d.map((item, i) => ({ name: item.Channel, value: item.PercentageOrders, fill: CHART_COLORS[i % CHART_COLORS.length], totalSale: item.TotalSale }))))
        .catch(() => setOrderChannels([])),
      paymentSplit: () => fetchDashboardPaymentSplit(t, opts)
        .then(d => setPaymentSplit(d.map((item, i) => ({ name: item.paymenttype, value: item.percentage, fill: CHART_COLORS[i % CHART_COLORS.length], totalSale: item.total_sales }))))
        .catch(() => setPaymentSplit([])),
      customerLoyalty: () => fetchDashboardCustomerLoyalty(t, opts)
        .then(d => setCustomerLoyalty(d.map(item => ({ month: item.month_name.slice(0, 3), new: item.new_customers, repeat: item.returning_customers }))))
        .catch(() => setCustomerLoyalty([])),
      orderFulfillment: () => fetchDashboardOrderFulfillment(t, opts)
        .then(d => setOrderFulfillment(d.map(item => ({ name: item.STATUS, value: item.percentage, fill: getFulfillmentColor(item.STATUS) }))))
        .catch(() => setOrderFulfillment([])),
      aov: () => fetchDashboardAOV(t, opts).then(setAovData).catch(() => setAovData([])),
      branchPerformance: () => fetchDashboardBranchPerformance(t, { ...opts, pageSize: 5 }).then(setBranchPerformance).catch(() => setBranchPerformance([])),
    };

    return map[name]();
  }, []);

  // --- Load a chart on demand (idle → loading → loaded) ---
  const loadChart = useCallback((name: ChartName) => {
    setChartStatus(prev => {
      if (prev[name] !== 'idle') return prev;
      return { ...prev, [name]: 'loading' };
    });
    fetchChart(name).finally(() =>
      setChartStatus(prev => ({ ...prev, [name]: 'loaded' }))
    );
  }, [fetchChart]);

  // --- Refresh a chart (re-fetch regardless of current status) ---
  const refreshChart = useCallback((name: ChartName) => {
    setChartStatus(prev => {
      if (prev[name] === 'loading') return prev;
      return { ...prev, [name]: 'loading' };
    });
    fetchChart(name).finally(() =>
      setChartStatus(prev => ({ ...prev, [name]: 'loaded' }))
    );
  }, [fetchChart]);

  // --- Auto-fetch KPIs ---
  useEffect(() => {
    if (!token) return;
    setKpiLoading(true);
    const opts = { ...getDateRange(dateFilter), branchId: branchId ?? undefined };
    Promise.allSettled([
      fetchDashboardSalesRevenue(token, opts).then(setSalesRevenue).catch(() => setSalesRevenue(null)),
      fetchDashboardSalesCount(token, opts).then(setSalesCount).catch(() => setSalesCount(null)),
      fetchDashboardCustomers(token, opts).then(setCustomers).catch(() => setCustomers(null)),
      fetchDashboardRejectedCount(token, opts).then(setRejectedCount).catch(() => setRejectedCount(null)),
      fetchDashboardRejectedRevenue(token, opts).then(setRejectedRevenue).catch(() => setRejectedRevenue(null)),
    ]).finally(() => setKpiLoading(false));
  }, [token, dateFilter, branchId]);

  // --- On dateFilter/branchId change: refetch already-loaded charts ---
  useEffect(() => {
    setChartStatus(prev => {
      const next = { ...prev };
      for (const name of ALL_CHARTS) {
        if (next[name] === 'loaded') next[name] = 'loading';
      }
      return next;
    });

    const toRefetch = ALL_CHARTS.filter(n => chartStatus[n] !== 'idle');
    if (!toRefetch.length) return;

    Promise.allSettled(toRefetch.map(name => fetchChart(name))).finally(() => {
      setChartStatus(prev => {
        const next = { ...prev };
        for (const name of toRefetch) next[name] = 'loaded';
        return next;
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFilter, branchId]);

  return {
    salesRevenue, salesCount, customers, rejectedCount, rejectedRevenue, kpiLoading,
    hourlyData, orderChannels, paymentSplit, customerLoyalty, orderFulfillment,
    branchPerformance, topSelling, aovData,
    chartStatus, loadChart, refreshChart,
  };
};
