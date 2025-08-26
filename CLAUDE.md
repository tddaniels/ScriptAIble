# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains **ScriptAIble**, a professional screenplay editor built on top of the **fountain-js** parser. It consists of two main parts:

1. **fountain-js** (root) - A TypeScript parser for the Fountain screenplay markup language
2. **ScriptAIble Editor** (editor/) - A React-based screenplay writing application with Final Draft-style features

## Common Commands

### Development Workflow
```bash
# Build fountain-js library and start React editor
npm run dev

# Alternative: build library separately, then start editor
npm run build
cd editor && npm run dev

# Install editor dependencies (if needed)
npm run editor:install

# Build both library and editor for production  
npm run build && npm run editor:build

# Run fountain-js tests
npm test

# Lint editor code
cd editor && npm run lint
```

### Single Test Execution
The fountain-js library uses Jasmine. To run a specific test:
```bash
# Run all tests
npm test

# For individual test files, modify jasmine.json or run:
npx jasmine spec/fountain.spec.ts
```

## Architecture

### Core Parser (fountain-js)
- **src/fountain.ts** - Main `Fountain` class with `parse()` method
- **src/lexer.ts** - Tokenization logic, splits into `Lexer` and `InlineLexer` classes  
- **src/rules.ts** - RegExp patterns for detecting screenplay elements (scene_heading, character, dialogue, etc.)
- **src/token.ts** - Token classes for different screenplay elements
- **Dual Build System** - Outputs both CommonJS (`dist/`) and ESM (`dist.esm/`) formats

### ScriptAIble Editor Architecture
The editor is a React app that provides professional screenplay writing features:

**Core Components:**
- **ScreenplayEditor** - Main editing component with TAB key cycling, auto-completion, and Final Draft-style formatting
- **SceneBoard** - Visual scene cards view (like KIT Scenarist)
- **TestSuite** - Automated testing interface for verifying functionality

**Key Features:**
- **TAB Key Cycling**: Scene Heading → Action → Character → Dialogue → Parenthetical
- **Auto-completion**: `INT.` suggestions, character names, time indicators (`- DAY`, `- NIGHT`)
- **Industry-Standard Formatting**: Proper margins and indentation (3.7" for characters, 2.5" for dialogue)
- **Real-time Preview**: Live HTML rendering and JSON token view

### Formatting System
The editor uses CSS classes applied dynamically based on current element type:
- `element-scene_heading` - Left-aligned, bold, uppercase
- `element-character` - 3.7" indent, uppercase  
- `element-dialogue` - 2.5" indent, limited width
- `element-parenthetical` - 3.1" indent, italic, auto-wrapped in parentheses

### Dependencies
- **Editor uses local fountain-js**: `"fountain-js": "file:.."` in editor/package.json
- **Build Order**: fountain-js must be built before editor can import it
- **Vite Configuration**: Uses alias to resolve fountain-js properly

## Token System

The fountain-js parser produces flat token arrays with types like:
- `scene_heading`, `character`, `dialogue`, `action`, `parenthetical`
- `dialogue_begin`/`dialogue_end` - Wrapper tokens for dialogue blocks
- `dual_dialogue_begin`/`dual_dialogue_end` - For side-by-side dialogue

Each token has optional properties: `text`, `scene_number`, `dual`, `depth`

## Testing

The editor includes a built-in test suite accessible via the "Test" tab that verifies:
- Fountain parsing functionality
- Element type detection (scene headings, characters, dialogue)
- Auto-completion logic
- HTML generation

Run tests via the UI or examine `TestSuite.tsx` for programmatic testing patterns.