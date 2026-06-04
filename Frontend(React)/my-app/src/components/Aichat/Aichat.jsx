"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { usePathname } from "next/navigation";

import { motion, AnimatePresence } from "framer-motion";
import { FaRobot, FaPaperPlane, FaTimes, FaUser } from "react-icons/fa";
import { useAppDispatch, useAppselector } from "@/Redux/hooks/hooks";
import { addUserMessage, chatWithAIThunk } from "@/Redux/slice/aislice";

// Routes on which the AI chat widget must be hidden
const HIDDEN_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/reverify",
  "/result",
];
// Path prefixes that also hide the widget (exam pages)
const HIDDEN_PREFIXES = ["/exam", "/challenges"];

const AIChatWidget = () => {
  const pathname = usePathname();
  const dispatch = useAppDispatch();

  const { messages, loading } = useAppselector((state) => state.aiStore);
  const { user } = useAppselector((state) => state.mainstore);

  const [open, setOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const chatEndRef = useRef(null);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    setIsAuthenticated(!!token || !!user);
  }, [user]);

  // Hide on auth, exam, and result pages — computed AFTER all hooks
  const isHidden =
    HIDDEN_ROUTES.includes(pathname) ||
    HIDDEN_PREFIXES.some((prefix) => pathname?.startsWith(prefix));

  if (isHidden || !isAuthenticated) return null;

  const onSubmit = (data) => {
    const text = data.message?.trim();

    if (!text) return;

    dispatch(addUserMessage(text));
    dispatch(chatWithAIThunk(text));

    reset();
  };

  return (
    <>
      {/* Floating AI Button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-[999] flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-[0_0_35px_rgba(34,211,238,.55)]"
      >
        <div className="absolute inset-0 rounded-full animate-ping bg-cyan-500/20" />
        <FaRobot size={26} className="relative z-10" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="
          fixed z-[999]
          bottom-24 right-4
          w-[95vw] sm:w-[420px]
          max-w-[420px]
          h-[50vh] sm:h-[500px]
          rounded-[30px]
          overflow-hidden
          border border-white/10
          bg-[#050816]/95
          backdrop-blur-2xl
          shadow-[0_20px_80px_rgba(0,0,0,.6)]
          flex flex-col
        "
          >
            {/* Glow Background */}
            <div className="absolute inset-0 -z-10">
              <div className="absolute inset-0 bg-cyan-500/10 blur-[120px]" />
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-violet-500/10 via-cyan-500/10 to-blue-500/10" />
            </div>

            {/* Header */}
            <div className="h-20 px-5 border-b border-white/10 bg-black/30 backdrop-blur-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 flex items-center justify-center shadow-[0_0_25px_rgba(34,211,238,.5)]">
                  <FaRobot size={18} className="text-white" />
                </div>

                <div>
                  <h3 className="text-white font-bold">AI Career Assistant</h3>

                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-xs text-green-400">Online</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <FaTimes />
              </button>
            </div>

            {/* Quick Suggestions */}
            <div className="p-3 border-b border-white/10 flex flex-wrap gap-2">
              {[
                "React Roadmap",
                "Node.js Interview",
                "MERN Stack Guide",
                "Resume Tips",
              ].map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    dispatch(addUserMessage(item));
                    dispatch(chatWithAIThunk(item));
                  }}
                  className="
                px-3 py-2
                text-xs
                rounded-xl
                bg-white/5
                border border-white/10
                text-slate-300
                hover:border-cyan-400/50
                hover:bg-white/10
                transition
              "
                >
                  {item}
                </button>
              ))}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 flex items-center justify-center mb-5 shadow-[0_0_40px_rgba(34,211,238,.4)]">
                    <FaRobot className="text-white" size={34} />
                  </div>

                  <h2 className="text-white font-semibold mb-2">
                    Welcome to AI Career Assistant
                  </h2>

                  <p className="text-slate-400 text-sm max-w-xs">
                    Ask about Full Stack Development, React, Node.js, Resume
                    Building, Career Guidance and Interview Preparation.
                  </p>
                </div>
              )}

              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.role === "candidate" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-[22px] px-4 py-3 text-sm ${
                      msg.role === "candidate"
                        ? "bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-lg"
                        : "bg-white/5 border border-white/10 text-slate-200 backdrop-blur-xl"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {msg.role === "candidate" ? (
                        <FaUser size={10} />
                      ) : (
                        <FaRobot size={10} />
                      )}

                      <span className="text-[11px] opacity-70">
                        {msg.role === "candidate" ? "You" : "AI Assistant"}
                      </span>
                    </div>

                    <p className="leading-relaxed whitespace-pre-wrap">
                      {msg.text}
                    </p>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 backdrop-blur-xl px-4 py-3 rounded-2xl">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.15s]" />
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.3s]" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="p-4 border-t border-white/10 bg-black/20 backdrop-blur-xl"
            >
              <div className="flex gap-2 p-2 rounded-2xl bg-white/5 border border-white/10">
                <input
                  {...register("message")}
                  placeholder="Ask anything..."
                  className="
                flex-1
                bg-transparent
                outline-none
                px-3
                text-white
                placeholder:text-slate-500
              "
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="
                w-12 h-12
                rounded-xl
                bg-gradient-to-r
                from-violet-600
                to-cyan-500
                text-white
                flex items-center justify-center
                shadow-[0_0_20px_rgba(34,211,238,.4)]
              "
                >
                  <FaPaperPlane />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatWidget;
