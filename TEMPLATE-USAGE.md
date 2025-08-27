# 🎬 ScriptAIble Template - Usage Instructions

## 📋 Template Complete!

Your ScriptAIble project is now configured as a **reusable template** for creating specialized screenplay applications.

## 🚀 How to Use This Template

### For YOU (Template Owner):

#### Method 1: Direct Copy (Recommended for Private Use)
```bash
# Copy to new project directory  
cp -r /path/to/scriptaible my-new-project
cd my-new-project

# Initialize as new project
rm -rf .git
./setup-new-project.sh

# Follow the prompts to configure your new app
```

#### Method 2: Git Clone Method
```bash
# Create new repo from this template
git clone <this-repo-url> my-new-project
cd my-new-project

# Run setup script
./setup-new-project.sh

# The script will:
# - Ask for project name and details
# - Update package.json files
# - Create custom config
# - Initialize new git repo
# - Clean up template files
```

## 🎯 What the Setup Script Does

1. **Prompts for project details:**
   - Project name (e.g., 'tv-writer-pro')
   - Display name (e.g., 'TV Writer Pro')
   - Description
   - Author name
   - Version

2. **Updates files automatically:**
   - `package.json` → Updates name, version, description
   - `editor/package.json` → Updates editor package info  
   - `editor/index.html` → Updates page title
   - `editor/src/config/custom-config.ts` → Creates your config
   - `README.md` → Creates project-specific README

3. **Cleans up template files:**
   - Removes setup script itself
   - Removes template examples
   - Initializes fresh git repo

## 🎨 Example Usage Scenarios

### TV Writing Suite
```bash
./setup-new-project.sh
# Enter: tv-writer-pro, TV Writer Pro, etc.
# Edit custom-config.ts with TV-specific settings
```

### Film Production Tool  
```bash
./setup-new-project.sh  
# Enter: film-production-suite, Film Production Suite, etc.
# Copy from examples/film-production-config.ts
```

### Comic Script Editor
```bash
./setup-new-project.sh
# Enter: comic-script-writer, Comic Script Writer, etc.
# Copy from examples/comic-script-config.ts
```

## 📁 Template Structure After Setup

**Before Setup:**
```
scriptaible-template/
├── setup-new-project.sh       # Setup script
├── TEMPLATE.md                # Template docs
├── examples/                  # Example configs
└── editor/src/config/
    └── custom-config.example.ts
```

**After Setup:**
```
my-new-project/
├── README.md                  # Project-specific README
├── package.json              # Updated with your details
└── editor/src/config/
    └── custom-config.ts       # Your configuration
```

## ⚙️ Post-Setup Customization

### 1. Edit Configuration
```typescript
// editor/src/config/custom-config.ts
export const CUSTOM_CONFIG: Partial<AppConfig> = {
  name: 'Your App Name',
  
  features: {
    statistics: true,    // Show/hide features
    testSuite: false,    // Clean production interface
  },
  
  theme: {
    primary: '#yourcolor',    // Rebrand colors
    secondary: '#another',
  },
  
  storage: {
    prefix: 'your-app',       // Unique namespace
  },
};
```

### 2. Install & Test
```bash
npm install && npm run editor:install
npm run dev
# Visit: http://localhost:5173
```

### 3. Deploy
```bash
npm run build && npm run editor:build
# Deploy editor/dist/ folder
```

## 🔄 Updating the Template

To improve the base template for future projects:

1. **Make changes** to the template repository
2. **Test** with `npm run build`  
3. **Commit** improvements
4. **Future projects** benefit from updates

## 📋 New Project Checklist

After running setup script:

- [ ] ✅ Configure `custom-config.ts`
- [ ] 🎨 Test theme colors
- [ ] 🔧 Enable/disable features  
- [ ] 💾 Set unique storage prefix
- [ ] 📝 Update app branding
- [ ] ✨ Test all functionality
- [ ] 🚀 Deploy to hosting
- [ ] 📚 Add project documentation

## 🎭 Example Projects You Can Create

| Project Type | Focus | Key Features |
|-------------|--------|--------------|
| **TV Writer Pro** | Television scripts | Fast saves, episode tracking |
| **Film Production** | Pre-production | Scene planning, detailed stats |
| **Comic Script Writer** | Comic books | Panel-based, sans-serif fonts |
| **Stage Play Editor** | Theater | Character tracking, cue management |
| **Student Writer** | Learning | Simplified interface, tutorials |
| **Production Suite** | Professional | All features, team collaboration |

## 🛠️ Troubleshooting

**Setup script won't run:**
```bash
chmod +x setup-new-project.sh
./setup-new-project.sh
```

**Build errors:**
```bash
# Clean and rebuild
npm run clean  
npm install && npm run editor:install
npm run build
```

**Custom config not loading:**
- Check file is named `custom-config.ts` (not `.example.ts`)
- Verify TypeScript syntax is correct
- Restart development server

---

## 🎉 You're Ready!

Your ScriptAIble template is now ready to spawn unlimited specialized screenplay applications. Each new project gets:

✅ **Professional editor** with industry formatting  
✅ **Modern tech stack** (React 19, TypeScript, Vite)  
✅ **Complete feature set** (PDF export, version control, statistics)  
✅ **Easy customization** through configuration files  
✅ **Clean setup process** via automated script  

**Happy creating!** 🎬✨