// Custom Configuration Example
// Copy this file to 'custom-config.ts' and modify for your project

import type { AppConfig } from './appConfig';

export const CUSTOM_CONFIG: Partial<AppConfig> = {
  // Example: TV Writing App
  name: 'TV Writer Pro',
  description: 'Professional Television Writing Suite',
  author: 'Your Name',
  
  // Only specify features you want to change
  // features: {
  //   testSuite: false,     // Hide test interfaces
  //   slateEditor: false,   // Use simpler editor
  //   fdxImport: false,     // Disable Final Draft
  // },
  
  // Only specify theme colors you want to change
  // theme: {
  //   primary: '#8B0000',   // Dark red for TV drama feel
  //   secondary: '#2F4F4F', // Dark slate gray
  //   accent: '#FF6347',    // Tomato red for highlights
  // },
  
  // Only specify editor settings you want to change
  // editor: {
  //   autoSaveDelay: 1000,     // Faster auto-save
  //   maxVersionHistory: 100,  // More revision history
  // },
  
  // Only specify export settings you want to change
  // export: {
  //   defaultAuthor: 'Your Writing Team',
  //   includeTitlePage: false, // TV scripts skip title pages
  // },
  
  // Only specify storage settings you want to change
  // storage: {
  //   prefix: 'tv-writer-pro', // Unique storage namespace
  //   maxScripts: 50,          // Limit for TV episodes
  // },
};

// Example: Film Production Suite
/*
export const CUSTOM_CONFIG: Partial<AppConfig> = {
  name: 'Film Production Suite',
  description: 'Complete Film Pre-Production Tool',
  
  theme: {
    primary: '#1a1a2e',
    secondary: '#16213e',
    accent: '#0f3460',
  },
  
  features: {
    statistics: true,
    sceneBoard: true,
    // Add custom features for production planning
  },
  
  storage: {
    prefix: 'film-production',
    compressionEnabled: true, // Enable compression for large scripts
  },
};
*/

// Example: Comic Script Writer
/*
export const CUSTOM_CONFIG: Partial<AppConfig> = {
  name: 'Comic Script Writer',
  description: 'Professional Comic Book Script Editor',
  
  theme: {
    primary: '#FF4500',
    secondary: '#FFD700',
    background: '#FFFAF0',
  },
  
  features: {
    fdxImport: false, // Comics don't use Final Draft
    spellCheck: true,
  },
  
  editor: {
    defaultFont: 'Arial, sans-serif', // Comics often use sans-serif
  },
};
*/