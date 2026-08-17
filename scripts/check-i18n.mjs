/**
 * 対訳の抜けを検出する。
 *
 * なぜ必要か:
 *   訳が無いときはフォールバックで日本語がそのまま出る。壊れないのが利点だが、
 *   裏を返すと **英語ページだけが日本語のまま出ても気づけない**。
 *   日本語ページを見ている限り一生わからないので、機械で見る。
 *
 * 何を見るか:
 *   1. 日本語側のエントリに対応する src/content/en/ のファイルがあるか
 *   2. 訳すべき項目（title / summary / faculty / note ...）が埋まっているか
 *   3. 本文がある日本語エントリに、英語の本文があるか
 *   4. 会社名・学校名・会場名が src/i18n/names.ts の対訳表にあるか
 *   5. 英語ページに和文が残っていないか（dist がある場合）
 *
 * 意図的に訳さないもの:
 *   - Zenn の記事タイトル。日本語で書かれた記事なので題名は日本語のままが正しい
 *   - 「カオナマエ」のように公式のローマ字表記が無い固有名詞
 *   どちらも ALLOW_JAPANESE に理由付きで並べる。
 *
 * 実行:
 *   pnpm run check:i18n
 */

import { readFile, readdir, access } from "node:fs/promises";
import { join, extname } from "node:path";

const CONTENT = "src/content";
const EN = join(CONTENT, "en");
const NAMES = "src/i18n/names.ts";
const DIST = "dist";

/** 訳が必須の項目。ここに無い項目は日本語のままでよい（URL・日付など）。 */
const REQUIRED = {
  work: ["title"],
  education: ["faculty"],
  awards: ["event", "award"],
  oss: ["summary"],
};

/** 対訳表に載せる必要がある項目。値が固有名詞なので names.ts で引く。 */
const NAME_FIELDS = {
  work: ["company"],
  education: ["school"],
  community: ["venue"],
};

/**
 * 英語ページに残ってよい和文。すべて理由がある。
 * ここに無い和文が英語ページに出ていたら訳し漏れ。
 *
 * Zenn の記事タイトルはここに書かない。記事が増えるたびに書き足すことになり、
 * 忘れた瞬間に検査が赤くなる。src/data/zenn.json から機械的に集める。
 */
const ALLOW_JAPANESE = [
  // 本人の氏名。英語の履歴書でも原語表記を併記するのは普通のこと。
  "小山田 卓生",
  // 公式のローマ字表記が無いプロダクト名。英語本文でも原語＋読みで出す。
  "カオナマエ",
  // 言語切替えのラベル。英語ページに「日本語」と出るのが正しい。
  "日本語",
];

const has = async (path) => {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
};

/** frontmatter を雑に読む。キーと値が1行のものだけ見れば足りる。 */
function frontmatter(source) {
  const match = source.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return { data: {}, body: source.trim() };
  const data = {};
  for (const line of match[1].split("\n")) {
    const pair = line.match(/^([A-Za-z][\w]*):\s*(.*)$/);
    if (pair) data[pair[1]] = pair[2].trim();
  }
  return { data, body: source.slice(match[0].length).trim() };
}

async function collectionsOf(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory() && entry.name !== "en" && entry.name !== "prose")
    .map((entry) => entry.name);
}

/**
 * Zenn の記事タイトル。日本語で書かれた記事なので、英語ページでも題名は日本語のまま出す。
 * 訳すと元の記事が引けなくなる。
 */
async function zennTitles() {
  const raw = await readFile("src/data/zenn.json", "utf8");
  const items = JSON.parse(raw);
  return items.map((item) => item.title);
}

async function main() {
  const problems = [];
  const names = await readFile(NAMES, "utf8");
  const articles = await zennTitles();

  for (const collection of await collectionsOf(CONTENT)) {
    const dir = join(CONTENT, collection);
    const files = (await readdir(dir)).filter((name) => extname(name) === ".md");

    for (const file of files) {
      const id = file.replace(/\.md$/, "");
      const source = await readFile(join(dir, file), "utf8");
      const ja = frontmatter(source);
      const enPath = join(EN, collection, file);

      // 4. 固有名詞が対訳表にあるか
      for (const field of NAME_FIELDS[collection] ?? []) {
        const value = ja.data[field];
        if (value && /[　-ヿ一-鿿]/.test(value) && !names.includes(value)) {
          problems.push(`${collection}/${id}: ${field} 「${value}」が names.ts の対訳表にない`);
        }
      }

      // usedIn は会社名と記事タイトルが混ざる。会社名なら対訳表に、
      // 記事タイトルなら Zenn 側に、必ずどちらかに存在していなければならない。
      // どちらでもない和文は、訳し忘れた固有名詞。
      if (collection === "skills") {
        for (const line of source.split("\n")) {
          const item = line.match(/^\s*-\s+(.*\S)\s*$/);
          if (!item) continue;
          const value = item[1];
          if (!/[　-ヿ一-鿿]/.test(value)) continue;
          if (names.includes(value) || articles.includes(value)) continue;
          problems.push(
            `${collection}/${id}: usedIn 「${value}」が names.ts にも Zenn の記事にも無い`,
          );
        }
      }

      const required = REQUIRED[collection] ?? [];
      const needsAny = required.some((field) => ja.data[field]) || ja.body.length > 0;
      if (!needsAny) continue;

      // 1. 対応する英語ファイルがあるか
      if (!(await has(enPath))) {
        problems.push(`${collection}/${id}: ${enPath} が無い`);
        continue;
      }

      const en = frontmatter(await readFile(enPath, "utf8"));

      // 2. 訳すべき項目が埋まっているか
      for (const field of required) {
        if (ja.data[field] && !en.data[field]) {
          problems.push(`${collection}/${id}: ${field} の訳が無い`);
        }
      }

      // 3. 本文の訳があるか
      if (ja.body.length > 0 && en.body.length === 0) {
        problems.push(`${collection}/${id}: 本文の訳が無い`);
      }
    }
  }

  // 5. 英語ページに和文が残っていないか
  if (await has(DIST)) {
    for (const page of await enPages(join(DIST, "en"))) {
      const html = await readFile(page, "utf8");
      const body = html
        .slice(html.indexOf("<body"), html.lastIndexOf("</body>"))
        .replace(/<(script|style)[\s\S]*?<\/\1>/g, "")
        .replace(/<[^>]+>/g, " ");
      let stripped = body;
      for (const allowed of [...ALLOW_JAPANESE, ...articles]) {
        stripped = stripped.split(allowed).join("");
      }
      const leaked = stripped.match(/[぀-ヿ一-鿿]+/g);
      if (leaked) {
        const unique = [...new Set(leaked)].slice(0, 6);
        problems.push(`${page}: 英語ページに和文が残っている（${unique.join(" / ")}）`);
      }
    }
  }

  const label = (await has(DIST)) ? "（dist も検査）" : "（dist が無いのでページ検査は省略）";
  console.log(`対訳検査${label}`);

  if (problems.length > 0) {
    console.error(`\n${problems.length} 件の訳し漏れ:\n`);
    for (const problem of problems) console.error(`  ${problem}`);
    process.exit(1);
  }
  console.log("訳し漏れなし");
}

async function enPages(dir) {
  const found = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...(await enPages(path)));
    else if (extname(entry.name) === ".html") found.push(path);
  }
  return found;
}

await main();
