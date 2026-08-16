import fs from 'fs';
import path from 'path';
import { LintIssue } from './rules-checker';
import { AgentForgeConfig } from '../sync/types';

const SECRET_PATTERNS = [
  { name: 'OpenAI API Key', regex: /sk-[a-zA-Z0-9]{20,48}/g },
  { name: 'Anthropic API Key', regex: /sk-ant-[a-zA-Z0-9]{20,50}/g },
  { name: 'Google Gemini / AIza Key', regex: /AIza[0-9A-Za-z-_]{35}/g },
  { name: 'GitHub Personal Access Token', regex: /ghp_[a-zA-Z0-9]{36}/g },
  { name: 'AWS Access Key ID', regex: /AKIA[0-9A-Z]{16}/g },
  { name: 'Generic Private Key', regex: /-----BEGIN PRIVATE KEY-----/g },
  { name: 'Generic Password String', regex: /(?:password|secret|passwd|pwd)\s*[:=]\s*['"][^'"\s]{8,}['"]/i }
];

const DANGEROUS_DIRECTIVES = [
  { name: 'Destructive Shell Execution', regex: /rm\s+-rf\s+\/|del\s+\/s\s+\/q\s+C:\\/i },
  { name: 'Disable Security Verification', regex: /ignore\s+ssl|disable\s+auth|skip\s+verification/i },
  { name: 'SQL Destruction', regex: /DROP\s+DATABASE|DROP\s+TABLE|TRUNCATE\s+TABLE/i }
];

export function scanSecurityRisks(config: AgentForgeConfig, cwd: string = process.cwd()): LintIssue[] {
  const issues: LintIssue[] = [];

  // Check rules text
  const ruleStrings = [
    ...config.rules.core,
    ...(config.rules.architecture || []),
    ...(config.rules.security || []),
    ...(config.rules.testing || []),
    ...(config.rules.git || [])
  ];

  for (const str of ruleStrings) {
    // 1. Check for leaked credentials
    for (const pattern of SECRET_PATTERNS) {
      if (pattern.regex.test(str)) {
        issues.push({
          severity: 'CRITICAL',
          category: 'SECURITY',
          rule: str,
          message: `Detected possible hardcoded credential (${pattern.name}) inside agent configuration rules!`,
          suggestion: 'Remove secret immediately and load via environment variables (.env).'
        });
      }
    }

    // 2. Check for dangerous directives
    for (const d of DANGEROUS_DIRECTIVES) {
      if (d.regex.test(str)) {
        issues.push({
          severity: 'CRITICAL',
          category: 'SECURITY',
          rule: str,
          message: `Detected dangerous prompt directive: "${d.name}". This can cause irreversible data loss if executed by an autonomous agent.`,
          suggestion: 'Ensure dangerous destructive operations require explicit user approval and safety checks.'
        });
      }
    }
  }

  // Scan agent rule files on disk if they exist
  const filesToCheck = ['.cursorrules', 'CLAUDE.md', '.windsurfrules', '.agents/AGENTS.md', '.clinerules'];
  for (const relFile of filesToCheck) {
    const fullPath = path.join(cwd, relFile);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      for (const pattern of SECRET_PATTERNS) {
        if (pattern.regex.test(content)) {
          issues.push({
            severity: 'CRITICAL',
            category: 'SECURITY',
            file: relFile,
            message: `Found exposed secret (${pattern.name}) in ${relFile}!`,
            suggestion: 'Remove API keys from rule files to prevent them being leaked to third-party logs or git repos.'
          });
        }
      }
    }
  }

  return issues;
}
