"use client";

import { useEffect, useRef, useState } from "react";
import { addBooks } from "@/lib/store";
import { CATEGORIES, type BookInput } from "@/lib/types";

/* Column names we accept (case, spaces and punctuation are ignored). */
const ALIASES: Record<keyof BookInput, string[]> = {
  title: ["title", "booktitle", "bookname", "name", "book"],
  author: ["author", "authors", "writer", "authorname"],
  category: ["category", "genre", "subject", "type"],
  totalCopies: ["totalcopies", "total", "copies", "quantity", "qty", "stock"],
  availableCopies: ["availablecopies", "available", "availablequantity", "instock"],
  publishedYear: ["publishedyear", "year", "publicationyear", "published", "yearpublished"],
  coverUrl: ["coverurl", "cover", "coverimage", "image", "imageurl", "thumbnail"],
};

const norm = (s: unknown) => String(s ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");

function pick(row: Record<string, unknown>, key: keyof BookInput): string {
  for (const col of Object.keys(row)) {
    if (ALIASES[key].includes(norm(col))) {
      const v = row[col];
      if (v !== undefined && v !== null && String(v).trim() !== "") return String(v).trim();
    }
  }
  return "";
}

function toInt(v: string): number | null {
  if (!v) return null;
  const n = Math.floor(Number(v.replace(/,/g, "")));
  return Number.isFinite(n) ? n : null;
}

function matchCategory(v: string): string {
  if (!v) return "Other";
  const hit = CATEGORIES.find((c) => norm(c) === norm(v));
  return hit ?? v;
}

type Skipped = { row: number; reason: string };
type Result = { fileName: string; added: number; skipped: Skipped[] };

function rowsToBooks(rows: Record<string, unknown>[]) {
  const year = new Date().getFullYear();
  const books: BookInput[] = [];
  const skipped: Skipped[] = [];

  rows.forEach((row, i) => {
    const rowNo = i + 2; // +1 for header, +1 for 1-based rows
    const title = pick(row, "title");
    const author = pick(row, "author");
    if (!title && !author) return; // blank line, ignore quietly
    if (!title) return skipped.push({ row: rowNo, reason: "Missing title" });
    if (!author) return skipped.push({ row: rowNo, reason: "Missing author" });

    const total = Math.max(0, toInt(pick(row, "totalCopies")) ?? 1);
    const availRaw = toInt(pick(row, "availableCopies"));
    const available = Math.min(total, Math.max(0, availRaw ?? total));
    const yr = toInt(pick(row, "publishedYear"));
    const cover = pick(row, "coverUrl");

    books.push({
      title,
      author,
      category: matchCategory(pick(row, "category")),
      totalCopies: total,
      availableCopies: available,
      publishedYear: yr && yr >= 1000 && yr <= year ? yr : year,
      coverUrl: /^https?:\/\//.test(cover) ? cover : "",
    });
  });

  return { books, skipped };
}

function downloadTemplate() {
  const csv = [
    "Title,Author,Category,Total Copies,Available Copies,Published Year,Cover URL",
    "The Alchemist,Paulo Coelho,Fiction,5,3,1988,",
    "Wings of Fire,A. P. J. Abdul Kalam,Biography,6,6,1999,",
    "Clean Code,Robert C. Martin,Technology,3,1,2008,",
  ].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "libraryhub-books-template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function ImportBooks({ onClose }: { onClose: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError("");
    setResult(null);
    if (!/\.(xlsx|xls|csv)$/i.test(file.name)) {
      setError("Please choose an .xlsx, .xls or .csv file.");
      return;
    }
    setBusy(true);
    try {
      const XLSX = await import("xlsx");
      const wb = XLSX.read(await file.arrayBuffer(), { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "", raw: false });
      const { books, skipped } = rowsToBooks(rows);
      if (books.length === 0) {
        setError(
          skipped.length
            ? "No books could be added. Every row is missing a title or author."
            : "That file has no book rows. Make sure the first row has headers like Title and Author.",
        );
      } else {
        addBooks(books);
        setResult({ fileName: file.name, added: books.length, skipped });
      }
    } catch {
      setError("Couldn't read that file. Check it's a valid Excel or CSV file.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-h"
      className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="tile w-full max-w-lg bg-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="label-caps">Bulk import</span>
            <h2 id="import-h" className="mt-1 text-xl font-bold">Add books from Excel or CSV</h2>
          </div>
          <button onClick={onClose} className="btn-ghost !px-3 !py-1.5" aria-label="Close">✕</button>
        </div>

        {result ? (
          <div className="mt-5">
            <div className="rounded-lg bg-surface p-4">
              <p className="text-3xl font-bold text-success">+{result.added}</p>
              <p className="text-sm text-muted">
                book{result.added === 1 ? "" : "s"} added from <span className="font-medium text-ink">{result.fileName}</span>
              </p>
            </div>
            {result.skipped.length > 0 && (
              <div className="mt-3 rounded-lg border border-warning/40 p-3 text-sm">
                <p className="font-semibold text-warning">{result.skipped.length} row{result.skipped.length === 1 ? "" : "s"} skipped</p>
                <ul className="mt-1 max-h-28 overflow-auto text-muted">
                  {result.skipped.map((s) => (
                    <li key={s.row}>Row {s.row}: {s.reason}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button onClick={() => setResult(null)} className="btn-ghost">Import another</button>
              <button onClick={onClose} className="btn-dark">Done</button>
            </div>
          </div>
        ) : (
          <>
            <label
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                handleFile(e.dataTransfer.files[0]);
              }}
              className={`mt-5 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors ${
                dragging ? "border-secondary bg-secondary-soft" : "border-gray-300 hover:bg-surface"
              }`}
            >
              <span aria-hidden className="text-3xl">{busy ? "⏳" : "📄"}</span>
              <span className="mt-2 font-semibold">{busy ? "Adding books…" : "Drop your file here or click to upload"}</span>
              <span className="mt-1 text-xs text-muted">.xlsx, .xls or .csv · books are added automatically</span>
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.xls,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                className="sr-only"
                disabled={busy}
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </label>

            {error && (
              <p role="alert" className="mt-3 text-sm font-medium text-danger">{error}</p>
            )}

            <div className="mt-5 rounded-lg bg-surface p-4 text-sm">
              <p className="font-semibold">Columns in the first row</p>
              <p className="mt-1 text-muted">
                <span className="font-medium text-ink">Title</span> and <span className="font-medium text-ink">Author</span> are required.
                Optional: Category, Total Copies, Available Copies, Published Year, Cover URL.
              </p>
              <button onClick={downloadTemplate} className="mt-3 font-semibold text-secondary-ink underline">
                Download sample CSV
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
