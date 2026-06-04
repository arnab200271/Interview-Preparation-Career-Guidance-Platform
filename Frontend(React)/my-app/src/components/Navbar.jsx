"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch, useAppselector } from "@/Redux/hooks/hooks";
import NotificationDropdown from "./notification/Notificattion";
import socket from "../../api/socket/socket";
import { addNotification } from "@/Redux/slice/notificationslice";


// ─── React Icons ──────────────────────────────────────────────────────────────
import { FiHome, FiCode, FiCheckSquare, FiTerminal, FiFileText } from "react-icons/fi";
import { HiOutlineMenuAlt3, HiOutlineX } from "react-icons/hi";
import { RiUserLine, RiLogoutBoxLine, RiShieldUserLine } from "react-icons/ri";
import { TbBolt } from "react-icons/tb";

import { IoChevronDownOutline } from "react-icons/io5";
import { logout } from "@/Redux/slice/slice";


// ─── Constants ────────────────────────────────────────────────────────────────
const AUTH_ROUTES = ["/login", "/register", "/reverify", "/resend-verification", "/forgot-password", "/adminpanel", "/exam", "/result"];

const NAV_LINKS = [
  { label: "Home", href: "/", icon: FiHome },
  { label: "MCQ Tests", href: "/mcq", icon: FiCheckSquare },
  { label: "Coding Challenges", href: "/challenges", icon: FiTerminal },
  { label: "Resume Builder", href: "/resume", icon: FiFileText },
];

// ─── Avatar Helper ────────────────────────────────────────────────────────────
function UserAvatar({ user, size = "md" }) {
  const sizeClasses = size === "sm" ? "w-7 h-7 text-xs" : "w-9 h-9 text-sm";
  if (user?.profileImage) {
    return (
      <img
        src={user.profileImage}
        alt={user.name || "User"}
        className={`${sizeClasses} rounded-full object-cover ring-2 ring-cyan-500/30`}
      />
    );
  }
  return (
    <div className={`${sizeClasses} rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold ring-2 ring-cyan-500/30`}>
      {user?.name?.[0]?.toUpperCase() || "U"}
    </div>
  );
}

// ─── Profile Dropdown ─────────────────────────────────────────────────────────
function ProfileDropdown({ user, onClose }) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logout());
    onClose();
    router.replace("/");
  };
  console.log("logout =", logout);
  const menuItems = [
    { label: "Profile Settings", href: "/profile", icon: RiUserLine },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="absolute right-0 top-full mt-3 w-56 z-50 origin-top-right"
    >
      {/* Card */}
      <div className="bg-[#0b1628] border border-white/10 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">
        {/* User info header */}
        <div className="px-4 py-4 border-b border-white/[0.06] bg-gradient-to-br from-cyan-500/5 to-blue-600/5">
          <div className="flex items-center gap-3">
            <UserAvatar user={user} size="md" />
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm truncate">{user?.name || "User"}</p>
              <p className="text-gray-500 text-xs truncate">{user?.email}</p>
            </div>
          </div>
          {/* Role badge */}
          <div className="mt-3 inline-flex items-center gap-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-2.5 py-0.5">
            <RiShieldUserLine size={11} className="text-cyan-400" />
            <span className="text-cyan-400 text-[10px] font-medium">Member</span>
          </div>
        </div>

        {/* Links */}
        <div className="p-2">
          {menuItems.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-150 text-sm group"
            >
              <Icon size={16} className="text-gray-500 group-hover:text-cyan-400 transition-colors" />
              {label}
            </Link>
          ))}

          {/* Divider */}
          <div className="my-1.5 border-t border-white/[0.06]" />

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400/80 hover:text-red-300 hover:bg-red-500/8 transition-all duration-150 text-sm group"
          >
            <RiLogoutBoxLine size={16} className="group-hover:translate-x-0.5 transition-transform" />
            Sign Out
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Mobile Drawer ────────────────────────────────────────────────────────────
function MobileDrawer({ open, onClose, pathname, user }) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logout());
    onClose();
    router.replace("/login");
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-72 z-50 bg-[#060f1e] border-l border-white/10 shadow-2xl shadow-black/80 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <TbBolt size={14} className="text-white" />
                </div>
                <span className="text-white font-bold text-base">
                  Interview<span className="text-cyan-400">AI</span>
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <HiOutlineX size={20} />
              </button>
            </div>

            {/* User info (if logged in) */}
            {user && (
              <div className="px-4 py-4 border-b border-white/[0.06] mx-3 mt-3 bg-gradient-to-br from-cyan-500/5 to-blue-600/5 rounded-2xl">
                <div className="flex items-center gap-3">
                  <UserAvatar user={user} />
                  <div className="min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{user.name}</p>
                    <p className="text-gray-500 text-xs truncate">{user.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Nav Links */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
              {NAV_LINKS.map(({ label, href, icon: Icon }, i) => {
                const isActive = pathname === href;
                return (
                  <motion.div
                    key={href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.25 }}
                  >
                    <Link
                      href={href}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                          ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                    >
                      <Icon size={17} className={isActive ? "text-cyan-400" : "text-gray-500"} />
                      {label}
                      {isActive && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            {/* Bottom section */}
            <div className="px-3 pb-6 border-t border-white/[0.06] pt-4 space-y-2">
              {user ? (
                <>
                  <Link
                    href="/profile"
                    onClick={onClose}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <RiUserLine size={17} />
                    Profile Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/8 transition-all"
                  >
                    <RiLogoutBoxLine size={17} />
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/login"
                    onClick={onClose}
                    className="flex items-center justify-center py-3 rounded-xl border border-white/10 text-gray-300 text-sm font-medium hover:bg-white/5 hover:text-white transition-all"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={onClose}
                    className="flex items-center justify-center py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-semibold hover:from-blue-500 hover:to-cyan-400 transition-all shadow-lg shadow-cyan-500/20"
                  >
                    Get Started Free
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Main Navbar ──────────────────────────────────────────────────────────────
export default function Navbar() {
  const pathname = usePathname();
  // Hide on auth pages and any exam pages (e.g. /challenges/[id]/exam or /mcq/exam)
  const isAuthPage = AUTH_ROUTES.some((r) => pathname?.startsWith(r)) || pathname?.includes("/exam");
  if (isAuthPage) return null;

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { user } = useAppselector((state) => state.mainstore);
  const dispatch = useAppDispatch();

  // Socket.IO notification listener
  useEffect(() => {
    const handleNewNotification = (data) => {
      dispatch(addNotification(data));
    };

    socket.on("newNotification", handleNewNotification);

    return () => {
      socket.off("newNotification", handleNewNotification);
    };
  }, [dispatch]);



  // Scroll detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled
            ? "bg-[#020617]/90 backdrop-blur-2xl border-b border-white/[0.08] shadow-xl shadow-black/30"
            : "bg-transparent"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* ── Logo ─────────────────────────────────────────── */}
            <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 group-hover:shadow-cyan-500/50 group-hover:scale-105 transition-all duration-300">
                <TbBolt size={17} className="text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
               Career<span className="text-cyan-400">Nova</span>
              </span>
            </Link>

            {/* ── Desktop Nav Links ─────────────────────────────── */}
            <div className="hidden lg:flex items-center gap-0.5">
              {NAV_LINKS.map(({ label, href, icon: Icon }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                        ? "text-cyan-400"
                        : "text-gray-400 hover:text-white"
                      }`}
                  >
                    {/* Active pill */}
                    {isActive && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-xl bg-cyan-500/10 border border-cyan-500/20"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}
                    {/* Hover bg */}
                    <span className="absolute inset-0 rounded-xl bg-white/0 hover:bg-white/5 transition-colors duration-200" />
                    <Icon size={14} className="relative z-10 flex-shrink-0" />
                    <span className="relative z-10">{label}</span>
                  </Link>
                );
              })}
            </div>

            {/* ── Right Side ────────────────────────────────────── */}
            <div className="flex items-center gap-3">
              {user && <NotificationDropdown />}
              {user ? (
                /* ── Profile Dropdown ── */
                <div ref={dropdownRef} className="relative hidden sm:block">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setDropdownOpen((v) => !v)}
                    className="flex items-center gap-2.5 bg-white/5 hover:bg-white/8 border border-white/10 hover:border-white/20 rounded-xl px-3 py-2 transition-all duration-200"
                  >
                    <UserAvatar user={user} size="sm" />
                    <span className="hidden md:block text-white text-sm font-medium max-w-[110px] truncate">
                      {user.name}
                    </span>
                    <IoChevronDownOutline
                      size={14}
                      className={`text-gray-400 transition-transform duration-300 ${dropdownOpen ? "rotate-180" : ""
                        }`}
                    />
                  </motion.button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <ProfileDropdown
                        user={user}
                        onClose={() => setDropdownOpen(false)}
                      />
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                /* ── Auth Buttons ── */
                <div className="hidden sm:flex items-center gap-2">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      href="/login"
                      className="px-4 py-2 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-200"
                    >
                      Login
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      href="/register"
                      className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/35 transition-all duration-200"
                    >
                      Get Started
                    </Link>
                  </motion.div>
                </div>
              )}

              {/* ── Mobile Menu Button ── */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 border border-white/[0.06] hover:border-white/10 transition-all duration-200"
                aria-label="Open menu"
              >
                <HiOutlineMenuAlt3 size={20} />
              </motion.button>
            </div>
          </div>
        </div>

        {/* ── Subtle glow line at bottom when scrolled ── */}
        {scrolled && (
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
        )}
      </motion.nav>

      {/* ── Mobile Drawer ────────────────────────────────── */}
      <MobileDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        pathname={pathname}
        user={user}
      />
    </>
  );
}
