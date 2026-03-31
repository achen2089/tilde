import { defineConfig } from "tsup";
import { cpSync } from "node:fs";

export default defineConfig({
  entry: ["src/cli.tsx"],
  format: ["esm"],
  target: "node18",
  outDir: "dist",
  clean: true,
  splitting: false,
  banner: {
    js: "#!/usr/bin/env node",
  },
  onSuccess: async () => {
    // Copy plugin directories to dist
    cpSync("src/plugins", "dist/plugins", { recursive: true });
    console.log("Copied plugins to dist/plugins");
  },
});
