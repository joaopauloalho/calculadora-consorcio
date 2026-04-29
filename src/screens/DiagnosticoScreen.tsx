import { useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight, BriefcaseBusiness, ChevronLeft, Hammer, Home, Landmark,
  Repeat2, RotateCcw, TrendingUp, WalletCards,
} from 'lucide-react';
import { slideVariants } from '../components/shared';

interface Props {
  onSelect: (tool: 'quickcalc' | 'lance' | 1 | 2 | 3 | 4 | 5 | 6) => void;
  onBack: () => void;
}

type Step = 'q1' | 'q2a' | 'q2b' | 'q3a' | 'result';
type RecommendationId = 'quickcalc' | 1 | 2 | 3 | 4 | 5;

const recommendations: Record<RecommendationId, {
  title: string;
  subtitle: string;
  icon: ReactNode;
  tool: 'quickcalc' | 1 | 2 | 3 | 4 | 5;
}> = {
  quickcalc: {
    title: 'Calculadora Expressa',
    subtitle: 'Simule a cota principal em segundos e leve uma proposta clara para a conversa.',
    icon: <Home size={28} />,
    tool: 'quickcalc',
  },
  1: {
    title: 'Compra e Construção',
    subtitle: 'Projete terreno, obra, venda e lucro da operação completa.',
    icon: <Hammer size={28} />,
    tool: 1,
  },
  2: {
    title: 'Giro de Cartas',
    subtitle: 'Veja o retorno de vender a carta contemplada com ágio.',
    icon: <Repeat2 size={28} />,
    tool: 2,
  },
  3: {
    title: 'Aluguel com Consórcio',
    subtitle: 'Calcule renda, fluxo mensal e patrimônio usando aluguel.',
    icon: <BriefcaseBusiness size={28} />,
    tool: 3,
  },
  4: {
    title: 'Carta Aplicada',
    subtitle: 'Compare o crédito aplicado no CDI com o custo da carta.',
    icon: <TrendingUp size={28} />,
    tool: 4,
  },
  5: {
    title: 'Quitação de Financiamento',
    subtitle: 'Substitua financiamento por consórcio e estime a economia total.',
    icon: <Landmark size={28} />,
    tool: 5,
  },
};

function OptionCard({
  icon,
  title,
  subtitle,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="min-h-[80px] w-full p-5 rounded-2xl border text-left flex items-center gap-4 transition-all active:scale-[0.97]"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
    >
      <span className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(94,185,170,0.16)', color: '#5EB9AA' }}>
        {icon}
      </span>
      <span className="flex-1">
        <span className="block text-base font-black text-white">{title}</span>
        <span className="block text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{subtitle}</span>
      </span>
      <ArrowRight size={16} style={{ color: '#5EB9AA' }} />
    </button>
  );
}

export default function DiagnosticoScreen({ onSelect, onBack }: Props) {
  const [step, setStep] = useState<Step>('q1');
  const [recommendation, setRecommendation] = useState<RecommendationId | null>(null);

  const recommend = (id: RecommendationId) => {
    setRecommendation(id);
    setStep('result');
  };

  const reset = () => {
    setRecommendation(null);
    setStep('q1');
  };

  const current = recommendation ? recommendations[recommendation] : null;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-black)' }}>
      <nav className="sticky top-0 z-50 border-b" style={{ background: 'rgba(3,23,21,0.9)', backdropFilter: 'blur(12px)', borderColor: 'var(--border)' }}>
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-70" style={{ color: 'var(--text-secondary)' }}>
            <ChevronLeft size={18} /> Voltar
          </button>
          <span className="font-black text-sm text-white">Diagnóstico <span style={{ color: '#5EB9AA' }}>Rápido</span></span>
          <div className="w-16" />
        </div>
      </nav>

      <div className="flex-1 max-w-3xl mx-auto w-full px-4 md:px-6 py-10">
        <AnimatePresence mode="wait" custom={1}>
          <motion.div
            key={step}
            custom={1}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="space-y-5"
          >
            {step === 'q1' && (
              <>
                <Header title="O que você quer fazer com o consórcio?" />
                <OptionCard icon={<Home size={24} />} title="Adquirir um bem" subtitle="Imóvel, veículo, construção ou quitação." onClick={() => setStep('q2a')} />
                <OptionCard icon={<TrendingUp size={24} />} title="Gerar retorno financeiro" subtitle="Carta, ágio, CDI ou estratégia de investimento." onClick={() => setStep('q2b')} />
              </>
            )}

            {step === 'q2a' && (
              <>
                <Header title="Você tem financiamento ativo hoje?" />
                <OptionCard icon={<Landmark size={24} />} title="Sim" subtitle="Quero comparar a troca por consórcio." onClick={() => recommend(5)} />
                <OptionCard icon={<WalletCards size={24} />} title="Não" subtitle="Quero escolher a melhor simulação para aquisição." onClick={() => setStep('q3a')} />
              </>
            )}

            {step === 'q3a' && (
              <>
                <Header title="Como pretende usar o bem?" />
                <OptionCard icon={<Home size={24} />} title="Morar ou usar" subtitle="Simulação direta de carta, prazo e parcela." onClick={() => recommend('quickcalc')} />
                <OptionCard icon={<BriefcaseBusiness size={24} />} title="Alugar e gerar renda" subtitle="Fluxo mensal e patrimônio com aluguel." onClick={() => recommend(3)} />
                <OptionCard icon={<Hammer size={24} />} title="Construir e vender" subtitle="Projeto, obra, venda e rentabilidade." onClick={() => recommend(1)} />
              </>
            )}

            {step === 'q2b' && (
              <>
                <Header title="Qual perfil de retorno?" />
                <OptionCard icon={<Repeat2 size={24} />} title="Venda da carta com ágio" subtitle="Giro de carta contemplada." onClick={() => recommend(2)} />
                <OptionCard icon={<TrendingUp size={24} />} title="Carta aplicada no CDI" subtitle="Crédito crescendo aplicado após contemplar." onClick={() => recommend(4)} />
              </>
            )}

            {step === 'result' && current && (
              <div className="p-8 rounded-3xl border text-center" style={{ background: 'var(--bg-card)', borderColor: 'rgba(94,185,170,0.35)' }}>
                <p className="text-xs font-black uppercase tracking-widest mb-6" style={{ color: '#5EB9AA' }}>Ferramenta recomendada</p>
                <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-5" style={{ background: 'rgba(94,185,170,0.16)', color: '#5EB9AA' }}>
                  {current.icon}
                </div>
                <h2 className="text-3xl font-black text-white mb-3">{current.title}</h2>
                <p className="text-sm leading-relaxed max-w-md mx-auto mb-8" style={{ color: 'var(--text-secondary)' }}>{current.subtitle}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button onClick={() => onSelect(current.tool)} className="min-h-[56px] rounded-2xl font-black text-xs uppercase tracking-widest" style={{ background: '#5EB9AA', color: '#031715' }}>
                    Abrir ferramenta
                  </button>
                  <button onClick={reset} className="min-h-[56px] rounded-2xl border font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2" style={{ background: 'transparent', borderColor: 'var(--border)', color: 'white' }}>
                    <RotateCcw size={14} /> Recomeçar
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function Header({ title }: { title: string }) {
  return (
    <div className="mb-7">
      <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#5EB9AA' }}>Diagnóstico</p>
      <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">{title}</h1>
    </div>
  );
}
