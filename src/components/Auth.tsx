import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { 
  signInWithPopup,
  GoogleAuthProvider,
  signOut
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, addDoc } from 'firebase/firestore';
import { translations } from '../translations';
import { School, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '../AuthContext';

interface AuthProps {
  lang: 'fr' | 'ar';
}

export default function Auth({ lang }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [schoolName, setSchoolName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { loginAsGuest, demoExpired } = useAuth();

  const t = (key: keyof typeof translations['fr']) => translations[lang][key] || key;

  const handleGoogleAction = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!auth || !db) {
      setError("Erreur de configuration Firebase.");
      return;
    }
    
    if (!isLogin && !schoolName.trim()) {
      setError("Veuillez saisir le nom de l'établissement.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        if (isLogin || !schoolName.trim()) {
          // Si c'est une connexion ou s'il n'y a pas de nom d'établissement, on permet l'accès d'abord
          await setDoc(userDocRef, {
            email: user.email,
            role: 'admin',
            schoolId: null
          });
        } else {
          // 1. Create School document
          const schoolRef = await addDoc(collection(db, 'schools'), {
            name: schoolName,
            createdAt: new Date(),
            subscriptionPlan: 'croissance'
          });

          // 2. Create User Document
          await setDoc(userDocRef, {
            email: user.email,
            role: 'admin',
            schoolId: schoolRef.id
          });
        }
        window.location.reload();
      } else {
        if (!isLogin) {
           console.log("Ce compte existe déjà, connexion en cours...");
        }
        window.location.reload();
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Le popup de connexion a été fermé avant de terminer.');
      } else {
        setError(err.message || 'Une erreur est survenue');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 font-sans ${lang === 'ar' ? 'rtl' : 'ltr'}`}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 bg-gradient-to-tr from-indigo-600 to-teal-500 rounded-xl flex items-center justify-center text-white font-extrabold text-xl shadow-md mb-4">
            M
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            {isLogin ? "Connexion" : "Créer un compte"}
          </h1>
          <p className="text-sm text-black mt-1">
            Madrasti SaaS - Gestion scolaire
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 text-rose-600 p-3 rounded-lg text-sm font-medium mb-6 border border-rose-100">
            {error}
          </div>
        )}

        <form onSubmit={handleGoogleAction} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Nom de l'établissement
              </label>
              <div className="relative">
                <School className="absolute left-3 top-2.5 h-4 w-4 text-black" />
                <input 
                  type="text" 
                  required
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium"
                  placeholder="Groupe Scolaire Arrachad"
                />
              </div>
            </div>
          )}

          <button 
            type="button" 
            onClick={handleGoogleAction}
            disabled={loading}
            className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-2.5 rounded-xl shadow-sm transition-all active:scale-[0.98] mt-2 flex justify-center items-center gap-2 disabled:opacity-70 disabled:active:scale-100"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-black" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            {isLogin ? "Continuer avec Google" : "S'inscrire avec Google"}
          </button>

          <div className="relative my-5 flex items-center justify-center">
            <div className="border-t border-slate-150 w-full absolute"></div>
            <span className="bg-white px-3 text-[10px] font-extrabold text-black uppercase tracking-widest relative z-10">OU / OR</span>
          </div>

          <button
            type="button"
            onClick={() => loginAsGuest()}
            disabled={demoExpired}
            className={`w-full font-extrabold py-3 rounded-xl shadow-xs transition-all flex justify-center items-center gap-2 text-sm text-[13px] ${demoExpired ? 'bg-slate-100 text-black border border-slate-200 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-50 to-teal-50/50 border border-indigo-100 hover:from-indigo-100 hover:to-teal-100 text-indigo-700 active:scale-[0.98]'}`}
          >
            <Sparkles className={`h-4 w-4 ${demoExpired ? 'text-black' : 'text-indigo-600 animate-pulse'}`} />
            <span>{lang === "fr" ? "Accéder en Mode Démo (Sans connexion)" : "الدخول في وضع التجريب (بدون تسجيل)"}</span>
          </button>
          
          {demoExpired && (
            <p className="text-xs text-rose-500 text-center mt-2 font-medium">
              {lang === "fr" ? "Votre période d'essai de 7 jours a expiré." : "انتهت فترة التجربة الخاصة بك (7 أيام)."}
            </p>
          )}
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            {isLogin ? "Je n'ai pas encore de compte. Créer un établissement." : "J'ai déjà un compte. Me connecter."}
          </button>
        </div>
      </div>
    </div>
  );
}
