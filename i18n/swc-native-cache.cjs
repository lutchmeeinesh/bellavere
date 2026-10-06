// Loaded by next.config.ts before next-intl's plugin.
//
// The plugin loads SWC's native addon when the config is read (for
// next-intl's optional message extractor, which this site does not use).
// On Windows the addon copies itself into a cache folder under
// %LOCALAPPDATA%\swc and refuses to load if that folder's permissions grant
// rights to an extra app-container account, as they do on the development
// machine ("Failed to load native binding" when building). Keeping the cache
// inside the project avoids it; other platforms are left alone.
//
// The folder must stay short: SWC adds about 195 characters below it
// (swc-native-<user SID>\v1\<128-character hash>.node), and Windows refuses
// paths over 259 characters. So it is node_modules\.swc of the main
// checkout (40 characters for C:\Users\user\bellavere), shared by the agent
// worktrees under <main checkout>\.claude\worktrees\<name>, whose own
// node_modules would push the path over the limit. Cached files are named by
// their content hash, so worktrees on other SWC versions can share it.
/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS on purpose: it runs while next.config.ts loads */
const fs = require("node:fs");
const path = require("node:path");

if (process.platform === "win32" && !process.env.SWC_NATIVE_BINDING_CACHE) {
  const root = path.join(__dirname, "..");
  const worktrees = `${path.sep}.claude${path.sep}worktrees${path.sep}`;
  const at = root.toLowerCase().indexOf(worktrees);
  const checkout = at >= 0 ? root.slice(0, at) : root;
  const dir = path.join(checkout, "node_modules", ".swc");
  fs.mkdirSync(dir, { recursive: true });
  process.env.SWC_NATIVE_BINDING_CACHE = dir;
}
