"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { logout } from "@/lib/store";
import Logo from "./Logo";

export default function Navbar({ name }: { name: string }) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-surface/90 backdrop-blur">
      <nav aria-label="Main" className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/dashboard" aria-label="LibraryHub dashboard">
          <Logo />
        </Link>
        <div className="flex items-center gap-4">
          <span className="hidden items-center gap-2 text-sm sm:flex">
            <span aria-hidden className="grid h-8 w-8 place-items-center rounded-full bg-secondary-soft text-[13px] font-semibold text-secondary-ink">
              {name.charAt(0)}
            </span>
            <span className="font-medium text-ink">{name}</span>
            <span className="spine">admin</span>
          </span>
          <button
            onClick={() => {
              logout();
              router.replace("/");
            }}
            className="btn-ghost !h-9 !px-3"
          >
            <LogOut size={16} strokeWidth={1.5} aria-hidden />
            Log out
          </button>
        </div>
      </nav>
    </header>
  );
}
