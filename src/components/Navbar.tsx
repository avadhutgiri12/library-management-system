"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/store";
import Logo from "./Logo";

export default function Navbar({ name }: { name: string }) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-10 px-4 pt-4 sm:px-6">
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between rounded-2xl border border-line bg-tile/90 px-4 backdrop-blur sm:px-6"
      >
        <Link href="/dashboard" aria-label="LibraryHub dashboard">
          <Logo />
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-2 text-sm text-muted sm:flex">
            <span
              aria-hidden
              className="grid h-8 w-8 place-items-center rounded-full bg-secondary-soft text-sm font-bold text-secondary-ink"
            >
              {name.charAt(0)}
            </span>
            <span className="font-semibold text-ink">{name}</span>
            <span className="label-caps rounded-md bg-primary-soft px-2 py-0.5 !text-ink">
              Admin
            </span>
          </span>
          <button
            onClick={() => {
              logout();
              router.replace("/");
            }}
            className="btn-ghost !py-2"
          >
            Log out
          </button>
        </div>
      </nav>
    </header>
  );
}
