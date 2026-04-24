import { motion } from 'framer-motion';
import { Zap, Building2, TrendingUp, ArrowRight } from 'lucide-react';

export type Purpose = 'quickcalc' | 'acquisition' | 'return';

interface Props {
  onSelect: (purpose: Purpose) => void;
}

const card = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0 },
};

const cards = [
  {
    id: 'quickcalc' as Purpose,
    iconEl: <Zap size={24} style={{ color: '#031715' }} />,
    iconBg: 'var(--gold)',
    title: 'Calculadora\nExpressa',
    description:
      'Simule qualquer cota em segundos. Imóvel ou veículo, com ou sem ágio — resultado imediato para fechar em reunião.',
    cta: 'Calcular agora',
    ctaColor: 'var(--gold)',
    glowColor: 'rgba(201, 168, 76, 0.22)',
    borderHover: 'rgba(201, 168, 76, 0.4)',
  },
  {
    id: 'acquisition' as Purpose,
    iconEl: <Building2 size={24} style={{ color: 'var(--gold)' }} />,
    iconBg: 'var(--gold-dim)',
    title: 'Com\nAquisição',
    description:
      'Use o crédito para adquirir terreno e construir para venda, ou comprar um imóvel e gerar renda com aluguel. Patrimônio real com consórcio.',
    cta: 'Explorar estratégias',
    ctaColor: 'var(--gold)',
    glowColor: 'rgba(201, 168, 76, 0.22)',
    borderHover: 'rgba(201, 168, 76, 0.4)',
  },
  {
    id: 'return' as Purpose,
    iconEl: <TrendingUp size={24} style={{ color: 'var(--alert)' }} />,
    iconBg: 'var(--alert-dim)',
    title: 'Sem\nAquisição',
    description:
      'Lucre na contemplação: venda a carta com ágio ou deixe o crédito crescer no CDI enquanto paga as parcelas. Retorno sem imobilizar capital.',
    cta: 'Explorar estratégias',
    ctaColor: 'var(--alert)',
    glowColor: 'rgba(94, 185, 170, 0.22)',
    borderHover: 'rgba(94, 185, 170, 0.4)',
  },
];

// Prestige logo mark — geometric fox/crest approximation
function PrestigeMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={Math.round(size * 0.82)} viewBox="0 0 44 36" fill="none">
      {/* Left wing */}
      <path d="M2 0 L13 0 L22 18 L11 36 L2 22 Z" fill="var(--gold)" />
      {/* Left inner cut */}
      <path d="M5 3 L12 3 L20 17 L12 30 L7 22 Z" fill="#031715" />
      {/* Right wing */}
      <path d="M42 0 L31 0 L22 18 L33 36 L42 22 Z" fill="var(--gold)" />
      {/* Right inner cut */}
      <path d="M39 3 L32 3 L24 17 L32 30 L37 22 Z" fill="#031715" />
    </svg>
  );
}

export default function PurposeScreen({ onSelect }: Props) {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 py-16">

      {/* Brand header */}
      <motion.div
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="text-center mb-16"
      >
        {/* Logo mark + wordmark */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <PrestigeMark size={42} />
          <div className="flex flex-col items-center gap-0.5">
            <span
              className="text-2xl font-light tracking-[0.18em] uppercase"
              style={{ color: 'var(--text-primary)', letterSpacing: '0.22em' }}
            >
              prestige
            </span>
            <span
              className="text-[9px] font-semibold tracking-[0.35em] uppercase"
              style={{ color: 'var(--text-secondary)' }}
            >
              Investimentos e Alavancagem
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-8">
          <div className="h-px flex-1 max-w-[80px]" style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.4))' }} />
          <span className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: 'var(--gold)' }}>
            Cockpit de Vendas
          </span>
          <div className="h-px flex-1 max-w-[80px]" style={{ background: 'linear-gradient(90deg, rgba(201,168,76,0.4), transparent)' }} />
        </div>

        <h1
          className="text-4xl md:text-5xl font-black leading-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          O que vamos
          <br />
          <span style={{ color: 'var(--gold)' }}>simular hoje?</span>
        </h1>
        <p
          className="mt-5 text-sm max-w-sm mx-auto leading-relaxed"
          style={{ color: 'var(--text-secondary)' }}
        >
          Escolha o modo de análise e comece a simulação.
        </p>
      </motion.div>

      {/* Cards */}
      <motion.div
        variants={{ show: { transition: { staggerChildren: 0.12 } } }}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl"
      >
        {cards.map((c) => (
          <motion.button
            key={c.id}
            variants={card}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            whileHover={{
              scale: 1.025,
              boxShadow: `0 0 40px ${c.glowColor}, 0 8px 32px rgba(0,0,0,0.5)`,
            }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(c.id)}
            className="group relative p-7 text-left rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border)',
            }}
          >
            {/* Top accent line */}
            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{ background: `linear-gradient(90deg, transparent, ${c.ctaColor}, transparent)`, opacity: 0.5 }}
            />

            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
              style={{ background: c.iconBg }}
            >
              {c.iconEl}
            </div>
            <h2
              className="text-lg font-black mb-3 whitespace-pre-line leading-snug"
              style={{ color: 'var(--text-primary)' }}
            >
              {c.title}
            </h2>
            <p
              className="text-sm leading-relaxed mb-6"
              style={{ color: 'var(--text-secondary)' }}
            >
              {c.description}
            </p>
            <div
              className="flex items-center gap-2 font-bold text-sm"
              style={{ color: c.ctaColor }}
            >
              {c.cta} <ArrowRight size={14} />
            </div>
          </motion.button>
        ))}
      </motion.div>

      {/* Footer disclaimer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="mt-12 text-[11px] text-center"
        style={{ color: 'rgba(247,248,253,0.25)' }}
      >
        Simulações educacionais. Consulte sempre um especialista antes de investir.
      </motion.p>
    </div>
  );
}
