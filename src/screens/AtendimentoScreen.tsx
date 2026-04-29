import { useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, BriefcaseBusiness, Car, CheckCircle2, ChevronLeft,
  Circle, CircleHelp, Clock3, Home, Landmark, MessageSquareQuote, PiggyBank,
  RefreshCw, ShieldQuestion, Sparkles, Target, WalletCards,
} from 'lucide-react';
import { Label, ProgressDots, slideVariants } from '../components/shared';
import { useAtendimento } from '../hooks/useAtendimento';
import {
  ATENDIMENTO_STEPS,
  RADAR_BLOCKS,
  capacidadeOptions,
  carroOptions,
  consorcioOptions,
  dorOptions,
  moradiaOptions,
  objetivoOptions,
  prazoOptions,
  rendaOptions,
  type AtendimentoAnswers,
  type AtendimentoStepId,
  type ConversationOption,
  type RecommendedTool,
  type Suggestion,
} from '../lib/atendimentoRules';

interface Props {
  onBack: () => void;
  onSelect: (tool: RecommendedTool) => void;
}

const statusMeta = {
  pendente: { label: 'Pendente', color: 'rgba(247,248,253,0.28)', bg: 'rgba(247,248,253,0.05)' },
  parcial: { label: 'Parcial', color: '#5EB9AA', bg: 'rgba(94,185,170,0.12)' },
  completo: { label: 'Completo', color: 'var(--gold)', bg: 'rgba(201,168,76,0.13)' },
};

export default function AtendimentoScreen({ onBack, onSelect }: Props) {
  const atendimento = useAtendimento();
  const [showPrompt, setShowPrompt] = useState(false);
  const dir = 1;

  const step = atendimento.currentStep;

  const next = () => {
    setShowPrompt(false);
    atendimento.goNext();
  };

  const prev = () => {
    setShowPrompt(false);
    atendimento.goPrev();
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-black)' }}>
      <nav
        className="sticky top-0 z-50 border-b"
        style={{ background: 'rgba(3,23,21,0.92)', backdropFilter: 'blur(12px)', borderColor: 'var(--border)' }}
      >
        <div className="max-w-7xl mx-auto px-5 md:px-6 h-16 flex items-center justify-between gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-70"
            style={{ color: 'var(--text-secondary)' }}
          >
            <ChevronLeft size={18} /> Voltar
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(94,185,170,0.16)', color: '#5EB9AA' }}>
              <MessageSquareQuote size={16} />
            </div>
            <span className="font-black text-sm truncate" style={{ fontFamily: 'Montserrat', color: 'white' }}>
              Atendimento <span style={{ color: '#5EB9AA' }}>Assistido</span>
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <ProgressDots step={Math.min(atendimento.stepIndex + 1, atendimento.totalSteps)} totalSteps={atendimento.totalSteps} variant="alert" />
            <span className="text-xs font-black" style={{ color: '#5EB9AA' }}>{atendimento.completionPercent}%</span>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)_320px] gap-5 items-start">
          <RadarPanel
            currentStepId={step.id}
            completionPercent={atendimento.completionPercent}
            radarStatus={atendimento.radarStatus}
            onStepSelect={atendimento.goToStep}
          />

          <section className="min-w-0">
            <AnimatePresence mode="wait" custom={dir}>
              {atendimento.finished ? (
                <motion.div
                  key="resultado"
                  custom={dir}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.28, ease: 'easeInOut' }}
                >
                  <ResultPanel
                    recommendation={atendimento.finalRecommendation}
                    completionPercent={atendimento.completionPercent}
                    onOpen={() => onSelect(atendimento.finalRecommendation.ferramenta)}
                    onReset={atendimento.reset}
                    onBackToConversation={() => atendimento.goToStep('consorcio')}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key={step.id}
                  custom={dir}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.28, ease: 'easeInOut' }}
                >
                  <ConversationPanel
                    answers={atendimento.answers}
                    stepId={step.id}
                    stepIndex={atendimento.stepIndex}
                    totalSteps={atendimento.totalSteps}
                    showPrompt={showPrompt}
                    onTogglePrompt={() => setShowPrompt((value) => !value)}
                    onAnswer={atendimento.updateAnswer}
                    onNote={atendimento.updateNote}
                    onPrev={prev}
                    onNext={next}
                    onFinish={atendimento.finish}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          <SuggestionsPanel
            suggestions={atendimento.suggestions}
            answers={atendimento.answers}
            onFinish={atendimento.finish}
          />
        </div>
      </main>
    </div>
  );
}

function RadarPanel({
  currentStepId,
  completionPercent,
  radarStatus,
  onStepSelect,
}: {
  currentStepId: AtendimentoStepId;
  completionPercent: number;
  radarStatus: ReturnType<typeof useAtendimento>['radarStatus'];
  onStepSelect: (stepId: AtendimentoStepId) => void;
}) {
  return (
    <aside className="lg:sticky lg:top-24 space-y-4">
      <div className="p-5 rounded-2xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: '#5EB9AA' }}>
          Radar do Cliente
        </p>
        <div className="flex items-end gap-2 mb-4">
          <span className="text-4xl font-black text-white" style={{ fontFamily: 'Montserrat' }}>{completionPercent}%</span>
          <span className="text-xs mb-1.5" style={{ color: 'var(--text-secondary)' }}>completo</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(247,248,253,0.08)' }}>
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${completionPercent}%`, background: '#5EB9AA' }} />
        </div>
      </div>

      <div className="p-3 rounded-2xl border space-y-1" style={{ background: 'rgba(7,31,27,0.72)', borderColor: 'var(--border)' }}>
        {RADAR_BLOCKS.map((block) => {
          const status = radarStatus[block.id];
          const meta = statusMeta[status];
          const relatedStepId = radarStepMap[block.id];
          const isCurrent = block.id === currentStepId;

          return (
            <button
              key={block.id}
              onClick={() => onStepSelect(relatedStepId)}
              className="w-full min-h-[48px] rounded-xl px-3 flex items-center justify-between gap-3 text-left transition-all disabled:cursor-default"
              style={{
                background: isCurrent ? 'rgba(94,185,170,0.12)' : 'transparent',
              }}
            >
              <span className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: meta.color }} />
                <span className="text-xs font-bold truncate" style={{ color: isCurrent ? '#5EB9AA' : 'white' }}>{block.label}</span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full shrink-0" style={{ color: meta.color, background: meta.bg }}>
                {meta.label}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

const radarStepMap: Record<(typeof RADAR_BLOCKS)[number]['id'], AtendimentoStepId> = {
  objetivo: 'objetivo',
  prazo: 'prazo',
  contexto: 'contexto',
  capacidade: 'capacidade',
  perfil: 'dor',
  conhecimento: 'consorcio',
  objecoes: 'dor',
};

function ConversationPanel({
  answers,
  stepId,
  stepIndex,
  totalSteps,
  showPrompt,
  onTogglePrompt,
  onAnswer,
  onNote,
  onPrev,
  onNext,
  onFinish,
}: {
  answers: AtendimentoAnswers;
  stepId: AtendimentoStepId;
  stepIndex: number;
  totalSteps: number;
  showPrompt: boolean;
  onTogglePrompt: () => void;
  onAnswer: <K extends keyof AtendimentoAnswers>(key: K, value: AtendimentoAnswers[K]) => void;
  onNote: (stepId: AtendimentoStepId, note: string) => void;
  onPrev: () => void;
  onNext: () => void;
  onFinish: () => void;
}) {
  const step = ATENDIMENTO_STEPS[stepIndex];
  const isLast = stepIndex === totalSteps - 1;

  return (
    <div className="rounded-3xl border overflow-hidden" style={{ background: 'rgba(7,31,27,0.88)', borderColor: 'rgba(94,185,170,0.24)' }}>
      <div className="px-5 md:px-8 py-5 border-b flex items-center justify-between gap-4" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'rgba(94,185,170,0.14)', color: '#5EB9AA' }}>
            {stepIcon(stepId)}
          </span>
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-widest" style={{ color: '#5EB9AA' }}>
              Etapa {stepIndex + 1} de {totalSteps} - {step.title}
            </p>
            <h1 className="text-xl md:text-3xl font-black text-white leading-tight mt-1">{step.question}</h1>
          </div>
        </div>
        <span className="hidden md:flex"><ProgressDots step={stepIndex + 1} totalSteps={totalSteps} variant="alert" /></span>
      </div>

      <div className="p-5 md:p-8 space-y-6">
        {stepId === 'objetivo' && (
          <OptionGrid
            value={answers.objetivo}
            options={objetivoOptions}
            onSelect={(value) => onAnswer('objetivo', value)}
            columns="md:grid-cols-3"
          />
        )}

        {stepId === 'prazo' && (
          <OptionGrid
            value={answers.prazo}
            options={prazoOptions}
            onSelect={(value) => onAnswer('prazo', value)}
            columns="md:grid-cols-2"
          />
        )}

        {stepId === 'contexto' && (
          <div className="space-y-5">
            <OptionGroup label="Moradia" value={answers.moradia} options={moradiaOptions} onSelect={(value) => onAnswer('moradia', value)} />
            <OptionGroup label="Veiculo" value={answers.carro} options={carroOptions} onSelect={(value) => onAnswer('carro', value)} />
            <OptionGroup label="Renda" value={answers.renda} options={rendaOptions} onSelect={(value) => onAnswer('renda', value)} />
          </div>
        )}

        {stepId === 'capacidade' && (
          <OptionGrid
            value={answers.capacidade}
            options={capacidadeOptions}
            onSelect={(value) => onAnswer('capacidade', value)}
            columns="md:grid-cols-2"
          />
        )}

        {stepId === 'dor' && (
          <OptionGrid
            value={answers.dor}
            options={dorOptions}
            onSelect={(value) => onAnswer('dor', value)}
            columns="md:grid-cols-2"
          />
        )}

        {stepId === 'consorcio' && (
          <OptionGrid
            value={answers.consorcio}
            options={consorcioOptions}
            onSelect={(value) => onAnswer('consorcio', value)}
            columns="md:grid-cols-2"
          />
        )}

        <div>
          <Label>Observacao livre opcional</Label>
          <textarea
            value={answers.notes[stepId] ?? ''}
            onChange={(event) => onNote(stepId, event.target.value)}
            rows={3}
            placeholder="Anote uma frase do cliente, objecao ou detalhe importante."
            className="w-full rounded-xl border p-4 text-sm font-semibold outline-none resize-none"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        <AnimatePresence>
          {showPrompt && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="p-5 rounded-2xl border"
              style={{ background: 'rgba(94,185,170,0.08)', borderColor: 'rgba(94,185,170,0.28)' }}
            >
              <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: '#5EB9AA' }}>
                Como perguntar isso?
              </p>
              <p className="text-sm leading-relaxed text-white">{step.humanizedPrompt}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="px-5 md:px-8 py-5 border-t flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3" style={{ borderColor: 'var(--border)' }}>
        <button
          onClick={stepIndex === 0 ? undefined : onPrev}
          disabled={stepIndex === 0}
          className="min-h-[56px] px-5 rounded-2xl border font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-35 disabled:cursor-not-allowed"
          style={{ background: 'transparent', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
        >
          <ArrowLeft size={16} /> Voltar etapa
        </button>

        <button
          onClick={onTogglePrompt}
          className="min-h-[56px] px-5 rounded-2xl border font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          style={{ background: 'rgba(94,185,170,0.08)', borderColor: 'rgba(94,185,170,0.24)', color: '#5EB9AA' }}
        >
          <MessageSquareQuote size={16} /> Como perguntar isso?
        </button>

        <button
          onClick={isLast ? onFinish : onNext}
          className="min-h-[56px] px-6 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          style={{ background: '#5EB9AA', color: '#031715' }}
        >
          {isLast ? 'Ver diagnostico' : 'Proxima pergunta'} <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

function SuggestionsPanel({
  suggestions,
  answers,
  onFinish,
}: {
  suggestions: Suggestion[];
  answers: AtendimentoAnswers;
  onFinish: () => void;
}) {
  return (
    <aside className="lg:sticky lg:top-24 space-y-4">
      <div className="p-5 rounded-2xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <p className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--gold)' }}>Sugestoes</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Regras simples, sem IA.</p>
          </div>
          <Sparkles size={18} style={{ color: 'var(--gold)' }} />
        </div>

        <div className="space-y-3">
          {suggestions.length === 0 ? (
            <div className="p-4 rounded-xl border" style={{ background: 'rgba(247,248,253,0.04)', borderColor: 'var(--border)' }}>
              <p className="text-sm font-bold text-white">Continue o diagnostico</p>
              <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                As sugestoes aparecem conforme objetivo, contexto e objecoes do cliente.
              </p>
            </div>
          ) : (
            suggestions.map((suggestion) => <SuggestionCard key={suggestion.id} suggestion={suggestion} />)
          )}
        </div>
      </div>

      <div className="p-5 rounded-2xl border" style={{ background: 'rgba(201,168,76,0.06)', borderColor: 'rgba(201,168,76,0.2)' }}>
        <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: 'var(--gold)' }}>Resumo vivo</p>
        <div className="space-y-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
          <SummaryLine label="Objetivo" value={labelFrom(objetivoOptions, answers.objetivo)} />
          <SummaryLine label="Prazo" value={labelFrom(prazoOptions, answers.prazo)} />
          <SummaryLine label="Parcela" value={labelFrom(capacidadeOptions, answers.capacidade)} />
          <SummaryLine label="Dor" value={labelFrom(dorOptions, answers.dor)} />
        </div>
        <button
          onClick={onFinish}
          className="mt-5 w-full min-h-[56px] rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-[0.98]"
          style={{ background: 'var(--gold)', color: '#031715' }}
        >
          Finalizar conversa
        </button>
      </div>
    </aside>
  );
}

function ResultPanel({
  recommendation,
  completionPercent,
  onOpen,
  onReset,
  onBackToConversation,
}: {
  recommendation: ReturnType<typeof useAtendimento>['finalRecommendation'];
  completionPercent: number;
  onOpen: () => void;
  onReset: () => void;
  onBackToConversation: () => void;
}) {
  return (
    <div className="rounded-3xl border overflow-hidden" style={{ background: 'rgba(7,31,27,0.9)', borderColor: 'rgba(201,168,76,0.28)' }}>
      <div className="p-6 md:p-8 border-b" style={{ borderColor: 'var(--border)' }}>
        <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: 'var(--gold)' }}>
          Diagnostico {completionPercent}% completo
        </p>
        <h1 className="text-3xl md:text-5xl font-black text-white leading-tight">
          {recommendation.perfil}
        </h1>
        <p className="text-sm md:text-base mt-4 max-w-2xl leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {recommendation.abordagem}
        </p>
      </div>

      <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <ResultBlock icon={<Target size={18} />} label="Perfil do cliente" value={recommendation.perfil} />
        <ResultBlock icon={<MessageSquareQuote size={18} />} label="Proximo passo" value={recommendation.proximoPasso} />
        <ResultBlock icon={toolIcon(recommendation.ferramenta)} label="Ferramenta recomendada" value={recommendation.ferramentaLabel} highlight />
      </div>

      <div className="px-6 md:px-8 pb-8 flex flex-col sm:flex-row gap-3">
        <button
          onClick={onOpen}
          className="min-h-[56px] flex-1 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          style={{ background: 'var(--gold)', color: '#031715' }}
        >
          Abrir ferramenta recomendada <ArrowRight size={16} />
        </button>
        <button
          onClick={onBackToConversation}
          className="min-h-[56px] px-5 rounded-2xl border font-black text-xs uppercase tracking-widest"
          style={{ background: 'transparent', borderColor: 'var(--border)', color: 'white' }}
        >
          Ajustar diagnostico
        </button>
        <button
          onClick={onReset}
          className="min-h-[56px] px-5 rounded-2xl border font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2"
          style={{ background: 'transparent', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
        >
          <RefreshCw size={14} /> Recomeçar
        </button>
      </div>
    </div>
  );
}

function OptionGrid<T extends string>({
  value,
  options,
  onSelect,
  columns,
}: {
  value?: T;
  options: ConversationOption<T>[];
  onSelect: (value: T) => void;
  columns: string;
}) {
  return (
    <div className={`grid grid-cols-1 ${columns} gap-3`}>
      {options.map((option) => (
        <TouchOption
          key={option.value}
          active={value === option.value}
          title={option.label}
          sub={option.sub}
          onClick={() => onSelect(option.value)}
        />
      ))}
    </div>
  );
}

function OptionGroup<T extends string>({
  label,
  value,
  options,
  onSelect,
}: {
  label: string;
  value?: T;
  options: ConversationOption<T>[];
  onSelect: (value: T) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {options.map((option) => (
          <TouchOption
            key={option.value}
            active={value === option.value}
            title={option.label}
            compact
            onClick={() => onSelect(option.value)}
          />
        ))}
      </div>
    </div>
  );
}

function TouchOption({
  active,
  title,
  sub,
  compact = false,
  onClick,
}: {
  active: boolean;
  title: string;
  sub?: string;
  compact?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full min-h-[56px] ${compact ? 'p-3' : 'p-5'} rounded-2xl border text-left flex items-center justify-between gap-3 transition-all active:scale-[0.98]`}
      style={{
        background: active ? 'rgba(94,185,170,0.13)' : 'var(--bg-card)',
        borderColor: active ? '#5EB9AA' : 'var(--border)',
      }}
    >
      <span className="min-w-0">
        <span className="block text-sm font-black" style={{ color: active ? '#5EB9AA' : 'white' }}>{title}</span>
        {sub && <span className="block text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{sub}</span>}
      </span>
      {active ? <CheckCircle2 size={18} style={{ color: '#5EB9AA' }} /> : <Circle size={16} style={{ color: 'rgba(247,248,253,0.25)' }} />}
    </button>
  );
}

function SuggestionCard({ suggestion }: { suggestion: Suggestion }) {
  const color = suggestion.tone === 'gold' ? 'var(--gold)' : suggestion.tone === 'teal' ? '#5EB9AA' : 'var(--text-secondary)';
  const bg = suggestion.tone === 'gold' ? 'rgba(201,168,76,0.08)' : suggestion.tone === 'teal' ? 'rgba(94,185,170,0.08)' : 'rgba(247,248,253,0.04)';
  const border = suggestion.tone === 'gold' ? 'rgba(201,168,76,0.22)' : suggestion.tone === 'teal' ? 'rgba(94,185,170,0.24)' : 'var(--border)';

  return (
    <div className="p-4 rounded-xl border" style={{ background: bg, borderColor: border }}>
      <p className="text-sm font-black" style={{ color }}>{suggestion.title}</p>
      <p className="text-xs mt-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{suggestion.body}</p>
    </div>
  );
}

function SummaryLine({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span>{label}</span>
      <span className="font-bold text-right" style={{ color: value ? 'white' : 'rgba(247,248,253,0.28)' }}>
        {value ?? 'Pendente'}
      </span>
    </div>
  );
}

function ResultBlock({
  icon,
  label,
  value,
  highlight = false,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="p-5 rounded-2xl border" style={{ background: highlight ? 'rgba(201,168,76,0.08)' : 'var(--bg-card)', borderColor: highlight ? 'rgba(201,168,76,0.24)' : 'var(--border)' }}>
      <span className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: highlight ? 'rgba(201,168,76,0.14)' : 'rgba(94,185,170,0.12)', color: highlight ? 'var(--gold)' : '#5EB9AA' }}>
        {icon}
      </span>
      <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-secondary)' }}>{label}</p>
      <p className="text-base font-black text-white leading-snug">{value}</p>
    </div>
  );
}

function labelFrom<T extends string>(options: ConversationOption<T>[], value?: T) {
  return options.find((option) => option.value === value)?.label;
}

function stepIcon(stepId: AtendimentoStepId) {
  const icons: Record<AtendimentoStepId, ReactNode> = {
    objetivo: <Target size={18} />,
    prazo: <Clock3 size={18} />,
    contexto: <Home size={18} />,
    capacidade: <WalletCards size={18} />,
    dor: <ShieldQuestion size={18} />,
    consorcio: <CircleHelp size={18} />,
  };
  return icons[stepId];
}

function toolIcon(tool: RecommendedTool) {
  if (tool === 'lance' || tool === 6) return <Landmark size={18} />;
  if (tool === 4 || tool === 2) return <PiggyBank size={18} />;
  if (tool === 3) return <Home size={18} />;
  if (tool === 5) return <BriefcaseBusiness size={18} />;
  if (tool === 'quickcalc') return <Sparkles size={18} />;
  return <Car size={18} />;
}
