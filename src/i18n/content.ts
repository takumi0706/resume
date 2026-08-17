/**
 * 英語の上書きを引く。
 *
 * `work/nagase.md` の訳は `work/nagase.en.md`。
 * translations コレクションの id は `work/nagase.en` なので、そこから引く。
 *
 * 日本語のときは常に空を返す。呼び出し側が
 * `t(...).title ?? entry.data.title` と書けば、言語で分岐せずに済む。
 */

import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";
import type { Locale } from "@i18n/config";

type TranslationEntry = CollectionEntry<"translations">;
type TranslationData = TranslationEntry["data"];

export interface Translations {
  /** 訳の項目を引く。無ければ空。 */
  data: (collection: string, id: string) => TranslationData;
  /** 訳の本文を引く。本文の描画に使う。無ければ undefined。 */
  entry: (collection: string, id: string) => TranslationEntry | undefined;
}

const empty: TranslationData = {};

export async function loadTranslations(locale: Locale): Promise<Translations> {
  if (locale === "ja") {
    return { data: () => empty, entry: () => undefined };
  }

  const entries = await getCollection("translations");
  const map = new Map(entries.map((entry) => [entry.id, entry]));
  const find = (collection: string, id: string): TranslationEntry | undefined =>
    map.get(`${collection}/${id}.${locale}`);

  return {
    data: (collection, id) => find(collection, id)?.data ?? empty,
    entry: find,
  };
}

/**
 * ページの散文を引く。`prose/community.md` と `prose/community.en.md`。
 * 日本語は接尾辞なし、英語は `.en` が付く。
 */
export async function loadProse(
  locale: Locale,
  name: string,
): Promise<CollectionEntry<"prose"> | undefined> {
  const entries = await getCollection("prose");
  const id = locale === "ja" ? name : `${name}.${locale}`;
  return entries.find((entry) => entry.id === id);
}
