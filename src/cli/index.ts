import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs';
import { logger } from '../utils/logger';
import { loadConfig, saveConfig, DEFAULT_CONFIG, detectProjectStack } from '../utils/config';
import { syncAgentRules } from '../core/sync/engine';
import { packRepository } from '../core/compressor/packer';
import { lintAgentRules } from '../core/linter/linter';
import { getAvailableSkills, findSkillById } from '../core/skills/registry';
import { createServer } from '../server/app';
import { SupportedAgent } from '../core/sync/types';

export function createCli(): Command {
  const program = new Command();

  program
    .name('agentforge')
    .description('⚡ The Universal AI Coding Agent Toolkit & Operating System')
    .version('1.0.0');

  // init command
  program
    .command('init')
    .description('Initialize AgentForge in the current project')
    .option('-y, --yes', 'Skip prompts and use smart auto-detected defaults')
    .action((options) => {
      logger.banner();
      const cwd = process.cwd();
      const detected = detectProjectStack(cwd);
      
      const config = {
        ...DEFAULT_CONFIG,
        name: path.basename(cwd),
        stack: {
          ...DEFAULT_CONFIG.stack,
          ...detected
        }
      };

      const savedPath = saveConfig(config, cwd);
      logger.success(`AgentForge initialized successfully!`);
      logger.info(`Configuration created at: ${chalk.cyan(savedPath)}`);
      logger.info(`Detected Stack: ${chalk.yellow(config.stack.languages?.join(', '))} | Frameworks: ${chalk.yellow(config.stack.frameworks?.join(', ') || 'None')}`);
      logger.info(`Run ${chalk.cyan('agentforge sync')} to generate rules for all your AI agents.`);
    });

  // sync command
  program
    .command('sync')
    .description('Compile and synchronize rules across all AI coding agents')
    .option('-t, --targets <agents...>', 'Specific agents to sync (cursor, claude, windsurf, antigravity, copilot, aider, cline)')
    .option('-d, --dry-run', 'Simulate sync without writing files')
    .action((options) => {
      logger.banner();
      const cwd = process.cwd();
      const config = loadConfig(cwd);
      const targets = options.targets as SupportedAgent[] | undefined;

      logger.info(`Synchronizing agent directives for: ${chalk.cyan(config.name)}...`);
      const result = syncAgentRules(config, targets, { cwd, dryRun: options.dryRun });

      result.outputs.forEach(out => {
        logger.step(result.outputs.indexOf(out) + 1, result.outputs.length, `Platform: ${chalk.bold.magenta(out.agent.toUpperCase())}`);
        out.files.forEach(f => {
          const actionColor = f.action === 'created' ? chalk.green('✔ created') : f.action === 'updated' ? chalk.yellow('⚡ updated') : chalk.dim('– unchanged');
          console.log(`   ${actionColor} ${chalk.white(f.path)}`);
        });
      });

      console.log('');
      logger.success(`Synchronized ${result.totalFiles} files across ${result.outputs.length} agent platforms!`);
    });

  // pack command
  program
    .command('pack')
    .description('Compress codebase into token-optimized AST skeleton context bundle')
    .option('-o, --out <file>', 'Save output to a markdown file (default: PROJECT_CONTEXT.md)', 'PROJECT_CONTEXT.md')
    .action((options) => {
      logger.banner();
      const cwd = process.cwd();
      const config = loadConfig(cwd);

      logger.info('Compressing repository files into AST skeletons...');
      const packed = packRepository(config, { cwd });

      fs.writeFileSync(path.join(cwd, options.out), packed.markdown, 'utf-8');

      logger.box('Token Compression Results', [
        `Files Processed:   ${chalk.bold.white(packed.files.length)}`,
        `Original Tokens:   ${chalk.bold.red(packed.totalStats.originalTokens.toLocaleString())}`,
        `Compressed Tokens: ${chalk.bold.green(packed.totalStats.compressedTokens.toLocaleString())}`,
        `Tokens Saved:      ${chalk.bold.cyan(packed.totalStats.savedTokens.toLocaleString())} (${packed.totalStats.savingsPercentage}%)`,
        `Saved to:          ${chalk.bold.yellow(options.out)}`
      ]);

      logger.success(`Context bundle ready for your AI agent!`);
    });

  // lint command
  program
    .command('lint')
    .description('Audit agent rules for security risks, prompt conflicts, and token bloat')
    .action(() => {
      logger.banner();
      const cwd = process.cwd();
      const config = loadConfig(cwd);

      logger.info('Auditing agent directives and configuration...');
      const report = lintAgentRules(config, cwd);

      logger.box(`Rule Health Score: ${report.score}%`, [
        `Status:             ${report.passed ? chalk.green('PASSED') : chalk.red('ACTION REQUIRED')}`,
        `Security Score:     ${report.summary.securityScore}%`,
        `Clarity Score:      ${report.summary.clarityScore}%`,
        `Token Efficiency:   ${report.summary.tokenEfficiencyScore}%`,
        `Issues Found:       ${report.criticalCount} Critical, ${report.warningCount} Warnings, ${report.infoCount} Info`
      ]);

      if (report.issues.length > 0) {
        console.log('\n' + chalk.bold.underline('Detected Issues:') + '\n');
        report.issues.forEach(iss => {
          const badge = iss.severity === 'CRITICAL' ? chalk.bgRed.black(` ${iss.severity} `) : iss.severity === 'WARNING' ? chalk.bgYellow.black(` ${iss.severity} `) : chalk.bgCyan.black(` ${iss.severity} `);
          console.log(`${badge} ${chalk.bold(iss.category)}: ${iss.message}`);
          console.log(chalk.dim(`   💡 Solution: ${iss.suggestion}\n`));
        });
      } else {
        logger.success('All checks passed! Your agent rules are clean, safe, and token-efficient.');
      }
    });

  // skills command
  const skillsCmd = program.command('skills').description('Manage and install pre-built agent skills');
  
  skillsCmd
    .command('list')
    .description('List all available production-grade skills')
    .action(() => {
      logger.banner();
      const skills = getAvailableSkills();
      console.log(chalk.bold.cyan('Available Agent Skills Library:\n'));
      skills.forEach(s => {
        console.log(`  ${chalk.bold.green(s.id.padEnd(24))} ${chalk.magenta(`[${s.category}]`)} - ${s.description}`);
      });
      console.log(`\nInstall a skill with: ${chalk.cyan('agentforge skills add <id>')}\n`);
    });

  skillsCmd
    .command('add <skillId>')
    .description('Install a skill into your project configuration')
    .action((skillId) => {
      logger.banner();
      const cwd = process.cwd();
      const config = loadConfig(cwd);
      const skill = findSkillById(skillId);

      if (!skill) {
        logger.error(`Skill "${skillId}" not found. Run "agentforge skills list" to see available skills.`);
        return;
      }

      if (!config.skills) config.skills = [];
      if (config.skills.some(s => s.name === skill.id)) {
        logger.warn(`Skill "${skill.name}" is already installed.`);
        return;
      }

      config.skills.push({ name: skill.id, enabled: true });
      // Also add skill rules to core rules
      config.rules.core.push(...skill.rules);
      saveConfig(config, cwd);

      logger.success(`Installed skill: ${chalk.bold.cyan(skill.name)}!`);
      logger.info(`Run ${chalk.cyan('agentforge sync')} to push new skill directives to all your AI agents.`);
    });

  // ui command
  program
    .command('ui')
    .description('Launch the interactive visual Web Dashboard')
    .option('-p, --port <number>', 'Port to run the server on', '3737')
    .action((options) => {
      logger.banner();
      const port = parseInt(options.port, 10);
      const app = createServer(process.cwd());
      
      app.listen(port, () => {
        logger.success(`AgentForge Web Studio running at: ${chalk.bold.cyan(`http://localhost:${port}`)}`);
        logger.info(`Press Ctrl+C to stop.`);
      });
    });

  return program;
}
