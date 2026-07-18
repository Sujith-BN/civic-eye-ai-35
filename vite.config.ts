// @lovable.dev/vite-tanstack-config already includes the required TanStack,
// React, Tailwind, Nitro/Cloudflare, env injection, and path alias plugins.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadDevVars() {
  // Only needed for local Vite development.
  // Cloudflare/Wrangler handles .dev.vars separately in its own runtime.
  if (process.env.NODE_ENV === "production") return;

  const file = resolve(process.cwd(), ".dev.vars");

  if (!existsSync(file)) return;

  for (const rawLine of readFileSync(file, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) continue;

    const separator = line.indexOf("=");

    if (separator === -1) continue;

    const key = line.slice(0, separator).trim();
    const value = line
      .slice(separator + 1)
      .trim()
      .replace(/^['"]|['"]$/g, "");

    // VITE_* variables are already handled by Vite from .env.
    // Only load server-side variables from .dev.vars.
    if (
      key &&
      !key.startsWith("VITE_") &&
      process.env[key] === undefined
    ) {
      process.env[key] = value;
    }
  }
}

loadDevVars();

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts.
    server: { entry: "server" },
  },
});