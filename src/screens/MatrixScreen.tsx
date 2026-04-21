import { motion } from 'framer-motion';
import { Building2, TrendingUp, Repeat2, Landmark, ArrowLeft, Lock } from 'lucide-react';

type Path = 'acquisition' | 'return';

interface Props {
  path: Path;
  onSelect: (tool: number) => void;
  onBack: () => void;
}

const tools = [
  {
    id: 1,
    icon: Building2,
    title: 'Compra e Construção',
    description: 'Simule a alavancagem completa: adquira o terreno, construa e venda com lucro usando crédito de consórcio.',
    tag: 'Disponível',
    active: true,
    color: 'var(--gold)',
    colorBg: 'var(--gold-dim)',
  },
  {
    id: 2,
    icon: Repeat2,
    title: 'Giro de Cartas',
    description: 'Compre cartas com deságio, venda contempladas com ágio. Operação de curto prazo sem imobilização.',
    tag: 'Em breve',
    active: false,
    color: '#A0A0A0',
    colorBg: 'rgba(160,160,160,0.08)',
  },
  {
    id: 3,
    icon: Landmark,
    title: 'Portfólio de Grupos',
    description: 'Diversifique em múltiplos grupos e consórcios. Calcule a rentabilidade consolidada da carteira.',
    tag: 'Em breve',
    active: false,
    color: '#A0A0A0',
    colorBg: 'rgba(160,160,160,0.08)',
  },
  {
    id: 4,
    icon: TrendingUp,
    title: 'Rentabilidade Pura',
    description: 'Operações de curto prazo focadas em retorno financeiro. Sem aquisição de imóvel.',
    tag: 'Em breve',
    active: false,
    color: '#A0A0A0',
    colorBg: 'rgba(160,160,160,0.08)',
  },
];

const card = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0 },
};

export default function MatrixScreen({ path, onSelect, onBack }: Props) {
  const label = path === 'acquisition' ? 'Adquirir um Bem' : 'Rentabilidade Pura';

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
            className="flex items-center gap-2 text-sm font-semibold mb-8 transition-colors hover:opacity-70"
            style={{ color: 'var(--text-secondary)' }}
          >
            <ArrowLeft size={16} /> Voltar
          </button>

          <p className="text-xs font-bold uppercase tracking-[0.3em] mb-3" style={{ color: 'var(--gold)' }}>
            {label}
          </p>
          <h2
            className="text-3xl md:text-5xl font-black text-white"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            Escolha sua
            <br />
            <span style={{ color: 'var(--gold)' }}>estratégia</span>
          </h2>
        </motion.div>

        <motion.div
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <motion.div
                key={tool.id}
                variants={card}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                whileHover={tool.active ? { scale: 1.02, boxShadow: '0 0 40px rgba(193,177,118,0.25)' } : {}}
                onClick={() => tool.active && onSelect(tool.id)}
                className="relative p-7 rounded-3xl border transition-all duration-300"
                style={{
                  background: 'var(--bg-card)',
                  borderColor: tool.active ? 'var(--border)' : 'rgba(255,255,255,0.05)',
                  cursor: tool.active ? 'pointer' : 'default',
                  opacity: tool.active ? 1 : 0.5,
                }}
              >
                {!tool.active && (
                  <div className="absolute top-5 right-5">
                    <Lock size={14} style={{ color: 'var(--text-secondary)' }} />
                  </div>
                )}

                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: tool.colorBg }}
                >
                  <Icon size={22} style={{ color: tool.color }} />
                </div>

                <div className="flex items-start justify-between mb-3">
                  <h3
                    className="text-lg font-black text-white leading-tight"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {tool.title}
                  </h3>
                  <span
                    className="ml-3 flex-shrink-0 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full"
                    style={{
                      background: tool.active ? 'var(--gold-dim)' : 'rgba(160,160,160,0.1)',
                      color: tool.active ? 'var(--gold)' : 'var(--text-secondary)',
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
