import { requestJson } from '../lib/httpClient';

export interface RetentionSummary {
  TotalCustomers: number;
  NetSales: number;
  RepeatCustomers: number;
  PurchaseFrequency: number;
  AvgOrderValue: number;
  VIPCount: number;
  LoyalCount: number;
  RegularCount: number;
  NewCount: number;
  AtRiskCount: number;
  LostCount: number;
}

export interface MonthlyRetentionData {
  MonthKey: string;
  MonthName: string;
  NewCustomers: number;
  ReturningCustomers: number;
  NetSales: number;
}

export interface BranchRetentionData {
  Branch: string;
  Customers: number;
  Orders: number;
  RepeatRate: number;
}

export interface RetentionDashboardResponse {
  summary: RetentionSummary;
  monthly: MonthlyRetentionData[];
  branches: BranchRetentionData[];
  branchList?: string[];
}

export interface SegmentCustomerRecord {
  CustomerMobile: string;
  FirstOrder: string;
  LastOrder: string;
  TotalOrders: number;
  TotalSpent: number;
  Segment: string;
  BranchName?: string;
}

export interface SegmentCustomersResponse {
  totalRecords: number;
  data: SegmentCustomerRecord[];
}

interface ApiResponse<T> {
  responseType: number;
  message: string;
  data: T;
}

interface PaginatedApiResponse<T> {
  responseType: number;
  message: string;
  totalRecords: number;
  data: T;
}

const API_BASE_PATH = '/adminapi';

export const fetchRetentionDashboard = async (
  token: string,
  branch?: string,
  startDate?: string,
  endDate?: string,
  channel?: string,
  refresh = false
): Promise<RetentionDashboardResponse> => {
  const params = new URLSearchParams();
  if (branch) params.append('branch', branch);
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  if (channel) params.append('channel', channel);
  if (refresh) params.append('refresh', 'true');
  const url = `${API_BASE_PATH}/reports/retention?${params.toString()}`;
  const response = await requestJson<ApiResponse<RetentionDashboardResponse>>(url, {
    method: 'GET',
    headers: { accept: '*/*', Authorization: `Bearer ${token}` },
  });
  if (response.responseType !== 1) {
    throw new Error(response.message || 'Failed to fetch retention dashboard data.');
  }
  return response.data;
};

export const fetchSegmentCustomers = async (
  token: string,
  segment: string,
  branch?: string,
  search?: string,
  startDate?: string,
  endDate?: string,
  channel?: string,
  page = 1,
  pageSize = 50
): Promise<SegmentCustomersResponse> => {
  const params = new URLSearchParams({
    segment,
    page: page.toString(),
    pageSize: pageSize.toString(),
  });
  if (branch) params.append('branch', branch);
  if (search) params.append('search', search);
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  if (channel) params.append('channel', channel);

  const url = `${API_BASE_PATH}/reports/retention/segment-customers?${params.toString()}`;
  const response = await requestJson<PaginatedApiResponse<SegmentCustomerRecord[]>>(url, {
    method: 'GET',
    headers: { accept: '*/*', Authorization: `Bearer ${token}` },
  });
  if (response.responseType !== 1) {
    throw new Error(response.message || 'Failed to fetch segment customers.');
  }
  return {
    totalRecords: response.totalRecords,
    data: response.data,
  };
};

export interface PeriodSummary {
  ActiveCustomers: number;
  NewCustomers: number;
  ReturningCustomers: number;
  TotalOrders: number;
  NetSales: number;
  AvgOrderValue: number;
  PurchaseFrequency: number;
}

export interface PeriodSegmentData {
  Segment: string;
  CustomerCount: number;
  NetSales: number;
  TotalOrders: number;
}

export interface PeriodData {
  summary: PeriodSummary | null;
  segments: PeriodSegmentData[];
}

export interface TrendMonthData {
  MonthKey: string;
  MonthName: string;
  ActiveCustomers: number;
  NewCustomers: number;
  ReturningCustomers: number;
  TotalOrders: number;
  NetSales: number;
  AvgOrderValue: number;
  PurchaseFrequency: number;
}

export interface RetentionComparisonResponse {
  periodA: PeriodData;
  periodB: PeriodData | null;
  trends: TrendMonthData[];
  branchList?: string[];
}

export const fetchRetentionComparison = async (
  token: string,
  startDateA: string,
  endDateA: string,
  startDateB?: string,
  endDateB?: string,
  branch?: string,
  channel?: string,
  refresh = false
): Promise<RetentionComparisonResponse> => {
  const params = new URLSearchParams({
    startDateA,
    endDateA
  });
  if (startDateB) params.append('startDateB', startDateB);
  if (endDateB) params.append('endDateB', endDateB);
  if (branch) params.append('branch', branch);
  if (channel) params.append('channel', channel);
  if (refresh) params.append('refresh', 'true');

  const url = `${API_BASE_PATH}/reports/retention/compare?${params.toString()}`;
  const response = await requestJson<ApiResponse<RetentionComparisonResponse>>(url, {
    method: 'GET',
    headers: { accept: '*/*', Authorization: `Bearer ${token}` },
    timeoutMs: 60000,
  });
  if (response.responseType !== 1) {
    throw new Error(response.message || 'Failed to fetch retention comparison data.');
  }
  return response.data;
};
