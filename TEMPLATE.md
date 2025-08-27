# 🎬 ScriptAIble Template

A professional screenplay editing foundation for building specialized writing applications.

## 🚀 Quick Start

### Creating a New Project

1. **Clone this template:**
   ```bash
   git clone <this-repo-url> my-screenplay-app
   cd my-screenplay-app
   ```

2. **Run the setup script:**
   ```bash
   ./setup-new-project.sh
   ```

3. **Install and run:**
   ```bash
   npm install && npm run editor:install
   npm run dev
   ```

4. **Open:** `http://localhost:5173`

## 📋 What's Included

### ✅ Core Features
- **Professional Editor** - Fountain format with TAB cycling
- **Auto-save** - Persistent localStorage with 2s debounce
- **PDF Export** - Industry-standard screenplay formatting
- **Final Draft Support** - Import/Export .fdx files
- **Version Control** - Undo/redo with full history
- **Script Statistics** - Comprehensive analytics dashboard
- **Scene Board** - Visual scene management
- **Spell Checking** - Screenplay-aware dictionary

### 🏗️ Architecture
- **Frontend:** React 19 + TypeScript + Vite
- **State:** Zustand with persistence
- **Editor:** Slate.js with custom screenplay logic
- **Styling:** CSS with CSS variables for theming
- **Parser:** fountain-js (TypeScript)

## 🎨 Customization

### Theme Configuration
Edit `editor/src/config/custom-config.ts`:

```typescript
export const CUSTOM_CONFIG: Partial<AppConfig> = {
  name: 'My App Name',
  theme: {
    primary: '#8B0000',     // Main accent color
    secondary: '#2F4F4F',   // Secondary actions
    accent: '#FF6347',      // Highlights
    background: '#ffffff',  // Main background
    text: '#333333',        // Text color
  }
};
```

### Feature Flags
Enable/disable functionality:

```typescript
features: {
  statistics: true,      // Script analytics
  versionControl: true,  // Undo/redo system
  pdfExport: true,      // PDF generation
  fdxImport: true,      // Final Draft support
  spellCheck: false,    // Disable spell checking
  sceneBoard: true,     // Scene visualization
  testSuite: false,     // Hide test interfaces
  slateEditor: true,    // Use Slate editor
}
```

### Storage Configuration
```typescript
storage: {
  prefix: 'my-app',         // localStorage namespace
  maxScripts: 50,           // Script limit
  compressionEnabled: true, // Compress large scripts
}
```

## 🎯 Project Examples

### TV Writing Suite
```typescript
// custom-config.ts
export const CUSTOM_CONFIG: Partial<AppConfig> = {
  name: 'TV Writer Pro',
  description: 'Professional Television Writing Suite',
  
  theme: {
    primary: '#8B0000',   // Drama red
    secondary: '#2F4F4F', // Slate gray
  },
  
  features: {
    testSuite: false,     // Hide testing UI
    statistics: true,     // Track episode stats
  },
  
  editor: {
    autoSaveDelay: 1000,  // Faster saves
    maxVersionHistory: 100, // Keep more versions
  }
};
```

### Film Production Tool
```typescript
export const CUSTOM_CONFIG: Partial<AppConfig> = {
  name: 'Film Production Suite',
  description: 'Complete Pre-Production Tool',
  
  theme: {
    primary: '#1a1a2e',   // Dark blue
    secondary: '#16213e',
    accent: '#0f3460',
  },
  
  storage: {
    prefix: 'film-production',
    compressionEnabled: true, // Handle large scripts
  }
};
```

### Comic Script Writer
```typescript
export const CUSTOM_CONFIG: Partial<AppConfig> = {
  name: 'Comic Script Writer',
  description: 'Professional Comic Book Script Editor',
  
  theme: {
    primary: '#FF4500',   // Orange
    secondary: '#FFD700', // Gold
    background: '#FFFAF0', // Cream
  },
  
  features: {
    fdxImport: false,     // Comics don't use Final Draft
  },
  
  editor: {
    defaultFont: 'Arial, sans-serif', // Sans-serif for comics
  }
};
```

## 📁 Project Structure

```
your-project/
├── 📄 package.json              # Root package (fountain-js library)
├── 📄 setup-new-project.sh      # Template setup script
├── 📄 TEMPLATE.md              # This documentation
├── 📂 src/                     # Fountain parser source
│   ├── fountain.ts
│   ├── lexer.ts
│   └── ...
└── 📂 editor/                  # React application
    ├── 📄 package.json         # Editor dependencies
    ├── 📄 index.html          # HTML template
    ├── 📂 src/
    │   ├── 📄 App.tsx         # Main application
    │   ├── 📂 config/         # Configuration system
    │   │   ├── appConfig.ts   # Default config
    │   │   └── custom-config.ts # Your customizations
    │   ├── 📂 stores/         # Zustand state stores
    │   ├── 📂 services/       # Core services
    │   ├── 📂 hooks/          # React hooks
    │   └── 📂 components/     # UI components
    └── 📂 dist/               # Production build
```

## 🔧 Development

### Commands
```bash
# Development
npm run dev                 # Start full development server
npm run editor:dev         # Start editor only

# Building  
npm run build              # Build fountain-js library
npm run editor:build       # Build editor for production

# Testing
npm test                   # Run fountain-js tests
npm run editor:lint        # Lint editor code
```

### Adding New Features

1. **New Component:**
   ```bash
   # Create in editor/src/components/
   touch editor/src/components/MyFeature.tsx
   touch editor/src/components/MyFeature.css
   ```

2. **New Service:**
   ```bash
   # Create in editor/src/services/
   touch editor/src/services/myService.ts
   ```

3. **Configuration:**
   ```typescript
   // Add to appConfig.ts interface
   myFeature: {
     enabled: boolean;
     customSetting: string;
   }
   ```

### Theme Customization

The app uses CSS variables for easy theming:

```css
/* In your CSS files */
:root {
  --primary-color: var(--theme-primary);
  --secondary-color: var(--theme-secondary);
  --accent-color: var(--theme-accent);
  --background-color: var(--theme-background);
  --text-color: var(--theme-text);
}
```

## 📦 Deployment

### Production Build
```bash
npm run build && npm run editor:build
```

### Static Deployment
Deploy the `editor/dist/` folder to:
- **Netlify:** Drag & drop `dist` folder
- **Vercel:** Connect GitHub repo
- **GitHub Pages:** Enable pages on `dist` folder

### Custom Domain
Update `editor/vite.config.ts` for production:

```typescript
export default defineConfig({
  base: '/your-app-name/',  // For subdirectory deployment
  // ... other config
});
```

## 🛠️ Advanced Customization

### Custom Editor Elements
Add new screenplay element types by:

1. **Update parser** in `src/rules.ts`
2. **Add formatting** in `editor/src/components/ScreenplayFormatting.css`
3. **Update statistics** in `editor/src/services/statistics.ts`

### Custom Export Formats
Create new export options in `editor/src/services/`:

```typescript
// customExporter.ts
export class CustomExporter {
  export(tokens: Token[]): Blob {
    // Your custom format logic
  }
}
```

### Plugin System
The template supports a basic plugin architecture:

```typescript
// In custom-config.ts
plugins: [
  {
    name: 'MyPlugin',
    component: MyPluginComponent,
    enabled: true,
  }
]
```

## 📋 Checklist for New Projects

- [ ] Run `./setup-new-project.sh`
- [ ] Customize `editor/src/config/custom-config.ts`
- [ ] Update theme colors
- [ ] Test all features work
- [ ] Disable unused features
- [ ] Update storage namespace
- [ ] Add custom branding/logo
- [ ] Test export functionality
- [ ] Set up deployment
- [ ] Create project-specific documentation

## 🤝 Contributing Back to Template

If you create improvements that could benefit the template:

1. Create features that are configurable
2. Use feature flags for optional functionality
3. Maintain backward compatibility
4. Add configuration options
5. Update this documentation

## 📄 License

This template is provided as-is for your use. Customize freely for your projects.

---

**Template Version:** 1.0.0  
**Last Updated:** $(date +%Y-%m-%d)  
**Created by:** ScriptAIble Template System