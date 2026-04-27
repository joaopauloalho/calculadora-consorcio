import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Home, Car, Shield, TrendingUp, ToggleLeft, ToggleRight } from 'lucide-react';
import { calculateCartaAplicada, fmt, type CartaAplicadaData } from '../lib/calculations';
import BRLInput from '../components/BRLInput';
import { Label } from '../components/shared';

const IMOVEL_PRAZOS = [220];
const VEICULO_PRAZOS = [48, 100, 120];

interface Props {
  onBack: () => void;
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

function ToggleRow({ active, onClick, icon, title, sub }: {
  active: boolean; onClick: () => void; icon: React.ReactNode; title: string; sub: string;
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
        <span style={{ color: active ? 'var(--gold)' : 'var(--text-secondary)' }}>{icon}</span>
        <div className="text-left">
          <p className="text-sm font-bold" style={{ color: active ? 'var(--gold)' : 'white' }}>{title}</p>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{sub}</p>
        </div>
      </div>
      {active
        ? <ToggleRight size={22} style={{ color: 'var(--gold)' }} />
        : <ToggleLeft size={22} style={{ color: 'var(--text-secondary)' }} />}
    </button>
  );
}

export default function CartaAplicada({ onBack }: Props) {
  const [data, setData] = useState<CartaAplicadaData>({
    assetType: 'imovel',
    valorCredito: 500000,
    prazoTotal: 220,
    mesContemplacao: 24,
    selicAnual: 10.5,
    paymentMode: 'meia',
    comSeguro: false,
    mesAnalise: 12,
  });
  const [customPrazoStr, setCustomPrazoStr] = useState('');

  const set = <K extends keyof CartaAplicadaData>(key: K) =>
    (v: CartaAplicadaData[K]) => setData((d) => ({ ...d, [key]: v }));

  const setAssetType = (type: CartaAplicadaData['assetType']) => {
    const defaultPrazo = type === 'imovel' ? 220 : 48;
    setCustomPrazoStr('');
    setData((d) => ({
      ...d,
      assetType: type,
      prazoTotal: defaultPrazo,
      mesContemplacao: Math.min(d.mesContemplacao, defaultPrazo - 1),
      mesAnalise: Math.min(d.mesAnalise, defaultPrazo - Math.min(d.mesContemplacao, defaultPrazo - 1)),
    }));
  };

  const setPrazo = (prazo: number) => {
    setCustomPrazoStr('');
    setData((d) => {
      const newMesContemp = Math.min(d.mesContemplacao, prazo - 1);
      return {
        ...d,
        prazoTotal: prazo,
        mesContemplacao: newMesContemp,
        mesAnalise: Math.min(d.mesAnalise, prazo - newMesContemp),
      };
    });
  };

  const handleCustomPrazo = (val: string) => {
    setCustomPrazoStr(val);
    const n = parseInt(val);
    if (n > 0) {
      const maxPrazo = data.assetType === 'imovel' ? 220 : 120;
      const clamped = Math.min(n, maxPrazo);
      setCustomPrazoStr(String(clamped));
      setData((d) => {
        const newMesContemp = Math.min(d.mesContemplacao, clamped - 1);
        return {
          ...d,
          prazoTotal: clamped,
          mesContemplacao: newMesContemp,
          mesAnalise: Math.min(d.mesAnalise, clamped - newMesContemp),
        };
      });
    }
  };

  const maxMesAnalise = Math.max(1, data.prazoTotal - data.mesContemplacao);
  const r = calculateCartaAplicada(data);
  const isSaldoPositive = r.saldoLiquido >= 0;
  const prazos = data.assetType === 'imovel' ? IMOVEL_PRAZOS : VEICULO_PRAZOS;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-black)' }}>
      <nav
        className="sticky top-0 z-50 border-b"
        style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', borderColor: 'var(--border)' }}
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
              style={{ background: 'rgba(204,51,102,0.2)' }}
            >
              <TrendingUp size={14} style={{ color: 'var(--alert)' }} />
            </div>
            <span className="font-black text-sm" style={{ fontFamily: 'Montserrat', color: 'white' }}>
              Carta{' '}<span style={{ color: 'var(--alert)' }}>Aplicada</span>
            </span>
          </div>
          <div className="w-16" />
        </div>
      </nav>

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

          {/* LEFT — Inputs */}
          <div className="space-y-6">

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

            <div>
              <Label>Valor do Crédito (R$)</Label>
              <BRLInput value={data.valorCredito} onChange={set('valorCredito')} />
            </div>

            <div>
              <Label>Taxa Selic Atual (% a.a.)</Label>
              <input
                type="number"
                inputMode="decimal"
                step="0.25"
                value={data.selicAnual === 0 ? '' : data.selicAnual}
                onChange={(e) => set('selicAnual')(e.target.value === '' ? 0 : Number(e.target.value))}
              />
              <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
                CDI utilizado:{' '}
                <strong style={{ color: 'var(--gold)' }}>{(r.cdiAnual * 100).toFixed(2)}% a.a.</strong>
                {'  ·  '}Mensal:{' '}
                <strong style={{ color: 'white' }}>{(r.cdiMensal * 100).toFixed(3)}% a.m.</strong>
              </p>
            </div>

            <div>
              <Label>Prazo do Grupo</Label>
              <div className="flex flex-wrap gap-2">
                {prazos.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPrazo(p)}
                    className="px-4 py-2 rounded-xl border font-bold text-sm transition-all"
                    style={{
                      background: data.prazoTotal === p && !customPrazoStr ? 'var(--gold)' : 'var(--bg-card)',
                      borderColor: data.prazoTotal === p && !customPrazoStr ? 'var(--gold)' : 'var(--border)',
                      color: data.prazoTotal === p && !customPrazoStr ? 'black' : 'var(--text-secondary)',
                    }}
                  >
                    {p}m
                  </button>
                ))}
              </div>
              <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
                Taxa Adm:{' '}
                <strong style={{ color: 'var(--gold)' }}>{(r.taxaAdm * 100).toFixed(1)}%</strong>
                {'  ·  '}Parcela cheia:{' '}
                <strong style={{ color: 'white' }}>{fmt(r.parcelaCheia)}</strong>
              </p>
              <div className="mt-3">
                <p className="text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Grupo em andamento?
                </p>
                <input
                  type="number"
                  inputMode="numeric"
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

            <div>
              <Label>Modalidade de Pagamento (pré-contemplação)</Label>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { mode: 'meia' as const, label: 'Meia Parcela', value: fmt(r.meiaParcela + (data.comSeguro ? r.seguroMensalMedioPreContemp : 0)) },
                  { mode: 'cheia' as const, label: 'Parcela Inteira', value: fmt(r.parcelaCheia + (data.comSeguro ? r.seguroMensalMedioPreContemp : 0)) },
                ] as const).map(({ mode, label, value }) => (
                  <button
                    key={mode}
                    onClick={() => set('paymentMode')(mode)}
                    className="p-3 rounded-2xl border text-left transition-all"
                    style={{
                      background: data.paymentMode === mode ? 'rgba(193,177,118,0.12)' : 'var(--bg-card)',
                      borderColor: data.paymentMode === mode ? 'var(--gold)' : 'var(--border)',
                    }}
                  >
                    <p
                      className="text-xs font-bold uppercase tracking-widest mb-1"
                      style={{ color: data.paymentMode === mode ? 'var(--gold)' : 'var(--text-secondary)' }}
                    >
                      {label}
                    </p>
                    <p className="font-black text-base" style={{ fontFamily: 'Montserrat', color: 'white' }}>
                      {value}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <ToggleRow
              active={data.comSeguro}
              onClick={() => set('comSeguro')(!data.comSeguro)}
              icon={<Shield size={18} />}
              title="Com Seguro (pré-contemplação)"
              sub={`${(r.seguroPercent * 100).toFixed(4)}% s/ saldo devedor / mês`}
            />

            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>Mês de Contemplação</Label>
                <span className="text-sm font-black" style={{ color: 'var(--gold)', fontFamily: 'Montserrat' }}>
                  Mês {data.mesContemplacao}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={data.prazoTotal - 1}
                value={data.mesContemplacao}
                onChange={(e) => {
                  const newContemp = Number(e.target.value);
                  const maxAnalise = data.prazoTotal - newContemp;
                  setData((d) => ({
                    ...d,
                    mesContemplacao: newContemp,
                    mesAnalise: Math.min(d.mesAnalise, maxAnalise),
                  }));
                }}
                className="w-full"
              />
              <div className="flex justify-between text-[11px] mt-1" style={{ color: 'var(--text-secondary)' }}>
                <span>Mês 1</span>
                <span>Mês {data.prazoTotal - 1}</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>Meses Pós-Contemplação</Label>
                <span className="text-sm font-black" style={{ color: 'var(--alert)', fontFamily: 'Montserrat' }}>
                  +{data.mesAnalise} meses
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={maxMesAnalise}
                value={Math.min(data.mesAnalise, maxMesAnalise)}
                onChange={(e) => set('mesAnalise')(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-[11px] mt-1" style={{ color: 'var(--text-secondary)' }}>
                <span>+1 mês</span>
                <span>+{maxMesAnalise} meses</span>
              </div>
              <p className="text-[11px] mt-1.5" style={{ color: 'rgba(160,160,160,0.5)' }}>
                Mês total: {data.mesContemplacao + data.mesAnalise} de {data.prazoTotal}
              </p>
            </div>

          </div>

          {/* RIGHT — Results */}
          <div className="space-y-4 md:sticky md:top-24 md:self-start">

            <div
              className="p-6 rounded-3xl border"
              style={{
                background: 'linear-gradient(135deg, rgba(204,51,102,0.12) 0%, rgba(0,0,0,0) 100%)',
                borderColor: 'rgba(204,51,102,0.3)',
              }}
            >
              <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: 'var(--alert)' }}>
                Crédito no Mês +{data.mesAnalise} pós-contemplação
              </p>
              <p className="text-4xl font-black mb-1" style={{ fontFamily: 'Montserrat', color: 'white' }}>
                <AnimatedValue value={fmt(r.creditoNoMesAnalise)} />
              </p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Crescendo {(r.cdiMensal * 100).toFixed(3)}% a.m. (CDI = Selic − 0,10%)
              </p>
            </div>

            <div
              className="p-4 rounded-2xl border"
              style={{ background: 'rgba(193,177,118,0.06)', borderColor: 'rgba(193,177,118,0.2)' }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Crédito na Contemplação
                  </p>
                  <p className="text-xl font-black" style={{ fontFamily: 'Montserrat', color: 'var(--gold)' }}>
                    <AnimatedValue value={fmt(r.creditoNaContemplacao)} />
                  </p>
                </div>
                <span
                  className="text-[10px] font-black px-2 py-1 rounded-lg shrink-0 mt-0.5"
                  style={{ background: 'rgba(193,177,118,0.15)', color: 'var(--gold)' }}
                >
                  {r.correcaoIndice} {(r.correcaoAnual * 100).toFixed(0)}% a.a.
                </span>
              </div>
            </div>

            <div className="p-5 rounded-2xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-secondary)' }}>
                Parcela Pós-Contemplação
              </p>
              <p className="text-2xl font-black" style={{ fontFamily: 'Montserrat', color: 'white' }}>
                <AnimatedValue value={fmt(r.parcelaPosContemp)} />
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                Parcela cheia + seguro obrigatório
              </p>
            </div>

            <div className="p-4 rounded-2xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: 'var(--text-secondary)' }}>Pago Pré</p>
                  <p className="text-sm font-black text-white" style={{ fontFamily: 'Montserrat' }}>
                    <AnimatedValue value={fmt(r.totalPagoPreContemp)} />
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: 'var(--text-secondary)' }}>Pago Pós</p>
                  <p className="text-sm font-black text-white" style={{ fontFamily: 'Montserrat' }}>
                    <AnimatedValue value={fmt(r.totalPagoPosContemp)} />
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: 'var(--text-secondary)' }}>Total Pago</p>
                  <p className="text-sm font-black" style={{ fontFamily: 'Montserrat', color: 'var(--gold)' }}>
                    <AnimatedValue value={fmt(r.totalPagoGeral)} />
                  </p>
                </div>
              </div>
            </div>

            <div
              className="p-6 rounded-3xl"
              style={{
                background: isSaldoPositive
                  ? 'linear-gradient(135deg, #001A0D 0%, #000D06 100%)'
                  : 'linear-gradient(135deg, #1A0006 0%, #0D0003 100%)',
                border: `1px solid ${isSaldoPositive ? 'rgba(0,200,100,0.3)' : 'rgba(204,51,102,0.3)'}`,
              }}
            >
              <p
                className="text-xs font-black uppercase tracking-widest mb-4"
                style={{ color: isSaldoPositive ? '#00C864' : 'var(--alert)' }}
              >
                Saldo Líquido
              </p>

              <div className="mb-4">
                <p
                  className="text-4xl font-black"
                  style={{ fontFamily: 'Montserrat', color: isSaldoPositive ? '#00C864' : 'var(--alert)' }}
                >
                  <AnimatedValue value={fmt(r.saldoLiquido)} />
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                  {fmt(r.creditoNoMesAnalise)} − {fmt(r.totalPagoGeral)}
                </p>
              </div>

              <div
                className="h-px mb-4"
                style={{ background: isSaldoPositive ? 'rgba(0,200,100,0.15)' : 'rgba(204,51,102,0.15)' }}
              />

              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Rentabilidade Mensal
                </p>
                <p
                  className="text-2xl font-black"
                  style={{ fontFamily: 'Montserrat', color: isSaldoPositive ? '#00C864' : 'var(--alert)' }}
                >
                  <AnimatedValue value={`${r.rentabilidadeMensal.toFixed(2)}% a.m.`} />
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
