import React, { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Search,
  RefreshCw,
  X,
  AlertCircle,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Building,
  Users,
  Compass,
  Clock,
  ChevronRight,
  Download,
  Filter,
  Eye,
  MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAppSelector } from "../../store/hooks";
import { selectToken } from "../../store/selectors/appSelectors";
import {
  fetchFranchises,
  fetchFeedbacks,
  fetchCaterings,
  fetchCorporates,
  type FranchiseRecord,
  type FeedbackRecord,
  type CateringRecord,
  type CorporateRecord
} from "../../services/enquiryApi";

type SubTab = "franchise" | "feedback" | "catering" | "corporate";

export const Enquiries: React.FC = () => {
  const token = useAppSelector(selectToken);
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("franchise");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [franchises, setFranchises] = useState<FranchiseRecord[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackRecord[]>([]);
  const [caterings, setCatering] = useState<CateringRecord[]>([]);
  const [corporates, setCorporates] = useState<CorporateRecord[]>([]);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState("");
  
  // Date Range (For Feedback - defaults to last 7 days)
  const getPastDateString = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split("T")[0];
  };
  const getTodayString = () => {
    return new Date().toISOString().split("T")[0];
  };

  const [startDate, setStartDate] = useState(getPastDateString(7));
  const [endDate, setEndDate] = useState(getTodayString());

  // Detailed Modal View State
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  const loadData = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      if (activeSubTab === "franchise") {
        const data = await fetchFranchises(token, startDate, endDate);
        setFranchises(data);
      } else if (activeSubTab === "feedback") {
        const data = await fetchFeedbacks(token, startDate, endDate);
        setFeedbacks(data);
      } else if (activeSubTab === "catering") {
        const data = await fetchCaterings(token, startDate, endDate);
        setCatering(data);
      } else if (activeSubTab === "corporate") {
        const data = await fetchCorporates(token, startDate, endDate);
        setCorporates(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load enquiries.");
    } finally {
      setIsLoading(false);
    }
  }, [token, activeSubTab, startDate, endDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
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

  const formatDateOnly = (dateStr?: string) => {
    if (!dateStr) return "—";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      });
    } catch {
      return dateStr;
    }
  };

  // CSV Exporter
  const exportToCSV = () => {
    let headers: string[] = [];
    let rows: any[] = [];
    let filename = "";

    if (activeSubTab === "franchise") {
      filename = "franchise_requests.csv";
      headers = [
        "ID", "Name", "Contact", "Email", "Occupation", "City", 
        "Own Other Franchises", "OwnProperty", "Hear About", "Liquid Assets", 
        "Regions", "Created Date"
      ];
      rows = franchises.map(f => [
        f.ID, f.firstName, f.contact, f.Email, f.occupation, f.city,
        f.own_other_franchises, f.own_property, f.hearAbout, f.totalLiquidAssets,
        f.regions, f.CreatedDate || f.Created
      ]);
    } else if (activeSubTab === "feedback") {
      filename = "feedbacks.csv";
      headers = [
        "ID", "Name", "Phone", "Email", "Outlet", "Type", "OrderID", 
        "Food Rating", "Service Rating", "Ambience Rating", "Time Rating", 
        "Overall Experience", "Remarks", "Created"
      ];
      rows = feedbacks.map(f => [
        f.id, f.Name, f.Phone, f.Email, f.Outlet, f.Type, f.OrderID,
        f.Food, f.Service, f.Ambience, f.Time, f.Experience, f.Remarks, f.Created
      ]);
    } else if (activeSubTab === "catering") {
      filename = "catering_requests.csv";
      headers = [
        "ID", "Name", "Email", "Phone", "No of Persons", "Date", "Time", 
        "Location", "Instructions", "Created"
      ];
      rows = caterings.map(c => [
        c.ID, c.Name, c.Email, c.Phone, c.NoofPerson, c.Date, c.Time,
        c.Location, c.Instructions, c.Created
      ]);
    } else if (activeSubTab === "corporate") {
      filename = "corporate_requests.csv";
      headers = [
        "ID", "Name", "Organization", "Email", "Phone", "Instructions", "Created"
      ];
      rows = corporates.map(c => [
        c.ID, c.Name, c.Organization, c.Email, c.Phone, c.Instructions, c.Created
      ]);
    }

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map(e => e.map((val: any) => `"${String(val ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtering Logic
  const getFilteredData = () => {
    const q = searchTerm.toLowerCase();
    if (activeSubTab === "franchise") {
      return franchises.filter(f => 
        (f.firstName ?? "").toLowerCase().includes(q) ||
        (f.Email ?? "").toLowerCase().includes(q) ||
        (f.contact ?? "").toLowerCase().includes(q) ||
        (f.city ?? "").toLowerCase().includes(q)
      );
    } else if (activeSubTab === "feedback") {
      return feedbacks.filter(f => 
        (f.Name ?? "").toLowerCase().includes(q) ||
        (f.Email ?? "").toLowerCase().includes(q) ||
        (f.Phone ?? "").toLowerCase().includes(q) ||
        (f.Outlet ?? "").toLowerCase().includes(q)
      );
    } else if (activeSubTab === "catering") {
      return caterings.filter(c => 
        (c.Name ?? "").toLowerCase().includes(q) ||
        (c.Email ?? "").toLowerCase().includes(q) ||
        (c.Phone ?? "").toLowerCase().includes(q) ||
        (c.Location ?? "").toLowerCase().includes(q)
      );
    } else {
      return corporates.filter(c => 
        (c.Name ?? "").toLowerCase().includes(q) ||
        (c.Organization ?? "").toLowerCase().includes(q) ||
        (c.Email ?? "").toLowerCase().includes(q) ||
        (c.Phone ?? "").toLowerCase().includes(q)
      );
    }
  };

  const filteredItems = getFilteredData();

  return (
    <div className="p-6 space-y-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <MessageSquare className="text-teal-500" size={36} />
            Customer Enquiries
          </h1>
          <p className="text-sm text-slate-400 font-medium mt-1">
            Manage franchise requests, customer feedback, catering requests, and corporate listings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/50 disabled:opacity-50 transition-all"
            title="Refresh List"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            Refresh
          </button>
          
          <button
            onClick={exportToCSV}
            disabled={isLoading || filteredItems.length === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-2xl bg-teal-500 hover:bg-teal-600 text-white disabled:opacity-50 shadow-sm shadow-teal-500/10 transition-all"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side Tab bar */}
        <div className="lg:col-span-3 space-y-3">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 mb-3">Enquiry Modules</p>
            
            <button
              onClick={() => { setActiveSubTab("franchise"); setSearchTerm(""); }}
              className={`w-full text-left px-4 py-3.5 rounded-2xl font-bold flex items-center justify-between transition-all ${
                activeSubTab === "franchise"
                  ? "bg-teal-500/10 text-teal-600 dark:text-teal-400"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850/50"
              }`}
            >
              <span className="flex items-center gap-3">
                <Building size={18} />
                Franchise Requests
              </span>
              <ChevronRight size={16} className="opacity-60" />
            </button>

            <button
              onClick={() => { setActiveSubTab("feedback"); setSearchTerm(""); }}
              className={`w-full text-left px-4 py-3.5 rounded-2xl font-bold flex items-center justify-between transition-all ${
                activeSubTab === "feedback"
                  ? "bg-teal-500/10 text-teal-600 dark:text-teal-400"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850/50"
              }`}
            >
              <span className="flex items-center gap-3">
                <FileText size={18} />
                Feedback Listing
              </span>
              <ChevronRight size={16} className="opacity-60" />
            </button>

            <button
              onClick={() => { setActiveSubTab("catering"); setSearchTerm(""); }}
              className={`w-full text-left px-4 py-3.5 rounded-2xl font-bold flex items-center justify-between transition-all ${
                activeSubTab === "catering"
                  ? "bg-teal-500/10 text-teal-600 dark:text-teal-400"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850/50"
              }`}
            >
              <span className="flex items-center gap-3">
                <Compass size={18} />
                Catering Requests
              </span>
              <ChevronRight size={16} className="opacity-60" />
            </button>

            <button
              onClick={() => { setActiveSubTab("corporate"); setSearchTerm(""); }}
              className={`w-full text-left px-4 py-3.5 rounded-2xl font-bold flex items-center justify-between transition-all ${
                activeSubTab === "corporate"
                  ? "bg-teal-500/10 text-teal-600 dark:text-teal-400"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850/50"
              }`}
            >
              <span className="flex items-center gap-3">
                <Users size={18} />
                Corporate Listing
              </span>
              <ChevronRight size={16} className="opacity-60" />
            </button>
          </div>
        </div>

        {/* Right side List display */}
        <div className="lg:col-span-9 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            {/* Top Toolbar */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-450 dark:text-slate-500" size={18} />
                <input
                  type="text"
                  placeholder="Search by name, email, contact..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Date Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-2xl">
                  <span className="text-xs text-slate-400 font-bold uppercase">From:</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="text-xs font-semibold bg-transparent border-none text-slate-700 dark:text-slate-350 focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-2xl">
                  <span className="text-xs text-slate-400 font-bold uppercase">To:</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="text-xs font-semibold bg-transparent border-none text-slate-700 dark:text-slate-350 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Error panel */}
            {error && (
              <div className="m-6 p-4 bg-rose-500/10 border border-rose-500/25 text-rose-500 rounded-2xl flex items-start gap-3">
                <AlertCircle className="shrink-0 mt-0.5" size={18} />
                <div>
                  <h4 className="font-bold text-sm">Failed to retrieve records</h4>
                  <p className="text-xs mt-1 opacity-90">{error}</p>
                </div>
              </div>
            )}

            {/* Table Area */}
            <div className="overflow-x-auto min-h-[300px]">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <div className="w-10 h-10 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
                  <span className="text-sm font-semibold text-slate-400">Loading listings...</span>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 rounded-3xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4 border border-slate-100 dark:border-slate-800/80">
                    <Filter size={24} />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">No Records Found</h3>
                  <p className="text-sm text-slate-400 max-w-sm mt-1 mx-auto px-4">
                    There are no customer enquiries matching your criteria or filters.
                  </p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-50/20 dark:bg-slate-950/5">
                      <th className="px-6 py-4 font-bold">ID</th>
                      <th className="px-6 py-4 font-bold">Name</th>
                      
                      {activeSubTab === "franchise" && (
                        <>
                          <th className="px-6 py-4 font-bold">Contact info</th>
                          <th className="px-6 py-4 font-bold">Occupation & City</th>
                          <th className="px-6 py-4 font-bold">Total Liquid Assets</th>
                        </>
                      )}

                      {activeSubTab === "feedback" && (
                        <>
                          <th className="px-6 py-4 font-bold">Contact</th>
                          <th className="px-6 py-4 font-bold">Outlet</th>
                          <th className="px-6 py-4 font-bold">Type</th>
                          <th className="px-6 py-4 font-bold">OrderID</th>
                          <th className="px-6 py-4 font-bold">Food</th>
                          <th className="px-6 py-4 font-bold">Overall</th>
                        </>
                      )}

                      {activeSubTab === "catering" && (
                        <>
                          <th className="px-6 py-4 font-bold">Contact Info</th>
                          <th className="px-6 py-4 font-bold">No. of Persons</th>
                          <th className="px-6 py-4 font-bold">Preferred Time</th>
                        </>
                      )}

                      {activeSubTab === "corporate" && (
                        <>
                          <th className="px-6 py-4 font-bold">Organization</th>
                          <th className="px-6 py-4 font-bold">Contact Info</th>
                        </>
                      )}

                      <th className="px-6 py-4 font-bold">Date Created</th>
                      <th className="px-6 py-4 font-bold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                    {(filteredItems as any[]).map((item, idx) => {
                      const idVal = activeSubTab === "feedback" ? item.id : item.ID;
                      const nameVal = item.firstName || item.Name || "—";
                      
                      return (
                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-all group">
                          <td className="px-6 py-4.5 text-sm font-bold text-slate-900 dark:text-white">
                            #{idVal}
                          </td>
                          <td className="px-6 py-4.5 text-sm font-bold text-slate-850 dark:text-slate-100">
                            {nameVal}
                          </td>

                          {/* Franchise */}
                          {activeSubTab === "franchise" && (
                            <>
                              <td className="px-6 py-4.5 text-sm font-medium space-y-1">
                                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-350">
                                  <Phone size={13} className="text-slate-400" />
                                  <span>{item.contact || "—"}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-slate-450 dark:text-slate-500">
                                  <Mail size={13} className="text-slate-400" />
                                  <span>{item.Email || "—"}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4.5 text-sm font-medium space-y-1">
                                <div className="text-slate-700 dark:text-slate-350">{item.occupation || "—"}</div>
                                <div className="text-xs text-slate-450 dark:text-slate-500 flex items-center gap-1">
                                  <MapPin size={12} /> {item.city || "—"}
                                </div>
                              </td>
                              <td className="px-6 py-4.5 text-sm font-bold text-emerald-600 dark:text-emerald-450">
                                {item.totalLiquidAssets || "—"}
                              </td>
                            </>
                          )}

                          {/* Feedback */}
                          {activeSubTab === "feedback" && (
                            <>
                              <td className="px-6 py-4.5 text-sm space-y-1 font-medium">
                                <div className="text-slate-700 dark:text-slate-350">{item.Phone || "—"}</div>
                                <div className="text-xs text-slate-450 dark:text-slate-500">{item.Email || "—"}</div>
                              </td>
                              <td className="px-6 py-4.5 text-sm font-semibold text-slate-700 dark:text-slate-330">
                                {item.Outlet || "—"}
                              </td>
                              <td className="px-6 py-4.5">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                  item.Type === "Delivery"
                                    ? "bg-blue-500/10 text-blue-500 border border-blue-500/15"
                                    : "bg-teal-500/10 text-teal-500 border border-teal-500/15"
                                }`}>
                                  {item.Type || "—"}
                                </span>
                              </td>
                              <td className="px-6 py-4.5 text-sm font-medium text-slate-500">
                                {item.OrderID || "—"}
                              </td>
                              <td className="px-6 py-4.5 text-sm font-bold text-amber-500">
                                {item.Food || "—"}⭐
                              </td>
                              <td className="px-6 py-4.5 text-sm font-bold text-indigo-500">
                                {item.Experience || "—"}
                              </td>
                            </>
                          )}

                          {/* Catering */}
                          {activeSubTab === "catering" && (
                            <>
                              <td className="px-6 py-4.5 text-sm font-medium space-y-1">
                                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-350">
                                  <Phone size={13} className="text-slate-400" />
                                  <span>{item.Phone || "—"}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-slate-450 dark:text-slate-500">
                                  <Mail size={13} className="text-slate-400" />
                                  <span>{item.Email || "—"}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4.5 text-sm font-bold text-slate-700 dark:text-slate-300">
                                {item.NoofPerson || "—"}
                              </td>
                              <td className="px-6 py-4.5 text-sm font-medium space-y-1">
                                <div className="text-slate-700 dark:text-slate-350 flex items-center gap-1.5">
                                  <Calendar size={13} className="text-slate-450" />
                                  <span>{formatDateOnly(item.Date)}</span>
                                </div>
                                <div className="text-xs text-slate-450 dark:text-slate-500 flex items-center gap-1.5">
                                  <Clock size={13} className="text-slate-450" />
                                  <span>{item.Time || "—"}</span>
                                </div>
                              </td>
                            </>
                          )}

                          {/* Corporate */}
                          {activeSubTab === "corporate" && (
                            <>
                              <td className="px-6 py-4.5 text-sm font-semibold text-slate-700 dark:text-slate-330">
                                {item.Organization || "—"}
                              </td>
                              <td className="px-6 py-4.5 text-sm font-medium space-y-1">
                                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-350">
                                  <Phone size={13} className="text-slate-400" />
                                  <span>{item.Phone || "—"}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-slate-450 dark:text-slate-500">
                                  <Mail size={13} className="text-slate-400" />
                                  <span>{item.Email || "—"}</span>
                                </div>
                              </td>
                            </>
                          )}

                          <td className="px-6 py-4.5 text-xs font-semibold text-slate-400">
                            {formatDate(item.CreatedDate || item.Created)}
                          </td>
                          <td className="px-6 py-4.5 text-right">
                            <button
                              onClick={() => setSelectedRecord(item)}
                              className="inline-flex items-center justify-center p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-teal-500 hover:border-teal-500/30 dark:text-slate-400 hover:bg-teal-500/5 transition-all"
                              title="View Full Details"
                            >
                              <Eye size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Details Side Drawer/Modal */}
      <AnimatePresence>
        {selectedRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-end overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRecord(null)}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-full max-w-lg h-full bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-100 dark:border-slate-800 flex flex-col"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-teal-500">
                    {activeSubTab} details
                  </span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                    Enquiry Details #{selectedRecord.id || selectedRecord.ID}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="p-2 rounded-xl text-slate-450 hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-slate-800 dark:hover:text-white transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* General Info Card */}
                <div className="bg-slate-50 dark:bg-slate-950/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-850/80 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-500 flex items-center justify-center font-bold text-lg">
                      {(selectedRecord.firstName || selectedRecord.Name || "?").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-850 dark:text-slate-100 text-sm">
                        {selectedRecord.firstName || selectedRecord.Name || "—"}
                      </h4>
                      <p className="text-xs text-slate-400">
                        Submitted: {formatDate(selectedRecord.CreatedDate || selectedRecord.Created)}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-slate-200/50 dark:border-slate-800/80 my-3" />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Phone</span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {selectedRecord.Phone || selectedRecord.contact || "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Email Address</span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 break-all">
                        {selectedRecord.Email || "—"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tab Specific Information */}

                {/* Franchise Data */}
                {activeSubTab === "franchise" && (
                  <div className="space-y-4">
                    <h5 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider">Franchise Profile</h5>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50/50 dark:bg-slate-950/20 p-3.5 rounded-xl border border-slate-100 dark:border-slate-850">
                        <span className="text-[10px] font-bold text-slate-450 uppercase block">Occupation</span>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-350">{selectedRecord.occupation || "—"}</span>
                      </div>
                      <div className="bg-slate-50/50 dark:bg-slate-950/20 p-3.5 rounded-xl border border-slate-100 dark:border-slate-850">
                        <span className="text-[10px] font-bold text-slate-450 uppercase block">Preferred City</span>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-350">{selectedRecord.city || "—"}</span>
                      </div>
                      <div className="bg-slate-50/50 dark:bg-slate-950/20 p-3.5 rounded-xl border border-slate-100 dark:border-slate-850">
                        <span className="text-[10px] font-bold text-slate-450 uppercase block">Owns Property?</span>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-350">{selectedRecord.own_property || "—"}</span>
                      </div>
                      <div className="bg-slate-50/50 dark:bg-slate-950/20 p-3.5 rounded-xl border border-slate-100 dark:border-slate-850">
                        <span className="text-[10px] font-bold text-slate-450 uppercase block">Liquid Assets</span>
                        <span className="text-xs font-extrabold text-emerald-500">{selectedRecord.totalLiquidAssets || "—"}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="bg-slate-50/50 dark:bg-slate-950/20 p-4 rounded-xl border border-slate-100 dark:border-slate-850">
                        <span className="text-[10px] font-bold text-slate-455 uppercase block">Owns other franchises?</span>
                        <p className="text-xs text-slate-600 dark:text-slate-350 font-medium mt-1">
                          {selectedRecord.own_other_franchises || "—"}
                        </p>
                      </div>

                      <div className="bg-slate-50/50 dark:bg-slate-950/20 p-4 rounded-xl border border-slate-100 dark:border-slate-850">
                        <span className="text-[10px] font-bold text-slate-455 uppercase block">Regions of interest</span>
                        <p className="text-xs text-slate-600 dark:text-slate-350 font-medium mt-1">
                          {selectedRecord.regions || "—"}
                        </p>
                      </div>

                      <div className="bg-slate-50/50 dark:bg-slate-950/20 p-4 rounded-xl border border-slate-100 dark:border-slate-850">
                        <span className="text-[10px] font-bold text-slate-455 uppercase block">How did they hear about us?</span>
                        <p className="text-xs text-slate-600 dark:text-slate-350 font-medium mt-1">
                          {selectedRecord.hearAbout || "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Feedback Data */}
                {activeSubTab === "feedback" && (
                  <div className="space-y-4">
                    <h5 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider">Ratings & Experience</h5>
                    
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-slate-50/50 dark:bg-slate-950/20 p-3 rounded-xl border border-slate-100 dark:border-slate-850 text-center">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Food</span>
                        <span className="text-sm font-black text-amber-500 mt-1 block">{selectedRecord.Food}⭐</span>
                      </div>
                      <div className="bg-slate-50/50 dark:bg-slate-950/20 p-3 rounded-xl border border-slate-100 dark:border-slate-850 text-center">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Service</span>
                        <span className="text-sm font-black text-indigo-500 mt-1 block">{selectedRecord.Service}⭐</span>
                      </div>
                      <div className="bg-slate-50/50 dark:bg-slate-950/20 p-3 rounded-xl border border-slate-100 dark:border-slate-850 text-center">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Ambience</span>
                        <span className="text-sm font-black text-teal-500 mt-1 block">{selectedRecord.Ambience}⭐</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50/50 dark:bg-slate-950/20 p-3.5 rounded-xl border border-slate-100 dark:border-slate-850">
                        <span className="text-[10px] font-bold text-slate-450 uppercase block">Outlet</span>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-350">{selectedRecord.Outlet || "—"}</span>
                      </div>
                      <div className="bg-slate-50/50 dark:bg-slate-950/20 p-3.5 rounded-xl border border-slate-100 dark:border-slate-850">
                        <span className="text-[10px] font-bold text-slate-450 uppercase block">Order Type</span>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-350">{selectedRecord.Type || "—"}</span>
                      </div>
                      <div className="bg-slate-50/50 dark:bg-slate-950/20 p-3.5 rounded-xl border border-slate-100 dark:border-slate-850">
                        <span className="text-[10px] font-bold text-slate-450 uppercase block">OrderID</span>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-350">{selectedRecord.OrderID || "—"}</span>
                      </div>
                      <div className="bg-slate-50/50 dark:bg-slate-950/20 p-3.5 rounded-xl border border-slate-100 dark:border-slate-850">
                        <span className="text-[10px] font-bold text-slate-450 uppercase block">Overall Experience</span>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-350">{selectedRecord.Experience || "—"}</span>
                      </div>
                    </div>

                    <div className="bg-slate-50/50 dark:bg-slate-950/20 p-4 rounded-xl border border-slate-100 dark:border-slate-850">
                      <span className="text-[10px] font-bold text-slate-450 uppercase block">Remarks / Comments</span>
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed mt-2 whitespace-pre-wrap">
                        {selectedRecord.Remarks || "No remarks provided."}
                      </p>
                    </div>
                  </div>
                )}

                {/* Catering Data */}
                {activeSubTab === "catering" && (
                  <div className="space-y-4">
                    <h5 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider">Catering Details</h5>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50/50 dark:bg-slate-950/20 p-3.5 rounded-xl border border-slate-100 dark:border-slate-850">
                        <span className="text-[10px] font-bold text-slate-450 uppercase block">Number of Guests</span>
                        <span className="text-xs font-extrabold text-slate-700 dark:text-slate-350">{selectedRecord.NoofPerson || "—"}</span>
                      </div>
                      <div className="bg-slate-50/50 dark:bg-slate-950/20 p-3.5 rounded-xl border border-slate-100 dark:border-slate-850">
                        <span className="text-[10px] font-bold text-slate-450 uppercase block">Preferred Time</span>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-350">{selectedRecord.Time || "—"}</span>
                      </div>
                      <div className="bg-slate-50/50 dark:bg-slate-950/20 p-3.5 rounded-xl border border-slate-100 dark:border-slate-850 col-span-2">
                        <span className="text-[10px] font-bold text-slate-450 uppercase block">Date</span>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-350">{formatDateOnly(selectedRecord.Date)}</span>
                      </div>
                      <div className="bg-slate-50/50 dark:bg-slate-950/20 p-3.5 rounded-xl border border-slate-100 dark:border-slate-850 col-span-2">
                        <span className="text-[10px] font-bold text-slate-450 uppercase block">Location / Venue</span>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">{selectedRecord.Location || "—"}</span>
                      </div>
                    </div>

                    <div className="bg-slate-50/50 dark:bg-slate-950/20 p-4 rounded-xl border border-slate-100 dark:border-slate-850">
                      <span className="text-[10px] font-bold text-slate-450 uppercase block">Special Instructions</span>
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed mt-2 whitespace-pre-wrap">
                        {selectedRecord.Instructions || "No instructions provided."}
                      </p>
                    </div>
                  </div>
                )}

                {/* Corporate Data */}
                {activeSubTab === "corporate" && (
                  <div className="space-y-4">
                    <h5 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider">Corporate Request details</h5>
                    
                    <div className="bg-slate-50/50 dark:bg-slate-950/20 p-4 rounded-xl border border-slate-100 dark:border-slate-850">
                      <span className="text-[10px] font-bold text-slate-450 uppercase block">Organization / Company</span>
                      <span className="text-xs font-extrabold text-slate-700 dark:text-slate-350 mt-1 block">
                        {selectedRecord.Organization || "—"}
                      </span>
                    </div>

                    <div className="bg-slate-50/50 dark:bg-slate-950/20 p-4 rounded-xl border border-slate-100 dark:border-slate-850">
                      <span className="text-[10px] font-bold text-slate-450 uppercase block">Instructions / Details</span>
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed mt-2 whitespace-pre-wrap">
                        {selectedRecord.Instructions || "No instructions provided."}
                      </p>
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
