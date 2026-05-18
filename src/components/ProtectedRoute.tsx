import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface Props {
  children: React.ReactNode;
  role: 'admin' | 'cliente';
  redirectTo?: string;
}

export function ProtectedRoute({ children, role, redirectTo }: Props) {
  const { session, role: userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#031715] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    const fallback = role === 'admin' ? '/' : '/cartas';
    return <Navigate to={redirectTo ?? fallback} replace />;
  }

  if (role === 'admin' && userRole !== 'admin') {
    return <Navigate to="/cartas" replace />;
  }

  return <>{children}</>;
}
