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
 *   1. ソースから和文の文字を集め、その字だけを含む woff2 を書き出す
 *   2. ウェイトごとに必要な字だけを焼く（後述）
 *   3. 内容のハッシュをファイル名に入れ、長期キャッシュを安全に張れるようにする
 *   4. @font-face の CSS と、preload 用のパス一覧を生成する
 *
 * ウェイトを分ける理由:
 *   weight 400 は本文なので全部の字が要る。weight 600 は見出し専用で、
 *   外部から取り込んだ記事タイトル（src/data/*.json）は本文にしか出ない。
 *   同じ字数を両方に焼くと、600 側に使われない字が数百字乗る。
 *
 * 実行:
 *   pnpm run fonts   (dev / build / check の前に自動実行される)
 */

import { readFile, writeFile, readdir, mkdir, rm } from "node:fs/promises";
import { createHash } from "node:crypto";
import { join, extname, relative, sep } from "node:path";
import subsetFont from "subset-font";

const SRC_DIR = "src";
const SCAN_EXTENSIONS = new Set([".astro", ".md", ".mdx", ".ts", ".json"]);
const OUT_DIR = "public/fonts";
const CSS_PATH = "src/styles/fonts.css";
const MANIFEST_PATH = "src/data/fonts.json";

/**
 * ウェイトごとの設定。
 * excludeDirs に入れたディレクトリは、そのウェイトの字集めから外す。
 */
const WEIGHTS = [
  { weight: 400, excludeDirs: [] },
  // 見出し用。外部記事のタイトルは本文にしか出ないので除く。
  { weight: 600, excludeDirs: [join("src", "data")] },
];

const sourceFor = (weight) =>
  `node_modules/@fontsource/ibm-plex-sans-jp/files/ibm-plex-sans-jp-japanese-${weight}-normal.woff2`;

/**
 * 常に含める基本文字。
 * ひらがな・カタカナ・和文約物・全角英数は全域を入れておく。
 * 合計 300 字弱で、コンテンツを足しても字が欠けない保険になる。
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

const isInside = (path, dir) =>
  path === dir || path.startsWith(dir + sep) || relative(dir, path).startsWith("..") === false;

/**
 * コメントを落とす。
 *
 * このリポジトリのコメントは日本語で大量に書かれているが、画面には出ない。
 * 落とさないと、描画されない漢字がフォントに焼かれる。
 *
 * 行まるごとがコメントの場合だけ落とす安全側の実装にしている。
 * 行の途中の `//` を切ると、URL の後ろに続く実データを巻き込む危険がある。
 */
function stripComments(text) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split("\n")
    .filter((line) => !/^\s*(\/\/|\*|<!--)/.test(line))
    .join("\n");
}

async function collectCharacters(excludeDirs) {
  const found = new Set(baseCharacters());
  for await (const path of walk(SRC_DIR)) {
    if (excludeDirs.some((dir) => isInside(path, dir))) continue;
    const raw = await readFile(path, "utf8");
    const text = extname(path) === ".json" ? raw : stripComments(raw);
    for (const char of text) {
      const codePoint = char.codePointAt(0);
      if (codePoint !== undefined && isJapanese(codePoint)) {
        found.add(char);
      }
    }
  }
  return [...found].join("");
}

async function main() {
  // 古いハッシュ付きファイルが残らないよう作り直す。
  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });
  await mkdir("src/data", { recursive: true });

  const manifest = {};
  const faces = [];
  const report = [];

  for (const { weight, excludeDirs } of WEIGHTS) {
    const characters = await collectCharacters(excludeDirs);
    const source = await readFile(sourceFor(weight));
    const subset = await subsetFont(source, characters, { targetFormat: "woff2" });

    // 内容のハッシュをファイル名に入れる。中身が変われば URL も変わるので、
    // Cache-Control: immutable を安全に付けられる。
    const hash = createHash("sha256").update(subset).digest("hex").slice(0, 8);
    const fileName = `ibm-plex-sans-jp-${weight}-${hash}.woff2`;
    await writeFile(join(OUT_DIR, fileName), subset);

    const url = `/fonts/${fileName}`;
    manifest[weight] = url;
    faces.push(`@font-face {
  font-family: "IBM Plex Sans JP";
  font-style: normal;
  font-weight: ${weight};
  font-display: swap;
  src: url("${url}") format("woff2");
}`);

    report.push({
      weight,
      glyphs: [...characters].length,
      before: Math.round(source.length / 1024),
      after: Math.round(subset.length / 1024),
    });
  }

  await writeFile(
    CSS_PATH,
    `/* このファイルは scripts/subset-jp-font.mjs が生成する。直接編集しない。
 *
 * @fontsource/ibm-plex-sans-jp を直接 import しないのは、124 サブセット × 2 ウェイト =
 * 248 個の @font-face 宣言が CSS に展開され、レンダリングをブロックする CSS が
 * 343KB (gzip 165KB) になるため。
 *
 * 欧文グリフは Geist が持つので、この和文フォントは CJK のみを担当する。
 * ファイル名のハッシュは内容から作っているため、長期キャッシュを安全に張れる。 */

${faces.join("\n\n")}
`,
  );

  await writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);

  console.log("和文サブセット生成:");
  for (const row of report) {
    console.log(
      `  weight ${row.weight}: ${row.glyphs} 字 · ${row.before} KB → ${row.after} KB`,
    );
  }
}

await main();
