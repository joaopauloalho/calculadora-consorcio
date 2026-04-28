import { useState } from 'react';

export function useCalculatorNavigation(totalSteps: number) {
  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);

  const goNext = () => { setDir(1); setStep((s) => Math.min(s + 1, totalSteps)); };
  const goPrev = () => { setDir(-1); setStep((s) => Math.max(s - 1, 1)); };

  return { step, dir, goNext, goPrev, setStep };
}
