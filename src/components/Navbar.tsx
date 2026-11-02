"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/store";
import Logo from "./Logo";

export default function Navbar({ name }: { name: string }) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/dashboard">
          <Logo />
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-slate-600 sm:inline">
            Signed in as <strong className="text-slate-900">{name}</strong>
            <span className="ml-2 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
              Admin
            </span>
          </span>
          <button
            onClick={() => {
              logout();
              router.replace("/");
            }}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
