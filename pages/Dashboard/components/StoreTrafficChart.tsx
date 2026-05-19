import React from 'react';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, Tooltip } from 'recharts';
import { TRAFFIC_DATA } from '../constants';

export const StoreTrafficChart: React.FC = () => (
  <div className="lg:col-span-4 glass-card rounded-xl p-5 border border-slate-200 dark:border-slate-800">
    <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Store Traffic</h2>
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={TRAFFIC_DATA}>
          <defs>
            <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.1} />
          <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
          <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
          <Area type="monotone" dataKey="visitors" stroke="#14b8a6" fillOpacity={1} fill="url(#colorTraffic)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
    <div className="mt-4 flex justify-between items-center px-2">
      <div>
        <p className="text-[9px] font-bold text-slate-400 uppercase">Peak Traffic</p>
        <p className="text-xs font-bold text-slate-900 dark:text-white">8:00 PM</p>
      </div>
      <div className="text-right">
        <p className="text-[9px] font-bold text-slate-400 uppercase">Avg. Session</p>
        <p className="text-xs font-bold text-slate-900 dark:text-white">4.2 min</p>
      </div>
    </div>
  </div>
);
