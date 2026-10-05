// Loaded by next.config.ts before next-intl's plugin.
//
// The plugin loads SWC's native addon when the config is read (for
// next-intl's optional message extractor, which this site does not use).
// On Windows the addon copies itself into a cache folder under
// %LOCALAPPDATA%\swc and refuses to load if that folder's permissions grant
// rights to an extra app-container account, as they do on the development
// machine ("Failed to load native binding" when building). Keeping the cache
// inside the project avoids it; other platforms are left alone.
/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS on purpose: it runs while next.config.ts loads */
const fs = require("node:fs");
const path = require("node:path");

if (process.platform === "win32" && !process.env.SWC_NATIVE_BINDING_CACHE) {
  const dir = path.join(__dirname, "..", "node_modules", ".cache", "swc-native");
  fs.mkdirSync(dir, { recursive: true });
  process.env.SWC_NATIVE_BINDING_CACHE = dir;
}
