import fs from "node:fs";
import matter from "gray-matter";

// Format definitions: each format has a way to detect and a way to generate
export type AgentFormat = "skill" | "cursor-rule" | "claude-md" | "codex";

interface ParsedDoc {
  title: string;
  description: string;
  sections: { heading: string; content: string }[];
  raw: string;
}

function parseMarkdown(content: string): ParsedDoc {
  const { data, content: body } = matter(content);
  const title = data.name || data.title || "";
  const description = data.description || "";

  const sections: { heading: string; content: string }[] = [];
  const lines = body.split("\n");
  let currentHeading = "";
  let currentContent: string[] = [];

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,3})\s+(.+)/);
    if (headingMatch) {
      if (currentHeading || currentContent.length > 0) {
        sections.push({
          heading: currentHeading,
          content: currentContent.join("\n").trim(),
        });
      }
      currentHeading = headingMatch[2];
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  }
  if (currentHeading || currentContent.length > 0) {
    sections.push({
      heading: currentHeading,
      content: currentContent.join("\n").trim(),
    });
  }

  return { title, description, sections, raw: content };
}

function detectFormat(content: string): AgentFormat {
  const lower = content.toLowerCase();
  if (lower.includes("# skill.md") || lower.includes("## triggers") || lower.includes("## rules")) {
    return "skill";
  }
  if (lower.includes("# claude.md") || lower.includes("claude code")) {
    return "claude-md";
  }
  if (lower.includes("codex") || lower.includes("# codex")) {
    return "codex";
  }
  // Default to cursor-rule for generic markdown instructions
  return "cursor-rule";
}

function toSkillMd(doc: ParsedDoc): string {
  const lines: string[] = [];
  lines.push("# SKILL.md");
  lines.push("");
  if (doc.title) lines.push(`> ${doc.title}`);
  if (doc.description) lines.push(`> ${doc.description}`);
  lines.push("");

  // Map sections
  for (const sec of doc.sections) {
    if (!sec.heading && !sec.content) continue;
    if (sec.heading) {
      lines.push(`## ${sec.heading}`);
    }
    if (sec.content) {
      lines.push("");
      lines.push(sec.content);
    }
    lines.push("");
  }

  return lines.join("\n");
}

function toCursorRule(doc: ParsedDoc): string {
  const lines: string[] = [];
  if (doc.title) {
    lines.push(`# ${doc.title}`);
    lines.push("");
  }
  if (doc.description) {
    lines.push(doc.description);
    lines.push("");
  }

  lines.push("## Rules");
  lines.push("");

  for (const sec of doc.sections) {
    if (!sec.heading && !sec.content) continue;
    if (sec.heading) {
      lines.push(`### ${sec.heading}`);
    }
    if (sec.content) {
      // Convert to bullet points if not already
      const contentLines = sec.content.split("\n").filter((l) => l.trim());
      for (const cl of contentLines) {
        if (cl.startsWith("-") || cl.startsWith("*") || cl.startsWith("#")) {
          lines.push(cl);
        } else {
          lines.push(`- ${cl}`);
        }
      }
    }
    lines.push("");
  }

  return lines.join("\n");
}

function toClaudeMd(doc: ParsedDoc): string {
  const lines: string[] = [];
  lines.push("# CLAUDE.md");
  lines.push("");
  if (doc.title) {
    lines.push(`> ${doc.title}`);
    lines.push("");
  }
  if (doc.description) {
    lines.push(doc.description);
    lines.push("");
  }

  lines.push("## Instructions");
  lines.push("");

  for (const sec of doc.sections) {
    if (!sec.heading && !sec.content) continue;
    if (sec.heading) {
      lines.push(`### ${sec.heading}`);
    }
    if (sec.content) {
      lines.push("");
      lines.push(sec.content);
    }
    lines.push("");
  }

  return lines.join("\n");
}

function toCodex(doc: ParsedDoc): string {
  const lines: string[] = [];
  lines.push("# Codex Instructions");
  lines.push("");
  if (doc.title) {
    lines.push(`## ${doc.title}`);
    lines.push("");
  }
  if (doc.description) {
    lines.push(doc.description);
    lines.push("");
  }

  for (const sec of doc.sections) {
    if (!sec.heading && !sec.content) continue;
    if (sec.heading) {
      lines.push(`## ${sec.heading}`);
    }
    if (sec.content) {
      lines.push("");
      lines.push(sec.content);
    }
    lines.push("");
  }

  return lines.join("\n");
}

const converters: Record<AgentFormat, (doc: ParsedDoc) => string> = {
  skill: toSkillMd,
  "cursor-rule": toCursorRule,
  "claude-md": toClaudeMd,
  codex: toCodex,
};

const formatNames: Record<AgentFormat, string> = {
  skill: "SKILL.md (OpenClaw)",
  "cursor-rule": ".cursorrules (Cursor)",
  "claude-md": "CLAUDE.md (Claude Code)",
  codex: "AGENTS.md (Codex)",
};

export function exportFile(
  filePath: string,
  targetFormat: AgentFormat,
  outputPath?: string
): { output: string; sourceFormat: AgentFormat; targetFormat: AgentFormat } {
  const content = fs.readFileSync(filePath, "utf-8");
  const sourceFormat = detectFormat(content);
  const doc = parseMarkdown(content);

  const converter = converters[targetFormat];
  if (!converter) {
    throw new Error(
      `Unknown target format: ${targetFormat}. Available: ${Object.keys(converters).join(", ")}`
    );
  }

  const output = converter(doc);

  if (outputPath) {
    fs.writeFileSync(outputPath, output, "utf-8");
  }

  return { output, sourceFormat, targetFormat };
}

export function listFormats(): string[] {
  return Object.entries(formatNames).map(([k, v]) => `  ${k.padEnd(14)} ${v}`);
}
