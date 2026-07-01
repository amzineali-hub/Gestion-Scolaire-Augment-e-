import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export type UserRole = 'admin' | 'enseignant' | 'secretariat' | 'parent';

interface AuthContextType {
  currentUser: any | null;
  schoolId: string | null;
  schoolName: string;
  userRole: UserRole | null;
  loading: boolean;
  demoExpired: boolean;
  loginAsGuest: () => void;
  logout: () => Promise<void>;
  hasRole: (roles: UserRole[]) => boolean;
  switchRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  schoolId: null,
  schoolName: "Gestion Scolaire Augmentée",
  userRole: null,
  loading: true,
  demoExpired: false,
  loginAsGuest: () => {},
  logout: async () => {},
  hasRole: () => false,
  switchRole: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [schoolName, setSchoolName] = useState<string>("Gestion Scolaire Augmentée");
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoExpired, setDemoExpired] = useState<boolean>(false);

  useEffect(() => {
    // Check demo expiration
    let isExpired = false;
    const demoStartTime = localStorage.getItem("madrasati_demo_start_time");
    if (demoStartTime) {
      const startTime = parseInt(demoStartTime, 10);
      const currentTime = Date.now();
      const sevenDaysInMillis = 7 * 24 * 60 * 60 * 1000;
      if (currentTime - startTime > sevenDaysInMillis) {
        isExpired = true;
      }
    }
    setDemoExpired(isExpired);

    if (!auth || !db) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Logged in with Firebase
        setCurrentUser(user);
        // Remove the force login screen flag since they successfully logged in
        localStorage.removeItem("madrasati_force_login_screen");
        
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const uData = userDoc.data();
            setSchoolId(uData.schoolId);
            setUserRole((uData.role as UserRole) || 'admin');
            
            const schoolDoc = await getDoc(doc(db, 'schools', uData.schoolId));
            if (schoolDoc.exists()) {
               setSchoolName(schoolDoc.data().name);
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        // Not logged in with Firebase
        const forceLoginScreen = localStorage.getItem("madrasati_force_login_screen");
        
        if (forceLoginScreen !== "true" && !isExpired) {
          // Record start time if it's the first time they enter demo
          if (!demoStartTime) {
            localStorage.setItem("madrasati_demo_start_time", Date.now().toString());
          }

          // Instant Demo Mode
          setCurrentUser({
            uid: "guest-user",
            email: "visiteur.demo@madrasati.ma",
            displayName: "Visiteur Démo",
            photoURL: ""
          });
          setSchoolId("school-demo");
          setSchoolName("Groupe Scolaire Excellence (Démo)");
          setUserRole("admin");
        } else {
          // Show the Auth screen
          setCurrentUser(null);
          setSchoolId(null);
          setUserRole(null);
        }
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const loginAsGuest = () => {
    if (!demoExpired) {
      if (!localStorage.getItem("madrasati_demo_start_time")) {
        localStorage.setItem("madrasati_demo_start_time", Date.now().toString());
      }
      localStorage.removeItem("madrasati_force_login_screen");
      window.location.reload();
    }
  };

  const logout = async () => {
    localStorage.setItem("madrasati_force_login_screen", "true");
    if (auth) {
      try {
        await signOut(auth);
      } catch (e) {
        console.error("Erreur de déconnexion Firebase", e);
      }
    }
    setCurrentUser(null);
    setSchoolId(null);
    setUserRole(null);
    setSchoolName("Gestion Scolaire Augmentée");
  };

  const hasRole = (roles: UserRole[]) => {
    if (!userRole) return false;
    return roles.includes(userRole);
  };

  const switchRole = async (newRole: UserRole) => {
    setUserRole(newRole);
    if (currentUser && currentUser.uid !== "guest-user") {
      try {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          role: newRole
        });
      } catch (error) {
        console.error("Error updating role in Firestore:", error);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, schoolId, schoolName, userRole, loading, demoExpired, loginAsGuest, logout, hasRole, switchRole }}>
        {children}
    </AuthContext.Provider>
  );
};

