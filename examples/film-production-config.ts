// Film Production Suite - Example Configuration
// Copy this content to editor/src/config/custom-config.ts for a film production tool

import type { AppConfig } from '../src/config/appConfig';

export const CUSTOM_CONFIG: Partial<AppConfig> = {
  name: 'Film Production Suite',
  description: 'Complete Film Pre-Production Tool',
  author: 'Production Company',
  
  features: {
    statistics: true,      // Detailed script analysis
    versionControl: true,  // Track script revisions
    pdfExport: true,      // Production scripts
    fdxImport: true,      // Writer compatibility
    spellCheck: true,     // Professional quality
    sceneBoard: true,     // Production planning
    testSuite: false,     // Production environment
    slateEditor: true,    // Full editing capabilities
  },
  
  theme: {
    primary: '#1a1a2e',   // Dark navy
    secondary: '#16213e', // Darker blue
    background: '#f8f9fa',
    text: '#2d3436',
    accent: '#0f3460',    // Deep blue accents
  },
  
  editor: {
    autoSave: true,
    autoSaveDelay: 3000,     // Less aggressive saves
    spellCheckDelay: 2000,
    maxVersionHistory: 200,  // Extensive revision history
    defaultFont: 'Courier Prime, Courier New, monospace',
  },
  
  export: {
    defaultAuthor: 'Production Team',
    pdfMargins: {
      top: 72,
      bottom: 72,
      left: 108,   // Standard screenplay margins
      right: 72,
    },
    includeTitlePage: true,  // Professional presentation
  },
  
  storage: {
    prefix: 'film-production',
    maxScripts: 25,          // Feature film projects
    compressionEnabled: true, // Large scripts with notes
  },
};