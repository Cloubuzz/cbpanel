export const CHART_COLORS = ['#14b8a6', '#0d9488', '#0f766e', '#134e4a', '#052e2b'];

export const DATE_OPTIONS = ['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'Custom Range'];

export const getFulfillmentColor = (status: string): string => {
  const s = status.toLowerCase();
  if (s === 'confirmed') return '#14b8a6';
  if (s === 'rejected') return '#ef4444';
  if (s.includes('decline') || s.includes('undefined')) return '#f59e0b';
  return '#94a3b8';
};

// Static mock data — no API available for these yet
export const PREP_TIME_DATA = [
  { day: 'Mon', avgTime: 18, target: 20 },
  { day: 'Tue', avgTime: 22, target: 20 },
  { day: 'Wed', avgTime: 20, target: 20 },
  { day: 'Thu', avgTime: 25, target: 20 },
  { day: 'Fri', avgTime: 32, target: 20 },
  { day: 'Sat', avgTime: 35, target: 20 },
  { day: 'Sun', avgTime: 28, target: 20 },
];

export const TRAFFIC_DATA = [
  { time: '8am', visitors: 120 },
  { time: '10am', visitors: 450 },
  { time: '12pm', visitors: 1200 },
  { time: '2pm', visitors: 850 },
  { time: '4pm', visitors: 720 },
  { time: '6pm', visitors: 1800 },
  { time: '8pm', visitors: 2400 },
  { time: '10pm', visitors: 1100 },
];

export const AOV_DATA = [
  { day: 'Mon', aov: 22 },
  { day: 'Tue', aov: 24 },
  { day: 'Wed', aov: 23 },
  { day: 'Thu', aov: 26 },
  { day: 'Fri', aov: 32 },
  { day: 'Sat', aov: 38 },
  { day: 'Sun', aov: 35 },
];

export const BRANCH_COMPARISON = [
  { subject: 'Sales', A: 120, B: 110, fullMark: 150 },
  { subject: 'Speed', A: 98, B: 130, fullMark: 150 },
  { subject: 'Rating', A: 86, B: 130, fullMark: 150 },
  { subject: 'Staff', A: 99, B: 100, fullMark: 150 },
  { subject: 'Waste', A: 85, B: 90, fullMark: 150 },
  { subject: 'Growth', A: 65, B: 85, fullMark: 150 },
];

export const LIVE_ORDERS_MOCK = [
  { id: '#PIZ-9921', branch: 'Downtown', items: '2x Large Pepperoni', total: 'RS 42.50', time: '4 mins ago', status: 'Baking' },
  { id: '#PIZ-9920', branch: 'North Park', items: '1x BBQ Chicken, 1x Coke', total: 'RS 28.90', time: '7 mins ago', status: 'Prep' },
  { id: '#PIZ-9919', branch: 'Westside', items: '3x Margherita', total: 'RS 54.00', time: '12 mins ago', status: 'Out for Delivery' },
  { id: '#PIZ-9918', branch: 'Downtown', items: '1x Veggie Supreme', total: 'RS 19.50', time: '15 mins ago', status: 'Delivered' },
];
