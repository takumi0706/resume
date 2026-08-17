/**
 * OGP 画像の生成。
 *
 * なぜ必要か:
 *   og:image に /icon.png（正方形のアバター）を出し、twitter:card も summary に
 *   していた。X や Slack に貼ると小さな正方形が出るだけで、誰の何のページなのかが
 *   カードから読めない。カンファレンス周りでリンクを共有する機会が多いので、
 *   ここは 1200x630 のカードにする価値がある。
 *
 * 何をするか:
 *   1. ビルド済みの dist/**\/index.html から <title> を読む
 *   2. tokens.css から色を読み、OKLCH を sRGB に変換する
 *   3. satori で SVG を組み、resvg で PNG に焼いて dist/og/ に置く
 *
 * ページ名を二重管理しない:
 *   カードの文言はページ自身の <title> から取る。ここに一覧を持つと、
 *   ページ名を変えたときにカードだけ古いままになる。
 *
 * 色をハードコードしない:
 *   tokens.css を読んで OKLCH から変換する。トークンを変えればカードも追随する。
 *   design.md の「色は名前付きトークン経由」をこの成果物にも通す。
 *
 * フォント:
 *   satori は woff2 を読めないので subset-font で sfnt に変換する。
 *   Geist は可変フォントなので variationAxes でウェイトをピン留めする
 *   （ピン留めしないと既定インスタンスで焼かれ、太字が効かない）。
 *
 * 実行:
 *   pnpm run og   (astro build のあとに自動実行される)
 */

import { readFile, writeFile, mkdir, rm, readdir } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import subsetFont from "subset-font";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

const DIST_DIR = "dist";
const OUT_DIR = join(DIST_DIR, "og");
const TOKENS_PATH = "src/styles/tokens.css";

const WIDTH = 1200;
const HEIGHT = 630;

/** ページ名に出ない、カードの固定文言。 */
const ROLE = "サーバーサイドエンジニア";
const HANDLE = "takumi0706";
const NAME_JA = "小山田 卓生";
const NAME_LATIN = "Takumi Oyamada";

/* ---------------------------------------------------------------------------
 * 色 — tokens.css の OKLCH を sRGB に変換する
 * ------------------------------------------------------------------------ */

/**
 * tokens.css の :root から custom property を読む。
 * ダークモードのブロックは読まない。カードは常に light で焼く。
 */
async function readTokens(names) {
  const css = await readFile(TOKENS_PATH, "utf8");
  // 最初の :root { ... } だけを対象にする。以降は prefers-color-scheme のブロック。
  const start = css.indexOf(":root");
  const end = css.indexOf("\n}", start);
  if (start === -1 || end === -1) {
    throw new Error(`${TOKENS_PATH} に :root ブロックが見つからない`);
  }
  const block = css.slice(start, end);

  const found = {};
  for (const name of names) {
    const match = block.match(new RegExp(`${name}:\\s*([^;]+);`));
    if (!match) throw new Error(`${TOKENS_PATH} に ${name} が無い`);
    found[name] = match[1].trim();
  }
  return found;
}

/** sRGB のガンマ補正。 */
const gamma = (value) =>
  value <= 0.0031308 ? 12.92 * value : 1.055 * Math.pow(value, 1 / 2.4) - 0.055;

/**
 * oklch(L% C H) を #rrggbb に変換する。
 * L は百分率でも小数でも受ける。
 */
function oklchToHex(value) {
  const match = value.match(
    /oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)\s*\)/i,
  );
  if (!match) throw new Error(`OKLCH として読めない: ${value}`);

  const lightness = match[2] === "%" ? Number(match[1]) / 100 : Number(match[1]);
  const chroma = Number(match[3]);
  const hue = (Number(match[4]) * Math.PI) / 180;

  const a = chroma * Math.cos(hue);
  const b = chroma * Math.sin(hue);

  // OKLab -> LMS
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;

  // LMS -> linear sRGB
  const linear = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];

  const hex = linear
    .map((channel) => Math.round(Math.min(1, Math.max(0, gamma(channel))) * 255))
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("");

  return `#${hex}`;
}

/* ---------------------------------------------------------------------------
 * ページの収集
 * ------------------------------------------------------------------------ */

/** dist の中の index.html を全部集める。 */
async function collectPages(dir = DIST_DIR) {
  const entries = await readdir(dir, { withFileTypes: true });
  const pages = [];

  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "og" || entry.name === "fonts") continue;
      pages.push(...(await collectPages(path)));
    } else if (entry.name === "index.html" || entry.name === "404.html") {
      pages.push(path);
    }
  }
  return pages;
}

/** dist からの相対パスを og のファイル名にする。"/" は index。 */
function slugFor(htmlPath) {
  const rel = relative(DIST_DIR, htmlPath);
  const dir = rel.split(sep).slice(0, -1).join("-");
  if (rel === "404.html") return "404";
  return dir === "" ? "index" : dir;
}

/**
 * ページの <title> からカードの文言を組む。
 * トップだけは欧文氏名を主役にする。他は「ページ名 — 氏名」の前半をページ名として使う。
 */
function cardFor(htmlPath, html) {
  const match = html.match(/<title>([^<]*)<\/title>/);
  const title = match ? match[1].trim() : "";
  const slug = slugFor(htmlPath);

  if (slug === "index") {
    return { slug, title: NAME_LATIN, subtitle: NAME_JA, footer: ROLE };
  }
  return {
    slug,
    title: title.split(" — ")[0],
    subtitle: "",
    footer: `${NAME_JA} — ${NAME_LATIN}`,
  };
}

/* ---------------------------------------------------------------------------
 * フォント
 * ------------------------------------------------------------------------ */

const FONT_SOURCES = {
  geist: "node_modules/@fontsource-variable/geist/files/geist-latin-wght-normal.woff2",
  geistMono:
    "node_modules/@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2",
  plex400:
    "node_modules/@fontsource/ibm-plex-sans-jp/files/ibm-plex-sans-jp-japanese-400-normal.woff2",
  plex600:
    "node_modules/@fontsource/ibm-plex-sans-jp/files/ibm-plex-sans-jp-japanese-600-normal.woff2",
};

/**
 * satori に渡すフォントを用意する。
 * カードに出る文字だけに絞ってから sfnt に変換する。全文字を焼くと数MBになり、
 * satori のパースがカードごとに走って遅い。
 */
async function loadFonts(text) {
  const read = (key) => readFile(FONT_SOURCES[key]);

  // Geist は可変フォント。ウェイトをピン留めしないと既定インスタンスで焼かれる。
  const [geist400, geist600, mono, plex400, plex600] = await Promise.all([
    read("geist").then((buf) =>
      subsetFont(buf, text, { targetFormat: "sfnt", variationAxes: { wght: 400 } }),
    ),
    read("geist").then((buf) =>
      subsetFont(buf, text, { targetFormat: "sfnt", variationAxes: { wght: 600 } }),
    ),
    read("geistMono").then((buf) =>
      subsetFont(buf, text, { targetFormat: "sfnt", variationAxes: { wght: 500 } }),
    ),
    read("plex400").then((buf) => subsetFont(buf, text, { targetFormat: "sfnt" })),
    read("plex600").then((buf) => subsetFont(buf, text, { targetFormat: "sfnt" })),
  ]);

  return [
    { name: "Geist", data: geist400, weight: 400, style: "normal" },
    { name: "Geist", data: geist600, weight: 600, style: "normal" },
    { name: "PlexJP", data: plex400, weight: 400, style: "normal" },
    { name: "PlexJP", data: plex600, weight: 600, style: "normal" },
    { name: "GeistMono", data: mono, weight: 500, style: "normal" },
  ];
}

/* ---------------------------------------------------------------------------
 * カードの組版
 * ------------------------------------------------------------------------ */

/**
 * satori に渡す要素を組む。
 * 和欧混植はサイト本体と同じ考え方で、欧文を先に置いて和文をフォールバックにする。
 */
function template(card, colors) {
  const body = "Geist, PlexJP";

  // 和文は字幅が約2倍あるので、欧文と同じ数値を当てると過大になる。
  // サイト本体の --text-display(84px) と --text-display-ja(44px) と同じ比率で落とす。
  // トラッキングも欧文の詰めをそのまま当てない。
  const cjk = /[぀-ヿ㐀-鿿]/.test(card.title);
  const titleSize = cjk ? 60 : 88;
  const titleTracking = cjk ? "-0.01em" : "-0.03em";

  const text = (content, style) => ({
    type: "div",
    props: { children: content, style },
  });

  const children = [
    // 上: ハンドル。サイトのレールと同じく mono で置く。
    text(HANDLE, {
      fontFamily: "GeistMono, PlexJP",
      fontWeight: 500,
      fontSize: 26,
      letterSpacing: "-0.01em",
      color: colors.muted,
    }),

    // 中: 主役。
    {
      type: "div",
      props: {
        style: { display: "flex", flexDirection: "column" },
        children: [
          text(card.title, {
            fontFamily: body,
            fontWeight: 600,
            fontSize: titleSize,
            letterSpacing: titleTracking,
            lineHeight: 1.1,
            color: colors.ink,
          }),
          ...(card.subtitle
            ? [
                text(card.subtitle, {
                  fontFamily: body,
                  fontWeight: 600,
                  fontSize: 40,
                  marginTop: 12,
                  color: colors.ink,
                }),
              ]
            : []),
        ],
      },
    },

    // 下: 太罫と添え書き。サイトのヒーロー直下の rule-thick に合わせる。
    {
      type: "div",
      props: {
        style: { display: "flex", flexDirection: "column" },
        children: [
          {
            type: "div",
            props: { style: { height: 3, backgroundColor: colors.ink }, children: "" },
          },
          text(card.footer, {
            fontFamily: body,
            fontSize: 28,
            marginTop: 22,
            color: colors.ink2,
          }),
        ],
      },
    },
  ];

  return {
    type: "div",
    props: {
      style: {
        width: WIDTH,
        height: HEIGHT,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        backgroundColor: colors.paper,
      },
      children,
    },
  };
}

/* ---------------------------------------------------------------------------
 * 実行
 * ------------------------------------------------------------------------ */

async function main() {
  const raw = await readTokens([
    "--color-paper",
    "--color-ink",
    "--color-ink-2",
    "--color-muted",
  ]);
  const colors = {
    paper: oklchToHex(raw["--color-paper"]),
    ink: oklchToHex(raw["--color-ink"]),
    ink2: oklchToHex(raw["--color-ink-2"]),
    muted: oklchToHex(raw["--color-muted"]),
  };

  const htmlPaths = await collectPages();
  const cards = await Promise.all(
    htmlPaths.map(async (path) => cardFor(path, await readFile(path, "utf8"))),
  );

  // カードに出る文字を全部集めてからサブセットする。
  const text = cards.map((c) => `${c.title}${c.subtitle}${c.footer}`).join("") + HANDLE;
  const fonts = await loadFonts(text);

  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });

  for (const card of cards) {
    const svg = await satori(template(card, colors), { width: WIDTH, height: HEIGHT, fonts });
    const png = new Resvg(svg, { fitTo: { mode: "width", value: WIDTH } })
      .render()
      .asPng();
    await writeFile(join(OUT_DIR, `${card.slug}.png`), png);
  }

  const total = cards.reduce((sum, card) => sum + card.title.length, 0);
  console.log(
    `OGP 画像: ${cards.length} 枚 (${WIDTH}x${HEIGHT}) → ${OUT_DIR}/  [見出し計 ${total} 字]`,
  );
}

await main();
