import express from 'express';
import path from 'path';
import fs from 'fs';
import { loadConfig, saveConfig } from '../utils/config';
import { syncAgentRules } from '../core/sync/engine';
import { lintAgentRules } from '../core/linter/linter';
import { extractSkeleton } from '../core/compressor/ast-extractor';
import { calculateTokenSavings } from '../utils/tokens';
import { getAvailableSkills } from '../core/skills/registry';
import { packRepository } from '../core/compressor/packer';

export function createServer(cwd: string = process.cwd()) {
  const app = express();
  app.use(express.json());

  // Serve static UI assets
  const publicDir = path.join(__dirname, 'public');
  if (fs.existsSync(publicDir)) {
    app.use(express.static(publicDir));
  }

  // API Endpoints
  app.get('/api/config', (req, res) => {
    try {
      const config = loadConfig(cwd);
      res.json({ success: true, config });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/config', (req, res) => {
    try {
      const config = req.body;
      saveConfig(config, cwd);
      res.json({ success: true, message: 'Configuration saved successfully!' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/sync', (req, res) => {
    try {
      const { targets } = req.body;
      const config = loadConfig(cwd);
      const result = syncAgentRules(config, targets, { cwd });
      res.json({ success: true, result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get('/api/lint', (req, res) => {
    try {
      const config = loadConfig(cwd);
      const report = lintAgentRules(config, cwd);
      res.json({ success: true, report });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/compress', (req, res) => {
    try {
      const { code, filename } = req.body;
      if (!code) {
        return res.status(400).json({ success: false, error: 'Code is required' });
      }
      const skeleton = extractSkeleton(code, filename || 'code.ts');
      const stats = calculateTokenSavings(code, skeleton.skeletonCode);
      res.json({ success: true, skeleton, stats });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get('/api/skills', (req, res) => {
    try {
      const config = loadConfig(cwd);
      const available = getAvailableSkills();
      res.json({ success: true, available, active: config.skills || [] });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get('/api/pack', (req, res) => {
    try {
      const config = loadConfig(cwd);
      const packed = packRepository(config, { cwd });
      res.json({ success: true, packed });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Fallback to index.html
  app.get('*', (req, res) => {
    const indexPath = path.join(publicDir, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.send('<h1>AgentForge Server Running</h1>');
    }
  });

  return app;
}
