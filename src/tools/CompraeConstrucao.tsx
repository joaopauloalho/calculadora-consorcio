import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Calculator, Info,
  TrendingUp, TrendingDown, PieChart, CalendarDays,
  DollarSign, CheckCircle2, AlertCircle, Clock,
  UserPlus, RefreshCw, ChevronLeft,
} from 'lucide-react';
import { calculate, contemplationProbability, fmt, type SimData } from '../lib/calculations';
import ComparisonChart from '../components/ComparisonChart';
import FunilContemplacao from '../components/FunilContemplacao';

const TOTAL_STEPS = 7;

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

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="p-5 rounded-2xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
      <Label>{label}</Label>
      <p className="text-2xl font-black" style={{ fontFamily: 'Montserrat', color: accent ? 'var(--gold)' : 'white' }}>
        {value}
      </p>
    </div>
  );
}

function GoldInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <Label>{label}</Label>
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

interface Props {
  onBack: () => void;
}

export default function CompraeConstrucao({ onBack }: Props) {
  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);
  const [data, setData] = useState<SimData>({
    valorTerreno: 200000,
    valorConstrucao: 800000,
    prazoTotal: 220,
    taxaAdm: 0.23,
    mesContemplacao: 30,
    seguroMensalPercent: 0.000555,
    mesesObra: 12,
    valorVendaMercado: 1700000,
    entradaVenda: 800000,
  });

  const r = calculate(data);
  const set = (key: keyof SimData) => (v: number) => setData((d) => ({ ...d, [key]: v }));

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
              <Calculator size={14} className="text-black" />
            </div>
            <span className="font-black text-sm" style={{ fontFamily: 'Montserrat', color: 'white' }}>
              Compra<span style={{ color: 'var(--gold)' }}>&</span>Construção
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
            {step === 2 && <Step2 data={data} r={r} />}
            {step === 3 && <Step3 data={data} set={set} r={r} />}
            {step === 4 && <Step4 data={data} set={set} r={r} />}
            {step === 5 && <Step5 data={data} r={r} />}
            {step === 6 && <Step6 data={data} set={set} r={r} />}
            {step === 7 && <Step7 data={data} set={set} r={r} />}
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

function Step1({ data, set, r }: { data: SimData; set: (k: keyof SimData) => (v: number) => void; r: ReturnType<typeof calculate> }) {
  return (
    <div className="space-y-8">
      <StepHeader step={1} title="Definição do Projeto" subtitle="Informe os valores do terreno e da construção para calcular o crédito necessário." />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <GoldInput label="Valor do Terreno (R$)" value={data.valorTerreno} onChange={set('valorTerreno')} />
        <GoldInput label="Valor da Construção (R$)" value={data.valorConstrucao} onChange={set('valorConstrucao')} />
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-8 rounded-3xl flex justify-between items-center"
        style={{ background: 'linear-gradient(135deg, #1A1A00 0%, #2A2500 100%)', border: '1px solid var(--border)' }}
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--gold)' }}>Crédito Total Necessário</p>
          <p className="text-4xl font-black text-white" style={{ fontFamily: 'Montserrat' }}>{fmt(r.totalCredito)}</p>
        </div>
        <Calculator size={32} style={{ color: 'var(--gold)', opacity: 0.5 }} />
      </motion.div>
    </div>
  );
}

function Step2({ data, r }: { data: SimData; r: ReturnType<typeof calculate> }) {
  return (
    <div className="space-y-8">
      <StepHeader step={2} title="Dados do Consórcio" subtitle="Parâmetros do grupo: prazo, taxa administrativa e estrutura de parcelas." />
      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Prazo Total" value={`${data.prazoTotal} Meses`} />
        <StatCard label="Taxa Adm. Total" value={`${(data.taxaAdm * 100).toFixed(0)}%`} />
        <div className="p-5 rounded-2xl border" style={{ background: '#1A1100', borderColor: 'rgba(255,165,0,0.2)' }}>
          <Label>Meia Parcela (até contemplar)</Label>
          <p className="text-2xl font-black" style={{ fontFamily: 'Montserrat', color: '#F0A500' }}>{fmt(r.meiaParcela)}</p>
        </div>
        <div className="p-5 rounded-2xl border" style={{ background: '#001A0A', borderColor: 'rgba(0,200,100,0.2)' }}>
          <Label>Parcela Cheia (pós contemplação)</Label>
          <p className="text-2xl font-black" style={{ fontFamily: 'Montserrat', color: '#00C864' }}>{fmt(r.parcelaCheiaOriginal)}</p>
        </div>
      </div>
      <div className="p-6 rounded-2xl border text-sm" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
        <Info size={14} className="inline mr-2" style={{ color: 'var(--gold)' }} />
        A <strong style={{ color: 'white' }}>meia parcela</strong> é uma vantagem do consórcio: você usa o crédito antes de terminar de pagar, alavancando com metade do custo mensal durante o período de espera pela contemplação.
      </div>
    </div>
  );
}

function Step3({ data, set, r }: { data: SimData; set: (k: keyof SimData) => (v: number) => void; r: ReturnType<typeof calculate> }) {
  const [saudeGrupo, setSaudeGrupo] = useState(0.85);
  const [pontualidade, setPontualidade] = useState(0.95);

  return (
    <div className="space-y-8">
      <StepHeader step={3} title="Funil de Contemplação" subtitle="Simule o mês estimado de contemplação com base na saúde do grupo e no seu histórico de pagamentos." />

      <FunilContemplacao
        prazoTotal={data.prazoTotal}
        mesContemplacao={data.mesContemplacao}
        saudeGrupo={saudeGrupo}
        pontualidade={pontualidade}
        onChangeMes={set('mesContemplacao')}
        onChangeSaude={setSaudeGrupo}
        onChangePontualidade={setPontualidade}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard label="Valor Investido até Contemplar" value={fmt(r.valorInvestidoAteContemplacao)} />
        <StatCard label="Saldo Devedor na Contemplação" value={fmt(r.saldoDevedorNaContemplacao)} />
        <div className="md:col-span-2 p-6 rounded-2xl" style={{ background: 'linear-gradient(135deg, #0D1A2E 0%, #0A1020 100%)', border: '1px solid rgba(100,150,255,0.2)' }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#7EB0FF' }}>
            Nova Parcela Pós-Contemplação (c/ Seguro 0.0555%/mês)
          </p>
          <p className="text-3xl font-black text-white" style={{ fontFamily: 'Montserrat' }}>{fmt(r.parcelaComSeguro)}</p>
        </div>
      </div>
    </div>
  );
}

function Step4({ data, set, r }: { data: SimData; set: (k: keyof SimData) => (v: number) => void; r: ReturnType<typeof calculate> }) {
  return (
    <div className="space-y-8">
      <StepHeader step={4} title="Período da Obra" subtitle="Defina o prazo de construção e veja o impacto no saldo devedor ao final da obra." />
      <GoldInput label="Tempo de Construção (meses)" value={data.mesesObra} onChange={set('mesesObra')} />
      <div className="p-8 rounded-3xl space-y-5 border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <div className="flex justify-between items-center">
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Parcelas pagas durante a obra:</span>
          <span className="font-bold text-white">{fmt(r.totalPagoNaObra)}</span>
        </div>
        <div className="h-px" style={{ background: 'var(--border)' }} />
        <div className="flex justify-between items-center">
          <span className="font-bold" style={{ color: 'var(--gold)' }}>Saldo devedor ao concluir a obra:</span>
          <span className="text-2xl font-black" style={{ fontFamily: 'Montserrat', color: 'var(--gold)' }}>{fmt(r.saldoDevedorPosObra)}</span>
        </div>
      </div>
    </div>
  );
}

function Step5({ data, r }: { data: SimData; r: ReturnType<typeof calculate> }) {
  return (
    <div className="space-y-8">
      <StepHeader step={5} title="Resumo do Desembolso" subtitle="Total real saído do bolso ao longo de toda a operação." />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <Label>Aportes Pré-Contemplação</Label>
          <p className="text-xl font-black text-white" style={{ fontFamily: 'Montserrat' }}>{fmt(r.valorInvestidoAteContemplacao)}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{data.mesContemplacao} meses × {fmt(r.meiaParcela)}</p>
        </div>
        <div className="p-5 rounded-2xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <Label>Aportes Durante a Obra</Label>
          <p className="text-xl font-black text-white" style={{ fontFamily: 'Montserrat' }}>{fmt(r.totalPagoNaObra)}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{data.mesesObra} meses de construção</p>
        </div>
      </div>
      <motion.div
        initial={{ scale: 0.97, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="p-8 md:p-10 rounded-3xl"
        style={{ background: 'linear-gradient(135deg, #1C1800 0%, #0D0D00 100%)', border: '1px solid var(--border)' }}
      >
        <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: 'var(--gold)' }}>Total Real Saído do Bolso</p>
        <p className="text-5xl font-black text-white mb-6" style={{ fontFamily: 'Montserrat' }}>{fmt(r.totalDesembolsado)}</p>
        <div className="grid grid-cols-2 gap-6 border-t pt-6" style={{ borderColor: 'rgba(193,177,118,0.15)' }}>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-secondary)' }}>Período Total</p>
            <div className="flex items-center gap-2">
              <CalendarDays size={16} style={{ color: 'var(--gold)' }} />
              <span className="text-xl font-bold text-white">{r.totalMesesInvestindo} Meses</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-secondary)' }}>Média Mensal</p>
            <div className="flex items-center gap-2">
              <TrendingUp size={16} style={{ color: 'var(--gold)' }} />
              <span className="text-xl font-bold text-white">{fmt(r.mediaParcelaInvestida)}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Step6({ data, set, r }: { data: SimData; set: (k: keyof SimData) => (v: number) => void; r: ReturnType<typeof calculate> }) {
  return (
    <div className="space-y-8">
      <StepHeader step={6} title="Consórcio vs. Banco" subtitle="Compare o custo total de aquisição via consórcio com o financiamento bancário tradicional." />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 rounded-2xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <GoldInput label="Valor de Mercado do Imóvel Pronto (R$)" value={data.valorVendaMercado} onChange={set('valorVendaMercado')} />
        <GoldInput label="Entrada / Ágio Recebido (R$)" value={data.entradaVenda} onChange={set('entradaVenda')} />
      </div>

      <ComparisonChart
        consorcioTotal={r.custoTotalAquisicaoConsorcio}
        bancoTotal={r.totalEstimadoPagoBanco}
        economia={r.totalEstimadoPagoBanco - r.custoTotalAquisicaoConsorcio}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 rounded-2xl border" style={{ background: '#001A0A', borderColor: 'rgba(0,200,100,0.2)' }}>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 size={18} style={{ color: '#00C864' }} />
            <span className="font-bold text-sm text-white">Consórcio (sua oferta)</span>
          </div>
          <Label>Custo Total (Entrada + Saldo)</Label>
          <p className="text-2xl font-black" style={{ fontFamily: 'Montserrat', color: '#00C864' }}>{fmt(r.custoTotalAquisicaoConsorcio)}</p>
          <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>{r.parcelasRestantes} meses restantes no grupo</p>
        </div>
        <div className="p-6 rounded-2xl border" style={{ background: '#1A0005', borderColor: 'rgba(204,51,102,0.2)' }}>
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={18} style={{ color: 'var(--alert)' }} />
            <span className="font-bold text-sm text-white">Banco (financiamento)</span>
          </div>
          <Label>Total Pago ao Banco (360 meses)</Label>
          <p className="text-2xl font-black" style={{ fontFamily: 'Montserrat', color: 'var(--alert)' }}>{fmt(r.totalEstimadoPagoBanco)}</p>
          <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>Parcela inicial SAC: {fmt(r.parcelaEstimadaBanco)}/mês</p>
        </div>
      </div>

      <div className="p-6 rounded-2xl flex items-center gap-5" style={{ background: 'linear-gradient(135deg, #0D1A0A 0%, #081208 100%)', border: '1px solid rgba(0,200,100,0.15)' }}>
        <TrendingUp size={32} style={{ color: '#00C864', flexShrink: 0 }} />
        <div>
          <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: 'var(--text-secondary)' }}>O Cliente Economiza</p>
          <p className="text-2xl font-black text-white" style={{ fontFamily: 'Montserrat' }}>
            <span style={{ color: '#00C864' }}>{fmt(r.totalEstimadoPagoBanco - r.custoTotalAquisicaoConsorcio)}</span>
            {' '}comparado ao banco
          </p>
        </div>
      </div>
    </div>
  );
}

function Step7({ data, set, r }: { data: SimData; set: (k: keyof SimData) => (v: number) => void; r: ReturnType<typeof calculate> }) {
  const roi = ((r.lucroTotal / r.totalDesembolsado) * 100).toFixed(0);
  const isPositive = r.lucroTotal >= 0;

  return (
    <div className="space-y-8">
      <StepHeader step={7} title="Fechamento e Lucro" subtitle="Resultado final da operação. Ajuste o mês de contemplação para ver a sensibilidade do lucro." />

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
            <p className="text-[10px] font-black uppercase mb-1" style={{ color: 'var(--text-secondary)' }}>Margem</p>
            <p className="text-sm font-bold" style={{ color: isPositive ? '#00C864' : 'var(--alert)' }}>{roi}%</p>
          </div>
        </div>
      </div>

      <motion.div
        key={r.lucroTotal}
        initial={{ scale: 0.96, opacity: 0.8 }}
        animate={{ scale: 1, opacity: 1 }}
        className="p-8 md:p-12 rounded-[2rem] text-center"
        style={{ background: 'linear-gradient(135deg, #0D1A00 0%, #050800 100%)', border: '1px solid rgba(193,177,118,0.2)' }}
      >
        <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: 'var(--gold)' }}>
          Lucro Líquido na Operação
        </p>
        <motion.p
          key={r.lucroTotal}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-5xl md:text-7xl font-black mb-8"
          style={{
            fontFamily: 'Montserrat',
            color: isPositive ? 'var(--gold)' : 'var(--alert)',
          }}
        >
          {fmt(r.lucroTotal)}
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-8" style={{ borderColor: 'rgba(193,177,118,0.15)' }}>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-secondary)' }}>Total Investido</p>
            <p className="text-lg font-black text-white" style={{ fontFamily: 'Montserrat' }}>{fmt(r.totalDesembolsado)}</p>
            <div className="flex items-center justify-center gap-1 mt-1">
              <TrendingDown size={12} style={{ color: 'var(--alert)' }} />
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Saiu do bolso</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-secondary)' }}>Entrada Recebida</p>
            <p className="text-lg font-black" style={{ fontFamily: 'Montserrat', color: '#00C864' }}>{fmt(data.entradaVenda)}</p>
            <div className="flex items-center justify-center gap-1 mt-1">
              <TrendingUp size={12} style={{ color: '#00C864' }} />
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Ágio recebido</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-secondary)' }}>Lucro Mensal Médio</p>
            <p className="text-lg font-black" style={{ fontFamily: 'Montserrat', color: 'var(--gold)' }}>{fmt(r.lucroMensalMedio)}</p>
            <div className="flex items-center justify-center gap-1 mt-1">
              <CalendarDays size={12} style={{ color: 'var(--gold)' }} />
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{r.totalMesesInvestindo} meses</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mt-8">
          <span className="px-5 py-2 rounded-full text-xs font-black" style={{ background: 'var(--gold-dim)', color: 'var(--gold)', border: '1px solid var(--border)' }}>
            ROI: {roi}%
          </span>
          <span className="px-5 py-2 rounded-full text-xs font-black" style={{ background: 'var(--gold-dim)', color: 'var(--gold)', border: '1px solid var(--border)' }}>
            {r.totalMesesInvestindo} meses de operação
          </span>
        </div>
      </motion.div>
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
