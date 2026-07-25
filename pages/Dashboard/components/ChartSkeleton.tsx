import React from 'react';

interface Props { height?: string; }

export const ChartSkeleton: React.FC<Props> = ({ height = 'h-[200px]' }) => (
  <div className={`${height} w-full animate-pulse bg-slate-200 dark:bg-slate-800 rounded-xl`} />
);
