import { Subject, Class, Teacher, Student, ScheduleItem, Invoice } from "./types";

export const INITIAL_SUBJECTS: Subject[] = [
  { id: "sub-1", name: "Langue Arabe", code: "ARA", cycle: "Primaire", hoursPerWeek: 6 },
  { id: "sub-2", name: "Langue Française", code: "FRA", cycle: "Primaire", hoursPerWeek: 7 },
  { id: "sub-3", name: "Mathématiques", code: "MAT", cycle: "Primaire", hoursPerWeek: 5 },
  { id: "sub-4", name: "Éducation Islamique", code: "ISL", cycle: "Primaire", hoursPerWeek: 2 },
  
  { id: "sub-5", name: "Mathématiques (Bilingue)", code: "MAT_C", cycle: "Collège", hoursPerWeek: 5 },
  { id: "sub-6", name: "Physique-Chimie", code: "PHY_C", cycle: "Collège", hoursPerWeek: 3 },
  { id: "sub-7", name: "Sciences de la Vie et de la Terre (SVT)", code: "SVT_C", cycle: "Collège", hoursPerWeek: 3 },
  { id: "sub-8", name: "Langue Anglaise", code: "ANG_C", cycle: "Collège", hoursPerWeek: 3 },
  
  { id: "sub-9", name: "Mathématiques (SM/PC)", code: "MAT_L", cycle: "Lycée", hoursPerWeek: 6 },
  { id: "sub-10", name: "Physique-Chimie (BIOF)", code: "PHY_L", cycle: "Lycée", hoursPerWeek: 5 },
  { id: "sub-11", name: "Sciences de la Vie et de la Terre", code: "SVT_L", cycle: "Lycée", hoursPerWeek: 3 },
  { id: "sub-12", name: "Philosophie", code: "PHI_L", cycle: "Lycée", hoursPerWeek: 2 },
  { id: "sub-13", name: "Histoire-Géographie", code: "HIS_L", cycle: "Lycée", hoursPerWeek: 2 },
];

export const INITIAL_CLASSES: Class[] = [
  // Primaire
  { id: "cls-1", name: "CM2 - A", cycle: "Primaire", level: "CM2", capacity: 25, room: "Salle 10", feeAmount: 2200 },
  { id: "cls-2", name: "6ème AP - B", cycle: "Primaire", level: "6ème AP", capacity: 24, room: "Salle 12", feeAmount: 2400 },
  
  // Collège
  { id: "cls-3", name: "3ème Collège - 1", cycle: "Collège", level: "3ème Année", capacity: 28, room: "Salle 22", feeAmount: 2800 },
  { id: "cls-4", name: "2ème Collège - Bilingue", cycle: "Collège", level: "2ème Année", capacity: 26, room: "Salle 24", feeAmount: 2700 },
  
  // Lycée
  { id: "cls-5", name: "2ème BAC PC - BIOF", cycle: "Lycée", level: "2ème BAC PC", capacity: 30, room: "Labo Physique", feeAmount: 3500 },
  { id: "cls-6", name: "1ère BAC Sciences - A", cycle: "Lycée", level: "1ère BAC SC", capacity: 28, room: "Salle 31", feeAmount: 3200 },
];

export const INITIAL_TEACHERS: Teacher[] = [
  {
    id: "tch-1",
    firstName: "Abdelilah",
    lastName: "El Amrani",
    email: "a.elamrani@madrasati.ma",
    phone: "0661234567",
    subjectIds: ["sub-3", "sub-5", "sub-9"], // Maths expert
    classIds: ["cls-3", "cls-5", "cls-6"],
    salaryType: "mensuel",
    salaryValue: 9500,
    status: "actif"
  },
  {
    id: "tch-2",
    firstName: "Nadia",
    lastName: "Benjelloun",
    email: "n.benjelloun@madrasati.ma",
    phone: "0662345678",
    subjectIds: ["sub-2", "sub-8"], // French and English
    classIds: ["cls-1", "cls-2", "cls-3", "cls-4"],
    salaryType: "mensuel",
    salaryValue: 8000,
    status: "actif"
  },
  {
    id: "tch-3",
    firstName: "Rachid",
    lastName: "Tazi",
    email: "r.tazi@madrasati.ma",
    phone: "0663456789",
    subjectIds: ["sub-6", "sub-10"], // Physics
    classIds: ["cls-4", "cls-5", "cls-6"],
    salaryType: "horaire",
    salaryValue: 180, // 180 MAD/hour
    status: "actif"
  },
  {
    id: "tch-4",
    firstName: "Fatima-Zahra",
    lastName: "Bensouda",
    email: "fz.bensouda@madrasati.ma",
    phone: "0664567890",
    subjectIds: ["sub-7", "sub-11"], // SVT
    classIds: ["cls-3", "cls-5"],
    salaryType: "mensuel",
    salaryValue: 7800,
    status: "actif"
  },
  {
    id: "tch-5",
    firstName: "Khalid",
    lastName: "Alaoui",
    email: "k.alaoui@madrasati.ma",
    phone: "0665678901",
    subjectIds: ["sub-1", "sub-4", "sub-12", "sub-13"], // Arabic, History, Philosophy, Islamic
    classIds: ["cls-1", "cls-2", "cls-5", "cls-6"],
    salaryType: "mensuel",
    salaryValue: 8500,
    status: "actif"
  }
];

export const INITIAL_STUDENTS: Student[] = [
  // CM2 - A
  { id: "std-1", firstName: "Amine", lastName: "Alami", classId: "cls-1", parentName: "Jaafar Alami", parentPhone: "0612345601", parentEmail: "j.alami@gmail.com", registrationDate: "2025-09-02", status: "actif", outstandingBalance: 0 },
  { id: "std-2", firstName: "Yasmine", lastName: "Cherkaoui", classId: "cls-1", parentName: "Hicham Cherkaoui", parentPhone: "0612345602", parentEmail: "h.cherkaoui@hotmail.com", registrationDate: "2025-09-02", status: "actif", outstandingBalance: 2200 },
  { id: "std-3", firstName: "Omar", lastName: "Filali", classId: "cls-1", parentName: "Malika Filali", parentPhone: "0612345603", parentEmail: "m.filali@yahoo.fr", registrationDate: "2025-09-03", status: "actif", outstandingBalance: 0 },
  
  // 6ème AP - B
  { id: "std-4", firstName: "Ghita", lastName: "Kadiri", classId: "cls-2", parentName: "Anas Kadiri", parentPhone: "0612345604", parentEmail: "a.kadiri@gmail.com", registrationDate: "2025-09-02", status: "actif", outstandingBalance: 0 },
  { id: "std-5", firstName: "Mehdi", lastName: "Bennani", classId: "cls-2", parentName: "Salim Bennani", parentPhone: "0612345605", parentEmail: "s.bennani@outlook.ma", registrationDate: "2025-09-05", status: "suspendu", outstandingBalance: 4800 },
  
  // 3ème Collège - 1
  { id: "std-6", firstName: "Kenzo", lastName: "El Idrissi", classId: "cls-3", parentName: "Tarik El Idrissi", parentPhone: "0612345606", parentEmail: "tarik.idrissi@gmail.com", registrationDate: "2025-09-01", status: "actif", outstandingBalance: 0 },
  { id: "std-7", firstName: "Sofia", lastName: "Belkhayat", classId: "cls-3", parentName: "Myriam Belkhayat", parentPhone: "0612345607", parentEmail: "m.belkhayat@gmail.com", registrationDate: "2025-09-02", status: "actif", outstandingBalance: 0 },
  
  // 2ème BAC PC
  { id: "std-8", firstName: "Reda", lastName: "Slaoui", classId: "cls-5", parentName: "Kamal Slaoui", parentPhone: "0612345608", parentEmail: "k.slaoui@gmail.com", registrationDate: "2025-09-01", status: "actif", outstandingBalance: 0 },
  { id: "std-9", firstName: "Kawtar", lastName: "Bouazzaoui", classId: "cls-5", parentName: "Said Bouazzaoui", parentPhone: "0612345609", parentEmail: "s.bouazzaoui@gmail.com", registrationDate: "2025-09-02", status: "actif", outstandingBalance: 3500 },
  { id: "std-10", firstName: "Saad", lastName: "Tazi", classId: "cls-5", parentName: "Rachid Tazi", parentPhone: "0663456789", parentEmail: "r.tazi@madrasati.ma", registrationDate: "2025-09-01", status: "actif", outstandingBalance: 0 }
];

export const INITIAL_SCHEDULES: ScheduleItem[] = [
  // CM2 - A (cls-1)
  { id: "sch-1", classId: "cls-1", teacherId: "tch-5", subjectId: "sub-1", day: "Lundi", startTime: "08:30", endTime: "10:30", room: "Salle 10" },
  { id: "sch-2", classId: "cls-1", teacherId: "tch-2", subjectId: "sub-2", day: "Lundi", startTime: "10:45", endTime: "12:15", room: "Salle 10" },
  { id: "sch-3", classId: "cls-1", teacherId: "tch-5", subjectId: "sub-4", day: "Mardi", startTime: "08:30", endTime: "10:30", room: "Salle 10" },
  
  // 3ème Collège - 1 (cls-3)
  { id: "sch-4", classId: "cls-3", teacherId: "tch-1", subjectId: "sub-5", day: "Lundi", startTime: "08:30", endTime: "10:30", room: "Salle 22" },
  { id: "sch-5", classId: "cls-3", teacherId: "tch-3", subjectId: "sub-6", day: "Lundi", startTime: "10:45", endTime: "12:15", room: "Labo Physique" },
  { id: "sch-6", classId: "cls-3", teacherId: "tch-4", subjectId: "sub-7", day: "Mercredi", startTime: "14:30", endTime: "16:30", room: "Salle 22" },

  // 2ème BAC PC (cls-5)
  { id: "sch-7", classId: "cls-5", teacherId: "tch-1", subjectId: "sub-9", day: "Mardi", startTime: "08:30", endTime: "10:30", room: "Salle 31" },
  { id: "sch-8", classId: "cls-5", teacherId: "tch-3", subjectId: "sub-10", day: "Mardi", startTime: "14:30", endTime: "16:30", room: "Labo Physique" },
  { id: "sch-9", classId: "cls-5", teacherId: "tch-4", subjectId: "sub-11", day: "Jeudi", startTime: "10:45", endTime: "12:15", room: "Salle 31" },
  { id: "sch-10", classId: "cls-5", teacherId: "tch-5", subjectId: "sub-12", day: "Vendredi", startTime: "08:30", endTime: "10:30", room: "Salle 31" },
  { id: "sch-11", classId: "cls-5", teacherId: "tch-5", subjectId: "sub-13", day: "Samedi", startTime: "09:00", endTime: "12:00", room: "Salle 31" }
];

export const INITIAL_INVOICES: Invoice[] = [
  { id: "inv-1", studentId: "std-1", month: "Mai 2026", amount: 2200, dueDate: "2026-05-10", status: "payé", paymentDate: "2026-05-05", paymentMethod: "Carte" },
  { id: "inv-2", studentId: "std-2", month: "Mai 2026", amount: 2200, dueDate: "2026-05-10", status: "impayé" },
  { id: "inv-3", studentId: "std-3", month: "Mai 2026", amount: 2200, dueDate: "2026-05-10", status: "payé", paymentDate: "2026-05-09", paymentMethod: "Espèces" },
  
  { id: "inv-4", studentId: "std-4", month: "Mai 2026", amount: 2400, dueDate: "2026-05-10", status: "payé", paymentDate: "2026-05-07", paymentMethod: "Chèque" },
  { id: "inv-5", studentId: "std-5", month: "Mai 2026", amount: 2400, dueDate: "2026-05-10", status: "retard" },
  { id: "inv-6", studentId: "std-5", month: "Avril 2026", amount: 2400, dueDate: "2026-04-10", status: "impayé" },

  { id: "inv-7", studentId: "std-8", month: "Mai 2026", amount: 3500, dueDate: "2026-05-10", status: "payé", paymentDate: "2026-05-08", paymentMethod: "Virement" },
  { id: "inv-8", studentId: "std-9", month: "Mai 2026", amount: 3500, dueDate: "2026-05-10", status: "retard" },
];

export const MOROCCAN_CITIES = ["Casablanca", "Rabat", "Marrakech", "Tanger", "Fès", "Agadir", "Oujda", "Meknès", "Kenitra", "Tétouan"];
