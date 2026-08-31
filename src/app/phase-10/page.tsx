/**
 * Phase 10 — Advanced Next.js Patterns
 * Route: /phase-10
 *
 * WHAT IS THIS PHASE ABOUT?
 * ──────────────────────────
 * Phase 10 covers advanced routing and runtime patterns in Next.js 15.
 * These are the features that separate intermediate Next.js developers
 * from experts. They solve real-world UI problems that simpler patterns
 * cannot handle elegantly.
 *
 * BUILD ON PHASES 0-9:
 * ─────────────────────
 * Before starting this phase, you should be comfortable with:
 * - App Router file-based routing (Phase 0)
 * - Server/Client Components and data fetching (Phases 1-3)
 * - Server Actions and forms (Phase 4)
 * - Authentication and middleware (Phases 5-6)
 * - Database and API patterns (Phases 7-8)
 * - Performance and caching (Phase 9)
 *
 * WHAT YOU WILL LEARN:
 * ─────────────────────
 * 1. INTERCEPTING ROUTES — Open a modal that shows /photo/3 in the URL
 *    while the background page stays visible. The URL is real and shareable,
 *    but navigation within the app shows it as an overlay.
 *
 * 2. PARALLEL ROUTES — Render multiple independent pages/components
 *    simultaneously inside one layout (e.g., a sidebar feed AND a main
 *    content area, each with their own loading/error states).
 *
 * 3. EDGE RUNTIME — Run route handlers and middleware on CDN edge nodes
 *    worldwide (not a single origin server). Ultra-low latency for
 *    geolocation logic, A/B testing, personalisation, and JWT validation.
 *
 * 4. INTERNATIONALIZATION (i18n) — Serve different languages/locales
 *    from URL-based routing (/en/..., /id/..., /ja/...). Learn the
 *    pattern used by the popular next-intl library.
 *
 * MINI PROJECT:
 * ──────────────
 * An interactive "Advanced Patterns Explorer" that summarises all four
 * patterns in one place — with expandable cards for use cases, folder
 * structures, and notes.
 */

import Link from "next/link";
import type { Metadata } from "next";

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "Phase 10 — Advanced Next.js",
  description:
    "Master advanced Next.js 15 patterns: intercepting routes, parallel routes, Edge Runtime, and internationalization.",
};

// ─── Lesson Data ──────────────────────────────────────────────────────────────
const LESSONS = [
  {
    slug: "01-intercepting-routes",
    number: "01",
    title: "Intercepting Routes",
    description:
      "Open a modal that has a real, shareable URL. Navigate directly to /photo/3 and see the full-page view; navigate within the app and see an overlay modal — same URL, different render context.",
    concepts: [
      "(..) notation",
      "Modal-as-route pattern",
      "@modal slot",
      "default.tsx fallback",
      "Hard nav vs soft nav",
    ],
    icon: "🪟",
    color: "border-violet-500/20 bg-violet-500/5 hover:border-violet-400/60",
    badge: "text-violet-400",
  },
  {
    slug: "02-parallel-routes",
    number: "02",
    title: "Parallel Routes",
    description:
      "Render multiple independent sub-pages simultaneously within a single layout. Each slot has its own loading, error, and not-found states — perfect for dashboards and split-panel UIs.",
    concepts: [
      "@slot folder naming",
      "layout.tsx receives slots as props",
      "default.tsx for unmatched slots",
      "Independent loading states",
      "Conditional rendering",
    ],
    icon: "🔀",
    color: "border-blue-500/20 bg-blue-500/5 hover:border-blue-400/60",
    badge: "text-blue-400",
  },
  {
    slug: "03-edge-runtime",
    number: "03",
    title: "Edge Runtime",
    description:
      "Run your route handlers and middleware at the network edge — on CDN nodes close to each user worldwide. Ultra-low latency for personalisation, A/B testing, and geolocation logic.",
    concepts: [
      "export const runtime = 'edge'",
      "Edge vs Node.js runtime",
      "Geolocation from headers",
      "A/B testing at the edge",
      "Edge limitations",
    ],
    icon: "⚡",
    color: "border-yellow-500/20 bg-yellow-500/5 hover:border-yellow-400/60",
    badge: "text-yellow-400",
  },
  {
    slug: "04-internationalization",
    number: "04",
    title: "Internationalization (i18n)",
    description:
      "Route users to language-specific URLs (/en/..., /id/..., /ja/...) via middleware. Learn the next-intl pattern for managing translation messages and locale detection.",
    concepts: [
      "Locale-based routing",
      "next-intl pattern",
      "Middleware locale detection",
      "useTranslations hook",
      "Message files",
    ],
    icon: "🌍",
    color: "border-green-500/20 bg-green-500/5 hover:border-green-400/60",
    badge: "text-green-400",
  },
  {
    slug: "mini-project",
    number: "🎯",
    title: "Mini Project — Advanced Patterns Explorer",
    description:
      "An interactive reference page summarising all Phase 10 patterns. Expandable cards per pattern with use cases, example folder structures, and key notes.",
    concepts: [
      "Server Component shell",
      "Client interactive cards",
      "useState expand/collapse",
      "Pattern comparison",
    ],
    icon: "🗺️",
    color: "border-orange-500/20 bg-orange-500/5 hover:border-orange-400/60",
    badge: "text-orange-400",
  },
] as const;

// ─── Page Component ────────────────────────────────────────────────────────────
export default function Phase10Page() {
  return (
    <main className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto">

      {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
      <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-blue-400 transition-colors">
          Home
        </Link>
        <span className="mx-2" aria-hidden="true">›</span>
        <span className="text-gray-300">Phase 10</span>
      </nav>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl font-bold text-blue-400 font-mono" aria-hidden="true">
            P10
          </span>
          <h1 className="text-3xl font-bold text-white">Advanced Next.js</h1>
        </div>
        <p className="text-gray-400 max-w-2xl leading-relaxed">
          The final phase. These are the advanced routing and runtime patterns
          that unlock sophisticated UIs, global-scale performance, and
          multi-language apps — all within the Next.js App Router.
        </p>

        {/* ── Prerequisites Banner ─────────────────────────────────────────── */}
        <div className="mt-4 rounded-xl border border-blue-500/30 bg-blue-500/5 px-4 py-3">
          <p className="text-sm text-blue-300 font-semibold mb-1">
            📚 Advanced patterns — build on Phases 0-9
          </p>
          <p className="text-xs text-blue-200/70 leading-relaxed">
            This phase assumes you are comfortable with App Router basics,
            Server/Client Components, data fetching, middleware, and caching.
            If anything feels unfamiliar, revisit the relevant earlier phase first.
          </p>
        </div>
      </header>

      {/* ── Lessons ──────────────────────────────────────────────────────────── */}
      <section aria-labelledby="lessons-heading">
        <h2
          id="lessons-heading"
          className="text-lg font-semibold text-white mb-4"
        >
          Lessons
        </h2>
        <div className="space-y-4">
          {LESSONS.map((lesson) => (
            <Link
              key={lesson.slug}
              href={`/phase-10/${lesson.slug}`}
              className={`group block rounded-xl border p-5 transition-all duration-200 ${lesson.color}`}
            >
              {/* Row: number + icon + title */}
              <div className="flex items-start gap-3 mb-2">
                <span className={`font-mono font-bold text-sm ${lesson.badge}`}>
                  {lesson.number}
                </span>
                <span className="text-lg leading-none" aria-hidden="true">
                  {lesson.icon}
                </span>
                <h3 className="text-base font-semibold text-white group-hover:text-blue-300 transition-colors">
                  {lesson.title}
                </h3>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-400 mb-3 ml-10">
                {lesson.description}
              </p>

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
      <div className="mt-10 flex justify-between text-sm">
        <Link
          href="/phase-9"
          className="text-gray-500 hover:text-blue-400 transition-colors"
        >
          ← Phase 9
        </Link>
        {/*
         * Phase 10 is the final phase.
         * No "next" link — the learner has reached the end.
         */}
        <span className="text-gray-600 italic text-xs self-center">
          End of course 🎓
        </span>
      </div>
    </main>
  );
}
