"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import {
  FiClock,
  FiBookOpen,
  FiCheckCircle,
  FiLayers,
  FiArrowRight,
  FiAward,
} from "react-icons/fi";
import { FaLeaf } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";

import { useAppDispatch, useAppselector } from "@/Redux/hooks/hooks";

import { getTestThunk, getQuestionThunk } from "@/Redux/slice/slice";

export default function MCQMainPage() {
  const dispatch = useAppDispatch();

  const router = useRouter();

  const { tests, isLoading } = useAppselector((state) => state.mainstore);
 // console.log("Test", tests);
  // =========================
  // FETCH TESTS
  // =========================

  useEffect(() => {
    dispatch(getTestThunk());
  }, [dispatch]);

  // =========================
  // FETCH QUESTION COUNT (only for logged-in users)
  // =========================

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && tests?.length) {
      tests.forEach((test) => {
        dispatch(getQuestionThunk(test._id));
      });
    }
  }, [dispatch, tests]);
  const handleStartExam = async (testId) => {
    const token = localStorage.getItem("token");

    if (!token) {
      const result = await Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "Please login to start this exam.",
        confirmButtonText: "Login",
        showCancelButton: true,
        color: "#fff",
        confirmButtonColor: "#06b6d4",
        cancelButtonColor: "#1e293b",
        background: "#081120",
      });

      if (result.isConfirmed) {
        router.push("/login");
      }

      return;
    }

    router.push(`/exam/${testId}`);
  };
  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-hidden relative pt-28 pb-14">
      {/* BACKGROUND GLOW */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-cyan-500/10 blur-[120px] rounded-full" />

      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full" />

      {/* CONTAINER */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-5">
            <HiSparkles className="text-cyan-300" />
            MCQ Examination System
          </div>

          <h1 className="text-4xl md:text-5xl font-black leading-tight mb-4">
            MCQ Examination Portal
          </h1>

          <p className="text-slate-400 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
            Choose your preferred test category and evaluate your skills with
            real-time MCQ examinations.
          </p>
        </motion.div>

        {/* LOADING */}
        {isLoading && (
          <div className="flex items-center justify-center py-32">
            <div className="w-14 h-14 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* TEST GRID */}
        {!isLoading && tests?.length > 0 && (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-7">
            {tests.map((test, index) => (
              <motion.div
                key={test._id}
                initial={{ opacity: 0, y: 35 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.05,
                }}
                whileHover={{
                  y: -6,
                }}
                className="group relative bg-[#07111f]/90 backdrop-blur-xl border border-slate-800 hover:border-cyan-500/40 rounded-3xl p-6 shadow-2xl transition-all duration-300 overflow-hidden"
              >
                {/* CARD GLOW */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5" />

                {/* TOP */}
                <div className="relative z-10 flex items-start justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                    <FiBookOpen className="text-white text-2xl" />
                  </div>

                  <div className="flex gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                      MCQ
                    </span>

                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 border border-green-500/20 text-green-400">
                      Active
                    </span>
                  </div>
                </div>

                {/* TITLE */}
                <div className="relative z-10 mb-5">
                  <h2 className="text-2xl font-bold text-white mb-2 line-clamp-1">
                    {test?.title}
                  </h2>

                  <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">
                    {test?.description ||
                      "Test your knowledge and improve your technical skills with this MCQ examination."}
                  </p>
                </div>

                {/* DETAILS */}
                <div className="relative z-10 space-y-3 mb-7">
                  {/* CATEGORY */}
                  <div className="flex items-center bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-3">
                    <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center mr-3">
                      <FiLayers className="text-cyan-400" />
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">Category</p>

                      <p className="text-sm font-semibold text-white">
                        {test?.category?.title || test?.category || "General"}
                      </p>
                    </div>
                  </div>

                  {/* DURATION */}
                  <div className="flex items-center bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center mr-3">
                      <FiClock className="text-blue-400" />
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">Duration</p>

                      <p className="text-sm font-semibold text-white">
                        {test?.duration || 10} Minutes
                      </p>
                    </div>
                  </div>

                  {/* PASS MARK */}
                  <div className="flex items-center bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-3">
                    <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center mr-3">
                      <FiAward className="text-green-400" />
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">Pass Mark</p>

                      <p className="text-sm font-semibold text-white">
                        {test?.passMark || 40}%
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-3">
                    <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center mr-3">
                      <FaLeaf className="text-green-500" />
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">Pass Mark</p>

                      <p className="text-sm font-semibold text-white">
                        {test?.difficulty}
                      </p>
                    </div>
                  </div>

                  {/* QUESTIONS */}
                  <div className="flex items-center bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-3">
                    <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center mr-3">
                      <FiCheckCircle className="text-purple-400" />
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">Total Questions</p>

                      <p className="text-sm font-semibold text-white">
                        {test?.questionsCount || test?.totalQuestions || 10}
                      </p>
                    </div>
                  </div>
                </div>

                {/* BUTTON */}
                <button
                  onClick={() => handleStartExam(test._id)}
                  className="relative z-10 w-full group/button overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3.5 font-bold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-cyan-500/20"
                >
                  <span className="flex items-center justify-center gap-2">
                    Start Examination
                    <FiArrowRight className="transition-transform duration-300 group-hover/button:translate-x-1" />
                  </span>
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {/* EMPTY */}
        {!isLoading && tests?.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-28 text-center"
          >
            <div className="w-24 h-24 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-6">
              <FiBookOpen className="text-4xl text-slate-500" />
            </div>

            <h2 className="text-2xl font-bold mb-3">No Tests Available</h2>

            <p className="text-slate-400 max-w-md">
              There are currently no active tests available. Please check again
              later.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
