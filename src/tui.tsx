import React, { useState, useMemo } from "react";
import { render, Box, Text, useInput, useApp } from "ink";
import { loadAllPlugins, renderTemplate, type Plugin } from "./plugins.js";
import { countTokens, formatTokenCount } from "./tokens.js";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const BANNER = `
  ╭─────────────────────────────╮
  │         ~ tilde ~           │
  │   markdown workbench  v0.1  │
  ╰─────────────────────────────╯`;

function TemplatePicker() {
  const { exit } = useApp();
  const plugins = useMemo(() => loadAllPlugins(), []);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState<"browse" | "preview" | "done">("browse");

  const filtered = useMemo(() => {
    if (!search) return plugins;
    const lower = search.toLowerCase();
    return plugins.filter(
      (p) =>
        p.meta.name.toLowerCase().includes(lower) ||
        p.meta.description.toLowerCase().includes(lower) ||
        p.meta.tags.some((t) => t.toLowerCase().includes(lower))
    );
  }, [plugins, search]);

  const current = filtered[selectedIndex];
  const tokenCount = current ? countTokens(current.template) : 0;

  useInput((input, key) => {
    if (mode === "done") return;

    if (key.escape) {
      if (mode === "preview") {
        setMode("browse");
      } else {
        exit();
      }
      return;
    }

    if (mode === "preview") {
      if (key.return) {
        openInEditor(current);
        setMode("done");
        exit();
      }
      return;
    }

    // Browse mode
    if (key.upArrow) {
      setSelectedIndex((i) => Math.max(0, i - 1));
    } else if (key.downArrow) {
      setSelectedIndex((i) => Math.min(filtered.length - 1, i + 1));
    } else if (key.return) {
      if (current) {
        setMode("preview");
      }
    } else if (key.backspace || key.delete) {
      setSearch((s) => s.slice(0, -1));
      setSelectedIndex(0);
    } else if (input && !key.ctrl && !key.meta) {
      setSearch((s) => s + input);
      setSelectedIndex(0);
    }
  });

  if (mode === "done") {
    return (
      <Box>
        <Text color="green">✓ Template opened in editor</Text>
      </Box>
    );
  }

  if (mode === "preview" && current) {
    const previewLines = current.template.split("\n").slice(0, 20);
    return (
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <Text bold color="cyan">
            ~ Preview: {current.meta.name}
          </Text>
          <Text dimColor> ({formatTokenCount(tokenCount)} tokens)</Text>
        </Box>
        <Box
          flexDirection="column"
          borderStyle="round"
          borderColor="cyan"
          paddingX={1}
        >
          {previewLines.map((line, i) => (
            <Text key={i} color={line.startsWith("#") ? "yellow" : line.startsWith("-") ? "white" : "gray"}>
              {line}
            </Text>
          ))}
          {current.template.split("\n").length > 20 && (
            <Text color="gray">... ({current.template.split("\n").length - 20} more lines)</Text>
          )}
        </Box>
        <Box marginTop={1}>
          <Text dimColor>Enter: open in $EDITOR │ Esc: back</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Box>
        <Text color="cyan">{BANNER}</Text>
      </Box>

      <Box marginTop={1} marginBottom={1}>
        <Text bold color="white">
          Pick a template:
        </Text>
      </Box>

      {search && (
        <Box marginBottom={1}>
          <Text>
            🔍 <Text color="yellow">{search}</Text>
            <Text dimColor>▌</Text>
          </Text>
        </Box>
      )}

      <Box flexDirection="column">
        {filtered.length === 0 ? (
          <Text dimColor>No templates match "{search}"</Text>
        ) : (
          filtered.map((plugin, i) => {
            const isSelected = i === selectedIndex;
            const indicator = isSelected ? "▸" : " ";
            return (
              <Box key={plugin.meta.name}>
                <Text color={isSelected ? "cyan" : "gray"}>
                  {indicator}{" "}
                </Text>
                <Text bold={isSelected} color={isSelected ? "cyan" : "white"}>
                  {plugin.meta.name.padEnd(12)}
                </Text>
                <Text dimColor> {plugin.meta.description}</Text>
              </Box>
            );
          })
        )}
      </Box>

      {current && (
        <Box marginTop={1} flexDirection="column">
          <Box>
            <Text dimColor>Tags: </Text>
            <Text color="magenta">{current.meta.tags.join(", ")}</Text>
            <Text dimColor>  │  Tokens: </Text>
            <Text color="yellow">{formatTokenCount(tokenCount)}</Text>
          </Box>
        </Box>
      )}

      <Box marginTop={1} borderStyle="single" borderColor="gray" paddingX={1}>
        <Text dimColor>↑↓ navigate │ type to search │ enter to preview │ esc to quit</Text>
      </Box>
    </Box>
  );
}

function openInEditor(plugin: Plugin): void {
  const editor = process.env.EDITOR || process.env.VISUAL || "vi";
  const tmpDir = os.tmpdir();
  const tmpFile = path.join(tmpDir, `tilde-${plugin.meta.name}-${Date.now()}.md`);
  const content = renderTemplate(plugin.template);
  fs.writeFileSync(tmpFile, content, "utf-8");

  try {
    execSync(`${editor} "${tmpFile}"`, { stdio: "inherit" });
    if (fs.existsSync(tmpFile)) {
      const edited = fs.readFileSync(tmpFile, "utf-8");
      process.stdout.write(edited);
      fs.unlinkSync(tmpFile);
    }
  } catch {
    process.stdout.write(content);
  }
}

export function launchTUI(): void {
  render(<TemplatePicker />);
}
