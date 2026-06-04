"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Mail, RefreshCw, ArrowLeft, Clock, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAppDispatch, useAppselector } from "@/Redux/hooks/hooks";
import { resendVerification, clearStatus } from "@/Redux/slice/slice";

const COOLDOWN = 60; // seconds

export default function ResendVerificationPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { user, isLoading, resendStatus, error, registeredEmail } = useAppselector(
    (state) => state.mainstore
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();

  // ── Hydration Protection ──────────────────────────────────────────────────
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Pre-fill email if coming straight from register
  useEffect(() => {
    if (mounted && registeredEmail) {
      setValue("email", registeredEmail);
    }
  }, [mounted, registeredEmail, setValue]);

  // ── Cooldown state ──────────────────────────────────────────────────────────
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [sentCount, setSentCount] = useState(0);
  const [lastSentEmail, setLastSentEmail] = useState("");

  const startCooldown = () => {
    setSecondsLeft(COOLDOWN);
  };

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [secondsLeft]);

  // Clear status on mount and unmount
  useEffect(() => {
    dispatch(clearStatus());
    return () => {
      dispatch(clearStatus());
    };
  }, [dispatch]);

  // ── Toast on resend outcome ─────────────────────────────────────────────────
  useEffect(() => {
    if (resendStatus === "success") {
      toast.success("Verification email sent! Check your inbox.");
      setSentCount((c) => c + 1);
      startCooldown();
      reset({ email: lastSentEmail });
      dispatch(clearStatus());
    }
    if (resendStatus === "error") {
      toast.error(error?.message || "Something went wrong. Please try again.");
      dispatch(clearStatus());
    }
  }, [resendStatus, error, lastSentEmail, reset, dispatch]);

  // ── Redirect Verified Users ─────────────────────────────────────────────────
  useEffect(() => {
    if (mounted && user?.isVerified) {
      toast.info("Your email has already been verified.");
      router.replace("/login");
    }
  }, [mounted, user, router]);

  // ── Submit ──────────────────────────────────────────────────────────────────
  const onSubmit = (data) => {
    if (secondsLeft > 0) return;
    setLastSentEmail(data.email);
    dispatch(resendVerification(data.email));
  };

  // Format mm:ss
  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const secs = String(secondsLeft % 60).padStart(2, "0");
  const canSend = secondsLeft === 0 && !isLoading;
  const progress = sentCount > 0 ? ((COOLDOWN - secondsLeft) / COOLDOWN) * 100 : 0;

  // Hydration fallback skeleton to guarantee server-client matches 100% on initial pass
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#020617] via-[#071129] to-[#0f172a] px-4 relative overflow-hidden">
        <div className="absolute w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl top-10 left-10 animate-pulse" />
        <div className="absolute w-80 h-80 bg-blue-500/15 rounded-full blur-3xl bottom-10 right-10 animate-pulse" />
        <div className="w-full max-w-md backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl shadow-blue-900/30 p-8 h-[450px] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  // Render direct verified message before transition
  if (user?.isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#020617] via-[#071129] to-[#0f172a] px-4 relative overflow-hidden">
        <div className="absolute w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl top-10 left-10 animate-pulse" />
        <div className="absolute w-80 h-80 bg-blue-500/15 rounded-full blur-3xl bottom-10 right-10 animate-pulse" />
        <div className="w-full max-w-md backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl shadow-blue-900/30 p-8 relative z-10 text-center my-6 space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
              <CheckCircle2 size={38} className="text-green-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white">Already Verified</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Your email has already been verified. Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#020617] via-[#071129] to-[#0f172a] px-4 relative overflow-hidden">
      {/* Animated blobs */}
      <div className="absolute w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl top-10 left-10 animate-pulse" />
      <div className="absolute w-80 h-80 bg-blue-500/15 rounded-full blur-3xl bottom-10 right-10 animate-pulse" />
      <div className="absolute w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

      {/* Card */}
      <div className="w-full max-w-md backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl shadow-blue-900/30 p-8 relative z-10">

        {/* Back link */}
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
        >
          <ArrowLeft size={15} />
          Back to Login
        </Link>

        {/* Heading */}
        <div className="text-center mb-7">
          {/* Icon */}
          <div className="flex justify-center mb-5">
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-blue-600/20 to-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
              <Mail size={38} className="text-cyan-400" />
              {sentCount > 0 && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/40">
                  <CheckCircle2 size={14} className="text-white" />
                </div>
              )}
            </div>
          </div>

          <h1 className="text-3xl font-bold text-white">Resend Verification</h1>
          <p className="text-gray-400 mt-2 text-sm leading-relaxed">
            {sentCount > 0
              ? `Email sent ${sentCount} time${sentCount > 1 ? "s" : ""}. Check your inbox or spam folder.`
              : "Enter your email and we'll send a new verification link."}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email field */}
          <div>
            <div className="relative">
              <Mail className="absolute left-4 top-4 text-gray-400" size={18} />
              <input
                id="resend-email-input"
                type="email"
                placeholder="Enter your registered email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Enter a valid email address",
                  },
                })}
                className="w-full bg-[#101827]/70 text-white border border-white/10 rounded-xl px-12 py-3 outline-none focus:border-cyan-500 transition-all placeholder:text-gray-500"
              />
            </div>
            {errors.email && (
              <p className="text-red-400 text-sm mt-1.5">{errors.email.message}</p>
            )}
          </div>

          {/* Cooldown indicator (visible after first send) */}
          {sentCount > 0 && secondsLeft > 0 && (
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-yellow-400 text-sm">
                  <Clock size={14} />
                  <span>Cooldown active</span>
                </div>
                <span className="font-mono font-bold text-white text-lg">
                  {mins}:{secs}
                </span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-500 to-cyan-400 rounded-full transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-gray-500 text-xs mt-2 text-center">
                You can resend again in {secondsLeft}s
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="space-y-3">
            {/* Submit button */}
            <button
              id="resend-submit-btn"
              type="submit"
              disabled={!canSend}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all duration-300 ${
                canSend
                  ? "bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/30"
                  : "bg-white/10 text-gray-500 cursor-not-allowed"
              }`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : secondsLeft > 0 ? (
                <>
                  <Clock size={18} />
                  Wait {mins}:{secs}
                </>
              ) : (
                <>
                  <RefreshCw size={18} />
                  {sentCount > 0 ? "Resend Again" : "Send Verification Email"}
                </>
              )}
            </button>

            {/* Cancel button */}
            <button
              id="resend-cancel-btn"
              type="button"
              onClick={() => router.push("/login")}
              className="w-full py-3 rounded-xl font-semibold bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-gray-300 hover:text-white transition-all duration-300 flex items-center justify-center"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Info note */}
        <div className="mt-6 bg-white/5 border border-white/10 rounded-2xl p-4">
          <p className="text-gray-400 text-xs text-center leading-relaxed">
            Check your <span className="text-white font-medium">spam or junk</span> folder if you don&apos;t see the email.
            The link expires in <span className="text-cyan-400 font-medium">24 hours</span>.
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-5">
          Already verified?{" "}
          <Link href="/login" className="text-cyan-400 hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
