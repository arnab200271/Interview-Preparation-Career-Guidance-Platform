"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch, useAppselector } from "@/Redux/hooks/hooks";
import {
  FiCode,
  FiFileText,
  FiClock,
  FiCheckCircle,
  FiPlus,
  FiTrash2,
  FiSettings,
  FiDatabase,
  FiLayers,
  FiTerminal,
  FiCpu,
  FiX,
  FiSave,
  FiAlertTriangle,
  FiInfo,
  FiArrowUp,
} from "react-icons/fi";
import { toast } from "react-toastify";
import {
  createCodingQuestionThunk,
  updateCodingQuestionThunk,
  getCodingTestThunk,
  getAllCodingQuestionThunk,
} from "@/Redux/slice/codingSlice";
import { getAllCategory } from "@/Redux/slice/slice";
import Getcodingquestion from "./Getcodingquestion";

export default function CodingQuestionPage() {
  const dispatch = useAppDispatch();

  const { codingTests, isLoading } = useAppselector((state) => state.codingStore);
  const { categories } = useAppselector((state) => state.mainstore);

  const [editId, setEditId] = useState(null);
  const [starterTab, setStarterTab] = useState("javascript");

  const { register, control, handleSubmit, reset } = useForm({
    defaultValues: {
      title: "",
      slug: "",
      difficulty: "easy",
      marks: "",
      category: "",
      codingTest: "",
      problemStatement: "",
      constraints: "",
      functionName: "",
      jsStarter: "",
      reactStarter: "",
      nodeStarter: "",
      boilerplateCode: "",
      examples: [
        {
          input: "",
          output: "",
          explanation: "",
        },
      ],
      testCases: [
        {
          input: "",
          expectedOutput: "",
          isSample: false,
          isHidden: true,
        },
      ],
      timeLimit: 2,
      memoryLimit: 256,
      isPublished: true,
      isActive: true,
    },
  });

  const {
    fields: exampleFields,
    append: addExample,
    remove: removeExample,
  } = useFieldArray({
    control,
    name: "examples",
  });

  const {
    fields: testCaseFields,
    append: addTestCase,
    remove: removeTestCase,
  } = useFieldArray({
    control,
    name: "testCases",
  });

  useEffect(() => {
    dispatch(getCodingTestThunk());
    dispatch(getAllCategory());
  }, [dispatch]);

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      marks: Number(data.marks),
      timeLimit: Number(data.timeLimit),
      memoryLimit: Number(data.memoryLimit),
      supportedLanguages: data.supportedLanguages || ["javascript", "react", "nodejs"],
      starterCode: [
        {
          language: "javascript",
          code: data.jsStarter || "",
        },
        {
          language: "react",
          code: data.reactStarter || "",
        },
        {
          language: "nodejs",
          code: data.nodeStarter || "",
        },
      ],
    };

    let res;
    if (editId) {
      res = await dispatch(updateCodingQuestionThunk({ id: editId, data: payload }));
    } else {
      res = await dispatch(createCodingQuestionThunk(payload));
    }

    if (res.payload?.success) {
      toast.success(editId ? "Coding Question Updated Successfully" : "Coding Question Created Successfully");
      handleCancelEdit();
      dispatch(getAllCodingQuestionThunk());
    } else {
      toast.error(res.payload?.message || "Failed to save question");
    }
  };

  const handleEdit = (question) => {
    setEditId(question._id);
    
    const js = question.starterCode?.find(s => s.language === "javascript" || s.language === "js")?.code || "";
    const react = question.starterCode?.find(s => s.language === "react")?.code || "";
    const node = question.starterCode?.find(s => s.language === "nodejs" || s.language === "node")?.code || "";

    reset({
      title: question.title || "",
      slug: question.slug || "",
      difficulty: question.difficulty || "easy",
      marks: question.marks || "",
      category: question.category?._id || question.category || "",
      codingTest: question.codingTest?._id || question.codingTest || "",
      problemStatement: question.problemStatement || "",
      constraints: question.constraints || "",
      functionName: question.functionName || "",
      jsStarter: js,
      reactStarter: react,
      nodeStarter: node,
      boilerplateCode: question.boilerplateCode || "",
      examples: question.examples?.map(ex => ({
        input: ex.input || "",
        output: ex.output || "",
        explanation: ex.explanation || "",
      })) || [{ input: "", output: "", explanation: "" }],
      testCases: question.testCases?.map(tc => ({
        input: tc.input || "",
        expectedOutput: tc.expectedOutput || "",
        isSample: !!tc.isSample,
        isHidden: !!tc.isHidden,
      })) || [{ input: "", expectedOutput: "", isSample: false, isHidden: true }],
      timeLimit: question.timeLimit || 2,
      memoryLimit: question.memoryLimit || 256,
      isPublished: question.isPublished !== undefined ? question.isPublished : true,
      isActive: question.isActive !== undefined ? question.isActive : true,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
    toast.info(`Editing question: "${question.title}"`);
  };

  const handleCancelEdit = () => {
    setEditId(null);
    reset({
      title: "",
      slug: "",
      difficulty: "easy",
      marks: "",
      category: "",
      codingTest: "",
      problemStatement: "",
      constraints: "",
      functionName: "",
      jsStarter: "",
      reactStarter: "",
      nodeStarter: "",
      boilerplateCode: "",
      examples: [
        {
          input: "",
          output: "",
          explanation: "",
        },
      ],
      testCases: [
        {
          input: "",
          expectedOutput: "",
          isSample: false,
          isHidden: true,
        },
      ],
      timeLimit: 2,
      memoryLimit: 256,
      isPublished: true,
      isActive: true,
    });
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white py-24 px-4 md:px-8 relative overflow-hidden">
      {/* Dynamic glow overlays */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="fixed top-[40%] right-[20%] w-[350px] h-[350px] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-12">
        
        {/* Modern Header Panel */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-[32px] p-8 shadow-2xl relative overflow-hidden"
        >
          {/* Subtle line background effect */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35" />
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:justify-between lg:items-center gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-semibold tracking-wide">
                <FiCode className="animate-pulse" />
                <span>ADMIN ASSESSMENT DESK</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                {editId ? "Update Coding Question" : "Create Coding Question"}
              </h1>

              <p className="text-slate-400 max-w-2xl text-base leading-relaxed">
                Design custom algorithms, set constraints, configure multiple languages, sample/hidden test cases, and memory parameters.
              </p>
            </div>

            {/* Stats Deck */}
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 lg:min-w-[340px]">
              <div className="bg-[#020617]/70 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 hover:border-cyan-500/30 transition-all duration-300 group shadow-lg">
                <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold group-hover:text-slate-400 transition-colors">Categories</p>
                <h2 className="text-3xl font-extrabold text-cyan-400 mt-1">
                  {categories?.length || 0}
                </h2>
              </div>

              <div className="bg-[#020617]/70 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 hover:border-green-500/30 transition-all duration-300 group shadow-lg">
                <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold group-hover:text-slate-400 transition-colors">Coding Tests</p>
                <h2 className="text-3xl font-extrabold text-green-400 mt-1">
                  {codingTests?.length || 0}
                </h2>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Edit mode active bar */}
        <AnimatePresence>
          {editId && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <FiInfo className="text-xl" />
                </div>
                <div>
                  <h4 className="font-bold text-cyan-300">Edit Mode Active</h4>
                  <p className="text-xs text-slate-400">You are editing a question. Submit the form to apply updates or discard changes.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-xs font-semibold text-slate-300 flex items-center gap-2 transition"
              >
                <FiX /> Discard & Cancel
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Master Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Card 1: Basic Information */}
          <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-[28px] p-6 md:p-8 shadow-xl hover:border-slate-700/50 transition-all duration-300">
            <div className="flex items-center gap-3 mb-8 border-b border-slate-800 pb-5">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <FiDatabase className="text-lg" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight">Basic Information</h2>
                <p className="text-slate-500 text-xs mt-0.5">Title, Slug, Difficulty, and categorization</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Question Title</label>
                <input
                  {...register("title", { required: true })}
                  placeholder="e.g. Find First Missing Positive"
                  className="input"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Slug</label>
                <input
                  {...register("slug", { required: true })}
                  placeholder="e.g. find-first-missing-positive"
                  className="input"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Difficulty</label>
                <select {...register("difficulty")} className="input bg-slate-900">
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Marks</label>
                <input
                  type="number"
                  {...register("marks", { required: true })}
                  placeholder="e.g. 50"
                  className="input"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Category</label>
                <select {...register("category", { required: true })} className="input bg-slate-900">
                  <option value="">Select Category</option>
                  {categories?.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Target Coding Test</label>
                <select {...register("codingTest", { required: true })} className="input bg-slate-900">
                  <option value="">Select Test</option>
                  {codingTests?.map((test) => (
                    <option key={test._id} value={test._id}>
                      {test.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Card 2: Problem Statement */}
          <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-[28px] p-6 md:p-8 shadow-xl hover:border-slate-700/50 transition-all duration-300">
            <div className="flex items-center gap-3 mb-8 border-b border-slate-800 pb-5">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <FiFileText className="text-lg" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight">Problem Statement & Constraints</h2>
                <p className="text-slate-500 text-xs mt-0.5">Write details about what the user must code</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Problem Description</label>
                <textarea
                  {...register("problemStatement", { required: true })}
                  rows={8}
                  placeholder="Provide the challenge details, input formats, output formats..."
                  className="input resize-y min-h-[160px]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Constraints</label>
                <textarea
                  {...register("constraints")}
                  rows={4}
                  placeholder="e.g.&#10;1 <= arr.length <= 10^5&#10;-2^31 <= arr[i] <= 2^31 - 1"
                  className="input resize-y min-h-[90px]"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Function Configuration */}
          <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-[28px] p-6 md:p-8 shadow-xl hover:border-slate-700/50 transition-all duration-300">
            <div className="flex items-center gap-3 mb-8 border-b border-slate-800 pb-5">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
                <FiTerminal className="text-lg" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight">Function Configuration</h2>
                <p className="text-slate-500 text-xs mt-0.5">Entrypoint function name for automated evaluation</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Main Function Name</label>
              <input
                {...register("functionName", { required: true })}
                placeholder="e.g. firstMissingPositive"
                className="input font-mono"
              />
            </div>
          </div>

          {/* Card 4: Starter & Boilerplate Codes (Clean Tab System) */}
          <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-[28px] p-6 md:p-8 shadow-xl hover:border-slate-700/50 transition-all duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-5 mb-8 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <FiCode className="text-lg" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Code Templates</h2>
                  <p className="text-slate-500 text-xs mt-0.5">Boilerplate structures and starter codes</p>
                </div>
              </div>

              {/* Starter Tab Selectors */}
              <div className="flex gap-1.5 bg-[#020617] p-1 border border-slate-800/80 rounded-xl max-w-sm self-start sm:self-center">
                {["javascript", "react", "nodejs"].map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setStarterTab(lang)}
                    className={`py-1.5 px-4 rounded-lg text-xs font-bold capitalize transition-all ${
                      starterTab === lang
                        ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {lang === "nodejs" ? "Node.js" : lang}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Starter Template: <span className="text-cyan-400 capitalize">{starterTab}</span>
                  </span>
                  <span className="text-[10px] text-slate-500">Provide standard input signature</span>
                </div>
                
                {starterTab === "javascript" && (
                  <textarea
                    {...register("jsStarter")}
                    rows={8}
                    placeholder="function firstMissingPositive(nums) {&#10;  // Write your code here&#10;};"
                    className="input font-mono bg-[#050b18] focus:border-cyan-500"
                  />
                )}
                {starterTab === "react" && (
                  <textarea
                    {...register("reactStarter")}
                    rows={8}
                    placeholder="import React from 'react';&#10;&#10;export default function Solution() {&#10;  return <div>Component starter</div>;&#10;};"
                    className="input font-mono bg-[#050b18] focus:border-cyan-500"
                  />
                )}
                {starterTab === "nodejs" && (
                  <textarea
                    {...register("nodeStarter")}
                    rows={8}
                    placeholder="const fs = require('fs');&#10;&#10;module.exports = function(data) {&#10;  return data;&#10;};"
                    className="input font-mono bg-[#050b18] focus:border-cyan-500"
                  />
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">Boilerplate Execution Code</label>
                <textarea
                  {...register("boilerplateCode")}
                  rows={6}
                  placeholder="System orchestration code that executes the solution..."
                  className="input font-mono bg-[#050b18] focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Card 5: Examples */}
          <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-[28px] p-6 md:p-8 shadow-xl hover:border-slate-700/50 transition-all duration-300">
            <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400">
                  <FiLayers className="text-lg" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Examples</h2>
                  <p className="text-slate-500 text-xs mt-0.5">Visible hints shown to candidates</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => addExample({ input: "", output: "", explanation: "" })}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 active:scale-95 transition-all text-xs font-bold text-slate-950 rounded-xl flex items-center gap-2 shadow-md shadow-cyan-500/10"
              >
                <FiPlus /> Add Example
              </button>
            </div>

            <div className="space-y-6">
              <AnimatePresence initial={false}>
                {exampleFields.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="bg-[#020617]/50 border border-slate-800/90 rounded-2xl p-5 hover:border-slate-700/60 transition-all relative group"
                  >
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-slate-400">Example {index + 1} Input</label>
                        <input
                          {...register(`examples.${index}.input`)}
                          placeholder="e.g. nums = [1, 2, 0]"
                          className="input bg-[#020617] border-slate-800"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-slate-400">Example {index + 1} Output</label>
                        <input
                          {...register(`examples.${index}.output`)}
                          placeholder="e.g. 3"
                          className="input bg-[#020617] border-slate-800"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 mt-4">
                      <label className="text-[10px] uppercase font-bold text-slate-400">Example {index + 1} Explanation</label>
                      <textarea
                        {...register(`examples.${index}.explanation`)}
                        placeholder="Explain why this output is expected..."
                        rows={2}
                        className="input bg-[#020617] border-slate-800"
                      />
                    </div>

                    <div className="flex justify-end mt-4 pt-3 border-t border-slate-800/50">
                      <button
                        type="button"
                        onClick={() => removeExample(index)}
                        className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                      >
                        <FiTrash2 /> Remove
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {exampleFields.length === 0 && (
                <div className="text-center py-8 bg-[#020617]/20 border border-dashed border-slate-800 rounded-2xl">
                  <p className="text-sm text-slate-500">No examples added. Click "Add Example" to provide hints.</p>
                </div>
              )}
            </div>
          </div>

          {/* Card 6: Test Cases */}
          <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-[28px] p-6 md:p-8 shadow-xl hover:border-slate-700/50 transition-all duration-300">
            <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <FiCpu className="text-lg" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Test Cases</h2>
                  <p className="text-slate-500 text-xs mt-0.5">Execution parameters for compiling evaluations</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  addTestCase({
                    input: "",
                    expectedOutput: "",
                    isSample: false,
                    isHidden: true,
                  })
                }
                className="px-4 py-2 bg-green-500 hover:bg-green-600 active:scale-95 transition-all text-xs font-bold text-slate-950 rounded-xl flex items-center gap-2 shadow-md shadow-green-500/10"
              >
                <FiPlus /> Add Test Case
              </button>
            </div>

            <div className="space-y-6">
              <AnimatePresence initial={false}>
                {testCaseFields.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="bg-[#020617]/50 border border-slate-800/90 rounded-2xl p-5 hover:border-slate-700/60 transition-all relative group"
                  >
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-slate-400">Test Case {index + 1} Input</label>
                        <input
                          {...register(`testCases.${index}.input`)}
                          placeholder="e.g. [3, 4, -1, 1]"
                          className="input bg-[#020617] border-slate-800"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-slate-400">Expected Output</label>
                        <input
                          {...register(`testCases.${index}.expectedOutput`)}
                          placeholder="e.g. 2"
                          className="input bg-[#020617] border-slate-800"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4 pt-3 border-t border-slate-800/50">
                      <div className="flex gap-6">
                        <label className="flex items-center gap-2.5 text-xs text-slate-300 font-medium cursor-pointer select-none">
                          <input
                            type="checkbox"
                            {...register(`testCases.${index}.isSample`)}
                            className="rounded border-slate-700 text-cyan-500 focus:ring-0 focus:ring-offset-0 bg-[#020617] w-4 h-4"
                          />
                          Sample Case (Visible)
                        </label>

                        <label className="flex items-center gap-2.5 text-xs text-slate-300 font-medium cursor-pointer select-none">
                          <input
                            type="checkbox"
                            {...register(`testCases.${index}.isHidden`)}
                            className="rounded border-slate-700 text-cyan-500 focus:ring-0 focus:ring-offset-0 bg-[#020617] w-4 h-4"
                          />
                          Hidden Case (Locked)
                        </label>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeTestCase(index)}
                        className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs rounded-xl flex items-center gap-1.5 transition-colors self-end sm:self-auto"
                      >
                        <FiTrash2 /> Remove
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {testCaseFields.length === 0 && (
                <div className="text-center py-8 bg-[#020617]/20 border border-dashed border-slate-800 rounded-2xl">
                  <p className="text-sm text-slate-500">No test cases added. Click "Add Test Case" to configure compilation checks.</p>
                </div>
              )}
            </div>
          </div>

          {/* Card 7: Execution Settings */}
          <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-[28px] p-6 md:p-8 shadow-xl hover:border-slate-700/50 transition-all duration-300">
            <div className="flex items-center gap-3 mb-8 border-b border-slate-800 pb-5">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
                <FiSettings className="text-lg" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight">Execution Settings & Limits</h2>
                <p className="text-slate-500 text-xs mt-0.5">Sandbox compilation parameters and visual scopes</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Time Limit (Seconds)</label>
                <input
                  type="number"
                  {...register("timeLimit")}
                  placeholder="e.g. 2"
                  className="input"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Memory Limit (MB)</label>
                <input
                  type="number"
                  {...register("memoryLimit")}
                  placeholder="e.g. 256"
                  className="input"
                />
              </div>
            </div>

            <div className="flex gap-8 mt-8 p-4 bg-[#020617]/40 rounded-2xl border border-slate-800/60 max-w-md">
              <label className="flex items-center gap-2.5 text-sm font-semibold cursor-pointer select-none">
                <input
                  type="checkbox"
                  {...register("isPublished")}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-0 focus:ring-offset-0 bg-[#020617] w-5 h-5"
                />
                Published
              </label>

              <label className="flex items-center gap-2.5 text-sm font-semibold cursor-pointer select-none">
                <input
                  type="checkbox"
                  {...register("isActive")}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-0 focus:ring-offset-0 bg-[#020617] w-5 h-5"
                />
                Active
              </label>
            </div>
          </div>

          {/* Stick Button Form Submit */}
          <div className="sticky bottom-6 z-40 bg-slate-950/40 backdrop-blur-md p-4 rounded-3xl border border-slate-800/60 flex gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 py-4 px-6 rounded-2xl text-base font-extrabold hover:scale-[1.005] active:scale-[0.995] transition-all shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
            >
              <FiSave className="text-lg" />
              <span>{isLoading ? "Saving changes..." : editId ? "Save Question Updates" : "Create Coding Question"}</span>
            </button>
            
            {editId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 py-4 px-6 rounded-2xl text-base font-extrabold transition-all flex items-center justify-center gap-2"
              >
                <FiX className="text-lg" />
                <span className="hidden sm:inline">Cancel</span>
              </button>
            )}
          </div>
        </form>

        {/* Display and List Deck */}
        <div className="mt-16 pt-12 border-t border-slate-900 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[1px] bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
          <Getcodingquestion onEdit={handleEdit} />
        </div>
      </div>
    </div>
  );
}

