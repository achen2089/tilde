import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export interface PluginMeta {
  name: string;
  description: string;
  tags: string[];
}

export interface Plugin {
  meta: PluginMeta;
  template: string;
  dir: string;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadPluginsFromDir(dir: string): Plugin[] {
  if (!fs.existsSync(dir)) return [];

  const plugins: Plugin[] = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const pluginDir = path.join(dir, entry.name);
    const metaPath = path.join(pluginDir, "plugin.json");
    const templatePath = path.join(pluginDir, "template.md");

    if (!fs.existsSync(metaPath) || !fs.existsSync(templatePath)) continue;

    try {
      const meta: PluginMeta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
      const template = fs.readFileSync(templatePath, "utf-8");
      plugins.push({ meta, template, dir: pluginDir });
    } catch {
      // skip malformed plugins
    }
  }

  return plugins;
}

export function loadAllPlugins(): Plugin[] {
  // Built-in plugins
  const builtinDir = path.join(__dirname, "plugins");
  const builtins = loadPluginsFromDir(builtinDir);

  // User plugins from ~/.tilde/plugins/
  const userDir = path.join(
    process.env.HOME || process.env.USERPROFILE || "~",
    ".tilde",
    "plugins"
  );
  const userPlugins = loadPluginsFromDir(userDir);

  // User plugins override built-ins with same name
  const map = new Map<string, Plugin>();
  for (const p of builtins) map.set(p.meta.name, p);
  for (const p of userPlugins) map.set(p.meta.name, p);

  return Array.from(map.values());
}

export function findPlugin(name: string): Plugin | undefined {
  return loadAllPlugins().find(
    (p) => p.meta.name.toLowerCase() === name.toLowerCase()
  );
}

export function renderTemplate(template: string, vars?: Record<string, string>): string {
  if (!vars) return template;
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replaceAll(`{{${key}}}`, value);
  }
  return result;
}
