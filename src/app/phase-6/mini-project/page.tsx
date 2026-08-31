/**
 * Phase 6 — Mini Project: Simulated Auth Demo
 * Route: /phase-6/mini-project
 *
 * WHAT THIS DEMONSTRATES:
 * ────────────────────────
 * This page shows the pattern of a "protected dashboard" — the kind of page that
 * would only be visible to logged-in users in a real application.
 *
 * In a real app with Auth.js:
 *   1. middleware.ts would redirect here before the page renders if not logged in
 *   2. This Server Component would call auth() to get the session
 *   3. The dashboard would show personalized data fetched from a database
 *
 * Here, we simulate all of that with client-side state in LoginSimulator.
 * The pattern is identical — only the data source is mocked.
 *
 * WHY A SERVER COMPONENT FOR THIS PAGE?
 * - Server Components are the default in Next.js app router
 * - This page has no interactivity at the top level (just layout)
 * - The interactive auth simulation is isolated in LoginSimulator (Client Component)
 * - This is the correct architecture: keep the boundary as low as possible
 */

import Link from "next/link";
import type { Metadata } from "next";
import { LoginSimulator } from "./_components/LoginSimulator";

export const metadata: Metadata = {
  title: "🎯 Mini Project — Simulated Auth Demo | Phase 6",
  description: "A UI simulation of login, session state, and protected dashboard — no real auth library.",
};

export default function AuthMiniProjectPage() {
  return (
    <main className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto">
      {/* ── Breadcrumb ── */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
        <span className="mx-2">›</span>
        <Link href="/phase-6" className="hover:text-blue-400 transition-colors">Phase 6</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-300">Mini Project</span>
      </nav>

      {/* ── Header ── */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">🎯</span>
          <h1 className="text-3xl font-bold text-white">Simulated Auth Demo</h1>
        </div>
        <p className="text-gray-400 max-w-2xl">
          Experience the login → protected dashboard flow without any auth library.
          This simulation mirrors exactly how Auth.js would work — just with mock data
          instead of real OAuth or database calls.
        </p>
      </header>

      {/* ── Architecture note (Server Component section) ── */}
      <section className="mb-6 rounded-xl border border-white/10 bg-black/20 p-5">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Architecture (this page)
        </h2>
        <div className="font-mono text-xs space-y-0.5 text-gray-400">
          <p>
            <span className="text-purple-400">AuthMiniProjectPage</span>
            {" "}
            <span className="text-gray-600">(Server Component — layout, metadata)</span>
          </p>
          <p className="pl-4">
            <span className="text-gray-600">└── </span>
            <span className="text-blue-400">LoginSimulator</span>
            {" "}
            <span className="text-gray-600">(Client Component — useState, login/logout logic)</span>
          </p>
        </div>
        <p className="text-xs text-gray-600 mt-3">
          In a real app:{" "}
          <span className="text-gray-400">middleware.ts</span> would guard this route,
          and <span className="text-gray-400">auth()</span> would replace useState.
        </p>
      </section>

      {/* ── LoginSimulator — Client Component ── */}
      {/*
       * LoginSimulator is imported from _components/.
       * The underscore prefix (_components) is a Next.js convention for
       * "colocation folders" — files here are NOT treated as routes.
       * Only page.tsx / layout.tsx / route.ts are treated as routes.
       *
       * We pass no props here because the simulator manages its own state.
       * In a real app, you might pass initialSession from auth() as a prop
       * so the UI starts in the correct state without a client-side check.
       */}
      <LoginSimulator />

      {/* ── What would be different in production ── */}
      <section className="mt-8 rounded-xl border border-white/10 bg-black/20 p-5">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
          What Changes in a Real App
        </h2>
        <div className="space-y-3">
          {[
            {
              sim: "useState({ isLoggedIn, user })",
              real: "auth() → returns real session from JWT cookie",
              icon: "🔑",
            },
            {
              sim: "Hardcoded user object in component",
              real: "session.user with data from OAuth profile or DB",
              icon: "👤",
            },
            {
              sim: "setIsLoggedIn(true) on form submit",
              real: "signIn('google') or signIn('credentials', formData)",
              icon: "🚪",
            },
            {
              sim: "setIsLoggedIn(false) on logout click",
              real: "signOut({ callbackUrl: '/' }) — clears session cookie",
              icon: "👋",
            },
            {
              sim: "No route protection (page always accessible)",
              real: "middleware.ts redirects to /login before page renders",
              icon: "🛡️",
            },
          ].map(({ sim, real, icon }) => (
            <div key={icon} className="grid gap-2" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <div className="rounded-lg bg-white/3 border border-white/5 p-3">
                <p className="text-xs text-gray-600 mb-1">🧪 Simulation</p>
                <code className="text-xs text-yellow-300 font-mono">{sim}</code>
              </div>
              <div className="rounded-lg bg-green-500/5 border border-green-500/20 p-3">
                <p className="text-xs text-gray-600 mb-1">{icon} Real App</p>
                <code className="text-xs text-green-300 font-mono">{real}</code>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Phase navigation ── */}
      <div className="mt-10 flex justify-between text-sm">
        <Link href="/phase-6/02-middleware-protection" className="text-gray-500 hover:text-blue-400 transition-colors">
          ← Middleware Protection
        </Link>
        <Link href="/phase-7" className="text-blue-400 hover:text-blue-300 transition-colors">
          Phase 7 →
        </Link>
      </div>
    </main>
  );
}
