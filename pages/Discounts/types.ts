export interface Discount {
  id: string;
  name: string;
  description: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
  image?: string;
}
