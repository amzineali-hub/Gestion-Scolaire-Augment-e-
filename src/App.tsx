import { useState, useEffect } from "react";
import defaultLogo from "./assets/images/school_logo_academia_1781715806486.jpg";
import {
  Subject,
  Class,
  Student,
  Teacher,
  ScheduleItem,
  Invoice,
  AttendanceRecord,
} from "./types";
import {
  INITIAL_SUBJECTS,
  INITIAL_CLASSES,
  INITIAL_TEACHERS,
  INITIAL_STUDENTS,
  INITIAL_SCHEDULES,
  INITIAL_INVOICES,
} from "./data";

// Import modules
import Dashboard from "./components/Dashboard";
import StudentManager from "./components/StudentManager";
import BulletinsManager from "./components/BulletinsManager";
import TeacherManager from "./components/TeacherManager";
import ClassCourseManager from "./components/ClassCourseManager";
import SchedulePlanner from "./components/SchedulePlanner";
import FinanceManager from "./components/FinanceManager";
import SettingsManager from "./components/SettingsManager";
import Communicator from "./components/Communicator";
import AttendanceManager from "./components/AttendanceManager";
import ParentPortal from "./components/ParentPortal";
import { translations } from "./translations";
import { useAuth } from "./AuthContext";
import { useFirebaseData } from "./hooks/useFirebaseData";
import { RoleGuard } from "./components/RoleGuard";
import Auth from "./components/Auth";
import SchoolSetupCard from "./components/SchoolSetupCard";
import AppSidebar from "./components/layout/AppSidebar";
import AppHeader from "./components/layout/AppHeader";
import { auth, db } from "./firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

// Icons
import { LogOut } from "lucide-react";
import { generateSimulatedInvoices } from "./utils/generators";

const APP_TAGS = [
  {
    tab: "dashboard",
    keywords: [
      "accueil",
      "tableau de bord",
      "principal",
      "statistiques",
      "stats",
      "dashboard",
    ],
    labelFr: "Tableau de bord de l'école",
    labelAr: "لوحة التحكم",
    icon: "LayoutDashboard",
  },
  {
    tab: "bulletins",
    keywords: [
      "bulletin",
      "bulletins",
      "note",
      "notes",
      "resultats",
      "évaluation",
      "examens",
    ],
    labelFr: "Gestion des Bulletins & Notes",
    labelAr: "النتائج والامتحانات",
    icon: "FileText",
  },
  {
    tab: "students",
    keywords: [
      "eleve",
      "eleves",
      "etudiant",
      "etudiants",
      "apprenant",
      "apprenants",
      "scolarite",
      "student",
      "students",
    ],
    labelFr: "Gestion des Élèves & Inscriptions",
    labelAr: "إدارة التلاميذ",
    icon: "Users",
  },
  {
    tab: "teachers",
    keywords: [
      "prof",
      "profs",
      "professeur",
      "professeurs",
      "enseignant",
      "enseignants",
      "instituteur",
      "instituteurs",
      "teacher",
      "teachers",
    ],
    labelFr: "Gestion des Enseignants & Spécialités",
    labelAr: "إدارة الأساتذة",
    icon: "GraduationCap",
  },
  {
    tab: "classes",
    keywords: [
      "classe",
      "classes",
      "salle",
      "salles",
      "cycle",
      "cycles",
      "cours",
      "matiere",
      "matieres",
      "niveaux",
    ],
    labelFr: "Gestion des Classes & Matières",
    labelAr: "الأقسام والمواد",
    icon: "School",
  },
  {
    tab: "schedules",
    keywords: [
      "planning",
      "plannings",
      "horaire",
      "horaires",
      "emploi du temps",
      "calendrier",
      "schedule",
      "schedules",
    ],
    labelFr: "Emplois du temps & Horaires",
    labelAr: "جداول الحصص",
    icon: "Calendar",
  },
  {
    tab: "attendance",
    keywords: [
      "presence",
      "presences",
      "absence",
      "absences",
      "appel",
      "pointage",
      "qr code",
      "presence",
      "attendance",
    ],
    labelFr: "Suivi des Absences & Pointages",
    labelAr: "متابعة الغياب",
    icon: "QrCode",
  },
  {
    tab: "financials",
    keywords: [
      "finance",
      "finances",
      "facture",
      "factures",
      "paiement",
      "paiements",
      "frais",
      "compta",
      "comptabilite",
      "invoice",
      "invoices",
    ],
    labelFr: "Paiements scolaires & Factures",
    labelAr: "المالية والفواتير",
    icon: "DollarSign",
  },
  {
    tab: "communicator",
    keywords: [
      "communication",
      "parents",
      "parent",
      "message",
      "messages",
      "whatsapp",
      "newsletter",
      "annonce",
      "annonces",
      "communicator",
    ],
    labelFr: "Annonces & Communication Parentale",
    labelAr: "التواصل avec les parents",
    icon: "MessageSquare",
  },
  {
    tab: "settings",
    keywords: [
      "parametre",
      "parametres",
      "configuration",
      "config",
      "logo",
      "profile",
      "compte",
      "reglages",
      "ville",
      "settings",
    ],
    labelFr: "Paramètres de l'établissement",
    labelAr: "الإعدادات",
    icon: "Settings",
  },
];

export default function App() {
  // Language switcher state
  const [lang, setLang] = useState<"fr" | "ar">(() => {
    const stored = localStorage.getItem("madrasati_lang");
    return stored === "ar" || stored === "fr" ? (stored as "fr" | "ar") : "fr";
  });

  const {
    currentUser,
    schoolId,
    schoolName: dbSchoolName,
    loading: authLoading,
    logout,
    userRole,
    switchRole,
  } = useAuth();
  const {
    subjects,
    classes,
    students,
    teachers,
    schedules,
    invoices,
    attendance,
    loadingInitial,
    actions,
  } = useFirebaseData(schoolId);
  const [schoolName, setSchoolName] = useState(
    dbSchoolName || "Gestion Scolaire Augmentée",
  );
  const [schoolCity, setSchoolCity] = useState("Casablanca");
  const [regionalAcademy, setRegionalAcademy] = useState(
    "AREF Casablanca-Settat",
  );
  const [bilingualType, setBilingualType] = useState<
    "bilingue" | "arabe" | "francais"
  >("bilingue");
  const [contactPhone, setContactPhone] = useState("0522123456");
  const [contactEmail, setContactEmail] = useState(
    "contact@arrachad-school.ma",
  );
  const [schoolLogo, setSchoolLogo] = useState(
    () => localStorage.getItem("madrasati_school_logo") || defaultLogo,
  );
  const [themeColor, setThemeColor] = useState(
    () => localStorage.getItem("madrasati_themeColor") || "indigo",
  );
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Global search & highlights presets
  const [globalSearchInput, setGlobalSearchInput] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [studentSearchPreset, setStudentSearchPreset] = useState("");
  const [teacherSearchPreset, setTeacherSearchPreset] = useState("");
  const [classSearchPreset, setClassSearchPreset] = useState("");

  // Auto-seed for school-demo if empty to provide an immediate out-of-the-box working visual showcase
  useEffect(() => {
    if (
      schoolId === "school-demo" &&
      students.length === 0 &&
      !loadingInitial &&
      classes.length === 0 &&
      db
    ) {
      const seedDemoData = async () => {
        try {
          console.log("Starting automatic seed for demo school...");
          // 1. Seed School details
          await setDoc(doc(db, "schools", "school-demo"), {
            name: "Groupe Scolaire Excellence (Démo)",
            city: "Casablanca",
            academy: "AREF Casablanca-Settat",
            bilingualType: "bilingue",
            phone: "0522123456",
            email: "contact@excellence-school.ma",
            createdAt: new Date(),
            subscriptionPlan: "excellence",
          });

          // 2. Seed Subjects
          for (const sub of INITIAL_SUBJECTS) {
            await setDoc(
              doc(db, "schools", "school-demo", "subjects", sub.id),
              sub,
            );
          }

          // 3. Seed Classes
          for (const cls of INITIAL_CLASSES) {
            await setDoc(
              doc(db, "schools", "school-demo", "classes", cls.id),
              cls,
            );
          }

          // 4. Seed Teachers
          for (const tch of INITIAL_TEACHERS) {
            await setDoc(
              doc(db, "schools", "school-demo", "teachers", tch.id),
              tch,
            );
          }

          // 5. Seed Students
          for (const std of INITIAL_STUDENTS) {
            await setDoc(
              doc(db, "schools", "school-demo", "students", std.id),
              std,
            );
          }

          // 6. Seed Schedules
          for (const sch of INITIAL_SCHEDULES) {
            await setDoc(
              doc(db, "schools", "school-demo", "schedules", sch.id),
              sch,
            );
          }

          // 7. Seed Invoices
          const demoInvoices = generateSimulatedInvoices(INITIAL_STUDENTS);
          for (const inv of demoInvoices) {
            await setDoc(
              doc(db, "schools", "school-demo", "invoices", inv.id),
              inv,
            );
          }

          console.log("Demo database successfully seeded!");
        } catch (err) {
          console.error("Error automatic seeding:", err);
        }
      };
      seedDemoData();
    }
  }, [schoolId, students.length, classes.length, loadingInitial]);

  useEffect(() => {
    if (dbSchoolName) setSchoolName(dbSchoolName);
  }, [dbSchoolName]);

  // Fetch complete school details from Firestore
  useEffect(() => {
    if (!schoolId || !db) return;
    const fetchSchoolDetails = async () => {
      try {
        const docRef = doc(db, "schools", schoolId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.name) setSchoolName(data.name);
          if (data.city) setSchoolCity(data.city);
          if (data.academy) setRegionalAcademy(data.academy);
          if (data.bilingualType) setBilingualType(data.bilingualType);
          if (data.phone) setContactPhone(data.phone);
          if (data.email) setContactEmail(data.email);
          if (data.logo) setSchoolLogo(data.logo);
          if (data.themeColor) setThemeColor(data.themeColor);
        }
      } catch (err: any) {
        if (String(err).toLowerCase().includes("quota")) {
          console.warn(
            "Firestore Quota Exceeded loading school details, using defaults",
          );
        } else {
          console.error("Error loading school details in App:", err);
        }
      }
    };
    fetchSchoolDetails();
  }, [schoolId]);

  useEffect(() => {
    const THEMES: Record<string, Record<string, string>> = {
      indigo: {
        "--app-primary-50": "#eef2ff",
        "--app-primary-100": "#e0e7ff",
        "--app-primary-150": "#d6e0ff",
        "--app-primary-200": "#c7d2fe",
        "--app-primary-300": "#a5b4fc",
        "--app-primary-400": "#818cf8",
        "--app-primary-500": "#6366f1",
        "--app-primary-600": "#4f46e5",
        "--app-primary-700": "#4338ca",
        "--app-primary-800": "#3730a3",
        "--app-primary-900": "#312e81",
        "--app-primary-950": "#1e1b4b",
      },
      emerald: {
        "--app-primary-50": "#ecfdf5",
        "--app-primary-100": "#d1fae5",
        "--app-primary-150": "#a7f3d0",
        "--app-primary-200": "#a7f3d0",
        "--app-primary-300": "#6ee7b7",
        "--app-primary-400": "#34d399",
        "--app-primary-500": "#10b981",
        "--app-primary-600": "#059669",
        "--app-primary-700": "#047857",
        "--app-primary-800": "#065f46",
        "--app-primary-900": "#064e3b",
        "--app-primary-950": "#022c22",
      },
      rose: {
        "--app-primary-50": "#fff1f2",
        "--app-primary-100": "#ffe4e6",
        "--app-primary-150": "#fecdd3",
        "--app-primary-200": "#fecdd3",
        "--app-primary-300": "#fda4af",
        "--app-primary-400": "#fb7185",
        "--app-primary-500": "#f43f5e",
        "--app-primary-600": "#e11d48",
        "--app-primary-700": "#be123c",
        "--app-primary-800": "#9f1239",
        "--app-primary-900": "#881337",
        "--app-primary-950": "#4c0519",
      },
      sky: {
        "--app-primary-50": "#f0f9ff",
        "--app-primary-100": "#e0f2fe",
        "--app-primary-150": "#bae6fd",
        "--app-primary-200": "#bae6fd",
        "--app-primary-300": "#7dd3fc",
        "--app-primary-400": "#38bdf8",
        "--app-primary-500": "#0ea5e9",
        "--app-primary-600": "#0284c7",
        "--app-primary-700": "#0369a1",
        "--app-primary-800": "#075985",
        "--app-primary-900": "#0c4a6e",
        "--app-primary-950": "#082f49",
      },
      amber: {
        "--app-primary-50": "#fffbeb",
        "--app-primary-100": "#fef3c7",
        "--app-primary-150": "#fde68a",
        "--app-primary-200": "#fde68a",
        "--app-primary-300": "#fcd34d",
        "--app-primary-400": "#fbbf24",
        "--app-primary-500": "#f59e0b",
        "--app-primary-600": "#d97706",
        "--app-primary-700": "#b45309",
        "--app-primary-800": "#92400e",
        "--app-primary-900": "#78350f",
        "--app-primary-950": "#451a03",
      }
    };
    
    const palette = THEMES[themeColor] || THEMES.indigo;
    const root = document.documentElement;
    Object.entries(palette).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }, [themeColor]);

  const handleResetData = () => {
    console.log("Reset is disabled in Firebase mode");
  };

  const navigateToTab = (tab: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    // Clear presets when manually changing tabs
    setStudentSearchPreset("");
    setTeacherSearchPreset("");
    setClassSearchPreset("");
  };

  // Global search matching results
  const getSearchResults = () => {
    if (!globalSearchInput.trim())
      return { menus: [], students: [], teachers: [], classes: [] };

    // Accent removal and normalization helper to support typo-friendly & native search
    const removeAccents = (str: string) =>
      str
        ? str
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
        : "";

    const query = removeAccents(globalSearchInput.trim());

    // 1. Match standard navigation Rubriques & Menus
    const matchedMenus = APP_TAGS.filter((tag) =>
      tag.keywords.some((kw) => removeAccents(kw).includes(query)),
    );

    // Limit to 5 results per category for gorgeous, high-performance representation
    const matchedStudents = query.length >= 3 ? students
      .filter(
        (s) =>
          removeAccents(`${s.firstName || ""} ${s.lastName || ""}`).includes(
            query,
          ) ||
          (s.phone && removeAccents(s.phone).includes(query)) ||
          (s.id && removeAccents(s.id).includes(query)),
      )
      .slice(0, 5) : [];

    const matchedTeachers = query.length >= 3 ? teachers
      .filter(
        (t) =>
          removeAccents(`${t.firstName || ""} ${t.lastName || ""}`).includes(
            query,
          ) ||
          (t.email && removeAccents(t.email).includes(query)) ||
          (t.subjectIds &&
            t.subjectIds.some((subId) => {
              const sub = subjects.find((s) => s.id === subId);
              return sub && removeAccents(sub.name).includes(query);
            })),
      )
      .slice(0, 5) : [];

    const matchedClasses = query.length >= 3 ? classes
      .filter(
        (c) =>
          (c.name && removeAccents(c.name).includes(query)) ||
          (c.level && removeAccents(c.level).includes(query)) ||
          (c.cycle && removeAccents(c.cycle).includes(query)),
      )
      .slice(0, 5) : [];

    return {
      menus: matchedMenus,
      students: matchedStudents,
      teachers: matchedTeachers,
      classes: matchedClasses,
    };
  };

  const searchResults = getSearchResults();
  const hasSearchResults =
    searchResults.menus.length > 0 ||
    searchResults.students.length > 0 ||
    searchResults.teachers.length > 0 ||
    searchResults.classes.length > 0;

  const t = (key: keyof (typeof translations)["fr"]) =>
    translations[lang][key] || key;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse text-indigo-600 font-bold">
          Chargement de l'espace...
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Auth lang={lang} />;
  }

  if (!schoolId) {
    return (
      <div
        dir={lang === "ar" ? "rtl" : "ltr"}
        className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans selection:bg-indigo-150 selection:text-indigo-900 relative"
      >
        {/* Un en-tête simple pour pouvoir se déconnecter de l'espace */}
        <div className="absolute top-4 right-4 sm:right-6">
          <button
            type="button"
            onClick={() => logout()}
            className="flex items-center gap-2 bg-white hover:bg-slate-100 text-black hover:text-rose-600 font-bold px-3.5 py-1.5 sm:py-2 rounded-xl text-xs border border-slate-200 transition-all shadow-sm active:scale-[0.98]"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>{lang === "fr" ? "Se déconnecter" : "تسجيل الخروج"}</span>
          </button>
        </div>

        {/* Configuration d'établissement */}
        <SchoolSetupCard lang={lang} currentUser={currentUser} />
      </div>
    );
  }

  return (
    <div
      dir={lang === "ar" ? "rtl" : "ltr"}
      className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-150 selection:text-indigo-900 max-w-full overflow-x-hidden"
    >
      <AppHeader
        lang={lang}
        setLang={setLang}
        schoolName={schoolName}
        schoolCity={schoolCity}
        schoolLogo={schoolLogo}
        loadingInitial={loadingInitial}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        userRole={userRole}
        switchRole={switchRole}
        logout={logout}
        setActiveTab={setActiveTab}
        navigateToTab={navigateToTab}
        t={t}
        globalSearchInput={globalSearchInput}
        setGlobalSearchInput={setGlobalSearchInput}
        isSearchFocused={isSearchFocused}
        setIsSearchFocused={setIsSearchFocused}
        hasSearchResults={hasSearchResults}
        searchResults={searchResults}
        setStudentSearchPreset={setStudentSearchPreset}
        setTeacherSearchPreset={setTeacherSearchPreset}
        setClassSearchPreset={setClassSearchPreset}
        classes={classes}
        subjects={subjects}
      />

      {/* Main SaaS Workspace */}
      <div className="flex flex-1 relative min-h-0">
        {userRole === "parent" ? (
          <ParentPortal
            students={students}
            classes={classes}
            schedules={schedules}
            subjects={subjects}
            attendance={attendance}
          />
        ) : (
          <>
            <AppSidebar
              lang={lang}
              setLang={setLang}
              mobileMenuOpen={mobileMenuOpen}
              setMobileMenuOpen={setMobileMenuOpen}
              activeTab={activeTab}
              navigateToTab={navigateToTab}
              userRole={userRole}
              switchRole={switchRole}
              logout={logout}
              students={students}
              t={t}
            />

            {/* WORKSPACE VIEWPORT */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-5 lg:p-6 max-w-full lg:max-w-[1500px] mx-auto w-full min-w-0">
              {activeTab === "dashboard" && (
                <Dashboard
                  students={students}
                  teachers={teachers}
                  classes={classes}
                  subjects={subjects}
                  invoices={invoices}
                  setActiveTab={navigateToTab}
                  lang={lang}
                />
              )}

              {activeTab === "bulletins" && (
                <RoleGuard
                  allowedRoles={["admin", "secretariat", "enseignant"]}
                >
                  <BulletinsManager
                    students={students}
                    classes={classes}
                    subjects={subjects}
                  />
                </RoleGuard>
              )}

              {activeTab === "students" && (
                <RoleGuard allowedRoles={["admin", "secretariat"]}>
                  <StudentManager
                    students={students}
                    classes={classes}
                    onAddStudent={actions.addStudent}
                    onEditStudent={actions.updateStudent}
                    onDeleteStudent={actions.deleteStudent}
                    subjects={subjects}
                    schoolName={schoolName}
                    schoolLogo={schoolLogo}
                    contactPhone={contactPhone}
                    contactEmail={contactEmail}
                    schoolCity={schoolCity}
                    regionalAcademy={regionalAcademy}
                    initialSearchQuery={studentSearchPreset}
                    isLoading={loadingInitial}
                  />
                </RoleGuard>
              )}

              {activeTab === "teachers" && (
                <RoleGuard allowedRoles={["admin", "secretariat"]}>
                  <TeacherManager
                    teachers={teachers}
                    subjects={subjects}
                    classes={classes}
                    onAddTeacher={actions.addTeacher}
                    onEditTeacher={actions.updateTeacher}
                    onDeleteTeacher={actions.deleteTeacher}
                    initialSearchQuery={teacherSearchPreset}
                    isLoading={loadingInitial}
                  />
                </RoleGuard>
              )}

              {activeTab === "classes" && (
                <RoleGuard allowedRoles={["admin", "secretariat"]}>
                  <ClassCourseManager
                    classes={classes}
                    subjects={subjects}
                    onAddClass={actions.addClass}
                    onEditClass={actions.updateClass}
                    onDeleteClass={actions.deleteClass}
                    onAddSubject={actions.addSubject}
                    onEditSubject={actions.updateSubject}
                    onDeleteSubject={actions.deleteSubject}
                    initialSearchQuery={classSearchPreset}
                  />
                </RoleGuard>
              )}

              {activeTab === "schedules" && (
                <RoleGuard
                  allowedRoles={["admin", "secretariat", "enseignant"]}
                >
                  <SchedulePlanner
                    schedules={schedules}
                    classes={classes}
                    teachers={teachers}
                    subjects={subjects}
                    onAddSchedule={actions.addSchedule}
                    onDeleteSchedule={actions.deleteSchedule}
                  />
                </RoleGuard>
              )}

              {activeTab === "financials" && (
                <RoleGuard allowedRoles={["admin", "secretariat"]}>
                  <FinanceManager
                    invoices={invoices}
                    students={students}
                    classes={classes}
                    onAddInvoices={actions.addInvoices}
                    onPayInvoice={actions.payInvoice}
                    schoolName={schoolName}
                    schoolLogo={schoolLogo}
                    contactPhone={contactPhone}
                    contactEmail={contactEmail}
                  />
                </RoleGuard>
              )}

              {activeTab === "attendance" && (
                <RoleGuard
                  allowedRoles={["admin", "secretariat", "enseignant"]}
                >
                  <AttendanceManager
                    students={students}
                    classes={classes}
                    attendance={attendance || []}
                    schoolName={schoolName}
                    actions={actions}
                  />
                </RoleGuard>
              )}

              {activeTab === "communicator" && (
                <RoleGuard allowedRoles={["admin", "secretariat"]}>
                  <Communicator
                    students={students}
                    classes={classes}
                    schoolName={schoolName}
                  />
                </RoleGuard>
              )}

              {activeTab === "settings" && (
                <RoleGuard allowedRoles={["admin"]}>
                  <SettingsManager
                    schoolId={schoolId}
                    schoolName={schoolName}
                    setSchoolName={setSchoolName}
                    schoolCity={schoolCity}
                    setSchoolCity={setSchoolCity}
                    regionalAcademy={regionalAcademy}
                    setRegionalAcademy={setRegionalAcademy}
                    bilingualType={bilingualType}
                    setBilingualType={setBilingualType}
                    contactPhone={contactPhone}
                    setContactPhone={setContactPhone}
                    contactEmail={contactEmail}
                    setContactEmail={setContactEmail}
                    schoolLogo={schoolLogo}
                    setSchoolLogo={setSchoolLogo}
                    themeColor={themeColor}
                    setThemeColor={setThemeColor}
                    onResetData={handleResetData}
                  />
                </RoleGuard>
              )}
            </main>
          </>
        )}
      </div>
    </div>
  );
}
