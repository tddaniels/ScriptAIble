import { useState, useEffect, useCallback } from 'react';
import { spellChecker, type SpellCheckError } from '../services/spellChecker';

interface UseSpellCheckOptions {
  enabled?: boolean;
  debounceMs?: number;
}

export const useSpellCheck = (text: string, options: UseSpellCheckOptions = {}) => {
  const { enabled = true, debounceMs = 1000 } = options;
  const [errors, setErrors] = useState<SpellCheckError[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Wait for spell checker to load
  useEffect(() => {
    spellChecker.waitForLoad().then(() => {
      setIsReady(true);
    });
  }, []);

  const checkSpelling = useCallback(async (textToCheck: string) => {
    if (!enabled || !isReady || !textToCheck.trim()) {
      setErrors([]);
      return;
    }

    setIsChecking(true);
    try {
      const spellErrors = await spellChecker.checkText(textToCheck);
      setErrors(spellErrors);
    } catch (error) {
      console.error('Spell check error:', error);
      setErrors([]);
    } finally {
      setIsChecking(false);
    }
  }, [enabled, isReady]);

  // Debounced spell checking
  useEffect(() => {
    if (!enabled || !isReady) return;

    const timeoutId = setTimeout(() => {
      checkSpelling(text);
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [text, checkSpelling, enabled, isReady, debounceMs]);

  const checkWordAt = useCallback(async (word: string) => {
    if (!enabled || !isReady) return null;
    
    return await spellChecker.checkWord(word);
  }, [enabled, isReady]);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  return {
    errors,
    isChecking,
    isReady,
    checkWordAt,
    clearErrors,
    recheckText: () => checkSpelling(text)
  };
};