export default function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  const box = size === "lg" ? "h-12 w-12 text-2xl" : "h-10 w-10 text-xl";
  const text = size === "lg" ? "text-2xl" : "text-xl";
  return (
    <span className="flex items-center gap-3">
      <span
        aria-hidden
        className={`grid ${box} place-items-center rounded-xl bg-primary`}
      >
        📚
      </span>
      <span className={`${text} font-bold tracking-tight text-ink`}>
        Library<span className="text-secondary-ink">Hub</span>
      </span>
    </span>
  );
}
