import React, { useState, useEffect } from "react";
import { Student, Class } from "../types";
import { 
  Send, 
  Copy, 
  Mail, 
  MessageSquare, 
  User, 
  FileText, 
  Info, 
  Check, 
  Smartphone, 
  TrendingUp, 
  X,
  Sparkles,
  Award,
  AlertTriangle,
  Heart,
  RefreshCw,
  Clock
} from "lucide-react";

interface CommunicatorProps {
  students: Student[];
  classes: Class[];
  schoolName: string;
}

type TemplateCategory = "finance" | "absence" | "discipline" | "success" | "meeting" | "services" | "ai_report";
type ViewMode = "compose" | "inbox";

export default function Communicator({ students, classes, schoolName }: CommunicatorProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("compose");
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || "");
  const [category, setCategory] = useState<TemplateCategory>("success");
  const [copied, setCopied] = useState(false);
  const [aiReportType, setAiReportType] = useState<"bilan" | "plan" | "orientation">("bilan");

  // Custom variable fields
  const [customDetail, setCustomDetail] = useState("");
  const [testScore, setTestScore] = useState("18/20");
  const [testSubject, setTestSubject] = useState("Mathématiques");
  const [eventDate, setEventDate] = useState(new Date().toISOString().split("T")[0]);

  // Messages state
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [selectedChatPhone, setSelectedChatPhone] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [botStatusMap, setBotStatusMap] = useState<Record<string, boolean>>({});

  const fetchBotStatus = async () => {
    try {
      const r = await fetch('/api/whatsapp/bot-status');
      const data = await r.json();
      setBotStatusMap(data.botStatus || {});
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMessages = async () => {
    setLoadingMessages(true);
    try {
      const r = await fetch('/api/whatsapp/messages');
      const data = await r.json();
      setMessages(data.messages || []);
    } catch (e) {
      console.error("Failed to fetch messages", e);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    fetchBotStatus();
    const interval = setInterval(() => {
      fetchMessages();
      fetchBotStatus();
    }, 5000); // poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedChatPhone) return;
    try {
      const r = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: selectedChatPhone, message: replyText })
      });
      if (r.ok) {
        setReplyText("");
        fetchMessages();
      }
    } catch (e) {
      console.error("Failed to send reply", e);
    }
  };

  const handleToggleBot = async (phone: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    try {
      const r = await fetch("/api/whatsapp/bot-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, enabled: newStatus })
      });
      if (r.ok) {
        setBotStatusMap(prev => ({ ...prev, [phone]: newStatus }));
      }
    } catch (e) {
      console.error("Failed to toggle bot", e);
    }
  };

  // Find selected student details
  const student = students.find(s => s.id === selectedStudentId);
  const studentClass = student ? classes.find(c => c.id === student.classId) : null;

  // Render variables dynamically
  const parentName = student?.parentName || "[Nom du Parent]";
  const studentName = student ? `${student.firstName} ${student.lastName}` : "[Nom de l'Élève]";
  const className = studentClass ? `${studentClass.name} (${studentClass.level})` : "[Classe]";
  const cycleName = studentClass?.cycle || "[Cycle]";
  const outstandingBal = student?.outstandingBalance || 0;

  // High quality templates
  const templates = {
    success: {
      title: "🏆 Excellence & Félicitations",
      subject: `Félicitations pour les excellents résultats de ${studentName}`,
      message: `Chér(e) ${parentName},\n\n` +
               `C'est avec une immense fierté que l'équipe pédagogique de l'établissement ${schoolName} vous contacte aujourd'hui. Nous tenons à saluer chaleureusement l'investissement et le sérieux exceptionnel dont fait preuve ${studentName} actuellement en classe de ${className}.\n\n` +
               `Lors de la récente évaluation de ${testSubject}, ${studentName} a obtenu la note remarquable de ${testScore}.\n\n` +
               `Ce résultat témoigne non seulement de ses capacités académiques, mais également de son assiduité et de sa rigueur quotidienne. Nous vous remercions pour le précieux soutien que vous lui apportez à la maison, créant ainsi les conditions idéales pour son épanouissement scolaire.\n\n` +
               `Nous encourageons vivement ${studentName} à poursuivre dans cette voie d'excellence durant tout ce trimestre.\n\n` +
               `Veuillez agréer, chér(e) ${parentName}, l'expression de nos salutations les plus distinguées.\n\n` +
               `Le Directeur Général de ${schoolName}`
    },
    finance: {
      title: "💳 Relance de Scolarité & Impayés",
      subject: `Rappel de paiement de la scolarité mensuelle pour ${studentName}`,
      message: `Chér(e) ${parentName},\n\n` +
               `Sauf erreur ou omission de notre part, nous attirons votre aimable attention sur le fait que le compte de scolarité de votre enfant ${studentName} présente actuellement un solde restant dû de ${outstandingBal > 0 ? outstandingBal : 2300} MAD, relatif aux mensualités scolaires en cours.\n\n` +
               `Afin de nous permettre de garantir la continuité du parcours de formation personnalisé et d'assurer les investissements logistiques indispensables au bien-être des élèves, nous vous saurions gré de bien vouloir régulariser cette situation dans les plus brefs délais.\n\n` +
               `Vous pouvez effectuer ce règlement directement au secrétariat de l'école (espèces, chèque ou carte bancaire) ou par virement bancaire sur notre RIB d'établissement.\n\n` +
               `Si vous avez déjà procédé au règlement ces dernières 24 heures, nous vous prions de ne pas tenir compte de cette relance et de nous envoyer votre justificatif.\n\n` +
               `Nous restons à votre entière disposition pour tout aménagement temporaire ou question complémentaire.\n\n` +
               `Bien cordialement,\n\n` +
               `Le Service Financier de ${schoolName}`
    },
    absence: {
      title: "🕒 Avis d'Absence ou de Retard",
      subject: `Notification d'absence scolaire - ${studentName}`,
      message: `Chér(e) ${parentName},\n\n` +
               `Nous vous informons par la présente de l'absence constatée ce jour de votre enfant ${studentName} de la classe de ${className}.\n\n` +
               `L'administration scolaire n'ayant pas reçu de notification formelle préalable à ce sujet, nous vous invitons à bien vouloir régulariser et justifier cette absence dans les meilleurs délais.\n\n` +
               `Pour ce faire, merci de répondre à cet e-mail ou de prendre contact avec le secrétariat muni d'un justificatif officiel (certificat médical ou mot explicatif signé).\n\n` +
               `Nous vous rappelons que l'assiduité est un pilier fondamental de la réussite de la formation de ${studentName} et de sa bonne intégration au sein de son groupe de classe.\n\n` +
               `En vous remerciant de votre réactivité habituelle.\n\n` +
               `L'Administration de l'établissement ${schoolName}`
    },
    discipline: {
      title: "⚠️ Rapport de Comportement & Vigilance",
      subject: `Suivi du comportement en classe concernant ${studentName}`,
      message: `Chér(e) ${parentName},\n\n` +
               `Dans le cadre de notre partenariat éducatif mutuel pour la réussite de votre enfant ${studentName}, nous souhaitons partager avec vous un bilan de son comportement récent à l'école.\n\n` +
               `Nos éducateurs ont relevé des comportements perturbateurs ou un manque flagrant d'attention répété récemment en classe.\n\n` +
               `Détails complémentaires constatés : ${customDetail || "Bavardages incessants et non-respect des consignes de travail individuel."}\n\n` +
               `Nous sommes convaincus que l'école et la famille forment une alliance d'apprentissage unique. C'est pourquoi nous sollicitons votre aimable intervention auprès de ${studentName} pour réaffirmer l'importance du respect du règlement intérieur de l'école.\n\n` +
               `Si vous le souhaitez, nous serons ravis de vous recevoir pour un entretien ciblé afin de mettre en place une stratégie conjointe d'accompagnement.\n\n` +
               `Avec tous nos remerciements pour votre active collaboration,\n\n` +
               `L'Équipe d'Orientation de ${schoolName}`
    },
    meeting: {
      title: "📅 Réunion Parents-Enseignants",
      subject: `Invitation à la rencontre parents-enseignants pour ${studentName}`,
      message: `Chér(e) ${parentName},\n\n` +
               `Nous avons le plaisir de vous convier à la Rencontre Individuelle Parents-Enseignants de l'établissement ${schoolName} qui se tiendra le ${eventDate}.\n\n` +
               `Cette rencontre personnalisée est une opportunité privilégiée pour faire un point complet sur la progression académique de ${studentName} en ${className}, ses points forts et les aspects à perfectionner durant les prochains mois.\n\n` +
               `Votre présence à cette rencontre est vivement recommandée afin de co-construire les plans de soutien pour les examens à venir.\n\n` +
               `Afin de planifier votre créneau horaire de passage avec le professeur principal, merci de nous faire part de vos disponibilités horaires privilégiées rapidement par retour de message.\n\n` +
               `Dans l'attente de vous rencontrer, nous vous prions d'agréer, chér(e) ${parentName}, nos sincères salutations.\n\n` +
               `La Direction Pédagogique de ${schoolName}`
    },
    services: {
      title: "🛡️ Validation des Services Optionnels",
      subject: `Confirmation d'inscription aux options scolaires pour ${studentName}`,
      message: `Chér(e) ${parentName},\n\n` +
               `Nous avons le plaisir de vous confirmer la prise en compte de l'inscription de votre enfant ${studentName} aux services optionnels de l'établissement ${schoolName} pour l'année en cours.\n\n` +
               `Options scolaires actuellement validées :\n` +
               `- 🎒 Cantine Scolaire Quotidienne : ${student?.canteenOption ? "✅ Activée" : "❌ Non souscrite"}\n` +
               `- 🚌 Transport Scolaire Navette : ${student?.transportOption ? "✅ Activée" : "❌ Non souscrite"}\n` +
               `- 📚 Soutien Scolaire Renforcé : ${student?.tutoringOption ? "✅ Activée" : "❌ Non souscrite"}\n` +
               `- ⚽ Club de Sport & Activités : ${student?.sportOption ? "✅ Activée" : "❌ Non souscrite"}\n` +
               `- 📱 Suivi WhatsApp & Notifications : ${student?.smsOption ? "✅ Activée" : "❌ Non souscrite"}\n` +
               `- 🛡️ Assurance Scolaire Individuelle Premium : ${student?.insuranceOption ? "✅ Activée" : "❌ Non souscrite"}\n` +
               `- 🤖 Suivi Cognitif & Tutorat Virtuel IA : ${student?.aiOption ? "✅ Activée" : "❌ Non souscrite"}\n\n` +
               `Ces prestations complémentaires ont été conçues pour offrir un confort maximal et un environnement d'apprentissage entièrement enrichi à ${studentName}.\n\n` +
               `Pour tout complément ou demande de modification d'option, merci de vous adresser rapidement au secrétariat.\n\n` +
               `Bien cordialement,\n\n` +
               `Le Secrétariat des Services de ${schoolName}`
    },
    ai_report: {
      title: "🤖 Synthèse & Remédiation IA",
      subject: `Bilan d'Apprentissage Intelligent & Recommandations - ${studentName}`,
      message: !student?.aiOption 
        ? `⚠️ OPTION IA NON SOUSCRITE POUR CET ÉLÈVE\n\n` +
          `Chér(e) ${parentName},\n\n` +
          `L'option "Tuteur IA & Accompagnement Madrasati Intellect" n'est pas encore activée pour votre enfant ${studentName}.\n\n` +
          `En souscrivant à cette option (150 DH / mois) dans la fiche de l'élève, vous accéderez instantanément à :\n` +
          `• Des bilans d'apprentissage personnalisés générés par notre modèle IA Madrasati.\n` +
          `• Un plan de travail individualisé avec des recommandations de remédiation adaptées au cycle ${cycleName}.\n` +
          `• Des outils d'aide à la révision connectés pour combler les lacunes en temps réel.\n\n` +
          `Pour activer cette option, veuillez contacter l'administration ou modifier la fiche d'inscription de ${studentName} dans le panneau de Gestion des Élèves.\n\n` +
          `Cordialement,\n\n` +
          `La Direction Administrative de ${schoolName}`
        : aiReportType === "bilan"
          ? `🤖 BILAN D'APPRENTISSAGE INTELLIGENT (Généré par Madrasati Intellect)\n` +
            `Élève : ${studentName}\n` +
            `Classe : ${className} | Cycle : ${cycleName}\n` +
            `Émis le : ${new Date().toLocaleDateString("fr-FR")}\n\n` +
            `Chér(e) ${parentName},\n\n` +
            `Dans le cadre de l'Option IA souscrite pour votre enfant, notre moteur pédagogique d'évaluation a croisé les données d'assiduité, de niveau de classe et d'options de scolarité pour vous proposer un bilan d'apprentissage complet.\n\n` +
            `🧠 Profil Attentionnel & Cognitif :\n` +
            `${studentName} démontre de belles aptitudes d'acquisition au sein du groupe de niveau ${className}. Nous remarquons une participation régulière, bien qu'un surcroît de rigueur méthodologique soit recommandé pour sécuriser ses bases scolaires.\n\n` +
            `📊 Synergie des Prestations Scolaires :\n` +
            `${student?.tutoringOption 
              ? `• Grâce à son inscription à l'Option Soutien Scolaire, ${studentName} consolide activement ses devoirs de classe au quotidien, ce qui limite le risque de décrochage sur les matières clés.` 
              : `• Remarque : L'élève ne bénéficie pas actuellement de l'Option Soutien Scolaire en après-midi. Une étude dirigée pourrait l'aider à stabiliser ses routines de révision.`}\n` +
            `${student?.sportOption ? `• L'Option Club Sport offre un bon exutoire physique favorisant une excellente concentration lors des cours académiques.` : ""}\n\n` +
            `📈 Recommandation Prioritaire Madrasati Intellect :\n` +
            `Travailler en priorité l'auto-évaluation et la gestion du temps de lecture. Un rythme de révision régulier de 30 minutes chaque soir est vivement conseillé.\n\n` +
            `Bien cordialement,\n` +
            `L'Équipe Pédagogique Assistée par IA de l'établissement ${schoolName}`
          : aiReportType === "plan"
            ? `🤖 PLAN DE TRAVAIL INDIVIDUALISÉ & REMÉDIATION IA\n` +
              `Élève : ${studentName}\n` +
              `Classe : ${className} | Cycle : ${cycleName}\n\n` +
              `Chér(e) ${parentName},\n\n` +
              `Voici le programme de remédiation et de travail personnel structuré par notre outil IA pour ${studentName}, adapté aux exigences du cycle ${cycleName}.\n\n` +
              `🎯 Objectifs de la semaine :\n` +
              `1. Consolidation des notions de base et méthodologies de synthèse.\n` +
              `2. Automatisation des exercices d'application directe.\n` +
              `3. Optimisation de la gestion du matériel scolaire.\n\n` +
              `⏱️ Agenda Hebdomadaire Suggéré :\n` +
              `• Lundi/Mercredi (20 mins) : Lecture active des résumés de cours et fiches de révision créées en classe.\n` +
              `• Mardi/Jeudi (25 mins) : Exercices pratiques d'application moyenne (viser 3 scénarios types).\n` +
              `• Samedi Matin (40 mins) : Auto-évaluation sur un ancien sujet d'examen de la classe ${className}.\n\n` +
              `💡 Astuce de Tuteur Virtuel IA :\n` +
              `Nous recommandons d'utiliser la technique Pomodoro (25 minutes d'étude intensive, 5 minutes de pause active sans écran) pour optimiser les capacités attentionnelles de ${studentName}.\n\n` +
              `Nous comptons sur votre accompagnement bienveillant pour la tenue de ce carnet d'autonomie.\n\n` +
              `L'Équipe Pédagogique Connectée de l'établissement ${schoolName}`
            : `🤖 RAPPORT D'ORIENTATION & PROJET DE VIE IA\n` +
              `Élève : ${studentName}\n` +
              `Niveau : ${className}\n\n` +
              `Chér(e) ${parentName},\n\n` +
              `Notre module d'analyse d'orientation scolaire s'est penché sur le projet d'études de ${studentName} au vu des exigences scolaires nationales.\n\n` +
              `🗺️ Parcours d'Avenir Conseillé :\n` +
              `${cycleName === "Lycée" 
                ? `En tant qu'élève du Lycée (${className}), les décisions d'orientation vers les filières du BAC (Sciences Physiques, Sciences Mathématiques, Économie) sont déterminantes. Nous conseillons de maximiser les coefficients scientifiques tout en soignant l'apprentissage des langues pour l'accès aux classes préparatoires (CPGE) et grandes écoles marocaines.`
                : cycleName === "Collège"
                  ? `Actuellement au Collège, ${studentName} prépare la transition cruciale vers le Lycée. L'accent doit être mis sur l'acquisition d'une autonomie de prise de note et le raisonnement logique afin de s'orienter sereinement vers un tronc commun scientifique ou technologique selon ses affinités.`
                  : `Au niveau Primaire, nous posons les fondations fondamentales (lecture fluide, calcul mental rapide et bilinguisme). Le projet d'orientation de ${studentName} passe par le renforcement des aptitudes d'expression écrite et orale en français et arabe.`}\n\n` +
              `🛠️ plan de compétences à consolider :\n` +
              `• Résolution de problèmes complexes et pensée logique.\n` +
              `• Prise de parole en public et présentation claire d'exposés.\n` +
              `• Compétences de recherche autonome et d'esprit critique.\n\n` +
              `Nous vous invitons à en discuter en famille et restons disponibles pour affiner ces orientations ensemble au sein de la direction de ${schoolName}.\n\n` +
              `Le Service d'Orientation Assisté par IA`
    }
  };

  const [sendingEmail, setSendingEmail] = useState(false);
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);
  const [sendResult, setSendResult] = useState<{ type: 'email' | 'whatsapp', success: boolean, message: string } | null>(null);

  const activeTemplate = templates[category];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeTemplate.message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendEmail = async () => {
    const parentEmail = student?.parentEmail || "";
    if (!parentEmail) {
       setSendResult({ type: 'email', success: false, message: 'Email du parent manquant.'});
       setTimeout(() => setSendResult(null), 3000);
       return;
    }
    setSendingEmail(true);
    setSendResult(null);
    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: parentEmail,
          subject: activeTemplate.subject,
          text: activeTemplate.message
        })
      });
      
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
         const text = await response.text();
         console.error("Server returned non-JSON:", text.substring(0, 100));
         setSendResult({ type: 'email', success: false, message: 'La session a expiré ou le serveur est indisponible. Veuillez rafraîchir la page.'});
         return;
      }
      
      if (!response.ok) {
         const data = await response.json();
         setSendResult({ type: 'email', success: false, message: `Erreur ${response.status}: ` + (data.error || 'Erreur serveur')});
         return;
      }
      
      const data = await response.json();
      if (data.success) {
         setSendResult({ type: 'email', success: true, message: 'E-mail envoyé avec succès (Serveur) !'});
      } else {
         setSendResult({ type: 'email', success: false, message: 'Erreur: ' + data.error});
      }
    } catch (e: any) {
      console.error(e);
      setSendResult({ type: 'email', success: false, message: 'Erreur de connexion au serveur.'});
    } finally {
      setSendingEmail(false);
      setTimeout(() => setSendResult(null), 4000);
    }
  };

  const handleWhatsApp = async () => {
    const parentPhoneClean = student?.parentPhone ? student.parentPhone.replace(/\s+/g, "") : "";
    if (!parentPhoneClean) {
       setSendResult({ type: 'whatsapp', success: false, message: 'Téléphone du parent manquant.'});
       setTimeout(() => setSendResult(null), 3000);
       return;
    }
    
    // Format Moroccan phone number for Twilio (requires +212)
    let phoneFormat = parentPhoneClean;
    if (phoneFormat.startsWith("0")) {
      phoneFormat = "+212" + phoneFormat.substring(1);
    } else if (!phoneFormat.startsWith("+")) {
      phoneFormat = "+" + phoneFormat;
    }

    setSendingWhatsApp(true);
    setSendResult(null);
    try {
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: phoneFormat,
          message: activeTemplate.message
        })
      });
      
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
         const text = await response.text();
         console.error("Server returned non-JSON:", text.substring(0, 100));
         setSendResult({ type: 'whatsapp', success: false, message: 'La session a expiré ou le serveur est indisponible. Veuillez rafraîchir la page.'});
         return;
      }
      
      if (!response.ok) {
         const data = await response.json();
         setSendResult({ type: 'whatsapp', success: false, message: `Erreur ${response.status}: ` + (data.error || 'Erreur serveur')});
         return;
      }
      
      const data = await response.json();
      if (data.success) {
         setSendResult({ type: 'whatsapp', success: true, message: 'Message WhatsApp envoyé avec succès !'});
      } else {
         setSendResult({ type: 'whatsapp', success: false, message: 'Erreur: ' + data.error});
      }
    } catch (e: any) {
      console.error(e);
      setSendResult({ type: 'whatsapp', success: false, message: 'Erreur de connexion au serveur.'});
    } finally {
      setSendingWhatsApp(false);
      setTimeout(() => setSendResult(null), 4000);
    }
  };

  return (
    <div id="school-communicator-block" className="space-y-6">
      
      {/* Tab Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2 font-display">
            <Sparkles className="h-6 w-6 text-teal-600 animate-pulse" /> Assistant de Communication Parentale
          </h2>
          <p className="text-sm text-black">
            Générez des messages éducatifs et notices de scolarité personnalisés en français pour les parents d'élèves.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center shrink-0">
            <button
              onClick={() => setViewMode("compose")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === "compose"
                  ? "bg-white text-slate-800 shadow-sm border border-slate-200"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Nouveau Message
            </button>
            <button
              onClick={() => setViewMode("inbox")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === "inbox"
                  ? "bg-white text-slate-800 shadow-sm border border-slate-200"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Inbox WhatsApp
            </button>
          </div>
        </div>
      </div>

      {viewMode === "compose" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Control Column (Options selector) - 5 Cols */}
          <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-50 pb-3">
              <User className="h-4 w-4 text-indigo-500" />
              1. Choix du Destinataire & Variables
            </h3>

            {/* Student Picker */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-black uppercase">Sélectionner l'Élève</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full text-sm border border-slate-200 bg-slate-50 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer font-medium text-slate-800"
              >
                {students.slice(0, 100).map(s => ( // slice to keep standard select fast
                  <option key={s.id} value={s.id}>
                    {s.firstName} {s.lastName} (Classe: {classes.find(c => c.id === s.classId)?.name || "N/A"})
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-zinc-400">Recherche restreinte aux 100 premiers élèves représentatifs</p>
            </div>

            {/* Quick stats for parent loaded */}
            {student && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2.5 text-xs text-black">
                <div className="flex justify-between">
                  <span className="font-medium text-black">Responsable :</span>
                  <span className="font-bold text-slate-700">{student.parentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-black">Téléphone :</span>
                  <span className="font-bold text-slate-750">{student.parentPhone || "Non attribué"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-black">Email :</span>
                  <span className="font-semibold text-black truncate max-w-[150px]" title={student.parentEmail}>
                    {student.parentEmail || "Aucun"}
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-150 pt-2 text-[11px]">
                  <span className="font-medium text-black">Solde Impayé :</span>
                  <span className={`font-black ${student.outstandingBalance > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                    {student.outstandingBalance} MAD
                  </span>
                </div>
              </div>
            )}

            {/* Categories of Templates with elegant badge choice */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-black uppercase">Catégorie de Message</label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(templates) as TemplateCategory[]).map(catKey => {
                  const item = templates[catKey];
                  const isSelected = category === catKey;
                  return (
                    <button
                      key={catKey}
                      type="button"
                      onClick={() => setCategory(catKey)}
                      className={`text-left p-2.5 rounded-xl border text-xs font-semibold transition ${
                        isSelected 
                          ? "bg-indigo-50 border-indigo-400 text-indigo-700 font-bold" 
                          : "bg-white border-slate-150 text-black hover:bg-slate-50"
                      }`}
                    >
                      {item.title.split(" ")[0]} {item.title.split(" ").slice(1).join(" ")}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Categories Context Custom Variables */}
            <div className="border-t border-slate-100 pt-4 space-y-3.5">
              <h4 className="text-[10px] uppercase font-bold text-black tracking-wider">
                Détails des Variables
              </h4>

              {category === "success" && (
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-black mb-0.5">Note Obtenue</label>
                    <input
                      type="text"
                      value={testScore}
                      onChange={(e) => setTestScore(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-black mb-0.5">Matière</label>
                    <input
                      type="text"
                      value={testSubject}
                      onChange={(e) => setTestSubject(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}

              {category === "meeting" && (
                <div>
                  <label className="block text-[10px] font-bold text-black mb-0.5">Date de la Rencontre</label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              )}

              {category === "discipline" && (
                <div>
                  <label className="block text-[10px] font-bold text-black mb-0.5">Comportement constaté</label>
                  <textarea
                    rows={2}
                    value={customDetail}
                    onChange={(e) => setCustomDetail(e.target.value)}
                    placeholder="Bavardages incessants et non-respect des règles..."
                    className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-slate-700"
                  />
                </div>
              )}

              {category === "ai_report" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-black mb-1">Type d'Analyse Executive IA</label>
                    <select
                      value={aiReportType}
                      onChange={(e) => setAiReportType(e.target.value as any)}
                      className="w-full text-xs border border-slate-200 bg-white rounded px-2.5 py-2 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer text-slate-800"
                    >
                      <option value="bilan">🧠 Bilan Cognitif & Scolaire</option>
                      <option value="plan">🎯 Plan de Travail Réduction de Lacunes</option>
                      <option value="orientation">🗺️ Projet d'Orientation Maroc & Avenir</option>
                    </select>
                  </div>
                  {student?.aiOption && (
                    <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-lg text-[10px] text-indigo-950 font-medium">
                      🤖 <span className="font-bold">Madrasati Intellect v3.5</span> connecté avec succès à l'historique scolaire de l'élève.
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-start gap-2 bg-slate-50 rounded-xl p-3 text-[11px] text-black">
                <Info className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <p>
                  Les variables de nom du parent, d'élève, de classe et de scolarité restante sont automatiquement résolues en fonction de l'élève choisi.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Right Output Template Preview Column - 7 Cols */}
        <div id="template-output-box" className="lg:col-span-12 xl:col-span-7">
          <div className="bg-white rounded-2xl border border-slate-105 shadow-sm overflow-hidden flex flex-col h-full bg-slate-50/20">
            {/* Header of preview panel */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-150 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-500" />
                <span className="font-bold text-slate-800 text-sm">Lettre de Notification Parentale</span>
              </div>
              <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 px-2.5 py-0.5 rounded-full">
                Prêt-à-envoyer
              </span>
            </div>

            {/* Subject box */}
            <div className="px-6 py-3 border-b border-slate-100 bg-white flex items-center gap-1 text-xs">
              <span className="font-bold text-black shrink-0">Objet :</span>
              <span className="font-semibold text-slate-800 truncate" title={activeTemplate.subject}>
                {activeTemplate.subject}
              </span>
            </div>

            {/* Email Body field styled with professional paper background */}
            <div className="p-6 flex-grow bg-white border-b border-slate-100">
              <div className="bg-slate-50/50 rounded-2xl border border-slate-100 p-5 font-sans text-xs leading-relaxed text-slate-700 whitespace-pre-wrap max-h-[420px] overflow-y-auto font-medium">
                {activeTemplate.message}
              </div>
            </div>

            {/* Quick Action buttons */}
            <div className="p-5 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleCopy}
                className="bg-white border border-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 hover:bg-slate-50 transition shadow-xs focus:outline-none"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-500" /> Message copié !
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 text-black" /> Copier le texte
                  </>
                )}
              </button>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleWhatsApp}
                  disabled={sendingWhatsApp}
                  className={`bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-xs transition focus:outline-none ${sendingWhatsApp ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {sendingWhatsApp ? (
                    <>
                       <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                       Envoi en cours...
                    </>
                  ) : (
                    <>
                       <Smartphone className="h-4 w-4" /> WhatsApp Parent
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleSendEmail}
                  disabled={sendingEmail}
                  className={`bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-xs transition focus:outline-none ${sendingEmail ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {sendingEmail ? (
                    <>
                       <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                       Envoi en cours...
                    </>
                  ) : (
                     <>
                        <Mail className="h-4 w-4" /> Envoyer par E-mail
                     </>
                  )}
                </button>
              </div>
            </div>
            
            {/* Feedback messages */}
            {sendResult && (
              <div className={`mx-5 mb-5 p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${sendResult.success ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                {sendResult.success ? <Check className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                {sendResult.message}
              </div>
            )}

          </div>
        </div>

        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm min-h-[600px] flex overflow-hidden">
          {/* Left Sidebar - Chat List */}
          <div className="w-1/3 border-r border-slate-100 bg-slate-50/50 flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-emerald-500" />
                Discussions
              </h3>
              <button 
                onClick={fetchMessages}
                disabled={loadingMessages}
                className="text-slate-400 hover:text-slate-600 transition"
                title="Actualiser"
              >
                <RefreshCw className={`h-4 w-4 ${loadingMessages ? "animate-spin" : ""}`} />
              </button>
            </div>
            <div className="overflow-y-auto flex-1">
              {(() => {
                // Group messages by phone
                const chats: Record<string, any> = {};
                messages.forEach(m => {
                  const phone = m.direction === 'incoming' ? m.from : m.to;
                  if (!chats[phone] || new Date(m.timestamp) > new Date(chats[phone].timestamp)) {
                    chats[phone] = m;
                  }
                });
                
                const chatList = Object.entries(chats).sort((a, b) => new Date(b[1].timestamp).getTime() - new Date(a[1].timestamp).getTime());
                
                if (chatList.length === 0) {
                  return (
                    <div className="p-6 text-center text-slate-500 text-xs">
                      Aucune conversation.
                    </div>
                  );
                }
                
                return chatList.map(([phone, lastMsg]) => (
                  <button
                    key={phone}
                    onClick={() => setSelectedChatPhone(phone)}
                    className={`w-full text-left p-4 border-b border-slate-50 hover:bg-slate-100 transition ${selectedChatPhone === phone ? 'bg-indigo-50 hover:bg-indigo-50 border-l-4 border-l-indigo-500' : 'border-l-4 border-l-transparent'}`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-800 text-sm">{phone}</span>
                      <span className="text-[10px] text-slate-400">{new Date(lastMsg.timestamp).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">
                      {lastMsg.direction === 'outgoing' ? 'Vous: ' : ''}{lastMsg.text}
                    </p>
                  </button>
                ));
              })()}
            </div>
          </div>
          
          {/* Right Area - Chat Window */}
          <div className="w-2/3 flex flex-col bg-white">
            {selectedChatPhone ? (
              <>
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white shadow-sm z-10">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-slate-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{selectedChatPhone}</h4>
                      <p className="text-xs text-slate-500">Contact WhatsApp</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    <span className="text-xs font-semibold text-slate-600">Bot Gemini</span>
                    <button 
                      onClick={() => handleToggleBot(selectedChatPhone, botStatusMap[selectedChatPhone] !== false)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${botStatusMap[selectedChatPhone] !== false ? 'bg-emerald-500' : 'bg-slate-300'}`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${botStatusMap[selectedChatPhone] !== false ? 'translate-x-4' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
                  {messages.filter(m => (m.direction === 'incoming' && m.from === selectedChatPhone) || (m.direction === 'outgoing' && m.to === selectedChatPhone)).sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()).map((msg: any, idx) => {
                    const isIncoming = msg.direction === 'incoming';
                    const isBot = msg.bot;
                    
                    return (
                      <div key={idx} className={`flex w-full ${isIncoming ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-3 shadow-sm ${
                          isIncoming 
                            ? 'bg-white border border-slate-200 rounded-tl-sm' 
                            : (isBot ? 'bg-emerald-50 border border-emerald-200 rounded-tr-sm' : 'bg-indigo-500 text-white border border-indigo-600 rounded-tr-sm')
                        }`}>
                          <div className={`text-[10px] font-medium mb-1 flex items-center gap-1 ${isIncoming ? 'text-slate-400' : (isBot ? 'text-emerald-600' : 'text-indigo-200')}`}>
                            {isBot && <Sparkles className="h-3 w-3" />}
                            {isBot ? 'Bot Gemini' : (isIncoming ? selectedChatPhone : 'Vous (Admin)')}
                            <span className="mx-1">•</span>
                            {new Date(msg.timestamp).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
                          </div>
                          <p className={`text-sm whitespace-pre-wrap leading-relaxed ${isIncoming ? 'text-slate-800' : (isBot ? 'text-emerald-900' : 'text-white')}`}>{msg.text}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="p-4 border-t border-slate-100 bg-white">
                  <div className="flex items-end gap-2">
                    <textarea 
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Tapez votre message ici pour répondre manuellement..."
                      className="flex-1 resize-none border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[60px]"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendReply();
                        }
                      }}
                    />
                    <button 
                      onClick={handleSendReply}
                      disabled={!replyText.trim()}
                      className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white p-3 rounded-xl transition"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 text-center">
                    En envoyant un message manuellement, vous pouvez choisir de désactiver le Bot Gemini ci-dessus pour prendre le relais.
                  </p>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                <MessageSquare className="h-12 w-12 text-slate-200 mb-4" />
                <p>Sélectionnez une conversation pour afficher les messages</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
