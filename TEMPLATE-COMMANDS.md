# ⚡ ScriptAIble Template - Command Reference

**Quick reference for all template and project commands**

---

## 🚀 Template Setup Commands

### Create New Project
```bash
# Method 1: Direct copy (recommended for private use)
cp -r scriptaible-template my-new-project
cd my-new-project
./setup-new-project.sh

# Method 2: Git clone
git clone <template-repo-url> my-new-project  
cd my-new-project
./setup-new-project.sh
```

### Fix Setup Script Permissions
```bash
chmod +x setup-new-project.sh
```

---

## 📦 Installation Commands

### Fresh Install
```bash
# Install root dependencies (fountain-js parser)
npm install

# Install editor dependencies (React app)
npm run editor:install

# OR install both in one command
npm install && npm run editor:install
```

### Clean Install (if issues)
```bash
# Remove all node_modules
rm -rf node_modules editor/node_modules

# Clear npm cache
npm cache clean --force

# Reinstall everything
npm install && npm run editor:install
```

---

## 🔧 Development Commands

### Start Development Server
```bash
# Start full development server (recommended)
npm run dev

# OR start editor only (faster startup)
npm run editor:dev

# Use custom port if 5173 is taken
npm run editor:dev -- --port 3001
```

### Development Utilities
```bash
# Lint editor code
npm run editor:lint

# Fix linting issues automatically
npm run editor:lint -- --fix

# Type check without building
npm run editor:check
```

---

## 🏗️ Build Commands

### Development Builds
```bash
# Build fountain-js library only
npm run build

# Build editor only
npm run editor:build

# Build everything for production
npm run build && npm run editor:build
```

### Clean Build
```bash
# Clean previous builds
npm run clean

# Clean and rebuild everything
npm run clean && npm run build && npm run editor:build
```

---

## 🧪 Testing Commands

### Run Tests
```bash
# Run fountain-js parser tests
npm test

# Run specific test file
npx jasmine spec/fountain.spec.ts

# Watch mode for continuous testing
npm run test:watch
```

### Code Quality
```bash
# Lint JavaScript/TypeScript
npm run editor:lint

# Type check
npm run editor:type-check

# Run all quality checks
npm run editor:lint && npm run editor:type-check && npm test
```

---

## 🎨 Customization Commands

### Copy Example Configurations
```bash
# TV writing app
cp examples/tv-writer-config.ts editor/src/config/custom-config.ts

# Film production tool
cp examples/film-production-config.ts editor/src/config/custom-config.ts

# Comic script editor
cp examples/comic-script-config.ts editor/src/config/custom-config.ts

# Minimal writer
cp examples/minimal-writer-config.ts editor/src/config/custom-config.ts
```

### View Current Configuration
```bash
# Display current custom config
cat editor/src/config/custom-config.ts

# View default configuration
cat editor/src/config/appConfig.ts
```

---

## 🌐 Deployment Commands

### Production Build
```bash
# Create optimized production build
npm run build && npm run editor:build

# Verify build files exist
ls -la editor/dist/

# Test production build locally
npm run editor:preview
```

### Deploy to Common Platforms
```bash
# Netlify (drag & drop or CLI)
netlify deploy --dir=editor/dist --prod

# Vercel
vercel --cwd editor

# GitHub Pages (using gh-pages package)
npm run editor:build && npx gh-pages -d editor/dist
```

---

## 🔍 Debugging Commands

### Development Debugging
```bash
# Start with debug logging
DEBUG=* npm run dev

# Check for TypeScript errors
npm run editor:type-check

# Verbose npm logging
npm run dev --loglevel verbose
```

### Build Debugging
```bash
# Analyze bundle size
npm run editor:analyze

# Build with verbose output
npm run editor:build -- --logLevel info

# Check for circular dependencies
npx madge --circular --extensions ts,tsx editor/src
```

### Dependency Debugging
```bash
# Check for outdated packages
npm outdated

# Audit for security issues
npm audit

# Fix security issues
npm audit fix

# List all dependencies
npm ls --depth=0
```

---

## 📊 Project Information Commands

### Project Status
```bash
# View package.json info
npm run env

# Check Node.js and npm versions
node --version && npm --version

# Display project structure
tree -I node_modules

# Check git status
git status
```

### Package Information
```bash
# View root package info
npm info

# View editor package info
cd editor && npm info

# List installed packages
npm list --depth=0
```

---

## 🔧 Maintenance Commands

### Update Dependencies
```bash
# Check for outdated packages
npm outdated

# Update all packages to latest compatible versions
npm update

# Update editor dependencies
cd editor && npm update

# Update to latest versions (careful!)
npx npm-check-updates -u && npm install
```

### Clean Up
```bash
# Remove node_modules
rm -rf node_modules editor/node_modules

# Clean npm cache
npm cache clean --force

# Remove build artifacts
rm -rf dist editor/dist

# Clean everything and reinstall
npm run clean && npm install && npm run editor:install
```

---

## 🚨 Emergency Commands

### Fix Common Issues
```bash
# Permission denied on setup script
chmod +x setup-new-project.sh

# Port already in use
lsof -ti:5173 | xargs kill -9

# Fix npm permissions (Mac/Linux)
sudo chown -R $(whoami) ~/.npm

# Reset to working state
git stash && git checkout main && npm install && npm run editor:install
```

### Complete Reset
```bash
# Nuclear option - reset everything
rm -rf node_modules editor/node_modules dist editor/dist .git
git init
npm install && npm run editor:install
npm run build && npm run editor:build
```

---

## 📝 Git Commands (for template maintenance)

### Template Repository Management
```bash
# Initialize template repo
git init
git add .
git commit -m "Initial template setup"

# Create template branch
git checkout -b template
git push -u origin template

# Tag template versions
git tag -a v1.0.0 -m "Template version 1.0.0"
git push --tags
```

### Update Template
```bash
# Pull latest template changes
git remote add template https://github.com/yourusername/scriptaible-template.git
git fetch template
git merge template/main
```

---

## 🎯 Quick Command Chains

### New Project (Full Setup)
```bash
cp -r scriptaible-template my-app && cd my-app && ./setup-new-project.sh && npm install && npm run editor:install && npm run dev
```

### Production Deployment
```bash
npm run build && npm run editor:build && npm run editor:lint && echo "Ready to deploy editor/dist/"
```

### Development Restart
```bash
pkill -f "vite" && npm run dev
```

### Full Clean & Rebuild
```bash
rm -rf node_modules editor/node_modules dist editor/dist && npm install && npm run editor:install && npm run build && npm run editor:build
```

---

## 📋 Command Aliases (Optional)

Add to your `~/.bashrc` or `~/.zshrc`:

```bash
# ScriptAIble Template Aliases
alias st-new="function _st_new() { cp -r scriptaible-template \$1 && cd \$1 && ./setup-new-project.sh; }; _st_new"
alias st-dev="npm run dev"
alias st-build="npm run build && npm run editor:build"
alias st-clean="rm -rf node_modules editor/node_modules dist editor/dist"
alias st-reset="st-clean && npm install && npm run editor:install"
```

Usage:
```bash
st-new my-app        # Create new project
st-dev               # Start development  
st-build             # Build for production
st-clean             # Clean builds
st-reset             # Full reset
```

---

## 🎉 Success Commands

### Verify Everything Works
```bash
# Complete verification
npm run build && npm run editor:build && npm run editor:lint && npm test && echo "✅ All systems go!"
```

### Launch Checklist
```bash
# Pre-launch verification
npm run editor:build && ls -la editor/dist/ && echo "📦 Build ready for deployment!"
```

---

**💡 Pro Tip:** Bookmark this page for quick reference when working with ScriptAIble templates!

**🎬 Happy scripting!** ✨