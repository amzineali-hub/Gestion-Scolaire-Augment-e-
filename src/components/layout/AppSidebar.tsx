import React from "react";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  School,
  Calendar,
  QrCode,
  DollarSign,
  MessageSquare,
  Settings,
  ChevronRight,
  Globe,
  LogOut,
} from "lucide-react";
import { Student } from "../../types";

interface AppSidebarProps {
  lang: "fr" | "ar";
  setLang: (lang: "fr" | "ar") => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  activeTab: string;
  navigateToTab: (tab: string) => void;
  userRole: string | null;
  switchRole: (role: string) => void;
  logout: () => void;
  students: Student[];
  t: (key: string) => string;
}

export default function AppSidebar({
  lang,
  setLang,
  mobileMenuOpen,
  setMobileMenuOpen,
  activeTab,
  navigateToTab,
  userRole,
  switchRole,
  logout,
  students,
  t,
}: AppSidebarProps) {
  return (
    <>
      {/* Mobile Menu Backdrop Mask */}
      {mobileMenuOpen && (
        <button
          type="button"
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300 w-full h-full text-left cursor-default outline-none animate-fade-in"
          aria-label="Fermer le menu"
        />
      )}

      {/* SIDEBAR NAVIGATION */}
      <nav
        className={`
        print:hidden
        fixed lg:sticky top-14 lg:top-20 h-[calc(100dvh-3.5rem)] lg:h-[calc(100vh-5rem)] z-50 bg-white
        w-64 max-w-[85vw] flex flex-col
        transition-transform duration-300 ease-in-out shrink-0 shadow-2xl lg:shadow-none
        ${
          lang === "ar"
            ? `right-0 border-l border-slate-150 lg:translate-x-0 ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"}`
            : `left-0 border-r border-slate-150 lg:translate-x-0 ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`
        }
      `}
      >
        <div className="flex-1 overflow-y-auto p-4 space-y-4 sm:space-y-6">
          <span className="text-[10px] font-bold text-black uppercase tracking-widest block px-3 font-display">
            {t("main_menu")}
          </span>

          <div className="space-y-2">
            {/* Dashboard */}
            <button
              onClick={() => navigateToTab("dashboard")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-200 ${
                activeTab === "dashboard"
                  ? "bg-gradient-to-r from-indigo-600 to-teal-500 text-white shadow-lg shadow-indigo-200/50 scale-[1.02]"
                  : "text-black hover:bg-slate-50 hover:text-slate-900 hover:translate-x-1"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <LayoutDashboard className="h-4 w-4" /> {t("dashboard")}
              </span>
              <ChevronRight
                className={`h-3 w-3 opacity-60 transition-transform ${activeTab === "dashboard" ? "translate-x-0.5" : ""}`}
              />
            </button>

            {/* Bulletins */}
            <button
              onClick={() => navigateToTab("bulletins")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-200 ${
                activeTab === "bulletins"
                  ? "bg-gradient-to-r from-indigo-600 to-teal-500 text-white shadow-lg shadow-indigo-200/50 scale-[1.02]"
                  : "text-black hover:bg-slate-50 hover:text-slate-900 hover:translate-x-1"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <LayoutDashboard className="h-4 w-4" /> Bulletins
              </span>
              <ChevronRight
                className={`h-3 w-3 opacity-60 transition-transform ${activeTab === "bulletins" ? "translate-x-0.5" : ""}`}
              />
            </button>

            {/* Students */}
            <button
              onClick={() => navigateToTab("students")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-200 ${
                activeTab === "students"
                  ? "bg-gradient-to-r from-indigo-600 to-teal-500 text-white shadow-lg shadow-indigo-200/50 scale-[1.02]"
                  : "text-black hover:bg-slate-50 hover:text-slate-900 hover:translate-x-1"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Users className="h-4 w-4" /> {t("students")} ({students.length}
                )
              </span>
              <ChevronRight
                className={`h-3 w-3 opacity-60 transition-transform ${activeTab === "students" ? "translate-x-0.5" : ""}`}
              />
            </button>

            {/* Teachers */}
            <button
              onClick={() => navigateToTab("teachers")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-200 ${
                activeTab === "teachers"
                  ? "bg-gradient-to-r from-indigo-600 to-teal-500 text-white shadow-lg shadow-indigo-200/50 scale-[1.02]"
                  : "text-black hover:bg-slate-50 hover:text-slate-900 hover:translate-x-1"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <GraduationCap className="h-4 w-4" /> {t("teachers")}
              </span>
              <ChevronRight
                className={`h-3 w-3 opacity-60 transition-transform ${activeTab === "teachers" ? "translate-x-0.5" : ""}`}
              />
            </button>

            {/* Classes & Subjects */}
            <button
              onClick={() => navigateToTab("classes")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-200 ${
                activeTab === "classes"
                  ? "bg-gradient-to-r from-indigo-600 to-teal-500 text-white shadow-lg shadow-indigo-200/50 scale-[1.02]"
                  : "text-black hover:bg-slate-50 hover:text-slate-900 hover:translate-x-1"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <School className="h-4 w-4" /> {t("classes")}
              </span>
              <ChevronRight
                className={`h-3 w-3 opacity-60 transition-transform ${activeTab === "classes" ? "translate-x-0.5" : ""}`}
              />
            </button>

            {/* Schedule */}
            <button
              onClick={() => navigateToTab("schedules")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-200 ${
                activeTab === "schedules"
                  ? "bg-gradient-to-r from-indigo-600 to-teal-500 text-white shadow-lg shadow-indigo-200/50 scale-[1.02]"
                  : "text-black hover:bg-slate-50 hover:text-slate-900 hover:translate-x-1"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Calendar className="h-4 w-4" /> {t("schedules")}
              </span>
              <ChevronRight
                className={`h-3 w-3 opacity-60 transition-transform ${activeTab === "schedules" ? "translate-x-0.5" : ""}`}
              />
            </button>

            {/* Attendance */}
            <button
              onClick={() => navigateToTab("attendance")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-200 ${
                activeTab === "attendance"
                  ? "bg-gradient-to-r from-indigo-600 to-teal-500 text-white shadow-lg shadow-indigo-200/50 scale-[1.02]"
                  : "text-black hover:bg-slate-50 hover:text-slate-900 hover:translate-x-1"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <QrCode className="h-4 w-4" /> {t("attendance")}
              </span>
              <ChevronRight
                className={`h-3 w-3 opacity-60 transition-transform ${activeTab === "attendance" ? "translate-x-0.5" : ""}`}
              />
            </button>

            {/* Financials / Invoices */}
            <button
              onClick={() => navigateToTab("financials")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-200 ${
                activeTab === "financials"
                  ? "bg-gradient-to-r from-indigo-600 to-teal-500 text-white shadow-lg shadow-indigo-200/50 scale-[1.02]"
                  : "text-black hover:bg-slate-50 hover:text-slate-900 hover:translate-x-1"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <DollarSign className="h-4 w-4" /> {t("financials")}
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                  activeTab === "financials"
                    ? "bg-white/20 text-white border-white/20"
                    : "bg-rose-50 text-rose-700 border-rose-100"
                }`}
              >
                {students.filter((s) => s.outstandingBalance > 0).length}{" "}
                {t("active_invoices")}
              </span>
            </button>

            {/* Communication Parentale */}
            <button
              onClick={() => navigateToTab("communicator")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-200 ${
                activeTab === "communicator"
                  ? "bg-gradient-to-r from-indigo-600 to-teal-500 text-white shadow-lg shadow-indigo-200/50 scale-[1.02]"
                  : "text-black hover:bg-slate-50 hover:text-slate-900 hover:translate-x-1"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <MessageSquare className="h-4 w-4" /> {t("communicator")}
              </span>
              <ChevronRight
                className={`h-3 w-3 opacity-60 transition-transform ${activeTab === "communicator" ? "translate-x-0.5" : ""}`}
              />
            </button>

            {/* Options & Config */}
            <button
              onClick={() => navigateToTab("settings")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-200 ${
                activeTab === "settings"
                  ? "bg-gradient-to-r from-indigo-600 to-teal-500 text-white shadow-lg shadow-indigo-200/50 scale-[1.02]"
                  : "text-black hover:bg-slate-50 hover:text-slate-900 hover:translate-x-1"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Settings className="h-4 w-4" /> {t("settings")}
              </span>
              <ChevronRight
                className={`h-3 w-3 opacity-60 transition-transform ${activeTab === "settings" ? "translate-x-0.5" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* Quick legal Footer in navigation rail */}
        <div className="p-4 border-t border-slate-150 bg-slate-50/50 shrink-0 mt-auto pb-24 lg:pb-4 space-y-3">
          {/* Lang & Logout visible ONLY on mobile/tablets (hidden lg:) */}
          <div className="flex flex-col gap-2 lg:hidden">
            <div className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-[10px] font-bold text-slate-500 uppercase">
                Rôle:
              </span>
              <select
                value={userRole || "admin"}
                onChange={(e) => switchRole(e.target.value as any)}
                className="bg-transparent text-xs font-bold text-indigo-700 focus:outline-none cursor-pointer text-right"
              >
                <option value="admin">Admin</option>
                <option value="secretariat">Secrétariat</option>
                <option value="enseignant">Enseignant</option>
                <option value="parent">Parent</option>
              </select>
            </div>

            <button
              onClick={() => {
                const next = lang === "fr" ? "ar" : "fr";
                setLang(next);
                localStorage.setItem("madrasati_lang", next);
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/50 text-xs font-extrabold text-slate-700 transition"
            >
              <span className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-indigo-600 animate-pulse" />
                {lang === "fr" ? "Changer en Arabe" : "Changer en Français"}
              </span>
              <span className="bg-white px-2 py-0.5 rounded text-[10px] uppercase border font-mono">
                {lang === "fr" ? "AR" : "FR"}
              </span>
            </button>

            <button
              onClick={() => logout()}
              className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-rose-150 bg-rose-50/50 hover:bg-rose-100 text-xs font-extrabold text-rose-600 transition"
            >
              <LogOut className="h-4 w-4 text-rose-500 animate-pulse" />
              Déconnexion
            </button>
          </div>

          <div className="bg-slate-50 border border-slate-150 p-3 rounded-xl">
            <span className="text-[10px] font-bold text-slate-700 block uppercase">
              {t("assistance")}
            </span>
            <p className="text-[9px] text-black mt-1 leading-relaxed">
              {t("assistance_desc")}
            </p>
          </div>
        </div>
      </nav>
    </>
  );
}
