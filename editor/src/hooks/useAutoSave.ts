import { useCallback, useEffect, useRef } from 'react';
import { useScriptStore } from '../stores/scriptStore';
import { APP_CONFIG } from '../config/appConfig';

interface UseAutoSaveOptions {
  delay?: number; // Delay in milliseconds before saving
  enabled?: boolean; // Whether autosave is enabled
}

export const useAutoSave = (
  content: string,
  scriptId: string | null,
  options: UseAutoSaveOptions = {}
) => {
  const {
    delay = APP_CONFIG.editor.autoSaveDelay,
    enabled = APP_CONFIG.editor.autoSave,
  } = options;

  const updateScript = useScriptStore(state => state.updateScript);
  const autosaveEnabled = useScriptStore(state => state.autosaveEnabled);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastContentRef = useRef<string>('');

  const debouncedSave = useCallback(() => {
    if (!scriptId || !enabled || !autosaveEnabled) return;
    
    // Only save if content has actually changed
    if (content !== lastContentRef.current) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        updateScript(scriptId, content);
        lastContentRef.current = content;
      }, delay);
    }
  }, [content, scriptId, enabled, autosaveEnabled, updateScript, delay]);

  // Save immediately on certain conditions
  const saveImmediately = useCallback(() => {
    if (!scriptId || !enabled || !autosaveEnabled) return;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    updateScript(scriptId, content);
    lastContentRef.current = content;
  }, [content, scriptId, enabled, autosaveEnabled, updateScript]);

  useEffect(() => {
    debouncedSave();
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [debouncedSave]);

  // Save on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (scriptId && content !== lastContentRef.current && autosaveEnabled) {
        // Use navigator.sendBeacon for reliable saving on page unload
        const data = JSON.stringify({ scriptId, content });
        navigator.sendBeacon('/api/save', data);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [scriptId, content, autosaveEnabled]);

  // Save on visibility change (tab switch)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && scriptId && autosaveEnabled) {
        saveImmediately();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [saveImmediately, scriptId, autosaveEnabled]);

  return {
    saveImmediately,
    isAutoSaveEnabled: enabled && autosaveEnabled,
  };
};