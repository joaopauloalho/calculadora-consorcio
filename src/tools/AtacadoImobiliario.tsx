import { useState, useMemo } from 'react';
import { ChevronLeft, Plus, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  calculateAtacadoOperacao,
  calculateAtacadoConsolidado,
  fmt,
  type AtacadoOperacao,
} from '../lib/calculations';
import { Label } from '../components/shared';
import BRLInput from '../components/BRLInput';

interface Props {
  onBack: () => void;
}

function newOperacao(): AtacadoOperacao {
  return {
    id: crypto.randomUUID(),
    valorCarta: 500000,
    mesContemplacao: 30,
    percentVenda: 42,
  };
}

export default function AtacadoImobiliario({ onBack }: Props) {
  const [operacoes, setOperacoes] = useState<AtacadoOperacao[]>([newOperacao()]);

  const results = useMemo(() => operacoes.map(calculateAtacadoOperacao), [operacoes]);
  const consolidado = useMemo(
    () => calculateAtacadoConsolidado(operacoes, results),
    [operacoes, results],
  );

  const addOperacao = () => setOperacoes((ops) => [...ops, newOperacao()]);
  const removeOperacao = (id: string) =>
    setOperacoes((ops) => ops.filter((o) => o.id !== id));
  const updateOperacao = (id: string, patch: Partial<AtacadoOperacao>) =>
    setOperacoes((ops) => ops.map((o) => (o.id === id ? { ...o, ...patch } : o)));

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-black)' }}>
      {/* Nav */}
      <nav
        className="sticky top-0 z-50 border-b"
        style={{
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(12px)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-70"
            style={{ color: 'var(--text-secondary)' }}
          >
            <ChevronLeft size={18} /> Voltar
          </button>
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--gold)' }}
            >
              <Plus size={14} className="text-black" />
            </div>
            <span
              className="font-black text-sm"
              style={{ fontFamily: 'Montserrat', color: 'white' }}
            >
              Atacado <span style={{ color: 'var(--gold)' }}>Imobiliário</span>
            </span>
          </div>
          <div style={{ width: 80 }} />
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 md:px-6 py-10 space-y-6">
        {operacoes.map((op, idx) => {
          const r = results[idx];
          return (
            <OperacaoCard
              key={op.id}
              index={idx}
              op={op}
              result={r}
              canDelete={operacoes.length > 1}
              onChange={(patch) => updateOperacao(op.id, patch)}
              onDelete={() => removeOperacao(op.id)}
            />
          );
        })}

        <button
          onClick={addOperacao}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed font-bold text-sm transition-all hover:opacity-80"
          style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
        >
          <Plus size={16} /> Adicionar Operação
        </button>

        <ConsolidadoPanel
          totalParcelas={consolidado.totalParcelas}
          totalCredito={consolidado.totalCredito}
          totalLucro={consolidado.totalLucro}
          retornoMedioMensal={consolidado.retornoMedioMensal}
        />
      </div>
    </div>
  );
}

/* ── Operation Card ── */

interface OperacaoCardProps {
  index: number;
  op: AtacadoOperacao;
  result: ReturnType<typeof calculateAtacadoOperacao>;
  canDelete: boolean;
  onChange: (patch: Partial<AtacadoOperacao>) => void;
  onDelete: () => void;
}

function OperacaoCard({ index, op, result, canDelete, onChange, onDelete }: OperacaoCardProps) {
  const isLucroPositivo = result.lucro >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border p-6 space-y-6"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--gold)' }}>
          Operação {index + 1}
        </p>
        {canDelete && (
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg transition-opacity hover:opacity-70"
            style={{ color: 'var(--text-secondary)' }}
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <Label>Valor da Carta (R$)</Label>
          <BRLInput
            value={op.valorCarta}
            onChange={(v) => onChange({ valorCarta: v })}
          />
        </div>

        <div>
          <Label>Meia Parcela (automático)</Label>
          <div
            className="px-4 py-3 rounded-xl border text-sm font-bold"
            style={{
              background: 'rgba(0,0,0,0.3)',
              borderColor: 'var(--border)',
              color: 'var(--text-secondary)',
            }}
          >
            {fmt(result.meiaParcela)}
          </div>
        </div>

        <div>
          <Label>Mês de Contemplação: {op.mesContemplacao}</Label>
          <input
            type="range"
            min={1}
            max={220}
            value={op.mesContemplacao}
            onChange={(e) => onChange({ mesContemplacao: Number(e.target.value) })}
            className="w-full mt-1"
          />
          <div className="flex justify-between text-[10px] mt-1" style={{ color: 'var(--text-secondary)' }}>
            <span>1</span>
            <span>220</span>
          </div>
        </div>

        <div>
          <Label>% de Venda do Crédito</Label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={100}
              value={op.percentVenda === 0 ? '' : op.percentVenda}
              onChange={(e) => onChange({ percentVenda: e.target.value === '' ? 0 : Number(e.target.value) })}
              className="flex-1"
            />
            <span className="text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Valor Pago', value: fmt(result.valorPago), sub: `${op.mesContemplacao} × ${fmt(result.meiaParcela)}`, color: 'white' },
          { label: 'Crédito Atualizado', value: fmt(result.creditoAtualizado), sub: 'INCC 4.57% a.a.', color: 'var(--gold)' },
          { label: 'Venda ao Consumidor', value: fmt(result.vendaConsumidor), sub: `${op.percentVenda}% do crédito`, color: 'white' },
          { label: 'Lucro da Operação', value: fmt(result.lucro), sub: null, color: isLucroPositivo ? '#00C864' : 'var(--alert)' },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="p-3 rounded-xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-secondary)' }}>{label}</p>
            <p className="text-sm font-black leading-tight" style={{ fontFamily: 'Montserrat', color }}>{value}</p>
            {sub && <p className="text-[10px] mt-1" style={{ color: 'var(--text-secondary)' }}>{sub}</p>}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ── Consolidado Panel ── */

interface ConsolidadoPanelProps {
  totalParcelas: number;
  totalCredito: number;
  totalLucro: number;
  retornoMedioMensal: number;
}

function ConsolidadoPanel({ totalParcelas, totalCredito, totalLucro, retornoMedioMensal }: ConsolidadoPanelProps) {
  const isLucroPositivo = totalLucro >= 0;

  return (
    <div
      className="p-8 rounded-[2rem] space-y-6"
      style={{
        background: 'linear-gradient(135deg, #0D1A00 0%, #050800 100%)',
        border: '1px solid rgba(193,177,118,0.2)',
      }}
    >
      <p className="text-xs font-black uppercase tracking-widest text-center" style={{ color: 'var(--gold)' }}>
        Consolidado de Todas as Operações
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-secondary)' }}>
            Parcelas / Mês
          </p>
          <p className="text-xl font-black" style={{ fontFamily: 'Montserrat', color: 'white' }}>
            {fmt(totalParcelas)}
          </p>
        </div>

        <div className="text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-secondary)' }}>
            Crédito em Carteira
          </p>
          <p className="text-xl font-black" style={{ fontFamily: 'Montserrat', color: 'var(--gold)' }}>
            {fmt(totalCredito)}
          </p>
        </div>

        <div className="text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-secondary)' }}>
            Lucro Total
          </p>
          <p
            className="text-xl font-black"
            style={{ fontFamily: 'Montserrat', color: isLucroPositivo ? '#00C864' : 'var(--alert)' }}
          >
            {fmt(totalLucro)}
          </p>
        </div>

        <div className="text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-secondary)' }}>
            Retorno Médio
          </p>
          <p className="text-xl font-black" style={{ fontFamily: 'Montserrat', color: 'var(--gold)' }}>
            {retornoMedioMensal.toFixed(2)}% a.m.
          </p>
        </div>
      </div>
    </div>
  );
}
