import { motion } from 'framer-motion';
import { Building2, TrendingUp, ArrowRight } from 'lucide-react';

type Path = 'acquisition' | 'return';

interface Props {
  onSelect: (path: Path) => void;
}

const card = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0 },
};

export default function WelcomeScreen({ onSelect }: Props) {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <p className="text-xs font-bold uppercase tracking-[0.3em] mb-4" style={{ color: 'var(--gold)' }}>
          Portal de Alavancagem
        </p>
        <h1
          className="text-4xl md:text-6xl font-black text-white leading-tight"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          Qual é o seu
          <br />
          <span style={{ color: 'var(--gold)' }}>objetivo hoje?</span>
        </h1>
        <p className="mt-6 text-base max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
          Selecione o seu perfil e descubra a estratégia de consórcio ideal para você.
        </p>
      </motion.div>

      <motion.div
        variants={{ show: { transition: { staggerChildren: 0.15 } } }}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl"
      >
        <motion.button
          variants={card}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          whileHover={{ scale: 1.03, boxShadow: '0 0 40px rgba(193,177,118,0.3)' }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect('acquisition')}
          className="group relative p-8 text-left rounded-3xl border transition-colors duration-300 cursor-pointer"
          style={{
            background: 'var(--bg-card)',
            borderColor: 'var(--border)',
          }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300"
            style={{ background: 'var(--gold-dim)' }}
          >
            <Building2 size={28} style={{ color: 'var(--gold)' }} />
          </div>
          <h2
            className="text-2xl font-black text-white mb-3"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            Quero adquirir
            <br />um bem
          </h2>
          <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
            Construa e venda com lucro usando crédito de consórcio a custo baixo. A estratégia de alavancagem patrimonial.
          </p>
          <div className="flex items-center gap-2 font-bold text-sm" style={{ color: 'var(--gold)' }}>
            Explorar estratégia <ArrowRight size={16} />
          </div>
        </motion.button>

        <motion.button
          variants={card}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          whileHover={{ scale: 1.03, boxShadow: '0 0 40px rgba(193,177,118,0.3)' }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect('return')}
          className="group relative p-8 text-left rounded-3xl border transition-colors duration-300 cursor-pointer"
          style={{
            background: 'var(--bg-card)',
            borderColor: 'var(--border)',
          }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
            style={{ background: 'rgba(204,51,102,0.15)' }}
          >
            <TrendingUp size={28} style={{ color: 'var(--alert)' }} />
          </div>
          <h2
            className="text-2xl font-black text-white mb-3"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            Busco apenas
            <br />rentabilidade
          </h2>
          <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
            Use o consórcio como ativo financeiro. Compre cartas com ágio, venda contempladas e lucre sem imobilizar capital.
          </p>
          <div className="flex items-center gap-2 font-bold text-sm" style={{ color: 'var(--alert)' }}>
            Explorar estratégia <ArrowRight size={16} />
          </div>
        </motion.button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="mt-12 text-xs text-center"
        style={{ color: 'rgba(160,160,160,0.5)' }}
      >
        Simulações educacionais. Consulte sempre um especialista antes de investir.
      </motion.p>
    </div>
  );
}
