import { useMemo } from 'react';
import { Calculator, ChevronLeft, Goal, Percent, ReceiptText } from 'lucide-react';
import BRLInput from '../components/BRLInput';
import { Label } from '../components/shared';
import {
  calculateComissao,
  fmt,
  type ComissaoData,
} from '../lib/calculations';
import { usePersistedState } from '../hooks/usePersistedState';

interface Props {
  onBack: () => void;
}

function ResultBox({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="p-5 rounded-2xl border" style={{ background: 'var(--bg-card)', borderColor: accent ? 'rgba(204,51,102,0.35)' : 'var(--border)' }}>
      <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-secondary)' }}>{label}</p>
      <p className="text-2xl font-black" style={{ fontFamily: 'Montserrat', color: accent ? 'var(--alert)' : 'white' }}>{value}</p>
    </div>
  );
}

export default function ComissaoVendedor({ onBack }: Props) {
  const [data, setData] = usePersistedState<ComissaoData>('prestige:comissao:data', {
    valorCredito: 500000,
    percentComissao: 1,
    numeroParcelas: 1,
    descontoPercent: 30,
    meta: 0,
  });

  const r = useMemo(() => calculateComissao(data), [data]);
  const set = <K extends keyof ComissaoData>(key: K) => (value: ComissaoData[K]) => {
    setData(d => ({ ...d, [key]: value }));
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-black)' }}>
      <nav className="sticky top-0 z-50 border-b" style={{ background: 'rgba(3,23,21,0.9)', backdropFilter: 'blur(12px)', borderColor: 'var(--border)' }}>
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-70" style={{ color: 'var(--text-secondary)' }}>
            <ChevronLeft size={18} /> Voltar
          </button>
          <span className="font-black text-sm text-white">Minha <span style={{ color: 'var(--alert)' }}>Comissão</span></span>
          <div className="w-16" />
        </div>
      </nav>

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="space-y-6">
            <div>
              <Label>Valor do Crédito (R$)</Label>
              <BRLInput value={data.valorCredito} onChange={set('valorCredito')} />
            </div>

            <div className="p-5 rounded-2xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              <div className="flex justify-between items-center mb-3">
                <Label>% Comissão da Administradora</Label>
                <span className="text-sm font-black" style={{ color: 'var(--alert)' }}>{data.percentComissao.toFixed(1)}%</span>
              </div>
              <input type="range" min={0.5} max={3} step={0.1} value={data.percentComissao} onChange={(e) => set('percentComissao')(Number(e.target.value))} className="w-full" />
            </div>

            <div>
              <Label>Pagamento</Label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((n) => (
                  <button
                    key={n}
                    onClick={() => set('numeroParcelas')(n)}
                    className="min-h-[56px] rounded-xl border font-black text-sm"
                    style={{
                      background: data.numeroParcelas === n ? 'rgba(204,51,102,0.16)' : 'var(--bg-card)',
                      borderColor: data.numeroParcelas === n ? 'var(--alert)' : 'var(--border)',
                      color: data.numeroParcelas === n ? 'var(--alert)' : 'white',
                    }}
                  >
                    {n}x
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-2xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              <div className="flex justify-between items-center mb-3">
                <Label>Desconto impostos/ajustes</Label>
                <span className="text-sm font-black" style={{ color: 'var(--alert)' }}>{data.descontoPercent}%</span>
              </div>
              <input type="range" min={0} max={50} step={1} value={data.descontoPercent} onChange={(e) => set('descontoPercent')(Number(e.target.value))} className="w-full" />
            </div>

            <div>
              <Label>Meta mensal do vendedor (opcional)</Label>
              <BRLInput value={data.meta} onChange={set('meta')} />
            </div>
          </div>

          <div className="space-y-4 md:sticky md:top-24">
            <div className="p-8 rounded-3xl border" style={{ background: 'linear-gradient(135deg, rgba(204,51,102,0.18), rgba(10,31,28,0.9))', borderColor: 'rgba(204,51,102,0.35)' }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ background: 'rgba(204,51,102,0.16)', color: 'var(--alert)' }}>
                <ReceiptText size={24} />
              </div>
              <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: 'var(--alert)' }}>Comissão líquida estimada</p>
              <p className="text-5xl font-black text-white" style={{ fontFamily: 'Montserrat' }}>{fmt(r.comissaoLiquida)}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ResultBox label="Comissão bruta" value={fmt(r.comissaoBruta)} />
              <ResultBox label="Parcela recebida" value={fmt(r.parcelaRecebida)} accent />
            </div>

            <div className="p-5 rounded-2xl border flex items-center gap-4" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              <span className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'rgba(204,51,102,0.14)', color: 'var(--alert)' }}>
                {r.vendasParaMeta ? <Goal size={20} /> : <Percent size={20} />}
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-secondary)' }}>
                  {r.vendasParaMeta ? 'Vendas para bater a meta' : 'Meta não informada'}
                </p>
                <p className="text-xl font-black text-white" style={{ fontFamily: 'Montserrat' }}>
                  {r.vendasParaMeta ? `${r.vendasParaMeta} venda${r.vendasParaMeta > 1 ? 's' : ''}` : 'Informe uma meta'}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl border text-xs" style={{ background: 'rgba(204,51,102,0.06)', borderColor: 'rgba(204,51,102,0.2)', color: 'var(--text-secondary)' }}>
              <Calculator size={13} className="inline mr-1.5" style={{ color: 'var(--alert)' }} />
              Cálculo interno estimativo: comissão bruta menos desconto configurado, dividida pelo número de parcelas.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
