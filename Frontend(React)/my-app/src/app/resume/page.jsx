"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { useAppDispatch, useAppselector } from "@/Redux/hooks/hooks";
import {
  fetchTemplates,
  fetchUserResumes,
  createUserResume,
  updateUserResume,
  deleteUserResume,
} from "@/Redux/slice/slice";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "../../../api/axiosInstance/axiosInstnace";

// ── Icons ─────────────────────────────────────────────────────────────────────
import {
  FiFileText,
  FiPlus,
  FiTrash2,
  FiDownload,
  FiSave,
  FiEdit,
  FiArrowLeft,
  FiUser,
  FiBriefcase,
  FiBookOpen,
  FiCode,
  FiFolder,
  FiMapPin,
  FiPhone,
  FiMail,
  FiExternalLink,
} from "react-icons/fi";
import { HiSparkles, HiCheckCircle } from "react-icons/hi2";
import { TbBolt, TbLayout } from "react-icons/tb";

// ── Design Metadata for each Puppeteer Layout ───────────────────────────────
const getTemplateMeta = (id) => {
  switch (id) {
    case "classic":
      return {
        name: "Classic Minimalist",
        desc: "A clean, timeless design suited for corporate and traditional roles.",
        bgColor: "from-blue-600/10 to-indigo-600/10",
        glowColor: "group-hover:border-blue-500/40",
      };
    case "creative_developer":
      return {
        name: "Creative Developer",
        desc: "A highly dynamic layout perfect for tech stack highlights and Git links.",
        bgColor: "from-cyan-600/10 to-emerald-600/10",
        glowColor: "group-hover:border-cyan-500/40",
      };
    case "executive":
      return {
        name: "Executive Slate",
        desc: "A polished double-column layout designed for mid-to-senior levels.",
        bgColor: "from-purple-600/10 to-pink-600/10",
        glowColor: "group-hover:border-purple-500/40",
      };
    case "minimal_onepage":
      return {
        name: "Minimal One-Page",
        desc: "Ultra-clean, single-page presentation optimized for high visual impact.",
        bgColor: "from-teal-600/10 to-indigo-600/10",
        glowColor: "group-hover:border-teal-500/40",
      };
    case "modern":
      return {
        name: "Modern Professional",
        desc: "Sleek margins and high-quality spacing for modern digital applications.",
        bgColor: "from-violet-600/10 to-fuchsia-600/10",
        glowColor: "group-hover:border-violet-500/40",
      };
    case "saas_glass":
      return {
        name: "SaaS Glassmorphism",
        desc: "Stunning frosted glass card layout for modern software engineering.",
        bgColor: "from-pink-600/10 to-rose-600/10",
        glowColor: "group-hover:border-pink-500/40",
      };
    case "student":
      return {
        name: "Academic Entry",
        desc: "Designed to showcase courses, projects, and university achievements.",
        bgColor: "from-amber-600/10 to-orange-600/10",
        glowColor: "group-hover:border-amber-500/40",
      };
    case "tech_portfolio":
      return {
        name: "Tech Portfolio",
        desc: "Sleek, dark, and syntax-highlighted theme for web developers.",
        bgColor: "from-slate-600/10 to-slate-900/10",
        glowColor: "group-hover:border-slate-400/40",
      };
    case "buleProfessionla":
      return {
        name: "Blue Professional",
        desc: "A bold two-column layout with a deep blue sidebar for maximum visual impact.",
        bgColor: "from-blue-700/10 to-sky-600/10",
        glowColor: "group-hover:border-blue-600/40",
      };
    case "canva_elegance":
      return {
        name: "Canva Elegance",
        desc: "Warm serif-inspired typography with a refined coral accent bar and timeless layout.",
        bgColor: "from-orange-500/10 to-rose-400/10",
        glowColor: "group-hover:border-orange-400/40",
      };
    case "canva_modern_grid":
      return {
        name: "Canva Modern Grid",
        desc: "Bold teal header with structured grid sections and modern professional typography.",
        bgColor: "from-teal-500/10 to-emerald-500/10",
        glowColor: "group-hover:border-teal-400/40",
      };
    default:
      return {
        name: id.charAt(0).toUpperCase() + id.slice(1).replace(/_/g, " "),
        desc: "Professional pre-compiled HTML Puppeteer layout.",
        bgColor: "from-blue-600/10 to-cyan-600/10",
        glowColor: "group-hover:border-cyan-500/40",
      };
  }
};

// Fallback Templates if Backend API loads slow
const FALLBACK_TEMPLATES = [
  { id: "classic" },
  { id: "creative_developer" },
  { id: "executive" },
  { id: "minimal_onepage" },
  { id: "modern" },
  { id: "saas_glass" },
  { id: "student" },
  { id: "tech_portfolio" },
  { id: "buleProfessionla" },
  { id: "canva_elegance" },
  { id: "canva_modern_grid" },
];

const INITIAL_RESUME_STATE = {
  fullName: "",
  jobTitle: "",
  email: "",
  phone: "",
  location: "",
  summary: "",
  experience: [
    { company: "", role: "", startDate: "", endDate: "", description: "" },
  ],
  education: [{ school: "", degree: "", graduationDate: "" }],
  projects: [{ title: "", link: "", description: "" }],
  skills: "",
  templateId: "classic",
};

// ── Mini Rendered Preview for instant comparative cards ────────────────────
function MiniResumePreview({ templateId, data }) {
  const hasExperience = data.experience?.some((e) => e.role || e.company);
  const hasEducation = data.education?.some((e) => e.school || e.degree);
  const hasProjects = data.projects?.some((p) => p.title || p.description);
  const skillsArr = (data.skills || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  // ── CLASSIC / MINIMAL / STUDENT ──
  if (
    templateId === "classic" ||
    templateId === "minimal_onepage" ||
    templateId === "student"
  ) {
    return (
      <div className="font-sans space-y-5 text-xs text-slate-800 text-left">
        {/* Header */}
        <div className="border-b-2 border-slate-300 pb-4 text-center">
          <h2 className="text-[28px] font-extrabold text-slate-950 uppercase tracking-wide leading-none">
            {data.fullName || "Your Full Name"}
          </h2>
          <p className="text-cyan-600 font-bold text-[11px] tracking-wider uppercase mt-2">
            {data.jobTitle || "Your Title"}
          </p>
          <div className="flex justify-center flex-wrap gap-x-3 gap-y-1 text-slate-500 text-[9px] mt-2 font-medium">
            {data.email && <span>{data.email}</span>}
            {data.phone && <span>· {data.phone}</span>}
            {data.location && <span>· {data.location}</span>}
          </div>
        </div>

        {/* Summary */}
        {data.summary && (
          <div className="space-y-1">
            <h3 className="text-slate-950 font-bold border-b border-slate-200 pb-0.5 text-[10px] uppercase tracking-wider">
              Summary
            </h3>
            <p className="text-slate-600 leading-relaxed text-[10px]">
              {data.summary}
            </p>
          </div>
        )}

        {/* Skills */}
        {skillsArr.length > 0 && (
          <div className="space-y-1.5">
            <h3 className="text-slate-950 font-bold border-b border-slate-200 pb-0.5 text-[10px] uppercase tracking-wider">
              Skills
            </h3>
            <div className="flex flex-wrap gap-1">
              {skillsArr.map((s, idx) => (
                <span
                  key={idx}
                  className="bg-slate-100 border border-slate-200 text-slate-700 px-1.5 py-0.5 rounded text-[8px] font-semibold"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {hasExperience && (
          <div className="space-y-2">
            <h3 className="text-slate-950 font-bold border-b border-slate-200 pb-0.5 text-[10px] uppercase tracking-wider">
              Experience
            </h3>
            {data.experience.map((exp, idx) => (
              <div key={idx} className="space-y-0.5 text-[10px]">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-slate-900">
                    {exp.role || "Role"}
                    {exp.company ? ` @ ${exp.company}` : ""}
                  </span>
                  {(exp.startDate || exp.endDate) && (
                    <span className="text-slate-400 text-[8px] font-medium whitespace-nowrap ml-2">
                      {exp.startDate}
                      {exp.endDate ? ` – ${exp.endDate}` : ""}
                    </span>
                  )}
                </div>
                {exp.description && (
                  <p className="text-slate-500 leading-tight text-[9px]">
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {hasEducation && (
          <div className="space-y-2">
            <h3 className="text-slate-950 font-bold border-b border-slate-200 pb-0.5 text-[10px] uppercase tracking-wider">
              Education
            </h3>
            {data.education.map((edu, idx) => (
              <div key={idx} className="text-[10px]">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-slate-900">
                    {edu.degree || "Degree"}
                  </span>
                  {edu.graduationDate && (
                    <span className="text-slate-400 text-[8px] font-medium whitespace-nowrap ml-2">
                      {edu.graduationDate}
                    </span>
                  )}
                </div>
                {edu.school && (
                  <p className="text-slate-500 text-[9px]">{edu.school}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {hasProjects && (
          <div className="space-y-2">
            <h3 className="text-slate-950 font-bold border-b border-slate-200 pb-0.5 text-[10px] uppercase tracking-wider">
              Projects
            </h3>
            {data.projects.map((proj, idx) => (
              <div key={idx} className="text-[10px] space-y-0.5">
                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-slate-900">
                    {proj.title || "Project"}
                  </span>
                  {proj.link && (
                    <span className="text-cyan-600 text-[8px] truncate">
                      {proj.link}
                    </span>
                  )}
                </div>
                {proj.description && (
                  <p className="text-slate-500 leading-tight text-[9px]">
                    {proj.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── BLUE PROFESSIONAL (sidebar + main) ──
  if (templateId === "buleProfessionla") {
    return (
      <div className="font-sans text-xs text-left flex min-h-[105%] -m-8">
        {/* Blue Sidebar */}
        <div className="w-[34%] bg-gradient-to-b from-[#143b77] to-[#0d2c5d] text-white p-5 space-y-4">
          {/* Profile placeholder */}
          <div className="w-20 h-[90px] bg-blue-200/20 border-2 border-white/15 mx-auto mb-3" />

          {/* Contact */}
          <div className="space-y-1">
            <h3 className="text-[9px] font-bold uppercase border-b border-white/20 pb-1 tracking-wider">
              Contact
            </h3>
            <div className="space-y-1 text-[8px] text-white/90">
              {data.location && <p> {data.location}</p>}
              {data.phone && <p>{data.phone}</p>}
              {data.email && <p> {data.email}</p>}
            </div>
          </div>

          {/* Summary */}
          {data.summary && (
            <div className="space-y-1">
              <h3 className="text-[9px] font-bold uppercase border-b border-white/20 pb-1 tracking-wider">
                Summary
              </h3>
              <p className="text-[8px] text-white/85 leading-relaxed">
                {data.summary}
              </p>
            </div>
          )}

          {/* Skills */}
          {skillsArr.length > 0 && (
            <div className="space-y-1">
              <h3 className="text-[9px] font-bold uppercase border-b border-white/20 pb-1 tracking-wider">
                Skills
              </h3>
              <ul className="space-y-0.5 text-[8px] text-white/85 list-disc pl-3">
                {skillsArr.map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="w-[66%] p-5 bg-white space-y-3">
          <h2 className="text-[24px] font-extrabold text-[#18468d] leading-none">
            {data.fullName || "Your Full Name"}
          </h2>

          {/* Experience */}
          {hasExperience && (
            <div className="space-y-1.5">
              <h3 className="text-[10px] font-bold uppercase border-b-2 border-[#1d4f9a] pb-0.5 text-slate-900">
                Experience
              </h3>
              {data.experience.map((exp, idx) => (
                <div key={idx} className="space-y-0.5">
                  <p className="font-bold text-[9px] text-slate-900">
                    {exp.role}
                    {exp.company ? ` — ${exp.company}` : ""}
                  </p>
                  {(exp.startDate || exp.endDate) && (
                    <p className="text-[7px] text-slate-400">
                      {exp.startDate}
                      {exp.endDate ? ` – ${exp.endDate}` : ""}
                    </p>
                  )}
                  {exp.description && (
                    <p className="text-[8px] text-slate-500 leading-tight">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Education */}
          {hasEducation && (
            <div className="space-y-1.5">
              <h3 className="text-[10px] font-bold uppercase border-b-2 border-[#1d4f9a] pb-0.5 text-slate-900">
                Education
              </h3>
              {data.education.map((edu, idx) => (
                <div key={idx} className="space-y-0.5">
                  <p className="font-bold text-[9px] text-slate-900">
                    {edu.degree}
                  </p>
                  {edu.school && (
                    <p className="text-[8px] text-slate-500">{edu.school}</p>
                  )}
                  {edu.graduationDate && (
                    <p className="text-[7px] text-slate-400">
                      {edu.graduationDate}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Projects */}
          {hasProjects && (
            <div className="space-y-1.5">
              <h3 className="text-[10px] font-bold uppercase border-b-2 border-[#1d4f9a] pb-0.5 text-slate-900">
                Projects
              </h3>
              {data.projects.map((proj, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex items-baseline gap-1">
                    <span className="font-bold text-[9px] text-slate-900">
                      {proj.title}
                    </span>
                    {proj.link && (
                      <span className="text-[7px] text-[#18468d] truncate">
                        {proj.link}
                      </span>
                    )}
                  </div>
                  {proj.description && (
                    <p className="text-[8px] text-slate-500 leading-tight">
                      {proj.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── EXECUTIVE / MODERN (two-column layout) ──
  if (templateId === "executive" || templateId === "modern") {
    return (
      <div className="font-sans text-xs text-slate-800 text-left">
        {/* Header */}
        <div className="border-b-4 border-slate-800 pb-3 mb-4">
          <h2 className="text-[30px] font-extrabold text-slate-950 tracking-tight leading-none">
            {data.fullName || "Your Full Name"}
          </h2>
          <p className="text-indigo-600 font-bold text-[11px] tracking-wide uppercase mt-1">
            {data.jobTitle || "Your Title"}
          </p>
        </div>

        <div className="grid grid-cols-12 gap-4">
          {/* Left Sidebar */}
          <div className="col-span-4 border-r border-slate-200 pr-3 space-y-4">
            {/* Contact */}
            <div className="space-y-1">
              <h3 className="text-indigo-600 font-extrabold text-[9px] uppercase tracking-wider">
                Contact
              </h3>
              <ul className="space-y-1 text-slate-500 text-[8px] break-all leading-tight font-medium">
                {data.email && <li>{data.email}</li>}
                {data.phone && <li>{data.phone}</li>}
                {data.location && <li>{data.location}</li>}
              </ul>
            </div>

            {/* Skills */}
            {skillsArr.length > 0 && (
              <div className="space-y-1.5">
                <h3 className="text-indigo-600 font-extrabold text-[9px] uppercase tracking-wider">
                  Skills
                </h3>
                <div className="flex flex-col gap-1">
                  {skillsArr.map((s, idx) => (
                    <span
                      key={idx}
                      className="bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded text-[8px] text-center border border-slate-200"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Education (sidebar) */}
            {hasEducation && (
              <div className="space-y-1.5">
                <h3 className="text-indigo-600 font-extrabold text-[9px] uppercase tracking-wider">
                  Education
                </h3>
                {data.education.map((edu, idx) => (
                  <div key={idx} className="text-[8px] space-y-0.5">
                    <p className="font-bold text-slate-900">{edu.degree}</p>
                    <p className="text-slate-500">{edu.school}</p>
                    {edu.graduationDate && (
                      <p className="text-slate-400 text-[7px]">
                        {edu.graduationDate}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Main Content */}
          <div className="col-span-8 space-y-4">
            {/* Profile */}
            {data.summary && (
              <div className="space-y-1">
                <h3 className="text-slate-900 font-extrabold text-[9px] uppercase tracking-wider border-b border-indigo-600/30 pb-0.5">
                  Profile
                </h3>
                <p className="text-slate-500 leading-relaxed text-[9px]">
                  {data.summary}
                </p>
              </div>
            )}

            {/* Experience */}
            {hasExperience && (
              <div className="space-y-1.5">
                <h3 className="text-slate-900 font-extrabold text-[9px] uppercase tracking-wider border-b border-indigo-600/30 pb-0.5">
                  Experience
                </h3>
                {data.experience.map((exp, idx) => (
                  <div key={idx} className="space-y-0.5 text-[9px]">
                    <div className="flex justify-between items-baseline">
                      <p className="font-bold text-slate-950">
                        {exp.role} —{" "}
                        <span className="text-indigo-600 font-semibold">
                          {exp.company}
                        </span>
                      </p>
                      {(exp.startDate || exp.endDate) && (
                        <span className="text-slate-400 text-[7px] whitespace-nowrap ml-1">
                          {exp.startDate}
                          {exp.endDate ? ` – ${exp.endDate}` : ""}
                        </span>
                      )}
                    </div>
                    {exp.description && (
                      <p className="text-slate-500 leading-tight text-[8px]">
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Projects */}
            {hasProjects && (
              <div className="space-y-1.5">
                <h3 className="text-slate-900 font-extrabold text-[9px] uppercase tracking-wider border-b border-indigo-600/30 pb-0.5">
                  Projects
                </h3>
                {data.projects.map((proj, idx) => (
                  <div key={idx} className="space-y-0.5 text-[9px]">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-bold text-slate-950">
                        {proj.title}
                      </span>
                      {proj.link && (
                        <span className="text-indigo-500 text-[7px] truncate">
                          {proj.link}
                        </span>
                      )}
                    </div>
                    {proj.description && (
                      <p className="text-slate-500 leading-tight text-[8px]">
                        {proj.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── DEVELOPER DARK THEME (creative_developer, saas_glass, tech_portfolio, default) ──
  return (
    <div className="font-sans text-xs text-slate-300 bg-slate-950 p-6 -m-8 min-h-[105%] text-left">
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h2 className="text-[26px] font-bold tracking-tight text-white leading-none">
            {data.fullName || "Your Full Name"}
          </h2>
          <p className="text-cyan-400 font-bold text-[10px] uppercase tracking-widest mt-1.5">
            {data.jobTitle || "Your Title"}
          </p>
          <div className="flex flex-wrap gap-x-2 gap-y-1 text-slate-500 text-[8px] font-mono mt-1.5 uppercase">
            {data.email && <span>{data.email}</span>}
            {data.phone && <span>· {data.phone}</span>}
            {data.location && <span>· {data.location}</span>}
          </div>
        </div>

        {/* Summary */}
        {data.summary && (
          <div className="space-y-1 border-t border-slate-800 pt-3">
            <p className="text-[8px] font-mono text-cyan-500/60 uppercase tracking-widest">
              // SUMMARY
            </p>
            <p className="text-slate-400 leading-relaxed text-[9px]">
              {data.summary}
            </p>
          </div>
        )}

        {/* Skills */}
        {skillsArr.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[8px] font-mono text-cyan-500/60 uppercase tracking-widest">
              // SKILLS
            </p>
            <div className="flex flex-wrap gap-1">
              {skillsArr.map((s, idx) => (
                <span
                  key={idx}
                  className="bg-slate-900 text-cyan-400 font-mono px-1.5 py-0.5 rounded border border-slate-800 text-[8px]"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {hasExperience && (
          <div className="space-y-2">
            <p className="text-[8px] font-mono text-cyan-500/60 uppercase tracking-widest">
              // EXPERIENCE
            </p>
            {data.experience.map((exp, idx) => (
              <div key={idx} className="space-y-0.5 text-[9px]">
                <div className="flex justify-between items-baseline">
                  <p className="font-bold text-white">
                    {exp.role}{" "}
                    <span className="text-cyan-400">@ {exp.company}</span>
                  </p>
                  {(exp.startDate || exp.endDate) && (
                    <span className="text-slate-600 text-[7px] font-mono whitespace-nowrap ml-1">
                      {exp.startDate}
                      {exp.endDate ? ` – ${exp.endDate}` : ""}
                    </span>
                  )}
                </div>
                {exp.description && (
                  <p className="text-slate-400 leading-tight text-[8px]">
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {hasEducation && (
          <div className="space-y-2">
            <p className="text-[8px] font-mono text-cyan-500/60 uppercase tracking-widest">
              // EDUCATION
            </p>
            {data.education.map((edu, idx) => (
              <div key={idx} className="text-[9px]">
                <div className="flex justify-between items-baseline">
                  <p className="font-bold text-white">{edu.degree}</p>
                  {edu.graduationDate && (
                    <span className="text-slate-600 text-[7px] font-mono whitespace-nowrap ml-1">
                      {edu.graduationDate}
                    </span>
                  )}
                </div>
                {edu.school && (
                  <p className="text-slate-500 text-[8px]">{edu.school}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {hasProjects && (
          <div className="space-y-2">
            <p className="text-[8px] font-mono text-cyan-500/60 uppercase tracking-widest">
              // PROJECTS
            </p>
            {data.projects.map((proj, idx) => (
              <div key={idx} className="space-y-0.5 text-[9px]">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-bold text-white">{proj.title}</span>
                  {proj.link && (
                    <span className="text-cyan-400/70 text-[7px] font-mono truncate">
                      {proj.link}
                    </span>
                  )}
                </div>
                {proj.description && (
                  <p className="text-slate-400 leading-tight text-[8px]">
                    {proj.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Full-size Resume Preview for the builder's live editing panel ──────────
function FullResumePreview({ templateId, data }) {
  const hasExperience = data.experience?.some((e) => e.role || e.company);
  const hasEducation = data.education?.some((e) => e.school || e.degree);
  const hasProjects = data.projects?.some((p) => p.title || p.description);
  const skillsArr = (data.skills || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  // ── CLASSIC / MINIMAL / STUDENT ──
  if (
    templateId === "classic" ||
    templateId === "minimal_onepage" ||
    templateId === "student"
  ) {
    return (
      <div className="font-sans space-y-6 text-slate-800 text-left">
        {/* Header */}
        <div className="border-b-2 border-slate-300 pb-5 text-center">
          <h2 className="text-3xl font-extrabold text-slate-950 uppercase tracking-wide leading-tight">
            {data.fullName || "Your Full Name"}
          </h2>
          <p className="text-cyan-600 font-bold text-sm tracking-wider uppercase mt-2">
            {data.jobTitle || "Your Professional Title"}
          </p>
          <div className="flex justify-center flex-wrap gap-x-4 gap-y-1 text-slate-500 text-xs mt-3 font-medium">
            {data.email && <span>{data.email}</span>}
            {data.phone && <span>· {data.phone}</span>}
            {data.location && <span>· {data.location}</span>}
          </div>
        </div>

        {/* Summary */}
        {data.summary && (
          <div className="space-y-2">
            <h3 className="text-slate-950 font-bold border-b border-slate-200 pb-1 text-xs uppercase tracking-wider">
              Professional Summary
            </h3>
            <p className="text-slate-600 leading-relaxed text-sm">
              {data.summary}
            </p>
          </div>
        )}

        {/* Skills */}
        {skillsArr.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-slate-950 font-bold border-b border-slate-200 pb-1 text-xs uppercase tracking-wider">
              Technical Skills
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {skillsArr.map((s, idx) => (
                <span
                  key={idx}
                  className="bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-md text-xs font-semibold"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {hasExperience && (
          <div className="space-y-3">
            <h3 className="text-slate-950 font-bold border-b border-slate-200 pb-1 text-xs uppercase tracking-wider">
              Work Experience
            </h3>
            {data.experience.map((exp, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-slate-900 text-sm">
                    {exp.role || "Role"}
                    {exp.company ? ` @ ${exp.company}` : ""}
                  </span>
                  {(exp.startDate || exp.endDate) && (
                    <span className="text-slate-400 text-xs font-medium whitespace-nowrap ml-2">
                      {exp.startDate}
                      {exp.endDate ? ` – ${exp.endDate}` : ""}
                    </span>
                  )}
                </div>
                {exp.description && (
                  <p className="text-slate-500 leading-relaxed text-xs">
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {hasEducation && (
          <div className="space-y-3">
            <h3 className="text-slate-950 font-bold border-b border-slate-200 pb-1 text-xs uppercase tracking-wider">
              Education
            </h3>
            {data.education.map((edu, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-slate-900 text-sm">
                    {edu.degree || "Degree"}
                  </span>
                  {edu.graduationDate && (
                    <span className="text-slate-400 text-xs font-medium whitespace-nowrap ml-2">
                      {edu.graduationDate}
                    </span>
                  )}
                </div>
                {edu.school && (
                  <p className="text-slate-500 text-xs">{edu.school}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {hasProjects && (
          <div className="space-y-3">
            <h3 className="text-slate-950 font-bold border-b border-slate-200 pb-1 text-xs uppercase tracking-wider">
              Projects
            </h3>
            {data.projects.map((proj, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-slate-900 text-sm">
                    {proj.title || "Project"}
                  </span>
                  {proj.link && (
                    <span className="text-cyan-600 text-xs truncate max-w-[200px]">
                      {proj.link}
                    </span>
                  )}
                </div>
                {proj.description && (
                  <p className="text-slate-500 leading-relaxed text-xs">
                    {proj.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── BLUE PROFESSIONAL (sidebar + main) ──
  if (templateId === "buleProfessionla") {
    return (
      <div className="font-sans text-left flex min-h-full -m-8">
        {/* Blue Sidebar */}
        <div className="w-[34%] bg-gradient-to-b from-[#143b77] to-[#0d2c5d] text-white p-8 space-y-6">
          {/* Profile placeholder */}
          <div className="w-32 h-36 bg-blue-200/20 border-4 border-white/15 mx-auto mb-4" />

          {/* Contact */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold uppercase border-b border-white/20 pb-1.5 tracking-wider">
              Contact
            </h3>
            <div className="space-y-2 text-xs text-white/90">
              {data.location && <p> {data.location}</p>}
              {data.phone && <p> {data.phone}</p>}
              {data.email && <p>{data.email}</p>}
            </div>
          </div>

          {/* Summary */}
          {data.summary && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold uppercase border-b border-white/20 pb-1.5 tracking-wider">
                Summary
              </h3>
              <p className="text-xs text-white/85 leading-relaxed">
                {data.summary}
              </p>
            </div>
          )}

          {/* Skills */}
          {skillsArr.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold uppercase border-b border-white/20 pb-1.5 tracking-wider">
                Skills
              </h3>
              <ul className="space-y-1 text-xs text-white/85 list-disc pl-4">
                {skillsArr.map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="w-[66%] p-10 bg-white space-y-6">
          <h2 className="text-4xl font-extrabold text-[#18468d] leading-tight">
            {data.fullName || "Your Full Name"}
          </h2>

          {/* Experience */}
          {hasExperience && (
            <div className="space-y-3">
              <h3 className="text-lg font-bold uppercase border-b-2 border-[#1d4f9a] pb-1 text-slate-900">
                Experience
              </h3>
              {data.experience.map((exp, idx) => (
                <div key={idx} className="space-y-1">
                  <p className="font-bold text-sm text-slate-900">
                    {exp.role}
                    {exp.company ? ` — ${exp.company}` : ""}
                  </p>
                  {(exp.startDate || exp.endDate) && (
                    <p className="text-xs text-slate-400">
                      {exp.startDate}
                      {exp.endDate ? ` – ${exp.endDate}` : ""}
                    </p>
                  )}
                  {exp.description && (
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Education */}
          {hasEducation && (
            <div className="space-y-3">
              <h3 className="text-lg font-bold uppercase border-b-2 border-[#1d4f9a] pb-1 text-slate-900">
                Education
              </h3>
              {data.education.map((edu, idx) => (
                <div key={idx} className="space-y-0.5">
                  <p className="font-bold text-sm text-slate-900">
                    {edu.degree}
                  </p>
                  {edu.school && (
                    <p className="text-xs text-slate-500">{edu.school}</p>
                  )}
                  {edu.graduationDate && (
                    <p className="text-xs text-slate-400">
                      {edu.graduationDate}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Projects */}
          {hasProjects && (
            <div className="space-y-3">
              <h3 className="text-lg font-bold uppercase border-b-2 border-[#1d4f9a] pb-1 text-slate-900">
                Projects
              </h3>
              {data.projects.map((proj, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-sm text-slate-900">
                      {proj.title}
                    </span>
                    {proj.link && (
                      <span className="text-xs text-[#18468d] truncate max-w-[200px]">
                        {proj.link}
                      </span>
                    )}
                  </div>
                  {proj.description && (
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {proj.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── EXECUTIVE / MODERN (two-column) ──
  if (templateId === "executive" || templateId === "modern") {
    return (
      <div className="font-sans text-slate-800 text-left">
        {/* Header */}
        <div className="border-b-4 border-slate-800 pb-4 mb-6">
          <h2 className="text-3xl font-extrabold text-slate-950 tracking-tight leading-tight">
            {data.fullName || "Your Full Name"}
          </h2>
          <p className="text-indigo-600 font-bold text-sm tracking-wide uppercase mt-1">
            {data.jobTitle || "Your Professional Title"}
          </p>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="col-span-4 border-r border-slate-200 pr-4 space-y-5">
            {/* Contact */}
            <div className="space-y-1.5">
              <h3 className="text-indigo-600 font-extrabold text-xs uppercase tracking-wider">
                Contact
              </h3>
              <ul className="space-y-1.5 text-slate-500 text-xs break-all leading-snug font-medium">
                {data.email && <li>{data.email}</li>}
                {data.phone && <li>{data.phone}</li>}
                {data.location && <li>{data.location}</li>}
              </ul>
            </div>

            {/* Skills */}
            {skillsArr.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-indigo-600 font-extrabold text-xs uppercase tracking-wider">
                  Skills
                </h3>
                <div className="flex flex-col gap-1.5">
                  {skillsArr.map((s, idx) => (
                    <span
                      key={idx}
                      className="bg-slate-100 text-slate-700 font-semibold px-2.5 py-1 rounded text-xs text-center border border-slate-200"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {hasEducation && (
              <div className="space-y-2">
                <h3 className="text-indigo-600 font-extrabold text-xs uppercase tracking-wider">
                  Education
                </h3>
                {data.education.map((edu, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <p className="font-bold text-slate-900 text-xs">
                      {edu.degree}
                    </p>
                    <p className="text-slate-500 text-xs">{edu.school}</p>
                    {edu.graduationDate && (
                      <p className="text-slate-400 text-[11px]">
                        {edu.graduationDate}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Main */}
          <div className="col-span-8 space-y-5">
            {/* Summary */}
            {data.summary && (
              <div className="space-y-1.5">
                <h3 className="text-slate-900 font-extrabold text-xs uppercase tracking-wider border-b border-indigo-600/30 pb-1">
                  Profile
                </h3>
                <p className="text-slate-500 leading-relaxed text-sm">
                  {data.summary}
                </p>
              </div>
            )}

            {/* Experience */}
            {hasExperience && (
              <div className="space-y-3">
                <h3 className="text-slate-900 font-extrabold text-xs uppercase tracking-wider border-b border-indigo-600/30 pb-1">
                  Experience
                </h3>
                {data.experience.map((exp, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-baseline">
                      <p className="font-bold text-slate-950 text-sm">
                        {exp.role} —{" "}
                        <span className="text-indigo-600 font-semibold">
                          {exp.company}
                        </span>
                      </p>
                      {(exp.startDate || exp.endDate) && (
                        <span className="text-slate-400 text-[11px] whitespace-nowrap ml-2">
                          {exp.startDate}
                          {exp.endDate ? ` – ${exp.endDate}` : ""}
                        </span>
                      )}
                    </div>
                    {exp.description && (
                      <p className="text-slate-500 leading-relaxed text-xs">
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Projects */}
            {hasProjects && (
              <div className="space-y-3">
                <h3 className="text-slate-900 font-extrabold text-xs uppercase tracking-wider border-b border-indigo-600/30 pb-1">
                  Projects
                </h3>
                {data.projects.map((proj, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-slate-950 text-sm">
                        {proj.title}
                      </span>
                      {proj.link && (
                        <span className="text-indigo-500 text-xs truncate max-w-[200px]">
                          {proj.link}
                        </span>
                      )}
                    </div>
                    {proj.description && (
                      <p className="text-slate-500 leading-relaxed text-xs">
                        {proj.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── DEVELOPER DARK THEME (creative_developer, saas_glass, tech_portfolio, default) ──
  return (
    <div className="font-sans text-slate-300 bg-slate-950 p-8 -m-8 min-h-[105%] text-left">
      <div className="space-y-5">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white leading-tight">
            {data.fullName || "Your Full Name"}
          </h2>
          <p className="text-cyan-400 font-bold text-sm uppercase tracking-widest mt-2">
            {data.jobTitle || "Your Professional Title"}
          </p>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-slate-500 text-xs font-mono mt-2 uppercase">
            {data.email && <span>{data.email}</span>}
            {data.phone && <span>· {data.phone}</span>}
            {data.location && <span>· {data.location}</span>}
          </div>
        </div>

        {/* Summary */}
        {data.summary && (
          <div className="space-y-1.5 border-t border-slate-800 pt-4">
            <p className="text-xs font-mono text-cyan-500/60 uppercase tracking-widest">
              // SUMMARY
            </p>
            <p className="text-slate-400 leading-relaxed text-sm">
              {data.summary}
            </p>
          </div>
        )}

        {/* Skills */}
        {skillsArr.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-mono text-cyan-500/60 uppercase tracking-widest">
              // SKILLS
            </p>
            <div className="flex flex-wrap gap-1.5">
              {skillsArr.map((s, idx) => (
                <span
                  key={idx}
                  className="bg-slate-900 text-cyan-400 font-mono px-2.5 py-1 rounded border border-slate-800 text-xs"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {hasExperience && (
          <div className="space-y-3">
            <p className="text-xs font-mono text-cyan-500/60 uppercase tracking-widest">
              // EXPERIENCE
            </p>
            {data.experience.map((exp, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between items-baseline">
                  <p className="font-bold text-white text-sm">
                    {exp.role}{" "}
                    <span className="text-cyan-400">@ {exp.company}</span>
                  </p>
                  {(exp.startDate || exp.endDate) && (
                    <span className="text-slate-600 text-[11px] font-mono whitespace-nowrap ml-2">
                      {exp.startDate}
                      {exp.endDate ? ` – ${exp.endDate}` : ""}
                    </span>
                  )}
                </div>
                {exp.description && (
                  <p className="text-slate-400 leading-relaxed text-xs">
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {hasEducation && (
          <div className="space-y-3">
            <p className="text-xs font-mono text-cyan-500/60 uppercase tracking-widest">
              // EDUCATION
            </p>
            {data.education.map((edu, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-baseline">
                  <p className="font-bold text-white text-sm">{edu.degree}</p>
                  {edu.graduationDate && (
                    <span className="text-slate-600 text-[11px] font-mono whitespace-nowrap ml-2">
                      {edu.graduationDate}
                    </span>
                  )}
                </div>
                {edu.school && (
                  <p className="text-slate-500 text-xs">{edu.school}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {hasProjects && (
          <div className="space-y-3">
            <p className="text-xs font-mono text-cyan-500/60 uppercase tracking-widest">
              // PROJECTS
            </p>
            {data.projects.map((proj, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-white text-sm">
                    {proj.title}
                  </span>
                  {proj.link && (
                    <span className="text-cyan-400/70 text-xs font-mono truncate max-w-[250px]">
                      {proj.link}
                    </span>
                  )}
                </div>
                {proj.description && (
                  <p className="text-slate-400 leading-relaxed text-xs">
                    {proj.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResumePage() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  // Redux Selectors
  const { user } = useAppselector((state) => state.mainstore);
  const { templates, userResumes, isResumeLoading } = useAppselector(
    (state) => state.mainstore,
  );

  // Local Component State
  const [step, setStep] = useState("templates"); // 'templates' | 'builder' | 'list'
  const [formData, setFormData] = useState(INITIAL_RESUME_STATE);
  const [activeTab, setActiveTab] = useState("personal"); // 'personal' | 'experience' | 'education' | 'skills' | 'projects'
  const [isDownloading, setIsDownloading] = useState(false);

  // Load user data on mount
  useEffect(() => {
    dispatch(fetchTemplates());
    if (user) {
      dispatch(fetchUserResumes());
    }
  }, [dispatch, user]);

  // Sync Form Data when current resume changes
  const handleSelectResume = (resume) => {
    setFormData({
      id: resume._id,
      fullName: resume.fullName || resume.user?.name || user?.name || "",
      jobTitle: resume.title || "",
      email: resume.email || resume.user?.email || user?.email || "",
      phone: resume.phone || resume.user?.phone || user?.phone || "",
      location: resume.location || resume.user?.location || user?.location || "",
      summary: resume.summary || "",
      experience: resume.experience?.map((e) => ({
        company: e.company || "",
        role: e.position || "",
        startDate: e.startDate || "",
        endDate: e.endDate || "",
        description: e.description || "",
      })) || [
        { company: "", role: "", startDate: "", endDate: "", description: "" },
      ],
      education: resume.education?.map((edu) => ({
        school: edu.institute || "",
        degree: edu.degree || "",
        graduationDate: edu.endYear || "",
      })) || [{ school: "", degree: "", graduationDate: "" }],
      projects: resume.projects?.map((p) => ({
        title: p.title || "",
        link: p.githubLink || "",
        description: p.description || "",
      })) || [{ title: "", link: "", description: "" }],
      skills: Array.isArray(resume.skills)
        ? resume.skills.join(", ")
        : resume.skills || "",
      templateId: resume.template || "classic",
    });
    setStep("builder");
  };

  // Start fresh resume creation
  const handleSelectTemplate = async (templateId) => {
    if (!user) {
      const result = await Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "Please login to your account to use this resume template.",
        background: "#081120",
        confirmButtonText: "Login",
        showCancelButton: true,
        cancelButtonText: "Cancel",
        color: "#fff",
        confirmButtonColor: "#06b6d4",
        cancelButtonColor: "#1e293b",
      });

      if (result.isConfirmed) {
        router.push("/login");
      }
      return;
    }

    setFormData({
      ...INITIAL_RESUME_STATE,
      fullName: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      location: user?.location || "",
      summary: user?.bio || "",
      skills: user?.skills?.join(", ") || "",
      templateId: templateId,
    });
    setStep("builder");
  };

  // Dynamic template rendering list
  const templatesList =
    templates && templates.length > 0 ? templates : FALLBACK_TEMPLATES;

  // Live preview interactive profile data
  const previewData = {
    fullName: formData.fullName || user?.name || "Alex Johnson",
    jobTitle: formData.jobTitle || "Full Stack Software Engineer",
    email: formData.email || user?.email || "alex@email.com",
    phone: formData.phone || user?.phone || "+1 (555) 019-2834",
    location: formData.location || user?.location || "San Francisco, CA",
    summary:
      formData.summary ||
      user?.bio ||
      "Passionate software engineer with 5+ years of experience designing, building, and deploying highly scalable cloud applications.",
    skills:
      formData.skills ||
      user?.skills?.join(", ") ||
      "React, Next.js, Node.js, JavaScript, TypeScript, MongoDB, Docker, AWS",
    experience: formData.experience || [
      {
        company: "TechCorp Inc.",
        role: "Senior Developer",
        startDate: "2023",
        endDate: "Present",
        description:
          "Led migration of legacy monolithic platform to high-performance microservices, reducing operational latency by 35%.",
      },
    ],
    education: formData.education || [
      {
        school: "Stanford University",
        degree: "M.S. in Computer Science",
        graduationDate: "2022",
      },
    ],
    projects: formData.projects || [
      {
        title: "E-Commerce API",
        link: "github.com",
        description:
          "Designed RESTful APIs using Node.js servicing 10,000+ requests daily.",
      },
    ],
  };

  // Form Field Updates
  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Array Updates (Experience, Education, Projects)
  const handleArrayFieldChange = (section, index, field, value) => {
    setFormData((prev) => {
      const updatedSection = [...prev[section]];
      updatedSection[index] = { ...updatedSection[index], [field]: value };
      return { ...prev, [section]: updatedSection };
    });
  };

  const addArrayItem = (section, schema) => {
    setFormData((prev) => ({
      ...prev,
      [section]: [...prev[section], schema],
    }));
  };

  const removeArrayItem = (section, index) => {
    setFormData((prev) => {
      const updatedSection = prev[section].filter((_, i) => i !== index);
      if (updatedSection.length === 0) {
        if (section === "experience")
          updatedSection.push({
            company: "",
            role: "",
            startDate: "",
            endDate: "",
            description: "",
          });
        if (section === "education")
          updatedSection.push({ school: "", degree: "", graduationDate: "" });
        if (section === "projects")
          updatedSection.push({ title: "", link: "", description: "" });
      }
      return { ...prev, [section]: updatedSection };
    });
  };

  // API - Save / Update (Converts to Backend DB Model Schema)
  const handleSaveResume = async () => {
    if (!formData.fullName || !formData.email) {
      toast.warning(
        "Please fill in at least your Full Name and Email Address.",
      );
      return;
    }

    const formattedSkills = formData.skills
      ? formData.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    // Map experience arrays to DB Model positions
    const formattedExperience = formData.experience.map((e) => ({
      company: e.company,
      position: e.role,
      startDate: e.startDate,
      endDate: e.endDate,
      description: e.description,
    }));

    // Map education arrays to DB Model institute details
    const formattedEducation = formData.education.map((e) => ({
      institute: e.school,
      degree: e.degree,
      fieldOfStudy: e.graduationDate ? "Degree Field" : "",
      startYear: "",
      endYear: e.graduationDate,
      grade: "",
    }));

    // Map projects to DB Model github links
    const formattedProjects = formData.projects.map((p) => ({
      title: p.title,
      description: p.description,
      githubLink: p.link,
      liveLink: "",
      technologies: [],
    }));

    // Construct backend payload
    const payload = {
      title: formData.jobTitle || "My Resume",
      summary: formData.summary || "Professional Profile Summary",
      skills: formattedSkills,
      experience: formattedExperience,
      education: formattedEducation,
      projects: formattedProjects,
      template: formData.templateId || "classic",
      fullName: formData.fullName || "",
      email: formData.email || "",
      phone: formData.phone || "",
      location: formData.location || "",
      linkedin: user?.linkedin || "",
      github: user?.github || "",
      portfolio: user?.portfolio || "",
    };

    try {
      if (formData.id) {
        await dispatch(
          updateUserResume({ id: formData.id, resumeData: payload }),
        ).unwrap();
        toast.success("Resume updated successfully!");
        dispatch(fetchUserResumes());
      } else {
        const res = await dispatch(createUserResume(payload)).unwrap();
        toast.success("Resume created successfully!");
        const newId = res?.data?._id || res?._id;
        if (newId) {
          setFormData((prev) => ({ ...prev, id: newId }));
        }
        dispatch(fetchUserResumes());
      }
    } catch (err) {
      toast.error(err?.message || "Failed to save resume");
    }
  };

  // API - Download PDF
  const handleDownloadPDF = async () => {
    if (!formData.id) {
      toast.warning("Please save your resume first before downloading.");
      return;
    }

    setIsDownloading(true);
    try {
      const response = await axiosInstance.get(
        `/resume/dowunload/${formData.id}`,
        {
          responseType: "blob",
        },
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `${formData.fullName.replace(/\s+/g, "_")}_Resume.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("PDF Downloaded successfully!");
    } catch (err) {
      console.warn("Direct blob download failed, trying fetch fallback...", err);
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/resume/dowunload/${formData.id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error("Failed to download");
        const blob = await response.blob();
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = `${formData.fullName.replace(/\s+/g, "_")}_Resume.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("PDF Downloaded successfully!");
      } catch (fallbackErr) {
        toast.error("Could not fetch the generated PDF file.");
      }
    } finally {
      setIsDownloading(false);
    }
  };

  // API - Delete
  const handleDeleteResume = async (id) => {
    if (confirm("Are you sure you want to delete this resume?")) {
      try {
        await dispatch(deleteUserResume(id)).unwrap();
        toast.success("Resume deleted successfully!");
        if (formData.id === id) {
          setFormData(INITIAL_RESUME_STATE);
          setStep("templates");
        }
      } catch (err) {
        toast.error(err?.message || "Failed to delete resume");
      }
    }
  };

  // Skeleton templates loader during data fetch
  if (isResumeLoading && templates.length === 0) {
    return (
      <div className="min-h-screen bg-[#020617] text-gray-200 py-10 px-4 pt-24">
        <div className="max-w-7xl mx-auto w-full space-y-6">
          <div className="h-10 w-48 bg-slate-800 animate-pulse rounded-xl" />
          <div className="h-4 w-96 bg-slate-900 animate-pulse rounded" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="glass border border-white/5 rounded-2xl p-5 space-y-4 bg-slate-900/20"
              >
                <div className="aspect-[4/5] w-full bg-slate-950/60 rounded-lg animate-pulse" />
                <div className="h-5 w-2/3 bg-slate-800 animate-pulse rounded" />
                <div className="h-3 w-full bg-slate-900 animate-pulse rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-gray-200 py-10 px-4 sm:px-6 lg:px-8 pt-24">
      <div className="max-w-7xl mx-auto w-full">
        {/* ── HEADER ─────────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/25 rounded-full px-3.5 py-1 mb-3">
              <HiSparkles size={13} className="text-purple-400" />
              <span className="text-purple-400 text-xs font-semibold">
                ATS-Friendly Templates
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Resume{" "}
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">
                Builder
              </span>
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Select layouts, fill technical details, and instantly download
              optimized resumes.
            </p>
          </div>

          <div className="flex gap-3">
            {step !== "templates" && (
              <button
                onClick={() => setStep("templates")}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-gray-300 text-sm font-semibold hover:bg-white/5 transition-all"
              >
                <FiArrowLeft size={16} /> Choose Template
              </button>
            )}
            {userResumes.length > 0 && step !== "list" && (
              <button
                onClick={() => setStep("list")}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 hover:border-white/20 text-gray-300 text-sm font-semibold hover:bg-slate-800 transition-all"
              >
                <FiFileText size={16} /> My Saved Resumes ({userResumes.length})
              </button>
            )}
          </div>
        </div>

        {/* ── STEP 1: COMPARATIVE TEMPLATE GRID ──────────────────────────────── */}
        {step === "templates" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            <div className="text-center max-w-xl mx-auto mb-10">
              <h2 className="text-2xl font-bold text-white mb-2">
                Instantly Preview & Choose Your Template
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                Review live layout previews with your actual details to pick the
                perfect fit.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {templatesList.map((tpl) => {
                const meta = getTemplateMeta(tpl.id);
                return (
                  <motion.div
                    key={tpl.id}
                    whileHover={{ scale: 1.03 }}
                    transition={{ duration: 0.3 }}
                    className="group relative flex flex-col justify-between rounded-2xl border border-white/8 bg-slate-900/35 p-5 hover:bg-slate-900/70 transition-all duration-300 hover:shadow-2xl shadow-black/50 cursor-pointer"
                  >
                    {/* Hover border neon glow */}
                    <div
                      className={`absolute -inset-px bg-gradient-to-br ${meta.bgColor} rounded-2xl opacity-0 blur-sm group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
                    />

                    <div className="relative z-10 space-y-4">
                      {/* Live visual scaled preview rendering */}
                      <div className="w-full aspect-[1/1.4] rounded-xl overflow-hidden bg-white border border-white/10 relative shadow-inner group-hover:shadow-2xl transition-all duration-500">
                        <div className="absolute top-0 left-0 w-[794px] h-[1123px] origin-top-left scale-[0.285] pointer-events-none text-slate-800 p-8 select-none bg-white">
                          <MiniResumePreview
                            templateId={tpl.id}
                            data={previewData}
                          />
                        </div>
                        {/* Shading overlay */}
                        <div className="absolute inset-0 bg-black/[0.02] group-hover:bg-transparent transition-colors duration-300 pointer-events-none" />
                      </div>

                      <div>
                        <h3 className="text-white font-bold text-base tracking-wide group-hover:text-cyan-400 transition-colors">
                          {meta.name}
                        </h3>
                        <p className="text-gray-500 text-xs mt-1.5 leading-relaxed">
                          {meta.desc}
                        </p>
                      </div>
                    </div>

                    <div className="relative z-10 mt-5 pt-4 border-t border-white/5">
                      <button
                        onClick={() => handleSelectTemplate(tpl.id)}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-xs hover:from-blue-500 hover:to-cyan-400 shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/25 transition-all duration-300"
                      >
                        <TbBolt size={14} /> Use Template
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ── STEP 2: SAVED RESUMES LIST ────────────────────────────────────── */}
        {step === "list" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-white">
                Your Saved Resumes
              </h2>
              <button
                onClick={() => setStep("templates")}
                className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-bold"
              >
                + Create New Resume
              </button>
            </div>

            {userResumes.length === 0 ? (
              <div className="text-center py-16 bg-slate-900/20 border border-white/5 rounded-2xl">
                <p className="text-gray-500">
                  No saved resumes found. Choose a template to create one.
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {userResumes.map((resume) => (
                  <div
                    key={resume._id}
                    className="glass border border-white/10 hover:border-white/20 rounded-2xl p-6 bg-slate-900/40 relative flex flex-col justify-between gap-6 transition-all duration-300 hover:y-[-2px]"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-4">
                        <h3 className="text-white font-bold text-lg truncate flex-1">
                          {resume.fullName || "Untitled Resume"}
                        </h3>
                        <span className="text-[10px] text-cyan-400 bg-cyan-400/10 border border-cyan-400/25 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                          {resume.template || "classic"}
                        </span>
                      </div>
                      <p className="text-cyan-400 text-xs font-semibold mt-0.5">
                        {resume.title || "Job Title Not Set"}
                      </p>
                      <p className="text-gray-500 text-[11px] mt-3 flex items-center gap-1.5">
                        <FiMail size={12} /> {resume.user?.email || user?.email}
                      </p>
                    </div>

                    <div className="flex gap-2.5 border-t border-white/5 pt-4">
                      <button
                        onClick={() => handleSelectResume(resume)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-white/10 text-xs font-bold text-gray-300 hover:bg-white/5 hover:text-white transition-all"
                      >
                        <FiEdit size={13} /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteResume(resume._id)}
                        className="p-2.5 rounded-xl border border-red-500/10 text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all"
                        aria-label="Delete Resume"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ── STEP 3: SPLIT SCREEN BUILDER ──────────────────────────────────── */}
        {step === "builder" && (
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* LEFT SIDE: FORM EDITOR PANEL (5/12 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Form Navigation Tabs */}
              <div className="flex flex-wrap gap-1.5 p-1 bg-slate-900/60 border border-white/5 rounded-2xl">
                {[
                  { id: "personal", label: "Personal", icon: FiUser },
                  { id: "experience", label: "Experience", icon: FiBriefcase },
                  { id: "education", label: "Education", icon: FiBookOpen },
                  { id: "projects", label: "Projects", icon: FiFolder },
                  { id: "skills", label: "Skills", icon: FiCode },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 flex-1 justify-center ${
                      activeTab === tab.id
                        ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/20"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <tab.icon size={13} />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Form Editor Details */}
              <div className="glass border border-white/10 rounded-3xl p-6 bg-slate-900/30">
                <AnimatePresence mode="wait">
                  {/* TAB 1: PERSONAL INFORMATION */}
                  {activeTab === "personal" && (
                    <motion.div
                      key="personal"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                    >
                      <h3 className="text-white font-bold text-base mb-2">
                        Personal Information
                      </h3>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs text-gray-400 font-medium">
                            Full Name
                          </label>
                          <input
                            type="text"
                            value={formData.fullName}
                            onChange={(e) =>
                              handleFieldChange("fullName", e.target.value)
                            }
                            placeholder="Alex Johnson"
                            className="bg-slate-950/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs text-gray-400 font-medium">
                            Professional Title
                          </label>
                          <input
                            type="text"
                            value={formData.jobTitle}
                            onChange={(e) =>
                              handleFieldChange("jobTitle", e.target.value)
                            }
                            placeholder="Full Stack Software Engineer"
                            className="bg-slate-950/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs text-gray-400 font-medium">
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                              handleFieldChange("email", e.target.value)
                            }
                            placeholder="alex@email.com"
                            className="bg-slate-950/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs text-gray-400 font-medium">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) =>
                              handleFieldChange("phone", e.target.value)
                            }
                            placeholder="+1 (555) 019-2834"
                            className="bg-slate-950/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs text-gray-400 font-medium">
                            Location
                          </label>
                          <input
                            type="text"
                            value={formData.location}
                            onChange={(e) =>
                              handleFieldChange("location", e.target.value)
                            }
                            placeholder="San Francisco, CA"
                            className="bg-slate-950/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-gray-400 font-medium">
                          Professional Summary
                        </label>
                        <textarea
                          rows={4}
                          value={formData.summary}
                          onChange={(e) =>
                            handleFieldChange("summary", e.target.value)
                          }
                          placeholder="Experienced software engineer with a track record of building reliable web applications and microservices..."
                          className="bg-slate-950/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 resize-none leading-relaxed"
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 2: WORK EXPERIENCE */}
                  {activeTab === "experience" && (
                    <motion.div
                      key="experience"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="text-white font-bold text-base">
                          Work Experience
                        </h3>
                        <button
                          type="button"
                          onClick={() =>
                            addArrayItem("experience", {
                              company: "",
                              role: "",
                              startDate: "",
                              endDate: "",
                              description: "",
                            })
                          }
                          className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                        >
                          <FiPlus /> Add Job
                        </button>
                      </div>

                      {formData.experience.map((exp, idx) => (
                        <div
                          key={idx}
                          className="border border-white/5 bg-slate-950/30 p-4 rounded-2xl relative space-y-4"
                        >
                          <button
                            type="button"
                            onClick={() => removeArrayItem("experience", idx)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-red-400 transition-colors"
                            aria-label="Remove job"
                          >
                            <FiTrash2 size={14} />
                          </button>

                          <p className="text-xs text-cyan-400 font-bold">
                            Job #{idx + 1}
                          </p>

                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs text-gray-400 font-medium">
                                Company Name
                              </label>
                              <input
                                type="text"
                                value={exp.company}
                                onChange={(e) =>
                                  handleArrayFieldChange(
                                    "experience",
                                    idx,
                                    "company",
                                    e.target.value,
                                  )
                                }
                                placeholder="TechCorp Inc."
                                className="bg-slate-950/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs text-gray-400 font-medium">
                                Job Role
                              </label>
                              <input
                                type="text"
                                value={exp.role}
                                onChange={(e) =>
                                  handleArrayFieldChange(
                                    "experience",
                                    idx,
                                    "role",
                                    e.target.value,
                                  )
                                }
                                placeholder="Senior Software Engineer"
                                className="bg-slate-950/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                              />
                            </div>
                          </div>

                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs text-gray-400 font-medium">
                                Start Date
                              </label>
                              <input
                                type="text"
                                value={exp.startDate}
                                onChange={(e) =>
                                  handleArrayFieldChange(
                                    "experience",
                                    idx,
                                    "startDate",
                                    e.target.value,
                                  )
                                }
                                placeholder="Jan 2023"
                                className="bg-slate-950/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs text-gray-400 font-medium">
                                End Date (or 'Present')
                              </label>
                              <input
                                type="text"
                                value={exp.endDate}
                                onChange={(e) =>
                                  handleArrayFieldChange(
                                    "experience",
                                    idx,
                                    "endDate",
                                    e.target.value,
                                  )
                                }
                                placeholder="Present"
                                className="bg-slate-950/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                              />
                            </div>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-gray-400 font-medium">
                              Responsibilities & Accomplishments
                            </label>
                            <textarea
                              rows={3}
                              value={exp.description}
                              onChange={(e) =>
                                handleArrayFieldChange(
                                  "experience",
                                  idx,
                                  "description",
                                  e.target.value,
                                )
                              }
                              placeholder="Led development of key features, reduced latency by 30%, mentored junior team members..."
                              className="bg-slate-950/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 resize-none leading-relaxed"
                            />
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {/* TAB 3: EDUCATION */}
                  {activeTab === "education" && (
                    <motion.div
                      key="education"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="text-white font-bold text-base">
                          Education Details
                        </h3>
                        <button
                          type="button"
                          onClick={() =>
                            addArrayItem("education", {
                              school: "",
                              degree: "",
                              graduationDate: "",
                            })
                          }
                          className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                        >
                          <FiPlus /> Add Education
                        </button>
                      </div>

                      {formData.education.map((edu, idx) => (
                        <div
                          key={idx}
                          className="border border-white/5 bg-slate-950/30 p-4 rounded-2xl relative space-y-4"
                        >
                          <button
                            type="button"
                            onClick={() => removeArrayItem("education", idx)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-red-400 transition-colors"
                            aria-label="Remove education"
                          >
                            <FiTrash2 size={14} />
                          </button>

                          <p className="text-xs text-cyan-400 font-bold">
                            Institution #{idx + 1}
                          </p>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-gray-400 font-medium">
                              School / University
                            </label>
                            <input
                              type="text"
                              value={edu.school}
                              onChange={(e) =>
                                handleArrayFieldChange(
                                  "education",
                                  idx,
                                  "school",
                                  e.target.value,
                                )
                              }
                              placeholder="Stanford University"
                              className="bg-slate-950/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                            />
                          </div>

                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs text-gray-400 font-medium">
                                Degree & Major
                              </label>
                              <input
                                type="text"
                                value={edu.degree}
                                onChange={(e) =>
                                  handleArrayFieldChange(
                                    "education",
                                    idx,
                                    "degree",
                                    e.target.value,
                                  )
                                }
                                placeholder="B.S. in Computer Science"
                                className="bg-slate-950/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs text-gray-400 font-medium">
                                Graduation Date
                              </label>
                              <input
                                type="text"
                                value={edu.graduationDate}
                                onChange={(e) =>
                                  handleArrayFieldChange(
                                    "education",
                                    idx,
                                    "graduationDate",
                                    e.target.value,
                                  )
                                }
                                placeholder="June 2022"
                                className="bg-slate-950/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {/* TAB 4: PROJECTS */}
                  {activeTab === "projects" && (
                    <motion.div
                      key="projects"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="text-white font-bold text-base">
                          Key Projects
                        </h3>
                        <button
                          type="button"
                          onClick={() =>
                            addArrayItem("projects", {
                              title: "",
                              link: "",
                              description: "",
                            })
                          }
                          className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                        >
                          <FiPlus /> Add Project
                        </button>
                      </div>

                      {formData.projects.map((proj, idx) => (
                        <div
                          key={idx}
                          className="border border-white/5 bg-slate-950/30 p-4 rounded-2xl relative space-y-4"
                        >
                          <button
                            type="button"
                            onClick={() => removeArrayItem("projects", idx)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-red-400 transition-colors"
                            aria-label="Remove project"
                          >
                            <FiTrash2 size={14} />
                          </button>

                          <p className="text-xs text-cyan-400 font-bold">
                            Project #{idx + 1}
                          </p>

                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs text-gray-400 font-medium">
                                Project Title
                              </label>
                              <input
                                type="text"
                                value={proj.title}
                                onChange={(e) =>
                                  handleArrayFieldChange(
                                    "projects",
                                    idx,
                                    "title",
                                    e.target.value,
                                  )
                                }
                                placeholder="E-Commerce API Service"
                                className="bg-slate-950/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs text-gray-400 font-medium">
                                Project Link (Optional)
                              </label>
                              <input
                                type="url"
                                value={proj.link}
                                onChange={(e) =>
                                  handleArrayFieldChange(
                                    "projects",
                                    idx,
                                    "link",
                                    e.target.value,
                                  )
                                }
                                placeholder="https://github.com/..."
                                className="bg-slate-950/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                              />
                            </div>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-gray-400 font-medium">
                              Project Description
                            </label>
                            <textarea
                              rows={2}
                              value={proj.description}
                              onChange={(e) =>
                                handleArrayFieldChange(
                                  "projects",
                                  idx,
                                  "description",
                                  e.target.value,
                                )
                              }
                              placeholder="Built a highly concurrent ordering system using Node.js and MongoDB, handling 500 requests per second."
                              className="bg-slate-950/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 resize-none leading-relaxed"
                            />
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {/* TAB 5: SKILLS */}
                  {activeTab === "skills" && (
                    <motion.div
                      key="skills"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                    >
                      <h3 className="text-white font-bold text-base mb-2">
                        Technical Skills
                      </h3>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-gray-400 font-medium">
                          Skills (Comma-separated)
                        </label>
                        <textarea
                          rows={5}
                          value={formData.skills}
                          onChange={(e) =>
                            handleFieldChange("skills", e.target.value)
                          }
                          placeholder="React, Next.js, Node.js, JavaScript, TypeScript, Python, MongoDB, SQL, Docker, AWS"
                          className="bg-slate-950/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 resize-none leading-relaxed"
                        />
                        <p className="text-[11px] text-gray-500 mt-1">
                          Separate each technology or skill with a comma to
                          render them as nice tags in your final resume.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Save / Sync Controls */}
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleSaveResume}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-sm hover:from-blue-500 hover:to-cyan-400 shadow-xl shadow-cyan-500/10 hover:shadow-cyan-500/25 transition-all duration-300"
                >
                  <FiSave size={16} />{" "}
                  {formData.id ? "Update Resume" : "Save Resume"}
                </button>

                {formData.id && (
                  <button
                    type="button"
                    disabled={isDownloading}
                    onClick={handleDownloadPDF}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-white/15 hover:border-white/30 text-gray-300 text-sm font-semibold hover:bg-white/5 transition-all disabled:opacity-50"
                  >
                    {isDownloading ? (
                      <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FiDownload size={16} />
                    )}
                    Export PDF
                  </button>
                )}
              </div>
            </div>

            {/* RIGHT SIDE: LIVE INTERACTIVE PREVIEW PANEL (7/12 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                  Live Document Preview
                </p>
                <div className="flex gap-1.5 bg-slate-900/60 border border-white/5 p-1 rounded-xl">
                  {templatesList.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleFieldChange("templateId", t.id)}
                      className={`px-2.5 py-1 text-[10px] rounded-lg font-bold transition-all ${
                        formData.templateId === t.id
                          ? "bg-white/10 text-white border border-white/10"
                          : "text-gray-500 hover:text-gray-300"
                      }`}
                    >
                      {t.id.split("_")[0].toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* RENDER FULL INTERACTIVE PREVIEW SHEET */}
              <div className="glass border border-white/10 rounded-3xl overflow-hidden bg-slate-950/40 p-1">
                <div className="w-full aspect-[1/1.4] overflow-y-auto bg-white text-slate-900 p-8 rounded-2xl shadow-2xl relative select-none">
                  <FullResumePreview
                    templateId={formData.templateId}
                    data={previewData}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
