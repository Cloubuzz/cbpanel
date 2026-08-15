import { requestJson } from '../lib/httpClient';

export interface TestMasterRecord {
  ID: number;
  Name: string;
  EmployeeID: string;
  Branch: string;
  City: string;
  Phone: string;
  Percentage: string | number;   // MySQL returns high-precision decimal as string
  Result: string;
  Created: string;
  Designation: string;
  EmployeeDesignation?: string;
}

export interface TestQuestion {
  question: string;
  answer: string;
  correct: number | boolean;
}

export interface TestDetailResponse {
  master: TestMasterRecord;
  questions: TestQuestion[];
}

interface TestListApiResponse {
  responseType: number;
  message: string;
  data: TestMasterRecord[];
}

interface TestDetailApiResponse {
  responseType: number;
  message: string;
  data: TestDetailResponse;
}

const API_BASE_PATH = '/adminapi';

export const fetchTests = async (token: string): Promise<TestMasterRecord[]> => {
  const response = await requestJson<TestListApiResponse>(`${API_BASE_PATH}/Test/list`, {
    method: 'GET',
    headers: { accept: '*/*', Authorization: `Bearer ${token}` },
  });
  if (response.responseType !== 1 || !Array.isArray(response.data)) {
    throw new Error('Failed to fetch tests.');
  }
  return response.data;
};

export const fetchTestDetail = async (token: string, id: number): Promise<TestDetailResponse> => {
  const response = await requestJson<TestDetailApiResponse>(`${API_BASE_PATH}/Test/detail/${id}`, {
    method: 'GET',
    headers: { accept: '*/*', Authorization: `Bearer ${token}` },
  });
  if (response.responseType !== 1) {
    throw new Error(response.message || 'Failed to fetch test detail.');
  }
  return response.data;
};
