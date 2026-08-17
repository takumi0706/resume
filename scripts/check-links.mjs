/**
 * ビルド成果物の内部リンク検査。
 *
 * なぜ自前で書くか:
 *   Astro は VitePress と違ってビルド時のデッドリンク検査を持たない。
 *   参考にした shunsock/resume はこの検査を PR の必須チェックにしていた。
 *   ページを増やすほどリンク切れの危険が増えるので、同じ仕組みを用意する。
 *
 * 外部リンクは検査しない。ネットワークや相手先の都合で CI が落ちると
 * 「赤いのが普通」の状態になり、チェックが機能しなくなるため。
 * 外部リンクは別のワークフローで定期的に見る。
 *
 * 実行:
 *   pnpm run check:links   (dist/ が必要。先に pnpm build)
 */

import { readFile, readdir, access } from "node:fs/promises";
import { join, extname, dirname, resolve } from "node:path";

const DIST = "dist";

/** dist 配下の .html を再帰的に集める。 */
async function* htmlFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* htmlFiles(path);
    } else if (extname(entry.name) === ".html") {
      yield path;
    }
  }
}

const exists = async (path) => {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
};

/** href をディスク上の候補パスに変換する。どれか1つ存在すれば OK。 */
function candidatesFor(pathname) {
  const trimmed = pathname.replace(/^\/+/, "");
  if (trimmed === "") return [join(DIST, "index.html")];

  // 拡張子が付いていればそのファイルそのもの
  if (extname(trimmed) !== "") return [join(DIST, trimmed)];

  // 拡張子なしはディレクトリ形式とファイル形式の両方を許す。
  // 末尾スラッシュ付き（/community/）はディレクトリ形式しかありえない。
  const candidates = [join(DIST, trimmed, "index.html")];
  if (!trimmed.endsWith("/")) candidates.push(join(DIST, `${trimmed}.html`));
  return candidates;
}

/** ページ内に id / name が存在するか。 */
function hasAnchor(html, anchor) {
  const escaped = anchor.replace(/["\\]/g, "\\$&");
  return (
    html.includes(`id="${escaped}"`) ||
    html.includes(`id='${escaped}'`) ||
    html.includes(`name="${escaped}"`)
  );
}

async function main() {
  if (!(await exists(DIST))) {
    console.error(`${DIST}/ が見つかりません。先に pnpm build を実行してください。`);
    process.exit(1);
  }

  const failures = [];
  let checked = 0;
  let pages = 0;
  let cards = 0;

  for await (const file of htmlFiles(DIST)) {
    pages += 1;
    const html = await readFile(file, "utf8");
    const hrefs = [...html.matchAll(/\shref="([^"]*)"/g)].map((match) => match[1]);

    // og:image は scripts/build-og.mjs の生成物を指す。
    // ファイル名の規則を Base.astro と build-og.mjs の2箇所で持っているので、
    // ずれると SNS 側でだけ画像が出なくなる。ここで検出する。
    const card = html.match(/<meta property="og:image" content="([^"]*)"/);
    if (card) {
      cards += 1;
      const url = card[1];
      const pathname = /^https?:/.test(url) ? new URL(url).pathname : url;
      if (!(await exists(join(DIST, pathname.replace(/^\/+/, ""))))) {
        failures.push({ file, href: url, reason: "og:image の画像が生成されていません" });
      }
    } else {
      failures.push({ file, href: "(なし)", reason: "og:image がありません" });
    }

    for (const href of hrefs) {
      // 外部・プロトコル指定・データURIは対象外
      if (/^(https?:|mailto:|tel:|data:|\/\/)/.test(href)) continue;
      if (href === "") continue;

      checked += 1;

      // 同一ページ内アンカー
      if (href.startsWith("#")) {
        const anchor = decodeURIComponent(href.slice(1));
        if (anchor !== "" && !hasAnchor(html, anchor)) {
          failures.push({ file, href, reason: `ページ内に id="${anchor}" がありません` });
        }
        continue;
      }

      // 相対リンクはビルド後に解決済みのはずだが、念のため対応する
      const [rawPath, anchor] = href.split("#");
      const pathname = rawPath.startsWith("/")
        ? rawPath
        : `/${resolve(dirname(file), rawPath).replace(`${resolve(DIST)}/`, "")}`;

      const targets = candidatesFor(decodeURIComponent(pathname));
      const found = [];
      for (const target of targets) {
        if (await exists(target)) found.push(target);
      }

      if (found.length === 0) {
        failures.push({
          file,
          href,
          reason: `リンク先が存在しません（探した場所: ${targets.join(" / ")}）`,
        });
        continue;
      }

      if (anchor !== undefined && anchor !== "") {
        const targetHtml = await readFile(found[0], "utf8");
        if (!hasAnchor(targetHtml, decodeURIComponent(anchor))) {
          failures.push({
            file,
            href,
            reason: `リンク先に id="${anchor}" がありません`,
          });
        }
      }
    }
  }

  console.log(`内部リンク検査: ${pages} ページ / ${checked} リンク / OGP ${cards} 枚`);

  if (failures.length > 0) {
    console.error(`\n${failures.length} 件の不備:\n`);
    for (const failure of failures) {
      console.error(`  ${failure.file}`);
      console.error(`    href="${failure.href}"`);
      console.error(`    ${failure.reason}\n`);
    }
    process.exit(1);
  }

  console.log("リンク切れなし・OGP 欠落なし");
}

await main();
