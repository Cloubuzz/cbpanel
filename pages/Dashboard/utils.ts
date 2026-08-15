export const getDateRange = (filter: string): { startDate: string; endDate: string } => {
  const today = new Date();
  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  // Custom Range: encoded as "Custom Range:2025-01-01:2025-01-31"
  if (filter.startsWith('Custom Range:')) {
    const parts = filter.split(':');
    if (parts.length === 3) {
      return { startDate: parts[1], endDate: parts[2] };
    }
  }

  switch (filter) {
    case 'Yesterday': {
      const y = new Date(today);
      y.setDate(today.getDate() - 1);
      return { startDate: fmt(y), endDate: fmt(y) };
    }
    case 'Last 7 Days': {
      const s = new Date(today);
      s.setDate(today.getDate() - 6);
      return { startDate: fmt(s), endDate: fmt(today) };
    }
    case 'Last 30 Days': {
      const s = new Date(today);
      s.setDate(today.getDate() - 29);
      return { startDate: fmt(s), endDate: fmt(today) };
    }
    default:
      return { startDate: fmt(today), endDate: fmt(today) };
  }
};
