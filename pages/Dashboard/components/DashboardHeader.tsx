import React, { useState, useRef, useEffect } from 'react';
import { Utensils, MapPin, Calendar, ChevronDown, Check, Download } from 'lucide-react';
import { DATE_OPTIONS } from '../constants';
import { type OutletListItem } from '../../../services/outletsApi';

interface Props {
  dateFilter: string;
  onDateFilterChange: (filter: string) => void;
  branches: OutletListItem[];
  selectedBranchId: number | null;
  onBranchChange: (branchId: number | null) => void;
}

export const DashboardHeader: React.FC<Props> = ({
  dateFilter,
  onDateFilterChange,
  branches,
  selectedBranchId,
  onBranchChange,
}) => {
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [isBranchOpen, setIsBranchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const dateRef = useRef<HTMLDivElement>(null);
  const branchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dateRef.current && !dateRef.current.contains(e.target as Node)) {
        setIsDateOpen(false);
      }
      if (branchRef.current && !branchRef.current.contains(e.target as Node)) {
        setIsBranchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedBranchName = selectedBranchId === null 
    ? 'All Branches' 
    : branches.find(b => b.id === selectedBranchId)?.name || 'Unknown Branch';

  const filteredBranches = branches.filter(b =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.city && b.city.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
        <div className="relative" ref={branchRef}>
          <button
            onClick={() => {
              setIsBranchOpen(!isBranchOpen);
              setSearchQuery('');
            }}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
          >
            <MapPin size={14} className="text-teal-500" />
            <span>{selectedBranchName}</span>
            <ChevronDown size={14} className={`transition-transform duration-200 ${isBranchOpen ? 'rotate-180' : ''}`} />
          </button>

          {isBranchOpen && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="p-2 border-b border-slate-100 dark:border-slate-800">
                <input
                  type="text"
                  placeholder="Search branch..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 text-slate-800 dark:text-slate-100"
                  autoFocus
                />
              </div>
              <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5">
                <button
                  onClick={() => {
                    onBranchChange(null);
                    setIsBranchOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-lg transition-colors ${
                    selectedBranchId === null
                      ? 'bg-teal-500 text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>All Branches</span>
                  {selectedBranchId === null && <Check size={12} />}
                </button>

                {filteredBranches.map(branch => (
                  <button
                    key={branch.id}
                    onClick={() => {
                      onBranchChange(branch.id);
                      setIsBranchOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-lg transition-colors ${
                      selectedBranchId === branch.id
                        ? 'bg-teal-500 text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex flex-col items-start">
                      <span>{branch.name}</span>
                      {branch.city && (
                        <span className={`text-[10px] ${selectedBranchId === branch.id ? 'text-teal-100' : 'text-slate-400 dark:text-slate-500'}`}>
                          {branch.city}
                        </span>
                      )}
                    </div>
                    {selectedBranchId === branch.id && <Check size={12} />}
                  </button>
                ))}

                {filteredBranches.length === 0 && searchQuery && (
                  <div className="text-center py-3 text-xs text-slate-400">
                    No branch found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={dateRef}>
          <button
            onClick={() => setIsDateOpen(!isDateOpen)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
          >
            <Calendar size={14} className="text-teal-500" />
            <span>{dateFilter}</span>
            <ChevronDown size={14} className={`transition-transform duration-200 ${isDateOpen ? 'rotate-180' : ''}`} />
            {dateFilter === 'Today' && (
              <span className="ml-1 px-1.5 py-0.5 bg-teal-500/10 text-teal-500 rounded text-[9px]">Live</span>
            )}
          </button>

          {isDateOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="p-1.5">
                {DATE_OPTIONS.map(option => (
                  <button
                    key={option}
                    onClick={() => { onDateFilterChange(option); setIsDateOpen(false); }}
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
