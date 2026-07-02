import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Class, Subject, Cycle } from "../types";
import { 
  School, 
  BookOpen, 
  Plus, 
  Trash2, 
  Edit3, 
  X, 
  Maximize2, 
  Users, 
  MapPin, 
  Award, 
  Hash, 
  Clock,
  Check,
  Search
} from "lucide-react";

interface ClassCourseManagerProps {
  classes: Class[];
  subjects: Subject[];
  onAddClass: (cls: Omit<Class, "id">) => void;
  onEditClass: (cls: Class) => void;
  onDeleteClass: (id: string) => void;
  onAddSubject: (sub: Omit<Subject, "id">) => void;
  onEditSubject: (sub: Subject) => void;
  onDeleteSubject: (id: string) => void;
  initialSearchQuery?: string;
}

export default function ClassCourseManager({
  classes,
  subjects,
  onAddClass,
  onEditClass,
  onDeleteClass,
  onAddSubject,
  onEditSubject,
  onDeleteSubject,
  initialSearchQuery = ""
}: ClassCourseManagerProps) {
  // Navigation states: 'classes' or 'subjects'
  const [activeSubTab, setActiveSubTab] = useState<"classes" | "subjects">("classes");
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);

  useEffect(() => {
    if (initialSearchQuery) {
      setSearchQuery(initialSearchQuery);
      setActiveSubTab("classes");
    }
  }, [initialSearchQuery]);

  const filteredClasses = classes.filter(cls => {
    const q = searchQuery.toLowerCase();
    return cls.name.toLowerCase().includes(q) || cls.level.toLowerCase().includes(q) || cls.cycle.toLowerCase().includes(q);
  });

  const filteredSubjects = subjects.filter(sub => {
    const q = searchQuery.toLowerCase();
    return sub.name.toLowerCase().includes(q) || sub.code.toLowerCase().includes(q) || sub.cycle.toLowerCase().includes(q);
  });

  // Modals
  const [isOpenClassModal, setIsOpenClassModal] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);

  const [isOpenSubjectModal, setIsOpenSubjectModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form states - Classes
  const [className, setClassName] = useState("");
  const [classCycle, setClassCycle] = useState<Cycle>("Lycée");
  const [classLevel, setClassLevel] = useState("");
  const [classCapacity, setClassCapacity] = useState(25);
  const [classRoom, setClassRoom] = useState("");
  const [classFeeAmount, setClassFeeAmount] = useState(2500);

  // Form states - Subjects
  const [subjectName, setSubjectName] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [subjectCycle, setSubjectCycle] = useState<Cycle>("Lycée");
  const [subjectHours, setSubjectHours] = useState(4);

  // Open modals handlers
  const handleOpenClassAdd = () => {
    setEditingClass(null);
    setClassName("");
    setClassCycle("Lycée");
    setClassLevel("");
    setClassCapacity(25);
    setClassRoom("");
    setClassFeeAmount(2500);
    setIsOpenClassModal(true);
  };

  const handleOpenClassEdit = (cls: Class) => {
    setEditingClass(cls);
    setClassName(cls.name);
    setClassCycle(cls.cycle);
    setClassLevel(cls.level);
    setClassCapacity(cls.capacity);
    setClassRoom(cls.room);
    setClassFeeAmount(cls.feeAmount);
    setIsOpenClassModal(true);
  };

  const handleOpenSubjectAdd = () => {
    setEditingSubject(null);
    setSubjectName("");
    setSubjectCode("");
    setSubjectCycle("Lycée");
    setSubjectHours(4);
    setIsOpenSubjectModal(true);
  };

  const handleOpenSubjectEdit = (sub: Subject) => {
    setEditingSubject(sub);
    setSubjectName(sub.name);
    setSubjectCode(sub.code);
    setSubjectCycle(sub.cycle);
    setSubjectHours(sub.hoursPerWeek);
    setIsOpenSubjectModal(true);
  };

  // Submits
  const handleClassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!className || !classLevel || !classRoom) {
      alert("Veuillez remplir tous les champs");
      return;
    }

    const payload = {
      name: className,
      cycle: classCycle,
      level: classLevel,
      capacity: Number(classCapacity),
      room: classRoom,
      feeAmount: Number(classFeeAmount)
    };

    setIsSaving(true);
    try {
      if (editingClass) {
        await onEditClass({ ...editingClass, ...payload });
      } else {
        await onAddClass(payload);
      }
      setIsSaving(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setIsOpenClassModal(false);
      }, 900);
    } catch (err: any) {
      console.error("Error saving class:", err);
      setIsSaving(false);
      alert(`Une erreur est survenue lors de l'enregistrement de la classe : ${err?.message || err}`);
    }
  };

  const handleSubjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName || !subjectCode) {
      alert("Veuillez remplir tous les champs");
      return;
    }

    const payload = {
      name: subjectName,
      code: subjectCode.toUpperCase(),
      cycle: subjectCycle,
      hoursPerWeek: Number(subjectHours)
    };

    setIsSaving(true);
    try {
      if (editingSubject) {
        await onEditSubject({ ...editingSubject, ...payload });
      } else {
        await onAddSubject(payload);
      }
      setIsSaving(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setIsOpenSubjectModal(false);
      }, 900);
    } catch (err: any) {
      console.error("Error saving subject:", err);
      setIsSaving(false);
      alert(`Une erreur est survenue lors de l'enregistrement de la matière : ${err?.message || err}`);
    }
  };

  return (
    <div id="class-course-section" className="space-y-6">
      {/* Tab toggle headers */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-100 pb-2">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex bg-slate-100 p-1.5 rounded-xl self-start">
            <button
              onClick={() => setActiveSubTab("classes")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeSubTab === "classes" 
                  ? "bg-white text-indigo-700 shadow-xs" 
                  : "text-black hover:text-slate-900"
              }`}
            >
              <School className="h-4 w-4" /> Classes & Tarifications
            </button>
            <button
              onClick={() => setActiveSubTab("subjects")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeSubTab === "subjects" 
                  ? "bg-white text-indigo-700 shadow-xs" 
                  : "text-black hover:text-slate-900"
              }`}
            >
              <BookOpen className="h-4 w-4" /> Matières & Volumes horaires
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-black" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filtrer..."
              className="bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 w-44 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-black hover:text-black text-xs font-bold font-sans"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div>
          {activeSubTab === "classes" ? (
            <button
              onClick={handleOpenClassAdd}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-1.5 px-3.5 rounded-lg text-xs flex items-center gap-1.5 transition"
            >
              <Plus className="h-4 w-4" /> Nouvelle Classe
            </button>
          ) : (
            <button
              onClick={handleOpenSubjectAdd}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-1.5 px-3.5 rounded-lg text-xs flex items-center gap-1.5 transition"
            >
              <Plus className="h-4 w-4" /> Nouvelle Matière
            </button>
          )}
        </div>
      </div>

      {/* RENDER CLASSES TAB */}
      {activeSubTab === "classes" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClasses.length === 0 ? (
              <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-slate-150">
                <p className="text-black text-sm">Aucune classe ne correspond à vos critères.</p>
              </div>
            ) : (
              filteredClasses.map(cls => (
              <div key={cls.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-slate-800 text-base">{cls.name}</h3>
                      <p className="text-xs text-black mt-1">Niveau: {cls.level}</p>
                    </div>
                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${
                      cls.cycle === "Lycée" 
                        ? "bg-violet-50 text-violet-700" 
                        : cls.cycle === "Collège" 
                          ? "bg-amber-50 text-amber-700" 
                          : "bg-emerald-50 text-emerald-700"
                    }`}>
                      {cls.cycle}
                    </span>
                  </div>

                  {/* Attributes details */}
                  <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-black">
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-black" />
                      <span>Max: {cls.capacity} élèves</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-black" />
                      <span>{cls.room}</span>
                    </div>
                  </div>
                </div>

                {/* Pricing / Operations footer */}
                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-black block uppercase font-bold">Mensualité</span>
                    <span className="text-sm font-bold text-slate-800">{cls.feeAmount} MAD</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenClassEdit(cls)}
                      className="p-1 px-2 border border-slate-100 hover:border-indigo-200 text-black hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 rounded text-xs transition"
                    >
                      <Edit3 className="h-3.5 w-3.5 inline mr-1" /> Éditer
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Êtes-vous sûr de vouloir supprimer la classe ${cls.name} ? Elle peut contenir des élèves.`)) {
                          onDeleteClass(cls.id);
                        }
                      }}
                      className="p-1 text-black hover:text-rose-600 transition"
                      title="Supprimer la classe"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )))}
          </div>
        </div>
      )}

      {/* RENDER SUBJECTS TAB */}
      {activeSubTab === "subjects" && (
        <div className="bg-white rounded-2xl border border-slate-150 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
              <tr className="bg-slate-50 border-b border-slate-150 text-xs font-bold text-black uppercase tracking-wider">
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Intitulé de la Matière</th>
                <th className="px-6 py-4">Cycle Scolaire</th>
                <th className="px-6 py-4">Volume Horaire Hebdomadaire</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubjects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-black text-xs">
                    Aucune matière ne correspond à votre recherche.
                  </td>
                </tr>
              ) : (
                filteredSubjects.map(sub => (
                <tr key={sub.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-slate-800">
                    <span className="bg-slate-100 px-2 py-1 rounded border border-slate-200">
                      {sub.code}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-emerald-600" />
                      <span className="text-xs font-bold text-slate-700">{sub.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      sub.cycle === "Lycée" 
                        ? "bg-violet-50 text-violet-700" 
                        : sub.cycle === "Collège" 
                          ? "bg-amber-50 text-amber-700" 
                          : "bg-emerald-50 text-emerald-700"
                    }`}>
                      {sub.cycle}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-xs text-black">
                      <Clock className="h-3.5 w-3.5 text-black" />
                      <span>{sub.hoursPerWeek} Heures / semaine</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenSubjectEdit(sub)}
                        className="bg-slate-100 hover:bg-slate-200 text-black p-1.5 rounded transition"
                        title="Modifier"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Êtes-vous sûr d'éliminer la matière ${sub.name} ?`)) {
                            onDeleteSubject(sub.id);
                          }
                        }}
                        className="bg-slate-100 hover:bg-rose-50 text-black hover:text-rose-600 p-1.5 rounded transition"
                        title="Détruire"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              )))}
            </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CLASS MODAL EDIT/ADD */}
      {isOpenClassModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm">
                {editingClass ? "Modifier la Classe" : "Ajouter une Classe"}
              </h3>
              <button onClick={() => setIsOpenClassModal(false)}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleClassSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-black uppercase mb-1">Nom de la Classe *</label>
                <input
                  type="text"
                  required
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2"
                  placeholder="Ex: 2ème BAC PC - B"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-black uppercase mb-1">Cycle Scolaire *</label>
                  <select
                    value={classCycle}
                    onChange={(e) => setClassCycle(e.target.value as any)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2"
                  >
                    <option value="Primaire">Primaire</option>
                    <option value="Collège">Collège</option>
                    <option value="Lycée">Lycée</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-black uppercase mb-1">Niveau / Label *</label>
                  <input
                    type="text"
                    required
                    value={classLevel}
                    onChange={(e) => setClassLevel(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2"
                    placeholder="Ex: 2ème BAC"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-black uppercase mb-1">Capacité Maxi</label>
                  <input
                    type="number"
                    value={classCapacity}
                    onChange={(e) => setClassCapacity(Number(e.target.value))}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-black uppercase mb-1">Local / Salle affectée *</label>
                  <input
                    type="text"
                    required
                    value={classRoom}
                    onChange={(e) => setClassRoom(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2"
                    placeholder="Ex: Salle 14 ou Labo"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-black uppercase mb-1">Mensualité Scolaire (MAD) *</label>
                <input
                  type="number"
                  value={classFeeAmount}
                  onChange={(e) => setClassFeeAmount(Number(e.target.value))}
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 font-bold"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setIsOpenClassModal(false)}
                  className="px-3.5 py-1.5 text-xs text-black hover:bg-slate-50 border rounded-lg cursor-pointer animate-none"
                >
                  Annuler
                </button>
                <motion.button
                  whileHover={!isSaving ? { scale: 1.02 } : {}}
                  whileTap={!isSaving ? { scale: 0.98 } : {}}
                  type="submit"
                  disabled={isSaving || isSuccess}
                  className={`relative overflow-hidden px-4 py-1.5 text-xs font-semibold text-white rounded-lg shadow transition-all duration-300 min-w-36 flex items-center justify-center gap-1 cursor-pointer ${
                    isSuccess
                      ? "bg-emerald-600 border-emerald-600"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                >
                  {isSaving ? (
                    <>
                      <span className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Enregistrement...</span>
                    </>
                  ) : isSuccess ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-white animate-bounce shrink-0" />
                      <span>Classe Enregistrée!</span>
                    </>
                  ) : (
                    <span>Enregistrer</span>
                  )}
                </motion.button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUBJECT MODAL EDIT/ADD */}
      {isOpenSubjectModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm">
                {editingSubject ? "Modifier la Matière" : "Ajouter une Matière"}
              </h3>
              <button onClick={() => setIsOpenSubjectModal(false)}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSubjectSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-black uppercase mb-1">Nom de la Matière *</label>
                <input
                  type="text"
                  required
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2"
                  placeholder="Ex: Mathématiques (BIOF)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-black uppercase mb-1">Code Matière *</label>
                  <input
                    type="text"
                    required
                    value={subjectCode}
                    onChange={(e) => setSubjectCode(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 uppercase"
                    placeholder="Ex: MAT_L"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-black uppercase mb-1">Cycle Scolaire *</label>
                  <select
                    value={subjectCycle}
                    onChange={(e) => setSubjectCycle(e.target.value as any)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2"
                  >
                    <option value="Primaire">Primaire</option>
                    <option value="Collège">Collège</option>
                    <option value="Lycée">Lycée</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-black uppercase mb-1">Volume Horaire Hebdomadaire</label>
                <input
                  type="number"
                  value={subjectHours}
                  onChange={(e) => setSubjectHours(Number(e.target.value))}
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setIsOpenSubjectModal(false)}
                  className="px-3.5 py-1.5 text-xs text-black hover:bg-slate-50 border rounded-lg cursor-pointer"
                >
                  Annuler
                </button>
                <motion.button
                  whileHover={!isSaving ? { scale: 1.02 } : {}}
                  whileTap={!isSaving ? { scale: 0.98 } : {}}
                  type="submit"
                  disabled={isSaving || isSuccess}
                  className={`relative overflow-hidden px-4 py-1.5 text-xs font-semibold text-white rounded-lg shadow transition-all duration-300 min-w-36 flex items-center justify-center gap-1 cursor-pointer ${
                    isSuccess
                      ? "bg-emerald-600 border-emerald-600"
                      : "bg-emerald-600 hover:bg-emerald-700"
                  }`}
                >
                  {isSaving ? (
                    <>
                      <span className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Enregistrement...</span>
                    </>
                  ) : isSuccess ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-white animate-bounce shrink-0" />
                      <span>Enregistrée !</span>
                    </>
                  ) : (
                    <span>Enregistrer</span>
                  )}
                </motion.button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
