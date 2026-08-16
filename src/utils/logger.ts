import chalk from 'chalk';

export const logger = {
  banner: () => {
    console.log(chalk.cyan(`
   █████╗  ██████╗ ███████╗███╗   ██╗████████╗███████╗ ██████╗ ██████╗  ██████╗ ███████╗
  ██╔══██╗██╔════╝ ██╔════╝████╗  ██║╚══██╔══╝██╔════╝██╔═══██╗██╔══██╗██╔════╝ ██╔════╝
  ███████║██║  ███╗█████╗  ██╔██╗ ██║   ██║   █████╗  ██║   ██║██████╔╝██║  ███╗█████╗  
  ██╔══██║██║   ██║██╔══╝  ██║╚██╗██║   ██║   ██╔══╝  ██║   ██║██╔══██╗██║   ██║██╔══╝  
  ██║  ██║╚██████╔╝███████╗██║ ╚████║   ██║   ██║     ╚██████╔╝██║  ██║╚██████╔╝███████╗
  ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚═╝      ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝
    `));
    console.log(chalk.bold.magenta('  ⚡ The Universal AI Coding Agent Toolkit & Operating System ⚡'));
    console.log(chalk.dim('  ───────────────────────────────────────────────────────────────────────────\n'));
  },

  info: (msg: string) => console.log(`${chalk.blue('ℹ')} ${msg}`),
  success: (msg: string) => console.log(`${chalk.green('✔')} ${chalk.bold(msg)}`),
  warn: (msg: string) => console.log(`${chalk.yellow('⚠')} ${chalk.yellow(msg)}`),
  error: (msg: string) => console.log(`${chalk.red('✖')} ${chalk.bold.red(msg)}`),
  step: (step: number, total: number, msg: string) => {
    console.log(`${chalk.cyan(`[${step}/${total}]`)} ${chalk.bold(msg)}`);
  },
  divider: () => console.log(chalk.dim('───────────────────────────────────────────────────────────────────────────')),
  box: (title: string, lines: string[]) => {
    const maxLen = Math.max(title.length, ...lines.map(l => l.replace(/\u001b\[[0-9;]*m/g, '').length)) + 4;
    const border = '─'.repeat(maxLen);
    console.log(chalk.cyan(`┌${border}┐`));
    console.log(chalk.cyan(`│ `) + chalk.bold.white(title.padEnd(maxLen - 2)) + chalk.cyan(` │`));
    console.log(chalk.cyan(`├${border}┤`));
    lines.forEach(l => {
      const plainLen = l.replace(/\u001b\[[0-9;]*m/g, '').length;
      const pad = ' '.repeat(Math.max(0, maxLen - plainLen - 2));
      console.log(chalk.cyan(`│ `) + l + pad + chalk.cyan(` │`));
    });
    console.log(chalk.cyan(`└${border}┘`));
  }
};
