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

/**
 * LinkedIn。カスタム URL に変更後に有効化する。
 *
 * 自動生成の URL（/in/卓生-小山田-915745351）は日本語がパーセントエンコード
 * されて読めないので、設定でカスタム URL にしてから載せる。
 */
export const linkedin: Link | null = null;

/** フッターに並べる外部プロフィール。 */
export const elsewhere: Link[] = [github, x, zenn, linkedin].filter(
  (link): link is Link => link !== null,
);

/**
 * 連絡先はページごとに出し分ける。相手が居る場所が違うため。
 *
 * - formal: 採用・正式な打診。採用担当は LinkedIn に常時ログインしている。
 *   LinkedIn はログアウト状態だと認証壁に飛ぶが、この読者には影響しない。
 * - community: カンファレンス運営者からの声かけ。この層は LinkedIn に居ない。
 *   ここを LinkedIn にすると誰からも声がかからなくなる。
 */
export const formalContact: Link = linkedin ?? x;
export const communityContact: Link = x;
