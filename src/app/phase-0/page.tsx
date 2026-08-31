/**
 * Phase 0 — File-based Routing
 * app/phase-0/page.tsx  →  route: /phase-0
 *
 * WHAT YOU'LL LEARN IN THIS PHASE:
 * ──────────────────────────────────
 * 1. How the App Router maps files → URLs
 * 2. Dynamic segments: [slug], [...slug], [[...slug]]
 * 3. Route groups: (group) folders
 * 4. Nested layouts
 * 5. Special files: page.tsx, layout.tsx, loading.tsx, error.tsx, not-found.tsx
 *
 * This page is the phase index — it links to individual lessons.
 */

import Link from "next/link";
import type { Metadata } from "next";

// ─── SEO Metadata ─────────────────────────────────────────────────────────────
// Next.js reads this export and injects <title> / <meta> into the <head>.
// The root layout has `template: "%s | Kanzan Learn Next.js"` so the final
// title becomes "Phase 0 — File-based Routing | Kanzan Learn Next.js".
export const metadata: Metadata = {
  title: "Phase 0 — File-based Routing",
  description: "Learn how Next.js App Router maps folders and files to URLs.",
};

// ─── Lesson List ──────────────────────────────────────────────────────────────
const LESSONS = [
  {
    slug: "01-app-router-structure",
    title: "01 — App Router Structure",
    description:
      "Understand how app/ folder structure becomes URL structure. Learn page.tsx, layout.tsx, and template.tsx.",
    concepts: ["page.tsx → public route", "layout.tsx → persistent wrapper", "template.tsx → remounts on nav"],
  },
  {
    slug: "02-dynamic-routes",
    title: "02 — Dynamic Routes",
    description:
      "Create routes that match variable URL segments: /blog/hello, /blog/world — all from one file.",
    concepts: ["[slug] — single segment", "[...slug] — catch-all", "[[...slug]] — optional catch-all"],
  },
  {
    slug: "03-route-groups",
    title: "03 — Route Groups & Parallel Routes",
    description:
      "Use (group) folders to organise routes without affecting the URL. Add parallel route slots with @slot.",
    concepts: ["(group) — org without URL impact", "Route groups for shared layouts", "@slot — parallel routes"],
  },
  {
    slug: "mini-project",
    title: "🎯 Mini Project — Blog Routes",
    description:
      "Build a multi-level blog routing structure: /blog, /blog/[category], /blog/[category]/[slug].",
    concepts: ["Nested dynamic routes", "generateStaticParams", "notFound() for missing slugs"],
  },
];

// ─── Page Component ───────────────────────────────────────────────────────────
export default function Phase0Page() {
  return (
    <main className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto">

      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-300">Phase 0</span>
      </nav>

      {/* Header */}
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl font-bold text-blue-400 font-mono">P0</span>
          <h1 className="text-3xl font-bold text-white">File-based Routing</h1>
        </div>
        <p className="text-gray-400 max-w-2xl">
          In Next.js, your folder structure IS your router. No manual route
          registration needed — just create a <code className="text-blue-300 bg-white/10 px-1 rounded">page.tsx</code> file
          and that folder becomes a URL.
        </p>
      </header>

      {/* Core Concept Box */}
      <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-5 mb-8">
        <h2 className="text-sm font-semibold text-blue-400 mb-3 uppercase tracking-wide">
          Core Mental Model
        </h2>
        <div className="font-mono text-sm text-gray-300 space-y-1">
          <p><span className="text-gray-500">app/</span><span className="text-blue-300">page.tsx</span>         → <span className="text-green-400">/</span></p>
          <p><span className="text-gray-500">app/about/</span><span className="text-blue-300">page.tsx</span>   → <span className="text-green-400">/about</span></p>
          <p><span className="text-gray-500">app/blog/</span><span className="text-blue-300">page.tsx</span>    → <span className="text-green-400">/blog</span></p>
          <p><span className="text-gray-500">app/blog/[slug]/</span><span className="text-blue-300">page.tsx</span> → <span className="text-green-400">/blog/anything</span></p>
          <p><span className="text-gray-500">app/(auth)/login/</span><span className="text-blue-300">page.tsx</span> → <span className="text-green-400">/login</span> <span className="text-gray-500">(group ignored in URL)</span></p>
        </div>
      </div>

      {/* Lessons */}
      <div className="space-y-4">
        {LESSONS.map((lesson) => (
          <Link
            key={lesson.slug}
            href={`/phase-0/${lesson.slug}`}
            className="group block rounded-xl border border-white/10 hover:border-blue-500/40 hover:bg-blue-500/5 p-5 transition-all duration-200"
          >
            <h3 className="text-base font-semibold text-white mb-1 group-hover:text-blue-300 transition-colors">
              {lesson.title}
            </h3>
            <p className="text-sm text-gray-400 mb-3">{lesson.description}</p>
            <div className="flex flex-wrap gap-2">
              {lesson.concepts.map((c) => (
                <span key={c} className="text-xs bg-white/5 border border-white/10 text-gray-400 px-2 py-0.5 rounded-full">
                  {c}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>

      {/* Back link */}
      <div className="mt-10">
        <Link href="/" className="text-sm text-gray-500 hover:text-blue-400 transition-colors">
          ← Back to all phases
        </Link>
      </div>
    </main>
  );
}
