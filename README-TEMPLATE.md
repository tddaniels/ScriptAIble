# 🎬 ScriptAIble Template

**Professional screenplay editing foundation for building specialized writing applications.**

---

## ✨ Template Ready!

This repository is now configured as a **template** for creating custom screenplay editing applications. Use it as a foundation for:

- **TV Writing Suites**
- **Film Production Tools** 
- **Comic Script Editors**
- **Stage Play Applications**
- **Custom Writing Software**

## 🚀 Quick Start for New Projects

### 1. Create from Template
```bash
# Clone this template
git clone <this-repo-url> my-screenplay-app
cd my-screenplay-app

# Run setup script
./setup-new-project.sh
```

### 2. Install & Run
```bash
npm install && npm run editor:install
npm run dev
```

### 3. Customize
Edit `editor/src/config/custom-config.ts` to customize your app.

## 📋 What's Included

### ✅ Core Features
- **Professional Editor** - Fountain format with TAB cycling
- **Auto-save** - Persistent localStorage with configurable delays
- **PDF Export** - Industry-standard screenplay formatting
- **Final Draft Support** - Import/Export .fdx files  
- **Version Control** - Undo/redo with full history tracking
- **Script Statistics** - Comprehensive analytics dashboard
- **Scene Board** - Visual scene management
- **Spell Checking** - Screenplay-aware dictionary

### 🏗️ Technical Stack
- **Frontend:** React 19 + TypeScript + Vite
- **State Management:** Zustand with persistence
- **Editor:** Slate.js with custom screenplay logic
- **Styling:** CSS with CSS variables for theming
- **Parser:** fountain-js (TypeScript)

### 🎨 Template Features
- **Configuration System** - Easy customization via config files
- **Feature Flags** - Enable/disable functionality
- **Theme System** - CSS variables for easy rebranding
- **Setup Script** - Automated project initialization
- **Example Configurations** - Pre-built configs for different use cases

## 📁 Project Structure

```
scriptaible-template/
├── 📄 setup-new-project.sh     # Template initialization
├── 📄 TEMPLATE.md              # Template documentation
├── 📄 package.json             # Root package (fountain-js)
├── 📂 src/                     # Fountain parser library
├── 📂 editor/                  # React application
│   ├── 📂 src/config/          # Configuration system
│   │   ├── appConfig.ts        # Default configuration
│   │   └── custom-config.example.ts # Example customizations
│   ├── 📂 stores/              # State management
│   ├── 📂 services/            # Core services (PDF, FDX, etc.)
│   ├── 📂 hooks/               # React hooks
│   └── 📂 components/          # UI components
└── 📂 examples/                # Example configurations
    ├── tv-writer-config.ts     # TV writing app
    ├── film-production-config.ts # Film production tool
    ├── comic-script-config.ts  # Comic book editor
    └── minimal-writer-config.ts # Simple writing app
```

## 🎯 Example Projects

### TV Writer Pro
```typescript
// Focus: Television writing with fast revisions
features: {
  statistics: true,      // Episode tracking
  versionControl: true,  // Script revisions  
  testSuite: false,      // Clean interface
}
theme: {
  primary: '#8B0000',    // Drama red
  secondary: '#2F4F4F',  // Slate gray
}
```

### Film Production Suite  
```typescript
// Focus: Pre-production planning
features: {
  sceneBoard: true,      // Visual planning
  statistics: true,      // Detailed analysis
  pdfExport: true,       // Production scripts
}
theme: {
  primary: '#1a1a2e',    // Professional navy
  accent: '#0f3460',     // Deep blue
}
```

### Comic Script Writer
```typescript
// Focus: Comic book creation
features: {
  fdxImport: false,      // Not needed for comics
  sceneBoard: false,     // Panel-based instead
}
theme: {
  primary: '#FF4500',    // Comic orange
  background: '#FFFAF0', // Cream paper
}
editor: {
  defaultFont: 'Arial, sans-serif', // Comic standard
}
```

## 🔧 Development Commands

```bash
# Development
npm run dev              # Full development server
npm run editor:dev       # Editor only

# Building  
npm run build           # Build fountain-js library
npm run editor:build    # Build editor for production

# Testing
npm test               # Run fountain-js tests
npm run editor:lint    # Lint editor code
```

## 📚 Documentation

- **[TEMPLATE.md](TEMPLATE.md)** - Complete template documentation
- **[examples/](examples/)** - Configuration examples
- **[editor/src/config/](editor/src/config/)** - Configuration system

## 🎨 Customization

### Quick Theme Change
```typescript
// editor/src/config/custom-config.ts
export const CUSTOM_CONFIG: Partial<AppConfig> = {
  name: 'My App',
  theme: {
    primary: '#yourcolor',
    secondary: '#anothercolor',
  }
};
```

### Feature Flags
```typescript
features: {
  statistics: false,     // Hide statistics tab
  testSuite: false,      // Hide test interfaces  
  sceneBoard: true,      // Show scene management
  pdfExport: true,       // Enable PDF export
}
```

### Storage Configuration
```typescript
storage: {
  prefix: 'my-app',           // localStorage namespace
  maxScripts: 50,             // Script limit
  compressionEnabled: true,   // Large script support
}
```

## 📋 Getting Started Checklist

- [ ] Run `./setup-new-project.sh`
- [ ] Customize `editor/src/config/custom-config.ts`
- [ ] Test core functionality  
- [ ] Update theme colors
- [ ] Configure feature flags
- [ ] Set storage namespace
- [ ] Add custom branding
- [ ] Test export functions
- [ ] Deploy to hosting

## 📄 License

MIT License - Use freely for your projects.

---

**🎬 Ready to create your next screenplay application!**

For detailed documentation, see [TEMPLATE.md](TEMPLATE.md).