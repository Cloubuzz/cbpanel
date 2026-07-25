export const CHART_COLORS = ['#14b8a6', '#0d9488', '#0f766e', '#134e4a', '#052e2b'];

export const DATE_OPTIONS = ['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'Custom Range'];

export const getFulfillmentColor = (status: string): string => {
  const s = status.toLowerCase();
  if (s === 'confirmed') return '#14b8a6';
  if (s === 'rejected') return '#ef4444';
  if (s.includes('decline') || s.includes('undefined')) return '#f59e0b';
  return '#94a3b8';
};

