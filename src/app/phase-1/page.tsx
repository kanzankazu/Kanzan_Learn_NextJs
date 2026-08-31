/**
 * Phase 1 — Server vs Client Components
 * Route: /phase-1
 *
 * This is THE most important concept in Next.js 13+.
 * Everything in app/ is a Server Component by default.
 * You only opt into a Client Component when you need:
 *   - useState / useReducer (local state)
 *   - useEffect (side effects / lifecycle)
 *   - Browser APIs (window, localStorage, document)
 *   - Event handlers (onClick, onChange, etc.)
 *   - Third-party client-only libraries
 */

import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Phase 1 — Server vs Client Components",
};

const LESSONS = [
  {
    slug: "01-server-components",
    title: "01 — React Server Components",
    description: "Run on the server only. Can be async. No hooks, no browser APIs. Zero JS sent to the browser.",
    concepts: ["async/await in JSX", "Direct DB/file access", "No useState/useEffect", "Serializable props only"],
  },
  {
    slug: "02-client-components",
    title: "02 — Client Components",
    description: "Opt in with 'use client'. Run on browser. Can use React hooks, event handlers, browser APIs.",
    concepts: ["'use client' directive", "useState & useEffect", "onClick & form handlers", "Browser APIs"],
  },
  {
    slug: "03-composition-patterns",
    title: "03 — Composition Patterns",
    description: "The key insight: Server Components CAN wrap Client Components. But Client Components CANNOT import Server Components.",
    concepts: ["Server wraps Client", "children as slot", "Passing RSC as prop", "Avoiding unnecessary 'use client'"],
  },
  {
    slug: "mini-project",
    title: "🎯 Mini Project — Dashboard",
    description: "Server Component shell that fetches data + Client Component widgets for interactivity.",
    concepts: ["Mixed RSC + Client", "Lifting client boundary", "Async server data + interactive UI"],
  },
];

export default function Phase1Page() {
  return (
    <main className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto">
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-300">Phase 1</span>
      </nav>

      <header className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl font-bold text-blue-400 font-mono">P1</span>
          <h1 className="text-3xl font-bold text-white">Server vs Client Components</h1>
        </div>
        <p className="text-gray-400 max-w-2xl">
          The most important mental model shift in Next.js 13+.
          By default, every component runs on the server. Add{" "}
          <code className="text-blue-300 bg-white/10 px-1 rounded">&apos;use client&apos;</code>{" "}
          only when you need browser features.
        </p>
      </header>

      {/* Quick comparison */}
      <div className="grid gap-4 mb-8" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4">
          <h3 className="text-sm font-semibold text-purple-400 mb-2">Server Component (default)</h3>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>✓ async/await in JSX</li>
            <li>✓ Direct DB/file access</li>
            <li>✓ Zero JS to browser</li>
            <li>✗ No useState/useEffect</li>
            <li>✗ No onClick/onChange</li>
          </ul>
        </div>
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
          <h3 className="text-sm font-semibold text-blue-400 mb-2">{"Client Component ('use client')"}</h3>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>✓ useState / useReducer</li>
            <li>✓ useEffect / lifecycle</li>
            <li>✓ Browser APIs</li>
            <li>✓ Event handlers</li>
            <li>✗ Cannot be async</li>
          </ul>
        </div>
      </div>

      <div className="space-y-4">
        {LESSONS.map((lesson) => (
          <Link key={lesson.slug} href={`/phase-1/${lesson.slug}`}
            className="group block rounded-xl border border-white/10 hover:border-blue-500/40 hover:bg-blue-500/5 p-5 transition-all duration-200">
            <h3 className="text-base font-semibold text-white mb-1 group-hover:text-blue-300 transition-colors">{lesson.title}</h3>
            <p className="text-sm text-gray-400 mb-3">{lesson.description}</p>
            <div className="flex flex-wrap gap-2">
              {lesson.concepts.map((c) => (
                <span key={c} className="text-xs bg-white/5 border border-white/10 text-gray-400 px-2 py-0.5 rounded-full">{c}</span>
              ))}
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-10 flex justify-between text-sm">
        <Link href="/phase-0" className="text-gray-500 hover:text-blue-400 transition-colors">← Phase 0</Link>
        <Link href="/phase-2" className="text-blue-400 hover:text-blue-300 transition-colors">Phase 2 →</Link>
      </div>
    </main>
  );
}
