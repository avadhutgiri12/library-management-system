import { CATEGORIES, type BookInput } from "./types";

/**
 * Smart column detection for spreadsheet imports.
 *
 * Works out which column holds the title, author, category, copies, year and
 * cover URL by combining two signals:
 *   1. the header text (fuzzy: "Name of Book", "Writer", "Qty", "Yr" ...)
 *   2. the values themselves (4-digit years, http links, small whole numbers,
 *      known genres, person-like names vs longer titles)
 * Files without a header row are handled too.
 */

export type Field = keyof BookInput;

export const FIELD_LABELS: Record<Field, string> = {
  title: "Title",
  author: "Author",
  category: "Category",
  totalCopies: "Total copies",
  availableCopies: "Available copies",
  publishedYear: "Published year",
  coverUrl: "Cover URL",
};

const FIELDS = Object.keys(FIELD_LABELS) as Field[];

/* Header vocab. Exact words score highest; "contains" words score lower. */
const EXACT: Record<Field, string[]> = {
  title: ["title", "booktitle", "bookname", "nameofbook", "nameofthebook", "book", "name", "titleofbook"],
  author: ["author", "authors", "authorname", "writer", "writtenby", "by", "nameofauthor", "authorsname"],
  category: ["category", "genre", "subject", "type", "section", "classification", "categories", "genres"],
  totalCopies: ["totalcopies", "total", "copies", "quantity", "qty", "stock", "noofcopies", "numberofcopies", "count", "totalqty", "totalquantity"],
  availableCopies: ["availablecopies", "available", "avail", "instock", "availableqty", "availablequantity", "onshelf", "remaining", "left"],
  publishedYear: ["publishedyear", "year", "yr", "publicationyear", "published", "yearpublished", "pubyear", "yearofpublication", "releaseyear"],
  coverUrl: ["coverurl", "cover", "coverimage", "image", "imageurl", "img", "thumbnail", "photo", "picture", "link", "url", "coverlink"],
};
const CONTAINS: Record<Field, string[]> = {
  title: ["title", "bookname", "book"],
  author: ["author", "writer"],
  category: ["categor", "genre", "subject"],
  totalCopies: ["total", "cop", "qty", "quant", "stock"],
  availableCopies: ["avail", "instock", "remain"],
  publishedYear: ["year", "publish", "yr"],
  coverUrl: ["cover", "image", "img", "url", "thumb", "photo"],
};

/* Columns we should never guess as a book field (serial numbers, ISBN, prices...). */
const IGNORE = ["id", "sno", "srno", "slno", "serial", "serialno", "no", "index", "isbn", "isbn10", "isbn13", "price", "cost", "mrp", "rs", "amount", "inr", "pages", "rating", "barcode", "accessionno", "accession", "publisher", "language", "edition"];

const norm = (s: unknown) => String(s ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
const cell = (v: unknown) => String(v ?? "").trim();

function lev(a: string, b: string): number {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}

function headerScore(header: string, field: Field): number {
  const h = norm(header);
  if (!h) return 0;
  if (EXACT[field].includes(h)) return 100;
  // "avail" words must beat "copies" for "Available Copies", so check specific fields first
  if (CONTAINS[field].some((w) => h.includes(w))) return 70;
  if (h.length > 4 && EXACT[field].some((w) => w.length > 4 && lev(h, w) <= 2)) return 55; // typos: "Auther", "Titel"
  return 0;
}

const YEAR_NOW = 2100; // upper sanity bound; real "future year" check happens on import
const isInt = (s: string) => /^-?\d{1,7}$/.test(s.replace(/,/g, ""));
const isYear = (s: string) => /^\d{4}$/.test(s) && +s >= 1000 && +s <= YEAR_NOW;
const isUrl = (s: string) => /^https?:\/\/\S+$/i.test(s);
const STOP = new Set(["the", "of", "and", "a", "an", "to", "in", "for", "with", "on", "my", "how", "is", "your", "from", "at", "&"]);
const catKey = (s: string) => norm(s).replace(/s$/, "");
const CAT_KEYS = new Set(CATEGORIES.map((c) => catKey(c)).concat(["novel", "fantasy", "romance", "mystery", "thriller", "poetry", "religion", "philosophy", "business", "finance", "economics", "art", "comics", "education", "reference", "programming", "computer", "engineering", "math", "mathematic", "literature", "drama", "horror", "classic", "selfimprovement", "psychology", "politic", "travel", "cooking", "health", "sport"]));

/** Looks like a person's name: 1-4 words, initials allowed, few stopwords, no digits. */
function nameLike(s: string): boolean {
  if (/\d/.test(s) || s.length > 40) return false;
  const words = s.replace(/[,;]/g, " ").split(/\s+/).filter(Boolean);
  if (words.length < 1 || words.length > 5) return false;
  if (words.some((w) => STOP.has(w.toLowerCase()))) return false;
  return words.every((w) => /^[A-Z][A-Za-z'’\-.]*$/.test(w) || /^([A-Z]\.)+$/.test(w));
}

interface Stats {
  n: number;
  intFrac: number;
  yearFrac: number;
  urlFrac: number;
  catFrac: number;
  nameFrac: number;
  stopFrac: number;
  avgLen: number;
  avgNum: number;
  distinctRatio: number;
}

function stats(values: string[]): Stats {
  const v = values.filter(Boolean);
  const n = v.length || 1;
  const nums = v.filter(isInt).map((s) => +s.replace(/,/g, ""));
  return {
    n: v.length,
    intFrac: nums.length / n,
    yearFrac: v.filter(isYear).length / n,
    urlFrac: v.filter(isUrl).length / n,
    catFrac: v.filter((s) => CAT_KEYS.has(catKey(s))).length / n,
    nameFrac: v.filter(nameLike).length / n,
    stopFrac: v.filter((s) => s.toLowerCase().split(/\s+/).some((w) => STOP.has(w))).length / n,
    avgLen: v.reduce((s, x) => s + x.length, 0) / n,
    avgNum: nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0,
    distinctRatio: new Set(v.map((s) => s.toLowerCase())).size / n,
  };
}

export interface Detection {
  hasHeader: boolean;
  headers: string[]; // display name per column ("Column C" when no header)
  mapping: Partial<Record<Field, number>>; // field -> column index
  dataRows: string[][];
}

export function detectColumns(aoa: unknown[][]): Detection {
  const rows = aoa
    .map((r) => (r ?? []).map(cell))
    .filter((r) => r.some(Boolean));
  const width = Math.max(0, ...rows.map((r) => r.length));
  const colLetter = (i: number) => `Column ${String.fromCharCode(65 + (i % 26))}${i >= 26 ? Math.floor(i / 26) : ""}`;

  if (rows.length === 0) return { hasHeader: false, headers: [], mapping: {}, dataRows: [] };

  // ---- Is the first row a header? ----
  const first = rows[0];
  const headerHits = first.filter((h) => FIELDS.some((f) => headerScore(h, f) >= 55)).length;
  // Headings are words: a number, year or link in row 1 means it's already data.
  const firstLooksLikeData = first.some((c) => isInt(c) || isUrl(c));
  const othersHaveNumbers = rows.slice(1).some((r) => r.some((c) => isInt(c)));
  const hasHeader = !firstLooksLikeData && (headerHits > 0 || othersHaveNumbers);

  const headers = Array.from({ length: width }, (_, i) => (hasHeader && first[i] ? first[i] : colLetter(i)));
  const dataRows = (hasHeader ? rows.slice(1) : rows).map((r) => Array.from({ length: width }, (_, i) => r[i] ?? ""));
  const sample = dataRows.slice(0, 200);
  const colStats = Array.from({ length: width }, (_, i) => stats(sample.map((r) => r[i])));

  const mapping: Partial<Record<Field, number>> = {};
  const used = new Set<number>();
  if (hasHeader) headers.forEach((h, i) => IGNORE.includes(norm(h)) && used.add(i));
  const take = (f: Field, i: number) => {
    mapping[f] = i;
    used.add(i);
  };
  const free = () => Array.from({ length: width }, (_, i) => i).filter((i) => !used.has(i) && colStats[i].n > 0);

  // ---- 1. Header matches, but only where the data doesn't contradict them ----
  if (hasHeader) {
    const fits = (f: Field, s: Stats) => {
      if (f === "publishedYear") return s.yearFrac >= 0.5;
      if (f === "totalCopies" || f === "availableCopies") return s.intFrac >= 0.6 && s.yearFrac < 0.6;
      if (f === "coverUrl") return s.urlFrac >= 0.3;
      if (f === "title" || f === "author") return s.intFrac < 0.5 && s.urlFrac < 0.5;
      return s.urlFrac < 0.5;
    };
    const pairs: { f: Field; i: number; s: number }[] = [];
    headers.forEach((h, i) =>
      FIELDS.forEach((f) => {
        const s = headerScore(h, f);
        if (s && fits(f, colStats[i])) pairs.push({ f, i, s: s + (f === "availableCopies" ? 5 : 0) });
      }),
    );
    pairs.sort((a, b) => b.s - a.s);
    for (const p of pairs) if (mapping[p.f] === undefined && !used.has(p.i)) take(p.f, p.i);
  }

  // ---- 2. Content-based detection for whatever is still missing ----
  const best = (score: (s: Stats) => number, min: number) => {
    let bi = -1, bs = min;
    for (const i of free()) {
      const s = score(colStats[i]);
      if (s > bs) (bs = s), (bi = i);
    }
    return bi;
  };

  if (mapping.coverUrl === undefined) {
    const i = best((s) => s.urlFrac, 0.5);
    if (i >= 0) take("coverUrl", i);
  }
  if (mapping.publishedYear === undefined) {
    const i = best((s) => s.yearFrac, 0.6);
    if (i >= 0) take("publishedYear", i);
  }
  // copies: whole-number columns that aren't years
  const numericCols = free().filter((i) => colStats[i].intFrac >= 0.8 && colStats[i].yearFrac < 0.5 && colStats[i].avgNum < 10000);
  if (mapping.totalCopies === undefined && mapping.availableCopies === undefined) {
    const sorted = numericCols.sort((a, b) => colStats[b].avgNum - colStats[a].avgNum);
    if (sorted[0] !== undefined) take("totalCopies", sorted[0]);
    if (sorted[1] !== undefined) take("availableCopies", sorted[1]);
  } else if (mapping.totalCopies === undefined && numericCols[0] !== undefined) {
    take("totalCopies", numericCols[0]);
  } else if (mapping.availableCopies === undefined && numericCols[0] !== undefined) {
    take("availableCopies", numericCols[0]);
  }
  if (mapping.category === undefined) {
    const i = best(
      (s) => (s.intFrac > 0.3 ? 0 : s.catFrac + (s.n >= 4 && s.distinctRatio <= 0.6 && s.avgLen <= 20 && s.nameFrac < 0.5 ? 0.4 : 0)),
      0.45,
    );
    if (i >= 0) take("category", i);
  }

  // title vs author among the remaining text columns
  const textCols = () => free().filter((i) => colStats[i].intFrac < 0.5 && colStats[i].urlFrac < 0.5);
  if (mapping.author === undefined) {
    const cands = textCols().filter((i) => i !== mapping.title);
    const authorScore = (i: number) => colStats[i].nameFrac - colStats[i].stopFrac * 0.5 - colStats[i].avgLen / 200;
    const pick = cands.sort((a, b) => authorScore(b) - authorScore(a))[0];
    // only take it if another text column remains for the title (or title is already known)
    if (pick !== undefined && (mapping.title !== undefined || cands.length > 1) && colStats[pick].nameFrac >= 0.4) take("author", pick);
  }
  if (mapping.title === undefined) {
    const cands = textCols();
    // the title is usually the first text column, and longer than other text
    const titleScore = (i: number) => colStats[i].avgLen / 10 + colStats[i].distinctRatio + colStats[i].stopFrac - i * 0.3;
    const pick = cands.sort((a, b) => titleScore(b) - titleScore(a))[0];
    if (pick !== undefined) take("title", pick);
  }
  if (mapping.author === undefined) {
    const pick = textCols().sort((a, b) => colStats[b].nameFrac - colStats[a].nameFrac)[0];
    if (pick !== undefined) take("author", pick);
  }

  // sanity: available should not exceed total on average; swap if detected from content
  if (mapping.totalCopies !== undefined && mapping.availableCopies !== undefined) {
    const t = colStats[mapping.totalCopies].avgNum, a = colStats[mapping.availableCopies].avgNum;
    if (a > t && !(hasHeader && headerScore(headers[mapping.availableCopies], "availableCopies") >= 70))
      [mapping.totalCopies, mapping.availableCopies] = [mapping.availableCopies, mapping.totalCopies];
  }

  return { hasHeader, headers, mapping, dataRows };
}
