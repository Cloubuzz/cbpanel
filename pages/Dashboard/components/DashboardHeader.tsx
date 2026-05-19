import React, { useState, useRef, useEffect } from 'react';
import { Utensils, MapPin, Calendar, ChevronDown, Check, Download } from 'lucide-react';
import { DATE_OPTIONS } from '../constants';

interface Props {
  dateFilter: string;
  onDateFilterChange: (filter: string) => void;
}

export const DashboardHeader: React.FC<Props> = ({ dateFilter, onDateFilterChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState('All Branches');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-teal-600 rounded-xl text-white shadow-lg shadow-teal-600/20">
          <Utensils size={20} />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-none">Cloubuzz Pizza Chain</h1>
          <p className="text-[10px] text-slate-500 font-bold mt-1.5 uppercase tracking-[0.2em]">Enterprise Analytics</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
          <MapPin size={14} className="text-teal-500" />
          <select
            value={selectedBranch}
            onChange={e => setSelectedBranch(e.target.value)}
            className="bg-transparent border-none text-xs font-bold text-slate-700 dark:text-slate-200 focus:ring-0 outline-none"
          >
            <option>All Branches</option>
            <option>Downtown</option>
            <option>Westside</option>
            <option>North Park</option>
          </select>
        </div>

        <div className="relative" ref={ref}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
          >
            <Calendar size={14} className="text-teal-500" />
            <span>{dateFilter}</span>
            <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            {dateFilter === 'Today' && (
              <span className="ml-1 px-1.5 py-0.5 bg-teal-500/10 text-teal-500 rounded text-[9px]">Live</span>
            )}
          </button>

          {isOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="p-1.5">
                {DATE_OPTIONS.map(option => (
                  <button
                    key={option}
                    onClick={() => { onDateFilterChange(option); setIsOpen(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-lg transition-colors ${
                      dateFilter === option
                        ? 'bg-teal-500 text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {option}
                    {dateFilter === option && <Check size={12} />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <button className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors">
          <Download size={14} />
        </button>
      </div>
    </div>
  );
};
