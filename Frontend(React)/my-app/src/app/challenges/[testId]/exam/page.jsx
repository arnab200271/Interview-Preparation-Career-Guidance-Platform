"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPlay,
  FaPaperPlane,
  FaChevronLeft,
  FaChevronRight,
  FaTrophy,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaCode,
  FaTerminal,
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";
import { useAppDispatch, useAppselector } from "@/Redux/hooks/hooks";
import {
  getCodingQuestionThunk,
  runCodingCodeThunk,
  submitCodingCodeThunk,
} from "@/Redux/slice/codingSlice";

// ── Monaco loaded client-only ──────────────────────────────────────
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-900 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

// ── Language configs ───────────────────────────────────────────────
const LANGUAGES = [
  {
    id: "javascript",
    label: "JavaScript",
    monacoLang: "javascript",
    starter: "// Write your solution here\nfunction solution() {\n  \n}\n",
  },
  // {
  //   id: "React",
  //   label: "React",
  //   monacoLang: "python",
  //   starter: "# Write your solution here\ndef solution():\n    pass\n",
  // },
  // {
  //   id: "java",
  //   label: "Java",
  //   monacoLang: "java",
  //   starter:
  //     "// Write your solution here\nclass Solution {\n    public void solve() {\n        \n    }\n}\n",
  // },
  // {
  //   id: "cpp",
  //   label: "C++",
  //   monacoLang: "cpp",
  //   starter:
  //     "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    return 0;\n}\n",
  // },
];

const DIFF_STYLES = {
  Easy: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
  Medium: "text-yellow-400  bg-yellow-400/10  border-yellow-400/30",
  Hard: "text-red-400    bg-red-400/10    border-red-400/30",
};

// ── Timer hook ────────────────────────────────────────────────────
function useTimer(durationMinutes) {
  const total = (durationMinutes || 60) * 60;
  const [seconds, setSeconds] = useState(total);

  useEffect(() => {
    if (seconds <= 0) return;
    const id = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [seconds]);

  const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  const pct = (seconds / total) * 100;
  const danger = seconds < 300; // < 5 min

  return { display: `${mins}:${secs}`, pct, danger, seconds };
}

export default function CodingExamPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { testId } = useParams();

  const {
    codingQuestions,
    singleCodingTest,
    isLoading,
    runResult,
    submissionResult,
  } = useAppselector((state) => state.codingStore);
  //console.log("codingquestion", codingQuestions);
  // ── Local state ───────────────────────────────────────────────
  const [currentIdx, setCurrentIdx] = useState(0);
  const [lang, setLang] = useState(LANGUAGES[0]);
  const [codeMap, setCodeMap] = useState({}); // { "qId-lang": code }
  const [submittedSet, setSubmittedSet] = useState(new Set()); // submitted question ids
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [output, setOutput] = useState(null); // run result display
  const [showComplete, setShowComplete] = useState(false);
  const [activeTab, setActiveTab] = useState("description"); // "description" | "output"

  const timer = useTimer(singleCodingTest?.duration);

  // ── Fetch questions on mount ──────────────────────────────────
  useEffect(() => {
    if (testId) dispatch(getCodingQuestionThunk(testId));
  }, [dispatch, testId]);

  const questions = codingQuestions || [];
  const question = questions[currentIdx];

  const starterFromDb = question?.starterCode?.find(
    (item) => item.language === lang.id,
  )?.code;

  const codeKey = question ? `${question._id}-${lang.id}` : null;

  const code = codeKey
    ? (codeMap[codeKey] ?? starterFromDb ?? lang.starter)
    : (starterFromDb ?? lang.starter);

  const setCode = useCallback(
    (val) => {
      if (!codeKey) return;
      setCodeMap((prev) => ({ ...prev, [codeKey]: val }));
    },
    [codeKey],
  );

  // When switching language, initialise starter if not yet written
  useEffect(() => {
    if (codeKey && !(codeKey in codeMap)) {
      setCodeMap((prev) => ({
        ...prev,
        [codeKey]: starterFromDb || lang.starter,
      }));
    }
  }, [codeKey, codeMap, starterFromDb, lang.starter]);

  // ── Run code ──────────────────────────────────────────────────
  const handleRun = async () => {
    if (!question || isRunning) return;
    setIsRunning(true);
    setActiveTab("output");
    setOutput({ status: "running" });
    try {
      const res = await dispatch(
        runCodingCodeThunk({
          questionId: question._id,
          testId,
          language: lang.id,
          code,
        }),
      ).unwrap();
      setOutput({ status: "done", data: res });
    } catch (err) {
      setOutput({ status: "error", message: err?.message || String(err) });
    } finally {
      setIsRunning(false);
    }
  };

  // ── Submit code ───────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!question || isSubmitting) return;
    setIsSubmitting(true);
    setActiveTab("output");
    setOutput({ status: "submitting" });
    try {
      const res = await dispatch(
        submitCodingCodeThunk({
          questionId: question._id,
          testId,
          language: lang.id,
          code,
        }),
      ).unwrap();

      setOutput({ status: "submitted", data: res });
      setSubmittedSet((prev) => new Set([...prev, question._id]));
      console.log("SUBMIT RESPONSE", res);
      // Auto-advance after a short delay
      setTimeout(() => {
        if (currentIdx < questions.length - 1) {
          setCurrentIdx((i) => i + 1);
          setOutput(null);
          setActiveTab("description");
        } else {
          setShowComplete(true);
        }
      }, 1800);
    } catch (err) {
      setOutput({ status: "error", message: err?.message || String(err) });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Loading ────────────────────────────────────────────────────
  if (isLoading && questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading challenge...</p>
        </div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center gap-4 text-white">
        <p className="text-slate-400 text-lg">
          No questions in this challenge.
        </p>
        <button
          onClick={() => router.back()}
          className="text-cyan-400 underline text-sm"
        >
          Go back
        </button>
      </div>
    );
  }

  // ── Completion Modal ───────────────────────────────────────────
  if (showComplete) {
    const solved = submittedSet.size;
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900 border border-slate-700 rounded-3xl p-10 max-w-md w-full text-center shadow-2xl"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-yellow-500/30">
            <FaTrophy size={36} className="text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-2">
            Challenge Complete!
          </h2>
          <p className="text-slate-400 mb-6">
            You solved <span className="text-cyan-400 font-bold">{solved}</span>{" "}
            out of{" "}
            <span className="text-white font-bold">{questions.length}</span>{" "}
            questions.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push("/challenges/leaderboard")}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold hover:opacity-90 transition"
            >
              🏆 View Leaderboard
            </button>
            <button
              onClick={() => router.push("/challenges/history")}
              className="w-full py-3 rounded-xl border border-slate-700 text-slate-300 font-semibold hover:bg-slate-800 transition"
            >
              📋 My Submissions
            </button>
            <button
              onClick={() => router.push("/challenges")}
              className="w-full py-3 rounded-xl border border-slate-700 text-slate-400 hover:bg-slate-800 transition text-sm"
            >
              ← Back to Challenges
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const diff = question
    ? DIFF_STYLES[question.difficulty] || DIFF_STYLES["Medium"]
    : "";

  return (
    <div
      className="min-h-screen bg-[#0d1117] text-white flex flex-col"
      style={{ height: "100vh", overflow: "hidden" }}
    >
      {/* ── Top Bar ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 z-10 flex-shrink-0">
        {/* Left: back + title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => router.push(`/challenges/${testId}`)}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition flex-shrink-0"
          >
            <FaChevronLeft size={14} />
          </button>
          <span className="text-slate-400 text-sm hidden sm:block truncate max-w-xs">
            {singleCodingTest?.title || "Coding Challenge"}
          </span>
        </div>

        {/* Center: question progress pills */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {questions.map((q, i) => (
            <button
              key={q._id}
              onClick={() => {
                setCurrentIdx(i);
                setActiveTab("description");
              }}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all duration-200 border
                ${
                  i === currentIdx
                    ? "bg-cyan-500 border-cyan-400 text-white"
                    : submittedSet.has(q._id)
                      ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                      : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600"
                }`}
            >
              {submittedSet.has(q._id) ? "✓" : i + 1}
            </button>
          ))}
        </div>

        {/* Right: timer + lang */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-mono font-bold border ${
              timer.danger
                ? "text-red-400 bg-red-400/10 border-red-400/30 animate-pulse"
                : "text-cyan-400 bg-cyan-400/10 border-cyan-400/20"
            }`}
          >
            <FaClock size={12} />
            {timer.display}
          </div>
        </div>
      </div>

      {/* ── Main split layout ─────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── LEFT PANEL: Question ───────────────────────────────── */}
        <div className="w-full lg:w-[42%] flex flex-col border-r border-slate-800 overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-slate-800 bg-slate-900/50 flex-shrink-0">
            {[
              { id: "description", label: "Description", icon: FaCode },
              { id: "output", label: "Output", icon: FaTerminal },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === id
                    ? "border-cyan-500 text-cyan-400"
                    : "border-transparent text-slate-500 hover:text-slate-300"
                }`}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-y-auto p-5">
            <AnimatePresence mode="wait">
              {activeTab === "description" ? (
                <motion.div
                  key={`desc-${question._id}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Question header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                        <span className="text-slate-500 text-sm font-mono">
                          Q{currentIdx + 1}/{questions.length}
                        </span>
                        <span
                          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${diff}`}
                        >
                          {question.difficulty}
                        </span>
                        <span className="text-xs text-yellow-400 font-semibold">
                          {question.marks} pts
                        </span>
                      </div>
                      <h2 className="text-xl font-bold text-white">
                        {question.title}
                      </h2>
                    </div>
                    {submittedSet.has(question._id) && (
                      <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold bg-emerald-400/10 border border-emerald-400/20 rounded-lg px-2.5 py-1 flex-shrink-0">
                        <FaCheckCircle size={11} /> Submitted
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div className="text-slate-300 text-sm leading-relaxed mb-6 whitespace-pre-wrap">
                    {question.description}
                  </div>

                  {/* Examples */}
                  {question.examples?.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                        Examples
                      </h3>
                      <div className="space-y-3">
                        {question.examples.map((ex, i) => (
                          <div
                            key={i}
                            className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 font-mono text-sm"
                          >
                            <p className="text-slate-400 mb-1">
                              <span className="text-cyan-400 font-semibold">
                                Input:
                              </span>{" "}
                              {ex.input}
                            </p>
                            <p className="text-slate-400">
                              <span className="text-emerald-400 font-semibold">
                                Output:
                              </span>{" "}
                              {ex.output}
                            </p>
                            {ex.explanation && (
                              <p className="text-slate-500 mt-1 text-xs">
                                {ex.explanation}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Constraints */}
                  {question.constraints?.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                        Constraints
                      </h3>
                      <ul className="space-y-1.5">
                        {question.constraints.map((c, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-slate-400 text-sm font-mono"
                          >
                            <span className="text-cyan-500 mt-0.5">•</span>
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Tags */}
                  {question.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {question.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs text-slate-400 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-0.5"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="output"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <OutputPanel output={output} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── RIGHT PANEL: Editor ─────────────────────────────────── */}
        <div className="hidden lg:flex flex-col flex-1 overflow-hidden">
          {/* Editor toolbar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/50 border-b border-slate-800 flex-shrink-0">
            <div className="flex items-center gap-2">
              <FaCode size={13} className="text-slate-500" />
              <span className="text-slate-400 text-sm">Editor</span>
            </div>

            {/* Language selector */}
            <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
              {LANGUAGES.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setLang(l)}
                  className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                    lang.id === l.id
                      ? "bg-cyan-600 text-white"
                      : "text-slate-400 hover:text-white hover:bg-slate-700"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Monaco */}
          <div className="flex-1 overflow-hidden">
            <MonacoEditor
              height="100%"
              language={lang.monacoLang}
              value={code}
              onChange={setCode}
              theme="vs-dark"
              options={{
                fontSize: 14,
                fontFamily:
                  "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
                fontLigatures: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: "on",
                wordWrap: "on",
                tabSize: 2,
                automaticLayout: true,
                padding: { top: 16 },
                bracketPairColorization: { enabled: true },
              }}
            />
          </div>

          {/* Action bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-t border-slate-800 flex-shrink-0">
            <div className="flex items-center gap-2">
              {/* Prev / Next */}
              <button
                onClick={() => {
                  setCurrentIdx((i) => Math.max(0, i - 1));
                  setActiveTab("description");
                  setOutput(null);
                }}
                disabled={currentIdx === 0}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-700 text-slate-400 text-sm hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <FaChevronLeft size={11} /> Prev
              </button>
              <button
                onClick={() => {
                  setCurrentIdx((i) => Math.min(questions.length - 1, i + 1));
                  setActiveTab("description");
                  setOutput(null);
                }}
                disabled={currentIdx === questions.length - 1}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-700 text-slate-400 text-sm hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                Next <FaChevronRight size={11} />
              </button>
            </div>

            <div className="flex items-center gap-3">
              {/* Run */}
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleRun}
                disabled={isRunning || isSubmitting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-emerald-500/40 text-emerald-400 font-semibold text-sm hover:bg-emerald-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                {isRunning ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                    Running…
                  </>
                ) : (
                  <>
                    <FaPlay size={11} /> Run Code
                  </>
                )}
              </motion.button>

              {/* Submit */}
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleSubmit}
                disabled={
                  isRunning || isSubmitting || submittedSet.has(question?._id)
                }
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting…
                  </>
                ) : submittedSet.has(question?._id) ? (
                  <>
                    <FaCheckCircle size={13} /> Submitted
                  </>
                ) : (
                  <>
                    <FaPaperPlane size={12} /> Submit
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile: editor below description ──────────────────────── */}
      <div className="lg:hidden border-t border-slate-800 bg-slate-900/50 px-4 py-3 flex-shrink-0">
        {/* Language selector */}
        <div className="flex gap-2 mb-3 overflow-x-auto">
          {LANGUAGES.map((l) => (
            <button
              key={l.id}
              onClick={() => setLang(l)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                lang.id === l.id
                  ? "bg-cyan-600 text-white"
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
        <div style={{ height: "300px" }}>
          <MonacoEditor
            height="300px"
            language={lang.monacoLang}
            value={code}
            onChange={setCode}
            theme="vs-dark"
            options={{
              fontSize: 13,
              minimap: { enabled: false },
              lineNumbers: "on",
              automaticLayout: true,
            }}
          />
        </div>
        <div className="flex gap-3 mt-3">
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="flex-1 py-2.5 rounded-xl border border-emerald-500/40 text-emerald-400 font-semibold text-sm disabled:opacity-40"
          >
            {isRunning ? "Running…" : "▶ Run"}
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || submittedSet.has(question?._id)}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold text-sm disabled:opacity-40"
          >
            {isSubmitting
              ? "Submitting…"
              : submittedSet.has(question?._id)
                ? "✓ Done"
                : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Output Panel Sub-component ─────────────────────────────────────
function OutputPanel({ output }) {
  const [selectedTestCaseIdx, setSelectedTestCaseIdx] = useState(0);

  // Reset selected tab on new output
  useEffect(() => {
    setSelectedTestCaseIdx(0);
  }, [output]);

  if (!output) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-500 bg-slate-900/20 rounded-2xl border border-slate-800/50">
        <div className="w-16 h-16 rounded-full bg-slate-900/60 flex items-center justify-center border border-slate-800 border-b-2 shadow-inner mb-4">
          <FaTerminal size={22} className="text-slate-400" />
        </div>
        <h3 className="text-sm font-semibold text-slate-300">Console Idle</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-[240px] text-center">
          Write code and click <span className="text-emerald-400 font-semibold">Run Code</span> or <span className="text-cyan-400 font-semibold">Submit</span> to view test evaluation results.
        </p>
      </div>
    );
  }

  if (output.status === "running" || output.status === "submitting") {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 bg-slate-900/20 rounded-2xl border border-slate-800/50">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
          <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-cyan-400 rounded-full animate-spin animate-duration-1000" style={{ animationDirection: 'reverse' }} />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-slate-200">
            {output.status === "running" ? "Running against sample test cases..." : "Submitting to evaluation server..."}
          </p>
          <p className="text-xs text-slate-500 mt-1">Please wait, compiling and executing code safely...</p>
        </div>
      </div>
    );
  }

  if (output.status === "error") {
    return (
      <div className="bg-red-950/20 border border-red-500/30 rounded-2xl p-5 shadow-lg shadow-red-950/15">
        <div className="flex items-center gap-2.5 text-red-400 font-bold mb-3">
          <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center border border-red-500/25">
            <FaTimesCircle size={14} />
          </div>
          Execution Error / Compilation Failed
        </div>
        <div className="bg-slate-950/80 border border-red-950/80 rounded-xl p-4 font-mono text-xs overflow-x-auto shadow-inner">
          <pre className="text-red-350 whitespace-pre-wrap leading-relaxed">
            {output.message}
          </pre>
        </div>
        <p className="text-[11px] text-slate-500 mt-3">
          Please check your code syntax, function naming, or parameters, then try again.
        </p>
      </div>
    );
  }

  if (output.status === "submitted") {
    const d = output.data?.data || output.data;
    const passed = d?.passed ?? d?.testsPassed ?? 0;
    const total = d?.total ?? d?.testsTotal ?? 0;
    const allPass = d?.finalResult === "accepted" || (passed === total && total > 0);

    return (
      <div
        className={`border rounded-2xl p-6 shadow-xl transition-all duration-300 ${
          allPass
            ? "bg-emerald-950/10 border-emerald-500/30 shadow-emerald-950/10"
            : "bg-red-950/10 border-red-500/20 shadow-red-950/10"
        }`}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div
              className={`flex items-center gap-2.5 font-extrabold text-xl mb-1 ${
                allPass ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {allPass ? (
                <div className="w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center border border-emerald-500/30">
                  <FaCheckCircle size={16} />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-red-500/15 flex items-center justify-center border border-red-500/30">
                  <FaTimesCircle size={16} />
                </div>
              )}
              {allPass ? "Accepted ✓" : "Wrong Answer"}
            </div>
            <p className="text-slate-400 text-xs">Final solution evaluation result</p>
          </div>
          {d?.score !== undefined && (
            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Score Gained</span>
              <span className="text-2xl font-black text-yellow-400">{d.score} <span className="text-xs text-slate-400 font-normal">pts</span></span>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
            <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Test Cases Passed</span>
            <span className={`text-lg font-mono font-bold ${passed === total ? "text-emerald-400" : "text-yellow-400"}`}>
              {passed} / {total}
            </span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
            <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Verdict</span>
            <span className={`text-sm font-semibold uppercase ${allPass ? "text-emerald-400" : "text-yellow-400"}`}>
              {d?.finalResult?.replace("_", " ") || (allPass ? "accepted" : "failed")}
            </span>
          </div>
        </div>

        {d?.message && (
          <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3.5 mb-4 text-sm text-slate-300 leading-relaxed font-mono">
            {d.message}
          </div>
        )}

        <div className="flex items-center gap-2 text-slate-500 text-[11px] bg-slate-950/20 px-3.5 py-2.5 rounded-lg border border-slate-850">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          Evaluation complete. Moving to next challenge question...
        </div>
      </div>
    );
  }

  // Run result
  if (output.status === "done") {
    const d = output.data;
    const results = d?.results || d?.testResults || [];
    const passed = results.filter((r) => r.passed || r.status === "passed").length;
    const allPass = passed === results.length && results.length > 0;

    return (
      <div className="space-y-4">
        {/* Header summary panel */}
        <div className={`p-4 rounded-2xl border transition-all duration-300 ${
          allPass 
            ? "bg-emerald-950/10 border-emerald-500/25 shadow-sm shadow-emerald-950/10" 
            : "bg-red-950/10 border-red-500/25 shadow-sm shadow-red-950/10"
        }`}>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              {allPass ? (
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-inner">
                  <FaCheckCircle className="text-emerald-400" size={18} />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-inner">
                  <FaTimesCircle className="text-red-400" size={18} />
                </div>
              )}
              <div>
                <h4 className={`text-md font-bold ${allPass ? "text-emerald-400" : "text-red-400"}`}>
                  {allPass ? "All Sample Test Cases Passed" : "Wrong Answer"}
                </h4>
                <p className="text-[11px] text-slate-400">
                  {passed} of {results.length} test cases passed.
                </p>
              </div>
            </div>

            {results.length > 0 && results[0]?.executionTime !== undefined && (
              <div className="text-right">
                <span className="text-[9px] text-slate-500 uppercase tracking-wider block font-semibold">Max runtime</span>
                <span className="text-sm font-mono font-bold text-slate-300">
                  {Math.max(...results.map(r => r.executionTime || 0)).toFixed(1)} ms
                </span>
              </div>
            )}
          </div>
        </div>

        {results.length > 0 ? (
          <div className="space-y-4">
            {/* Horizontal tab headers for test cases */}
            <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2 overflow-x-auto scrollbar-none">
              {results.map((r, i) => {
                const ok = r.passed || r.status === "passed";
                const isSelected = i === selectedTestCaseIdx;
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedTestCaseIdx(i)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 whitespace-nowrap
                      ${
                        isSelected
                          ? ok
                            ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-md shadow-emerald-950/20"
                            : "bg-red-500/10 border-red-500/40 text-red-400 shadow-md shadow-red-950/20"
                          : "bg-slate-900/40 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                      }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${ok ? "bg-emerald-400" : "bg-red-400"}`} />
                    Case {i + 1}
                  </button>
                );
              })}
            </div>

            {/* Selected test case details */}
            {(() => {
              const r = results[selectedTestCaseIdx] || results[0];
              if (!r) return null;
              const ok = r.passed || r.status === "passed";
              const isUndefinedGot = String(r.got) === "undefined" || r.got === undefined || r.got === "";

              return (
                <div className="space-y-4 bg-slate-900/30 border border-slate-800/60 rounded-2xl p-5">
                  {/* Status row */}
                  <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                    <span className="text-xs text-slate-400 font-mono">
                      Test Case {selectedTestCaseIdx + 1} Evaluation
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider
                      ${ok 
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                        : "bg-red-500/10 border-red-500/30 text-red-400"}`}>
                      {ok ? "Passed" : "Failed"}
                    </span>
                  </div>

                  {/* Input block */}
                  {r.input !== undefined && (
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold mb-1.5">Input</span>
                      <pre className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 font-mono text-xs text-slate-300 overflow-x-auto shadow-inner leading-relaxed">
                        {String(r.input)}
                      </pre>
                    </div>
                  )}

                  {/* Expected Output block */}
                  {r.expected !== undefined && (
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold mb-1.5">Expected Output</span>
                      <pre className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 font-mono text-xs text-emerald-450 font-semibold overflow-x-auto shadow-inner leading-relaxed">
                        {String(r.expected)}
                      </pre>
                    </div>
                  )}

                  {/* Your Output block */}
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold mb-1.5">Your Output</span>
                    <div className="relative">
                      <pre className={`bg-slate-950/70 border rounded-xl p-3.5 font-mono text-xs overflow-x-auto shadow-inner leading-relaxed
                        ${ok 
                          ? "border-emerald-500/25 text-emerald-400 font-semibold" 
                          : isUndefinedGot 
                            ? "border-amber-500/30 text-amber-500 bg-amber-955/5"
                            : "border-red-500/25 text-red-400 font-semibold"}`}>
                        {isUndefinedGot ? "undefined" : String(r.got)}
                      </pre>

                      {/* Warning for Undefined Output */}
                      {!ok && isUndefinedGot && (
                        <div className="mt-2.5 p-3.5 bg-amber-500/5 border border-amber-500/20 rounded-xl flex items-start gap-2.5 text-xs text-amber-400/90 leading-relaxed shadow-sm">
                          <span className="text-base leading-none">⚠️</span>
                          <div>
                            <strong className="font-semibold block text-amber-400 mb-0.5">Warning: Function returned undefined or empty</strong>
                            Your solution code is not returning any value. Make sure you use a <code className="bg-amber-500/10 px-1 py-0.5 rounded font-mono font-bold text-amber-300">return</code> statement to output the final result from your entry function.
                          </div>
                        </div>
                      )}

                      {/* Notice for Mismatch Output */}
                      {!ok && !isUndefinedGot && (
                        <div className="mt-2.5 p-3.5 bg-red-500/5 border border-red-500/20 rounded-xl flex items-start gap-2.5 text-xs text-red-400/90 leading-relaxed shadow-sm">
                          <span className="text-base leading-none">❌</span>
                          <div>
                            <strong className="font-semibold block text-red-400 mb-0.5">Wrong Answer: Output Mismatch</strong>
                            The value returned by your function does not match the expected output. Please check your logic and try again.
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Runtime errors block */}
                  {r.error && (
                    <div className="mt-3">
                      <span className="text-[10px] text-red-400/80 uppercase tracking-wider block font-bold mb-1.5">Runtime Stack Trace</span>
                      <pre className="bg-red-950/15 border border-red-950/60 rounded-xl p-3.5 font-mono text-xs text-red-300 overflow-x-auto shadow-inner leading-relaxed">
                        {r.error}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        ) : (
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <h4 className="text-xs font-semibold text-slate-400 mb-2">Raw Server Log Output</h4>
            <pre className="text-slate-300 text-xs font-mono whitespace-pre-wrap bg-slate-950/80 rounded-xl p-4 overflow-x-auto shadow-inner">
              {JSON.stringify(d, null, 2)}
            </pre>
          </div>
        )}
      </div>
    );
  }

  return null;
}
