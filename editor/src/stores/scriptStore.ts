import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { APP_CONFIG } from '../config/appConfig';

export interface Script {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  wordCount: number;
  pageCount: number;
}

export interface ScriptStore {
  // State
  scripts: Record<string, Script>;
  currentScriptId: string | null;
  autosaveEnabled: boolean;
  lastSaved: number;
  
  // Actions
  createScript: (title?: string) => string;
  loadScript: (id: string) => void;
  updateScript: (id: string, content: string) => void;
  updateScriptTitle: (id: string, title: string) => void;
  deleteScript: (id: string) => void;
  duplicateScript: (id: string) => string;
  getAllScripts: () => Script[];
  getCurrentScript: () => Script | null;
  toggleAutosave: () => void;
  exportScriptData: () => string;
  importScriptData: (data: string) => void;
}

export const useScriptStore = create<ScriptStore>()(
  persist(
    immer((set, get) => ({
      // Initial state
      scripts: {},
      currentScriptId: null,
      autosaveEnabled: true,
      lastSaved: 0,

      // Create new script
      createScript: (title = 'Untitled Script') => {
        const id = nanoid();
        const now = Date.now();
        
        set((state) => {
          state.scripts[id] = {
            id,
            title,
            content: '',
            createdAt: now,
            updatedAt: now,
            wordCount: 0,
            pageCount: 0,
          };
          state.currentScriptId = id;
        });
        
        return id;
      },

      // Load existing script
      loadScript: (id: string) => {
        const script = get().scripts[id];
        if (script) {
          set((state) => {
            state.currentScriptId = id;
          });
        }
      },

      // Update script content
      updateScript: (id: string, content: string) => {
        const script = get().scripts[id];
        if (script) {
          set((state) => {
            state.scripts[id].content = content;
            state.scripts[id].updatedAt = Date.now();
            // Basic word count calculation
            state.scripts[id].wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
            // Basic page count calculation (roughly 250 words per page)
            state.scripts[id].pageCount = Math.ceil(state.scripts[id].wordCount / 250);
            state.lastSaved = Date.now();
          });
        }
      },

      // Update script title
      updateScriptTitle: (id: string, title: string) => {
        const script = get().scripts[id];
        if (script) {
          set((state) => {
            state.scripts[id].title = title;
            state.scripts[id].updatedAt = Date.now();
          });
        }
      },

      // Delete script
      deleteScript: (id: string) => {
        set((state) => {
          delete state.scripts[id];
          if (state.currentScriptId === id) {
            const remainingScripts = Object.keys(state.scripts);
            state.currentScriptId = remainingScripts.length > 0 ? remainingScripts[0] : null;
          }
        });
      },

      // Duplicate script
      duplicateScript: (id: string) => {
        const script = get().scripts[id];
        if (script) {
          const newId = nanoid();
          const now = Date.now();
          
          set((state) => {
            state.scripts[newId] = {
              ...script,
              id: newId,
              title: `${script.title} (Copy)`,
              createdAt: now,
              updatedAt: now,
            };
            state.currentScriptId = newId;
          });
          
          return newId;
        }
        return '';
      },

      // Get all scripts as array
      getAllScripts: () => {
        return Object.values(get().scripts).sort((a, b) => b.updatedAt - a.updatedAt);
      },

      // Get current script
      getCurrentScript: () => {
        const { currentScriptId, scripts } = get();
        return currentScriptId ? scripts[currentScriptId] || null : null;
      },

      // Toggle autosave
      toggleAutosave: () => {
        set((state) => {
          state.autosaveEnabled = !state.autosaveEnabled;
        });
      },

      // Export all script data
      exportScriptData: () => {
        const { scripts } = get();
        return JSON.stringify({
          version: '1.0',
          exportDate: new Date().toISOString(),
          scripts: Object.values(scripts),
        }, null, 2);
      },

      // Import script data
      importScriptData: (data: string) => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.scripts && Array.isArray(parsed.scripts)) {
            set((state) => {
              parsed.scripts.forEach((script: Script) => {
                // Generate new ID to avoid conflicts
                const newId = nanoid();
                state.scripts[newId] = {
                  ...script,
                  id: newId,
                  title: `${script.title} (Imported)`,
                };
              });
            });
          }
        } catch (error) {
          console.error('Failed to import script data:', error);
        }
      },
    })),
    {
      name: `${APP_CONFIG.storage.prefix}-storage`,
      storage: createJSONStorage(() => localStorage),
      // Only persist essential data
      partialize: (state) => ({
        scripts: state.scripts,
        currentScriptId: state.currentScriptId,
        autosaveEnabled: state.autosaveEnabled,
      }),
    }
  )
);

// Utility function to generate nanoid if not available
function nanoid(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}