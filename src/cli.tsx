import fs from "node:fs";
import { Command } from "commander";
import { loadAllPlugins, findPlugin, renderTemplate } from "./plugins.js";
import { countTokensFromFile, formatTokenCount } from "./tokens.js";
import { formatFile } from "./formatter.js";
import { launchTUI } from "./tui.js";

const program = new Command();

program
  .name("tilde")
  .description("A fast, plugin-powered TUI markdown workbench")
  .version("0.1.0");

// Default: launch TUI when no command given
program.action(() => {
  launchTUI();
});

// tilde new <template>
program
  .command("new <template>")
  .description("Scaffold a new file from a template")
  .option("-o, --output <file>", "Write to file instead of stdout")
  .action((templateName: string, opts: { output?: string }) => {
    if (templateName === "list") {
      const plugins = loadAllPlugins();
      console.log("\nAvailable templates:\n");
      for (const p of plugins) {
        console.log(`  ${p.meta.name.padEnd(12)} ${p.meta.description}`);
      }
      console.log(`\nUsage: tilde new <template>\n`);
      return;
    }

    const plugin = findPlugin(templateName);
    if (!plugin) {
      console.error(`Error: Template "${templateName}" not found.`);
      console.error(
        `Available: ${loadAllPlugins()
          .map((p) => p.meta.name)
          .join(", ")}`
      );
      process.exit(1);
    }

    const output = renderTemplate(plugin.template);

    if (opts.output) {
      fs.writeFileSync(opts.output, output, "utf-8");
      console.log(`✓ Created ${opts.output} from "${plugin.meta.name}" template`);
    } else {
      process.stdout.write(output);
    }
  });

// tilde fmt <file>
program
  .command("fmt <file>")
  .description("Format and clean up a markdown file")
  .action((file: string) => {
    if (!fs.existsSync(file)) {
      console.error(`Error: File not found: ${file}`);
      process.exit(1);
    }

    const result = formatFile(file);

    if (result.changes.length === 0) {
      console.log(`✓ ${file} — already clean`);
    } else {
      console.log(`✓ ${file} — formatted:`);
      for (const change of result.changes) {
        console.log(`  • ${change}`);
      }
    }
  });

// tilde tokens <file>
program
  .command("tokens <file>")
  .description("Count tokens in a markdown file")
  .action((file: string) => {
    if (!fs.existsSync(file)) {
      console.error(`Error: File not found: ${file}`);
      process.exit(1);
    }

    const count = countTokensFromFile(file);
    const content = fs.readFileSync(file, "utf-8");
    const lines = content.split("\n").length;
    const chars = content.length;

    console.log(`${file}:`);
    console.log(`  Tokens: ${count.toLocaleString()} (${formatTokenCount(count)})`);
    console.log(`  Lines:  ${lines.toLocaleString()}`);
    console.log(`  Chars:  ${chars.toLocaleString()}`);
  });

// tilde list — list templates
program
  .command("list")
  .description("List available templates")
  .action(() => {
    const plugins = loadAllPlugins();
    console.log("\n~ tilde templates\n");
    for (const p of plugins) {
      const tags = p.meta.tags.map((t) => `#${t}`).join(" ");
      console.log(`  ${p.meta.name.padEnd(12)} ${p.meta.description}`);
      console.log(`  ${"".padEnd(12)} ${tags}\n`);
    }
  });

program.parse();
