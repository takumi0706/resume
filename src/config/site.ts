/**
 * サイト内リンクと外部プロフィールの唯一の情報源。
 *
 * URL をページに直書きすると、増えたとき・変わったときに必ず漏れる。
 * 追加・変更はこのファイルだけで完結させる。
 */

export interface Link {
  label: string;
  href: string;
  /** 外部リンクは rel を付ける。self 参照のプロフィールは me も付ける。 */
  rel?: string;
}

/** サイト内のセクション。フッターの目次に使う。 */
export const sections: Link[] = [
  { label: "コミュニティ", href: "/community/" },
  { label: "OSS", href: "/oss/" },
  { label: "職務経歴書", href: "/resume/" },
  { label: "スキル", href: "/skill/" },
  { label: "執筆", href: "/blog/" },
];

export const github: Link = {
  label: "GitHub",
  href: "https://github.com/takumi0706",
  rel: "me noopener",
};

export const x: Link = {
  label: "X",
  href: "https://x.com/1ye_q",
  rel: "me noopener",
};

export const zenn: Link = {
  label: "Zenn",
  href: "https://zenn.dev/takumi0706",
  rel: "me noopener",
};

export const linkedin: Link = {
  label: "LinkedIn",
  // 末尾スラッシュ付きは 301 で落ちるので正規形で持つ。
  href: "https://www.linkedin.com/in/takumi-oyamada",
  rel: "me noopener",
};

/** フッターに並べる外部プロフィール。身元と成果物に近い順。 */
export const elsewhere: Link[] = [github, linkedin, x, zenn];

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
