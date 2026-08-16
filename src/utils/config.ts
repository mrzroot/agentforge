import fs from 'fs';
import path from 'path';
import YAML from 'yaml';
import { AgentForgeConfig, SupportedAgent } from '../core/sync/types';

export const CONFIG_FILE_NAMES = [
  '.agentforge.yaml',
  'agentforge.yaml',
  '.agentforge.yml',
  'agentforge.yml',
  'agentforge.json',
  '.agentforge.json'
];

export const DEFAULT_CONFIG: AgentForgeConfig = {
  version: '1.0.0',
  name: 'my-project',
  description: 'AI-assisted modern codebase powered by AgentForge',
  targets: ['cursor', 'claude', 'windsurf', 'antigravity', 'copilot'],
  stack: {
    languages: ['TypeScript', 'JavaScript'],
    frameworks: ['Node.js'],
    packageManager: 'npm',
    testRunner: 'npm test'
  },
  rules: {
    core: [
      'Write minimal, concise, and robust code. Avoid over-engineering (YAGNI).',
      'Follow language idioms and leverage the standard library before third-party abstractions.',
      'Never compromise on security, input validation, error handling, or accessibility.',
      'Maintain existing style, patterns, and architectural conventions across edits.'
    ],
    architecture: [
      'Keep modules focused, decoupled, and single-responsibility.',
      'Colocate tests, types, and documentation with the corresponding modules.'
    ],
    security: [
      'Never hardcode API keys, secrets, credentials, or private tokens in source code or rules.',
      'Sanitize and validate all external inputs, request payloads, and query parameters.'
    ],
    testing: [
      'Ensure all new features, edge cases, and bug fixes have automated test coverage.',
      'Keep tests deterministic, isolated, and fast.'
    ],
    git: [
      'Follow Conventional Commits format (feat, fix, refactor, docs, chore).',
      'Keep pull requests and commits small, atomic, and focused.'
    ]
  },
  skills: [
    { name: 'tdd-architect', enabled: true },
    { name: 'security-auditor', enabled: true },
    { name: 'minimalist-architect', enabled: true }
  ],
  compression: {
    include: ['src/**/*', 'lib/**/*', 'app/**/*', 'pkg/**/*'],
    exclude: ['node_modules/**', 'dist/**', 'build/**', '.git/**', '*.lock', '*.min.js'],
    skeletonize: ['*.ts', '*.js', '*.py', '*.go', '*.rs', '*.php', '*.cs'],
    maxFileTokens: 2500
  }
};

export function findConfigFile(cwd: string = process.cwd()): string | null {
  for (const name of CONFIG_FILE_NAMES) {
    const fullPath = path.join(cwd, name);
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }
  return null;
}

export function loadConfig(cwd: string = process.cwd()): AgentForgeConfig {
  const configPath = findConfigFile(cwd);
  if (!configPath) {
    return DEFAULT_CONFIG;
  }

  try {
    const content = fs.readFileSync(configPath, 'utf-8');
    if (configPath.endsWith('.json')) {
      return { ...DEFAULT_CONFIG, ...JSON.parse(content) };
    } else {
      return { ...DEFAULT_CONFIG, ...YAML.parse(content) };
    }
  } catch (err: any) {
    throw new Error(`Failed to parse AgentForge config at ${configPath}: ${err.message}`);
  }
}

export function saveConfig(config: AgentForgeConfig, cwd: string = process.cwd(), format: 'yaml' | 'json' = 'yaml'): string {
  const fileName = format === 'json' ? 'agentforge.json' : '.agentforge.yaml';
  const filePath = path.join(cwd, fileName);
  
  if (format === 'json') {
    fs.writeFileSync(filePath, JSON.stringify(config, null, 2), 'utf-8');
  } else {
    fs.writeFileSync(filePath, YAML.stringify(config), 'utf-8');
  }
  
  return filePath;
}

export function detectProjectStack(cwd: string = process.cwd()): Partial<AgentForgeConfig['stack']> {
  const stack: Partial<AgentForgeConfig['stack']> = {
    languages: [],
    frameworks: []
  };

  // Node / TS / JS
  if (fs.existsSync(path.join(cwd, 'package.json'))) {
    try {
      const pkg = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json'), 'utf-8'));
      stack.packageManager = fs.existsSync(path.join(cwd, 'pnpm-lock.yaml')) ? 'pnpm' 
        : fs.existsSync(path.join(cwd, 'yarn.lock')) ? 'yarn' 
        : fs.existsSync(path.join(cwd, 'bun.lockb')) ? 'bun' : 'npm';
      
      const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
      
      if (allDeps.typescript || fs.existsSync(path.join(cwd, 'tsconfig.json'))) {
        stack.languages?.push('TypeScript');
      }
      stack.languages?.push('JavaScript');

      if (allDeps.next) stack.frameworks?.push('Next.js');
      else if (allDeps.react) stack.frameworks?.push('React');
      if (allDeps.vue) stack.frameworks?.push('Vue');
      if (allDeps.svelte) stack.frameworks?.push('Svelte');
      if (allDeps.express) stack.frameworks?.push('Express');
      if (allDeps.nest || allDeps['@nestjs/core']) stack.frameworks?.push('NestJS');
      if (allDeps.fastify) stack.frameworks?.push('Fastify');
      if (allDeps.vite) stack.frameworks?.push('Vite');
      if (allDeps.jest) stack.testRunner = 'jest';
      else if (allDeps.vitest) stack.testRunner = 'vitest';
      else if (pkg.scripts?.test) stack.testRunner = pkg.scripts.test;
    } catch {}
  }

  // Python
  if (fs.existsSync(path.join(cwd, 'pyproject.toml')) || fs.existsSync(path.join(cwd, 'requirements.txt')) || fs.existsSync(path.join(cwd, 'Pipfile'))) {
    stack.languages?.push('Python');
    if (fs.existsSync(path.join(cwd, 'manage.py'))) stack.frameworks?.push('Django');
    if (fs.existsSync(path.join(cwd, 'pyproject.toml'))) {
      const py = fs.readFileSync(path.join(cwd, 'pyproject.toml'), 'utf-8');
      if (py.includes('fastapi')) stack.frameworks?.push('FastAPI');
      if (py.includes('flask')) stack.frameworks?.push('Flask');
      if (py.includes('pytest')) stack.testRunner = 'pytest';
    }
  }

  // Rust
  if (fs.existsSync(path.join(cwd, 'Cargo.toml'))) {
    stack.languages?.push('Rust');
    stack.testRunner = 'cargo test';
  }

  // Go
  if (fs.existsSync(path.join(cwd, 'go.mod'))) {
    stack.languages?.push('Go');
    stack.testRunner = 'go test ./...';
  }

  // Deduplicate
  stack.languages = Array.from(new Set(stack.languages));
  stack.frameworks = Array.from(new Set(stack.frameworks));

  return stack;
}
