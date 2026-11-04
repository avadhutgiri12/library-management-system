"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, FileSpreadsheet, Inbox, Pencil, Plus, Trash2 } from "lucide-react";
import AuthGuard from "@/components/AuthGuard";
import BookCover from "@/components/BookCover";
import ImportBooks from "@/components/ImportBooks";
import StatusBadge from "@/components/StatusBadge";
import { deleteBook, resetDemoData, useBooks } from "@/lib/store";
import type { Book } from "@/lib/types";

type Availability = "all" | "available" | "out";

function Dashboard() {
  const { books } = useBooks();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [availability, setAvailability] = useState<Availability>("all");
  const [importOpen, setImportOpen] = useState(false);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(books.map((b) => b.category))).sort()],
    [books],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return books.filter((b) => {
      const matchesQuery =
        !q ||
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q);
      const matchesCategory = category === "All" || b.category === category;
      const matchesAvailability =
        availability === "all" ||
        (availability === "available" ? b.availableCopies > 0 : b.availableCopies === 0);
      return matchesQuery && matchesCategory && matchesAvailability;
    });
  }, [books, query, category, availability]);

  const stats = useMemo(() => {
    const copies = books.reduce((s, b) => s + b.totalCopies, 0);
    const available = books.reduce((s, b) => s + b.availableCopies, 0);
    return {
      titles: books.length,
      copies,
      available,
      outOfStock: books.filter((b) => b.availableCopies === 0).length,
      pct: copies ? Math.round((available / copies) * 100) : 0,
    };
  }, [books]);

  const handleDelete = (book: Book) => {
    if (confirm(`Delete "${book.title}"? This can't be undone.`)) deleteBook(book.id);
  };

  const hasFilters = query || category !== "All" || availability !== "all";

  const short = (c: string) => c.replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase();

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] leading-tight font-medium">Catalogue</h1>
          <p className="mt-1 text-sm text-muted">
            <span className="tabular">{stats.titles}</span> titles · <span className="tabular">{stats.copies}</span> copies
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setImportOpen(true)} className="btn-ghost">
            <FileSpreadsheet size={16} strokeWidth={1.5} aria-hidden />
            Import from Excel or CSV
          </button>
          <Link href="/books/new" className="btn-dark">
            <Plus size={16} strokeWidth={1.5} aria-hidden />
            Add book
          </Link>
        </div>
      </div>

      {/* ---------- Stats ---------- */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <section className="tile">
          <h2 className="eyebrow">Total books</h2>
          <p className="tabular mt-3 text-[32px] leading-none font-medium">{stats.titles}</p>
          <p className="mt-2 text-[13px] text-muted">titles in the catalogue</p>
        </section>
        <section className="tile">
          <h2 className="eyebrow">Total copies</h2>
          <p className="tabular mt-3 text-[32px] leading-none font-medium">{stats.copies}</p>
          <p className="mt-2 text-[13px] text-muted">across all titles</p>
        </section>
        <section className="tile">
          <h2 className="eyebrow">Available</h2>
          <p className="tabular mt-3 text-[32px] leading-none font-medium">{stats.available}</p>
          <p className="mt-2 text-[13px] text-muted">copies ready to issue</p>
        </section>
        <section className="tile">
          <h2 className="eyebrow">Out of stock</h2>
          <p className={`tabular mt-3 text-[32px] leading-none font-medium ${stats.outOfStock ? "text-danger" : ""}`}>{stats.outOfStock}</p>
          <p className="mt-2 text-[13px] text-muted">titles with no copies left</p>
        </section>

        {/* The one rich moment: the shelf */}
        <section className="tile col-span-2 lg:col-span-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="eyebrow">Shelf availability</h2>
            <p className="text-sm text-muted">
              <span className="tabular text-xl font-medium text-ink">{stats.pct}%</span> of {stats.copies} copies on the shelf
            </p>
          </div>
          <div
            role="progressbar"
            aria-valuenow={stats.pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Share of copies available"
            className="mt-4 flex h-10 gap-[3px] overflow-hidden"
          >
            {stats.copies > 120 ? (
              <span className="relative flex-1 rounded-[2px] bg-line">
                <span className="absolute inset-y-0 left-0 rounded-[2px] bg-secondary" style={{ width: `${stats.pct}%` }} />
              </span>
            ) : books.flatMap((b) =>
              Array.from({ length: b.totalCopies }, (_, i) => (
                <span
                  key={`${b.id}-${i}`}
                  title={`${b.title}: ${i < b.availableCopies ? "on shelf" : "issued"}`}
                  className={`flex-1 rounded-[2px] ${i < b.availableCopies ? "bg-secondary" : "bg-line"}`}
                />
              )),
            )}
          </div>
          <div className="mt-3 flex gap-4 text-[13px] text-muted">
            <span className="flex items-center gap-1.5"><span aria-hidden className="h-2 w-2 rounded-[2px] bg-secondary" />On shelf</span>
            <span className="flex items-center gap-1.5"><span aria-hidden className="h-2 w-2 rounded-[2px] bg-line" />Issued</span>
          </div>
        </section>
      </div>

      {importOpen && <ImportBooks onClose={() => setImportOpen(false)} />}

      {/* ---------- Search & filters ---------- */}
      <section aria-label="Search and filter books" className="mt-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <label htmlFor="search" className="sr-only">Search books</label>
          <input
            id="search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title or author"
            className="field !mt-0 flex-1 !bg-tile"
          />
          <label htmlFor="category" className="sr-only">Filter by category</label>
          <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="field !mt-0 !bg-tile md:w-48">
            {categories.map((c) => (
              <option key={c} value={c}>{c === "All" ? "All categories" : c}</option>
            ))}
          </select>
          <label htmlFor="availability" className="sr-only">Filter by availability</label>
          <select
            id="availability"
            value={availability}
            onChange={(e) => setAvailability(e.target.value as Availability)}
            className="field !mt-0 !bg-tile md:w-48"
          >
            <option value="all">Any availability</option>
            <option value="available">Available</option>
            <option value="out">Out of stock</option>
          </select>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-muted" aria-live="polite">
            Showing <span className="tabular font-medium text-ink">{filtered.length}</span> of {books.length} books
          </p>
          <div className="flex gap-1">
            {hasFilters && (
              <button
                onClick={() => {
                  setQuery("");
                  setCategory("All");
                  setAvailability("all");
                }}
                className="btn !h-8 !px-3 text-muted hover:bg-primary hover:text-ink"
              >
                Clear filters
              </button>
            )}
            <button
              onClick={() => {
                if (confirm("Reset all books to the original sample data?")) resetDemoData();
              }}
              className="btn !h-8 !px-3 text-muted hover:bg-primary hover:text-ink"
            >
              Reset demo data
            </button>
          </div>
        </div>
      </section>

      {/* ---------- Books ---------- */}
      {filtered.length === 0 ? (
        <section className="tile mt-4 py-16 text-center">
          <Inbox size={20} strokeWidth={1.5} className="mx-auto text-muted" aria-hidden />
          <p className="mt-3 font-medium">
            {books.length === 0 ? "No books yet" : "No books match your search"}
          </p>
          <p className="mt-1 text-sm text-muted">
            {books.length === 0 ? (
              <Link href="/books/new" className="font-medium text-secondary-ink underline">Add your first book</Link>
            ) : (
              "Try a different keyword or clear the filters"
            )}
          </p>
        </section>
      ) : (
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((b) => (
            <li key={b.id} className="tile group relative flex gap-4 !p-4 transition-colors hover:border-ink/20">
              <BookCover src={b.coverUrl} title={b.title} className="h-[136px] w-[92px] shrink-0 rounded-[4px]" />
              <div className="flex min-w-0 flex-1 flex-col">
                <p className="spine">
                  {short(b.category)} · {b.publishedYear} · {b.availableCopies}/{b.totalCopies}
                </p>
                <h2 className="mt-2 line-clamp-2 text-[15px] leading-snug font-semibold">
                  <Link href={`/books/${b.id}`} className="after:absolute after:inset-0 after:rounded-lg focus-visible:outline-none">
                    {b.title}
                  </Link>
                </h2>
                <p className="mt-0.5 truncate text-sm text-muted">{b.author}</p>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <StatusBadge book={b} />
                  <div className="relative z-[1] flex gap-1">
                    <Link
                      href={`/books/${b.id}/edit`}
                      className="grid h-8 w-8 place-items-center rounded-md text-muted transition-colors hover:bg-primary hover:text-ink"
                      aria-label={`Edit ${b.title}`}
                      title="Edit"
                    >
                      <Pencil size={16} strokeWidth={1.5} aria-hidden />
                    </Link>
                    <button
                      onClick={() => handleDelete(b)}
                      className="grid h-8 w-8 place-items-center rounded-md text-muted transition-colors hover:bg-red-50 hover:text-danger"
                      aria-label={`Delete ${b.title}`}
                      title="Delete"
                    >
                      <Trash2 size={16} strokeWidth={1.5} aria-hidden />
                    </button>
                  </div>
                </div>
              </div>
              <ArrowUpRight size={16} strokeWidth={1.5} aria-hidden className="absolute top-4 right-4 text-muted opacity-0 transition-opacity group-hover:opacity-100" />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <Dashboard />
    </AuthGuard>
  );
}
