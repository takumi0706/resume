/**
 * Zenn の記事一覧を取得して src/data/zenn.json に書き出す。
 *
 * なぜビルド時に直接叩かないか:
 *   Zenn の記事一覧 API は非公式で、仕様変更も障害もこちらから制御できない。
 *   ビルドが外部サービスに依存すると、記事と無関係な変更の CI まで落ちる。
 *   生成物をコミットしておけば、ビルドは常にオフラインで完結する。
 *
 * 記事を書いたら実行する:
 *   pnpm run zenn
 */

import { writeFile, mkdir } from "node:fs/promises";

const USERNAME = "takumi0706";
const ENDPOINT = `https://zenn.dev/api/articles?username=${USERNAME}&order=latest&count=100`;
const OUT_PATH = "src/data/zenn.json";

async function main() {
  const response = await fetch(ENDPOINT, {
    headers: { "User-Agent": `${USERNAME}-portfolio-build` },
  });

  if (!response.ok) {
    console.error(`Zenn の取得に失敗しました: HTTP ${response.status}`);
    console.error("既存の src/data/zenn.json は変更していません。");
    process.exit(1);
  }

  const payload = await response.json();
  const articles = Array.isArray(payload.articles) ? payload.articles : [];

  if (articles.length === 0) {
    console.error("記事が0件でした。API の仕様が変わった可能性があります。");
    console.error("既存の src/data/zenn.json は変更していません。");
    process.exit(1);
  }

  // サイトで使う項目だけに絞る。将来 API が余計な項目を増やしても影響を受けない。
  const trimmed = articles
    .map((article) => ({
      id: article.slug,
      title: article.title,
      url: `https://zenn.dev/${USERNAME}/articles/${article.slug}`,
      publishedAt: article.published_at.slice(0, 10),
      likes: article.liked_count,
      // tech = 技術記事 / idea = アイデア記事。Zenn の区分をそのまま持つ。
      type: article.article_type,
    }))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

  await mkdir("src/data", { recursive: true });
  await writeFile(OUT_PATH, `${JSON.stringify(trimmed, null, 2)}\n`);

  const totalLikes = trimmed.reduce((sum, article) => sum + article.likes, 0);
  console.log(`Zenn: ${trimmed.length} 記事 / 合計 ${totalLikes} いいね → ${OUT_PATH}`);
}

await main();
