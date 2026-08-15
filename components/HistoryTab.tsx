import React, { useState, useEffect, useCallback } from "react";
import { History, Clock, ArrowRight, AlertCircle, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAppSelector } from "../store/hooks";
import { selectToken } from "../store/selectors/appSelectors";
import { fetchRecordHistory, type AuditLog } from "../services/auditApi";

interface HistoryTabProps {
  entityName: string;
  entityId: number;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({ entityName, entityId }) => {
  const token = useAppSelector(selectToken);
  const [history, setHistory] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<number[]>([]);

  const loadHistory = useCallback(async () => {
    if (!token || !entityId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchRecordHistory(token, entityName, entityId);
      setHistory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load history.");
    } finally {
      setIsLoading(false);
    }
  }, [token, entityName, entityId]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const toggleExpand = (id: number) => {
    setExpandedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const parseChanges = (changesStr: string) => {
    try {
      if (!changesStr) return [];
      const parsed = JSON.parse(changesStr);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const getActionBadgeColor = (action: string) => {
    switch (action.toUpperCase()) {
      case "CREATE":
        return "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20";
      case "UPDATE":
        return "bg-amber-500/10 text-amber-500 border border-amber-500/20";
      case "DELETE":
        return "bg-rose-500/10 text-rose-500 border border-rose-500/20";
      default:
        return "bg-slate-500/10 text-slate-500 border border-slate-500/20";
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <History className="text-teal-500" size={20} />
          <h3 className="font-bold text-slate-900 dark:text-white text-lg">Change History</h3>
          <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full font-bold">
            {entityName} #{entityId}
          </span>
        </div>
        <button
          onClick={loadHistory}
          disabled={isLoading}
          className="p-2 text-slate-400 hover:text-teal-500 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl transition-all disabled:opacity-50"
          title="Refresh history"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-2xl text-rose-600 dark:text-rose-400">
          <AlertCircle size={18} className="shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 shrink-0" />
              <div className="flex-1 space-y-3 py-1">
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/3" />
                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-12 bg-slate-50/50 dark:bg-slate-950/20 rounded-[24px] border border-dashed border-slate-200 dark:border-slate-800">
          <Clock className="text-slate-300 dark:text-slate-700 mx-auto mb-3" size={32} />
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">No history entries found for this record.</p>
        </div>
      ) : (
        <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-4 pl-6 space-y-6">
          {history.map((log) => {
            const isExpanded = expandedIds.includes(log.Id);
            const parsedChanges = parseChanges(log.Changes);

            return (
              <div key={log.Id} className="relative group">
                {/* Timeline node */}
                <div className="absolute -left-[33px] top-1.5 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 border-teal-500 shadow-md group-hover:scale-125 transition-transform" />

                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-teal-400 to-teal-500 flex items-center justify-center text-white text-[10px] font-bold">
                        {log.UserName?.slice(0, 2).toUpperCase() || "SY"}
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 dark:text-white text-sm">
                          {log.UserName || "System"}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium ml-2">
                          (ID #{log.UserId})
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest ${getActionBadgeColor(log.ActionType)}`}>
                        {log.ActionType}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {formatDate(log.Timestamp)}
                      </span>
                    </div>
                  </div>

                  {parsedChanges.length > 0 && (
                    <button
                      onClick={() => toggleExpand(log.Id)}
                      className="text-xs font-bold text-teal-500 hover:text-teal-600 flex items-center gap-1 mt-1 outline-none"
                    >
                      {isExpanded ? "Hide details" : `Show details (${parsedChanges.length} changes)`}
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  )}

                  <AnimatePresence>
                    {isExpanded && parsedChanges.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden border border-slate-100 dark:border-slate-800/60 rounded-xl bg-slate-50/50 dark:bg-slate-950/30 p-3 mt-2 space-y-2"
                      >
                        {parsedChanges.map((change: any, idx: number) => (
                          <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs border-b border-slate-100/80 dark:border-slate-800/40 pb-2 last:border-b-0 last:pb-0">
                            <span className="font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                              {change.field}
                            </span>
                            <div className="flex items-center gap-2">
                              {change.oldValue !== undefined && (
                                <span className="bg-rose-500/10 text-rose-500 px-1.5 py-0.5 rounded border border-rose-500/10 line-through truncate max-w-[150px]">
                                  {change.oldValue || "empty"}
                                </span>
                              )}
                              {change.oldValue !== undefined && <ArrowRight size={12} className="text-slate-400" />}
                              <span className="bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded border border-emerald-500/10 font-bold truncate max-w-[150px]">
                                {change.newValue || "empty"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
