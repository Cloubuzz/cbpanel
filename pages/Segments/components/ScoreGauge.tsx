import React from 'react';

interface Props {
  score: number;
}

export const ScoreGauge: React.FC<Props> = ({ score }) => {
  const color = score > 75 ? 'bg-teal-500' : score > 40 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-1">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Engagement Score</span>
        <span className={`text-sm font-bold ${score > 75 ? 'text-teal-600 dark:text-teal-400' : 'text-slate-700 dark:text-slate-300'}`}>{score}/100</span>
      </div>
      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-1000`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
};
