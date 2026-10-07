/**
 * Checks the translations (npm run i18n:check):
 *
 *  1. Key parity: every key of messages/en.json exists in messages/fr.json
 *     and vice versa (each file is an object whose top-level keys are the
 *     namespaces: common, home, …; every namespace must exist in both).
 *  2. ICU placeholders: each French message uses the same arguments
 *     ({name}, {count, plural, …}, {maxFee, number, percent}) and the same
 *     rich-text tags (<link>…</link>) as its English original, and every
 *     message parses as ICU.
 *  3. Possibly untranslated: French values identical to the English ones,
 *     except values with nothing to translate (numbers, emails, phones,
 *     URLs, placeholders only) and the allow-list below (brand names,
 *     words that are the same in French).
 *  4. Hard-coded text: user-facing strings still written in components/ and
 *     app/[locale]/ (JSX text, aria-label / alt / title / placeholder and
 *     other text props, and prose-like string literals), which belong in
 *     the messages. The English-only owner portal (components/dashboard,
 *     components/admin, components/auth) is not scanned. Mark a deliberate
 *     literal with a `i18n-ignore` comment on its line (or
 *     `i18n-ignore-next-line` on the line above, or an
 *     `i18n-ignore-start` / `i18n-ignore-end` block).
 *
 * Exit code 1 for 1–2 (always) and for 3–4 with --strict (used once the
 * translation is complete). --quiet prints the summary only.
 *
 * Usage: node scripts/i18n-check.mjs [--strict] [--quiet]
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const ROOT = process.cwd();
const MESSAGES = path.join(ROOT, "messages");
const SOURCE = "en";
const TARGETS = ["fr"];
const STRICT = process.argv.includes("--strict");
const QUIET = process.argv.includes("--quiet");

/** French values allowed to equal the English ones (whole value, case-sensitive). */
const IDENTICAL_VALUES = new Set([
  "Bellavere",
  "Airbnb",
  "Booking.com",
  "WhatsApp",
  "Instagram",
  "Facebook",
  "LinkedIn",
  "English",
  "Français",
  "EUR",
  "MUR",
  "Contact",
  "Services",
  "Maintenance",
  "Concierge",
  "Syndic",
  "Message",
  "Email",
  "Villa",
  "Notes",
]);
/** Keys allowed to stay identical (e.g. a proper noun inside a sentence). */
const IDENTICAL_KEYS = new Set([
  // Names and labels that are the same in both languages.
  "home.testimonials.items.elise.name",
  "home.testimonials.items.deepak.name",
  "home.testimonials.items.nathalie.name",
  "contact.faq.eyebrow",
  "common.currency.names.EUR",
  "estimator.types.penthouse.name",
  "estimator.regions.north.towns",
  "estimator.regions.east.towns",
  "estimator.regions.south.towns",
]);

let errors = 0;
let warnings = 0;
const lines = [];
const out = (line = "") => lines.push(line);

// ---------------------------------------------------------------- messages

function flatten(value, prefix = "", into = new Map()) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    for (const [key, child] of Object.entries(value)) {
      flatten(child, prefix ? `${prefix}.${key}` : key, into);
    }
  } else {
    into.set(prefix, value);
  }
  return into;
}

/** A locale's namespaces (the top-level keys of messages/<locale>.json). */
function readNamespaces(locale) {
  const file = path.join(MESSAGES, `${locale}.json`);
  // The per-namespace layout (messages/<locale>/<namespace>.json) was merged
  // into one file per locale; a folder left behind is no longer read.
  if (fs.existsSync(path.join(MESSAGES, locale))) {
    errors++;
    out(`ERROR  messages/${locale}/ is not read any more: move its keys into messages/${locale}.json and delete the folder`);
  }
  if (!fs.existsSync(file)) {
    errors++;
    out(`ERROR  messages/${locale}.json is missing`);
    return new Map();
  }
  let messages;
  try {
    messages = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    errors++;
    out(`ERROR  messages/${locale}.json: not valid JSON (${error.message})`);
    return new Map();
  }
  if (!messages || typeof messages !== "object" || Array.isArray(messages)) {
    errors++;
    out(`ERROR  messages/${locale}.json: expected an object of namespaces`);
    return new Map();
  }
  return new Map(Object.entries(messages));
}

let parseIcu;
try {
  ({ parse: parseIcu } = require("@formatjs/icu-messageformat-parser"));
} catch {
  parseIcu = null; // falls back to a simpler scan below
}

/** Arguments and tags used by an ICU message, as sorted strings. */
function placeholders(message) {
  const found = new Set();
  if (parseIcu) {
    const walk = (nodes) => {
      for (const node of nodes) {
        if ([1, 2, 3, 4, 5, 6].includes(node.type)) found.add(`{${node.value}}`);
        if (node.type === 8) {
          found.add(`<${node.value}>`);
          walk(node.children);
        }
        if (node.options) {
          for (const option of Object.values(node.options)) walk(option.value);
        }
      }
    };
    walk(parseIcu(message)); // throws on invalid ICU
  } else {
    for (const m of message.matchAll(/\{\s*([A-Za-z0-9_]+)/g)) found.add(`{${m[1]}}`);
    for (const m of message.matchAll(/<([A-Za-z0-9_]+)>/g)) found.add(`<${m[1]}>`);
  }
  return [...found].sort();
}

/** True when a value has nothing a translator would change. */
function nothingToTranslate(value) {
  const stripped = value
    .replace(/\{[^{}]*\}/g, " ") // simple placeholders
    .replace(/<\/?[A-Za-z0-9_]+>/g, " ")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[\w.+-]+@[\w-]+(\.[\w-]+)+/g, " ")
    .replace(/\+?\d[\d\s]{5,}\d/g, " ");
  return !/\p{L}{2,}/u.test(stripped);
}

const source = readNamespaces(SOURCE);
const counts = { keys: 0, parity: 0, placeholders: 0, identical: 0, hardcoded: 0 };

for (const [, messages] of source) counts.keys += flatten(messages).size;

for (const target of TARGETS) {
  const translated = readNamespaces(target);
  const namespaces = new Set([...source.keys(), ...translated.keys()]);
  for (const ns of [...namespaces].sort()) {
    if (!source.has(ns)) {
      errors++;
      counts.parity++;
      out(`ERROR  ${target} namespace "${ns}" is not in ${SOURCE}.json`);
      continue;
    }
    if (!translated.has(ns)) {
      errors++;
      counts.parity++;
      out(`ERROR  ${target} namespace "${ns}" is missing from ${target}.json`);
      continue;
    }
    const en = flatten(source.get(ns));
    const fr = flatten(translated.get(ns));
    for (const key of en.keys()) {
      if (!fr.has(key)) {
        errors++;
        counts.parity++;
        out(`ERROR  ${target} ${ns}.${key}: missing`);
      }
    }
    for (const key of fr.keys()) {
      if (!en.has(key)) {
        errors++;
        counts.parity++;
        out(`ERROR  ${target} ${ns}.${key}: not in ${SOURCE} (remove it, or add it to ${SOURCE} first)`);
      }
    }
    for (const [key, enValue] of en) {
      if (!fr.has(key)) continue;
      const frValue = fr.get(key);
      const id = `${ns}.${key}`;
      if (typeof enValue !== "string" || typeof frValue !== "string") {
        if (typeof enValue !== typeof frValue) {
          errors++;
          counts.parity++;
          out(`ERROR  ${target} ${id}: ${typeof frValue} where ${SOURCE} has ${typeof enValue}`);
        }
        continue;
      }
      let enArgs;
      let frArgs;
      try {
        enArgs = placeholders(enValue);
      } catch (error) {
        errors++;
        counts.placeholders++;
        out(`ERROR  ${SOURCE} ${id}: invalid ICU message (${error.message})`);
        continue;
      }
      try {
        frArgs = placeholders(frValue);
      } catch (error) {
        errors++;
        counts.placeholders++;
        out(`ERROR  ${target} ${id}: invalid ICU message (${error.message})`);
        continue;
      }
      if (enArgs.join() !== frArgs.join()) {
        errors++;
        counts.placeholders++;
        out(`ERROR  ${target} ${id}: placeholders ${frArgs.join(" ") || "(none)"} but ${SOURCE} has ${enArgs.join(" ") || "(none)"}`);
      }
      if (
        frValue === enValue &&
        !nothingToTranslate(enValue) &&
        !IDENTICAL_VALUES.has(enValue) &&
        !IDENTICAL_KEYS.has(id)
      ) {
        warnings++;
        counts.identical++;
        if (!QUIET) out(`UNTRANSLATED?  ${target} ${id}: "${enValue.slice(0, 80)}${enValue.length > 80 ? "…" : ""}"`);
      }
    }
  }
}

// ---------------------------------------------------------- hard-coded text

let ts;
try {
  ts = require("typescript");
} catch {
  ts = null;
}

const SCAN_DIRS = [path.join(ROOT, "components"), path.join(ROOT, "app", "[locale]")];
const SKIP_DIRS = new Set(["dashboard", "admin", "auth"].map((d) => path.join(ROOT, "components", d)));

/** Attributes whose string values are user-facing text. */
const TEXT_ATTRIBUTES = new Set([
  "aria-label",
  "aria-description",
  "aria-roledescription",
  "aria-valuetext",
  "alt",
  "title",
  "placeholder",
  "label",
  "eyebrow",
  "sub",
  "heading",
  "description",
  "detail",
  "paragraphs",
  "included",
  "caption",
  "summary",
]);
/** Calls whose string arguments are never page text. */
const IGNORED_CALLS = new Set([
  "t",
  "tc",
  "rich",
  "markup",
  "raw",
  "has",
  "useTranslations",
  "getTranslations",
  "cn",
  "require",
  "Error",
  "unsplash",
  "track",
  "localizedMetadata",
  "localizedPath",
  "getPathname",
  "redirect",
  "notFound",
  "fetch",
  "matchMedia",
  "addEventListener",
  "removeEventListener",
  "dispatchEvent",
  "getElementById",
  "querySelector",
  "querySelectorAll",
  "closest",
  "setAttribute",
  "toLocaleString",
  "toLocaleDateString",
  "replace",
  "split",
  "join",
  "startsWith",
  "endsWith",
  "includes",
  "padStart",
]);

function walkFiles(dir, into = []) {
  if (!fs.existsSync(dir) || SKIP_DIRS.has(dir)) return into;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(full, into);
    else if (/\.tsx?$/.test(entry.name) && !entry.name.endsWith(".d.ts")) into.push(full);
  }
  return into;
}

/** CSS lengths and times ("0px", "-80px", "1.5rem", "200ms"), not words. */
const UNIT_TOKEN = /^-?[\d.]+(px|rem|em|vh|vw|svh|ms|s|deg|fr|%)?$/;

function looksLikeProse(text) {
  const value = text.trim();
  const words = value.split(/\s+/).filter((token) => !UNIT_TOKEN.test(token));
  if (!words.some((word) => /\p{L}{2,}/u.test(word))) return false;
  if (/^(https?:|mailto:|tel:|\/|#|\.{0,2}\/)/.test(value)) return false; // links and paths
  if (/^[\w.+-]+@[\w-]+(\.[\w-]+)+$/.test(value)) return false; // email
  if (/^[a-z0-9-]+(\/[a-z0-9-]+)*$/.test(value)) return false; // ids, keys, slugs
  if (/^[a-z][a-zA-Z0-9]*(\.[a-zA-Z0-9]+)+$/.test(value)) return false; // message keys
  if (/^[A-Z0-9_]+$/.test(value)) return false; // CONSTANTS, codes
  if (/^[a-z]+:[^\s]+$/.test(value)) return false; // prefixed tokens
  return /\s/.test(value) || /^\p{Lu}\p{Ll}{2,}/u.test(value);
}

function scanFile(file) {
  const text = fs.readFileSync(file, "utf8");
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const sourceLines = text.split(/\r?\n/);
  const ignored = new Set();
  let inBlock = false;
  sourceLines.forEach((line, i) => {
    if (line.includes("i18n-ignore-start")) inBlock = true;
    if (inBlock || /i18n-ignore(?!-)/.test(line)) ignored.add(i);
    if (line.includes("i18n-ignore-next-line")) ignored.add(i + 1);
    if (line.includes("i18n-ignore-end")) inBlock = false;
  });
  const findings = [];
  const report = (node, kind, value) => {
    const { line } = sf.getLineAndCharacterOfPosition(node.getStart(sf));
    if (ignored.has(line)) return;
    findings.push({ line: line + 1, kind, value: value.replace(/\s+/g, " ").trim() });
  };

  const calleeName = (call) => {
    const expr = call.expression;
    if (ts.isIdentifier(expr)) return expr.text;
    if (ts.isPropertyAccessExpression(expr)) return expr.name.text;
    return "";
  };

  /** Why a string literal is not page text, or null if it may be. */
  const isExempt = (node) => {
    for (let parent = node.parent; parent; parent = parent.parent) {
      if (ts.isImportDeclaration(parent) || ts.isExportDeclaration(parent)) return true;
      if (ts.isLiteralTypeNode(parent) || ts.isTypeNode(parent)) return true;
      if ((ts.isCallExpression(parent) || ts.isNewExpression(parent)) && IGNORED_CALLS.has(calleeName(parent))) return true;
      if (ts.isPropertyAccessExpression(parent) && parent.expression.getText(sf) === "console") return true;
      if (ts.isCallExpression(parent) && parent.expression.getText(sf).startsWith("console.")) return true;
      if (ts.isJsxAttribute(parent)) {
        const name = parent.name.getText(sf);
        return !TEXT_ATTRIBUTES.has(name);
      }
      if (ts.isVariableDeclaration(parent) && /class|link|prose|style|ease|pattern|cookie|event|channel|key|url|path|href|id$/i.test(parent.name.getText(sf))) return true;
      if (ts.isPropertyAssignment(parent)) {
        const key = parent.name.getText(sf).replace(/["']/g, "");
        if (/^(className|href|src|id|key|icon|Icon|type|variant|size|tone|as|sizes|layoutId|rel|target|role|htmlFor|name|network|code|propertyID|contactType|areaServed|addressCountry|dayOfWeek|opens|closes|"@type"|@type|@context|@id|url)$/.test(key)) return true;
      }
      if (ts.isBinaryExpression(parent) && [ts.SyntaxKind.EqualsEqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsEqualsToken, ts.SyntaxKind.EqualsEqualsToken].includes(parent.operatorToken.kind)) return true;
      if (ts.isBinaryExpression(parent) && parent.operatorToken.kind === ts.SyntaxKind.EqualsToken && /cookie$/i.test(parent.left.getText(sf))) return true;
      if (ts.isCaseClause(parent)) return true;
      if (ts.isElementAccessExpression(parent)) return true;
      if (ts.isExpressionStatement(parent) && ts.isStringLiteral(parent.expression)) return true; // "use client"
      if (ts.isJsxElement(parent) || ts.isJsxSelfClosingElement(parent) || ts.isFunctionLike(parent)) break;
    }
    return false;
  };

  const visit = (node) => {
    if (ts.isJsxText(node)) {
      const value = node.getText(sf);
      // HTML entities (&ldquo; &amp;) are punctuation, not words.
      if (/\p{L}/u.test(value.replace(/&[a-z]+;/gi, ""))) report(node, "jsx-text", value);
    } else if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      const value = node.text;
      if (!isExempt(node)) {
        const inTextAttribute = (() => {
          for (let p = node.parent; p; p = p.parent) {
            if (ts.isJsxAttribute(p)) return TEXT_ATTRIBUTES.has(p.name.getText(sf));
            if (ts.isJsxElement(p) || ts.isFunctionLike(p)) return false;
          }
          return false;
        })();
        if (inTextAttribute ? /\p{L}{2,}/u.test(value) : looksLikeProse(value)) {
          report(node, inTextAttribute ? "text-attribute" : "string-literal", value);
        }
      }
    } else if (ts.isTemplateExpression(node)) {
      const value = node.head.text + node.templateSpans.map((s) => " … " + s.literal.text).join("");
      if (!isExempt(node) && looksLikeProse(value.replace(/…/g, ""))) report(node, "template-literal", value);
      return; // the spans' expressions are code
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return findings;
}

const hardcoded = new Map();
if (!ts) {
  out("WARN   typescript is not installed: hard-coded text scan skipped");
} else {
  for (const dir of SCAN_DIRS) {
    for (const file of walkFiles(dir)) {
      const findings = scanFile(file);
      if (findings.length) hardcoded.set(path.relative(ROOT, file).split(path.sep).join("/"), findings);
    }
  }
}
for (const [file, findings] of [...hardcoded].sort()) {
  counts.hardcoded += findings.length;
  warnings += findings.length;
  if (QUIET) continue;
  out(`HARD-CODED  ${file} (${findings.length})`);
  for (const f of findings) out(`    ${String(f.line).padStart(4)}  ${f.kind.padEnd(16)} "${f.value.slice(0, 90)}${f.value.length > 90 ? "…" : ""}"`);
}

// ---------------------------------------------------------------- summary

out();
out(`i18n check: ${counts.keys} ${SOURCE} keys across ${source.size} namespaces, locales ${[SOURCE, ...TARGETS].join(", ")}`);
out(`  key parity errors:        ${counts.parity}`);
out(`  ICU placeholder errors:   ${counts.placeholders}`);
out(`  possibly untranslated:    ${counts.identical}${STRICT ? "" : " (report only; fails with --strict)"}`);
out(`  hard-coded text:          ${counts.hardcoded} in ${hardcoded.size} files${STRICT ? "" : " (report only; fails with --strict)"}`);
if (hardcoded.size && QUIET) {
  for (const [file, findings] of [...hardcoded].sort()) out(`    ${String(findings.length).padStart(4)}  ${file}`);
}
console.log(lines.join("\n"));

const failed = errors > 0 || (STRICT && warnings > 0);
process.exit(failed ? 1 : 0);
