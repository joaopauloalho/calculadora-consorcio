import { useState } from 'react';
import { createCarta, updateCarta } from '../hooks/useCartas';
import { calcValorCompra, formatCurrency } from '../lib/cartaUtils';
import type { CartaContemplada } from '../lib/supabaseTypes';
import { toast } from 'sonner';

type CartaInput = Omit<CartaContemplada, 'id' | 'created_at' | 'created_by' | 'valor_compra'>;

interface Props {
  carta?: CartaContemplada;
  onSaved: () => void;
  onCancel: () => void;
}

export function CartaForm({ carta, onSaved, onCancel }: Props) {
  const [tipo, setTipo] = useState<'imovel' | 'veicular'>(carta?.tipo ?? 'imovel');
  const [valorCredito, setValorCredito] = useState(carta?.valor_credito?.toString() ?? '');
  const [percentualCompra, setPercentualCompra] = useState(carta?.percentual_compra?.toString() ?? '');
  const [prazoRestante, setPrazoRestante] = useState(carta?.prazo_restante?.toString() ?? '');
  const [parcelaMensal, setParcelaMensal] = useState(carta?.parcela_mensal?.toString() ?? '');
  const [administradora, setAdministradora] = useState(carta?.administradora ?? '');
  const [descricao, setDescricao] = useState(carta?.descricao ?? '');
  const [status, setStatus] = useState<CartaContemplada['status']>(carta?.status ?? 'disponivel');
  const [submitting, setSubmitting] = useState(false);

  const valorCompraPreview = valorCredito && percentualCompra
    ? calcValorCompra(Number(valorCredito), Number(percentualCompra))
    : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const payload: CartaInput = {
      tipo,
      valor_credito: Number(valorCredito),
      percentual_compra: Number(percentualCompra),
      prazo_restante: Number(prazoRestante),
      parcela_mensal: parcelaMensal ? Number(parcelaMensal) : null,
      administradora,
      descricao: descricao || null,
      status,
    };
    try {
      if (carta) {
        await updateCarta(carta.id, payload);
        toast.success('Carta atualizada!');
      } else {
        await createCarta(payload);
        toast.success('Carta criada!');
      }
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass = "mt-1 w-full bg-[#031715] border border-[#1a4a44] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#C9A84C]";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-[#5EB9AA] text-xs uppercase tracking-wider">Tipo</label>
        <div className="flex gap-2 mt-2">
          {(['imovel', 'veicular'] as const).map(t => (
            <button key={t} type="button" onClick={() => setTipo(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                tipo === t ? 'bg-[#C9A84C] text-[#031715]' : 'bg-[#0d3330] text-[#5EB9AA] hover:bg-[#1a4a44]'
              }`}>
              {t === 'imovel' ? 'Imóvel' : 'Veicular'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[#5EB9AA] text-xs uppercase tracking-wider">Valor do crédito</label>
          <input type="number" required value={valorCredito} onChange={e => setValorCredito(e.target.value)} className={inputClass} placeholder="280000" />
        </div>
        <div>
          <label className="text-[#5EB9AA] text-xs uppercase tracking-wider">
            % de compra
            {valorCompraPreview && <span className="text-[#C9A84C] ml-2">= {formatCurrency(valorCompraPreview)}</span>}
          </label>
          <input type="number" required value={percentualCompra} onChange={e => setPercentualCompra(e.target.value)} min="0" max="100" step="0.01" className={inputClass} placeholder="36" />
        </div>
        <div>
          <label className="text-[#5EB9AA] text-xs uppercase tracking-wider">Prazo restante (meses)</label>
          <input type="number" required value={prazoRestante} onChange={e => setPrazoRestante(e.target.value)} className={inputClass} placeholder="48" />
        </div>
        <div>
          <label className="text-[#5EB9AA] text-xs uppercase tracking-wider">Parcela mensal</label>
          <input type="number" value={parcelaMensal} onChange={e => setParcelaMensal(e.target.value)} className={inputClass} placeholder="1240" />
        </div>
      </div>

      <div>
        <label className="text-[#5EB9AA] text-xs uppercase tracking-wider">Administradora</label>
        <input type="text" required value={administradora} onChange={e => setAdministradora(e.target.value)} className={inputClass} placeholder="Caixa, Bradesco..." />
      </div>

      <div>
        <label className="text-[#5EB9AA] text-xs uppercase tracking-wider">Descrição (opcional)</label>
        <textarea value={descricao} onChange={e => setDescricao(e.target.value)} rows={3} className={`${inputClass} resize-none`} />
      </div>

      <div>
        <label className="text-[#5EB9AA] text-xs uppercase tracking-wider">Status</label>
        <div className="flex gap-2 mt-2">
          {(['disponivel', 'reservada', 'vendida'] as const).map(s => (
            <button key={s} type="button" onClick={() => setStatus(s)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold capitalize transition-colors ${
                status === s ? 'bg-[#C9A84C] text-[#031715]' : 'bg-[#0d3330] text-[#5EB9AA] hover:bg-[#1a4a44]'
              }`}>
              {s === 'disponivel' ? 'Disponível' : s === 'reservada' ? 'Reservada' : 'Vendida'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel}
          className="flex-1 bg-[#0d3330] text-[#5EB9AA] font-semibold py-3 rounded-xl hover:bg-[#1a4a44] transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={submitting}
          className="flex-1 bg-[#C9A84C] text-[#031715] font-bold py-3 rounded-xl disabled:opacity-60 hover:bg-[#d4b560] transition-colors">
          {submitting ? 'Salvando...' : carta ? 'Atualizar' : 'Criar carta'}
        </button>
      </div>
    </form>
  );
}
