import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/** Unit tests (npm test): pure logic only, run in Node. */
export default defineConfig({
  resolve: {
    // The same "@/…" imports as tsconfig.json's paths.
    alias: [
      {
        find: /^@\//,
        replacement: fileURLToPath(new URL("./", import.meta.url)),
      },
    ],
  },
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
    // .claude/**: agent worktrees, full checkouts with their own node_modules.
    exclude: ["node_modules/**", ".next/**", ".claude/**"],
  },
});
