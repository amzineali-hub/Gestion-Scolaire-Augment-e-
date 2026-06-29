export type Cycle = "Primaire" | "Collège" | "Lycée";

export interface Subject {
  id: string;
  name: string;
  code: string;
  cycle: Cycle;
  hoursPerWeek: number;
}

export interface Class {
  id: string;
  name: string;
  cycle: Cycle;
  level: string; // e.g. "6ème Année", "3ème Collège", "2ème BAC PC"
  capacity: number;
  room: string;
  feeAmount: number; // Monthly tuition fee in MAD
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  classId: string; // References Class.id
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  registrationDate: string;
  status: "actif" | "suspendu" | "archivé";
  outstandingBalance: number; // in MAD
  transportOption?: boolean;
  canteenOption?: boolean;
  tutoringOption?: boolean;
  sportOption?: boolean;
  smsOption?: boolean;
  insuranceOption?: boolean;
  aiOption?: boolean;
  missingDocuments?: string[]; // Array of missing documents e.g. ["Certificat médical", "Photos"]
}

export interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subjectIds: string[]; // References Subject.ids they can teach
  classIds: string[]; // References Class.ids they are assigned to
  salaryType: "mensuel" | "horaire";
  salaryValue: number; // in MAD (e.g. 8000 MAD/month or 150 MAD/hour)
  status: "actif" | "indisponible";
}

export interface ScheduleItem {
  id: string;
  classId: string; // References Class
  teacherId: string; // References Teacher
  subjectId: string; // References Subject
  day: "Lundi" | "Mardi" | "Mercredi" | "Jeudi" | "Vendredi" | "Samedi";
  startTime: string; // e.g. "08:30"
  endTime: string; // e.g. "10:30"
  room: string;
}

export interface Invoice {
  id: string;
  studentId: string; // References Student
  month: string; // e.g. "Octobre 2026"
  amount: number; // in MAD
  dueDate: string;
  status: "payé" | "impayé" | "retard";
  paymentDate?: string;
  paymentMethod?: "Carte" | "Chèque" | "Virement" | "Espèces";
}

export interface SchoolStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalSubjects: number;
  activeCycleDistribution: { name: string; count: number }[];
  expectedRevenue: number;
  collectedRevenue: number;
  uncollectedRevenue: number;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  date: string; // YYYY-MM-DD
  timestamp: string; // ISO 8601
  status: "présent" | "absent" | "en retard";
  recordedBy?: string;
  notes?: string;
}
