"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

import {
  FiCode,
  FiClock,
  FiBookOpen,
  FiAlertCircle,
  FiAward,
  FiCheckCircle,
  FiTrash2,
  FiEdit2,
  FiFileText,
} from "react-icons/fi";

import {
  createCodingTestThunk,
  getCodingTestThunk,
  updateCodingTestThunk,
  deleteCodingTestThunk,
} from "@/Redux/slice/codingSlice";

import { useAppDispatch, useAppselector } from "@/Redux/hooks/hooks";
import { getAllCategory } from "@/Redux/slice/slice";

export default function CodingTest() {
  const dispatch = useAppDispatch();

  const { codingTests, isLoading } = useAppselector(
    (state) => state.codingStore,
  );
  const { categories } = useAppselector((state) => state.mainstore);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();

  // =========================
  // LOAD DATA
  // =========================

  useEffect(() => {
    dispatch(getCodingTestThunk());
    dispatch(getAllCategory());
  }, [dispatch]);

  // =========================
  // CREATE TEST
  // =========================

  const onSubmit = async (data) => {
    try {
      const payload = {
        title: data.title,
        slug: data.slug,
        description: data.description,
        category: data.category,
        duration: Number(data.duration),
        totalMarks: Number(data.totalMarks),
        difficulty: data.difficulty,
        instructions: data.instructions,
        isPublished: data.isPublished === "true",
      };

      const response = await dispatch(createCodingTestThunk(payload));

      if (response.payload?.success) {
        toast.success("Coding Test Created Successfully");

        reset();

        dispatch(getCodingTestThunk());
      } else {
        toast.error(
          response.payload?.message || "Failed To Create Coding Test",
        );
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  // =========================
  // DELETE
  // =========================

  const handleDelete = async (id) => {
    const response = await dispatch(deleteCodingTestThunk(id));

    if (response.payload?.success) {
      toast.success("Coding Test Deleted");
      dispatch(getCodingTestThunk());
    } else {
      toast.error("Delete Failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white px-4 md:px-6 py-24">
      {/* BACKGROUND GLOW */}
      <div className="fixed top-0 left-0 w-[400px] h-[400px] bg-cyan-500/10 blur-[140px] rounded-full" />
      <div className="fixed bottom-0 right-0 w-[400px] h-[400px] bg-blue-500/10 blur-[140px] rounded-full" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-4">
              <FiCode />
              Coding Assessment Panel
            </div>

            <h1 className="text-4xl md:text-5xl font-black tracking-tight">
              Coding Test Management
            </h1>

            <p className="text-slate-400 mt-3 max-w-2xl">
              Create professional coding assessments, manage test difficulty,
              publishing status and evaluate candidates efficiently.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#0f172a]/80 border border-slate-800 rounded-2xl px-6 py-5 min-w-[160px]">
              <p className="text-slate-400 text-sm">Total Tests</p>

              <h2 className="text-3xl font-bold text-cyan-400 mt-1">
                {codingTests?.length || 0}
              </h2>
            </div>

            <div className="bg-[#0f172a]/80 border border-slate-800 rounded-2xl px-6 py-5 min-w-[160px]">
              <p className="text-slate-400 text-sm">Published</p>

              <h2 className="text-3xl font-bold text-green-400 mt-1">
                {codingTests?.filter((t) => t.isPublished)?.length}
              </h2>
            </div>
          </div>
        </motion.div>

        {/* CREATE FORM */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0f172a]/90 backdrop-blur-xl border border-slate-800 rounded-[32px] p-6 md:p-8 shadow-2xl mb-10"
        >
          {/* FORM HEADER */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20 flex items-center justify-center">
              <FiCode className="text-cyan-400 text-2xl" />
            </div>

            <div>
              <h2 className="text-2xl font-bold">Create Coding Test</h2>

              <p className="text-slate-400 text-sm mt-1">
                Configure coding challenge settings
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid md:grid-cols-2 gap-6"
          >
            {/* TITLE */}
            <div>
              <label className="text-sm text-slate-300 mb-2 block">
                Test Title
              </label>

              <input
                type="text"
                placeholder="Javascript Interview Test"
                {...register("title", {
                  required: "Title is required",
                })}
                className="w-full bg-[#020617] border border-slate-700 rounded-2xl px-5 py-3.5 outline-none focus:border-cyan-500 transition"
              />

              {errors.title && (
                <p className="text-red-400 text-sm mt-2">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* SLUG */}
            <div>
              <label className="text-sm text-slate-300 mb-2 block">Slug</label>

              <input
                type="text"
                placeholder="javascript-interview-test"
                {...register("slug", {
                  required: "Slug is required",
                })}
                className="w-full bg-[#020617] border border-slate-700 rounded-2xl px-5 py-3.5 outline-none focus:border-cyan-500 transition"
              />
            </div>

            {/* CATEGORY */}
            <div>
              <label className="text-sm text-slate-300 mb-2 block">
                Category
              </label>

              <select
                {...register("category", {
                  required: "Category is required",
                })}
                className="w-full bg-[#020617] border border-slate-700 rounded-2xl px-5 py-3.5 outline-none focus:border-cyan-500 transition"
              >
                <option value="">Select Category</option>

                {categories?.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* DURATION */}
            <div>
              <label className="text-sm text-slate-300 mb-2 block">
                Duration (Minutes)
              </label>

              <input
                type="number"
                placeholder="60"
                {...register("duration", {
                  required: true,
                })}
                className="w-full bg-[#020617] border border-slate-700 rounded-2xl px-5 py-3.5 outline-none focus:border-cyan-500 transition"
              />
            </div>

            {/* MARKS */}
            <div>
              <label className="text-sm text-slate-300 mb-2 block">
                Total Marks
              </label>

              <input
                type="number"
                placeholder="100"
                {...register("totalMarks", {
                  required: true,
                })}
                className="w-full bg-[#020617] border border-slate-700 rounded-2xl px-5 py-3.5 outline-none focus:border-cyan-500 transition"
              />
            </div>

            {/* DIFFICULTY */}
            <div>
              <label className="text-sm text-slate-300 mb-2 block">
                Difficulty
              </label>

              <select
                {...register("difficulty")}
                className="w-full bg-[#020617] border border-slate-700 rounded-2xl px-5 py-3.5 outline-none focus:border-cyan-500 transition"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            {/* DESCRIPTION */}
            <div className="md:col-span-2">
              <label className="text-sm text-slate-300 mb-2 block">
                Description
              </label>

              <textarea
                rows={4}
                placeholder="Write coding test details..."
                {...register("description", {
                  required: true,
                })}
                className="w-full bg-[#020617] border border-slate-700 rounded-2xl px-5 py-4 resize-none outline-none focus:border-cyan-500 transition"
              />
            </div>

            {/* INSTRUCTIONS */}
            <div className="md:col-span-2">
              <label className="text-sm text-slate-300 mb-2 block">
                Instructions
              </label>

              <textarea
                rows={4}
                placeholder="Read all questions carefully..."
                {...register("instructions")}
                className="w-full bg-[#020617] border border-slate-700 rounded-2xl px-5 py-4 resize-none outline-none focus:border-cyan-500 transition"
              />
            </div>

            {/* PUBLISH */}
            <div>
              <label className="text-sm text-slate-300 mb-2 block">
                Publish Status
              </label>

              <select
                {...register("isPublished")}
                className="w-full bg-[#020617] border border-slate-700 rounded-2xl px-5 py-3.5 outline-none"
              >
                <option value="false">Draft</option>
                <option value="true">Published</option>
              </select>
            </div>

            {/* BUTTON */}
            <div className="flex items-end">
              <button
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 transition-all duration-300 py-3.5 rounded-2xl font-bold shadow-lg shadow-cyan-500/20 disabled:opacity-50"
              >
                {isLoading ? "Processing..." : "Create Coding Test"}
              </button>
            </div>
          </form>
        </motion.div>

        {/* TEST TABLE */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0f172a]/90 backdrop-blur-xl border border-slate-800 rounded-[32px] overflow-hidden shadow-2xl"
        >
          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 border-b border-slate-800">
            <div>
              <h2 className="text-2xl font-bold">All Coding Tests</h2>

              <p className="text-slate-400 text-sm mt-1">
                Manage coding assessments professionally
              </p>
            </div>

            <div className="px-5 py-2 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-semibold">
              {codingTests?.length || 0} Total Tests
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead className="bg-[#020617]">
                <tr>
                  <th className="text-left px-6 py-5 text-slate-400 text-sm">
                    Test
                  </th>

                  <th className="text-left px-6 py-5 text-slate-400 text-sm">
                    Difficulty
                  </th>

                  <th className="text-left px-6 py-5 text-slate-400 text-sm">
                    Duration
                  </th>

                  <th className="text-left px-6 py-5 text-slate-400 text-sm">
                    Marks
                  </th>

                  <th className="text-left px-6 py-5 text-slate-400 text-sm">
                    Status
                  </th>

                  <th className="text-left px-6 py-5 text-slate-400 text-sm">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {codingTests?.map((test) => (
                  <tr
                    key={test._id}
                    className="border-t border-slate-800 hover:bg-slate-900/40 transition-all duration-300"
                  >
                    {/* TEST */}
                    <td className="px-6 py-5">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                          <FiCode className="text-cyan-400 text-xl" />
                        </div>

                        <div>
                          <h3 className="font-semibold text-white text-lg">
                            {test.title}
                          </h3>

                          <p className="text-slate-400 text-sm mt-1 max-w-md">
                            {test.description?.slice(0, 90)}
                            ...
                          </p>

                          <div className="flex items-center gap-2 mt-3">
                            <span className="px-2 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 text-xs">
                              {test.category?.name || "Coding"}
                            </span>

                            <span className="px-2 py-1 rounded-lg bg-purple-500/10 text-purple-400 text-xs">
                              {test.slug}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* DIFFICULTY */}
                    <td className="px-6 py-5">
                      <span
                        className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                          test.difficulty === "easy"
                            ? "bg-green-500/10 text-green-400 border border-green-500/20"
                            : test.difficulty === "medium"
                              ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                              : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}
                      >
                        {test.difficulty}
                      </span>
                    </td>

                    {/* DURATION */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-white">
                        <FiClock className="text-cyan-400" />
                        {test.duration} min
                      </div>
                    </td>

                    {/* MARKS */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-white">
                        <FiAward className="text-yellow-400" />

                        {test.totalMarks}
                      </div>
                    </td>

                    {/* STATUS */}
                    <td className="px-6 py-5">
                      {test.isPublished ? (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-semibold">
                          <FiCheckCircle />
                          Published
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-semibold">
                          <FiAlertCircle />
                          Draft
                        </div>
                      )}
                    </td>

                    {/* ACTIONS */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <button className="w-11 h-11 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center hover:bg-blue-500/20 transition">
                          <FiEdit2 />
                        </button>

                        <button
                          onClick={() => handleDelete(test._id)}
                          className="w-11 h-11 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500/20 transition"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* EMPTY */}
            {!codingTests?.length && (
              <div className="py-24 text-center">
                <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-6">
                  <FiFileText className="text-5xl text-slate-600" />
                </div>

                <h3 className="text-2xl font-bold text-white">
                  No Coding Tests Found
                </h3>

                <p className="text-slate-400 mt-2">
                  Create your first coding assessment now
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
