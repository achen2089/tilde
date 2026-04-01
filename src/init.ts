import fs from "node:fs";
import path from "node:path";

export interface AgentConfig {
  name: string;
  filename: string;
  description: string;
  defaultContent: string;
}

const AGENTS: AgentConfig[] = [
  {
    name: "Claude Code",
    filename: "CLAUDE.md",
    description: "Instructions for Claude Code CLI",
    defaultContent: `# CLAUDE.md

## Project Overview

<!-- Describe your project here -->

## Code Style

- Use TypeScript with strict mode
- Prefer functional patterns
- Write tests for new features

## Commands

- Build: \`npm run build\`
- Test: \`npm test\`
- Lint: \`npm run lint\`

## Rules

- Do not modify generated files
- Keep dependencies minimal
- Follow existing patterns in the codebase
`,
  },
  {
    name: "Cursor",
    filename: ".cursorrules",
    description: "Rules for Cursor AI editor",
    defaultContent: `# Cursor Rules

## Style
- Write clean, readable TypeScript
- Use meaningful variable names
- Add JSDoc comments for public APIs

## Patterns
- Prefer composition over inheritance
- Use early returns to reduce nesting
- Handle errors explicitly

## Don't
- Don't use \`any\` type
- Don't leave TODO comments without context
- Don't import unused modules
`,
  },
  {
    name: "Codex",
    filename: "AGENTS.md",
    description: "Instructions for OpenAI Codex",
    defaultContent: `# AGENTS.md

## Overview

<!-- Project description -->

## Setup

\`\`\`bash
npm install
npm run build
\`\`\`

## Guidelines

- Follow existing code patterns
- Write unit tests for new functionality
- Keep changes focused and minimal
`,
  },
  {
    name: "OpenClaw",
    filename: "SKILL.md",
    description: "Skill definition for OpenClaw agents",
    defaultContent: `# SKILL.md

## Description

<!-- What this skill does -->

## Triggers

- When the user asks to...

## Rules

- Always...
- Never...

## Examples

\`\`\`
User: ...
Agent: ...
\`\`\`
`,
  },
];

export function getAgentConfigs(): AgentConfig[] {
  return AGENTS;
}

export function detectExistingConfigs(dir: string): string[] {
  const found: string[] = [];
  for (const agent of AGENTS) {
    if (fs.existsSync(path.join(dir, agent.filename))) {
      found.push(agent.name);
    }
  }
  return found;
}

export function createConfig(dir: string, agentName: string): string {
  const agent = AGENTS.find((a) => a.name === agentName);
  if (!agent) throw new Error(`Unknown agent: ${agentName}`);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const filePath = path.join(dir, agent.filename);
  if (fs.existsSync(filePath)) {
    return `⏭  ${agent.filename} already exists — skipped`;
  }

  fs.writeFileSync(filePath, agent.defaultContent, "utf-8");
  return `✓ Created ${agent.filename} (${agent.description})`;
}
