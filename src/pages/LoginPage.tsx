import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';

export function LoginPage() {
  const { session, role, loading, signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && session && role) {
      if (role === 'cliente') {
        navigate('/cartas/portal', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [loading, session, role, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await signIn(email, password);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Email ou senha incorretos');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#031715] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#031715] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-xs tracking-[0.3em] font-bold text-[#C9A84C] uppercase">PRESTIGE</p>
          <p className="text-[#5EB9AA] text-sm mt-1">Acesso Interno</p>
        </div>
        <div className="bg-[#041e1b] border border-[#1a4a44] rounded-2xl p-8">
          <h2 className="text-white font-bold text-lg mb-6">Entrar</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[#5EB9AA] text-xs uppercase tracking-wider">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="mt-1 w-full bg-[#031715] border border-[#1a4a44] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A84C]"
              />
            </div>
            <div>
              <label className="text-[#5EB9AA] text-xs uppercase tracking-wider">Senha</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="mt-1 w-full bg-[#031715] border border-[#1a4a44] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A84C]"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#C9A84C] text-[#031715] font-bold py-3 rounded-xl mt-2 disabled:opacity-60 hover:bg-[#d4b560] transition-colors"
            >
              {submitting ? 'Aguarde...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
