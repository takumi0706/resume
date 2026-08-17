/**
 * 日付の整形。
 *
 * Date に変換しない。`2025-05` を Date にするとタイムゾーンのぶんだけ前後し、
 * 月がひとつずれる事故が起きる。文字列のまま切って組み立てる。
 *
 * 英語は月名を出す。数字だけの `2025/05` は米国式（月/日）と読み違えられる。
 */

import type { Locale } from "@i18n/config";

const monthNames: string[] = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/**
 * 英語ページに和文が残る箇所へ付ける lang 属性を返す。
 *
 * 意図的に訳さない和文がある（氏名の原語表記、日本語で書かれた Zenn の記事題、
 * 公式のローマ字表記が無いプロダクト名）。無標のまま lang="en" の文書に置くと、
 * 読み上げが英語として発音される。
 *
 * 日本語ページでは undefined を返す。文書全体が既に ja なので付ける必要がない。
 */
export function cjkLang(locale: Locale, text: string): "ja" | undefined {
  return locale !== "ja" && /[぀-ヿ㐀-鿿]/.test(text) ? "ja" : undefined;
}

/** `2025-05` → 「2025年5月」/ "May 2025"。 */
export function yearMonth(locale: Locale, value: string): string {
  const [year, month] = value.split("-");
  const index = Number(month) - 1;
  if (locale === "ja") return `${year}年${Number(month)}月`;
  return `${monthNames[index] ?? month} ${year}`;
}

/** `2026-10-11` → 「2026年10月11日」/ "11 October 2026"。 */
export function fullDate(locale: Locale, value: string): string {
  const [year, month, day] = value.split("-");
  const index = Number(month) - 1;
  if (locale === "ja") return `${year}年${Number(month)}月${Number(day)}日`;
  return `${Number(day)} ${monthNames[index] ?? month} ${year}`;
}

/** `2026-02-11` → 「2/11」/ "Feb 11"。目録の行頭に置く短い形。 */
export function shortDate(locale: Locale, value: string): string {
  const [, month, day] = value.split("-");
  const index = Number(month) - 1;
  if (locale === "ja") return `${Number(month)}/${Number(day)}`;
  return `${(monthNames[index] ?? month).slice(0, 3)} ${Number(day)}`;
}

/** 在籍期間。end が null なら「現在」/ "Present"。 */
export function period(
  locale: Locale,
  start: string,
  end: string | null,
  present: string,
): string {
  return `${yearMonth(locale, start)} — ${end === null ? present : yearMonth(locale, end)}`;
}
