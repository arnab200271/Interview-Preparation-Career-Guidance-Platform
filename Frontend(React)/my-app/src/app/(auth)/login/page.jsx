"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import { Mail, Lock, Eye, EyeOff, CheckCircle } from "lucide-react";

import Link from "next/link";

import { useAppDispatch, useAppselector } from "@/Redux/hooks/hooks";
import { clearStatus, loginUser } from "@/Redux/slice/slice";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { user, isLoading, error, loginStatus } = useAppselector(
    (state) => state.mainstore,
  );

  const [showPassword, setShowPassword] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  const watchPassword = watch("password");

  // submit
  const onSubmit = async (data) => {
    dispatch(loginUser(data));
  };

  // toast — fires only after a fresh login attempt
  useEffect(() => {
    if (loginStatus === "success" && user) {
      toast.success("Login Successful! Welcome back ");

      reset();

      if (user.role === "admin") {
        router.replace("/adminpanel");
      } else {
        router.replace("/");
      }
    }

    if (loginStatus === "error") {
      toast.error(error?.message || "Login Failed");
    }
  }, [loginStatus, user, router, reset, error]);

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
  return (
    <div
      className="
      min-h-screen
      flex
      items-center
      justify-center
      bg-gradient-to-br
      from-[#020617]
      via-[#071129]
      to-[#0f172a]
      px-4
      overflow-hidden
      relative
    "
    >
      {showResend && (
        <Link
          href="/resend-verification"
          className="
      text-cyan-400
      text-sm
      hover:underline
      block
      text-center
      mt-4
    "
        >
          Resend Verification Email
        </Link>
      )}

      {/* animated blur background */}
      <div className="absolute w-72 h-72 bg-blue-500/20 rounded-full blur-3xl top-10 left-10 animate-pulse"></div>

      <div className="absolute w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl bottom-10 right-10 animate-pulse"></div>

      {/* glass card */}
      <div
        className="
        w-full
        max-w-md
        backdrop-blur-xl
        bg-white/5
        border
        border-white/10
        rounded-3xl
        shadow-2xl
        shadow-blue-900/30
        p-8
        relative
        z-10
      "
      >
        {/* heading */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white">Welcome Back</h1>

          <p className="text-gray-400 mt-2">
            Login to continue your interview journey
          </p>
        </div>

        {/* form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* email */}
          <div>
            <div className="relative">
              <Mail className="absolute left-4 top-4 text-gray-400" size={18} />

              <input
                type="email"
                placeholder="Email Address"
                {...register("email", {
                  required: "Email is required",
                })}
                className="
                w-full
                bg-[#101827]/70
                text-white
                border
                border-white/10
                rounded-xl
                px-12
                py-3
                outline-none
                focus:border-cyan-500
                transition-all
              "
              />
            </div>

            {errors.email && (
              <p className="text-red-400 text-sm mt-1">
                {errors.email.message}
              </p>
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
                  minLength: {
                    value: 6,
                    message: "Minimum 6 characters",
                  },
                })}
                className="
                w-full
                bg-[#101827]/70
                text-white
                border
                border-white/10
                rounded-xl
                px-12
                py-3
                outline-none
                focus:border-cyan-500
                transition-all
              "
              />

              {/* password valid */}
              {watchPassword?.length >= 6 && (
                <CheckCircle
                  className="
                  absolute
                  right-12
                  top-4
                  text-green-500
                "
                  size={20}
                />
              )}

              {/* show password */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="
                absolute
                right-4
                top-4
                text-gray-400
              "
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {errors.password && (
              <p className="text-red-400 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* forgot password */}
          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="
              text-cyan-400
              text-sm
              hover:underline
            "
            >
              Forgot Password?
            </Link>
          </div>

          {/* button */}
          <button
            type="submit"
            disabled={isLoading}
            className="
            w-full
            bg-gradient-to-r
            from-blue-600
            to-cyan-500
            hover:scale-[1.02]
            hover:shadow-lg
            hover:shadow-cyan-500/30
            transition-all
            duration-300
            text-white
            py-3
            rounded-xl
            font-semibold
            flex
            items-center
            justify-center
          "
          >
            {isLoading ? (
              <div
                className="
                w-6
                h-6
                border-2
                border-white
                border-t-transparent
                rounded-full
                animate-spin
              "
              ></div>
            ) : (
              "Login"
            )}
          </button>
        </form>

        {/* footer */}
        <p className="text-center text-gray-400 mt-6">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="
            text-cyan-400
            hover:underline
          "
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
