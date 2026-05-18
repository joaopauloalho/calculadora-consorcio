import { useState } from 'react';
import { toast } from 'sonner';
import { createReserva } from '../hooks/useReservas';
import { formatCurrency, labelTipo } from '../lib/cartaUtils';
import type { CartaContemplada } from '../lib/supabaseTypes';

interface Props {
  carta: CartaContemplada;
  onClose: () => void;
  onReservaFeita: () => void;
}

export function CartaModal({ carta, onClose, onReservaFeita }: Props) {
  const [mensagem, setMensagem] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleReservar() {
    setSubmitting(true);
    try {
      await createReserva(carta.id, mensagem || null);
      toast.success('Reserva enviada! Entraremos em contato.');
      onReservaFeita();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao reservar');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(3,23,21,0.85)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="bg-[#041e1b] border border-[#1a4a44] rounded-2xl w-full max-w-md p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs font-bold tracking-widest uppercase text-[#5EB9AA]">
            {labelTipo(carta.tipo)}
          </span>
          <button onClick={onClose} className="text-[#5EB9AA] hover:text-white text-lg">✕</button>
        </div>

        <p className="text-3xl font-extrabold text-white">{formatCurrency(carta.valor_credito)}</p>
        <p className="text-[#C9A84C] font-bold text-base mb-5">
          Entrada: {formatCurrency(carta.valor_compra)} ({carta.percentual_compra}% do crédito)
        </p>

        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            { label: 'Prazo restante', value: `${carta.prazo_restante} meses` },
            { label: 'Parcela mensal', value: carta.parcela_mensal ? formatCurrency(carta.parcela_mensal) : '—' },
            { label: 'Administradora', value: carta.administradora },
            { label: '% do crédito', value: `${carta.percentual_compra}%` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-[#0d3330] rounded-lg p-3">
              <p className="text-[10px] uppercase tracking-wider text-[#5EB9AA]">{label}</p>
              <p className="text-sm font-bold text-white mt-0.5">{value}</p>
            </div>
          ))}
        </div>

        {carta.descricao && (
          <p className="text-sm text-[#5EB9AA] mb-4">{carta.descricao}</p>
        )}

        <div className="mb-4">
          <label className="text-[#5EB9AA] text-xs uppercase tracking-wider">
            Mensagem / proposta (opcional)
          </label>
          <textarea
            value={mensagem}
            onChange={e => setMensagem(e.target.value)}
            rows={3}
            className="mt-1 w-full bg-[#031715] border border-[#1a4a44] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A84C] resize-none"
            placeholder="Ex: Posso pagar à vista, tenho urgência..."
          />
        </div>

        <button
          onClick={handleReservar}
          disabled={submitting}
          className="w-full bg-[#C9A84C] text-[#031715] font-bold py-3 rounded-xl disabled:opacity-60 hover:bg-[#d4b560] transition-colors"
        >
          {submitting ? 'Enviando...' : 'Confirmar Reserva'}
        </button>
      </div>
    </div>
  );
}
