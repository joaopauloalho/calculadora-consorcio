import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';

type Mode = 'login' | 'register';

export function ClienteAuthScreen() {
  const { session, loading, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('login');
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && session) {
    navigate('/cartas/portal', { replace: true });
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await signIn(email, password);
        navigate('/cartas/portal', { replace: true });
      } else {
        await signUp({ email, password, nome, telefone });
        toast.success('Conta criada! Verifique seu email para confirmar.');
        setMode('login');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao autenticar');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#031715] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-xs tracking-[0.3em] font-bold text-[#C9A84C] uppercase">PRESTIGE</p>
          <p className="text-[#5EB9AA] text-sm mt-1">Cartas Contempladas</p>
        </div>

        <div className="bg-[#041e1b] border border-[#1a4a44] rounded-2xl p-8">
          <h2 className="text-white font-bold text-lg mb-6">
            {mode === 'login' ? 'Entrar' : 'Criar conta'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <label className="text-[#5EB9AA] text-xs uppercase tracking-wider">Nome</label>
                  <input
                    type="text"
                    value={nome}
                    onChange={e => setNome(e.target.value)}
                    required
                    className="mt-1 w-full bg-[#031715] border border-[#1a4a44] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A84C]"
                  />
                </div>
                <div>
                  <label className="text-[#5EB9AA] text-xs uppercase tracking-wider">Telefone</label>
                  <input
                    type="tel"
                    value={telefone}
                    onChange={e => setTelefone(e.target.value)}
                    className="mt-1 w-full bg-[#031715] border border-[#1a4a44] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A84C]"
                  />
                </div>
              </>
            )}

            <div>
              <label className="text-[#5EB9AA] text-xs uppercase tracking-wider">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
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
                className="mt-1 w-full bg-[#031715] border border-[#1a4a44] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A84C]"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#C9A84C] text-[#031715] font-bold py-3 rounded-xl mt-2 disabled:opacity-60 hover:bg-[#d4b560] transition-colors"
            >
              {submitting ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
            </button>
          </form>

          <p className="text-center text-sm text-[#5EB9AA] mt-4">
            {mode === 'login' ? (
              <>Não tem conta?{' '}
                <button onClick={() => setMode('register')} className="text-[#C9A84C] font-semibold hover:underline">
                  Criar conta
                </button>
              </>
            ) : (
              <>Já tem conta?{' '}
                <button onClick={() => setMode('login')} className="text-[#C9A84C] font-semibold hover:underline">
                  Entrar
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
