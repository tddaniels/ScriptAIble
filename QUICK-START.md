# 🚀 ScriptAIble Template - Quick Start Guide

**Create professional screenplay applications in minutes, not months.**

---

## ⚡ 30-Second Quick Start

```bash
# 1. Copy template
cp -r scriptaible-template my-screenplay-app
cd my-screenplay-app

# 2. Run setup
./setup-new-project.sh

# 3. Install & run
npm install && npm run editor:install && npm run dev
```

**Done!** Visit `http://localhost:5173` 🎉

---

## 📋 Step-by-Step Instructions

### 1️⃣ **Copy Template**

**Option A: Direct Copy (Recommended)**
```bash
# Copy entire template directory
cp -r /path/to/scriptaible-template my-new-app
cd my-new-app
```

**Option B: Git Clone**
```bash
# Clone from your template repository
git clone https://github.com/yourusername/scriptaible-template.git my-new-app
cd my-new-app
```

### 2️⃣ **Run Setup Script**

```bash
./setup-new-project.sh
```

**The script will prompt for:**

| Prompt | Example | Description |
|--------|---------|-------------|
| **Project name** | `tv-writer-pro` | Internal name (kebab-case) |
| **Display name** | `TV Writer Pro` | User-facing title |
| **Description** | `Professional TV writing suite` | App description |
| **Author name** | `Your Name` | Creator name |
| **Version** | `1.0.0` | Starting version |

### 3️⃣ **Install Dependencies**

```bash
# Install root dependencies (fountain-js parser)
npm install

# Install editor dependencies (React app)
npm run editor:install
```

### 4️⃣ **Start Development**

```bash
# Start development server
npm run dev

# OR start editor only
npm run editor:dev
```

**🌐 Open:** `http://localhost:5173`

---

## 🎨 Customization (Optional)

### Quick Theme Change
```typescript
// editor/src/config/custom-config.ts
export const CUSTOM_CONFIG = {
  name: 'My Custom App',
  theme: {
    primary: '#8B0000',     // Your brand color
    secondary: '#2F4F4F',   // Secondary color
    accent: '#FF6347',      // Highlight color
  }
};
```

### Feature Toggles
```typescript
features: {
  statistics: true,       // Show stats tab
  versionControl: true,   // Undo/redo buttons
  pdfExport: true,        // PDF export button
  fdxImport: true,        // Final Draft support
  sceneBoard: false,      // Hide scene board
  testSuite: false,       // Hide test interfaces
}
```

---

## 🎯 Common Project Types

### 📺 TV Writing App
```bash
./setup-new-project.sh
# Name: tv-writer-pro
# Display: TV Writer Pro

# Copy TV config:
cp examples/tv-writer-config.ts editor/src/config/custom-config.ts
```

### 🎬 Film Production Tool
```bash
./setup-new-project.sh  
# Name: film-production-suite
# Display: Film Production Suite

# Copy film config:
cp examples/film-production-config.ts editor/src/config/custom-config.ts
```

### 📚 Comic Script Editor
```bash
./setup-new-project.sh
# Name: comic-script-writer  
# Display: Comic Script Writer

# Copy comic config:
cp examples/comic-script-config.ts editor/src/config/custom-config.ts
```

### ✏️ Simple Writer
```bash
./setup-new-project.sh
# Name: simple-writer
# Display: Simple Script Writer

# Copy minimal config:
cp examples/minimal-writer-config.ts editor/src/config/custom-config.ts
```

---

## 🚀 Production Deployment

### Build for Production
```bash
# Build both library and editor
npm run build && npm run editor:build
```

### Deploy Static Files
Deploy the `editor/dist/` folder to:
- **Netlify:** Drag & drop `dist` folder
- **Vercel:** Connect GitHub repo, set build directory to `editor`
- **GitHub Pages:** Enable Pages on `editor/dist` branch
- **AWS S3:** Upload `dist` contents to bucket

### Environment Variables
```bash
# For custom API endpoints (if needed)
VITE_API_URL=https://your-api.com
VITE_APP_NAME="Your App Name"
```

---

## 🛠️ Development Commands Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start full development server |
| `npm run build` | Build fountain-js library |
| `npm run editor:dev` | Start editor only |
| `npm run editor:build` | Build editor for production |
| `npm run editor:install` | Install editor dependencies |
| `npm run editor:lint` | Lint editor code |
| `npm test` | Run fountain-js tests |

---

## 🔧 Troubleshooting

### Setup Script Issues
```bash
# Make script executable
chmod +x setup-new-project.sh

# Run with bash explicitly  
bash setup-new-project.sh
```

### Build Errors
```bash
# Clean and rebuild
rm -rf node_modules editor/node_modules
npm install && npm run editor:install
npm run build
```

### Port Already in Use
```bash
# Use different port
npm run editor:dev -- --port 3001
```

### Custom Config Not Loading
- ✅ File named `custom-config.ts` (not `.example.ts`)
- ✅ Valid TypeScript syntax
- ✅ Restart development server after changes

---

## 📂 Project Structure After Setup

```
my-new-app/
├── 📄 package.json              # Updated with your project name
├── 📄 README.md                 # Project-specific documentation
├── 📂 src/                      # Fountain parser library
├── 📂 editor/                   # React application  
│   ├── 📄 package.json          # Editor dependencies
│   ├── 📄 index.html            # Updated with your app name
│   ├── 📂 src/
│   │   ├── 📄 App.tsx           # Main application
│   │   └── 📂 config/
│   │       └── 📄 custom-config.ts  # Your customizations
│   └── 📂 dist/                 # Production build (after build)
└── 📂 dist/                     # Library build (after build)
```

---

## ✅ Success Checklist

After running setup:

- [ ] ✅ Project builds without errors (`npm run build`)
- [ ] 🌐 Development server starts (`npm run dev`)
- [ ] 🎨 App shows your custom name and colors
- [ ] 📝 Basic screenplay editing works
- [ ] 📄 PDF export functions
- [ ] 💾 Auto-save is working
- [ ] 🔄 Undo/redo buttons respond
- [ ] 📊 Statistics tab shows data
- [ ] 🎯 Only desired features are visible

---

## 🔄 Multiple Projects Workflow

### For Multiple Apps:
```bash
# Project 1: TV Writer
cp -r scriptaible-template tv-writer-pro
cd tv-writer-pro && ./setup-new-project.sh

# Project 2: Film Tool  
cp -r scriptaible-template film-production
cd film-production && ./setup-new-project.sh

# Project 3: Comic Editor
cp -r scriptaible-template comic-writer
cd comic-writer && ./setup-new-project.sh
```

### Shared Improvements:
- Make improvements to the **template** repository
- Future projects automatically benefit
- Consider scripting common customizations

---

## 📞 Quick Help

| Issue | Solution |
|-------|----------|
| **Script won't run** | `chmod +x setup-new-project.sh` |
| **Build fails** | Check Node.js version (16+) |
| **Port in use** | Use `--port 3001` flag |
| **Config ignored** | Restart dev server |
| **TypeScript errors** | Check custom-config.ts syntax |
| **Missing features** | Check feature flags in config |

---

## 🎉 You're Ready!

**Time to create:** ~5 minutes  
**Professional features:** ✅ All included  
**Customization:** 🎨 Unlimited  
**Deployment:** 🚀 Production-ready  

**Start building your next screenplay application now!** 🎬✨

---

*For detailed documentation, see [TEMPLATE.md](TEMPLATE.md)*  
*For usage examples, see [examples/](examples/) directory*