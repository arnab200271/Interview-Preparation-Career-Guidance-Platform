"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { useAppDispatch, useAppselector } from "@/Redux/hooks/hooks";
import { getAllCategory, getTestThunk } from "@/Redux/slice/slice";
import { getCodingTestThunk } from "@/Redux/slice/codingSlice";
import axiosInstance from "../../api/axiosInstance/axiosInstnace";

// ── Icons ─────────────────────────────────────────────────────────────────────
import { TbBolt, TbBrain, TbCode, TbDeviceDesktopAnalytics, TbTrophy, TbMicrophone, TbBrandJavascript, TbBrandReact, TbBrandNodejs, TbDatabase, TbTree, TbServer } from "react-icons/tb";
import { HiArrowRight, HiSparkles, HiCheckCircle } from "react-icons/hi2";
import { FiGithub, FiTwitter, FiLinkedin, FiStar, FiZap, FiTarget, FiClock, FiAward, FiUsers, FiBookOpen, FiChevronRight, FiFileText, FiFolder } from "react-icons/fi";

import { RiRobot2Line } from "react-icons/ri";
import { SiMongodb } from "react-icons/si";

// ── Animation Helpers ─────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};
const stagger = (delay = 0) => ({
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut", delay } },
});

function Section({ children, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.section
      ref={ref}
      variants={fadeUp}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      className={`section-padding px-4 sm:px-6 lg:px-8 ${className}`}
    >
      {children}
    </motion.section>
  );
}

// ── Data ──────────────────────────────────────────────────────────────────────
const STATS = [
  { label: "Questions",        value: "10K+",  icon: FiBookOpen,  color: "from-cyan-500   to-blue-600"   },
  { label: "Challenges",       value: "500+",  icon: FiTarget,    color: "from-purple-500 to-pink-600"   },
  { label: "AI Suggestions",   value: "5K+",   icon: FiZap,       color: "from-green-500  to-emerald-600" },
  { label: "Active Users",     value: "25K+",  icon: FiUsers,     color: "from-orange-500 to-red-500"    },
];

const getCategoryStyles = (name = "") => {
  const normalized = name.toLowerCase();
  if (normalized.includes("javascript") || normalized.includes("js")) {
    return {
      icon: TbBrandJavascript,
      color: "#f7df1e",
      bg: "from-yellow-500/15 to-yellow-600/5",
      border: "border-yellow-500/20",
    };
  }
  if (normalized.includes("react")) {
    return {
      icon: TbBrandReact,
      color: "#61dafb",
      bg: "from-cyan-500/15 to-cyan-600/5",
      border: "border-cyan-500/20",
    };
  }
  if (normalized.includes("node")) {
    return {
      icon: TbBrandNodejs,
      color: "#68a063",
      bg: "from-green-500/15 to-green-600/5",
      border: "border-green-500/20",
    };
  }
  if (normalized.includes("mongodb") || normalized.includes("mongo")) {
    return {
      icon: SiMongodb,
      color: "#47a248",
      bg: "from-emerald-500/15 to-emerald-600/5",
      border: "border-emerald-500/20",
    };
  }
  if (normalized.includes("dsa") || normalized.includes("data structure") || normalized.includes("algorithm") || normalized.includes("tree") || normalized.includes("graph")) {
    return {
      icon: TbTree,
      color: "#a78bfa",
      bg: "from-purple-500/15 to-purple-600/5",
      border: "border-purple-500/20",
    };
  }
  if (normalized.includes("system design") || normalized.includes("system") || normalized.includes("server") || normalized.includes("architecture")) {
    return {
      icon: TbServer,
      color: "#f97316",
      bg: "from-orange-500/15 to-orange-600/5",
      border: "border-orange-500/20",
    };
  }
  // Fallbacks
  return {
    icon: FiFolder,
    color: "#06b6d4",
    bg: "from-cyan-500/15 to-cyan-600/5",
    border: "border-cyan-500/20",
  };
};

const CHALLENGES = [
  {
    id: 1,
    title: "Two Sum",
    difficulty: "Easy",
    diffColor: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
    tags: ["Array", "Hash Table"],
    acceptance: "49.5%",
    solved: "2.3M",
  },
  {
    id: 2,
    title: "LRU Cache",
    difficulty: "Medium",
    diffColor: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
    tags: ["Design", "Linked List", "Hash Table"],
    acceptance: "41.2%",
    solved: "1.1M",
  },
  {
    id: 3,
    title: "Merge K Sorted Lists",
    difficulty: "Hard",
    diffColor: "text-red-400 bg-red-400/10 border-red-400/30",
    tags: ["Linked List", "Divide & Conquer", "Heap"],
    acceptance: "51.0%",
    solved: "890K",
  },
];

// Features used for practice guidance



const TESTIMONIALS = [
  {
    name: "Emily Chen",
    role: "SWE @ Google",
    stars: 5,
    quote: "InterviewAI completely transformed my preparation. The coding practice with instant detailed feedback and suggestions helped me write clean, optimal solutions in no time!",
    avatar: "EC",
    color: "from-cyan-500 to-blue-600",
  },
  {
    name: "Marcus Williams",
    role: "Backend Dev @ Meta",
    stars: 5,
    quote: "The DSA practice combined with instant detailed feedback is unmatched. I went from struggling with mediums to cracking hards in 6 weeks.",
    avatar: "MW",
    color: "from-purple-500 to-pink-600",
  },
  {
    name: "Ananya Gupta",
    role: "Full-Stack @ Stripe",
    stars: 5,
    quote: "The system design section alone is worth it. Real-world scenarios with comprehensive solutions helped me ace every design round.",
    avatar: "AG",
    color: "from-green-500 to-emerald-600",
  },
];

const FOOTER_LINKS = {
  Platform: ["Practice",  "MCQ Tests", "Challenges", "Resume Builder", "Leaderboard"],
  Resources: ["Blog",     "Roadmaps",  "Interview Tips", "Study Plans", "FAQ"],
  Company:   ["About Us", "Careers",   "Press", "Contact", "Privacy Policy"],
};

// ── FiMicrophone alias ────────────────────────────────────────────────────────
function FiMicrophone(props) {
  return <TbMicrophone {...props} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// ── Dynamic Typewriter Words ──────────────────────────────────────────────────
const TYPEWRITER_WORDS = [
  "Coding Interviews",
  "Practice Coding",
  "Practice Exams",
  "MCQ Tests",
  "System Design",
  "Resume Building"
];

// HOME PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { categories, tests } = useAppselector((state) => state.mainstore);
  const { codingTests } = useAppselector((state) => state.codingStore);

  useEffect(() => {
    dispatch(getAllCategory());
    dispatch(getTestThunk());
    dispatch(getCodingTestThunk());
  }, [dispatch]);

  const handleCategoryClick = async (category) => {
    // 1. Auth Check
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      const result = await Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "Please login to start preparing for " + category.name + " exams.",
        confirmButtonText: "Login",
        showCancelButton: true,
        background: "#081120",
        color: "#fff",
        confirmButtonColor: "#06b6d4",
        cancelButtonColor: "#1e293b",
      });

      if (result.isConfirmed) {
        router.push("/login");
      }
      return;
    }

    // 2. Show loading modal
    Swal.fire({
      title: "Analyzing category...",
      text: "Checking for available tests and questions.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
      background: "#081120",
      color: "#fff",
    });

    // 3. Find matching tests
    const categoryTests = (tests || []).filter((t) => {
      const cid = typeof t.categoryId === "object" ? t.categoryId?._id : t.categoryId;
      return cid === category._id;
    });

    if (categoryTests.length === 0) {
      Swal.fire({
        title: category.name + " Exams Coming Soon!",
        text: "We are currently designing high-quality questions for this topic. Stay tuned!",
        icon: "info",
        confirmButtonText: "Great, I'll wait",
        background: "#081120",
        color: "#fff",
        confirmButtonColor: "#06b6d4",
      });
      return;
    }

    // 4. Check for questions in the tests
    let activeTest = null;
    for (const test of categoryTests) {
      try {
        const res = await axiosInstance.get(`/test/${test._id}`);
        if (res.data && res.data.success && res.data.data && res.data.data.length > 0) {
          activeTest = test;
          break;
        }
      } catch (err) {
        console.error("Error checking questions for test:", test._id, err);
      }
    }

    if (activeTest) {
      Swal.close();
      router.push(`/mcq`);
    } else {
      Swal.fire({
        title: category.name + " Exams Coming Soon!",
        text: "No active questions are currently available for this category's tests.",
        icon: "info",
        confirmButtonText: "Okay",
        background: "#081120",
        color: "#fff",
        confirmButtonColor: "#06b6d4",
      });
    }
  };

  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(120);

  useEffect(() => {
    const handleType = () => {
      const fullWord = TYPEWRITER_WORDS[currentWordIndex];
      if (!isDeleting) {
        // Typing text
        setCurrentText(fullWord.substring(0, currentText.length + 1));
        setTypingSpeed(100 + Math.random() * 40); // Natural variance in typing speed

        if (currentText === fullWord) {
          // Pause when word is fully typed
          setTypingSpeed(1800);
          setIsDeleting(true);
        }
      } else {
        // Deleting text
        setCurrentText(fullWord.substring(0, currentText.length - 1));
        setTypingSpeed(50); // Faster delete speed

        if (currentText === "") {
          setIsDeleting(false);
          // Move to the next word in the list
          setCurrentWordIndex((prev) => (prev + 1) % TYPEWRITER_WORDS.length);
          setTypingSpeed(600); // Pause before starting to type next word
        }
      }
    };

    const timer = setTimeout(handleType, typingSpeed);
    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentWordIndex, typingSpeed]);

  return (
    <div className="min-h-screen bg-[#020617] overflow-x-hidden">

      {/* ════════════════════════════════════════════════════
          HERO SECTION
      ════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-16 overflow-hidden">

        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] animate-glow pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/15 rounded-full blur-[120px] animate-glow pointer-events-none" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[160px] pointer-events-none" />

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left: Text */}
            <div>
              {/* Badge */}
              <motion.div
                variants={stagger(0.1)}
                initial="hidden"
                animate="show"
                className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/25 rounded-full px-4 py-1.5 mb-6"
              >
                <HiSparkles size={14} className="text-cyan-400" />
                <span className="text-cyan-400 text-sm font-medium">Interactive Interview Prep</span>
              </motion.div>

              {/* Heading */}
              <motion.h1
                variants={stagger(0.2)}
                initial="hidden"
                animate="show"
                className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight text-white mb-6 min-h-[3.2em] sm:min-h-[3.6em] lg:min-h-[3.8em]"
              >
                Master{" "}
                <br className="sm:hidden" />
                <span className="shimmer-text">{currentText}</span>
                <span className="text-cyan-400 animate-blink font-light ml-1">|</span>
                <br />
                <span className="gradient-text">for Your Career</span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                variants={stagger(0.3)}
                initial="hidden"
                animate="show"
                className="text-lg text-gray-400 leading-relaxed mb-8 max-w-lg"
              >
                Practice real interview questions, get detailed solutions, master core concepts, and land your dream job at top tech companies.
              </motion.p>

              {/* CTAs */}
              <motion.div
                variants={stagger(0.4)}
                initial="hidden"
                animate="show"
                className="flex flex-wrap gap-4 mb-10"
              >
                <Link
                  href="/mcq"
                  className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold hover:from-blue-500 hover:to-cyan-400 shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 hover:scale-[1.03]"
                >
                  <TbBolt size={18} />
                  Start Practicing Free
                  <HiArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="#"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-white/15 text-gray-200 font-semibold hover:bg-white/5 hover:border-white/30 transition-all duration-200"
                >
                  <HiSparkles size={18} className="text-cyan-400 animate-pulse" />
                  Explore Dashboard
                </Link>
              </motion.div>

              {/* Trust strip */}
              <motion.div
                variants={stagger(0.5)}
                initial="hidden"
                animate="show"
                className="flex items-center gap-6 text-sm text-gray-500"
              >
                {["No credit card required", "10K+ questions", "25K+ developers"].map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <HiCheckCircle size={14} className="text-emerald-400" />
                    {t}
                  </span>
                ))}
              </motion.div>
            </div>

            {/* Right: Code terminal mockup */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
              className="hidden lg:block animate-float"
            >
              <div className="relative">
                {/* Glow behind card */}
                <div className="absolute -inset-4 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-3xl blur-2xl" />

                {/* Terminal card */}
                <div className="relative glass border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
                  {/* Terminal header */}
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-white/8 bg-white/3">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    <span className="ml-3 text-gray-500 text-xs font-mono">two_sum.js — InterviewAI</span>
                  </div>

                  {/* Code */}
                  <div className="p-6 font-mono text-sm leading-7">
                    <div className="text-gray-500">{"// Two Sum — Easy"}</div>
                    <div className="text-purple-400">{"function "}<span className="text-cyan-400">{"twoSum"}</span><span className="text-white">{"(nums, target) {"}</span></div>
                    <div className="text-white pl-4">{"  "}<span className="text-purple-400">const</span>{" map = "}<span className="text-purple-400">new</span>{" Map();"}</div>
                    <div className="pl-4 text-purple-400">{"  for "}<span className="text-white">{"(let i = 0; i < nums.length; i++) {"}</span></div>
                    <div className="pl-8 text-purple-400">{"    const "}<span className="text-white">{"comp = target - nums[i];"}</span></div>
                    <div className="pl-8 text-purple-400">{"    if "}<span className="text-white">{"(map.has(comp))"}</span></div>
                    <div className="pl-12 text-purple-400">{"      return "}<span className="text-white">{"[map.get(comp), i];"}</span></div>
                    <div className="pl-8">{"    "}<span className="text-cyan-400">{"map"}</span><span className="text-white">{".set(nums[i], i);"}</span></div>
                    <div className="pl-4 text-white">{"  }"}</div>
                    <div className="text-white">{"}"}</div>
                  </div>

                  {/* Detailed feedback strip */}
                  <div className="px-6 pb-5">
                    <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-3 flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                        <RiRobot2Line size={13} className="text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-emerald-400 text-xs font-semibold">Detailed feedback</p>
                        <p className="text-gray-400 text-xs">✓ O(n) time, O(n) space — Optimal solution!</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating badge */}
                <div className="absolute -top-4 -right-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl px-3 py-1.5 shadow-xl shadow-orange-500/30 animate-bounce-gentle">
                  <span className="text-white text-xs font-bold">⚡ Accepted</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="flex justify-center mt-16"
          >
            <div className="flex flex-col items-center gap-1 text-gray-600">
              <span className="text-xs">Scroll to explore</span>
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-px h-8 bg-gradient-to-b from-gray-600 to-transparent"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          STATS SECTION
      ════════════════════════════════════════════════════ */}
      <Section className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {STATS.map(({ label, value, icon: Icon, color }, i) => (
            <motion.div
              key={label}
              variants={stagger(i * 0.1)}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              whileHover={{ scale: 1.04, y: -4 }}
              className="glass border border-white/8 rounded-2xl p-6 text-center hover:border-white/15 transition-all duration-300 group"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <Icon size={22} className="text-white" />
              </div>
              <p className="text-3xl font-extrabold text-white mb-1">{value}</p>
              <p className="text-gray-400 text-sm font-medium">{label}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ════════════════════════════════════════════════════
          CATEGORIES SECTION
      ════════════════════════════════════════════════════ */}
      <Section className="max-w-7xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-12">
          <motion.p variants={stagger(0)} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-cyan-400 text-sm font-semibold uppercase tracking-widest mb-3">
            Topics
          </motion.p>
          <motion.h2 variants={stagger(0.1)} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
            Choose Your <span className="gradient-text">Category</span>
          </motion.h2>
          <motion.p variants={stagger(0.2)} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-gray-400 text-lg max-w-xl mx-auto">
            Structured learning paths covering everything from fundamentals to advanced system design.
          </motion.p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories && categories.filter(c => c.isActive !== false).map((category, i) => {
            const styles = getCategoryStyles(category.name);
            const Icon = styles.icon;
            
            // Calculate dynamic count
            const categoryTests = (tests || []).filter(t => {
              const cid = typeof t.categoryId === 'object' ? t.categoryId?._id : t.categoryId;
              return cid === category._id;
            });
            const testCount = categoryTests.length;
            const countText = testCount > 0 ? `${testCount} ${testCount === 1 ? 'Test' : 'Tests'} available` : "Coming Soon";

            return (
              <motion.div
                key={category._id}
                variants={stagger(i * 0.07)}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                whileHover={{ scale: 1.06, y: -6 }}
                onClick={() => handleCategoryClick(category)}
                className={`bg-gradient-to-br ${styles.bg} border ${styles.border} rounded-2xl p-5 text-center cursor-pointer hover:shadow-xl transition-all duration-300 group`}
              >
                <Icon size={36} style={{ color: styles.color }} className="mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" />
                <p className="text-white font-semibold text-sm mb-1">{category.name}</p>
                <p className="text-gray-500 text-xs">{countText}</p>
              </motion.div>
            );
          })}

          {(!categories || categories.length === 0) && (
            <div className="col-span-full py-12 text-center text-gray-500 text-sm">
              No categories found. Please check back later!
            </div>
          )}
        </div>
      </Section>

      {/* ════════════════════════════════════════════════════
          CODING CHALLENGES SECTION
      ════════════════════════════════════════════════════ */}
      <Section className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <motion.p variants={stagger(0)} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-purple-400 text-sm font-semibold uppercase tracking-widest mb-3">
            Practice
          </motion.p>
          <motion.h2 variants={stagger(0.1)} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
            Coding <span className="gradient-text">Challenges</span>
          </motion.h2>
          <motion.p variants={stagger(0.2)} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-gray-400 text-lg max-w-xl mx-auto">
            LeetCode-style problems with detailed explanations and optimised solutions.
          </motion.p>
        </div>

        {/* Dynamic challenge rows from API — up to 3 */}
        {(() => {
          const DIFF_COLOR = {
            easy:   "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
            medium: "text-yellow-400  bg-yellow-400/10  border-yellow-400/30",
            hard:   "text-red-400    bg-red-400/10    border-red-400/30",
          };

          const handleSolveClick = (e, testId) => {
            e.stopPropagation();
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
            if (!token) {
              Swal.fire({
                icon: "warning",
                title: "Login Required",
                text: "Please login to solve this coding challenge.",
                confirmButtonText: "Login",
                showCancelButton: true,
                background: "#081120",
                color: "#fff",
                confirmButtonColor: "#06b6d4",
                cancelButtonColor: "#1e293b",
              }).then((res) => { if (res.isConfirmed) router.push("/login"); });
              return;
            }
            router.push(`/challenges/${testId}`);
          };

          const published = (codingTests || []).filter(t => t.isPublished !== false).slice(0, 3);

          if (!codingTests) {
            // skeleton
            return (
              <div className="space-y-4 mb-10">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="glass border border-white/8 rounded-2xl p-5 sm:p-6 animate-pulse">
                    <div className="flex items-center gap-5">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-white/5 rounded-lg w-1/3" />
                        <div className="h-3 bg-white/5 rounded-lg w-1/2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          }

          if (published.length === 0) {
            return (
              <div className="mb-10 py-14 text-center glass border border-white/8 rounded-2xl">
                <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
                  <FiZap size={28} className="text-purple-400" />
                </div>
                <p className="text-white font-semibold text-lg mb-1">No Challenges Yet</p>
                <p className="text-gray-500 text-sm">New coding challenges are being prepared. Check back soon!</p>
              </div>
            );
          }

          return (
            <div className="space-y-4 mb-10">
              {published.map((test, i) => {
                const diff = (test.difficulty || "medium").toLowerCase();
                const diffColor = DIFF_COLOR[diff] || DIFF_COLOR.medium;
                const qCount = test.codingQuestions?.length || 0;

                return (
                  <motion.div
                    key={test._id}
                    variants={stagger(i * 0.1)}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    whileHover={{ x: 4 }}
                    onClick={(e) => handleSolveClick(e, test._id)}
                    className="glass border border-white/8 hover:border-cyan-500/30 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group cursor-pointer transition-all duration-300"
                  >
                    <div className="flex items-center gap-5 flex-1 min-w-0">
                      {/* Index badge */}
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-gray-400 font-mono text-sm font-bold flex-shrink-0">
                        {String(i + 1).padStart(2, "0")}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="text-white font-semibold text-base group-hover:text-cyan-300 transition-colors truncate">
                            {test.title}
                          </h3>
                          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border capitalize ${diffColor}`}>
                            {diff.charAt(0).toUpperCase() + diff.slice(1)}
                          </span>
                        </div>
                        {/* Meta tags: duration · questions · marks */}
                        <div className="flex flex-wrap gap-2">
                          <span className="text-xs text-gray-400 bg-white/5 border border-white/8 rounded-lg px-2.5 py-0.5 flex items-center gap-1">
                            <FiClock size={10} /> {test.duration} min
                          </span>
                          <span className="text-xs text-gray-400 bg-white/5 border border-white/8 rounded-lg px-2.5 py-0.5 flex items-center gap-1">
                            <FiBookOpen size={10} /> {qCount} {qCount === 1 ? "question" : "questions"}
                          </span>
                          <span className="text-xs text-gray-400 bg-white/5 border border-white/8 rounded-lg px-2.5 py-0.5 flex items-center gap-1">
                            <FiAward size={10} /> {test.totalMarks} marks
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <button
                        onClick={(e) => handleSolveClick(e, test._id)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-semibold hover:from-blue-500 hover:to-cyan-400 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all duration-200 hover:scale-[1.02]"
                      >
                        <FiZap size={13} />
                        Solve
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          );
        })()}

        <div className="flex justify-center">
          <Link
            href="/challenges"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-white/15 text-gray-300 font-semibold hover:bg-white/5 hover:text-white hover:border-white/25 transition-all duration-200 group"
          >
            View All Challenges
            <FiChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </Section>

      {/* ════════════════════════════════════════════════════
          CAREER SUCCESS / MOTIVATIONAL SECTION
      ════════════════════════════════════════════════════ */}
      <Section className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl border border-white/10"
        >
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0d1f3c] via-[#0a1628] to-[#060f1e]" />
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/15 rounded-full blur-[100px]" />

          <div className="relative z-10 p-8 sm:p-12 lg:p-16">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left */}
              <div>
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-cyan-500/30 rounded-full px-4 py-1.5 mb-6">
                  <HiSparkles size={15} className="text-cyan-400 animate-pulse" />
                  <span className="text-cyan-400 text-sm font-semibold">Land Your Dream Job</span>
                </div>
                <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-5 leading-tight">
                  Practice Hard.{" "}
                  <span className="shimmer-text">Succeed Faster.</span>
                </h2>
                <p className="text-gray-400 text-lg leading-relaxed mb-8">
                  Practice consistently from this platform to sharpen your problem-solving skills, master core programming concepts, and secure your dream job at top tech companies.
                </p>

                <ul className="space-y-3 mb-8">
                  {[
                    "Comprehensive practice problems with optimal solutions",
                    "Detailed conceptual explanations for MCQs and challenges",
                    "Smart suggestion tools to point out code optimizations",
                    "Personalized path to level up your engineering skills",
                    "Built-in Resume Builder to stand out to recruiters"
                  ].map((feat) => (
                    <li key={feat} className="flex items-center gap-3 text-gray-300 text-sm">
                      <div className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
                        <HiCheckCircle size={11} className="text-cyan-400" />
                      </div>
                      {feat}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/challenges"
                  className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-base hover:from-blue-500 hover:to-cyan-400 shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-[1.03]"
                >
                  <TbBolt size={20} />
                  Start Practicing Now
                  <HiArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Right: Premium Profile Dashboard / Success Tracker Mockup */}
              <div className="hidden lg:block">
                <div className="glass border border-white/10 rounded-2xl p-6 space-y-6 bg-slate-900/40 relative">
                  {/* Top user header */}
                  <div className="flex items-center justify-between pb-4 border-b border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
                        JD
                      </div>
                      <div>
                        <p className="text-white text-sm font-semibold">John Developer</p>
                        <p className="text-gray-500 text-xs">Software Engineer Candidate</p>
                      </div>
                    </div>
                    <span className="text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 text-xs px-2.5 py-0.5 rounded-full font-medium">
                      Interview Ready
                    </span>
                  </div>

                  {/* Skill level stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-center">
                      <p className="text-gray-400 text-xs font-medium">Solve Accuracy</p>
                      <p className="text-white text-xl font-bold mt-1">94%</p>
                    </div>
                    <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-center">
                      <p className="text-gray-400 text-xs font-medium">Global Ranking</p>
                      <p className="text-cyan-400 text-xl font-bold mt-1">Top 3.5%</p>
                    </div>
                  </div>

                  {/* Company Target List */}
                  <div className="space-y-2">
                    <p className="text-white text-xs font-semibold">Dream Company Match Progress</p>
                    <div className="space-y-1.5">
                      {[
                        { company: "Google", progress: "95%", status: "Match Unlocked", color: "bg-emerald-500" },
                        { company: "Meta", progress: "90%", status: "Match Unlocked", color: "bg-emerald-500" },
                        { company: "Stripe", progress: "88%", status: "Ready", color: "bg-cyan-500" }
                      ].map((item) => (
                        <div key={item.company} className="flex items-center justify-between text-xs p-2 bg-white/3 border border-white/5 rounded-lg">
                          <span className="text-gray-300 font-medium">{item.company}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">{item.progress}</span>
                            <span className={`w-2 h-2 rounded-full ${item.color}`} />
                            <span className="text-gray-400 text-[10px]">{item.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Offers banner */}
                  <div className="bg-gradient-to-r from-blue-600/20 to-cyan-500/20 border border-cyan-500/30 rounded-xl p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 flex-shrink-0 animate-pulse">
                      <FiAward size={16} />
                    </div>
                    <div>
                      <p className="text-white text-xs font-bold">Dream Job Status</p>
                      <p className="text-cyan-300 text-[11px]">✓ Preparation complete. Resume optimized for target roles!</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </Section>

      {/* ════════════════════════════════════════════════════
          RESUME BUILDER BANNER SECTION
      ════════════════════════════════════════════════════ */}
      <Section className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl border border-white/10"
        >
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#0d1527] to-[#040a15]" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]" />

          <div className="relative z-10 p-8 sm:p-12 lg:p-16">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              
              {/* Left Side: Mockup Preview of Resume builder interface */}
              <div className="hidden lg:block order-2 lg:order-1">
                <div className="glass border border-white/10 rounded-2xl p-6 bg-slate-900/40 relative shadow-2xl overflow-hidden max-w-md mx-auto">
                  {/* Subtle watermarked background lines */}
                  <div className="absolute top-2 right-4 text-white/5 font-mono text-[70px] select-none pointer-events-none font-bold">
                    CV
                  </div>

                  {/* Document Header */}
                  <div className="border-b border-white/10 pb-4 mb-4 text-center">
                    <p className="text-white text-lg font-bold tracking-wide">Alex Johnson</p>
                    <p className="text-cyan-400 text-xs font-medium">Full Stack Software Engineer</p>
                    <p className="text-gray-500 text-[10px] mt-1">alex.johnson@email.com · github.com/alexj · sf bay area</p>
                  </div>

                  {/* Section: Technical Skills */}
                  <div className="mb-4">
                    <p className="text-white text-xs font-semibold uppercase tracking-wider mb-2 border-b border-white/5 pb-1">Technical Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {["React", "Next.js", "Node.js", "TypeScript", "Python", "MongoDB", "Docker", "AWS"].map((s) => (
                        <span key={s} className="text-[10px] text-gray-300 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Section: Experience */}
                  <div className="space-y-3 mb-4">
                    <p className="text-white text-xs font-semibold uppercase tracking-wider mb-1 border-b border-white/5 pb-1">Professional Experience</p>
                    <div>
                      <div className="flex justify-between text-[11px] font-medium text-gray-200">
                        <span>Software Engineer @ TechCorp</span>
                        <span className="text-gray-500">2024 - Present</span>
                      </div>
                      <ul className="list-disc pl-3 text-[10px] text-gray-400 mt-1 space-y-1">
                        <li>Led migration of legacy platform to Next.js, boosting SEO performance by 35%.</li>
                        <li>Designed & integrated scalable REST APIs using Node.js, servicing 1M+ requests daily.</li>
                      </ul>
                    </div>
                  </div>

                  {/* ATS Checker floating overlay */}
                  <div className="absolute bottom-4 right-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-3 shadow-2xl flex items-center gap-2.5 border border-emerald-400/30 scale-105 animate-bounce-gentle">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white text-sm font-bold font-mono">
                      98
                    </div>
                    <div>
                      <p className="text-white text-[10px] font-bold">ATS Score</p>
                      <p className="text-emerald-100 text-[8px]">Excellent Match!</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side: Features Info */}
              <div className="order-1 lg:order-2">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full px-4 py-1.5 mb-6">
                  <FiFileText size={15} className="text-purple-400" />
                  <span className="text-purple-400 text-sm font-semibold">Resume Builder</span>
                </div>
                
                <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-5 leading-tight">
                  Build a Winning <br />
                  <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">Tech Resume</span>
                </h2>
                
                <p className="text-gray-400 text-lg leading-relaxed mb-8">
                  Create a highly professional, ATS-optimized resume tailored directly for software engineering and tech roles. Impress hiring managers with clean designs and tech-focused bullet points.
                </p>

                <ul className="space-y-3 mb-8">
                  {[
                    "ATS-friendly templates optimized for applicant tracking systems",
                    "Smart text prompts and bullet points specifically for tech roles",
                    "Real-time scoring and optimization suggestions",
                    "Export to clean, standard PDF formats in one click",
                    "Seamlessly syncs with your solved challenges and skills"
                  ].map((feat) => (
                    <li key={feat} className="flex items-center gap-3 text-gray-300 text-sm">
                      <div className="w-5 h-5 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                        <HiCheckCircle size={11} className="text-purple-400" />
                      </div>
                      {feat}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/resume"
                  className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-base hover:from-purple-500 hover:to-pink-400 shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300 hover:scale-[1.03]"
                >
                  <FiFileText size={18} />
                  Build Your Resume
                  <HiArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

            </div>
          </div>
        </motion.div>
      </Section>

      {/* ════════════════════════════════════════════════════
          TESTIMONIALS
      ════════════════════════════════════════════════════ */}
      <Section className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <motion.p variants={stagger(0)} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-pink-400 text-sm font-semibold uppercase tracking-widest mb-3">
            Success Stories
          </motion.p>
          <motion.h2 variants={stagger(0.1)} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
            Loved by <span className="gradient-text">Developers</span>
          </motion.h2>
          <motion.p variants={stagger(0.2)} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-gray-400 text-lg max-w-xl mx-auto">
            Thousands of developers have levelled up and landed jobs at their dream companies.
          </motion.p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {TESTIMONIALS.map(({ name, role, stars, quote, avatar, color }, i) => (
            <motion.div
              key={name}
              variants={stagger(i * 0.12)}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              whileHover={{ y: -6 }}
              className="glass border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-300"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: stars }).map((_, j) => (
                  <FiStar key={j} size={14} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-5">&ldquo;{quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white text-sm font-bold`}>
                  {avatar}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{name}</p>
                  <p className="text-gray-500 text-xs">{role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ════════════════════════════════════════════════════
          CTA BANNER
      ════════════════════════════════════════════════════ */}
      <Section className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl text-center p-12 sm:p-20"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-600" />
          <div className="absolute top-0 left-1/4 w-80 h-80 bg-white/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-black/20 rounded-full blur-[80px]" />
          <div className="relative z-10">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">Ready to Land Your Dream Job?</h2>
            <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">Join 25,000+ developers already practicing with InterviewAI. Start free, no credit card required.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-blue-700 font-bold text-base hover:bg-blue-50 shadow-2xl shadow-black/30 transition-all duration-200 hover:scale-[1.03]"
              >
                <TbBolt size={20} />
                Get Started Free
              </Link>
              <Link
                href="#"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border-2 border-white/30 text-white font-bold text-base hover:bg-white/10 transition-all duration-200"
              >
                Browse Questions
              </Link>
            </div>
          </div>
        </motion.div>
      </Section>

      {/* ════════════════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════════════════ */}
      <footer className="border-t border-white/[0.06] mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
            {/* Brand */}
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <TbBolt size={16} className="text-white" />
                </div>
                <span className="text-lg font-bold text-white">
                  Career<span className="text-cyan-400">Nova</span>
                </span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed mb-5 max-w-xs">
                The most advanced platform for software engineering interview preparation.
              </p>
              <div className="flex gap-3">
                {[
                  { icon: FiGithub,   href: "#", label: "GitHub" },
                  { icon: FiTwitter,  href: "#", label: "Twitter" },
                  { icon: FiLinkedin, href: "#", label: "LinkedIn" },
                ].map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/25 hover:bg-white/5 transition-all"
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
              <div key={heading}>
                <h4 className="text-white font-semibold text-sm mb-4">{heading}</h4>
                <ul className="space-y-2.5">
                  {links.map((link) => (
                    <li key={link}>
                      <Link href="#" className="text-gray-500 hover:text-gray-200 text-sm transition-colors">
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-600">
            <p>© {new Date().getFullYear()} InterviewAI. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-gray-300 transition-colors">Terms of Service</Link>
              <Link href="#" className="hover:text-gray-300 transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
