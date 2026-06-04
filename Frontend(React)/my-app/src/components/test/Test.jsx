"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiBookOpen,
  FiClock,
  FiAward,
  FiLayers,
} from "react-icons/fi";

import {
  createTestThunk,
  getTestThunk,
  updateTestThunk,
  deleteTestThunk,
  getAllCategory,
} from "@/Redux/slice/slice";

import { useAppDispatch, useAppselector } from "@/Redux/hooks/hooks";

export default function Test() {
  const dispatch = useAppDispatch();

  const { tests, categories, isLoading } = useAppselector(
    (state) => state.mainstore,
  );
  //console.log("Test", tests);
  //console.log("Category",categories)
  const [editingId, setEditingId] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();

  // Fetch data
  useEffect(() => {
    dispatch(getTestThunk());
    dispatch(getAllCategory());
  }, [dispatch]);

  // Create & Update
  const onSubmit = async (data) => {
    try {
      if (editingId) {
        const response = await dispatch(
          updateTestThunk({
            id: editingId,
            data,
          }),
        );

        if (response.payload?.success) {
          toast.success("Test Updated Successfully");
          reset();
          setEditingId(null);
          dispatch(getTestThunk());
        } else {
          toast.error(response.payload?.message || "Update Failed");
        }
      } else {
        const response = await dispatch(createTestThunk(data));

        if (response.payload?.success) {
          toast.success("Test Created Successfully");
          reset();
          dispatch(getTestThunk());
        } else {
          toast.error(response.payload?.message || "Creation Failed");
        }
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  // Delete
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Test?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#1e293b",
      confirmButtonText: "Delete",
      background: "#020617",
      color: "#fff",
    });

    if (result.isConfirmed) {
      const response = await dispatch(deleteTestThunk(id));

      if (response.payload?.success) {
        toast.success("Test Deleted Successfully");
        dispatch(getTestThunk());
      } else {
        toast.error("Delete Failed");
      }
    }
  };

  // Edit
  const handleEdit = (test) => {
    setEditingId(test._id);

    setValue("title", test.title);
    setValue("description", test.description);
    setValue("duration", test.duration);
    setValue("totalMarks", test.totalMarks);
    setValue("difficulty", test.difficulty);
    setValue("categoryId", test.category?._id || "");
  };

  return (
    <div className="min-h-screen bg-[#020617] p-6">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white">Test Management</h1>

        <p className="text-slate-400 mt-2">
          Create and manage MCQ tests professionally
        </p>
      </motion.div>

      <div className="space-y-6">
        {/* FORM */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full"
        >
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <FiPlus className="text-cyan-400" />
              {editingId ? "Update Test" : "Create Test"}
            </h2>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="grid md:grid-cols-2 gap-5"
            >
              {/* TITLE */}
              <div>
                <label className="text-sm text-slate-300 mb-2 block">
                  Test Title
                </label>

                <input
                  type="text"
                  placeholder="JavaScript MCQ Test"
                  {...register("title", {
                    required: "Title required",
                  })}
                  className="w-full bg-[#020617] border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500"
                />

                {errors.title && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* CATEGORY */}
              <div>
                <label className="text-sm text-slate-300 mb-2 block">
                  Category
                </label>

                <select
                  {...register("categoryId", {
                    required: "Category is required",
                  })}
                  className="w-full bg-[#020617] border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500"
                >
                  <option value="">Select Category</option>

                  {categories?.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>

                {errors.category && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.category.message}
                  </p>
                )}
              </div>

              {/* DESCRIPTION */}
              <div className="md:col-span-2">
                <label className="text-sm text-slate-300 mb-2 block">
                  Description
                </label>

                <textarea
                  rows={4}
                  placeholder="Enter description..."
                  {...register("description")}
                  className="w-full bg-[#020617] border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500"
                />
              </div>

              {/* DURATION */}
              <div>
                <label className="text-sm text-slate-300 mb-2 block">
                  Duration (Minutes)
                </label>

                <input
                  type="number"
                  placeholder="30"
                  {...register("duration", {
                    required: "Duration is required",
                    valueAsNumber: true,
                  })}
                  className="w-full bg-[#020617] border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500"
                />

                {errors.duration && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.duration.message}
                  </p>
                )}
              </div>

              {/* MARKS */}
              <div>
                <label className="text-sm text-slate-300 mb-2 block">
                  Total Marks
                </label>

                <input
                  type="number"
                  placeholder="50"
                  {...register("totalMarks", {
                    required: "Total marks is required",
                    valueAsNumber: true,
                  })}
                  className="w-full bg-[#020617] border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500"
                />

                {errors.totalMarks && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.totalMarks.message}
                  </p>
                )}
              </div>

              {/* DIFFICULTY */}
              <div>
                <label className="text-sm text-slate-300 mb-2 block">
                  Difficulty
                </label>

                <select
                  {...register("difficulty", {
                    required: "Difficulty is required",
                  })}
                  className="w-full bg-[#020617] border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>

                {errors.difficulty && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.difficulty.message}
                  </p>
                )}
              </div>

              {/* BUTTON */}
              <div className="md:col-span-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-cyan-500/20 transition-all disabled:opacity-50"
                >
                  {editingId ? "Update Test" : "Create Test"}
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>

        {/* TABLE */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full"
        >
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            {/* HEADER */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">All Tests</h2>

                <p className="text-slate-400 text-sm mt-1">
                  Manage all created tests
                </p>
              </div>

              <div className="bg-cyan-500/10 border border-cyan-500/20 px-4 py-2 rounded-xl text-cyan-400 text-sm">
                {tests?.length || 0} Tests
              </div>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#020617]">
                  <tr>
                    <th className="text-left px-6 py-4 text-slate-400 text-sm">
                      Test
                    </th>

                    <th className="text-left px-6 py-4 text-slate-400 text-sm">
                      Category
                    </th>

                    <th className="text-left px-6 py-4 text-slate-400 text-sm">
                      Duration
                    </th>

                    <th className="text-left px-6 py-4 text-slate-400 text-sm">
                      Marks
                    </th>

                    <th className="text-left px-6 py-4 text-slate-400 text-sm">
                      Difficulty
                    </th>

                    <th className="text-left px-6 py-4 text-slate-400 text-sm">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {tests?.map((test) => (
                    <tr
                      key={test._id}
                      className="border-t border-slate-800 hover:bg-slate-900/40 transition-all"
                    >
                      {/* TEST */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                            <FiBookOpen className="text-cyan-400" />
                          </div>

                          <div>
                            <h3 className="text-white font-medium">
                              {test.title}
                            </h3>

                            <p className="text-slate-400 text-sm mt-1 line-clamp-1">
                              {test.description || "No description"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* CATEGORY */}
                      <td className="px-6 py-5 text-slate-300">
                        <span className="bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full text-xs font-medium text-cyan-400">
                          {test.categoryId?.name || test.category?.name || "Uncategorized"}
                        </span>
                      </td>
                      
                      {/* DURATION */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-slate-300">
                          <FiClock className="text-cyan-400" />
                          {test.duration} min
                        </div>
                      </td>

                      {/* MARKS */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-slate-300">
                          <FiAward className="text-yellow-400" />
                          {test.totalMarks}
                        </div>
                      </td>

                      {/* DIFFICULTY */}
                      <td className="px-6 py-5">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            test.difficulty === "Easy"
                              ? "bg-green-500/10 text-green-400"
                              : test.difficulty === "Medium"
                                ? "bg-yellow-500/10 text-yellow-400"
                                : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {test.difficulty}
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleEdit(test)}
                            className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center hover:bg-blue-500/20 transition-all"
                          >
                            <FiEdit2 />
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDelete(test._id)}
                            className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500/20 transition-all"
                          >
                            <FiTrash2 />
                          </motion.button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {!tests?.length && (
                <div className="p-12 text-center">
                  <FiLayers className="mx-auto text-5xl text-slate-600 mb-4" />

                  <h3 className="text-white text-lg font-semibold">
                    No Tests Found
                  </h3>

                  <p className="text-slate-400 mt-2">
                    Create your first test now
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
