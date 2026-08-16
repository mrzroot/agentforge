import { AgentForgeConfig } from '../sync/types';
import { estimateTokens } from '../../utils/tokens';

export interface LintIssue {
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  category: 'SECURITY' | 'CONFLICT' | 'TOKEN_BLOAT' | 'AMBIGUITY' | 'STRUCTURE';
  rule?: string;
  message: string;
  suggestion: string;
  file?: string;
}

export function checkRuleConflictsAndBloat(config: AgentForgeConfig): LintIssue[] {
  const issues: LintIssue[] = [];
  const allRules: { text: string; category: string }[] = [];

  config.rules.core.forEach(r => allRules.push({ text: r, category: 'core' }));
  config.rules.architecture?.forEach(r => allRules.push({ text: r, category: 'architecture' }));
  config.rules.security?.forEach(r => allRules.push({ text: r, category: 'security' }));
  config.rules.testing?.forEach(r => allRules.push({ text: r, category: 'testing' }));
  config.rules.git?.forEach(r => allRules.push({ text: r, category: 'git' }));

  // 1. Conflict detection (e.g. always vs never)
  for (let i = 0; i < allRules.length; i++) {
    for (let j = i + 1; j < allRules.length; j++) {
      const r1 = allRules[i].text.toLowerCase();
      const r2 = allRules[j].text.toLowerCase();

      // Simple keyword conflict heuristic
      if (
        (r1.includes('always use') && r2.includes('never use')) ||
        (r1.includes('prefer tabs') && r2.includes('prefer spaces')) ||
        (r1.includes('functional') && r2.includes('strictly oop'))
      ) {
        issues.push({
          severity: 'CRITICAL',
          category: 'CONFLICT',
          rule: allRules[i].text,
          message: `Potential contradiction between rules: "${allRules[i].text}" and "${allRules[j].text}"`,
          suggestion: 'Consolidate or clarify priority between conflicting rules.'
        });
      }
    }
  }

  // 2. Token bloat per rule & total tokens
  let totalRuleTokens = 0;
  for (const r of allRules) {
    const tokens = estimateTokens(r.text);
    totalRuleTokens += tokens;

    if (tokens > 80) {
      issues.push({
        severity: 'WARNING',
        category: 'TOKEN_BLOAT',
        rule: r.text,
        message: `Rule is overly verbose (~${tokens} tokens). Large individual rules increase token consumption without adding intelligence.`,
        suggestion: 'Break into 2-3 concise, bulleted constraints.'
      });
    }

    // 3. Ambiguity & Vague Prompts detection
    const vaguePhrases = [
      'make it clean',
      'write good code',
      'do your best',
      'follow best practices',
      'be smart',
      'ensure quality'
    ];

    for (const phrase of vaguePhrases) {
      if (r.text.toLowerCase().includes(phrase)) {
        issues.push({
          severity: 'INFO',
          category: 'AMBIGUITY',
          rule: r.text,
          message: `Rule uses vague phrase "${phrase}" which LLMs interpret inconsistently.`,
          suggestion: `Replace with explicit actionable instructions (e.g., "enforce ESLint recommended rules", "write unit tests with >80% branch coverage").`
        });
      }
    }
  }

  if (totalRuleTokens > 1500) {
    issues.push({
      severity: 'WARNING',
      category: 'TOKEN_BLOAT',
      message: `Total rules prompt size is ~${totalRuleTokens} tokens. This will consume high context bandwidth on every single agent interaction.`,
      suggestion: 'Prune redundant directives or move non-critical instructions into specialized on-demand skills.'
    });
  }

  return issues;
}
