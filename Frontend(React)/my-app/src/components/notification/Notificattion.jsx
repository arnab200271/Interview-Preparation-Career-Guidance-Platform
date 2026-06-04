"use client";

import { useState, useRef, useEffect } from "react";
import { FaBell } from "react-icons/fa";
import { FiTerminal, FiCheckSquare } from "react-icons/fi";
import { useAppselector, useAppDispatch } from "@/Redux/hooks/hooks";
import { markAllRead } from "@/Redux/slice/notificationslice";
import { motion, AnimatePresence } from "framer-motion";

// Helper to format notification time
const formatTime = (isoString) => {
  if (!isoString) return "Just now";
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch (e) {
    return "Recently";
  }
};

// Helper to get custom themed icon based on notification type
const getNotificationIcon = (type) => {
  switch (type) {
    case "test":
      return (
        <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
          <FiCheckSquare size={16} />
        </div>
      );
    case "challenge":
      return (
        <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
          <FiTerminal size={16} />
        </div>
      );
    default:
      return (
        <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
          <FaBell size={14} className="transform rotate-12" />
        </div>
      );
  }
};

const NotificationDropdown = () => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const dispatch = useAppDispatch();

  const { notifications, unreadCount } = useAppselector(
    (state) => state.notificationStore
  );

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAllRead = () => {
    dispatch(markAllRead());
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="relative p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 border border-white/[0.06] hover:border-white/10 transition-all duration-200"
        aria-label="Toggle Notifications"
      >
        <FaBell className={`text-lg transition-transform duration-300 ${open ? "scale-110" : ""}`} />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-[10px] font-bold flex items-center justify-center border border-[#020617] shadow-lg shadow-cyan-500/20">
            {unreadCount}
          </span>
        )}
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute right-0 top-full mt-3 w-[360px] sm:w-[380px] z-50 origin-top-right bg-[#0b1628] border border-white/10 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-white/[0.06] bg-gradient-to-br from-cyan-500/5 to-blue-600/5">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-medium">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-cyan-400 hover:text-cyan-300 text-xs font-medium transition-colors"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* Notification List */}
            <div className="max-h-[360px] overflow-y-auto divide-y divide-white/[0.04] scrollbar-thin">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-3">
                    <FaBell className="text-gray-500 text-xl" />
                  </div>
                  <p className="text-gray-400 text-sm font-medium">All caught up!</p>
                  <p className="text-gray-500 text-xs mt-1">No new notifications here.</p>
                </div>
              ) : (
                notifications.map((item, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 p-4 hover:bg-white/5 transition-colors duration-150 relative ${
                      !item.isRead ? "bg-cyan-500/[0.01]" : ""
                    }`}
                  >
                    {/* Left Icon */}
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(item.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <h4 className="font-semibold text-white text-sm truncate">
                          {item.title}
                        </h4>
                        <span className="text-gray-500 text-[10px] flex-shrink-0">
                          {formatTime(item.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 leading-relaxed break-words">
                        {item.message}
                      </p>
                    </div>

                    {/* Unread indicator dot */}
                    {!item.isRead && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-md shadow-cyan-400/50" />
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown;