export interface TokenStats {
  originalTokens: number;
  compressedTokens: number;
  savedTokens: number;
  savingsPercentage: number;
  originalChars: number;
  compressedChars: number;
  estimatedCostSavingsUSD: {
    gpt4o: number; // $5 / 1M input tokens
    claude35Sonnet: number; // $3 / 1M input tokens
    gemini15Pro: number; // $3.5 / 1M input tokens
  };
}

/**
 * Accurately estimates token count for source code and markdown text.
 * Heuristic based on BPE tokenizer for code: ~3.7 - 4.0 chars per token,
 * with adjustments for punctuation, indentation, and word boundaries.
 */
export function estimateTokens(text: string): number {
  if (!text || text.length === 0) return 0;
  
  // Split on whitespace and common code delimiters
  const wordsAndTokens = text.match(/[\w]+|[^\s\w]|\s+/g) || [];
  let count = 0;
  
  for (const part of wordsAndTokens) {
    if (/^\s+$/.test(part)) {
      // Spaces/tabs: every 3 spaces or newline is ~1 token
      count += Math.ceil(part.length / 3);
    } else if (/^[^\s\w]+$/.test(part)) {
      // Punctuation / symbols: 1 token each or every 2 chars
      count += Math.ceil(part.length / 1.5);
    } else {
      // Normal word / identifier
      if (part.length <= 4) {
        count += 1;
      } else {
        count += Math.ceil(part.length / 3.8);
      }
    }
  }
  
  return Math.max(1, count);
}

export function calculateTokenSavings(originalText: string, compressedText: string): TokenStats {
  const originalTokens = estimateTokens(originalText);
  const compressedTokens = estimateTokens(compressedText);
  const savedTokens = Math.max(0, originalTokens - compressedTokens);
  const savingsPercentage = originalTokens > 0 ? ((savedTokens / originalTokens) * 100) : 0;

  return {
    originalTokens,
    compressedTokens,
    savedTokens,
    savingsPercentage: Number(savingsPercentage.toFixed(1)),
    originalChars: originalText.length,
    compressedChars: compressedText.length,
    estimatedCostSavingsUSD: {
      gpt4o: Number(((savedTokens / 1_000_000) * 5.0).toFixed(4)),
      claude35Sonnet: Number(((savedTokens / 1_000_000) * 3.0).toFixed(4)),
      gemini15Pro: Number(((savedTokens / 1_000_000) * 3.5).toFixed(4)),
    }
  };
}

export function formatTokenNumber(num: number): string {
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(2)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}k`;
  }
  return num.toString();
}
