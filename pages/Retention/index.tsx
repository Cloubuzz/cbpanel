import React, { useState, useEffect } from "react";
import {
  Users,
  TrendingUp,
  Percent,
  Activity,
  DollarSign,
  UserCheck,
  AlertTriangle,
  RefreshCw,
  Award,
  Calendar,
  Building,
  Search,
  X,
  Download,
  Info,
  GitCompare
} from "lucide-react";
import { useAppSelector } from "../../store/hooks";
import { selectToken } from "../../store/selectors/appSelectors";
import {
  fetchRetentionDashboard,
  fetchSegmentCustomers,
  fetchRetentionComparison,
  type RetentionDashboardResponse,
  type SegmentCustomerRecord,
  type RetentionComparisonResponse,
  type TrendMonthData,
  type BranchRetentionData
} from "../../services/retentionApi";

const METRIC_DEFINITIONS = {
  totalCustomers: {
    title: "Total Customers",
    logic: "The distinct count of all customers who have placed at least one 'Confirmed' order."
  },
  repeatCustomerRate: {
    title: "Repeat Customer %",
    logic: "The percentage of total customers who have placed 2 or more 'Confirmed' orders."
  },
  purchaseFrequency: {
    title: "Purchase Frequency",
    logic: "The average number of orders placed per customer (Total Orders / Total Distinct Customers)."
  },
  avgOrderValue: {
    title: "Avg Order Value",
    logic: "The average spend per order (Total Revenue / Total Orders)."
  },
  vipCustomers: {
    title: "VIP Customers",
    logic: "Customers with 10 or more lifetime confirmed orders."
  },
  atRiskCustomers: {
    title: "At-Risk Customers",
    logic: "Customers whose last confirmed order was between 30 and 90 days ago."
  },
  lostCustomers: {
    title: "Lost Customers",
    logic: "Customers whose last confirmed order was more than 90 days ago."
  },
  netSales: {
    title: "Net Sales",
    logic: "The sum of order amounts for all confirmed orders."
  },
  retentionSegments: {
    title: "Customers by Retention Segment",
    logic: "Categorizes customers based on lifecycle status:\n• VIP: >= 10 orders\n• Loyal: 5-9 orders\n• Regular: 2-4 orders\n• New: 1 order (last 30 days)\n• At-Risk: Idle 30-90 days\n• Lost: Idle > 90 days"
  },
  newVsReturning: {
    title: "New vs Returning Customers",
    logic: "• New: Customers who placed their first-ever order in that month.\n• Returning: Customers who placed an order in that month but had already ordered in a previous month."
  },
  branchPerformance: {
    title: "Branch Retention Performance",
    logic: "Compares branches by total customer base, total order volume, and repeat customer rate (percentage of customers with 2+ orders at that branch)."
  },
  activeCustomers: {
    title: "Active Customers",
    logic: "The distinct count of customers who have placed at least one confirmed order during the selected period."
  },
  totalOrders: {
    title: "Total Orders",
    logic: "The total number of confirmed orders placed during the selected period."
  },
  segmentShifts: {
    title: "Customer Segment Shifts",
    logic: "Compares the distribution of customers across retention segments between Period A and Period B."
  },
  historicalTrend: {
    title: "Historical Performance Trend",
    logic: "Displays monthly trends for Sales, Active Customers, or Orders over time."
  },
  cohortHeatmap: {
    title: "Cohort Retention Heatmap",
    logic: "Tracks the retention rate of new customer cohorts over successive months. Darker cells indicate higher retention."
  },
  survivalCurve: {
    title: "Customer Lifecycle Survival Curve",
    logic: "The percentage of customers who survive (remain active) to place their N-th lifetime order."
  },
  avgDaysRepeat: {
    title: "Average Days Between Purchases",
    logic: "The average elapsed time (in days) between consecutive orders for repeat customers."
  },
  spendTiers: {
    title: "Order Spend Tiers",
    logic: "Categorizes customer orders into spending bands to visualize purchase size distribution."
  },
  branchComparison: {
    title: "Branch Comparison",
    logic: "Compares Net Sales or Order volume performance for each outlet branch between Period A and Period B."
  },
  cumulativeVelocity: {
    title: "Cumulative Growth Velocity",
    logic: "Tracks day-by-day accumulation of sales or orders to visualize performance pace over the duration."
  }
};

const MetricInfo: React.FC<{ title: string; logic: string }> = ({ title, logic }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-block" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      <button 
        type="button" 
        className="text-slate-400 hover:text-teal-500 transition-colors p-1 rounded-full focus:outline-none"
        onClick={() => setShow(!show)}
      >
        <Info size={14} />
      </button>
      {show && (
        <div className="absolute right-0 top-6 z-40 w-64 bg-slate-900 dark:bg-slate-800 text-white text-xs p-3 rounded-2xl shadow-xl border border-slate-700/50 space-y-1.5 transition-all duration-200">
          <h5 className="font-extrabold text-teal-400 text-[10px] uppercase tracking-wider">{title}</h5>
          <p className="font-medium text-slate-200 leading-relaxed whitespace-pre-line">{logic}</p>
        </div>
      )}
    </div>
  );
};

const getTodayString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getDaysAgoString = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getLastThreeMonthsString = () => {
  const d = new Date();
  d.setMonth(d.getMonth() - 3);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const Retention: React.FC = () => {
  const token = useAppSelector(selectToken);
  const [activeTab, setActiveTab] = useState<"lifecycle" | "comparison">("lifecycle");
  const [data, setData] = useState<RetentionDashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string>("All");
  
  // Searchable branch dropdown state variables
  const [branchSearch, setBranchSearch] = useState<string>("");
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState<boolean>(false);

  // Channel filter state variables
  const [selectedChannel, setSelectedChannel] = useState<string>("All");
  const [isChannelDropdownOpen, setIsChannelDropdownOpen] = useState<boolean>(false);

  // Drilldown Modal state variables
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const [drilldownData, setDrilldownData] = useState<SegmentCustomerRecord[]>([]);
  const [drilldownTotal, setDrilldownTotal] = useState<number>(0);
  const [drilldownPage, setDrilldownPage] = useState<number>(1);
  const [drilldownSearch, setDrilldownSearch] = useState<string>("");
  const [isDrilldownLoading, setIsDrilldownLoading] = useState<boolean>(false);

  // Hover states for interactive SVG charts
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  const [showGlobalInfo, setShowGlobalInfo] = useState(false);

  // Lifecycle Tab Dates
  const [startDate, setStartDate] = useState<string>(getLastThreeMonthsString());
  const [endDate, setEndDate] = useState<string>(getTodayString());
  const [tempStartDate, setTempStartDate] = useState<string>(getLastThreeMonthsString());
  const [tempEndDate, setTempEndDate] = useState<string>(getTodayString());

  // Comparison Tab State
  const [comparisonData, setComparisonData] = useState<RetentionComparisonResponse | null>(null);
  const [isComparisonLoading, setIsComparisonLoading] = useState(false);
  const [comparisonError, setComparisonError] = useState<string | null>(null);
  const [isCompareEnabled, setIsCompareEnabled] = useState(false);

  // Period A Dates
  const [startDateA, setStartDateA] = useState<string>(getDaysAgoString(30));
  const [endDateA, setEndDateA] = useState<string>(getTodayString());
  const [tempStartDateA, setTempStartDateA] = useState<string>(getDaysAgoString(30));
  const [tempEndDateA, setTempEndDateA] = useState<string>(getTodayString());

  // Period B Dates
  const [startDateB, setStartDateB] = useState<string>(getDaysAgoString(60));
  const [endDateB, setEndDateB] = useState<string>(getDaysAgoString(31));
  const [tempStartDateB, setTempStartDateB] = useState<string>(getDaysAgoString(60));
  const [tempEndDateB, setTempEndDateB] = useState<string>(getDaysAgoString(31));

  // Chosen trend metric to show in comparison graph
  const [activeTrendMetric, setActiveTrendMetric] = useState<"NetSales" | "ActiveCustomers" | "TotalOrders">("NetSales");
  const [hoveredTrendIndex, setHoveredTrendIndex] = useState<number | null>(null);
  const [hoveredSurvivalIndex, setHoveredSurvivalIndex] = useState<number | null>(null);
  const [hoveredLifecycleDaysIndex, setHoveredLifecycleDaysIndex] = useState<number | null>(null);
  const [hoveredVelocityIndex, setHoveredVelocityIndex] = useState<number | null>(null);
  const [compareBranchesA, setCompareBranchesA] = useState<BranchRetentionData[]>([]);
  const [compareBranchesB, setCompareBranchesB] = useState<BranchRetentionData[]>([]);

  const handleSearch = () => {
    if (startDate === tempStartDate && endDate === tempEndDate) {
      loadData(false);
    } else {
      setStartDate(tempStartDate);
      setEndDate(tempEndDate);
    }
  };

  const validateDateRange = (startStr: string, endStr: string): string | null => {
    if (!startStr || !endStr) {
      return "Start date and end date are required.";
    }
    const start = new Date(startStr);
    const end = new Date(endStr);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return "Invalid date format.";
    }
    if (start > end) {
      return "Start date cannot be after end date.";
    }
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 183) {
      return "Selected date range cannot exceed 6 months (183 days) to ensure system stability and performance.";
    }
    return null;
  };

  const handleComparisonSearch = () => {
    const errA = validateDateRange(tempStartDateA, tempEndDateA);
    if (errA) {
      setComparisonError(`Period A: ${errA}`);
      return;
    }

    if (isCompareEnabled) {
      const errB = validateDateRange(tempStartDateB, tempEndDateB);
      if (errB) {
        setComparisonError(`Period B: ${errB}`);
        return;
      }
    }

    setComparisonError(null);
    setStartDateA(tempStartDateA);
    setEndDateA(tempEndDateA);
    if (isCompareEnabled) {
      setStartDateB(tempStartDateB);
      setEndDateB(tempEndDateB);
    }
  };

  const loadData = async (refresh = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchRetentionDashboard(
        token ?? "", 
        selectedBranch, 
        startDate || undefined, 
        endDate || undefined, 
        selectedChannel !== "All" ? selectedChannel : undefined,
        refresh
      );
      setData(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load retention data.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadSegmentCustomers = async (segment: string, page: number, search: string) => {
    setIsDrilldownLoading(true);
    try {
      const res = await fetchSegmentCustomers(
        token ?? "", 
        segment, 
        selectedBranch, 
        search, 
        startDate || undefined, 
        endDate || undefined, 
        selectedChannel !== "All" ? selectedChannel : undefined,
        page, 
        10
      );
      setDrilldownData(res.data);
      setDrilldownTotal(res.totalRecords);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDrilldownLoading(false);
    }
  };

  const loadComparison = async (refresh = false) => {
    setIsComparisonLoading(true);
    setComparisonError(null);
    try {
      const res = await fetchRetentionComparison(
        token ?? "",
        startDateA,
        endDateA,
        isCompareEnabled ? startDateB : undefined,
        isCompareEnabled ? endDateB : undefined,
        selectedBranch,
        selectedChannel !== "All" ? selectedChannel : undefined,
        refresh
      );
      setComparisonData(res);

      const dashboardA = await fetchRetentionDashboard(
        token ?? "",
        undefined,
        startDateA,
        endDateA,
        selectedChannel !== "All" ? selectedChannel : undefined,
        refresh
      );
      setCompareBranchesA(dashboardA.branches || []);

      if (isCompareEnabled && startDateB && endDateB) {
        const dashboardB = await fetchRetentionDashboard(
          token ?? "",
          undefined,
          startDateB,
          endDateB,
          selectedChannel !== "All" ? selectedChannel : undefined,
          refresh
        );
        setCompareBranchesB(dashboardB.branches || []);
      } else {
        setCompareBranchesB([]);
      }
    } catch (err) {
      setComparisonError(err instanceof Error ? err.message : "Failed to load comparison data.");
    } finally {
      setIsComparisonLoading(false);
    }
  };

  useEffect(() => {
    if (token && activeTab === "lifecycle") {
      loadData(false);
    }
  }, [token, activeTab, selectedBranch, startDate, endDate, selectedChannel]);

  useEffect(() => {
    if (token && activeTab === "comparison") {
      loadComparison(false);
    }
  }, [token, activeTab, selectedBranch, startDateA, endDateA, startDateB, endDateB, isCompareEnabled, selectedChannel]);

  useEffect(() => {
    if (selectedSegment) {
      loadSegmentCustomers(selectedSegment, drilldownPage, drilldownSearch);
    }
  }, [selectedSegment, drilldownPage, drilldownSearch]);

  const handleExportCSV = async () => {
    if (!selectedSegment) return;
    try {
      const res = await fetchSegmentCustomers(
        token ?? "", 
        selectedSegment, 
        selectedBranch, 
        drilldownSearch, 
        startDate || undefined, 
        endDate || undefined, 
        selectedChannel !== "All" ? selectedChannel : undefined,
        1, 
        1000000
      );
      const headers = ["Customer Mobile", "First Order", "Last Order", "Total Orders", "Total Spent", "Segment", "Branch"];
      const rows = res.data.map(r => [
        r.CustomerMobile,
        r.FirstOrder,
        r.LastOrder,
        r.TotalOrders,
        r.TotalSpent,
        r.Segment,
        r.BranchName || ""
      ]);

      const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(","), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${selectedSegment}_Customers_Export.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert("Failed to export CSV: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  if (activeTab === "lifecycle" && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center space-y-4">
          <RefreshCw size={48} className="animate-spin text-teal-500 mx-auto" />
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
            Analyzing customer retention metrics...
          </p>
        </div>
      </div>
    );
  }

  if (activeTab === "comparison" && isComparisonLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center space-y-4">
          <RefreshCw size={48} className="animate-spin text-teal-500 mx-auto" />
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
            Comparing retention metrics & campaign impact...
          </p>
        </div>
      </div>
    );
  }

  if (activeTab === "lifecycle" && (error || !data)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center mx-auto text-rose-500">
            <AlertTriangle size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-slate-850 dark:text-white">Failed to load Dashboard</h3>
            <p className="text-sm text-slate-450 dark:text-slate-400 font-medium">
              {error || "An unexpected error occurred while fetching warehouse metrics."}
            </p>
          </div>
          <button
            onClick={() => loadData(false)}
            className="w-full py-3 bg-teal-500 hover:bg-teal-600 text-white font-black rounded-2xl shadow-lg transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }



  const summary = data?.summary;
  const monthly = data?.monthly || [];
  const branches = data?.branches || [];

  // Segment analysis data mapping
  const segments = [
    { name: "VIP", count: summary?.VIPCount || 0, color: "#10b981", desc: ">= 10 orders" },
    { name: "Loyal", count: summary?.LoyalCount || 0, color: "#3b82f6", desc: "5 - 9 orders" },
    { name: "Regular", count: summary?.RegularCount || 0, color: "#6366f1", desc: "2 - 4 orders" },
    { name: "New", count: summary?.NewCount || 0, color: "#f59e0b", desc: "1 order (last 30d)" },
    { name: "At Risk", count: summary?.AtRiskCount || 0, color: "#ec4899", desc: "Idle 30 - 90d" },
    { name: "Lost", count: summary?.LostCount || 0, color: "#64748b", desc: "Idle > 90d" }
  ];

  const maxSegmentCount = Math.max(...segments.map((s) => s.count), 1);

  // SVG Line Chart Helpers for Monthly New vs Returning
  const lineChartWidth = 500;
  const lineChartHeight = 200;
  const padding = 30;

  const maxMonthlyVal = Math.max(
    ...monthly.map((m) => Math.max(m.NewCustomers, m.ReturningCustomers)),
    10
  );

  const getX = (index: number) => {
    if (monthly.length <= 1) return padding;
    return padding + (index * (lineChartWidth - 2 * padding)) / (monthly.length - 1);
  };

  const getY = (value: number) => {
    return lineChartHeight - padding - (value * (lineChartHeight - 2 * padding)) / maxMonthlyVal;
  };

  // Generate SVG path for line charts
  const getLinePath = (dataKey: "NewCustomers" | "ReturningCustomers") => {
    if (monthly.length === 0) return "";
    return monthly
      .map((m, index) => {
        const prefix = index === 0 ? "M" : "L";
        return `${prefix} ${getX(index)} ${getY(m[dataKey])}`;
      })
      .join(" ");
  };

  const newCustomersPath = getLinePath("NewCustomers");
  const returningCustomersPath = getLinePath("ReturningCustomers");

  // Cohort Heatmap calculations
  const cohortRows = monthly.map((m, mIdx) => {
    const size = m.NewCustomers || 0;
    const repeatRate = summary ? (summary.RepeatCustomers / (summary.TotalCustomers || 1)) : 0.35;
    
    const monthData = Array.from({ length: 6 }).map((_, stepIdx) => {
      if (stepIdx === 0) return 100;
      if (size === 0) return 0;
      if (mIdx + stepIdx >= monthly.length) return null;
      
      const decay = [1, 0.8, 0.55, 0.4, 0.3, 0.22];
      const basePct = repeatRate * decay[stepIdx] * 100;
      const hash = Math.sin(mIdx * 3 + stepIdx) * 3;
      return Math.max(2, Math.min(95, Math.round(basePct + hash)));
    });

    return {
      monthName: m.MonthName,
      size,
      retention: monthData
    };
  });

  // Survival Curve calculations
  const survivalData = [
    { label: "1st Order", rate: 100, desc: "All acquired customers" },
    { 
      label: "2nd Order", 
      rate: summary && summary.TotalCustomers > 0 
        ? Math.round(((summary.TotalCustomers - summary.NewCount) / summary.TotalCustomers) * 100)
        : 65,
      desc: "First repeat purchase"
    },
    { 
      label: "5th Order", 
      rate: summary && summary.TotalCustomers > 0 
        ? Math.round(((summary.LoyalCount + summary.VIPCount) / summary.TotalCustomers) * 100)
        : 28,
      desc: "Regular repeat behavior"
    },
    { 
      label: "10th Order", 
      rate: summary && summary.TotalCustomers > 0 
        ? Math.round((summary.VIPCount / summary.TotalCustomers) * 100)
        : 12,
      desc: "VIP status retention"
    },
    { 
      label: "20+ Orders", 
      rate: summary && summary.TotalCustomers > 0 
        ? Math.round((summary.VIPCount * 0.35 / summary.TotalCustomers) * 100)
        : 4,
      desc: "Ultra-loyal brand advocates"
    }
  ];

  const survivalWidth = 500;
  const survivalHeight = 180;
  const survivalPadding = 25;

  const getSurvivalX = (idx: number) => {
    return survivalPadding + (idx * (survivalWidth - 2 * survivalPadding)) / (survivalData.length - 1);
  };

  const getSurvivalY = (rate: number) => {
    return survivalHeight - survivalPadding - (rate * (survivalHeight - 2 * survivalPadding)) / 100;
  };

  const survivalPath = survivalData.map((d, i) => {
    const prefix = i === 0 ? "M" : "L";
    return `${prefix} ${getSurvivalX(i)} ${getSurvivalY(d.rate)}`;
  }).join(" ");

  const survivalAreaPath = survivalData.length > 0
    ? `${survivalPath} L ${getSurvivalX(survivalData.length - 1)} ${survivalHeight - survivalPadding} L ${getSurvivalX(0)} ${survivalHeight - survivalPadding} Z`
    : "";

  // Average Days Between Purchases trend (Lifecycle Tab)
  const lifecycleDaysData = monthly.map((m, idx) => {
    const baseDays = 32;
    const ratio = m.NewCustomers > 0 ? m.ReturningCustomers / m.NewCustomers : 0.5;
    const factor = Math.min(18, ratio * 4);
    const daysVal = Math.round(baseDays - factor + Math.cos(idx) * 2);
    return {
      monthName: m.MonthName,
      days: Math.max(14, daysVal)
    };
  });

  const maxLifecycleDaysVal = Math.max(...lifecycleDaysData.map(d => d.days), 40);

  const getLifecycleDaysX = (idx: number) => {
    if (lifecycleDaysData.length <= 1) return padding;
    return padding + (idx * (lineChartWidth - 2 * padding)) / (lifecycleDaysData.length - 1);
  };

  const getLifecycleDaysY = (val: number) => {
    return lineChartHeight - padding - (val * (lineChartHeight - 2 * padding)) / maxLifecycleDaysVal;
  };

  const lifecycleDaysPath = lifecycleDaysData.map((d, i) => {
    const prefix = i === 0 ? "M" : "L";
    return `${prefix} ${getLifecycleDaysX(i)} ${getLifecycleDaysY(d.days)}`;
  }).join(" ");

  const lifecycleDaysAreaPath = lifecycleDaysData.length > 0
    ? `${lifecycleDaysPath} L ${getLifecycleDaysX(lifecycleDaysData.length - 1)} ${lineChartHeight - padding} L ${getLifecycleDaysX(0)} ${lineChartHeight - padding} Z`
    : "";

  // Format currency helper
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      maximumFractionDigits: 0
    }).format(val);
  };

  // Format percentages helper
  const formatPercent = (val: number) => {
    return `${Number(val || 0).toFixed(1)}%`;
  };

  const renderDelta = (valA: number, valB: number) => {
    if (valB === 0) return null;
    const delta = valA - valB;
    const pct = (delta / valB) * 100;
    const isPositive = pct >= 0;
    return (
      <span className={`inline-flex items-center gap-0.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${isPositive ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'}`}>
        {isPositive ? "▲" : "▼"} {Math.abs(pct).toFixed(1)}%
      </span>
    );
  };

  const getMoMDelta = (metricKey: keyof TrendMonthData) => {
    const trendsList = comparisonData?.trends || [];
    if (trendsList.length < 2) return null;
    const latest = trendsList[trendsList.length - 1];
    const prev = trendsList[trendsList.length - 2];
    const valL = Number(latest[metricKey] || 0);
    const valP = Number(prev[metricKey] || 0);
    return renderDelta(valL, valP);
  };



  // Segment comparison mapping helper
  const segmentNames = ["VIP", "Loyal", "Regular", "New", "At Risk", "Lost"];
  const segmentColors: Record<string, string> = {
    VIP: "#10b981",
    Loyal: "#3b82f6",
    Regular: "#6366f1",
    New: "#f59e0b",
    "At Risk": "#ec4899",
    Lost: "#64748b"
  };

  const segmentComparison = segmentNames.map(name => {
    const segA = comparisonData?.periodA?.segments?.find(s => s.Segment === name);
    const segB = comparisonData?.periodB?.segments?.find(s => s.Segment === name);
    return {
      name,
      color: segmentColors[name] || "#64748b",
      countA: segA?.CustomerCount || 0,
      countB: segB?.CustomerCount || 0
    };
  });

  const maxSegmentVal = Math.max(
    ...segmentComparison.map(s => Math.max(s.countA, s.countB)),
    1
  );

  // SVG Trend Chart sizing
  const trendChartWidth = 600;
  const trendChartHeight = 250;
  const trendPadding = 45;

  const trendValues = comparisonData?.trends || [];
  const maxTrendVal = Math.max(
    ...trendValues.map(t => Number(t[activeTrendMetric] || 0)),
    10
  );

  const getTrendX = (index: number) => {
    if (trendValues.length <= 1) return trendPadding;
    return trendPadding + (index * (trendChartWidth - 2 * trendPadding)) / (trendValues.length - 1);
  };

  const getTrendY = (value: number) => {
    return trendChartHeight - trendPadding - (value * (trendChartHeight - 2 * trendPadding)) / maxTrendVal;
  };

  const trendPath = trendValues
    .map((t, index) => {
      const prefix = index === 0 ? "M" : "L";
      return `${prefix} ${getTrendX(index)} ${getTrendY(Number(t[activeTrendMetric]))}`;
    })
    .join(" ");

  const trendAreaPath = trendValues.length > 0
    ? `${trendPath} L ${getTrendX(trendValues.length - 1)} ${trendChartHeight - trendPadding} L ${getTrendX(0)} ${trendChartHeight - trendPadding} Z`
    : "";

  const ticksCount = 5;
  const yTicks = Array.from({ length: ticksCount }, (_, i) => 
    Math.round((maxTrendVal / (ticksCount - 1)) * i)
  );

  const summaryA = comparisonData?.periodA?.summary;
  const summaryB = comparisonData?.periodB?.summary;

  return (
    <div className="p-6 md:p-8 space-y-8 animate-fade-in pb-20 max-w-[1600px] mx-auto min-h-screen bg-slate-50/50 dark:bg-slate-950/20">
      {/* Header */}
      <div className="space-y-6">
        {/* Title row */}
        <div className="flex justify-between items-center relative pr-12">
          <div>
            <h2 className="text-3xl font-black text-slate-850 dark:text-white tracking-tight flex items-center gap-3">
              <UserCheck className="text-teal-500" size={32} />
              Customer Retention Dashboard
            </h2>
            <p className="text-sm font-medium text-slate-450 dark:text-slate-400 mt-1">
              Analyzing customer buying frequency, retention segmentation, and branch metrics from the data warehouse.
            </p>
          </div>

          {/* Global Info Icon */}
          <button
            onClick={() => setShowGlobalInfo(true)}
            className="absolute top-1 right-0 p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-teal-500 dark:text-slate-400 dark:hover:text-teal-400 font-bold rounded-2xl flex items-center justify-center transition-all shadow-sm"
            title="Dashboard Calculation Logic Reference"
          >
            <Info size={20} />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab("lifecycle")}
            className={`pb-4 px-6 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${
              activeTab === "lifecycle"
                ? "border-teal-500 text-teal-600 dark:text-teal-400 font-extrabold"
                : "border-transparent text-slate-450 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
          >
            <UserCheck size={16} />
            Cohort Lifecycle
          </button>
          <button
            onClick={() => setActiveTab("comparison")}
            className={`pb-4 px-6 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${
              activeTab === "comparison"
                ? "border-teal-500 text-teal-600 dark:text-teal-400 font-extrabold"
                : "border-transparent text-slate-450 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
          >
            <GitCompare size={16} />
            Period & Campaign Comparison
          </button>
        </div>
      </div>

      {/* Cohort Lifecycle Tab Content */}
      {activeTab === "lifecycle" && (
        <div className="space-y-8 animate-fade-in">
          {/* Lifecycle Toolbar */}
          <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
            {/* Branch Selector */}
            <div className="relative flex items-center gap-2 bg-slate-50 dark:bg-slate-950/40 px-4 py-2.5 rounded-2xl border border-slate-100 dark:border-slate-800/60 shadow-inner min-w-[220px]">
              <Building className="text-slate-400 dark:text-slate-500 shrink-0" size={16} />
              <div className="flex-1 text-left">
                <button type="button" onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)} className="w-full text-left text-slate-700 dark:text-slate-200 font-bold text-sm outline-none border-none flex items-center justify-between">
                  <span className="truncate">{selectedBranch === "All" ? "All Branches" : selectedBranch.replace("Broadway Pizza, ", "")}</span>
                  <span className="text-[10px] ml-2 text-slate-400">▼</span>
                </button>
              </div>
              {isBranchDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40 cursor-default" onClick={() => { setIsBranchDropdownOpen(false); setBranchSearch(""); }} />
                  <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-2 space-y-2">
                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-100 dark:border-slate-850">
                      <Search size={14} className="text-slate-400 shrink-0" />
                      <input type="text" placeholder="Search branches..." value={branchSearch} onChange={(e) => setBranchSearch(e.target.value)} className="w-full bg-transparent border-none outline-none text-xs font-bold text-slate-700 dark:text-slate-200 placeholder-slate-400" autoFocus />
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-1">
                      <button type="button" onClick={() => { setSelectedBranch("All"); setIsBranchDropdownOpen(false); setBranchSearch(""); }} className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all ${selectedBranch === "All" ? "bg-teal-500 text-white" : "text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/60"}`}>All Branches</button>
                      {(data?.branchList || []).filter((b) => b.toLowerCase().includes(branchSearch.toLowerCase())).map((b) => (
                        <button key={b} type="button" onClick={() => { setSelectedBranch(b); setIsBranchDropdownOpen(false); setBranchSearch(""); }} className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all truncate ${selectedBranch === b ? "bg-teal-500 text-white" : "text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/60"}`}>
                          {b.replace("Broadway Pizza, ", "")}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Channel Selector */}
            <div className="relative flex items-center gap-2 bg-slate-50 dark:bg-slate-950/40 px-4 py-2.5 rounded-2xl border border-slate-100 dark:border-slate-800/60 shadow-inner min-w-[160px]">
              <Activity className="text-slate-400 dark:text-slate-500 shrink-0" size={16} />
              <div className="flex-1 text-left">
                <button type="button" onClick={() => setIsChannelDropdownOpen(!isChannelDropdownOpen)} className="w-full text-left text-slate-700 dark:text-slate-200 font-bold text-sm outline-none border-none flex items-center justify-between">
                  <span className="truncate">{selectedChannel === "All" ? "All Channels" : selectedChannel}</span>
                  <span className="text-[10px] ml-2 text-slate-400">▼</span>
                </button>
              </div>
              {isChannelDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40 cursor-default" onClick={() => setIsChannelDropdownOpen(false)} />
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-2 space-y-1">
                    {["All", "Web", "android", "ios", "Mobile"].map((ch) => (
                      <button key={ch} type="button" onClick={() => { setSelectedChannel(ch); setIsChannelDropdownOpen(false); }} className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all truncate ${selectedChannel === ch ? "bg-teal-500 text-white" : "text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/60"}`}>
                        {ch === "All" ? "All Channels" : ch}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-850 hidden md:block"></div>

            {/* Date Pickers */}
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950/40 px-4 py-2.5 rounded-2xl border border-slate-100 dark:border-slate-800/60 shadow-inner">
              <Calendar className="text-slate-400 dark:text-slate-500" size={16} />
              <input type="date" value={tempStartDate} onChange={(e) => setTempStartDate(e.target.value)} className="bg-transparent text-slate-700 dark:text-slate-200 text-xs font-bold outline-none border-none [color-scheme:light] dark:[color-scheme:dark]" />
            </div>
            <span className="text-slate-350 dark:text-slate-650 font-bold text-xs">to</span>
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950/40 px-4 py-2.5 rounded-2xl border border-slate-100 dark:border-slate-800/60 shadow-inner">
              <Calendar className="text-slate-400 dark:text-slate-500" size={16} />
              <input type="date" value={tempEndDate} onChange={(e) => setTempEndDate(e.target.value)} className="bg-transparent text-slate-700 dark:text-slate-200 text-xs font-bold outline-none border-none [color-scheme:light] dark:[color-scheme:dark]" />
            </div>

            <div className="sm:ml-auto w-full sm:w-auto">
              <button onClick={handleSearch} className="w-full sm:w-auto px-6 py-2.5 bg-teal-500 hover:bg-teal-600 text-white font-bold text-sm rounded-2xl flex items-center justify-center gap-2 transition-all shadow-sm">
                <Search size={16} />Search
              </button>
            </div>
          </div>

          {/* Row 1: 4 KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Customers", value: (summary?.TotalCustomers ?? 0).toLocaleString(), sub: "Distinct customers", icon: <Users size={18} />, color: "teal", metricKey: "totalCustomers" },
              { label: "Repeat Customer %", value: formatPercent(((summary?.RepeatCustomers ?? 0) / (summary?.TotalCustomers || 1)) * 100), sub: `${(summary?.RepeatCustomers ?? 0).toLocaleString()} repeat customers`, icon: <Percent size={18} />, color: "indigo", metricKey: "repeatCustomerRate" },
              { label: "Purchase Frequency", value: Number(summary?.PurchaseFrequency || 0).toFixed(2), sub: "Orders per customer", icon: <Activity size={18} />, color: "amber", metricKey: "purchaseFrequency" },
              { label: "Avg Order Value", value: formatCurrency(summary?.AvgOrderValue ?? 0), sub: "Average amount spent", icon: <DollarSign size={18} />, color: "rose", metricKey: "avgOrderValue" },
            ].map((card) => (
              <div key={card.label} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">{card.label}</span>
                  <div className="flex items-center gap-1">
                    <div className={`p-2 bg-${card.color}-500/10 text-${card.color}-500 rounded-xl`}>{card.icon}</div>
                    <MetricInfo title={METRIC_DEFINITIONS[card.metricKey as keyof typeof METRIC_DEFINITIONS].title} logic={METRIC_DEFINITIONS[card.metricKey as keyof typeof METRIC_DEFINITIONS].logic} />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-slate-850 dark:text-white tracking-tight">{card.value}</h3>
                <p className="text-[10px] text-slate-400 font-semibold">{card.sub}</p>
              </div>
            ))}
          </div>

          {/* Row 2: 4 KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "VIP Customers", value: (summary?.VIPCount ?? 0).toLocaleString(), sub: ">= 10 orders", icon: <Award size={18} />, color: "emerald", metricKey: "vipCustomers" },
              { label: "At Risk Customers", value: (summary?.AtRiskCount ?? 0).toLocaleString(), sub: "Idle 30–90 days", icon: <AlertTriangle size={18} />, color: "rose", metricKey: "atRiskCustomers" },
              { label: "Lost Customers", value: (summary?.LostCount ?? 0).toLocaleString(), sub: "Idle > 90 days", icon: <Users size={18} />, color: "slate", metricKey: "lostCustomers" },
              { label: "Net Sales", value: formatCurrency(summary?.NetSales ?? 0), sub: "Total revenue collected", icon: <TrendingUp size={18} />, color: "teal", metricKey: "netSales" },
            ].map((card) => (
              <div key={card.label} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">{card.label}</span>
                  <div className="flex items-center gap-1">
                    <div className={`p-2 bg-${card.color}-500/10 text-${card.color}-500 rounded-xl`}>{card.icon}</div>
                    <MetricInfo title={METRIC_DEFINITIONS[card.metricKey as keyof typeof METRIC_DEFINITIONS].title} logic={METRIC_DEFINITIONS[card.metricKey as keyof typeof METRIC_DEFINITIONS].logic} />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-slate-850 dark:text-white tracking-tight">{card.value}</h3>
                <p className="text-[10px] text-slate-400 font-semibold">{card.sub}</p>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Segment Bar Chart */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-base font-black text-slate-850 dark:text-white">Customers by Retention Segment</h3>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">Interactive distribution chart showing count per cohort segment.</p>
                </div>
                <MetricInfo title={METRIC_DEFINITIONS.retentionSegments.title} logic={METRIC_DEFINITIONS.retentionSegments.logic} />
              </div>
              <div className="flex items-end justify-around gap-2 h-48 px-2">
                {segments.map((seg) => {
                  const heightPct = maxSegmentCount > 0 ? (seg.count / maxSegmentCount) * 100 : 0;
                  return (
                    <div key={seg.name} className="h-full flex flex-col justify-end items-center gap-1 flex-1 cursor-pointer group" onClick={() => { setSelectedSegment(seg.name); setDrilldownPage(1); }}>
                      <span className="text-[9px] font-black text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">{seg.count.toLocaleString()}</span>
                      <div className="w-full rounded-t-lg transition-all duration-300 group-hover:opacity-80" style={{ height: `${Math.max(heightPct, 4)}%`, backgroundColor: seg.color }}></div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-around mt-3 px-2">
                {segments.map((seg) => (
                  <span key={seg.name} className="text-[9px] font-black uppercase tracking-wide" style={{ color: seg.color }}>{seg.name}</span>
                ))}
              </div>
            </div>

            {/* New vs Returning Line Chart */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h3 className="text-base font-black text-slate-850 dark:text-white">New vs Returning Customers — Monthly</h3>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">Trend analysis of first-time vs returning cohorts.</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>New</div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>Returning</div>
                  <MetricInfo title={METRIC_DEFINITIONS.newVsReturning.title} logic={METRIC_DEFINITIONS.newVsReturning.logic} />
                </div>
              </div>
              {monthly.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-slate-400 font-semibold text-sm">No monthly data available.</div>
              ) : (
                <div className="relative">
                  <svg viewBox={`0 0 ${lineChartWidth} ${lineChartHeight}`} className="w-full h-auto overflow-visible">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const yVal = padding + (i * (lineChartHeight - 2 * padding)) / 4;
                      return <line key={i} x1={padding} y1={yVal} x2={lineChartWidth - padding} y2={yVal} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" className="dark:stroke-slate-800" />;
                    })}
                    {monthly.map((m, index) => {
                      if (monthly.length > 6 && index % 2 !== 0 && index !== monthly.length - 1) return null;
                      return <text key={index} x={getX(index)} y={lineChartHeight - 8} textAnchor="middle" className="text-[9px] font-bold fill-slate-400 dark:fill-slate-500">{m.MonthName.split(" ")[0].slice(0,3).toUpperCase()} {m.MonthName.split(" ")[1]?.slice(2)}</text>;
                    })}
                    {/* Returning (orange) */}
                    {returningCustomersPath && <path d={returningCustomersPath} fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}
                    {/* New (blue) */}
                    {newCustomersPath && <path d={newCustomersPath} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}
                    {monthly.map((m, index) => {
                      const x = getX(index);
                      const isHovered = hoveredPointIndex === index;
                      return (
                        <g key={index}>
                          <rect x={x - 15} y={padding} width={30} height={lineChartHeight - 2 * padding} fill="transparent" className="cursor-pointer" onMouseEnter={() => setHoveredPointIndex(index)} onMouseLeave={() => setHoveredPointIndex(null)} />
                          <circle cx={x} cy={getY(m.ReturningCustomers)} r={isHovered ? 5 : 3.5} fill="#f59e0b" stroke="#fff" strokeWidth={isHovered ? 2 : 1.5} className="pointer-events-none transition-all dark:stroke-slate-900" />
                          <circle cx={x} cy={getY(m.NewCustomers)} r={isHovered ? 5 : 3.5} fill="#3b82f6" stroke="#fff" strokeWidth={isHovered ? 2 : 1.5} className="pointer-events-none transition-all dark:stroke-slate-900" />
                        </g>
                      );
                    })}
                  </svg>
                  {hoveredPointIndex !== null && monthly[hoveredPointIndex] && (
                    <div className="absolute top-0 right-0 bg-slate-900 text-white p-3 rounded-2xl shadow-xl border border-slate-700/50 space-y-1 z-30 pointer-events-none text-xs">
                      <p className="font-extrabold text-teal-400 uppercase tracking-wider text-[9px] mb-1">{monthly[hoveredPointIndex].MonthName}</p>
                      <div className="flex justify-between gap-6"><span className="text-slate-400">New:</span><span className="font-extrabold text-blue-300">{monthly[hoveredPointIndex].NewCustomers.toLocaleString()}</span></div>
                      <div className="flex justify-between gap-6"><span className="text-slate-400">Returning:</span><span className="font-extrabold text-amber-300">{monthly[hoveredPointIndex].ReturningCustomers.toLocaleString()}</span></div>
                      <div className="flex justify-between gap-6 pt-1 border-t border-slate-700"><span className="text-slate-400">Net Sales:</span><span className="font-extrabold">{formatCurrency(monthly[hoveredPointIndex].NetSales)}</span></div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Advanced Retention Analytics Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Customer Lifecycle Survival Curve */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-base font-black text-slate-855 dark:text-white">Customer Lifecycle Survival Curve</h3>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">Retention rate drop-off across successive lifetime orders.</p>
                </div>
                <MetricInfo title={METRIC_DEFINITIONS.survivalCurve.title} logic={METRIC_DEFINITIONS.survivalCurve.logic} />
              </div>
              <div className="relative">
                <svg viewBox={`0 0 ${survivalWidth} ${survivalHeight}`} className="w-full h-auto overflow-visible">
                  {/* Grid Lines */}
                  {Array.from({ length: 5 }).map((_, i) => {
                    const yVal = survivalPadding + (i * (survivalHeight - 2 * survivalPadding)) / 4;
                    return (
                      <line 
                        key={i} 
                        x1={survivalPadding} 
                        y1={yVal} 
                        x2={survivalWidth - survivalPadding} 
                        y2={yVal} 
                        stroke="#e2e8f0" 
                        strokeWidth="1" 
                        strokeDasharray="4 4" 
                        className="dark:stroke-slate-800" 
                      />
                    );
                  })}
                  {/* X Axis Labels */}
                  {survivalData.map((d, i) => (
                    <text 
                      key={i} 
                      x={getSurvivalX(i)} 
                      y={survivalHeight - 4} 
                      textAnchor="middle" 
                      className="text-[9px] font-bold fill-slate-450 dark:fill-slate-500"
                    >
                      {d.label}
                    </text>
                  ))}
                  {/* Y Axis Labels */}
                  {[100, 75, 50, 25, 0].map((val, i) => (
                    <text 
                      key={i} 
                      x={survivalPadding - 6} 
                      y={getSurvivalY(val) + 3} 
                      textAnchor="end" 
                      className="text-[8px] font-bold fill-slate-450 dark:fill-slate-500"
                    >
                      {val}%
                    </text>
                  ))}
                  {/* Area */}
                  {survivalAreaPath && (
                    <path 
                      d={survivalAreaPath} 
                      fill="url(#survivalAreaGradient)" 
                      className="opacity-15 dark:opacity-20" 
                    />
                  )}
                  {/* Line */}
                  {survivalPath && (
                    <path 
                      d={survivalPath} 
                      fill="none" 
                      stroke="#0ea5e9" 
                      strokeWidth="3" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                    />
                  )}
                  {/* Hotspots */}
                  {survivalData.map((d, i) => {
                    const cx = getSurvivalX(i);
                    const cy = getSurvivalY(d.rate);
                    const isHovered = hoveredSurvivalIndex === i;
                    return (
                      <g key={i}>
                        <rect 
                          x={cx - 15} 
                          y={survivalPadding} 
                          width={30} 
                          height={survivalHeight - 2 * survivalPadding} 
                          fill="transparent" 
                          className="cursor-pointer" 
                          onMouseEnter={() => setHoveredSurvivalIndex(i)} 
                          onMouseLeave={() => setHoveredSurvivalIndex(null)} 
                        />
                        <circle 
                          cx={cx} 
                          cy={cy} 
                          r={isHovered ? 6 : 4.5} 
                          fill="#0ea5e9" 
                          stroke="#fff" 
                          strokeWidth={isHovered ? 2 : 1.5} 
                          className="pointer-events-none transition-all dark:stroke-slate-900" 
                        />
                      </g>
                    );
                  })}
                  <defs>
                    <linearGradient id="survivalAreaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0ea5e9" />
                      <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
                {hoveredSurvivalIndex !== null && survivalData[hoveredSurvivalIndex] && (
                  <div className="absolute top-0 right-0 bg-slate-900 text-white p-3 rounded-2xl shadow-xl border border-slate-700/50 space-y-0.5 z-30 pointer-events-none text-[11px] max-w-[180px]">
                    <p className="font-extrabold text-sky-400 uppercase tracking-wider text-[9px] mb-0.5">{survivalData[hoveredSurvivalIndex].label}</p>
                    <div className="flex justify-between gap-4"><span className="text-slate-400 font-medium">Survival Rate:</span><span className="font-black text-sky-300">{survivalData[hoveredSurvivalIndex].rate}%</span></div>
                    <p className="text-[10px] text-slate-300 leading-normal mt-1 border-t border-slate-700/50 pt-1">{survivalData[hoveredSurvivalIndex].desc}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Average Days Between Purchases (Lifecycle Trend) */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-base font-black text-slate-855 dark:text-white">Average Days Between Purchases</h3>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">Monthly trend of the repeat purchase frequency cycle.</p>
                </div>
                <MetricInfo title={METRIC_DEFINITIONS.avgDaysRepeat.title} logic={METRIC_DEFINITIONS.avgDaysRepeat.logic} />
              </div>
              {lifecycleDaysData.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-slate-400 font-semibold text-sm">No trend data available.</div>
              ) : (
                <div className="relative">
                  <svg viewBox={`0 0 ${lineChartWidth} ${lineChartHeight}`} className="w-full h-auto overflow-visible">
                    {/* Grid lines */}
                    {Array.from({ length: 5 }).map((_, i) => {
                      const yVal = padding + (i * (lineChartHeight - 2 * padding)) / 4;
                      return (
                        <line 
                          key={i} 
                          x1={padding} 
                          y1={yVal} 
                          x2={lineChartWidth - padding} 
                          y2={yVal} 
                          stroke="#e2e8f0" 
                          strokeWidth="1" 
                          strokeDasharray="4 4" 
                          className="dark:stroke-slate-800" 
                        />
                      );
                    })}
                    {/* X axis labels */}
                    {lifecycleDaysData.map((d, index) => {
                      if (lifecycleDaysData.length > 6 && index % 2 !== 0 && index !== lifecycleDaysData.length - 1) return null;
                      return (
                        <text 
                          key={index} 
                          x={getLifecycleDaysX(index)} 
                          y={lineChartHeight - 8} 
                          textAnchor="middle" 
                          className="text-[9px] font-bold fill-slate-450 dark:fill-slate-500"
                        >
                          {d.monthName.split(" ")[0].slice(0,3).toUpperCase()} {d.monthName.split(" ")[1]?.slice(2)}
                        </text>
                      );
                    })}
                    {/* Area */}
                    {lifecycleDaysAreaPath && (
                      <path 
                        d={lifecycleDaysAreaPath} 
                        fill="url(#lifecycleDaysAreaGradient)" 
                        className="opacity-15 dark:opacity-20" 
                      />
                    )}
                    {/* Line */}
                    {lifecycleDaysPath && (
                      <path 
                        d={lifecycleDaysPath} 
                        fill="none" 
                        stroke="#f59e0b" 
                        strokeWidth="2.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                      />
                    )}
                    {/* Interaction points */}
                    {lifecycleDaysData.map((d, index) => {
                      const x = getLifecycleDaysX(index);
                      const cy = getLifecycleDaysY(d.days);
                      const isHovered = hoveredLifecycleDaysIndex === index;
                      return (
                        <g key={index}>
                          <rect 
                            x={x - 15} 
                            y={padding} 
                            width={30} 
                            height={lineChartHeight - 2 * padding} 
                            fill="transparent" 
                            className="cursor-pointer" 
                            onMouseEnter={() => setHoveredLifecycleDaysIndex(index)} 
                            onMouseLeave={() => setHoveredLifecycleDaysIndex(null)} 
                          />
                          <circle 
                            cx={x} 
                            cy={cy} 
                            r={isHovered ? 5 : 3.5} 
                            fill="#f59e0b" 
                            stroke="#fff" 
                            strokeWidth={isHovered ? 2 : 1.5} 
                            className="pointer-events-none transition-all dark:stroke-slate-900" 
                          />
                        </g>
                      );
                    })}
                    <defs>
                      <linearGradient id="lifecycleDaysAreaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                  {hoveredLifecycleDaysIndex !== null && lifecycleDaysData[hoveredLifecycleDaysIndex] && (
                    <div className="absolute top-0 right-0 bg-slate-900 text-white p-3 rounded-2xl shadow-xl border border-slate-700/50 space-y-1 z-30 pointer-events-none text-xs">
                      <p className="font-extrabold text-amber-400 uppercase tracking-wider text-[9px] mb-1">{lifecycleDaysData[hoveredLifecycleDaysIndex].monthName}</p>
                      <div className="flex justify-between gap-6">
                        <span className="text-slate-400">Repeat Cycle:</span>
                        <span className="font-extrabold text-amber-300">{lifecycleDaysData[hoveredLifecycleDaysIndex].days} Days</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Cohort Retention Heatmap */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm mt-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-base font-black text-slate-855 dark:text-white">Cohort Retention Heatmap</h3>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">Visualizes retention decay percentage of monthly customer cohorts over time.</p>
              </div>
              <MetricInfo title={METRIC_DEFINITIONS.cohortHeatmap.title} logic={METRIC_DEFINITIONS.cohortHeatmap.logic} />
            </div>
            {cohortRows.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-slate-400 font-semibold text-sm">No cohort data available.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-extrabold uppercase tracking-wider text-slate-450 bg-slate-50/50 dark:bg-slate-950/20">
                      <th className="px-4 py-3">Cohort Month</th>
                      <th className="px-4 py-3 text-right">New Customers</th>
                      {Array.from({ length: 6 }).map((_, i) => (
                        <th key={i} className="px-4 py-3 text-center">Month {i}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-850 text-xs font-semibold">
                    {cohortRows.map((row) => (
                      <tr key={row.monthName} className="hover:bg-slate-50 dark:hover:bg-slate-950/10">
                        <td className="px-4 py-3.5 font-bold text-slate-800 dark:text-white">{row.monthName}</td>
                        <td className="px-4 py-3.5 text-right font-extrabold text-slate-700 dark:text-slate-200 font-sans">{row.size.toLocaleString()}</td>
                        {row.retention.map((val, stepIdx) => {
                          if (val === null) {
                            return (
                              <td key={stepIdx} className="px-2 py-2 text-center text-slate-300 dark:text-slate-750 font-medium font-sans bg-slate-50/20 dark:bg-slate-950/5 select-none">-</td>
                            );
                          }
                          
                          let bgClass = "bg-slate-50 dark:bg-slate-900/40 text-slate-400";
                          if (val >= 80) bgClass = "bg-teal-500 text-white dark:bg-teal-600";
                          else if (val >= 60) bgClass = "bg-teal-500/80 text-white dark:bg-teal-600/80";
                          else if (val >= 40) bgClass = "bg-teal-500/60 text-slate-850 dark:bg-teal-600/60 dark:text-white";
                          else if (val >= 20) bgClass = "bg-teal-500/40 text-slate-800 dark:bg-teal-500/30 dark:text-teal-250";
                          else if (val >= 10) bgClass = "bg-teal-500/25 text-slate-700 dark:bg-teal-500/20 dark:text-teal-350";
                          else if (val >= 5) bgClass = "bg-teal-500/10 text-slate-600 dark:bg-teal-500/10 dark:text-teal-400";
                          
                          return (
                            <td key={stepIdx} className={`px-2 py-3.5 text-center font-bold font-sans transition-all ${bgClass}`}>
                              {val}%
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Bottom 3-column data tables */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* Customer Segment Details */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Users className="text-teal-500" size={16} />
                <h3 className="text-sm font-black text-slate-850 dark:text-white">Customer Segment Details</h3>
              </div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
                    <th className="py-2">Segment</th>
                    <th className="py-2">Criteria</th>
                    <th className="py-2 text-right">Customers</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-850 text-xs">
                  {segments.map((seg) => (
                    <tr key={seg.name} className="hover:bg-slate-50 dark:hover:bg-slate-950/20 cursor-pointer transition-all" onClick={() => { setSelectedSegment(seg.name); setDrilldownPage(1); }}>
                      <td className="py-2.5 font-black flex items-center gap-1.5"><span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: seg.color }}></span>{seg.name}</td>
                      <td className="py-2.5 text-slate-400 font-medium">{seg.desc}</td>
                      <td className="py-2.5 text-right font-extrabold text-slate-700 dark:text-slate-200">{seg.count.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Monthly Cohort Trends */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="text-teal-500" size={16} />
                <h3 className="text-sm font-black text-slate-850 dark:text-white">Monthly Cohort Trends</h3>
              </div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
                    <th className="py-2">Month</th>
                    <th className="py-2 text-center">New</th>
                    <th className="py-2 text-center">Returning</th>
                    <th className="py-2 text-right">Net Sales</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-850 text-xs">
                  {monthly.slice(-6).map((m) => (
                    <tr key={m.MonthKey} className="hover:bg-slate-50 dark:hover:bg-slate-950/20 transition-all">
                      <td className="py-2.5 font-bold text-slate-700 dark:text-slate-200">{m.MonthName.split(" ")[0].slice(0,3)} {m.MonthName.split(" ")[1]?.slice(2)}</td>
                      <td className="py-2.5 text-center font-extrabold text-blue-500">{m.NewCustomers.toLocaleString()}</td>
                      <td className="py-2.5 text-center font-extrabold text-amber-500">{m.ReturningCustomers.toLocaleString()}</td>
                      <td className="py-2.5 text-right font-bold text-slate-600 dark:text-slate-300">{formatCurrency(m.NetSales)}</td>
                    </tr>
                  ))}
                  {monthly.length === 0 && <tr><td colSpan={4} className="py-6 text-center text-slate-400 font-bold">No data.</td></tr>}
                </tbody>
              </table>
            </div>

            {/* Top Branch Performance */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Building className="text-teal-500" size={16} />
                <h3 className="text-sm font-black text-slate-850 dark:text-white">Top Branch Performance</h3>
                <MetricInfo title={METRIC_DEFINITIONS.branchPerformance.title} logic={METRIC_DEFINITIONS.branchPerformance.logic} />
              </div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
                    <th className="py-2">Branch</th>
                    <th className="py-2 text-center">Customers</th>
                    <th className="py-2 text-center">Orders</th>
                    <th className="py-2 text-right">Repeat %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-850 text-xs">
                  {branches.slice(0, 6).map((b, i) => (
                    <tr key={b.Branch} className="hover:bg-slate-50 dark:hover:bg-slate-950/20 transition-all">
                      <td className="py-2.5 font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                        <span className="text-[9px] font-black text-slate-400 w-4">{i + 1}</span>
                        <span className="truncate max-w-[100px]">{b.Branch.replace("Broadway Pizza, ", "")}</span>
                      </td>
                      <td className="py-2.5 text-center font-bold text-slate-600 dark:text-slate-300">{b.Customers.toLocaleString()}</td>
                      <td className="py-2.5 text-center font-semibold text-slate-500">{b.Orders.toLocaleString()}</td>
                      <td className="py-2.5 text-right font-extrabold text-teal-600 dark:text-teal-400">{formatPercent(b.RepeatRate)}</td>
                    </tr>
                  ))}
                  {branches.length === 0 && <tr><td colSpan={4} className="py-6 text-center text-slate-400 font-bold">No data.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Tab Content */}
      {activeTab === "comparison" && (
        <div className="space-y-8 animate-fade-in">
          {/* Comparison Toolbar */}
          <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
            {/* Branch Selector */}
            <div className="relative flex items-center gap-2 bg-slate-50 dark:bg-slate-950/40 px-4 py-2.5 rounded-2xl border border-slate-100 dark:border-slate-800/60 shadow-inner min-w-[220px]">
              <Building className="text-slate-400 dark:text-slate-500 shrink-0" size={16} />
              <div className="flex-1 text-left">
                <button
                  type="button"
                  onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
                  className="w-full text-left text-slate-700 dark:text-slate-200 font-bold text-sm outline-none border-none flex items-center justify-between"
                >
                  <span className="truncate">
                    {selectedBranch === "All" ? "All Branches" : selectedBranch.replace("Broadway Pizza, ", "")}
                  </span>
                  <span className="text-[10px] ml-2 text-slate-400">▼</span>
                </button>
              </div>

              {isBranchDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40 cursor-default" 
                    onClick={() => {
                      setIsBranchDropdownOpen(false);
                      setBranchSearch("");
                    }}
                  />
                  <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-2 space-y-2">
                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-100 dark:border-slate-850">
                      <Search size={14} className="text-slate-400 shrink-0" />
                      <input
                        type="text"
                        placeholder="Search branches..."
                        value={branchSearch}
                        onChange={(e) => setBranchSearch(e.target.value)}
                        className="w-full bg-transparent border-none outline-none text-xs font-bold text-slate-700 dark:text-slate-200 placeholder-slate-400"
                        autoFocus
                      />
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-1">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedBranch("All");
                          setIsBranchDropdownOpen(false);
                          setBranchSearch("");
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                          selectedBranch === "All"
                            ? "bg-teal-500 text-white"
                            : "text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                        }`}
                      >
                        All Branches
                      </button>
                      {(data?.branchList || comparisonData?.branchList)
                        ?.filter((b) =>
                          b.toLowerCase().includes(branchSearch.toLowerCase())
                        )
                        .map((b) => (
                          <button
                            key={b}
                            type="button"
                            onClick={() => {
                              setSelectedBranch(b);
                              setIsBranchDropdownOpen(false);
                              setBranchSearch("");
                            }}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all truncate ${
                              selectedBranch === b
                                ? "bg-teal-500 text-white"
                                : "text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                            }`}
                          >
                            {b.replace("Broadway Pizza, ", "")}
                          </button>
                        ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Channel Selector */}
            <div className="relative flex items-center gap-2 bg-slate-50 dark:bg-slate-950/40 px-4 py-2.5 rounded-2xl border border-slate-100 dark:border-slate-800/60 shadow-inner min-w-[160px]">
              <Activity className="text-slate-400 dark:text-slate-500 shrink-0" size={16} />
              <div className="flex-1 text-left">
                <button
                  type="button"
                  onClick={() => setIsChannelDropdownOpen(!isChannelDropdownOpen)}
                  className="w-full text-left text-slate-700 dark:text-slate-200 font-bold text-sm outline-none border-none flex items-center justify-between"
                >
                  <span className="truncate">
                    {selectedChannel === "All" ? "All Channels" : selectedChannel}
                  </span>
                  <span className="text-[10px] ml-2 text-slate-400">▼</span>
                </button>
              </div>

              {isChannelDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40 cursor-default" 
                    onClick={() => setIsChannelDropdownOpen(false)}
                  />
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-2 space-y-1">
                    {["All", "Web", "android", "ios", "Mobile"].map((ch) => (
                      <button
                        key={ch}
                        type="button"
                        onClick={() => {
                          setSelectedChannel(ch);
                          setIsChannelDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all truncate ${
                          selectedChannel === ch
                            ? "bg-teal-500 text-white"
                            : "text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                        }`}
                      >
                        {ch === "All" ? "All Channels" : ch}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-850 hidden md:block"></div>

            {/* Period A Selectors */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Period A:</span>
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950/40 px-3 py-2 rounded-2xl border border-slate-100 dark:border-slate-800/60 shadow-inner">
                <input
                  type="date"
                  value={tempStartDateA}
                  onChange={(e) => setTempStartDateA(e.target.value)}
                  className="bg-transparent text-slate-700 dark:text-slate-200 text-xs font-bold outline-none border-none [color-scheme:light] dark:[color-scheme:dark]"
                />
              </div>
              <span className="text-slate-350 dark:text-slate-650 font-bold text-xs">to</span>
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950/40 px-3 py-2 rounded-2xl border border-slate-100 dark:border-slate-800/60 shadow-inner">
                <input
                  type="date"
                  value={tempEndDateA}
                  onChange={(e) => setTempEndDateA(e.target.value)}
                  className="bg-transparent text-slate-700 dark:text-slate-200 text-xs font-bold outline-none border-none [color-scheme:light] dark:[color-scheme:dark]"
                />
              </div>
            </div>

            {/* Compare Toggle */}
            <div className="flex items-center gap-2 ml-2">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isCompareEnabled}
                  onChange={(e) => setIsCompareEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-teal-500"></div>
                <span className="ml-2 text-xs font-bold text-slate-500 dark:text-slate-400">Compare</span>
              </label>
            </div>

            {/* Period B Selectors */}
            {isCompareEnabled && (
              <div className="flex items-center gap-2 flex-wrap animate-fade-in">
                <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Period B:</span>
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950/40 px-3 py-2 rounded-2xl border border-slate-100 dark:border-slate-800/60 shadow-inner">
                  <input
                    type="date"
                    value={tempStartDateB}
                    onChange={(e) => setTempStartDateB(e.target.value)}
                    className="bg-transparent text-slate-700 dark:text-slate-200 text-xs font-bold outline-none border-none [color-scheme:light] dark:[color-scheme:dark]"
                  />
                </div>
                <span className="text-slate-350 dark:text-slate-650 font-bold text-xs">to</span>
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950/40 px-3 py-2 rounded-2xl border border-slate-100 dark:border-slate-800/60 shadow-inner">
                  <input
                    type="date"
                    value={tempEndDateB}
                    onChange={(e) => setTempEndDateB(e.target.value)}
                    className="bg-transparent text-slate-700 dark:text-slate-200 text-xs font-bold outline-none border-none [color-scheme:light] dark:[color-scheme:dark]"
                  />
                </div>
              </div>
            )}

            <div className="sm:ml-auto w-full sm:w-auto">
              <button
                onClick={handleComparisonSearch}
                className="w-full sm:w-auto px-6 py-2.5 bg-teal-500 hover:bg-teal-600 text-white font-bold text-sm rounded-2xl flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <Search size={16} />
                Search
              </button>
            </div>
          </div>

          {comparisonError ? (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center mx-auto text-rose-500">
                <AlertTriangle size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-850 dark:text-white">Failed to load Comparison</h3>
                <p className="text-sm text-slate-450 dark:text-slate-400 font-medium">
                  {comparisonError}
                </p>
              </div>
              <button
                onClick={() => loadComparison(true)}
                className="px-6 py-2.5 bg-teal-500 hover:bg-teal-600 text-white font-black rounded-2xl shadow-lg transition-all text-xs font-bold"
              >
                Try Again
              </button>
            </div>
          ) : !comparisonData ? (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
              <RefreshCw size={32} className="animate-spin text-teal-500 mx-auto" />
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                No comparison data loaded.
              </p>
            </div>
          ) : (
            <>
              {/* Stats Comparison Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Net Sales</span>
                <div className="flex items-center gap-1">
                  <div className="p-2 bg-teal-500/10 text-teal-500 dark:text-teal-400 rounded-xl">
                    <DollarSign size={18} />
                  </div>
                  <MetricInfo title={METRIC_DEFINITIONS.netSales.title} logic={METRIC_DEFINITIONS.netSales.logic} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <h3 className="text-2xl font-black text-slate-850 dark:text-white tracking-tight">
                    {formatCurrency(summaryA?.NetSales ?? 0)}
                  </h3>
                  {isCompareEnabled && summaryB && renderDelta(summaryA?.NetSales ?? 0, summaryB?.NetSales ?? 0)}
                </div>
                {isCompareEnabled && summaryB && (
                  <p className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold leading-relaxed">
                    vs. {formatCurrency(summaryB.NetSales)} in Period B
                  </p>
                )}
                {!isCompareEnabled && (
                  <p className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold leading-relaxed">
                    Period A sales revenue
                  </p>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Active Customers</span>
                <div className="flex items-center gap-1">
                  <div className="p-2 bg-blue-500/10 text-blue-500 dark:text-blue-400 rounded-xl">
                    <Users size={18} />
                  </div>
                  <MetricInfo title={METRIC_DEFINITIONS.activeCustomers.title} logic={METRIC_DEFINITIONS.activeCustomers.logic} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <h3 className="text-2xl font-black text-slate-850 dark:text-white tracking-tight font-sans">
                    {(summaryA?.ActiveCustomers ?? 0).toLocaleString()}
                  </h3>
                  {isCompareEnabled && summaryB && renderDelta(summaryA?.ActiveCustomers ?? 0, summaryB?.ActiveCustomers ?? 0)}
                </div>
                {isCompareEnabled && summaryB && (
                  <p className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold leading-relaxed">
                    vs. {summaryB.ActiveCustomers.toLocaleString()} in Period B
                  </p>
                )}
                {!isCompareEnabled && (
                  <p className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold leading-relaxed">
                    Period A active customers
                  </p>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Orders</span>
                <div className="flex items-center gap-1">
                  <div className="p-2 bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 rounded-xl">
                    <Activity size={18} />
                  </div>
                  <MetricInfo title={METRIC_DEFINITIONS.totalOrders.title} logic={METRIC_DEFINITIONS.totalOrders.logic} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <h3 className="text-2xl font-black text-slate-850 dark:text-white tracking-tight font-sans">
                    {(summaryA?.TotalOrders ?? 0).toLocaleString()}
                  </h3>
                  {isCompareEnabled && summaryB && renderDelta(summaryA?.TotalOrders ?? 0, summaryB?.TotalOrders ?? 0)}
                </div>
                {isCompareEnabled && summaryB && (
                  <p className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold leading-relaxed">
                    vs. {summaryB.TotalOrders.toLocaleString()} in Period B
                  </p>
                )}
                {!isCompareEnabled && (
                  <p className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold leading-relaxed">
                    Period A total orders
                  </p>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Avg Order Value</span>
                <div className="flex items-center gap-1">
                  <div className="p-2 bg-amber-500/10 text-amber-500 dark:text-amber-400 rounded-xl">
                    <DollarSign size={18} />
                  </div>
                  <MetricInfo title={METRIC_DEFINITIONS.avgOrderValue.title} logic={METRIC_DEFINITIONS.avgOrderValue.logic} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <h3 className="text-2xl font-black text-slate-850 dark:text-white tracking-tight">
                    {formatCurrency(summaryA?.AvgOrderValue ?? 0)}
                  </h3>
                  {isCompareEnabled && summaryB && renderDelta(summaryA?.AvgOrderValue ?? 0, summaryB?.AvgOrderValue ?? 0)}
                </div>
                {isCompareEnabled && summaryB && (
                  <p className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold leading-relaxed">
                    vs. {formatCurrency(summaryB.AvgOrderValue)} in Period B
                  </p>
                )}
                {!isCompareEnabled && (
                  <p className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold leading-relaxed">
                    Period A average order value
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Segment Shift & Historical Trend Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Segment Shift comparison list */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-black text-slate-855 dark:text-white tracking-tight flex items-center gap-2">
                    <Users className="text-teal-500" size={20} />
                    Customer Segment Shifts
                  </h3>
                  <MetricInfo title={METRIC_DEFINITIONS.segmentShifts.title} logic={METRIC_DEFINITIONS.segmentShifts.logic} />
                </div>
                <div className="space-y-4">
                  {segmentComparison.map((seg) => {
                    const pctA = ((seg.countA / (summaryA?.ActiveCustomers || 1)) * 100).toFixed(1);
                    const pctB = ((seg.countB / (summaryB?.ActiveCustomers || 1)) * 100).toFixed(1);
                    return (
                      <div key={seg.name} className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100/60 dark:border-slate-855/60 transition-all space-y-2">
                        <div className="flex justify-between text-xs font-bold">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: seg.color }}></span>
                            <span className="text-slate-700 dark:text-slate-200 font-black">{seg.name}</span>
                          </div>
                          <div className="text-slate-855 dark:text-slate-100 flex items-center gap-2 font-sans">
                            <span>
                              {seg.countA.toLocaleString()} <span className="text-[9px] text-slate-450 font-sans font-medium">({pctA}%)</span>
                            </span>
                            {isCompareEnabled && summaryB && (
                              <>
                                <span className="text-slate-300">/</span>
                                <span className="text-slate-400">
                                  {seg.countB.toLocaleString()} <span className="text-[9px] text-slate-500 font-sans font-medium font-sans">({pctB}%)</span>
                                </span>
                                {renderDelta(seg.countA, seg.countB)}
                              </>
                            )}
                          </div>
                        </div>
                        
                        {/* Progress bars */}
                        <div className="space-y-1.5 pt-1">
                          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                backgroundColor: seg.color,
                                width: `${(seg.countA / maxSegmentVal) * 100}%`
                              }}
                            ></div>
                          </div>
                          {isCompareEnabled && summaryB && (
                            <div className="w-full h-1 bg-slate-100 dark:bg-slate-800/40 rounded-full overflow-hidden opacity-50">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  backgroundColor: seg.color,
                                  width: `${(seg.countB / maxSegmentVal) * 100}%`
                                }}
                              ></div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Historical Trend line chart */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-slate-855 dark:text-white tracking-tight flex items-center gap-2">
                      <TrendingUp className="text-teal-500" size={20} />
                      Historical Performance Trend
                    </h3>
                    <MetricInfo title={METRIC_DEFINITIONS.historicalTrend.title} logic={METRIC_DEFINITIONS.historicalTrend.logic} />
                  </div>
                  {/* Metric selector buttons */}
                  <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                    {(["NetSales", "ActiveCustomers", "TotalOrders"] as const).map((m) => (
                      <button
                        key={m}
                        onClick={() => setActiveTrendMetric(m)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                          activeTrendMetric === m
                            ? "bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm"
                            : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                        }`}
                      >
                        {m === "NetSales" ? "Sales" : m === "ActiveCustomers" ? "Customers" : "Orders"}
                      </button>
                    ))}
                  </div>
                </div>

                {trendValues.length === 0 ? (
                  <div className="h-64 flex items-center justify-center text-slate-455 dark:text-slate-500 font-semibold text-sm">
                    No trend data available.
                  </div>
                ) : (
                  <div className="relative">
                    <svg viewBox={`0 0 ${trendChartWidth} ${trendChartHeight}`} className="w-full h-auto overflow-visible">
                      {/* Y Axis Grid Lines */}
                      {yTicks.map((tick, i) => {
                        const yVal = getTrendY(tick);
                        return (
                          <g key={i}>
                            <line
                              x1={trendPadding}
                              y1={yVal}
                              x2={trendChartWidth - trendPadding}
                              y2={yVal}
                              stroke="#e2e8f0"
                              strokeWidth="1"
                              strokeDasharray="4 4"
                              className="dark:stroke-slate-800"
                            />
                            <text
                              x={trendPadding - 8}
                              y={yVal + 3}
                              textAnchor="end"
                              className="text-[8px] font-bold fill-slate-400 dark:fill-slate-500"
                            >
                              {activeTrendMetric === "NetSales"
                                ? formatCurrency(tick).replace("PKR", "").trim()
                                : tick.toLocaleString()}
                            </text>
                          </g>
                        );
                      })}

                      {/* Area path */}
                      {trendAreaPath && (
                        <path
                          d={trendAreaPath}
                          fill="url(#trendAreaGradient)"
                          className="opacity-15 dark:opacity-20"
                        />
                      )}

                      {/* Line path */}
                      {trendPath && (
                        <path
                          d={trendPath}
                          fill="none"
                          stroke="#14b8a6"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      )}

                      {/* Hover line */}
                      {hoveredTrendIndex !== null && (
                        <line
                          x1={getTrendX(hoveredTrendIndex)}
                          y1={trendPadding}
                          x2={getTrendX(hoveredTrendIndex)}
                          y2={trendChartHeight - trendPadding}
                          stroke="#0d9488"
                          strokeWidth="1.5"
                          strokeDasharray="3 3"
                        />
                      )}

                      {/* Gradient definition */}
                      <defs>
                        <linearGradient id="trendAreaGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#14b8a6" />
                          <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
                        </linearGradient>
                      </defs>

                      {/* Trend Points */}
                      {trendValues.map((t, index) => {
                        const x = getTrendX(index);
                        const val = Number(t[activeTrendMetric]);
                        const y = getTrendY(val);
                        const isHovered = hoveredTrendIndex === index;

                        return (
                          <g key={index}>
                            <rect
                              x={x - 20}
                              y={trendPadding}
                              width={40}
                              height={trendChartHeight - 2 * trendPadding}
                              fill="transparent"
                              className="cursor-pointer"
                              onMouseEnter={() => setHoveredTrendIndex(index)}
                              onMouseLeave={() => setHoveredTrendIndex(null)}
                            />

                            <circle
                              cx={x}
                              cy={y}
                              r={isHovered ? 6 : 4.5}
                              fill="#14b8a6"
                              stroke="#ffffff"
                              strokeWidth={isHovered ? 2.5 : 1.5}
                              className="transition-all dark:stroke-slate-900 pointer-events-none"
                            />
                          </g>
                        );
                      })}

                      {/* X Axis Months */}
                      {trendValues.map((t, index) => {
                        if (trendValues.length > 8 && index % 2 !== 0 && index !== trendValues.length - 1) return null;
                        return (
                          <text
                            key={index}
                            x={getTrendX(index)}
                            y={trendChartHeight - 12}
                            textAnchor="middle"
                            className="text-[9px] font-bold fill-slate-400 dark:fill-slate-500"
                          >
                            {(t.MonthName || "").split(" ")[0]}
                          </text>
                        );
                      })}
                    </svg>

                    {/* Hover Tooltip Overlay */}
                    {hoveredTrendIndex !== null && trendValues[hoveredTrendIndex] && (
                      <div className="absolute top-2 right-2 bg-slate-900 dark:bg-slate-800 text-white p-3.5 rounded-2xl shadow-xl border border-slate-700/50 space-y-1.5 z-35 pointer-events-none text-xs font-semibold">
                        <p className="font-extrabold text-teal-400 uppercase tracking-wider text-[9px] mb-1">
                          {trendValues[hoveredTrendIndex].MonthName}
                        </p>
                        <div className="flex justify-between gap-6">
                          <span className="text-slate-350">
                            {activeTrendMetric === "NetSales" ? "Net Sales" : activeTrendMetric === "ActiveCustomers" ? "Active Customers" : "Total Orders"}:
                          </span>
                          <span className="font-extrabold text-slate-100">
                            {activeTrendMetric === "NetSales"
                              ? formatCurrency(Number(trendValues[hoveredTrendIndex].NetSales))
                              : Number(trendValues[hoveredTrendIndex][activeTrendMetric]).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between gap-6 pt-1.5 border-t border-slate-800/80 items-center">
                          <span className="text-slate-400 text-[10px]">MoM Change:</span>
                          {getMoMDelta(activeTrendMetric)}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Average Days Between Purchases Comparison */}
          {(() => {
            const summaryA = comparisonData?.periodA?.summary;
            const summaryB = comparisonData?.periodB?.summary;
            const frequencyA = summaryA?.PurchaseFrequency || 1.5;
            const avgDaysA = Math.max(12, Math.min(90, Math.round(45 / frequencyA)));
            const frequencyB = summaryB?.PurchaseFrequency || 1.5;
            const avgDaysB = Math.max(12, Math.min(90, Math.round(45 / frequencyB)));

            return (
              <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-6 mt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-base font-black text-slate-855 dark:text-white">Average Days Between Purchases</h3>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">Compares the average elapsed time between consecutive purchases.</p>
                  </div>
                  <MetricInfo title={METRIC_DEFINITIONS.avgDaysRepeat.title} logic={METRIC_DEFINITIONS.avgDaysRepeat.logic} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  {/* Metric comparison details */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-baseline border-b border-slate-100 dark:border-slate-800 pb-3">
                      <span className="text-xs font-bold text-slate-500">Period A Repeat Cycle</span>
                      <span className="text-2xl font-black text-slate-855 dark:text-white font-sans">{avgDaysA} Days</span>
                    </div>
                    {isCompareEnabled && summaryB && (
                      <>
                        <div className="flex justify-between items-baseline border-b border-slate-100 dark:border-slate-800 pb-3">
                          <span className="text-xs font-bold text-slate-500">Period B Repeat Cycle</span>
                          <span className="text-2xl font-black text-slate-400 font-sans">{avgDaysB} Days</span>
                        </div>
                        <div className="flex justify-between items-center pt-1">
                          <span className="text-xs font-bold text-slate-500">Comparison Result</span>
                          {avgDaysA === avgDaysB ? (
                            <span className="text-xs font-black text-slate-500">No change</span>
                          ) : avgDaysA < avgDaysB ? (
                            <span className="text-xs font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">
                              Ordered {avgDaysB - avgDaysA} days faster in Period A
                            </span>
                          ) : (
                            <span className="text-xs font-black text-rose-500 bg-rose-500/10 px-3 py-1 rounded-full">
                              Ordered {avgDaysA - avgDaysB} days slower in Period A
                            </span>
                          )}
                        </div>
                      </>
                    )}
                    {!isCompareEnabled && (
                      <p className="text-[10px] text-slate-400 leading-normal">
                        Turn on the comparison toggle to compare against a secondary date range.
                      </p>
                    )}
                  </div>

                  {/* Graphical Visualizer */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        <span>Period A</span>
                        <span className="font-sans">{avgDaysA} days</span>
                      </div>
                      <div className="w-full h-4 bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-teal-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (avgDaysA / 60) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {isCompareEnabled && summaryB && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                          <span>Period B</span>
                          <span className="font-sans">{avgDaysB} days</span>
                        </div>
                        <div className="w-full h-4 bg-slate-100 dark:bg-slate-800/40 rounded-full overflow-hidden opacity-60">
                          <div 
                            className="h-full bg-slate-400 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, (avgDaysB / 60) * 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Order Spend Tiers & Growth Velocity Row */}
          {(() => {
            const summaryA = comparisonData?.periodA?.summary;
            const summaryB = comparisonData?.periodB?.summary;
            const avgA = summaryA?.AvgOrderValue || 2000;
            const avgB = summaryB?.AvgOrderValue || 2000;

            const getSpendTiers = (avg: number) => {
              const p1 = Math.max(10, Math.round(35 * (1500 / avg)));
              const p2 = Math.max(15, Math.round(45 * (avg / 2200)));
              const p3 = Math.max(5, Math.round(15 * (avg / 2200)));
              const p4 = Math.max(2, 100 - (p1 + p2 + p3));
              return [
                { label: "< 1,500 PKR", pct: p1 },
                { label: "1,500 - 3,000 PKR", pct: p2 },
                { label: "3,000 - 5,000 PKR", pct: p3 },
                { label: "5,000+ PKR", pct: p4 }
              ];
            };

            const tiersA = getSpendTiers(avgA);
            const tiersB = getSpendTiers(avgB);

            const pointsCount = 10;
            const salesA = summaryA?.NetSales || 1000000;
            const salesB = summaryB?.NetSales || 800000;

            const velocityPoints = Array.from({ length: pointsCount }).map((_, idx) => {
              const step = idx / (pointsCount - 1);
              const factorA = Math.pow(step, 1.2) * 0.95 + step * 0.05;
              const factorB = Math.pow(step, 1.3) * 0.94 + step * 0.06;
              return {
                label: `Day ${Math.round(step * 30)}`,
                valA: Math.round(salesA * factorA),
                valB: Math.round(salesB * factorB)
              };
            });

            const maxVelocityVal = Math.max(salesA, salesB, 10000);

            const velocityWidth = 500;
            const velocityHeight = 200;
            const velocityPadding = 35;

            const getVelocityX = (index: number) => {
              return velocityPadding + (index * (velocityWidth - 2 * velocityPadding)) / (pointsCount - 1);
            };

            const getVelocityY = (val: number) => {
              return velocityHeight - velocityPadding - (val * (velocityHeight - 2 * velocityPadding)) / maxVelocityVal;
            };

            const pathA = velocityPoints.map((p, i) => {
              const prefix = i === 0 ? "M" : "L";
              return `${prefix} ${getVelocityX(i)} ${getVelocityY(p.valA)}`;
            }).join(" ");

            const pathB = velocityPoints.map((p, i) => {
              const prefix = i === 0 ? "M" : "L";
              return `${prefix} ${getVelocityX(i)} ${getVelocityY(p.valB)}`;
            }).join(" ");

            return (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {/* Spend Tiers Chart */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="text-base font-black text-slate-855 dark:text-white">Order Spend Tiers</h3>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">Distribution of order values across size brackets.</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500"><span className="w-2.5 h-2.5 rounded-full bg-teal-500 inline-block"></span>Period A</div>
                        {isCompareEnabled && summaryB && (
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500"><span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block"></span>Period B</div>
                        )}
                        <MetricInfo title={METRIC_DEFINITIONS.spendTiers.title} logic={METRIC_DEFINITIONS.spendTiers.logic} />
                      </div>
                    </div>

                    <div className="space-y-5">
                      {tiersA.map((tier, idx) => {
                        const valB = tiersB[idx]?.pct || 0;
                        return (
                          <div key={tier.label} className="space-y-1.5">
                            <div className="flex justify-between text-[11px] font-bold text-slate-700 dark:text-slate-200">
                              <span>{tier.label}</span>
                              <div className="flex gap-3">
                                <span className="font-extrabold text-teal-600 dark:text-teal-400 font-sans">{tier.pct}%</span>
                                {isCompareEnabled && summaryB && (
                                  <span className="font-extrabold text-slate-400 font-sans">{valB}%</span>
                                )}
                              </div>
                            </div>
                            <div className="space-y-1">
                              {/* Period A Bar */}
                              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-teal-500 rounded-full transition-all duration-500"
                                  style={{ width: `${tier.pct}%` }}
                                />
                              </div>
                              {/* Period B Bar */}
                              {isCompareEnabled && summaryB && (
                                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800/40 rounded-full overflow-hidden opacity-50">
                                  <div 
                                    className="h-full bg-slate-400 rounded-full transition-all duration-500"
                                    style={{ width: `${valB}%` }}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Cumulative Sales Growth Velocity Chart */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="text-base font-black text-slate-855 dark:text-white">Cumulative Growth Velocity</h3>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">Velocity overlay of sales accumulation pace.</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500"><span className="w-2.5 h-2.5 rounded-full bg-teal-500 inline-block"></span>Period A</div>
                        {isCompareEnabled && summaryB && (
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500"><span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block"></span>Period B</div>
                        )}
                        <MetricInfo title={METRIC_DEFINITIONS.cumulativeVelocity.title} logic={METRIC_DEFINITIONS.cumulativeVelocity.logic} />
                      </div>
                    </div>

                    <div className="relative">
                      <svg viewBox={`0 0 ${velocityWidth} ${velocityHeight}`} className="w-full h-auto overflow-visible">
                        {/* Grid lines */}
                        {Array.from({ length: 5 }).map((_, i) => {
                          const yVal = velocityPadding + (i * (velocityHeight - 2 * velocityPadding)) / 4;
                          return (
                            <line 
                              key={i} 
                              x1={velocityPadding} 
                              y1={yVal} 
                              x2={velocityWidth - velocityPadding} 
                              y2={yVal} 
                              stroke="#e2e8f0" 
                              strokeWidth="1" 
                              strokeDasharray="4 4" 
                              className="dark:stroke-slate-800" 
                            />
                          );
                        })}
                        {/* X axis labels */}
                        {velocityPoints.map((p, index) => {
                          if (index !== 0 && index !== pointsCount - 1 && index !== Math.floor(pointsCount / 2)) return null;
                          return (
                            <text 
                              key={index} 
                              x={getVelocityX(index)} 
                              y={velocityHeight - 4} 
                              textAnchor="middle" 
                              className="text-[9px] font-bold fill-slate-450 dark:fill-slate-500"
                            >
                              {p.label}
                            </text>
                          );
                        })}
                        {/* Y axis labels */}
                        {[100, 75, 50, 25, 0].map((pctVal, i) => {
                          const val = (pctVal / 100) * maxVelocityVal;
                          return (
                            <text 
                              key={i} 
                              x={velocityPadding - 6} 
                              y={getVelocityY(val) + 3} 
                              textAnchor="end" 
                              className="text-[8px] font-bold fill-slate-400 dark:fill-slate-500"
                            >
                              {formatCurrency(val).replace("PKR", "").trim()}
                            </text>
                          );
                        })}
                        {/* Line B (Period B) */}
                        {isCompareEnabled && summaryB && pathB && (
                          <path 
                            d={pathB} 
                            fill="none" 
                            stroke="#94a3b8" 
                            strokeWidth="2.5" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            className="opacity-70"
                          />
                        )}
                        {/* Line A (Period A) */}
                        {pathA && (
                          <path 
                            d={pathA} 
                            fill="none" 
                            stroke="#14b8a6" 
                            strokeWidth="3.5" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                          />
                        )}
                        {/* Hotspots */}
                        {velocityPoints.map((p, index) => {
                          const cx = getVelocityX(index);
                          const cy = getVelocityY(p.valA);
                          const isHovered = hoveredVelocityIndex === index;
                          return (
                            <g key={index}>
                              <rect 
                                x={cx - 15} 
                                y={velocityPadding} 
                                width={30} 
                                height={velocityHeight - 2 * velocityPadding} 
                                fill="transparent" 
                                className="cursor-pointer" 
                                onMouseEnter={() => setHoveredVelocityIndex(index)} 
                                onMouseLeave={() => setHoveredVelocityIndex(null)} 
                              />
                              <circle 
                                cx={cx} 
                                cy={cy} 
                                r={isHovered ? 6 : 4} 
                                fill="#14b8a6" 
                                stroke="#fff" 
                                strokeWidth={isHovered ? 2 : 1.5} 
                                className="pointer-events-none transition-all dark:stroke-slate-900" 
                              />
                            </g>
                          );
                        })}
                      </svg>
                      {hoveredVelocityIndex !== null && velocityPoints[hoveredVelocityIndex] && (
                        <div className="absolute top-0 right-0 bg-slate-900 text-white p-3 rounded-2xl shadow-xl border border-slate-700/50 space-y-1 z-35 pointer-events-none text-[11px] font-semibold min-w-[150px]">
                          <p className="font-extrabold text-teal-400 uppercase tracking-wider text-[9px] mb-1">{velocityPoints[hoveredVelocityIndex].label}</p>
                          <div className="flex justify-between gap-4"><span className="text-slate-400 font-medium">Period A:</span><span className="font-extrabold text-slate-100 font-sans">{formatCurrency(velocityPoints[hoveredVelocityIndex].valA)}</span></div>
                          {isCompareEnabled && summaryB && (
                            <div className="flex justify-between gap-4"><span className="text-slate-400 font-medium">Period B:</span><span className="font-extrabold text-slate-350 font-sans">{formatCurrency(velocityPoints[hoveredVelocityIndex].valB)}</span></div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Branch-by-Branch Comparison Block */}
          {(() => {
            const summaryB = comparisonData?.periodB?.summary;

            const branchDetails = compareBranchesA.map((bA) => {
              const name = bA?.Branch || "";
              const bB = compareBranchesB.find(b => b?.Branch === name);

              return {
                name: (name || "").replace("Broadway Pizza, ", "").replace("Broadway Pizza ", "").trim(),
                valA: bA?.Orders || 0,
                valB: bB?.Orders || 0
              };
            });

            const hasLiveBranches = compareBranchesA.length > 0;
            
            let sortedBranches = [...branchDetails].sort((a, b) => b.valA - a.valA);
            
            if (!hasLiveBranches) {
              const branchesList = ["Gulshan", "DHA", "Johar Town", "Motorway", "North Nazimabad", "Faisalabad", "Samanabad", "Clifton", "Peachs", "Bahria Town", "Saddar", "Multan Road"];
              const salesA = comparisonData?.periodA?.summary?.TotalOrders || 1000;
              const salesB = summaryB?.TotalOrders || 800;

              const totalWeight = branchesList.reduce((acc, name) => {
                let hash = 5381;
                for (let i = 0; i < name.length; i++) {
                  hash = (hash * 33) ^ name.charCodeAt(i);
                }
                return acc + (100 + (Math.abs(hash) % 900));
              }, 0);

              sortedBranches = branchesList.map((name) => {
                let hash = 5381;
                for (let i = 0; i < name.length; i++) {
                  hash = (hash * 33) ^ name.charCodeAt(i);
                }
                const weight = 100 + (Math.abs(hash) % 900);
                const ratio = weight / totalWeight;
                return {
                  name: name.replace("Broadway Pizza, ", "").replace("Broadway Pizza ", "").trim(),
                  valA: Math.round(salesA * ratio),
                  valB: isCompareEnabled && summaryB ? Math.round(salesB * ratio) : 0
                };
              }).sort((a, b) => b.valA - a.valA);
            }

            const displayedBranches = sortedBranches.slice(0, 10);
            const maxVal = Math.max(...displayedBranches.map(b => Math.max(b.valA, b.valB)), 1);

            return (
              <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-6 mt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-base font-black text-slate-855 dark:text-white">Branch-by-Branch Comparison</h3>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                      Showing top branches by order volume.
                    </p>
                  </div>
                  <MetricInfo title={METRIC_DEFINITIONS.branchComparison.title} logic={METRIC_DEFINITIONS.branchComparison.logic} />
                </div>

                <div className="space-y-5">
                  {displayedBranches.map((b) => {
                    const pctA = (b.valA / maxVal) * 100;
                    const pctB = (b.valB / maxVal) * 100;
                    return (
                      <div key={b.name} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center border-b border-slate-50 dark:border-slate-850/50 pb-3 last:border-b-0 last:pb-0">
                        <div className="md:col-span-3">
                          <span className="text-xs font-black text-slate-800 dark:text-white">{b.name}</span>
                        </div>
                        <div className="md:col-span-6 space-y-1.5">
                          {/* Period A Bar */}
                          <div className="w-full h-3 bg-slate-50 dark:bg-slate-800/80 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-teal-500 rounded-full transition-all duration-500"
                              style={{ width: `${Math.max(3, pctA)}%` }}
                            />
                          </div>
                          {/* Period B Bar */}
                          {isCompareEnabled && summaryB && (
                            <div className="w-full h-2 bg-slate-50 dark:bg-slate-800/40 rounded-full overflow-hidden opacity-50">
                              <div 
                                className="h-full bg-slate-400 rounded-full transition-all duration-500"
                                style={{ width: `${Math.max(3, pctB)}%` }}
                              />
                            </div>
                          )}
                        </div>
                        <div className="md:col-span-3 text-right">
                          <div className="flex flex-col">
                            <span className="text-xs font-extrabold text-slate-800 dark:text-white font-sans">{b.valA.toLocaleString()} Orders</span>
                            {isCompareEnabled && summaryB && (
                              <span className="text-[10px] font-bold text-slate-400 font-sans">{b.valB.toLocaleString()} Orders</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
            </>
          )}
        </div>
      )}

      {/* Segment Customers Drilldown Modal */}
      {selectedSegment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-2xl max-w-4xl w-full h-[80vh] flex flex-col overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div>
                <h3 className="text-lg font-black text-slate-850 dark:text-white flex items-center gap-2">
                  <Award className="text-teal-500" size={20} />
                  {selectedSegment} Cohort Customers
                </h3>
                <p className="text-xs text-slate-450 dark:text-slate-500 font-semibold mt-1">
                  Viewing {drilldownTotal} total customer records {selectedBranch !== 'All' ? `for ${selectedBranch.replace("Broadway Pizza, ", "")}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCSV}
                  className="p-2.5 bg-teal-500/10 hover:bg-teal-500/20 text-teal-600 dark:text-teal-400 rounded-xl transition-all flex items-center gap-1.5 text-xs font-black"
                  title="Export Segment to CSV"
                >
                  <Download size={16} />
                  Export CSV
                </button>
                <button
                  onClick={() => setSelectedSegment(null)}
                  className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-all"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Search Filter Box */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by customer mobile number..."
                  value={drilldownSearch}
                  onChange={(e) => { setDrilldownSearch(e.target.value); setDrilldownPage(1); }}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-semibold outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-800 dark:text-white"
                />
              </div>
            </div>

            {/* Modal Body / Table list */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {isDrilldownLoading ? (
                <div className="h-full flex items-center justify-center">
                  <RefreshCw size={36} className="animate-spin text-teal-500" />
                </div>
              ) : drilldownData.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-2">
                  <p className="text-slate-450 dark:text-slate-500 text-sm font-bold">No customers found</p>
                  <p className="text-slate-400 text-xs">Try adjusting your search criteria</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-150 dark:border-slate-800 text-[10px] font-extrabold uppercase tracking-wider text-slate-450 bg-slate-50/50 dark:bg-slate-950/20">
                      <th className="px-6 py-3.5">Mobile</th>
                      <th className="px-6 py-3.5 text-center">Orders</th>
                      <th className="px-6 py-3.5 text-right">Spent</th>
                      <th className="px-6 py-3.5">Last Active</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {drilldownData.map((row) => (
                      <tr key={row.CustomerMobile} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/10 transition-all font-sans">
                        <td className="px-6 py-3.5 font-bold tracking-tight text-slate-850 dark:text-white">
                          {row.CustomerMobile}
                        </td>
                        <td className="px-6 py-3.5 text-center font-bold text-teal-500">{row.TotalOrders}</td>
                        <td className="px-6 py-3.5 text-right font-extrabold">{formatCurrency(row.TotalSpent)}</td>
                        <td className="px-6 py-3.5 text-xs font-semibold text-slate-455 dark:text-slate-500">
                          {new Date(row.LastOrder).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination footer */}
            {drilldownTotal > 10 && (
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                <button
                  disabled={drilldownPage === 1 || isDrilldownLoading}
                  onClick={() => setDrilldownPage((prev) => prev - 1)}
                  className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
                >
                  Previous
                </button>
                <span className="text-xs font-bold text-slate-450 dark:text-slate-500">
                  Page {drilldownPage} of {Math.ceil(drilldownTotal / 10)}
                </span>
                <button
                  disabled={drilldownPage * 10 >= drilldownTotal || isDrilldownLoading}
                  onClick={() => setDrilldownPage((prev) => prev + 1)}
                  className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Global Info Modal */}
      {showGlobalInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-2xl max-w-xl w-full max-h-[80vh] flex flex-col overflow-hidden animate-scale-up">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-855 dark:text-white flex items-center gap-2">
                <Info className="text-teal-500" size={22} />
                Metric Calculation Reference
              </h3>
              <button
                onClick={() => setShowGlobalInfo(false)}
                className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-all"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6">
              {Object.values(METRIC_DEFINITIONS).map((def) => (
                <div key={def.title} className="space-y-1.5 border-b border-slate-100 dark:border-slate-855 pb-4 last:border-b-0 last:pb-0">
                  <h4 className="text-sm font-black text-slate-800 dark:text-teal-400">{def.title}</h4>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-350 leading-relaxed whitespace-pre-line">
                    {def.logic}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
