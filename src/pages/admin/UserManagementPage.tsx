import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Profile } from '../../lib/supabaseTypes';
import { toast } from 'sonner';

interface Vendedor extends Profile {
  nome: string;
  email: string;
}

export function UserManagementPage() {
  const navigate = useNavigate();
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function loadVendedores() {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, role, nome, email')
      .eq('role', 'vendedor')
      .order('nome');
    if (!error && data) setVendedores(data as Vendedor[]);
    setLoading(false);
  }

  useEffect(() => { loadVendedores(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-vendedor', {
        body: { email, password, nome },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success('Vendedor criado com sucesso!');
      setNome(''); setEmail(''); setPassword('');
      setShowForm(false);
      loadVendedores();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao criar vendedor');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#031715]">
      <header className="bg-[#041e1b] border-b border-[#0d3330] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin/cartas')} className="text-[#5EB9AA] text-sm hover:text-white">← Gestão</button>
          <p className="text-xs font-extrabold tracking-[0.3em] text-[#C9A84C] uppercase">Usuários</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-[#C9A84C] text-[#031715] text-xs font-bold px-4 py-2 rounded-lg hover:bg-[#d4b560] transition-colors"
        >
          + Novo Vendedor
        </button>
      </header>

      <main className="p-4">
        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {!loading && vendedores.length === 0 && (
          <p className="text-[#5EB9AA] text-sm text-center py-8">Nenhum vendedor cadastrado.</p>
        )}
        {!loading && vendedores.map(v => (
          <div key={v.id} className="bg-[#041e1b] border border-[#0d3330] rounded-xl p-4 mb-3">
            <p className="text-white font-semibold">{v.nome || '—'}</p>
            <p className="text-[#5EB9AA] text-sm">{v.email || '—'}</p>
            <span className="text-xs bg-[#0d3330] text-[#5EB9AA] px-2 py-0.5 rounded mt-1 inline-block">Vendedor</span>
          </div>
        ))}
      </main>

      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(3,23,21,0.9)', backdropFilter: 'blur(4px)' }}
        >
          <div className="bg-[#041e1b] border border-[#1a4a44] rounded-2xl w-full max-w-sm p-6">
            <h2 className="text-white font-bold text-lg mb-6">Novo Vendedor</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-[#5EB9AA] text-xs uppercase tracking-wider">Nome Completo</label>
                <input type="text" value={nome} onChange={e => setNome(e.target.value)} required
                  className="mt-1 w-full bg-[#031715] border border-[#1a4a44] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A84C]" />
              </div>
              <div>
                <label className="text-[#5EB9AA] text-xs uppercase tracking-wider">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  className="mt-1 w-full bg-[#031715] border border-[#1a4a44] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A84C]" />
              </div>
              <div>
                <label className="text-[#5EB9AA] text-xs uppercase tracking-wider">Senha</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
                  className="mt-1 w-full bg-[#031715] border border-[#1a4a44] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A84C]" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 border border-[#1a4a44] text-[#5EB9AA] font-semibold py-2.5 rounded-xl text-sm hover:border-[#5EB9AA] transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 bg-[#C9A84C] text-[#031715] font-bold py-2.5 rounded-xl text-sm disabled:opacity-60 hover:bg-[#d4b560] transition-colors">
                  {submitting ? 'Criando...' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
