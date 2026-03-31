import fs from "node:fs";
import matter from "gray-matter";
import yaml from "js-yaml";

export interface FormatResult {
  output: string;
  changes: string[];
}

export function formatMarkdown(content: string): FormatResult {
  const changes: string[] = [];
  let result = content;

  // 1. Normalize line endings
  if (result.includes("\r\n")) {
    result = result.replaceAll("\r\n", "\n");
    changes.push("Normalized line endings");
  }

  // 2. Sort frontmatter keys (before line-level ops)
  const hasFrontmatter = result.trimStart().startsWith("---");
  if (hasFrontmatter) {
    try {
      const parsed = matter(result);
      if (parsed.data && Object.keys(parsed.data).length > 0) {
        const originalKeys = Object.keys(parsed.data);
        const sortedKeys = [...originalKeys].sort();
        const keysChanged = originalKeys.some((k, i) => k !== sortedKeys[i]);

        if (keysChanged) {
          const sortedData: Record<string, unknown> = {};
          for (const key of sortedKeys) {
            sortedData[key] = parsed.data[key];
          }
          const newFrontmatter = yaml.dump(sortedData, { lineWidth: -1 }).trim();
          // parsed.content starts after the closing ---
          result = `---\n${newFrontmatter}\n---\n${parsed.content}`;
          changes.push("Sorted frontmatter keys");
        }
      }
    } catch {
      // skip if frontmatter parsing fails
    }
  }

  // 3. Trim trailing whitespace from each line
  const lines = result.split("\n");
  let trimmedCount = 0;
  const trimmedLines = lines.map((line) => {
    const trimmed = line.replace(/\s+$/, "");
    if (trimmed !== line) trimmedCount++;
    return trimmed;
  });
  if (trimmedCount > 0) {
    result = trimmedLines.join("\n");
    changes.push(`Trimmed trailing whitespace (${trimmedCount} lines)`);
  }

  // 4. Normalize headers: ensure space after #
  const headerFixed = result.replace(/^(#{1,6})([^\s#])/gm, "$1 $2");
  if (headerFixed !== result) {
    result = headerFixed;
    changes.push("Normalized header spacing");
  }

  // 5. Normalize multiple blank lines to max 1 blank line (2 newlines)
  const normalized = result.replace(/\n{4,}/g, "\n\n\n");
  if (normalized !== result) {
    result = normalized;
    changes.push("Reduced excessive blank lines");
  }

  // 6. Ensure single newline at end of file
  result = result.replace(/\n*$/, "\n");

  return { output: result, changes };
}

export function formatFile(filePath: string): FormatResult {
  const content = fs.readFileSync(filePath, "utf-8");
  const result = formatMarkdown(content);
  fs.writeFileSync(filePath, result.output, "utf-8");
  return result;
}
