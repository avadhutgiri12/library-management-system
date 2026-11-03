"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import BookCover from "@/components/BookCover";
import StatusBadge from "@/components/StatusBadge";
import { deleteBook, useBooks } from "@/lib/store";

function NotFound() {
  return (
    <section className="tile py-16 text-center">
      <p aria-hidden className="text-4xl">📕</p>
      <p className="mt-3 font-semibold">This book doesn&apos;t exist or was deleted.</p>
      <Link href="/dashboard" className="btn-dark mt-5">Back to dashboard</Link>
    </section>
  );
}

function BookDetails() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { books } = useBooks();
  const book = books.find((b) => b.id === id);
  if (!book) return <NotFound />;

  const issued = book.totalCopies - book.availableCopies;
  const pct = book.totalCopies ? Math.round((book.availableCopies / book.totalCopies) * 100) : 0;

  return (
    <>
      <Link href="/dashboard" className="text-sm font-semibold text-secondary-ink hover:underline">
        ← Back to dashboard
      </Link>

      <div className="mt-4 grid auto-rows-[minmax(110px,auto)] grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Cover */}
        <section className="tile col-span-2 row-span-3 flex items-center justify-center bg-primary-soft sm:col-span-1 lg:col-span-1">
          <BookCover src={book.coverUrl} title={book.title} className="aspect-[2/3] w-full max-w-[220px] rounded-xl shadow-lg" />
        </section>

        {/* Title */}
        <section className="tile col-span-2 row-span-2 flex flex-col justify-between sm:col-span-1 lg:col-span-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <span className="label-caps rounded-md bg-secondary-soft px-2 py-1 !text-secondary-ink">{book.category}</span>
            <StatusBadge book={book} />
          </div>
          <div className="mt-6">
            <h1 className="text-[32px] leading-tight font-bold tracking-tight sm:text-4xl">{book.title}</h1>
            <p className="mt-2 text-xl text-muted">by {book.author}</p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={`/books/${book.id}/edit`} className="btn-dark">Edit book</Link>
            <button
              onClick={() => {
                if (confirm(`Delete "${book.title}"? This can't be undone.`)) {
                  deleteBook(book.id);
                  router.push("/dashboard");
                }
              }}
              className="btn-danger"
            >
              Delete
            </button>
          </div>
        </section>

        {/* Stats */}
        <section className="tile">
          <h2 className="label-caps">Available</h2>
          <p className="mt-2 text-[32px] font-bold text-success">{book.availableCopies}</p>
        </section>
        <section className="tile">
          <h2 className="label-caps">Issued</h2>
          <p className="mt-2 text-[32px] font-bold text-secondary-ink">{issued}</p>
        </section>
        <section className="tile col-span-2 bg-primary lg:col-span-1">
          <h2 className="label-caps !text-ink/70">Total copies</h2>
          <p className="mt-2 text-[32px] font-bold">{book.totalCopies}</p>
        </section>

        {/* Meta */}
        <section className="tile col-span-2 lg:col-span-4">
          <dl className="grid gap-6 sm:grid-cols-3">
            <div>
              <dt className="label-caps">Published</dt>
              <dd className="mt-1 text-base font-medium">{book.publishedYear}</dd>
            </div>
            <div>
              <dt className="label-caps">Added on</dt>
              <dd className="mt-1 text-base font-medium">{new Date(book.createdAt).toLocaleDateString()}</dd>
            </div>
            <div>
              <dt className="label-caps">Last updated</dt>
              <dd className="mt-1 text-base font-medium">{new Date(book.updatedAt).toLocaleString()}</dd>
            </div>
          </dl>
          <div className="mt-6">
            <div className="flex justify-between text-sm">
              <span className="text-muted">On the shelf</span>
              <span className="font-semibold">{pct}%</span>
            </div>
            <div
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Copies on the shelf"
              className="mt-2 h-3 overflow-hidden rounded-full bg-secondary-soft"
            >
              <div className="h-full rounded-full bg-secondary" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </section>
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
