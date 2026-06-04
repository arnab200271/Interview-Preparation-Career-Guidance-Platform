"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch, useAppselector } from "@/Redux/hooks/hooks";
import { logout, getAllCategory, getAdminAnalytics, getAllUsersThunk } from "@/Redux/slice/slice";
import Category from "@/components/category/Category";
import Test from "@/components/test/Test";

// React Icons
import {
  FiGrid,
  FiLogOut,
  FiChevronRight,
  FiUsers,
  FiLayers,
  FiActivity,
  FiMenu,
  FiX,
  FiHelpCircle,
} from "react-icons/fi";
import { MdCategory } from "react-icons/md";
import { RiShieldUserLine, RiMailLine, RiDashboardLine } from "react-icons/ri";
import { TbBolt } from "react-icons/tb";
import Question from "@/components/question/Question";
import CodingTest from "@/components/codingTest/Codingtest";
import Codingquestion from "@/components/codingquestion/Codingquestion";

// ─── Animation Variants ───────────────────────────────────────────────────────
const sidebarVariants = {
  hidden: { x: -300, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 30,
      staggerChildren: 0.08,
    },
  },
};

const menuItemVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

const contentVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.98,
    transition: { duration: 0.3 },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

// ─── Sidebar Menu Items & Configurations ──────────────────────────────────────
const MENU_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    subtitle: "Overview & analytics",
    icon: RiDashboardLine,
    title: "Dashboard",
    getSubtitle: (user) => `Welcome back, ${user?.name || "Admin"} 👋`,
  },
  {
    id: "categories",
    label: "Category Management",
    subtitle: "Manage all categories",
    icon: MdCategory,
    title: "Category Management",
    getSubtitle: () => "Create and manage interview categories",
  },
  {
    id: "tests",
    label: "Test Management",
    subtitle: "Manage all tests",
    icon: FiLayers,
    title: "Test Management",
    getSubtitle: () => "Create and manage interview tests",
  },
  {
    id: "question",
    label: "Question Management",
    subtitle: "Manage all question",
    icon: FiHelpCircle,
    title: "Test Management",
    getSubtitle: () => "Create and manage interview tests",
  },
  {
    id: "codingtest",
    label: "Codingtest Management",
    subtitle: "Manage all coding test",
    icon: FiHelpCircle,
    title: "Test Management",
    getSubtitle: () => "Create and manage interview tests",
  },
  {
    id: "codingqustion",
    label: "Codingquestion Management",
    subtitle: "Manage all coding question",
    icon: FiHelpCircle,
    title: "Test Management",
    getSubtitle: () => "Create and manage interview tests",
  },
  {
    id: "users",
    label: "User Management",
    subtitle: "Monitor registered users",
    icon: FiUsers,
    title: "User Management",
    getSubtitle: () => "List of all registered candidates",
  },
];

// ─── Loading Spinner ──────────────────────────────────────────────────────────
function AdminLoadingScreen() {
  return (
    <div className="min-h-screen bg-[#020817] flex items-center justify-center">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/8 blur-[160px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex flex-col items-center gap-6"
      >
        {/* Spinning rings */}
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-cyan-500 animate-spin" />
          <div
            className="absolute inset-2 rounded-full border-[3px] border-transparent border-t-blue-500 animate-spin"
            style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
          />
          <div
            className="absolute inset-4 rounded-full border-[3px] border-transparent border-t-cyan-400 animate-spin"
            style={{ animationDuration: "2s" }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <FiGrid className="text-cyan-400 text-xl" />
          </div>
        </div>

        <div className="text-center">
          <h3 className="text-white text-lg font-semibold">
            Loading Admin Panel
          </h3>
          <p className="text-gray-500 text-sm mt-1">Verifying credentials...</p>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Admin Avatar ─────────────────────────────────────────────────────────────
function AdminAvatar({ user, size = "md" }) {
  const sizeClasses = {
    sm: "w-9 h-9 text-sm rounded-xl",
    md: "w-12 h-12 text-lg rounded-2xl",
    lg: "w-20 h-20 text-2xl rounded-3xl",
  };

  if (user?.profileImage) {
    return (
      <img
        src={user.profileImage}
        alt={user.name || "Admin"}
        className={`${sizeClasses[size]} object-cover ring-2 ring-cyan-500/30`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold ring-2 ring-cyan-500/30 shadow-lg shadow-cyan-500/20`}
    >
      {user?.name?.[0]?.toUpperCase() || "A"}
    </div>
  );
}

// ─── Dashboard Skeleton Loader ────────────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Welcome Card Shimmer */}
      <div className="rounded-3xl border border-white/5 bg-[#081120]/40 p-8 h-48 flex items-center gap-6">
        <div className="w-20 h-20 bg-white/[0.04] rounded-3xl" />
        <div className="flex-1 space-y-3">
          <div className="h-6 bg-white/[0.04] rounded-md w-1/3" />
          <div className="h-4 bg-white/[0.04] rounded-md w-2/3" />
          <div className="flex gap-3 pt-2">
            <div className="h-6 bg-white/[0.04] rounded-full w-24" />
            <div className="h-6 bg-white/[0.04] rounded-full w-20" />
          </div>
        </div>
      </div>

      {/* Stats Cards Shimmer */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="rounded-2xl border border-white/5 bg-[#081120]/30 p-6 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-white/[0.04]" />
            <div className="space-y-2">
              <div className="h-3 bg-white/[0.04] rounded w-2/3" />
              <div className="h-6 bg-white/[0.04] rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>

      {/* Row 1 Charts Shimmer */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-3xl border border-white/5 bg-[#081120]/30 p-8 h-[320px] space-y-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/[0.04]" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-white/[0.04] rounded w-1/4" />
                <div className="h-3 bg-white/[0.04] rounded w-1/3" />
              </div>
            </div>
            <div className="h-40 bg-white/[0.02] rounded-2xl w-full" />
          </div>
        ))}
      </div>

      {/* Row 2 Charts Shimmer */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-3xl border border-white/5 bg-[#081120]/30 p-8 h-[240px] space-y-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/[0.04]" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-white/[0.04] rounded w-1/4" />
                <div className="h-3 bg-white/[0.04] rounded w-1/3" />
              </div>
            </div>
            <div className="h-28 bg-white/[0.02] rounded-2xl w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Custom Animated SVG Line Chart (Trends) ──────────────────────────────────
function LineChart({ data }) {
  if (!data || data.length === 0) return <div className="text-gray-500 text-sm">No trend data available</div>;

  const width = 500;
  const height = 200;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 35;

  const maxVal = Math.max(...data.map(d => d.count), 4);
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const points = data.map((d, i) => {
    const x = paddingLeft + (i * chartWidth) / (data.length - 1);
    const y = height - paddingBottom - (d.count * chartHeight) / maxVal;
    return { x, y, label: d.label, count: d.count };
  });

  const linePath = points.reduce((path, p, i) => {
    return path + (i === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`);
  }, "");

  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`
    : "";

  return (
    <div className="relative w-full h-48">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="stroke-gradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
          const y = paddingTop + ratio * chartHeight;
          const val = Math.round(maxVal * (1 - ratio));
          return (
            <g key={index}>
              <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
              <text x={paddingLeft - 10} y={y + 4} textAnchor="end" className="text-[10px] fill-gray-500 font-medium">{val}</text>
            </g>
          );
        })}

        {/* Area under curve */}
        {areaPath && <path d={areaPath} fill="url(#area-gradient)" />}

        {/* Path line */}
        {linePath && (
          <motion.path
            d={linePath}
            fill="none"
            stroke="url(#stroke-gradient)"
            strokeWidth={3}
            filter="url(#neon-glow)"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        )}

        {/* Glowing dots with hover state */}
        {points.map((p, i) => (
          <g key={i} className="group cursor-pointer">
            <circle cx={p.x} cy={p.y} r={4} className="fill-[#020817] stroke-cyan-400 stroke-2 transition-all duration-200 group-hover:r-5 group-hover:stroke-white" />
            
            {/* Tooltip Overlay */}
            <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <rect x={p.x - 30} y={p.y - 32} width="60" height="20" rx="6" fill="#0f172a" stroke="rgba(6, 182, 212, 0.4)" strokeWidth="1" />
              <text x={p.x} y={p.y - 18} textAnchor="middle" className="text-[10px] font-bold fill-cyan-400">{p.count} Qs</text>
            </g>
          </g>
        ))}

        {/* X Axis Labels */}
        {points.map((p, i) => (
          <text key={i} x={p.x} y={height - 10} textAnchor="middle" className="text-[10px] fill-gray-400 font-semibold">{p.label}</text>
        ))}
      </svg>
    </div>
  );
}

// ─── Custom Animated SVG Bar Chart (User Activity) ────────────────────────────
function BarChart({ data }) {
  if (!data || data.length === 0) return <div className="text-gray-500 text-sm">No activity data available</div>;

  const width = 500;
  const height = 200;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 35;

  const maxVal = Math.max(...data.flatMap(d => [d.registrations, d.attempts, d.submissions]), 4);
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;
  const groupWidth = chartWidth / data.length;

  const barWidth = 7;
  const gap = 2;

  return (
    <div className="relative w-full h-48">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
          const y = paddingTop + ratio * chartHeight;
          const val = Math.round(maxVal * (1 - ratio));
          return (
            <g key={index}>
              <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
              <text x={paddingLeft - 10} y={y + 4} textAnchor="end" className="text-[10px] fill-gray-500 font-medium">{val}</text>
            </g>
          );
        })}

        {/* Grouped Bars */}
        {data.map((d, i) => {
          const xCenter = paddingLeft + i * groupWidth + groupWidth / 2;

          const barData = [
            { key: "registrations", val: d.registrations, color: "#a855f7", label: "Registrations" },
            { key: "attempts", val: d.attempts, color: "#3b82f6", label: "MCQ Attempts" },
            { key: "submissions", val: d.submissions, color: "#06b6d4", label: "Coding Submissions" }
          ];

          return (
            <g key={i} className="group">
              {barData.map((bar, idx) => {
                const h = (bar.val * chartHeight) / maxVal;
                const x = xCenter + (idx - 1) * (barWidth + gap) - barWidth / 2;
                const y = height - paddingBottom - h;

                return (
                  <g key={bar.key} className="cursor-pointer">
                    <motion.rect
                      x={x}
                      y={height - paddingBottom}
                      width={barWidth}
                      rx={2}
                      ry={2}
                      fill={bar.color}
                      className="transition-all duration-200 hover:brightness-125"
                      initial={{ y: height - paddingBottom, height: 0 }}
                      animate={{ y, height: h }}
                      transition={{ duration: 1, ease: "easeOut", delay: i * 0.05 }}
                    />
                    {/* Tooltip Overlay */}
                    <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      <rect x={x - 45} y={y - 30} width="98" height="22" rx="6" fill="#0f172a" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                      <text x={x} y={y - 15} textAnchor="middle" className="text-[9px] font-bold fill-white">{bar.label}: {bar.val}</text>
                    </g>
                  </g>
                );
              })}
            </g>
          );
        })}

        {/* X Axis Labels */}
        {data.map((d, i) => {
          const xCenter = paddingLeft + i * groupWidth + groupWidth / 2;
          return (
            <text key={i} x={xCenter} y={height - 10} textAnchor="middle" className="text-[10px] fill-gray-400 font-semibold">{d.label}</text>
          );
        })}
      </svg>
    </div>
  );
}

// ─── Custom Responsive SVG Doughnut Chart (Difficulty) ─────────────────────────
function DoughnutChart({ data }) {
  if (!data || data.length === 0) return <div className="text-gray-500 text-sm">No data available</div>;

  const total = data.reduce((sum, d) => sum + d.count, 0);
  const r = 50;
  const C = 2 * Math.PI * r;

  const colors = {
    "Easy": "#10b981",
    "Medium": "#f59e0b",
    "Hard": "#ef4444"
  };

  let accumulatedPercent = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 justify-center py-2">
      <div className="relative w-36 h-36 flex-shrink-0">
        <svg viewBox="0 0 140 140" className="w-full h-full overflow-visible">
          {total === 0 ? (
            <circle cx="70" cy="70" r="50" fill="transparent" stroke="rgba(255,255,255,0.06)" strokeWidth="13" />
          ) : (
            data.map((d, i) => {
              const pct = d.count / total;
              const strokeLength = pct * C;
              const strokeOffset = accumulatedPercent * C;
              accumulatedPercent += pct;
              const color = colors[d.name] || "#64748b";

              return (
                <circle
                  key={i}
                  cx="70"
                  cy="70"
                  r="50"
                  fill="transparent"
                  stroke={color}
                  strokeWidth="13"
                  strokeDasharray={`${strokeLength} ${C - strokeLength}`}
                  strokeDashoffset={-strokeOffset}
                  transform="rotate(-90 70 70)"
                  className="transition-all duration-300 hover:stroke-[15] cursor-pointer"
                />
              );
            })
          )}
          <circle cx="70" cy="70" r="43" fill="#081120" />
          <g className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <text x="70" y="68" textAnchor="middle" className="text-[10px] fill-gray-400 font-semibold tracking-wider uppercase">Questions</text>
            <text x="70" y="85" textAnchor="middle" className="text-xl font-extrabold fill-white">{total}</text>
          </g>
        </svg>
      </div>

      <div className="flex flex-col gap-2 text-xs w-full sm:w-auto">
        {data.map((d, i) => {
          const color = colors[d.name] || "#64748b";
          const pct = total > 0 ? Math.round((d.count / total) * 100) : 0;
          return (
            <div key={i} className="flex items-center gap-3 text-gray-300 font-semibold">
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
              <span className="min-w-[60px]">{d.name}</span>
              <span className="text-gray-500 font-bold">{pct}%</span>
              <span className="text-white bg-white/[0.04] px-2.5 py-0.5 rounded-full border border-white/[0.06] text-[10px] ml-auto">{d.count} Qs</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Custom Responsive SVG Pie Chart (Submission Verdict) ──────────────────────
function PieChart({ data }) {
  if (!data || data.length === 0) return <div className="text-gray-500 text-sm">No submission data available</div>;

  const total = data.reduce((sum, d) => sum + d.count, 0);
  const r = 50;
  const C = 2 * Math.PI * r;

  const colors = {
    "ACCEPTED": "#10b981",
    "PARTIALLY ACCEPTED": "#34d399",
    "WRONG ANSWER": "#ef4444",
    "COMPILE ERROR": "#f59e0b",
    "RUNTIME ERROR": "#f43f5e",
    "TIME LIMIT EXCEEDED": "#ec4899",
    "MEMORY LIMIT EXCEEDED": "#8b5cf6",
    "NONE": "#64748b"
  };

  const defaultColors = ["#3b82f6", "#06b6d4", "#a855f7", "#ec4899", "#10b981", "#f59e0b", "#ef4444", "#64748b"];

  let accumulatedPercent = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 justify-center py-2">
      <div className="relative w-36 h-36 flex-shrink-0">
        <svg viewBox="0 0 140 140" className="w-full h-full overflow-visible">
          {total === 0 ? (
            <circle cx="70" cy="70" r="50" fill="transparent" stroke="rgba(255,255,255,0.06)" strokeWidth="13" />
          ) : (
            data.map((d, i) => {
              const pct = d.count / total;
              const strokeLength = pct * C;
              const strokeOffset = accumulatedPercent * C;
              accumulatedPercent += pct;
              const color = colors[d.name] || defaultColors[i % defaultColors.length];

              return (
                <circle
                  key={i}
                  cx="70"
                  cy="70"
                  r="50"
                  fill="transparent"
                  stroke={color}
                  strokeWidth="13"
                  strokeDasharray={`${strokeLength} ${C - strokeLength}`}
                  strokeDashoffset={-strokeOffset}
                  transform="rotate(-90 70 70)"
                  className="transition-all duration-300 hover:stroke-[15] cursor-pointer"
                />
              );
            })
          )}
          <circle cx="70" cy="70" r="43" fill="#081120" />
          <g className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <text x="70" y="68" textAnchor="middle" className="text-[10px] fill-gray-400 font-semibold tracking-wider uppercase">Submissions</text>
            <text x="70" y="85" textAnchor="middle" className="text-xl font-extrabold fill-white">{total}</text>
          </g>
        </svg>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-2 text-xs w-full">
        {data.map((d, i) => {
          const color = colors[d.name] || defaultColors[i % defaultColors.length];
          const pct = total > 0 ? Math.round((d.count / total) * 100) : 0;
          return (
            <div key={i} className="flex items-center gap-2 text-gray-300 font-semibold truncate" title={d.name}>
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
              <span className="truncate max-w-[80px]">{d.name}</span>
              <span className="text-gray-500 font-bold ml-auto">{pct}% ({d.count})</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Dashboard Content ────────────────────────────────────────────────────────
function DashboardContent({ user, analyticsData, analyticsLoading, analyticsError }) {
  if (analyticsLoading) {
    return <DashboardSkeleton />;
  }

  if (analyticsError || !analyticsData) {
    return (
      <div className="p-8 rounded-3xl border border-red-500/10 bg-red-500/[0.02] backdrop-blur-xl text-center">
        <h3 className="text-red-400 font-bold text-lg mb-2">Error Loading Analytics</h3>
        <p className="text-gray-400 text-sm max-w-md mx-auto">
          {analyticsError || "Failed to retrieve real-time statistics from the database. Please verify backend connection and try again."}
        </p>
      </div>
    );
  }

  const {
    summary,
    testTrends,
    userActivity,
    difficultyDistribution,
    submissionVerdict,
    recentMcqAttempts,
    recentCodingSubmissions
  } = analyticsData;

  const statCards = [
    {
      label: "Total Users",
      value: summary?.totalUsers || 0,
      icon: FiUsers,
      color: "violet",
      gradient: "from-violet-500/15 to-violet-500/5",
      border: "border-violet-500/20",
      iconBg: "bg-violet-500/10",
      textColor: "text-violet-400",
    },
    {
      label: "Total Tests",
      value: summary?.totalTests || 0,
      icon: FiLayers,
      color: "blue",
      gradient: "from-blue-500/15 to-blue-500/5",
      border: "border-blue-500/20",
      iconBg: "bg-blue-500/10",
      textColor: "text-blue-400",
    },
    {
      label: "Total Questions",
      value: summary?.totalQuestions || 0,
      icon: FiHelpCircle,
      color: "amber",
      gradient: "from-amber-500/15 to-amber-500/5",
      border: "border-amber-500/20",
      iconBg: "bg-amber-500/10",
      textColor: "text-amber-400",
    },
    {
      label: "Published Tests",
      value: summary?.publishedTests || 0,
      icon: FiActivity,
      color: "emerald",
      gradient: "from-emerald-500/15 to-emerald-500/5",
      border: "border-emerald-500/20",
      iconBg: "bg-emerald-500/10",
      textColor: "text-emerald-400",
    },
    {
      label: "Active Users",
      value: summary?.activeUsers || 0,
      icon: FiGrid,
      color: "cyan",
      gradient: "from-cyan-500/15 to-cyan-500/5",
      border: "border-cyan-500/20",
      iconBg: "bg-cyan-500/10",
      textColor: "text-cyan-400",
    },
  ];

  const getVerdictBadge = (verdict) => {
    const v = verdict ? verdict.toLowerCase() : "none";
    if (v === "accepted") {
      return (
        <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
          Accepted
        </span>
      );
    }
    if (v === "partially_accepted") {
      return (
        <span className="bg-teal-500/10 border border-teal-500/20 text-teal-400 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
          Partial
        </span>
      );
    }
    if (v === "wrong_answer") {
      return (
        <span className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
          Wrong Ans
        </span>
      );
    }
    if (v === "runtime_error" || v === "compile_error") {
      return (
        <span className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
          Error
        </span>
      );
    }
    return (
      <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
        {v.replace(/_/g, " ")}
      </span>
    );
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Welcome Card */}
      <motion.div
        variants={cardVariants}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#081120]/70 backdrop-blur-xl p-8 lg:p-10"
      >
        {/* Inner gradient glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.04] via-transparent to-blue-500/[0.04]" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 blur-[100px] rounded-full" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center gap-6">
          <AdminAvatar user={user} size="lg" />

          <div className="flex-1">
            <h1 className="text-3xl lg:text-4xl font-extrabold text-white mb-2">
              Welcome back, {user?.name || "Admin"} 👋
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed max-w-2xl">
              Track platform metrics, user attempts, system statistics, and coordinate all interview modules from your real-time analytics panel.
            </p>

            {/* Info badges */}
            <div className="flex flex-wrap items-center gap-3 mt-5">
              <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-1.5">
                <RiMailLine className="text-cyan-400 text-sm" />
                <span className="text-cyan-400 text-sm font-medium">
                  {user?.email || "admin@email.com"}
                </span>
              </div>

              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5">
                <RiShieldUserLine className="text-blue-400 text-sm" />
                <span className="text-blue-400 text-sm font-medium capitalize">
                  {user?.role || "Admin"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Dynamic Enhanced Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            variants={cardVariants}
            whileHover={{ scale: 1.03, y: -4 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={`relative overflow-hidden rounded-2xl border ${card.border} bg-gradient-to-br ${card.gradient} backdrop-blur-xl p-6 cursor-default group`}
          >
            {/* Hover glow */}
            <div
              className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${card.gradient}`}
            />

            <div className="relative z-10">
              <div
                className={`w-11 h-11 rounded-2xl ${card.iconBg} border ${card.border} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
              >
                <card.icon className={`${card.textColor} text-lg`} />
              </div>

              <p className="text-gray-400 text-sm mb-1">{card.label}</p>
              <p className={`text-3xl font-extrabold text-white`}>
                {card.value}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Row 1 Charts (Line Chart & Bar Chart) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Line Chart */}
        <motion.div
          variants={cardVariants}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#081120]/50 backdrop-blur-xl p-6 lg:p-8"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.01] to-blue-500/[0.01]" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <FiActivity className="text-cyan-400 text-base" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Test Publishing Trends</h2>
                <p className="text-gray-500 text-xs">Number of published tests over the last 6 months</p>
              </div>
            </div>
            <LineChart data={testTrends} />
          </div>
        </motion.div>

        {/* Bar Chart */}
        <motion.div
          variants={cardVariants}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#081120]/50 backdrop-blur-xl p-6 lg:p-8"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.01] to-cyan-500/[0.01]" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <FiUsers className="text-purple-400 text-base" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">User Activity</h2>
                <p className="text-gray-500 text-xs">Monthly registrations, MCQ attempts & coding submissions</p>
              </div>
            </div>
            <BarChart data={userActivity} />
          </div>
        </motion.div>
      </div>

      {/* Row 2 Charts (Doughnut Chart & Pie Chart) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Doughnut Chart */}
        <motion.div
          variants={cardVariants}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#081120]/50 backdrop-blur-xl p-6 lg:p-8"
        >
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <FiHelpCircle className="text-emerald-400 text-base" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Question Difficulty</h2>
                <p className="text-gray-500 text-xs">Easy, Medium, and Hard distribution (MCQs + Coding)</p>
              </div>
            </div>
            <DoughnutChart data={difficultyDistribution} />
          </div>
        </motion.div>

        {/* Pie Chart */}
        <motion.div
          variants={cardVariants}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#081120]/50 backdrop-blur-xl p-6 lg:p-8"
        >
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <FiGrid className="text-cyan-400 text-base" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Submission Outcomes</h2>
                <p className="text-gray-500 text-xs">Coding tests evaluation final verdict ratios</p>
              </div>
            </div>
            <PieChart data={submissionVerdict} />
          </div>
        </motion.div>
      </div>

      {/* Recent Submissions & MCQ Attempts Feed */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* MCQ Attempts */}
        <motion.div
          variants={cardVariants}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#081120]/50 backdrop-blur-xl p-6 lg:p-8"
        >
          <div className="relative z-10">
            <h2 className="text-lg font-bold text-white mb-4">Latest MCQ Attempts</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/[0.06] text-gray-500 font-semibold">
                    <th className="pb-3">Candidate</th>
                    <th className="pb-3">Test</th>
                    <th className="pb-3">Score</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {recentMcqAttempts.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-6 text-gray-500">No MCQ attempts registered yet</td>
                    </tr>
                  ) : (
                    recentMcqAttempts.map((item, index) => (
                      <tr key={index} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 pr-2 font-medium text-white">
                          <div className="font-semibold text-gray-200">{item.user?.name || "Candidate"}</div>
                          <div className="text-[10px] text-gray-500">{item.user?.email || "anonymous"}</div>
                        </td>
                        <td className="py-3.5 text-gray-400 font-medium">
                          {item.test?.title || "Deleted Test"}
                        </td>
                        <td className="py-3.5 text-gray-300 font-bold">
                          {item.score}/{item.totalQuestions} ({Math.round(item.percentage)}%)
                        </td>
                        <td className="py-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            item.status === "pass" 
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                              : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                          }`}>
                            {item.status || "fail"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* Coding Submissions */}
        <motion.div
          variants={cardVariants}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#081120]/50 backdrop-blur-xl p-6 lg:p-8"
        >
          <div className="relative z-10">
            <h2 className="text-lg font-bold text-white mb-4">Latest Coding Submissions</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/[0.06] text-gray-500 font-semibold">
                    <th className="pb-3">Candidate</th>
                    <th className="pb-3">Question</th>
                    <th className="pb-3">Score</th>
                    <th className="pb-3">Verdict</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {recentCodingSubmissions.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-6 text-gray-500">No coding submissions registered yet</td>
                    </tr>
                  ) : (
                    recentCodingSubmissions.map((item, index) => (
                      <tr key={index} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 pr-2 font-medium text-white">
                          <div className="font-semibold text-gray-200">{item.user?.name || "Candidate"}</div>
                          <div className="text-[10px] text-gray-500">{item.user?.email || "anonymous"}</div>
                        </td>
                        <td className="py-3.5 text-gray-400 font-medium">
                          <div className="truncate max-w-[120px] font-semibold text-gray-300" title={item.question?.title || "Question"}>
                            {item.question?.title || "Deleted Question"}
                          </div>
                          <div className="text-[10px] text-gray-500">{item.codingTest?.title || "Coding Module"}</div>
                        </td>
                        <td className="py-3.5 text-gray-300 font-bold">
                          {item.score}/{item.totalMarks} ({Math.round(item.percentage)}%)
                        </td>
                        <td className="py-3.5">
                          {getVerdictBadge(item.finalResult)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── User Management Content ──────────────────────────────────────────────────
function UsersContent() {
  const dispatch = useAppDispatch();
  const { users, usersLoading, usersError } = useAppselector(
    (state) => state.mainstore
  );

  useEffect(() => {
    dispatch(getAllUsersThunk());
  }, [dispatch]);

  if (usersLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-16 w-full bg-white/[0.02] border border-white/5 rounded-2xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (usersError) {
    return (
      <div className="p-8 rounded-3xl border border-red-500/10 bg-red-500/[0.02] backdrop-blur-xl text-center">
        <h3 className="text-red-400 font-bold text-lg mb-2">Error Loading Users</h3>
        <p className="text-gray-400 text-sm max-w-md mx-auto">{usersError}</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <motion.div
        variants={cardVariants}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#081120]/50 backdrop-blur-xl p-6 lg:p-8"
      >
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <FiUsers className="text-cyan-400 text-base" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Registered Users</h2>
              <p className="text-gray-500 text-xs">Total registered accounts on the platform: {users.length}</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.06] text-gray-400 text-xs font-semibold uppercase tracking-wider">
                <th className="pb-4 pt-2 px-4">Name</th>
                <th className="pb-4 pt-2 px-4">Email</th>
                <th className="pb-4 pt-2 px-4">Role</th>
                <th className="pb-4 pt-2 px-4">Status</th>
                <th className="pb-4 pt-2 px-4">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-sm">
              {users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500">
                    No registered users found
                  </td>
                </tr>
              ) : (
                users.map((item) => (
                  <tr
                    key={item._id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-4 px-4 font-medium text-white flex items-center gap-3">
                      {item.profileImage ? (
                        <img
                          src={item.profileImage}
                          alt={item.name}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-white/10"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs">
                          {item.name?.[0]?.toUpperCase() || "U"}
                        </div>
                      )}
                      <span className="font-semibold text-gray-200">
                        {item.name}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-300">
                      {item.email}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border ${
                          item.role === "admin"
                            ? "bg-purple-500/10 border-purple-500/20 text-purple-400"
                            : "bg-blue-500/10 border-blue-500/20 text-blue-400"
                        }`}
                      >
                        {item.role === "admin" ? (
                          <RiShieldUserLine size={10} className="inline mr-1" />
                        ) : null}
                        {item.role}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          item.isVerified
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                            : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.isVerified
                              ? "bg-emerald-400 animate-pulse"
                              : "bg-amber-400"
                          }`}
                        />
                        {item.isVerified ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-500 text-xs">
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Mobile Sidebar Drawer ────────────────────────────────────────────────────
function MobileSidebar({
  open,
  onClose,
  activeTab,
  setActiveTab,
  user,
  onLogout,
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed top-0 left-0 h-full w-[290px] z-50 bg-[#081120] border-r border-white/10 shadow-2xl shadow-black/80 flex flex-col lg:hidden"
          >
            <SidebarContent
              activeTab={activeTab}
              setActiveTab={(tab) => {
                setActiveTab(tab);
                onClose();
              }}
              user={user}
              onLogout={onLogout}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Sidebar Content (shared between desktop & mobile) ────────────────────────
function SidebarContent({ activeTab, setActiveTab, user, onLogout }) {
  return (
    <motion.div
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col h-full"
    >
      {/* Logo */}
      <div className="h-20 border-b border-white/[0.06] flex items-center px-7">
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: 10, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400 }}
            className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25"
          >
            <FiGrid className="text-white text-lg" />
          </motion.div>
          <div>
            <h1 className="text-white text-lg font-bold tracking-tight">
              Admin<span className="text-cyan-400">Panel</span>
            </h1>
            <p className="text-gray-500 text-[11px] tracking-wide">
              Management Dashboard
            </p>
          </div>
        </div>
      </div>

      {/* Admin profile card */}
      <div className="px-5 py-5">
        <motion.div
          variants={menuItemVariants}
          className="p-4 rounded-2xl bg-gradient-to-br from-cyan-500/[0.06] to-blue-500/[0.06] border border-white/[0.06]"
        >
          <div className="flex items-center gap-3">
            <AdminAvatar user={user} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="text-white font-semibold text-sm truncate">
                {user?.name || "Admin"}
              </p>
              <p className="text-gray-500 text-[11px] truncate">
                {user?.email || "admin@email.com"}
              </p>
            </div>
          </div>
          <div className="mt-3 inline-flex items-center gap-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-3 py-1">
            <RiShieldUserLine className="text-cyan-400 text-[10px]" />
            <span className="text-cyan-400 text-[10px] font-semibold uppercase tracking-wider capitalize">
              {user?.role || "Admin"}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Menu */}
      <div className="px-5 flex-1">
        <motion.p
          variants={menuItemVariants}
          className="text-gray-500 text-[10px] uppercase tracking-[3px] mb-4 px-3 font-semibold"
        >
          Main Menu
        </motion.p>

        <div className="space-y-2">
          {MENU_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <motion.button
                key={item.id}
                variants={menuItemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveTab(item.id)}
                className={`group w-full h-[68px] rounded-2xl flex items-center justify-between px-5 transition-all duration-300 relative overflow-hidden ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-500/15 to-blue-500/10 border border-cyan-500/25 shadow-lg shadow-cyan-500/10"
                    : "bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.05] hover:border-white/10"
                }`}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 rounded-r-full bg-gradient-to-b from-cyan-400 to-blue-500"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}

                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      isActive
                        ? "bg-cyan-500/15 border border-cyan-500/25"
                        : "bg-white/[0.04] border border-white/[0.06] group-hover:bg-white/[0.08]"
                    }`}
                  >
                    <item.icon
                      className={`text-lg transition-all duration-300 ${
                        isActive
                          ? "text-cyan-400"
                          : "text-gray-500 group-hover:text-gray-300"
                      }`}
                    />
                  </div>

                  <div className="text-left">
                    <h3
                      className={`font-semibold text-[13px] transition-colors duration-300 ${
                        isActive
                          ? "text-white"
                          : "text-gray-300 group-hover:text-white"
                      }`}
                    >
                      {item.label}
                    </h3>
                    <p className="text-gray-500 text-[11px] mt-0.5">
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                <FiChevronRight
                  className={`text-sm transition-all duration-300 ${
                    isActive
                      ? "text-cyan-400 translate-x-0"
                      : "text-gray-600 -translate-x-1 group-hover:translate-x-0 group-hover:text-gray-400"
                  }`}
                />
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Logout */}
      <div className="p-5 border-t border-white/[0.06]">
        <motion.button
          variants={menuItemVariants}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onLogout}
          className="group w-full h-[58px] rounded-2xl bg-red-500/[0.06] border border-red-500/15 flex items-center justify-between px-5 hover:bg-red-500/10 hover:border-red-500/30 transition-all duration-300"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/15 flex items-center justify-center group-hover:rotate-12 transition-all duration-300">
              <FiLogOut className="text-red-400 text-base" />
            </div>
            <div className="text-left">
              <h3 className="text-gray-300 font-semibold text-[13px] group-hover:text-white transition-colors">
                Logout
              </h3>
              <p className="text-gray-600 text-[11px]">Exit admin dashboard</p>
            </div>
          </div>
        </motion.button>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN ADMIN PANEL
// ═══════════════════════════════════════════════════════════════════════════════
export default function AdminPanel() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { 
    user, 
    isLoading, 
    categories, 
    analyticsData, 
    analyticsLoading, 
    analyticsError 
  } = useAppselector(
    (state) => state.mainstore,
  );

  const [activeTab, setActiveTab] = useState("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Fetch categories and analytics on mount
  useEffect(() => {
    dispatch(getAllCategory());
    dispatch(getAdminAnalytics());
  }, [dispatch]);

  // Route protection — redirect non-admin users
  useEffect(() => {
    if (isLoading) return;

    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.replace("/login");
      return;
    }

    if (user && user.role !== "admin") {
      router.replace("/");
      return;
    }

    if (user && user.role === "admin") {
      setAuthChecked(true);
    }
  }, [user, isLoading, router]);

  // Logout handler
  const handleLogout = () => {
    dispatch(logout());
    router.replace("/login");
  };

  if (!authChecked) {
    return <AdminLoadingScreen />;
  }

  // Determine current active item configuration for Topbar dynamic text
  const currentTabConfig =
    MENU_ITEMS.find((item) => item.id === activeTab) || MENU_ITEMS[0];

  return (
    <div
      className="min-h-screen bg-[#020817] flex overflow-hidden relative"
      style={{ fontFamily: "'Inter', 'Geist', sans-serif" }}
    >
      {/* ── Ambient Glow Effects ── */}
      <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-cyan-500/[0.06] blur-[160px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/[0.06] blur-[160px] rounded-full pointer-events-none" />
      <div className="fixed top-1/2 left-1/3 w-[300px] h-[300px] bg-purple-500/[0.03] blur-[120px] rounded-full pointer-events-none" />

      {/* ── Desktop Sidebar ── */}
      <div className="hidden lg:flex w-[290px] min-h-screen bg-[#081120] border-r border-white/[0.06] relative z-20 flex-shrink-0">
        <SidebarContent
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          user={user}
          onLogout={handleLogout}
        />
      </div>

      {/* ── Mobile Sidebar ── */}
      <MobileSidebar
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
      />

      {/* ── Content Area ── */}
      <div className="flex-1 relative z-10 min-h-screen flex flex-col">
        {/* Top Bar */}
        <div className="h-20 border-b border-white/[0.06] bg-[#081120]/40 backdrop-blur-2xl flex items-center justify-between px-6 lg:px-10 flex-shrink-0">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-gray-400 hover:text-white hover:bg-white/[0.08] transition-all"
            >
              <FiMenu className="text-lg" />
            </motion.button>

            <div>
              <h2 className="text-white text-xl lg:text-2xl font-bold">
                {currentTabConfig.title}
              </h2>
              <p className="text-gray-500 text-sm mt-0.5">
                {currentTabConfig.getSubtitle(user)}
              </p>
            </div>
          </div>

          {/* Right side — profile */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <h3 className="text-white font-semibold text-sm">
                {user?.name || "Admin"}
              </h3>
              <p className="text-gray-500 text-xs capitalize">
                {user?.role || "Admin"}
              </p>
            </div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <AdminAvatar user={user} size="sm" />
            </motion.div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10">
          <AnimatePresence mode="wait">
            {activeTab === "dashboard" && (
              <motion.div
                key="dashboard"
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <DashboardContent
                  user={user}
                  analyticsData={analyticsData}
                  analyticsLoading={analyticsLoading}
                  analyticsError={analyticsError}
                />
              </motion.div>
            )}

            {activeTab === "categories" && (
              <motion.div
                key="categories"
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <Category />
              </motion.div>
            )}

            {activeTab === "tests" && (
              <motion.div
                key="tests"
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <Test />
              </motion.div>
            )}
            {activeTab === "question" && (
              <motion.div
                key="question"
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <Question/>
              </motion.div>
            )}
            {activeTab === "codingtest" && (
              <motion.div
                key="codingtest"
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
               <CodingTest/>
              </motion.div>
            )}
            {activeTab === "codingqustion" && (
              <motion.div
                key="codingqustion"
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
               <Codingquestion/>
              </motion.div>
            )}
            {activeTab === "users" && (
              <motion.div
                key="users"
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
               <UsersContent />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
