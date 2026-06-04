"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiHelpCircle,
  FiCheckCircle,
  FiClock,
  FiList,
} from "react-icons/fi";

import {
  createQuestionThunk,
  getQuestionThunk,
  updateQuestionThunk,
  deleteQuestionThunk,
  getTestThunk,
} from "@/Redux/slice/slice";

import { getAllQuestionThunk } from "@/Redux/slice/slice";

import { useAppDispatch, useAppselector } from "@/Redux/hooks/hooks";
import { useParams } from "next/navigation";

export default function Question() {
  const dispatch = useAppDispatch();
  const params = useParams();

  const { tests, questions, isLoading } = useAppselector(
    (state) => state.mainstore,
  );

  const [editingId, setEditingId] = useState(null);
  const [selectedTest, setSelectedTest] = useState("all");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      testId: "all",
      question: "",
      option1: "",
      option2: "",
      option3: "",
      option4: "",
      correctAnswer: "",
      explanation: "",
      marks: "",
      questionTime: "",
    },
  });

  // =========================
  // LOAD TESTS
  // =========================
  useEffect(() => {
    dispatch(getTestThunk());
  }, [dispatch]);

  // =========================
  // SET TEST FROM URL (optional)
  // =========================
  useEffect(() => {
    if (params?.testId) {
      setSelectedTest(params.testId);
      setValue("testId", params.testId);
    }
  }, [params?.testId]);

  // =========================
  // MAIN FETCH LOGIC (FIXED)
  // =========================
  useEffect(() => {
    if (selectedTest === "all") {
      dispatch(getAllQuestionThunk());
    } else {
      dispatch(getQuestionThunk(selectedTest));
    }
  }, [selectedTest, dispatch]);

  // =========================
  // SUBMIT
  // =========================
  const onSubmit = async (data) => {
    try {
      const payload = {
        testId: selectedTest,
        question: data.question,
        options: [data.option1, data.option2, data.option3, data.option4],
        correctAnswer: data.correctAnswer,
        explanation: data.explanation,
        marks: Number(data.marks),
        questionTime: Number(data.questionTime),
      };

      let response;

      if (editingId) {
        response = await dispatch(
          updateQuestionThunk({ id: editingId, data: payload }),
        );

        if (response.payload?.success) {
          toast.success("Question Updated Successfully");
        } else {
          toast.error("Update Failed");
          return;
        }
      } else {
        response = await dispatch(createQuestionThunk(payload));

        if (response.payload?.success) {
          toast.success("Question Created Successfully");
        } else {
          toast.error("Creation Failed");
          return;
        }
      }

      resetForm();
      refreshQuestions();
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  // =========================
  // REFRESH DATA
  // =========================
  const refreshQuestions = () => {
    if (selectedTest === "all") {
      dispatch(getAllQuestionThunk());
    } else {
      dispatch(getQuestionThunk(selectedTest));
    }
  };

  // =========================
  // RESET FORM
  // =========================
  const resetForm = () => {
    reset({
      testId: selectedTest,
      question: "",
      option1: "",
      option2: "",
      option3: "",
      option4: "",
      correctAnswer: "",
      explanation: "",
      marks: "",
      questionTime: "",
    });

    setEditingId(null);
  };

  // =========================
  // DELETE
  // =========================
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Question?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#1e293b",
      confirmButtonText: "Delete",
      background: "#020617",
      color: "#fff",
    });

    if (!result.isConfirmed) return;

    const response = await dispatch(deleteQuestionThunk(id));

    if (response.payload?.success) {
      toast.success("Question Deleted Successfully");
      refreshQuestions();
    } else {
      toast.error("Delete Failed");
    }
  };

  // =========================
  // EDIT
  // =========================
  const handleEdit = (question) => {
    setEditingId(question._id);

    const testId = question.test?._id || "all";

    setSelectedTest(testId);
    setValue("testId", testId);

    setValue("question", question.question);
    setValue("option1", question.options?.[0] || "");
    setValue("option2", question.options?.[1] || "");
    setValue("option3", question.options?.[2] || "");
    setValue("option4", question.options?.[3] || "");
    setValue("correctAnswer", question.correctAnswer);
    setValue("explanation", question.explanation);
    setValue("marks", question.marks);
    setValue("questionTime", question.questionTime);
  };

  return (
    <div className="min-h-screen bg-[#020617] p-6">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Question Management</h1>
        <p className="text-slate-400 mt-2">
          Create and manage MCQ questions professionally
        </p>
      </div>

      <div className="space-y-6">
        {/* FORM */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <FiPlus className="text-cyan-400" />
            {editingId ? "Update Question" : "Create Question"}
          </h2>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid md:grid-cols-2 gap-5"
          >
            {/* SELECT TEST */}
            <div>
              <label className="text-sm text-slate-300 mb-2 block">
                Select Test
              </label>

              <select
                value={selectedTest}
                onChange={(e) => {
                  setSelectedTest(e.target.value);
                  setValue("testId", e.target.value);
                }}
                className="w-full bg-[#020617] border border-slate-700 rounded-xl px-4 py-3 text-white outline-none"
              >
                <option value="all">All Questions</option>

                {tests?.map((test) => (
                  <option key={test._id} value={test._id}>
                    {test.title}
                  </option>
                ))}
              </select>
            </div>

            {/* MARKS */}
            <div>
              <label className="text-sm text-slate-300 mb-2 block">Marks Per Question</label>
              <input
                type="number"
                {...register("marks", { required: true })}
                className="w-full bg-[#020617] border border-slate-700 rounded-xl px-4 py-3 text-white outline-none"
              />
            </div>

            {/* QUESTION */}
            <div className="md:col-span-2">
              <label className="text-sm text-slate-300 mb-2 block">
                Question Title
              </label>
              <textarea
                rows={3}
                {...register("question", { required: true })}
                className="w-full bg-[#020617] border border-slate-700 rounded-xl px-4 py-3 text-white outline-none"
              />
            </div>

            {/* OPTIONS */}

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-300 mb-4 block">
                Give Options
              </label>

              <div className="grid md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((num) => (
                  <div key={num}>
                    <label className="text-sm text-slate-400 mb-2 block">
                      Option {num}
                    </label>

                    <input
                      type="text"
                      placeholder={`Enter Option ${num}`}
                      {...register(`option${num}`, {
                        required: true,
                      })}
                      className="w-full bg-[#020617] border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500 transition-all duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* ANSWER */}
            <input
              placeholder="Correct Answer"
              {...register("correctAnswer", { required: true })}
              className="w-full bg-[#020617] border border-slate-700 rounded-xl px-4 py-3 text-white outline-none"
            />

            {/* TIME */}
            <input
              type="number"
              placeholder="Time (sec)"
              {...register("questionTime", { required: true })}
              className="w-full bg-[#020617] border border-slate-700 rounded-xl px-4 py-3 text-white outline-none"
            />

            {/* BUTTON */}
            <button
              disabled={isLoading}
              className="md:col-span-2 bg-gradient-to-r from-cyan-500 to-blue-600 py-3 rounded-xl text-white font-semibold"
            >
              {editingId ? "Update Question" : "Create Question"}
            </button>
          </form>
        </div>

        {/* TABLE */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {/* HEADER */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-white text-xl font-semibold">
                All Questions
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Manage MCQ questions with full control
              </p>
            </div>

            <div className="bg-cyan-500/10 border border-cyan-500/20 px-4 py-2 rounded-xl text-cyan-400 text-sm font-medium">
              {questions?.length || 0} Questions
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              {/* TABLE HEAD */}
              <thead className="bg-[#020617] text-slate-400 uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-4 text-left">Question</th>
                  <th className="px-6 py-4 text-left">Options</th>
                  <th className="px-6 py-4 text-left">Correct Answer</th>
                  <th className="px-6 py-4 text-left">Marks</th>
                  <th className="px-6 py-4 text-left">Time</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {questions?.map((q, index) => (
                  <tr
                    key={q._id}
                    className="border-t border-slate-800 hover:bg-slate-900/50 transition"
                  >
                    {/* QUESTION */}
                    <td className="px-6 py-5 text-white font-medium max-w-[250px]">
                      <div className="line-clamp-2">{q.question}</div>
                    </td>

                    {/* OPTIONS */}
                    <td className="px-6 py-5">
                      <div className="flex flex-wrap gap-2">
                        {q.options?.map((opt, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 rounded-md bg-[#020617] border border-slate-700 text-slate-300 text-xs"
                          >
                            {opt}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* CORRECT ANSWER */}
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-medium">
                        {/* check icon */}
                        <span className="text-green-400">✔</span>

                        {q.correctAnswer}
                      </span>
                    </td>

                    {/* MARKS */}
                    <td className="px-6 py-5 text-slate-300 font-medium">
                      {q.marks}
                    </td>

                    {/* TIME */}
                    <td className="px-6 py-5 text-slate-300">
                      <div className="flex items-center gap-1">
                        <span className="text-cyan-400">⏱</span>
                        {q.questionTime}s
                      </div>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleEdit(q)}
                          className="w-9 h-9 flex items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition"
                        >
                          <FiEdit2 size={16} />
                        </button>

                        <button
                          onClick={() => handleDelete(q._id)}
                          className="w-9 h-9 flex items-center justify-center rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* EMPTY STATE */}
            {!questions?.length && (
              <div className="p-14 text-center">
                <FiList className="mx-auto text-5xl text-slate-600 mb-3" />
                <h3 className="text-white text-lg font-semibold">
                  No Questions Found
                </h3>
                <p className="text-slate-400 text-sm mt-1">
                  Create your first MCQ question to get started
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
