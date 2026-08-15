import { requestJson } from '../lib/httpClient';

export interface FetchDashboardOptions {
  startDate: string;
  endDate: string;
  page?: number;
  pageSize?: number;
  branchId?: number;
}

interface DashboardApiResponse<T> {
  responseType: number;
  message: string;
  totalRecords: number;
  data: {
    page: number;
    pageSize: number;
    data: T[];
  };
}

const API_BASE = '/adminapi/reports';

async function fetchDashboard<T>(
  token: string,
  endpoint: string,
  { startDate, endDate, page = 1, pageSize = 50, branchId }: FetchDashboardOptions,
): Promise<T[]> {
  const params = new URLSearchParams({ startDate, endDate, page: String(page), pageSize: String(pageSize) });
  if (branchId !== undefined && branchId !== null) {
    params.append('branchId', String(branchId));
  }
  const response = await requestJson<DashboardApiResponse<T>>(
    `${API_BASE}/${endpoint}?${params}`,
    { method: 'GET', headers: { accept: '*/*', Authorization: `Bearer ${token}` } },
  );
  return response.data?.data ?? [];
}

// --- Interfaces ---

export interface DashboardSalesRevenue {
  TotalSales: number;
  PreviousSales: number | Record<string, never>;
  ChangePercent: number | Record<string, never>;
}

export interface DashboardSalesCount {
  TotalOrders: number;
  PreviousOrders: number;
  ChangePercent: number | Record<string, never>;
}

export interface DashboardRejectedCount {
  TotalRejected: number;
  PreviousRejected: number;
  ChangePercent: number | Record<string, never>;
}

export interface DashboardRejectedRevenue {
  TotalRejectedAmount: number | Record<string, never>;
  PreviousRejectedAmount: number | Record<string, never>;
  ChangePercent: number | Record<string, never>;
}

export interface DashboardCustomers {
  TotalCustomers: number;
  PreviousCustomers: number;
  ChangePercent: number | Record<string, never>;
}

export interface DashboardHourlyPerformance {
  HOUR: number;
  HourLabel: string;
  Sales: number;
  Delivery: number;
}

export interface DashboardOrderChannel {
  PercentageOrders: number;
  Channel: string;
  TotalSale: number;
}

export interface DashboardOrderFulfillment {
  STATUS: string;
  order_count: number;
  percentage: number;
}

export interface DashboardCustomerJourneyItem {
  step: string;
  count: number;
  percentage: number;
}

export interface DashboardPaymentSplit {
  paymenttype: string;
  total_sales: number;
  percentage: number;
}

export interface DashboardCustomerLoyalty {
  month_name: string;
  total_customers: number;
  new_customers: number;
  returning_customers: number;
}

export interface DashboardBranchPerformance {
  OutletID: number;
  branch: string;
  revenue: number;
  prev_revenue: number | Record<string, never>;
  growth: number | Record<string, never>;
  rating: number | Record<string, never>;
  STATUS: string;
}

export interface DashboardTopSellingItem {
  ItemName: string;
  TotalSale: number;
}

// --- Fetch functions ---

export const fetchDashboardSalesRevenue = (token: string, opts: FetchDashboardOptions) =>
  fetchDashboard<DashboardSalesRevenue>(token, 'DashboardNewAdmin_SalesRevBox', opts).then(d => d[0] ?? null);

export const fetchDashboardSalesCount = (token: string, opts: FetchDashboardOptions) =>
  fetchDashboard<DashboardSalesCount>(token, 'DashboardNewAdmin_SalesCountBox', opts).then(d => d[0] ?? null);

export const fetchDashboardCustomers = (token: string, opts: FetchDashboardOptions) =>
  fetchDashboard<DashboardCustomers>(token, 'DashboardNewAdmin_CustomerBox', opts).then(d => d[0] ?? null);

export const fetchDashboardRejectedCount = (token: string, opts: FetchDashboardOptions) =>
  fetchDashboard<DashboardRejectedCount>(token, 'DashboardNewAdmin_RejecteCountBox', opts).then(d => d[0] ?? null);

export const fetchDashboardRejectedRevenue = (token: string, opts: FetchDashboardOptions) =>
  fetchDashboard<DashboardRejectedRevenue>(token, 'DashboardNewAdmin_RejecteRevBox', opts).then(d => d[0] ?? null);

export const fetchDashboardHourlyPerformance = (token: string, opts: FetchDashboardOptions) =>
  fetchDashboard<DashboardHourlyPerformance>(token, 'DashboardNewAdmin_HourlyPerformanceGraph', opts);

export const fetchDashboardOrderChannels = (token: string, opts: FetchDashboardOptions) =>
  fetchDashboard<DashboardOrderChannel>(token, 'DashboardNewAdmin_OrderChannel', opts);

export const fetchDashboardOrderFulfillment = (token: string, opts: FetchDashboardOptions) =>
  fetchDashboard<DashboardOrderFulfillment>(token, 'DashboardNewAdmin_OrderFulfillment', opts);

export const fetchDashboardCustomerJourney = (token: string, opts: FetchDashboardOptions) =>
  fetchDashboard<DashboardCustomerJourneyItem>(token, 'DashboardNewAdmin_CustomerJourney', opts);

export const fetchDashboardPaymentSplit = (token: string, opts: FetchDashboardOptions) =>
  fetchDashboard<DashboardPaymentSplit>(token, 'DashboardNewAdmin_PaymentSplit', opts);

export const fetchDashboardCustomerLoyalty = (token: string, opts: FetchDashboardOptions) =>
  fetchDashboard<DashboardCustomerLoyalty>(token, 'DashboardNewAdmin_CustomerLoyalty', opts);

export const fetchDashboardBranchPerformance = (token: string, opts: FetchDashboardOptions) =>
  fetchDashboard<DashboardBranchPerformance>(token, 'DashboardNewAdmin_BranchPerformanceMatrix', opts);

export const fetchDashboardTopSelling = (token: string, opts: FetchDashboardOptions) =>
  fetchDashboard<DashboardTopSellingItem>(token, 'DashboardNewAdmin_TopSellingGraph', opts);

export interface DashboardAOV {
  'DATE(created)': string;
  order_date: string;
  avg_order_value: number;
  DailyRevenue?: number;
  DailyOrders?: number;
}

export const fetchDashboardAOV = (token: string, opts: FetchDashboardOptions) =>
  fetchDashboard<DashboardAOV>(token, 'DashboardNewAdmin_AOV', opts);

export interface DashboardSalesByCity {
  City: string;
  TotalSales: number;
  Percentage: number;
}

export const fetchDashboardSalesByCity = (token: string, opts: FetchDashboardOptions) =>
  fetchDashboard<DashboardSalesByCity>(token, 'DashboardNewAdmin_SalesByCity', opts);

export interface DashboardTopDeliveryArea {
  UserArea: string;
  TotalSales: number;
  TotalOrders: number;
}

export const fetchDashboardTopDeliveryAreas = (token: string, opts: FetchDashboardOptions) =>
  fetchDashboard<DashboardTopDeliveryArea>(token, 'DashboardNewAdmin_TopDeliveryAreas', opts);

export interface DashboardProductCombo {
  ProductCombo: string;
  ComboCount: number;
}

export const fetchDashboardProductCombos = (token: string, opts: FetchDashboardOptions) =>
  fetchDashboard<DashboardProductCombo>(token, 'DashboardNewAdmin_ProductCombos', opts);

export interface DashboardAOVBox {
  TotalAOV: number;
  PreviousAOV: number;
  ChangePercent: number | Record<string, never>;
}

export interface DashboardSuccessRateBox {
  SuccessRate: number;
  PreviousSuccessRate: number;
  ChangePercent: number | Record<string, never>;
}

export interface DashboardNewOrdersBox {
  NewOrdersPercent: number;
  PreviousNewOrdersPercent: number;
  ChangePercent: number | Record<string, never>;
}

export const fetchDashboardAOVBox = (token: string, opts: FetchDashboardOptions) =>
  fetchDashboard<DashboardAOVBox>(token, 'DashboardNewAdmin_AOVBox', opts).then(d => d[0] ?? null);

export const fetchDashboardSuccessRateBox = (token: string, opts: FetchDashboardOptions) =>
  fetchDashboard<DashboardSuccessRateBox>(token, 'DashboardNewAdmin_SuccessRateBox', opts).then(d => d[0] ?? null);

export const fetchDashboardNewOrdersBox = (token: string, opts: FetchDashboardOptions) =>
  fetchDashboard<DashboardNewOrdersBox>(token, 'DashboardNewAdmin_NewOrdersBox', opts).then(d => d[0] ?? null);
