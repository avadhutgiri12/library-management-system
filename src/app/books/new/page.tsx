"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import BookForm from "@/components/BookForm";
import { addBook } from "@/lib/store";

export default function NewBookPage() {
  const router = useRouter();
  return (
    <AuthGuard>
      <Link href="/dashboard" className="text-sm font-medium text-indigo-600 hover:underline">
        ← Back to dashboard
      </Link>
      <h1 className="mt-3 mb-6 text-2xl font-bold text-slate-900">Add a new book</h1>
      <BookForm
        submitLabel="Add book"
        cancelHref="/dashboard"
        onSubmit={(values) => {
          const book = addBook(values);
          router.push(`/books/${book.id}`);
        }}
      />
    </AuthGuard>
  );
}
