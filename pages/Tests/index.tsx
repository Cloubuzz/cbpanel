import React, { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Search,
  RefreshCw,
  X,
  AlertCircle,
  CheckCircle,
  XCircle,
  User,
  Calendar,
  Percent,
  Phone,
  MapPin,
  Award,
  Briefcase,
  Eye,
  GraduationCap
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAppSelector } from "../../store/hooks";
import { selectToken } from "../../store/selectors/appSelectors";
import { fetchTests, fetchTestDetail, type TestMasterRecord, type TestDetailResponse } from "../../services/testApi";

export const Tests: React.FC = () => {
  const token = useAppSelector(selectToken);
  const [tests, setTests] = useState<TestMasterRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search and filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Detail Modal state
  const [selectedTestId, setSelectedTestId] = useState<number | null>(null);
  const [testDetail, setTestDetail] = useState<TestDetailResponse | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const loadTests = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchTests(token);
      setTests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load test records.");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadTests();
  }, [loadTests]);

  const handleViewDetail = async (id: number) => {
    if (!token) return;
    setSelectedTestId(id);
    setTestDetail(null);
    setIsLoadingDetail(true);
    setDetailError(null);
    try {
      const data = await fetchTestDetail(token, id);
      setTestDetail(data);
    } catch (err) {
      setDetailError(err instanceof Error ? err.message : "Failed to load details.");
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const closeDetailModal = () => {
    setSelectedTestId(null);
    setTestDetail(null);
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

  const filteredTests = tests.filter((item) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      String(item.Name ?? "").toLowerCase().includes(term) ||
      String(item.EmployeeID ?? "").toLowerCase().includes(term) ||
      String(item.Branch ?? "").toLowerCase().includes(term) ||
      String(item.Designation ?? "").toLowerCase().includes(term);

    const matchesStatus =
      !statusFilter || String(item.Result ?? "").toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 md:p-10 max-w-[1600px] mx-auto min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-teal-500 rounded-2xl shadow-lg shadow-teal-500/20 rotate-3">
              <GraduationCap className="text-white" size={28} />
            </div>
            LMS Test Master Records
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Analyze employee training assessments, test scores, and detailed responses
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadTests}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 rounded-2xl font-bold border border-slate-200 dark:border-slate-800 hover:border-teal-500 hover:text-teal-500 transition-all disabled:opacity-50"
            title="Sync tests"
          >
            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 mb-8 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-2xl text-rose-600 dark:text-rose-400">
          <AlertCircle size={18} className="shrink-0" />
          <span className="text-sm font-semibold">{error}</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Search by Employee, ID, Branch, or Designation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 focus:border-teal-500 rounded-2xl pl-12 pr-4 py-3 text-sm outline-none dark:text-white transition-all"
          />
        </div>
        {/* Status Filter */}
        <div className="w-full md:w-64">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 focus:border-teal-500 rounded-2xl px-4 py-3 text-sm outline-none dark:text-white transition-all"
          >
            <option value="">All Results</option>
            <option value="PASS">Pass</option>
            <option value="FAIL">Fail</option>
          </select>
        </div>
      </div>

      {/* Listing Content */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-[32px] overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <RefreshCw className="text-teal-500 animate-spin" size={36} />
            <p className="text-sm font-bold text-slate-500">Loading test records...</p>
          </div>
        ) : filteredTests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <FileText className="text-slate-300 dark:text-slate-700" size={48} />
            <p className="text-lg font-bold text-slate-700 dark:text-slate-300">No records found</p>
            <p className="text-sm text-slate-400">Try modifying your search or filters to see results.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/20">
                  <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest">ID</th>
                  <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Employee</th>
                  <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Designation</th>
                  <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Branch / City</th>
                  <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Phone</th>
                  <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Score</th>
                  <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Result</th>
                  <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Created</th>
                  <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredTests.map((item, idx) => {
                  const result = String(item.Result ?? "").toUpperCase();
                  const isPass = result === "PASS";
                  const pct = item.Percentage != null
                    ? parseFloat(String(item.Percentage)).toFixed(1)
                    : "—";
                  return (
                    <tr
                      key={item.ID ?? idx}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                    >
                      <td className="p-5 text-sm font-bold text-slate-500 dark:text-slate-400">#{item.ID ?? "—"}</td>
                      <td className="p-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{item.Name ?? "—"}</span>
                          <span className="text-xs text-slate-400 mt-0.5">Emp ID: {item.EmployeeID ?? "—"}</span>
                        </div>
                      </td>
                      <td className="p-5">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.Designation ?? "—"}</span>
                      </td>
                      <td className="p-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{item.Branch ?? "—"}</span>
                          <span className="text-xs text-slate-400 mt-0.5">{item.City ?? "—"}</span>
                        </div>
                      </td>
                      <td className="p-5 text-sm font-medium text-slate-600 dark:text-slate-400">{item.Phone ?? "—"}</td>
                      <td className="p-5 text-center">
                        <span className="text-sm font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                          {pct}%
                        </span>
                      </td>
                      <td className="p-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                          isPass
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isPass ? "bg-emerald-500" : "bg-rose-500"}`}></span>
                          {item.Result ?? "—"}
                        </span>
                      </td>
                      <td className="p-5 text-sm text-slate-500 dark:text-slate-400">{formatDate(item.Created ?? "")}</td>
                      <td className="p-5 text-center">
                        <button
                          onClick={() => handleViewDetail(item.ID)}
                          className="p-2 bg-teal-500/10 text-teal-500 hover:bg-teal-500 hover:text-white rounded-xl border border-teal-500/20 transition-all"
                          title="View Answers and details"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Dialog */}
      <AnimatePresence>
        {selectedTestId !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDetailModal}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
            ></motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-5xl h-[85vh] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-[32px] shadow-2xl flex flex-col overflow-hidden z-10"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="text-teal-500" size={22} />
                    Test Execution Details
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Details and complete response logs for Test #{selectedTestId}
                  </p>
                </div>
                <button
                  onClick={closeDetailModal}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {isLoadingDetail ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4 py-20">
                    <RefreshCw className="text-teal-500 animate-spin" size={32} />
                    <p className="text-sm font-bold text-slate-500">Retrieving details...</p>
                  </div>
                ) : detailError ? (
                  <div className="flex items-center gap-3 p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-2xl text-rose-600 dark:text-rose-400">
                    <AlertCircle size={18} />
                    <span className="text-sm font-semibold">{detailError}</span>
                  </div>
                ) : testDetail ? (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Master Profile Side Card */}
                    <div className="lg:col-span-4 space-y-6">
                      <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-inner space-y-5">
                        <div className="flex flex-col items-center text-center pb-4 border-b border-slate-200/50 dark:border-slate-800/80">
                          <div className="w-16 h-16 rounded-2xl bg-teal-500/10 text-teal-500 flex items-center justify-center mb-3">
                            <User size={32} />
                          </div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-lg">{testDetail.master?.Name ?? "—"}</h4>
                          <span className="text-xs text-slate-400 mt-1">Emp ID: {testDetail.master?.EmployeeID ?? "—"}</span>
                          <span className={`inline-flex items-center gap-1 mt-3 px-3 py-1 rounded-full text-xs font-bold border ${
                            String(testDetail.master?.Result ?? "").toUpperCase() === "PASS"
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                              : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                          }`}>
                            {testDetail.master?.Result ?? "—"}
                          </span>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center gap-3 text-sm">
                            <Briefcase size={16} className="text-slate-400 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Designation</p>
                              <p className="text-slate-700 dark:text-slate-300 font-semibold truncate">{testDetail.master?.Designation ?? "—"}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 text-sm">
                            <MapPin size={16} className="text-slate-400 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Branch & City</p>
                              <p className="text-slate-700 dark:text-slate-300 font-semibold">{testDetail.master?.Branch ?? "—"} ({testDetail.master?.City ?? "—"})</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 text-sm">
                            <Phone size={16} className="text-slate-400 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Phone</p>
                              <p className="text-slate-700 dark:text-slate-300 font-semibold">{testDetail.master?.Phone ?? "—"}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 text-sm">
                            <Percent size={16} className="text-slate-400 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Percentage Score</p>
                              <p className="text-slate-700 dark:text-slate-300 font-bold text-base">
                                {testDetail.master?.Percentage != null ? parseFloat(String(testDetail.master.Percentage)).toFixed(2) : "—"}%
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 text-sm">
                            <Calendar size={16} className="text-slate-400 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Created</p>
                              <p className="text-slate-700 dark:text-slate-300 font-semibold">{formatDate(testDetail.master?.Created ?? "")}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Question Answers Details Section */}
                    <div className="lg:col-span-8 space-y-6">
                      <div className="border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden bg-slate-50/50 dark:bg-slate-950/20">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
                          <h5 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Award className="text-teal-500" size={18} />
                            Answer Verification List
                          </h5>
                          <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-slate-500 dark:text-slate-400 font-semibold">
                            {(testDetail.questions ?? []).length} Questions
                          </span>
                        </div>

                        {(testDetail.questions ?? []).length === 0 ? (
                          <div className="p-10 text-center text-slate-400 dark:text-slate-500">
                            No detail questions and answers log found for this test.
                          </div>
                        ) : (
                          <div className="divide-y divide-slate-100 dark:divide-slate-800/80 max-h-[50vh] overflow-y-auto">
                            {(testDetail.questions ?? []).map((q, idx) => {
                              const isCorrect = String(q.correct) === "1" || String(q.correct) === "true";
                              return (
                                <div key={idx} className="p-5 flex gap-4 hover:bg-white dark:hover:bg-slate-900/40 transition-colors">
                                  <div className="shrink-0 mt-0.5">
                                    {isCorrect ? (
                                      <CheckCircle className="text-emerald-500" size={20} />
                                    ) : (
                                      <XCircle className="text-rose-500" size={20} />
                                    )}
                                  </div>
                                  <div className="space-y-1.5 flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-850 dark:text-slate-100 leading-snug">
                                      Q{idx + 1}: {q.question}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-2 mt-1">
                                      <span className="text-xs text-slate-400 font-medium">Employee's Answer:</span>
                                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                                        isCorrect 
                                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                                          : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                      }`}>
                                        {q.answer}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default Tests;
