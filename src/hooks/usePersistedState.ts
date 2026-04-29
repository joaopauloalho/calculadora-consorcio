import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function hasPersistedState(key: string): boolean {
  if (!canUseStorage()) return false;
  try {
    return window.localStorage.getItem(key) !== null;
  } catch {
    return false;
  }
}

export function usePersistedState<T>(
  key: string,
  initialValue: T,
): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    if (!canUseStorage()) return initialValue;
    try {
      const stored = window.localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    if (!canUseStorage()) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // Storage can be blocked or full.
    }
  }, [key, state]);

  return [state, setState];
}
