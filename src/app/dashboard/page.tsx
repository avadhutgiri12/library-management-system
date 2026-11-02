"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import BookCover from "@/components/BookCover";
import StatusBadge from "@/components/StatusBadge";
import { deleteBook, resetDemoData, useBooks } from "@/lib/store";
import type { Book } from "@/lib/types";

type Availability = "all" | "available" | "out";

function Dashboard() {
  const { books } = useBooks();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [availability, setAvailability] = useState<Availability>("all");

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
        b.author.toLowerCase().includes(q) ||
        b.isbn.toLowerCase().includes(q);
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

  return (
    <>
      <h1 className="sr-only">Dashboard</h1>

      {/* ---------- Bento stats grid ---------- */}
      <div className="grid auto-rows-[minmax(120px,auto)] grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Hero: total books (2x2) */}
        <section className="tile col-span-2 row-span-2 flex flex-col justify-between bg-primary">
          <div className="flex items-start justify-between gap-4">
            <h2 className="label-caps !text-ink/70">Total books</h2>
            <span aria-hidden className="text-3xl">📚</span>
          </div>
          <div>
            <p className="text-7xl font-bold tracking-tight sm:text-8xl">{stats.titles}</p>
            <p className="mt-2 text-base text-ink/80">
              titles in the collection, {stats.copies} copies on the shelves
            </p>
          </div>
        </section>

        {/* Add book CTA */}
        <Link
          href="/books/new"
          className="tile group col-span-2 flex items-center justify-between bg-ink text-white transition-colors hover:bg-gray-800 lg:col-span-2"
        >
          <span>
            <span className="label-caps !text-white/70">Quick action</span>
            <span className="mt-2 block text-2xl font-bold">Add a new book</span>
          </span>
          <span aria-hidden className="grid h-12 w-12 place-items-center rounded-full bg-primary text-2xl text-ink transition-transform group-hover:rotate-90">
            +
          </span>
        </Link>

        {/* Available copies */}
        <section className="tile">
          <h2 className="label-caps">Available</h2>
          <p className="mt-3 text-[32px] font-bold text-success">{stats.available}</p>
          <p className="text-sm text-muted">copies ready to issue</p>
        </section>

        {/* Out of stock */}
        <section className="tile">
          <h2 className="label-caps">Out of stock</h2>
          <p className="mt-3 text-[32px] font-bold text-danger">{stats.outOfStock}</p>
          <p className="text-sm text-muted">titles with no copies left</p>
        </section>

        {/* Availability meter */}
        <section className="tile col-span-2 bg-secondary-soft lg:col-span-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="label-caps !text-secondary-ink">Shelf availability</h2>
            <p className="text-sm text-secondary-ink">
              <strong className="text-xl text-ink">{stats.pct}%</strong> of {stats.copies} copies on the shelf
            </p>
          </div>
          <div
            role="progressbar"
            aria-valuenow={stats.pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Share of copies available"
            className="mt-4 h-3 overflow-hidden rounded-full bg-white"
          >
            <div className="h-full rounded-full bg-secondary" style={{ width: `${stats.pct}%` }} />
          </div>
        </section>
      </div>

      {/* ---------- Search & filters ---------- */}
      <section aria-label="Search and filter books" className="tile mt-4 !p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <label htmlFor="search" className="sr-only">Search books</label>
          <input
            id="search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, author or ISBN"
            className="field !mt-0 flex-1"
          />
          <label htmlFor="category" className="sr-only">Filter by category</label>
          <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="field !mt-0 md:w-48">
            {categories.map((c) => (
              <option key={c} value={c}>{c === "All" ? "All categories" : c}</option>
            ))}
          </select>
          <label htmlFor="availability" className="sr-only">Filter by availability</label>
          <select
            id="availability"
            value={availability}
            onChange={(e) => setAvailability(e.target.value as Availability)}
            className="field !mt-0 md:w-48"
          >
            <option value="all">Any availability</option>
            <option value="available">Available</option>
            <option value="out">Out of stock</option>
          </select>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1">
          <p className="text-sm text-muted" aria-live="polite">
            Showing <strong className="text-ink">{filtered.length}</strong> of {books.length} books
          </p>
          <div className="flex gap-2">
            {hasFilters && (
              <button
                onClick={() => {
                  setQuery("");
                  setCategory("All");
                  setAvailability("all");
                }}
                className="btn-ghost !px-3 !py-1.5"
              >
                Clear filters
              </button>
            )}
            <button
              onClick={() => {
                if (confirm("Reset all books to the original sample data?")) resetDemoData();
              }}
              className="btn-ghost !px-3 !py-1.5"
            >
              Reset demo data
            </button>
          </div>
        </div>
      </section>

      {/* ---------- Books grid ---------- */}
      {filtered.length === 0 ? (
        <section className="tile mt-4 py-16 text-center">
          <p aria-hidden className="text-4xl">📭</p>
          <p className="mt-3 font-semibold">
            {books.length === 0 ? "No books yet" : "No books match your search"}
          </p>
          <p className="mt-1 text-sm text-muted">
            {books.length === 0 ? (
              <Link href="/books/new" className="font-semibold text-secondary-ink underline">Add your first book</Link>
            ) : (
              "Try a different keyword or clear the filters."
            )}
          </p>
        </section>
      ) : (
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((b) => (
            <li key={b.id} className="tile flex flex-col !p-4">
              <div className="flex gap-4">
                <BookCover src={b.coverUrl} title={b.title} className="h-32 w-[88px] shrink-0 rounded-xl" />
                <div className="min-w-0 flex-1">
                  <span className="label-caps">{b.category}</span>
                  <h2 className="mt-1 line-clamp-2 text-base leading-snug font-bold">
                    <Link href={`/books/${b.id}`} className="hover:underline">{b.title}</Link>
                  </h2>
                  <p className="mt-0.5 truncate text-sm text-muted">{b.author}</p>
                  <div className="mt-2">
                    <StatusBadge book={b} />
                  </div>
                </div>
              </div>
              <dl className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-surface p-3 text-center">
                <div>
                  <dt className="label-caps !text-[10px]">Year</dt>
                  <dd className="text-sm font-semibold">{b.publishedYear}</dd>
                </div>
                <div>
                  <dt className="label-caps !text-[10px]">Copies</dt>
                  <dd className="text-sm font-semibold">{b.availableCopies}/{b.totalCopies}</dd>
                </div>
                <div className="min-w-0">
                  <dt className="label-caps !text-[10px]">ISBN</dt>
                  <dd className="truncate font-mono text-xs font-medium" title={b.isbn}>…{b.isbn.slice(-4)}</dd>
                </div>
              </dl>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <Link href={`/books/${b.id}`} className="btn-ghost !px-2 !py-2" aria-label={`View ${b.title}`}>View</Link>
                <Link href={`/books/${b.id}/edit`} className="btn-primary !px-2 !py-2" aria-label={`Edit ${b.title}`}>Edit</Link>
                <button onClick={() => handleDelete(b)} className="btn-danger !px-2 !py-2" aria-label={`Delete ${b.title}`}>Delete</button>
              </div>
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
