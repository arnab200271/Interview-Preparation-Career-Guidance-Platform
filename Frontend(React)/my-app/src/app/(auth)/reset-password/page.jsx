"use client";

import { useEffect, useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Lock, Eye, EyeOff, CheckCircle, ArrowLeft, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

import { useAppDispatch, useAppselector } from "@/Redux/hooks/hooks";
import { resetUserPassword, clearStatus } from "@/Redux/slice/slice";

function ResetPasswordForm() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const { isLoading, resetPasswordStatus, error } = useAppselector(
    (state) => state.mainstore
  );

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  const watchPassword = watch("newPassword");

  // Clear status on unmount
  useEffect(() => {
    return () => {
      dispatch(clearStatus());
    };
  }, [dispatch]);

  // Handle outcome toast
  useEffect(() => {
    if (resetPasswordStatus === "success") {
      toast.success("Password reset successful! Redirecting to login...");
      reset();
      const timer = setTimeout(() => {
        router.replace("/login");
      }, 2000);
      return () => clearTimeout(timer);
    }
    if (resetPasswordStatus === "error") {
      toast.error(error?.message || "Failed to reset password. Link might be expired.");
    }
  }, [resetPasswordStatus, error, router, reset]);

  const onSubmit = (data) => {
    if (!token) {
      toast.error("Invalid session. Token is missing.");
      return;
    }
    dispatch(
      resetUserPassword({
        token,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      })
    );
  };

  if (!token) {
    return (
      <div className="text-center">
        <div className="flex justify-center mb-5">
          <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <ShieldAlert size={36} className="text-red-400" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Invalid or Missing Token</h1>
        <p className="text-gray-400 text-sm leading-relaxed mb-6">
          This password reset request is invalid or has expired. Please request a new link.
        </p>
        <Link
          href="/forgot-password"
          className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-semibold text-sm transition-colors"
        >
          Request new reset link
        </Link>
      </div>
    );
  }

  return (
    <>
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
            <Lock size={36} className="text-cyan-400" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white">Reset Password</h1>
        <p className="text-gray-400 mt-2 text-sm leading-relaxed">
          Create a secure new password for your account.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* New Password */}
        <div>
          <div className="relative">
            <Lock className="absolute left-4 top-4 text-gray-400" size={18} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              {...register("newPassword", {
                required: "New password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
              className="w-full bg-[#101827]/70 text-white border border-white/10 rounded-xl px-12 py-3 outline-none focus:border-cyan-500 transition-all placeholder:text-gray-500"
            />
            {watchPassword?.length >= 6 && (
              <CheckCircle className="absolute right-12 top-4 text-green-500" size={20} />
            )}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-300 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.newPassword && (
            <p className="text-red-400 text-sm mt-1.5">{errors.newPassword.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <div className="relative">
            <Lock className="absolute left-4 top-4 text-gray-400" size={18} />
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) =>
                  value === watchPassword || "Passwords do not match",
              })}
              className="w-full bg-[#101827]/70 text-white border border-white/10 rounded-xl px-12 py-3 outline-none focus:border-cyan-500 transition-all placeholder:text-gray-500"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-300 transition-colors"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-400 text-sm mt-1.5">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          id="reset-submit-btn"
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-300 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            "Reset Password"
          )}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#020617] via-[#071129] to-[#0f172a] px-4 relative overflow-hidden">
      {/* Animated blobs */}
      <div className="absolute w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl top-10 left-10 animate-pulse" />
      <div className="absolute w-80 h-80 bg-blue-500/15 rounded-full blur-3xl bottom-10 right-10 animate-pulse" />

      {/* Glass Card */}
      <div className="w-full max-w-md backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl shadow-blue-900/30 p-8 relative z-10">
        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center py-10">
              <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-gray-400 text-sm">Verifying session...</p>
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
