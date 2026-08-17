/**
 * ロケールの定義とパスの組み立て。
 *
 * 日本語が既定で、接頭辞を付けない（`/resume/`）。
 * 英語は `/en/` を付ける（`/en/resume/`）。
 *
 * なぜ日本語に接頭辞を付けないか:
 *   既に公開済みで、`/resume/` を `/ja/resume/` に動かすと外部からのリンクが切れる。
 *   主たる読み手も国内なので、既定側を素のパスに置くほうが自然。
 */

export type Locale = "ja" | "en";

export const locales: Locale[] = ["ja", "en"];
export const defaultLocale: Locale = "ja";

/** <html lang> と og:locale に出す値。 */
export const htmlLang: Record<Locale, string> = { ja: "ja", en: "en" };
export const ogLocale: Record<Locale, string> = { ja: "ja_JP", en: "en_US" };

/** 言語切替えに出すラベル。相手の言語で書く（英語ページには「日本語」と出す）。 */
export const localeLabel: Record<Locale, string> = { ja: "日本語", en: "English" };

/**
 * ロケールなしのパス（`/resume/`）を、そのロケールのパスにする。
 * 引数は必ず先頭と末尾にスラッシュを持つ形で渡す。
 */
export function localePath(locale: Locale, path: string): string {
  return locale === defaultLocale ? path : `/${locale}${path}`;
}

/**
 * 実際の URL のパスからロケールと、ロケールなしのパスを取り出す。
 * `/en/resume/` → `{ locale: "en", path: "/resume/" }`
 */
export function splitLocale(pathname: string): { locale: Locale; path: string } {
  for (const locale of locales) {
    if (locale === defaultLocale) continue;
    if (pathname === `/${locale}` || pathname === `/${locale}/`) {
      return { locale, path: "/" };
    }
    if (pathname.startsWith(`/${locale}/`)) {
      return { locale, path: pathname.slice(locale.length + 1) };
    }
  }
  return { locale: defaultLocale, path: pathname };
}
