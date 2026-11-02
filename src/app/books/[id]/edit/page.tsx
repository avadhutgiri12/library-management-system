"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import BookForm from "@/components/BookForm";
import { updateBook, useBooks } from "@/lib/store";

function EditBook() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { books } = useBooks();
  const book = books.find((b) => b.id === id);

  if (!book) {
    return (
      <section className="tile py-16 text-center">
        <p aria-hidden className="text-4xl">📕</p>
        <p className="mt-3 font-semibold">This book doesn&apos;t exist or was deleted.</p>
        <Link href="/dashboard" className="btn-dark mt-5">Back to dashboard</Link>
      </section>
    );
  }

  const { id: _id, createdAt: _c, updatedAt: _u, ...initial } = book;
  void _id; void _c; void _u;

  return (
    <>
      <Link href={`/books/${book.id}`} className="text-sm font-semibold text-secondary-ink hover:underline">
        ← Back to book
      </Link>
      <h1 className="mt-3 mb-6 text-[32px] leading-tight font-bold tracking-tight">Edit “{book.title}”</h1>
      <BookForm
        initial={initial}
        submitLabel="Save changes"
        cancelHref={`/books/${book.id}`}
        onSubmit={(values) => {
          updateBook(book.id, values);
          router.push(`/books/${book.id}`);
        }}
      />
    </>
  );
}

export default function EditBookPage() {
  return (
    <AuthGuard>
      <EditBook />
    </AuthGuard>
  );
}
