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
