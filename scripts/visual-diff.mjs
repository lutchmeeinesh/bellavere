/**
 * Compares two folders of screenshots with the same file names (e.g. the
 * output of scripts/visual-snapshot.mjs before and after a change) and
 * prints, per file, the share of pixels that differ.
 *
 * Usage:
 *   node scripts/visual-diff.mjs <beforeDir> <afterDir> [options]
 *
 * Options:
 *   --ignore-top=<px>   ignore a band of this height at the top of every
 *                       image (e.g. 72 for the fixed site header)
 *   --threshold=<pct>   fail (exit 1) when a file differs by more than this
 *                       percentage of its pixels (default 0.5)
 *   --tolerance=<0-255> per-channel difference still counted as equal, for
 *                       anti-aliasing and image-decoding noise (default 24)
 *   --out=<dir>         also write a diff image per changed file (changed
 *                       pixels in red over a faded copy of the "after" image)
 *
 * Images of different heights (full-page screenshots of a page that grew or
 * shrank) are compared over their common area; every row present in only
 * one of them counts as different. Files present in only one folder are
 * listed and count as failures.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const args = process.argv.slice(2);
const positional = args.filter((arg) => !arg.startsWith("--"));
const option = (name, fallback) => {
  const found = args.find((arg) => arg.startsWith(`--${name}=`));
  return found ? found.slice(name.length + 3) : fallback;
};

const [BEFORE, AFTER] = positional;
if (!BEFORE || !AFTER) {
  console.error("Usage: node scripts/visual-diff.mjs <beforeDir> <afterDir> [--ignore-top=px] [--threshold=pct] [--tolerance=0-255] [--out=dir]");
  process.exit(2);
}
const IGNORE_TOP = Number(option("ignore-top", "0"));
const THRESHOLD = Number(option("threshold", "0.5"));
const TOLERANCE = Number(option("tolerance", "24"));
const OUT = option("out", "");
if (OUT) fs.mkdirSync(OUT, { recursive: true });

const images = (dir) =>
  new Set(fs.readdirSync(dir).filter((file) => /\.(png|jpe?g|webp)$/i.test(file)));
const before = images(BEFORE);
const after = images(AFTER);
const names = [...new Set([...before, ...after])].sort();

async function raw(file) {
  const { data, info } = await sharp(file)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

let failures = 0;
const rows = [];
for (const name of names) {
  if (!before.has(name) || !after.has(name)) {
    failures++;
    rows.push({ name, note: before.has(name) ? "missing in after" : "new in after" });
    continue;
  }
  const a = await raw(path.join(BEFORE, name));
  const b = await raw(path.join(AFTER, name));
  const width = Math.max(a.width, b.width);
  const height = Math.max(a.height, b.height);
  const commonW = Math.min(a.width, b.width);
  const commonH = Math.min(a.height, b.height);
  const top = Math.min(IGNORE_TOP, height);

  let differing = 0;
  // First and last changed rows, to locate the change on the page.
  let firstRow = -1;
  let lastRow = -1;
  const mask = OUT ? new Uint8Array(width * height) : null;
  for (let y = top; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let same = false;
      if (x < commonW && y < commonH) {
        const i = (y * a.width + x) * 4;
        const j = (y * b.width + x) * 4;
        same =
          Math.abs(a.data[i] - b.data[j]) <= TOLERANCE &&
          Math.abs(a.data[i + 1] - b.data[j + 1]) <= TOLERANCE &&
          Math.abs(a.data[i + 2] - b.data[j + 2]) <= TOLERANCE &&
          Math.abs(a.data[i + 3] - b.data[j + 3]) <= TOLERANCE;
      }
      if (!same) {
        differing++;
        if (firstRow < 0) firstRow = y;
        lastRow = y;
        if (mask) mask[y * width + x] = 1;
      }
    }
  }
  const compared = width * (height - top);
  const share = compared > 0 ? (differing / compared) * 100 : 0;
  const failed = share > THRESHOLD;
  if (failed) failures++;

  rows.push({
    name,
    share,
    failed,
    size: `${a.width}x${a.height}${a.width === b.width && a.height === b.height ? "" : ` -> ${b.width}x${b.height}`}`,
    rowsChanged: differing ? `changed rows ${firstRow}-${lastRow}` : "",
  });

  if (OUT && differing) {
    const overlay = Buffer.alloc(width * height * 4);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const o = (y * width + x) * 4;
        if (mask[y * width + x]) {
          overlay[o] = 220; overlay[o + 1] = 30; overlay[o + 2] = 30; overlay[o + 3] = 255;
        } else if (x < b.width && y < b.height) {
          const i = (y * b.width + x) * 4;
          // faded copy of the "after" image
          overlay[o] = 255 - (255 - b.data[i]) * 0.25;
          overlay[o + 1] = 255 - (255 - b.data[i + 1]) * 0.25;
          overlay[o + 2] = 255 - (255 - b.data[i + 2]) * 0.25;
          overlay[o + 3] = 255;
        } else {
          overlay[o + 3] = 255;
        }
      }
    }
    await sharp(overlay, { raw: { width, height, channels: 4 } })
      .png()
      .toFile(path.join(OUT, name.replace(/\.\w+$/, ".diff.png")));
  }
}

const pad = Math.max(...rows.map((row) => row.name.length), 4);
console.log(
  `Visual diff: ${BEFORE} -> ${AFTER}` +
    (IGNORE_TOP ? `, top ${IGNORE_TOP}px ignored` : "") +
    `, tolerance ${TOLERANCE}, threshold ${THRESHOLD}%`,
);
for (const row of rows) {
  if (row.note) {
    console.log(`  FAIL  ${row.name.padEnd(pad)}  ${row.note}`);
  } else {
    console.log(
      `  ${row.failed ? "FAIL" : "ok  "}  ${row.name.padEnd(pad)}  ${row.share.toFixed(3).padStart(8)}% differing  ${row.size}  ${row.rowsChanged}`,
    );
  }
}
console.log(failures ? `${failures} file(s) over the threshold or unmatched` : "All files within the threshold");
process.exit(failures ? 1 : 0);
