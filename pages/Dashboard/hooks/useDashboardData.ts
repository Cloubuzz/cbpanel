import { useState, useEffect } from 'react';
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

export interface DashboardState {
  salesRevenue: DashboardSalesRevenue | null;
  salesCount: DashboardSalesCount | null;
  customers: DashboardCustomers | null;
  rejectedCount: DashboardRejectedCount | null;
  rejectedRevenue: DashboardRejectedRevenue | null;
  hourlyData: DashboardHourlyPerformance[];
  orderChannels: ChartItem[];
  paymentSplit: ChartItem[];
  customerLoyalty: CustomerLoyaltyItem[];
  orderFulfillment: FulfillmentItem[];
  branchPerformance: DashboardBranchPerformance[];
  topSelling: DashboardTopSellingItem[];
  aovData: DashboardAOV[];
  isLoading: boolean;
}

export const useDashboardData = (token: string | null, dateFilter: string): DashboardState => {
  const [isLoading, setIsLoading] = useState(false);
  const [salesRevenue, setSalesRevenue] = useState<DashboardSalesRevenue | null>(null);
  const [salesCount, setSalesCount] = useState<DashboardSalesCount | null>(null);
  const [customers, setCustomers] = useState<DashboardCustomers | null>(null);
  const [rejectedCount, setRejectedCount] = useState<DashboardRejectedCount | null>(null);
  const [rejectedRevenue, setRejectedRevenue] = useState<DashboardRejectedRevenue | null>(null);
  const [hourlyData, setHourlyData] = useState<DashboardHourlyPerformance[]>([]);
  const [orderChannels, setOrderChannels] = useState<ChartItem[]>([]);
  const [paymentSplit, setPaymentSplit] = useState<ChartItem[]>([]);
  const [customerLoyalty, setCustomerLoyalty] = useState<CustomerLoyaltyItem[]>([]);
  const [orderFulfillment, setOrderFulfillment] = useState<FulfillmentItem[]>([]);
  const [branchPerformance, setBranchPerformance] = useState<DashboardBranchPerformance[]>([]);
  const [topSelling, setTopSelling] = useState<DashboardTopSellingItem[]>([]);
  const [aovData, setAovData] = useState<DashboardAOV[]>([]);

  useEffect(() => {
    if (!token) return;
    setIsLoading(true);
    const opts = getDateRange(dateFilter);

    Promise.allSettled([
      fetchDashboardSalesRevenue(token, opts).then(setSalesRevenue).catch(() => setSalesRevenue(null)),
      fetchDashboardSalesCount(token, opts).then(setSalesCount).catch(() => setSalesCount(null)),
      fetchDashboardCustomers(token, opts).then(setCustomers).catch(() => setCustomers(null)),
      fetchDashboardRejectedCount(token, opts).then(setRejectedCount).catch(() => setRejectedCount(null)),
      fetchDashboardRejectedRevenue(token, opts).then(setRejectedRevenue).catch(() => setRejectedRevenue(null)),
      fetchDashboardHourlyPerformance(token, opts).then(setHourlyData).catch(() => setHourlyData([])),
      fetchDashboardOrderChannels(token, opts)
        .then(data => setOrderChannels(data.map((item, i) => ({
          name: item.Channel,
          value: item.PercentageOrders,
          fill: CHART_COLORS[i % CHART_COLORS.length],
          totalSale: item.TotalSale,
        }))))
        .catch(() => setOrderChannels([])),
      fetchDashboardPaymentSplit(token, opts)
        .then(data => setPaymentSplit(data.map((item, i) => ({
          name: item.paymenttype,
          value: item.percentage,
          fill: CHART_COLORS[i % CHART_COLORS.length],
          totalSale: item.total_sales,
        }))))
        .catch(() => setPaymentSplit([])),
      fetchDashboardCustomerLoyalty(token, opts)
        .then(data => setCustomerLoyalty(data.map(item => ({
          month: item.month_name.slice(0, 3),
          new: item.new_customers,
          repeat: item.returning_customers,
        }))))
        .catch(() => setCustomerLoyalty([])),
      fetchDashboardOrderFulfillment(token, opts)
        .then(data => setOrderFulfillment(data.map(item => ({
          name: item.STATUS,
          value: item.percentage,
          fill: getFulfillmentColor(item.STATUS),
        }))))
        .catch(() => setOrderFulfillment([])),
      fetchDashboardBranchPerformance(token, { ...opts, pageSize: 5 }).then(setBranchPerformance).catch(() => setBranchPerformance([])),
      fetchDashboardTopSelling(token, { ...opts, pageSize: 10 }).then(setTopSelling).catch(() => setTopSelling([])),
      fetchDashboardAOV(token, opts).then(setAovData).catch(() => setAovData([])),
    ]).finally(() => setIsLoading(false));
  }, [token, dateFilter]);

  return {
    salesRevenue, salesCount, customers, rejectedCount, rejectedRevenue,
    hourlyData, orderChannels, paymentSplit, customerLoyalty, orderFulfillment,
    branchPerformance, topSelling, aovData, isLoading,
  };
};
