import { motion } from 'framer-motion';

interface Props {
  consorcioTotal: number;
  bancoTotal: number;
  economia: number;
}

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);

export default function ComparisonChart({ consorcioTotal, bancoTotal, economia }: Props) {
  const max = Math.max(consorcioTotal, bancoTotal) * 1.1;
  const consorcioH = (consorcioTotal / max) * 100;
  const bancoH = (bancoTotal / max) * 100;

  return (
    <div className="p-6 rounded-2xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
      <p className="text-xs font-black uppercase tracking-widest mb-6" style={{ color: 'var(--text-secondary)' }}>
        Custo Total de Aquisição
      </p>

      <div className="flex items-end justify-center gap-12 h-48">
        {/* Consórcio */}
        <div className="flex flex-col items-center gap-3 flex-1">
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm font-black text-center"
            style={{ color: '#00C864', fontFamily: 'Montserrat' }}
          >
            {fmt(consorcioTotal)}
          </motion.p>
          <div className="w-full relative flex items-end" style={{ height: 160 }}>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${consorcioH}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
              className="w-full rounded-t-xl"
              style={{ background: 'linear-gradient(180deg, #00C864 0%, #007A3D 100%)' }}
            />
          </div>
          <p className="text-xs font-bold text-center" style={{ color: 'var(--text-secondary)' }}>Consórcio</p>
        </div>

        {/* Banco */}
        <div className="flex flex-col items-center gap-3 flex-1">
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm font-black text-center"
            style={{ color: 'var(--alert)', fontFamily: 'Montserrat' }}
          >
            {fmt(bancoTotal)}
          </motion.p>
          <div className="w-full relative flex items-end" style={{ height: 160 }}>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${bancoH}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.25 }}
              className="w-full rounded-t-xl"
              style={{ background: 'linear-gradient(180deg, #CC3366 0%, #7A0030 100%)' }}
            />
          </div>
          <p className="text-xs font-bold text-center" style={{ color: 'var(--text-secondary)' }}>Banco (SAC 360m)</p>
        </div>
      </div>

      {/* Economia */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-6 pt-5 border-t flex items-center justify-between"
        style={{ borderColor: 'var(--border)' }}
      >
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
          Economia com consórcio
        </span>
        <span className="text-xl font-black" style={{ fontFamily: 'Montserrat', color: 'var(--gold)' }}>
          {fmt(economia)}
        </span>
      </motion.div>
    </div>
  );
}
