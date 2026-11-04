import { LibraryBig } from "lucide-react";

export default function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  const box = size === "lg" ? "h-10 w-10" : "h-8 w-8";
  const icon = size === "lg" ? 20 : 18;
  const text = size === "lg" ? "text-xl" : "text-[17px]";
  return (
    <span className="flex items-center gap-2.5">
      <span aria-hidden className={`grid ${box} place-items-center rounded-md bg-ink text-white`}>
        <LibraryBig size={icon} strokeWidth={1.5} />
      </span>
      <span className={`${text} leading-none font-semibold text-ink`}>LibraryHub</span>
    </span>
  );
}
