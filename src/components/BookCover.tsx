"use client";

import { useState } from "react";

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
        className={`flex items-end bg-secondary-soft p-2 text-left text-xs font-semibold leading-tight text-secondary-ink ${className}`}
      >
        <span className="line-clamp-3">{title}</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={`Cover of ${title}`}
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  );
}
