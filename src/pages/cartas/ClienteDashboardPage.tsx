import { useNavigate } from 'react-router-dom';
import { useMinhasReservas } from '../../hooks/useReservas';
import { useMinhasSolicitacoes } from '../../hooks/useSolicitacoes';
import { formatCurrency, labelTipo, labelStatusReserva, labelStatusSolicitacao } from '../../lib/cartaUtils';

const reservaStatusColor: Record<string, string> = {
  pendente: 'bg-yellow-500/20 text-yellow-400',
  aprovada: 'bg-green-500/20 text-green-400',
  recusada: 'bg-red-500/20 text-red-400',
};

const solicitacaoStatusColor: Record<string, string> = {
  pendente: 'bg-yellow-500/20 text-yellow-400',
  em_analise: 'bg-blue-500/20 text-blue-400',
  atendida: 'bg-green-500/20 text-green-400',
};

export function ClienteDashboardPage() {
  const navigate = useNavigate();
  const { reservas, loading: rLoading } = useMinhasReservas();
  const { solicitacoes, loading: sLoading } = useMinhasSolicitacoes();

  return (
    <div className="min-h-screen bg-[#031715]">
      <header className="bg-[#041e1b] border-b border-[#0d3330] px-4 py-3 flex items-center justify-between">
        <p className="text-xs font-extrabold tracking-[0.3em] text-[#C9A84C] uppercase">PRESTIGE</p>
        <button
          onClick={() => navigate('/cartas/portal')}
          className="text-[#5EB9AA] text-sm hover:text-white transition-colors"
        >
          ← Ver cartas
        </button>
      </header>

      <main className="p-4 space-y-8">
        {/* Reservas */}
        <section>
          <h2 className="text-white font-bold text-base mb-4">Minhas Reservas</h2>
          {rLoading && <p className="text-[#5EB9AA] text-sm">Carregando...</p>}
          {!rLoading && reservas.length === 0 && (
            <p className="text-[#5EB9AA] text-sm">Nenhuma reserva ainda.</p>
          )}
          <div className="space-y-3">
            {reservas.map(r => (
              <div key={r.id} className="bg-[#041e1b] border border-[#0d3330] rounded-xl p-4">
                <div className="flex justify-between items-start">
                  <div>
                    {r.cartas_contempladas && (
                      <>
                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-[#0d3330] text-[#5EB9AA] uppercase tracking-wider">
                          {labelTipo(r.cartas_contempladas.tipo)}
                        </span>
                        <p className="text-white font-bold text-lg mt-2">
                          {formatCurrency(r.cartas_contempladas.valor_credito)}
                        </p>
                        <p className="text-[#C9A84C] text-sm font-semibold">
                          {r.cartas_contempladas.percentual_compra}% = {formatCurrency(r.cartas_contempladas.valor_compra)}
                        </p>
                      </>
                    )}
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${reservaStatusColor[r.status]}`}>
                    {labelStatusReserva(r.status)}
                  </span>
                </div>
                {r.mensagem && <p className="text-[#5EB9AA] text-xs mt-2">"{r.mensagem}"</p>}
              </div>
            ))}
          </div>
        </section>

        {/* Solicitações */}
        <section>
          <h2 className="text-white font-bold text-base mb-4">Minhas Solicitações</h2>
          {sLoading && <p className="text-[#5EB9AA] text-sm">Carregando...</p>}
          {!sLoading && solicitacoes.length === 0 && (
            <p className="text-[#5EB9AA] text-sm">Nenhuma solicitação ainda.</p>
          )}
          <div className="space-y-3">
            {solicitacoes.map(s => (
              <div key={s.id} className="bg-[#041e1b] border border-[#0d3330] rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-white font-semibold capitalize">{s.tipo}</p>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${solicitacaoStatusColor[s.status]}`}>
                    {labelStatusSolicitacao(s.status)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-[#5EB9AA]">
                  {s.valor_credito_min && <p>Crédito mín: {formatCurrency(s.valor_credito_min)}</p>}
                  {s.valor_credito_max && <p>Crédito máx: {formatCurrency(s.valor_credito_max)}</p>}
                  {s.percentual_maximo && <p>% máx: {s.percentual_maximo}%</p>}
                  {s.prazo_maximo && <p>Prazo máx: {s.prazo_maximo}m</p>}
                </div>
                {s.observacoes && <p className="text-[#5EB9AA] text-xs mt-2">"{s.observacoes}"</p>}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
