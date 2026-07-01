import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Student, Teacher, Class, Subject, Invoice } from "../types";
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  TrendingUp, 
  DollarSign, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  School,
  ArrowRight,
  TrendingDown,
  Check,
  Star,
  Sparkles,
  Building,
  Briefcase,
  Calendar,
  Search,
  Plus,
  Pencil,
  MessageCircle,
  FileText,
  FileWarning,
  ChevronRight,
  Send
} from "lucide-react";
import { translations } from "../translations";
import SubscriptionCheckoutModal from "./SubscriptionCheckoutModal";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface DashboardProps {
  students: Student[];
  teachers: Teacher[];
  classes: Class[];
  subjects: Subject[];
  invoices: Invoice[];
  setActiveTab: (tab: string) => void;
  lang?: "fr" | "ar";
}

interface GuideData {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  steps: string;
  desc: string;
  content: string[];
}

const DOC_GUIDES: GuideData[] = [
  {
    id: "premiers-pas",
    title: "Premiers Pas",
    category: "demarrage",
    difficulty: "Débutant",
    steps: "5 steps",
    desc: "Guide de démarrage : connexion, tableau de bord, navigation générale",
    content: [
      "Étape 1: Connectez-vous en utilisant vos credentials d'administration scolaire.",
      "Étape 2: Renseignez les informations de base de l'académie régionale sous 'Configuration'.",
      "Étape 3: Importez la liste initiale de vos élèves d'un fichier excel standard.",
      "Étape 4: Établissez l'attribution des professeurs principaux aux matières.",
      "Étape 5: Envoyez un message WhatsApp d'invitation aux tuteurs légaux pour synchronisation."
    ]
  },
  {
    id: "gestion-eleves",
    title: "Gestion des Apprenants",
    category: "personnes",
    difficulty: "Débutant",
    steps: "3 steps",
    desc: "Comment inscrire, filtrer, exporter les profils scolaires et générer le QR code d'appel",
    content: [
      "Étape 1: Naviguez vers l'onglet 'Élèves' et cliquez sur '+ Ajouter'.",
      "Étape 2: Renseignez son identifiant unique et le cycle d'apprentissage marocain.",
      "Étape 3: Imprimez sa fiche d'appel intégrant le code QR pour la lecture optique caméra."
    ]
  },
  {
    id: "suivi-finance",
    title: "Facturation & Cotisations",
    category: "personnes",
    difficulty: "Intermédiaire",
    steps: "4 steps",
    desc: "Gestion de l'appel de fonds mensuel, encaissement informatique et tableau de relances des dettes",
    content: [
      "Étape 1: Rapprochez l'encaissement de la scolarité du mois courant sous 'Finances'.",
      "Étape 2: Éditez une facture d'un clic pour envoi direct PDF sur WhatsApp.",
      "Étape 3: Saisissez un règlement partiel ou total par transfert ou chèque bancaire.",
      "Étape 4: Lancez le rappel automatique par notification WhatsApp aux tuteurs retardataires."
    ]
  }
];

export default function Dashboard({
  students,
  teachers,
  classes,
  subjects,
  invoices,
  setActiveTab,
  lang = "fr"
}: DashboardProps) {
  // Calculations
  const activeStudents = students.filter(s => s.status === "actif");
  const totalStudents = students.length;
  const totalTeachers = teachers.length;
  const totalClasses = classes.length;
  const totalSubjects = subjects.length;

  // Revenue Calculations
  const totalRevenueExpected = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalRevenueCollected = invoices
    .filter(inv => inv.status === "payé")
    .reduce((sum, inv) => sum + inv.amount, 0);
  const totalRevenuePending = invoices
    .filter(inv => inv.status !== "payé")
    .reduce((sum, inv) => sum + inv.amount, 0);

  const collectionRate = totalRevenueExpected > 0 
    ? Math.round((totalRevenueCollected / totalRevenueExpected) * 100) 
    : 0;

  // Cycles distribution calculation
  const cycles = {
    "Primaire": 0,
    "Collège": 0,
    "Lycée": 0
  };

  const performanceData = [
    { subject: "Mathématiques", moyenne: 14.5 },
    { subject: "Français", moyenne: 13.2 },
    { subject: "Arabe", moyenne: 15.1 },
    { subject: "Physique", moyenne: 12.8 },
    { subject: "SVT", moyenne: 13.9 },
    { subject: "Anglais", moyenne: 14.7 },
  ];

  students.forEach(std => {
    const cls = classes.find(c => c.id === std.classId);
    if (cls && cls.cycle in cycles) {
      cycles[cls.cycle as keyof typeof cycles]++;
    }
  });

  // Recent Invoices
  const recentInvoices = [...invoices]
    .sort((a, b) => b.dueDate.localeCompare(a.dueDate))
    .slice(0, 5);

  // Late students alerts
  const lateInvoicesCount = invoices.filter(inv => inv.status === "retard").length;
  const capacityAlerts = classes.filter(cls => {
    const count = students.filter(s => s.classId === cls.id).length;
    return count >= cls.capacity - 2; // threshold near capacity
  });
  const missingDocsCount = students.filter(s => s.missingDocuments && s.missingDocuments.length > 0).length;

  // SaaS Subscription Plan interactive States
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [activePlan, setActivePlan] = useState<string>(() => localStorage.getItem("madrasati_active_plan") || "croissance");
  const [notification, setNotification] = useState<string | null>(null);

  // Checkout modal states
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutData, setCheckoutData] = useState<{
    key: string;
    name: string;
    price: string;
  } | null>(null);

  // Madrasati custom design states
  const [adminName, setAdminName] = useState(() => localStorage.getItem("madrasati_admin_name") || "Lhrach Ilham");
  const [isEditingAdminName, setIsEditingAdminName] = useState(false);
  const [tempName, setTempName] = useState(adminName);
  const [currentTime, setCurrentTime] = useState("");
  const [selectedDocCategory, setSelectedDocCategory] = useState<"all" | "demarrage" | "personnes">("all");
  const [docSearchQuery, setDocSearchQuery] = useState("");
  
  const [selectedGuide, setSelectedGuide] = useState<GuideData | null>(null);

  // Floating Active Chatbot states
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "bot"; text: string; time: string }>>([
    {
      sender: "bot",
      text: "Bonjour ! Je suis l'assistant Madrasati. Comment puis-je vous aider aujourd'hui à gérer votre établissement ?",
      time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [userInput, setUserInput] = useState("");

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const userMsgText = userInput;
    const timeNow = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

    // Add user message
    setChatMessages(prev => [...prev, { sender: "user", text: userMsgText, time: timeNow }]);
    setUserInput("");

    // Simulate auto-reply from Madrasati Assistant via Gemini API
    const fetchReply = async () => {
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: userMsgText }),
        });
        
        const data = await response.json();
        
        setChatMessages(prev => [...prev, { 
          sender: "bot", 
          text: data.reply, 
          time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) 
        }]);
      } catch (error) {
        console.error("Chat error:", error);
        setChatMessages(prev => [...prev, { 
          sender: "bot", 
          text: "Je suis désolé, je n'arrive pas à me connecter pour le moment.", 
          time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) 
        }]);
      }
    };
    
    fetchReply();
  };

  // Ticking Moroccan time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setCurrentTime(timeStr);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getMoroccanFormattedDate = () => {
    const now = new Date();
    return now.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  };

  const t = (key: keyof typeof translations["fr"]) => translations[lang][key];

  const handleSelectPlan = (planKey: string, name: string) => {
    let priceVal = "190";
    if (planKey === "croissance") {
      priceVal = billingCycle === "monthly" ? "490" : "4900";
    } else if (planKey === "excellence") {
      priceVal = billingCycle === "monthly" ? "890" : "8900";
    } else {
      priceVal = billingCycle === "monthly" ? "190" : "1900";
    }

    setCheckoutData({
      key: planKey,
      name,
      price: priceVal
    });
    setIsCheckoutOpen(true);
  };

  const handlePaymentSuccess = () => {
    if (!checkoutData) return;
    const { key, name } = checkoutData;
    setActivePlan(key);
    localStorage.setItem("madrasati_active_plan", key);
    setNotification(`${t("successful_selection")} "${name}". ${t("active_now")}`);
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  return (
    <div id="school-dashboard" className="space-y-6">
      {/* Toast Notification for Plan Upgrades */}
      {notification && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 p-4 rounded-xl shadow-sm text-xs font-bold animate-fade-in flex items-center justify-between mb-2">
          <span className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-600 shrink-0" />
            {notification}
          </span>
          <button onClick={() => setNotification(null)} className="text-emerald-500 hover:text-emerald-700 font-extrabold focus:outline-none">✕</button>
        </div>
      )}

      {/* Header & Title */}
      <div className="space-y-1 mt-2">
        <h2 className="text-2xl xs:text-3xl sm:text-4xl font-black text-[#0b5edd] tracking-tight leading-tight font-sans">
          Tableau de Bord<br />Administrateur
        </h2>
      </div>

          {/* Quick action button matching screenshot 1 */}
          <div className="flex">
            <button 
              onClick={() => setActiveTab("students")}
              className="flex items-center gap-2 px-5 py-3 bg-[#0b5edd] hover:bg-[#094ebb] text-white text-xs font-bold rounded-[14px] shadow-md shadow-blue-200 transition-all active:scale-[0.98] cursor-pointer"
            >
              <Plus className="h-4 w-4 stroke-[3px]" />
              Ajouter un nouvel Apprenant
            </button>
          </div>

          {/* The Welcome Banner - slimmed into a horizontal rectangle */}
          <div className="relative overflow-hidden w-full max-w-full bg-gradient-to-r from-[#0b5edd] via-[#0269ff] to-[#128cf2] text-white p-4 sm:p-5 rounded-[20px] shadow-md border border-blue-400/20 group">
            {/* Geometric repeating Plus pattern background in white overlay */}
            <div className="absolute inset-0 opacity-[0.08] pointer-events-none mix-blend-overlay select-none" style={{
              backgroundImage: 'radial-gradient(circle, #fff 1.2px, transparent 1.2px), radial-gradient(circle, #fff 1.2px, transparent 1.2px)',
              backgroundSize: '24px 24px',
              backgroundPosition: '0 0, 12px 12px'
            }}></div>
            
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="text-lg sm:text-xl font-bold tracking-tight">
                    Bienvenue à Votre École !
                  </h3>
                </div>
                <p className="text-xs font-medium opacity-90">
                  Bonne journée au travail
                </p>
              </div>

              {/* Ticking Time and Calendar Widget */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md rounded-lg px-3 py-1 border border-white/10 text-[11px] font-medium shadow-2xs">
                  <Calendar className="h-3 w-3 text-blue-100" />
                  <span>{getMoroccanFormattedDate()}</span>
                </div>

                <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-md rounded-lg px-3 py-1 border border-blue-300/20 text-[11px] font-extrabold font-mono tracking-wider shadow-2xs">
                  <Clock className="h-3 w-3 text-sky-100 animate-pulse" />
                  <span>{currentTime || "13:34:00"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* New Bento Cards Grid (Screenshot 1 Layout with circles & counts) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1 - Total Students */}
            <motion.div 
              whileHover={{ scale: 1.02, y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              onClick={() => setActiveTab("students")}
              className="bg-white p-6 rounded-[24px] border border-slate-150/80 shadow-sm hover:shadow-md cursor-pointer relative group flex flex-col justify-between min-h-[160px]"
            >
              <div className="flex justify-between items-start">
                <div className="h-12 w-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 shrink-0">
                  <Users className="h-6 w-6 stroke-[2.3]" />
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black text-slate-900 tracking-tight leading-none block">
                    {totalStudents}
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-xs font-bold text-black uppercase tracking-wider block">
                  Total des Élèves
                </h4>
                
                {/* Check & Cross Badges as on screen */}
                <div className="flex gap-2 mt-2">
                  <span className="text-[10px] font-extrabold bg-[#e6f4ea] text-[#137333] px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
                    ✓ {activeStudents.length}
                  </span>
                  <span className="text-[10px] font-extrabold bg-slate-50 text-black px-2 py-0.5 rounded-full border border-slate-200 flex items-center gap-1">
                    ✕ {totalStudents - activeStudents.length}
                  </span>
                </div>
              </div>

              {/* Arrow Round Button bottom right */}
              <div className="absolute bottom-5 right-5 h-8 w-8 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 transition group-hover:bg-rose-100 group-hover:scale-110">
                <ArrowRight className="h-4 w-4" />
              </div>
            </motion.div>

            {/* Card 2 - Total Teachers */}
            <motion.div 
              whileHover={{ scale: 1.02, y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              onClick={() => setActiveTab("teachers")}
              className="bg-white p-6 rounded-[24px] border border-slate-150/80 shadow-sm hover:shadow-md cursor-pointer relative group flex flex-col justify-between min-h-[160px]"
            >
              <div className="flex justify-between items-start">
                <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0">
                  <GraduationCap className="h-6 w-6 stroke-[2.3]" />
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black text-slate-900 tracking-tight leading-none block">
                    {totalTeachers}
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-xs font-bold text-black uppercase tracking-wider block">
                  Enseignants
                </h4>
                
                <div className="flex gap-2 mt-2">
                  <span className="text-[10px] font-extrabold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-100 flex items-center gap-1">
                    ✓ {teachers.filter(t => t.status === "actif").length} {t("actifs")}
                  </span>
                </div>
              </div>

              <div className="absolute bottom-5 right-5 h-8 w-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 transition group-hover:bg-indigo-100 group-hover:scale-110">
                <ArrowRight className="h-4 w-4" />
              </div>
            </motion.div>

            {/* Card 3 - Active Classes */}
            <motion.div 
              whileHover={{ scale: 1.02, y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              onClick={() => setActiveTab("classes")}
              className="bg-white p-6 rounded-[24px] border border-slate-150/80 shadow-sm hover:shadow-md cursor-pointer relative group flex flex-col justify-between min-h-[160px]"
            >
              <div className="flex justify-between items-start">
                <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
                  <School className="h-6 w-6 stroke-[2.3]" />
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black text-slate-900 tracking-tight leading-none block">
                    {totalClasses}
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-xs font-bold text-black uppercase tracking-wider block">
                  Classes Actives
                </h4>
                
                <div className="flex gap-2 mt-2">
                  <span className="text-[10px] font-extrabold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-100 flex items-center gap-1">
                    📚 {totalSubjects} Matières
                  </span>
                </div>
              </div>

              <div className="absolute bottom-5 right-5 h-8 w-8 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 transition group-hover:bg-amber-100 group-hover:scale-110">
                <ArrowRight className="h-4 w-4" />
              </div>
            </motion.div>

            {/* Card 4 - Recovery Rate */}
            <motion.div 
              whileHover={{ scale: 1.02, y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              onClick={() => setActiveTab("financials")}
              className="bg-white p-6 rounded-[24px] border border-slate-150/80 shadow-sm hover:shadow-md cursor-pointer relative group flex flex-col justify-between min-h-[160px]"
            >
              <div className="flex justify-between items-start">
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
                  <TrendingUp className="h-6 w-6 stroke-[2.3]" />
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black text-slate-900 tracking-tight leading-none block">
                    {collectionRate}%
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-xs font-bold text-black uppercase tracking-wider block">
                  Recouvrement
                </h4>
                
                <div className="flex gap-2 mt-2">
                  <span className="text-[10px] font-extrabold bg-emerald-50 text-[#137333] px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
                    ✓ {totalRevenueCollected.toLocaleString()} MAD
                  </span>
                </div>
              </div>

              <div className="absolute bottom-5 right-5 h-8 w-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 transition group-hover:bg-emerald-100 group-hover:scale-110">
                <ArrowRight className="h-4 w-4" />
              </div>
            </motion.div>

          </div>

      {/* Main Grid: Analytical overview & status widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           {/* Left column: Cycles & Financial distributions */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Revenue distribution bar */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-500" /> {t("budget_billing")}
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 xs:grid-cols-3 gap-3 xs:gap-4 text-center">
                <div className="p-2.5 xs:p-3 bg-slate-50 rounded-xl">
                  <span className="text-[10px] xs:text-xs text-black block">{t("total_invoiced")}</span>
                  <span className="text-base xs:text-lg font-bold text-slate-800">
                    {totalRevenueExpected.toLocaleString()} MAD
                  </span>
                </div>
                <div className="p-2.5 xs:p-3 bg-emerald-50 rounded-xl border border-emerald-50">
                  <span className="text-[10px] xs:text-xs text-emerald-600 block">{t("collected_paid")}</span>
                  <span className="text-base xs:text-lg font-bold text-emerald-700">
                    {totalRevenueCollected.toLocaleString()} MAD
                  </span>
                </div>
                <div className="p-2.5 xs:p-3 bg-rose-50 rounded-xl border border-rose-50">
                  <span className="text-[10px] xs:text-xs text-rose-500 block">{t("remaining_unpaid")}</span>
                  <span className="text-base xs:text-lg font-bold text-rose-700">
                    {totalRevenuePending.toLocaleString()} MAD
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-xs text-black mb-1.5">
                  <span>{t("recovery_rate")}</span>
                  <span className="font-semibold text-slate-700">{collectionRate}%</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full transition-all duration-500"
                    style={{ width: `${collectionRate}%` }}
                  />
                  <div 
                    className="bg-rose-400 h-full transition-all duration-500"
                    style={{ width: `${100 - collectionRate}%` }}
                  />
                </div>
                <p className="text-[11px] text-black mt-2 text-center">
                  {t("disclaimer_revenue")}
                </p>
              </div>
            </div>
          </div>

          {/* Distribution by Academic Cycles */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-500" /> {t("distribution_cycles")}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Primaire */}
              <div className="border border-slate-100 p-4 rounded-xl relative overflow-hidden bg-gradient-to-tr from-sky-50/20 to-white">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-sky-400" />
                <h4 className="font-semibold text-sky-900 text-sm">{t("cycle_primer")}</h4>
                <p className="text-xs text-sky-600 mt-1">CP à la 6ème AP</p>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-sky-950">{cycles["Primaire"]}</span>
                  <span className="text-xs text-sky-600 font-medium">{t("students")}</span>
                </div>
                <div className="mt-2 w-full bg-sky-100/50 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-sky-500 h-full rounded-full" 
                    style={{ width: `${totalStudents ? (cycles["Primaire"] / totalStudents) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Collège */}
              <div className="border border-slate-100 p-4 rounded-xl relative overflow-hidden bg-gradient-to-tr from-indigo-50/20 to-white">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500" />
                <h4 className="font-semibold text-indigo-900 text-sm">{t("cycle_college")}</h4>
                <p className="text-xs text-indigo-600 mt-1">1ère à 3ème Année</p>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-indigo-950">{cycles["Collège"]}</span>
                  <span className="text-xs text-indigo-600 font-medium">{t("students")}</span>
                </div>
                <div className="mt-2 w-full bg-indigo-100/50 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-full rounded-full" 
                    style={{ width: `${totalStudents ? (cycles["Collège"] / totalStudents) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Lycée */}
              <div className="border border-slate-100 p-4 rounded-xl relative overflow-hidden bg-gradient-to-tr from-violet-50/20 to-white">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-violet-500" />
                <h4 className="font-semibold text-violet-900 text-sm">{t("cycle_lycee")}</h4>
                <p className="text-xs text-violet-600 mt-1">Tronc Commun & BAC</p>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-violet-950">{cycles["Lycée"]}</span>
                  <span className="text-xs text-violet-600 font-medium">{t("students")}</span>
                </div>
                <div className="mt-2 w-full bg-violet-100/50 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-violet-600 h-full rounded-full" 
                    style={{ width: `${totalStudents ? (cycles["Lycée"] / totalStudents) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Academic Performance Chart */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" /> Performances Scolaires Globales
            </h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={performanceData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="subject" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    domain={[0, 20]}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  <Bar 
                    dataKey="moyenne" 
                    name="Moyenne Générale (/20)"
                    fill="#3b82f6" 
                    radius={[4, 4, 0, 0]} 
                    barSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right column: Action center and Alerts */}
        <div className="space-y-6">

          {/* Morocco School Announcements / Identity widget */}
          <div className="bg-gradient-to-br from-amber-900 via-amber-800 to-teal-900 text-amber-50 p-6 rounded-2xl border border-amber-950 shadow-md">
            <h3 className="text-md font-bold tracking-wide text-amber-300 uppercase flex items-center gap-2">
              🇲🇦 {t("moroccan_comp")}
            </h3>
            <p className="text-xs text-amber-100 mt-2 leading-relaxed">
              {t("comp_desc")}
            </p>
            <div className="mt-4 pt-3 border-t border-amber-700/50 flex justify-between items-center text-[11px]">
              <span className="text-amber-200">{t("saas_premium")}</span>
              <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                Coaching & Com'
              </span>
            </div>
          </div>

          {/* Action and Warnings Alerts */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              {t("alerts_system")}
            </h3>

            {/* Late invoices alert */}
            {lateInvoicesCount > 0 ? (
              <div className="flex gap-3 bg-rose-50 p-3 rounded-xl border border-rose-100 text-rose-800">
                <AlertTriangle className="h-5 w-5 shrink-0 text-rose-600" />
                <div>
                  <h4 className="text-xs font-semibold">{t("late_invoices")}</h4>
                  <p className="text-[11px] text-rose-600 mt-0.5">
                    {lateInvoicesCount} {t("late_desc")}
                  </p>
                  <button 
                    onClick={() => setActiveTab("financials")} 
                    className="text-xs font-bold text-rose-800 underline mt-1.5 focus:outline-none"
                  >
                    {t("remind_parents")}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-3 bg-emerald-50 p-3 rounded-xl border border-emerald-100 text-emerald-800">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                <div>
                  <h4 className="text-xs font-semibold">{t("zero_delay")}</h4>
                  <p className="text-[11px] text-emerald-600">
                    {t("zero_delay_desc")}
                  </p>
                </div>
              </div>
            )}

            {/* Class Capacity Alerts */}
            {capacityAlerts.length > 0 && (
              <div className="flex gap-3 bg-amber-50 p-3 rounded-xl border border-amber-100 text-amber-800">
                <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
                <div>
                  <h4 className="text-xs font-semibold">{t("alerts_capacity")}</h4>
                  <p className="text-[11px] text-amber-600 mt-0.5">
                    {capacityAlerts.map(c => c.name).join(", ")} {t("capacity_desc")}
                  </p>
                  <button 
                    onClick={() => setActiveTab("classes")} 
                    className="text-xs font-bold text-amber-800 underline mt-1.5 focus:outline-none"
                  >
                    {t("adjust_capacity")}
                  </button>
                </div>
              </div>
            )}

            {/* Missing Documents Alert */}
            {missingDocsCount > 0 && (
              <div className="flex gap-3 bg-indigo-50 p-3 rounded-xl border border-indigo-100 text-indigo-800">
                <FileWarning className="h-5 w-5 shrink-0 text-indigo-500" />
                <div>
                  <h4 className="text-xs font-semibold">{t("missing_docs")}</h4>
                  <p className="text-[11px] text-indigo-600 mt-0.5">
                    {missingDocsCount} {t("missing_docs_desc")}
                  </p>
                  <button 
                    onClick={() => setActiveTab("students")} 
                    className="text-xs font-bold text-indigo-800 underline mt-1.5 focus:outline-none"
                  >
                    {t("review_docs")}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Stats list */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">
              {t("recent_invoices")}
            </h3>
            <div className="divide-y divide-slate-100 space-y-2.5">
              {recentInvoices.map(inv => {
                const std = students.find(s => s.id === inv.studentId);
                return (
                  <div key={inv.id} className="flex justify-between items-center pt-2.5 first:pt-0">
                    <div>
                      <p className="text-xs font-medium text-slate-800">
                        {std ? `${std.firstName} ${std.lastName}` : "Élève Inconnu"}
                      </p>
                      <p className="text-[10px] text-black">{inv.month}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-850">{inv.amount} MAD</p>
                      <span className={`inline-block text-[9px] px-1.5 py-0.2 rounded-full font-medium ${
                        inv.status === "payé" 
                          ? "bg-emerald-50 text-emerald-700" 
                          : inv.status === "retard" 
                            ? "bg-rose-50 text-rose-700" 
                            : "bg-amber-50 text-amber-700"
                      }`}>
                        {inv.status === "payé" ? t("paye") : inv.status === "retard" ? t("retard") : t("brouillon")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => setActiveTab("financials")}
              className="w-full mt-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-black font-semibold py-1.5 px-3 rounded-lg text-xs transition duration-150 animate-pulse-subtle"
            >
              {t("consult_all")}
            </button>
          </div>

        </div>

      </div>

      {/* NEW: Centre de Documentation interactive block mirroring screenshot 3 */}
      <div className="bg-[#fcfcff] border border-slate-150 p-6 rounded-[28px] shadow-sm mt-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-100/50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        {/* Banner with purple gradient & white geometric plus repeat pattern */}
        <div className="relative overflow-hidden bg-gradient-to-tr from-[#7a3bed] via-[#6366f1] to-[#4387f6] text-white p-6 sm:p-7 rounded-[22px] shadow-md border border-indigo-400/20 mb-6">
          <div className="absolute inset-0 opacity-[0.09] pointer-events-none mix-blend-overlay select-none" style={{
            backgroundImage: 'radial-gradient(circle, #fff 1.5px, transparent 1.5px), radial-gradient(circle, #fff 1.5px, transparent 1.5px)',
            backgroundSize: '24px 24px',
            backgroundPosition: '0 0, 12px 12px'
          }}></div>
          
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2">
              <span className="bg-white/20 backdrop-blur-md text-[10px] uppercase font-mono border border-white/20 font-extrabold px-3 py-1 rounded-lg flex items-center gap-1">
                <FileText className="h-3 w-3 text-indigo-200" /> V2.0
              </span>
              <span className="text-[10px] bg-amber-400 text-slate-900 font-extrabold px-2.5 py-1 rounded-lg">AIDE EN LIGNE</span>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight font-sans">
                Centre de Documentation
              </h3>
              <p className="text-sm font-semibold opacity-90 text-blue-50">
                Tout ce que vous devez savoir sur Madrasati
              </p>
            </div>

            {/* Custom Interactive Search input with Lucide icon */}
            <div className="relative mt-2 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-black" />
              </div>
              <input 
                type="text"
                value={docSearchQuery}
                onChange={(e) => setDocSearchQuery(e.target.value)}
                placeholder="Rechercher dans la documentation..."
                className="block w-full pl-10 pr-4 py-3 bg-white text-slate-800 placeholder-slate-400 font-semibold border-none rounded-[14px] text-xs focus:outline-none focus:ring-2 focus:ring-amber-400/80 shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Documentation Category Tags */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <button 
            type="button"
            onClick={() => setSelectedDocCategory("all")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${selectedDocCategory === "all" ? "bg-[#0b5edd] text-white shadow-sm" : "bg-white border border-slate-200 text-black hover:bg-slate-50"}`}
          >
            📋 Tout
          </button>
          <button 
            type="button"
            onClick={() => setSelectedDocCategory("demarrage")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${selectedDocCategory === "demarrage" ? "bg-[#0b5edd] text-white shadow-sm" : "bg-white border border-slate-200 text-black hover:bg-slate-50"}`}
          >
            🚀 Démarrage
          </button>
          <button 
            type="button"
            onClick={() => setSelectedDocCategory("personnes")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${selectedDocCategory === "personnes" ? "bg-[#0b5edd] text-white shadow-sm" : "bg-white border border-slate-200 text-black hover:bg-slate-50"}`}
          >
            👥 Personnes & Administration
          </button>
        </div>

        {/* Doc Guide Cards List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {DOC_GUIDES
          .filter(guide => {
            const matchesSearch = guide.title.toLowerCase().includes(docSearchQuery.toLowerCase()) || 
                                  guide.desc.toLowerCase().includes(docSearchQuery.toLowerCase());
            const matchesCategory = selectedDocCategory === "all" || guide.category === selectedDocCategory;
            return matchesSearch && matchesCategory;
          })
          .map(g => (
            <div key={g.id} className="bg-white p-5 rounded-[20px] border border-slate-150 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-extrabold bg-[#e8f0fe] text-[#1a73e8] px-2.5 py-0.5 rounded-full border border-blue-100">
                    {g.difficulty}
                  </span>
                  <span className="text-[10px] font-extrabold bg-slate-100 text-black px-2 py-0.5 rounded-full border border-slate-200">
                    {g.steps}
                  </span>
                </div>
                
                <h4 className="text-base font-bold text-slate-800 leading-tight">
                  {g.title}
                </h4>
                
                <p className="text-xs text-black font-semibold leading-relaxed">
                  {g.desc}
                </p>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                <button 
                  type="button"
                  onClick={() => {
                    setSelectedGuide(g);
                  }}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 cursor-pointer hover:translate-x-0.5 transition"
                >
                  Voir le guide <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Support Chatbot Button matching Screenshot 3 style - truly floating and interactive */}
      <div className="fixed bottom-6 right-6 z-[160] md:bottom-8 md:right-8 flex flex-col items-end">
        {isChatOpen && (
          <div className="mb-4 bg-white rounded-2xl shadow-2xl border border-slate-200 w-80 sm:w-96 overflow-hidden flex flex-col animate-scale-up">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#0b5edd] to-[#6366f1] text-white p-4 flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center font-extrabold text-sm relative">
                  M
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-emerald-400 rounded-full border-2 border-[#0b5edd]"></span>
                </div>
                <div>
                  <h4 className="text-xs font-black tracking-wide uppercase">Assistant Madrasati</h4>
                  <p className="text-[10px] text-blue-100 font-medium">En ligne · Réponse instantanée</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsChatOpen(false)}
                className="text-white/80 hover:text-white font-extrabold text-sm focus:outline-none"
              >
                ✕
              </button>
            </div>

            {/* Message Feed */}
            <div className="p-4 h-64 overflow-y-auto space-y-3 bg-slate-50 flex flex-col">
              {chatMessages.map((msg, index) => (
                <div 
                  key={index}
                  className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-sm flex flex-col ${
                    msg.sender === "user" 
                      ? "bg-[#0b5edd] text-white self-end rounded-tr-none" 
                      : "bg-white text-slate-850 border border-slate-100 self-start rounded-tl-none"
                  }`}
                >
                  <span>{msg.text}</span>
                  <span className={`text-[9px] mt-1 self-end ${msg.sender === "user" ? "text-blue-200" : "text-black"} font-mono`}>
                    {msg.time}
                  </span>
                </div>
              ))}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendChatMessage} className="p-3 bg-white border-t border-slate-100 flex gap-2">
              <input 
                type="text"
                placeholder="Posez votre question... (ex: appel, élève)"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className="flex-1 bg-slate-100 focus:bg-slate-50 border border-transparent focus:border-blue-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none transition"
              />
              <button 
                type="submit"
                className="bg-[#0b5edd] hover:bg-[#094ebb] text-white h-8 w-8 rounded-xl flex items-center justify-center cursor-pointer transition shrink-0 shadow-sm animate-pulse"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}

        <button 
          type="button"
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`h-14 w-14 rounded-full bg-gradient-to-tr from-[#7a3bed] to-[#6366f1] text-white flex items-center justify-center shadow-2xl hover:scale-105 active:scale-[0.98] transition-all duration-200 cursor-pointer border-2 border-white/20`}
        >
          <MessageCircle className="h-7 w-7" />
          <span className="absolute right-16 bg-slate-900 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap shadow-lg border border-slate-750 pointer-events-none">
            Besoin d'aide ? Clavarder avec Madrasati
          </span>
        </button>
      </div>

      {/* NEW: Guide modal to let them preview documentation content directly */}
      {selectedGuide && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[150] p-4 animate-fade-in">
          <div className="bg-white rounded-[24px] max-w-lg w-full overflow-hidden shadow-2xl border border-slate-150 animate-scale-up">
            <div className="p-6 bg-gradient-to-r from-indigo-600 to-blue-600 text-white flex justify-between items-center">
              <div>
                <span className="text-[9px] bg-white/20 border border-white/20 text-white font-extrabold uppercase px-2 py-0.5 rounded tracking-widest">Guide Interactif</span>
                <h3 className="text-lg font-extrabold tracking-tight mt-1">{selectedGuide.title}</h3>
              </div>
              <button 
                type="button"
                onClick={() => setSelectedGuide(null)}
                className="bg-white/10 hover:bg-white/20 text-white rounded-lg h-8 w-8 flex items-center justify-center cursor-pointer transition font-bold"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-xs text-black font-bold leading-relaxed">
                {selectedGuide.desc}
              </p>
              
              <div className="space-y-3 font-semibold">
                {selectedGuide.content.map((step, index) => {
                  // Split "Étape 1: Texte..."
                  const parts = step.split(":");
                  const text = parts.length > 1 ? parts.slice(1).join(":").trim() : step;
                  return (
                    <div key={index} className="flex items-start gap-2.5 p-2 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="h-5 w-5 rounded-full bg-[#0b5edd] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{index + 1}</span>
                      <p className="text-xs text-slate-750">{text}</p>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button 
                  type="button"
                  onClick={() => setSelectedGuide(null)}
                  className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded-xl cursor-pointer"
                >
                  J'ai compris
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SaaS Subscription tariffs plans section */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-150 shadow-sm mt-8 relative overflow-hidden">
        {/* Decorative corner bg */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider">
            SaaS Plan Matrix
          </span>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-800 mt-3">
            {t("pricing_title")}
          </h3>
          <p className="text-sm text-black mt-2">
            {t("pricing_subtitle")}
          </p>

          {/* Billing Cycle Switch */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <button 
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                billingCycle === "monthly" 
                  ? "bg-slate-800 text-white shadow-sm font-bold" 
                  : "bg-slate-50 text-black hover:bg-slate-100"
              }`}
            >
              {billingCycle === "monthly" ? "● " : ""}{t("billing_monthly")}
            </button>
            <button 
              onClick={() => setBillingCycle("annual")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all flex items-center gap-1 ${
                billingCycle === "annual" 
                  ? "bg-indigo-650 text-white shadow-sm font-bold" 
                  : "bg-slate-50 text-black hover:bg-slate-100"
              }`}
            >
              <span>{billingCycle === "annual" ? "★ " : "🚀 "}</span>
              <span>{t("billing_annual")}</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Plan 1 - Micro */}
          <div className={`p-6 rounded-2xl border transition-all duration-200 relative flex flex-col justify-between ${
            activePlan === "micro"
              ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/5 shadow-md"
              : "border-slate-150 hover:border-slate-300 bg-white shadow-sm"
          }`}>
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                  <Building className="h-4 w-4 text-black" />
                  {t("plan_micro")}
                </span>
                {activePlan === "micro" && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {t("current_plan")}
                  </span>
                )}
              </div>
              <p className="text-xs text-black min-h-[32px]">{t("plan_micro_desc")}</p>
              
              <div className="my-6">
                <span className="text-3xl font-black text-slate-900">
                  {billingCycle === "monthly" ? t("plan_micro_price_m") : t("plan_micro_price_y")}
                </span>
                <span className="text-xs text-black font-semibold ml-1">
                  {t("mad")} / {billingCycle === "monthly" ? t("per_month") : t("per_year")}
                </span>
              </div>

              {/* Limit */}
              <div className="text-xs text-black mb-6 font-semibold bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex justify-between items-center">
                <span>{t("student_limit")}</span>
                <span className="text-indigo-650 font-bold">100</span>
              </div>

              {/* Features list */}
              <ul className="space-y-2.5 mb-8 text-xs text-slate-650">
                {(translations[lang].plan_micro_features as string[]).map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => handleSelectPlan("micro", t("plan_micro") as string)}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                activePlan === "micro"
                  ? "bg-slate-300 text-black cursor-default"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200"
              }`}
              disabled={activePlan === "micro"}
            >
              {activePlan === "micro" ? "✔ " + t("current_plan") : t("choose_plan")}
            </button>
          </div>

          {/* Plan 2 - Croissance */}
          <div className={`p-6 rounded-2xl border transition-all duration-200 relative flex flex-col justify-between ${
            activePlan === "croissance"
              ? "border-emerald-500 ring-4 ring-emerald-500/20 bg-emerald-50/10 scale-[1.02] shadow-xl"
              : "border-slate-150 hover:border-slate-300 bg-white"
          }`}>
            {/* Tag for Recommended */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-teal-500 text-white text-[9px] uppercase font-bold px-3.5 py-1 rounded-full tracking-widest shadow-sm flex items-center gap-1 text-center whitespace-nowrap">
              <Star className="h-2.5 w-2.5 fill-white shrink-0" /> Recommended / الباقة الموصى بها
            </div>

            <div className="mt-2">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-extrabold text-indigo-700 flex items-center gap-1.5">
                  <Briefcase className="h-4 w-4 text-indigo-600" />
                  {t("plan_croissance")}
                </span>
                {activePlan === "croissance" && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {t("current_plan")}
                  </span>
                )}
              </div>
              <p className="text-xs text-black min-h-[32px]">{t("plan_croissance_desc")}</p>
              
              <div className="my-6">
                <span className="text-3xl font-black text-indigo-900">
                  {billingCycle === "monthly" ? t("plan_croissance_price_m") : t("plan_croissance_price_y")}
                </span>
                <span className="text-xs text-black font-semibold ml-1">
                  {t("mad")} / {billingCycle === "monthly" ? t("per_month") : t("per_year")}
                </span>
              </div>

              {/* Limit */}
              <div className="text-xs text-slate-650 mb-6 font-semibold bg-indigo-50/20 p-2.5 rounded-xl border border-indigo-100/30 flex justify-between items-center">
                <span>{t("student_limit")}</span>
                <span className="text-indigo-650 font-bold">350</span>
              </div>

              {/* Features list */}
              <ul className="space-y-2.5 mb-8 text-xs text-slate-650">
                {(translations[lang].plan_croissance_features as string[]).map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => handleSelectPlan("croissance", t("plan_croissance") as string)}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all relative overflow-hidden ${
                activePlan === "croissance"
                  ? "bg-slate-300 text-black cursor-default"
                  : "bg-indigo-600 hover:bg-indigo-755 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200"
              }`}
              disabled={activePlan === "croissance"}
            >
              {activePlan === "croissance" ? "✔ " + t("current_plan") : t("choose_plan")}
            </button>
          </div>

          {/* Plan 3 - Excellence */}
          <div className={`p-6 rounded-2xl border transition-all duration-200 relative flex flex-col justify-between ${
            activePlan === "excellence"
              ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/5 shadow-md"
              : "border-slate-150 hover:border-slate-300 bg-white shadow-sm"
          }`}>
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-extrabold text-amber-700 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  {t("plan_excellence")}
                </span>
                {activePlan === "excellence" && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {t("current_plan")}
                  </span>
                )}
              </div>
              <p className="text-xs text-black min-h-[32px]">{t("plan_excellence_desc")}</p>
              
              <div className="my-6">
                <span className="text-3xl font-black text-slate-900">
                  {billingCycle === "monthly" ? t("plan_excellence_price_m") : t("plan_excellence_price_y")}
                </span>
                <span className="text-xs text-black font-semibold ml-1">
                  {t("mad")} / {billingCycle === "monthly" ? t("per_month") : t("per_year")}
                </span>
              </div>

              {/* Limit */}
              <div className="text-xs text-slate-650 mb-6 font-semibold bg-amber-50/20 p-2.5 rounded-xl border border-amber-100/30 flex justify-between items-center">
                <span>{t("student_limit")}</span>
                <span className="text-amber-600 font-bold">{t("unlimited")}</span>
              </div>

              {/* Features list */}
              <ul className="space-y-2.5 mb-8 text-xs text-slate-650">
                {(translations[lang].plan_excellence_features as string[]).map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-teal-650 shrink-0 animate-pulse" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => handleSelectPlan("excellence", t("plan_excellence") as string)}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                activePlan === "excellence"
                  ? "bg-slate-300 text-black cursor-default"
                  : "bg-slate-800 hover:bg-slate-900 text-white shadow-md shadow-slate-200"
              }`}
              disabled={activePlan === "excellence"}
            >
              {activePlan === "excellence" ? "✔ " + t("current_plan") : t("choose_plan")}
            </button>
          </div>

        </div>
      </div>

      {checkoutData && (
        <SubscriptionCheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          planKey={checkoutData.key}
          planName={checkoutData.name}
          price={checkoutData.price}
          billingCycle={billingCycle}
          onSuccess={handlePaymentSuccess}
          lang={lang}
        />
      )}

    </div>
  );
}
