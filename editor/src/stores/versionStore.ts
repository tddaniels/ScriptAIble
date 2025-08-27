import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { APP_CONFIG } from '../config/appConfig';

export interface VersionEntry {
  id: string;
  scriptId: string;
  timestamp: number;
  content: string;
  author: string;
  operation: 'create' | 'edit' | 'save' | 'import';
  contentHash: string;
  description?: string;
}

export interface VersionStore {
  // State
  versions: Record<string, VersionEntry[]>; // scriptId -> versions
  undoStack: Record<string, VersionEntry[]>; // scriptId -> undo stack
  redoStack: Record<string, VersionEntry[]>; // scriptId -> redo stack
  maxVersions: number;
  maxUndoRedo: number;

  // Actions
  saveVersion: (scriptId: string, content: string, operation: VersionEntry['operation'], description?: string) => void;
  getVersions: (scriptId: string) => VersionEntry[];
  rollbackToVersion: (scriptId: string, versionId: string) => string | null;
  undo: (scriptId: string) => string | null;
  redo: (scriptId: string) => string | null;
  canUndo: (scriptId: string) => boolean;
  canRedo: (scriptId: string) => boolean;
  clearHistory: (scriptId: string) => void;
  deleteVersionHistory: (scriptId: string) => void;
  compareVersions: (scriptId: string, versionId1: string, versionId2: string) => VersionComparison | null;
}

export interface VersionComparison {
  version1: VersionEntry;
  version2: VersionEntry;
  changes: Array<{
    type: 'added' | 'removed' | 'modified';
    content: string;
    lineNumber?: number;
  }>;
}

// Simple hash function for content
const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(16);
};

// Generate unique ID
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const useVersionStore = create<VersionStore>()(
  persist(
    immer((set, get) => ({
      // Initial state
      versions: {},
      undoStack: {},
      redoStack: {},
      maxVersions: APP_CONFIG.editor.maxVersionHistory,
      maxUndoRedo: 30,

      // Save a new version
      saveVersion: (scriptId: string, content: string, operation: VersionEntry['operation'], description?: string) => {
        const contentHash = simpleHash(content);
        const timestamp = Date.now();
        
        set((state) => {
          // Initialize arrays if they don't exist
          if (!state.versions[scriptId]) state.versions[scriptId] = [];
          if (!state.undoStack[scriptId]) state.undoStack[scriptId] = [];
          if (!state.redoStack[scriptId]) state.redoStack[scriptId] = [];

          // Don't save if content hasn't changed
          const lastVersion = state.versions[scriptId][0];
          if (lastVersion && lastVersion.contentHash === contentHash) {
            return;
          }

          const newVersion: VersionEntry = {
            id: generateId(),
            scriptId,
            timestamp,
            content,
            author: 'User', // TODO: Get from user context
            operation,
            contentHash,
            description,
          };

          // Add to versions (most recent first)
          state.versions[scriptId].unshift(newVersion);

          // Add to undo stack (for undo/redo operations)
          if (operation === 'edit' || operation === 'save') {
            state.undoStack[scriptId].push(newVersion);
            state.redoStack[scriptId] = []; // Clear redo stack on new edit

            // Limit undo stack size
            if (state.undoStack[scriptId].length > state.maxUndoRedo) {
              state.undoStack[scriptId].shift();
            }
          }

          // Limit versions history
          if (state.versions[scriptId].length > state.maxVersions) {
            state.versions[scriptId] = state.versions[scriptId].slice(0, state.maxVersions);
          }
        });
      },

      // Get all versions for a script
      getVersions: (scriptId: string) => {
        const { versions } = get();
        return versions[scriptId] || [];
      },

      // Rollback to a specific version
      rollbackToVersion: (scriptId: string, versionId: string) => {
        const { versions } = get();
        const scriptVersions = versions[scriptId];
        if (!scriptVersions) return null;

        const targetVersion = scriptVersions.find(v => v.id === versionId);
        if (!targetVersion) return null;

        // Save current state before rollback
        const currentVersion = scriptVersions[0];
        if (currentVersion && currentVersion.id !== versionId) {
          get().saveVersion(scriptId, currentVersion.content, 'save', 'Before rollback');
        }

        return targetVersion.content;
      },

      // Undo last change
      undo: (scriptId: string) => {
        const state = get();
        const undoStack = state.undoStack[scriptId];
        
        if (!undoStack || undoStack.length <= 1) return null;

        set((state) => {
          const currentVersion = state.undoStack[scriptId].pop();
          if (currentVersion) {
            state.redoStack[scriptId].push(currentVersion);
          }
        });

        // Return previous version content
        const previousVersion = get().undoStack[scriptId][get().undoStack[scriptId].length - 1];
        return previousVersion ? previousVersion.content : null;
      },

      // Redo last undone change
      redo: (scriptId: string) => {
        const state = get();
        const redoStack = state.redoStack[scriptId];
        
        if (!redoStack || redoStack.length === 0) return null;

        let versionToRedo: VersionEntry | undefined;
        set((state) => {
          versionToRedo = state.redoStack[scriptId].pop();
          if (versionToRedo) {
            state.undoStack[scriptId].push(versionToRedo);
          }
        });

        return versionToRedo ? versionToRedo.content : null;
      },

      // Check if undo is available
      canUndo: (scriptId: string) => {
        const { undoStack } = get();
        return (undoStack[scriptId]?.length || 0) > 1;
      },

      // Check if redo is available
      canRedo: (scriptId: string) => {
        const { redoStack } = get();
        return (redoStack[scriptId]?.length || 0) > 0;
      },

      // Clear undo/redo stacks but keep version history
      clearHistory: (scriptId: string) => {
        set((state) => {
          state.undoStack[scriptId] = [];
          state.redoStack[scriptId] = [];
        });
      },

      // Delete all version history for a script
      deleteVersionHistory: (scriptId: string) => {
        set((state) => {
          delete state.versions[scriptId];
          delete state.undoStack[scriptId];
          delete state.redoStack[scriptId];
        });
      },

      // Compare two versions
      compareVersions: (scriptId: string, versionId1: string, versionId2: string) => {
        const { versions } = get();
        const scriptVersions = versions[scriptId];
        if (!scriptVersions) return null;

        const version1 = scriptVersions.find(v => v.id === versionId1);
        const version2 = scriptVersions.find(v => v.id === versionId2);
        
        if (!version1 || !version2) return null;

        // Simple line-by-line comparison
        const lines1 = version1.content.split('\n');
        const lines2 = version2.content.split('\n');
        const changes: VersionComparison['changes'] = [];

        const maxLines = Math.max(lines1.length, lines2.length);
        
        for (let i = 0; i < maxLines; i++) {
          const line1 = lines1[i] || '';
          const line2 = lines2[i] || '';
          
          if (line1 !== line2) {
            if (!line1 && line2) {
              changes.push({ type: 'added', content: line2, lineNumber: i + 1 });
            } else if (line1 && !line2) {
              changes.push({ type: 'removed', content: line1, lineNumber: i + 1 });
            } else {
              changes.push({ type: 'modified', content: `${line1} → ${line2}`, lineNumber: i + 1 });
            }
          }
        }

        return {
          version1,
          version2,
          changes
        };
      },
    })),
    {
      name: `${APP_CONFIG.storage.prefix}-versions`,
      storage: createJSONStorage(() => localStorage),
      // Only persist essential data, limit size
      partialize: (state) => ({
        versions: Object.fromEntries(
          Object.entries(state.versions).map(([scriptId, versions]) => [
            scriptId,
            versions.slice(0, Math.min(versions.length, 20)) // Limit persisted versions
          ])
        ),
        maxVersions: state.maxVersions,
        maxUndoRedo: state.maxUndoRedo,
      }),
    }
  )
);