import fs from "node:fs";
import { Command } from "commander";
import { loadAllPlugins, findPlugin, renderTemplate } from "./plugins.js";
import { countTokensFromFile, formatTokenCount } from "./tokens.js";
import { formatFile } from "./formatter.js";
import { exportFile, listFormats } from "./export.js";
import type { AgentFormat } from "./export.js";
import { polishFile, generateMarkdown } from "./ai.js";
import { getAgentConfigs, detectExistingConfigs, createConfig } from "./init.js";
import { launchTUI } from "./tui.js";
import chalk from "chalk";

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
      console.log(chalk.cyan("\n~ tilde templates\n"));
      for (const p of plugins) {
        console.log(`  ${chalk.bold(p.meta.name.padEnd(12))} ${chalk.dim(p.meta.description)}`);
      }
      console.log(chalk.dim(`\nUsage: tilde new <template>\n`));
      return;
    }

    const plugin = findPlugin(templateName);
    if (!plugin) {
      console.error(chalk.red(`Error: Template "${templateName}" not found.`));
      console.error(
        chalk.dim(`Available: ${loadAllPlugins().map((p) => p.meta.name).join(", ")}`)
      );
      process.exit(1);
    }

    const output = renderTemplate(plugin.template);

    if (opts.output) {
      fs.writeFileSync(opts.output, output, "utf-8");
      console.log(chalk.green(`✓ Created ${opts.output}`) + chalk.dim(` from "${plugin.meta.name}" template`));
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
      console.error(chalk.red(`Error: File not found: ${file}`));
      process.exit(1);
    }

    const result = formatFile(file);

    if (result.changes.length === 0) {
      console.log(chalk.green(`✓ ${file}`) + chalk.dim(` — already clean`));
    } else {
      console.log(chalk.green(`✓ ${file}`) + chalk.dim(` — formatted:`));
      for (const change of result.changes) {
        console.log(chalk.dim(`  • `) + change);
      }
    }
  });

// tilde tokens <file>
program
  .command("tokens <file>")
  .description("Count tokens in a markdown file")
  .action((file: string) => {
    if (!fs.existsSync(file)) {
      console.error(chalk.red(`Error: File not found: ${file}`));
      process.exit(1);
    }

    const count = countTokensFromFile(file);
    const content = fs.readFileSync(file, "utf-8");
    const lines = content.split("\n").length;
    const chars = content.length;

    console.log(chalk.bold(file) + chalk.dim(":"));
    console.log(`  ${chalk.cyan("Tokens")}  ${count.toLocaleString()} ${chalk.dim(`(${formatTokenCount(count)})`)}`);
    console.log(`  ${chalk.cyan("Lines")}   ${lines.toLocaleString()}`);
    console.log(`  ${chalk.cyan("Chars")}   ${chars.toLocaleString()}`);
  });

// tilde list — list templates
program
  .command("list")
  .description("List available templates")
  .action(() => {
    const plugins = loadAllPlugins();
    console.log(chalk.cyan.bold("\n~ tilde templates\n"));
    for (const p of plugins) {
      const tags = p.meta.tags.map((t) => chalk.magenta(`#${t}`)).join(" ");
      console.log(`  ${chalk.bold.white(p.meta.name.padEnd(12))} ${p.meta.description}`);
      console.log(`  ${"".padEnd(12)} ${tags}`);
      console.log();
    }
  });

// tilde export <file> --to <format>
program
  .command("export <file>")
  .description("Convert between agent config formats")
  .requiredOption("--to <format>", "Target format: skill, cursor-rule, claude-md, codex")
  .option("-o, --output <file>", "Write to file instead of stdout")
  .action((file: string, opts: { to: string; output?: string }) => {
    if (!fs.existsSync(file)) {
      console.error(chalk.red(`Error: File not found: ${file}`));
      process.exit(1);
    }

    try {
      const result = exportFile(file, opts.to as AgentFormat, opts.output);
      if (opts.output) {
        console.log(
          chalk.green(`✓ Exported`) +
          chalk.dim(` ${result.sourceFormat} → ${result.targetFormat}`) +
          ` → ${opts.output}`
        );
      } else {
        process.stdout.write(result.output);
      }
    } catch (err: any) {
      console.error(chalk.red(`Error: ${err.message}`));
      console.error(chalk.dim("\nAvailable formats:"));
      for (const line of listFormats()) {
        console.error(chalk.dim(line));
      }
      process.exit(1);
    }
  });

// tilde polish <file>
program
  .command("polish <file>")
  .description("AI-powered: tighten and improve a markdown file")
  .option("-o, --output <file>", "Write to file instead of stdout")
  .option("--replace", "Overwrite the original file")
  .action(async (file: string, opts: { output?: string; replace?: boolean }) => {
    if (!fs.existsSync(file)) {
      console.error(chalk.red(`Error: File not found: ${file}`));
      process.exit(1);
    }

    console.log(chalk.dim("⏳ Polishing..."));
    try {
      const result = await polishFile(file);
      if (opts.replace) {
        fs.writeFileSync(file, result, "utf-8");
        console.log(chalk.green(`✓ ${file} polished in-place`));
      } else if (opts.output) {
        fs.writeFileSync(opts.output, result, "utf-8");
        console.log(chalk.green(`✓ Polished → ${opts.output}`));
      } else {
        process.stdout.write(result);
      }
    } catch (err: any) {
      console.error(chalk.red(`Error: ${err.message}`));
      process.exit(1);
    }
  });

// tilde generate <description>
program
  .command("generate <description>")
  .description("AI-powered: generate a markdown file from a description")
  .option("-o, --output <file>", "Write to file instead of stdout")
  .action(async (description: string, opts: { output?: string }) => {
    console.log(chalk.dim("⏳ Generating..."));
    try {
      const result = await generateMarkdown(description);
      if (opts.output) {
        fs.writeFileSync(opts.output, result, "utf-8");
        console.log(chalk.green(`✓ Generated → ${opts.output}`));
      } else {
        process.stdout.write(result + "\n");
      }
    } catch (err: any) {
      console.error(chalk.red(`Error: ${err.message}`));
      process.exit(1);
    }
  });

// tilde init
program
  .command("init")
  .description("Interactive setup: create agent config files for your project")
  .option("--dir <path>", "Target directory", ".")
  .action((opts: { dir: string }) => {
    const dir = opts.dir;
    console.log(chalk.cyan.bold("\n~ tilde init\n"));

    // Detect existing configs
    const existing = detectExistingConfigs(dir);
    if (existing.length > 0) {
      console.log(chalk.dim("Detected existing configs:"));
      for (const name of existing) {
        console.log(chalk.dim(`  ✓ ${name}`));
      }
      console.log();
    }

    const agents = getAgentConfigs();
    console.log(chalk.dim("Creating agent configs...\n"));

    for (const agent of agents) {
      const result = createConfig(dir, agent.name);
      console.log(result);
    }

    console.log(chalk.dim("\nEdit these files to customize for your project."));
    console.log();
  });

program.parse();
