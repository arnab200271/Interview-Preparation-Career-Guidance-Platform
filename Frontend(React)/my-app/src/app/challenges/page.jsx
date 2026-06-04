"use client";
import Swal from "sweetalert2";
import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FaClock,
  FaCode,
  FaTrophy,
  FaChevronRight,
  FaFire,
  FaLock,
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";
import { useAppDispatch, useAppselector } from "@/Redux/hooks/hooks";
import { getCodingTestThunk } from "@/Redux/slice/codingSlice";
import { useRouter } from "next/navigation";

const DIFF_STYLES = {
  Easy: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
  Medium: "text-yellow-400  bg-yellow-400/10  border-yellow-400/30",
  Hard: "text-red-400    bg-red-400/10    border-red-400/30",
};

const stagger = (delay = 0) => ({
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut", delay },
  },
});

export default function CodingChallengesListPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { codingTests, isLoading, error } = useAppselector(
    (state) => state.codingStore,
  );

  useEffect(() => {
    dispatch(getCodingTestThunk());
  }, [dispatch]);
  const handleViewChallenge = async (challengeId) => {
    const token = localStorage.getItem("token");

    if (!token) {
      const result = await Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "Please login to view and participate in this coding challenge.",
        background: "#081120",
        confirmButtonText: "Login",
        showCancelButton: true,
        cancelButtonText: "Cancel",
        color: "#fff",
        confirmButtonColor: "#06b6d4",
        cancelButtonColor: "#1e293b",
      });

      if (result.isConfirmed) {
        router.push("/login");
      }

      return;
    }

    router.push(`/challenges/${challengeId}`);
  };

  const handleHistoryClick = async (e) => {
    const token = localStorage.getItem("token");

    if (!token) {
      e.preventDefault();

      const result = await Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "Please login to view your submission history.",
        confirmButtonText: "Login",
        showCancelButton: true,
      });

      if (result.isConfirmed) {
        router.push("/login");
      }

      return;
    }

    router.push("/challenges/history");
  };
  // ── Loading skeleton ──────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="h-10 w-72 bg-slate-800 rounded-xl animate-pulse mb-4" />
          <div className="h-5 w-96 bg-slate-800 rounded-lg animate-pulse mb-12" />
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-4 animate-pulse"
            >
              <div className="h-5 w-48 bg-slate-700 rounded mb-3" />
              <div className="h-4 w-full bg-slate-800 rounded mb-2" />
              <div className="h-4 w-3/4 bg-slate-800 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg font-semibold mb-2">
            Failed to load challenges
          </p>
          <p className="text-slate-500 text-sm">{String(error)}</p>
        </div>
      </div>
    );
  }

  const published = (codingTests || []).filter((t) => t.isPublished !== false);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* ── Hero ───────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden border-b border-slate-800 bg-gradient-to-br from-cyan-950/40 via-blue-950/30 to-slate-950">
        {/* glow orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-6 py-20">
          <motion.div
            variants={stagger(0.05)}
            initial="hidden"
            animate="show"
            className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/25 rounded-full px-4 py-1.5 mb-5"
          >
            <HiSparkles size={14} className="text-cyan-400" />
            <span className="text-cyan-400 text-sm font-semibold">
               Practice And Win
            </span>
          </motion.div>

          <motion.h1
            variants={stagger(0.1)}
            initial="hidden"
            animate="show"
            className="text-5xl font-extrabold mb-4 leading-tight"
          >
            Coding{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Challenges
            </span>
          </motion.h1>

          <motion.p
            variants={stagger(0.15)}
            initial="hidden"
            animate="show"
            className="text-slate-400 text-lg max-w-2xl"
          >
            Pick a challenge, solve questions in our Monaco editor, and compete
            on the leaderboard 
          </motion.p>

          {/* Nav links */}
          <motion.div
            variants={stagger(0.2)}
            initial="hidden"
            animate="show"
            className="flex gap-3 mt-8"
          >
            <Link
              href="/challenges/leaderboard"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/25 text-yellow-400 text-sm font-semibold hover:bg-yellow-500/20 transition"
            >
              <FaTrophy size={13} />
              Leaderboard
            </Link>
            <button
              onClick={handleHistoryClick}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500/10 border border-purple-500/25 text-purple-400 text-sm font-semibold hover:bg-purple-500/20 transition"
            >
              <FaCode size={13} />
              My History
            </button>
          </motion.div>
        </div>
      </div>

      {/* ── Test Cards ─────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        {published.length === 0 ? (
          <div className="text-center py-20">
            <FaLock size={48} className="mx-auto text-slate-700 mb-4" />
            <p className="text-slate-400 text-xl font-semibold">
              No challenges published yet
            </p>
            <p className="text-slate-600 text-sm mt-2">
              Check back later — the admin will publish challenges soon.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {published.map((test, i) => {
              const diff = test.difficulty || "Medium";
              const diffStyle = DIFF_STYLES[diff] || DIFF_STYLES["Medium"];

              return (
                <motion.div
                  key={test._id}
                  variants={stagger(i * 0.06)}
                  initial="hidden"
                  animate="show"
                  whileHover={{ x: 4 }}
                  className="group bg-slate-900 border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer transition-all duration-300"
                >
                  {/* Left: info */}
                  <div className="flex items-start gap-5 flex-1 min-w-0">
                    {/* Index badge */}
                    <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 font-mono text-sm font-bold flex-shrink-0">
                      {String(i + 1).padStart(2, "0")}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-3 flex-wrap mb-2">
                        <h2 className="text-white font-semibold text-lg group-hover:text-cyan-300 transition-colors">
                          {test.title}
                        </h2>
                        <span
                          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${diffStyle}`}
                        >
                          {diff}
                        </span>
                        {test.isHot && (
                          <span className="flex items-center gap-1 text-xs text-orange-400 bg-orange-400/10 border border-orange-400/20 rounded-full px-2.5 py-0.5 font-semibold">
                            <FaFire size={10} /> Hot
                          </span>
                        )}
                      </div>

                      <p className="text-slate-500 text-sm line-clamp-2 mb-3">
                        {test.description}
                      </p>

                      {/* Stats */}
                      <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <FaClock size={12} className="text-cyan-500" />
                          {test.duration} min
                        </span>
                        <span className="flex items-center gap-1.5">
                          <FaCode size={12} className="text-purple-400" />
                          {test.codingQuestions?.length || 0} questions
                        </span>
                        <span className="flex items-center gap-1.5">
                          <FaTrophy size={12} className="text-yellow-400" />
                          {test.totalMarks} marks
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: CTA */}
                  <button
                    onClick={() => handleViewChallenge(test._id)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-sm font-semibold shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/35 transition-all duration-200 hover:scale-[1.03] flex-shrink-0 self-start sm:self-center"
                  >
                    View Challenge
                    <FaChevronRight size={11} />
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
