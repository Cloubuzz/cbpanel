import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Tooltip } from 'recharts';
import { BRANCH_COMPARISON } from '../constants';

export const BranchBenchmarkingChart: React.FC = () => (
  <div className="lg:col-span-4 glass-card rounded-xl p-5 border border-slate-200 dark:border-slate-800">
    <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Branch Benchmarking</h2>
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={BRANCH_COMPARISON}>
          <PolarGrid stroke="#94a3b8" strokeOpacity={0.2} />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
          <Radar name="Downtown" dataKey="A" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.3} />
          <Radar name="North Park" dataKey="B" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.1} />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    </div>
    <div className="flex justify-center gap-4 mt-2">
      <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-teal-500" /><span className="text-[9px] font-bold text-slate-500 uppercase">Downtown</span></div>
      <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-400" /><span className="text-[9px] font-bold text-slate-500 uppercase">North Park</span></div>
    </div>
  </div>
);
