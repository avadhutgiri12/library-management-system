import type { Book } from "@/lib/types";

export default function StatusBadge({ book }: { book: Book }) {
  const low = book.availableCopies > 0 && book.availableCopies <= 1;
  if (book.availableCopies === 0)
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-2.5 py-1 text-xs font-semibold text-danger">
        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-danger" /> Out of stock
      </span>
    );
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${
        low ? "bg-amber-50 text-amber-800" : "bg-green-50 text-green-800"
      }`}
    >
      <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${low ? "bg-warning" : "bg-success"}`} />
      {low ? "Last copy" : "Available"}
    </span>
  );
}
