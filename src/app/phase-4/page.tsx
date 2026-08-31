/**
 * Phase 4 — Navigation & Metadata
 * Route: /phase-4
 *
 * WHAT IS THIS PHASE ABOUT?
 * ──────────────────────────
 * Phase 4 covers two closely related topics that control HOW users move
 * around your app and HOW search engines and social platforms understand it.
 *
 * 1. NAVIGATION
 *    Next.js provides multiple ways to navigate between pages:
 *    - <Link> component  → Declarative, handles prefetching automatically
 *    - useRouter hook    → Programmatic navigation (go back, push, replace)
 *    - usePathname hook  → Read the current URL path
 *    - useSearchParams   → Read query string parameters (?key=value)
 *    - redirect()        → Server-side redirect (in Server Components / actions)
 *
 * 2. METADATA API
 *    Next.js has a built-in Metadata API to control <head> contents:
 *    - export const metadata = { ... }   → Static metadata (known at build time)
 *    - export async function generateMetadata() → Dynamic metadata (from DB / params)
 *    - Open Graph tags    → Control how your link looks when shared on social media
 *    - Robots meta        → Tell search engine crawlers what to index
 *    - Structured data    → JSON-LD schema for rich search results
 *
 * 3. SPECIAL UI FILES
 *    The App Router has special filenames that create specific UI behaviors:
 *    - loading.tsx  → Automatically shown while the page is loading (Suspense)
 *    - error.tsx    → Shown when a runtime error occurs (Error Boundary)
 *    - not-found.tsx → Shown when notFound() is called or the route doesn&apos;t exist
 *
 * WHY THESE TOPICS TOGETHER?
 * ──────────────────────────
 * Navigation and metadata work hand-in-hand. Every page you navigate to
 * should have the right metadata. generateMetadata() often uses the same
 * route params (like [slug]) that your page component uses for rendering.
 */

import Link from "next/link";
import type { Metadata } from "next";

// ─── Static Metadata ──────────────────────────────────────────────────────────
// The `metadata` export is read by the Next.js framework at build time.
// It generates the <title> and <meta> tags in the HTML <head> automatically.
// You never need to manually write <head><title>...</title></head>.
export const metadata: Metadata = {
  title: "Phase 4 — Navigation & Metadata",
  description:
    "Learn the Link component, programmatic navigation with useRouter, the Metadata API, and special UI files (loading, error, not-found) in Next.js 15.",
};

// ─── Lesson Data ──────────────────────────────────────────────────────────────
// Each entry maps to one route inside /phase-4/.
// `as const` makes TypeScript infer literal types — better autocomplete and safety.
const LESSONS = [
  {
    slug: "01-link-router",
    number: "01",
    title: "Link & Router",
    description:
      "Explore the <Link> component for client-side navigation, prefetching, and programmatic navigation with useRouter, usePathname, and useSearchParams.",
    concepts: [
      "<Link> component",
      "Prefetching",
      "useRouter().push()",
      "usePathname()",
      "useSearchParams()",
      "redirect()",
    ],
    icon: "🔗",
    color: "border-blue-500/20 bg-blue-500/5 hover:border-blue-400/60",
    badge: "text-blue-400",
  },
  {
    slug: "02-metadata-api",
    number: "02",
    title: "Metadata API",
    description:
      "Control page titles, descriptions, Open Graph previews, and structured data using Next.js&apos;s static and dynamic Metadata APIs.",
    concepts: [
      "export const metadata",
      "generateMetadata()",
      "Open Graph (og:)",
      "Twitter Card",
      "robots meta",
      "JSON-LD",
    ],
    icon: "🏷️",
    color: "border-purple-500/20 bg-purple-500/5 hover:border-purple-400/60",
    badge: "text-purple-400",
  },
  {
    slug: "03-loading-error-ui",
    number: "03",
    title: "Loading & Error UI",
    description:
      "Use special filenames to create automatic loading skeletons, error boundaries, and custom 404 pages — all without any extra setup.",
    concepts: [
      "loading.tsx → Suspense boundary",
      "error.tsx → Error Boundary",
      "not-found.tsx",
      "notFound() function",
      "'use client' on error.tsx",
      "reset() callback",
    ],
    icon: "⚠️",
    color: "border-yellow-500/20 bg-yellow-500/5 hover:border-yellow-400/60",
    badge: "text-yellow-400",
  },
  {
    slug: "mini-project",
    number: "🎯",
    title: "Mini Project — SEO Portfolio",
    description:
      "Build an SEO-optimised portfolio page using generateMetadata(), Open Graph tags, keywords, and a clean Server Component layout.",
    concepts: [
      "generateMetadata()",
      "og:title / og:description",
      "keywords",
      "Server Component layout",
      "Simulated data",
      "Accessible markup",
    ],
    icon: "💼",
    color: "border-green-500/20 bg-green-500/5 hover:border-green-400/60",
    badge: "text-green-400",
  },
] as const;

// ─── Navigation Quick Reference ───────────────────────────────────────────────
// A summary table comparing all navigation approaches in one place.
// Beginners often confuse <Link>, useRouter, redirect() — this table clarifies.
const NAV_APPROACHES = [
  {
    method: "<Link href='/about'>",
    type: "Declarative",
    where: "JSX / Template",
    prefetch: "✅ Auto",
    useCase: "Normal page links, menus, cards",
    color: "text-blue-400",
  },
  {
    method: "router.push('/about')",
    type: "Programmatic",
    where: "Event handler (client)",
    prefetch: "✅ Auto",
    useCase: "After form submit, after login",
    color: "text-cyan-400",
  },
  {
    method: "router.replace('/about')",
    type: "Programmatic",
    where: "Event handler (client)",
    prefetch: "❌",
    useCase: "Replace history (no back button)",
    color: "text-cyan-400",
  },
  {
    method: "router.back()",
    type: "Programmatic",
    where: "Event handler (client)",
    prefetch: "❌",
    useCase: "Back button in custom UI",
    color: "text-cyan-400",
  },
  {
    method: "redirect('/login')",
    type: "Server-side",
    where: "Server Component / Action",
    prefetch: "❌",
    useCase: "Auth guards, form actions",
    color: "text-green-400",
  },
] as const;

// ─── Page Component ────────────────────────────────────────────────────────────
// No 'use client' → this is a Server Component by default.
// It renders pure HTML — no browser APIs, no hooks, no interactivity needed here.
export default function Phase4Page() {
  return (
    <main className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto">

      {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
      {/*
       * A breadcrumb trail shows users their current location in the site hierarchy.
       * The <nav aria-label="Breadcrumb"> gives screen readers context about
       * what kind of navigation this is.
       */}
      <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
        <span className="mx-2" aria-hidden="true">›</span>
        <span className="text-gray-300">Phase 4</span>
      </nav>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          {/* P4 label serves as a visual phase identifier */}
          <span className="text-2xl font-bold text-blue-400 font-mono" aria-hidden="true">P4</span>
          <h1 className="text-3xl font-bold text-white">Navigation &amp; Metadata</h1>
        </div>
        <p className="text-gray-400 max-w-2xl leading-relaxed">
          Master client-side navigation with the Link component and useRouter,
          control SEO with the Metadata API, and learn the special UI files
          that handle loading states, errors, and 404 pages automatically.
        </p>
      </header>

      {/* ── Navigation Comparison Table ─────────────────────────────────────── */}
      {/*
       * This table summarises all navigation methods in Next.js.
       * It appears before the lessons so learners get an overview first.
       * overflow-x-auto enables horizontal scrolling on small screens.
       */}
      <section className="mb-10" aria-labelledby="nav-comparison-heading">
        <h2 id="nav-comparison-heading" className="text-lg font-semibold text-white mb-3">
          Navigation Methods at a Glance
        </h2>
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="text-left p-3 text-gray-400 font-medium">Method</th>
                <th className="text-left p-3 text-gray-400 font-medium">Type</th>
                <th className="text-left p-3 text-gray-400 font-medium">Where</th>
                <th className="text-left p-3 text-gray-400 font-medium">Prefetch</th>
                <th className="text-left p-3 text-gray-400 font-medium">Use Case</th>
              </tr>
            </thead>
            <tbody>
              {NAV_APPROACHES.map((row, i) => (
                <tr
                  key={row.method}
                  className={`border-b border-white/5 ${i % 2 === 0 ? "" : "bg-white/2"}`}
                >
                  <td className={`p-3 font-mono text-xs font-semibold ${row.color}`}>
                    {row.method}
                  </td>
                  <td className="p-3 text-gray-400 text-xs">{row.type}</td>
                  <td className="p-3 text-gray-400 text-xs">{row.where}</td>
                  <td className="p-3 text-xs">{row.prefetch}</td>
                  <td className="p-3 text-gray-400 text-xs">{row.useCase}</td>
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
              href={`/phase-4/${lesson.slug}`}
              className={`group block rounded-xl border p-5 transition-all duration-200 ${lesson.color}`}
            >
              {/* Row: lesson number + icon + title */}
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

              {/* Concept tags — quick preview of what will be covered */}
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
       * Phase-level navigation lets learners move between phases without
       * returning to the home page. Always rendered at the bottom of the index.
       */}
      <div className="mt-10 flex justify-between text-sm">
        <Link
          href="/phase-3"
          className="text-gray-500 hover:text-blue-400 transition-colors"
        >
          ← Phase 3
        </Link>
        <Link
          href="/phase-5"
          className="text-blue-400 hover:text-blue-300 transition-colors"
        >
          Phase 5 →
        </Link>
      </div>
    </main>
  );
}
