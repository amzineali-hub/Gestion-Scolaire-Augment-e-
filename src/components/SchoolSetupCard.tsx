import React, { useState } from "react";
import { db } from "../firebase";
import { doc, setDoc, addDoc, collection } from "firebase/firestore";
import { School, ArrowRight, Sparkles, Loader2, Landmark, Phone, Mail, Award, Globe } from "lucide-react";

interface SchoolSetupCardProps {
  lang: "fr" | "ar";
  currentUser: any;
}

export default function SchoolSetupCard({ lang, currentUser }: SchoolSetupCardProps) {
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [schoolName, setSchoolName] = useState("");
  const [city, setCity] = useState("Casablanca");
  const [academy, setAcademy] = useState("AREF Casablanca-Settat");
  const [bilingualType, setBilingualType] = useState<"bilingue" | "arabe" | "francais">("bilingue");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const t = (frText: string, arText: string) => {
    return lang === "fr" ? frText : arText;
  };

  const handleCreateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolName.trim()) {
      setError(t("Veuillez donner un nom à votre établissement.", "الرجاء كشابة اسم المؤسسة"));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Créer le document de la nouvelle école
      const schoolRef = await addDoc(collection(db, "schools"), {
        name: schoolName,
        city,
        academy,
        bilingualType,
        phone: phone || "0522000000",
        email: email || currentUser?.email || "administration@ecole.ma",
        createdAt: new Date(),
        subscriptionPlan: "excellence"
      });

      // 2. Assigner ce schoolId au profil de l'utilisateur
      const userDocRef = doc(db, 'users', currentUser.uid);
      await setDoc(userDocRef, {
        email: currentUser.email || "",
        role: "admin",
        schoolId: schoolRef.id
      }, { merge: true });

      // Recharger pour appliquer les modifications
      window.location.reload();
    } catch (err: any) {
      console.error("Error creating custom school:", err);
      setError(err.message || "Une erreur est survenue lors de la création.");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinDemoSchool = async () => {
    setDemoLoading(true);
    setError(null);

    try {
      // On associe simplement l'utilisateur à "school-demo"
      // "school-demo" sera automatiquement créé et peuplé dans App.tsx s'il n'existe pas
      const userDocRef = doc(db, 'users', currentUser.uid);
      await setDoc(userDocRef, {
        email: currentUser.email || "",
        role: "admin",
        schoolId: "school-demo"
      }, { merge: true });

      // Recharger pour appliquer les modifications
      window.location.reload();
    } catch (err: any) {
      console.error("Error joining demo school:", err);
      setError(err.message || "Une erreur est survenue lors de l'association à l'école de démo.");
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl grid md:grid-cols-12 gap-6 bg-white rounded-3xl shadow-2xl p-6 md:p-10 border border-slate-100 max-h-[90vh] overflow-y-auto">
      
      {/* Colonne d'introduction (Explications de démo rapide) */}
      <div className="md:col-span-5 flex flex-col justify-between bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="space-y-6 z-10">
          <div className="h-10 w-10 bg-indigo-500/20 rounded-xl flex items-center justify-center border border-indigo-400/20">
            <Sparkles className="h-5 w-5 text-indigo-300 animate-pulse" />
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">
              {t("Bienvenue en Démo 🎉", "مرحباً بكم في العرض التجريبي 🎉")}
            </h2>
            <p className="text-xs md:text-sm text-indigo-200 mt-2 leading-relaxed">
              {t(
                "Vous êtes connecté avec succès ! Pour explorer instantanément toutes les fonctionnalités (suivi des dossiers élèves, plannings, facturation interactive), nous vous conseillons l'option démo en 1 clic.",
                "تم تسجيل دخولكم بنجاح! لاستكشاف كافة الميزات على الفور (متابعة ملفات الطلاب، الجداول الزمنية، الفوترة التفاعلية)، نوصي بخيار العرض التجريبي بنقرة واحدة."
              )}
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="h-4 w-4" />
              {t("Le Campus Démo inclut", "يشتمل حرم العرض التجريبي")}
            </h3>
            <ul className="text-[11px] text-black space-y-2">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 shrink-0" />
                {t("500 dossiers élèves marocains fictifs", "500 ملف طلاب مغاربة افتراضيين")}
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 shrink-0" />
                {t("50 enseignants par spécialité", "50 معلماً حسب الاختصاص")}
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 shrink-0" />
                {t("Tableau de bord financier & factures", "لوحة معلومات مالية وفواتير")}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 md:mt-0 pt-6 border-t border-white/10 z-10">
          <button
            type="button"
            onClick={handleJoinDemoSchool}
            disabled={demoLoading || loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-black py-3 rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-xs md:text-sm disabled:opacity-70 disabled:active:scale-100"
          >
            {demoLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            ) : (
              <Sparkles className="h-4 w-4 text-amber-300 animate-bounce" />
            )}
            <span>{t("Activer le Campus Démo (Recommandé)", "تفعيل حرم العرض التجريبي (موصى به)")}</span>
            <ArrowRight className="h-4 w-4 ml-0.5" />
          </button>
          <p className="text-[10px] text-indigo-300 text-center mt-2.5">
            {t("Idéal pour une prise en main immédiate", "مثالي للبدء الفوري")}
          </p>
        </div>
      </div>

      {/* Formulaire de création personnalisée */}
      <div className="md:col-span-7 flex flex-col justify-between py-2">
        <div>
          <div className="mb-6">
            <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
              <Landmark className="h-5 w-5 text-indigo-600" />
              {t("Créer un Établissement Personnalisé", "إنشاء مؤسسة مخصصة")}
            </h3>
            <p className="text-xs text-black mt-1">
              {t("Configurez une base de données vierge pour commencer à bâtir votre propre structure.", "قم بتهيئة قاعدة بيانات فارغة للبدء في بناء هيكلك الخاص.")}
            </p>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold p-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleCreateSchool} className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-extrabold text-black uppercase tracking-wide mb-1">
                {t("Nom de l'établissement *", "اسم المؤسسة *")}
              </label>
              <input
                type="text"
                required
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder={t("ex: Groupe Scolaire Arrachad", "مثال: مجموعة مدارس الرشاد")}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium text-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-black uppercase tracking-wide mb-1">
                {t("Ville", "المدينة")}
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Casablanca"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium text-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-black uppercase tracking-wide mb-1">
                {t("Académie Régionale", "الأكاديمية الجهوية")}
              </label>
              <input
                type="text"
                value={academy}
                onChange={(e) => setAcademy(e.target.value)}
                placeholder="AREF Casablanca-Settat"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium text-slate-700"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-extrabold text-black uppercase tracking-wide mb-1">
                {t("Type d'enseignement", "نوع التعليم")}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["bilingue", "arabe", "francais"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setBilingualType(type)}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                      bilingualType === type
                        ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                        : "bg-white border-slate-200 text-black hover:bg-slate-50"
                    }`}
                  >
                    {type === "bilingue" ? t("Bilingue", "ثنائي اللغة") : type === "arabe" ? t("Arabe", "عربي") : t("Français", "فرنسي")}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-black uppercase tracking-wide mb-1.5 flex items-center gap-1">
                <Phone className="h-3 w-3 text-black" />
                {t("Téléphone", "الهاتف")}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0522XXXXXX"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium text-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-black uppercase tracking-wide mb-1.5 flex items-center gap-1">
                <Mail className="h-3 w-3 text-black" />
                {t("Email administratif", "البريد الإلكتروني للإدارة")}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ecole.ma"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium text-slate-700"
              />
            </div>

            <div className="col-span-2 pt-4">
              <button
                type="submit"
                disabled={loading || demoLoading}
                className="w-full bg-slate-950 hover:bg-slate-900 active:bg-black text-white font-extrabold py-3 rounded-xl transition-all active:scale-[0.98] text-xs sm:text-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:active:scale-100 shadow-lg shadow-slate-950/10"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-black" />
                ) : (
                  <Landmark className="h-4 w-4 text-emerald-300" />
                )}
                <span>{t("Créer l'Établissement & Démarrer", "إنشاء المؤسسة والبدء")}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
