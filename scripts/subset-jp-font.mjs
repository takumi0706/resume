/**
 * 和文フォントのサブセット生成。
 *
 * なぜ必要か:
 *   @fontsource/ibm-plex-sans-jp をそのまま import すると、124 個の unicode-range
 *   サブセットが 1 ウェイトあたり 124 個の @font-face 宣言として CSS に展開される。
 *   2 ウェイトで 248 宣言 = CSS 343KB (gzip 165KB)。unicode-range の16進リストは
 *   高エントロピーなので gzip も効かない。フォント本体の遅延読み込みは効いていても、
 *   レンダリングをブロックする CSS がこの大きさでは意味がない。
 *
 * 何をするか:
 *   ソースから和文の文字を集め、その字だけを含む woff2 を書き出す。
 *   結果、@font-face はウェイトごとに 1 宣言で済む。
 *
 * 実行:
 *   pnpm run fonts   (build / dev の前に自動実行される)
 */

import { readFile, writeFile, readdir, mkdir } from "node:fs/promises";
import { join, extname } from "node:path";
import subsetFont from "subset-font";

const SRC_DIRS = ["src"];
const SCAN_EXTENSIONS = new Set([".astro", ".md", ".mdx", ".ts", ".json"]);
const OUT_DIR = "public/fonts";
const WEIGHTS = [400, 600];

const sourceFor = (weight) =>
  `node_modules/@fontsource/ibm-plex-sans-jp/files/ibm-plex-sans-jp-japanese-${weight}-normal.woff2`;

/**
 * 常に含める基本文字。
 * ひらがな・カタカナ・和文約物・全角英数は全域を入れておく。
 * これらは合計 300 字弱で、後からコンテンツを足しても字が欠けない保険になる。
 */
function baseCharacters() {
  const ranges = [
    [0x3000, 0x303f], // CJK の約物 (、。「」・〜 など)
    [0x3041, 0x309f], // ひらがな
    [0x30a0, 0x30ff], // カタカナ
    [0xff01, 0xff5e], // 全角英数・記号
    [0xffe0, 0xffe6], // 全角通貨記号
  ];
  let out = "";
  for (const [start, end] of ranges) {
    for (let code = start; code <= end; code += 1) {
      out += String.fromCodePoint(code);
    }
  }
  return out;
}

/** ソースから和文の文字を集める。欧文は Geist が担当するので対象外。 */
function isJapanese(codePoint) {
  return (
    (codePoint >= 0x3000 && codePoint <= 0x30ff) || // 約物・かな
    (codePoint >= 0x3400 && codePoint <= 0x4dbf) || // CJK 拡張A
    (codePoint >= 0x4e00 && codePoint <= 0x9fff) || // CJK 統合漢字
    (codePoint >= 0xf900 && codePoint <= 0xfaff) || // CJK 互換漢字
    (codePoint >= 0xff00 && codePoint <= 0xffef) // 全角形
  );
}

async function* walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(path);
    } else if (SCAN_EXTENSIONS.has(extname(entry.name))) {
      yield path;
    }
  }
}

async function collectCharacters() {
  const found = new Set(baseCharacters());
  for (const dir of SRC_DIRS) {
    for await (const path of walk(dir)) {
      const text = await readFile(path, "utf8");
      for (const char of text) {
        const codePoint = char.codePointAt(0);
        if (codePoint !== undefined && isJapanese(codePoint)) {
          found.add(char);
        }
      }
    }
  }
  return [...found].join("");
}

async function main() {
  const characters = await collectCharacters();
  await mkdir(OUT_DIR, { recursive: true });

  const report = [];
  for (const weight of WEIGHTS) {
    const source = await readFile(sourceFor(weight));
    const subset = await subsetFont(source, characters, {
      targetFormat: "woff2",
    });
    const outPath = join(OUT_DIR, `ibm-plex-sans-jp-${weight}-subset.woff2`);
    await writeFile(outPath, subset);
    report.push({
      weight,
      before: `${Math.round(source.length / 1024)} KB`,
      after: `${Math.round(subset.length / 1024)} KB`,
    });
  }

  const glyphCount = [...characters].length;
  console.log(`和文サブセット生成: ${glyphCount} 字`);
  for (const row of report) {
    console.log(`  weight ${row.weight}: ${row.before} → ${row.after}`);
  }
}

await main();
