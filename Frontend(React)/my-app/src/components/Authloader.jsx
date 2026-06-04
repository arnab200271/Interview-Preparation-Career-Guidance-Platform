"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppselector } from "@/Redux/hooks/hooks";
import { getProfile } from "@/Redux/slice/slice";
import { usePathname, useRouter } from "next/navigation";

export default function AuthLoader() {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAppselector((state) => state.mainstore);

  // 1. Initial profile fetch if token exists
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      dispatch(getProfile());
    }
  }, [dispatch]);

  // 2. Redirect logic for Admin
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Get user from state or fallback to localStorage (for instant redirect on boot)
    let currentUser = user;
    if (!currentUser) {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          currentUser = JSON.parse(storedUser);
        }
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
      }
    }

    if (currentUser && currentUser.role === "admin") {
      // Admin should only be allowed on adminpanel routes
      const isAdminRoute = pathname?.startsWith("/adminpanel");
      if (!isAdminRoute) {
        router.replace("/adminpanel");
      }
    }
  }, [user, pathname, router]);

  return null;
}