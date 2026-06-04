"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FaHistory,
  FaChevronLeft,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaCode,
  FaFilter,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";
import { useAppDispatch, useAppselector } from "@/Redux/hooks/hooks";
import { getSubmissionHistoryThunk } from "@/Redux/slice/codingSlice";

const stagger = (delay = 0) => ({
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: "easeOut", delay },
  },
});

const STATUS_CONFIG = {
  accepted: {
    label: "Accepted",
    cls: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
    icon: FaCheckCircle,
  },
  wrong_answer: {
    label: "Wrong Answer",
    cls: "text-red-400    bg-red-400/10    border-red-400/30",
    icon: FaTimesCircle,
  },
  tle: {
    label: "Time Limit",
    cls: "text-orange-400 bg-orange-400/10 border-orange-400/30",
    icon: FaClock,
  },
  error: {
    label: "Error",
    cls: "text-red-400    bg-red-400/10    border-red-400/30",
    icon: FaTimesCircle,
  },
  pending: {
    label: "Pending",
    cls: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
    icon: FaClock,
  },
};

function normaliseStatus(raw = "") {
  const s = raw.toLowerCase().replace(/[-\s]/g, "_");
  return STATUS_CONFIG[s] ? s : "pending";
}

function formatDate(dt) {
  if (!dt) return "—";
  try {
    return new Date(dt).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

const LANG_COLORS = {
  javascript: "text-yellow-400 bg-yellow-400/10 border-yellow-400/25",
  python: "text-blue-400   bg-blue-400/10   border-blue-400/25",
  java: "text-orange-400 bg-orange-400/10 border-orange-400/25",
  cpp: "text-purple-400 bg-purple-400/10 border-purple-400/25",
};

export default function HistoryPage() {
  const dispatch = useAppDispatch();
  const { submissionHistory, isLoading, error } = useAppselector(
    (state) => state.codingStore,
  );
  console.log("submisson history", submissionHistory);
  const [filterStatus, setFilterStatus] = useState("all");
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    dispatch(getSubmissionHistoryThunk(""));
  }, [dispatch]);

  const history = Array.isArray(submissionHistory) ? submissionHistory : [];

  const filtered =
    filterStatus === "all"
      ? history
      : history.filter(
          (s) => normaliseStatus(s.finalResult || s.status) === filterStatus
        );

  // Stats
  const totalSolved = history.filter(
  (s) =>
    normaliseStatus(
      s.finalResult || s.status
    ) === "accepted"
).length;
  const totalAttempts = history.length;
  const accuracy =
  totalAttempts > 0
    ? Math.round((totalSolved / totalAttempts) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden border-b border-slate-800 bg-gradient-to-br from-purple-950/30 via-slate-950 to-slate-950">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/8 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-6 py-16">
          <motion.div variants={stagger(0.05)} initial="hidden" animate="show">
            <Link
              href="/challenges"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-8 transition"
            >
              <FaChevronLeft size={11} /> All Challenges
            </Link>
          </motion.div>

          <motion.div
            variants={stagger(0.08)}
            initial="hidden"
            animate="show"
            className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/25 rounded-full px-4 py-1.5 mb-5"
          >
            <HiSparkles size={14} className="text-purple-400" />
            <span className="text-purple-400 text-sm font-semibold">
              Submission History
            </span>
          </motion.div>

          <motion.h1
            variants={stagger(0.12)}
            initial="hidden"
            animate="show"
            className="text-4xl sm:text-5xl font-extrabold mb-4"
          >
            My{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              Submissions
            </span>
          </motion.h1>

          <motion.p
            variants={stagger(0.16)}
            initial="hidden"
            animate="show"
            className="text-slate-400 text-lg mb-8"
          >
            Track every submission you've made across all coding challenges.
          </motion.p>

          {/* ── Stats ─────────────────────────────────────────────── */}
          <motion.div
            variants={stagger(0.2)}
            initial="hidden"
            animate="show"
            className="flex flex-wrap gap-4"
          >
            {[
              {
                label: "Total Submissions",
                val: totalAttempts,
                color: "text-white",
                bg: "bg-slate-800 border-slate-700",
              },
              {
                label: "Accepted",
                val: totalSolved,
                color: "text-emerald-400",
                bg: "bg-emerald-400/10 border-emerald-400/20",
              },
              {
                label: "Accuracy",
                val: `${accuracy}%`,
                color: "text-cyan-400",
                bg: "bg-cyan-400/10 border-cyan-400/20",
              },
            ].map(({ label, val, color, bg }) => (
              <div
                key={label}
                className={`px-5 py-3 rounded-xl border ${bg} text-sm`}
              >
                <p className="text-slate-500 text-xs mb-0.5">{label}</p>
                <p className={`font-bold text-lg ${color}`}>{val}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Filter bar */}
        <motion.div
          variants={stagger(0.1)}
          initial="hidden"
          animate="show"
          className="flex items-center gap-2 mb-8 flex-wrap"
        >
          <div className="flex items-center gap-1.5 text-slate-400 text-sm mr-2">
            <FaFilter size={12} />
            Filter:
          </div>
          {[
            { key: "all", label: "All" },
            { key: "accepted", label: "Accepted" },
            { key: "wrong_answer", label: "Wrong Answer" },
            { key: "error", label: "Error" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilterStatus(key)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition ${
                filterStatus === key
                  ? "bg-purple-500/20 border-purple-500/50 text-purple-400"
                  : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600"
              }`}
            >
              {label}
            </button>
          ))}
        </motion.div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 animate-pulse"
              >
                <div className="flex justify-between mb-3">
                  <div className="h-4 w-48 bg-slate-700 rounded" />
                  <div className="h-4 w-24 bg-slate-800 rounded" />
                </div>
                <div className="h-3 w-32 bg-slate-800 rounded" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!isLoading && error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center">
            <FaTimesCircle className="mx-auto text-red-400 mb-2" size={28} />
            <p className="text-red-400 font-semibold">Failed to load history</p>
            <p className="text-slate-500 text-sm mt-1">{String(error)}</p>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !error && filtered.length === 0 && (
          <div className="text-center py-20 border border-slate-800 rounded-2xl">
            <FaHistory size={48} className="mx-auto text-slate-700 mb-4" />
            <p className="text-slate-400 text-xl font-semibold">
              {filterStatus === "all"
                ? "No submissions yet"
                : "No submissions match this filter"}
            </p>
            <p className="text-slate-600 text-sm mt-2">
              {filterStatus === "all"
                ? "Start a challenge to see your submissions here."
                : "Try changing the filter above."}
            </p>
            {filterStatus === "all" && (
              <Link
                href="/challenges"
                className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold hover:opacity-90 transition"
              >
                Browse Challenges →
              </Link>
            )}
          </div>
        )}

        {/* ── Submission list ──────────────────────────────────────── */}
        {!isLoading && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((sub, i) => {
              const statusKey = normaliseStatus(sub.finalResult || sub.status);
              //console.log("substatus", sub.status);
              //console.log("finalresult", sub.finalResult);
              const cfg = STATUS_CONFIG[statusKey];
              const Icon = cfg.icon;
              const langCls =
                LANG_COLORS[sub.language?.toLowerCase()] ||
                "text-slate-400 bg-slate-800 border-slate-700";
              const isExpanded = expandedId === (sub._id || i);

              return (
                <motion.div
                  key={sub._id || i}
                  variants={stagger(i * 0.04)}
                  initial="hidden"
                  animate="show"
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden transition"
                >
                  {/* Main row */}
                  <div
                    className="flex items-center gap-4 p-5 cursor-pointer"
                    onClick={() =>
                      setExpandedId(isExpanded ? null : sub._id || i)
                    }
                  >
                    {/* Status icon */}
                    <Icon size={18} className={cfg.cls.split(" ")[0]} />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="text-white font-semibold text-sm truncate">
                          {sub.question?.title ||
                            sub.questionTitle ||
                            "Unknown Question"}
                        </p>
                        <span
                          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${cfg.cls}`}
                        >
                          <Icon size={9} className="inline mr-1" />
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-slate-500 text-xs truncate">
                        {sub.codingTest?.title || sub.testTitle || "—"}
                      </p>
                    </div>

                    {/* Right metadata */}
                    <div className="flex items-center gap-4 flex-shrink-0">
                      {/* Language */}
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg border hidden sm:block ${langCls}`}
                      >
                        {sub.language || "—"}
                      </span>

                      {/* Score */}
                      {sub.score !== undefined && (
                        <div className="text-center hidden md:block">
                          <p className="text-yellow-400 font-bold text-sm">
                            {sub.score}
                          </p>
                          <p className="text-slate-600 text-xs">pts</p>
                        </div>
                      )}

                      {/* Date */}
                      <p className="text-slate-500 text-xs hidden lg:block">
                        {formatDate(sub.createdAt || sub.submittedAt)}
                      </p>

                      {/* Expand */}
                      {isExpanded ? (
                        <FaChevronUp size={12} className="text-slate-500" />
                      ) : (
                        <FaChevronDown size={12} className="text-slate-500" />
                      )}
                    </div>
                  </div>

                  {/* Expanded: code snippet */}
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-slate-800 bg-slate-950/60"
                    >
                      <div className="p-5">
                        {/* Meta row */}
                        <div className="flex flex-wrap gap-4 mb-4 text-sm">
                          <span className="text-slate-400">
                            <span className="text-slate-600 mr-1">
                              Language:
                            </span>
                            <span className="text-white font-medium">
                              {sub.language || "—"}
                            </span>
                          </span>
                          {sub.score !== undefined && (
                            <span className="text-slate-400">
                              <span className="text-slate-600 mr-1">
                                Score:
                              </span>
                              <span className="text-yellow-400 font-bold">
                                {sub.score} pts
                              </span>
                            </span>
                          )}
                          {sub.testsPassed !== undefined &&
                            sub.testsTotal !== undefined && (
                              <span className="text-slate-400">
                                <span className="text-slate-600 mr-1">
                                  Tests:
                                </span>
                                <span className="text-white font-medium">
                                  {sub.testsPassed}/{sub.testsTotal}
                                </span>
                              </span>
                            )}
                          <span className="text-slate-400">
                            <span className="text-slate-600 mr-1">
                              Submitted:
                            </span>
                            <span className="text-white">
                              {formatDate(sub.createdAt || sub.submittedAt)}
                            </span>
                          </span>
                        </div>

                        {/* Code */}
                        {sub.code && (
                          <div>
                            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                              <FaCode size={10} /> Submitted Code
                            </p>
                            <pre className="bg-[#0d1117] border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-300 overflow-x-auto max-h-64 whitespace-pre-wrap">
                              {sub.code}
                            </pre>
                          </div>
                        )}

                        {/* Error message */}
                        {sub.errorMessage && (
                          <div className="mt-3 bg-red-500/10 border border-red-500/25 rounded-xl p-3 text-xs font-mono text-red-400">
                            {sub.errorMessage}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
