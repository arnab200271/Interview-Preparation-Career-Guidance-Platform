"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiAward,
  FiArrowLeft,
  FiSkipForward,
  FiTarget,
  FiBarChart2,
  FiRepeat,
  FiHome,
} from "react-icons/fi";
import { HiSparkles, HiTrophy } from "react-icons/hi2";
import { useAppDispatch, useAppselector } from "@/Redux/hooks/hooks";
import { getMyResultsThunk } from "@/Redux/slice/slice";

// ─── Animated Counter ────────────────────────────────────────────────────────
function AnimatedNumber({ target, duration = 1200, suffix = "" }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (target === 0) return;
    const step = target / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        setValue(target);
        clearInterval(timer);
      } else {
        setValue(Math.floor(current));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);

  return (
    <span>
      {value}
      {suffix}
    </span>
  );
}

// ─── Circular Progress Ring ───────────────────────────────────────────────────
function CircularProgress({ percentage, pass }) {
  const radius = 72;
  const circumference = 2 * Math.PI * radius;
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOffset(circumference - (percentage / 100) * circumference);
    }, 300);
    return () => clearTimeout(timer);
  }, [percentage, circumference]);

  const color = pass
    ? { stroke: "#22d3ee", glow: "#06b6d4" }
    : { stroke: "#f87171", glow: "#ef4444" };

  return (
    <div className="relative flex items-center justify-center w-48 h-48 mx-auto">
      {/* Glow */}
      <div
        className="absolute inset-0 rounded-full blur-2xl opacity-20"
        style={{ backgroundColor: color.glow }}
      />
      <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
        {/* Track */}
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="#1e293b"
          strokeWidth="10"
        />
        {/* Progress */}
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke={color.stroke}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)" }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-4xl font-black"
          style={{ color: color.stroke }}
        >
          <AnimatedNumber target={Math.round(percentage)} suffix="%" />
        </span>
        <span className="text-xs text-slate-400 mt-1 font-medium">Score</span>
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color, delay }) {
  const colorMap = {
    green: {
      bg: "bg-green-500/10",
      border: "border-green-500/20",
      text: "text-green-400",
      icon: "bg-green-500/15",
    },
    red: {
      bg: "bg-red-500/10",
      border: "border-red-500/20",
      text: "text-red-400",
      icon: "bg-red-500/15",
    },
    yellow: {
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/20",
      text: "text-yellow-400",
      icon: "bg-yellow-500/15",
    },
    cyan: {
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/20",
      text: "text-cyan-400",
      icon: "bg-cyan-500/15",
    },
    purple: {
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
      text: "text-purple-400",
      icon: "bg-purple-500/15",
    },
  };

  const c = colorMap[color] || colorMap.cyan;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`relative flex flex-col gap-3 rounded-2xl border p-5 ${c.bg} ${c.border} overflow-hidden group hover:scale-[1.02] transition-transform duration-300`}
    >
      {/* Subtle glow on hover */}
      <div className={`absolute -right-4 -top-4 w-20 h-20 rounded-full blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 ${c.icon}`} />

      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.icon}`}>
        <Icon className={`text-xl ${c.text}`} />
      </div>

      <div>
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">
          {label}
        </p>
        <p className={`text-3xl font-black ${c.text}`}>
          <AnimatedNumber target={typeof value === "number" ? value : 0} />
        </p>
      </div>
    </motion.div>
  );
}

// ─── Answer Bar ───────────────────────────────────────────────────────────────
function AnswerBar({ correct, wrong, skipped, total }) {
  const correctPct = total ? (correct / total) * 100 : 0;
  const wrongPct = total ? (wrong / total) * 100 : 0;
  const skippedPct = total ? (skipped / total) * 100 : 0;

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-3">
        Answer Breakdown
      </p>
      {/* Bar */}
      <div className="h-4 rounded-full overflow-hidden bg-slate-800 flex">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${correctPct}%` }}
          transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
          className="h-full bg-green-500 rounded-l-full"
        />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${wrongPct}%` }}
          transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }}
          className="h-full bg-red-500"
        />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${skippedPct}%` }}
          transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
          className="h-full bg-yellow-400 rounded-r-full"
        />
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-xs text-slate-400">
            Correct ({correct})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-xs text-slate-400">
            Wrong ({wrong})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <span className="text-xs text-slate-400">
            Skipped ({skipped})
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ResultPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { myResults, isLoading } = useAppselector((state) => state.mainstore);

  useEffect(() => {
    dispatch(getMyResultsThunk());
  }, [dispatch]);

  const result = myResults?.[0];

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center gap-5 text-white">
        <div className="w-14 h-14 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm animate-pulse">
          Loading your result...
        </p>
      </div>
    );
  }

  // ── No Result ──
  if (!result) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center gap-6 text-white px-4">
        <div className="w-24 h-24 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
          <FiBarChart2 className="text-4xl text-slate-600" />
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">No Results Yet</h1>
          <p className="text-slate-400">Take an MCQ exam to see your result here.</p>
        </div>
        <button
          onClick={() => router.push("/mcq")}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <FiArrowLeft />
          Go to MCQ
        </button>
      </div>
    );
  }

  const pass = result.status === "pass";
  const percentage = Math.round(result.percentage ?? 0);
  const correct = result.correctAnswers ?? 0;
  const wrong = result.wrongAnswers ?? 0;
  const skipped = result.skippedQuestions ?? 0;
  const total = result.totalQuestions ?? correct + wrong + skipped;
  const timeTaken = result.timeTaken ?? 0;
  const mins = Math.floor(timeTaken / 60);
  const secs = timeTaken % 60;
  const timeStr =
    mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-hidden relative pt-10 pb-16 px-4">
      {/* BG Glows */}
      <div
        className={`absolute top-0 left-0 w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none ${
          pass ? "bg-cyan-500/8" : "bg-red-500/8"
        }`}
      />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-600/8 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* ── Header Badge ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium">
            <HiSparkles />
            MCQ Examination Result
          </div>
        </motion.div>

        {/* ── Hero Card ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={`relative rounded-3xl border overflow-hidden mb-6 ${
            pass
              ? "border-cyan-500/25 bg-gradient-to-br from-cyan-500/5 via-[#07111f] to-[#020617]"
              : "border-red-500/25 bg-gradient-to-br from-red-500/5 via-[#07111f] to-[#020617]"
          }`}
        >
          {/* Top stripe */}
          <div
            className={`h-1 w-full ${
              pass
                ? "bg-gradient-to-r from-cyan-500 to-blue-600"
                : "bg-gradient-to-r from-red-500 to-rose-600"
            }`}
          />

          <div className="p-8 md:p-10 flex flex-col md:flex-row items-center gap-8">
            {/* Circle progress */}
            <div className="shrink-0">
              <CircularProgress percentage={percentage} pass={pass} />
            </div>

            {/* Right text */}
            <div className="flex-1 text-center md:text-left">
              {/* Trophy / X icon */}
              <div
                className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 ${
                  pass
                    ? "bg-cyan-500/15 text-cyan-400"
                    : "bg-red-500/15 text-red-400"
                }`}
              >
                {pass ? (
                  <HiTrophy className="text-3xl" />
                ) : (
                  <FiXCircle className="text-3xl" />
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-black mb-2">
                {pass ? "Congratulations! 🎉" : "Better Luck Next Time 😢"}
              </h1>

              <p className="text-slate-400 mb-4">
                {result?.test?.title && (
                  <span className="font-semibold text-white">
                    {result.test.title}
                  </span>
                )}
                {result?.test?.title && " · "}
                {pass
                  ? "Excellent performance. You passed the exam!"
                  : "You didn't meet the passing threshold. Keep practicing!"}
              </p>

              {/* Pass / Fail badge */}
              <span
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border ${
                  pass
                    ? "bg-green-500/10 border-green-500/30 text-green-400"
                    : "bg-red-500/10 border-red-500/30 text-red-400"
                }`}
              >
                {pass ? <FiAward /> : <FiXCircle />}
                {pass ? "PASSED" : "FAILED"}
              </span>
            </div>
          </div>
        </motion.div>

        {/* ── Stats Grid ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={FiCheckCircle}
            label="Correct"
            value={correct}
            color="green"
            delay={0.2}
          />
          <StatCard
            icon={FiXCircle}
            label="Wrong"
            value={wrong}
            color="red"
            delay={0.3}
          />
          <StatCard
            icon={FiSkipForward}
            label="Skipped"
            value={skipped}
            color="yellow"
            delay={0.4}
          />
          <StatCard
            icon={FiTarget}
            label="Total Qs"
            value={total}
            color="cyan"
            delay={0.5}
          />
        </div>

        {/* ── Bottom Info Row ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-[#07111f]/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 mb-6"
        >
          {/* Answer breakdown bar */}
          <AnswerBar
            correct={correct}
            wrong={wrong}
            skipped={skipped}
            total={total}
          />

          {/* Divider */}
          <div className="border-t border-slate-800 my-6" />

          {/* Meta info */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {/* Time taken */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <FiClock className="text-blue-400" />
              </div>
              <div>
                <p className="text-[11px] text-slate-500 uppercase tracking-wider">
                  Time Taken
                </p>
                <p className="text-white font-bold">{timeStr}</p>
              </div>
            </div>

            {/* Score */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <FiBarChart2 className="text-purple-400" />
              </div>
              <div>
                <p className="text-[11px] text-slate-500 uppercase tracking-wider">
                  Raw Score
                </p>
                <p className="text-white font-bold">{result.score ?? 0} pts</p>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  pass ? "bg-green-500/10" : "bg-red-500/10"
                }`}
              >
                <FiAward className={pass ? "text-green-400" : "text-red-400"} />
              </div>
              <div>
                <p className="text-[11px] text-slate-500 uppercase tracking-wider">
                  Status
                </p>
                <p
                  className={`font-bold ${
                    pass ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {pass ? "Passed ✓" : "Failed ✗"}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Action Buttons ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.75 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <button
            onClick={() => router.push("/mcq")}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-white font-semibold transition-all duration-300 hover:border-slate-600"
          >
            <FiRepeat className="text-cyan-400" />
            Try Another Exam
          </button>

          <button
            onClick={() => router.push("/")}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold hover:opacity-90 transition-opacity duration-300 shadow-lg shadow-cyan-500/20"
          >
            <FiHome />
            Back to Home
          </button>
        </motion.div>
      </div>
    </div>
  );
}