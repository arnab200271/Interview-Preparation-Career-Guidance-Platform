"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Mail, ArrowLeft, KeyRound } from "lucide-react";
import Link from "next/link";

import { useAppDispatch, useAppselector } from "@/Redux/hooks/hooks";
import { forgotPassword, clearStatus } from "@/Redux/slice/slice";

export default function ForgotPasswordPage() {
  const dispatch = useAppDispatch();

  const { isLoading, forgotPasswordStatus, error } = useAppselector(
    (state) => state.mainstore
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // Clear status on unmount
  useEffect(() => {
    return () => {
      dispatch(clearStatus());
    };
  }, [dispatch]);

  // Handle outcome toast
  useEffect(() => {
    if (forgotPasswordStatus === "success") {
      toast.success("Password reset link sent! Check your inbox.");
      reset();
    }
    if (forgotPasswordStatus === "error") {
      toast.error(error?.message || "Failed to send reset link. Try again.");
    }
  }, [forgotPasswordStatus, error, reset]);

  const onSubmit = (data) => {
    dispatch(forgotPassword(data.email));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#020617] via-[#071129] to-[#0f172a] px-4 relative overflow-hidden">
      {/* Animated blobs */}
      <div className="absolute w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl top-10 left-10 animate-pulse" />
      <div className="absolute w-80 h-80 bg-blue-500/15 rounded-full blur-3xl bottom-10 right-10 animate-pulse" />

      {/* Glass Card */}
      <div className="w-full max-w-md backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl shadow-blue-900/30 p-8 relative z-10">
        {/* Back Link */}
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
        >
          <ArrowLeft size={15} />
          Back to Login
        </Link>

        {/* Heading */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-5">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600/20 to-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
              <KeyRound size={36} className="text-cyan-400 animate-pulse" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white">Forgot Password</h1>
          <p className="text-gray-400 mt-2 text-sm leading-relaxed">
            Enter your email and we'll send you a link to reset your password.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <div className="relative">
              <Mail className="absolute left-4 top-4 text-gray-400" size={18} />
              <input
                id="forgot-email-input"
                type="email"
                placeholder="Email Address"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Please enter a valid email address",
                  },
                })}
                className="w-full bg-[#101827]/70 text-white border border-white/10 rounded-xl px-12 py-3 outline-none focus:border-cyan-500 transition-all placeholder:text-gray-500"
              />
            </div>
            {errors.email && (
              <p className="text-red-400 text-sm mt-1.5">{errors.email.message}</p>
            )}
          </div>

          <button
            id="forgot-submit-btn"
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-300 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Send Reset Link"
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-gray-400 mt-8 text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-cyan-400 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
