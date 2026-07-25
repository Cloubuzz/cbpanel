export interface Voucher {
  id: string;
  code: string;
  description: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  minOrderValue: number;
  maxDiscount?: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
  image?: string;
  cityId?: string;
  platforms: string[];
  orderId?: number;
}
