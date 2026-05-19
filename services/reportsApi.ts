import { requestJson } from '../lib/httpClient';

export interface ApiReportSummary {
  ID: number;
  ReportName: string;
  Slug: string;
  BaseURL: Record<string, unknown> | string;
  Frequency: Record<string, unknown> | string;
  Destination: Record<string, unknown> | string;
}

export type ApiReportRow = Record<string, unknown>;

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
  const params = new URLSearchParams({ Module: module, page: String(page), pageSize: String(pageSize) });

  const response = await requestJson<{ responseType: number; data?: ApiReportSummary[] }>(
    `${API_BASE_PATH}/reports/getall?${params}`,
    { method: 'GET', headers: { accept: '*/*', Authorization: `Bearer ${token}` } },
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
  const params = new URLSearchParams({ startDate, endDate, page: String(page), pageSize: String(pageSize) });

  const response = await requestJson<{ page: number; pageSize: number; data?: ApiReportRow[] }>(
    `${API_BASE_PATH}/reports/${encodeURIComponent(slug)}?${params}`,
    { method: 'GET', headers: { accept: '*/*', Authorization: `Bearer ${token}` } },
  );

  if (!Array.isArray(response.data)) {
    throw new Error('Failed to fetch report data.');
  }

  return response.data;
};
