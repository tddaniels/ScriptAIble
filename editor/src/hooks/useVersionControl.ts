import { useCallback } from 'react';
import { useVersionStore } from '../stores/versionStore';

export const useVersionControl = (scriptId: string | null) => {
  const {
    saveVersion,
    getVersions,
    rollbackToVersion,
    undo,
    redo,
    canUndo,
    canRedo,
    clearHistory,
    compareVersions,
  } = useVersionStore();

  const save = useCallback((content: string, operation: 'create' | 'edit' | 'save' | 'import' = 'edit', description?: string) => {
    if (!scriptId) return;
    saveVersion(scriptId, content, operation, description);
  }, [scriptId, saveVersion]);

  const rollback = useCallback((versionId: string) => {
    if (!scriptId) return null;
    return rollbackToVersion(scriptId, versionId);
  }, [scriptId, rollbackToVersion]);

  const undoChange = useCallback(() => {
    if (!scriptId) return null;
    return undo(scriptId);
  }, [scriptId, undo]);

  const redoChange = useCallback(() => {
    if (!scriptId) return null;
    return redo(scriptId);
  }, [scriptId, redo]);

  const getHistory = useCallback(() => {
    if (!scriptId) return [];
    return getVersions(scriptId);
  }, [scriptId, getVersions]);

  const canUndoChange = useCallback(() => {
    if (!scriptId) return false;
    return canUndo(scriptId);
  }, [scriptId, canUndo]);

  const canRedoChange = useCallback(() => {
    if (!scriptId) return false;
    return canRedo(scriptId);
  }, [scriptId, canRedo]);

  const clear = useCallback(() => {
    if (!scriptId) return;
    clearHistory(scriptId);
  }, [scriptId, clearHistory]);

  const compare = useCallback((versionId1: string, versionId2: string) => {
    if (!scriptId) return null;
    return compareVersions(scriptId, versionId1, versionId2);
  }, [scriptId, compareVersions]);

  return {
    save,
    rollback,
    undo: undoChange,
    redo: redoChange,
    canUndo: canUndoChange,
    canRedo: canRedoChange,
    getHistory,
    clearHistory: clear,
    compareVersions: compare,
  };
};