import { useState } from 'react';
import { ChevronLeft, Trophy, Zap, Shield, Star, Diamond, CheckCircle2, XCircle, Info } from 'lucide-react';
import { fmt } from '../lib/calculations';
import BRLInput from '../components/BRLInput';
import { Label } from '../components/shared';

interface Props {
  onBack: () => void;
}

const TIPOS_LANCE = [
  {
    nome: 'Ello Sem Carência',
    carencia: 0,
    percentLance: 29,
    icon: Zap,
    cor: 'var(--gold)',
    corBg: 'rgba(193,177,118,0.08)',
    descricao: 'Disponível imediatamente, sem exigência de carência.',
  },
  {
    nome: 'Ello Bronze',
    carencia: 6,
    percentLance: 29,
    icon: Shield,
    cor: '#CD7F32',
    corBg: 'rgba(205,127,50,0.08)',
    descricao: '6 parcelas consecutivas pagas no prazo.',
  },
  {
    nome: 'Ello Prata',
    carencia: 12,
    percentLance: 26,
    icon: Star,
    cor: '#C0C0C0',
    corBg: 'rgba(192,192,192,0.08)',
    descricao: '12 parcelas consecutivas pagas no prazo.',
  },
  {
    nome: 'Ello Ouro',
    carencia: 24,
    percentLance: 23,
    icon: Trophy,
    cor: 'var(--gold)',
    corBg: 'rgba(193,177,118,0.08)',
    descricao: '24 parcelas consecutivas pagas no prazo.',
  },
  {
    nome: 'Ello Diamante',
    carencia: 36,
    percentLance: 0,
    icon: Diamond,
    cor: '#B9F2FF',
    corBg: 'rgba(185,242,255,0.08)',
    descricao: '36 parcelas em dia. Contemplação garantida sem redução de crédito.',
  },
];

export default function SimuladorLance({ onBack }: Props) {
  const [valorCredito, setValorCredito] = useState(1000000);
  const [mesesEmDia, setMesesEmDia] = useState(0);

  const resultados = TIPOS_LANCE.map((tipo) => {
    const elegivel = mesesEmDia >= tipo.carencia;
    const valorLance = Math.round(valorCredito * tipo.percentLance / 100);
    const creditoEfetivo = valorCredito - valorLance;
    const reducaoCredito = tipo.percentLance;
    const faltamMeses = Math.max(0, tipo.carencia - mesesEmDia);
    return { ...tipo, elegivel, valorLance, creditoEfetivo, reducaoCredito, faltamMeses };
  });

  const totalElegiveis = resultados.filter((r) => r.elegivel).length;

  return (
    <div className="min-h-screen bg-black px-6 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Nav */}
        <div className="mb-10">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-semibold mb-8 transition-opacity hover:opacity-60"
            style={{ color: 'var(--text-secondary)' }}
          >
            <ChevronLeft size={16} /> Voltar
          </button>

          <p
            className="text-[10px] font-bold uppercase tracking-[0.35em] mb-3"
            style={{ color: 'var(--gold)' }}
          >
            Estratégia de Contemplação
          </p>
          <h2
            className="text-3xl md:text-5xl font-black leading-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            Simulador de
            <br />
            <span style={{ color: 'var(--gold)' }}>Lance</span>
          </h2>
        </div>

        {/* Card de inputs */}
        <div
          className="p-6 rounded-2xl border mb-8"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Valor do Crédito (R$)</Label>
              <BRLInput
                value={valorCredito}
                onChange={setValorCredito}
                placeholder="1.000.000,00"
              />
            </div>

            <div>
              <Label>Meses Consecutivos Pagos em Dia</Label>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                max={220}
                value={mesesEmDia === 0 ? '' : mesesEmDia}
                placeholder="0"
                onChange={(e) => {
                  const n = parseInt(e.target.value, 10);
                  setMesesEmDia(isNaN(n) ? 0 : Math.min(220, Math.max(0, n)));
                }}
                className="rounded-xl px-4 py-3 border text-base font-bold w-full"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                  fontFamily: 'Montserrat',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <p className="mt-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
            Você se qualifica para{' '}
            <span style={{ color: 'var(--gold)', fontFamily: 'Montserrat' }}>
              {totalElegiveis}
            </span>{' '}
            tipo{totalElegiveis !== 1 ? 's' : ''} de lance
          </p>
        </div>

        {/* Grid de cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {resultados.map((tipo) => {
            const Icon = tipo.icon;
            const isDiamante = tipo.percentLance === 0;

            return (
              <div
                key={tipo.nome}
                className="relative p-6 rounded-2xl border transition-all duration-300 overflow-hidden"
                style={{
                  background: tipo.elegivel ? tipo.corBg : 'var(--bg-card)',
                  borderColor: tipo.elegivel ? tipo.cor : 'var(--border)',
                  opacity: tipo.elegivel ? 1 : 0.6,
                }}
              >
                {/* Top accent line for eligible */}
                {tipo.elegivel && (
                  <div
                    className="absolute top-0 left-0 right-0 h-px"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${tipo.cor}, transparent)`,
                      opacity: 0.7,
                    }}
                  />
                )}

                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: tipo.elegivel ? `${tipo.cor}22` : 'rgba(255,255,255,0.05)' }}
                    >
                      <Icon size={18} style={{ color: tipo.elegivel ? tipo.cor : 'var(--text-secondary)' }} />
                    </div>
                    <div>
                      <h3
                        className="text-sm font-black leading-tight"
                        style={{ color: tipo.elegivel ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                      >
                        {tipo.nome}
                      </h3>
                      <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                        Carência: {tipo.carencia === 0 ? 'Nenhuma' : `${tipo.carencia} meses`}
                      </p>
                    </div>
                  </div>

                  {/* Badge */}
                  {tipo.elegivel ? (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <CheckCircle2 size={14} style={{ color: '#4ade80' }} />
                      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#4ade80' }}>
                        Elegível
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <XCircle size={14} style={{ color: 'var(--text-secondary)' }} />
                      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                        Indisponível
                      </span>
                    </div>
                  )}
                </div>

                {/* Faltam meses */}
                {!tipo.elegivel && tipo.faltamMeses > 0 && (
                  <div
                    className="mb-4 px-3 py-2 rounded-lg text-xs font-bold"
                    style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-secondary)' }}
                  >
                    Faltam <span style={{ color: 'var(--text-primary)', fontFamily: 'Montserrat' }}>{tipo.faltamMeses}</span> meses para se qualificar
                  </div>
                )}

                {/* Métricas */}
                <div className="space-y-3">
                  {/* Lance */}
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                      Lance
                    </span>
                    {isDiamante ? (
                      <span className="text-sm font-black" style={{ color: '#B9F2FF', fontFamily: 'Montserrat' }}>
                        Automático
                      </span>
                    ) : (
                      <span className="text-sm font-black" style={{ color: tipo.elegivel ? tipo.cor : 'var(--text-secondary)', fontFamily: 'Montserrat' }}>
                        {tipo.percentLance}% = {fmt(tipo.valorLance)}
                      </span>
                    )}
                  </div>

                  {/* Crédito Efetivo */}
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                      Crédito Efetivo
                    </span>
                    <span
                      className="text-sm font-black"
                      style={{
                        color: isDiamante ? '#4ade80' : tipo.elegivel ? 'var(--text-primary)' : 'var(--text-secondary)',
                        fontFamily: 'Montserrat',
                      }}
                    >
                      {fmt(tipo.creditoEfetivo)}
                    </span>
                  </div>

                  {/* Redução de crédito */}
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                      Redução de Crédito
                    </span>
                    {isDiamante ? (
                      <span className="text-sm font-black" style={{ color: '#4ade80', fontFamily: 'Montserrat' }}>
                        Nenhuma
                      </span>
                    ) : (
                      <span className="text-sm font-black" style={{ color: tipo.elegivel ? tipo.cor : 'var(--text-secondary)', fontFamily: 'Montserrat' }}>
                        {tipo.reducaoCredito}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Separador */}
                <div className="my-4 h-px" style={{ background: 'var(--border)' }} />

                {/* Descrição */}
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {tipo.descricao}
                </p>
              </div>
            );
          })}
        </div>

        {/* Info box */}
        <div
          className="flex gap-3 p-4 rounded-xl border"
          style={{ background: 'rgba(193,177,118,0.05)', borderColor: 'rgba(193,177,118,0.2)' }}
        >
          <Info size={16} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--gold)' }} />
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            <span className="font-bold" style={{ color: 'var(--text-primary)' }}>Lance embutido:</span>{' '}
            o valor do lance sai do seu crédito. A contemplação ocorre na próxima assembleia se seu lance for o maior. Após contemplado, seu crédito disponível é o crédito efetivo acima.
          </p>
        </div>
      </div>
    </div>
  );
}
