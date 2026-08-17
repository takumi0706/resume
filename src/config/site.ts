/**
 * サイト内リンクと外部プロフィールの唯一の情報源。
 *
 * URL をページに直書きすると、増えたとき・変わったときに必ず漏れる。
 * 追加・変更はこのファイルだけで完結させる。
 */

import type { SectionKey } from "@i18n/ui";

export interface Link {
  label: string;
  href: string;
  /** 外部リンクは rel を付ける。self 参照のプロフィールは me も付ける。 */
  rel?: string;
  /**
   * simple-icons のスラッグ。無い場合はテキストのみで表示する。
   * LinkedIn は第三者によるロゴ使用に事前承認を求めており、
   * simple-icons も収録していないため付けられない。
   */
  icon?: string;
}

/**
 * サイト内のセクション。サイドレールとフッターの目次に使う。
 *
 * ラベルはここに持たない。言語ごとに変わるので src/i18n/ui.ts の nav / navShort が持つ。
 * path も言語を含まない素の形で持ち、localePath() で /en/ を付ける。
 */
export interface Section {
  key: SectionKey;
  path: string;
}

export const sections: Section[] = [
  { key: "community", path: "/community/" },
  { key: "oss", path: "/oss/" },
  { key: "resume", path: "/resume/" },
  { key: "skill", path: "/skill/" },
  { key: "blog", path: "/blog/" },
];

export const github: Link = {
  label: "GitHub",
  href: "https://github.com/takumi0706",
  rel: "me noopener",
  icon: "github",
};

export const x: Link = {
  label: "X",
  href: "https://x.com/1ye_q",
  rel: "me noopener",
  icon: "x",
};

export const zenn: Link = {
  label: "Zenn",
  href: "https://zenn.dev/takumi0706",
  rel: "me noopener",
  icon: "zenn",
};

export const linkedin: Link = {
  label: "LinkedIn",
  // 末尾スラッシュ付きは 301 で落ちるので正規形で持つ。
  href: "https://www.linkedin.com/in/takumi-oyamada",
  rel: "me noopener",
};

/**
 * フッターに並べる外部プロフィール。
 * アイコンを持つものを先にまとめる。LinkedIn だけアイコンが無いため、
 * 途中に挟むとそこだけ抜けて見える。
 */
export const elsewhere: Link[] = [github, x, zenn, linkedin];

/**
 * 連絡先はページごとに出し分ける。相手が居る場所が違うため。
 *
 * - formal: 採用・正式な打診。採用担当は LinkedIn に常時ログインしている。
 *   LinkedIn はログアウト状態だと認証壁に飛ぶが、この読者には影響しない。
 * - community: カンファレンス運営者からの声かけ。この層は LinkedIn に居ない。
 *   ここを LinkedIn にすると誰からも声がかからなくなる。
 */
export const formalContact: Link = linkedin;
export const communityContact: Link = x;
