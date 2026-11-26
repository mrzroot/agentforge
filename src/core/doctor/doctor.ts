import { findConfigFile, loadConfig } from '../../utils/config';
import { syncAgentRules } from '../sync/engine';
import { lintAgentRules } from '../linter/linter';

export interface DoctorCheck {
  level: 'ok' | 'warn' | 'fail';
  area: string;
  message: string;
  fix?: string;
}

export interface DoctorReport {
  healthy: boolean;
  configFile: string | null;
  lintScore: number;
  driftedFiles: string[];
  missingFiles: string[];
  checks: DoctorCheck[];
}

export function runDoctor(cwd: string = process.cwd()): DoctorReport {
  const checks: DoctorCheck[] = [];
  const configFile = findConfigFile(cwd);

  if (!configFile) {
    checks.push({
      level: 'warn',
      area: 'config',
      message: 'No .agentforge.yaml config file found (using default rules).',
      fix: 'Run `agentforge init` to generate .agentforge.yaml.'
    });
  } else {
    checks.push({
      level: 'ok',
      area: 'config',
      message: `Config found: ${configFile}`
    });
  }

  let config;
  try {
    config = loadConfig(cwd);
  } catch (err: any) {
    checks.push({
      level: 'fail',
      area: 'config',
      message: err.message || 'Failed to parse config file.',
      fix: 'Fix syntax errors in your .agentforge.yaml / agentforge.json file.'
    });
    return {
      healthy: false,
      configFile,
      lintScore: 0,
      driftedFiles: [],
      missingFiles: [],
      checks
    };
  }

  // Check rule sync drift via dry-run
  const syncRes = syncAgentRules(config, undefined, { cwd, dryRun: true });
  const driftedFiles: string[] = [];
  const missingFiles: string[] = [];

  for (const out of syncRes.outputs) {
    for (const file of out.files) {
      if (file.action === 'created') {
        missingFiles.push(file.path);
      } else if (file.action === 'updated') {
        driftedFiles.push(file.path);
      }
    }
  }

  if (missingFiles.length > 0) {
    checks.push({
      level: 'warn',
      area: 'sync',
      message: `${missingFiles.length} target file(s) missing: ${missingFiles.join(', ')}`,
      fix: 'Run `agentforge sync` to generate missing target files.'
    });
  }
  if (driftedFiles.length > 0) {
    checks.push({
      level: 'warn',
      area: 'sync',
      message: `${driftedFiles.length} target file(s) drifted from config: ${driftedFiles.join(', ')}`,
      fix: 'Run `agentforge sync` to align generated agent rule files.'
    });
  }
  if (missingFiles.length === 0 && driftedFiles.length === 0) {
    checks.push({
      level: 'ok',
      area: 'sync',
      message: `All ${syncRes.totalFiles} target rule files match the config.`
    });
  }

  // Lint rules health
  const lint = lintAgentRules(config, cwd);
  if (!lint.passed) {
    checks.push({
      level: 'fail',
      area: 'lint',
      message: `Rule lint failed (${lint.score}%, ${lint.criticalCount} critical, ${lint.warningCount} warning).`,
      fix: 'Run `agentforge lint` for line-by-line remediation.'
    });
  } else if (lint.warningCount > 0) {
    checks.push({
      level: 'warn',
      area: 'lint',
      message: `Rule lint passed (${lint.score}%) with ${lint.warningCount} warning(s).`,
      fix: 'Run `agentforge lint` to trim bloated rules.'
    });
  } else {
    checks.push({
      level: 'ok',
      area: 'lint',
      message: `Rule health score: ${lint.score}%`
    });
  }

  const healthy = !checks.some(c => c.level === 'fail') && driftedFiles.length === 0 && missingFiles.length === 0;
  return {
    healthy,
    configFile,
    lintScore: lint.score,
    driftedFiles,
    missingFiles,
    checks
  };
}
