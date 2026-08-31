/**
 * Phase 8 — Performance & Optimization
 * Route: /phase-8
 *
 * WHAT IS THIS PHASE ABOUT?
 * ──────────────────────────
 * Building a Next.js app that WORKS is step one.
 * Making it FAST is step two — and speed directly affects:
 *
 *   - Core Web Vitals (Google ranking signals)
 *   - User experience (people leave slow sites in under 3 seconds)
 *   - Conversion rates (Amazon found every 100ms delay = 1% revenue loss)
 *
 * This phase covers the four main performance levers in Next.js:
 *
 * 1. IMAGE OPTIMIZATION (next/image)
 *    Images are usually the #1 cause of slow pages.
 *    next/image automatically: resizes, converts to WebP, lazy-loads,
 *    and prevents Cumulative Layout Shift (CLS) by reserving space.
 *
 * 2. FONT OPTIMIZATION (next/font)
 *    Custom fonts slow down the First Contentful Paint and cause the
 *    "flash of unstyled text" (FOUT). next/font eliminates this by
 *    self-hosting Google Fonts with zero layout shift.
 *
 * 3. SCRIPT OPTIMIZATION (next/script)
 *    Third-party scripts (analytics, ads, chat widgets) are notorious
 *    performance killers. next/script gives you fine-grained control
 *    over WHEN each script loads — without hand-crafting async/defer.
 *
 * 4. BUNDLE ANALYSIS
 *    "Bundle" = all the JavaScript sent to the browser.
 *    Smaller bundles = faster page load. You learn to find what is
 *    making your bundle fat and split/remove it.
 *
 * CORE WEB VITALS — the three metrics Google measures:
 * ──────────────────────────────────────────────────────
 *   LCP (Largest Contentful Paint) — how fast is the biggest visible element?
 *        Target: < 2.5 seconds. Fixed by: image optimization, fast server.
 *   CLS (Cumulative Layout Shift) — does the page "jump" while loading?
 *        Target: < 0.1.  Fixed by: next/image, next/font, reserving space.
 *   INP (Interaction to Next Paint) — how fast does the UI respond to clicks?
 *        Target: < 200ms. Fixed by: smaller JS bundles, avoiding main thread work.
 */

import Link from "next/link";
import type { Metadata } from "next";

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "Phase 8 — Performance & Optimization",
  description:
    "Learn Next.js performance tools: next/image, next/font, next/script, and bundle analysis. Improve Core Web Vitals and ship faster pages.",
};

// ─── Lesson Data ──────────────────────────────────────────────────────────────
// Each lesson entry drives BOTH the card UI and the URL slug.
const LESSONS = [
  {
    slug: "01-image-optimization",
    number: "01",
    title: "Image Optimization",
    description:
      "Use next/image to automatically resize, convert to WebP, lazy-load, and prevent layout shift. The single biggest LCP win.",
    concepts: [
      "next/image",
      "width & height",
      "priority prop",
      "sizes prop",
      "fill layout",
      "remote patterns",
      "LCP improvement",
    ],
    icon: "🖼️",
    color: "border-blue-500/20 bg-blue-500/5 hover:border-blue-400/60",
    badge: "text-blue-400",
  },
  {
    slug: "02-font-optimization",
    number: "02",
    title: "Font Optimization",
    description:
      "Eliminate FOUT and CLS caused by custom fonts. next/font self-hosts Google Fonts and inlines font-display:swap with zero configuration.",
    concepts: [
      "next/font/google",
      "next/font/local",
      "CSS variables",
      "font-display: swap",
      "Zero layout shift",
      "Self-hosting",
    ],
    icon: "🔤",
    color: "border-purple-500/20 bg-purple-500/5 hover:border-purple-400/60",
    badge: "text-purple-400",
  },
  {
    slug: "03-script-optimization",
    number: "03",
    title: "Script Optimization",
    description:
      "Control WHEN third-party scripts load. Choose from four strategies: beforeInteractive, afterInteractive, lazyOnload, and worker.",
    concepts: [
      "next/script",
      "beforeInteractive",
      "afterInteractive",
      "lazyOnload",
      "worker strategy",
      "onLoad / onReady",
    ],
    icon: "📜",
    color: "border-green-500/20 bg-green-500/5 hover:border-green-400/60",
    badge: "text-green-400",
  },
  {
    slug: "04-bundle-analysis",
    number: "04",
    title: "Bundle Analysis",
    description:
      "Visualise what is making your JavaScript bundle fat. Learn @next/bundle-analyzer, tree shaking, dynamic imports, and barrel file anti-patterns.",
    concepts: [
      "@next/bundle-analyzer",
      "Tree shaking",
      "Dynamic import",
      "next/dynamic",
      "Code splitting",
      "Barrel file anti-pattern",
    ],
    icon: "📦",
    color: "border-orange-500/20 bg-orange-500/5 hover:border-orange-400/60",
    badge: "text-orange-400",
  },
  {
    slug: "mini-project",
    number: "🎯",
    title: "Mini Project — Optimization Checklist",
    description:
      "An interactive checklist of all optimization techniques covered in this phase. Check off items as you apply them to your own projects and track your score.",
    concepts: [
      "Interactive checklist",
      "useState",
      "Lighthouse score mapping",
      "All Phase 8 techniques",
    ],
    icon: "✅",
    color: "border-yellow-500/20 bg-yellow-500/5 hover:border-yellow-400/60",
    badge: "text-yellow-400",
  },
] as const;

// ─── Comparison Table Data ─────────────────────────────────────────────────────
// Quick at-a-glance: next/image vs <img>, next/font vs @import
const COMPARISON_ROWS = [
  {
    feature: "Image resizing",
    nextImage: "✅ Automatic (per device)",
    plain: "❌ Always full size",
  },
  {
    feature: "WebP conversion",
    nextImage: "✅ Automatic",
    plain: "❌ Manual",
  },
  {
    feature: "Lazy loading",
    nextImage: "✅ Built-in",
    plain: "⚠️ Manual loading='lazy'",
  },
  {
    feature: "CLS prevention",
    nextImage: "✅ Reserves space",
    plain: "❌ Causes layout shift",
  },
  {
    feature: "Priority (LCP)",
    nextImage: "✅ priority prop",
    plain: "⚠️ Manual fetchpriority",
  },
  {
    feature: "AVIF / WebP fallback",
    nextImage: "✅ Auto negotiation",
    plain: "❌ Manual <picture>",
  },
] as const;

const FONT_COMPARISON_ROWS = [
  {
    feature: "Self-hosted",
    nextFont: "✅ Always",
    cssImport: "❌ Google CDN request",
  },
  {
    feature: "Layout shift (CLS)",
    nextFont: "✅ Zero — size-adjust",
    cssImport: "❌ FOUT on first load",
  },
  {
    feature: "Privacy (GDPR)",
    nextFont: "✅ No Google request",
    cssImport: "⚠️ Sends user IP to Google",
  },
  {
    feature: "Caching",
    nextFont: "✅ Build-time, immutable",
    cssImport: "⚠️ Browser cache only",
  },
  {
    feature: "CSS variable support",
    nextFont: "✅ Built-in",
    cssImport: "❌ Manual",
  },
] as const;

// ─── Page Component ────────────────────────────────────────────────────────────
export default function Phase8Page() {
  return (
    <main className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto">

      {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
      <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-blue-400 transition-colors">
          Home
        </Link>
        <span className="mx-2" aria-hidden="true">›</span>
        <span className="text-gray-300">Phase 8</span>
      </nav>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl font-bold text-blue-400 font-mono" aria-hidden="true">
            P8
          </span>
          <h1 className="text-3xl font-bold text-white">
            Performance &amp; Optimization
          </h1>
        </div>
        <p className="text-gray-400 max-w-2xl leading-relaxed">
          Learn the built-in Next.js tools that make your app fast out of the box —
          optimized images, zero-CLS fonts, controlled script loading, and bundle
          analysis to find and remove dead weight.
        </p>

        {/* Core Web Vitals quick overview */}
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            {
              metric: "LCP",
              full: "Largest Contentful Paint",
              target: "< 2.5s",
              color: "border-blue-500/20 bg-blue-500/5",
              labelColor: "text-blue-400",
              fix: "next/image priority",
            },
            {
              metric: "CLS",
              full: "Cumulative Layout Shift",
              target: "< 0.1",
              color: "border-purple-500/20 bg-purple-500/5",
              labelColor: "text-purple-400",
              fix: "next/image + next/font",
            },
            {
              metric: "INP",
              full: "Interaction to Next Paint",
              target: "< 200ms",
              color: "border-green-500/20 bg-green-500/5",
              labelColor: "text-green-400",
              fix: "Smaller bundles",
            },
          ].map((v) => (
            <div key={v.metric} className={`rounded-xl border p-4 ${v.color}`}>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-lg font-bold font-mono ${v.labelColor}`}>
                  {v.metric}
                </span>
                <span className="text-xs text-gray-500 font-mono">{v.target}</span>
              </div>
              <p className="text-xs text-gray-400 font-medium mb-1">{v.full}</p>
              <p className="text-xs text-gray-600">Fix: {v.fix}</p>
            </div>
          ))}
        </div>
      </header>

      {/* ── next/image vs <img> Comparison ───────────────────────────────────── */}
      <section className="mb-10" aria-labelledby="image-comparison-heading">
        <h2
          id="image-comparison-heading"
          className="text-lg font-semibold text-white mb-3"
        >
          next/image vs plain &lt;img&gt;
        </h2>
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="text-left p-3 text-gray-400 font-medium">Feature</th>
                <th className="text-left p-3 text-blue-400 font-medium">
                  next/image
                </th>
                <th className="text-left p-3 text-red-400 font-medium">
                  &lt;img&gt; tag
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row, i) => (
                <tr
                  key={row.feature}
                  className={`border-b border-white/5 ${
                    i % 2 === 0 ? "" : "bg-white/2"
                  }`}
                >
                  <td className="p-3 text-gray-300 text-xs font-medium">
                    {row.feature}
                  </td>
                  <td className="p-3 text-gray-400 text-xs">{row.nextImage}</td>
                  <td className="p-3 text-gray-400 text-xs">{row.plain}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── next/font vs @import Comparison ──────────────────────────────────── */}
      <section className="mb-10" aria-labelledby="font-comparison-heading">
        <h2
          id="font-comparison-heading"
          className="text-lg font-semibold text-white mb-3"
        >
          next/font vs CSS @import
        </h2>
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="text-left p-3 text-gray-400 font-medium">Feature</th>
                <th className="text-left p-3 text-purple-400 font-medium">
                  next/font
                </th>
                <th className="text-left p-3 text-red-400 font-medium">
                  CSS @import
                </th>
              </tr>
            </thead>
            <tbody>
              {FONT_COMPARISON_ROWS.map((row, i) => (
                <tr
                  key={row.feature}
                  className={`border-b border-white/5 ${
                    i % 2 === 0 ? "" : "bg-white/2"
                  }`}
                >
                  <td className="p-3 text-gray-300 text-xs font-medium">
                    {row.feature}
                  </td>
                  <td className="p-3 text-gray-400 text-xs">{row.nextFont}</td>
                  <td className="p-3 text-gray-400 text-xs">{row.cssImport}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

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
              href={`/phase-8/${lesson.slug}`}
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
          href="/phase-7"
          className="text-gray-500 hover:text-blue-400 transition-colors"
        >
          ← Phase 7
        </Link>
        <Link
          href="/phase-9"
          className="text-blue-400 hover:text-blue-300 transition-colors"
        >
          Phase 9 →
        </Link>
      </div>
    </main>
  );
}
