"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

import {
  FiFolder,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiLayers,
  FiFileText,
  FiHash,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";

import { MdCategory } from "react-icons/md";

import { useAppDispatch, useAppselector } from "@/Redux/hooks/hooks";

import {
  createCategory,
  updateCategory,
  deleteCategory,
  getAllCategory,
} from "@/Redux/slice/slice";

const fadeUp = (delay = 0) => ({
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
  transition: {
    duration: 0.5,
    delay,
  },
});

export default function Category() {
  const dispatch = useAppDispatch();

  const { categories, isLoading } = useAppselector((state) => state.mainstore);

  const [editId, setEditId] = useState(null);
  const [btnLoading, setBtnLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();

  // load category
  useEffect(() => {
    dispatch(getAllCategory());
  }, [dispatch]);

  // create + update
  const onSubmit = async (data) => {
    setBtnLoading(true);

    try {
      if (editId) {
        const res = await dispatch(
          updateCategory({
            id: editId,
            data,
          }),
        );

        if (updateCategory.fulfilled.match(res)) {
          toast.success("Category updated successfully");

          setEditId(null);

          reset();

          dispatch(getAllCategory());
        } else {
          toast.error(res.payload?.message || "Update failed");
        }
      } else {
        const res = await dispatch(createCategory(data));

        if (createCategory.fulfilled.match(res)) {
          toast.success("Category created successfully");

          reset();

          dispatch(getAllCategory());
        } else {
          toast.error(res.payload?.message || "Create failed");
        }
      }
    } finally {
      setBtnLoading(false);
    }
  };

  // delete
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Category?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#1e293b",
      confirmButtonText: "Yes, Delete",
      background: "#081120",
      color: "#fff",
    });

    if (result.isConfirmed) {
      const res = await dispatch(deleteCategory(id));

      if (deleteCategory.fulfilled.match(res)) {
        Swal.fire({
          title: "Deleted!",
          text: "Category deleted successfully",
          icon: "success",
          background: "#081120",
          color: "#fff",
          confirmButtonColor: "#06b6d4",
        });

        dispatch(getAllCategory());
      } else {
        Swal.fire({
          title: "Error",
          text: res.payload?.message || "Delete failed",
          icon: "error",
          background: "#081120",
          color: "#fff",
          confirmButtonColor: "#ef4444",
        });
      }
    }
  };

  // edit
  const handleEdit = (item) => {
    setEditId(item._id);

    setValue("name", item.name);
    setValue("slug", item.slug);
    setValue("description", item.description);
    setValue("icon", item.icon);
    setValue("isActive", item.isActive);
  };

  return (
    <div className="relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        {/* header */}
        <motion.div {...fadeUp(0)} className="mb-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <MdCategory className="text-cyan-400 text-3xl" />
            </div>

            <div>
              <h1 className="text-4xl font-extrabold text-white">
                Category Management
              </h1>

              <p className="text-gray-400 mt-2">
                Create and manage interview categories professionally
              </p>
            </div>
          </div>
        </motion.div>

        {/* form */}
        <motion.div
          {...fadeUp(0.1)}
          className="bg-[#081120] border border-white/10 rounded-3xl p-8 mb-8 shadow-2xl"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <FiPlus className="text-cyan-400 text-xl" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white">
                {editId ? "Update Category" : "Create Category"}
              </h2>

              <p className="text-gray-500 text-sm mt-1">
                Add category information below
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* name */}
            <div>
              <label className="text-gray-300 text-sm mb-2 block">
                Category Name
              </label>

              <div className="relative">
                <FiFolder className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />

                <input
                  type="text"
                  placeholder="Frontend Development"
                  {...register("name", {
                    required: "Name is required",
                  })}
                  className="w-full h-14 bg-[#0d1b2e] border border-white/10 rounded-2xl pl-12 pr-4 text-white outline-none focus:border-cyan-500 transition-all"
                />
              </div>

              {errors.name && (
                <p className="text-red-400 text-sm mt-2">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* slug */}
            <div>
              <label className="text-gray-300 text-sm mb-2 block">Slug</label>

              <div className="relative">
                <FiHash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />

                <input
                  type="text"
                  placeholder="frontend-development"
                  {...register("slug")}
                  className="w-full h-14 bg-[#0d1b2e] border border-white/10 rounded-2xl pl-12 pr-4 text-white outline-none focus:border-cyan-500 transition-all"
                />
              </div>
            </div>

            {/* icon */}
            <div>
              <label className="text-gray-300 text-sm mb-2 block">Icon</label>

              <div className="relative">
                <FiLayers className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />

                <input
                  type="text"
                  placeholder="FaReact"
                  {...register("icon")}
                  className="w-full h-14 bg-[#0d1b2e] border border-white/10 rounded-2xl pl-12 pr-4 text-white outline-none focus:border-cyan-500 transition-all"
                />
              </div>
            </div>

            {/* active */}
            <div>
              <label className="text-gray-300 text-sm mb-2 block">Status</label>

              <select
                {...register("isActive")}
                className="w-full h-14 bg-[#0d1b2e] border border-white/10 rounded-2xl px-4 text-white outline-none focus:border-cyan-500 transition-all"
              >
                <option value={true}>Active</option>

                <option value={false}>Inactive</option>
              </select>
            </div>

            {/* description */}
            <div className="md:col-span-2">
              <label className="text-gray-300 text-sm mb-2 block">
                Description
              </label>

              <div className="relative">
                <FiFileText className="absolute left-4 top-5 text-gray-500" />

                <textarea
                  rows={5}
                  placeholder="Write category description..."
                  {...register("description")}
                  className="w-full bg-[#0d1b2e] border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:border-cyan-500 transition-all resize-none"
                />
              </div>
            </div>

            {/* button */}
            <div className="md:col-span-2 flex justify-end">
              <motion.button
                whileHover={{
                  scale: 1.03,
                }}
                whileTap={{
                  scale: 0.95,
                }}
                disabled={btnLoading}
                type="submit"
                className="h-14 px-8 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-lg shadow-cyan-500/20 flex items-center gap-3 hover:shadow-cyan-500/40 transition-all disabled:opacity-70"
              >
                {btnLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FiPlus />
                    {editId ? "Update Category" : "Create Category"}
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>

        {/* table */}
        <motion.div
          {...fadeUp(0.2)}
          className="bg-[#081120] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
        >
          {/* top */}
          <div className="px-8 py-6 border-b border-white/10 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Categories List</h2>

              <p className="text-gray-500 text-sm mt-1">
                Manage all categories easily
              </p>
            </div>

            <div className="bg-cyan-500/10 border border-cyan-500/20 px-4 py-2 rounded-xl text-cyan-400 font-semibold">
              {categories?.length || 0} Total
            </div>
          </div>

          {/* table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/[0.03]">
                <tr>
                  <th className="text-left px-8 py-5 text-gray-400 text-sm">
                    #
                  </th>

                  <th className="text-left px-8 py-5 text-gray-400 text-sm">
                    Category
                  </th>

                  <th className="text-left px-8 py-5 text-gray-400 text-sm">
                    Slug
                  </th>

                  <th className="text-left px-8 py-5 text-gray-400 text-sm">
                    Status
                  </th>

                  <th className="text-left px-8 py-5 text-gray-400 text-sm">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <div className="flex justify-center">
                        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    </td>
                  </tr>
                ) : categories?.length > 0 ? (
                  categories.map((item, index) => (
                    <motion.tr
                      key={item._id}
                      initial={{
                        opacity: 0,
                      }}
                      animate={{
                        opacity: 1,
                      }}
                      className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-all"
                    >
                      <td className="px-8 py-6 text-gray-400">{index + 1}</td>

                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                            <FiFolder className="text-cyan-400 text-lg" />
                          </div>

                          <div>
                            <h3 className="text-white font-semibold">
                              {item.name}
                            </h3>

                            <p className="text-gray-500 text-sm mt-1">
                              {item.description?.slice(0, 40) ||
                                "No description"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-8 py-6 text-gray-400">{item.slug}</td>

                      <td className="px-8 py-6">
                        {item.isActive ? (
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
                            <FiCheckCircle />
                            Active
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            <FiXCircle />
                            Inactive
                          </div>
                        )}
                      </td>

                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          {/* edit */}
                          <motion.button
                            whileHover={{
                              scale: 1.08,
                            }}
                            whileTap={{
                              scale: 0.95,
                            }}
                            onClick={() => handleEdit(item)}
                            className="w-11 h-11 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 hover:bg-blue-500/20 transition-all"
                          >
                            <FiEdit2 />
                          </motion.button>

                          {/* delete */}
                          <motion.button
                            whileHover={{
                              scale: 1.08,
                            }}
                            whileTap={{
                              scale: 0.95,
                            }}
                            onClick={() => handleDelete(item._id)}
                            className="w-11 h-11 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-all"
                          >
                            <FiTrash2 />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-5">
                          <FiFolder className="text-4xl text-gray-600" />
                        </div>

                        <h3 className="text-2xl font-bold text-white">
                          No Categories Found
                        </h3>

                        <p className="text-gray-500 mt-2">
                          Create your first category now
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
