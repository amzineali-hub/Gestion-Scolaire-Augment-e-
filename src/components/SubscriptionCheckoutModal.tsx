import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  CreditCard, 
  Building2, 
  Wallet, 
  CheckCircle2, 
  Loader2, 
  UploadCloud, 
  FileText, 
  Download, 
  ShieldCheck, 
  X, 
  ArrowRight, 
  Receipt 
} from "lucide-react";

interface SubscriptionCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  planKey: string;
  planName: string;
  price: string;
  billingCycle: "monthly" | "annual";
  onSuccess: () => void;
  lang?: "fr" | "ar";
}

type PaymentMethod = "card" | "transfer" | "cash";

const locales = {
  fr: {
    title: "Règlement sécurisé de l'abonnement",
    gateway_sub: "SAAS Gateway v2.4 • CMI / VISA Secured",
    monthly: "Abonnement Mensuel",
    annual: "Abonnement Annuel",
    software_licence: "Licence d'utilisation du logiciel de gestion",
    per_month: "par mois",
    per_year: "par an",
    choose_payment: "Choisissez votre mode de paiement",
    card: "Carte Bancaire",
    card_sub: "Visa / Mastercard / CMI",
    transfer: "Virement Bancaire",
    transfer_sub: "Traitement sous 2h-24h",
    cash: "Wafacash / CashPlus",
    cash_sub: "Règlement de proximité",
    card_no: "Numéro de Carte Bancaire",
    expiry: "Date d'Expiration",
    cvv: "CODE CVV (Verso)",
    holder: "Titulaire de la Carte d'Établissement",
    holder_placeholder: "G.S. AR-RACHAD SARL",
    holder_card: "Titulaire",
    sec_card_title: "Madrasati Secure Card",
    bank_beneficiary: "Banque Bénéficiaire :",
    bank_name: "Attijariwafa Bank (Casablanca Principal)",
    acc_holder: "Titulaire du Compte :",
    acc_name: "Editions Madrasati SAAS SARL",
    rib: "Identifiant Bancaire Marocain (RIB) :",
    copier: "Copier",
    copied: "RIB Copié !",
    upload_title: "Déposer ou uploader votre justificatif de virement bancaire (*)",
    upload_success: "Justificatif lié",
    upload_prompt: "Sélectionnez le reçu d'ordre de virement",
    upload_hint: "PDF, JPG ou PNG autorisés (Glissez-déposez)",
    cash_alert: "Règlement Direct en Guichet National :",
    cash_alert_desc: "Rendez-vous dans n'importe quelle agence physique de nos partenaires Wafacash ou Cash Plus à travers le Maroc muni du code de transaction ci-dessous pour validation instantanée de votre licence de gestion d'école.",
    unique_ref: "RÉFÉRENCE DE PAIEMENT UNIQUE",
    present_code: "Présentez ce code et payez le montant de",
    download_bon: "Télécharger mon Bon de Paiement",
    safe_3d: "Validation 3D Secure active • Liaison bancaire cryptée",
    cancel: "Annuler",
    confirm_pay: "Confirmer le Règlement",
    processing_title: "Traitement de la Transaction Bancaire...",
    processing_desc: "Veuillez ne pas fermer cette fenêtre. Nous réalisons la sécurisation 3D Secure de votre formule d'abonnement auprès du Centre Monétique Interbancaire (Morocco).",
    cancel_processing: "Annuler & Revenir",
    success_title: "Licence Activée Avec Succès !",
    success_desc: "Le compte de votre établissement scolaire a été rattaché aux modes de paiement automatiques.",
    formule_active: "Formule Active",
    reglement: "Règlement :",
    cycle: "Cycle de facturation :",
    montant: "Montant Acquitté :",
    statut_finance: "Statut Financier :",
    validated: "Validé par CMI",
    recu_pdf: "Reçu de Caisse PDF",
    access_space: "Accéder à l'Espace",
    moroccan_card: "Carte Bancaire Secured",
    moroccan_transfer: "Ordre de Virement validé",
    moroccan_cash: "Guichet Physique",
    moroccan_monthly: "Mensuel",
    moroccan_annual: "Annuel (Bonifié)",
    copied_alert: "RIB Copié dans le presse-papiers !",
    bon_download_notif: "Fiche Wafacash générée ! Présentez-la d'ici 48 heures.",
    receipt_subject: "REÇU DE PAIEMENT - ABONNEMENT MADRASATI",
    receipt_editor: "Madrasati SAAS • Casablanca, Maroc",
    receipt_date: "Date de règlement",
    receipt_ref: "Numéro de transaction",
    receipt_mode: "Mode de règlement",
    receipt_formula: "Bande d'Abonnement",
    receipt_cycle: "Cycle de facturation",
    receipt_amount: "Montant acquitté",
    receipt_status: "État de la transaction",
    receipt_status_val: "Transaction active (Encaissée par CMI)",
    receipt_thanks: "Merci de faire confiance à Madrasati pour votre gestion scolaire !",
    receipt_uid: "ID Établissement rattaché"
  },
  ar: {
    title: "التسوية الآمنة للاشتراك المدرسي",
    gateway_sub: "بوابة SAAS الآمنة v2.4 • مصادقة CMI / VISA",
    monthly: "اشتراك شهري",
    annual: "اشتراك سنوي",
    software_licence: "رخصة استخدام برنامج إدارة المؤسسة التعليمية",
    per_month: "في الشهر",
    per_year: "في السنة",
    choose_payment: "اختر طريقة الدفع المفضلة لديك",
    card: "بطاقة بنكية مغربية",
    card_sub: "فيزا / ماستركارد / CMI",
    transfer: "تحويل بنكي",
    transfer_sub: "معالجة خلال 2 إلى 24 ساعة",
    cash: "وفاكاش / كاش بلوس",
    cash_sub: "الدفع النقدي بوكالة القرب",
    card_no: "رقم البطاقة البنكية",
    expiry: "تاريخ انتهاء الصلاحية",
    cvv: "رمز الأمان CVV (خلف البطاقة)",
    holder: "اسم المؤسسة صاحب البطاقة",
    holder_placeholder: "مجموعة مدارس الرشاد ش.م.م",
    holder_card: "صاحب البطاقة",
    sec_card_title: "بطاقة دفع مدرستي الآمنة",
    bank_beneficiary: "البنك المستفيد:",
    bank_name: "التجاري وفا بنك (الوكالة الرئيسية بالدار البيضاء)",
    acc_holder: "صاحب الحساب البنكي:",
    acc_name: "منشورات مدرستي للبرمجيات ذ.م.م",
    rib: "المعرف البنكي المغربي الموحد (RIB) :",
    copier: "نسخ",
    copied: "تم النسخ بنجاح !",
    upload_title: "يرجى تحميل أو سحب وصل عملية التحويل البنكي (*)",
    upload_success: "تم ربط وصل التحويل بنجاح",
    upload_prompt: "انقر لاختيار ملف وصل التحويل البنكي",
    upload_hint: "الملفات المسموح بها: PDF, JPG, PNG (أو اسحب الملف هنا)",
    cash_alert: "الدفع المباشر في الشباك الوطني المعتمد:",
    cash_alert_desc: "توجهوا إلى أقرب وكالة شريكة لـ وفاكاش (Wafacash) أو كاش بلوس (Cash Plus) في أي مكان بالمغرب مصحوبين برمز المعاملة أسفله لتأصيل وتفعيل رخصتكم فوراً بالوكالة.",
    unique_ref: "مرجع الدفع الموحد والفريد للعملية",
    present_code: "قدم هذا الرمز للمستشار بالوكالة وأدّ مبلغ",
    download_bon: "تحميل وثيقة الدفع المسبق لوكالة القرب",
    safe_3d: "تأمين 3D Secure نشط • اتصال دفع بنكي مشفر بالكامل",
    cancel: "إلغاء",
    confirm_pay: "تأكيد وإتمام الدفع",
    processing_title: "جاري معالجة المعاملة البنكية ماليًا...",
    processing_desc: "يرجى عدم إغلاق هذه الصفحة. نقوم حالياً بالتحقق الثلاثي الآمن لطلب تفعيل رخصة اشتراككم مع المركز النقدي المغربي CMI.",
    cancel_processing: "إلغاء والعودة للخيارات",
    success_title: "تم تفعيل باقة الاشتراك للمؤسسة بنجاح !",
    success_desc: "تم بالكامل ربط الفوترة الآلية ونظام العقد السحابي لمؤسستكم التعليمية بنجاح.",
    formule_active: "الباقة النشطة الحالية",
    reglement: "طريقة وفاء الحساب:",
    cycle: "دورة الفوترة الزمنية:",
    montant: "المبلغ الذي تم تأديته:",
    statut_finance: "الوضعية المالية الحالية للترخيص:",
    validated: "مقبول ومصادق ومعتمد من طرف CMI",
    recu_pdf: "إيصال الأداء المالي PDF",
    access_space: "دخول الفضاء ومتابعة العمل",
    moroccan_card: "بطاقة بنكية آمنة CMI",
    moroccan_transfer: "تحويل بنكي مصادق عليه",
    moroccan_cash: "شباك الأداء المعتمد",
    moroccan_monthly: "شهري",
    moroccan_annual: "سنوي (شامل الحوافز)",
    copied_alert: "تم نسخ رقم المعرف البنكي (RIB) للحافظة !",
    bon_download_notif: "تم إصدار وثيقة الأداء ! يرجى تقديمها بوكالة القرب في غضون 48 ساعة.",
    receipt_subject: "إيصال وثيقة الأداء الإلكترونية - اشتراك مدرستي",
    receipt_editor: "مدرستي SAAS • الدار البيضاء، المغرب",
    receipt_date: "تاريخ الأداء والتحقق",
    receipt_ref: "رقم مرجع المعاملة",
    receipt_mode: "وسيلة الأداء المستخدمة",
    receipt_formula: "باقة رخصة الاشتراك المفعّلة",
    receipt_cycle: "دورة الفوترة الزمنية الراتبة",
    receipt_amount: "المبلغ الإجمالي المؤدى",
    receipt_status: "حالة معالجة العملية",
    receipt_status_val: "نشط ومعتمد وساري المفعول (مصادق من طرف CMI)",
    receipt_thanks: "نشكركم على ثقتكم في منصة مدرستي للتدبير المدرسي الذكي !",
    receipt_uid: "رقم تعريف المؤسسة المربوطة"
  }
};

export default function SubscriptionCheckoutModal({
  isOpen,
  onClose,
  planKey,
  planName,
  price,
  billingCycle,
  onSuccess,
  lang = "fr"
}: SubscriptionCheckoutModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [checkoutStep, setCheckoutStep] = useState<"form" | "processing" | "success">("form");
  
  // Card Form States
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardBrand, setCardBrand] = useState<"visa" | "mastercard" | "unknown">("unknown");

  // Transfer States
  const [transferProofFile, setTransferProofFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Cash States
  const [cashReference] = useState(() => {
    const val = Math.floor(100000 + Math.random() * 900000);
    return `MD-SAAS-${val}`;
  });

  const tLabel = (key: string) => {
    return (locales[lang] as any)?.[key] || (locales["fr"] as any)[key] || "";
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\s+/g, "");
    if (raw.length > 16) raw = raw.slice(0, 16);
    
    // Simple brand detection
    if (raw.startsWith("4")) {
      setCardBrand("visa");
    } else if (/^5[1-5]/.test(raw)) {
      setCardBrand("mastercard");
    } else {
      setCardBrand("unknown");
    }

    // Format with spaces
    const parts = [];
    for (let i = 0; i < raw.length; i += 4) {
      parts.push(raw.slice(i, i + 4));
    }
    setCardNumber(parts.join(" "));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\//g, "").replace(/\s+/g, "");
    if (val.length > 4) val = val.slice(0, 4);
    if (val.length >= 2) {
      val = val.slice(0, 2) + "/" + val.slice(2);
    }
    setCardExpiry(val);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setTransferProofFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setTransferProofFile(e.target.files[0]);
    }
  };

  // Process checkout step
  const handleProceedPayment = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate payment gateway loading
    setCheckoutStep("processing");
    setTimeout(() => {
      setCheckoutStep("success");
    }, 2500);
  };

  const handleFinalize = () => {
    onSuccess();
    onClose();
    // Default back
    setCheckoutStep("form");
    setCardNumber("");
    setCardName("");
    setCardExpiry("");
    setCardCvv("");
    setTransferProofFile(null);
  };

  const triggerReceiptDownload = () => {
    const dateStr = new Date().toLocaleDateString("fr-FR");
    const docContent = `
=============================================
             ${tLabel("receipt_subject")}
             ${tLabel("receipt_editor")}
=============================================
${tLabel("receipt_date")}  : ${dateStr}
${tLabel("receipt_ref")} : TR-${Math.floor(10000000 + Math.random() * 90000000)}
${tLabel("receipt_mode")}   : ${
      paymentMethod === "card" 
        ? tLabel("moroccan_card") 
        : paymentMethod === "transfer" 
        ? tLabel("moroccan_transfer") 
        : tLabel("moroccan_cash")
    }
${tLabel("receipt_formula")}    : ${planName}
${tLabel("receipt_cycle")} : ${billingCycle === "monthly" ? tLabel("moroccan_monthly") : tLabel("moroccan_annual")}
${tLabel("receipt_amount")}   : ${price} MAD

${tLabel("receipt_status")} : ${tLabel("receipt_status_val")}
${tLabel("receipt_thanks")}
---------------------------------------------
${tLabel("receipt_uid")} : ${localStorage.getItem("madrasati_schoolId") || "GS-SAAS-ARRACHAD"}
=============================================
`;
    const blob = new Blob([docContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `recu_madrasati_${planKey}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  const isRTL = lang === 'ar';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden relative"
        dir={isRTL ? "rtl" : "ltr"}
      >
        {/* Top bar with close - ALWAYS AVAILABLE */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-50 text-indigo-700 rounded-lg shrink-0">
              <Receipt className="h-4 w-4" />
            </span>
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm">
                {tLabel("title")}
              </h3>
              <p className="text-[10px] text-black font-medium">{tLabel("gateway_sub")}</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1 text-black hover:text-black hover:bg-slate-100 rounded-full transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form View */}
        {checkoutStep === "form" && (
          <form onSubmit={handleProceedPayment} className="p-6 md:p-8 space-y-6 flex-1 overflow-y-auto">
            
            {/* Purchase Summary header */}
            <div className="bg-indigo-50/40 p-5 rounded-2xl border border-indigo-100/30 flex justify-between items-center">
              <div className={isRTL ? "text-right" : "text-left"}>
                <span className="text-[10px] bg-indigo-100 text-indigo-850 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide">
                  {billingCycle === "monthly" ? tLabel("monthly") : tLabel("annual")}
                </span>
                <h4 className="font-bold text-slate-800 text-sm mt-1.5">{planName}</h4>
                <p className="text-[10px] text-black mt-0.5">{tLabel("software_licence")}</p>
              </div>
              <div className={isRTL ? "text-left" : "text-right"}>
                <p className="text-2xl font-black text-indigo-950 font-display">{price} MAD</p>
                <p className="text-[10px] text-black font-semibold uppercase">{billingCycle === "monthly" ? tLabel("per_month") : tLabel("per_year")}</p>
              </div>
            </div>

            {/* Selection of Moroccan Payment Modes */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-black uppercase">
                {tLabel("choose_payment")}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                
                {/* Mode 1: Credit Card */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                    paymentMethod === "card"
                      ? "border-indigo-600 bg-indigo-50/20 text-indigo-750 shadow-sm"
                      : "border-slate-200 bg-white text-black hover:bg-slate-50"
                  }`}
                >
                  <CreditCard className={`h-5 w-5 ${paymentMethod === "card" ? "text-indigo-600 animate-pulse" : "text-slate-450"}`} />
                  <span className="text-[10.5px] font-bold">{tLabel("card")}</span>
                  <p className="text-[8.5px] text-black font-medium text-center">{tLabel("card_sub")}</p>
                </button>

                {/* Mode 2: Bank Transfer */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("transfer")}
                  className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                    paymentMethod === "transfer"
                      ? "border-indigo-600 bg-indigo-50/20 text-indigo-750 shadow-sm"
                      : "border-slate-200 bg-white text-black hover:bg-slate-50"
                  }`}
                >
                  <Building2 className={`h-5 w-5 ${paymentMethod === "transfer" ? "text-indigo-600 animate-pulse" : "text-slate-450"}`} />
                  <span className="text-[10.5px] font-bold">{tLabel("transfer")}</span>
                  <p className="text-[8.5px] text-black font-medium text-center">{tLabel("transfer_sub")}</p>
                </button>

                {/* Mode 3: Cash Network */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("cash")}
                  className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                    paymentMethod === "cash"
                      ? "border-indigo-600 bg-indigo-50/20 text-indigo-750 shadow-sm"
                      : "border-slate-200 bg-white text-black hover:bg-slate-50"
                  }`}
                >
                  <Wallet className={`h-5 w-5 ${paymentMethod === "cash" ? "text-indigo-600 animate-pulse" : "text-slate-450"}`} />
                  <span className="text-[10.5px] font-bold">{tLabel("cash")}</span>
                  <p className="text-[8.5px] text-black font-medium text-center">{tLabel("cash_sub")}</p>
                </button>

              </div>
            </div>

            {/* Dynamic fields container */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 min-h-[190px]">
              
              {/* CB Content */}
              {paymentMethod === "card" && (
                <div className="space-y-4">
                  {/* Demo/Shortcut Button to Fill Instantly */}
                  <div className="flex flex-col sm:flex-row justify-between items-center bg-indigo-50/70 border border-indigo-100/50 p-3 rounded-2xl gap-2">
                    <div className="text-left">
                      <span className="text-[10px] bg-indigo-200/60 text-indigo-900 px-2 py-0.5 rounded-md font-extrabold uppercase">Mode Évaluation / Démo</span>
                      <p className="text-[10px] text-indigo-750 mt-1 font-medium">Testez le parcours de paiement sans saisie manuelle.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setCardNumber("4263 9012 3647 8821");
                        setCardBrand("visa");
                        setCardExpiry("09/30");
                        setCardCvv("912");
                        setCardName("G.S. AR-RACHAD SARL");
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold py-1.5 px-3 rounded-xl transition active:scale-95 shadow-xs cursor-pointer select-none shrink-0"
                    >
                      Remplir la carte démo ✨
                    </button>
                  </div>

                  {/* Miniature card art indicator */}
                  <div className="hidden sm:block bg-gradient-to-br from-slate-800 to-indigo-950 p-4 text-white rounded-xl shadow-lg relative overflow-hidden aspect-[1.8/1] max-w-[280px] mx-auto border border-white/10 mb-2">
                    <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 w-28 h-28 bg-white/5 rounded-full" />
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-black">{tLabel("sec_card_title")}</span>
                      <span className="text-xs font-black italic">
                        {cardBrand === "visa" ? "VISA" : cardBrand === "mastercard" ? "MC" : "CB"}
                      </span>
                    </div>
                    <div className="mt-6 mb-2">
                      <p className="font-mono text-sm tracking-widest text-slate-100">{cardNumber || "•••• •••• •••• ••••"}</p>
                    </div>
                    <div className="flex justify-between items-end mt-4">
                      <div className="text-left">
                        <span className="text-[7.5px] uppercase tracking-wider text-black block">{tLabel("holder_card")}</span>
                        <p className="font-mono text-[10px] text-slate-200 uppercase truncate max-w-[150px]">{cardName || "GS AR-RACHAD"}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[7.5px] uppercase tracking-wider text-black block">Validité</span>
                        <p className="font-mono text-[10px] text-slate-200">{cardExpiry || "MM/AA"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-505 text-black uppercase mb-1">{tLabel("card_no")}</label>
                      <input
                        type="text"
                        required
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        placeholder="4263 1234 5678 9012"
                        className="w-full text-xs font-mono font-bold border border-slate-200 bg-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-black uppercase mb-1">{tLabel("expiry")}</label>
                      <input
                        type="text"
                        required
                        value={cardExpiry}
                        onChange={handleExpiryChange}
                        placeholder="MM/AA"
                        className="w-full text-xs font-mono font-bold border border-slate-200 bg-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-black uppercase mb-1">{tLabel("cvv")}</label>
                      <input
                        type="password"
                        required
                        value={cardCvv}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          if (val.length <= 4) setCardCvv(val);
                        }}
                        placeholder="•••"
                        className="w-full text-xs font-mono font-bold border border-slate-200 bg-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-black uppercase mb-1">{tLabel("holder")}</label>
                      <input
                        type="text"
                        required
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder={tLabel("holder_placeholder")}
                        className="w-full text-xs uppercase font-semibold border border-slate-200 bg-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Virement Content */}
              {paymentMethod === "transfer" && (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-150 space-y-2 text-xs">
                    <div className="flex justify-between border-b pb-1.5 border-dashed">
                      <span className="text-black">{tLabel("bank_beneficiary")}</span>
                      <span className="font-bold text-slate-700">{tLabel("bank_name")}</span>
                    </div>
                    <div className="flex justify-between border-b pb-1.5 border-dashed">
                      <span className="text-black">{tLabel("acc_holder")}</span>
                      <span className="font-bold text-slate-700">{tLabel("acc_name")}</span>
                    </div>
                    <div className="flex flex-col gap-1.5 pt-1">
                      <span className="text-black">{tLabel("rib")}</span>
                      <div className="flex items-center justify-between bg-slate-50 border p-2 rounded-lg font-mono text-[11px] text-slate-800">
                        <span>007 780 0010045612390812 44</span>
                        <button 
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText("007780001004561239081244");
                            alert(tLabel("copied_alert"));
                          }}
                          className="text-[9px] bg-indigo-650 bg-indigo-600 text-white font-bold px-2 py-1 rounded cursor-pointer"
                        >
                          {tLabel("copier")}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Drag and drop slip transfer receipt upload */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-black uppercase">
                      {tLabel("upload_title")}
                    </label>
                    
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                        isDragging 
                          ? "border-indigo-500 bg-indigo-50/40" 
                          : transferProofFile 
                          ? "border-emerald-400 bg-emerald-50/10" 
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <input 
                        type="file" 
                        id="proof-upload"
                        required={!transferProofFile}
                        onChange={handleFileChange}
                        className="hidden" 
                        accept="image/*,.pdf"
                      />
                      <label htmlFor="proof-upload" className="w-full h-full cursor-pointer py-1 block">
                        {transferProofFile ? (
                          <div className="space-y-1">
                            <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto" />
                            <p className="text-xs font-bold text-slate-700">{transferProofFile.name}</p>
                            <p className="text-[10px] text-black">{(transferProofFile.size / 1024).toFixed(1)} KB • {tLabel("upload_success")}</p>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <UploadCloud className="h-6 w-6 text-black mx-auto animate-pulse" />
                            <p className="text-xs font-bold text-slate-650">{tLabel("upload_prompt")}</p>
                            <p className="text-[9px] text-black">{tLabel("upload_hint")}</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Cash Network Content */}
              {paymentMethod === "cash" && (
                <div className="space-y-4">
                  <div className="bg-amber-50/80 border border-amber-100 p-4 rounded-xl text-xs text-amber-900 leading-relaxed">
                    <p className="font-bold mb-1">🏦 {tLabel("cash_alert")}</p>
                    {tLabel("cash_alert_desc")}
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-slate-150 flex flex-col items-center text-center space-y-1">
                    <span className="text-[9px] text-black uppercase font-black tracking-widest">{tLabel("unique_ref")}</span>
                    <p className="text-lg font-mono font-black text-indigo-950 tracking-wider select-all">{cashReference}</p>
                    <p className="text-[9px] text-black font-semibold">{tLabel("present_code")} {price} MAD</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const dateStr = new Date().toLocaleDateString("fr-FR");
                        const cert = `${tLabel("cash_alert")}\nDate : ${dateStr}\nRéférence : ${cashReference}\nMontant : ${price} MAD\nCode : MADRASATI-SAAS-MOROCCO`;
                        const blob = new Blob([cert], { type: "text/plain;charset=utf-8" });
                        const link = document.createElement("a");
                        link.href = URL.createObjectURL(blob);
                        link.download = `bon_paiement_${cashReference}.txt`;
                        link.click();
                        alert(tLabel("bon_download_notif"));
                      }}
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10.5px] font-bold py-2.5 px-3 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition"
                    >
                      <Download className="h-4 w-4 text-black" /> {tLabel("download_bon")}
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Bottom safe assurance of CMI/VISA */}
            <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-100 bg-white gap-3">
              <div className="flex items-center gap-1.5 text-slate-450 text-[10px] font-bold">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{tLabel("safe_3d")}</span>
              </div>
              
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 hover:bg-slate-50 text-black font-semibold text-xs rounded-xl cursor-pointer border border-transparent hover:border-slate-200 transition"
                >
                  {tLabel("cancel")}
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-md cursor-pointer flex items-center gap-1.5 transition-all"
                >
                  {tLabel("confirm_pay")} <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                </button>
              </div>
            </div>

          </form>
        )}

        {/* Processing/Payment view with Escape/Cancel Ability (NO LOCKUP) */}
        {checkoutStep === "processing" && (
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-6 shadow-inner min-h-[380px] flex-1 overflow-y-auto">
            <Loader2 className="h-12 w-12 text-indigo-600 animate-spin" />
            <h4 className="text-base font-black text-slate-800 tracking-tight">{tLabel("processing_title")}</h4>
            <p className="text-xs text-black max-w-sm leading-relaxed">
              {tLabel("processing_desc")}
            </p>
            
            {/* BACK BUTTON TO PREVENT GETTING BLOCKED */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setCheckoutStep("form")}
                className="px-5 py-2 hover:bg-slate-50 active:bg-slate-100 text-black hover:text-slate-700 font-semibold text-xs rounded-xl cursor-pointer border border-slate-250 border-slate-200 transition"
              >
                {tLabel("cancel_processing")}
              </button>
            </div>
          </div>
        )}

        {/* Success View */}
        {checkoutStep === "success" && (
          <div className="p-8 md:p-10 flex flex-col items-center text-center space-y-6 flex-1 overflow-y-auto">
            <div className="w-16 h-16 bg-emerald-50 rounded-full border border-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="h-10 w-10 animate-bounce" />
            </div>

            <div>
              <h4 className="text-xl font-black text-slate-800 tracking-tight">{tLabel("success_title")}</h4>
              <p className="text-xs text-black mt-1 max-w-md">
                {tLabel("success_desc")}
              </p>
            </div>

            {/* Simulated Receipt Details */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 max-w-sm w-full space-y-2.5 text-xs text-black text-left" dir={isRTL ? "rtl" : "ltr"}>
              <div className="flex justify-between font-bold border-b border-dashed pb-2">
                <span className="text-black">{tLabel("formule_active")}</span>
                <span className="text-slate-800">{planName}</span>
              </div>
              <div className="flex justify-between">
                <span>{tLabel("reglement")}</span>
                <span className="font-semibold text-slate-700">
                  {paymentMethod === "card" ? tLabel("moroccan_card") : paymentMethod === "transfer" ? tLabel("moroccan_transfer") : tLabel("moroccan_cash")}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{tLabel("cycle")}</span>
                <span className="font-semibold text-slate-700">{billingCycle === "monthly" ? tLabel("moroccan_monthly") : tLabel("moroccan_annual")}</span>
              </div>
              <div className="flex justify-between">
                <span>{tLabel("montant")}</span>
                <span className="font-black text-slate-900">{price} MAD</span>
              </div>
              <div className="flex justify-between border-t border-dashed pt-2 text-[10px]">
                <span className="text-black">{tLabel("statut_finance")}</span>
                <span className="text-emerald-700 font-extrabold uppercase">{tLabel("validated")}</span>
              </div>
            </div>

            <div className="flex gap-2.5 w-full max-w-md pt-2">
              <button
                type="button"
                onClick={triggerReceiptDownload}
                className="w-1/2 justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Download className="h-4 w-4" /> {tLabel("recu_pdf")}
              </button>
              
              <button
                type="button"
                onClick={handleFinalize}
                className="w-1/2 justify-center bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-md cursor-pointer flex items-center gap-1.5 transition-all"
              >
                <span>{tLabel("access_space")}</span> <ArrowRight className="h-4 w-4" />
              </button>
            </div>

          </div>
        )}

      </motion.div>
    </div>
  );
}
