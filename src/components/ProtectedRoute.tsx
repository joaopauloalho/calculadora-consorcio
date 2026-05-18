import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { Profile } from '../lib/supabaseTypes';

interface Props {
  children: React.ReactNode;
  roles: Profile['role'][];
  redirectTo?: string;
}

export function ProtectedRoute({ children, roles, redirectTo }: Props) {
  const { session, role: userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#031715] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session || !userRole) {
    const fallback = roles.includes('cliente') ? '/cartas' : '/login';
    return <Navigate to={redirectTo ?? fallback} replace />;
  }

  if (!roles.includes(userRole)) {
    if (userRole === 'cliente') return <Navigate to="/cartas/portal" replace />;
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
