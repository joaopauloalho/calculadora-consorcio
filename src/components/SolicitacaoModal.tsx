import { useState } from 'react';
import { toast } from 'sonner';
import { createSolicitacao } from '../hooks/useSolicitacoes';
import type { Solicitacao } from '../lib/supabaseTypes';

interface Props {
  onClose: () => void;
}

type Tipo = Solicitacao['tipo'];

export function SolicitacaoModal({ onClose }: Props) {
  const [tipo, setTipo] = useState<Tipo>('imovel');
  const [valorMin, setValorMin] = useState('');
  const [valorMax, setValorMax] = useState('');
  const [percentualMaximo, setPercentualMaximo] = useState('');
  const [prazoMaximo, setPrazoMaximo] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleEnviar(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createSolicitacao({
        tipo,
        valor_credito_min: valorMin ? Number(valorMin) : null,
        valor_credito_max: valorMax ? Number(valorMax) : null,
        percentual_maximo: percentualMaximo ? Number(percentualMaximo) : null,
        prazo_maximo: prazoMaximo ? Number(prazoMaximo) : null,
        observacoes: observacoes || null,
      });
      toast.success('Solicitação enviada! Entraremos em contato.');
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao enviar');
    } finally {
      setSubmitting(false);
    }
  }

  const tipoOptions: { value: Tipo; label: string }[] = [
    { value: 'imovel', label: 'Imóvel' },
    { value: 'veicular', label: 'Veicular' },
    { value: 'ambos', label: 'Ambos' },
  ];

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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-white font-bold text-lg">Solicitar carta</h2>
          <button onClick={onClose} className="text-[#5EB9AA] hover:text-white text-lg">✕</button>
        </div>

        <form onSubmit={handleEnviar} className="space-y-4">
          <div>
            <label className="text-[#5EB9AA] text-xs uppercase tracking-wider">Tipo desejado</label>
            <div className="flex gap-2 mt-2">
              {tipoOptions.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTipo(opt.value)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    tipo === opt.value
                      ? 'bg-[#C9A84C] text-[#031715]'
                      : 'bg-[#0d3330] text-[#5EB9AA] hover:bg-[#1a4a44]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[#5EB9AA] text-xs uppercase tracking-wider">Crédito mín. R$</label>
              <input
                type="number"
                value={valorMin}
                onChange={e => setValorMin(e.target.value)}
                className="mt-1 w-full bg-[#031715] border border-[#1a4a44] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#C9A84C]"
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-[#5EB9AA] text-xs uppercase tracking-wider">Crédito máx. R$</label>
              <input
                type="number"
                value={valorMax}
                onChange={e => setValorMax(e.target.value)}
                className="mt-1 w-full bg-[#031715] border border-[#1a4a44] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#C9A84C]"
                placeholder="999999"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[#5EB9AA] text-xs uppercase tracking-wider">% máx de compra</label>
              <input
                type="number"
                value={percentualMaximo}
                onChange={e => setPercentualMaximo(e.target.value)}
                min="0" max="100"
                className="mt-1 w-full bg-[#031715] border border-[#1a4a44] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#C9A84C]"
                placeholder="50"
              />
            </div>
            <div>
              <label className="text-[#5EB9AA] text-xs uppercase tracking-wider">Prazo máx. (meses)</label>
              <input
                type="number"
                value={prazoMaximo}
                onChange={e => setPrazoMaximo(e.target.value)}
                className="mt-1 w-full bg-[#031715] border border-[#1a4a44] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#C9A84C]"
                placeholder="60"
              />
            </div>
          </div>

          <div>
            <label className="text-[#5EB9AA] text-xs uppercase tracking-wider">Observações</label>
            <textarea
              value={observacoes}
              onChange={e => setObservacoes(e.target.value)}
              rows={3}
              className="mt-1 w-full bg-[#031715] border border-[#1a4a44] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A84C] resize-none"
              placeholder="Urgência, localização preferida, etc."
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#C9A84C] text-[#031715] font-bold py-3 rounded-xl disabled:opacity-60 hover:bg-[#d4b560] transition-colors"
          >
            {submitting ? 'Enviando...' : 'Enviar Solicitação'}
          </button>
        </form>
      </div>
    </div>
  );
}
