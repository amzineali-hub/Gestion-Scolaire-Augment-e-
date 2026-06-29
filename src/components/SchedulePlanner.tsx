import React, { useState } from "react";
import { motion } from "motion/react";
import { ScheduleItem, Class, Teacher, Subject } from "../types";
import { 
  Calendar, 
  Clock, 
  Trash2, 
  Plus, 
  AlertOctagon, 
  Check, 
  X, 
  MapPin, 
  Grid, 
  Filter, 
  GraduationCap, 
  School 
} from "lucide-react";

interface SchedulePlannerProps {
  schedules: ScheduleItem[];
  classes: Class[];
  teachers: Teacher[];
  subjects: Subject[];
  onAddSchedule: (item: Omit<ScheduleItem, "id">) => void;
  onDeleteSchedule: (id: string) => void;
}

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"] as const;
const TIME_SLOTS = [
  { start: "08:30", end: "10:30" },
  { start: "10:45", end: "12:15" },
  { start: "14:30", end: "16:30" },
  { start: "16:45", end: "18:45" }
];

export default function SchedulePlanner({
  schedules,
  classes,
  teachers,
  subjects,
  onAddSchedule,
  onDeleteSchedule
}: SchedulePlannerProps) {
  // Navigation filters
  const [filterType, setFilterType] = useState<"class" | "teacher">("class");
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || "");
  const [selectedTeacherId, setSelectedTeacherId] = useState(teachers[0]?.id || "");

  // Modal State
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form State
  const [formClassId, setFormClassId] = useState(classes[0]?.id || "");
  const [formTeacherId, setFormTeacherId] = useState(teachers[0]?.id || "");
  const [formSubjectId, setFormSubjectId] = useState("");
  const [formDay, setFormDay] = useState<typeof DAYS[number]>("Lundi");
  const [formStartTime, setFormStartTime] = useState("08:30");
  const [formEndTime, setFormEndTime] = useState("10:30");
  const [formRoom, setFormRoom] = useState("");

  // Conflict warnings
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  // Filter schedules based on selection
  const visibleSchedules = schedules.filter(sch => {
    if (filterType === "class") {
      return sch.classId === selectedClassId;
    } else {
      return sch.teacherId === selectedTeacherId;
    }
  });

  // Calculate teacher eligible subjects based on the form teacher
  const selectedTeacher = teachers.find(t => t.id === formTeacherId);
  const eligibleSubjects = subjects.filter(sub => {
    if (!selectedTeacher || !selectedTeacher.subjectIds || selectedTeacher.subjectIds.length === 0) return true;
    return selectedTeacher.subjectIds.includes(sub.id);
  });

  // Fallback: if no subjects match the teacher's configured specialties, show all subjects so that they are never blocked
  const finalSubjects = eligibleSubjects.length > 0 ? eligibleSubjects : subjects;

  // Synchronize dynamic formSubjectId to prevent empty selection options
  React.useEffect(() => {
    if (!isOpenModal) return;
    if (finalSubjects.length > 0) {
      const exists = finalSubjects.some(s => s.id === formSubjectId);
      if (!exists) {
        setFormSubjectId(finalSubjects[0].id);
      }
    } else {
      setFormSubjectId("");
    }
  }, [formTeacherId, isOpenModal, finalSubjects, formSubjectId]);

  // Check schedule conflict when changing form fields
  const checkConflicts = (
    classId: string, 
    teacherId: string, 
    day: string, 
    start: string, 
    end: string, 
    room: string
  ): string | null => {
    // Basic overlap function
    const isOverlapping = (s1: string, e1: string, s2: string, e2: string) => {
      return s1 < e2 && s2 < e1;
    };

    for (const sch of schedules) {
      if (sch.day === day && isOverlapping(start, end, sch.startTime, sch.endTime)) {
        // Class conflict
        if (sch.classId === classId) {
          const cls = classes.find(c => c.id === sch.classId);
          return `Conflit de classe: La classe ${cls?.name || ""} est déjà occupée dans la ${sch.room} de ${sch.startTime} à ${sch.endTime}`;
        }
        // Teacher conflict
        if (sch.teacherId === teacherId) {
          const tch = teachers.find(t => t.id === sch.teacherId);
          return `Conflit d'enseignant: M. / Mme ${tch?.lastName || ""} donne déjà un cours ailleurs (${sch.room}) de ${sch.startTime} à ${sch.endTime}`;
        }
        // Room conflict
        if (sch.room.trim().toLowerCase() === room.trim().toLowerCase() && room !== "") {
          const cls = classes.find(c => c.id === sch.classId);
          return `La salle ${room} est déjà réservée par la classe ${cls?.name || ""} de ${sch.startTime} à ${sch.endTime}`;
        }
      }
    }
    return null;
  };

  const handleOpenAddModal = () => {
    const defaultClass = classes[0]?.id || "";
    const defaultTeacher = teachers[0]?.id || "";
    setFormClassId(defaultClass);
    setFormTeacherId(defaultTeacher);
    
    // Auto find suitable subject
    const teacherObj = teachers.find(t => t.id === defaultTeacher);
    const validTeacherSubjects = subjects.filter(sub => teacherObj && teacherObj.subjectIds && teacherObj.subjectIds.includes(sub.id));
    const subId = validTeacherSubjects[0]?.id || subjects[0]?.id || "";
    setFormSubjectId(subId);

    setFormDay("Lundi");
    setFormStartTime("08:30");
    setFormEndTime("10:30");
    
    const classObj = classes.find(c => c.id === defaultClass);
    setFormRoom(classObj?.room || "Salle 1");
    
    setConflictWarning(null);
    setIsOpenModal(true);
  };

  const handleFieldChange = (updates: {
    classId?: string;
    teacherId?: string;
    day?: typeof DAYS[number];
    start?: string;
    end?: string;
    room?: string;
  }) => {
    const cId = updates.classId ?? formClassId;
    const tId = updates.teacherId ?? formTeacherId;
    const dy = updates.day ?? formDay;
    const str = updates.start ?? formStartTime;
    const nd = updates.end ?? formEndTime;
    const rm = updates.room ?? formRoom;

    // Set states
    if (updates.classId !== undefined) {
      setFormClassId(updates.classId);
      const classObj = classes.find(c => c.id === updates.classId);
      if (classObj) setFormRoom(classObj.room);
    }
    if (updates.teacherId !== undefined) {
      setFormTeacherId(updates.teacherId);
      const tObj = teachers.find(t => t.id === updates.teacherId);
      const tSubjects = subjects.filter(sub => tObj && tObj.subjectIds && tObj.subjectIds.includes(sub.id));
      if (tSubjects.length > 0) {
        setFormSubjectId(tSubjects[0].id);
      } else if (subjects.length > 0) {
        setFormSubjectId(subjects[0].id);
      }
    }
    if (updates.day !== undefined) setFormDay(updates.day);
    if (updates.start !== undefined) setFormStartTime(updates.start);
    if (updates.end !== undefined) setFormEndTime(updates.end);
    if (updates.room !== undefined) setFormRoom(updates.room);

    // Call check conflict
    const conflict = checkConflicts(cId, tId, dy, str, nd, rm);
    setConflictWarning(conflict);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Final strict conflict check
    const conflict = checkConflicts(formClassId, formTeacherId, formDay, formStartTime, formEndTime, formRoom);
    if (conflict) {
      alert(`Erreur de planification: ${conflict}`);
      return;
    }

    if (!formSubjectId) {
      alert("Veuillez assigner une matière d'enseignement");
      return;
    }

    setIsSaving(true);
    try {
      await onAddSchedule({
        classId: formClassId,
        teacherId: formTeacherId,
        subjectId: formSubjectId,
        day: formDay,
        startTime: formStartTime,
        endTime: formEndTime,
        room: formRoom
      });
      setIsSaving(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setIsOpenModal(false);
      }, 900);
    } catch (err: any) {
      console.error("Error saving schedule:", err);
      setIsSaving(false);
      alert(`Erreur lors de l'enregistrement de l'horaire : ${err?.message || err}`);
    }
  };

  return (
    <div id="schedule-planner" className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
            <Calendar className="h-6 w-6 text-indigo-600" /> Emplois du Temps
          </h2>
          <p className="text-sm text-black">
            Configurez les créneaux horaires, assignez des salles, affectez les enseignants et prévenez les doublons de réservation.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-xl text-sm flex items-center gap-2 transition focus:outline-none self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" /> Planifier un Cours
        </button>
      </div>

      {/* Selector and filters menu */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" /> Filtrer l'emploi du temps par :
          </span>

          <div className="inline-flex rounded-lg p-0.5 bg-slate-100">
            <button
              onClick={() => setFilterType("class")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                filterType === "class" 
                  ? "bg-white text-indigo-700 shadow-xs" 
                  : "text-black hover:text-slate-800"
              }`}
            >
              Classe
            </button>
            <button
              onClick={() => setFilterType("teacher")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                filterType === "teacher" 
                  ? "bg-white text-indigo-700 shadow-xs" 
                  : "text-black hover:text-slate-800"
              }`}
            >
              Enseignant
            </button>
          </div>
        </div>

        {/* Dynamic drop list depending on filter type */}
        <div className="shrink-0">
          {filterType === "class" ? (
            <div className="flex items-center gap-2">
              <School className="h-4 w-4 text-black" />
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-44 text-slate-700 bg-slate-50"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.level})</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-black" />
              <select
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-44 text-slate-700 bg-slate-50"
              >
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>Prof. {t.firstName} {t.lastName}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Main visual weekly Calendar board */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        
        {/* Mobile Alert layout */}
        <div className="block lg:hidden p-4 bg-amber-50 text-amber-900 text-xs border-b border-amber-100">
          * Conseil: L'expérience emploi du temps est optimisée sur écran plus grand pour afficher la grille complète de Lundi à Samedi.
        </div>

        {/* GRID STRUCTURE */}
        <div className="grid grid-cols-1 lg:grid-cols-6 divide-y lg:divide-y-0 lg:divide-x divide-slate-150">
          {DAYS.map(day => {
            const daySchedules = visibleSchedules
              .filter(sch => sch.day === day)
              .sort((a, b) => a.startTime.localeCompare(b.startTime));

            return (
              <div key={day} className="flex flex-col min-h-64">
                {/* Day Header */}
                <div className="bg-slate-50/50 px-4 py-3 border-b border-slate-100 font-bold text-slate-700 text-xs text-center uppercase tracking-wider">
                  {day}
                </div>

                {/* Day Slots wrapper */}
                <div className="p-3 flex-grow space-y-2.5 bg-slate-50/10">
                  {daySchedules.length > 0 ? (
                    daySchedules.map(sch => {
                      const subjectObj = subjects.find(s => s.id === sch.subjectId);
                      const classObj = classes.find(c => c.id === sch.classId);
                      const teacherObj = teachers.find(t => t.id === sch.teacherId);

                      return (
                        <div 
                          key={sch.id} 
                          className="bg-white border border-slate-150 p-2.5 rounded-xl shadow-2xs hover:shadow transition relative group"
                        >
                          {/* Trash button hidden/shown on hover */}
                          <button
                            onClick={() => {
                              if (confirm("Supprimer ce créneau horaire ?")) {
                                onDeleteSchedule(sch.id);
                              }
                            }}
                            className="bg-rose-50 text-rose-600 hover:text-rose-800 absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition p-1 rounded hover:bg-rose-100"
                            title="Retirer le cours"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>

                          {/* Time tag */}
                          <div className="flex items-center gap-1 text-[9px] font-bold text-indigo-600 uppercase mb-1">
                            <Clock className="h-3 w-3" /> 
                            <span>{sch.startTime} - {sch.endTime}</span>
                          </div>

                          {/* Subject label */}
                          <p className="text-xs font-bold text-slate-800 line-clamp-1">
                            {subjectObj?.name || "Matière Inconnue"}
                          </p>

                          {/* Details (Class or teacher depending on active filter) */}
                          {filterType === "class" ? (
                            <p className="text-[10px] text-black mt-0.5 font-medium">
                              👨‍🏫 {teacherObj ? `${teacherObj.firstName[0]}. ${teacherObj.lastName}` : "Sans prof"}
                            </p>
                          ) : (
                            <p className="text-[10px] text-black mt-0.5 font-medium">
                              🏫 {classObj?.name || "Sans classe"}
                            </p>
                          )}

                          {/* Room allocation */}
                          <div className="mt-1.5 flex items-center gap-1 text-[9px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded-sm w-fit">
                            <MapPin className="h-2.5 w-2.5" />
                            <span>{sch.room}</span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-8 text-center text-[11px] text-slate-450 italic">
                      Pas de cours planifié
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* NEW PERIOD SCHEDULER MODAL */}
      {isOpenModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-100 overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm">
                Ajouter un Cours à l'Emploi du Temps
              </h3>
              <button 
                onClick={() => setIsOpenModal(false)}
                className="text-black hover:text-slate-650 bg-white border rounded-full p-1 transition focus:outline-none"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Conflict banner */}
              {conflictWarning && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl flex gap-1.5 text-xs text-left">
                  <AlertOctagon className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
                  <p className="leading-tight font-medium">{conflictWarning}</p>
                </div>
              )}

              {/* Class selector */}
              <div>
                <label className="block text-xs font-bold text-black uppercase mb-1">Classe Receptrice *</label>
                <select
                  value={formClassId}
                  onChange={(e) => handleFieldChange({ classId: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-slate-50"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.level})</option>
                  ))}
                </select>
              </div>

              {/* Teacher selector */}
              <div>
                <label className="block text-xs font-bold text-black uppercase mb-1">Enseignant Responsable *</label>
                <select
                  value={formTeacherId}
                  onChange={(e) => handleFieldChange({ teacherId: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-slate-50"
                >
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>Prof. {t.firstName} {t.lastName}</option>
                  ))}
                </select>
              </div>

              {/* Subject selector (depends on teacher specialties) */}
              <div>
                <label className="block text-xs font-bold text-black uppercase mb-1">Matière Enseignée *</label>
                <select
                  value={formSubjectId}
                  onChange={(e) => setFormSubjectId(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-slate-50"
                >
                  {finalSubjects.length > 0 ? (
                    finalSubjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.cycle})</option>
                    ))
                  ) : (
                    <option value="">-- Aucune matière disponible --</option>
                  )}
                </select>
              </div>

              {/* Day */}
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-black uppercase mb-1">Jour *</label>
                  <select
                    value={formDay}
                    onChange={(e) => handleFieldChange({ day: e.target.value as any })}
                    className="w-full text-xs border border-slate-200 rounded-lg px-2 py-2"
                  >
                    {DAYS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-1">
                  <label className="block text-xs font-bold text-black uppercase mb-1">Début *</label>
                  <select
                    value={formStartTime}
                    onChange={(e) => handleFieldChange({ start: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-lg px-2 py-2"
                  >
                    <option value="08:30">08:30</option>
                    <option value="10:30">10:30</option>
                    <option value="10:45">10:45</option>
                    <option value="14:30">14:30</option>
                    <option value="16:30">16:30</option>
                    <option value="16:45">16:45</option>
                  </select>
                </div>

                <div className="col-span-1">
                  <label className="block text-xs font-bold text-black uppercase mb-1">Fin *</label>
                  <select
                    value={formEndTime}
                    onChange={(e) => handleFieldChange({ end: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-lg px-2 py-2"
                  >
                    <option value="10:30">10:30</option>
                    <option value="12:15">12:15</option>
                    <option value="12:30">12:30</option>
                    <option value="16:30">16:30</option>
                    <option value="18:30">18:30</option>
                    <option value="18:45">18:45</option>
                  </select>
                </div>
              </div>

              {/* Room details */}
              <div>
                <label className="block text-xs font-bold text-black uppercase mb-1">Salle / Local de cours *</label>
                <input
                  type="text"
                  required
                  value={formRoom}
                  onChange={(e) => handleFieldChange({ room: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2"
                  placeholder="Ex: Salle 10, Labo"
                />
              </div>

              {/* Submit triggers */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setIsOpenModal(false)}
                  className="px-3.5 py-1.5 text-xs text-black hover:bg-slate-50 border rounded-lg cursor-pointer"
                >
                  Fermer
                </button>
                <motion.button
                  whileHover={!conflictWarning && !isSaving ? { scale: 1.02 } : {}}
                  whileTap={!conflictWarning && !isSaving ? { scale: 0.98 } : {}}
                  type="submit"
                  disabled={!!conflictWarning || isSaving || isSuccess}
                  className={`relative overflow-hidden px-4 py-2 text-xs font-semibold rounded-lg text-white shadow transition-all duration-300 min-w-40 flex items-center justify-center gap-1.5 cursor-pointer ${
                    isSuccess
                      ? "bg-emerald-600 border-emerald-600"
                      : conflictWarning 
                        ? "bg-slate-300 cursor-not-allowed" 
                        : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                >
                  {isSaving ? (
                    <>
                      <span className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Planification...</span>
                    </>
                  ) : isSuccess ? (
                    <>
                      <Check className="h-4 w-4 text-white animate-bounce shrink-0" />
                      <span>Cours Planifié !</span>
                    </>
                  ) : (
                    <span>Confirmer le cours</span>
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
