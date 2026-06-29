import React, { useState, useEffect, useRef } from "react";
import {
  QrCode,
  Camera,
  Calendar,
  Search,
  Download,
  Printer,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  Volume2,
  RefreshCw,
  Plus,
  ShieldCheck,
  Trash2,
  ChevronRight,
  User,
  GraduationCap,
  Building,
  Check,
  AlertCircle,
  MessageCircle,
  Phone,
} from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { Student, Class, AttendanceRecord } from "../types";

// Success audio chirp using Web Audio API
const playSuccessBeep = () => {
  try {
    const ctx = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    // Quick dual-tonal chirp (melodee of success)
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.setValueAtTime(1200, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } catch (err) {
    console.warn("Audio Context beep failed:", err);
  }
};

// Error audio chirp using Web Audio API
const playErrorBeep = () => {
  try {
    const ctx = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(180, ctx.currentTime);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch (err) {
    console.warn("Audio Context beep failed:", err);
  }
};

interface AttendanceManagerProps {
  students: Student[];
  classes: Class[];
  attendance: AttendanceRecord[];
  schoolName: string;
  actions: {
    addAttendance: (record: Omit<AttendanceRecord, "id">) => Promise<void>;
    updateAttendance: (record: AttendanceRecord) => Promise<void>;
    deleteAttendance: (id: string) => Promise<void>;
  };
}

export default function AttendanceManager({
  students,
  classes,
  attendance,
  schoolName,
  actions,
}: AttendanceManagerProps) {
  const [activeSubTab, setActiveSubTab] = useState<
    "scan" | "generator" | "ledger"
  >("scan");
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Scanner States
  const [cameraPermissionState, setCameraPermissionState] = useState<
    "unknown" | "allowed" | "denied"
  >("unknown");
  const [scannerActive, setScannerActive] = useState(false);
  const [scanMessage, setScanMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);
  const [scannerStatus, setScannerStatus] = useState<
    "idle" | "listening" | "success" | "cooldown"
  >("idle");
  const [scannedStudentDetails, setScannedStudentDetails] =
    useState<Student | null>(null);
  const [scanStatusMode, setScanStatusMode] = useState<"présent" | "en retard">(
    "présent",
  );

  // WhatsApp Simulated Alert State
  const [whatsappAlert, setWhatsappAlert] = useState<{
    studentName: string;
    parentPhone: string;
    time: string;
    visible: boolean;
  } | null>(null);

  // Ledger States
  const [ledgerDate, setLedgerDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [ledgerClassId, setLedgerClassId] = useState<string>("all");

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const cooldownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Set default class if available
  useEffect(() => {
    if (classes.length > 0 && !selectedClassId) {
      setSelectedClassId(classes[0].id);
    }
  }, [classes, selectedClassId]);

  // Clean scanner on component unmount or transition
  useEffect(() => {
    return () => {
      stopCameraScanner();
      if (cooldownTimeoutRef.current) {
        clearTimeout(cooldownTimeoutRef.current);
      }
    };
  }, []);

  const handleStartScanner = async () => {
    // Clear any active scanner first to prevent double instance conflicts
    await stopCameraScanner();

    setScanMessage(null);
    setScannedStudentDetails(null);
    setScannerStatus("listening");

    // Quick timeout to let DOM render
    setTimeout(async () => {
      const element = document.getElementById("qr-viewfinder");
      if (!element) {
        console.error("qr-viewfinder element not found in DOM");
        setScannerStatus("idle");
        return;
      }

      try {
        const scanner = new Html5Qrcode("qr-viewfinder");
        scannerRef.current = scanner;

        // Try starting with environment (back) camera first (best for mobile devices)
        try {
          await scanner.start(
            { facingMode: "environment" },
            {
              fps: 10,
              qrbox: (width, height) => {
                const rectSize = Math.min(width, height) * 0.75;
                return { width: rectSize, height: rectSize };
              },
            },
            onQrScanSuccess,
            (err) => {
              // Background scan outputs
            },
          );
        } catch (backErr) {
          console.warn(
            "Back camera constraint failed, falling back to front/any available camera",
            backErr,
          );
          // Fallback to front camera (best for laptops, desktops, and webcams)
          await scanner.start(
            { facingMode: "user" },
            {
              fps: 10,
              qrbox: (width, height) => {
                const rectSize = Math.min(width, height) * 0.75;
                return { width: rectSize, height: rectSize };
              },
            },
            onQrScanSuccess,
            (err) => {
              // Background scan outputs
            },
          );
        }

        setCameraPermissionState("allowed");
        setScannerActive(true);
      } catch (err) {
        console.error("Camera start failed:", err);
        setCameraPermissionState("denied");
        setScannerStatus("idle");
        setScanMessage({
          type: "error",
          text: "Accès caméra refusé ou périphérique introuvable. Veuillez vérifier les autorisations.",
        });
        playErrorBeep();
      }
    }, 200);
  };

  const stopCameraScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (err) {
        console.error("Stopping scanner failed:", err);
      }
    }
    scannerRef.current = null;
    setScannerActive(false);
    setScannerStatus("idle");
  };

  const triggerScanAlert = (
    type: "success" | "error" | "info",
    text: string,
  ) => {
    setScanMessage({ type, text });
    setTimeout(() => {
      setScanMessage(null);
    }, 4500);
  };

  const triggerWhatsAppAlert = (student: Student) => {
    setWhatsappAlert({
      studentName: `${student.firstName} ${student.lastName}`,
      parentPhone: student.parentPhone || "Non renseigné",
      time: new Date().toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      visible: true,
    });

    // Auto-hide after 6 seconds
    setTimeout(() => {
      setWhatsappAlert((prev) => (prev ? { ...prev, visible: false } : null));
    }, 6000);
  };

  const onQrScanSuccess = async (scannedText: string) => {
    // Prevent double scanning during cooldown or success states
    if (scannerStatus === "success" || scannerStatus === "cooldown") return;

    // Scan Text is expected to be a Student ID
    const studentIdClean = scannedText.trim();
    const matchedStudent = students.find((s) => s.id === studentIdClean);

    if (!matchedStudent) {
      // Not a valid student in this school
      setScannerStatus("cooldown");
      playErrorBeep();
      triggerScanAlert(
        "error",
        `Code QR non reconnu : ID élève "${studentIdClean}" inconnu.`,
      );

      cooldownTimeoutRef.current = setTimeout(() => {
        setScannerStatus("listening");
      }, 2500);
      return;
    }

    if (matchedStudent.status !== "actif") {
      setScannerStatus("cooldown");
      setScannedStudentDetails(matchedStudent);
      playErrorBeep();
      triggerScanAlert(
        "error",
        `Élève ${matchedStudent.firstName} ${matchedStudent.lastName} est actuellement non-actif (statut : ${matchedStudent.status}).`,
      );

      cooldownTimeoutRef.current = setTimeout(() => {
        setScannerStatus("listening");
      }, 3000);
      return;
    }

    // Attendance logging!
    const todayStr = new Date().toISOString().split("T")[0];
    const itemClass = classes.find((c) => c.id === matchedStudent.classId);

    // Check if yesterday/today already scanned
    const alreadyScanned = attendance.find(
      (a) => a.studentId === matchedStudent.id && a.date === todayStr,
    );

    try {
      if (alreadyScanned) {
        // Edit existing scan
        if (alreadyScanned.status !== scanStatusMode) {
          await actions.updateAttendance({
            ...alreadyScanned,
            status: scanStatusMode,
            timestamp: new Date().toISOString(),
          });
          triggerScanAlert(
            "info",
            `Statut de présence mis à jour pour ${matchedStudent.firstName} ${matchedStudent.lastName} (${scanStatusMode}).`,
          );
          if (
            scanStatusMode === "absent" &&
            alreadyScanned.status !== "absent"
          ) {
            triggerWhatsAppAlert(matchedStudent);
          }
        } else {
          triggerScanAlert(
            "info",
            `${matchedStudent.firstName} ${matchedStudent.lastName} est déjà enregistré (${scanStatusMode}) pour aujourd'hui.`,
          );
        }
      } else {
        // Create new record
        await actions.addAttendance({
          studentId: matchedStudent.id,
          studentName: `${matchedStudent.firstName} ${matchedStudent.lastName}`,
          classId: matchedStudent.classId,
          className: itemClass ? itemClass.name : "Classe inconnue",
          date: todayStr,
          timestamp: new Date().toISOString(),
          status: scanStatusMode,
          recordedBy: "Scanner Applet",
        });
        triggerScanAlert(
          "success",
          `Présence enregistrée avec succès : ${matchedStudent.firstName} ${matchedStudent.lastName} (${scanStatusMode}).`,
        );
        if (scanStatusMode === "absent") {
          triggerWhatsAppAlert(matchedStudent);
        }
      }

      setScannerStatus("success");
      setScannedStudentDetails(matchedStudent);
      playSuccessBeep();

      // Clear success back to listening after 3 seconds
      cooldownTimeoutRef.current = setTimeout(() => {
        setScannerStatus("listening");
        setScannedStudentDetails(null);
      }, 3000);
    } catch (err) {
      console.error("Database record error:", err);
      triggerScanAlert(
        "error",
        "Erreur lors de l'enregistrement de l'émargement dans la base Firestore.",
      );
      playErrorBeep();
      setScannerStatus("listening");
    }
  };

  // Bulk / manual toggler inside logs list
  const handleToggleAttendance = async (
    student: Student,
    currentStatus: "présent" | "absent" | "en retard" | null,
    targetStatus: "présent" | "absent" | "en retard",
  ) => {
    const record = attendance.find(
      (a) => a.studentId === student.id && a.date === ledgerDate,
    );
    const itemClass = classes.find((c) => c.id === student.classId);

    if (record) {
      if (targetStatus === null) {
        await actions.deleteAttendance(record.id);
      } else {
        await actions.updateAttendance({
          ...record,
          status: targetStatus,
          timestamp: new Date().toISOString(),
        });
      }
    } else {
      await actions.addAttendance({
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        classId: student.classId,
        className: itemClass ? itemClass.name : "Classe inconnue",
        date: ledgerDate,
        timestamp: new Date().toISOString(),
        status: targetStatus,
        recordedBy: "Registre Direction",
      });
    }

    if (targetStatus === "absent" && currentStatus !== "absent") {
      triggerWhatsAppAlert(student);
    }
  };

  const handlePrintBadge = (student: Student) => {
    const classDetail = classes.find((c) => c.id === student.classId);
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Carte ID - ${student.firstName} ${student.lastName}</title>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          <style>
            @media print {
              body { margin: 0; padding: 0; background: white; }
              .badge-container { box-shadow: none !important; border: 1px solid #e2e8f0 !important; page-break-inside: avoid; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body class="bg-gray-100 p-8 flex items-center justify-center min-h-screen">
          <div class="bg-white border-2 border-indigo-600 rounded-3xl p-6 shadow-2xl max-w-sm w-full badge-container relative overflow-hidden font-sans">
            <!-- Header Background Strip -->
            <div class="absolute top-0 left-0 right-0 h-4 bg-indigo-600"></div>
            
            <div class="text-center pt-2 pb-4">
              <span class="text-xs font-semibold uppercase tracking-wider text-indigo-600 block">CARTE SCOLAIRE ID ÉLÈVE</span>
              <h2 class="text-lg font-bold text-slate-800 uppercase tracking-tight">${schoolName}</h2>
              <span class="text-[9px] text-black">Année Scolaire 2027/2028</span>
            </div>

            <div class="flex flex-col items-center justify-center space-y-4">
              <!-- Avatar Circle -->
              <div class="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center border-4 border-indigo-100 shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>

              <!-- Details -->
              <div class="text-center space-y-1">
                <div class="text-xl font-extrabold text-indigo-900">${student.firstName.toUpperCase()} ${student.lastName.toUpperCase()}</div>
                <div class="text-xs bg-slate-100 text-slate-755 border px-2.5 py-0.5 rounded-full inline-block font-semibold">
                  Classe : ${classDetail ? classDetail.name : "Néant"}
                </div>
                <div class="text-[10px] text-black mt-1">N° Enregistrement : ${student.id.substring(0, 8)}...</div>
              </div>

              <!-- Divider -->
              <div class="w-full border-t border-dashed border-slate-200 py-1"></div>

              <!-- QR Code -->
              <div class="flex flex-col items-center space-y-1 bg-slate-50 p-3 rounded-2xl border">
                <img 
                  src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${student.id}" 
                  alt="Badge QR" 
                  class="w-36 h-36 border p-1.5 bg-white rounded-lg shadow-sm"
                  referrerPolicy="no-referrer"
                />
                <span class="text-[8px] text-black uppercase tracking-widest font-mono">Scanner pour émargement</span>
              </div>
            </div>

            <!-- Accent Footer -->
            <div class="text-center text-[8px] text-black pt-3 border-t mt-4">
              Propriété légale de l'établissement. En cas de perte, veuillez contacter la Direction.
            </div>
          </div>
          
          <div class="fixed bottom-6 left-1/2 transform -translate-x-1/2 no-print">
            <button onclick="window.print()" class="bg-indigo-600 text-white font-bold px-6 py-2.5 rounded-lg shadow-lg hover:bg-indigo-700 transition flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
              <span>Imprimer la carte scolaire</span>
            </button>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handlePrintAllClassCards = (classId: string) => {
    const classDetail = classes.find((c) => c.id === classId);
    if (!classDetail) return;
    const classStudents = students.filter(
      (s) => s.classId === classId && s.status === "actif",
    );
    if (classStudents.length === 0) {
      alert("Aucun élève actif trouvé dans cette classe.");
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    let cardsHtml = "";
    classStudents.forEach((student) => {
      cardsHtml += `
        <div class="bg-white border-2 border-indigo-600 rounded-3xl p-5 shadow-sm max-w-sm w-full badge-container relative overflow-hidden font-sans m-4 inline-block text-left align-top" style="width: 290px; height: 440px; page-break-inside: avoid;">
          <!-- Header Background Strip -->
          <div class="absolute top-0 left-0 right-0 h-3 bg-indigo-600"></div>
          
          <div class="text-center pt-2 pb-3">
            <span class="text-[9px] font-semibold uppercase tracking-wider text-indigo-600 block">CARTE ID ÉLÈVE</span>
            <h2 class="text-sm font-bold text-slate-800 uppercase tracking-tight overflow-hidden overflow-ellipsis whitespace-nowrap">${schoolName}</h2>
            <span class="text-[8px] text-black">Année Scolaire 2027/2028</span>
          </div>

          <div class="flex flex-col items-center space-y-3">
            <!-- Avatar Circle -->
            <div class="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center border-2 border-indigo-100 shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>

            <!-- Details -->
            <div class="text-center space-y-0.5">
              <div class="text-sm font-extrabold text-indigo-900 overflow-hidden overflow-ellipsis max-w-[250px] whitespace-nowrap">
                ${student.firstName.toUpperCase()} ${student.lastName.toUpperCase()}
              </div>
              <div class="text-[10px] bg-slate-100 text-slate-700 border px-2 py-0.2 rounded-full inline-block font-semibold">
                ${classDetail.name}
              </div>
              <div class="text-[8px] text-black">ID: ${student.id.substring(0, 6)}...</div>
            </div>

            <!-- Divider -->
            <div class="w-full border-t border-dashed border-slate-200 py-0.5"></div>

            <!-- QR Code -->
            <div class="flex flex-col items-center space-y-0.5 bg-slate-50 p-2 rounded-xl border">
              <img 
                src="https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${student.id}" 
                alt="Badge QR" 
                class="w-24 h-24 border p-1 bg-white rounded-lg"
                referrerPolicy="no-referrer"
              />
              <span class="text-[7px] text-black uppercase tracking-widest font-mono">Scanner émargement</span>
            </div>
          </div>
        </div>
      `;
    });

    printWindow.document.write(`
      <html>
        <head>
          <title>Cartes d'identité de classe - ${classDetail.name}</title>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          <style>
            @media print {
              body { margin: 0; padding: 0; background: white; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body class="bg-gray-50 p-4 text-center">
          <div class="max-w-4xl mx-auto flex flex-wrap justify-center">
            ${cardsHtml}
          </div>
          <div class="fixed bottom-6 left-1/2 transform -translate-x-1/2 no-print">
            <button onclick="window.print()" class="bg-indigo-600 text-white font-bold px-6 py-2.5 rounded-lg shadow-lg hover:bg-indigo-700 transition flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
              <span>Imprimer les ${classStudents.length} cartes de la classe</span>
            </button>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Stats calculation
  const getDailyStatsForLedger = () => {
    let filteredStudents = students.filter((s) => s.status === "actif");
    if (ledgerClassId !== "all") {
      filteredStudents = filteredStudents.filter(
        (s) => s.classId === ledgerClassId,
      );
    }

    const dailyRecords = attendance.filter((a) => a.date === ledgerDate);

    let presentCount = 0;
    let lateCount = 0;
    let absentCount = 0;

    filteredStudents.forEach((st) => {
      const rec = dailyRecords.find((r) => r.studentId === st.id);
      if (rec) {
        if (rec.status === "présent") presentCount++;
        else if (rec.status === "en retard") lateCount++;
        else if (rec.status === "absent") absentCount++;
      } else {
        // Unrecorded counts as absent in daily stats context
        absentCount++;
      }
    });

    const totalInvoiced = filteredStudents.length;
    const presentRate =
      totalInvoiced > 0
        ? Math.round(((presentCount + lateCount) / totalInvoiced) * 100)
        : 100;

    return {
      present: presentCount,
      late: lateCount,
      absent: absentCount,
      total: totalInvoiced,
      rate: presentRate,
    };
  };

  const ledgerStats = getDailyStatsForLedger();

  // QR Generator List Filter
  const generatorStudents = students.filter((s) => {
    const matchesClass = !selectedClassId || s.classId === selectedClassId;
    const fullName = `${s.firstName || ""} ${s.lastName || ""}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase());
    return matchesClass && matchesSearch;
  });

  // Ledger List Filter
  const ledgerStudents = students.filter((s) => {
    const matchesClass = ledgerClassId === "all" || s.classId === ledgerClassId;
    const fullName = `${s.firstName || ""} ${s.lastName || ""}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase());
    return matchesClass && matchesSearch;
  });

  return (
    <div id="attendance-dashboard" className="space-y-6 relative">
      {/* WhatsApp Simulated Alert Overlay */}
      {whatsappAlert?.visible && (
        <div className="fixed top-6 right-6 z-[100] w-80 animate-in slide-in-from-right fade-in duration-300">
          <div className="bg-emerald-50 border border-emerald-200 shadow-lg rounded-2xl p-4 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
            <div className="flex items-start gap-3">
              <div className="bg-emerald-100 p-2 rounded-full shrink-0">
                <MessageCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-bold text-slate-800">
                    WhatsApp Envoyé
                  </h4>
                  <span className="text-[10px] text-black font-medium">
                    {whatsappAlert.time}
                  </span>
                </div>
                <p className="text-[11px] text-black mt-1 leading-snug">
                  Une notification d'absence a été envoyée automatiquement aux
                  parents de l'élève.
                </p>
                <div className="mt-2 bg-white/60 p-2 rounded-lg border border-emerald-100/50">
                  <p className="text-xs font-bold text-slate-700">
                    {whatsappAlert.studentName}
                  </p>
                  <p className="text-[10px] text-black flex items-center gap-1 mt-0.5">
                    <Phone className="h-3 w-3" /> {whatsappAlert.parentPhone}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setWhatsappAlert(null)}
                className="text-black hover:text-black transition-colors"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation header */}
      <div className="flex border-b border-slate-200 bg-white p-1 rounded-xl border">
        <button
          onClick={() => {
            stopCameraScanner();
            setActiveSubTab("scan");
          }}
          className={`flex-1 py-2 px-2 sm:px-4 rounded-lg font-bold text-[10px] sm:text-xs flex items-center justify-center gap-1.5 transition-colors ${
            activeSubTab === "scan"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-black hover:bg-slate-100"
          }`}
        >
          <Camera className="h-3.5 w-3.5 shrink-0" />
          <span className="hidden sm:inline">Scanner Émargements</span>
          <span className="sm:hidden inline">Scanner</span>
        </button>
        <button
          onClick={() => {
            stopCameraScanner();
            setActiveSubTab("generator");
          }}
          className={`flex-1 py-2 px-2 sm:px-4 rounded-lg font-bold text-[10px] sm:text-xs flex items-center justify-center gap-1.5 transition-colors ${
            activeSubTab === "generator"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-black hover:bg-slate-100"
          }`}
        >
          <QrCode className="h-3.5 w-3.5 shrink-0" />
          <span className="hidden sm:inline">Cartes ID & QR Élèves</span>
          <span className="sm:hidden inline">Cartes ID</span>
        </button>
        <button
          onClick={() => {
            stopCameraScanner();
            setActiveSubTab("ledger");
          }}
          className={`flex-1 py-2 px-2 sm:px-4 rounded-lg font-bold text-[10px] sm:text-xs flex items-center justify-center gap-1.5 transition-colors ${
            activeSubTab === "ledger"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-black hover:bg-slate-100"
          }`}
        >
          <Calendar className="h-3.5 w-3.5 shrink-0" />
          <span className="hidden sm:inline">Registre de Présences</span>
          <span className="sm:hidden inline">Registre</span>
        </button>
      </div>

      {/* --- SUB TAB: LIVE QR SCANNER --- */}
      {activeSubTab === "scan" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main camera scanning portal (Left: 7cols) */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">
                  Poste d'Émargement QR
                </h3>
                <p className="text-[10px] text-black">
                  Positionnez le code ID de la carte de l'élève devant
                  l'objectif
                </p>
              </div>
              <div className="flex items-center space-x-1">
                <span
                  className={`inline-block w-2.5 h-2.5 rounded-full ${scannerActive ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`}
                ></span>
                <span className="text-[10px] font-bold uppercase text-black">
                  {scannerActive ? "Caméra Active" : "Statique"}
                </span>
              </div>
            </div>

            {/* Viewfinder Canvas Stage */}
            <div className="relative aspect-[4/3] sm:aspect-video w-full rounded-2xl bg-slate-900 overflow-hidden border border-slate-800 flex items-center justify-center min-h-[290px] sm:min-h-[320px]">
              <div
                id="qr-viewfinder"
                className="absolute inset-0 w-full h-full object-cover"
              >
                {/* Embedded HTML5Qrcode hooks this element */}
              </div>

              {!scannerActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/85 p-4 sm:p-6 text-center space-y-3 sm:space-y-4 z-10">
                  <div className="p-2.5 sm:p-4 bg-indigo-900/40 rounded-full border border-indigo-700/50 text-indigo-400 animate-bounce shrink-0">
                    <QrCode className="h-6 w-6 sm:h-8 sm:w-8" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-white text-xs sm:text-sm font-semibold">
                      Prêt pour l'accueil du matin
                    </h4>
                    <p className="text-black text-[10px] sm:text-xs max-w-xs leading-relaxed">
                      Activez la caméra pour commencer l'enregistrement
                      automatique des élèves par badges QR.
                    </p>
                  </div>
                  <button
                    onClick={handleStartScanner}
                    className="bg-indigo-600 text-white text-xs sm:text-sm font-bold px-6 py-2.5 sm:py-3 rounded-xl hover:bg-indigo-700 active:scale-95 transition shadow-lg cursor-pointer shrink-0 mt-2 border border-indigo-500"
                  >
                    🚀 Activer la Caméra
                  </button>
                </div>
              )}

              {/* Viewfinder scanning frame overlay */}
              {scannerActive && (
                <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 sm:p-6 z-10 active:scale-100">
                  {/* Outer dim background with centered clean scanning box */}
                  <div className="absolute inset-0 border-4 border-indigo-500/25 rounded-2xl"></div>

                  {/* Viewfinder target corners */}
                  <div className="absolute top-4 sm:top-8 left-4 sm:left-8 w-10 h-10 border-t-4 border-l-4 border-indigo-500 rounded-tl-xl animate-pulse"></div>
                  <div className="absolute top-4 sm:top-8 right-4 sm:right-8 w-10 h-10 border-t-4 border-r-4 border-indigo-500 rounded-tr-xl animate-pulse"></div>
                  <div className="absolute bottom-4 sm:bottom-8 left-4 sm:left-8 w-10 h-10 border-b-4 border-l-4 border-indigo-500 rounded-bl-xl animate-pulse"></div>
                  <div className="absolute bottom-4 sm:bottom-8 right-4 sm:right-8 w-10 h-10 border-b-4 border-r-4 border-indigo-505 rounded-br-xl animate-pulse"></div>

                  <div className="self-center bg-indigo-600/90 backdrop-blur-md text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-indigo-400 shadow-md animate-pulse">
                    Lecture en cours...
                  </div>

                  <button
                    onClick={stopCameraScanner}
                    className="self-center bg-red-650 text-white text-[9px] sm:text-[10px] font-bold uppercase pointer-events-auto shadow-lg hover:bg-red-700 px-4 py-2 rounded-xl block mt-auto"
                  >
                    Arrêter
                  </button>
                </div>
              )}
            </div>

            {/* Notification alert for errors/success */}
            {scanMessage && (
              <div
                className={`p-3 rounded-xl flex items-start space-x-2 text-[11px] font-medium border animate-fadeIn ${
                  scanMessage.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : scanMessage.type === "error"
                      ? "bg-rose-50 text-rose-800 border-rose-200"
                      : "bg-blue-50 text-blue-800 border-blue-200"
                }`}
              >
                {scanMessage.type === "success" ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : scanMessage.type === "error" ? (
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                ) : (
                  <ShieldCheck className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                )}
                <span>{scanMessage.text}</span>
              </div>
            )}

            {/* Config target for scans */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-wrap gap-4 items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-black uppercase block">
                  Paramètre d'accueil
                </span>
                <span className="text-xs text-slate-700">
                  Enregistrer l'élève scanné comme :
                </span>
              </div>
              <div className="flex bg-slate-200 p-1 rounded-lg">
                <button
                  onClick={() => {
                    playSuccessBeep();
                    setScanStatusMode("présent");
                  }}
                  className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase transition ${
                    scanStatusMode === "présent"
                      ? "bg-white text-indigo-700 shadow-sm"
                      : "text-black hover:text-slate-933"
                  }`}
                >
                  Présent
                </button>
                <button
                  onClick={() => {
                    playSuccessBeep();
                    setScanStatusMode("en retard");
                  }}
                  className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase transition ${
                    scanStatusMode === "en retard"
                      ? "bg-white text-amber-700 shadow-sm"
                      : "text-black hover:text-slate-933"
                  }`}
                >
                  En Retard
                </button>
              </div>
            </div>
          </div>

          {/* Side panel: Live Scan results feedback (Right: 5cols) */}
          <div className="lg:col-span-5 flex flex-col space-y-6">
            {/* Visual scanned feedback card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-sm flex flex-col items-center justify-center text-center space-y-4 min-h-[240px]">
              <span className="text-[10px] uppercase font-bold text-black tracking-wider">
                Résultat Émargement en Direct
              </span>

              {scannedStudentDetails ? (
                <div className="space-y-4 w-full animate-scaleUp">
                  <div className="w-20 h-20 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center mx-auto shadow-md">
                    <UserCheck className="h-10 w-10 text-emerald-600 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <span className="inline-block bg-emerald-100 text-emerald-700 text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">
                      {scanStatusMode === "en retard"
                        ? "⏰ En retard"
                        : "✓ Présent"}
                    </span>
                    <h4 className="text-lg font-bold text-slate-800 uppercase">
                      {scannedStudentDetails.firstName}{" "}
                      {scannedStudentDetails.lastName}
                    </h4>
                    <p className="text-xs text-black font-semibold">
                      Classe :{" "}
                      {
                        classes.find(
                          (c) => c.id === scannedStudentDetails.classId,
                        )?.name
                      }
                    </p>
                    <p className="text-[10px] text-black font-mono">
                      Enregistré à {new Date().toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-black flex flex-col items-center py-6">
                  <div className="p-4 bg-slate-50 rounded-full border border-slate-100">
                    <Volume2 className="h-6 w-6 text-black" />
                  </div>
                  <p className="text-xs">En attente de scan...</p>
                  <p className="text-[10px]">
                    Utilisez le bip audio d'assistance pour le contrôle visuel !
                  </p>
                </div>
              )}
            </div>

            {/* List of Today's Scanned Students */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex-1 flex flex-col space-y-4">
              <div className="flex justify-between items-center pb-2 border-b">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-tight">
                  Historique des Scans (
                  {
                    attendance.filter(
                      (a) => a.date === new Date().toISOString().split("T")[0],
                    ).length
                  }
                  )
                </h4>
                <span className="text-[8px] uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-150">
                  Aujourd'hui
                </span>
              </div>

              <div className="overflow-y-auto space-y-2 max-h-[220px]">
                {attendance.filter(
                  (a) => a.date === new Date().toISOString().split("T")[0],
                ).length === 0 ? (
                  <div className="text-center py-10 text-black text-xs">
                    Aucun élève scanné aujourd'hui pour le moment.
                  </div>
                ) : (
                  [...attendance]
                    .filter(
                      (a) => a.date === new Date().toISOString().split("T")[0],
                    )
                    .sort(
                      (a, b) =>
                        new Date(b.timestamp).getTime() -
                        new Date(a.timestamp).getTime(),
                    )
                    .map((record) => {
                      const st = students.find(
                        (s) => s.id === record.studentId,
                      );
                      return (
                        <div
                          key={record.id}
                          className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition flex justify-between items-center"
                        >
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-bold text-slate-800 block uppercase">
                              {record.studentName}
                            </span>
                            <span className="text-[9px] text-black block">
                              Classe : {record.className}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-[8px] font-mono text-black">
                              {new Date(record.timestamp).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  second: "2-digit",
                                },
                              )}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                                record.status === "en retard"
                                  ? "bg-amber-100 text-amber-700 border border-amber-200"
                                  : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                              }`}
                            >
                              {record.status}
                            </span>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- SUB TAB: STUDENTS INFOCARD & QR GENERATOR --- */}
      {activeSubTab === "generator" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls and list (Left: 5cols) */}
          <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">
                Liste d'édition des Badges
              </h3>
              <p className="text-[10px] text-black text-light mt-0.5">
                Générez et imprimez les cartes scolaires équipées de codes QR
                d'accès.
              </p>
            </div>

            {/* Select class and search filter */}
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-black">
                  Filtrer par classe
                </label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 font-medium"
                >
                  {classes.map((cl) => (
                    <option key={cl.id} value={cl.id}>
                      {cl.name} ({cl.level})
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-black" />
                <input
                  type="text"
                  placeholder="Rechercher par nom..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
                />
              </div>
            </div>

            {/* Print all option list */}
            {selectedClassId && (
              <button
                onClick={() => handlePrintAllClassCards(selectedClassId)}
                className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200 transition flex items-center justify-center space-x-2"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Imprimer badges de la classe</span>
              </button>
            )}

            {/* Students roster scroll box */}
            <div className="overflow-y-auto space-y-1 max-h-[340px] pr-1">
              {generatorStudents.length === 0 ? (
                <div className="text-center py-10 text-black text-xs">
                  Aucun élève trouvé.
                </div>
              ) : (
                generatorStudents.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => {
                      playSuccessBeep();
                      setSelectedStudent(student);
                    }}
                    className={`w-full p-2.5 rounded-xl border text-left transition flex justify-between items-center ${
                      selectedStudent?.id === student.id
                        ? "bg-indigo-650/10 border-indigo-400 text-indigo-900"
                        : "border-slate-100 bg-slate-50/20 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div>
                      <span className="text-[11px] font-bold block uppercase">
                        {student.firstName} {student.lastName}
                      </span>
                      <span className="text-[9px] text-black font-mono">
                        ID: {student.id.substring(0, 10)}
                      </span>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 opacity-60" />
                  </button>
                ))
              )}
            </div>
          </div>

          {/* ID Card Display with dynamic QR generation (Right: 7cols) */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-150 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
            {selectedStudent ? (
              <div className="w-full flex flex-col items-center space-y-6">
                {/* Visual Carte ID Container */}
                <div
                  id="visual-badge-id"
                  className="relative w-[320px] bg-white border border-slate-300 rounded-3xl p-6 shadow-xl overflow-hidden font-sans"
                >
                  {/* Decorative Banner Strip */}
                  <div className="absolute top-0 left-0 right-0 h-4 bg-indigo-600"></div>

                  {/* Header metadata */}
                  <div className="text-center pt-2 pb-4">
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-indigo-600 block">
                      CARTE SCOLAIRE ID ÉLÈVE
                    </span>
                    <h4 className="text-md font-extrabold text-slate-800 uppercase tracking-tight truncate px-1">
                      {schoolName}
                    </h4>
                    <span className="text-[8px] text-black block mt-0.5">
                      Année Scolaire 2027/2028
                    </span>
                  </div>

                  {/* Body elements */}
                  <div className="flex flex-col items-center space-y-4">
                    {/* Circle user placeholder */}
                    <div className="w-20 h-20 rounded-full bg-indigo-50 border-4 border-indigo-100 flex items-center justify-center shadow-inner">
                      <User className="h-10 w-10 text-indigo-500" />
                    </div>

                    {/* Personal metrics */}
                    <div className="text-center space-y-1">
                      <div className="text-lg font-extrabold text-indigo-950 uppercase">
                        {selectedStudent.firstName} {selectedStudent.lastName}
                      </div>
                      <div className="text-xs bg-slate-100 text-slate-700 border px-3 py-0.5 rounded-full inline-block font-semibold">
                        Classe :{" "}
                        {classes.find((c) => c.id === selectedStudent.classId)
                          ?.name || "Non assigné"}
                      </div>
                      <div className="text-[9px] text-black font-mono mt-0.5">
                        N° Enregistrement :{" "}
                        {selectedStudent.id.substring(0, 10)}...
                      </div>
                    </div>

                    {/* Dashed line spacer */}
                    <div className="w-full border-t border-dashed border-slate-200 py-0.5"></div>

                    {/* QR block code */}
                    <div className="flex flex-col items-center space-y-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-100 shadow-sm">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${selectedStudent.id}`}
                        alt="Code QR d'accès"
                        className="w-32 h-32 border border-slate-150 p-1 bg-white rounded-lg shadow-inner"
                        referrerPolicy="no-referrer"
                      />
                      <span className="text-[8px] font-bold text-black uppercase tracking-wide">
                        Lecture par camera d'accueil
                      </span>
                    </div>
                  </div>

                  {/* Footers property */}
                  <div className="text-center text-[7.5px] text-black pt-3 border-t mt-4 leading-normal">
                    Propriété légale de l'établissement. En cas de perte,
                    veuillez contacter l'administration.
                  </div>
                </div>

                {/* Print button controls */}
                <div className="flex space-x-3 w-full justify-center">
                  <button
                    onClick={() => handlePrintBadge(selectedStudent)}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center space-x-2"
                  >
                    <Printer className="h-4 w-4" />
                    <span>Imprimer la Carte</span>
                  </button>
                  <a
                    href={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${selectedStudent.id}`}
                    download={`QR_${selectedStudent.firstName}_${selectedStudent.lastName}.png`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border transition flex items-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Télécharger Code QR</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-center text-black space-y-2 py-10">
                <QrCode className="h-12 w-12 text-slate-200 mx-auto" />
                <p className="text-xs">
                  Sélectionnez un élève à gauche pour visualiser son badge
                  d'identification.
                </p>
                <p className="text-[10px] text-black max-w-sm leading-normal">
                  Les cartes ID incluent un code QR lisible par n'importe quelle
                  caméra de smartphone ou webcam du poste d'émargement.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- SUB TAB: ATTENDANCE LEDGER / HISTORY SHEET --- */}
      {activeSubTab === "ledger" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">
                Registre d'appel et de présence
              </h3>
              <p className="text-[10px] text-black">
                Consultez l'historique d'accueil scolaire et modifiez
                manuellement les statuts.
              </p>
            </div>

            {/* Filter ledger settings */}
            <div className="flex flex-wrap gap-3">
              <div className="flex flex-col space-y-1">
                <span className="text-[9px] font-bold text-black uppercase">
                  Sélectionner la date
                </span>
                <input
                  type="date"
                  value={ledgerDate}
                  onChange={(e) => setLedgerDate(e.target.value)}
                  className="text-xs border p-2 rounded-lg bg-slate-50 font-bold text-slate-705"
                />
              </div>

              <div className="flex flex-col space-y-1">
                <span className="text-[9px] font-bold text-black uppercase">
                  Classe
                </span>
                <select
                  value={ledgerClassId}
                  onChange={(e) => setLedgerClassId(e.target.value)}
                  className="text-xs border p-2 rounded-lg bg-slate-50 font-medium"
                >
                  <option value="all">Toutes les classes</option>
                  {classes.map((cl) => (
                    <option key={cl.id} value={cl.id}>
                      {cl.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Quick performance counters for daily context */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[9px] font-bold text-black uppercase tracking-wider block">
                Effectif total
              </span>
              <span className="text-lg font-bold text-slate-700">
                {ledgerStats.total}
              </span>
            </div>
            <div className="bg-emerald-50/40 p-3 rounded-xl border border-emerald-100">
              <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider block">
                Présents
              </span>
              <span className="text-lg font-bold text-emerald-700 flex items-center space-x-1">
                <span>{ledgerStats.present}</span>
                <span className="text-xs font-normal">
                  (
                  {ledgerStats.total > 0
                    ? Math.round(
                        (ledgerStats.present / ledgerStats.total) * 100,
                      )
                    : 0}
                  %)
                </span>
              </span>
            </div>
            <div className="bg-amber-50/40 p-3 rounded-xl border border-amber-100">
              <span className="text-[9px] font-bold text-amber-600 uppercase tracking-wider block">
                Retards
              </span>
              <span className="text-lg font-bold text-amber-700 flex items-center space-x-1">
                <span>{ledgerStats.late}</span>
                <span className="text-xs font-normal">
                  (
                  {ledgerStats.total > 0
                    ? Math.round((ledgerStats.late / ledgerStats.total) * 100)
                    : 0}
                  %)
                </span>
              </span>
            </div>
            <div className="bg-rose-50/40 p-3 rounded-xl border border-rose-100">
              <span className="text-[9px] font-bold text-rose-600 uppercase tracking-wider block">
                Absents
              </span>
              <span className="text-lg font-bold text-rose-700 flex items-center space-x-1">
                <span>{ledgerStats.absent}</span>
                <span className="text-xs font-normal">
                  (
                  {ledgerStats.total > 0
                    ? Math.round((ledgerStats.absent / ledgerStats.total) * 100)
                    : 0}
                  %)
                </span>
              </span>
            </div>
            <div className="col-span-2 md:col-span-1 bg-indigo-50/30 p-3 rounded-xl border border-indigo-100 text-center flex flex-col justify-center">
              <span className="text-[9px] font-bold text-indigo-650 uppercase tracking-wider block leading-tight">
                Matinée Présis
              </span>
              <span className="text-lg font-extrabold text-indigo-800">
                {ledgerStats.rate}%
              </span>
            </div>
          </div>

          {/* Quick search inside ledger */}
          <div className="max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-black" />
              <input
                type="text"
                placeholder="Rechercher par nom d'élève..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          {/* Main Attendance sheet columns */}
          <div className="overflow-x-auto border rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[10px] font-bold text-black uppercase tracking-wider border-b">
                <tr>
                  <th className="px-4 py-3">Élève</th>
                  <th className="px-4 py-3">Classe</th>
                  <th className="px-4 py-3">Date de Registre</th>
                  <th className="px-4 py-3 text-center">
                    Statuts de présence (Sélection rapide)
                  </th>
                  <th className="px-4 py-3 text-right">Méthode de saisie</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ledgerStudents.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-12 text-black"
                    >
                      Aucun élève correspondant sous ces critères de filtre.
                    </td>
                  </tr>
                ) : (
                  ledgerStudents.map((student) => {
                    const classDetail = classes.find(
                      (c) => c.id === student.classId,
                    );
                    const record = attendance.find(
                      (a) =>
                        a.studentId === student.id && a.date === ledgerDate,
                    );
                    const currentStatus = record ? record.status : "absent"; // Defaults to absent if not registered

                    return (
                      <tr
                        key={student.id}
                        className="hover:bg-slate-50/50 transition duration-75"
                      >
                        <td className="px-4 py-3.5">
                          <div>
                            <span className="font-bold text-slate-800 uppercase block">
                              {student.firstName} {student.lastName}
                            </span>
                            <span className="text-[9px] text-black block font-mono">
                              Enregistrement: {student.id.substring(0, 8)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 font-medium text-black">
                          {classDetail ? classDetail.name : "Néant"}
                        </td>
                        <td className="px-4 py-3.5 text-black font-medium">
                          {ledgerDate}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <div className="inline-flex rounded-lg p-0.5 bg-slate-100 border">
                            <button
                              onClick={() => {
                                playSuccessBeep();
                                handleToggleAttendance(
                                  student,
                                  record ? record.status : null,
                                  "présent",
                                );
                              }}
                              className={`px-3 py-1 text-[9px] uppercase font-bold rounded-md transition ${
                                currentStatus === "présent"
                                  ? "bg-emerald-600 text-white shadow"
                                  : "text-slate-650 hover:bg-slate-200"
                              }`}
                            >
                              Présent
                            </button>
                            <button
                              onClick={() => {
                                playSuccessBeep();
                                handleToggleAttendance(
                                  student,
                                  record ? record.status : null,
                                  "en retard",
                                );
                              }}
                              className={`px-3 py-1 text-[9px] uppercase font-bold rounded-md transition ${
                                currentStatus === "en retard"
                                  ? "bg-amber-500 text-white shadow"
                                  : "text-slate-650 hover:bg-slate-200"
                              }`}
                            >
                              Retard
                            </button>
                            <button
                              onClick={() => {
                                playSuccessBeep();
                                handleToggleAttendance(
                                  student,
                                  record ? record.status : null,
                                  "absent",
                                );
                              }}
                              className={`px-3 py-1 text-[9px] uppercase font-bold rounded-md transition ${
                                currentStatus === "absent"
                                  ? "bg-rose-500 text-white shadow"
                                  : "text-slate-650 hover:bg-slate-200"
                              }`}
                            >
                              Absent
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-right text-[10px] text-black font-medium">
                          {record ? (
                            <span className="inline-flex items-center space-x-1.5 bg-slate-100 text-black px-2 py-0.5 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                              <span>{record.recordedBy || "Manuel"}</span>
                            </span>
                          ) : (
                            <span className="text-slate-350 italic">
                              Non enregistré (Absent)
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
