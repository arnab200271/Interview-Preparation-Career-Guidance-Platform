"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
  Eye,
  EyeOff,
  CheckCircle,
  User,
  Mail,
  Lock,
  Plus,
  MailCheck,
  RefreshCw,
  Clock,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAppDispatch, useAppselector } from "@/Redux/hooks/hooks";
import { registerUser, resendVerification } from "@/Redux/slice/slice";

// ─── Countdown hook ────────────────────────────────────────────────────────────
const RESEND_DELAY = 60; // seconds before resend button unlocks

function useCountdown(initialSeconds, active) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (!active) return;
    setSeconds(initialSeconds);
    const id = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(id);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [active, initialSeconds]);

  return seconds;
}

// ─── Email-sent screen ─────────────────────────────────────────────────────────
function EmailSentScreen({ email }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isLoading, resendStatus, error } = useAppselector(
    (state) => state.mainstore
  );

  const [countdownActive, setCountdownActive] = useState(true);
  const [resendCount, setResendCount] = useState(0);

  const secondsLeft = useCountdown(RESEND_DELAY, countdownActive);
  const canResend = secondsLeft === 0;

  // Handle resend toasts
  useEffect(() => {
    if (resendStatus === "success") {
      toast.success(" Verification email resent! Check your inbox.");
      // Restart the 60s cooldown
      setResendCount((c) => c + 1);
      setCountdownActive(false);
      // Small delay then re-enable countdown to trigger the useEffect reset
      setTimeout(() => setCountdownActive(true), 50);
    }
    if (resendStatus === "error") {
      toast.error(error?.message || "Failed to resend. Please try again.");
    }
  }, [resendStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleResend = () => {
    if (!canResend || isLoading) return;
    dispatch(resendVerification(email));
  };

  // Format mm:ss
  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const secs = String(secondsLeft % 60).padStart(2, "0");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#020617] via-[#071129] to-[#0f172a] px-4 relative overflow-hidden">
      {/* Animated blobs */}
      <div className="absolute w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl top-0 left-0 animate-pulse" />
      <div className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl bottom-0 right-0 animate-pulse" />
      <div className="absolute w-64 h-64 bg-purple-500/10 rounded-full blur-3xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />

      <div className="w-full max-w-md backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl shadow-blue-900/30 p-8 relative z-10">

        {/* Animated envelope icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center animate-pulse">
              <MailCheck size={44} className="text-cyan-400" />
            </div>
            {/* orbiting dot */}
            <div
              className="absolute top-0 right-0 w-5 h-5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 shadow-lg shadow-cyan-500/50"
              style={{ animation: "orbit 3s linear infinite" }}
            />
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Check Your Email</h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            We&apos;ve sent a verification link to
          </p>
          <p className="text-cyan-400 font-semibold mt-1 text-base break-all">{email}</p>
        </div>

        {/* Steps */}
        <div className="space-y-3 mb-7">
          {[
            { step: "1", text: "Open your email inbox" },
            { step: "2", text: "Click the verification link" },
            { step: "3", text: "Come back and log in" },
          ].map(({ step, text }) => (
            <div key={step} className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3 border border-white/5">
              <div className="w-7 h-7 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {step}
              </div>
              <p className="text-gray-300 text-sm">{text}</p>
            </div>
          ))}
        </div>

        {/* Countdown / Resend section */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 mb-6 text-center">
          {canResend ? (
            <>
              <p className="text-gray-400 text-sm mb-3">
                {resendCount > 0
                  ? "Need another link? You can resend again."
                  : "Didn&apos;t receive the email?"}
              </p>
              <button
                onClick={handleResend}
                disabled={isLoading}
                id="resend-verification-btn"
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/30 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <RefreshCw size={18} />
                    Resend Verification Email
                  </>
                )}
              </button>
              {resendCount > 0 && (
                <p className="text-gray-500 text-xs mt-2">
                  Email resent {resendCount} time{resendCount > 1 ? "s" : ""}
                </p>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock size={16} className="text-yellow-400" />
                <p className="text-gray-400 text-sm">Resend available in</p>
              </div>
              {/* Live countdown */}
              <div className="flex items-center justify-center gap-2 my-3">
                {/* minutes */}
                <div className="bg-[#101827] border border-white/10 rounded-xl px-4 py-2 min-w-[56px] text-center">
                  <span className="text-2xl font-bold text-white font-mono">{mins}</span>
                  <p className="text-gray-500 text-xs mt-0.5">min</p>
                </div>
                <span className="text-2xl font-bold text-gray-400">:</span>
                {/* seconds */}
                <div className="bg-[#101827] border border-white/10 rounded-xl px-4 py-2 min-w-[56px] text-center">
                  <span className="text-2xl font-bold text-cyan-400 font-mono">{secs}</span>
                  <p className="text-gray-500 text-xs mt-0.5">sec</p>
                </div>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden mt-2">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-1000"
                  style={{ width: `${((RESEND_DELAY - secondsLeft) / RESEND_DELAY) * 100}%` }}
                />
              </div>
              <p className="text-gray-500 text-xs mt-2">
                Please wait before requesting another email
              </p>
            </>
          )}
        </div>

        {/* Go to login */}
        <button
          onClick={() => router.replace("/login")}
          className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white py-3 rounded-xl font-medium transition-all duration-200"
        >
          Go to Login
          <ArrowRight size={16} />
        </button>

        <p className="text-center text-gray-600 text-xs mt-4">
          Check spam/junk folder if you don&apos;t see the email
        </p>
      </div>

      {/* orbit animation */}
      <style>{`
        @keyframes orbit {
          from { transform: rotate(0deg) translateX(48px) rotate(0deg); }
          to   { transform: rotate(360deg) translateX(48px) rotate(-360deg); }
        }
      `}</style>
    </div>
  );
}

// ─── Main Register Page ────────────────────────────────────────────────────────
export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { user, isLoading, registerStatus, error, registeredEmail } = useAppselector(
    (state) => state.mainstore
  );

  const [preview, setPreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showEmailSent, setShowEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  const watchName = watch("name");
  const watchPassword = watch("password");
  const watchEmail = watch("email");

  // Already logged in redirect
  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        router.replace("/adminpanel");
      } else {
        router.replace("/");
      }
    }
  }, [user, router]);

  // Image preview
  const handleImagePreview = (e) => {
    const file = e.target.files[0];
    if (file) setPreview(URL.createObjectURL(file));
  };

  // Submit
  const onSubmit = (data) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("email", data.email);
    formData.append("password", data.password);
    if (data.profileImage && data.profileImage.length > 0) {
      formData.append("profileImage", data.profileImage[0]);
    }
    dispatch(registerUser(formData));
  };

  // Handle register outcome
  useEffect(() => {
    if (registerStatus === "success") {
      toast.success("🎉 Account created! Please verify your email.");
      setSentEmail(registeredEmail || watchEmail || "your email");
      setShowEmailSent(true);
      reset();
      setPreview(null);
    }
    if (registerStatus === "error") {
      toast.error(error?.message || "Registration failed. Please try again.");
    }
  }, [registerStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  // Show the email-sent screen after successful registration
  if (showEmailSent) {
    return <EmailSentScreen email={sentEmail} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#020617] via-[#071129] to-[#0f172a] px-4 overflow-hidden relative">
      {/* animated blur circles */}
      <div className="absolute w-72 h-72 bg-blue-500/20 rounded-full blur-3xl top-10 left-10 animate-pulse" />
      <div className="absolute w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl bottom-10 right-10 animate-pulse" />

      {/* glass card */}
      <div className="w-full max-w-md backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl shadow-blue-900/30 p-8 relative z-10">
        {/* heading */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white">Create Account</h1>
          <p className="text-gray-400 mt-2">AI Powered Interview Platform</p>
        </div>

        {/* image upload */}
        <div className="flex justify-center mb-8">
          <label className="relative cursor-pointer group">
            <div className="w-28 h-28 rounded-full border-2 border-dashed border-cyan-500 overflow-hidden bg-[#101827] flex items-center justify-center group-hover:scale-105 transition-all duration-300">
              {preview ? (
                <img src={preview} alt="preview" className="w-full h-full object-cover" />
              ) : (
                <Plus size={40} className="text-gray-400" />
              )}
            </div>
            <input
              type="file"
              hidden
              accept="image/*"
              {...register("profileImage", {
                required: "Profile image required",
                onChange: (e) => handleImagePreview(e),
              })}
            />
            <div className="absolute bottom-0 right-0 bg-cyan-500 p-2 rounded-full shadow-lg">
              <Plus size={16} className="text-white" />
            </div>
          </label>
        </div>
        {errors.profileImage && (
          <p className="text-red-400 text-sm text-center -mt-4 mb-4">
            {errors.profileImage.message}
          </p>
        )}

        {/* form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* name */}
          <div>
            <div className="relative">
              <User className="absolute left-4 top-4 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Full Name"
                {...register("name", { required: "Name is required" })}
                className="w-full bg-[#101827]/70 text-white border border-white/10 rounded-xl px-12 py-3 outline-none focus:border-cyan-500 transition-all"
              />
              {watchName?.length > 2 && (
                <CheckCircle className="absolute right-4 top-4 text-green-500" size={20} />
              )}
            </div>
            {errors.name && (
              <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* email */}
          <div>
            <div className="relative">
              <Mail className="absolute left-4 top-4 text-gray-400" size={18} />
              <input
                type="email"
                placeholder="Email Address"
                {...register("email", { required: "Email is required" })}
                className="w-full bg-[#101827]/70 text-white border border-white/10 rounded-xl px-12 py-3 outline-none focus:border-cyan-500 transition-all"
              />
            </div>
            {errors.email && (
              <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* password */}
          <div>
            <div className="relative">
              <Lock className="absolute left-4 top-4 text-gray-400" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 6, message: "Minimum 6 characters" },
                })}
                className="w-full bg-[#101827]/70 text-white border border-white/10 rounded-xl px-12 py-3 outline-none focus:border-cyan-500 transition-all"
              />
              {watchPassword?.length >= 6 && (
                <CheckCircle className="absolute right-12 top-4 text-green-500" size={20} />
              )}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-4 text-gray-400"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* submit */}
          <button
            type="submit"
            disabled={isLoading}
            id="register-submit-btn"
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-300 text-white py-3 rounded-xl font-semibold flex items-center justify-center disabled:opacity-60 disabled:scale-100 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* footer */}
        <p className="text-center text-gray-400 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-cyan-400 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
