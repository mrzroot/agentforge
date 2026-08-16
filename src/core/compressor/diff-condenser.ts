export interface CondensedDiff {
  rawDiff: string;
  condensedDiff: string;
  filesChanged: number;
  insertions: number;
  deletions: number;
}

/**
 * Condenses verbose git diffs by focusing on actual logic modifications,
 * stripping extraneous unchanged context lines while preserving critical intent.
 */
export function condenseDiff(diffText: string): CondensedDiff {
  const lines = diffText.split('\n');
  const output: string[] = [];
  let filesChanged = 0;
  let insertions = 0;
  let deletions = 0;

  for (const line of lines) {
    if (line.startsWith('diff --git ')) {
      filesChanged++;
      output.push(`\n📌 ${line}`);
    } else if (line.startsWith('--- ') || line.startsWith('+++ ')) {
      output.push(line);
    } else if (line.startsWith('@@ ')) {
      output.push(line);
    } else if (line.startsWith('+') && !line.startsWith('+++')) {
      insertions++;
      output.push(line);
    } else if (line.startsWith('-') && !line.startsWith('---')) {
      deletions++;
      output.push(line);
    }
  }

  return {
    rawDiff: diffText,
    condensedDiff: output.join('\n'),
    filesChanged,
    insertions,
    deletions
  };
}
