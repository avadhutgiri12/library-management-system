"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import BookCover from "@/components/BookCover";
import StatusBadge from "@/components/StatusBadge";
import { deleteBook, resetDemoData, useBooks } from "@/lib/store";
import type { Book } from "@/lib/types";

type Availability = "all" | "available" | "out";

function StatCard({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${tone}`}>{value}</p>
    </div>
  );
}

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

  const stats = useMemo(
    () => ({
      titles: books.length,
      copies: books.reduce((s, b) => s + b.totalCopies, 0),
      available: books.reduce((s, b) => s + b.availableCopies, 0),
      outOfStock: books.filter((b) => b.availableCopies === 0).length,
    }),
    [books],
  );

  const handleDelete = (book: Book) => {
    if (confirm(`Delete "${book.title}"? This can't be undone.`)) deleteBook(book.id);
  };

  const clearFilters = () => {
    setQuery("");
    setCategory("All");
    setAvailability("all");
  };
  const hasFilters = query || category !== "All" || availability !== "all";

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">Overview of every book in the library.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              if (confirm("Reset all books to the original sample data?")) resetDemoData();
            }}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Reset demo data
          </button>
          <Link
            href="/books/new"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
          >
            + Add book
          </Link>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total books" value={stats.titles} tone="text-indigo-600" />
        <StatCard label="Total copies" value={stats.copies} tone="text-slate-900" />
        <StatCard label="Available copies" value={stats.available} tone="text-emerald-600" />
        <StatCard label="Out of stock" value={stats.outOfStock} tone="text-red-600" />
      </div>

      {/* Search & filters */}
      <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="🔍  Search by title, author or ISBN…"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2"
          aria-label="Filter by category"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c === "All" ? "All categories" : c}
            </option>
          ))}
        </select>
        <select
          value={availability}
          onChange={(e) => setAvailability(e.target.value as Availability)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2"
          aria-label="Filter by availability"
        >
          <option value="all">All availability</option>
          <option value="available">Available</option>
          <option value="out">Out of stock</option>
        </select>
        {hasFilters && (
          <button onClick={clearFilters} className="text-sm font-medium text-indigo-600 hover:underline">
            Clear
          </button>
        )}
      </div>

      <p className="mt-4 text-sm text-slate-500">
        Showing {filtered.length} of {books.length} books
      </p>

      {/* Table */}
      <div className="mt-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Book</th>
              <th className="px-4 py-3">ISBN</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Year</th>
              <th className="px-4 py-3">Copies</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((b) => (
              <tr key={b.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <BookCover src={b.coverUrl} title={b.title} className="h-14 w-10 shrink-0 rounded" />
                    <div>
                      <p className="font-semibold text-slate-900">{b.title}</p>
                      <p className="text-slate-500">{b.author}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-600">{b.isbn}</td>
                <td className="px-4 py-3">{b.category}</td>
                <td className="px-4 py-3">{b.publishedYear}</td>
                <td className="px-4 py-3">
                  {b.availableCopies} / {b.totalCopies}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge book={b} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link href={`/books/${b.id}`} className="rounded-md px-2.5 py-1.5 font-medium text-slate-700 hover:bg-slate-100">
                      View
                    </Link>
                    <Link href={`/books/${b.id}/edit`} className="rounded-md px-2.5 py-1.5 font-medium text-indigo-600 hover:bg-indigo-50">
                      Edit
                    </Link>
                    <button onClick={() => handleDelete(b)} className="rounded-md px-2.5 py-1.5 font-medium text-red-600 hover:bg-red-50">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                  {books.length === 0 ? (
                    <>No books yet. <Link href="/books/new" className="font-medium text-indigo-600 hover:underline">Add your first book</Link>.</>
                  ) : (
                    "No books match your search or filters."
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
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
