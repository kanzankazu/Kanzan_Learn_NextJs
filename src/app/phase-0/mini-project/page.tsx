/**
 * Mini Project — Blog Routes (Phase 0)
 * Route: /phase-0/mini-project
 *
 * WHAT THIS MINI PROJECT DEMONSTRATES:
 * ──────────────────────────────────────
 * A multi-level blog routing structure built entirely with the App Router:
 *
 *   /blog               → list of all categories
 *   /blog/[category]    → list of posts in a category
 *   /blog/[category]/[slug] → individual post
 *
 * All powered by file-based routing — no router config, no switch statements.
 *
 * THIS PAGE IS THE "EXPLAINER" — the actual demo routes live below:
 *   - /phase-0/mini-project/blog
 *   - /phase-0/mini-project/blog/[category]
 *   - /phase-0/mini-project/blog/[category]/[slug]
 *
 * NOTE FOR LEARNING:
 * The blog routes are nested under /phase-0/mini-project/ to keep the
 * learning repo organised. In a real project, they'd be at the root level.
 */

import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "🎯 Mini Project — Blog Routes",
};

// ─── Simulated blog data ──────────────────────────────────────────────────────
// In a real app, this would come from a database or CMS.
// For learning purposes, we define it as a plain object here.
export const BLOG_DATA = {
  nextjs: {
    label: "Next.js",
    posts: [
      { slug: "routing-basics", title: "Routing Basics in Next.js", excerpt: "Learn the fundamentals of App Router." },
      { slug: "server-components", title: "Server Components Explained", excerpt: "What runs on the server vs the client." },
    ],
  },
  react: {
    label: "React",
    posts: [
      { slug: "hooks-intro", title: "React Hooks Introduction", excerpt: "useState, useEffect and friends." },
      { slug: "context-api", title: "Context API Deep Dive", excerpt: "Share state without prop drilling." },
    ],
  },
  typescript: {
    label: "TypeScript",
    posts: [
      { slug: "generics", title: "TypeScript Generics", excerpt: "Write flexible, type-safe code." },
    ],
  },
} as const;

export type Category = keyof typeof BLOG_DATA;

export default function MiniProjectPage() {
  return (
    <main className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto">

      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
        <span className="mx-2">›</span>
        <Link href="/phase-0" className="hover:text-blue-400 transition-colors">Phase 0</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-300">Mini Project</span>
      </nav>

      <header className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">🎯</span>
          <h1 className="text-3xl font-bold text-white">Mini Project — Blog Routes</h1>
        </div>
        <p className="text-gray-400">
          A multi-level blog with nested dynamic routes — all powered by the App Router.
        </p>
      </header>

      {/* Route structure overview */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-3">Route Structure</h2>
        <div className="rounded-xl border border-white/10 bg-black/30 p-5 font-mono text-sm">
          <div className="space-y-0.5">
            <p><span className="text-yellow-400">mini-project/</span></p>
            <p><span className="text-gray-600">└── </span><span className="text-yellow-400">blog/</span></p>
            <p><span className="text-gray-600">    ├── </span><span className="text-green-300">page.tsx</span>          <span className="text-gray-600">← /phase-0/mini-project/blog</span></p>
            <p><span className="text-gray-600">    └── </span><span className="text-yellow-400">[category]/</span></p>
            <p><span className="text-gray-600">        ├── </span><span className="text-green-300">page.tsx</span>      <span className="text-gray-600">← /blog/nextjs, /blog/react</span></p>
            <p><span className="text-gray-600">        └── </span><span className="text-yellow-400">[slug]/</span></p>
            <p><span className="text-gray-600">            └── </span><span className="text-green-300">page.tsx</span>  <span className="text-gray-600">← /blog/nextjs/routing-basics</span></p>
          </div>
        </div>
      </section>

      {/* Live demo links */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-3">Live Demo</h2>
        <div className="space-y-3">
          <Link
            href="/phase-0/mini-project/blog"
            className="group flex items-center justify-between rounded-xl border border-white/10 hover:border-blue-500/40 hover:bg-blue-500/5 p-4 transition-all"
          >
            <div>
              <p className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">Blog Index</p>
              <code className="text-xs text-gray-500">/phase-0/mini-project/blog</code>
            </div>
            <span className="text-gray-600 group-hover:text-blue-400">→</span>
          </Link>

          {Object.entries(BLOG_DATA).map(([cat, data]) => (
            <Link
              key={cat}
              href={`/phase-0/mini-project/blog/${cat}`}
              className="group flex items-center justify-between rounded-xl border border-white/10 hover:border-blue-500/40 hover:bg-blue-500/5 p-4 transition-all"
            >
              <div>
                <p className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">
                  Category: {data.label}
                </p>
                <code className="text-xs text-gray-500">/phase-0/mini-project/blog/{cat}</code>
              </div>
              <span className="text-gray-600 group-hover:text-blue-400">→</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Key concepts recap */}
      <section className="rounded-xl border border-green-500/20 bg-green-500/5 p-5 mb-8">
        <h2 className="text-sm font-semibold text-green-400 uppercase tracking-wide mb-3">Concepts Demonstrated</h2>
        <ul className="space-y-2">
          {[
            "Nested dynamic routes: [category]/[slug]",
            "notFound() for missing categories and posts",
            "Static data as a substitute for a real database",
            "Server Components throughout — no 'use client' needed for display pages",
          ].map((c, i) => (
            <li key={i} className="text-sm text-gray-400 flex gap-2">
              <span className="text-green-500 shrink-0">✓</span>
              {c}
            </li>
          ))}
        </ul>
      </section>

      {/* Navigation */}
      <div className="flex justify-between text-sm mt-4">
        <Link href="/phase-0/03-route-groups" className="text-gray-500 hover:text-blue-400 transition-colors">
          ← Route Groups
        </Link>
        <Link href="/phase-1" className="text-blue-400 hover:text-blue-300 transition-colors">
          Phase 1: Server vs Client →
        </Link>
      </div>
    </main>
  );
}
