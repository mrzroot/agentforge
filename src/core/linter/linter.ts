import { AgentForgeConfig } from '../sync/types';
import { checkRuleConflictsAndBloat, LintIssue } from './rules-checker';
import { scanSecurityRisks } from './security-scanner';

export interface LintReport {
  score: number; // 0 to 100
  passed: boolean;
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  issues: LintIssue[];
  summary: {
    securityScore: number;
    clarityScore: number;
    tokenEfficiencyScore: number;
  };
}

export function lintAgentRules(config: AgentForgeConfig, cwd: string = process.cwd()): LintReport {
  const ruleIssues = checkRuleConflictsAndBloat(config);
  const securityIssues = scanSecurityRisks(config, cwd);
  const issues = [...securityIssues, ...ruleIssues];

  const criticalCount = issues.filter(i => i.severity === 'CRITICAL').length;
  const warningCount = issues.filter(i => i.severity === 'WARNING').length;
  const infoCount = issues.filter(i => i.severity === 'INFO').length;

  let score = 100;
  score -= criticalCount * 30;
  score -= warningCount * 10;
  score -= infoCount * 3;
  score = Math.max(0, Math.min(100, score));

  const securityScore = Math.max(0, 100 - criticalCount * 40);
  const clarityScore = Math.max(0, 100 - infoCount * 15);
  const tokenEfficiencyScore = Math.max(0, 100 - warningCount * 20);

  return {
    score,
    passed: criticalCount === 0 && score >= 70,
    criticalCount,
    warningCount,
    infoCount,
    issues,
    summary: {
      securityScore,
      clarityScore,
      tokenEfficiencyScore
    }
  };
}
