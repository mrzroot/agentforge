const assert = require('assert');
const { extractSkeleton } = require('../dist/core/compressor/ast-extractor');
const { calculateTokenSavings } = require('../dist/utils/tokens');
const { lintAgentRules } = require('../dist/core/linter/linter');
const { syncAgentRules } = require('../dist/core/sync/engine');
const { DEFAULT_CONFIG } = require('../dist/utils/config');
const { getAvailableSkills } = require('../dist/core/skills/registry');

console.log('🧪 Running AgentForge Automated Test Suite...\n');

// 1. Test AST Skeletonizer (Python)
const samplePy = `
import os
import json
import logging

class DataProcessor:
    """Processes large streams of data."""
    def __init__(self, config_path: str):
        self.config_path = config_path
        self.logger = logging.getLogger(__name__)

    def process_records(self, records: list, batch_size: int = 100) -> dict:
        """Processes all records in batches and writes results."""
        results = []
        for i in range(0, len(records), batch_size):
            batch = records[i:i + batch_size]
            cleaned = [r.strip().lower() for r in batch if r]
            transformed = {"batch_id": i, "items": cleaned, "count": len(cleaned)}
            results.append(transformed)
        return {"status": "success", "processed": len(results)}
`;
const pySkeleton = extractSkeleton(samplePy, 'processor.py');
assert(pySkeleton.skeletonCode.includes('class DataProcessor:'));
assert(pySkeleton.skeletonCode.includes('def process_records(self, records: list, batch_size: int = 100) -> dict:'));
console.log('✔ AST Skeletonizer (Python) passed.');

// 2. Test Token Estimator & Savings
const savings = calculateTokenSavings(samplePy, pySkeleton.skeletonCode);
assert(savings.originalTokens >= savings.compressedTokens);
assert(savings.savingsPercentage >= 0);
console.log(`✔ Token Savings calculation passed (${savings.savingsPercentage}% reduction: ${savings.originalTokens} -> ${savings.compressedTokens} tokens).`);

// 3. Test Linter
const report = lintAgentRules(DEFAULT_CONFIG);
assert(typeof report.score === 'number');
assert(report.score >= 0 && report.score <= 100);
console.log(`✔ Linter Rule Audit passed (Health Score: ${report.score}%).`);

// 4. Test Multi-Agent Sync
const syncRes = syncAgentRules(DEFAULT_CONFIG, ['cursor', 'claude', 'windsurf', 'antigravity', 'copilot'], { dryRun: true });
assert(syncRes.success === true);
assert(syncRes.outputs.length === 5);
console.log(`✔ Multi-Agent Sync engine passed (${syncRes.outputs.length} platforms synced).`);

// 5. Test Skills Registry
const skills = getAvailableSkills();
assert(skills.length >= 5);
console.log(`✔ Skills Registry passed (${skills.length} curated skills available).`);

console.log('\n🎉 ALL AGENTFORGE TESTS PASSED SUCCESSFULLY! 🚀');
