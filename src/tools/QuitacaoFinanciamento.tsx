import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, ChevronLeft, RefreshCw, TrendingDown,
  Info, CheckCircle2, AlertTriangle,
} from 'lucide-react';
import { calculateQuitacao, fmt, type QuitacaoData } from '../lib/calculations';
import FunilContemplacao from '../components/FunilContemplacao';
import BRLInput from '../components/BRLInput';

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

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="p-5 rounded-2xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
      <Label>{label}</Label>
      <p className="text-2xl font-black" style={{ fontFamily: 'Montserrat', color: color ?? 'white' }}>{value}</p>
      {sub && <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{sub}</p>}
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
            background: i < step ? 'var(--alert)' : i === step - 1 ? 'var(--alert)' : 'rgba(204,51,102,0.2)',
          }}
        />
      ))}
    </div>
  );
}

function StepHeader({ step, title, subtitle }: { step: number; title: string; subtitle: string }) {
  return (
    <div className="mb-2">
      <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--alert)' }}>
        Etapa {step} de {TOTAL_STEPS}
      </p>
      <h2 className="text-2xl md:text-3xl font-black text-white mb-2" style={{ fontFamily: 'Montserrat' }}>
        {title}
      </h2>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{subtitle}</p>
    </div>
  );
}

interface Props { onBack: () => void; }

export default function QuitacaoFinanciamento({ onBack }: Props) {
  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);
  const [data, setData] = useState<QuitacaoData>({
    saldoDevedorBanco: 400000,
    parcelaBanco: 4500,
    prazoRestanteBanco: 180,
    valorCredito: 400000,
    taxaAdm: 0.23,
    prazoConsorcio: 220,
    mesContemplacao: 30,
  });

  const r = calculateQuitacao(data);
  const set = (key: keyof QuitacaoData) => (v: number) => setData((d) => ({ ...d, [key]: v }));

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
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(204,51,102,0.2)' }}>
              <TrendingDown size={14} style={{ color: 'var(--alert)' }} />
            </div>
            <span className="font-black text-sm" style={{ fontFamily: 'Montserrat', color: 'white' }}>
              Quitação de <span style={{ color: 'var(--alert)' }}>Financiamento</span>
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
              style={{ background: 'var(--alert)', color: 'white' }}
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

type SetFn = (k: keyof QuitacaoData) => (v: number) => void;
type Results = ReturnType<typeof calculateQuitacao>;

function Step1({ data, set, r }: { data: QuitacaoData; set: SetFn; r: Results }) {
  return (
    <div className="space-y-8">
      <StepHeader
        step={1}
        title="Financiamento Atual"
        subtitle="Informe os dados do financiamento bancário atual para calcular o custo total restante."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <Label>Saldo Devedor no Banco (R$)</Label>
          <BRLInput value={data.saldoDevedorBanco} onChange={set('saldoDevedorBanco')} />
        </div>
        <div>
          <Label>Parcela Atual (R$)</Label>
          <BRLInput value={data.parcelaBanco} onChange={set('parcelaBanco')} />
        </div>
        <div className="md:col-span-2">
          <Label>Prazo Restante (meses)</Label>
          <input
            type="number"
            inputMode="numeric"
            value={data.prazoRestanteBanco === 0 ? '' : data.prazoRestanteBanco}
            onChange={(e) => set('prazoRestanteBanco')(e.target.value === '' ? 0 : Number(e.target.value))}
          />
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden border" style={{ borderColor: 'rgba(204,51,102,0.3)' }}>
        <div className="px-5 py-3" style={{ background: 'rgba(204,51,102,0.08)' }}>
          <p className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--alert)' }}>
            Custo Total Restante com o Banco
          </p>
        </div>
        <div className="grid grid-cols-2">
          <div className="p-6" style={{ background: '#1A0005' }}>
            <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--text-secondary)' }}>
              Total a Pagar
            </p>
            <p className="text-3xl font-black text-white" style={{ fontFamily: 'Montserrat' }}>
              {fmt(r.custoTotalBanco)}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              {data.prazoRestanteBanco} meses × {fmt(data.parcelaBanco)}
            </p>
          </div>
          <div className="p-6 border-l" style={{ background: '#1A0005', borderColor: 'rgba(204,51,102,0.2)' }}>
            <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--text-secondary)' }}>
              Juros Estimados
            </p>
            <p className="text-3xl font-black" style={{ fontFamily: 'Montserrat', color: 'var(--alert)' }}>
              {fmt(r.jurosTotaisBanco)}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              Acima do saldo atual
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 rounded-2xl border text-sm" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
        <Info size={14} className="inline mr-2" style={{ color: 'var(--gold)' }} />
        Em financiamentos bancários de imóvel, os <strong style={{ color: 'white' }}>juros representam até 60%</strong> do total pago. O consórcio cobra apenas a taxa administrativa, sem juros compostos.
      </div>
    </div>
  );
}

function Step2({ data, set, r }: { data: QuitacaoData; set: SetFn; r: Results }) {
  return (
    <div className="space-y-8">
      <StepHeader
        step={2}
        title="Novo Consórcio"
        subtitle="Configure o consórcio para quitação. O crédito deve cobrir o saldo devedor do banco."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
          <Label>Valor do Crédito (R$)</Label>
          <BRLInput value={data.valorCredito} onChange={set('valorCredito')} />
          {!r.creditoCobre ? (
            <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: 'var(--alert)' }}>
              <AlertTriangle size={12} /> Crédito menor que o saldo devedor — aumente o crédito.
            </p>
          ) : (
            <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: '#00C864' }}>
              <CheckCircle2 size={12} /> Cobre o saldo devedor do banco.
            </p>
          )}
        </div>
        <div>
          <Label>Taxa Adm. Total (%)</Label>
          <input
            type="number"
            inputMode="decimal"
            step="0.5"
            value={data.taxaAdm * 100 === 0 ? '' : data.taxaAdm * 100}
            onChange={(e) => set('taxaAdm')(e.target.value === '' ? 0 : Number(e.target.value) / 100)}
          />
        </div>
        <div>
          <Label>Prazo do Consórcio (meses)</Label>
          <input
            type="number"
            inputMode="numeric"
            value={data.prazoConsorcio === 0 ? '' : data.prazoConsorcio}
            onChange={(e) => set('prazoConsorcio')(e.target.value === '' ? 0 : Number(e.target.value))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-6 rounded-2xl border" style={{ background: '#1A1100', borderColor: 'rgba(255,165,0,0.25)' }}>
          <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: '#F0A500' }}>Meia Parcela</p>
          <p className="text-3xl font-black text-white" style={{ fontFamily: 'Montserrat' }}>{fmt(r.meiaParcela)}</p>
          <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>Até a contemplação</p>
        </div>
        <div className="p-6 rounded-2xl border" style={{ background: '#0D0D1A', borderColor: 'rgba(193,177,118,0.25)' }}>
          <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--gold)' }}>Parcela Cheia</p>
          <p className="text-3xl font-black text-white" style={{ fontFamily: 'Montserrat' }}>{fmt(r.parcelaCheiaConsorcio)}</p>
          <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>Pós-contemplação</p>
        </div>
      </div>

      <div className="p-6 rounded-2xl" style={{ background: 'linear-gradient(135deg, #1A1A00, #0D0D00)', border: '1px solid var(--border)' }}>
        <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: 'var(--gold)' }}>
          Total a Pagar ao Consórcio (c/ taxa adm)
        </p>
        <p className="text-4xl font-black text-white" style={{ fontFamily: 'Montserrat' }}>{fmt(r.totalComTaxaConsorcio)}</p>
        <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
          {fmt(data.valorCredito)} + {(data.taxaAdm * 100).toFixed(1)}% taxa · {data.prazoConsorcio} meses
        </p>
      </div>
    </div>
  );
}

function Step3({ data, set, r }: { data: QuitacaoData; set: SetFn; r: Results }) {
  return (
    <div className="space-y-8">
      <StepHeader
        step={3}
        title="Simulação de Contemplação"
        subtitle="Durante o período até a contemplação, você paga banco + meia parcela simultaneamente."
      />

      <FunilContemplacao
        prazoTotal={data.prazoConsorcio}
        mesContemplacao={data.mesContemplacao}
        onChangeMes={set('mesContemplacao')}
      />

      <div className="rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
        <div className="px-5 py-3" style={{ background: 'rgba(193,177,118,0.08)' }}>
          <p className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--gold)' }}>
            Período de Sobreposição — {data.mesContemplacao} meses
          </p>
        </div>
        <div className="grid grid-cols-3">
          <div className="p-5">
            <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--text-secondary)' }}>Banco</p>
            <p className="text-xl font-black text-white" style={{ fontFamily: 'Montserrat' }}>{fmt(data.parcelaBanco)}/mês</p>
          </div>
          <div className="p-5 border-l border-r" style={{ borderColor: 'var(--border)' }}>
            <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--text-secondary)' }}>+ Consórcio</p>
            <p className="text-xl font-black" style={{ fontFamily: 'Montserrat', color: '#F0A500' }}>{fmt(r.meiaParcela)}/mês</p>
          </div>
          <div className="p-5">
            <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--text-secondary)' }}>= Total</p>
            <p className="text-xl font-black" style={{ fontFamily: 'Montserrat', color: 'var(--alert)' }}>{fmt(r.custoSobreposicaoMensal)}/mês</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          label="Aporte no Consórcio (sobreposição)"
          value={fmt(r.totalOverlapConsorcio)}
          sub={`${data.mesContemplacao} meses × ${fmt(r.meiaParcela)}`}
          color="var(--gold)"
        />
        <StatCard
          label="Parcela Pós-Contemplação"
          value={fmt(r.parcelaCheiaConsorcio)}
          sub={`Banco quitado — só consórcio por mais ${r.parcelasRestantesConsorcio} meses`}
        />
      </div>

      <div className="p-5 rounded-2xl border text-sm" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
        <Info size={14} className="inline mr-2" style={{ color: 'var(--gold)' }} />
        Na contemplação, o crédito <strong style={{ color: 'white' }}>{fmt(data.valorCredito)}</strong> quita o banco de uma vez. A partir daí, você paga apenas <strong style={{ color: 'white' }}>{fmt(r.parcelaCheiaConsorcio)}/mês</strong> ao consórcio.
      </div>
    </div>
  );
}

function Step4({ data, r }: { data: QuitacaoData; r: Results }) {
  const economiaPositiva = r.economiaNominal >= 0;
  const tempoPositivo = r.tempoEliminado > 0;

  return (
    <div className="space-y-6">
      <StepHeader
        step={4}
        title="Resultado Comparativo"
        subtitle="Banco vs. Consórcio: economia real e impacto no tempo de endividamento."
      />

      <motion.div
        initial={{ scale: 0.96, opacity: 0.8 }}
        animate={{ scale: 1, opacity: 1 }}
        className="p-8 rounded-3xl text-center"
        style={{
          background: economiaPositiva
            ? 'linear-gradient(135deg, #001A0D 0%, #000D06 100%)'
            : 'linear-gradient(135deg, #1A0006 0%, #0D0003 100%)',
          border: `1px solid ${economiaPositiva ? 'rgba(0,200,100,0.3)' : 'rgba(204,51,102,0.3)'}`,
        }}
      >
        <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: economiaPositiva ? '#00C864' : 'var(--alert)' }}>
          Economia Real
        </p>
        <p className="text-5xl md:text-6xl font-black mb-2" style={{ fontFamily: 'Montserrat', color: economiaPositiva ? '#00C864' : 'var(--alert)' }}>
          {fmt(Math.abs(r.economiaNominal))}
        </p>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {economiaPositiva ? 'economizados trocando banco por consórcio' : 'a mais vs. banco — reavalie o prazo'}
        </p>

        <div className="mt-5 flex flex-wrap justify-center gap-3">
          {tempoPositivo && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: 'rgba(0,200,100,0.1)', border: '1px solid rgba(0,200,100,0.2)' }}>
              <CheckCircle2 size={14} style={{ color: '#00C864' }} />
              <span className="text-sm font-bold" style={{ color: '#00C864' }}>
                {r.tempoEliminado} meses de dívida eliminados
              </span>
            </div>
          )}
          {!tempoPositivo && r.tempoEliminado < 0 && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: 'rgba(255,165,0,0.1)', border: '1px solid rgba(255,165,0,0.2)' }}>
              <Info size={14} style={{ color: '#F0A500' }} />
              <span className="text-sm font-bold" style={{ color: '#F0A500' }}>
                Consórcio {Math.abs(r.tempoEliminado)}m mais longo, mas economiza no total
              </span>
            </div>
          )}
        </div>
      </motion.div>

      <div className="rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
        <div className="grid grid-cols-2">
          <div className="p-6 border-r" style={{ background: '#1A0005', borderColor: 'rgba(204,51,102,0.2)' }}>
            <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'var(--alert)' }}>
              Banco (continuar)
            </p>
            <p className="text-2xl font-black text-white mb-1" style={{ fontFamily: 'Montserrat' }}>{fmt(r.custoTotalBanco)}</p>
            <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>{r.mesesDividaBanco} meses de dívida</p>
            <div className="space-y-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
              <div className="flex justify-between">
                <span>Saldo atual</span>
                <span className="font-bold text-white">{fmt(data.saldoDevedorBanco)}</span>
              </div>
              <div className="flex justify-between">
                <span>Juros estimados</span>
                <span className="font-bold" style={{ color: 'var(--alert)' }}>{fmt(r.jurosTotaisBanco)}</span>
              </div>
            </div>
          </div>
          <div className="p-6" style={{ background: '#001A0D' }}>
            <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: '#00C864' }}>
              Consórcio (trocar)
            </p>
            <p className="text-2xl font-black text-white mb-1" style={{ fontFamily: 'Montserrat' }}>{fmt(r.custoTotalConsorcio)}</p>
            <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>{r.mesesDividaConsorcio} meses de dívida</p>
            <div className="space-y-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
              <div className="flex justify-between">
                <span>Sobreposição ({data.mesContemplacao}m)</span>
                <span className="font-bold" style={{ color: '#F0A500' }}>{fmt(r.totalOverlapConsorcio)}</span>
              </div>
              <div className="flex justify-between">
                <span>Pós-contemplação</span>
                <span className="font-bold text-white">{fmt(r.custoAposContemplacao)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl border space-y-3" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: 'var(--gold)' }}>
          Impacto no Fluxo Mensal
        </p>
        <div className="flex justify-between items-center text-sm">
          <span style={{ color: 'var(--text-secondary)' }}>Hoje (só banco)</span>
          <span className="font-bold text-white">{fmt(data.parcelaBanco)}/mês</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span style={{ color: 'var(--text-secondary)' }}>Sobreposição (banco + consórcio)</span>
          <span className="font-bold" style={{ color: 'var(--alert)' }}>{fmt(r.custoSobreposicaoMensal)}/mês</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span style={{ color: 'var(--text-secondary)' }}>Após contemplação (só consórcio)</span>
          <span className="font-bold" style={{ color: r.parcelaCheiaConsorcio < data.parcelaBanco ? '#00C864' : 'var(--gold)' }}>
            {fmt(r.parcelaCheiaConsorcio)}/mês
          </span>
        </div>
        <div className="h-px" style={{ background: 'var(--border)' }} />
        <div className="flex justify-between items-center">
          <span className="text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>
            Variação pós-contemplação vs. hoje
          </span>
          <span className="text-lg font-black" style={{
            fontFamily: 'Montserrat',
            color: r.parcelaCheiaConsorcio < data.parcelaBanco ? '#00C864' : 'var(--alert)',
          }}>
            {r.parcelaCheiaConsorcio < data.parcelaBanco ? '↓ ' : '↑ '}
            {fmt(Math.abs(r.parcelaCheiaConsorcio - data.parcelaBanco))}/mês
          </span>
        </div>
      </div>
    </div>
  );
}
