import React from 'react';
import { useAuth, UserRole } from '../AuthContext';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ children, allowedRoles, fallback }) => {
  const { hasRole, loading } = useAuth();

  if (loading) {
    return null; // Or a loading spinner
  }

  if (!hasRole(allowedRoles)) {
    return fallback ? <>{fallback}</> : (
      <div className="flex flex-col items-center justify-center h-full w-full p-8 text-center bg-slate-50/50 rounded-2xl border border-slate-100">
        <div className="h-16 w-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">Accès Refusé</h3>
        <p className="text-slate-600 max-w-sm mx-auto">
          Vous n'avez pas les permissions nécessaires pour accéder à cette section. Veuillez contacter l'administrateur.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
