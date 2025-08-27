// ScriptAIble Template Configuration
// Customize these values for your specific project

export interface AppConfig {
  // Basic App Info
  name: string;
  version: string;
  description: string;
  author: string;
  
  // Feature Flags
  features: {
    statistics: boolean;
    versionControl: boolean;
    pdfExport: boolean;
    fdxImport: boolean;
    spellCheck: boolean;
    sceneBoard: boolean;
    testSuite: boolean;
    slateEditor: boolean;
  };
  
  // UI Customization
  theme: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    accent: string;
  };
  
  // Editor Settings
  editor: {
    autoSave: boolean;
    autoSaveDelay: number; // milliseconds
    spellCheckDelay: number; // milliseconds
    maxVersionHistory: number;
    defaultFont: string;
  };
  
  // Export Settings
  export: {
    defaultAuthor: string;
    pdfMargins: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
    includeTitlePage: boolean;
  };
  
  // Storage Settings
  storage: {
    prefix: string; // localStorage key prefix
    maxScripts: number;
    compressionEnabled: boolean;
  };
}

// Default template configuration
export const DEFAULT_CONFIG: AppConfig = {
  name: 'ScriptAIble',
  version: '1.0.0',
  description: 'Professional Screenplay Editor',
  author: 'Template User',
  
  features: {
    statistics: true,
    versionControl: true,
    pdfExport: true,
    fdxImport: true,
    spellCheck: true,
    sceneBoard: true,
    testSuite: true,
    slateEditor: true,
  },
  
  theme: {
    primary: '#2c5aa0',
    secondary: '#28a745',
    background: '#ffffff',
    text: '#333333',
    accent: '#007bff',
  },
  
  editor: {
    autoSave: true,
    autoSaveDelay: 2000,
    spellCheckDelay: 2000,
    maxVersionHistory: 50,
    defaultFont: 'Courier New, monospace',
  },
  
  export: {
    defaultAuthor: 'Author',
    pdfMargins: {
      top: 72,
      bottom: 72,
      left: 108,
      right: 72,
    },
    includeTitlePage: true,
  },
  
  storage: {
    prefix: 'scriptaible',
    maxScripts: 100,
    compressionEnabled: false,
  },
};

// Load custom configuration (can be overridden in custom-config.ts)
let customConfig: Partial<AppConfig> = {};

try {
  // Try to load custom configuration
  const custom = require('./custom-config');
  customConfig = custom.CUSTOM_CONFIG || {};
} catch {
  // No custom config file, use defaults
}

// Merge default config with custom overrides
export const APP_CONFIG: AppConfig = {
  ...DEFAULT_CONFIG,
  ...customConfig,
  features: {
    ...DEFAULT_CONFIG.features,
    ...(customConfig.features || {}),
  },
  theme: {
    ...DEFAULT_CONFIG.theme,
    ...(customConfig.theme || {}),
  },
  editor: {
    ...DEFAULT_CONFIG.editor,
    ...(customConfig.editor || {}),
  },
  export: {
    ...DEFAULT_CONFIG.export,
    ...(customConfig.export || {}),
  },
  storage: {
    ...DEFAULT_CONFIG.storage,
    ...(customConfig.storage || {}),
  },
};