import React from 'react';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { PREP_TIME_DATA } from '../constants';

export const PrepTimeTrendChart: React.FC = () => (
  <div className="lg:col-span-4 glass-card rounded-xl p-5 border border-slate-200 dark:border-slate-800">
    <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Prep Time Trend</h2>
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={PREP_TIME_DATA}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.1} />
          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
          <Tooltip />
          <Line type="monotone" dataKey="avgTime" stroke="#14b8a6" strokeWidth={2} dot={{ r: 4, fill: '#14b8a6' }} />
          <Line type="monotone" dataKey="target" stroke="#94a3b8" strokeDasharray="5 5" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
    <div className="flex justify-center gap-4 mt-4">
      <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-teal-500" /><span className="text-[9px] font-bold text-slate-500 uppercase">Actual</span></div>
      <div className="flex items-center gap-1.5"><div className="w-4 border-t-2 border-dashed border-slate-400" /><span className="text-[9px] font-bold text-slate-500 uppercase">Target</span></div>
    </div>
  </div>
);
