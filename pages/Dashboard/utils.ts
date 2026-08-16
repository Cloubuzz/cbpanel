export const getDateRange = (
  filter: string,
  shiftStartHour: string = '08:00'
): { startDate: string; endDate: string } => {
  const today = new Date();
  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  const addOneDay = (dateStr: string) => {
    const parts = dateStr.split('-');
    const d = new Date(Date.UTC(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10)));
    d.setUTCDate(d.getUTCDate() + 1);
    return fmt(d);
  };

  let startRaw = fmt(today);
  let endRaw = fmt(today);

  // Custom Range: encoded as "Custom Range:2025-01-01:2025-01-31"
  if (filter.startsWith('Custom Range:')) {
    const parts = filter.split(':');
    if (parts.length === 3) {
      startRaw = parts[1];
      endRaw = parts[2];
    }
  } else {
    switch (filter) {
      case 'Yesterday': {
        const y = new Date(today);
        y.setDate(today.getDate() - 1);
        startRaw = fmt(y);
        endRaw = fmt(y);
        break;
      }
      case 'Last 7 Days': {
        const s = new Date(today);
        s.setDate(today.getDate() - 6);
        startRaw = fmt(s);
        endRaw = fmt(today);
        break;
      }
      case 'Last 30 Days': {
        const s = new Date(today);
        s.setDate(today.getDate() - 29);
        startRaw = fmt(s);
        endRaw = fmt(today);
        break;
      }
      default:
        startRaw = fmt(today);
        endRaw = fmt(today);
        break;
    }
  }

  const timeSuffix = ` ${shiftStartHour}:00`;
  return {
    startDate: `${startRaw}${timeSuffix}`,
    endDate: `${addOneDay(endRaw)}${timeSuffix}`,
  };
};
