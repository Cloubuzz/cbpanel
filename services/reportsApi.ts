import { requestJson } from '../lib/httpClient';

export interface ApiReportSummary {
  ID: number;
  ReportName: string;
  Slug: string;
  BaseURL: Record<string, unknown> | string;
  Frequency: Record<string, unknown> | string;
  Destination: Record<string, unknown> | string;
}

interface ReportsApiResponse {
  responseType: number;
  data?: ApiReportSummary[];
}

export interface ApiSaleComparisonRow {
  ID: string;
  Created: string;
  Channel: string;
  Orders: string;
  Amount: string;
}

export type ApiReportRow = Record<string, unknown>;

interface ReportDetailResponse {
  page: number;
  pageSize: number;
  data?: ApiReportRow[];
}

export interface FetchReportsOptions {
  page?: number;
  pageSize?: number;
  module?: string;
}

export interface FetchReportDetailOptions {
  startDate: string;
  endDate: string;
  page?: number;
  pageSize?: number;
}

const API_BASE_PATH = '/adminapi';
const DEFAULT_MODULE = 'ReportsNewAdmin';

export const fetchReports = async (
  token: string,
  options: FetchReportsOptions = {},
): Promise<ApiReportSummary[]> => {
  const { page = 1, pageSize = 50, module = DEFAULT_MODULE } = options;

  const params = new URLSearchParams();
  params.set('Module', module);
  params.set('page', String(page));
  params.set('pageSize', String(pageSize));

  const response = await requestJson<ReportsApiResponse>(
    `${API_BASE_PATH}/reports/getall?${params.toString()}`,
    {
      method: 'GET',
      headers: {
        accept: '*/*',
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (response.responseType !== 1 || !Array.isArray(response.data)) {
    throw new Error('Failed to fetch reports.');
  }

  return response.data;
};

export interface DashboardRejectedRevenue {
  TotalRejectedAmount: number;
  PreviousRejectedAmount: number;
  ChangePercent: number;
}

export interface FetchDashboardOptions {
  startDate: string;
  endDate: string;
  page?: number;
  pageSize?: number;
}

interface DashboardApiResponse<T> {
  page: number;
  pageSize: number;
  data: T[];
}

export interface DashboardSalesRevenue {
  TotalSales: number;
  PreviousSales: number;
  ChangePercent: number;
}

export interface DashboardSalesCount {
  TotalOrders: number;
  PreviousOrders: number;
  ChangePercent: number;
}

export interface DashboardRejectedCount {
  TotalRejected: number;
  PreviousRejected: number;
  ChangePercent: number;
}

export interface DashboardCustomers {
  TotalCustomers: number;
  PreviousCustomers: number;
  ChangePercent: number;
}

export const fetchDashboardCustomers = async (
  token: string,
  options: FetchDashboardOptions,
): Promise<DashboardCustomers | null> => {
  const { startDate, endDate, page = 1, pageSize = 50 } = options;

  const params = new URLSearchParams();
  params.set('startDate', startDate);
  params.set('endDate', endDate);
  params.set('page', String(page));
  params.set('pageSize', String(pageSize));

  const response = await requestJson<DashboardApiResponse<DashboardCustomers>>(
    `${API_BASE_PATH}/reports/DashboardNewAdmin_CustomerBox?${params.toString()}`,
    {
      method: 'GET',
      headers: {
        accept: '*/*',
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data?.[0] ?? null;
};

export const fetchDashboardRejectedCount = async (
  token: string,
  options: FetchDashboardOptions,
): Promise<DashboardRejectedCount | null> => {
  const { startDate, endDate, page = 1, pageSize = 50 } = options;

  const params = new URLSearchParams();
  params.set('startDate', startDate);
  params.set('endDate', endDate);
  params.set('page', String(page));
  params.set('pageSize', String(pageSize));

  const response = await requestJson<DashboardApiResponse<DashboardRejectedCount>>(
    `${API_BASE_PATH}/reports/DashboardNewAdmin_RejecteCountBox?${params.toString()}`,
    {
      method: 'GET',
      headers: {
        accept: '*/*',
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data?.[0] ?? null;
};

export const fetchDashboardSalesCount = async (
  token: string,
  options: FetchDashboardOptions,
): Promise<DashboardSalesCount | null> => {
  const { startDate, endDate, page = 1, pageSize = 50 } = options;

  const params = new URLSearchParams();
  params.set('startDate', startDate);
  params.set('endDate', endDate);
  params.set('page', String(page));
  params.set('pageSize', String(pageSize));

  const response = await requestJson<DashboardApiResponse<DashboardSalesCount>>(
    `${API_BASE_PATH}/reports/DashboardNewAdmin_SalesCountBox?${params.toString()}`,
    {
      method: 'GET',
      headers: {
        accept: '*/*',
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data?.[0] ?? null;
};

export const fetchDashboardSalesRevenue = async (
  token: string,
  options: FetchDashboardOptions,
): Promise<DashboardSalesRevenue | null> => {
  const { startDate, endDate, page = 1, pageSize = 50 } = options;

  const params = new URLSearchParams();
  params.set('startDate', startDate);
  params.set('endDate', endDate);
  params.set('page', String(page));
  params.set('pageSize', String(pageSize));

  const response = await requestJson<DashboardApiResponse<DashboardSalesRevenue>>(
    `${API_BASE_PATH}/reports/DashboardNewAdmin_SalesRevBox?${params.toString()}`,
    {
      method: 'GET',
      headers: {
        accept: '*/*',
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data?.[0] ?? null;
};

export interface DashboardHourlyPerformance {
  HOUR: number;
  HourLabel: string;
  Sales: number;
  Delivery: number;
}

export const fetchDashboardHourlyPerformance = async (
  token: string,
  options: FetchDashboardOptions,
): Promise<DashboardHourlyPerformance[]> => {
  const { startDate, endDate, page = 1, pageSize = 50 } = options;

  const params = new URLSearchParams();
  params.set('startDate', startDate);
  params.set('endDate', endDate);
  params.set('page', String(page));
  params.set('pageSize', String(pageSize));

  const response = await requestJson<DashboardApiResponse<DashboardHourlyPerformance>>(
    `${API_BASE_PATH}/reports/DashboardNewAdmin_HourlyPerformanceGraph?${params.toString()}`,
    {
      method: 'GET',
      headers: {
        accept: '*/*',
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data ?? [];
};

export interface DashboardOrderChannel {
  PercentageOrders: number;
  Channel: string;
  TotalSale: number;
}

export const fetchDashboardOrderChannels = async (
  token: string,
  options: FetchDashboardOptions,
): Promise<DashboardOrderChannel[]> => {
  const { startDate, endDate, page = 1, pageSize = 50 } = options;

  const params = new URLSearchParams();
  params.set('startDate', startDate);
  params.set('endDate', endDate);
  params.set('page', String(page));
  params.set('pageSize', String(pageSize));

  const response = await requestJson<DashboardApiResponse<DashboardOrderChannel>>(
    `${API_BASE_PATH}/reports/DashboardNewAdmin_OrderChannel?${params.toString()}`,
    {
      method: 'GET',
      headers: {
        accept: '*/*',
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data ?? [];
};

export interface DashboardOrderFulfillment {
  STATUS: string;
  order_count: number;
  percentage: number;
}

export const fetchDashboardOrderFulfillment = async (
  token: string,
  options: FetchDashboardOptions,
): Promise<DashboardOrderFulfillment[]> => {
  const { startDate, endDate, page = 1, pageSize = 50 } = options;

  const params = new URLSearchParams();
  params.set('startDate', startDate);
  params.set('endDate', endDate);
  params.set('page', String(page));
  params.set('pageSize', String(pageSize));

  const response = await requestJson<DashboardApiResponse<DashboardOrderFulfillment>>(
    `${API_BASE_PATH}/reports/DashboardNewAdmin_OrderFulfillment?${params.toString()}`,
    {
      method: 'GET',
      headers: {
        accept: '*/*',
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data ?? [];
};

export interface DashboardPaymentSplit {
  paymenttype: string;
  total_sales: number;
  percentage: number;
}

export const fetchDashboardPaymentSplit = async (
  token: string,
  options: FetchDashboardOptions,
): Promise<DashboardPaymentSplit[]> => {
  const { startDate, endDate, page = 1, pageSize = 50 } = options;

  const params = new URLSearchParams();
  params.set('startDate', startDate);
  params.set('endDate', endDate);
  params.set('page', String(page));
  params.set('pageSize', String(pageSize));

  const response = await requestJson<DashboardApiResponse<DashboardPaymentSplit>>(
    `${API_BASE_PATH}/reports/DashboardNewAdmin_PaymentSplit?${params.toString()}`,
    {
      method: 'GET',
      headers: {
        accept: '*/*',
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data ?? [];
};

export interface DashboardCustomerLoyalty {
  month_name: string;
  total_customers: number;
  new_customers: number;
  returning_customers: number;
}

export const fetchDashboardCustomerLoyalty = async (
  token: string,
  options: FetchDashboardOptions,
): Promise<DashboardCustomerLoyalty[]> => {
  const { startDate, endDate, page = 1, pageSize = 50 } = options;

  const params = new URLSearchParams();
  params.set('startDate', startDate);
  params.set('endDate', endDate);
  params.set('page', String(page));
  params.set('pageSize', String(pageSize));

  const response = await requestJson<DashboardApiResponse<DashboardCustomerLoyalty>>(
    `${API_BASE_PATH}/reports/DashboardNewAdmin_CustomerLoyalty?${params.toString()}`,
    {
      method: 'GET',
      headers: {
        accept: '*/*',
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data ?? [];
};

export const fetchDashboardRejectedRevenue = async (
  token: string,
  options: FetchDashboardOptions,
): Promise<DashboardRejectedRevenue | null> => {
  const { startDate, endDate, page = 1, pageSize = 50 } = options;

  const params = new URLSearchParams();
  params.set('startDate', startDate);
  params.set('endDate', endDate);
  params.set('page', String(page));
  params.set('pageSize', String(pageSize));

  const response = await requestJson<DashboardApiResponse<DashboardRejectedRevenue>>(
    `${API_BASE_PATH}/reports/DashboardNewAdmin_RejecteRevBox?${params.toString()}`,
    {
      method: 'GET',
      headers: {
        accept: '*/*',
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data?.[0] ?? null;
};

export interface DashboardBranchPerformance {
  OutletID: number;
  branch: string;
  revenue: number;
  prev_revenue: number;
  growth: number;
  rating: number;
  STATUS: string;
}

export const fetchDashboardBranchPerformance = async (
  token: string,
  options: FetchDashboardOptions,
): Promise<DashboardBranchPerformance[]> => {
  const { startDate, endDate, page = 1, pageSize = 50 } = options;

  const params = new URLSearchParams();
  params.set('startDate', startDate);
  params.set('endDate', endDate);
  params.set('page', String(page));
  params.set('pageSize', String(pageSize));

  const response = await requestJson<DashboardApiResponse<DashboardBranchPerformance>>(
    `${API_BASE_PATH}/reports/DashboardNewAdmin_BranchPerformanceMatrix?${params.toString()}`,
    {
      method: 'GET',
      headers: {
        accept: '*/*',
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data ?? [];
};

export const fetchReportDetail = async (
  token: string,
  slug: string,
  options: FetchReportDetailOptions,
): Promise<ApiReportRow[]> => {
  const { startDate, endDate, page = 1, pageSize = 50 } = options;

  const params = new URLSearchParams();
  params.set('startDate', startDate);
  params.set('endDate', endDate);
  params.set('page', String(page));
  params.set('pageSize', String(pageSize));

  const response = await requestJson<ReportDetailResponse>(
    `${API_BASE_PATH}/reports/${encodeURIComponent(slug)}?${params.toString()}`,
    {
      method: 'GET',
      headers: {
        accept: '*/*',
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!Array.isArray(response.data)) {
    throw new Error('Failed to fetch report data.');
  }

  return response.data;
};
