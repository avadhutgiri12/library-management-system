"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "@/components/Logo";
import { DEMO_CREDENTIALS, login, useSession } from "@/lib/store";

export default function LoginPage() {
  const router = useRouter();
  const { session, ready } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (ready && session) router.replace("/dashboard");
  }, [ready, session, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(email, password)) router.replace("/dashboard");
    else setError("That email and password don't match. Try the demo credentials.");
  };

  const fillDemo = () => {
    setEmail(DEMO_CREDENTIALS.email);
    setPassword(DEMO_CREDENTIALS.password);
    setError("");
  };

  return (
    <main className="mx-auto grid min-h-screen max-w-6xl content-center gap-4 p-4 sm:p-6 lg:grid-cols-12 lg:grid-rows-[auto_auto_auto]">
      {/* Hero tile */}
      <section className="tile flex flex-col justify-between gap-10 bg-primary lg:col-span-7 lg:row-span-2 lg:p-10">
        <Logo size="lg" />
        <div>
          <p className="label-caps !text-ink/70">Library management, simplified</p>
          <h1 className="mt-3 text-[32px] leading-tight font-bold tracking-tight text-ink sm:text-5xl">
            Every book, every copy, one tidy dashboard.
          </h1>
          <p className="mt-4 max-w-md text-base text-ink/80">
            Add, update, search and track your whole collection with LibraryHub.
          </p>
        </div>
      </section>

      {/* Sign-in tile */}
      <section aria-labelledby="signin-h" className="tile lg:col-span-5 lg:row-span-2 lg:p-8">
        <h2 id="signin-h" className="text-2xl font-bold text-ink">Welcome back</h2>
        <p className="mt-1 text-sm text-muted">Sign in to the admin dashboard.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
          <div>
            <label htmlFor="email" className="text-sm font-semibold">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="field"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-semibold">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="field"
            />
          </div>
          {error && (
            <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-danger">
              {error}
            </p>
          )}
          <button type="submit" className="btn-dark w-full !py-3 text-base">
            Sign in
          </button>
        </form>
      </section>

      {/* Demo credentials tile */}
      <section aria-labelledby="demo-h" className="tile bg-secondary-soft lg:col-span-5">
        <h2 id="demo-h" className="label-caps !text-secondary-ink">Demo credentials</h2>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex items-center justify-between gap-2">
            <dt className="text-muted">Email</dt>
            <dd className="font-mono font-medium">{DEMO_CREDENTIALS.email}</dd>
          </div>
          <div className="flex items-center justify-between gap-2">
            <dt className="text-muted">Password</dt>
            <dd className="font-mono font-medium">{DEMO_CREDENTIALS.password}</dd>
          </div>
        </dl>
        <button type="button" onClick={fillDemo} className="btn-ghost mt-4 w-full">
          Fill demo credentials
        </button>
      </section>

      {/* Feature tiles */}
      <section className="tile lg:col-span-4">
        <p aria-hidden className="text-2xl">🔎</p>
        <h3 className="mt-3 font-semibold">Instant search</h3>
        <p className="mt-1 text-sm text-muted">Find any book by title or author.</p>
      </section>
      <section className="tile lg:col-span-3">
        <p aria-hidden className="text-2xl">📦</p>
        <h3 className="mt-3 font-semibold">Live stock</h3>
        <p className="mt-1 text-sm text-muted">See what&apos;s available at a glance.</p>
      </section>
    </main>
  );
}
