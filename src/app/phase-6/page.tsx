/**
 * Phase 6 — Authentication
 * Route: /phase-6
 *
 * IMPORTANT NOTE:
 * ───────────────
 * This phase uses CODE PATTERN EXAMPLES ONLY.
 * next-auth / Auth.js is NOT installed in this project.
 * All auth code shown here is for learning purposes — it will not run.
 * The mini project simulates the auth UI without any real auth library.
 *
 * What you will learn:
 * - How Auth.js (NextAuth.js v5) works conceptually
 * - How to configure OAuth + Credentials providers
 * - How middleware protects routes before they render
 * - How to simulate auth state in a learning environment
 */

import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Phase 6 — Authentication",
  description: "Learn Auth.js patterns, middleware protection, and simulated auth UI in Next.js 15.",
};

// ─── Lesson data ──────────────────────────────────────────────────────────────
const LESSONS = [
  {
    slug: "01-nextauth-setup",
    number: "01",
    title: "Auth.js (NextAuth) Setup",
    description:
      "Learn how to configure Auth.js v5 — the standard auth solution for Next.js. " +
      "Covers OAuth providers (Google, GitHub), Credentials provider, session config, and callbacks.",
    concepts: [
      "Provider types (OAuth, Credentials)",
      "Session vs JWT strategy",
      "signIn / signOut callbacks",
      "[...nextauth] route handler",
    ],
    color: "blue",
  },
  {
    slug: "02-middleware-protection",
    number: "02",
    title: "Middleware Route Protection",
    description:
      "Protect routes before they even render. Middleware runs on the Edge — it intercepts " +
      "requests and can redirect unauthenticated users instantly.",
    concepts: [
      "middleware.ts placement",
      "withAuth HOC pattern",
      "getToken() in middleware",
      "Role-based access control",
    ],
    color: "purple",
  },
  {
    slug: "mini-project",
    number: "🎯",
    title: "Mini Project — Simulated Auth Demo",
    description:
      "A UI-only auth simulation. Shows the login → dashboard flow that you would " +
      "wire to real Auth.js in a production app. No library needed to understand the pattern.",
    concepts: [
      "Login form → dashboard transition",
      "useState for simulated auth state",
      "Where signIn() would plug in",
      "Protected content pattern",
    ],
    color: "green",
  },
];

// ─── Color helper ─────────────────────────────────────────────────────────────
// Maps lesson color names to Tailwind classes.
// We define these explicitly so Tailwind does not tree-shake them at build time.
const colorMap: Record<string, { border: string; bg: string; badge: string; dot: string }> = {
  blue: {
    border: "border-blue-500/20",
    bg: "bg-blue-500/5",
    badge: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    dot: "bg-blue-400",
  },
  purple: {
    border: "border-purple-500/20",
    bg: "bg-purple-500/5",
    badge: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    dot: "bg-purple-400",
  },
  green: {
    border: "border-green-500/20",
    bg: "bg-green-500/5",
    badge: "bg-green-500/20 text-green-400 border-green-500/30",
    dot: "bg-green-400",
  },
};

export default function Phase6Page() {
  return (
    <main className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto">
      {/* ── Breadcrumb ── */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-400 transition-colors">
          Home
        </Link>
        <span className="mx-2">›</span>
        <span className="text-gray-300">Phase 6</span>
      </nav>

      {/* ── Header ── */}
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl font-bold text-blue-400 font-mono">P6</span>
          <h1 className="text-3xl font-bold text-white">Authentication</h1>
        </div>
        <p className="text-gray-400 max-w-2xl mb-4">
          Auth.js (NextAuth.js v5) is the go-to authentication library for Next.js.
          This phase walks through how it works, how middleware guards routes, and how the
          login/logout flow is structured — all through code pattern examples.
        </p>

        {/* Notice banner — no real lib installed */}
        <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-4 text-sm text-yellow-300">
          <span className="font-semibold">📚 Learning Mode:</span>{" "}
          This phase uses code pattern examples only — next-auth is{" "}
          <span className="font-mono bg-black/30 px-1 rounded">NOT</span> installed.
          All code blocks are for reading and understanding, not for running.
        </div>
      </header>

      {/* ── Key concepts quick-ref ── */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Key Concepts in This Phase
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { icon: "🔑", label: "OAuth Provider", desc: "Delegate login to Google / GitHub — no passwords stored" },
            { icon: "🪙", label: "Session vs JWT", desc: "Where is the user identity stored between requests?" },
            { icon: "🛡️", label: "Middleware", desc: "Edge function that runs before every request — ideal for auth guard" },
            { icon: "🎭", label: "Role-Based Access", desc: "Different pages for admin vs regular user based on session data" },
          ].map(({ icon, label, desc }) => (
            <div key={label} className="rounded-lg border border-white/10 bg-white/2 p-3">
              <p className="text-sm font-semibold text-white">
                {icon} {label}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Lesson cards ── */}
      <div className="space-y-4">
        {LESSONS.map((lesson) => {
          const c = colorMap[lesson.color];
          return (
            <Link
              key={lesson.slug}
              href={`/phase-6/${lesson.slug}`}
              className={`group block rounded-xl border ${c.border} ${c.bg} hover:brightness-110 p-5 transition-all duration-200`}
            >
              <div className="flex items-center gap-3 mb-1">
                {/* Lesson number badge */}
                <span
                  className={`text-xs font-bold border ${c.badge} px-2 py-0.5 rounded-full font-mono`}
                >
                  {lesson.number}
                </span>
                <h3 className="text-base font-semibold text-white group-hover:text-blue-300 transition-colors">
                  {lesson.title}
                </h3>
              </div>
              <p className="text-sm text-gray-400 mb-3">{lesson.description}</p>
              <div className="flex flex-wrap gap-2">
                {lesson.concepts.map((concept) => (
                  <span
                    key={concept}
                    className="text-xs bg-white/5 border border-white/10 text-gray-400 px-2 py-0.5 rounded-full"
                  >
                    {concept}
                  </span>
                ))}
              </div>
            </Link>
          );
        })}
      </div>

      {/* ── Auth.js at a glance diagram ── */}
      <section className="mt-10 rounded-xl border border-white/10 bg-black/20 p-5">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Auth.js Flow (at a glance)
        </h2>
        <div className="font-mono text-xs space-y-1 text-gray-400">
          <p>
            <span className="text-blue-400">Browser</span>
            {" → "}
            <span className="text-yellow-400">signIn(&quot;google&quot;)</span>
            {" → "}
            <span className="text-purple-400">Google OAuth</span>
          </p>
          <p className="pl-4 text-gray-600">↳ redirect back with code</p>
          <p>
            <span className="text-purple-400">Auth.js callback</span>
            {" → "}
            <span className="text-green-400">creates session / JWT</span>
          </p>
          <p>
            <span className="text-green-400">Session cookie set</span>
            {" → "}
            <span className="text-blue-400">browser has auth</span>
          </p>
          <p className="pt-2">
            <span className="text-yellow-400">Subsequent requests</span>
            {" → "}
            <span className="text-red-400">middleware checks cookie</span>
            {" → "}
            allow / redirect
          </p>
        </div>
      </section>

      {/* ── Phase navigation ── */}
      <div className="mt-10 flex justify-between text-sm">
        <Link href="/phase-5" className="text-gray-500 hover:text-blue-400 transition-colors">
          ← Phase 5
        </Link>
        <Link href="/phase-7" className="text-blue-400 hover:text-blue-300 transition-colors">
          Phase 7 →
        </Link>
      </div>
    </main>
  );
}
