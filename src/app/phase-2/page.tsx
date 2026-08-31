/**
 * Phase 2 — Data Fetching
 * Route: /phase-2
 *
 * WHAT IS THIS PHASE ABOUT?
 * ──────────────────────────
 * In the old Next.js (Pages Router), you had getServerSideProps, getStaticProps, etc.
 * In Next.js 13+ App Router, ALL of that is replaced by:
 *
 *   1. fetch() in Server Components (lesson 01)
 *   2. Next.js caching & revalidation built into fetch() (lesson 02)
 *   3. Parallel vs Sequential fetch strategies (lesson 03)
 *   4. Server Actions for mutations (lesson 04)
 *
 * The big idea: fetch runs on the server, inside your component tree.
 * No more API routes just to fetch data for your page.
 */

import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Phase 2 — Data Fetching",
};

// ─── Lesson definitions ───────────────────────────────────────────────────────
// Each lesson has a slug (URL path), title, description, and key concepts.
const LESSONS = [
  {
    slug: "01-server-fetch",
    title: "01 — fetch() in Server Components",
    description:
      "Use fetch() directly in async Server Components. No useEffect, no loading state — the page simply awaits the data before rendering.",
    concepts: ["async Server Component", "Direct fetch()", "No useEffect", "Server-side execution"],
  },
  {
    slug: "02-caching-revalidation",
    title: "02 — Caching & Revalidation",
    description:
      "Next.js extends the native fetch() API with powerful caching controls. Learn force-cache, no-store, time-based revalidation, and on-demand revalidation.",
    concepts: ["cache: force-cache", "cache: no-store", "next.revalidate", "revalidatePath / revalidateTag"],
  },
  {
    slug: "03-parallel-sequential",
    title: "03 — Parallel vs Sequential Fetching",
    description:
      "Avoid accidental waterfalls. Fetch independent data in parallel with Promise.all. Use sequential fetch only when one result depends on another.",
    concepts: ["Promise.all()", "Waterfall problem", "Performance timing", "When to use each"],
  },
  {
    slug: "04-server-actions",
    title: "04 — Server Actions",
    description:
      "Run server-side code directly from form submissions or button clicks. No API route needed. Perfect for mutations: create, update, delete.",
    concepts: ["'use server'", "form action attribute", "useFormStatus", "Mutations + revalidate"],
  },
  {
    slug: "mini-project",
    title: "🎯 Mini Project — Todo App",
    description:
      "A full Todo App that combines async server-side data loading with client-side mutations — demonstrating the complete data fetching story from Phase 2.",
    concepts: ["Server data load", "Client state management", "Add / Toggle / Delete", "RSC + Client hybrid"],
  },
];

export default function Phase2Page() {
  return (
    <main className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto">

      {/* Breadcrumb — helps user understand where they are in the app */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-300">Phase 2</span>
      </nav>

      <header className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl font-bold text-blue-400 font-mono">P2</span>
          <h1 className="text-3xl font-bold text-white">Data Fetching</h1>
        </div>
        <p className="text-gray-400 max-w-2xl">
          Next.js 13+ replaces <code className="text-blue-300 bg-white/10 px-1 rounded">getServerSideProps</code> and{" "}
          <code className="text-blue-300 bg-white/10 px-1 rounded">getStaticProps</code> with a simpler model:{" "}
          just <code className="text-blue-300 bg-white/10 px-1 rounded">async</code> Server Components and an extended{" "}
          <code className="text-blue-300 bg-white/10 px-1 rounded">fetch()</code> API.
        </p>
      </header>

      {/* Quick comparison: old vs new */}
      <div className="grid gap-4 mb-8" style={{ gridTemplateColumns: "1fr 1fr" }}>
        {/* Old way (Pages Router) */}
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <h3 className="text-sm font-semibold text-red-400 mb-2">Old Way (Pages Router)</h3>
          <ul className="text-xs text-gray-400 space-y-1">
            <li className="line-through opacity-60">getServerSideProps (SSR)</li>
            <li className="line-through opacity-60">getStaticProps (SSG)</li>
            <li className="line-through opacity-60">getStaticPaths</li>
            <li className="line-through opacity-60">useEffect for client fetch</li>
            <li className="line-through opacity-60">SWR / React Query for caching</li>
          </ul>
        </div>

        {/* New way (App Router) */}
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
          <h3 className="text-sm font-semibold text-blue-400 mb-2">New Way (App Router)</h3>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>✓ <code className="text-blue-300">async</code> Server Component</li>
            <li>✓ <code className="text-blue-300">fetch()</code> with cache options</li>
            <li>✓ <code className="text-blue-300">next.revalidate</code> for ISR</li>
            <li>✓ Server Actions for mutations</li>
            <li>✓ Built-in request deduplication</li>
          </ul>
        </div>
      </div>

      {/* Lesson cards */}
      <div className="space-y-4">
        {LESSONS.map((lesson) => (
          <Link
            key={lesson.slug}
            href={`/phase-2/${lesson.slug}`}
            className="group block rounded-xl border border-white/10 hover:border-blue-500/40 hover:bg-blue-500/5 p-5 transition-all duration-200"
          >
            <h3 className="text-base font-semibold text-white mb-1 group-hover:text-blue-300 transition-colors">
              {lesson.title}
            </h3>
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
        ))}
      </div>

      {/* Phase navigation */}
      <div className="mt-10 flex justify-between text-sm">
        <Link href="/phase-1" className="text-gray-500 hover:text-blue-400 transition-colors">
          ← Phase 1
        </Link>
        <Link href="/phase-3" className="text-blue-400 hover:text-blue-300 transition-colors">
          Phase 3 →
        </Link>
      </div>
    </main>
  );
}
