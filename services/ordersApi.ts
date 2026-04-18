import { requestJson } from '../lib/httpClient';

const API_BASE_PATH = '/adminapi';

// ─── Raw API shapes ──────────────────────────────────────────────────────────

export interface RawOrder {
  ID: number;
  CustomerName: string;
  CustomerMobile: string;
  OrderAmount: number;
  Status: string;
  OrderType: 'Delivery' | 'Pick Up';
  PaymentType: string;
  Created: string;
  outletid: number;
  Branch: string;
}

interface OrdersPageData {
  page: number;
  pageSize: number;
  data: RawOrder[];
}

interface OrdersApiResponse {
  responseType: number;
  data: OrdersPageData;
}

// ─── Per-tab status strings (fill in as APIs are confirmed) ──────────────────

export type OrderTab = 'Accepted' | 'Pending' | 'Rejected' | 'CreditCard' | 'POS' | 'UndefinedDecline';

const TAB_STATUS_MAP: Record<OrderTab, string> = {
  Accepted: 'Confirmed',
  Pending: 'Pending',
  Rejected: 'Rejected',
  CreditCard: 'CreditCard',
  POS: 'POSFailed',
  UndefinedDecline: 'Undefined-Decline',
};

// ─── Order Detail shapes ─────────────────────────────────────────────────────

export interface OrderDetailOption {
  orderdetailID: number;
  OptionID: number;
  OptionItem: string;
  Price: string;
  Quantity: number;
  Total: number;
  optiongroupName: string;
}

export interface OrderDetailItem {
  orderdetailID: number;
  ItemID: number;
  Item: string;
  Description: string;
  Size: string;
  price: number;
  Qty: number;
  Total: number;
  CookingInstructions: string;
  Options: OrderDetailOption[];
}

export interface OrderDetailOrder {
  OrderID: number;
  CustomerName: string;
  CustomerPhone: string;
  Address: string;
  Area: string;
  Email: string;
  Remarks: string;
  OutletName: string;
  OutletPhone: string;
  OutletAddress: string;
  DeliveryTime: number;
  OrderDateTime: string;
  SubTotal: number;
  Discount: number;
  VoucherCode: string;
  VoucherAmount: string;
  DeliveryFee: number;
  GrandTotal: number;
  Channel: string;
  OrderType: string;
  IsPaidByWallet: boolean;
  City: string;
  Status: string;
  IsForwardToPOS: boolean;
  POSTime: string;
}

export interface OrderDetailPayment {
  Type: string;
  IsCreditCardSuccessfull: boolean;
  OnlineStatus: string;
  Display: string;
}

export interface OrderDetail {
  order: OrderDetailOrder;
  payment: OrderDetailPayment;
  items: OrderDetailItem[];
}

interface OrderDetailApiResponse {
  responseType: number;
  data: OrderDetail;
}

// ─── Fetch ───────────────────────────────────────────────────────────────────

export interface FetchOrdersParams {
  tab: OrderTab;
  token: string;
  page?: number;
  pageSize?: number;
}

export const fetchOrders = async ({
  tab,
  token,
  page = 1,
  pageSize = 50,
}: FetchOrdersParams): Promise<RawOrder[]> => {
  const status = TAB_STATUS_MAP[tab];
  const url = `${API_BASE_PATH}/orders/orders?status=${encodeURIComponent(status)}&page=${page}&pageSize=${pageSize}`;

  const response = await requestJson<OrdersApiResponse>(url, {
    method: 'GET',
    headers: {
      accept: '*/*',
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.responseType !== 1 || !response.data?.data) {
    throw new Error('Unexpected response from orders API.');
  }

  return response.data.data;
};

export const fetchOrderDetail = async (orderId: number, token: string): Promise<OrderDetail> => {
  const url = `${API_BASE_PATH}/orders/${orderId}`;

  const response = await requestJson<OrderDetailApiResponse>(url, {
    method: 'GET',
    headers: {
      accept: '*/*',
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.responseType !== 1 || !response.data) {
    throw new Error('Unexpected response from order detail API.');
  }

  return response.data;
};

// ─── Order Logs shapes ───────────────────────────────────────────────────────

export interface OrderLog {
  ID: number;
  object_id: number;
  object_type: string;
  date: string;
  Designation: string;
  Remarks: unknown;
  Channel: unknown;
  LogType: string;
  source: string;
  OrderChannel: string;
  RejectionTitle: string;
  Name: unknown;
  user_id: unknown;
  IPAddress: unknown;
}

export interface OrderLogSummary {
  startTime: string;
  endTime: string;
  duration: { days: number; hours: number; minutes: number };
  source: string;
  channel: string;
}

export interface OrderLogs {
  summary: OrderLogSummary;
  logs: OrderLog[];
}

interface OrderLogsApiResponse {
  responseType: number;
  data: OrderLogs;
}

export const fetchOrderLogs = async (orderId: number, token: string): Promise<OrderLogs> => {
  const url = `${API_BASE_PATH}/orders/${orderId}/logs`;

  const response = await requestJson<OrderLogsApiResponse>(url, {
    method: 'GET',
    headers: {
      accept: '*/*',
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.responseType !== 1 || !response.data) {
    throw new Error('Unexpected response from order logs API.');
  }

  return response.data;
};

// ─── Payment Logs shapes ─────────────────────────────────────────────────────

export interface PaymentLog {
  ID: number;
  Created: string;
  decision: string;
  req_card_number: string;
  req_card_expiry_date: string;
  req_card_type: string;
  req_payment_method: string;
  req_amount: string;
  req_currency: string;
  req_transaction_type: string;
  req_reference_number: string;
  req_bill_to_forename: string;
  req_bill_to_surname: string;
  req_bill_to_email: string;
  req_bill_to_address_city: string;
  auth_amount: string;
  auth_code: string;
  auth_time: string;
  auth_response: string;
  transaction_id: string;
  message: string;
  reason_code: string;
  score_score_result: string;
  score_suspicious_info: string;
  score_card_issuer: string;
  score_card_scheme: string;
  signatureresult: string;
  bin_number: string;
}

interface PaymentLogsApiResponse {
  responseType: number;
  data: PaymentLog[];
}

export const fetchPaymentLogs = async (orderId: number, token: string): Promise<PaymentLog[]> => {
  const url = `${API_BASE_PATH}/orders/${orderId}/paymentlogs`;

  const response = await requestJson<PaymentLogsApiResponse>(url, {
    method: 'GET',
    headers: {
      accept: '*/*',
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.responseType !== 1 || !Array.isArray(response.data)) {
    throw new Error('Unexpected response from payment logs API.');
  }

  return response.data;
};

// ─── Outlets shapes ──────────────────────────────────────────────────────────

export interface Outlet {
  ID: number;
  NAME: string;
}

interface OutletsApiResponse {
  responseType: number;
  data: Outlet[];
}

export const fetchOutlets = async (city: string, token: string): Promise<Outlet[]> => {
  const url = `${API_BASE_PATH}/orders/outlets?city=${encodeURIComponent(city)}`;

  const response = await requestJson<OutletsApiResponse>(url, {
    method: 'GET',
    headers: {
      accept: '*/*',
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.responseType !== 1 || !Array.isArray(response.data)) {
    throw new Error('Unexpected response from outlets API.');
  }

  return response.data;
};
