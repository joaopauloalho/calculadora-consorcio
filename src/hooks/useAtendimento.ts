import { useMemo } from 'react';
import { usePersistedState } from './usePersistedState';
import {
  ATENDIMENTO_STEPS,
  EMPTY_ATENDIMENTO,
  getAtendimentoSuggestions,
  getCompletionPercent,
  getFinalRecommendation,
  getRadarStatus,
  type AtendimentoAnswers,
  type AtendimentoStepId,
  type RecommendedTool,
} from '../lib/atendimentoRules';

interface AtendimentoState {
  answers: AtendimentoAnswers;
  stepIndex: number;
  finished: boolean;
}

const STORAGE_KEY = 'prestige:atendimento:data';

const initialState: AtendimentoState = {
  answers: EMPTY_ATENDIMENTO,
  stepIndex: 0,
  finished: false,
};

export function useAtendimento() {
  const [state, setState] = usePersistedState<AtendimentoState>(STORAGE_KEY, initialState);

  const totalSteps = ATENDIMENTO_STEPS.length;
  const currentStep = ATENDIMENTO_STEPS[Math.min(state.stepIndex, totalSteps - 1)];

  const radarStatus = useMemo(() => getRadarStatus(state.answers), [state.answers]);
  const completionPercent = useMemo(() => getCompletionPercent(state.answers), [state.answers]);
  const suggestions = useMemo(() => getAtendimentoSuggestions(state.answers), [state.answers]);
  const finalRecommendation = useMemo(() => getFinalRecommendation(state.answers), [state.answers]);

  const updateAnswer = <K extends keyof AtendimentoAnswers>(key: K, value: AtendimentoAnswers[K]) => {
    setState((current) => ({
      ...current,
      answers: {
        ...current.answers,
        [key]: value,
      },
      finished: false,
    }));
  };

  const updateNote = (stepId: AtendimentoStepId, note: string) => {
    setState((current) => ({
      ...current,
      answers: {
        ...current.answers,
        notes: {
          ...current.answers.notes,
          [stepId]: note,
        },
      },
      finished: false,
    }));
  };

  const goNext = () => {
    setState((current) => {
      if (current.stepIndex >= totalSteps - 1) {
        return { ...current, finished: true };
      }
      return { ...current, stepIndex: current.stepIndex + 1 };
    });
  };

  const goPrev = () => {
    setState((current) => ({
      ...current,
      finished: false,
      stepIndex: Math.max(0, current.stepIndex - 1),
    }));
  };

  const goToStep = (stepId: AtendimentoStepId) => {
    const nextIndex = ATENDIMENTO_STEPS.findIndex((step) => step.id === stepId);
    if (nextIndex < 0) return;
    setState((current) => ({
      ...current,
      finished: false,
      stepIndex: nextIndex,
    }));
  };

  const finish = () => {
    setState((current) => ({ ...current, finished: true }));
  };

  const reset = () => {
    setState(initialState);
  };

  const openToolPayload = finalRecommendation.ferramenta satisfies RecommendedTool;

  return {
    answers: state.answers,
    currentStep,
    stepIndex: state.stepIndex,
    totalSteps,
    finished: state.finished,
    radarStatus,
    completionPercent,
    suggestions,
    finalRecommendation,
    openToolPayload,
    updateAnswer,
    updateNote,
    goNext,
    goPrev,
    goToStep,
    finish,
    reset,
  };
}
