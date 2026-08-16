export type SupportedAgent = 
  | 'cursor' 
  | 'claude' 
  | 'windsurf' 
  | 'antigravity' 
  | 'copilot' 
  | 'aider' 
  | 'cline';

export interface AgentRuleGroup {
  name: string;
  description?: string;
  rules: string[];
}

export interface AgentSkillRef {
  name: string;
  enabled: boolean;
  options?: Record<string, any>;
}

export interface AgentForgeConfig {
  version: string;
  name: string;
  description?: string;
  stack?: {
    languages?: string[];
    frameworks?: string[];
    runtime?: string;
    packageManager?: string;
    testRunner?: string;
  };
  targets: SupportedAgent[];
  rules: {
    core: string[];
    architecture?: string[];
    security?: string[];
    testing?: string[];
    git?: string[];
    custom?: AgentRuleGroup[];
  };
  skills?: AgentSkillRef[];
  compression?: {
    include?: string[];
    exclude?: string[];
    skeletonize?: string[];
    maxFileTokens?: number;
  };
}

export interface SyncOutput {
  agent: SupportedAgent;
  files: {
    path: string;
    content: string;
    action: 'created' | 'updated' | 'unchanged';
  }[];
}

export interface SyncResult {
  success: boolean;
  outputs: SyncOutput[];
  totalFiles: number;
  warnings: string[];
}
