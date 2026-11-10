import { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated, isGuest } = useAuth();

  console.log('[ProtectedRoute] user:', user);
  console.log('[ProtectedRoute] allowedRoles:', allowedRoles);

  // Ako korisnik nije prijavljen - redirect na login
  if (!user) {
    console.log('[ProtectedRoute] No user, redirecting to /login');
    return <Navigate to="/login" replace />;
  }

  // Provjera uloge ako su specificirane dozvoljene uloge
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      console.log('[ProtectedRoute] User role not allowed:', user.role, 'allowed:', allowedRoles);
      // Korisnik nema dozvoljenu ulogu - redirect na home
      return <Navigate to="/" replace />;
    }
  }

  console.log('[ProtectedRoute] Access granted');
  // Sve OK - prikaži child komponente
  return <>{children}</>;
}