import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAllCartasAdmin, deleteCarta } from '../../hooks/useCartas';
import { fetchTodasReservas, updateReservaStatus } from '../../hooks/useReservas';
import { fetchTodasSolicitacoes, updateSolicitacaoStatus } from '../../hooks/useSolicitacoes';
import { CartaForm } from '../../components/CartaForm';
import { formatCurrency, labelTipo, labelStatus, labelStatusReserva, labelStatusSolicitacao } from '../../lib/cartaUtils';
import type { CartaContemplada, Reserva, Solicitacao } from '../../lib/supabaseTypes';
import { toast } from 'sonner';

type Tab = 'cartas' | 'reservas' | 'solicitacoes';

export function AdminCartasPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('cartas');
  const [cartas, setCartas] = useState<CartaContemplada[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCarta, setEditingCarta] = useState<CartaContemplada | undefined>(undefined);

  const pendingReservas = reservas.filter(r => r.status === 'pendente').length;

  async function loadAll() {
    setLoading(true);
    const [c, r, s] = await Promise.all([
      fetchAllCartasAdmin(),
      fetchTodasReservas(),
      fetchTodasSolicitacoes(),
    ]);
    setCartas(c);
    setReservas(r);
    setSolicitacoes(s);
    setLoading(false);
  }

  useEffect(() => { loadAll(); }, []);

  async function handleDelete(id: string) {
    if (!confirm('Excluir esta carta?')) return;
    try {
      await deleteCarta(id);
      toast.success('Carta excluída');
      loadAll();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao excluir');
    }
  }

  async function handleReservaAction(reserva: Reserva, action: 'aprovada' | 'recusada') {
    try {
      await updateReservaStatus(reserva.id, action, reserva.carta_id);
      toast.success(action === 'aprovada' ? 'Reserva aprovada!' : 'Reserva recusada');
      loadAll();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro');
    }
  }

  const tabs: { key: Tab; label: string; badge?: number }[] = [
    { key: 'cartas', label: 'Cartas' },
    { key: 'reservas', label: 'Reservas', badge: pendingReservas || undefined },
    { key: 'solicitacoes', label: 'Solicitações' },
  ];

  return (
    <div className="min-h-screen bg-[#031715]">
      <header className="bg-[#041e1b] border-b border-[#0d3330] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="text-[#5EB9AA] text-sm hover:text-white">← Cockpit</button>
          <p className="text-xs font-extrabold tracking-[0.3em] text-[#C9A84C] uppercase">Gestão de Cartas</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/admin/usuarios')}
            className="text-xs text-[#5EB9AA] border border-[#1a4a44] px-3 py-1.5 rounded-lg hover:text-white hover:border-[#5EB9AA] transition-colors"
          >
            Usuários
          </button>
          {tab === 'cartas' && (
            <button
              onClick={() => { setEditingCarta(undefined); setShowForm(true); }}
              className="bg-[#C9A84C] text-[#031715] text-xs font-bold px-4 py-2 rounded-lg hover:bg-[#d4b560] transition-colors"
            >
              + Nova Carta
            </button>
          )}
        </div>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-[#0d3330]">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-3 text-sm font-semibold transition-colors relative ${
              tab === t.key ? 'text-[#C9A84C] border-b-2 border-[#C9A84C]' : 'text-[#5EB9AA] hover:text-white'
            }`}
          >
            {t.label}
            {t.badge ? (
              <span className="absolute top-2 right-1/4 w-4 h-4 bg-[#C9A84C] text-[#031715] text-[9px] font-bold rounded-full flex items-center justify-center">
                {t.badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      <main className="p-4">
        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && tab === 'cartas' && (
          <div className="space-y-3">
            {cartas.length === 0 && <p className="text-[#5EB9AA] text-sm text-center py-8">Nenhuma carta cadastrada.</p>}
            {cartas.map(c => (
              <div key={c.id} className="bg-[#041e1b] border border-[#0d3330] rounded-xl p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-[#5EB9AA] uppercase tracking-wider">{labelTipo(c.tipo)}</p>
                    <p className="text-white font-bold">{formatCurrency(c.valor_credito)}</p>
                    <p className="text-[#C9A84C] text-sm">{c.percentual_compra}% • {c.prazo_restante}m • {c.administradora}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-xs bg-[#0d3330] text-[#5EB9AA] px-2 py-1 rounded">{labelStatus(c.status)}</span>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingCarta(c); setShowForm(true); }} className="text-xs text-[#5EB9AA] hover:text-white">Editar</button>
                      <button onClick={() => handleDelete(c.id)} className="text-xs text-red-400 hover:text-red-300">Excluir</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && tab === 'reservas' && (
          <div className="space-y-3">
            {reservas.length === 0 && <p className="text-[#5EB9AA] text-sm text-center py-8">Nenhuma reserva.</p>}
            {reservas.map(r => (
              <div key={r.id} className="bg-[#041e1b] border border-[#0d3330] rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-white font-semibold text-sm">{r.clientes?.nome ?? '—'}</p>
                    <p className="text-[#5EB9AA] text-xs">{r.clientes?.telefone ?? ''}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded font-semibold ${
                    r.status === 'pendente' ? 'bg-yellow-500/20 text-yellow-400'
                    : r.status === 'aprovada' ? 'bg-green-500/20 text-green-400'
                    : 'bg-red-500/20 text-red-400'
                  }`}>{labelStatusReserva(r.status)}</span>
                </div>
                {r.cartas_contempladas && (
                  <p className="text-[#C9A84C] text-sm font-semibold mb-2">
                    {labelTipo(r.cartas_contempladas.tipo)} — {formatCurrency(r.cartas_contempladas.valor_credito)}
                  </p>
                )}
                {r.mensagem && <p className="text-[#5EB9AA] text-xs mb-3">"{r.mensagem}"</p>}
                {r.status === 'pendente' && (
                  <div className="flex gap-2">
                    <button onClick={() => handleReservaAction(r, 'aprovada')}
                      className="flex-1 bg-green-700/30 text-green-400 text-xs font-semibold py-2 rounded-lg hover:bg-green-700/50 transition-colors">
                      Aprovar
                    </button>
                    <button onClick={() => handleReservaAction(r, 'recusada')}
                      className="flex-1 bg-red-700/30 text-red-400 text-xs font-semibold py-2 rounded-lg hover:bg-red-700/50 transition-colors">
                      Recusar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!loading && tab === 'solicitacoes' && (
          <div className="space-y-3">
            {solicitacoes.length === 0 && <p className="text-[#5EB9AA] text-sm text-center py-8">Nenhuma solicitação.</p>}
            {solicitacoes.map(s => (
              <div key={s.id} className="bg-[#041e1b] border border-[#0d3330] rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-white font-semibold text-sm">{s.clientes?.nome ?? '—'}</p>
                    <p className="text-[#5EB9AA] text-xs capitalize">{s.tipo}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded font-semibold ${
                    s.status === 'pendente' ? 'bg-yellow-500/20 text-yellow-400'
                    : s.status === 'em_analise' ? 'bg-blue-500/20 text-blue-400'
                    : 'bg-green-500/20 text-green-400'
                  }`}>{labelStatusSolicitacao(s.status)}</span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-xs text-[#5EB9AA] mb-2">
                  {s.valor_credito_min && <p>Crédito mín: {formatCurrency(s.valor_credito_min)}</p>}
                  {s.valor_credito_max && <p>Crédito máx: {formatCurrency(s.valor_credito_max)}</p>}
                  {s.percentual_maximo && <p>% máx: {s.percentual_maximo}%</p>}
                  {s.prazo_maximo && <p>Prazo máx: {s.prazo_maximo}m</p>}
                </div>
                {s.status === 'pendente' && (
                  <button onClick={() => updateSolicitacaoStatus(s.id, 'em_analise').then(loadAll)}
                    className="text-xs text-blue-400 hover:text-blue-300">
                    Marcar em análise
                  </button>
                )}
                {s.status === 'em_analise' && (
                  <button onClick={() => updateSolicitacaoStatus(s.id, 'atendida').then(loadAll)}
                    className="text-xs text-green-400 hover:text-green-300">
                    Marcar atendida
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* CartaForm modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-y-auto py-8"
          style={{ background: 'rgba(3,23,21,0.9)', backdropFilter: 'blur(4px)' }}
        >
          <div className="bg-[#041e1b] border border-[#1a4a44] rounded-2xl w-full max-w-md p-6">
            <h2 className="text-white font-bold text-lg mb-6">
              {editingCarta ? 'Editar carta' : 'Nova carta'}
            </h2>
            <CartaForm
              carta={editingCarta}
              onSaved={() => { setShowForm(false); loadAll(); }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
