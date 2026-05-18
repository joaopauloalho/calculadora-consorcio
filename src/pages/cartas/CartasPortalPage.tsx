import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCartas } from '../../hooks/useCartas';
import { CartaCard } from '../../components/CartaCard';
import { CartaModal } from '../../components/CartaModal';
import { SolicitacaoModal } from '../../components/SolicitacaoModal';
import type { CartaContemplada, CartaFiltros } from '../../lib/supabaseTypes';

export function CartasPortalPage() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [filtros, setFiltros] = useState<CartaFiltros>({});
  const [tipoFilter, setTipoFilter] = useState<'todos' | 'imovel' | 'veicular'>('todos');
  const [cartaSelecionada, setCartaSelecionada] = useState<CartaContemplada | null>(null);
  const [showSolicitacao, setShowSolicitacao] = useState(false);

  const filtrosQuery: CartaFiltros = {
    ...filtros,
    tipo: tipoFilter !== 'todos' ? tipoFilter : undefined,
  };

  const { cartas, loading, refetch } = useCartas(filtrosQuery);

  async function handleSignOut() {
    await signOut();
    navigate('/cartas', { replace: true });
  }

  return (
    <div className="min-h-screen bg-[#031715]">
      {/* Header */}
      <header className="bg-[#041e1b] border-b border-[#0d3330] px-4 py-3 flex items-center justify-between">
        <p className="text-xs font-extrabold tracking-[0.3em] text-[#C9A84C] uppercase">PRESTIGE</p>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/cartas/dashboard')}
            className="text-[#5EB9AA] text-sm hover:text-white transition-colors"
          >
            Minha Área
          </button>
          <button
            onClick={handleSignOut}
            className="text-xs text-[#5EB9AA] hover:text-white transition-colors"
          >
            Sair
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="px-4 py-4 border-b border-[#0d3330] space-y-3">
        <div className="flex gap-2">
          {(['todos', 'imovel', 'veicular'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTipoFilter(t)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                tipoFilter === t
                  ? 'bg-[#C9A84C] text-[#031715]'
                  : 'bg-[#0d3330] text-[#5EB9AA] hover:bg-[#1a4a44]'
              }`}
            >
              {t === 'todos' ? 'Todos' : t === 'imovel' ? 'Imóvel' : 'Veicular'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-[#5EB9AA]">Crédito mín.</label>
            <input
              type="number"
              placeholder="R$ 0"
              onChange={e => setFiltros(f => ({ ...f, valorCreditoMin: e.target.value ? Number(e.target.value) : undefined }))}
              className="mt-1 w-full bg-[#031715] border border-[#1a4a44] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-[#C9A84C]"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-[#5EB9AA]">Crédito máx.</label>
            <input
              type="number"
              placeholder="R$ 999k"
              onChange={e => setFiltros(f => ({ ...f, valorCreditoMax: e.target.value ? Number(e.target.value) : undefined }))}
              className="mt-1 w-full bg-[#031715] border border-[#1a4a44] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-[#C9A84C]"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-[#5EB9AA]">% máx compra</label>
            <input
              type="number"
              placeholder="60"
              min="0" max="100"
              onChange={e => setFiltros(f => ({ ...f, percentualMaximo: e.target.value ? Number(e.target.value) : undefined }))}
              className="mt-1 w-full bg-[#031715] border border-[#1a4a44] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-[#C9A84C]"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-[#5EB9AA]">Prazo máx. (m)</label>
            <input
              type="number"
              placeholder="120"
              onChange={e => setFiltros(f => ({ ...f, prazoMaximo: e.target.value ? Number(e.target.value) : undefined }))}
              className="mt-1 w-full bg-[#031715] border border-[#1a4a44] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-[#C9A84C]"
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      <main className="p-4 pb-24">
        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && cartas.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[#5EB9AA] text-sm">Nenhuma carta encontrada com esses filtros.</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {cartas.map(carta => (
            <CartaCard
              key={carta.id}
              carta={carta}
              onReservar={() => setCartaSelecionada(carta)}
            />
          ))}
        </div>
      </main>

      {/* FAB */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center">
        <button
          onClick={() => setShowSolicitacao(true)}
          className="bg-[#041e1b] border border-[#1a4a44] text-[#C9A84C] text-sm font-semibold px-6 py-3 rounded-full shadow-xl hover:bg-[#0d3330] transition-colors"
        >
          Não encontrou? Solicitar carta
        </button>
      </div>

      {/* Modals */}
      {cartaSelecionada && (
        <CartaModal
          carta={cartaSelecionada}
          onClose={() => setCartaSelecionada(null)}
          onReservaFeita={refetch}
        />
      )}

      {showSolicitacao && (
        <SolicitacaoModal onClose={() => setShowSolicitacao(false)} />
      )}
    </div>
  );
}
