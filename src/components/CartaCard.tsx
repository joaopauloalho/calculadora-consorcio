import { formatCurrency, labelTipo } from '../lib/cartaUtils';
import type { CartaContemplada } from '../lib/supabaseTypes';

interface Props {
  carta: CartaContemplada;
  onReservar: () => void;
}

export function CartaCard({ carta, onReservar }: Props) {
  return (
    <div
      onClick={onReservar}
      className="bg-[#041e1b] border border-[#0d3330] rounded-xl p-5 cursor-pointer hover:border-[#1a4a44] transition-colors group"
    >
      <span className="text-xs font-bold tracking-widest uppercase text-[#5EB9AA]">
        {labelTipo(carta.tipo)}
      </span>

      <p className="text-2xl font-extrabold text-white mt-1">
        {formatCurrency(carta.valor_credito)}
      </p>
      <p className="text-xs text-[#5EB9AA] mb-3">crédito disponível</p>

      <div className="flex gap-2 mb-3">
        <span className="bg-[#0d3330] text-[#5EB9AA] text-xs font-semibold px-2 py-1 rounded">
          {carta.prazo_restante} meses
        </span>
        <span className="bg-[#0d3330] text-[#5EB9AA] text-xs font-semibold px-2 py-1 rounded">
          {carta.administradora}
        </span>
      </div>

      <p className="text-sm font-bold text-[#C9A84C] mb-4">
        {carta.percentual_compra}% = {formatCurrency(carta.valor_compra)}
      </p>

      <button
        onClick={e => { e.stopPropagation(); onReservar(); }}
        className="w-full bg-[#C9A84C]/15 border border-[#C9A84C]/30 text-[#C9A84C] text-sm font-bold py-2 rounded-lg group-hover:bg-[#C9A84C]/25 transition-colors"
      >
        Reservar
      </button>
    </div>
  );
}
