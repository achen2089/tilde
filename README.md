# ~ tilde

**Write markdown at the speed of thought.**

A fast, fun, plugin-powered markdown workbench for the AI age. Built for people who write SKILL.md, CLAUDE.md, AGENTS.md, prompts, configs, and all the structured text that AI tools run on.

Tilde makes it fast. Tilde makes it fun. Tilde gets out of your way.

---

## Why

Markdown is the lingua franca of AI agents. Skills, rules, prompts, memory files, mermaid diagrams, YAML configs — it's all markdown now.

But writing it still sucks. You forget the frontmatter fields. You mess up the mermaid syntax. You copy-paste from old files. You spend 3 minutes formatting what should take 30 seconds.

Tilde fixes that.

## How It Works

```
~ tilde
```

That's it. You're in.

A fast TUI that feels like a tool, not an IDE. Everything is a plugin. The core is tiny — a shell, a plugin loader, an AI engine, and a renderer. Plugins bring the power.

### Core Loop

1. **Pick a primitive** — skill scaffold, mermaid diagram, YAML config, table, whatever
2. **Fill it in** — templates, AI assist, or just type
3. **See it live** — real-time preview, token count, structure validation
4. **Ship it** — export, copy, save, done

### What You Can Do

```bash
# Launch the TUI
tilde

# Quick scaffold from the command line
tilde new skill
tilde new agent
tilde new mermaid

# Format an existing file
tilde fmt CLAUDE.md

# Convert between formats
tilde export SKILL.md --to cursor-rule

# AI rewrite
tilde polish README.md
```

## Primitives

Tilde ships with built-in support for the building blocks of AI-era markdown:

| Primitive | What It Does |
|-----------|-------------|
| **Frontmatter** | YAML metadata — auto-complete fields, validate structure |
| **Mermaid** | Diagrams from descriptions — type what you mean, see the diagram |
| **Tables** | Fast table editing — no more counting pipes |
| **Code blocks** | Language detection, syntax hints |
| **Skill scaffold** | SKILL.md with all the right sections |
| **Agent config** | CLAUDE.md / AGENTS.md / Codex templates |
| **Rules** | Cursor rules, Claude rules, any format |
| **Memory entries** | Dated, structured, ready to file |
| **Prompts** | System prompts, user prompts, templates with variables |

## Plugins

Everything is a plugin. The built-in primitives are plugins. You can add your own.

```
~/.tilde/plugins/
  mermaid/
  skill-scaffold/
  my-custom-template/
    plugin.md
```

A plugin is just a directory with a `plugin.md` that describes what it does, its template, and optionally an AI prompt for generation. Same philosophy as skills — markdown all the way down.

### Community Plugins

Anyone can write and share plugins. A plugin for your company's RFC format. A plugin for blog post scaffolds. A plugin for Terraform docs. If it's structured text, it's a tilde plugin.

## AI Built In

Tilde has AI woven through it, not bolted on.

- **Generate** — describe what you want, get a first draft
- **Polish** — highlight a section, tighten it up
- **Expand** — turn a bullet list into full prose
- **Convert** — SKILL.md → Cursor rule → Codex config
- **Explain** — "what does this mermaid diagram do?"

Works with whatever model you have configured. Claude, GPT, local — tilde doesn't care.

## Agent Aware

Tilde knows about the agents you use. It detects Claude Code, Codex, Cursor, OpenClaw, OpenCode, and adapts:

- Scaffolds use the right format for your agent
- Export converts between agent formats
- Token counter reflects your agent's context window
- Validation checks agent-specific requirements

## Design Principles

1. **Speed over features** — if it's slower than raw typing, it's a bug
2. **Fun over formal** — writing should feel good, not like filling out a form
3. **Plugins over bloat** — the core stays tiny, plugins bring the power
4. **Terminal native** — no browser, no Electron, no waiting
5. **Markdown in, markdown out** — tilde doesn't own your files

## Install

```bash
npm install -g tilde

# or use directly
npx tilde
```

## Stack

- **Go + Bubble Tea** — fast TUI, single binary
- **Tree-sitter** — markdown parsing and syntax awareness
- **Plugin system** — markdown-defined, zero config

## Status

Early. Building in public. Contributions welcome.

---

*~ Write it fast. Ship it faster.*
