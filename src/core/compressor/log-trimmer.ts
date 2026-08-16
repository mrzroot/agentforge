/**
 * Trims huge test outputs, npm build logs, and compiler traces down to actionable errors,
 * removing progress bars, repetitive noise, and ANSI escape sequences.
 */
export function trimBuildLog(logText: string): string {
  // 1. Strip ANSI escape codes
  const plainText = logText.replace(/\u001b\[[0-9;]*m/g, '');
  const lines = plainText.split('\n');
  const criticalLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length === 0) continue;

    // Filter out common progress noise
    if (
      trimmed.includes('npm notice') ||
      trimmed.includes('npm warn deprecated') ||
      trimmed.includes('Progress:') ||
      /^(\[.*?\])?\s*(info|debug):/.test(trimmed)
    ) {
      continue;
    }

    // Keep errors, failures, assertions, and summaries
    if (
      /error|fail|exception|fatal|panic|warning|expected|received|assert/i.test(trimmed) ||
      trimmed.startsWith('at ') ||
      trimmed.startsWith('FAIL') ||
      trimmed.startsWith('✕') ||
      /Tests:.*\d+/.test(trimmed) ||
      /Passing:.*\d+/.test(trimmed)
    ) {
      criticalLines.push(line);
    }
  }

  if (criticalLines.length === 0) {
    return lines.slice(-25).join('\n');
  }

  return criticalLines.join('\n');
}
