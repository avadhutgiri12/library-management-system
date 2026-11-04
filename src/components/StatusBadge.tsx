import type { Book } from "@/lib/types";

/** Quiet status: a small dot plus plain text, no filled pill. */
export default function StatusBadge({ book }: { book: Book }) {
  const out = book.availableCopies === 0;
  const low = !out && book.availableCopies <= 1;
  const dot = out ? "bg-danger" : low ? "bg-warning" : "bg-success";
  const text = out ? "text-danger" : low ? "text-amber-700" : "text-green-700";
  return (
    <span className={`inline-flex items-center gap-1.5 text-[13px] font-medium ${text}`}>
      <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {out ? "Out of stock" : low ? "Last copy" : "Available"}
    </span>
  );
}
