import { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchDashboardSalesRevenue,
  fetchDashboardSalesCount,
  fetchDashboardRejectedCount,
  fetchDashboardRejectedRevenue,
  fetchDashboardHourlyPerformance,
  fetchDashboardOrderChannels,
  fetchDashboardOrderFulfillment,
  fetchDashboardPaymentSplit,
  fetchDashboardBranchPerformance,
  fetchDashboardTopSelling,
  fetchDashboardAOV,
  fetchDashboardSalesByCity,
  fetchDashboardTopDeliveryAreas,
  fetchDashboardProductCombos,
  fetchDashboardAOVBox,
  fetchDashboardSuccessRateBox,
  fetchDashboardNewOrdersBox,
  fetchDashboardCustomerJourney,
  type DashboardSalesRevenue,
  type DashboardSalesCount,
  type DashboardRejectedCount,
  type DashboardRejectedRevenue,
  type DashboardHourlyPerformance,
  type DashboardBranchPerformance,
  type DashboardTopSellingItem,
  type DashboardAOV,
  type DashboardTopDeliveryArea,
  type DashboardProductCombo,
  type DashboardAOVBox,
  type DashboardSuccessRateBox,
  type DashboardNewOrdersBox,
  type DashboardCustomerJourneyItem,
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

export type ChartName =
  | 'hourly'
  | 'topSelling'
  | 'orderChannels'
  | 'paymentSplit'
  | 'orderFulfillment'
  | 'aov'
  | 'branchPerformance'
  | 'salesByCity'
  | 'topDeliveryAreas'
  | 'productCombos'
  | 'customerJourney';

export type ChartStatus = 'idle' | 'loading' | 'loaded';

const ALL_CHARTS: ChartName[] = [
  'hourly', 'topSelling', 'orderChannels', 'paymentSplit',
  'orderFulfillment', 'aov', 'branchPerformance',
  'salesByCity', 'topDeliveryAreas', 'productCombos',
  'customerJourney',
];

const initialChartStatus = (): Record<ChartName, ChartStatus> =>
  Object.fromEntries(ALL_CHARTS.map(n => [n, 'idle'])) as Record<ChartName, ChartStatus>;

export interface DashboardState {
  // KPI — auto-fetched
  salesRevenue: DashboardSalesRevenue | null;
  salesCount: DashboardSalesCount | null;
  rejectedCount: DashboardRejectedCount | null;
  rejectedRevenue: DashboardRejectedRevenue | null;
  aovBox: DashboardAOVBox | null;
  successRateBox: DashboardSuccessRateBox | null;
  newOrdersBox: DashboardNewOrdersBox | null;
  kpiLoading: boolean;
  // Charts — on-demand
  hourlyData: DashboardHourlyPerformance[];
  orderChannels: ChartItem[];
  paymentSplit: ChartItem[];
  orderFulfillment: FulfillmentItem[];
  branchPerformance: DashboardBranchPerformance[];
  topSelling: DashboardTopSellingItem[];
  aovData: DashboardAOV[];
  salesByCity: ChartItem[];
  topDeliveryAreas: DashboardTopDeliveryArea[];
  productCombos: DashboardProductCombo[];
  customerJourney: DashboardCustomerJourneyItem[];
  // Chart control
  chartStatus: Record<ChartName, ChartStatus>;
  loadChart: (name: ChartName) => void;
  refreshChart: (name: ChartName) => void;
}

export const useDashboardData = (
  token: string | null,
  dateFilter: string,
  branchId: number | null,
  shiftStartHour: string = '08:00'
): DashboardState => {
  // --- KPI state ---
  const [kpiLoading, setKpiLoading] = useState(false);
  const [salesRevenue, setSalesRevenue] = useState<DashboardSalesRevenue | null>(null);
  const [salesCount, setSalesCount] = useState<DashboardSalesCount | null>(null);
  const [rejectedCount, setRejectedCount] = useState<DashboardRejectedCount | null>(null);
  const [rejectedRevenue, setRejectedRevenue] = useState<DashboardRejectedRevenue | null>(null);
  const [aovBox, setAovBox] = useState<DashboardAOVBox | null>(null);
  const [successRateBox, setSuccessRateBox] = useState<DashboardSuccessRateBox | null>(null);
  const [newOrdersBox, setNewOrdersBox] = useState<DashboardNewOrdersBox | null>(null);

  // --- Chart state ---
  const [chartStatus, setChartStatus] = useState<Record<ChartName, ChartStatus>>(initialChartStatus);
  const [hourlyData, setHourlyData] = useState<DashboardHourlyPerformance[]>([]);
  const [orderChannels, setOrderChannels] = useState<ChartItem[]>([]);
  const [paymentSplit, setPaymentSplit] = useState<ChartItem[]>([]);
  const [orderFulfillment, setOrderFulfillment] = useState<FulfillmentItem[]>([]);
  const [branchPerformance, setBranchPerformance] = useState<DashboardBranchPerformance[]>([]);
  const [topSelling, setTopSelling] = useState<DashboardTopSellingItem[]>([]);
  const [aovData, setAovData] = useState<DashboardAOV[]>([]);
  const [salesByCity, setSalesByCity] = useState<ChartItem[]>([]);
  const [topDeliveryAreas, setTopDeliveryAreas] = useState<DashboardTopDeliveryArea[]>([]);
  const [productCombos, setProductCombos] = useState<DashboardProductCombo[]>([]);
  const [customerJourney, setCustomerJourney] = useState<DashboardCustomerJourneyItem[]>([]);

  const optsRef = useRef({ ...getDateRange(dateFilter, shiftStartHour), branchId: branchId ?? undefined });
  const tokenRef = useRef(token);
  useEffect(() => {
    optsRef.current = { ...getDateRange(dateFilter, shiftStartHour), branchId: branchId ?? undefined };
    tokenRef.current = token;
  }, [token, dateFilter, branchId, shiftStartHour]);

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
      orderFulfillment: () => fetchDashboardOrderFulfillment(t, opts)
        .then(d => {
          const merged: Record<string, number> = {};
          d.forEach(item => {
            let name = item.STATUS;
            const nameLower = name.toLowerCase();
            if (
              nameLower === 'undefined-decline' ||
              nameLower === 'pending- card required' ||
              nameLower === 'pending unverified- card required'
            ) {
              name = 'Pending Card Required';
            }
            merged[name] = (merged[name] || 0) + item.percentage;
          });
          const result = Object.entries(merged).map(([name, value]) => ({
            name,
            value: Number(value.toFixed(2)),
            fill: getFulfillmentColor(name)
          }));
          setOrderFulfillment(result);
        })
        .catch(() => setOrderFulfillment([])),
      aov: () => fetchDashboardAOV(t, opts).then(setAovData).catch(() => setAovData([])),
      branchPerformance: () => fetchDashboardBranchPerformance(t, { ...opts, pageSize: 200 }).then(setBranchPerformance).catch(() => setBranchPerformance([])),
      salesByCity: () => fetchDashboardSalesByCity(t, opts)
        .then(d => setSalesByCity(d.map((item, i) => ({ name: item.City, value: item.Percentage, fill: CHART_COLORS[i % CHART_COLORS.length], totalSale: item.TotalSales }))))
        .catch(() => setSalesByCity([])),
      topDeliveryAreas: () => fetchDashboardTopDeliveryAreas(t, opts).then(setTopDeliveryAreas).catch(() => setTopDeliveryAreas([])),
      productCombos: () => fetchDashboardProductCombos(t, opts).then(setProductCombos).catch(() => setProductCombos([])),
      customerJourney: () => fetchDashboardCustomerJourney(t, opts).then(setCustomerJourney).catch(() => setCustomerJourney([])),
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
    const opts = { ...getDateRange(dateFilter, shiftStartHour), branchId: branchId ?? undefined };
    Promise.allSettled([
      fetchDashboardSalesRevenue(token, opts).then(setSalesRevenue).catch(() => setSalesRevenue(null)),
      fetchDashboardSalesCount(token, opts).then(setSalesCount).catch(() => setSalesCount(null)),
      fetchDashboardRejectedCount(token, opts).then(setRejectedCount).catch(() => setRejectedCount(null)),
      fetchDashboardRejectedRevenue(token, opts).then(setRejectedRevenue).catch(() => setRejectedRevenue(null)),
      fetchDashboardAOVBox(token, opts).then(setAovBox).catch(() => setAovBox(null)),
      fetchDashboardSuccessRateBox(token, opts).then(setSuccessRateBox).catch(() => setSuccessRateBox(null)),
      fetchDashboardNewOrdersBox(token, opts).then(setNewOrdersBox).catch(() => setNewOrdersBox(null)),
    ]).finally(() => setKpiLoading(false));
  }, [token, dateFilter, branchId, shiftStartHour]);

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
  }, [dateFilter, branchId, shiftStartHour]);

  return {
    salesRevenue, salesCount, rejectedCount, rejectedRevenue,
    aovBox, successRateBox, newOrdersBox, kpiLoading,
    hourlyData, orderChannels, paymentSplit, orderFulfillment,
    branchPerformance, topSelling, aovData,
    salesByCity, topDeliveryAreas, productCombos, customerJourney,
    chartStatus, loadChart, refreshChart,
  };
};
