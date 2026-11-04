"use client";

import { ArrowLeft, BookX } from "lucide-react";
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
        <BookX size={20} strokeWidth={1.5} className="mx-auto text-muted" aria-hidden />
        <p className="mt-3 font-medium">This book doesn&apos;t exist or was deleted</p>
        <Link href="/dashboard" className="btn-dark mt-5">Back to dashboard</Link>
      </section>
    );
  }

  const { id: _id, createdAt: _c, updatedAt: _u, ...initial } = book;
  void _id; void _c; void _u;

  return (
    <>
      <Link href={`/books/${book.id}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
        <ArrowLeft size={16} strokeWidth={1.5} aria-hidden /> Back to book
      </Link>
      <h1 className="mt-3 mb-6 text-[28px] leading-tight font-medium">Edit {book.title}</h1>
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
