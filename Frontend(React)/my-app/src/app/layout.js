import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReduxProvider from "./storeProvider";
import Navbar from "@/components/Navbar";
import AuthLoader from "@/components/Authloader";
import AIChatWidget from "@/components/Aichat/Aichat";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "InterviewAI — AI Powered Interview & Coding Platform",
  description:
    "Master coding and interviews with our coding challenges, MCQ tests, and real-time AI guidance.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#020617] text-slate-100">
        <ReduxProvider>
          <AuthLoader />
          {/* Sticky Navbar — hides itself on auth routes */}
          <Navbar />
         <AIChatWidget/>
          {/* Page content */}
          <main className="flex-1">{children}</main>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            pauseOnFocusLoss={false}
            pauseOnHover
            theme="dark"
            toastStyle={{
              background: "#0f172a",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "12px",
              color: "#e2e8f0",
            }}
          />
        </ReduxProvider>
      </body>
    </html>
  );
}
