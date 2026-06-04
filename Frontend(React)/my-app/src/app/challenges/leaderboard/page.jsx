"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FaTrophy,
  FaMedal,
  FaChevronLeft,
  FaChevronDown,
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";
import { useAppDispatch, useAppselector } from "@/Redux/hooks/hooks";
import {
  getCodingTestThunk,
  getLeaderboardThunk,
} from "@/Redux/slice/codingSlice";

const stagger = (delay = 0) => ({
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut", delay } },
});

// ── Rank styles ───────────────────────────────────────────────────
const RANK_CONFIG = [
  { bg: "from-yellow-500/20 to-amber-600/10", border: "border-yellow-400/40", badge: "bg-gradient-to-br from-yellow-400 to-amber-500", icon: FaTrophy, text: "text-yellow-400" },
  { bg: "from-slate-400/15 to-slate-500/5",   border: "border-slate-400/30",  badge: "bg-gradient-to-br from-slate-300 to-slate-400",   icon: FaMedal,  text: "text-slate-300" },
  { bg: "from-orange-600/15 to-amber-800/5",  border: "border-orange-500/30", badge: "bg-gradient-to-br from-orange-500 to-amber-600",  icon: FaMedal,  text: "text-orange-400" },
];

function getInitials(name = "") {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "??";
}

function formatDate(dt) {
  if (!dt) return "—";
  try { return new Date(dt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); }
  catch { return "—"; }
}

export default function LeaderboardPage() {
  const dispatch = useAppDispatch();
  const { codingTests, leaderboard, isLoading } = useAppselector(
    (state) => state.codingStore
  );
 console.log("Leaderboard",leaderboard)
  const [selectedTestId, setSelectedTestId] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Fetch all tests for the selector
  useEffect(() => {
    dispatch(getCodingTestThunk());
  }, [dispatch]);

  // Auto-select first test
  useEffect(() => {
    if (codingTests?.length && !selectedTestId) {
      setSelectedTestId(codingTests[0]._id);
    }
  }, [codingTests, selectedTestId]);

  // Fetch leaderboard whenever selectedTestId changes
  useEffect(() => {
    if (selectedTestId) {
      dispatch(getLeaderboardThunk(selectedTestId));
    }
  }, [dispatch, selectedTestId]);

  const selectedTest = codingTests?.find((t) => t._id === selectedTestId);
  const entries = Array.isArray(leaderboard) ? leaderboard : [];

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden border-b border-slate-800 bg-gradient-to-br from-yellow-950/30 via-amber-950/20 to-slate-950">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-yellow-500/8 rounded-full blur-[120px] pointer-events-none" />

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
            className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/25 rounded-full px-4 py-1.5 mb-5"
          >
            <HiSparkles size={14} className="text-yellow-400" />
            <span className="text-yellow-400 text-sm font-semibold">Top Performers</span>
          </motion.div>

          <motion.h1
            variants={stagger(0.12)}
            initial="hidden"
            animate="show"
            className="text-4xl sm:text-5xl font-extrabold mb-4"
          >
            🏆{" "}
            <span className="bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
              Leaderboard
            </span>
          </motion.h1>

          <motion.p
            variants={stagger(0.16)}
            initial="hidden"
            animate="show"
            className="text-slate-400 text-lg"
          >
            See who's crushing the challenges. Will you make the top 10?
          </motion.p>
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Test selector */}
        <motion.div
          variants={stagger(0.1)}
          initial="hidden"
          animate="show"
          className="mb-8"
        >
          <p className="text-slate-400 text-sm font-semibold mb-2">Select Challenge</p>
          <div className="relative w-full max-w-sm">
            <button
              onClick={() => setDropdownOpen((v) => !v)}
              className="w-full flex items-center justify-between gap-3 bg-slate-900 border border-slate-700 hover:border-slate-600 rounded-xl px-4 py-3 text-left transition"
            >
              <span className="text-white text-sm font-medium truncate">
                {selectedTest?.title || "Select a challenge…"}
              </span>
              <FaChevronDown size={12} className={`text-slate-400 flex-shrink-0 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full mt-1 w-full bg-slate-900 border border-slate-700 rounded-xl overflow-hidden z-10 shadow-xl shadow-black/40"
              >
                {(codingTests || []).map((t) => (
                  <button
                    key={t._id}
                    onClick={() => { setSelectedTestId(t._id); setDropdownOpen(false); }}
                    className={`w-full text-left px-4 py-3 text-sm transition hover:bg-slate-800 ${selectedTestId === t._id ? "text-cyan-400 bg-cyan-500/10" : "text-slate-300"}`}
                  >
                    {t.title}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 animate-pulse flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-700" />
                <div className="flex-1">
                  <div className="h-4 w-40 bg-slate-700 rounded mb-2" />
                  <div className="h-3 w-24 bg-slate-800 rounded" />
                </div>
                <div className="h-6 w-16 bg-slate-700 rounded" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && entries.length === 0 && (
          <div className="text-center py-20 border border-slate-800 rounded-2xl">
            <FaTrophy size={48} className="mx-auto text-slate-700 mb-4" />
            <p className="text-slate-400 text-xl font-semibold">No submissions yet</p>
            <p className="text-slate-600 text-sm mt-2">Be the first to complete this challenge!</p>
            <Link
              href={selectedTestId ? `/challenges/${selectedTestId}` : "/challenges"}
              className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-sm font-bold hover:opacity-90 transition"
            >
              Start Challenge →
            </Link>
          </div>
        )}

        {/* ── Top 3 podium ──────────────────────────────────────── */}
        {!isLoading && entries.length > 0 && (
          <>
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[1, 0, 2].map((pos) => {
                const entry = entries[pos];
                if (!entry) return <div key={pos} />;
                const cfg   = RANK_CONFIG[pos];
                const Icon  = cfg.icon;
                const heights = ["h-28", "h-36", "h-24"];
                return (
                  <motion.div
                    key={pos}
                    variants={stagger(pos * 0.1)}
                    initial="hidden"
                    animate="show"
                    className={`bg-gradient-to-b ${cfg.bg} border ${cfg.border} rounded-2xl p-4 flex flex-col items-center justify-end ${heights[pos]} relative`}
                  >
                    <div className={`w-12 h-12 rounded-full ${cfg.badge} flex items-center justify-center shadow-lg mb-2`}>
                      <span className="text-white font-extrabold text-sm">
                        {getInitials(entry.user?.name || entry.name)}
                      </span>
                    </div>
                    <Icon size={14} className={`${cfg.text} mb-1`} />
                    <p className="text-white font-bold text-sm text-center truncate w-full text-center">
                      {entry.user?.name || entry.name || "Anonymous"}
                    </p>
                    <p className={`${cfg.text} text-xs font-semibold`}>
                      {entry.totalScore ?? entry.score ?? 0} pts
                    </p>
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center text-xs font-bold text-slate-300">
                      {pos + 1}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* ── Full ranked table ──────────────────────────────── */}
            <div className="space-y-3">
              {entries.map((entry, i) => {
                const cfg  = i < 3 ? RANK_CONFIG[i] : null;
                const name = entry.user?.name || entry.name || "Anonymous";

                return (
                  <motion.div
                    key={entry._id || i}
                    variants={stagger(i * 0.05)}
                    initial="hidden"
                    animate="show"
                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200
                      ${cfg
                        ? `bg-gradient-to-r ${cfg.bg} ${cfg.border}`
                        : "bg-slate-900 border-slate-800 hover:border-slate-700"
                      }`}
                  >
                    {/* Rank */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0
                      ${cfg ? `${cfg.badge} text-white shadow-md` : "bg-slate-800 border border-slate-700 text-slate-400"}`}
                    >
                      {i + 1}
                    </div>

                    {/* Avatar */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0
                      ${i === 0 ? "bg-gradient-to-br from-yellow-400 to-amber-500" :
                        i === 1 ? "bg-gradient-to-br from-slate-400 to-slate-500" :
                        i === 2 ? "bg-gradient-to-br from-orange-500 to-amber-600" :
                                  "bg-gradient-to-br from-cyan-600 to-blue-700"} text-white`}
                    >
                      {getInitials(name)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm truncate">{name}</p>
                      <p className="text-slate-500 text-xs">{formatDate(entry.submittedAt || entry.createdAt)}</p>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 flex-shrink-0">
                      {entry.timeTaken !== undefined && (
                        <div className="text-center hidden sm:block">
                          <p className="text-white text-sm font-semibold">{entry.timeTaken}m</p>
                          <p className="text-slate-500 text-xs">Time</p>
                        </div>
                      )}
                      {(entry.solved || entry.questionsSolved) !== undefined && (
                        <div className="text-center hidden md:block">
                          <p className="text-cyan-400 text-sm font-semibold">{entry.solved ?? entry.questionsSolved}</p>
                          <p className="text-slate-500 text-xs">Solved</p>
                        </div>
                      )}
                      <div className="text-center">
                        <p className={`text-sm font-bold ${cfg ? cfg.text : "text-white"}`}>
                          {entry.totalScore ?? entry.score ?? 0}
                        </p>
                        <p className="text-slate-500 text-xs">pts</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
