// TV Writer Pro - Example Configuration
// Copy this content to editor/src/config/custom-config.ts for a TV writing app

import type { AppConfig } from '../src/config/appConfig';

export const CUSTOM_CONFIG: Partial<AppConfig> = {
  name: 'TV Writer Pro',
  description: 'Professional Television Writing Suite',
  author: 'Your Name',
  
  features: {
    statistics: true,      // Track episode stats
    versionControl: true,  // Important for TV revisions
    pdfExport: true,      // For production scripts
    fdxImport: true,      // Studio compatibility
    spellCheck: true,     // Professional writing
    sceneBoard: true,     // Visual scene management
    testSuite: false,     // Hide in production
    slateEditor: true,    // Advanced editor features
  },
  
  theme: {
    primary: '#8B0000',   // Drama red
    secondary: '#2F4F4F', // Dark slate gray
    background: '#ffffff',
    text: '#333333',
    accent: '#FF6347',    // Tomato red highlights
  },
  
  editor: {
    autoSave: true,
    autoSaveDelay: 1000,     // Faster saves for TV writing
    spellCheckDelay: 1500,   // Quick spell checking
    maxVersionHistory: 100,  // Keep more history for revisions
    defaultFont: 'Courier New, monospace',
  },
  
  export: {
    defaultAuthor: 'TV Writing Team',
    pdfMargins: {
      top: 72,
      bottom: 72,
      left: 90,    // Slightly tighter left margin
      right: 72,
    },
    includeTitlePage: false, // TV scripts often skip title pages
  },
  
  storage: {
    prefix: 'tv-writer-pro',
    maxScripts: 50,        // TV episodes limit
    compressionEnabled: true, // Episodes can be large
  },
};