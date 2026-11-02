"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSession } from "@/lib/store";
import Navbar from "./Navbar";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { session, ready } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (ready && !session) router.replace("/");
  }, [ready, session, router]);

  if (!ready || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar name={session.name} />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
