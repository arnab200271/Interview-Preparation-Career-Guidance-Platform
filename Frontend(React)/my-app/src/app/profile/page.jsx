"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAppDispatch, useAppselector } from "@/Redux/hooks/hooks";
import {
  getProfile,
  updateProfile,
  changeUserPassword,
} from "@/Redux/slice/slice";

import {
  FiUser,
  FiMail,
  FiLock,
  FiCamera,
  FiSave,
  FiEye,
  FiEyeOff,
  FiArrowLeft,
  FiCheckCircle,
  FiPhone,
  FiMapPin,
  FiGlobe,
  FiGithub,
} from "react-icons/fi";

import { TbBolt, TbShield } from "react-icons/tb";
import { HiSparkles } from "react-icons/hi2";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: "easeOut" },
});

// ── Input Field ─────────────────────────────────────────
function InputField({
  label,
  id,
  icon: Icon,
  error,
  type = "text",
  placeholder,
  register,
  rightSlot,
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-300 mb-2"
      >
        {label}
      </label>

      <div className="relative">
        {Icon && (
          <Icon
            size={17}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
          />
        )}

        <input
          id={id}
          type={type}
          placeholder={placeholder}
          {...register}
          className={`w-full bg-[#0d1b2e] text-white placeholder:text-gray-600 border rounded-xl py-3 outline-none transition-all duration-200 ${
            Icon ? "pl-11" : "pl-4"
          } ${rightSlot ? "pr-11" : "pr-4"} ${
            error
              ? "border-red-500/50 focus:border-red-500"
              : "border-white/10 focus:border-cyan-500 focus:shadow-[0_0_0_3px_rgba(6,182,212,0.1)]"
          }`}
        />

        {rightSlot && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {rightSlot}
          </div>
        )}
      </div>

      {error && (
        <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
          <span>⚠</span> {error.message}
        </p>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { user, isLoading } = useAppselector((state) => state.mainstore);
  console.log("Userdata", user);
  const [preview, setPreview] = useState(null);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  // ── Profile Form ─────────────────────────
  const {
    register: regProfile,
    handleSubmit: handleProfile,
    reset: resetProfile,
    watch: watchProfile,
    formState: { errors: profileErrors },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      bio: "",
      phone: "",
      location: "",
      github: "",
      linkedin: "",
      portfolio: "",
      skills: "",
    },
  });

  // ── Password Form ────────────────────────
  const {
    register: regPassword,
    handleSubmit: handlePassword,
    reset: resetPassword,
    watch: watchPass,
    formState: { errors: passwordErrors },
  } = useForm();

  const watchNewPass = watchPass("newPassword");

  // ── Load Profile ─────────────────────────
  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.replace("/login");
    } else {
      dispatch(getProfile());
    }
  }, [dispatch, router]);

  // ── Route Protection On Auth Fail ────────
  useEffect(() => {
    if (!isLoading && !user) {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        router.replace("/login");
      }
    }
  }, [user, isLoading, router]);

  // ── Set Default Values ───────────────────
  useEffect(() => {
    if (user) {
      resetProfile({
        name: user?.name || "",
        email: user?.email || "",
        bio: user?.bio || "",
        phone: user?.phone || "",
        location: user?.location || "",
        github: user?.github || "",
        linkedin: user?.linkedin || "",
        portfolio: user?.portfolio || "",
        skills: user?.skills?.join(", ") || "",
      });

      if (user?.profileImage) {
        setPreview(user.profileImage);
      }
    }
  }, [user, resetProfile]);

  // ── Image Preview ────────────────────────
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        return;
      }

      setPreview(URL.createObjectURL(file));
    }
  };

  // ── Submit Profile ───────────────────────
  const onProfileSubmit = async (data) => {
    setProfileSaving(true);

    try {
      const formData = new FormData();

      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("bio", data.bio);
      formData.append("phone", data.phone);
      formData.append("location", data.location);
      formData.append("github", data.github);
      formData.append("linkedin", data.linkedin);
      formData.append("portfolio", data.portfolio);

      // skills array
      const skillsArray = data.skills?.split(",").map((skill) => skill.trim());

      formData.append("skills", JSON.stringify(skillsArray));

      if (data.profileImage?.[0]) {
        formData.append("profileImage", data.profileImage[0]);
      }

      const res = await dispatch(updateProfile(formData));

      if (updateProfile.fulfilled.match(res)) {
        toast.success("Profile updated successfully!");
        dispatch(getProfile());
      } else {
        toast.error(res.payload?.message || "Failed to update profile");
      }
    } finally {
      setProfileSaving(false);
    }
  };

  // ── Submit Password ──────────────────────
  const onPasswordSubmit = async (data) => {
    setPasswordSaving(true);

    try {
      const res = await dispatch(
        changeUserPassword({
          oldPassword: data.currentPassword,
          newPassword: data.newPassword,
          confirmPassword: data.confirmPassword,
        }),
      );

      if (changeUserPassword.fulfilled.match(res)) {
        toast.success("Password changed successfully!");

        resetPassword();
      } else {
        toast.error(res.payload?.message || "Failed to change password");
      }
    } finally {
      setPasswordSaving(false);
    }
  };
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-[#020617] pt-20 pb-16 px-4 sm:px-6">
      {/* Glow */}
      <div className="fixed top-1/4 right-0 w-80 h-80 bg-blue-600/8 rounded-full blur-[120px]" />
      <div className="fixed bottom-1/4 left-0 w-80 h-80 bg-cyan-500/8 rounded-full blur-[120px]" />

      <div className="max-w-4xl mx-auto">
        {/* Back */}
        <motion.div {...fadeUp(0)} className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors group"
          >
            <FiArrowLeft
              size={15}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
            Back to Home
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div {...fadeUp(0.05)} className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <HiSparkles size={16} className="text-cyan-400" />
            <span className="text-cyan-400 text-sm font-medium">Account</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            Profile Settings
          </h1>

          <p className="text-gray-400 mt-2">
            Manage your account information and security settings.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* LEFT */}
          <motion.div {...fadeUp(0.1)} className="lg:col-span-1">
            <div className="glass border border-white/10 rounded-2xl p-6 text-center sticky top-24">
              {/* Avatar */}
              <div className="relative inline-block mb-4">
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white/10 mx-auto bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  {preview ? (
                    <img
                      src={preview}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-4xl font-bold">
                      {user?.name?.[0]?.toUpperCase() || "U"}
                    </span>
                  )}
                </div>

                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 w-9 h-9 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform"
                >
                  <FiCamera size={14} className="text-white" />

                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    hidden
                    {...regProfile("profileImage", {
                      onChange: handleImageChange,
                    })}
                  />
                </label>
              </div>

              <h3 className="text-white font-bold text-lg mb-0.5">
                {user?.name || "Your Name"}
              </h3>

              <p className="text-gray-500 text-sm mb-4 truncate">
                {user?.email}
              </p>

              <p className="text-gray-600 text-xs mt-4">
                Click the camera icon to update your photo.
              </p>
            </div>
          </motion.div>

          {/* RIGHT */}
          <div className="lg:col-span-2 space-y-6">
            {/* PROFILE */}
            <motion.div
              {...fadeUp(0.15)}
              className="glass border border-white/10 rounded-2xl p-6 sm:p-8"
            >
              <div className="flex items-center gap-3 mb-6 pb-5 border-b border-white/[0.06]">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                  <FiUser size={18} className="text-cyan-400" />
                </div>

                <div>
                  <h2 className="text-white font-bold text-lg">
                    Profile Information
                  </h2>

                  <p className="text-gray-500 text-sm">
                    Update your profile information
                  </p>
                </div>
              </div>

              <form
                onSubmit={handleProfile(onProfileSubmit)}
                className="space-y-5"
              >
                {/* Name */}
                <InputField
                  label="Full Name"
                  id="profile-name"
                  icon={FiUser}
                  placeholder="Your full name"
                  error={profileErrors.name}
                  register={regProfile("name", {
                    required: "Name is required",
                  })}
                  rightSlot={
                    watchProfile("name")?.length > 2 ? (
                      <FiCheckCircle size={16} className="text-emerald-400" />
                    ) : null
                  }
                />

                {/* Email */}
                <InputField
                  label="Email Address"
                  id="profile-email"
                  icon={FiMail}
                  type="email"
                  placeholder="your@email.com"
                  error={profileErrors.email}
                  register={regProfile("email", {
                    required: "Email is required",
                  })}
                />

                {/* Bio */}
                <InputField
                  label="Bio"
                  id="profile-bio"
                  placeholder="Write something about yourself"
                  error={profileErrors.bio}
                  register={regProfile("bio")}
                />

                {/* Phone */}
                <InputField
                  label="Phone Number"
                  id="profile-phone"
                  icon={FiPhone}
                  placeholder="+91XXXXXXXXX"
                  error={profileErrors.phone}
                  register={regProfile("phone")}
                />

                {/* Location */}
                <InputField
                  label="Location"
                  id="profile-location"
                  icon={FiMapPin}
                  placeholder="Kolkata India"
                  error={profileErrors.location}
                  register={regProfile("location")}
                />

                {/* Skills */}
                <InputField
                  label="Skills"
                  id="profile-skills"
                  placeholder="React, Node.js, MongoDB"
                  error={profileErrors.skills}
                  register={regProfile("skills")}
                />

                {/* Github */}
                <InputField
                  label="GitHub"
                  id="profile-github"
                  icon={FiGithub}
                  placeholder="https://github.com/username"
                  error={profileErrors.github}
                  register={regProfile("github")}
                />

                {/* Linkedin */}
                <InputField
                  label="LinkedIn"
                  id="profile-linkedin"
                  icon={FiUser}
                  placeholder="https://linkedin.com/in/username"
                  error={profileErrors.linkedin}
                  register={regProfile("linkedin")}
                />

                {/* Portfolio */}
                <InputField
                  label="Portfolio Website"
                  id="profile-portfolio"
                  icon={FiGlobe}
                  placeholder="https://yourportfolio.com"
                  error={profileErrors.portfolio}
                  register={regProfile("portfolio")}
                />

                {/* Info */}
                <div className="bg-blue-500/8 border border-blue-500/20 rounded-xl p-3.5 flex items-start gap-2.5">
                  <span className="text-blue-400 text-sm mt-0.5">ℹ</span>

                  <p className="text-gray-400 text-xs leading-relaxed">
                    Keep your profile updated to make your account look
                    professional.
                  </p>
                </div>

                {/* Submit */}
                <div className="flex justify-end">
                  <motion.button
                    type="submit"
                    disabled={profileSaving || isLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold hover:from-blue-500 hover:to-cyan-400 shadow-lg shadow-cyan-500/20 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {profileSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FiSave size={16} />
                        Save Changes
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>

            {/* PASSWORD */}
            <motion.div
              {...fadeUp(0.2)}
              className="glass border border-white/10 rounded-2xl p-6 sm:p-8"
            >
              <div className="flex items-center gap-3 mb-6 pb-5 border-b border-white/[0.06]">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <TbShield size={18} className="text-purple-400" />
                </div>

                <div>
                  <h2 className="text-white font-bold text-lg">
                    Change Password
                  </h2>

                  <p className="text-gray-500 text-sm">Use a strong password</p>
                </div>
              </div>

              <form
                onSubmit={handlePassword(onPasswordSubmit)}
                className="space-y-5"
              >
                {/* Current Password */}
                <InputField
                  label="Current Password"
                  id="current-password"
                  icon={FiLock}
                  type={showCurrent ? "text" : "password"}
                  placeholder="Enter current password"
                  error={passwordErrors.currentPassword}
                  register={regPassword("currentPassword", {
                    required: "Current password is required",
                  })}
                  rightSlot={
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="text-gray-500"
                    >
                      {showCurrent ? (
                        <FiEyeOff size={16} />
                      ) : (
                        <FiEye size={16} />
                      )}
                    </button>
                  }
                />

                {/* New Password */}
                <InputField
                  label="New Password"
                  id="new-password"
                  icon={FiLock}
                  type={showNew ? "text" : "password"}
                  placeholder="Min 8 characters"
                  error={passwordErrors.newPassword}
                  register={regPassword("newPassword", {
                    required: "New password is required",
                    minLength: {
                      value: 8,
                      message: "Minimum 8 characters",
                    },
                  })}
                  rightSlot={
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="text-gray-500"
                    >
                      {showNew ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  }
                />

                {/* Confirm */}
                <InputField
                  label="Confirm Password"
                  id="confirm-password"
                  icon={FiLock}
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm password"
                  error={passwordErrors.confirmPassword}
                  register={regPassword("confirmPassword", {
                    required: "Please confirm password",
                    validate: (value) =>
                      value === watchNewPass || "Passwords do not match",
                  })}
                  rightSlot={
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="text-gray-500"
                    >
                      {showConfirm ? (
                        <FiEyeOff size={16} />
                      ) : (
                        <FiEye size={16} />
                      )}
                    </button>
                  }
                />

                {/* Submit */}
                <div className="flex justify-end">
                  <motion.button
                    type="submit"
                    disabled={passwordSaving}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold"
                  >
                    {passwordSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <TbShield size={16} />
                        Update Password
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
