import React, { useState, useRef, useEffect } from 'react';
import { Utensils, MapPin, Calendar, ChevronDown, Check, Download, Clock } from 'lucide-react';
import { DATE_OPTIONS } from '../constants';
import { type OutletListItem } from '../../../services/outletsApi';

interface Props {
  dateFilter: string;
  onDateFilterChange: (filter: string) => void;
  branches: OutletListItem[];
  selectedBranchId: number | null;
  onBranchChange: (branchId: number | null) => void;
  shiftStartHour: string;
  onShiftStartHourChange: (hour: string) => void;
}

const fmt = (d: Date) => d.toISOString().slice(0, 10);

const today = new Date();
const defaultStart = fmt(new Date(new Date().setDate(today.getDate() - 6)));
const defaultEnd = fmt(today);

/** Returns the human-readable label for the button */
const getFilterLabel = (filter: string): string => {
  if (filter.startsWith('Custom Range:')) {
    const parts = filter.split(':');
    if (parts.length === 3) return `${parts[1]} → ${parts[2]}`;
  }
  return filter;
};

const formatShiftLabel = (timeStr: string): string => {
  const [h, m] = timeStr.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${m} ${ampm}`;
};

export const DashboardHeader: React.FC<Props> = ({
  dateFilter,
  onDateFilterChange,
  branches,
  selectedBranchId,
  onBranchChange,
  shiftStartHour,
  onShiftStartHourChange,
}) => {
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [isBranchOpen, setIsBranchOpen] = useState(false);
  const [isShiftOpen, setIsShiftOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  // Custom range local state
  const [customStart, setCustomStart] = useState(defaultStart);
  const [customEnd, setCustomEnd] = useState(defaultEnd);

  const dateRef = useRef<HTMLDivElement>(null);
  const branchRef = useRef<HTMLDivElement>(null);
  const shiftRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dateRef.current && !dateRef.current.contains(e.target as Node)) {
        setIsDateOpen(false);
        setShowCustomPicker(false);
      }
      if (branchRef.current && !branchRef.current.contains(e.target as Node)) {
        setIsBranchOpen(false);
      }
      if (shiftRef.current && !shiftRef.current.contains(e.target as Node)) {
        setIsShiftOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Pre-populate inputs if currently on a custom range
  useEffect(() => {
    if (dateFilter.startsWith('Custom Range:')) {
      const parts = dateFilter.split(':');
      if (parts.length === 3) {
        setCustomStart(parts[1]);
        setCustomEnd(parts[2]);
      }
    }
  }, [dateFilter]);

  const selectedBranchName = selectedBranchId === null
    ? 'All Branches'
    : branches.find(b => b.id === selectedBranchId)?.name || 'Unknown Branch';

  const filteredBranches = branches.filter(b =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.city && b.city.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleApplyCustomRange = () => {
    if (!customStart || !customEnd) return;
    onDateFilterChange(`Custom Range:${customStart}:${customEnd}`);
    setIsDateOpen(false);
    setShowCustomPicker(false);
  };

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-teal-600 rounded-xl text-white shadow-lg shadow-teal-600/20">
          <Utensils size={20} />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-none">Broadway Pizza Chain</h1>
          <p className="text-[10px] text-slate-500 font-bold mt-1.5 uppercase tracking-[0.2em]">Enterprise Analytics</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Branch selector */}
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
                  onClick={() => { onBranchChange(null); setIsBranchOpen(false); }}
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
                    onClick={() => { onBranchChange(branch.id); setIsBranchOpen(false); }}
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
                  <div className="text-center py-3 text-xs text-slate-400">No branch found</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Date filter */}
        <div className="relative" ref={dateRef}>
          <button
            onClick={() => { setIsDateOpen(!isDateOpen); setShowCustomPicker(false); }}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
          >
            <Calendar size={14} className="text-teal-500" />
            <span>{getFilterLabel(dateFilter)}</span>
            <ChevronDown size={14} className={`transition-transform duration-200 ${isDateOpen ? 'rotate-180' : ''}`} />
            {dateFilter === 'Today' && (
              <span className="ml-1 px-1.5 py-0.5 bg-teal-500/10 text-teal-500 rounded text-[9px]">Live</span>
            )}
          </button>

          {isDateOpen && (
            <div className="absolute top-full right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden"
              style={{ minWidth: showCustomPicker ? '260px' : '180px' }}>

              {/* Preset options */}
              {!showCustomPicker && (
                <div className="p-1.5">
                  {DATE_OPTIONS.map(option => (
                    option === 'Custom Range' ? (
                      <button
                        key={option}
                        onClick={() => setShowCustomPicker(true)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-lg transition-colors ${
                          dateFilter.startsWith('Custom Range')
                            ? 'bg-teal-500 text-white'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span>Custom Range</span>
                        <Calendar size={12} />
                      </button>
                    ) : (
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
                    )
                  ))}
                </div>
              )}

              {/* Custom date picker panel */}
              {showCustomPicker && (
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <button
                      onClick={() => setShowCustomPicker(false)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                      title="Back"
                    >
                      ←
                    </button>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Select Date Range</span>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Start Date</label>
                      <input
                        type="date"
                        value={customStart}
                        max={customEnd || fmt(today)}
                        onChange={e => setCustomStart(e.target.value)}
                        className="w-full px-2.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">End Date</label>
                      <input
                        type="date"
                        value={customEnd}
                        min={customStart}
                        max={fmt(today)}
                        onChange={e => setCustomEnd(e.target.value)}
                        className="w-full px-2.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleApplyCustomRange}
                    disabled={!customStart || !customEnd}
                    className="w-full py-2 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    Apply Range
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Shift Start Hour */}
        <div className="relative" ref={shiftRef}>
          <button
            onClick={() => setIsShiftOpen(!isShiftOpen)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
          >
            <Clock size={14} className="text-teal-500" />
            <span>Shift: {formatShiftLabel(shiftStartHour)}</span>
            <ChevronDown size={14} className={`transition-transform duration-200 ${isShiftOpen ? 'rotate-180' : ''}`} />
          </button>

          {isShiftOpen && (
            <div className="absolute top-full right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden w-48">
              <div className="p-1.5">
                {[
                  { value: '00:00', label: '12:00 AM (Calendar)' },
                  { value: '06:00', label: '06:00 AM' },
                  { value: '08:00', label: '08:00 AM (Default)' },
                  { value: '09:00', label: '09:00 AM' },
                  { value: '10:00', label: '10:00 AM' },
                  { value: '12:00', label: '12:00 PM' }
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      onShiftStartHourChange(opt.value);
                      setIsShiftOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-lg transition-colors ${
                      shiftStartHour === opt.value
                        ? 'bg-teal-500 text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {shiftStartHour === opt.value && <Check size={12} />}
                  </button>
                ))}
              </div>

              <div className="p-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Custom Hour</span>
                  <input
                    type="time"
                    value={shiftStartHour}
                    onChange={(e) => onShiftStartHourChange(e.target.value)}
                    className="w-full px-2 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 text-slate-850 dark:text-slate-100"
                  />
                </div>
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
