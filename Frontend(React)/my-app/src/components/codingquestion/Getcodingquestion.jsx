"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch, useAppselector } from "@/Redux/hooks/hooks";
import {
  getAllCodingQuestionThunk,
  deleteCodingQuestionThunk,
} from "@/Redux/slice/codingSlice";
import {
  FiCode,
  FiAward,
  FiCheckCircle,
  FiXCircle,
  FiFileText,
  FiTrash2,
  FiEdit2,
  FiLayers,
  FiCpu,
  FiSettings,
  FiX,
  FiCheck,
  FiSearch,
  FiFilter,
  FiCopy,
} from "react-icons/fi";
import { toast } from "react-toastify";

export default function Getcodingquestion({ onEdit }) {
  const dispatch = useAppDispatch();
  const { codingQuestions, isLoading } = useAppselector((state) => state.codingStore);
  const { categories } = useAppselector((state) => state.mainstore);
 console.log("Codingquestion",codingQuestions)
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    dispatch(getAllCodingQuestionThunk());
  }, [dispatch]);

  const filteredQuestions = codingQuestions?.filter((question) => {
    const matchesSearch =
      question.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.slug?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDifficulty =
      difficultyFilter === "all" || question.difficulty === difficultyFilter;

    // Support both populated category object or ID
    const questionCatId = typeof question.category === "object" ? question.category?._id : question.category;
    const matchesCategory =
      categoryFilter === "all" || questionCatId === categoryFilter;

    return matchesSearch && matchesDifficulty && matchesCategory;
  });

  return (
    <div className="space-y-8">
      {/* Header Deck */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-900 pb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Coding Question Library</h2>
          <p className="text-slate-400 text-sm mt-1">Review, filter and manage custom developer challenges</p>
        </div>

        <div className="px-5 py-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-bold flex items-center gap-2">
          <FiCode className="animate-pulse" />
          <span>{filteredQuestions?.length || 0} Questions Found</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 grid sm:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title or slug..."
            className="w-full bg-slate-950 border border-slate-800/80 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-cyan-500 transition text-sm text-slate-300"
          />
        </div>

        {/* Difficulty Selector */}
        <div className="relative">
          <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800/80 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-cyan-500 transition text-sm text-slate-300 appearance-none cursor-pointer"
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        {/* Category Selector */}
        <div className="relative">
          <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800/80 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-cyan-500 transition text-sm text-slate-300 appearance-none cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories?.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of Question Cards */}
      <div className="space-y-6">
        {filteredQuestions?.map((question, index) => (
          <QuestionCard
            key={question._id}
            question={question}
            categories={categories}
            index={index}
            onEdit={onEdit}
          />
        ))}

        {(!filteredQuestions || filteredQuestions.length === 0) && (
          <div className="text-center py-20 bg-slate-900/10 border border-dashed border-slate-800 rounded-3xl">
            <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center mx-auto mb-4 border border-slate-800">
              <FiX className="text-3xl text-slate-600" />
            </div>
            <h3 className="text-xl font-bold text-white">No Questions Found</h3>
            <p className="text-slate-400 mt-1 max-w-md mx-auto text-sm">
              Adjust your search query or filters to explore other algorithm questions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* Local Subcomponent to encapsulate Active Tab State and Delete Confirms */
function QuestionCard({ question, categories, index, onEdit }) {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState("description");
  const [codeTab, setCodeTab] = useState("javascript");
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const res = await dispatch(deleteCodingQuestionThunk(question._id));
    setIsDeleting(false);
    setShowConfirmDelete(false);
    if (res.payload?.success) {
      toast.success("Question Deleted successfully");
    } else {
      toast.error(res.payload?.message || "Failed to delete question");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  // Helper to safely render category name
  const getCategoryName = () => {
    if (typeof question.category === "object" && question.category?.name) {
      return question.category.name;
    }
    const cat = categories?.find((c) => c._id === question.category);
    return cat ? cat.name : "Algorithm";
  };

  // Get active starter code text
  const getStarterCode = () => {
    const codeObj = question.starterCode?.find(
      (s) => s.language === codeTab || s.language === (codeTab === "javascript" ? "js" : codeTab === "nodejs" ? "node" : codeTab)
    );
    return codeObj?.code || `// No code starter template defined for ${codeTab}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.4), duration: 0.4 }}
      className="bg-[#0f172a]/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl overflow-hidden shadow-xl hover:border-slate-700/50 transition-all duration-300"
    >
      
      {/* Top Banner Header */}
      <div className="p-6 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-slate-900/20">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-extrabold text-white tracking-tight">{question.title}</h3>
            <span
              className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-extrabold border ${
                question.difficulty === "easy"
                  ? "bg-green-500/10 text-green-400 border-green-500/20"
                  : question.difficulty === "medium"
                    ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                    : "bg-red-500/10 text-red-400 border-red-500/20"
              }`}
            >
              {question.difficulty}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-mono">{question.slug}</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3.5 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold">
            {question.marks} Marks
          </span>

          <span className="px-3.5 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold">
            {getCategoryName()}
          </span>

          {/* Edit/Delete Triggers */}
          <div className="flex items-center gap-2 border-l border-slate-800 pl-3">
            <button
              onClick={() => onEdit && onEdit(question)}
              className="w-9 h-9 rounded-xl bg-cyan-500/10 hover:bg-cyan-500 hover:text-slate-950 border border-cyan-500/20 text-cyan-400 flex items-center justify-center transition-all duration-300"
              title="Edit Question"
            >
              <FiEdit2 className="text-sm" />
            </button>

            {showConfirmDelete ? (
              <div className="flex items-center bg-red-500/10 border border-red-500/35 rounded-xl p-0.5 gap-1 animate-slide-in">
                <button
                  disabled={isDeleting}
                  onClick={handleDelete}
                  className="w-8 h-8 rounded-lg bg-red-500 hover:bg-red-600 text-slate-950 flex items-center justify-center transition"
                  title="Confirm Delete"
                >
                  <FiCheck className="text-sm" />
                </button>
                <button
                  onClick={() => setShowConfirmDelete(false)}
                  className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-400 flex items-center justify-center transition"
                  title="Cancel Delete"
                >
                  <FiX className="text-sm" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirmDelete(true)}
                className="w-9 h-9 rounded-xl bg-red-500/10 hover:bg-red-500 hover:text-slate-950 border border-red-500/20 text-red-400 flex items-center justify-center transition-all duration-300"
                title="Delete Question"
              >
                <FiTrash2 className="text-sm" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modern Tabs Ribbon selector */}
      <div className="flex border-b border-slate-800 bg-slate-950 p-2 gap-1 overflow-x-auto">
        {[
          { id: "description", label: "Description", icon: FiFileText },
          { id: "code", label: "Templates", icon: FiCode },
          { id: "tests", label: "Test Cases", icon: FiCpu },
          { id: "limits", label: "Parameters", icon: FiSettings },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold tracking-wide transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-slate-800 text-white shadow-inner"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Icon className={activeTab === tab.id ? "text-cyan-400" : "text-slate-500"} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="p-6">
        
        {/* Panel 1: Description */}
        {activeTab === "description" && (
          <div className="space-y-6 animate-fade-up">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">Problem Statement</h4>
              <div className="bg-[#020617]/50 border border-slate-800/80 rounded-2xl p-5 text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                {question.problemStatement || "No problem statement defined."}
              </div>
            </div>

            {question.constraints && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">Constraints</h4>
                <div className="bg-[#020617]/40 border border-slate-850 rounded-2xl p-4 text-xs font-mono text-slate-400 whitespace-pre-wrap leading-relaxed">
                  {question.constraints}
                </div>
              </div>
            )}

            {question.supportedLanguages && question.supportedLanguages.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">Supported Languages</h4>
                <div className="flex flex-wrap gap-2">
                  {question.supportedLanguages.map((lang) => (
                    <span
                      key={lang}
                      className="px-3 py-1 bg-[#020617] border border-slate-800 rounded-lg text-xs font-semibold capitalize text-slate-400"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Panel 2: Templates & Starter Codes */}
        {activeTab === "code" && (
          <div className="space-y-6 animate-fade-up">
            
            {/* Starter code section */}
            <div>
              <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-3.5 gap-2">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Starter Code Template</h4>
                  <span className="text-[10px] font-mono text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded">
                    fn: {question.functionName || "undefined"}
                  </span>
                </div>
                
                {/* Language Selectors */}
                <div className="flex gap-1 bg-[#020617] p-0.5 border border-slate-800 rounded-lg self-start sm:self-auto">
                  {["javascript", "react", "nodejs"].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setCodeTab(lang)}
                      className={`px-3 py-1 rounded-md text-[10px] font-extrabold capitalize transition-all ${
                        codeTab === lang
                          ? "bg-slate-800 text-cyan-400"
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      {lang === "nodejs" ? "Node.js" : lang}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative group">
                <pre className="bg-[#020617] border border-slate-800/80 rounded-2xl p-5 overflow-x-auto text-xs font-mono text-green-400 leading-relaxed min-h-[120px]">
                  {getStarterCode()}
                </pre>
                <button
                  onClick={() => copyToClipboard(getStarterCode())}
                  className="absolute top-4 right-4 p-2 bg-slate-900/80 hover:bg-slate-850 hover:text-white border border-slate-800 rounded-lg text-slate-400 transition shadow opacity-0 group-hover:opacity-100"
                  title="Copy Starter Code"
                >
                  <FiCopy className="text-sm" />
                </button>
              </div>
            </div>

            {/* Boilerplate code section */}
            {question.boilerplateCode && (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Orchestrator Boilerplate Code</h4>
                </div>
                <div className="relative group">
                  <pre className="bg-[#020617] border border-slate-800/80 rounded-2xl p-5 overflow-x-auto text-xs font-mono text-yellow-400 leading-relaxed">
                    {question.boilerplateCode}
                  </pre>
                  <button
                    onClick={() => copyToClipboard(question.boilerplateCode)}
                    className="absolute top-4 right-4 p-2 bg-slate-900/80 hover:bg-slate-850 hover:text-white border border-slate-800 rounded-lg text-slate-400 transition shadow opacity-0 group-hover:opacity-100"
                    title="Copy Boilerplate"
                  >
                    <FiCopy className="text-sm" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Panel 3: Test Cases & Examples */}
        {activeTab === "tests" && (
          <div className="space-y-6 animate-fade-up">
            
            {/* Examples block */}
            {question.examples && question.examples.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Interactive Examples</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {question.examples.map((example, idx) => (
                    <div
                      key={idx}
                      className="bg-[#020617]/50 border border-slate-800/80 rounded-2xl p-4 space-y-2 relative"
                    >
                      <span className="absolute top-4 right-4 text-[10px] font-mono font-bold text-slate-500 uppercase">Ex {idx + 1}</span>
                      <p className="text-xs text-slate-300">
                        <span className="text-cyan-400 font-bold">Input:</span>{" "}
                        <code className="bg-[#020617] px-1.5 py-0.5 rounded text-xs font-mono text-cyan-300">{example.input}</code>
                      </p>

                      <p className="text-xs text-slate-300">
                        <span className="text-green-400 font-bold">Output:</span>{" "}
                        <code className="bg-[#020617] px-1.5 py-0.5 rounded text-xs font-mono text-green-300">{example.output}</code>
                      </p>

                      {example.explanation && (
                        <p className="text-xs text-slate-400 italic pt-1 border-t border-slate-850 leading-relaxed">
                          {example.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Test cases block */}
            {question.testCases && question.testCases.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Target Validation Test Cases</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {question.testCases.map((test, idx) => (
                    <div
                      key={idx}
                      className="bg-[#020617]/40 border border-slate-850 rounded-2xl p-4 flex flex-col justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-mono text-slate-500">Case {idx + 1}</span>
                          
                          <div className="flex gap-1.5">
                            {test.isSample && (
                              <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-md text-[9px] font-extrabold uppercase tracking-wider">
                                Sample
                              </span>
                            )}

                            {test.isHidden && (
                              <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-md text-[9px] font-extrabold uppercase tracking-wider">
                                Hidden
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 pt-1">
                          <span className="text-slate-500 font-semibold font-mono">Input:</span>{" "}
                          <span className="font-mono bg-[#020617] px-1 py-0.5 rounded text-slate-300">{test.input}</span>
                        </p>

                        <p className="text-xs text-slate-300">
                          <span className="text-slate-500 font-semibold font-mono">Expect:</span>{" "}
                          <span className="font-mono bg-[#020617] px-1 py-0.5 rounded text-green-400 font-bold">{test.expectedOutput}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Panel 4: Limits & Status parameters */}
        {activeTab === "limits" && (
          <div className="space-y-6 animate-fade-up">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Environment Sandbox Parameters</h4>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#020617] border border-slate-800/80 p-5 rounded-2xl space-y-1 hover:border-slate-700/60 transition-colors shadow">
                <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Time Limit</p>
                <h3 className="text-white text-xl font-black">
                  {question.timeLimit || 2}s
                </h3>
              </div>

              <div className="bg-[#020617] border border-slate-800/80 p-5 rounded-2xl space-y-1 hover:border-slate-700/60 transition-colors shadow">
                <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Memory Limit</p>
                <h3 className="text-white text-xl font-black">
                  {question.memoryLimit || 256} MB
                </h3>
              </div>

              <div className="bg-[#020617] border border-slate-800/80 p-5 rounded-2xl space-y-1 hover:border-slate-700/60 transition-colors shadow">
                <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Published</p>
                <div className="flex items-center gap-1.5 mt-1">
                  {question.isPublished ? (
                    <>
                      <FiCheckCircle className="text-green-400 text-sm" />
                      <span className="text-green-400 text-sm font-bold">Yes</span>
                    </>
                  ) : (
                    <>
                      <FiXCircle className="text-orange-400 text-sm" />
                      <span className="text-orange-400 text-sm font-bold">No</span>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-[#020617] border border-slate-800/80 p-5 rounded-2xl space-y-1 hover:border-slate-700/60 transition-colors shadow">
                <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Active Status</p>
                <div className="flex items-center gap-1.5 mt-1">
                  {question.isActive ? (
                    <>
                      <FiCheckCircle className="text-cyan-400 text-sm" />
                      <span className="text-cyan-400 text-sm font-bold">Yes</span>
                    </>
                  ) : (
                    <>
                      <FiXCircle className="text-red-400 text-sm" />
                      <span className="text-red-400 text-sm font-bold">No</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Test reference */}
            {question.codingTest && (
              <div className="p-4 bg-[#020617]/50 border border-slate-800 rounded-2xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
                  <FiAward className="text-sm" />
                </div>
                <div>
                  <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Assigned to Test</h5>
                  <p className="text-sm font-bold text-slate-300 mt-0.5">
                    {typeof question.codingTest === "object" ? question.codingTest?.title : question.codingTest}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
