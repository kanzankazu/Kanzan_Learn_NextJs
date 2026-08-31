/**
 * Phase 3 — Rendering Strategies
 * Route: /phase-3
 *
 * WHAT IS THIS PHASE ABOUT?
 * ──────────────────────────
 * In Next.js, "rendering strategy" means: WHEN and WHERE is the HTML generated?
 *
 * There are four main strategies:
 *
 * 1. STATIC RENDERING (SSG — Static Site Generation)
 *    HTML is generated ONCE at BUILD TIME, then served from a CDN.
 *    Fastest possible delivery. Good for pages that don&apos;t change often.
 *    Example: blog posts, marketing pages, documentation.
 *
 * 2. DYNAMIC RENDERING (SSR — Server-Side Rendering)
 *    HTML is generated on every REQUEST. The server runs the component
 *    fresh for each visitor. Good for personalised or real-time content.
 *    Example: user dashboards, search results, shopping carts.
 *
 * 3. ISR (Incremental Static Regeneration)
 *    A hybrid: page is statically generated, but automatically re-generated
 *    in the background after a time interval (or on-demand via a tag).
 *    Best of both worlds: CDN speed + fresh data.
 *    Example: news feeds, product listings, social counts.
 *
 * 4. STREAMING & SUSPENSE
 *    Instead of waiting for ALL data before sending HTML, Next.js streams
 *    the page in chunks. Static shell arrives instantly; slow parts
 *    trickle in as they resolve. Dramatically improves perceived performance.
 *    Example: dashboard with multiple independent slow queries.
 *
 * HOW NEXT.JS DECIDES (App Router rules):
 * ─────────────────────────────────────────
 * - Default = Static (if no dynamic APIs are used)
 * - Becomes Dynamic if you use: cookies(), headers(), searchParams, or
 *   fetch() without caching, or export const dynamic = 'force-dynamic'
 * - ISR = add `export const revalidate = N` (seconds) or `revalidateTag()`
 */

import Link from "next/link";
import type { Metadata } from "next";

// ─── Metadata ─────────────────────────────────────────────────────────────────
// `metadata` is a Next.js special export. The framework reads it at build
// time and injects the correct <title> and <meta> tags into the <head>.
// No manual <head> manipulation needed.
export const metadata: Metadata = {
  title: "Phase 3 — Rendering Strategies",
  description: "Learn Static Rendering (SSG), Dynamic Rendering (SSR), ISR, and Streaming in Next.js 15.",
};

// ─── Lesson Data ──────────────────────────────────────────────────────────────
// Each lesson entry maps to one route inside /phase-3/.
// Using `as const` makes the array deeply readonly and improves type inference.
const LESSONS = [
  {
    slug: "01-static-rendering",
    number: "01",
    title: "Static Rendering (SSG)",
    description:
      "HTML built once at deploy time. Served from CDN. Zero server work per request. Perfect for content that rarely changes.",
    concepts: ["generateStaticParams", "dynamicParams = false", "Build-time data fetch", "CDN-friendly output"],
    icon: "🏗️",
    color: "border-purple-500/20 bg-purple-500/5 hover:border-purple-400/60",
    badge: "text-purple-400",
  },
  {
    slug: "02-dynamic-rendering",
    number: "02",
    title: "Dynamic Rendering (SSR)",
    description:
      "Fresh HTML on every request. Access cookies, headers, and searchParams. Great for personalised or real-time pages.",
    concepts: ["cookies() / headers()", "searchParams prop", "force-dynamic", "Per-request execution"],
    icon: "⚡",
    color: "border-blue-500/20 bg-blue-500/5 hover:border-blue-400/60",
    badge: "text-blue-400",
  },
  {
    slug: "03-isr",
    number: "03",
    title: "Incremental Static Regeneration (ISR)",
    description:
      "Static page that auto-refreshes after N seconds. Background regeneration means users always get a fast response.",
    concepts: ["revalidate: N", "revalidateTag()", "Stale-while-revalidate", "On-demand invalidation"],
    icon: "♻️",
    color: "border-green-500/20 bg-green-500/5 hover:border-green-400/60",
    badge: "text-green-400",
  },
  {
    slug: "04-streaming-suspense",
    number: "04",
    title: "Streaming & Suspense",
    description:
      "Stream HTML in chunks as data resolves. Users see content immediately; slow parts fill in progressively.",
    concepts: ["<Suspense> boundaries", "loading.tsx", "Streaming HTML", "Improved TTFB"],
    icon: "🌊",
    color: "border-cyan-500/20 bg-cyan-500/5 hover:border-cyan-400/60",
    badge: "text-cyan-400",
  },
  {
    slug: "mini-project",
    number: "🎯",
    title: "Mini Project — News Site",
    description:
      "A simulated news site that demonstrates all four strategies: static list, ISR cache, dynamic personalisation, streaming headlines.",
    concepts: ["Mixed strategies", "Simulated data", "ISR + Dynamic together", "Suspense skeleton"],
    icon: "📰",
    color: "border-yellow-500/20 bg-yellow-500/5 hover:border-yellow-400/60",
    badge: "text-yellow-400",
  },
] as const;

// ─── Strategy Comparison Table ─────────────────────────────────────────────────
// A quick reference grid shown on the phase index page so learners can
// see all four strategies side-by-side before diving into each lesson.
const STRATEGIES = [
  {
    name: "Static",
    when: "Build time",
    trigger: "Default",
    speed: "⚡⚡⚡",
    freshness: "Deploy only",
    useCase: "Blog, docs, marketing",
    color: "text-purple-400",
  },
  {
    name: "Dynamic",
    when: "Every request",
    trigger: "cookies / headers / searchParams",
    speed: "⚡",
    freshness: "Always fresh",
    useCase: "Dashboard, cart, search",
    color: "text-blue-400",
  },
  {
    name: "ISR",
    when: "Build + background",
    trigger: "revalidate: N or tag",
    speed: "⚡⚡⚡ (cached)",
    freshness: "Every N seconds",
    useCase: "News feed, product prices",
    color: "text-green-400",
  },
  {
    name: "Streaming",
    when: "Request (chunked)",
    trigger: "<Suspense> boundaries",
    speed: "⚡⚡ (perceived)",
    freshness: "Always fresh",
    useCase: "Complex dashboards",
    color: "text-cyan-400",
  },
] as const;

// ─── Page Component ────────────────────────────────────────────────────────────
// No 'use client' → this is a Server Component.
// It renders only static HTML — no hooks, no interactivity needed.
export default function Phase3Page() {
  return (
    <main className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto">

      {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
      {/*
       * Breadcrumbs help users understand where they are in the site hierarchy.
       * Using <nav> with aria-label gives screen readers the right context.
       */}
      <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
        <span className="mx-2" aria-hidden="true">›</span>
        <span className="text-gray-300">Phase 3</span>
      </nav>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl font-bold text-blue-400 font-mono" aria-hidden="true">P3</span>
          <h1 className="text-3xl font-bold text-white">Rendering Strategies</h1>
        </div>
        <p className="text-gray-400 max-w-2xl leading-relaxed">
          Control WHEN and WHERE your pages are rendered — at build time, on each request, periodically, or streamed in chunks.
          This phase is the key to building both fast AND fresh Next.js apps.
        </p>
      </header>

      {/* ── Strategy Comparison Table ───────────────────────────────────────── */}
      {/*
       * Comparison table helps learners pick the right strategy.
       * overflow-x-auto makes it scrollable on narrow screens.
       */}
      <section className="mb-10" aria-labelledby="comparison-heading">
        <h2 id="comparison-heading" className="text-lg font-semibold text-white mb-3">
          Strategy Comparison
        </h2>
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="text-left p-3 text-gray-400 font-medium">Strategy</th>
                <th className="text-left p-3 text-gray-400 font-medium">Generated When</th>
                <th className="text-left p-3 text-gray-400 font-medium">Speed</th>
                <th className="text-left p-3 text-gray-400 font-medium">Freshness</th>
                <th className="text-left p-3 text-gray-400 font-medium">Use Case</th>
              </tr>
            </thead>
            <tbody>
              {STRATEGIES.map((s, i) => (
                <tr key={s.name} className={`border-b border-white/5 ${i % 2 === 0 ? "" : "bg-white/2"}`}>
                  {/* Strategy name with its unique colour */}
                  <td className={`p-3 font-semibold font-mono ${s.color}`}>{s.name}</td>
                  <td className="p-3 text-gray-400 text-xs">{s.when}</td>
                  <td className="p-3 text-gray-300 font-mono">{s.speed}</td>
                  <td className="p-3 text-gray-400 text-xs">{s.freshness}</td>
                  <td className="p-3 text-gray-400 text-xs">{s.useCase}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Lessons List ────────────────────────────────────────────────────── */}
      <section aria-labelledby="lessons-heading">
        <h2 id="lessons-heading" className="text-lg font-semibold text-white mb-4">Lessons</h2>
        <div className="space-y-4">
          {LESSONS.map((lesson) => (
            <Link
              key={lesson.slug}
              href={`/phase-3/${lesson.slug}`}
              className={`group block rounded-xl border p-5 transition-all duration-200 ${lesson.color}`}
            >
              {/* Row: number + icon + title */}
              <div className="flex items-start gap-3 mb-2">
                <span className={`font-mono font-bold text-sm ${lesson.badge}`}>
                  {lesson.number}
                </span>
                <span className="text-lg leading-none" aria-hidden="true">{lesson.icon}</span>
                <h3 className="text-base font-semibold text-white group-hover:text-blue-300 transition-colors">
                  {lesson.title}
                </h3>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-400 mb-3 ml-10">{lesson.description}</p>

              {/* Concept tags */}
              <div className="flex flex-wrap gap-2 ml-10">
                {lesson.concepts.map((c) => (
                  <span
                    key={c}
                    className="text-xs bg-white/5 border border-white/10 text-gray-400 px-2 py-0.5 rounded-full"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Phase Navigation ─────────────────────────────────────────────────── */}
      {/*
       * Phase-level navigation lets users move between phases without
       * going back to the home page. "← Phase 2" goes to the previous phase;
       * "Phase 4 →" advances to the next one.
       */}
      <div className="mt-10 flex justify-between text-sm">
        <Link
          href="/phase-2"
          className="text-gray-500 hover:text-blue-400 transition-colors"
        >
          ← Phase 2
        </Link>
        <Link
          href="/phase-4"
          className="text-blue-400 hover:text-blue-300 transition-colors"
        >
          Phase 4 →
        </Link>
      </div>
    </main>
  );
}
