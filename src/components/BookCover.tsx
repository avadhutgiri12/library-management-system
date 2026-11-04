"use client";

import { useState } from "react";

/** Real cover when it loads; otherwise a quiet cloth-bound spine with the title. */
export default function BookCover({
  src,
  title,
  className = "",
}: {
  src: string;
  title: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`relative flex flex-col justify-between overflow-hidden border border-line bg-[#ecebe6] p-3 text-left ${className}`}
      >
        <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 bg-ink/10" />
        <span aria-hidden className="block h-px w-6 bg-ink/25" />
        <span className="line-clamp-4 font-mono text-[11px] leading-[14px] text-ink/70">{title}</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={`Cover of ${title}`} onError={() => setFailed(true)} className={`object-cover ${className}`} />
  );
}
