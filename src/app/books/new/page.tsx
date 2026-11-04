"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import BookForm from "@/components/BookForm";
import { addBook } from "@/lib/store";

export default function NewBookPage() {
  const router = useRouter();
  return (
    <AuthGuard>
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
        <ArrowLeft size={16} strokeWidth={1.5} aria-hidden /> Dashboard
      </Link>
      <h1 className="mt-3 mb-6 text-[28px] leading-tight font-medium">Add a book</h1>
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
