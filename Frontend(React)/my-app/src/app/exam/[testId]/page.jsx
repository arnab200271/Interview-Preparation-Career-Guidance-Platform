"use client";

import { useEffect, useRef, useState } from "react";

import { useParams, useRouter } from "next/navigation";

import { motion, AnimatePresence } from "framer-motion";

import {
  FiClock,
  FiCheckCircle,
  FiArrowRight,
  FiSkipForward,
} from "react-icons/fi";

import { useAppDispatch } from "@/Redux/hooks/hooks";

import {
  getQuestionThunk,
  submitTestThunk,
} from "@/Redux/slice/slice";

export default function ExamPage() {
  const { testId } = useParams();

  const router = useRouter();

  const dispatch = useAppDispatch();

  // =========================
  // STATES
  // =========================

  const [questions, setQuestions] = useState([]);

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [selectedAnswer, setSelectedAnswer] =
    useState("");

  const [answers, setAnswers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [questionTime, setQuestionTime] =
    useState(5);

  const [testTime, setTestTime] = useState(600);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [redirectTime, setRedirectTime] =
    useState(5);

  // =========================
  // REFS
  // =========================

  const submittedRef = useRef(false);

  const answersRef = useRef([]);

  const examFinishedRef = useRef(false);

  const testTimerRef = useRef(null);

  const questionTimerRef = useRef(null);

  const redirectTimerRef = useRef(null);

  // =========================
  // SYNC ANSWERS
  // =========================

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  // =========================
  // LOAD QUESTIONS
  // =========================

  useEffect(() => {
    if (!testId) {
      router.replace("/mcq");

      return;
    }

    const loadQuestions = async () => {
      try {
        setLoading(true);

        const response = await dispatch(
          getQuestionThunk(testId)
        );

        if (response.payload?.success) {
          setQuestions(response.payload.data || []);
        } else {
          router.replace("/mcq");
        }
      } catch (error) {
        console.log(error);

        router.replace("/mcq");
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [dispatch, router, testId]);

  // =========================
  // TEST TIMER
  // =========================

  
useEffect(() => {
  if (!questions.length || submittedRef.current) return;

  const timer = setInterval(() => {

    setTestTime((prev) => {

      if (prev <= 1) {
        clearInterval(timer);
        return 0;
      }

      return prev - 1;
    });

  }, 1000);

  return () => clearInterval(timer);

}, [questions]);
useEffect(() => {

  if (testTime === 0 && !submittedRef.current) {

    finishExam();

  }

}, [testTime]);
  // =========================
  // QUESTION TIMER
  // =========================

 
useEffect(() => {
  if (!questions.length || submittedRef.current) return;

  const timer = setInterval(() => {

    setQuestionTime((prev) => {

      if (prev <= 1) {
        clearInterval(timer);
        return 0;
      }

      return prev - 1;
    });

  }, 1000);

  return () => clearInterval(timer);

}, [currentIndex, questions]);
useEffect(() => {

  if (questionTime === 0 && !submittedRef.current) {

    handleSkip();

  }

}, [questionTime]);

// =========================
// REDIRECT WHEN COUNTER HITS 0
// =========================
useEffect(() => {
  if (redirectTime === 0 && examFinishedRef.current) {
    router.replace("/result");
  }
}, [redirectTime, router]);
  // =========================
  // SAVE ANSWER
  // =========================

  const saveAnswer = (answerValue = "") => {
    const currentQuestion =
      questions[currentIndex];

    if (!currentQuestion) return;

    const newAnswer = {
      questionId: currentQuestion._id,
      selectedAnswer: answerValue,
    };

    setAnswers((prev) => {
      const alreadyExist = prev.find(
        (item) =>
          item.questionId ===
          currentQuestion._id
      );

      if (alreadyExist) {
        return prev;
      }

      const updated = [...prev, newAnswer];

      answersRef.current = updated;

      return updated;
    });
  };

  // =========================
  // NEXT QUESTION
  // =========================

  const nextQuestion = () => {
    setSelectedAnswer("");

    setQuestionTime(5);

    setCurrentIndex((prev) => prev + 1);
  };

  // =========================
  // SUBMIT ANSWER
  // =========================

  const handleSubmit = async () => {
    saveAnswer(selectedAnswer);

    // LAST QUESTION
    if (
      currentIndex >=
      questions.length - 1
    ) {
      await finishExam();

      return;
    }

    nextQuestion();
  };

  // =========================
  // SKIP QUESTION
  // =========================

  const handleSkip = async () => {
    saveAnswer("");

    // LAST QUESTION
    if (
      currentIndex >=
      questions.length - 1
    ) {
      await finishExam();

      return;
    }

    nextQuestion();
  };

  // =========================
  // FINISH EXAM
  // =========================

  const finishExam = async () => {
    try {
      if (
        submittedRef.current ||
        examFinishedRef.current
      )
        return;

      submittedRef.current = true;

      examFinishedRef.current = true;

      // STOP TIMERS
      clearInterval(testTimerRef.current);

      clearInterval(questionTimerRef.current);

      setIsSubmitting(true);

      const payload = {
        testId,
        answers: answersRef.current,
        timeTaken: 600 - testTime,
      };

      const response = await dispatch(
        submitTestThunk(payload)
      );

      if (response.payload?.success) {
        // START REDIRECT TIMER — navigation happens in useEffect watching redirectTime
        redirectTimerRef.current =
          setInterval(() => {
            setRedirectTime((prev) => {
              if (prev <= 1) {
                clearInterval(
                  redirectTimerRef.current
                );
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
      } else {
        submittedRef.current = false;

        examFinishedRef.current = false;
      }
    } catch (error) {
      console.log(error);

      submittedRef.current = false;

      examFinishedRef.current = false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================
  // FORMAT TIMER
  // =========================

  const formatTime = (time) => {
    const min = Math.floor(time / 60);

    const sec = time % 60;

    return `${min
      .toString()
      .padStart(2, "0")}:${sec
      .toString()
      .padStart(2, "0")}`;
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear",
          }}
          className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  // =========================
  // NO QUESTIONS
  // =========================

  if (!questions.length) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center text-white">
        No Questions Found
      </div>
    );
  }

  const currentQuestion =
    questions[currentIndex];

  // =========================
  // UI
  // =========================

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#020617] flex items-center justify-center p-3 overflow-hidden">
      {/* GLOW */}
      <div className="absolute w-[350px] h-[350px] bg-cyan-500/10 blur-[120px] rounded-full top-0 left-0" />

      <div className="absolute w-[350px] h-[350px] bg-blue-500/10 blur-[120px] rounded-full bottom-0 right-0" />

      {/* BOARD */}
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.95,
          y: 20,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}
        transition={{
          duration: 0.4,
        }}
        className="relative z-10 w-full max-w-2xl bg-[#07111f]/90 backdrop-blur-2xl border border-slate-700 rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* TOP */}
        <div className="border-b border-slate-800 px-4 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* LEFT */}
          <div>
            <h2 className="text-white text-lg md:text-xl font-bold">
              MCQ Examination
            </h2>

            <p className="text-slate-400 text-xs mt-1">
              Answer carefully before time
              runs out
            </p>
          </div>

          {/* TIMERS */}
          <div className="flex items-center gap-3">
            {/* QUESTION TIMER */}
            <div className="bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-xl">
              <p className="text-[10px] text-red-300">
                Question
              </p>

              <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                <FiClock />

                {questionTime}s
              </div>
            </div>

            {/* TEST TIMER */}
            <div className="bg-cyan-500/10 border border-cyan-500/20 px-3 py-2 rounded-xl">
              <p className="text-[10px] text-cyan-300">
                Total
              </p>

              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <FiClock />

                {formatTime(testTime)}
              </div>
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className="p-5 md:p-6">
          {/* PROGRESS */}
          <div className="mb-6">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-slate-300">
                Question {currentIndex + 1} of{" "}
                {questions.length}
              </span>

              <span className="text-cyan-400">
                {Math.round(
                  ((currentIndex + 1) /
                    questions.length) *
                    100
                )}
                %
              </span>
            </div>

            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${
                    ((currentIndex + 1) /
                      questions.length) *
                    100
                  }%`,
                }}
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"
              />
            </div>
          </div>

          {/* FINISHED SCREEN */}
          {examFinishedRef.current ? (
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.9,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              className="py-16 flex flex-col items-center justify-center text-center"
            >
              <div className="w-20 h-20 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-5">
                <FiCheckCircle className="text-cyan-400 text-4xl" />
              </div>

              <h2 className="text-2xl font-bold text-white mb-3">
                Exam Completed
              </h2>

              <p className="text-slate-400 mb-6">
                Preparing your result...
              </p>

              <div className="w-16 h-16 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin mb-4" />

              <p className="text-cyan-400 text-lg font-bold">
                Redirecting in {redirectTime}s
              </p>
            </motion.div>
          ) : (
            <>
              {/* QUESTION */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{
                    opacity: 0,
                    x: 30,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  exit={{
                    opacity: 0,
                    x: -30,
                  }}
                  transition={{
                    duration: 0.3,
                  }}
                >
                  <div className="mb-6">
                    <h1 className="text-lg md:text-xl font-bold text-white leading-relaxed">
                      {
                        currentQuestion?.question
                      }
                    </h1>
                  </div>

                  {/* OPTIONS */}
                  <div className="grid gap-3">
                    {currentQuestion?.options?.map(
                      (option, index) => (
                        <label
                          key={index}
                          className={`group relative flex items-center gap-3 p-3 rounded-2xl border transition-all duration-300 cursor-pointer
                      
                      ${
                        selectedAnswer === option
                          ? "border-cyan-500 bg-cyan-500/10"
                          : "border-slate-700 bg-slate-900/40 hover:border-cyan-500/40 hover:bg-slate-800"
                      }
                    `}
                        >
                          <input
                            type="radio"
                            name={`question-${currentIndex}`}
                            value={option}
                            checked={
                              selectedAnswer ===
                              option
                            }
                            onChange={(e) =>
                              setSelectedAnswer(
                                e.target.value
                              )
                            }
                            className="w-4 h-4 accent-cyan-500"
                          />

                          <span className="text-white text-sm">
                            {option}
                          </span>

                          {selectedAnswer ===
                            option && (
                            <FiCheckCircle className="ml-auto text-cyan-400 text-lg" />
                          )}
                        </label>
                      )
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* BUTTONS */}
              <div className="flex items-center justify-between mt-8">
                {/* SKIP */}
                <button
                  onClick={handleSkip}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 px-4 py-2.5 rounded-xl text-red-400 text-sm font-semibold transition-all duration-300"
                >
                  <FiSkipForward />

                  Skip
                </button>

                {/* SUBMIT */}
                <button
                  onClick={handleSubmit}
                  disabled={
                    !selectedAnswer ||
                    isSubmitting
                  }
                  className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 px-5 py-2.5 rounded-xl text-white text-sm font-bold shadow-lg transition-all duration-300 disabled:opacity-50"
                >
                  {currentIndex ===
                  questions.length - 1
                    ? "Finish Exam"
                    : "Submit"}

                  <FiArrowRight />
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}