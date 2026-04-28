import { useState, useMemo, useEffect } from 'react';
import { useCalculatorNavigation } from '../hooks/useCalculatorNavigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ArrowLeft, ArrowRight, Gavel, Info, RefreshCw, CheckCircle2 } from 'lucide-react';
import { aplicarReajusteINCC, fmt, INCC_MEDIO_HISTORICO } from '../lib/calculations';
import BRLInput from '../components/BRLInput';
import { Label, StatCard, ProgressDots, StepHeader, slideVariants } from '../components/shared';

interface Props { onBack: () => void; }

type TipoLance = 'livre' | 'embutido';
type Tier = 30 | 35 | 40;

interface Data {
  valorCredito: number;
  prazoTotal: number;
  taxaAdm: number;
  mesContemplacao: number;
  inccAnual: number;
  tipoLance: TipoLance;
  lancePercent: number;
  tierSelecionado: Tier;
  prataDisponivel: boolean;
  ouroDisponivel: boolean;
  ofertaTotalPercent: number;
}

function calcular(d: Data) {
  const valorCreditoAtualizado = aplicarReajusteINCC(d.valorCredito, d.inccAnual, d.mesContemplacao);
  const parcela = d.prazoTotal > 0 ? (d.valorCredito * (1 + d.taxaAdm / 100)) / d.prazoTotal : 0;
  const parcelasRestantes = Math.max(0, d.prazoTotal - d.mesContemplacao);
  const saldoDevedorBruto = parcelasRestantes * parcela;

  if (d.tipoLance === 'livre') {
    const lanceValor = (d.lancePercent / 100) * valorCreditoAtualizado;
    const saldoDevedorFinal = Math.max(0, saldoDevedorBruto - lanceValor);
    return {
      valorCreditoAtualizado, parcela, parcelasRestantes,
      lanceTotal: lanceValor, lanceTotalPercent: d.lancePercent,
      lanceCartaValor: 0, lanceCartaPercent: 0,
      recursosPropriosLance: lanceValor,
      creditoLiquido: valorCreditoAtualizado,
      saldoDevedor: saldoDevedorFinal,
      parcelasEfetivas: parcela > 0 ? Math.round(saldoDevedorFinal / parcela) : 0,
    };
  }

  const tierPercent = d.tierSelecionado;
  const lanceEmbutidoValor = (tierPercent / 100) * valorCreditoAtualizado;
  const ofertaTotal = Math.max(tierPercent, d.ofertaTotalPercent);
  const lanceTotal = (ofertaTotal / 100) * valorCreditoAtualizado;
  const recursosPropriosLance = Math.max(0, lanceTotal - lanceEmbutidoValor);
  const creditoLiquido = valorCreditoAtualizado - lanceEmbutidoValor;
  const saldoDevedor = Math.max(0, saldoDevedorBruto - lanceEmbutidoValor);
  const parcelasEfetivas = parcela > 0 ? Math.round(saldoDevedor / parcela) : 0;
  return {
    valorCreditoAtualizado, parcela, parcelasRestantes,
    lanceTotal, lanceTotalPercent: ofertaTotal,
    lanceCartaValor: lanceEmbutidoValor, lanceCartaPercent: tierPercent,
    recursosPropriosLance, creditoLiquido, saldoDevedor, parcelasEfetivas,
  };
}

const TOTAL_STEPS = 3;

export default function CalculadoraLance({ onBack }: Props) {
  const { step, dir, goNext, goPrev, setStep } = useCalculatorNavigation(TOTAL_STEPS);
  const [data, setData] = useState<Data>({
    valorCredito: 300000,
    prazoTotal: 180,
    taxaAdm: 23,
    mesContemplacao: 24,
    inccAnual: INCC_MEDIO_HISTORICO,
    tipoLance: 'embutido',
    lancePercent: 30,
    tierSelecionado: 30,
    prataDisponivel: false,
    ouroDisponivel: false,
    ofertaTotalPercent: 30,
  });

  const r = useMemo(() => calcular(data), [data]);
  const set = <K extends keyof Data>(key: K) => (v: Data[K]) => setData(d => ({ ...d, [key]: v }));

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-black)' }}>
      <nav
        className="sticky top-0 z-50 border-b"
        style={{ background: 'rgba(3,23,21,0.9)', backdropFilter: 'blur(12px)', borderColor: 'var(--border)' }}
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
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--gold-dim)' }}>
              <Gavel size={14} style={{ color: 'var(--gold)' }} />
            </div>
            <span className="font-black text-sm" style={{ fontFamily: 'Montserrat', color: 'white' }}>
              Calculadora de <span style={{ color: 'var(--gold)' }}>Lance</span>
            </span>
          </div>
          <ProgressDots step={step} totalSteps={TOTAL_STEPS} variant="gold" />
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
            {step === 2 && <Step2 data={data} set={set} setData={setData} r={r} />}
            {step === 3 && <Step3 data={data} r={r} />}
          </motion.div>
        </AnimatePresence>
      </div>

      <div
        className="sticky bottom-0 border-t px-6 py-4"
        style={{ background: 'rgba(3,23,21,0.95)', backdropFilter: 'blur(12px)', borderColor: 'var(--border)' }}
      >
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
              style={{ background: 'var(--gold)', color: '#031715' }}
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

type R = ReturnType<typeof calcular>;

function Step1({ data, set, r }: { data: Data; set: <K extends keyof Data>(k: K) => (v: Data[K]) => void; r: R }) {
  const inccDiff = r.valorCreditoAtualizado - data.valorCredito;
  const hasUpdate = inccDiff > 0;

  return (
    <div className="space-y-8">
      <StepHeader
        step={1} totalSteps={TOTAL_STEPS} variant="gold"
        title="Dados do Consórcio"
        subtitle="Informe o crédito e o mês em que pretende fazer o lance para ver o valor atualizado pelo INCC."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
          <Label>Valor do Crédito (R$)</Label>
          <BRLInput value={data.valorCredito} onChange={set('valorCredito')} />
        </div>
        <div>
          <Label>Mês do Lance</Label>
          <input
            type="number" inputMode="numeric" min={1} max={220}
            value={data.mesContemplacao === 0 ? '' : data.mesContemplacao}
            placeholder="24"
            onChange={e => set('mesContemplacao')(e.target.value === '' ? 0 : Math.max(1, Number(e.target.value)))}
          />
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>assembleia em que vai ofertar</p>
        </div>
        <div>
          <Label>Prazo Total do Plano (meses)</Label>
          <input
            type="number" inputMode="numeric" min={1} max={240}
            value={data.prazoTotal === 0 ? '' : data.prazoTotal}
            placeholder="180"
            onChange={e => set('prazoTotal')(e.target.value === '' ? 0 : Number(e.target.value))}
          />
        </div>
        <div>
          <Label>Taxa Adm. Total (%)</Label>
          <input
            type="number" inputMode="decimal" step="0.5" min={0}
            value={data.taxaAdm === 0 ? '' : data.taxaAdm}
            placeholder="23"
            onChange={e => set('taxaAdm')(e.target.value === '' ? 0 : Number(e.target.value))}
          />
        </div>
        <div>
          <Label>INCC Anual (%)</Label>
          <input
            type="number" inputMode="decimal" step="0.1" min={0}
            value={data.inccAnual === 0 ? '' : data.inccAnual}
            placeholder={String(INCC_MEDIO_HISTORICO)}
            onChange={e => set('inccAnual')(e.target.value === '' ? 0 : Number(e.target.value))}
          />
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>histórico: {INCC_MEDIO_HISTORICO}% a.a.</p>
        </div>
      </div>

      <div
        className="rounded-2xl overflow-hidden border"
        style={{ borderColor: hasUpdate ? 'var(--gold-border)' : 'var(--border)' }}
      >
        <div className="px-5 py-3" style={{ background: hasUpdate ? 'var(--gold-dim)' : 'rgba(247,248,253,0.04)' }}>
          <p className="text-xs font-black uppercase tracking-widest" style={{ color: hasUpdate ? 'var(--gold)' : 'var(--text-secondary)' }}>
            Crédito Atualizado pelo INCC — Mês {data.mesContemplacao}
          </p>
        </div>
        <div className="grid grid-cols-2">
          <div className="p-6" style={{ background: 'var(--bg-card)' }}>
            <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--text-secondary)' }}>
              Crédito na Contemplação
            </p>
            <p className="text-3xl font-black text-white" style={{ fontFamily: 'Montserrat' }}>
              {fmt(r.valorCreditoAtualizado)}
            </p>
            {hasUpdate && (
              <p className="text-xs mt-1" style={{ color: 'var(--gold)' }}>
                +{fmt(inccDiff)} vs. valor original
              </p>
            )}
          </div>
          <div className="p-6 border-l" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--text-secondary)' }}>
              Parcela Cheia a Pagar
            </p>
            <p className="text-3xl font-black" style={{ fontFamily: 'Montserrat', color: 'var(--gold)' }}>
              {fmt(r.parcela)}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              pagará mensalmente após contemplação
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const TIERS: { percent: Tier; label: string; cor: string; availKey: 'prataDisponivel' | 'ouroDisponivel' | null }[] = [
  { percent: 30, label: 'Padrão', cor: 'var(--gold)', availKey: null },
  { percent: 35, label: 'Prata', cor: '#C0C0C0', availKey: 'prataDisponivel' },
  { percent: 40, label: 'Ouro', cor: '#C9A84C', availKey: 'ouroDisponivel' },
];

function Step2({
  data, set, setData, r,
}: {
  data: Data;
  set: <K extends keyof Data>(k: K) => (v: Data[K]) => void;
  setData: React.Dispatch<React.SetStateAction<Data>>;
  r: R;
}) {
  const [ofertaInput, setOfertaInput] = useState(String(data.ofertaTotalPercent));

  useEffect(() => {
    setOfertaInput(String(data.ofertaTotalPercent));
  }, [data.ofertaTotalPercent]);

  const ofertaNum = parseFloat(ofertaInput);
  const ofertaAbaixoMinimo = ofertaInput !== '' && !isNaN(ofertaNum) && ofertaNum < data.tierSelecionado;

  const selectTier = (t: Tier) => {
    setData(d => ({
      ...d,
      tierSelecionado: t,
      ofertaTotalPercent: Math.max(d.ofertaTotalPercent, t),
    }));
  };

  const toggleAvail = (key: 'prataDisponivel' | 'ouroDisponivel', tier: Tier) => {
    setData(d => {
      const nowAvail = !d[key];
      const newTier = (!nowAvail && d.tierSelecionado === tier) ? 30 : d.tierSelecionado;
      return { ...d, [key]: nowAvail, tierSelecionado: newTier, ofertaTotalPercent: Math.max(d.ofertaTotalPercent, newTier) };
    });
  };

  return (
    <div className="space-y-8">
      <StepHeader
        step={2} totalSteps={TOTAL_STEPS} variant="gold"
        title="Forma do Lance"
        subtitle="Escolha como vai ofertar: com dinheiro próprio (Livre) ou usando parte do crédito (Embutido)."
      />

      {/* Toggle Livre / Embutido */}
      <div className="grid grid-cols-2 gap-3">
        {(['livre', 'embutido'] as TipoLance[]).map(tipo => {
          const ativo = data.tipoLance === tipo;
          return (
            <button
              key={tipo}
              onClick={() => set('tipoLance')(tipo)}
              className="p-5 rounded-2xl border text-left transition-all duration-200"
              style={{
                background: ativo ? 'var(--gold-dim)' : 'var(--bg-card)',
                borderColor: ativo ? 'var(--gold)' : 'var(--border)',
              }}
            >
              <p className="font-black text-base mb-1" style={{ color: ativo ? 'var(--gold)' : 'var(--text-primary)' }}>
                {tipo === 'livre' ? 'Lance Livre' : 'Lance Embutido'}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {tipo === 'livre'
                  ? 'Oferta com recursos próprios — o crédito não é reduzido.'
                  : 'Parte do crédito é usada como lance. Crédito líquido menor.'}
              </p>
            </button>
          );
        })}
      </div>

      {/* Lance Livre */}
      {data.tipoLance === 'livre' && (
        <div className="space-y-4">
          <div>
            <Label>Percentual do lance ofertado (%)</Label>
            <input
              type="number" inputMode="decimal" step="1" min={0} max={100}
              value={data.lancePercent === 0 ? '' : data.lancePercent}
              placeholder="30"
              onChange={e => set('lancePercent')(e.target.value === '' ? 0 : Math.min(100, Number(e.target.value)))}
            />
            {data.lancePercent > 0 && (
              <p className="text-xs mt-1" style={{ color: 'var(--gold)' }}>
                = {fmt(r.lanceTotal)} do seu bolso · crédito integral mantido
              </p>
            )}
          </div>
          <div className="p-4 rounded-xl border text-xs" style={{ background: 'rgba(193,177,118,0.05)', borderColor: 'rgba(193,177,118,0.2)', color: 'var(--text-secondary)' }}>
            <Info size={13} className="inline mr-1.5" style={{ color: 'var(--gold)' }} />
            No lance livre, você oferta valor próprio e <strong style={{ color: 'white' }}>recebe o crédito integral</strong> na contemplação. O saldo devedor não é reduzido.
          </div>
        </div>
      )}

      {/* Lance Embutido */}
      {data.tipoLance === 'embutido' && (
        <div className="space-y-6">
          <div>
            <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: 'var(--text-secondary)' }}>
              Percentual da carta disponível
            </p>
            <div className="grid grid-cols-3 gap-3">
              {TIERS.map(tier => {
                const disponivel = tier.availKey === null || data[tier.availKey];
                const selecionado = data.tierSelecionado === tier.percent;
                return (
                  <div
                    key={tier.percent}
                    className="rounded-2xl border p-4 transition-all duration-200"
                    style={{
                      background: selecionado ? `${tier.cor}15` : 'var(--bg-card)',
                      borderColor: selecionado ? tier.cor : 'var(--border)',
                      opacity: disponivel ? 1 : 0.45,
                    }}
                  >
                    {/* Header: label + check */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-black uppercase tracking-wider" style={{ color: selecionado ? tier.cor : 'var(--text-secondary)' }}>
                        {tier.label}
                      </span>
                      {selecionado && disponivel && (
                        <CheckCircle2 size={14} style={{ color: tier.cor }} />
                      )}
                    </div>

                    <p className="text-2xl font-black mb-3" style={{ fontFamily: 'Montserrat', color: disponivel ? tier.cor : 'var(--text-secondary)' }}>
                      {tier.percent}%
                    </p>

                    {/* Toggle disponível (só Prata e Ouro) */}
                    {tier.availKey && (
                      <button
                        onClick={() => toggleAvail(tier.availKey!, tier.percent)}
                        className="w-full text-[10px] font-bold uppercase tracking-wider py-1.5 rounded-lg transition-all"
                        style={{
                          background: disponivel ? `${tier.cor}22` : 'rgba(247,248,253,0.06)',
                          color: disponivel ? tier.cor : 'var(--text-secondary)',
                        }}
                      >
                        {disponivel ? '✓ disponível' : 'indisponível'}
                      </button>
                    )}

                    {/* Select button */}
                    {disponivel && !selecionado && (
                      <button
                        onClick={() => selectTier(tier.percent)}
                        className="w-full mt-2 text-[10px] font-bold uppercase tracking-wider py-1.5 rounded-lg transition-all hover:opacity-80"
                        style={{ background: `${tier.cor}22`, color: tier.cor }}
                      >
                        Selecionar
                      </button>
                    )}
                    {!disponivel && (
                      <p className="text-[10px] mt-2 text-center" style={{ color: 'var(--text-secondary)' }}>
                        marque como disponível
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Oferta total */}
          <div>
            <Label>Oferta total ofertada (%)</Label>
            <input
              type="number" inputMode="decimal" step="1" min={data.tierSelecionado} max={100}
              value={ofertaInput}
              placeholder={String(data.tierSelecionado)}
              onChange={e => setOfertaInput(e.target.value)}
              onBlur={() => {
                const num = parseFloat(ofertaInput);
                const enforced = isNaN(num) ? data.tierSelecionado : Math.max(data.tierSelecionado, Math.min(100, num));
                setOfertaInput(String(enforced));
                set('ofertaTotalPercent')(enforced);
              }}
            />
            {ofertaAbaixoMinimo ? (
              <p className="text-xs mt-1 font-bold" style={{ color: '#ff6b6b' }}>
                não aceita menos de {data.tierSelecionado}% — mínimo é o percentual da carta selecionada
              </p>
            ) : (
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                mínimo: {data.tierSelecionado}% (carta) — o excedente vem do seu bolso
              </p>
            )}
          </div>

          {/* Breakdown da oferta */}
          <div className="rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
            <div className="px-5 py-3" style={{ background: 'var(--gold-dim)' }}>
              <p className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--gold)' }}>
                Composição do Lance — {r.lanceTotalPercent}% do crédito atualizado
              </p>
            </div>
            <div className="grid grid-cols-3">
              <div className="p-5">
                <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--text-secondary)' }}>Lance Total</p>
                <p className="text-xl font-black text-white" style={{ fontFamily: 'Montserrat' }}>{fmt(r.lanceTotal)}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{r.lanceTotalPercent}%</p>
              </div>
              <div className="p-5 border-l border-r" style={{ borderColor: 'var(--border)' }}>
                <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--text-secondary)' }}>Da Carta</p>
                <p className="text-xl font-black" style={{ fontFamily: 'Montserrat', color: 'var(--gold)' }}>{fmt(r.lanceCartaValor)}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{r.lanceCartaPercent}%</p>
              </div>
              <div className="p-5">
                <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--text-secondary)' }}>Do Bolso</p>
                <p className="text-xl font-black" style={{ fontFamily: 'Montserrat', color: r.recursosPropriosLance > 0 ? '#5EB9AA' : 'var(--text-secondary)' }}>
                  {fmt(r.recursosPropriosLance)}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                  {r.lanceTotalPercent - r.lanceCartaPercent}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Step3({ data, r }: { data: Data; r: R }) {
  const isEmbutido = data.tipoLance === 'embutido';

  return (
    <div className="space-y-6">
      <StepHeader
        step={3} totalSteps={TOTAL_STEPS} variant="gold"
        title="Resultado do Lance"
        subtitle="Crédito líquido, saldo devedor e parcela após a contemplação pelo lance."
      />

      {/* Hero: Crédito Líquido */}
      <motion.div
        initial={{ scale: 0.96, opacity: 0.8 }}
        animate={{ scale: 1, opacity: 1 }}
        className="p-8 rounded-3xl text-center"
        style={{
          background: 'linear-gradient(135deg, #1A1400 0%, #0D0A00 100%)',
          border: '1px solid var(--gold-border)',
        }}
      >
        <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: 'var(--gold)' }}>
          Crédito Líquido Disponível
        </p>
        <p className="text-5xl md:text-6xl font-black mb-2" style={{ fontFamily: 'Montserrat', color: 'var(--gold)' }}>
          {fmt(r.creditoLiquido)}
        </p>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {isEmbutido
            ? `${100 - r.lanceCartaPercent}% do crédito atualizado após lance embutido de ${r.lanceCartaPercent}%`
            : 'crédito integral — lance livre não reduz a carta'}
        </p>

        {isEmbutido && (
          <div className="mt-5 flex justify-center gap-3 flex-wrap">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
              style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)' }}
            >
              <Gavel size={13} style={{ color: 'var(--gold)' }} />
              <span className="text-xs font-bold" style={{ color: 'var(--gold)' }}>
                Lance: {fmt(r.lanceTotal)} ({r.lanceTotalPercent}%)
              </span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Grid de stats */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          label="Crédito Atualizado (INCC)"
          value={fmt(r.valorCreditoAtualizado)}
          sub={`mês ${data.mesContemplacao} · INCC ${data.inccAnual}% a.a.`}
          accent
        />
        {isEmbutido ? (
          <>
            <StatCard
              label="Carta usada no lance"
              value={fmt(r.lanceCartaValor)}
              sub={`${r.lanceCartaPercent}% — embutido`}
              color="var(--gold)"
            />
            {r.recursosPropriosLance > 0 && (
              <StatCard
                label="Recursos próprios"
                value={fmt(r.recursosPropriosLance)}
                sub={`${r.lanceTotalPercent - r.lanceCartaPercent}% do crédito`}
                color="#5EB9AA"
              />
            )}
          </>
        ) : (
          <StatCard
            label="Lance (recursos próprios)"
            value={fmt(r.lanceTotal)}
            sub={`${r.lanceTotalPercent}% do crédito`}
            color="#5EB9AA"
          />
        )}
        <StatCard
          label="Saldo Devedor após lance"
          value={fmt(r.saldoDevedor)}
          sub={`${r.parcelasEfetivas} parcelas efetivas restantes`}
        />
        <StatCard
          label="Parcela Posterior"
          value={`${fmt(r.parcela)}/mês`}
          sub={`${data.prazoTotal} meses · ${data.taxaAdm}% adm`}
        />
      </div>

      {/* Linha do tempo simplificada */}
      <div className="rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
        <div className="px-5 py-3" style={{ background: 'var(--gold-dim)' }}>
          <p className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--gold)' }}>
            Fluxo Pós-Contemplação
          </p>
        </div>
        <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
          <div className="flex justify-between items-center px-5 py-3 text-sm">
            <span style={{ color: 'var(--text-secondary)' }}>Crédito bruto na contemplação</span>
            <span className="font-bold text-white">{fmt(r.valorCreditoAtualizado)}</span>
          </div>
          {isEmbutido && (
            <div className="flex justify-between items-center px-5 py-3 text-sm">
              <span style={{ color: 'var(--text-secondary)' }}>(-) Lance embutido da carta</span>
              <span className="font-bold" style={{ color: 'var(--gold)' }}>− {fmt(r.lanceCartaValor)}</span>
            </div>
          )}
          <div
            className="flex justify-between items-center px-5 py-3 text-sm font-black"
            style={{ background: 'rgba(201,168,76,0.06)' }}
          >
            <span style={{ color: 'var(--gold)' }}>= Crédito líquido para uso</span>
            <span style={{ color: 'var(--gold)', fontFamily: 'Montserrat' }}>{fmt(r.creditoLiquido)}</span>
          </div>
          <div className="flex justify-between items-center px-5 py-3 text-sm">
            <span style={{ color: 'var(--text-secondary)' }}>Saldo devedor restante</span>
            <span className="font-bold text-white">{fmt(r.saldoDevedor)}</span>
          </div>
          <div className="flex justify-between items-center px-5 py-3 text-sm">
            <span style={{ color: 'var(--text-secondary)' }}>Parcela mensal (inalterada)</span>
            <span className="font-bold text-white">{fmt(r.parcela)}/mês</span>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl border text-xs" style={{ background: 'rgba(193,177,118,0.05)', borderColor: 'rgba(193,177,118,0.2)', color: 'var(--text-secondary)' }}>
        <Info size={13} className="inline mr-1.5" style={{ color: 'var(--gold)' }} />
        {isEmbutido
          ? <>O <strong style={{ color: 'white' }}>lance embutido</strong> sai do seu crédito: você recebe menos carta, mas o saldo devedor cai pelo mesmo valor. A parcela permanece a mesma — menos meses a pagar.</>
          : <>No <strong style={{ color: 'white' }}>lance livre</strong>, você desembolsa recursos próprios e recebe o crédito integral. O saldo devedor e a parcela não mudam.</>}
      </div>
    </div>
  );
}
