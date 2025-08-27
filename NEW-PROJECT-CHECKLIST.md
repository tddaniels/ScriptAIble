# 📋 New Project Checklist

**Complete guide for creating a new ScriptAIble-based application**

---

## 🚀 Pre-Setup

### Requirements Check
- [ ] **Node.js 16+** installed
- [ ] **npm** or **yarn** available
- [ ] **Git** installed (optional)
- [ ] **Template directory** accessible

### Project Planning
- [ ] **Project name** decided (e.g., `tv-writer-pro`)
- [ ] **Display name** chosen (e.g., `TV Writer Pro`)
- [ ] **Target audience** identified
- [ ] **Key features** planned
- [ ] **Color scheme** selected (optional)

---

## ⚡ Setup Process

### Step 1: Copy Template
```bash
# Choose your method:
□ Direct copy: cp -r scriptaible-template my-new-project
□ Git clone: git clone <template-url> my-new-project
□ Navigate: cd my-new-project
```

### Step 2: Run Setup Script
```bash
# Execute setup
□ chmod +x setup-new-project.sh
□ ./setup-new-project.sh
```

**Fill in prompts:**
- [ ] ✍️ Project name (kebab-case, e.g., `my-script-app`)
- [ ] ✍️ Display name (Title Case, e.g., `My Script App`)
- [ ] ✍️ Description (Brief app description)
- [ ] ✍️ Author name (Your name or company)
- [ ] ✍️ Version (Usually `1.0.0` for new projects)

### Step 3: Install Dependencies
```bash
□ npm install                    # Install root dependencies
□ npm run editor:install         # Install editor dependencies
```

### Step 4: Verify Setup
```bash
□ npm run build                  # Should complete without errors
□ npm run dev                    # Should start development server
□ Open http://localhost:5173     # Should show your app
```

---

## 🎨 Customization

### Basic Configuration
Edit `editor/src/config/custom-config.ts`:

**App Identity:**
- [ ] ✅ App name updated
- [ ] ✅ Description accurate
- [ ] ✅ Author information correct

**Theme Colors:**
- [ ] 🎨 Primary color set
- [ ] 🎨 Secondary color chosen
- [ ] 🎨 Accent color defined
- [ ] 🎨 Background color (if changed)
- [ ] 🎨 Text color (if changed)

**Feature Flags:**
- [ ] 📊 Statistics tab (show/hide)
- [ ] 🔄 Version control (undo/redo buttons)
- [ ] 📄 PDF export functionality  
- [ ] 📥 Final Draft import/export
- [ ] 🎬 Scene board visualization
- [ ] 🧪 Test suites (usually hide in production)
- [ ] ✏️ Spell checking
- [ ] 📝 Slate editor (advanced features)

### Advanced Settings
- [ ] ⚙️ Auto-save delay configured
- [ ] 📚 Max version history set
- [ ] 💾 Storage prefix (unique namespace)
- [ ] 📄 PDF export margins
- [ ] 👤 Default author name

---

## 🧪 Testing

### Functionality Tests
- [ ] ✅ **Basic editing** works (type screenplay text)
- [ ] ⌨️ **TAB cycling** works (Scene → Action → Character → Dialogue)
- [ ] 💾 **Auto-save** functioning (text persists on reload)
- [ ] 🔄 **Undo/Redo** buttons respond
- [ ] 📄 **PDF export** generates correct format
- [ ] 📊 **Statistics** show accurate data
- [ ] 🎬 **Scene board** displays scenes (if enabled)
- [ ] 📱 **Responsive** design works on different screens

### Feature-Specific Tests
**If Final Draft enabled:**
- [ ] 📥 Can import .fdx files
- [ ] 📤 Can export .fdx files

**If Scene Board enabled:**
- [ ] 🎬 Scene cards display correctly
- [ ] 🎯 Scene navigation works

**If Statistics enabled:**
- [ ] 📊 Page count accurate
- [ ] 📈 Word count correct
- [ ] 👥 Character statistics show
- [ ] ⏱️ Runtime estimate reasonable

### Browser Testing
- [ ] 🌐 **Chrome** - All features work
- [ ] 🦊 **Firefox** - All features work  
- [ ] 🧭 **Safari** - All features work (if targeting Mac)
- [ ] 📱 **Mobile** - Responsive design functional

---

## 🚀 Production Preparation

### Code Quality
```bash
□ npm run editor:lint            # Fix any linting errors
□ npm run build                  # Verify production build
□ npm run editor:build           # Verify editor build
```

### Deployment Setup
- [ ] 📦 **Build files** generated in `editor/dist/`
- [ ] 🌐 **Hosting platform** chosen (Netlify, Vercel, etc.)
- [ ] 🔗 **Custom domain** configured (optional)
- [ ] 🔒 **HTTPS** enabled
- [ ] 🧪 **Production testing** completed

### Documentation
- [ ] 📝 **README.md** updated with project specifics
- [ ] 📚 **User instructions** written
- [ ] 🔧 **Setup instructions** for team members
- [ ] 📋 **Feature documentation** created
- [ ] 🐛 **Known issues** documented

---

## 🔄 Post-Launch

### Repository Management
- [ ] 📂 **Git repository** initialized
- [ ] 🌱 **Initial commit** created
- [ ] 🔗 **Remote repository** connected (GitHub, etc.)
- [ ] 📋 **Issues tracking** enabled
- [ ] 🏷️ **Version tags** strategy planned

### Maintenance Planning
- [ ] 🔄 **Update schedule** planned
- [ ] 🐛 **Bug reporting** process established  
- [ ] 📈 **Analytics** setup (optional)
- [ ] 👥 **User feedback** collection method
- [ ] 🔒 **Backup strategy** implemented

### Team Setup (if applicable)
- [ ] 👥 **Team access** configured
- [ ] 📋 **Contribution guidelines** written
- [ ] 🔄 **CI/CD pipeline** setup (optional)
- [ ] 📝 **Code review** process established

---

## ⚠️ Common Issues Checklist

### Setup Issues
- [ ] ❌ **Setup script permission denied** → `chmod +x setup-new-project.sh`
- [ ] ❌ **Node version too old** → Upgrade to Node 16+
- [ ] ❌ **Port already in use** → Use `--port 3001` flag
- [ ] ❌ **Dependencies fail to install** → Clear npm cache, try again

### Configuration Issues
- [ ] ❌ **Custom config not loading** → Check filename is `custom-config.ts`
- [ ] ❌ **TypeScript errors** → Validate config syntax
- [ ] ❌ **Features not appearing** → Check feature flags
- [ ] ❌ **Theme not applied** → Restart dev server

### Build Issues
- [ ] ❌ **Build fails** → Check for TypeScript errors
- [ ] ❌ **Import errors** → Verify all dependencies installed
- [ ] ❌ **Memory issues** → Increase Node memory limit
- [ ] ❌ **Slow builds** → Consider excluding unnecessary files

---

## 📊 Project Variants

### Quick Setup for Common Types

**📺 TV Writing App:**
```bash
□ Name: tv-writer-pro
□ Copy: cp examples/tv-writer-config.ts editor/src/config/custom-config.ts
□ Theme: Drama red (#8B0000)
□ Features: Fast saves, episode tracking
```

**🎬 Film Production:**
```bash
□ Name: film-production-suite  
□ Copy: cp examples/film-production-config.ts editor/src/config/custom-config.ts
□ Theme: Professional navy (#1a1a2e)
□ Features: Scene planning, detailed analytics
```

**📚 Comic Script Editor:**
```bash
□ Name: comic-script-writer
□ Copy: cp examples/comic-script-config.ts editor/src/config/custom-config.ts  
□ Theme: Comic orange (#FF4500)
□ Features: Panel-based, sans-serif fonts
```

**✏️ Simple Writer:**
```bash
□ Name: simple-writer
□ Copy: cp examples/minimal-writer-config.ts editor/src/config/custom-config.ts
□ Theme: Neutral gray (#6c757d)  
□ Features: Minimal interface, essential tools only
```

---

## ✅ Success Criteria

**✅ Project is ready when:**
- [ ] 🏗️ Builds without errors
- [ ] 🌐 Runs on development server
- [ ] 🎨 Shows your branding/theme
- [ ] ⚙️ All desired features work
- [ ] 📱 Responsive on target devices
- [ ] 🚀 Production build succeeds
- [ ] 📝 Documentation is complete
- [ ] 🧪 Testing is satisfactory

---

## 🎉 Launch Ready!

**Congratulations! Your ScriptAIble-based application is ready for the world.**

**Time invested:** ~30 minutes setup + customization time  
**Features included:** Professional screenplay editing suite  
**Maintenance:** Minimal, template handles the heavy lifting  

**🚀 Deploy with confidence!** 🎬✨

---

*Keep this checklist for future projects - it gets faster each time!*