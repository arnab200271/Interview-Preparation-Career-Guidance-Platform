"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FaClock,
  FaCode,
  FaTrophy,
  FaPlay,
  FaChevronLeft,
  FaCheckCircle,
  FaStar,
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";
import { useAppDispatch, useAppselector } from "@/Redux/hooks/hooks";
import { getSingleCodingTestThunk } from "@/Redux/slice/codingSlice";

const DIFF_STYLES = {
  Easy:   { label: "Easy",   cls: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30" },
  Medium: { label: "Medium", cls: "text-yellow-400  bg-yellow-400/10  border-yellow-400/30"  },
  Hard:   { label: "Hard",   cls: "text-red-400    bg-red-400/10    border-red-400/30"        },
};

const stagger = (delay = 0) => ({
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut", delay } },
});

export default function CodingTestDetailPage() {
  const dispatch  = useAppDispatch();
  const router    = useRouter();
  const { testId } = useParams();            //  Works because this is a dynamic route

  const { singleCodingTest, isLoading, error } = useAppselector(
    (state) => state.codingStore
  );

  useEffect(() => {
    if (testId) {
      dispatch(getSingleCodingTestThunk(testId));
    }
  }, [dispatch, testId]);

  // ── Loading ────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 px-6 py-16">
        <div className="max-w-5xl mx-auto animate-pulse">
          <div className="h-4 w-32 bg-slate-800 rounded mb-8" />
          <div className="h-12 w-80 bg-slate-800 rounded-xl mb-4" />
          <div className="h-5 w-full bg-slate-800 rounded mb-2" />
          <div className="h-5 w-3/4 bg-slate-800 rounded mb-12" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-4">
              <div className="h-5 w-48 bg-slate-700 rounded mb-3" />
              <div className="h-4 w-full bg-slate-800 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────
  if (error || !singleCodingTest) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 text-white">
        <p className="text-red-400 text-xl font-semibold">Test not found</p>
        <p className="text-slate-500 text-sm">{error ? String(error) : "The challenge could not be loaded."}</p>
        <Link
          href="/challenges"
          className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition"
        >
          <FaChevronLeft size={12} /> Back to Challenges
        </Link>
      </div>
    );
  }

  const questions   = singleCodingTest.codingQuestions || [];
  const totalMarks  = singleCodingTest.totalMarks || questions.reduce((s, q) => s + (q.marks || 0), 0);

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden border-b border-slate-800 bg-gradient-to-br from-cyan-950/40 via-blue-950/30 to-slate-950">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-6 py-16">

          {/* Back link */}
          <motion.div variants={stagger(0)} initial="hidden" animate="show">
            <Link
              href="/challenges"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-8 transition"
            >
              <FaChevronLeft size={11} /> All Challenges
            </Link>
          </motion.div>

          {/* Badge */}
          <motion.div
            variants={stagger(0.05)}
            initial="hidden"
            animate="show"
            className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/25 rounded-full px-4 py-1.5 mb-5"
          >
            <HiSparkles size={14} className="text-cyan-400" />
            <span className="text-cyan-400 text-sm font-semibold">Coding Challenge</span>
          </motion.div>

          {/* Title */}
          <motion.h1
            variants={stagger(0.1)}
            initial="hidden"
            animate="show"
            className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight"
          >
            {singleCodingTest.title}
          </motion.h1>

          <motion.p
            variants={stagger(0.15)}
            initial="hidden"
            animate="show"
            className="text-slate-400 text-lg max-w-3xl mb-8"
          >
            {singleCodingTest.description}
          </motion.p>

          {/* Stats row */}
          <motion.div
            variants={stagger(0.2)}
            initial="hidden"
            animate="show"
            className="flex flex-wrap gap-3"
          >
            {[
              { icon: FaClock,  val: `${singleCodingTest.duration} Minutes`, color: "text-cyan-400",   bg: "bg-cyan-400/10   border-cyan-400/20"   },
              { icon: FaTrophy, val: `${totalMarks} Total Marks`,            color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20" },
              { icon: FaCode,   val: `${questions.length} Questions`,        color: "text-purple-400", bg: "bg-purple-400/10 border-purple-400/20" },
            ].map(({ icon: Icon, val, color, bg }) => (
              <div key={val} className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border ${bg} text-sm font-semibold`}>
                <Icon size={14} className={color} />
                <span className="text-white">{val}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Questions list ─────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 py-12">

        <motion.h2
          variants={stagger(0.1)}
          initial="hidden"
          animate="show"
          className="text-2xl font-bold mb-6 flex items-center gap-3"
        >
          <FaCheckCircle className="text-cyan-400" />
          Challenge Questions
        </motion.h2>

        {questions.length === 0 ? (
          <div className="text-slate-500 text-center py-12 border border-slate-800 rounded-2xl">
            No questions added to this challenge yet.
          </div>
        ) : (
          <div className="grid gap-4 mb-12">
            {questions.map((q, i) => {
              const diff = DIFF_STYLES[q.difficulty] || DIFF_STYLES["Medium"];
              return (
                <motion.div
                  key={q._id}
                  variants={stagger(i * 0.07)}
                  initial="hidden"
                  animate="show"
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex justify-between items-start"
                >
                  <div className="flex items-start gap-4">
                    {/* Index */}
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 font-mono text-sm font-bold flex-shrink-0">
                      {String(i + 1).padStart(2, "0")}
                    </div>

                    <div>
                      <div className="flex items-center gap-3 flex-wrap mb-1">
                        <h3 className="text-white font-semibold text-base">{q.title}</h3>
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${diff.cls}`}>
                          {diff.label}
                        </span>
                      </div>
                      <p className="text-slate-500 text-sm line-clamp-2">{q.description}</p>

                      {/* Tags */}
                      {q.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {q.tags.map((tag) => (
                            <span key={tag} className="text-xs text-slate-400 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-0.5">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Marks badge */}
                  <div className="flex items-center gap-1.5 text-yellow-400 font-bold text-sm flex-shrink-0 ml-4">
                    <FaStar size={12} />
                    {q.marks} pts
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* ── Start CTA ────────────────────────────────────────────── */}
        <motion.div
          variants={stagger(0.3)}
          initial="hidden"
          animate="show"
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          {/* Leaderboard shortcut */}
          <Link
            href="/challenges/leaderboard"
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl border border-slate-700 text-slate-300 font-semibold hover:bg-slate-800 transition text-sm"
          >
            <FaTrophy className="text-yellow-400" />
            View Leaderboard
          </Link>

          {/* Start */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push(`/challenges/${testId}/exam`)}
            disabled={questions.length === 0}
            className="flex items-center gap-3 px-10 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-base shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
          >
            <FaPlay size={14} />
            Start Challenge
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
