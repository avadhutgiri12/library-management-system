import type { Book } from "@/lib/types";

export default function StatusBadge({ book }: { book: Book }) {
  return book.availableCopies > 0 ? (
    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
      Available
    </span>
  ) : (
    <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
      Out of stock
    </span>
  );
}
