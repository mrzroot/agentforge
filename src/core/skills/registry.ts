export interface AgentSkill {
  id: string;
  name: string;
  category: 'architecture' | 'testing' | 'security' | 'optimization' | 'fullstack' | 'devops';
  description: string;
  rules: string[];
}

export const SKILLS_REGISTRY: AgentSkill[] = [
  {
    id: 'ponytail-minimalist',
    name: 'Ponytail Minimalist Dev',
    category: 'architecture',
    description: 'Forces concise, standard-library-first code. Avoids over-engineering and boilerplate.',
    rules: [
      'Evaluate YAGNI strictly: if speculative or not needed now, skip it.',
      'Prefer language standard libraries over heavy third-party abstractions.',
      'Choose native platform features before adding new packages.',
      'Write the smallest diff that completely works with zero bugs.'
    ]
  },
  {
    id: 'tdd-architect',
    name: 'TDD Test Architect',
    category: 'testing',
    description: 'Enforces Test-Driven Development (Red-Green-Refactor) with high isolation and coverage.',
    rules: [
      'Write unit tests before or alongside implementation code.',
      'Cover positive, negative, and edge boundary conditions.',
      'Keep tests deterministic, avoiding sleep/timeout hacks.',
      'Mock network calls and external state explicitly.'
    ]
  },
  {
    id: 'security-auditor',
    name: 'OWASP Security Auditor',
    category: 'security',
    description: 'Hardens code against injections, authentication bypasses, and data leaks.',
    rules: [
      'Never output or store plain-text secrets, API keys, or JWT tokens in repositories.',
      'Strictly validate and sanitize all external inputs using schema validators.',
      'Prevent SQL/NoSQL injection by enforcing parameterized queries.',
      'Set safe headers, CORS policies, and rate limits on API endpoints.'
    ]
  },
  {
    id: 'token-optimizer',
    name: 'Token & Context Optimizer',
    category: 'optimization',
    description: 'Minimizes prompt tokens and prevents context window exhaustion for coding agents.',
    rules: [
      'Compress full source files to AST skeletons before feeding to LLMs.',
      'Summarize build logs and stack traces down to failing assertions.',
      'Avoid dumping entire lockfiles or binary assets in conversation context.'
    ]
  },
  {
    id: 'fastapi-master',
    name: 'Python FastAPI Master',
    category: 'fullstack',
    description: 'Builds ultra-fast, type-safe APIs using Pydantic v2 and async patterns.',
    rules: [
      'Use Pydantic v2 models with Field validation for all request/response schemas.',
      'Leverage FastAPI dependency injection (Depends) for auth and database sessions.',
      'Write async def route handlers with clean HTTP exception mappings.'
    ]
  },
  {
    id: 'react-nextjs-pro',
    name: 'Next.js & React 19 Pro',
    category: 'fullstack',
    description: 'Mastery over Server Components, App Router, Server Actions, and smooth UX.',
    rules: [
      'Default to React Server Components (RSC); use "use client" only when state/effects are needed.',
      'Use Server Actions with Zod validation for form submissions and mutations.',
      'Optimize Web Vitals with dynamic imports and next/image.'
    ]
  },
  {
    id: 'docker-devops',
    name: 'Docker & DevOps Pro',
    category: 'devops',
    description: 'Creates hardened, lightweight multi-stage Dockerfiles and container workflows.',
    rules: [
      'Use minimal base images (Alpine / Distroless / Slim).',
      'Implement multi-stage builds separating build tools from runtime.',
      'Run containers as non-root users with explicit healthchecks.'
    ]
  }
];

export function getAvailableSkills(): AgentSkill[] {
  return SKILLS_REGISTRY;
}

export function findSkillById(id: string): AgentSkill | undefined {
  return SKILLS_REGISTRY.find(s => s.id === id);
}
