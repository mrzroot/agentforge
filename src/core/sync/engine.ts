import fs from 'fs';
import path from 'path';
import { AgentForgeConfig, SupportedAgent, SyncOutput, SyncResult } from './types';
import { generateCursorRules } from './cursor';
import { generateClaudeRules } from './claude';
import { generateWindsurfRules } from './windsurf';
import { generateAntigravityRules } from './antigravity';
import { generateCopilotRules } from './copilot';
import { generateAiderRules } from './aider';
import { generateClineRules } from './cline';

export function syncAgentRules(
  config: AgentForgeConfig,
  targets?: SupportedAgent[],
  options: { cwd?: string; dryRun?: boolean } = {}
): SyncResult {
  const cwd = options.cwd || process.cwd();
  const selectedTargets = targets && targets.length > 0 ? targets : config.targets;
  const outputs: SyncOutput[] = [];
  const warnings: string[] = [];
  let totalFiles = 0;

  for (const target of selectedTargets) {
    let output: SyncOutput | null = null;

    switch (target) {
      case 'cursor':
        output = generateCursorRules(config);
        break;
      case 'claude':
        output = generateClaudeRules(config);
        break;
      case 'windsurf':
        output = generateWindsurfRules(config);
        break;
      case 'antigravity':
        output = generateAntigravityRules(config);
        break;
      case 'copilot':
        output = generateCopilotRules(config);
        break;
      case 'aider':
        output = generateAiderRules(config);
        break;
      case 'cline':
        output = generateClineRules(config);
        break;
      default:
        warnings.push(`Unknown agent target: ${target}`);
        break;
    }

    if (output) {
      outputs.push(output);
      for (const file of output.files) {
        totalFiles++;
        const targetPath = path.join(cwd, file.path);
        
        if (fs.existsSync(targetPath)) {
          const existingContent = fs.readFileSync(targetPath, 'utf-8');
          if (existingContent === file.content) {
            file.action = 'unchanged';
            continue;
          } else {
            file.action = 'updated';
          }
        } else {
          file.action = 'created';
        }

        if (!options.dryRun) {
          const dir = path.dirname(targetPath);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          fs.writeFileSync(targetPath, file.content, 'utf-8');
        }
      }
    }
  }

  return {
    success: true,
    outputs,
    totalFiles,
    warnings
  };
}
