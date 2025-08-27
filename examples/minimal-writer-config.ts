// Minimal Writer - Example Configuration
// Copy this content to editor/src/config/custom-config.ts for a simple writing app

import type { AppConfig } from '../src/config/appConfig';

export const CUSTOM_CONFIG: Partial<AppConfig> = {
  name: 'Simple Script Writer',
  description: 'Clean, Minimal Screenplay Editor',
  author: 'Writer',
  
  features: {
    statistics: false,     // Focus on writing, not stats
    versionControl: true,  // Basic undo/redo
    pdfExport: true,      // Essential export
    fdxImport: false,     // Keep it simple
    spellCheck: true,     // Essential for writing
    sceneBoard: false,    // Minimal interface
    testSuite: false,     // Hide all testing
    slateEditor: false,   // Use simpler editor
  },
  
  theme: {
    primary: '#6c757d',   // Neutral gray
    secondary: '#adb5bd', // Light gray
    background: '#ffffff',
    text: '#212529',      // Almost black
    accent: '#495057',    // Dark gray accents
  },
  
  editor: {
    autoSave: true,
    autoSaveDelay: 5000,     // Less frequent saves
    spellCheckDelay: 3000,   // Relaxed spell checking
    maxVersionHistory: 20,   // Basic history
    defaultFont: 'Courier New, monospace',
  },
  
  export: {
    defaultAuthor: 'Writer',
    pdfMargins: {
      top: 72,
      bottom: 72,
      left: 108,
      right: 72,
    },
    includeTitlePage: true,
  },
  
  storage: {
    prefix: 'simple-writer',
    maxScripts: 25,      // Small collection
    compressionEnabled: false,
  },
};