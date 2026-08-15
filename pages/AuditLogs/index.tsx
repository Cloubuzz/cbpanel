import React, { useState, useEffect, useCallback } from "react";
import {
  History,
  Filter,
  RefreshCw,
  X,
  Layers,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAppSelector } from "../../store/hooks";
import { selectToken } from "../../store/selectors/appSelectors";
import { fetchAuditLogs, type AuditLog } from "../../services/auditApi";

export const AuditLogs: React.FC = () => {
  const token = useAppSelector(selectToken);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters state
  const [entityName, setEntityName] = useState("");
  const [entityId, setEntityId] = useState("");
  const [actionType, setActionType] = useState("");
  const [userId, setUserId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  // Expanded log IDs for detail view
  const [expandedLogIds, setExpandedLogIds] = useState<number[]>([]);

  const loadLogs = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (entityName) params.entityName = entityName;
      if (entityId) params.entityId = parseInt(entityId, 10);
      if (actionType) params.actionType = actionType;
      if (userId) params.userId = parseInt(userId, 10);
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const data = await fetchAuditLogs(token, params);
      setLogs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load audit logs.");
    } finally {
      setIsLoading(false);
    }
  }, [token, entityName, entityId, actionType, userId, startDate, endDate]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const toggleExpand = (id: number) => {
    setExpandedLogIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const clearFilters = () => {
    setEntityName("");
    setEntityId("");
    setActionType("");
    setUserId("");
    setStartDate("");
    setEndDate("");
  };

  // Helper to format date
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

  // Helper to parse changes JSON safely
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

  return (
    <div className="p-6 md:p-10 max-w-[1600px] mx-auto min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-teal-500 rounded-2xl shadow-lg shadow-teal-500/20 rotate-3">
              <History className="text-white" size={28} />
            </div>
            System Audit Trail
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Monitor and review record changes across the application database in real-time
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadLogs}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 rounded-2xl font-bold border border-slate-200 dark:border-slate-800 hover:border-teal-500 transition-all disabled:opacity-50"
            title="Refresh logs"
          >
            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Sidebar Filters */}
        <div className="xl:col-span-3 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Filter size={18} className="text-teal-500" />
                Filters
              </h3>
              {(entityName || entityId || actionType || userId || startDate || endDate) && (
                <button
                  onClick={clearFilters}
                  className="text-xs font-bold text-rose-500 hover:text-rose-600 uppercase tracking-wider flex items-center gap-1 transition-colors"
                >
                  <X size={14} />
                  Clear All
                </button>
              )}
            </div>

            {/* Filter Inputs */}
            <div className="space-y-4">
              {/* Action Type */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Action Type</label>
                <select
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-teal-500 rounded-xl px-4 py-3 text-sm outline-none dark:text-white transition-all"
                >
                  <option value="">All Actions</option>
                  <option value="CREATE">CREATE</option>
                  <option value="UPDATE">UPDATE</option>
                  <option value="DELETE">DELETE</option>
                </select>
              </div>

              {/* Module Name */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Module / Entity</label>
                <select
                  value={entityName}
                  onChange={(e) => setEntityName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-teal-500 rounded-xl px-4 py-3 text-sm outline-none dark:text-white transition-all"
                >
                  <option value="">All Modules</option>
                  <option value="MenuCategory">Menu Category</option>
                  <option value="MenuItem">Menu Item</option>
                  <option value="Banner">Banner</option>
                  <option value="Outlet">Outlet</option>
                </select>
              </div>

              {/* Entity ID */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Record ID</label>
                <input
                  type="number"
                  placeholder="e.g. 230"
                  value={entityId}
                  onChange={(e) => setEntityId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-teal-500 rounded-xl px-4 py-3 text-sm outline-none dark:text-white transition-all"
                />
              </div>

              {/* User ID */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">User ID</label>
                <input
                  type="number"
                  placeholder="e.g. 1"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-teal-500 rounded-xl px-4 py-3 text-sm outline-none dark:text-white transition-all"
                />
              </div>

              {/* Date Filters */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-teal-500 rounded-xl px-4 py-3 text-sm outline-none dark:text-white transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-teal-500 rounded-xl px-4 py-3 text-sm outline-none dark:text-white transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Global List Table */}
        <div className="xl:col-span-9 space-y-6">
          {error && (
            <div className="flex items-center gap-3 p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-2xl text-rose-600 dark:text-rose-400">
              <AlertCircle size={18} className="shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50 dark:bg-slate-950/20">
                    <th className="py-5 px-6">User</th>
                    <th className="py-5 px-6">Action</th>
                    <th className="py-5 px-6">Target Record</th>
                    <th className="py-5 px-6">Timestamp</th>
                    <th className="py-5 px-6 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                  {isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="py-5 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800" />
                            <div className="h-4 w-24 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          <div className="h-6 w-16 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                        </td>
                        <td className="py-5 px-6">
                          <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                        </td>
                        <td className="py-5 px-6">
                          <div className="h-4 w-28 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                        </td>
                        <td className="py-5 px-6">
                          <div className="h-8 w-8 bg-slate-100 dark:bg-slate-800 rounded-lg ml-auto" />
                        </td>
                      </tr>
                    ))
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-20 text-center">
                        <div className="max-w-md mx-auto space-y-4">
                          <History size={48} className="text-slate-300 dark:text-slate-700 mx-auto" />
                          <h4 className="font-bold text-lg text-slate-800 dark:text-white">No Audit Logs Found</h4>
                          <p className="text-slate-400 text-sm">
                            Try adjusting your filters or checking back after updates have been made.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => {
                      const isExpanded = expandedLogIds.includes(log.Id);
                      const parsedChanges = parseChanges(log.Changes);

                      return (
                        <React.Fragment key={log.Id}>
                          <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-all">
                            {/* User details */}
                            <td className="py-5 px-6">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-teal-500/10">
                                  {log.UserName?.slice(0, 2).toUpperCase() || "SY"}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900 dark:text-white">{log.UserName || "System"}</p>
                                  <p className="text-[10px] text-slate-400 font-medium">User #{log.UserId}</p>
                                </div>
                              </div>
                            </td>

                            {/* Action type */}
                            <td className="py-5 px-6">
                              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${getActionBadgeColor(log.ActionType)}`}>
                                {log.ActionType}
                              </span>
                            </td>

                            {/* Target Record */}
                            <td className="py-5 px-6">
                              <div className="flex items-center gap-2">
                                <Layers size={14} className="text-slate-400" />
                                <span className="font-semibold text-slate-700 dark:text-slate-300">
                                  {log.EntityName}
                                </span>
                                <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-[10px] font-bold rounded text-slate-500">
                                  ID: {log.EntityId}
                                </span>
                              </div>
                            </td>

                            {/* Timestamp */}
                            <td className="py-5 px-6 text-slate-500 dark:text-slate-400 font-medium">
                              {formatDate(log.Timestamp)}
                            </td>

                            {/* Action / Expand button */}
                            <td className="py-5 px-6 text-right">
                              <button
                                onClick={() => toggleExpand(log.Id)}
                                className="p-2 text-slate-400 hover:text-teal-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"
                              >
                                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                              </button>
                            </td>
                          </tr>

                          {/* Expanded Changes Section */}
                          <AnimatePresence>
                            {isExpanded && (
                              <tr>
                                <td colSpan={5} className="bg-slate-50/50 dark:bg-slate-950/20 px-8 py-5">
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden border border-slate-150 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-900/60 p-5 space-y-4"
                                  >
                                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                                      Modification Details ({parsedChanges.length} Field{parsedChanges.length !== 1 && "s"})
                                    </h5>

                                    {parsedChanges.length === 0 ? (
                                      <p className="text-xs text-slate-400 italic">No structured property changes recorded.</p>
                                    ) : (
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {parsedChanges.map((change: any, cIdx: number) => (
                                          <div key={cIdx} className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800/50 space-y-2">
                                            <div className="flex items-center justify-between">
                                              <span className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                                {change.field}
                                              </span>
                                            </div>
                                            
                                            <div className="flex items-center gap-3 text-xs">
                                              {change.oldValue !== undefined && (
                                                <div className="bg-rose-500/10 text-rose-500 px-2 py-1 rounded border border-rose-500/10 line-through truncate max-w-[200px]" title={change.oldValue}>
                                                  {change.oldValue || "empty"}
                                                </div>
                                              )}
                                              
                                              {change.oldValue !== undefined && (
                                                <ArrowRight size={14} className="text-slate-400 shrink-0" />
                                              )}

                                              <div className="bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded border border-emerald-500/10 font-bold truncate max-w-[200px]" title={change.newValue}>
                                                {change.newValue || "empty"}
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </motion.div>
                                </td>
                              </tr>
                            )}
                          </AnimatePresence>
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
