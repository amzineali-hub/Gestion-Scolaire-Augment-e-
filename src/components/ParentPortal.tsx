import React, { useState } from 'react';
import { Student, Class, ScheduleItem, Subject, AttendanceRecord } from '../types';
import { 
  BookOpen, 
  Calendar, 
  FileText, 
  Bell, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Award,
  ChevronRight,
  MessageSquare
} from 'lucide-react';

interface ParentPortalProps {
  students: Student[];
  classes: Class[];
  schedules: ScheduleItem[];
  subjects: Subject[];
  attendance: AttendanceRecord[];
}

type PortalTab = 'overview' | 'grades' | 'attendance' | 'homework' | 'announcements';

export default function ParentPortal({ students, classes, schedules, subjects, attendance }: ParentPortalProps) {
  const [activeTab, setActiveTab] = useState<PortalTab>('overview');

  // Select the first active student as a demo mock for the parent's child
  const child = students.find(s => s.status === 'actif') || students[0] || {
    id: "demo-child",
    firstName: "Amine",
    lastName: "Alami",
    classId: "cls-1",
    parentName: "Parent Demo",
    parentPhone: "",
    parentEmail: "",
    registrationDate: "2025-09-02",
    status: "actif",
    outstandingBalance: 0
  };
  const assignedClass = classes.find(c => c.id === child.classId) || {
    id: "cls-1", name: "CM2 - A", cycle: "Primaire", level: "CM2", capacity: 25, room: "Salle 10", feeAmount: 2200
  };

  if (!child) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-700">Aucun élève trouvé</h2>
          <p className="text-slate-500 mt-2">Veuillez vérifier votre compte.</p>
        </div>
      </div>
    );
  }

  // Mock data for homework and announcements
  const mockHomework = [
    { id: 1, subject: 'Mathématiques', title: 'Exercices p.45 (1 à 5)', due: 'Demain', status: 'pending' },
    { id: 2, subject: 'Français', title: 'Lecture chapitre 3', due: 'Vendredi', status: 'completed' },
    { id: 3, subject: 'Physique', title: 'Préparer TP électricité', due: 'Lundi prochain', status: 'pending' },
  ];

  const mockAnnouncements = [
    { id: 1, date: 'Hier', title: 'Réunion Parents-Professeurs', content: 'La réunion trimestrielle aura lieu ce vendredi à 16h00 dans la grande salle.' },
    { id: 2, date: 'Il y a 3 jours', title: 'Sortie Scolaire', content: 'N\'oubliez pas de signer l\'autorisation pour la sortie au musée.' },
  ];

  // Mock grades
  const mockGrades = [
    { subject: 'Mathématiques', grade: 18, coeff: 4, comment: 'Excellent travail ce trimestre.' },
    { subject: 'Français', grade: 15, coeff: 3, comment: 'Bonne participation.' },
    { subject: 'Physique-Chimie', grade: 16.5, coeff: 3, comment: 'Résultats très satisfaisants.' },
    { subject: 'SVT', grade: 14, coeff: 2, comment: 'En progrès régulier.' },
    { subject: 'Anglais', grade: 19, coeff: 2, comment: 'Niveau remarquable.' },
  ];

  const childAttendance = attendance.filter(a => a.studentId === child.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50 font-sans">
      
      {/* Header Profile Area */}
      <div className="bg-white border-b border-slate-200 px-6 py-6 shrink-0">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-700 font-bold text-2xl border border-indigo-200 shadow-sm">
              {child.firstName[0]}{child.lastName[0]}
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-800">
                {child.firstName} {child.lastName}
              </h1>
              <p className="text-sm font-medium text-slate-500 mt-0.5">
                {assignedClass?.name} • {assignedClass?.cycle}
              </p>
            </div>
          </div>
          <div className="text-right">
             <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 text-xs font-bold">
               <span className="relative flex h-2 w-2">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
               </span>
               Connecté (Parent)
             </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200 px-6 shrink-0 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex gap-6 overflow-x-auto">
          {[
            { id: 'overview', label: 'Vue d\'ensemble', icon: BookOpen },
            { id: 'grades', label: 'Relevés de notes', icon: Award },
            { id: 'attendance', label: 'Présences', icon: Clock },
            { id: 'homework', label: 'Devoirs', icon: FileText },
            { id: 'announcements', label: 'Annonces', icon: Bell },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as PortalTab)}
                className={`py-4 flex items-center gap-2 font-bold text-sm border-b-2 transition-colors whitespace-nowrap ${
                  isActive 
                    ? 'border-indigo-600 text-indigo-600' 
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                {/* Recent Homework */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-extrabold text-slate-800 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-indigo-500" /> Devoirs à venir
                    </h3>
                    <button onClick={() => setActiveTab('homework')} className="text-xs font-bold text-indigo-600 hover:underline">Voir tout</button>
                  </div>
                  <div className="space-y-3">
                    {mockHomework.filter(h => h.status === 'pending').map(hw => (
                      <div key={hw.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <div>
                          <p className="text-xs font-bold text-indigo-600 mb-0.5">{hw.subject}</p>
                          <p className="font-bold text-slate-700 text-sm">{hw.title}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold bg-orange-100 text-orange-700 px-2 py-1 rounded-md">Pour {hw.due}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Latest Grades Summary */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-extrabold text-slate-800 flex items-center gap-2">
                      <Award className="h-5 w-5 text-emerald-500" /> Dernières notes
                    </h3>
                    <button onClick={() => setActiveTab('grades')} className="text-xs font-bold text-indigo-600 hover:underline">Détails</button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {mockGrades.slice(0, 4).map((grade, i) => (
                      <div key={i} className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-center">
                        <p className="text-[10px] font-bold text-slate-500 uppercase truncate mb-1">{grade.subject}</p>
                        <p className="text-xl font-black text-slate-800">{grade.grade}<span className="text-xs text-slate-400">/20</span></p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar: Announcements & Quick stats */}
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-5 shadow-sm text-white">
                  <h3 className="font-bold text-indigo-100 mb-1 text-sm">Moyenne Générale</h3>
                  <div className="text-4xl font-black">16.5<span className="text-lg opacity-70">/20</span></div>
                  <p className="text-xs text-indigo-200 mt-2">Trimestre 1 • En hausse</p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                   <h3 className="font-extrabold text-slate-800 flex items-center gap-2 mb-4">
                      <Bell className="h-5 w-5 text-amber-500" /> Annonces récentes
                    </h3>
                    <div className="space-y-4">
                      {mockAnnouncements.slice(0,2).map(ann => (
                        <div key={ann.id} className="border-l-2 border-indigo-500 pl-3">
                          <p className="text-[10px] font-bold text-slate-400">{ann.date}</p>
                          <p className="text-sm font-bold text-slate-700">{ann.title}</p>
                        </div>
                      ))}
                    </div>
                </div>
              </div>
            </div>
          )}

          {/* GRADES TAB */}
          {activeTab === 'grades' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="font-extrabold text-slate-800 text-lg">Relevé de notes - Trimestre 1</h3>
                <button className="text-xs font-bold bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-xs hover:bg-slate-50">
                  Télécharger PDF
                </button>
              </div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wider">
                    <th className="p-4 font-bold">Matière</th>
                    <th className="p-4 font-bold text-center">Coeff</th>
                    <th className="p-4 font-bold text-center">Note /20</th>
                    <th className="p-4 font-bold">Appréciation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {mockGrades.map((g, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="p-4 font-bold text-slate-800 text-sm">{g.subject}</td>
                      <td className="p-4 text-center font-medium text-slate-500">{g.coeff}</td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex font-black text-sm px-2 py-0.5 rounded-lg ${
                          g.grade >= 16 ? 'bg-emerald-100 text-emerald-800' :
                          g.grade >= 12 ? 'bg-blue-100 text-blue-800' :
                          g.grade >= 10 ? 'bg-amber-100 text-amber-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {g.grade}
                        </span>
                      </td>
                      <td className="p-4 text-xs font-medium text-slate-600 italic">"{g.comment}"</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ATTENDANCE TAB */}
          {activeTab === 'attendance' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="font-extrabold text-slate-800 text-lg mb-4">Historique des présences</h3>
              {childAttendance.length === 0 ? (
                 <p className="text-slate-500 text-sm">Aucun historique d'absence ou de retard n'a été enregistré.</p>
              ) : (
                <div className="space-y-3">
                  {childAttendance.map(record => (
                    <div key={record.id} className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                        record.status === 'présent' ? 'bg-emerald-100 text-emerald-600' :
                        record.status === 'absent' ? 'bg-red-100 text-red-600' :
                        'bg-amber-100 text-amber-600'
                      }`}>
                        {record.status === 'présent' ? <CheckCircle className="h-5 w-5" /> :
                         record.status === 'absent' ? <XCircle className="h-5 w-5" /> :
                         <Clock className="h-5 w-5" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-slate-800 capitalize text-sm">
                          {record.status === 'en retard' ? 'Retard' : record.status === 'présent' ? 'Présent' : 'Absent'}
                        </p>
                        <p className="text-xs text-slate-500 font-medium">
                          {new Date(record.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                      {record.status === 'en retard' && record.notes && (
                        <div className="text-xs font-bold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-lg">
                          {record.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* HOMEWORK TAB */}
          {activeTab === 'homework' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="font-extrabold text-slate-800 text-lg mb-4">Cahier de textes & Devoirs</h3>
              <div className="space-y-4">
                {mockHomework.map(hw => (
                  <div key={hw.id} className={`p-4 rounded-xl border ${hw.status === 'completed' ? 'bg-slate-50 border-slate-200 opacity-75' : 'bg-white border-indigo-100 shadow-xs'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-extrabold text-indigo-600 uppercase tracking-wider">{hw.subject}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        hw.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {hw.status === 'completed' ? 'Terminé' : `Pour ${hw.due}`}
                      </span>
                    </div>
                    <p className={`font-bold text-base ${hw.status === 'completed' ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                      {hw.title}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ANNOUNCEMENTS TAB */}
          {activeTab === 'announcements' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="font-extrabold text-slate-800 text-lg mb-4">Annonces de l'école</h3>
              <div className="space-y-6">
                {mockAnnouncements.map(ann => (
                  <div key={ann.id} className="flex gap-4">
                    <div className="mt-1">
                      <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <MessageSquare className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-extrabold text-slate-800">{ann.title}</h4>
                        <span className="text-[10px] font-bold text-slate-400">{ann.date}</span>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {ann.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
