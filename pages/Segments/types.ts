export interface Segment {
  id: string;
  name: string;
  description: string;
  count: number;
  growth: number;
  potential: 'High' | 'Medium' | 'Low';
  score: number;
  avgOrderValue: number;
  tags: string[];
  lastSync: string;
  trendData: { value: number }[];
}
