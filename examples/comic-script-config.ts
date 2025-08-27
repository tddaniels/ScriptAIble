// Comic Script Writer - Example Configuration  
// Copy this content to editor/src/config/custom-config.ts for comic book writing

import type { AppConfig } from '../src/config/appConfig';

export const CUSTOM_CONFIG: Partial<AppConfig> = {
  name: 'Comic Script Writer',
  description: 'Professional Comic Book Script Editor',
  author: 'Comic Creator',
  
  features: {
    statistics: true,      // Panel and page counts
    versionControl: true,  // Issue revisions
    pdfExport: true,      // Artist scripts
    fdxImport: false,     // Comics don't use Final Draft
    spellCheck: true,     // Character dialogue
    sceneBoard: false,    // Not relevant for comics
    testSuite: false,     // Clean interface
    slateEditor: true,    // Full editor features
  },
  
  theme: {
    primary: '#FF4500',   // Orange (comic book energy)
    secondary: '#FFD700', // Gold accents
    background: '#FFFAF0', // Cream background (like comic paper)
    text: '#2F2F2F',      // Soft black
    accent: '#DC143C',    // Crimson highlights
  },
  
  editor: {
    autoSave: true,
    autoSaveDelay: 2000,
    spellCheckDelay: 2000,
    maxVersionHistory: 50,
    defaultFont: 'Arial, Helvetica, sans-serif', // Comics often use sans-serif
  },
  
  export: {
    defaultAuthor: 'Comic Book Creator',
    pdfMargins: {
      top: 72,
      bottom: 72,
      left: 72,    // Different margins for comic format
      right: 72,
    },
    includeTitlePage: true,
  },
  
  storage: {
    prefix: 'comic-script-writer',
    maxScripts: 100,     // Many issues/stories
    compressionEnabled: false,
  },
};