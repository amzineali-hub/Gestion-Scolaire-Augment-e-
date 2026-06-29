import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Teacher, Subject, Class } from "../types";
import { 
  GraduationCap, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  X, 
  Mail, 
  Phone, 
  Check, 
  Briefcase, 
  BookOpen, 
  PlusCircle, 
  UserCheck 
} from "lucide-react";

interface TeacherManagerProps {
  teachers: Teacher[];
  subjects: Subject[];
  classes: Class[];
  onAddTeacher: (teacher: Omit<Teacher, "id">) => void;
  onEditTeacher: (teacher: Teacher) => void;
  onDeleteTeacher: (id: string) => void;
  initialSearchQuery?: string;
}

export default function TeacherManager({
  teachers,
  subjects,
  classes,
  onAddTeacher,
  onEditTeacher,
  onDeleteTeacher,
  initialSearchQuery = ""
}: TeacherManagerProps) {
  // Navigation / Filter states
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState("all");

  useEffect(() => {
    if (initialSearchQuery) {
      setSearchQuery(initialSearchQuery);
      setSelectedSubjectFilter("all");
    }
  }, [initialSearchQuery]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);

  // Modal states
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  // Form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [teacherSubjectIds, setTeacherSubjectIds] = useState<string[]>([]);
  const [teacherClassIds, setTeacherClassIds] = useState<string[]>([]);
  const [salaryType, setSalaryType] = useState<"mensuel" | "horaire">("mensuel");
  const [salaryValue, setSalaryValue] = useState(7000);
  const [status, setStatus] = useState<"actif" | "indisponible">("actif");

  const handleOpenAddModal = () => {
    setEditingTeacher(null);
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setTeacherSubjectIds([]);
    setTeacherClassIds([]);
    setSalaryType("mensuel");
    setSalaryValue(7500);
    setStatus("actif");
    setIsOpenModal(true);
  };

  const handleOpenEditModal = (tch: Teacher) => {
    setEditingTeacher(tch);
    setFirstName(tch.firstName);
    setLastName(tch.lastName);
    setEmail(tch.email);
    setPhone(tch.phone);
    setTeacherSubjectIds(tch.subjectIds);
    setTeacherClassIds(tch.classIds);
    setSalaryType(tch.salaryType);
    setSalaryValue(tch.salaryValue);
    setStatus(tch.status);
    setIsOpenModal(true);
  };

  const handleSubjectToggle = (subId: string) => {
    if (teacherSubjectIds.includes(subId)) {
      setTeacherSubjectIds(teacherSubjectIds.filter(id => id !== subId));
    } else {
      setTeacherSubjectIds([...teacherSubjectIds, subId]);
    }
  };

  const handleClassToggle = (clsId: string) => {
    if (teacherClassIds.includes(clsId)) {
      setTeacherClassIds(teacherClassIds.filter(id => id !== clsId));
    } else {
      setTeacherClassIds([...teacherClassIds, clsId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !phone) {
      alert("Veuillez remplir tous les champs obligatoires (*)");
      return;
    }

    const payload = {
      firstName,
      lastName,
      email,
      phone,
      subjectIds: teacherSubjectIds,
      classIds: teacherClassIds,
      salaryType,
      salaryValue: Number(salaryValue),
      status
    };

    setIsSaving(true);
    try {
       if (editingTeacher) {
         await onEditTeacher({
           ...editingTeacher,
           ...payload
         });
       } else {
         await onAddTeacher(payload);
       }
       setIsSaving(false);
       setIsSuccess(true);
       setTimeout(() => {
         setIsSuccess(false);
         setIsOpenModal(false);
       }, 900);
     } catch (err: any) {
       console.error("Error saving teacher:", err);
       setIsSaving(false);
       alert(`Une erreur s'est produite lors de l'enregistrement de l'enseignant : ${err?.message || err}`);
     }
  };

  // Filtered list
  const filteredTeachers = teachers.filter(tch => {
    const fullName = `${tch.firstName} ${tch.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) || 
                          tch.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSubject = selectedSubjectFilter === "all" || tch.subjectIds.includes(selectedSubjectFilter);

    return matchesSearch && matchesSubject;
  });

  // Safe pagination
  const totalItems = filteredTeachers.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const activePage = Math.min(currentPage, totalPages);
  const startIndex = (activePage - 1) * pageSize;
  const paginatedTeachers = filteredTeachers.slice(startIndex, startIndex + pageSize);

  return (
    <div id="teachers-section" className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 font-display">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-violet-600 animate-pulse" /> Gestion des Enseignants
          </h2>
          <p className="text-sm text-black">
            Administrez le corps professoral de l'école, leurs spécialités académiques, leurs affectations de classes et leurs conditions financières.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white font-medium py-2 px-4 rounded-xl text-sm flex items-center gap-2 shadow-md shadow-violet-100 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" /> Recruter un Enseignant
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-black" />
          <input
            type="text"
            placeholder="Rechercher un enseignant..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedSubjectFilter}
            onChange={(e) => {
              setSelectedSubjectFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-auto px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-700 cursor-pointer"
          >
            <option value="all">Toutes les spécialités</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.cycle})</option>
            ))}
          </select>
        </div>
      </div>

      {/* List / Grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {paginatedTeachers.map(tch => {
          // Find Subjects Object
          const assignedSubjects = subjects.filter(s => tch.subjectIds.includes(s.id));
          // Find Classes Object
          const assignedClasses = classes.filter(c => tch.classIds.includes(c.id));

          return (
            <div 
              key={tch.id} 
              className={`bg-white rounded-2xl border ${
                tch.status === "indisponible" ? "border-slate-150 opacity-75" : "border-slate-100"
              } shadow-sm overflow-hidden flex flex-col justify-between`}
            >
              {/* Profile Top bar */}
              <div className="p-5 border-b border-slate-50">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center font-bold text-violet-750 uppercase text-md">
                      {tch.firstName[0]}{tch.lastName[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">
                        M. / Mme {tch.firstName} {tch.lastName}
                      </h3>
                      <span className={`inline-block text-[9px] font-semibold px-2 py-0.5 mt-1 rounded-full ${
                        tch.status === "actif" 
                          ? "bg-emerald-50 text-emerald-700" 
                          : "bg-amber-50 text-amber-700"
                      }`}>
                        {tch.status === "actif" ? "Actif" : "En Congé / Indisponible"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(tch)}
                      className="p-1 border border-slate-100 hover:border-violet-200 text-black hover:text-violet-600 bg-slate-50 hover:bg-violet-50 rounded transition"
                      title="Modifier les options"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Voulez-vous révoquer l'enseignant ${tch.firstName} ${tch.lastName} ?`)) {
                          onDeleteTeacher(tch.id);
                        }
                      }}
                      className="p-1 border border-slate-100 hover:border-rose-200 text-black hover:text-rose-600 bg-slate-50 hover:bg-rose-50 rounded transition"
                      title="Supprimer définitivement"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Contacts Block */}
                <div className="mt-4 space-y-1.5 text-xs text-slate-550">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-black" />
                    <span>{tch.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-black" />
                    <span>{tch.phone}</span>
                  </div>
                </div>
              </div>

              {/* Specializations & Assignments details */}
              <div className="p-5 bg-slate-50/50 space-y-3 flex-grow">
                {/* Specialties */}
                <div>
                  <h4 className="text-[10px] uppercase font-bold text-black tracking-wider mb-1.5">
                    Matières Enseignées
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {assignedSubjects.length > 0 ? (
                      assignedSubjects.map(s => (
                        <span key={s.id} className="text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded">
                          {s.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-black italic">Aucune matière assignée</span>
                    )}
                  </div>
                </div>

                {/* Assigned Classes */}
                <div>
                  <h4 className="text-[10px] uppercase font-bold text-black tracking-wider mb-1.5">
                    Classes Supervisées
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {assignedClasses.length > 0 ? (
                      assignedClasses.map(c => (
                        <span key={c.id} className="text-[10px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded">
                          {c.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-black italic">Aucune classe assignée</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Financial Conditions footer */}
              <div className="px-5 py-3 border-t border-slate-100 bg-white flex justify-between items-center">
                <span className="text-xs font-medium text-black uppercase flex items-center gap-1">
                  <Briefcase className="h-3 w-3 text-black" /> Rémunération
                </span>
                <span className="text-xs font-bold text-slate-800">
                  {tch.salaryValue.toLocaleString()} MAD 
                  <span className="text-[10px] font-normal text-black block text-right">
                    par {tch.salaryType === "horaire" ? "heure" : "mois"}
                  </span>
                </span>
              </div>
            </div>
          );
        })}

        {filteredTeachers.length === 0 && (
          <div className="col-span-full bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-xs">
            <GraduationCap className="h-12 w-12 text-black mx-auto mb-2" />
            <p className="text-black font-medium">Aucun professeur ne correspond à vos critères</p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {filteredTeachers.length > 0 && (
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-black font-medium">
            Affichage de <span className="font-bold text-slate-700">{startIndex + 1}</span> à{" "}
            <span className="font-bold text-slate-700">{Math.min(startIndex + pageSize, totalItems)}</span> sur{" "}
            <span className="font-bold text-slate-700">{totalItems}</span> enseignants
          </div>
          <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
            {/* Page Size Selector */}
            <div className="flex items-center gap-1.5 text-xs text-black">
              <span>Cartes par page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-slate-50 border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-violet-500 font-semibold text-slate-700 cursor-pointer text-[11px]"
              >
                <option value={6}>6</option>
                <option value={9}>9</option>
                <option value={15}>15</option>
                <option value={30}>30</option>
              </select>
            </div>

            {/* Page Navigation */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={activePage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-black hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Précédent
              </button>
              <span className="text-xs text-black font-semibold px-2">
                Page {activePage} sur {totalPages}
              </span>
              <button
                type="button"
                disabled={activePage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-black hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Suivant
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE & EDIT TEACHER MODAL */}
      {isOpenModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-xl border border-slate-100 overflow-hidden animate-in fade-in-50 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-violet-500" />
                {editingTeacher ? "Modifier la Fiche Enseignant" : "Inscrire un Nouvel Enseignant"}
              </h3>
              <button 
                onClick={() => setIsOpenModal(false)}
                className="text-black hover:text-black p-1 bg-white hover:bg-slate-100 rounded-full border border-slate-100 transition focus:outline-none"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Personal */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-black uppercase mb-1">Prénom *</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder="Abdelali"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-black uppercase mb-1">Nom *</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder="El Idrissi"
                  />
                </div>
              </div>

              {/* Contacts info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-black uppercase mb-1">Adresse Email *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder="e.g. profes@madrasati.ma"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-black uppercase mb-1">GSM Maroc *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder="e.g. 0661234567"
                  />
                </div>
              </div>

              {/* Assign Specializations Subjects list */}
              <div>
                <label className="block text-xs font-bold text-black uppercase mb-1.5 flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5 text-black" /> Matières de Prédilection (Spécialités)
                </label>
                <div className="max-h-28 overflow-y-auto p-3 border border-slate-200 rounded-lg grid grid-cols-2 gap-2 bg-slate-50">
                  {subjects.map(s => (
                    <label key={s.id} className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={teacherSubjectIds.includes(s.id)}
                        onChange={() => handleSubjectToggle(s.id)}
                        className="rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                      />
                      <span>{s.name} ({s.cycle})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Assign Classes */}
              <div>
                <label className="block text-xs font-bold text-black uppercase mb-1.5 flex items-center gap-1">
                  <Briefcase className="h-3.5 w-3.5 text-black" /> Classes Affectées
                </label>
                <div className="max-h-28 overflow-y-auto p-3 border border-slate-200 rounded-lg grid grid-cols-2 gap-2 bg-slate-50">
                  {classes.map(c => (
                    <label key={c.id} className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={teacherClassIds.includes(c.id)}
                        onChange={() => handleClassToggle(c.id)}
                        className="rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                      />
                      <span>{c.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Remuneration Conditions */}
              <div className="bg-slate-50 p-4 rounded-xl space-y-3 border border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 uppercase">Accord financier</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] text-slate-550 mb-1">Type de Contrat</label>
                    <select
                      value={salaryType}
                      onChange={(e) => setSalaryType(e.target.value as any)}
                      className="w-full bg-white text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
                    >
                      <option value="mensuel">Salaire Fixe Mensuel</option>
                      <option value="horaire">Taux Horaire (Vacataire)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-550 mb-1">Indemnité (MAD)</label>
                    <input
                      type="number"
                      value={salaryValue}
                      onChange={(e) => setSalaryValue(Number(e.target.value))}
                      className="w-full bg-white text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
                      placeholder="e.g. 8000"
                    />
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-bold text-black uppercase mb-1">Disponibilité</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="actif">Actif (Prêt à enseigner)</option>
                  <option value="indisponible">En congé de maladie / Indisponible</option>
                </select>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-white">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setIsOpenModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-black hover:bg-slate-50 border border-slate-200 rounded-lg transition cursor-pointer"
                >
                  Annuler
                </button>
                <motion.button
                  whileHover={!isSaving ? { scale: 1.02 } : {}}
                  whileTap={!isSaving ? { scale: 0.98 } : {}}
                  type="submit"
                  disabled={isSaving || isSuccess}
                  className={`relative overflow-hidden px-4 py-2 text-sm font-semibold text-white rounded-lg shadow transition-all duration-300 min-w-40 flex items-center justify-center gap-1.5 cursor-pointer ${
                    isSuccess
                      ? "bg-emerald-600 border-emerald-600"
                      : "bg-violet-600 hover:bg-violet-700"
                  }`}
                >
                  {isSaving ? (
                    <>
                      <span className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Enregistrement...</span>
                    </>
                  ) : isSuccess ? (
                    <>
                      <Check className="h-4 w-4 text-white animate-bounce shrink-0" />
                      <span>Validé !</span>
                    </>
                  ) : (
                    <span>{editingTeacher ? "Enregistrer" : "Créer la Fiche Prof"}</span>
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
