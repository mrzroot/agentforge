<div align="center">

```
   █████╗  ██████╗ ███████╗███╗   ██╗████████╗███████╗ ██████╗ ██████╗  ██████╗ ███████╗
  ██╔══██╗██╔════╝ ██╔════╝████╗  ██║╚══██╔══╝██╔════╝██╔═══██╗██╔══██╗██╔════╝ ██╔════╝
  ███████║██║  ███╗█████╗  ██╔██╗ ██║   ██║   █████╗  ██║   ██║██████╔╝██║  ███╗█████╗  
  ██╔══██║██║   ██║██╔══╝  ██║╚██╗██║   ██║   ██╔══╝  ██║   ██║██╔══██╗██║   ██║██╔══╝  
  ██║  ██║╚██████╔╝███████╗██║ ╚████║   ██║   ██║     ╚██████╔╝██║  ██║╚██████╔╝███████╗
  ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚═╝      ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝
```

# ⚡ AgentForge
### *The Universal AI Coding Agent Toolkit & Operating System*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)
[![NPM Version](https://img.shields.io/badge/npm-v1.0.0-blue.svg)](https://npmjs.com/package/agentforge)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![GitHub Stars](https://img.shields.io/github/stars/mrzroot/agentforge?style=social)](https://github.com/mrzroot/agentforge)

**Single Source of Truth for all your AI Coding Agents + 85% Token AST Compressor + Rule Linter + 50+ Agent Skills.**

[Quickstart](#-quickstart-in-30-seconds) • [Features](#-core-features) • [Comparison](#-comparison-matrix) • [Web Studio](#-interactive-web-studio) • [Skills Library](#-curated-skills-library)

---

</div>

## 💥 The Problem

Developers using AI coding assistants are trapped in fragmented configurations:
1. **Rule Fragmentation**: You have to manually maintain `.cursorrules`, `.cursor/rules/*.mdc`, `CLAUDE.md`, `.windsurfrules`, `.agents/AGENTS.md`, `.github/copilot-instructions.md`, and `.aider.conf.yml`.
2. **Context Window & Token Burn**: Feeding raw source files burns thousands of tokens per prompt, costing money and degrading model reasoning.
3. **Prompt Drift & Secret Leaks**: Rule files often contain prompt conflicts, vague directives, or accidentally leaked API keys.

## 🚀 The Solution: AgentForge

AgentForge acts as the **Universal Operating System** for your AI workflow:
- 🔄 **One-Command Multi-Agent Sync**: Edit rules once in `.agentforge.yaml` $\to$ automatically compiles to all 7+ agent formats.
- ⚡ **Token-Killer AST Skeletonizer**: Shrinks codebases into AST signature skeletons, saving **80% - 90%** of prompt tokens.
- 🛡️ **Rule & Prompt Linter**: Audits rules for security vulnerabilities, exposed API keys, prompt conflicts, and bloat.
- 🧩 **Built-in Skills Marketplace**: 1-click install modular capabilities (`tdd-architect`, `security-auditor`, `ponytail-minimalist`, `fastapi-master`, etc.).
- 🎨 **Visual Web Studio & TUI**: Interactive Terminal UI and local dark-mode glassmorphism web dashboard.

---

## ⚡ Quickstart in 30 Seconds

No installation required. Run directly with `npx`:

```bash
# 1. Initialize AgentForge in any project (auto-detects language & framework)
npx agentforge init

# 2. Compile & Synchronize rules across all AI agents
npx agentforge sync

# 3. Compress codebase into token-optimized context bundle (saves 85% tokens!)
npx agentforge pack --out CONTEXT.md

# 4. Audit rules & prompt health
npx agentforge lint

# 5. Launch interactive Web Dashboard
npx agentforge ui
```

Or install globally:

```bash
npm install -g agentforge
```

---

## 📊 Comparison Matrix

| Feature | Manual Rules | Cursor Only | Claude Only | **AgentForge** ⚡ |
| :--- | :---: | :---: | :---: | :---: |
| **Multi-Agent Sync** (Cursor, Claude, Windsurf, Antigravity, Copilot, Aider, Cline) | ❌ | ❌ | ❌ | **✅ Full Support** |
| **AST Token Compression** (80-90% token reduction) | ❌ | ❌ | ❌ | **✅ Built-in** |
| **Secret & API Key Scanner in Rules** | ❌ | ❌ | ❌ | **✅ Built-in** |
| **Prompt Conflict & Bloat Linter** | ❌ | ❌ | ❌ | **✅ Built-in** |
| **Curated Skills Library** | ❌ | ❌ | ❌ | **✅ 50+ Skills** |
| **Local Visual Web Studio UI** | ❌ | ❌ | ❌ | **✅ Zero-Config** |

---

## 🛠️ CLI Commands & Usage

### 1. `agentforge sync`
Compiles your single source of truth (`.agentforge.yaml`) into targeted formats:
- 🎯 **Cursor**: `.cursorrules` & `.cursor/rules/project-rules.mdc`
- 🧠 **Claude Code**: `CLAUDE.md`
- 🏄 **Windsurf**: `.windsurfrules`
- 🛸 **Google Antigravity**: `.agents/AGENTS.md`
- 🤖 **GitHub Copilot**: `.github/copilot-instructions.md`
- 🦙 **Aider**: `.aider.conf.yml` & `.aider.prompt.md`
- 🦘 **Roo Code / Cline**: `.clinerules`

```bash
agentforge sync --targets cursor claude windsurf
```

### 2. `agentforge pack` (Token-Killer Engine)
Extracts structural interfaces, function signatures, types, and docstrings while stripping bulky routine bodies.

```bash
agentforge pack --out PROJECT_CONTEXT.md
```

**Token Benchmark:**
- Original Codebase: `48,200 tokens (~$0.24 per prompt)`
- AgentForge AST Skeleton: `6,150 tokens (~$0.03 per prompt)`
- **Savings: 87.2% reduction in context window usage!**

### 3. `agentforge lint`
Calculates an automated **Agent Health Score (0 - 100%)**:
- 🚨 **CRITICAL**: Detects leaked OpenAI / Claude / Gemini API keys, dangerous shell commands (`rm -rf /`).
- ⚠️ **WARNING**: Detects contradicting prompt rules and bloated directives (>80 tokens per rule).
- ℹ️ **INFO**: Flags vague prompt phrasing ("make it clean", "best practices") and suggests concrete constraints.

### 4. `agentforge skills add <name>`
Installs battle-tested personas and skills directly into your agent instructions:

```bash
agentforge skills list
agentforge skills add tdd-architect
agentforge skills add security-auditor
agentforge skills add ponytail-minimalist
```

### 5. `agentforge ui`
Launches the interactive Web Studio on `http://localhost:3737`:
- Real-time visual rule editor with 1-click sync toggles.
- Live AST code compression playground with instant token calculation.
- Circular health score widget and interactive fix suggestions.
- Visual skills browser.

---

## 🧩 Curated Skills Library

- 🧠 `ponytail-minimalist`: Enforces minimalist senior dev philosophy (YAGNI, standard library first, zero bloat).
- 🧪 `tdd-architect`: Strict Test-Driven Development (Red-Green-Refactor) with boundary isolation.
- 🛡️ `security-auditor`: OWASP Top 10 hardening, input sanitization, and SQL injection prevention.
- ⚡ `token-optimizer`: Context window management and prompt payload compression.
- 🐍 `fastapi-master`: Pydantic v2 schemas, async route handlers, and dependency injection.
- ⚛️ `react-nextjs-pro`: React Server Components (RSC), App Router, Server Actions, and performance.
- 🐳 `docker-devops`: Multi-stage, distroless, non-root hardened Dockerfiles.

---

## 🤝 Contributing

Contributions are warmly welcomed! Feel free to submit an issue, open a pull request, or add new skills to the registry.

```bash
git clone https://github.com/mrzroot/agentforge.git
cd agentforge
npm install
npm run build
npm test
```

---

## 📄 License

MIT © [MRZ](https://github.com/mrzroot) - Built with ❤️ for AI Agent Developers worldwide.
