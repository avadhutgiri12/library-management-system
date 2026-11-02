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
    if (login(email, password)) {
      router.replace("/dashboard");
    } else {
      setError("Invalid email or password. Use the demo credentials below.");
    }
  };

  const fillDemo = () => {
    setEmail(DEMO_CREDENTIALS.email);
    setPassword(DEMO_CREDENTIALS.password);
    setError("");
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="hidden flex-col justify-between bg-gradient-to-br from-indigo-600 to-indigo-900 p-12 text-white lg:flex">
        <Logo light />
        <div>
          <h1 className="text-4xl font-bold leading-tight">
            Manage your library,<br />all in one place.
          </h1>
          <p className="mt-4 max-w-md text-indigo-100">
            Add, update, search and track every book in your collection with
            LibraryHub.
          </p>
        </div>
        <p className="text-sm text-indigo-200">© LibraryHub · Demo project</p>
      </div>

      {/* Form */}
      <div className="flex items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
          <p className="mt-1 text-sm text-slate-500">Sign in to the admin dashboard.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
              />
            </label>
            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
            )}
            <button
              type="submit"
              className="w-full rounded-lg bg-indigo-600 py-2.5 font-semibold text-white shadow-sm hover:bg-indigo-700"
            >
              Sign in
            </button>
          </form>

          <div className="mt-8 rounded-xl border border-indigo-100 bg-indigo-50 p-4">
            <p className="text-sm font-semibold text-indigo-900">Demo credentials</p>
            <dl className="mt-2 space-y-1 text-sm text-indigo-800">
              <div className="flex justify-between gap-2">
                <dt>Email</dt>
                <dd className="font-mono">{DEMO_CREDENTIALS.email}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt>Password</dt>
                <dd className="font-mono">{DEMO_CREDENTIALS.password}</dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={fillDemo}
              className="mt-3 w-full rounded-lg border border-indigo-300 bg-white py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
            >
              Use demo credentials
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
