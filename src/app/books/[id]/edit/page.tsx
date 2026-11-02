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
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
        <p className="text-slate-600">This book doesn&apos;t exist or was deleted.</p>
        <Link href="/dashboard" className="mt-4 inline-block font-medium text-indigo-600 hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const { id: _id, createdAt: _c, updatedAt: _u, ...initial } = book;
  void _id; void _c; void _u;

  return (
    <>
      <Link href={`/books/${book.id}`} className="text-sm font-medium text-indigo-600 hover:underline">
        ← Back to book
      </Link>
      <h1 className="mt-3 mb-6 text-2xl font-bold text-slate-900">Edit “{book.title}”</h1>
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
