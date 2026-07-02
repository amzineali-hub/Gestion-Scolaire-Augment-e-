import React from "react";
import {
  Search,
  Compass,
  LayoutDashboard,
  Users,
  GraduationCap,
  School,
  Calendar,
  QrCode,
  DollarSign,
  MessageSquare,
  Settings,
  Cloud,
  LogOut,
  Globe,
  Menu,
  X,
} from "lucide-react";
import { Student, Teacher, Class, Subject } from "../../types";

interface AppHeaderProps {
  lang: "fr" | "ar";
  setLang: (lang: "fr" | "ar") => void;
  schoolName: string;
  schoolCity: string;
  schoolLogo: string;
  loadingInitial: boolean;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  userRole: string | null;
  switchRole: (role: string) => void;
  logout: () => void;
  setActiveTab: (tab: string) => void;
  navigateToTab: (tab: string) => void;
  t: (key: string) => string;

  globalSearchInput: string;
  setGlobalSearchInput: (val: string) => void;
  isSearchFocused: boolean;
  setIsSearchFocused: (val: boolean) => void;
  hasSearchResults: boolean;
  searchResults: any;
  setStudentSearchPreset: (val: string) => void;
  setTeacherSearchPreset: (val: string) => void;
  setClassSearchPreset: (val: string) => void;
  classes: Class[];
  subjects: Subject[];
}

export default function AppHeader({
  lang,
  setLang,
  schoolName,
  schoolCity,
  schoolLogo,
  loadingInitial,
  mobileMenuOpen,
  setMobileMenuOpen,
  userRole,
  switchRole,
  logout,
  setActiveTab,
  navigateToTab,
  t,
  globalSearchInput,
  setGlobalSearchInput,
  isSearchFocused,
  setIsSearchFocused,
  hasSearchResults,
  searchResults,
  setStudentSearchPreset,
  setTeacherSearchPreset,
  setClassSearchPreset,
  classes,
  subjects,
}: AppHeaderProps) {
  return (
    <header className="print:hidden bg-white border-b border-slate-150 py-3 sm:h-20 shrink-0 flex flex-wrap sm:flex-nowrap items-center justify-between px-3 md:px-6 sticky top-0 z-40 w-full gap-3">
      {/* Left side: Logo & Name */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
        {/* Logo element */}
        <div
          className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 rounded-xl flex items-center justify-center overflow-hidden bg-[#0d2a4a] border border-slate-200/80 shadow-md shrink-0 group relative cursor-pointer transition-all hover:scale-[1.05] active:scale-[0.98] hover:ring-4 hover:ring-indigo-200/50"
          onClick={() => setActiveTab("settings")}
          title="Gérer le logo de l'établissement"
        >
          {schoolLogo ? (
            <img
              src={schoolLogo}
              alt="Logo École"
              className="h-full w-full object-contain"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-tr from-indigo-600 to-teal-500 flex items-center justify-center text-white font-black text-xl">
              M
            </div>
          )}
        </div>
        <div className="hidden xs:block min-w-0">
          <h1 className="font-extrabold text-slate-850 tracking-tight text-sm sm:text-base leading-tight flex items-center gap-2 font-sans truncate">
            <span className="truncate">{schoolName.toUpperCase()}</span>
            <span className="hidden md:inline-block text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-bold border border-indigo-100 uppercase shrink-0">
              SAAS
            </span>
            <span className="hidden xl:inline-flex items-center gap-1 text-[9px] bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded-lg font-black border border-emerald-200/80 shrink-0 shadow-xs">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <Cloud className="h-2.5 w-2.5 text-emerald-600 shrink-0" />
              <span className="tracking-wide uppercase">
                {loadingInitial ? "SYNCHRONISATION..." : "EN LIGNE"}
              </span>
            </span>
          </h1>
          <p className="text-[10px] text-black mt-0.5 font-medium truncate">
            {t("school_portal")}
          </p>
        </div>
      </div>

      {/* Global Search Bar & Role Box */}
      <div className="flex flex-1 items-center justify-center gap-1.5 sm:gap-2 mx-1 sm:mx-2 min-w-0 order-3 sm:order-none w-full sm:w-auto mt-2 sm:mt-0">
        <div className="relative flex-1 max-w-[220px] min-w-[100px]">
          <div className="relative">
            <Search className="absolute left-2 sm:left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-black" />
            <input
              type="text"
              value={globalSearchInput}
              onChange={(e) => {
                setGlobalSearchInput(e.target.value);
                setIsSearchFocused(true);
              }}
              onFocus={() => setIsSearchFocused(true)}
              placeholder={lang === "fr" ? "Recherche..." : "بحث..."}
              className="w-full bg-slate-50 border border-slate-200 rounded-full pl-7 sm:pl-9 pr-6 sm:pr-8 py-1.5 sm:py-2 text-[10px] sm:text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
            />
            {globalSearchInput && (
              <button
                onClick={() => {
                  setGlobalSearchInput("");
                  setIsSearchFocused(false);
                }}
                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-black hover:text-black font-sans text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Search Dropdown / Popover Results */}
          {isSearchFocused && globalSearchInput.trim() && (
            <>
              {/* Overlay Backdrop to close search */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsSearchFocused(false)}
              />

              <div className="absolute top-full left-0 mt-2 w-[280px] sm:w-[350px] bg-white rounded-2xl border border-slate-150 shadow-2xl overflow-hidden z-50 max-h-[480px] overflow-y-auto">
                <div className="p-3 bg-indigo-50/50 border-b border-indigo-50 text-[10px] font-bold text-indigo-700 uppercase tracking-widest flex items-center justify-between">
                  <span>
                    {lang === "fr" ? "Résultats de recherche" : "نتائج البحث"}
                  </span>
                  <span className="bg-indigo-150/50 text-indigo-800 text-[9px] px-1.5 py-0.5 rounded-full font-black">
                    {hasSearchResults ? "MATCH" : "0"}
                  </span>
                </div>

                {!hasSearchResults && (
                  <div className="p-8 text-center text-black text-xs sm:text-sm space-y-1">
                    <p className="font-extrabold text-black">
                      {lang === "fr"
                        ? "Aucun résultat trouvé"
                        : "لا توجد نتائج"}
                    </p>
                    <p className="text-[10px] text-black">
                      "{globalSearchInput}"
                    </p>
                    {globalSearchInput.trim().length < 3 && (
                      <p className="text-[10px] text-indigo-500 mt-2 font-medium">
                        {lang === "fr"
                          ? "Tapez au moins 3 caractères pour rechercher des élèves et enseignants."
                          : "اكتب 3 أحرف على الأقل للبحث عن التلاميذ والأساتذة."}
                      </p>
                    )}
                  </div>
                )}

                {hasSearchResults && (
                  <div className="divide-y divide-slate-100">
                    {globalSearchInput.trim().length < 3 && (
                      <div className="p-2.5 bg-slate-50 text-center border-b border-slate-100">
                        <p className="text-[10px] text-indigo-500 font-medium">
                          {lang === "fr"
                            ? "Tapez au moins 3 caractères pour inclure les élèves et enseignants."
                            : "اكتب 3 أحرف على الأقل لتضمين التلاميذ والأساتذة."}
                        </p>
                      </div>
                    )}
                    {/* MENUS RESULTS SECTION */}
                    {searchResults.menus.length > 0 && (
                      <div className="p-2.5">
                        <div className="px-2 pb-1.5 text-[9px] font-extrabold tracking-widest text-indigo-600 uppercase flex items-center gap-1">
                          <Compass className="h-3 w-3 animate-pulse" />
                          <span>
                            {lang === "fr"
                              ? "Rubriques & En-têtes"
                              : "الأقسام والميزات"}
                          </span>
                        </div>
                        <div className="space-y-0.5">
                          {searchResults.menus.map((menu: any) => {
                            const IconComponent = (() => {
                              switch (menu.icon) {
                                case "LayoutDashboard":
                                  return LayoutDashboard;
                                case "Users":
                                  return Users;
                                case "GraduationCap":
                                  return GraduationCap;
                                case "School":
                                  return School;
                                case "Calendar":
                                  return Calendar;
                                case "QrCode":
                                  return QrCode;
                                case "DollarSign":
                                  return DollarSign;
                                case "MessageSquare":
                                  return MessageSquare;
                                case "Settings":
                                  return Settings;
                                default:
                                  return Compass;
                              }
                            })();

                            return (
                              <button
                                key={menu.tab}
                                onClick={() => {
                                  navigateToTab(menu.tab);
                                  setGlobalSearchInput("");
                                  setIsSearchFocused(false);
                                }}
                                className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-indigo-50/50 flex items-center justify-between gap-2.5 transition text-xs group cursor-pointer"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold font-sans text-[11px] shrink-0 border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                    <IconComponent className="h-4 w-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-bold text-slate-850 truncate group-hover:text-indigo-600 transition-colors">
                                      {lang === "fr"
                                        ? menu.labelFr
                                        : menu.labelAr}
                                    </p>
                                    <p className="text-[10px] text-black truncate">
                                      {lang === "fr"
                                        ? "Accéder à l'espace"
                                        : "الانتقال إلى القسم"}
                                    </p>
                                  </div>
                                </div>
                                <span className="text-[9px] font-bold bg-slate-100 text-black px-1.5 py-0.5 rounded-md border border-slate-200 group-hover:bg-indigo-100 group-hover:text-indigo-700 transition shrink-0">
                                  {lang === "fr" ? "Entrer ➔" : "دخول ➔"}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* STUDENTS RESULTS SECTION */}
                    {searchResults.students.length > 0 && (
                      <div className="p-2.5">
                        <div className="px-2 pb-1.5 text-[9px] font-extrabold tracking-widest text-indigo-500 uppercase flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{lang === "fr" ? "Élèves" : "التلاميذ"}</span>
                        </div>
                        <div className="space-y-0.5">
                          {searchResults.students.map((student: Student) => {
                            const assignedClass = classes.find(
                              (c) => c.id === student.classId,
                            );
                            return (
                              <button
                                key={student.id}
                                onClick={() => {
                                  // Set target presets to filter within the manager component
                                  setStudentSearchPreset(
                                    `${student.firstName} ${student.lastName}`,
                                  );
                                  navigateToTab("students");
                                  setGlobalSearchInput("");
                                  setIsSearchFocused(false);
                                }}
                                className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-50 flex items-center gap-2.5 transition text-xs group cursor-pointer"
                              >
                                <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold font-sans text-[11px] shrink-0 border border-indigo-200/50 group-hover:scale-105 transition-all">
                                  {student.firstName[0]}
                                  {student.lastName[0]}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-bold text-slate-700 truncate group-hover:text-indigo-600 transition-colors">
                                    {student.firstName} {student.lastName}
                                  </p>
                                  <p className="text-[10px] text-black truncate font-medium">
                                    {assignedClass
                                      ? `${assignedClass.name} · ${assignedClass.cycle}`
                                      : "Classe non assignée"}
                                  </p>
                                </div>
                                <span className="text-[9px] font-bold bg-slate-100 text-black px-1.5 py-0.5 rounded-md border border-slate-200 group-hover:bg-indigo-100 group-hover:text-indigo-700 transition shrink-0">
                                  {lang === "fr" ? "Voir" : "عرض"}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* TEACHERS RESULTS SECTION */}
                    {searchResults.teachers.length > 0 && (
                      <div className="p-2.5">
                        <div className="px-2 pb-1.5 text-[9px] font-extrabold tracking-widest text-emerald-500 uppercase flex items-center gap-1">
                          <GraduationCap className="h-3 w-3" />
                          <span>
                            {lang === "fr" ? "Enseignants" : "الأساتذة"}
                          </span>
                        </div>
                        <div className="space-y-0.5">
                          {searchResults.teachers.map((teacher: Teacher) => {
                            const mainSubjects = teacher.subjectIds
                              .map(
                                (id) => subjects.find((s) => s.id === id)?.name,
                              )
                              .filter(Boolean)
                              .join(", ");
                            return (
                              <button
                                key={teacher.id}
                                onClick={() => {
                                  setTeacherSearchPreset(
                                    `${teacher.firstName} ${teacher.lastName}`,
                                  );
                                  navigateToTab("teachers");
                                  setGlobalSearchInput("");
                                  setIsSearchFocused(false);
                                }}
                                className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-50 flex items-center gap-2.5 transition text-xs group cursor-pointer"
                              >
                                <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold font-sans text-[11px] shrink-0 border border-emerald-200/50 group-hover:scale-105 transition-all">
                                  {teacher.firstName[0]}
                                  {teacher.lastName[0]}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-bold text-slate-700 truncate group-hover:text-emerald-700 transition-colors">
                                    M. {teacher.firstName} {teacher.lastName}
                                  </p>
                                  <p className="text-[10px] text-black truncate font-medium">
                                    {mainSubjects ||
                                      (lang === "fr"
                                        ? "Pas de matière assignée"
                                        : "لا توجد مادة")}
                                  </p>
                                </div>
                                <span className="text-[9px] font-bold bg-slate-100 text-black px-1.5 py-0.5 rounded-md border border-slate-200 group-hover:bg-emerald-100 group-hover:text-emerald-800 transition shrink-0">
                                  {lang === "fr" ? "Voir" : "عرض"}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* CLASSES RESULTS SECTION */}
                    {searchResults.classes.length > 0 && (
                      <div className="p-2.5">
                        <div className="px-2 pb-1.5 text-[9px] font-extrabold tracking-widest text-violet-500 uppercase flex items-center gap-1">
                          <School className="h-3 w-3" />
                          <span>
                            {lang === "fr"
                              ? "Classes & Cycles"
                              : "الأقسام والأسلاك"}
                          </span>
                        </div>
                        <div className="space-y-0.5">
                          {searchResults.classes.map((cls: Class) => (
                            <button
                              key={cls.id}
                              onClick={() => {
                                setClassSearchPreset(cls.name);
                                navigateToTab("classes");
                                setGlobalSearchInput("");
                                setIsSearchFocused(false);
                              }}
                              className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-50 flex items-center gap-2.5 transition text-xs group cursor-pointer"
                            >
                              <div className="h-8 w-8 rounded-full bg-violet-100 text-violet-800 flex items-center justify-center font-bold font-sans text-[11px] shrink-0 border border-violet-200/50 group-hover:scale-105 transition-all">
                                CL
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-bold text-slate-700 truncate group-hover:text-violet-700 transition-colors">
                                  {cls.name}
                                </p>
                                <p className="text-[10px] text-black truncate font-medium">
                                  {cls.level} ·{" "}
                                  {cls.room
                                    ? `Salle ${cls.room}`
                                    : "Sans salle"}
                                </p>
                              </div>
                              <span className="text-[9px] font-bold bg-slate-100 text-black px-1.5 py-0.5 rounded-md border border-slate-200 group-hover:bg-violet-100 group-hover:text-violet-800 transition shrink-0">
                                {lang === "fr" ? "Voir" : "عرض"}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Rôle Selector */}
        <div className="flex items-center gap-1 sm:gap-2 bg-slate-100 px-2 sm:px-3 py-1.5 rounded-xl border border-slate-200 shrink-0">
          <span className="hidden sm:inline-block text-[10px] font-bold text-slate-500 uppercase">
            Rôle:
          </span>
          <select
            value={userRole || "admin"}
            onChange={(e) => switchRole(e.target.value as any)}
            className="bg-transparent text-[10px] sm:text-xs font-bold text-indigo-700 focus:outline-none cursor-pointer"
          >
            <option value="admin">Admin</option>
            <option value="secretariat">Secrétariat</option>
            <option value="enseignant">Enseignant</option>
            <option value="parent">Parent</option>
          </select>
        </div>
      </div>

      {/* Right Side: Language switcher & Moroccan token info */}
      <div className="hidden lg:flex items-center gap-1.5 md:gap-3 shrink-0 order-2 sm:order-none">
        <button
          onClick={() => logout()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-150 hover:bg-rose-50 transition-all text-xs font-bold text-rose-600 bg-white shadow-sm cursor-pointer z-50 hover:border-rose-200"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden lg:inline">Déconnexion</span>
        </button>
        {/* AR/FR selector */}
        <button
          onClick={() => {
            const next = lang === "fr" ? "ar" : "fr";
            setLang(next);
            localStorage.setItem("madrasati_lang", next);
          }}
          className="flex items-center gap-1 py-1.5 px-2 sm:px-3 rounded-xl border border-slate-150 hover:bg-slate-50 transition-all text-xs font-bold text-slate-700 bg-white shadow-sm cursor-pointer z-50 hover:border-indigo-200"
        >
          <Globe className="h-3.5 w-3.5 text-indigo-600 animate-pulse shrink-0" />
          <span className="font-mono hidden lg:inline">
            {lang === "fr" ? "العربية (AR)" : "Français (FR)"}
          </span>
          <span className="font-mono lg:hidden inline">
            {lang === "fr" ? "AR" : "FR"}
          </span>
        </button>

        {/* Moroccan flag token & bilingual indicator */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-100 shrink-0">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-black font-sans">
            <span>{schoolCity}</span>
            <span className="text-black">|</span>
            <span className="text-emerald-700 font-bold">مدرستي</span>
          </div>
          <span className="text-sm leading-none">🇲🇦</span>
        </div>
      </div>

      {/* Mobile menu trigger */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="p-1.5 xs:p-2 text-black hover:bg-slate-100 rounded-xl border border-slate-200 lg:hidden flex items-center justify-center shrink-0 focus:outline-none active:scale-95 transition-all ml-1 bg-white shadow-xs z-50 cursor-pointer order-2 sm:order-none"
        aria-label="Toggle Menu"
      >
        {mobileMenuOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </button>
    </header>
  );
}
