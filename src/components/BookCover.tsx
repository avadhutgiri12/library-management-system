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
        className={`flex items-center justify-center bg-gradient-to-br from-indigo-500 to-indigo-700 p-2 text-center text-xs font-semibold text-white ${className}`}
      >
        {title.slice(0, 40)}
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
