/**
 * 英語の上書きを引く。
 *
 * `src/content/work/nagase.md` の訳は `src/content/en/work/nagase.md`。
 * translations コレクションの base が `src/content/en` なので、
 * id は `work/nagase` と、日本語側の `コレクション名/id` にそのまま揃う。
 *
 * 日本語のときは常に空を返す。呼び出し側が
 * `tr.data(...).title ?? entry.data.title` と書けば、言語で分岐せずに済む。
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
    map.get(`${collection}/${id}`);

  return {
    data: (collection, id) => find(collection, id)?.data ?? empty,
    entry: find,
  };
}

/**
 * ページの散文を引く。
 * 日本語は `src/content/prose/community.md`、英語は `src/content/en/prose/community.md`。
 */
export async function loadProse(
  locale: Locale,
  name: string,
): Promise<CollectionEntry<"prose"> | TranslationEntry | undefined> {
  if (locale === "ja") {
    const entries = await getCollection("prose");
    return entries.find((entry) => entry.id === name);
  }
  const entries = await getCollection("translations");
  return entries.find((entry) => entry.id === `prose/${name}`);
}
