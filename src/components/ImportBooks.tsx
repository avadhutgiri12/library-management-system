"use client";

import { Loader2, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { addBooks } from "@/lib/store";
import { CATEGORIES, type BookInput } from "@/lib/types";
import { detectColumns, FIELD_LABELS, type Detection, type Field } from "@/lib/detectColumns";

function toInt(v: string): number | null {
  if (!v) return null;
  const n = Math.floor(Number(v.replace(/,/g, "")));
  return Number.isFinite(n) ? n : null;
}

const normCat = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
function matchCategory(v: string): string {
  if (!v) return "Other";
  const hit = CATEGORIES.find((c) => normCat(c) === normCat(v) || normCat(c) === normCat(v).replace(/s$/, ""));
  return hit ?? v.charAt(0).toUpperCase() + v.slice(1);
}

type Skipped = { row: number; reason: string };
type Detected = { field: Field; column: string };
type Result = { fileName: string; added: number; skipped: Skipped[]; detected: Detected[]; hasHeader: boolean };

function rowsToBooks(det: Detection) {
  const year = new Date().getFullYear();
  const m = det.mapping;
  const get = (r: string[], f: Field) => (m[f] === undefined ? "" : (r[m[f]!] ?? "").trim());
  const books: BookInput[] = [];
  const skipped: Skipped[] = [];

  det.dataRows.forEach((r, i) => {
    const rowNo = i + (det.hasHeader ? 2 : 1);
    const title = get(r, "title");
    const author = get(r, "author");
    if (!title && !author) return;
    if (!title) return skipped.push({ row: rowNo, reason: "Missing title" });
    if (!author) return skipped.push({ row: rowNo, reason: "Missing author" });

    const total = Math.max(0, toInt(get(r, "totalCopies")) ?? 1);
    const availRaw = toInt(get(r, "availableCopies"));
    const available = Math.min(total, Math.max(0, availRaw ?? total));
    const yr = toInt(get(r, "publishedYear"));
    const cover = get(r, "coverUrl");

    books.push({
      title,
      author,
      category: matchCategory(get(r, "category")),
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
      const aoa = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "", raw: false });
      const det = detectColumns(aoa);
      if (det.mapping.title === undefined || det.mapping.author === undefined) {
        setError("Couldn't find a title and an author column in that file. Each book needs both.");
        return;
      }
      const { books, skipped } = rowsToBooks(det);
      if (books.length === 0) {
        setError(skipped.length ? "No books could be added. Every row is missing a title or author." : "That file has no book rows.");
      } else {
        addBooks(books);
        const detected = (Object.keys(FIELD_LABELS) as Field[])
          .filter((f) => det.mapping[f] !== undefined)
          .map((f) => ({ field: f, column: det.headers[det.mapping[f]!] }));
        setResult({ fileName: file.name, added: books.length, skipped, detected, hasHeader: det.hasHeader });
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
            <span className="eyebrow">Bulk import</span>
            <h2 id="import-h" className="mt-1 text-xl font-medium">Import from Excel or CSV</h2>
          </div>
          <button onClick={onClose} className="btn-ghost !px-3 !py-1.5" aria-label="Close">✕</button>
        </div>

        {result ? (
          <div className="mt-5">
            <div className="rounded-lg bg-surface p-4">
              <p className="tabular text-[32px] leading-none font-medium text-ink">{result.added}</p>
              <p className="text-sm text-muted">
                book{result.added === 1 ? "" : "s"} added from <span className="font-medium text-ink">{result.fileName}</span>
              </p>
            </div>
            <div className="mt-3 rounded-lg border border-gray-200 p-3 text-sm">
              <p className="font-medium">Columns recognised automatically</p>
              <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
                {result.detected.map((d) => (
                  <div key={d.field} className="contents">
                    <dt className="text-muted">{FIELD_LABELS[d.field]}</dt>
                    <dd className="truncate font-mono text-[13px]">{d.column}</dd>
                  </div>
                ))}
              </dl>
              {!result.hasHeader && <p className="mt-2 text-xs text-muted">No header row found, so columns were matched from their contents.</p>}
            </div>
            {result.skipped.length > 0 && (
              <div className="mt-3 rounded-lg border border-warning/40 p-3 text-sm">
                <p className="font-medium text-amber-700">{result.skipped.length} row{result.skipped.length === 1 ? "" : "s"} skipped</p>
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
              {busy ? <Loader2 size={20} strokeWidth={1.5} className="animate-spin text-muted" aria-hidden /> : <Upload size={20} strokeWidth={1.5} className="text-muted" aria-hidden />}
              <span className="mt-3 font-medium">{busy ? "Adding books…" : "Drop your file here or click to upload"}</span>
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
              <p className="font-medium">Any column layout works</p>
              <p className="mt-1 text-muted">
                LibraryHub reads your headings and the data itself to find the <span className="font-medium text-ink">title</span>,{" "}
                <span className="font-medium text-ink">author</span>, category, copies, year and cover link, in any order, even without a heading row.
              </p>
              <button onClick={downloadTemplate} className="mt-3 font-medium text-secondary-ink underline">
                Download sample CSV
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
