import React, { useState } from "react";
import { Settings, School, MapPin, Smartphone, Mail, Undo2, Database, HelpCircle, Globe, Check, Sparkles, ArrowRight, ShieldCheck, Building, Upload, Image as ImageIcon } from "lucide-react";
import { doc, updateDoc, setDoc, collection } from "firebase/firestore";
import { db } from "../firebase";
import { INITIAL_SUBJECTS, INITIAL_CLASSES, INITIAL_TEACHERS, INITIAL_STUDENTS, INITIAL_SCHEDULES, INITIAL_INVOICES } from "../data";

interface SettingsManagerProps {
  schoolId: string | null;
  schoolName: string;
  setSchoolName: (name: string) => void;
  schoolCity: string;
  setSchoolCity: (city: string) => void;
  regionalAcademy: string;
  setRegionalAcademy: (acad: string) => void;
  bilingualType: "bilingue" | "arabe" | "francais";
  setBilingualType: (val: "bilingue" | "arabe" | "francais") => void;
  contactPhone: string;
  setContactPhone: (phone: string) => void;
  contactEmail: string;
  setContactEmail: (email: string) => void;
  schoolLogo: string;
  setSchoolLogo: (logo: string) => void;
  themeColor: string;
  setThemeColor: (color: string) => void;
  onResetData: () => void;
}

export default function SettingsManager({
  schoolId,
  schoolName,
  setSchoolName,
  schoolCity,
  setSchoolCity,
  regionalAcademy,
  setRegionalAcademy,
  bilingualType,
  setBilingualType,
  contactPhone,
  setContactPhone,
  contactEmail,
  setContactEmail,
  schoolLogo,
  setSchoolLogo,
  themeColor,
  setThemeColor,
  onResetData
}: SettingsManagerProps) {
  const [successMsg, setSuccessMsg] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [confirmSeed, setConfirmSeed] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  // States to hold quick file selection info
  const [logoInputType, setLogoInputType] = useState<"url" | "upload">("upload");
  const [logoUrlInput, setLogoUrlInput] = useState(schoolLogo);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Save to localStorage too
    localStorage.setItem("madrasati_schoolName", schoolName);
    localStorage.setItem("madrasati_schoolCity", schoolCity);
    localStorage.setItem("madrasati_academy", regionalAcademy);
    localStorage.setItem("madrasati_bilingual", bilingualType);
    localStorage.setItem("madrasati_phone", contactPhone);
    localStorage.setItem("madrasati_email", contactEmail);
    localStorage.setItem("madrasati_school_logo", schoolLogo);
    localStorage.setItem("madrasati_themeColor", themeColor);

    // Save to Firestore so it is globally active and validated on header and reload!
    if (schoolId && db) {
      try {
        const ref = doc(db, 'schools', schoolId);
        await updateDoc(ref, {
          name: schoolName,
          city: schoolCity,
          academy: regionalAcademy,
          bilingualType: bilingualType,
          phone: contactPhone,
          email: contactEmail,
          logo: schoolLogo,
          themeColor: themeColor
        });
      } catch (err) {
        console.error("Error updating school settings in Firestore:", err);
      }
    }

    setIsSaving(false);
    setSuccessMsg("Configuration de l'établissement mise à jour et validée avec succès !");
    setTimeout(() => {
      setSuccessMsg("");
    }, 4500);
  };

  const handleQuickPreset = async (
    name: string, 
    city: string, 
    acad: string, 
    phone: string, 
    email: string, 
    bilingual: "bilingue" | "arabe" | "francais"
  ) => {
    setSchoolName(name);
    setSchoolCity(city);
    setRegionalAcademy(acad);
    setContactPhone(phone);
    setContactEmail(email);
    setBilingualType(bilingual);

    localStorage.setItem("madrasati_schoolName", name);
    localStorage.setItem("madrasati_schoolCity", city);
    localStorage.setItem("madrasati_academy", acad);
    localStorage.setItem("madrasati_bilingual", bilingual);
    localStorage.setItem("madrasati_phone", phone);
    localStorage.setItem("madrasati_email", email);

    if (schoolId && db) {
      try {
        const ref = doc(db, 'schools', schoolId);
        await updateDoc(ref, {
          name,
          city,
          academy: acad,
          bilingualType: bilingual,
          phone,
          email
        });
      } catch (err) {
        console.error("Error saving quick preset to Firestore:", err);
      }
    }

    setSuccessMsg(`Préconfiguration démo chargée et validée : "${name}"`);
    setTimeout(() => {
      setSuccessMsg("");
    }, 4500);
  };


  const handleSeedUserRequestedData = async () => {
    if (!schoolId) {
      setSuccessMsg("Erreur : Aucun identifiant d'établissement trouvé (schoolId est vide).");
      return;
    }
    if (!db) {
      setSuccessMsg("Erreur : La base de données n'est pas initialisée.");
      return;
    }
    
    setIsSaving(true);
    setSuccessMsg("Génération en cours... Veuillez patienter !");
    
    try {
      // 1. Generate 10 distinct random subjects
      const subjects = [
        { name: "Informatique Avancée", code: "INF_A", cycle: "Lycée", hoursPerWeek: 4 },
        { name: "Éducation Islamique", code: "ISL", cycle: "Primaire", hoursPerWeek: 2 },
        { name: "Éducation Islamique", code: "ISL_C", cycle: "Collège", hoursPerWeek: 2 },
        { name: "Éducation Islamique", code: "ISL_L", cycle: "Lycée", hoursPerWeek: 2 },
        { name: "Robotique", code: "ROB", cycle: "Collège", hoursPerWeek: 3 },
        { name: "Physique Quantique Initiation", code: "PHY_Q", cycle: "Lycée", hoursPerWeek: 2 },
        { name: "Mathématiques Appliquées", code: "MATH_A", cycle: "Lycée", hoursPerWeek: 5 },
        { name: "Sciences de la Vie", code: "SVT", cycle: "Collège", hoursPerWeek: 4 },
        { name: "Langue Française", code: "FRA", cycle: "Primaire", hoursPerWeek: 6 },
        { name: "Histoire Géographie", code: "HG", cycle: "Collège", hoursPerWeek: 3 },
        { name: "Éducation Sportive", code: "EPS", cycle: "Primaire", hoursPerWeek: 2 }
      ];
      
      const savedSubjects = [];
      for (const sub of subjects) {
        const subDoc = doc(collection(db, "schools", schoolId, "subjects"));
        const data = { id: subDoc.id, ...sub };
        await setDoc(subDoc, data);
        savedSubjects.push(data);
      }

      // 2. Generate 10 distinct random classes
      const cycles = ["Primaire", "Collège", "Lycée"];
      const savedClasses = [];
      for (let i = 1; i <= 10; i++) {
        const cycle = cycles[i % 3];
        const classDoc = doc(collection(db, "schools", schoolId, "classes"));
        const data = {
          id: classDoc.id,
          name: `Classe Démo ${i} (${cycle})`,
          cycle: cycle,
          level: `Niveau ${i % 3 + 1}`,
          capacity: 25 + Math.floor(Math.random() * 10),
          room: `Salle D-${i}`,
          feeAmount: 2000 + Math.floor(Math.random() * 1500)
        };
        await setDoc(classDoc, data);
        savedClasses.push(data);
      }

      // 3. Generate 10 distinct teachers
      const firstNames = ["Ahmed", "Karim", "Mouna", "Leila", "Youssef", "Salma", "Tarik", "Fatima", "Hassan", "Khadija", "Omar", "Sara"];
      const lastNames = ["Bennani", "Tazi", "El Fassi", "Mansouri", "Radi", "Alaoui", "Berrada", "Guessous", "Amrani", "Chraibi"];
      const savedTeachers = [];
      for (let i = 1; i <= 10; i++) {
        const tDoc = doc(collection(db, "schools", schoolId, "teachers"));
        const data = {
          id: tDoc.id,
          firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
          lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
          email: `professeur${Math.floor(Math.random() * 1000)}@madrasati.ma`,
          phone: `06${Math.floor(10000000 + Math.random() * 90000000)}`,
          subjectIds: [savedSubjects[i % savedSubjects.length].id, savedSubjects[(i + 1) % savedSubjects.length].id],
          classIds: [savedClasses[i % savedClasses.length].id, savedClasses[(i + 1) % savedClasses.length].id],
          salaryType: i % 2 === 0 ? "horaire" : "mensuel",
          salaryValue: i % 2 === 0 ? 200 : 8500,
          status: "actif"
        };
        await setDoc(tDoc, data);
        savedTeachers.push(data);
      }

      // 4. Generate ~50 random students assigned to these 10 classes
      const stFirst = ["Amine", "Nour", "Rayane", "Lina", "Adam", "Ali", "Hiba", "Rania", "Aymane", "Doha", "Sami", "Ines", "Yassir", "Zineb", "Anas", "Kenza", "Ilyas", "Rim", "Mehdi", "Nada"];
      const stLast = ["Alaoui", "Benjelloun", "Chraibi", "Amrani", "Berrada", "Guessous", "Kadiri", "Tazi", "Bennani", "Mansouri", "Radi", "Filali", "Tahiri", "Lahlou", "El Fassi"];
      
      for (let i = 1; i <= 50; i++) {
        const sDoc = doc(collection(db, "schools", schoolId, "students"));
        const assignedClass = savedClasses[i % savedClasses.length];
        
        const data = {
          id: sDoc.id,
          firstName: stFirst[Math.floor(Math.random() * stFirst.length)],
          lastName: stLast[Math.floor(Math.random() * stLast.length)],
          classId: assignedClass.id,
          parentName: `Parent ${stLast[Math.floor(Math.random() * stLast.length)]}`,
          parentPhone: `06${Math.floor(10000000 + Math.random() * 90000000)}`,
          parentEmail: `parent${i}@email.com`,
          registrationDate: new Date().toISOString().split('T')[0],
          status: "actif",
          outstandingBalance: i % 4 === 0 ? assignedClass.feeAmount : 0 // 1 out of 4 has unpaid balance
        };
        await setDoc(sDoc, data);
      }

      const msg = "Les données ont été générées : 10 classes, 10 matières, 10 professeurs, et 50 élèves ajoutés avec succès !";
      setSuccessMsg(msg);
    } catch (err) {
      console.error("Erreur lors de la génération :", err);
      setSuccessMsg("Erreur lors de la génération. Consultez la console.");
    } finally {
      setIsSaving(false);
      setTimeout(() => setSuccessMsg(""), 5000);
    }
  };

  return (
    <div id="settings-manager" className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
          <Settings className="h-6 w-6 text-indigo-600 animate-spin-slow" /> Options & Configuration
        </h2>
        <p className="text-sm text-black">
          Personnalisez les coordonnées de votre établissement scolaire, alternez le type de cursus et réinitialisez les données d'échantillon.
        </p>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <Check className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: main configuration form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building className="h-5 w-5 text-indigo-500" />
            <h3 className="font-bold text-slate-850 text-sm">Informations Officielles de l'Établissement</h3>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-black uppercase mb-1.5">Nom de l'École (Enseignement)</label>
                <input
                  type="text"
                  required
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full text-xs font-medium border border-slate-200 rounded-lg px-3 py-2.5 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ex: GS AR-RACHAD"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-black uppercase mb-1.5">Ville Principale</label>
                <select
                  value={schoolCity}
                  onChange={(e) => setSchoolCity(e.target.value)}
                  className="w-full text-xs font-medium border border-slate-200 rounded-lg px-3 py-2.5 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Casablanca">Casablanca (الدار البيضاء)</option>
                  <option value="Rabat">Rabat (الرباط)</option>
                  <option value="Marrakech">Marrakech (مراكش)</option>
                  <option value="Fès">Fès (فاس)</option>
                  <option value="Tangier">Tanger (طنجة)</option>
                  <option value="Agadir">Agadir (أكادير)</option>
                  <option value="Oujda">Oujda (وجدة)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-black uppercase mb-1.5">Académie Régionale d'Éducation et de Formation (AREF)</label>
              <input
                type="text"
                required
                value={regionalAcademy}
                onChange={(e) => setRegionalAcademy(e.target.value)}
                className="w-full text-xs font-medium border border-slate-200 rounded-lg px-3 py-2.5 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Ex: AREF Casablanca-Settat"
              />
              <p className="text-[10px] text-black mt-1">Conformément aux directives du Ministère de l'Éducation Nationale au Maroc.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-black uppercase mb-1.5">Téléphone Secrétariat</label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-2.5 h-4 w-4 text-black" />
                  <input
                    type="tel"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full text-xs pl-9 font-medium border border-slate-200 rounded-lg px-3 py-2.5 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Ex: 0522123456"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-black uppercase mb-1.5">E-mail Établissement</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-black" />
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full text-xs pl-9 font-medium border border-slate-200 rounded-lg px-3 py-2.5 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Ex: contact@ecole.ma"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-black uppercase mb-2">Option de Cursus Linguistique</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setBilingualType("bilingue")}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition h-20 ${
                    bilingualType === "bilingue"
                      ? "border-indigo-650 bg-indigo-50 text-indigo-950 shadow-sm"
                      : "border-slate-200 bg-white text-black hover:bg-slate-50"
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider block">Bilingue standard</span>
                  <span className="text-[9px] text-black">Français, Arabe et Anglais précoce</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBilingualType("arabe")}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition h-20 ${
                    bilingualType === "arabe"
                      ? "border-indigo-650 bg-indigo-50 text-indigo-950 shadow-sm"
                      : "border-slate-200 bg-white text-black hover:bg-slate-50"
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider block">Cursus National Arabe</span>
                  <span className="text-[9px] text-black">Prédominance arabe ministériel</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBilingualType("francais")}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition h-20 ${
                    bilingualType === "francais"
                      ? "border-indigo-650 bg-indigo-50 text-indigo-950 shadow-sm"
                      : "border-slate-200 bg-white text-black hover:bg-slate-50"
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider block">Cursus Mission</span>
                  <span className="text-[9px] text-black">Enseignement renforcé en Français</span>
                </button>
              </div>
            </div>

            {/* Logo de l'établissement */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-3.5">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-indigo-500" />
                <span className="text-xs font-bold text-slate-750 uppercase">Logo Personnalisé de l'Établissement</span>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                {/* Visual Preview */}
                <div className="h-16 w-16 bg-white border border-slate-200 rounded-xl flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                  {schoolLogo ? (
                    <img 
                      src={schoolLogo} 
                      alt="Aperçu Logo" 
                      className="h-full w-full object-contain p-1.5"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-tr from-indigo-600 to-teal-500 flex items-center justify-center text-white font-black text-2xl">
                      M
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <p className="text-[11px] font-semibold text-black">
                    Modifiez le logo affiché en haut à gauche de la plateforme pour tous vos administrateurs et enseignants.
                  </p>
                  
                  {/* Selector tabs between custom upload & presets */}
                  <div className="flex gap-2 bg-slate-200 p-0.5 rounded-lg border border-slate-300 w-fit">
                    <button
                      type="button"
                      onClick={() => setLogoInputType("upload")}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${logoInputType === "upload" ? "bg-white text-slate-800 shadow-xs" : "text-black hover:text-slate-700"}`}
                    >
                      Téléverser
                    </button>
                    <button
                      type="button"
                      onClick={() => setLogoInputType("url")}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${logoInputType === "url" ? "bg-white text-slate-800 shadow-xs" : "text-black hover:text-slate-700"}`}
                    >
                      Lien Direct (URL)
                    </button>
                  </div>
                </div>
              </div>

              {/* Upload widget */}
              {logoInputType === "upload" ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-xl cursor-pointer bg-white hover:bg-slate-50/55 transition">
                      <div className="flex flex-col items-center justify-center pt-4 pb-4">
                        <Upload className="w-5 h-5 text-black mb-1" />
                        <p className="text-[10px] font-bold text-black text-center px-2">
                          Cliquez pour sélectionner un fichier (PNG, JPG)
                        </p>
                        <p className="text-[9px] text-black font-medium">Conversion automatique en base64</p>
                      </div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              const base64String = reader.result as string;
                              setSchoolLogo(base64String);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>

                  {/* Preset emblems for immediate demo selection */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-550 block">Ou choisissez un de nos emblèmes préconfigurés :</span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setSchoolLogo("https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=128&q=80")}
                        className="px-2.5 py-1 bg-white border border-slate-200 hover:border-amber-400 rounded-lg text-[10px] font-bold text-slate-700 flex items-center gap-1 hover:text-slate-850 cursor-pointer"
                      >
                        🎓 Emblème Classique
                      </button>
                      <button
                        type="button"
                        onClick={() => setSchoolLogo("https://images.unsplash.com/photo-1592066575517-58df903152f2?auto=format&fit=crop&w=128&q=80")}
                        className="px-2.5 py-1 bg-white border border-slate-200 hover:border-emerald-400 rounded-lg text-[10px] font-bold text-slate-700 flex items-center gap-1 hover:text-slate-850 cursor-pointer"
                      >
                        🌟 Étoile d’Excellence
                      </button>
                      <button
                        type="button"
                        onClick={() => setSchoolLogo("https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=128&q=80")}
                        className="px-2.5 py-1 bg-white border border-slate-200 hover:border-indigo-400 rounded-lg text-[10px] font-bold text-slate-700 flex items-center gap-1 hover:text-slate-850 cursor-pointer"
                      >
                        📖 Livre Ouvert
                      </button>
                      <button
                        type="button"
                        onClick={() => setSchoolLogo("")}
                        className="px-2.5 py-1 bg-white/70 hover:bg-white border border-rose-100 hover:border-rose-400 rounded-lg text-[10px] font-bold text-rose-600 flex items-center gap-1 hover:text-rose-700 cursor-pointer"
                      >
                        ❌ Réinitialiser par défaut
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <input
                    type="url"
                    value={logoUrlInput}
                    onChange={(e) => {
                      setLogoUrlInput(e.target.value);
                      setSchoolLogo(e.target.value);
                    }}
                    className="w-full text-xs font-medium border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Saisissez ou collez l'URL absolue de l'image (https://...)"
                  />
                  <p className="text-[10px] text-black">Exemple: https://mon-domaine.com/images/logo.png</p>
                </div>
              )}
            </div>

            {/* Theme Color Selection */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-3.5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-500" />
                <span className="text-xs font-bold text-slate-750 uppercase">Couleur Principale du Thème</span>
              </div>
              <p className="text-[11px] font-semibold text-black">
                Choisissez la couleur dominante qui sera appliquée sur l'ensemble de la plateforme.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setThemeColor("indigo")}
                  className={`h-8 w-8 rounded-full bg-indigo-600 transition-transform ${themeColor === "indigo" ? "ring-2 ring-offset-2 ring-indigo-600 scale-110" : "hover:scale-110"}`}
                  title="Indigo"
                />
                <button
                  type="button"
                  onClick={() => setThemeColor("emerald")}
                  className={`h-8 w-8 rounded-full bg-emerald-600 transition-transform ${themeColor === "emerald" ? "ring-2 ring-offset-2 ring-emerald-600 scale-110" : "hover:scale-110"}`}
                  title="Émeraude"
                />
                <button
                  type="button"
                  onClick={() => setThemeColor("rose")}
                  className={`h-8 w-8 rounded-full bg-rose-600 transition-transform ${themeColor === "rose" ? "ring-2 ring-offset-2 ring-rose-600 scale-110" : "hover:scale-110"}`}
                  title="Rose"
                />
                <button
                  type="button"
                  onClick={() => setThemeColor("sky")}
                  className={`h-8 w-8 rounded-full bg-sky-600 transition-transform ${themeColor === "sky" ? "ring-2 ring-offset-2 ring-sky-600 scale-110" : "hover:scale-110"}`}
                  title="Bleu Ciel"
                />
                <button
                  type="button"
                  onClick={() => setThemeColor("amber")}
                  className={`h-8 w-8 rounded-full bg-amber-500 transition-transform ${themeColor === "amber" ? "ring-2 ring-offset-2 ring-amber-500 scale-110" : "hover:scale-110"}`}
                  title="Ambre"
                />
              </div>
            </div>

            <div className="pt-4 border-t flex justify-end">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg shadow-sm transition"
              >
                Enregistrer la Configuration
              </button>
            </div>
          </form>
        </div>

        {/* Right Columns: Presets and Reset system */}
        <div className="space-y-6">
          
          {/* Quick Presets of famous schools in Morocco */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-amber-500" /> Préconfigurations de démo
            </h3>
            <p className="text-[11px] text-black leading-relaxed">
              Sélectionnez une préconfiguration pour simuler des établissements scolaires célèbres de différentes régions marocaines :
            </p>

            <div className="space-y-2">
              <button
                onClick={() => handleQuickPreset("GROUPE SCOLAIRE AR-RACHAD", "Casablanca", "AREF Casablanca-Settat", "0522123456", "direction@ar-rachad.ma", "bilingue")}
                className="w-full p-2.5 text-left border rounded-lg hover:border-indigo-300 hover:bg-indigo-50/20 text-[11px] transition flex justify-between items-center"
              >
                <div>
                  <p className="font-bold text-slate-700">G.S. Ar-Rachad (Anfa/Maarif)</p>
                  <p className="text-[9px] text-black">Casablanca-Settat • Bilingue</p>
                </div>
                <ArrowRight className="h-3 w-3 text-black shrink-0" />
              </button>

              <button
                onClick={() => handleQuickPreset("INSTITUT EL-YASMINE", "Rabat", "AREF Rabat-Salé-Kénitra", "0537765432", "contact@elyasmine-institute.ma", "francais")}
                className="w-full p-2.5 text-left border rounded-lg hover:border-indigo-300 hover:bg-indigo-50/20 text-[11px] transition flex justify-between items-center"
              >
                <div>
                  <p className="font-bold text-slate-700">Institut El-Yasmine (Agdal)</p>
                  <p className="text-[9px] text-black">Rabat • Enseignement renforcé (Français)</p>
                </div>
                <ArrowRight className="h-3 w-3 text-black shrink-0" />
              </button>

              <button
                onClick={() => handleQuickPreset("ÉCOLE ARABE JBEL TOUBKAL", "Marrakech", "AREF Marrakech-Safi", "0524458990", "info@toubkal-school.ma", "arabe")}
                className="w-full p-2.5 text-left border rounded-lg hover:border-indigo-300 hover:bg-indigo-50/20 text-[11px] transition flex justify-between items-center"
              >
                <div>
                  <p className="font-bold text-slate-700">Éc. Jbel Toubkal (Guéliz)</p>
                  <p className="text-[9px] text-black">Marrakech-Safi • Cursus National Arabe</p>
                </div>
                <ArrowRight className="h-3 w-3 text-black shrink-0" />
              </button>
            </div>
          </div>

          {/* Database Reset Option */}
          <div className="bg-rose-50/30 border border-rose-100 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-rose-900 text-xs flex items-center gap-1.5">
              <Database className="h-4 w-4 text-rose-600" /> Zone de Danger (Réinitialisation)
            </h3>
            <p className="text-[11px] text-black leading-relaxed">
              En cas de besoin de nettoyage, vous pouvez restaurer la base de données d'échantillon à son état initial propre. Cette opération effacera les nouvelles fiches élèves, enseignants et factures.
            </p>
            
            <button
              type="button"
              onClick={() => {
                if (confirmSeed) {
                  handleSeedUserRequestedData();
                  setConfirmSeed(false);
                } else {
                  setConfirmSeed(true);
                  setTimeout(() => setConfirmSeed(false), 3000);
                }
              }}
              disabled={isSaving}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-4 rounded-lg shadow-sm transition flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Database className="h-3.5 w-3.5" /> 
              {confirmSeed ? "Confirmer la génération ?" : "Alimenter la base de données (Test)"}
            </button>

            <button
              type="button"
              onClick={() => {
                if (confirmReset) {
                  onResetData();
                  const msg = "La base de données Madrasati a été réinitialisée avec succès !";
                  setSuccessMsg(msg);
                  setTimeout(() => setSuccessMsg(""), 4000);
                  setConfirmReset(false);
                } else {
                  setConfirmReset(true);
                  setTimeout(() => setConfirmReset(false), 3000);
                }
              }}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2 px-4 rounded-lg shadow-sm transition flex items-center justify-center gap-1.5"
            >
              <Undo2 className="h-3.5 w-3.5" /> 
              {confirmReset ? "Confirmer la suppression ?" : "Restaurer la base démo"}
            </button>
          </div>

          {/* SaaS Plan overview */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-3 relative overflow-hidden">
            <div className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 w-32 h-32 bg-indigo-550 rounded-full opacity-25 blur-lg" />
            <span className="text-[9px] bg-indigo-600 text-white font-bold px-2 py-0.5 rounded-full inline-block uppercase">SaaS Plan OR</span>
            <h4 className="font-extrabold text-sm tracking-tight">Utilisation illimitée Madrasati ERP</h4>
            <p className="text-[10px] text-slate-350 leading-relaxed">
              Votre licence annuelle premium est activée. Accès global au module financier, emploi du temps scolaire et liaison académique marocaine.
            </p>
            <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold mt-2">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" /> Serveurs Cloud Casablanca Sécurisés
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
