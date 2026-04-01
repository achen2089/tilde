# ~ tilde

A fast, plugin-powered CLI markdown workbench. Scaffold templates, format files, count tokens, convert between agent config formats, and polish docs with AI — all from the terminal.

```
npm install -g tilde-md
```

## Commands

### `tilde` — Interactive TUI

Launch the template picker. Browse, search, preview, and open templates in your editor.

```
$ tilde
  ╭─────────────────────────────╮
  │         ~ tilde ~           │
  │   markdown workbench  v0.1  │
  ╰─────────────────────────────╯
  Pick a template:
  ▸ agent        CLAUDE.md / AGENTS.md scaffold
    memory       Dated memory entry
    mermaid      Mermaid diagram scaffold
    ...
```

### `tilde new <template>` — Scaffold

Generate a new file from a built-in or custom template.

```bash
tilde new skill -o SKILL.md        # Create a SKILL.md
tilde new readme -o README.md      # Create a README
tilde new mermaid                   # Output to stdout
```

### `tilde list` — List Templates

```bash
$ tilde list
~ tilde templates

  agent        CLAUDE.md / AGENTS.md scaffold for AI coding agents
               #agent #claude #codex #cursor #config

  skill        SKILL.md scaffold — OpenClaw/Claude Code format
               #skill #openclaw #claude #agent
  ...
```

### `tilde fmt <file>` — Format

Clean up markdown files: normalize headers, trim whitespace, sort frontmatter, reduce blank lines.

```bash
$ tilde fmt messy-doc.md
✓ messy-doc.md — formatted:
  • Sorted frontmatter keys
  • Trimmed trailing whitespace (3 lines)
  • Normalized header spacing
  • Reduced excessive blank lines
```

### `tilde tokens <file>` — Token Count

Count tokens (GPT tokenizer), lines, and characters.

```bash
$ tilde tokens CLAUDE.md
CLAUDE.md:
  Tokens  1,072 (1.1k)
  Lines   142
  Chars   4,258
```

### `tilde export <file> --to <format>` — Format Conversion

Convert between agent config formats.

```bash
tilde export SKILL.md --to cursor-rule          # → .cursorrules format
tilde export .cursorrules --to claude-md         # → CLAUDE.md format
tilde export CLAUDE.md --to codex -o AGENTS.md   # → Codex format, write to file
```

**Supported formats:**
| Format | Description |
|---|---|
| `skill` | SKILL.md (OpenClaw) |
| `cursor-rule` | .cursorrules (Cursor) |
| `claude-md` | CLAUDE.md (Claude Code) |
| `codex` | AGENTS.md (Codex) |

### `tilde polish <file>` — AI Polish

Send a markdown file to an LLM to tighten prose, improve structure, and fix formatting.

```bash
tilde polish draft.md                    # Output to stdout
tilde polish draft.md --replace          # Overwrite in-place
tilde polish draft.md -o polished.md     # Write to new file
```

Requires `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` environment variable.

### `tilde generate <description>` — AI Generate

Describe what you want and get a markdown file.

```bash
tilde generate "API reference for a REST auth service"
tilde generate "onboarding guide for new engineers" -o onboarding.md
```

### `tilde init` — Project Setup

Create agent config files for your project. Detects existing configs and creates what's missing.

```bash
$ tilde init
~ tilde init

Detected existing configs:
  ✓ Claude Code

Creating agent configs...

⏭  CLAUDE.md already exists — skipped
✓ Created .cursorrules (Rules for Cursor AI editor)
✓ Created AGENTS.md (Instructions for OpenAI Codex)
✓ Created SKILL.md (Skill definition for OpenClaw agents)
```

## Templates

Built-in templates:

| Template | Description |
|---|---|
| `agent` | CLAUDE.md / AGENTS.md scaffold for AI coding agents |
| `memory` | Dated memory entry for agent logs |
| `mermaid` | Mermaid diagram scaffold |
| `prompt` | System prompt template |
| `readme` | README.md scaffold |
| `rules` | .cursorrules / coding rules scaffold |
| `skill` | SKILL.md scaffold for OpenClaw |

### Custom Templates

Drop templates in `~/.tilde/plugins/<name>/` with:
- `plugin.json` — metadata (name, description, tags)
- `template.md` — the template content

## Configuration

| Environment Variable | Description |
|---|---|
| `OPENAI_API_KEY` | OpenAI API key (for `polish` and `generate`) |
| `ANTHROPIC_API_KEY` | Anthropic API key (alternative to OpenAI) |
| `TILDE_MODEL` | Override the default model |
| `EDITOR` | Editor for TUI template editing |

## Development

```bash
git clone https://github.com/achen2089/tilde.git
cd tilde
npm install
npm run dev -- list          # Run in dev mode
npm run build                # Build to dist/
```

## License

MIT
