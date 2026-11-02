"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import BookCover from "@/components/BookCover";
import StatusBadge from "@/components/StatusBadge";
import { deleteBook, useBooks } from "@/lib/store";

function BookDetails() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { books } = useBooks();
  const book = books.find((b) => b.id === id);

  if (!book) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
        <p className="text-slate-600">This book doesn&apos;t exist or was deleted.</p>
        <Link href="/dashboard" className="mt-4 inline-block font-medium text-indigo-600 hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const rows: [string, React.ReactNode][] = [
    ["Author", book.author],
    ["ISBN", <span key="isbn" className="font-mono">{book.isbn}</span>],
    ["Category", book.category],
    ["Published year", book.publishedYear],
    ["Total copies", book.totalCopies],
    ["Available copies", book.availableCopies],
    ["Issued copies", book.totalCopies - book.availableCopies],
    ["Added on", new Date(book.createdAt).toLocaleDateString()],
    ["Last updated", new Date(book.updatedAt).toLocaleString()],
  ];

  return (
    <>
      <Link href="/dashboard" className="text-sm font-medium text-indigo-600 hover:underline">
        ← Back to dashboard
      </Link>
      <div className="mt-4 grid gap-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-[220px_1fr]">
        <BookCover src={book.coverUrl} title={book.title} className="aspect-[2/3] w-full rounded-lg shadow" />
        <div>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{book.title}</h1>
              <p className="mt-1 text-lg text-slate-600">by {book.author}</p>
            </div>
            <StatusBadge book={book} />
          </div>
          <dl className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {rows.map(([label, value]) => (
              <div key={label} className="border-b border-slate-100 pb-2">
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
                <dd className="mt-1 text-slate-900">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-8 flex gap-3">
            <Link href={`/books/${book.id}/edit`} className="rounded-lg bg-indigo-600 px-5 py-2.5 font-semibold text-white hover:bg-indigo-700">
              Edit book
            </Link>
            <button
              onClick={() => {
                if (confirm(`Delete "${book.title}"? This can't be undone.`)) {
                  deleteBook(book.id);
                  router.push("/dashboard");
                }
              }}
              className="rounded-lg border border-red-200 px-5 py-2.5 font-medium text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function BookPage() {
  return (
    <AuthGuard>
      <BookDetails />
    </AuthGuard>
  );
}
