import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, onSnapshot, doc, setDoc, query, deleteDoc, updateDoc } from 'firebase/firestore';
import { 
  Subject, 
  Class, 
  Student, 
  Teacher, 
  ScheduleItem, 
  Invoice,
  AttendanceRecord
} from '../types';
import { 
  INITIAL_SUBJECTS, 
  INITIAL_CLASSES, 
  INITIAL_TEACHERS, 
  INITIAL_STUDENTS, 
  INITIAL_SCHEDULES, 
  INITIAL_INVOICES 
} from "../data";

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  
  if (errInfo.error.toLowerCase().includes('quota')) {
    console.warn('Firestore Quota Exceeded (falling back to local data): ', JSON.stringify(errInfo));
  } else {
    console.error('Firestore Error: ', JSON.stringify(errInfo));
  }
  // throw new Error(JSON.stringify(errInfo));
}

export function useFirebaseData(schoolId: string | null) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  useEffect(() => {
    if (!schoolId || !db) {
      setSubjects([]);
      setClasses([]);
      setStudents([]);
      setTeachers([]);
      setSchedules([]);
      setInvoices([]);
      setLoadingInitial(false);
      return;
    }

    setLoadingInitial(true);

    const schoolRef = doc(db, 'schools', schoolId);
    
    const isQuotaError = (error: unknown) => {
      const msg = String(error).toLowerCase();
      return msg.includes('quota') || msg.includes('permission');
    };

    // Subcollections with handlers
    const unsubStudents = onSnapshot(collection(schoolRef, 'students'), (snapshot) => {
      setStudents(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Student)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `schools/${schoolId}/students`);
      if (isQuotaError(error)) setStudents(INITIAL_STUDENTS);
    });

    const unsubClasses = onSnapshot(collection(schoolRef, 'classes'), (snapshot) => {
      setClasses(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Class)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `schools/${schoolId}/classes`);
      if (isQuotaError(error)) setClasses(INITIAL_CLASSES);
    });

    const unsubTeachers = onSnapshot(collection(schoolRef, 'teachers'), (snapshot) => {
        setTeachers(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Teacher)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `schools/${schoolId}/teachers`);
      if (isQuotaError(error)) setTeachers(INITIAL_TEACHERS);
    });

    const unsubSubjects = onSnapshot(collection(schoolRef, 'subjects'), (snapshot) => {
        setSubjects(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Subject)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `schools/${schoolId}/subjects`);
      if (isQuotaError(error)) setSubjects(INITIAL_SUBJECTS);
    });

    const unsubSchedules = onSnapshot(collection(schoolRef, 'schedules'), (snapshot) => {
        setSchedules(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ScheduleItem)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `schools/${schoolId}/schedules`);
      if (isQuotaError(error)) setSchedules(INITIAL_SCHEDULES);
    });

    const unsubInvoices = onSnapshot(collection(schoolRef, 'invoices'), (snapshot) => {
        setInvoices(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Invoice)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `schools/${schoolId}/invoices`);
      if (isQuotaError(error)) setInvoices(INITIAL_INVOICES);
    });

    const unsubAttendance = onSnapshot(collection(schoolRef, 'attendance'), (snapshot) => {
        setAttendance(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as any)));
    }, (error) => {
        handleFirestoreError(error, OperationType.GET, `schools/${schoolId}/attendance`);
        if (isQuotaError(error)) setAttendance([]);
    });

    setLoadingInitial(false);

    return () => {
      unsubStudents();
      unsubClasses();
      unsubTeachers();
      unsubSubjects();
      unsubSchedules();
      unsubInvoices();
      unsubAttendance();
    };
  }, [schoolId]);

  // Firestore specific writers
  const addStudent = async (student: Omit<Student, 'id' | 'outstandingBalance'>) => {
      if (!schoolId || !db) return;
      const ref = doc(collection(db, 'schools', schoolId, 'students'));
      await setDoc(ref, {
          ...student,
          outstandingBalance: 0
      });
  };

  const updateStudent = async (student: Student) => {
      if (!schoolId || !db) return;
      const { id, ...data } = student;
      const ref = doc(db, 'schools', schoolId, 'students', id);
      await updateDoc(ref, data as any);
  };

  const deleteStudent = async (id: string) => {
      if (!schoolId || !db) return;
      const ref = doc(db, 'schools', schoolId, 'students', id);
      await deleteDoc(ref);
  };

  // Rest of writers matching the same pattern...
  const addTeacher = async (teacher: Omit<Teacher, 'id'>) => {
      if (!schoolId || !db) return;
      const ref = doc(collection(db, 'schools', schoolId, 'teachers'));
      await setDoc(ref, teacher);
  };
  
  const updateTeacher = async (teacher: Teacher) => {
      if (!schoolId || !db) return;
      const { id, ...data } = teacher;
      const ref = doc(db, 'schools', schoolId, 'teachers', id);
      await updateDoc(ref, data as any);
  };
  
  const deleteTeacher = async (id: string) => {
      if (!schoolId || !db) return;
      const ref = doc(db, 'schools', schoolId, 'teachers', id);
      await deleteDoc(ref);
  };

  const addClass = async (cls: Omit<Class, 'id'>) => {
      if (!schoolId || !db) return;
      const ref = doc(collection(db, 'schools', schoolId, 'classes'));
      await setDoc(ref, cls);
  };

  const updateClass = async (cls: Class) => {
      if (!schoolId || !db) return;
      const { id, ...data } = cls;
      const ref = doc(db, 'schools', schoolId, 'classes', id);
      await updateDoc(ref, data as any);
  };
  
  const deleteClass = async (id: string) => {
      if (!schoolId || !db) return;
      const ref = doc(db, 'schools', schoolId, 'classes', id);
      await deleteDoc(ref);
  };

  const addSubject = async (sub: Omit<Subject, 'id'>) => {
      if (!schoolId || !db) return;
      const ref = doc(collection(db, 'schools', schoolId, 'subjects'));
      await setDoc(ref, sub);
  };

  const updateSubject = async (sub: Subject) => {
      if (!schoolId || !db) return;
      const { id, ...data } = sub;
      const ref = doc(db, 'schools', schoolId, 'subjects', id);
      await updateDoc(ref, data as any);
  };
  
  const deleteSubject = async (id: string) => {
      if (!schoolId || !db) return;
      const ref = doc(db, 'schools', schoolId, 'subjects', id);
      await deleteDoc(ref);
  };

  const addSchedule = async (sch: Omit<ScheduleItem, 'id'>) => {
      if (!schoolId || !db) return;
      const ref = doc(collection(db, 'schools', schoolId, 'schedules'));
      await setDoc(ref, sch);
  };
  
  const deleteSchedule = async (id: string) => {
      if (!schoolId || !db) return;
      const ref = doc(db, 'schools', schoolId, 'schedules', id);
      await deleteDoc(ref);
  };

  const addInvoices = async (newInvoices: Invoice[]) => {
      if (!schoolId || !db) return;
      for (const inv of newInvoices) {
          const { id, ...data } = inv;
          const ref = id ? doc(db, 'schools', schoolId, 'invoices', id) : doc(collection(db, 'schools', schoolId, 'invoices'));
          await setDoc(ref, data);
      }
      
      // Update student outstanding balance logic handled automatically if we re-calculate or trigger an update.
      // Easiest is to also update the student document:
      for (const inv of newInvoices) {
         if (inv.status !== 'payé') {
             const student = students.find(s => s.id === inv.studentId);
             if (student) {
                const updatedDebt = student.outstandingBalance + inv.amount;
                await updateStudent({ ...student, outstandingBalance: updatedDebt });
             }
         }
      }
  };

  const payInvoice = async (invoiceId: string, paymentMethod: Invoice['paymentMethod']) => {
      if (!schoolId || !db) return;
      const invoice = invoices.find(i => i.id === invoiceId);
      if (!invoice) return;

      const ref = doc(db, 'schools', schoolId, 'invoices', invoiceId);
      await updateDoc(ref, {
          status: 'payé',
          paymentDate: new Date().toISOString().split("T")[0],
          paymentMethod
      });

      const student = students.find(s => s.id === invoice.studentId);
      if (student) {
          const updatedDebt = Math.max(0, student.outstandingBalance - invoice.amount);
          await updateStudent({ ...student, outstandingBalance: updatedDebt });
      }
  };

  const addAttendance = async (record: Omit<AttendanceRecord, 'id'>) => {
      if (!schoolId || !db) return;
      const ref = doc(collection(db, 'schools', schoolId, 'attendance'));
      await setDoc(ref, record);
  };

  const updateAttendance = async (record: AttendanceRecord) => {
      if (!schoolId || !db) return;
      const { id, ...data } = record;
      const ref = doc(db, 'schools', schoolId, 'attendance', id);
      await updateDoc(ref, data as any);
  };

  const deleteAttendance = async (id: string) => {
      if (!schoolId || !db) return;
      const ref = doc(db, 'schools', schoolId, 'attendance', id);
      await deleteDoc(ref);
  };

  return {
    subjects,
    classes,
    students,
    teachers,
    schedules,
    invoices,
    attendance,
    loadingInitial,
    actions: {
        addStudent, updateStudent, deleteStudent,
        addTeacher, updateTeacher, deleteTeacher,
        addClass, updateClass, deleteClass,
        addSubject, updateSubject, deleteSubject,
        addSchedule, deleteSchedule,
        addInvoices, payInvoice,
        addAttendance, updateAttendance, deleteAttendance
    }
  };
}
