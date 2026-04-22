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
    iconEl: <Zap size={28} className="text-black" />,
    iconBg: 'var(--gold)' as string,
    title: 'Calculadora\nExpressa',
    description:
      'Simule qualquer cota em segundos. Imóvel ou veículo, com ou sem ágio — resultado imediato para fechar em reunião.',
    cta: 'Calcular agora',
    ctaColor: 'var(--gold)' as string,
  },
  {
    id: 'acquisition' as Purpose,
    iconEl: <Building2 size={28} style={{ color: 'var(--gold)' }} />,
    iconBg: 'var(--gold-dim)' as string,
    title: 'Com\nAquisição',
    description:
      'Use o crédito para adquirir terreno e construir para venda, ou comprar um imóvel e gerar renda com aluguel. Patrimônio real com consórcio.',
    cta: 'Explorar estratégias',
    ctaColor: 'var(--gold)' as string,
  },
  {
    id: 'return' as Purpose,
    iconEl: <TrendingUp size={28} style={{ color: 'var(--alert)' }} />,
    iconBg: 'rgba(204,51,102,0.15)' as string,
    title: 'Sem\nAquisição',
    description:
      'Lucre na contemplação: venda a carta com ágio ou deixe o crédito crescer no CDI enquanto paga as parcelas. Retorno sem imobilizar capital.',
    cta: 'Explorar estratégias',
    ctaColor: 'var(--alert)' as string,
  },
];

export default function PurposeScreen({ onSelect }: Props) {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <p
          className="text-xs font-bold uppercase tracking-[0.3em] mb-4"
          style={{ color: 'var(--gold)' }}
        >
          Cockpit de Vendas
        </p>
        <h1
          className="text-4xl md:text-6xl font-black text-white leading-tight"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          O que vamos
          <br />
          <span style={{ color: 'var(--gold)' }}>simular hoje?</span>
        </h1>
        <p
          className="mt-6 text-base max-w-md mx-auto"
          style={{ color: 'var(--text-secondary)' }}
        >
          Escolha o modo de análise e comece a simulação.
        </p>
      </motion.div>

      <motion.div
        variants={{ show: { transition: { staggerChildren: 0.12 } } }}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-4xl"
      >
        {cards.map((c) => (
          <motion.button
            key={c.id}
            variants={card}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            whileHover={{ scale: 1.03, boxShadow: '0 0 40px rgba(193,177,118,0.25)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(c.id)}
            className="group relative p-7 text-left rounded-3xl border transition-colors duration-300 cursor-pointer"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
              style={{ background: c.iconBg }}
            >
              {c.iconEl}
            </div>
            <h2
              className="text-xl font-black text-white mb-3 whitespace-pre-line leading-snug"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              {c.title}
            </h2>
            <p
              className="text-sm leading-relaxed mb-5"
              style={{ color: 'var(--text-secondary)' }}
            >
              {c.description}
            </p>
            <div
              className="flex items-center gap-2 font-bold text-sm"
              style={{ color: c.ctaColor }}
            >
              {c.cta} <ArrowRight size={15} />
            </div>
          </motion.button>
        ))}
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        className="mt-12 text-xs text-center"
        style={{ color: 'rgba(160,160,160,0.5)' }}
      >
        Simulações educacionais. Consulte sempre um especialista antes de investir.
      </motion.p>
    </div>
  );
}
