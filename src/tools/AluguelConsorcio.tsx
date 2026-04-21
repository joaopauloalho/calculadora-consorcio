import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Home, ChevronLeft,
  TrendingUp, TrendingDown, CalendarDays,
  RefreshCw, CheckCircle2, AlertCircle, Repeat2, Info,
} from 'lucide-react';
import { calculateAluguel, fmt, type AluguelData } from '../lib/calculations';
import FunilContemplacao from '../components/FunilContemplacao';

const TOTAL_STEPS = 5;

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

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="p-5 rounded-2xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
      <Label>{label}</Label>
      <p className="text-2xl font-black" style={{ fontFamily: 'Montserrat', color: color ?? 'white' }}>{value}</p>
      {sub && <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{sub}</p>}
    </div>
  );
}

function GoldInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        type="number"
        value={value === 0 ? '' : value}
        onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
      />
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

export default function AluguelConsorcio({ onBack }: Props) {
  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);
  const [data, setData] = useState<AluguelData>({
    valorCredito: 500000,
    taxaAdm: 0.23,
    prazoTotal: 180,
    mesContemplacao: 30,
    valorImovelFinal: 600000,
    rendimentoPercent: 0.005,
    numOperacoes: 3,
  });

  const r = calculateAluguel(data);
  const set = (key: keyof AluguelData) => (v: number) => setData((d) => ({ ...d, [key]: v }));

  const goNext = () => { setDir(1); setStep((s) => Math.min(s + 1, TOTAL_STEPS)); };
  const goPrev = () => { setDir(-1); setStep((s) => Math.max(s - 1, 1)); };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-black)' }}>
      <nav className="sticky top-0 z-50 border-b" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', borderColor: 'var(--border)' }}>
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-70" style={{ color: 'var(--text-secondary)' }}>
            <ChevronLeft size={18} /> Voltar
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--gold)' }}>
              <Home size={14} className="text-black" />
            </div>
            <span className="font-black text-sm" style={{ fontFamily: 'Montserrat', color: 'white' }}>
              Aluguel com <span style={{ color: 'var(--gold)' }}>Consórcio</span>
            </span>
          </div>
          <ProgressDots step={step} />
        </div>
      </nav>

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
            {step === 4 && <Step4 data={data} r={r} />}
            {step === 5 && <Step5 data={data} set={set} r={r} />}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="sticky bottom-0 border-t px-6 py-4" style={{ background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(12px)', borderColor: 'var(--border)' }}>
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <button
            onClick={step === 1 ? onBack : goPrev}
            className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-opacity hover:opacity-70"
            style={{ color: 'var(--text-secondary)' }}
          >
            <ArrowLeft size={16} /> {step === 1 ? 'Menu' : 'Anterior'}
          </button>
          <span className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>{step} / {TOTAL_STEPS}</span>
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

type SetFn = (k: keyof AluguelData) => (v: number) => void;
type Results = ReturnType<typeof calculateAluguel>;

function Step1({ data, set, r }: { data: AluguelData; set: SetFn; r: Results }) {
  return (
    <div className="space-y-8">
      <StepHeader step={1} title="Dados do Crédito" subtitle="Defina o crédito e veja as duas parcelas: meia (até contemplar) e cheia (após contemplação, quando o imóvel já rende)." />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <GoldInput label="Valor do Crédito (R$)" value={data.valorCredito} onChange={set('valorCredito')} />
        <GoldInput label="Taxa Adm. Total (%)" value={data.taxaAdm * 100} onChange={(v) => set('taxaAdm')(v / 100)} />
        <GoldInput label="Prazo Total (meses)" value={data.prazoTotal} onChange={set('prazoTotal')} />
      </div>

      {/* Parcelas side by side */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-6 rounded-2xl border" style={{ background: '#1A1100', borderColor: 'rgba(255,165,0,0.25)' }}>
          <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: '#F0A500' }}>
            Meia Parcela
          </p>
          <p className="text-3xl font-black text-white" style={{ fontFamily: 'Montserrat' }}>{fmt(r.meiaParcela)}</p>
          <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>Até ser contemplado</p>
        </div>
        <div className="p-6 rounded-2xl border" style={{ background: '#0D0D1A', borderColor: 'rgba(204,51,102,0.25)' }}>
          <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--alert)' }}>
            Parcela Cheia
          </p>
          <p className="text-3xl font-black text-white" style={{ fontFamily: 'Montserrat' }}>{fmt(r.parcelaCheia)}</p>
          <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>Pós-contemplação (com imóvel)</p>
        </div>
      </div>

      <div className="p-5 rounded-2xl border text-sm" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
        <Info size={14} className="inline mr-2" style={{ color: 'var(--gold)' }} />
        Após contemplação, você paga a <strong style={{ color: 'white' }}>parcela cheia</strong> — mas o imóvel já está gerando aluguel. O objetivo é que o aluguel supere a parcela cheia, criando um fluxo positivo.
      </div>
    </div>
  );
}

function Step2({ data, set, r }: { data: AluguelData; set: SetFn; r: Results }) {
  return (
    <div className="space-y-8">
      <StepHeader step={2} title="Simulação de Contemplação" subtitle="Defina o mês estimado de contemplação e veja o capital aportado até o imóvel ficar pronto." />

      <FunilContemplacao
        prazoTotal={data.prazoTotal}
        mesContemplacao={data.mesContemplacao}
        onChangeMes={set('mesContemplacao')}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          label="Total Aportado até Contemplar"
          value={fmt(r.totalDesembolsado)}
          sub={`${data.mesContemplacao} meses × ${fmt(r.meiaParcela)}`}
          color="var(--gold)"
        />
        <StatCard
          label="Saldo Devedor na Contemplação"
          value={fmt(r.saldoDevedorNaContemplacao)}
          sub="Parcelas restantes do grupo"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-6 rounded-2xl"
        style={{ background: 'linear-gradient(135deg, #1A1A00, #0D0D00)', border: '1px solid var(--border)' }}
      >
        <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: 'var(--gold)' }}>
          Total a Pagar ao Grupo (c/ taxa)
        </p>
        <p className="text-4xl font-black text-white" style={{ fontFamily: 'Montserrat' }}>{fmt(r.totalComTaxa)}</p>
        <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
          Dividido em {data.prazoTotal} meses · Parcela cheia: {fmt(r.parcelaCheia)}/mês
        </p>
      </motion.div>
    </div>
  );
}

function Step3({ data, set, r }: { data: AluguelData; set: SetFn; r: Results }) {
  const [rendStr, setRendStr] = useState(String((data.rendimentoPercent * 100).toFixed(2)));

  const onRendChange = (s: string) => {
    setRendStr(s);
    const v = parseFloat(s) || 0;
    set('rendimentoPercent')(v / 100);
  };

  return (
    <div className="space-y-8">
      <StepHeader step={3} title="Imóvel e Rendimento" subtitle="Informe o valor final do imóvel após obra ou reforma, e a taxa de aluguel mensal esperada." />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <GoldInput label="Valor Final do Imóvel (R$)" value={data.valorImovelFinal} onChange={set('valorImovelFinal')} />
        <div>
          <Label>Taxa de Aluguel (% a.m.)</Label>
          <input type="number" value={rendStr} onChange={(e) => onRendChange(e.target.value)} step="0.01" />
        </div>
      </div>

      <motion.div
        key={r.aluguelMensal}
        initial={{ scale: 0.97, opacity: 0.8 }}
        animate={{ scale: 1, opacity: 1 }}
        className="p-8 rounded-3xl flex justify-between items-center"
        style={{ background: 'linear-gradient(135deg, #001A0A, #000D05)', border: '1px solid rgba(0,200,100,0.3)' }}
      >
        <div>
          <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: '#00C864' }}>
            Aluguel Mensal Estimado
          </p>
          <p className="text-5xl font-black text-white" style={{ fontFamily: 'Montserrat' }}>{fmt(r.aluguelMensal)}</p>
          <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
            {(data.rendimentoPercent * 100).toFixed(2)}% de {fmt(data.valorImovelFinal)}
          </p>
        </div>
        <TrendingUp size={40} style={{ color: '#00C864', opacity: 0.4 }} />
      </motion.div>

      <div className="p-5 rounded-2xl border text-sm" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
        <Info size={14} className="inline mr-2" style={{ color: 'var(--gold)' }} />
        Referência de mercado: imóveis residenciais rendem entre <strong style={{ color: 'white' }}>0,35% e 0,60% a.m.</strong> Comerciais podem chegar a 0,80%.
      </div>
    </div>
  );
}

function Step4({ data, r }: { data: AluguelData; r: Results }) {
  const autofinanciado = r.saldoComReplicacao >= 0;
  const parcialmenteAutofinanciado = r.saldoLivreBasico >= 0 && !autofinanciado;
  const negativo = r.saldoLivreBasico < 0;

  return (
    <div className="space-y-6">
      <StepHeader step={4} title="Fluxo Mensal e Replicação" subtitle="Comparativo entre o aluguel recebido e as parcelas pagas. Veja se a operação se auto-financia." />

      {/* Aluguel vs Parcela Cheia */}
      <div className="rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
        <div className="px-5 py-3" style={{ background: 'rgba(193,177,118,0.08)' }}>
          <p className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--gold)' }}>Fluxo de Caixa Mensal</p>
        </div>
        <div className="grid grid-cols-2">
          <div className="p-6" style={{ background: '#001A0A' }}>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 size={14} style={{ color: '#00C864' }} />
              <span className="text-xs font-bold text-white">Aluguel Recebido</span>
            </div>
            <p className="text-3xl font-black" style={{ fontFamily: 'Montserrat', color: '#00C864' }}>{fmt(r.aluguelMensal)}</p>
            <p className="text-[10px] mt-1" style={{ color: 'var(--text-secondary)' }}>entrada mensal</p>
          </div>
          <div className="p-6 border-l" style={{ background: '#1A0005', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle size={14} style={{ color: 'var(--alert)' }} />
              <span className="text-xs font-bold text-white">Parcela Cheia</span>
            </div>
            <p className="text-3xl font-black" style={{ fontFamily: 'Montserrat', color: 'var(--alert)' }}>{fmt(r.parcelaCheia)}</p>
            <p className="text-[10px] mt-1" style={{ color: 'var(--text-secondary)' }}>saída mensal</p>
          </div>
        </div>
        <div className="px-5 py-4 border-t" style={{ background: 'rgba(0,0,0,0.5)', borderColor: 'var(--border)' }}>
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Saldo livre mensal</span>
            <span className="text-xl font-black" style={{ fontFamily: 'Montserrat', color: negativo ? 'var(--alert)' : '#00C864' }}>
              {r.saldoLivreBasico >= 0 ? '+' : ''}{fmt(r.saldoLivreBasico)}
            </span>
          </div>
        </div>
      </div>

      {/* Cenário de replicação */}
      <div className="p-6 rounded-2xl border space-y-4" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <p className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--gold)' }}>
          Capacidade de Replicação
        </p>

        {/* Linha: aluguel - cheia - meia */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span style={{ color: 'var(--text-secondary)' }}>Aluguel</span>
            <span className="font-bold" style={{ color: '#00C864' }}>+ {fmt(r.aluguelMensal)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span style={{ color: 'var(--text-secondary)' }}>Parcela cheia (Op. atual)</span>
            <span className="font-bold" style={{ color: 'var(--alert)' }}>− {fmt(r.parcelaCheia)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span style={{ color: 'var(--text-secondary)' }}>Meia parcela (nova Op.)</span>
            <span className="font-bold" style={{ color: '#F0A500' }}>− {fmt(r.meiaParcela)}</span>
          </div>
          <div className="h-px" style={{ background: 'var(--border)' }} />
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>Saldo após nova operação</span>
            <span className="text-xl font-black" style={{ fontFamily: 'Montserrat', color: autofinanciado ? 'var(--gold)' : negativo ? 'var(--alert)' : '#F0A500' }}>
              {r.saldoComReplicacao >= 0 ? '+' : ''}{fmt(r.saldoComReplicacao)}
            </span>
          </div>
        </div>

        {/* Status badge */}
        <div className="mt-2 p-4 rounded-xl text-center" style={{
          background: autofinanciado
            ? 'rgba(193,177,118,0.1)'
            : parcialmenteAutofinanciado
              ? 'rgba(240,165,0,0.08)'
              : 'rgba(204,51,102,0.08)',
          border: `1px solid ${autofinanciado ? 'rgba(193,177,118,0.3)' : parcialmenteAutofinanciado ? 'rgba(240,165,0,0.3)' : 'rgba(204,51,102,0.3)'}`,
        }}>
          {autofinanciado && (
            <>
              <Repeat2 size={20} className="inline mb-1" style={{ color: 'var(--gold)' }} />
              <p className="text-sm font-black text-white">Sistema Auto-Financiado</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                O aluguel cobre a parcela cheia <strong style={{ color: 'white' }}>e</strong> a meia parcela da próxima operação. Zero aporte extra.
              </p>
            </>
          )}
          {parcialmenteAutofinanciado && (
            <>
              <TrendingUp size={20} className="inline mb-1" style={{ color: '#F0A500' }} />
              <p className="text-sm font-black text-white">Parcialmente Auto-Financiado</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                Saldo livre de {fmt(r.saldoLivreBasico)}/mês — cobre parte da meia parcela ({fmt(r.meiaParcela)}) da nova operação.
              </p>
            </>
          )}
          {negativo && (
            <>
              <TrendingDown size={20} className="inline mb-1" style={{ color: 'var(--alert)' }} />
              <p className="text-sm font-black text-white">Aluguel Insuficiente</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                O aluguel não cobre a parcela cheia. Aumente o rendimento ou o valor do imóvel.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Step5({ data, set, r }: { data: AluguelData; set: SetFn; r: Results }) {
  return (
    <div className="space-y-8">
      <StepHeader step={5} title="Patrimônio e Renda Final" subtitle="Projete quantas operações você deseja acumular e veja o patrimônio e renda passiva após quitação total." />

      {/* Slider de operações */}
      <div className="p-6 rounded-2xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <div className="flex justify-between items-center mb-3">
          <p className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--gold)' }}>
            Número de Operações
          </p>
          <span className="text-sm font-black px-3 py-1 rounded-full" style={{ background: 'var(--gold-dim)', color: 'var(--gold)' }}>
            {data.numOperacoes} imóveis
          </span>
        </div>
        <input
          type="range" min={1} max={10}
          value={data.numOperacoes}
          onChange={(e) => set('numOperacoes')(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between mt-1">
          <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>1 imóvel</span>
          <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>10 imóveis</span>
        </div>

        {/* Mini cards de cada op */}
        <div className="flex gap-2 mt-5 flex-wrap">
          {Array.from({ length: data.numOperacoes }).map((_, i) => (
            <div
              key={i}
              className="flex-1 min-w-[60px] p-3 rounded-xl text-center"
              style={{ background: 'rgba(193,177,118,0.08)', border: '1px solid rgba(193,177,118,0.15)' }}
            >
              <Home size={14} className="mx-auto mb-1" style={{ color: 'var(--gold)' }} />
              <p className="text-[10px] font-bold" style={{ color: 'var(--text-secondary)' }}>Op.{i + 1}</p>
              <p className="text-[10px] font-black" style={{ color: 'var(--gold)' }}>{fmt(data.valorImovelFinal)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Patrimônio total */}
      <motion.div
        key={data.numOperacoes}
        initial={{ scale: 0.96, opacity: 0.8 }}
        animate={{ scale: 1, opacity: 1 }}
        className="p-8 md:p-12 rounded-[2rem] text-center"
        style={{ background: 'linear-gradient(135deg, #0D1A00 0%, #050800 100%)', border: '1px solid rgba(193,177,118,0.2)' }}
      >
        <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: 'var(--gold)' }}>
          Patrimônio Total Acumulado
        </p>
        <motion.p
          key={r.patrimonioTotal}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-5xl md:text-7xl font-black mb-8"
          style={{ fontFamily: 'Montserrat', color: 'var(--gold)' }}
        >
          {fmt(r.patrimonioTotal)}
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-8" style={{ borderColor: 'rgba(193,177,118,0.15)' }}>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-secondary)' }}>Total Aportado</p>
            <p className="text-lg font-black text-white" style={{ fontFamily: 'Montserrat' }}>{fmt(r.totalInvestidoTodas)}</p>
            <div className="flex items-center justify-center gap-1 mt-1">
              <TrendingDown size={12} style={{ color: 'var(--alert)' }} />
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Saiu do bolso</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-secondary)' }}>Renda Bruta (c/ parcelas)</p>
            <p className="text-lg font-black" style={{ fontFamily: 'Montserrat', color: '#F0A500' }}>{fmt(r.rendaBrutaMensal)}/mês</p>
            <div className="flex items-center justify-center gap-1 mt-1">
              <CalendarDays size={12} style={{ color: '#F0A500' }} />
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>durante o consórcio</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-secondary)' }}>Renda Líquida Pós-Quitação</p>
            <p className="text-lg font-black" style={{ fontFamily: 'Montserrat', color: '#00C864' }}>{fmt(r.rendaLiquidaMensal)}/mês</p>
            <div className="flex items-center justify-center gap-1 mt-1">
              <CheckCircle2 size={12} style={{ color: '#00C864' }} />
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>imóveis quitados</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mt-8">
          <span className="px-5 py-2 rounded-full text-xs font-black" style={{ background: 'var(--gold-dim)', color: 'var(--gold)', border: '1px solid var(--border)' }}>
            {data.numOperacoes} imóveis · {fmt(data.valorImovelFinal)} cada
          </span>
          <span className="px-5 py-2 rounded-full text-xs font-black" style={{ background: 'rgba(0,200,100,0.1)', color: '#00C864', border: '1px solid rgba(0,200,100,0.2)' }}>
            {fmt(r.rendaLiquidaMensal)}/mês livre após quitação
          </span>
        </div>
      </motion.div>
    </div>
  );
}
