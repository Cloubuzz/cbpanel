export type Channel = 'EMAIL' | 'SMS' | 'WHATSAPP';
export type CampaignStatus = 'ACTIVE' | 'PAUSED' | 'DRAFT' | 'COMPLETED' | 'SCHEDULED';

export interface Campaign {
  id: string;
  name: string;
  channel: Channel;
  status: CampaignStatus;
  audience: string;
  sent: number;
  openRate: number;
  clickRate: number;
  revenue: number;
  lastEdited: string;
  trendData: { value: number }[];
}
