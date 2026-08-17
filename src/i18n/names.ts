/**
 * 固有名詞の対訳表。
 *
 * なぜ表にするか:
 *   会社名・学校名は work / education / skills の usedIn と、複数の場所に同じ文字列で
 *   出てくる。エントリごとに訳を持つと、同じ会社が場所によって違う綴りになる。
 *   ここに1つだけ持てば、全部が必ず一致する。
 *
 * 表に無いものはそのまま通す:
 *   skills の usedIn には会社名だけでなく Zenn の記事タイトルも入る。
 *   記事は日本語で書かれたものなので、英語ページでも題名は日本語のまま出すのが正しい。
 *   通し（フォールバック）はその挙動を意図して選んでいる。
 *
 * 公式の英語名しか書かない:
 *   すべて各社・各校の公式サイトの表記を確認して入れている。
 *   公式の英語名を持たない相手に "Inc." を足して作らない。
 *   株式会社メモアカは公式の英語名が無いため、自社ドメイン (memoaca.com) の
 *   ローマ字表記に合わせて法人格なしの "Memoaca" にしている。
 */

/** 日本語表記 → 英語表記。 */
const table: Record<string, string> = {
  // 会社
  LINEヤフー株式会社: "LY Corporation",
  株式会社ナガセ: "Nagase Brothers Inc.",
  株式会社ドリコム: "Drecom Co., Ltd.",
  株式会社メモアカ: "Memoaca",
  メモアカ: "Memoaca",

  // 学校
  金沢大学: "Kanazawa University",
  山手学院高等学校: "Yamate Gakuin Senior High School",

  // 会場
  ホテル金沢: "Hotel Kanazawa",
  "LINEヤフー紀尾井町オフィス": "LY Corporation Kioicho Office",
  "docomo R&D OPEN LAB ODAIBA": "docomo R&D OPEN LAB ODAIBA",
  公立はこだて未来大学: "Future University Hakodate",
};

/** 英語表記を引く。表に無ければそのまま返す。 */
export function englishName(japanese: string): string {
  return table[japanese] ?? japanese;
}

/** 対訳表に載っている日本語表記の一覧。scripts/check-i18n.mjs が参照する。 */
export const translatedNames: string[] = Object.keys(table);
