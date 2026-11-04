"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PackageCheck, Search } from "lucide-react";
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
    <main className="mx-auto grid min-h-screen max-w-6xl content-center gap-4 p-4 sm:p-6 lg:grid-cols-12">
      {/* Hero */}
      <section className="tile flex flex-col justify-between gap-12 bg-primary lg:col-span-7 lg:row-span-2 lg:p-10">
        <Logo size="lg" />
        <div>
          <p className="spine">Catalogue · Stock · Admin</p>
          <h1 className="mt-4 max-w-xl text-4xl leading-[1.08] font-medium tracking-[-0.02em] text-ink sm:text-5xl">
            Every book and every copy in one catalogue
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-ink/75">
            Add, edit and find titles, and see what&apos;s on the shelf before a reader asks
          </p>
        </div>
      </section>

      {/* Sign in */}
      <section aria-labelledby="signin-h" className="tile lg:col-span-5 lg:row-span-2 lg:p-8">
        <h2 id="signin-h" className="text-2xl font-medium text-ink">Sign in</h2>
        <p className="mt-1 text-sm text-muted">Admin dashboard</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
          <div>
            <label htmlFor="email" className="text-sm font-medium">Email</label>
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
            <label htmlFor="password" className="text-sm font-medium">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="field"
            />
          </div>
          {error && (
            <p role="alert" className="rounded-md bg-red-50 px-3 py-2.5 text-sm font-medium text-danger">
              {error}
            </p>
          )}
          <button type="submit" className="btn-dark !h-11 w-full text-[15px]">
            Sign in
          </button>
        </form>
      </section>

      {/* Demo credentials */}
      <section aria-labelledby="demo-h" className="tile bg-secondary-soft lg:col-span-5">
        <h2 id="demo-h" className="eyebrow !text-secondary-ink">Demo credentials</h2>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex items-center justify-between gap-2">
            <dt className="text-muted">Email</dt>
            <dd className="font-mono">{DEMO_CREDENTIALS.email}</dd>
          </div>
          <div className="flex items-center justify-between gap-2">
            <dt className="text-muted">Password</dt>
            <dd className="font-mono">{DEMO_CREDENTIALS.password}</dd>
          </div>
        </dl>
        <button type="button" onClick={fillDemo} className="btn-ghost mt-4 w-full">
          Fill demo credentials
        </button>
      </section>

      {/* Features */}
      <section className="tile lg:col-span-4">
        <Search size={18} strokeWidth={1.5} className="text-muted" aria-hidden />
        <h3 className="mt-4 text-[15px] font-medium">Search</h3>
        <p className="mt-1 text-sm text-muted">Find a book by title or author</p>
      </section>
      <section className="tile lg:col-span-3">
        <PackageCheck size={18} strokeWidth={1.5} className="text-muted" aria-hidden />
        <h3 className="mt-4 text-[15px] font-medium">Live stock</h3>
        <p className="mt-1 text-sm text-muted">Copies on the shelf, per title</p>
      </section>
    </main>
  );
}
