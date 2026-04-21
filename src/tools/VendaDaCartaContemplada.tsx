import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Repeat2, ChevronLeft,
  TrendingUp, TrendingDown, CalendarDays,
  RefreshCw, DollarSign, Info,
} from 'lucide-react';
import { calculateVendaCarta, fmt, type VendaCartaData } from '../lib/calculations';
import FunilContemplacao from '../components/FunilContemplacao';

const TOTAL_STEPS = 4;

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-secondary)' }}>
      {children}
    </p>
  );
}

function StatCard({ label, value, accent, sub }: { label: string; value: string; accent?: boolean; sub?: string }) {
  return (
    <div className="p-5 rounded-2xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
      <Label>{label}</Label>
      <p className="text-2xl font-black" style={{ fontFamily: 'Montserrat', color: accent ? 'var(--gold)' : 'white' }}>
        {value}
      </p>
      {sub && <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{sub}</p>}
    </div>
  );
}

function GoldInput({ label, value, onChange, suffix }: { label: string; value: number; onChange: (v: number) => void; suffix?: string }) {
  return (
    <div>
      <Label>{label}{suffix ? ` (${suffix})` : ''}</Label>
      <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}

function ProgressDots({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-500"
          style={{
            width: i === step - 1 ? 24 : 8,
            height: 8,
            background: i < step ? 'var(--gold)' : i === step - 1 ? 'var(--gold)' : 'rgba(193,177,118,0.2)',
          }}
        />
      ))}
    </div>
  );
}

function StepHeader({ step, title, subtitle }: { step: number; title: string; subtitle: string }) {
  return (
    <div className="mb-2">
      <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--gold)' }}>
        Etapa {step} de {TOTAL_STEPS}
      </p>
      <h2 className="text-2xl md:text-3xl font-black text-white mb-2" style={{ fontFamily: 'Montserrat' }}>
        {title}
      </h2>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{subtitle}</p>
    </div>
  );
}

interface Props {
  onBack: () => void;
}

export default function VendaDaCartaContemplada({ onBack }: Props) {
  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);
  const [data, setData] = useState<VendaCartaData>({
    valorCredito: 1000000,
    valorParcela: 3000,
    taxaAdm: 0.23,
    prazoTotal: 220,
    mesContemplacao: 30,
    valorVendaChave: 200000,
  });

  const r = calculateVendaCarta(data);
  const set = (key: keyof VendaCartaData) => (v: number) => setData((d) => ({ ...d, [key]: v }));

  const goNext = () => { setDir(1); setStep((s) => Math.min(s + 1, TOTAL_STEPS)); };
  const goPrev = () => { setDir(-1); setStep((s) => Math.max(s - 1, 1)); };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-black)' }}>
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', borderColor: 'var(--border)' }}>
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-70" style={{ color: 'var(--text-secondary)' }}>
            <ChevronLeft size={18} /> Voltar
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--gold)' }}>
              <Repeat2 size={14} className="text-black" />
            </div>
            <span className="font-black text-sm" style={{ fontFamily: 'Montserrat', color: 'white' }}>
              Venda da <span style={{ color: 'var(--gold)' }}>Carta Contemplada</span>
            </span>
          </div>
          <ProgressDots step={step} />
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 md:px-6 py-10">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: 'easeInOut' }}
          >
            {step === 1 && <Step1 data={data} set={set} r={r} />}
            {step === 2 && <Step2 data={data} set={set} r={r} />}
            {step === 3 && <Step3 data={data} set={set} r={r} />}
            {step === 4 && <Step4 data={data} set={set} r={r} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Nav */}
      <div className="sticky bottom-0 border-t px-6 py-4" style={{ background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(12px)', borderColor: 'var(--border)' }}>
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <button
            onClick={step === 1 ? onBack : goPrev}
            className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-opacity hover:opacity-70"
            style={{ color: 'var(--text-secondary)' }}
          >
            <ArrowLeft size={16} /> {step === 1 ? 'Menu' : 'Anterior'}
          </button>

          <span className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
            {step} / {TOTAL_STEPS}
          </span>

          {step < TOTAL_STEPS ? (
            <button
              onClick={goNext}
              className="flex items-center gap-2 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:opacity-90 active:scale-95"
              style={{ background: 'var(--gold)', color: 'black' }}
            >
              Próximo <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-2 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:opacity-90"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'white' }}
            >
              <RefreshCw size={14} /> Reiniciar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Steps ── */

type SetFn = (k: keyof VendaCartaData) => (v: number) => void;
type Results = ReturnType<typeof calculateVendaCarta>;

function Step1({ data, set, r }: { data: VendaCartaData; set: SetFn; r: Results }) {
  const meiaParcela = (data.valorCredito * (1 + data.taxaAdm)) / data.prazoTotal / 2;

  const onCreditoChange = (v: number) => {
    const novaParc = (v * (1 + data.taxaAdm)) / data.prazoTotal / 2;
    set('valorCredito')(v);
    set('valorParcela')(Math.round(novaParc));
  };

  const onParcelaChange = (v: number) => {
    const novoCredito = (v * 2 * data.prazoTotal) / (1 + data.taxaAdm);
    set('valorParcela')(v);
    set('valorCredito')(Math.round(novoCredito));
  };

  return (
    <div className="space-y-8">
      <StepHeader step={1} title="Dados da Cota" subtitle="Preencha o Crédito ou a Meia Parcela — o outro campo é calculado automaticamente." />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <GoldInput label="Valor do Crédito" value={data.valorCredito} onChange={onCreditoChange} suffix="R$" />
        <GoldInput label="Meia Parcela (até contemplar)" value={Math.round(meiaParcela)} onChange={onParcelaChange} suffix="R$" />
        <GoldInput label="Taxa Adm. Total" value={data.taxaAdm * 100} onChange={(v) => { set('taxaAdm')(v / 100); set('valorParcela')(Math.round((data.valorCredito * (1 + v / 100)) / data.prazoTotal / 2)); }} suffix="%" />
        <GoldInput label="Prazo Total do Grupo" value={data.prazoTotal} onChange={(v) => { set('prazoTotal')(v); set('valorParcela')(Math.round((data.valorCredito * (1 + data.taxaAdm)) / v / 2)); }} suffix="meses" />
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-8 rounded-3xl flex justify-between items-center"
        style={{ background: 'linear-gradient(135deg, #1A1A00 0%, #2A2500 100%)', border: '1px solid var(--border)' }}
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--gold)' }}>
            Total a Pagar (c/ Taxa Adm.)
          </p>
          <p className="text-4xl font-black text-white" style={{ fontFamily: 'Montserrat' }}>{fmt(r.totalComTaxa)}</p>
        </div>
        <DollarSign size={32} style={{ color: 'var(--gold)', opacity: 0.5 }} />
      </motion.div>
    </div>
  );
}

function Step2({ data, set, r }: { data: VendaCartaData; set: SetFn; r: Results }) {
  return (
    <div className="space-y-8">
      <StepHeader step={2} title="Simulação de Contemplação" subtitle="Defina o mês estimado em que você será contemplado e veja o capital acumulado." />
      <FunilContemplacao
        prazoTotal={data.prazoTotal}
        mesContemplacao={data.mesContemplacao}
        onChangeMes={set('mesContemplacao')}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          label="Total Desembolsado até Contemplar"
          value={fmt(r.totalDesembolsado)}
          sub={`${data.mesContemplacao} meses × ${fmt(data.valorParcela)}`}
        />
        <StatCard
          label="Saldo Devedor na Contemplação"
          value={fmt(r.saldoDevedorNaContemplacao)}
          sub="Assumido pelo comprador da carta"
        />
      </div>
      <div className="p-5 rounded-2xl border text-sm" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
        <Info size={14} className="inline mr-2" style={{ color: 'var(--gold)' }} />
        Quanto <strong style={{ color: 'white' }}>mais cedo</strong> você for contemplado, menor o capital investido e maior o potencial de ROI — mas o saldo devedor assumido pelo comprador será maior.
      </div>
    </div>
  );
}

function Step3({ data, set, r }: { data: VendaCartaData; set: SetFn; r: Results }) {
  const [agioStr, setAgioStr] = useState('20');
  const agioPercent = parseFloat(agioStr) || 0;

  const onPercentChange = (s: string) => {
    setAgioStr(s);
    const p = parseFloat(s) || 0;
    set('valorVendaChave')(Math.round(data.valorCredito * p / 100));
  };

  return (
    <div className="space-y-8">
      <StepHeader step={3} title="Definição do Ágio" subtitle="Informe o ágio como % do crédito. O comprador paga esse valor e assume o saldo devedor restante." />
      <div className="p-6 rounded-2xl border space-y-5" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <div>
          <Label>Ágio sobre o Crédito (%)</Label>
          <input type="number" value={agioStr} onChange={(e) => onPercentChange(e.target.value)} />
        </div>
        <div className="flex justify-between items-center px-1">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
            Valor em reais
          </span>
          <span className="font-black text-lg" style={{ color: 'var(--gold)', fontFamily: 'Montserrat' }}>
            {fmt(data.valorVendaChave)}
          </span>
        </div>
        <div className="h-px" style={{ background: 'var(--border)' }} />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-secondary)' }}>Você recebe</p>
            <p className="text-xl font-black" style={{ fontFamily: 'Montserrat', color: '#00C864' }}>{fmt(data.valorVendaChave)}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-secondary)' }}>Comprador assume</p>
            <p className="text-xl font-black" style={{ fontFamily: 'Montserrat', color: 'var(--alert)' }}>{fmt(r.saldoDevedorNaContemplacao)}</p>
            <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>saldo devedor</p>
          </div>
        </div>
      </div>
      <div className="p-5 rounded-2xl border text-sm" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
        <Info size={14} className="inline mr-2" style={{ color: 'var(--gold)' }} />
        O <strong style={{ color: 'white' }}>ágio</strong> é o prêmio pela contemplação. O comprador paga {agioPercent}% do crédito ({fmt(data.valorVendaChave)}) e assume as parcelas restantes — ainda assim pagando menos que no banco.
      </div>
    </div>
  );
}

function Step4({ data, set, r }: { data: VendaCartaData; set: SetFn; r: Results }) {
  const isPositive = r.lucroLiquido >= 0;
  return (
    <div className="space-y-8">
      <StepHeader step={4} title="Painel de Rentabilidade" subtitle="Seu retorno sobre o capital investido. Ajuste o mês de contemplação para ver a sensibilidade." />

      <div className="p-6 rounded-2xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <p className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: 'var(--gold)' }}>
          Sensibilidade — Mês da Contemplação
        </p>
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Mês {data.mesContemplacao}</span>
          <span className="text-sm font-bold" style={{ color: 'var(--gold)' }}>Máx: {data.prazoTotal}</span>
        </div>
        <input
          type="range" min={1} max={data.prazoTotal}
          value={data.mesContemplacao}
          onChange={(e) => set('mesContemplacao')(Number(e.target.value))}
          className="w-full"
        />
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="p-3 rounded-xl" style={{ background: 'rgba(193,177,118,0.08)' }}>
            <p className="text-[10px] font-black uppercase mb-1" style={{ color: 'var(--text-secondary)' }}>Invest. Total</p>
            <p className="text-sm font-bold text-white">{fmt(r.totalDesembolsado)}</p>
          </div>
          <div className="p-3 rounded-xl" style={{ background: 'rgba(193,177,118,0.08)' }}>
            <p className="text-[10px] font-black uppercase mb-1" style={{ color: 'var(--text-secondary)' }}>ROI</p>
            <p className="text-sm font-bold" style={{ color: isPositive ? '#00C864' : 'var(--alert)' }}>
              {r.roiAlavancado.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      <motion.div
        key={r.lucroLiquido}
        initial={{ scale: 0.96, opacity: 0.8 }}
        animate={{ scale: 1, opacity: 1 }}
        className="p-8 md:p-12 rounded-[2rem] text-center"
        style={{ background: 'linear-gradient(135deg, #0D1A00 0%, #050800 100%)', border: '1px solid rgba(193,177,118,0.2)' }}
      >
        <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: 'var(--gold)' }}>
          Lucro Líquido da Operação
        </p>
        <motion.p
          key={r.lucroLiquido}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-5xl md:text-7xl font-black mb-8"
          style={{ fontFamily: 'Montserrat', color: isPositive ? 'var(--gold)' : 'var(--alert)' }}
        >
          {fmt(r.lucroLiquido)}
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-8" style={{ borderColor: 'rgba(193,177,118,0.15)' }}>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-secondary)' }}>Capital Investido</p>
            <p className="text-lg font-black text-white" style={{ fontFamily: 'Montserrat' }}>{fmt(r.totalDesembolsado)}</p>
            <div className="flex items-center justify-center gap-1 mt-1">
              <TrendingDown size={12} style={{ color: 'var(--alert)' }} />
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Saiu do bolso</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-secondary)' }}>ROI Total</p>
            <p className="text-lg font-black" style={{ fontFamily: 'Montserrat', color: isPositive ? '#00C864' : 'var(--alert)' }}>
              {r.roiAlavancado.toFixed(1)}%
            </p>
            <div className="flex items-center justify-center gap-1 mt-1">
              <TrendingUp size={12} style={{ color: '#00C864' }} />
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>sobre capital próprio</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-secondary)' }}>Rent. Mensal</p>
            <p className="text-lg font-black" style={{ fontFamily: 'Montserrat', color: 'var(--gold)' }}>
              {r.rentabilidadeMensal.toFixed(2)}% a.m.
            </p>
            <div className="flex items-center justify-center gap-1 mt-1">
              <CalendarDays size={12} style={{ color: 'var(--gold)' }} />
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>capital médio empregado</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mt-8">
          <span className="px-5 py-2 rounded-full text-xs font-black" style={{ background: 'var(--gold-dim)', color: 'var(--gold)', border: '1px solid var(--border)' }}>
            {r.rentabilidadeMensal.toFixed(2)}% a.m.
          </span>
          <span className="px-5 py-2 rounded-full text-xs font-black" style={{ background: 'var(--gold-dim)', color: 'var(--gold)', border: '1px solid var(--border)' }}>
            {data.mesContemplacao} meses de espera
          </span>
        </div>
      </motion.div>
    </div>
  );
}

