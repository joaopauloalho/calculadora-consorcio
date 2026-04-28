import { motion } from 'framer-motion';
import { Building2, TrendingUp, TrendingDown, Repeat2, Landmark, ArrowLeft, Zap } from 'lucide-react';

type Path = 'acquisition' | 'return';

interface Props {
  path: Path;
  onSelect: (tool: number) => void;
  onBack: () => void;
}

const allTools = [
  {
    id: 1,
    path: 'acquisition' as Path,
    icon: Building2,
    title: 'Compra e Construção',
    description: 'Adquira o terreno, construa e venda com lucro. Simule a alavancagem completa usando crédito de consórcio.',
    tag: 'Disponível',
    active: true,
    color: 'var(--gold)',
    colorBg: 'var(--gold-dim)',
    glowColor: 'rgba(201, 168, 76, 0.22)',
  },
  {
    id: 2,
    path: 'return' as Path,
    icon: Repeat2,
    title: 'Giro de Cartas',
    description: 'Compre cartas com deságio, venda contempladas com ágio. Operação de curto prazo sem imobilização de capital.',
    tag: 'Disponível',
    active: true,
    color: 'var(--alert)',
    colorBg: 'var(--alert-dim)',
    glowColor: 'rgba(94, 185, 170, 0.22)',
  },
  {
    id: 3,
    path: 'acquisition' as Path,
    icon: Landmark,
    title: 'Aluguel com Consórcio',
    description: 'Use o crédito para adquirir e alugar. Calcule fluxo mensal, replicação automática e patrimônio final.',
    tag: 'Disponível',
    active: true,
    color: 'var(--gold)',
    colorBg: 'var(--gold-dim)',
    glowColor: 'rgba(201, 168, 76, 0.22)',
  },
  {
    id: 4,
    path: 'return' as Path,
    icon: TrendingUp,
    title: 'Carta Aplicada',
    description: 'Contemple e deixe o crédito render no CDI enquanto paga as parcelas. Veja o saldo líquido mês a mês.',
    tag: 'Disponível',
    active: true,
    color: 'var(--alert)',
    colorBg: 'var(--alert-dim)',
    glowColor: 'rgba(94, 185, 170, 0.22)',
  },
  {
    id: 5,
    path: 'acquisition' as Path,
    icon: TrendingDown,
    title: 'Quitação de Financiamento',
    description: 'Substitua um financiamento bancário por consórcio. Compare o custo total e veja quanto você economiza em juros.',
    tag: 'Disponível',
    active: true,
    color: 'var(--gold)',
    colorBg: 'var(--gold-dim)',
    glowColor: 'rgba(201, 168, 76, 0.22)',
  },
  {
    id: 6,
    path: 'return' as Path,
    icon: Zap,
    title: 'Simulador de Lance',
    description: 'Compare os 5 tipos de lance Ello e descubra qual maximiza seu crédito na contemplação.',
    tag: 'Disponível',
    active: true,
    color: 'var(--alert)',
    colorBg: 'var(--alert-dim)',
    glowColor: 'rgba(94, 185, 170, 0.22)',
  },
];

const card = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0 },
};

export default function MatrixScreen({ path, onSelect, onBack }: Props) {
  const label = path === 'acquisition' ? 'Com Aquisição' : 'Sem Aquisição';
  const accentColor = path === 'acquisition' ? 'var(--gold)' : 'var(--alert)';
  const tools = allTools.filter((t) => t.path === path);

  return (
    <div className="min-h-screen bg-black px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-12"
        >
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-semibold mb-8 transition-opacity hover:opacity-60"
            style={{ color: 'var(--text-secondary)' }}
          >
            <ArrowLeft size={15} /> Voltar
          </button>

          <p
            className="text-[10px] font-bold uppercase tracking-[0.35em] mb-3"
            style={{ color: accentColor }}
          >
            {label}
          </p>
          <h2
            className="text-3xl md:text-5xl font-black leading-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            Escolha sua
            <br />
            <span style={{ color: accentColor }}>estratégia</span>
          </h2>
        </motion.div>

        <motion.div
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <motion.div
                key={tool.id}
                variants={card}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                whileHover={
                  tool.active
                    ? {
                        scale: 1.02,
                        boxShadow: `0 0 40px ${tool.glowColor}, 0 8px 32px rgba(0,0,0,0.5)`,
                      }
                    : {}
                }
                onClick={() => tool.active && onSelect(tool.id)}
                className="relative p-7 rounded-2xl border transition-all duration-300 overflow-hidden"
                style={{
                  background: 'var(--bg-card)',
                  borderColor: tool.active ? 'var(--border)' : 'rgba(247,248,253,0.05)',
                  cursor: tool.active ? 'pointer' : 'default',
                  opacity: tool.active ? 1 : 0.45,
                }}
              >
                {/* Top accent line */}
                {tool.active && (
                  <div
                    className="absolute top-0 left-0 right-0 h-px"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${tool.color}, transparent)`,
                      opacity: 0.5,
                    }}
                  />
                )}

                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: tool.colorBg }}
                >
                  <Icon size={20} style={{ color: tool.color }} />
                </div>

                <div className="flex items-start justify-between mb-3">
                  <h3
                    className="text-base font-black leading-tight"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {tool.title}
                  </h3>
                  <span
                    className="ml-3 flex-shrink-0 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full"
                    style={{
                      background: tool.active ? tool.colorBg : 'rgba(247,248,253,0.07)',
                      color: tool.active ? tool.color : 'var(--text-secondary)',
                    }}
                  >
                    {tool.tag}
                  </span>
                </div>

                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {tool.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
