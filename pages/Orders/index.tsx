import React, { useState } from "react";
import {
  ShoppingBag,
  Search,
  UserX,
  Award,
  ChevronRight,
  Filter,
  RefreshCw,
  Calendar,
  Phone,
  User,
  ShieldAlert,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAppSelector } from "../../store/hooks";
import { selectToken } from "../../store/selectors/appSelectors";
import { searchOrders, type OrderRecord, fetchBlockedCustomers, blockCustomer, type BlockedCustomer, checkCustomerLoyalty, type LoyaltyCheckData } from "../../services/ordersApi";

type SubTab = "order-search" | "block-customer" | "loyalty-check";

export const Orders: React.FC = () => {
  const token = useAppSelector(selectToken);
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("order-search");
  
  // Search state for Order By ID or Mobile
  const [orderQuery, setOrderQuery] = useState("");
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [isSearchingOrders, setIsSearchingOrders] = useState(false);
  const [orderSearchError, setOrderSearchError] = useState<string | null>(null);

  // Date formatter helper
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

  // Block customer state
  const [blockedCustomers, setBlockedCustomers] = useState<BlockedCustomer[]>([]);
  const [isBlockedCustomersLoading, setIsBlockedCustomersLoading] = useState(false);
  const [newBlockPhone, setNewBlockPhone] = useState("");
  const [isBlocking, setIsBlocking] = useState(false);
  const [blockMessage, setBlockMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [blockedSearchQuery, setBlockedSearchQuery] = useState("");

  // Loyalty check state
  const [loyaltyQuery, setLoyaltyQuery] = useState("");
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyCheckData | null>(null);
  const [loyaltyError, setLoyaltyError] = useState<string | null>(null);
  const [hasSearchedLoyalty, setHasSearchedLoyalty] = useState(false);
  const [isSearchingLoyalty, setIsSearchingLoyalty] = useState(false);
  const [loyaltySearch, setLoyaltySearch] = useState("");
  const [loyaltyPage, setLoyaltyPage] = useState(1);
  const [loyaltyPageSize, setLoyaltyPageSize] = useState(10);

  // Order search trigger
  const handleOrderSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderQuery.trim()) return;
    setIsSearchingOrders(true);
    setOrderSearchError(null);
    try {
      const data = await searchOrders(token ?? "", orderQuery.trim());
      setOrders(data);
    } catch (err) {
      setOrderSearchError(err instanceof Error ? err.message : "Failed to search orders.");
    } finally {
      setIsSearchingOrders(false);
    }
  };

  // Fetch Blocked Customers
  const loadBlockedCustomers = async () => {
    if (!token) return;
    setIsBlockedCustomersLoading(true);
    try {
      const data = await fetchBlockedCustomers(token);
      setBlockedCustomers(data);
    } catch (err) {
      console.error("Failed to load blocked customers", err);
    } finally {
      setIsBlockedCustomersLoading(false);
    }
  };

  // Load blocked customers when active tab changes
  React.useEffect(() => {
    if (activeSubTab === "block-customer" && token) {
      loadBlockedCustomers();
    }
  }, [activeSubTab, token]);

  // Block customer trigger
  const handleBlockCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockPhone.trim() || !token) return;
    setIsBlocking(true);
    setBlockMessage(null);
    try {
      await blockCustomer(token, newBlockPhone.trim());
      setBlockMessage({ type: "success", text: "Customer blocked successfully" });
      setNewBlockPhone("");
      await loadBlockedCustomers();
    } catch (err) {
      setBlockMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to block customer."
      });
    } finally {
      setIsBlocking(false);
    }
  };



  // Loyalty check state resets and trigger
  const handleLoyaltyCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loyaltyQuery.trim() || !token) return;
    setIsSearchingLoyalty(true);
    setHasSearchedLoyalty(true);
    setLoyaltyError(null);
    setLoyaltyData(null);
    setLoyaltySearch("");
    setLoyaltyPage(1);
    try {
      const data = await checkCustomerLoyalty(token, loyaltyQuery.trim());
      setLoyaltyData(data);
    } catch (err) {
      setLoyaltyError(err instanceof Error ? err.message : "Failed to query loyalty status.");
    } finally {
      setIsSearchingLoyalty(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 animate-fade-in pb-20 max-w-[1600px] mx-auto min-h-screen">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <ShoppingBag className="text-teal-500" size={36} />
            Orders & Customer Care
          </h1>
          <p className="text-sm text-slate-400 font-medium mt-1">
            Search orders by ID/Mobile, block customers, and check customer loyalty history.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Sidebar Subtabs */}
        <div className="lg:col-span-3 space-y-3">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 mb-3">Sub Modules</p>
            
            <button
              onClick={() => setActiveSubTab("order-search")}
              className={`w-full text-left px-4 py-3.5 rounded-2xl font-bold flex items-center justify-between transition-all ${
                activeSubTab === "order-search"
                  ? "bg-teal-500/10 text-teal-600 dark:text-teal-400"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850/50"
              }`}
            >
              <span className="flex items-center gap-3">
                <Search size={18} />
                Order By ID or Mobile
              </span>
              <ChevronRight size={16} className="opacity-60" />
            </button>

            <button
              onClick={() => setActiveSubTab("block-customer")}
              className={`w-full text-left px-4 py-3.5 rounded-2xl font-bold flex items-center justify-between transition-all ${
                activeSubTab === "block-customer"
                  ? "bg-teal-500/10 text-teal-600 dark:text-teal-400"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850/50"
              }`}
            >
              <span className="flex items-center gap-3">
                <UserX size={18} />
                Add Block Customer
              </span>
              <ChevronRight size={16} className="opacity-60" />
            </button>

            <button
              onClick={() => setActiveSubTab("loyalty-check")}
              className={`w-full text-left px-4 py-3.5 rounded-2xl font-bold flex items-center justify-between transition-all ${
                activeSubTab === "loyalty-check"
                  ? "bg-teal-500/10 text-teal-600 dark:text-teal-400"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850/50"
              }`}
            >
              <span className="flex items-center gap-3">
                <Award size={18} />
                Check Customer Loyalty
              </span>
              <ChevronRight size={16} className="opacity-60" />
            </button>
          </div>
        </div>

        {/* Right Side Content display */}
        <div className="lg:col-span-9 space-y-6">
          <AnimatePresence mode="wait">
            
            {/* Tab 1: Order By ID or Mobile */}
            {activeSubTab === "order-search" && (
              <motion.div
                key="order-search"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="bg-white dark:bg-slate-900 p-6 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
                  <h3 className="text-lg font-black text-slate-850 dark:text-white flex items-center gap-2">
                    <Search className="text-teal-500" size={20} />
                    Search Order By ID or Mobile
                  </h3>

                  <form onSubmit={handleOrderSearch} className="flex gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-450 dark:text-slate-500" size={18} />
                      <input
                        type="text"
                        placeholder="Enter Order ID (e.g. 102948) or Customer Mobile (e.g. 03001234567)"
                        value={orderQuery}
                        onChange={(e) => setOrderQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-slate-450"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSearchingOrders}
                      className="px-6 py-2.5 rounded-2xl bg-teal-500 hover:bg-teal-600 text-white font-bold text-sm shadow-sm transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSearchingOrders ? (
                        <>
                          <RefreshCw size={16} className="animate-spin" />
                          Searching...
                        </>
                      ) : (
                        "Search"
                      )}
                    </button>
                  </form>

                  {orderSearchError && (
                    <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500 text-sm font-semibold">
                      <AlertCircle size={18} />
                      {orderSearchError}
                    </div>
                  )}
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Matching Orders</h4>
                    <span className="text-xs font-semibold px-2.5 py-1 bg-slate-50 dark:bg-slate-850 text-slate-450 dark:text-slate-400 rounded-lg">
                      {orders.length} Records Found
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    {orders.length === 0 ? (
                      <div className="py-20 text-center text-slate-400">
                        <Filter size={36} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm font-semibold">No matching orders found.</p>
                      </div>
                    ) : (
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-extrabold uppercase tracking-wider text-slate-450 bg-slate-50/20 dark:bg-slate-950/5">
                            <th className="px-6 py-4 font-bold">Order ID</th>
                            <th className="px-6 py-4 font-bold">Customer</th>
                            <th className="px-6 py-4 font-bold">Outlet / Area</th>
                            <th className="px-6 py-4 font-bold">Channel & Type</th>
                            <th className="px-6 py-4 font-bold">Date & Time</th>
                            <th className="px-6 py-4 font-bold">Total Amount</th>
                            <th className="px-6 py-4 font-bold">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                          {orders.map((o) => (
                            <tr key={o.ID} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-all">
                              <td className="px-6 py-4.5 text-sm font-bold text-slate-900 dark:text-white">
                                #{o.ID}
                              </td>
                              <td className="px-6 py-4.5 text-sm font-semibold space-y-1 text-slate-700 dark:text-slate-300">
                                <div>{o.Customer}</div>
                                <div className="text-xs text-slate-400 font-medium flex items-center gap-1">
                                  <Phone size={12} /> {o.Mobile}
                                </div>
                              </td>
                              <td className="px-6 py-4.5 text-sm space-y-1 font-semibold text-slate-700 dark:text-slate-330">
                                <div>{o.Outlet}</div>
                                <div className="text-xs text-slate-400 font-medium">
                                  {o.Area || "N/A"}, {o.City || ""}
                                </div>
                              </td>
                              <td className="px-6 py-4.5 text-sm space-y-1 font-semibold text-slate-700 dark:text-slate-300">
                                <div className="capitalize">{o.channel || "web"}</div>
                                <div className="text-xs text-teal-500 font-medium">{o.PaymentType}</div>
                              </td>
                              <td className="px-6 py-4.5 text-xs text-slate-450 dark:text-slate-400 font-semibold">
                                {formatDate(o.Created)}
                              </td>
                              <td className="px-6 py-4.5 text-sm font-bold text-slate-900 dark:text-white">
                                Rs. {o.Amount}
                              </td>
                              <td className="px-6 py-4.5">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                  o.Status === "Delivered" || o.Status === "Confirmed"
                                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/15"
                                    : o.Status === "Rejected" || o.Status === "Undefined-Decline"
                                    ? "bg-rose-500/10 text-rose-500 border border-rose-500/15"
                                    : "bg-amber-500/10 text-amber-500 border border-amber-500/15"
                                }`}>
                                  {o.Status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </motion.div>
            )}            {/* Tab 2: Add Block Customer */}
            {activeSubTab === "block-customer" && (
              <motion.div
                key="block-customer"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="grid grid-cols-1 xl:grid-cols-12 gap-8"
              >
                {/* Block Form */}
                <div className="xl:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-sm h-fit space-y-6">
                  <h3 className="text-lg font-black text-slate-850 dark:text-white flex items-center gap-2">
                    <UserX className="text-rose-500" size={20} />
                    Add Blocked Customer
                  </h3>

                  <form onSubmit={handleBlockCustomer} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Mobile Number *</label>
                      <input
                        type="text"
                        required
                        value={newBlockPhone}
                        onChange={(e) => setNewBlockPhone(e.target.value)}
                        placeholder="e.g. 03338901234"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                      />
                    </div>

                    {blockMessage && (
                      <div className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-semibold border ${
                        blockMessage.type === "success" 
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                          : "bg-rose-500/10 border-rose-500/20 text-rose-500"
                      }`}>
                        {blockMessage.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                        {blockMessage.text}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isBlocking}
                      className="w-full py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isBlocking ? (
                        <>
                          <RefreshCw size={16} className="animate-spin" />
                          Blocking...
                        </>
                      ) : (
                        <>
                          <ShieldAlert size={16} />
                          Block Customer
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Blocked customers list */}
                {(() => {
                  const filteredBlockedCustomers = blockedCustomers
                    .filter((c) => c.phone.toLowerCase().includes(blockedSearchQuery.toLowerCase().trim()))
                    .sort((a, b) => {
                      const idA = typeof a.id === "number" ? a.id : parseInt(a.id as string) || 0;
                      const idB = typeof b.id === "number" ? b.id : parseInt(b.id as string) || 0;
                      return idB - idA;
                    });
                  return (
                    <div className="xl:col-span-7 bg-white dark:bg-slate-900 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden h-fit">
                      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-950/20">
                        <h4 className="font-bold text-slate-850 dark:text-slate-200 text-sm">Currently Blocked List</h4>
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-450 dark:text-slate-500" size={14} />
                            <input
                              type="text"
                              placeholder="Search number..."
                              value={blockedSearchQuery}
                              onChange={(e) => setBlockedSearchQuery(e.target.value)}
                              className="pl-9 pr-4 py-1.5 w-40 sm:w-48 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all placeholder:text-slate-450"
                            />
                          </div>
                          <span className="text-xs font-semibold px-2.5 py-1.5 bg-slate-100 dark:bg-slate-850 text-slate-450 dark:text-slate-400 rounded-lg whitespace-nowrap">
                            {filteredBlockedCustomers.length} Blocked
                          </span>
                        </div>
                      </div>

                      <div className="divide-y divide-slate-100 dark:divide-slate-850">
                        {isBlockedCustomersLoading ? (
                          <div className="p-12 text-center text-slate-400">
                            <RefreshCw size={36} className="mx-auto mb-2 text-rose-500 animate-spin" />
                            <p className="text-sm font-semibold">Loading blocked list...</p>
                          </div>
                        ) : filteredBlockedCustomers.length === 0 ? (
                          <div className="p-12 text-center text-slate-400">
                            <CheckCircle2 size={36} className="mx-auto mb-2 text-emerald-500 opacity-60" />
                            <p className="text-sm font-semibold">
                              {blockedSearchQuery.trim() ? "No matching blocked numbers found." : "Good job! No customers are currently blocked."}
                            </p>
                          </div>
                        ) : (
                          filteredBlockedCustomers.map((c) => (
                            <div key={c.id} className="p-6 hover:bg-slate-50/50 dark:hover:bg-slate-950/10 transition-all flex justify-between items-start gap-4">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <h5 className="font-bold text-slate-850 dark:text-white text-sm flex items-center gap-1.5">
                                    <Phone size={14} className="text-slate-400" />
                                    {c.phone}
                                  </h5>
                                </div>
                                
                                <div className="text-xs font-semibold text-slate-500 flex items-center gap-4">
                                  <span className="flex items-center gap-1">
                                    <Calendar size={12} /> Blocked: {formatDate(c.blockedDate)}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <User size={12} /> By: <span className="font-bold text-slate-700 dark:text-slate-300">{c.blockedBy}</span>
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })()}
              </motion.div>
            )}

            {/* Tab 3: Check Customer Loyalty */}
            {activeSubTab === "loyalty-check" && (
              <motion.div
                key="loyalty-check"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="bg-white dark:bg-slate-900 p-6 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
                  <h3 className="text-lg font-black text-slate-850 dark:text-white flex items-center gap-2">
                    <Award className="text-teal-500" size={20} />
                    Check Customer Loyalty Balance
                  </h3>

                  <form onSubmit={handleLoyaltyCheck} className="flex gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-450 dark:text-slate-500" size={18} />
                      <input
                        type="text"
                        placeholder="Enter Customer Mobile Number (e.g. 03001234567)"
                        value={loyaltyQuery}
                        onChange={(e) => setLoyaltyQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-slate-450"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSearchingLoyalty}
                      className="px-6 py-2.5 rounded-2xl bg-teal-500 hover:bg-teal-600 text-white font-bold text-sm shadow-sm transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSearchingLoyalty ? (
                        <>
                          <RefreshCw size={16} className="animate-spin" />
                          Checking...
                        </>
                      ) : (
                        "Check Loyalty"
                      )}
                    </button>
                  </form>
                </div>

                {/* Loyalty Details display */}
                <AnimatePresence mode="wait">
                  {loyaltyError && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500 text-sm font-semibold"
                    >
                      <AlertCircle size={18} />
                      {loyaltyError}
                    </motion.div>
                  )}

                  {hasSearchedLoyalty && loyaltyData && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      {/* Eligibility Banner */}
                      <div className={`p-6 rounded-[28px] border shadow-sm flex items-center gap-4 ${
                        loyaltyData.loyaltyInfo.eligible
                          ? "bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300"
                          : "bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20 text-amber-800 dark:text-amber-300"
                      }`}>
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                          loyaltyData.loyaltyInfo.eligible
                            ? "bg-emerald-500/20 text-emerald-500"
                            : "bg-amber-500/20 text-amber-500"
                        }`}>
                          <Award size={24} />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-base">
                            {loyaltyData.loyaltyInfo.eligible
                              ? `🎉 Eligible for: ${loyaltyData.loyaltyInfo.itemName}`
                              : "❌ Not eligible for loyalty items yet"}
                          </h4>
                          <p className="text-sm font-medium mt-0.5 opacity-90">
                            Total Confirmed Orders (Past 30 Days): <span className="font-bold">{loyaltyData.loyaltyInfo.totalOrders}</span>
                          </p>
                        </div>
                      </div>

                      {/* Orders table */}
                      <div className="bg-white dark:bg-slate-900 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-950/20">
                          <div>
                            <h4 className="font-bold text-slate-850 dark:text-slate-200 text-sm">Confirmed Orders List</h4>
                            <p className="text-xs text-slate-400 mt-0.5">Past 30 days orders matching query</p>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-450 dark:text-slate-500" size={14} />
                              <input
                                type="text"
                                placeholder="Search orders..."
                                value={loyaltySearch}
                                onChange={(e) => {
                                  setLoyaltySearch(e.target.value);
                                  setLoyaltyPage(1);
                                }}
                                className="pl-9 pr-4 py-1.5 w-40 sm:w-48 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-slate-450"
                              />
                            </div>
                          </div>
                        </div>

                        {(() => {
                          const filtered = (loyaltyData.orders || []).filter((o) => {
                            const term = loyaltySearch.toLowerCase().trim();
                            if (!term) return true;
                            return (
                              o.ID.toString().includes(term) ||
                              (o.Customer || "").toLowerCase().includes(term) ||
                              (o.Mobile || "").includes(term) ||
                              (o.Outlet || "").toLowerCase().includes(term) ||
                              (o.Area || "").toLowerCase().includes(term) ||
                              (o.City || "").toLowerCase().includes(term) ||
                              (o.PaymentType || "").toLowerCase().includes(term) ||
                              (o.channel || "").toLowerCase().includes(term) ||
                              (o.Status || "").toLowerCase().includes(term)
                            );
                          });

                          const totalPages = Math.ceil(filtered.length / loyaltyPageSize) || 1;
                          const currentPage = Math.min(loyaltyPage, totalPages);
                          const startIndex = (currentPage - 1) * loyaltyPageSize;
                          const paginated = filtered.slice(startIndex, startIndex + loyaltyPageSize);

                          return (
                            <>
                              <div className="overflow-x-auto">
                                {filtered.length === 0 ? (
                                  <div className="py-16 text-center text-slate-400">
                                    <Filter size={36} className="mx-auto mb-2 opacity-50" />
                                    <p className="text-sm font-semibold">No confirmed orders found.</p>
                                  </div>
                                ) : (
                                  <table className="w-full text-left border-collapse min-w-[1000px]">
                                    <thead>
                                      <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-extrabold uppercase tracking-wider text-slate-450 bg-slate-50/20 dark:bg-slate-950/5">
                                        <th className="px-6 py-4 font-bold">ID</th>
                                        <th className="px-6 py-4 font-bold">Customer</th>
                                        <th className="px-6 py-4 font-bold">Outlet</th>
                                        <th className="px-6 py-4 font-bold">Area & City</th>
                                        <th className="px-6 py-4 font-bold">Payment</th>
                                        <th className="px-6 py-4 font-bold">Channel</th>
                                        <th className="px-6 py-4 font-bold">Amount</th>
                                        <th className="px-6 py-4 font-bold">Date</th>
                                        <th className="px-6 py-4 font-bold">Status</th>
                                        <th className="px-6 py-4 font-bold text-right">Action</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                                      {paginated.map((o) => (
                                        <tr key={o.ID} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-all">
                                          <td className="px-6 py-4 text-xs font-bold text-slate-900 dark:text-white">
                                            #{o.ID}
                                          </td>
                                          <td className="px-6 py-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            <div>{o.Customer}</div>
                                            <div className="text-[10px] text-slate-400 font-medium">{o.Mobile}</div>
                                          </td>
                                          <td className="px-6 py-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            {o.Outlet}
                                          </td>
                                          <td className="px-6 py-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            <div>{o.Area || "—"}</div>
                                            <div className="text-[10px] text-slate-400 font-medium">{o.City}</div>
                                          </td>
                                          <td className="px-6 py-4 text-xs font-bold text-teal-600 dark:text-teal-400">
                                            {o.PaymentType}
                                          </td>
                                          <td className="px-6 py-4 text-xs font-semibold text-slate-700 dark:text-slate-300 capitalize">
                                            {o.channel}
                                          </td>
                                          <td className="px-6 py-4 text-xs font-bold text-slate-900 dark:text-white">
                                            Rs. {o.Amount}
                                          </td>
                                          <td className="px-6 py-4 text-xs font-semibold text-slate-450 dark:text-slate-400">
                                            {formatDate(o.Created)}
                                          </td>
                                          <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/15">
                                              {o.Status}
                                            </span>
                                          </td>
                                          <td className="px-6 py-4 text-right">
                                            <button
                                              onClick={() => window.open(`/admin/live-orders?orderId=${o.ID}`, "_blank")}
                                              className="px-3 py-1 rounded-lg bg-teal-500 hover:bg-teal-600 text-white font-bold text-[10px] shadow-sm transition-all"
                                            >
                                              Details
                                            </button>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                )}
                              </div>

                              {/* Pagination footer */}
                              {filtered.length > 0 && (
                                <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-950/20">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-500 font-semibold">Rows per page:</span>
                                    <select
                                      value={loyaltyPageSize}
                                      onChange={(e) => {
                                        setLoyaltyPageSize(Number(e.target.value));
                                        setLoyaltyPage(1);
                                      }}
                                      className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
                                    >
                                      {[10, 20, 50].map((size) => (
                                        <option key={size} value={size}>
                                          {size}
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                  <div className="flex items-center gap-4">
                                    <span className="text-xs font-semibold text-slate-500">
                                      Showing {startIndex + 1} - {Math.min(startIndex + loyaltyPageSize, filtered.length)} of {filtered.length}
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                      <button
                                        disabled={currentPage === 1}
                                        onClick={() => setLoyaltyPage((prev) => Math.max(prev - 1, 1))}
                                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 disabled:opacity-40 transition-all"
                                      >
                                        <ChevronRight size={14} className="rotate-185" />
                                      </button>
                                      <button
                                        disabled={currentPage === totalPages}
                                        onClick={() => setLoyaltyPage((prev) => Math.min(prev + 1, totalPages))}
                                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 disabled:opacity-40 transition-all"
                                      >
                                        <ChevronRight size={14} />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
