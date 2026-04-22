import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, Zap, Home, Car, Shield, TrendingUp,
  ToggleLeft, ToggleRight,
} from 'lucide-react';
import {
  calculateQuickCalc, fmt,
  type QuickCalcData,
} from '../lib/calculations';
import BRLInput from '../components/BRLInput';

const IMOVEL_PRAZOS = [220];
const VEICULO_PRAZOS = [48, 100, 120];

interface Props {
  onBack: () => void;
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-xs font-bold uppercase tracking-widest mb-2"
      style={{ color: 'var(--text-secondary)' }}
    >
      {children}
    </p>
  );
}

function AnimatedValue({ value }: { value: string }) {
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={value}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.18 }}
        style={{ display: 'inline-block' }}
      >
        {value}
      </motion.span>
    </AnimatePresence>
  );
}

function ResultCard({
  label, value, sub, gold,
}: {
  label: string; value: string; sub?: string; gold?: boolean;
}) {
  return (
    <div
      className="p-5 rounded-2xl border"
      style={{
        background: 'var(--bg-card)',
        borderColor: gold ? 'rgba(193,177,118,0.4)' : 'var(--border)',
      }}
    >
      <Label>{label}</Label>
      <p
        className="text-3xl font-black"
        style={{ fontFamily: 'Montserrat', color: gold ? 'var(--gold)' : 'white' }}
      >
        <AnimatedValue value={value} />
      </p>
      {sub && (
        <p className="text-xs mt-1.5" style={{ color: 'var(--text-secondary)' }}>
          {sub}
        </p>
      )}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p
        className="text-[10px] font-bold uppercase tracking-widest mb-0.5"
        style={{ color: 'var(--text-secondary)' }}
      >
        {label}
      </p>
      <p className="text-base font-black text-white" style={{ fontFamily: 'Montserrat' }}>
        {value}
      </p>
    </div>
  );
}

function ToggleRow({
  active, onClick, icon, title, sub,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  sub: string;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 rounded-2xl border transition-all"
      style={{
        background: active ? 'rgba(193,177,118,0.1)' : 'var(--bg-card)',
        borderColor: active ? 'var(--gold)' : 'var(--border)',
      }}
    >
      <div className="flex items-center gap-3">
        <span style={{ color: active ? 'var(--gold)' : 'var(--text-secondary)' }}>
          {icon}
        </span>
        <div className="text-left">
          <p
            className="text-sm font-bold"
            style={{ color: active ? 'var(--gold)' : 'white' }}
          >
            {title}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            {sub}
          </p>
        </div>
      </div>
      {active
        ? <ToggleRight size={22} style={{ color: 'var(--gold)' }} />
        : <ToggleLeft size={22} style={{ color: 'var(--text-secondary)' }} />}
    </button>
  );
}

export default function QuickCalc({ onBack }: Props) {
  const [data, setData] = useState<QuickCalcData>({
    assetType: 'imovel',
    valorCredito: 500000,
    prazoTotal: 220,
    comSeguro: false,
    paymentMode: 'meia',
    mesContemplacao: 24,
    venderComLucro: false,
    percentAgio: 20,
  });
  const [customPrazoStr, setCustomPrazoStr] = useState('');

  const set = <K extends keyof QuickCalcData>(key: K) =>
    (v: QuickCalcData[K]) => setData((d) => ({ ...d, [key]: v }));

  const setAssetType = (type: QuickCalcData['assetType']) => {
    const defaultPrazo = type === 'imovel' ? 220 : 48;
    setCustomPrazoStr('');
    setData((d) => ({
      ...d,
      assetType: type,
      prazoTotal: defaultPrazo,
      mesContemplacao: Math.min(d.mesContemplacao, defaultPrazo),
    }));
  };

  const setPrazo = (prazo: number) => {
    setCustomPrazoStr('');
    setData((d) => ({
      ...d,
      prazoTotal: prazo,
      mesContemplacao: Math.min(d.mesContemplacao, prazo),
    }));
  };

  const handleCustomPrazo = (val: string) => {
    setCustomPrazoStr(val);
    const n = parseInt(val);
    if (n > 0) {
      const maxPrazo = data.assetType === 'imovel' ? 220 : 120;
      const clamped = Math.min(n, maxPrazo);
      setCustomPrazoStr(String(clamped));
      setData((d) => ({
        ...d,
        prazoTotal: clamped,
        mesContemplacao: Math.min(d.mesContemplacao, clamped),
      }));
    }
  };

  const r = calculateQuickCalc(data);
  const parcelaAtualBase =
    data.paymentMode === 'meia' ? r.meiaParcela : r.parcelaCheiaOriginal;
  const isLucroPositive = r.lucroLiquido >= 0;
  const prazos = data.assetType === 'imovel' ? IMOVEL_PRAZOS : VEICULO_PRAZOS;

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
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
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
              <Zap size={14} className="text-black" />
            </div>
            <span
              className="font-black text-sm"
              style={{ fontFamily: 'Montserrat', color: 'white' }}
            >
              Calculadora{' '}
              <span style={{ color: 'var(--gold)' }}>Expressa</span>
            </span>
          </div>
          <div className="w-16" />
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

          {/* LEFT — Inputs */}
          <div className="space-y-6">

            {/* Asset type */}
            <div>
              <Label>Tipo de Bem</Label>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { type: 'imovel' as const, icon: <Home size={16} />, label: 'Imóvel' },
                  { type: 'veiculo' as const, icon: <Car size={16} />, label: 'Veículo' },
                ] as const).map(({ type, icon, label }) => (
                  <button
                    key={type}
                    onClick={() => setAssetType(type)}
                    className="flex items-center justify-center gap-2 py-3 rounded-2xl border font-bold text-sm transition-all"
                    style={{
                      background: data.assetType === type ? 'var(--gold)' : 'var(--bg-card)',
                      borderColor: data.assetType === type ? 'var(--gold)' : 'var(--border)',
                      color: data.assetType === type ? 'black' : 'white',
                    }}
                  >
                    {icon} {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Credit value */}
            <div>
              <Label>Valor do Crédito (R$)</Label>
              <BRLInput value={data.valorCredito} onChange={set('valorCredito')} />
            </div>

            {/* Prazo */}
            <div>
              <Label>Prazo do Grupo</Label>
              <div className="flex flex-wrap gap-2">
                {prazos.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPrazo(p)}
                    className="px-4 py-2 rounded-xl border font-bold text-sm transition-all"
                    style={{
                      background: data.prazoTotal === p ? 'var(--gold)' : 'var(--bg-card)',
                      borderColor: data.prazoTotal === p ? 'var(--gold)' : 'var(--border)',
                      color: data.prazoTotal === p ? 'black' : 'var(--text-secondary)',
                    }}
                  >
                    {p}m
                  </button>
                ))}
              </div>
              <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
                Taxa Adm:{' '}
                <strong style={{ color: 'var(--gold)' }}>
                  {(r.taxaAdm * 100).toFixed(1)}%
                </strong>
                {'  ·  '}Parcela cheia:{' '}
                <strong style={{ color: 'white' }}>{fmt(r.parcelaCheiaOriginal)}</strong>
              </p>

              {/* Grupo em andamento */}
              <div className="mt-3">
                <p className="text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Grupo em andamento?
                </p>
                <input
                  type="number"
                  placeholder={`Máx. ${data.assetType === 'imovel' ? 220 : 120} meses`}
                  value={customPrazoStr}
                  onChange={(e) => handleCustomPrazo(e.target.value)}
                  style={{ marginBottom: 0 }}
                />
                <p className="text-[11px] mt-1.5" style={{ color: 'rgba(160,160,160,0.5)' }}>
                  Se o grupo já iniciou, informe quantas parcelas ainda faltam.
                </p>
              </div>
            </div>

            {/* Payment mode */}
            <div>
              <Label>Modalidade de Pagamento</Label>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { mode: 'meia' as const, label: 'Meia Parcela', value: fmt(r.meiaParcela + (data.comSeguro ? r.seguroMensalMedio : 0)) },
                  { mode: 'cheia' as const, label: 'Parcela Inteira', value: fmt(r.parcelaCheiaOriginal + (data.comSeguro ? r.seguroMensalMedio : 0)) },
                ] as const).map(({ mode, label, value }) => (
                  <button
                    key={mode}
                    onClick={() => set('paymentMode')(mode)}
                    className="p-3 rounded-2xl border text-left transition-all"
                    style={{
                      background:
                        data.paymentMode === mode
                          ? 'rgba(193,177,118,0.12)'
                          : 'var(--bg-card)',
                      borderColor:
                        data.paymentMode === mode ? 'var(--gold)' : 'var(--border)',
                    }}
                  >
                    <p
                      className="text-xs font-bold uppercase tracking-widest mb-1"
                      style={{
                        color:
                          data.paymentMode === mode
                            ? 'var(--gold)'
                            : 'var(--text-secondary)',
                      }}
                    >
                      {label}
                    </p>
                    <p
                      className="font-black text-base"
                      style={{ fontFamily: 'Montserrat', color: 'white' }}
                    >
                      {value}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Seguro toggle */}
            <ToggleRow
              active={data.comSeguro}
              onClick={() => set('comSeguro')(!data.comSeguro)}
              icon={<Shield size={18} />}
              title="Com Seguro (pré-contemplação)"
              sub={`${(r.seguroPercent * 100).toFixed(4)}% s/ saldo devedor / mês`}
            />

            {/* Contemplação slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>Mês de Contemplação</Label>
                <span
                  className="text-sm font-black"
                  style={{ color: 'var(--gold)', fontFamily: 'Montserrat' }}
                >
                  Mês {data.mesContemplacao}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={data.prazoTotal}
                value={data.mesContemplacao}
                onChange={(e) => set('mesContemplacao')(Number(e.target.value))}
                className="w-full"
              />
              <div
                className="flex justify-between text-[11px] mt-1"
                style={{ color: 'var(--text-secondary)' }}
              >
                <span>Mês 1</span>
                <span>Mês {data.prazoTotal}</span>
              </div>
            </div>

            {/* Vender com lucro toggle */}
            <ToggleRow
              active={data.venderComLucro}
              onClick={() => set('venderComLucro')(!data.venderComLucro)}
              icon={<TrendingUp size={18} />}
              title="Vender com Lucro"
              sub="Calcula ROI e rentabilidade mensal da operação"
            />

            <AnimatePresence>
              {data.venderComLucro && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div>
                    <Label>Ágio sobre o crédito (%)</Label>
                    <input
                      type="number"
                      value={data.percentAgio === 0 ? '' : data.percentAgio}
                      onChange={(e) =>
                        set('percentAgio')(
                          e.target.value === '' ? 0 : Number(e.target.value),
                        )
                      }
                    />
                    <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
                      Valor de venda:{' '}
                      <strong style={{ color: 'var(--gold)' }}>{fmt(r.valorVenda)}</strong>
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT — Results */}
          <div className="space-y-4 md:sticky md:top-24 md:self-start">
            <ResultCard
              label="Total Investido até a Contemplação"
              value={fmt(r.totalInvestido)}
              sub={`${data.mesContemplacao} meses × ${fmt(r.parcelaEfetivaPreContemp)}${data.comSeguro ? ' (c/ seguro)' : ''}`}
              gold
            />

            <ResultCard
              label="Nova Parcela Pós-Contemplação"
              value={fmt(r.parcelaNova)}
              sub="Parcela cheia + seguro obrigatório"
            />

            <div
              className="p-4 rounded-2xl border"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
            >
              <div className="grid grid-cols-2 gap-4">
                <MiniStat label="Saldo Devedor" value={fmt(r.saldoDevedorContemplacao)} />
                <MiniStat label="Total c/ Taxa Adm" value={fmt(r.totalComTaxa)} />
              </div>
            </div>

            <div
              className="p-4 rounded-2xl border"
              style={{ background: 'rgba(193,177,118,0.06)', borderColor: 'rgba(193,177,118,0.2)' }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Crédito Atualizado na Contemplação
                  </p>
                  <p className="text-xl font-black" style={{ fontFamily: 'Montserrat', color: 'var(--gold)' }}>
                    <AnimatedValue value={fmt(r.creditoAtualizado)} />
                  </p>
                </div>
                <span
                  className="text-[10px] font-black px-2 py-1 rounded-lg shrink-0 mt-0.5"
                  style={{ background: 'rgba(193,177,118,0.15)', color: 'var(--gold)' }}
                >
                  {r.correcaoIndice} {(r.correcaoAnual * 100).toFixed(0)}% a.a.
                </span>
              </div>
              <p className="text-[11px] mt-1.5" style={{ color: 'rgba(160,160,160,0.5)' }}>
                Valor real do crédito no mês {data.mesContemplacao}, corrigido pelo {r.correcaoIndice}
              </p>
            </div>

            {/* Profit panel */}
            <AnimatePresence>
              {data.venderComLucro && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 8 }}
                  transition={{ duration: 0.25 }}
                  className="p-6 rounded-3xl"
                  style={{
                    background: 'linear-gradient(135deg, #1A1A00 0%, #0D0D00 100%)',
                    border: '1px solid rgba(193,177,118,0.3)',
                  }}
                >
                  <p
                    className="text-xs font-black uppercase tracking-widest mb-5"
                    style={{ color: 'var(--gold)' }}
                  >
                    Painel de Lucro
                  </p>

                  <div className="mb-4">
                    <p
                      className="text-xs font-bold uppercase tracking-widest mb-1"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      Lucro Líquido
                    </p>
                    <p
                      className="text-4xl font-black"
                      style={{
                        fontFamily: 'Montserrat',
                        color: isLucroPositive ? '#00C864' : 'var(--alert)',
                      }}
                    >
                      <AnimatedValue value={fmt(r.lucroLiquido)} />
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                      {fmt(r.valorVenda)} − {fmt(r.totalInvestido)}
                    </p>
                  </div>

                  <div
                    className="h-px mb-4"
                    style={{ background: 'rgba(193,177,118,0.15)' }}
                  />

                  <div>
                    <p
                      className="text-[10px] font-bold uppercase tracking-widest mb-1"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      Rentabilidade Mensal
                    </p>
                    <p
                      className="text-2xl font-black"
                      style={{ fontFamily: 'Montserrat', color: 'var(--gold)' }}
                    >
                      <AnimatedValue value={`${r.rentabilidadeMensal.toFixed(2)}% a.m.`} />
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
