/**
 * Lesson 03 — Incremental Static Regeneration (ISR)
 * Route: /phase-3/03-isr
 *
 * WHAT IS ISR?
 * ─────────────
 * ISR is a hybrid between Static (SSG) and Dynamic (SSR) rendering.
 *
 * The page is:
 *   1. Pre-rendered statically at BUILD time (like SSG)
 *   2. Automatically re-generated in the BACKGROUND after a set interval
 *      without taking down the site or blocking any users
 *
 * Users ALWAYS get a fast response from the cached version.
 * In the background, Next.js checks if the cache is stale and, if so,
 * re-runs the Server Component and saves a fresh HTML file.
 *
 * HOW THE STALE-WHILE-REVALIDATE PATTERN WORKS:
 * ───────────────────────────────────────────────
 * This is borrowed from HTTP caching (RFC 5861). The idea:
 *
 * Request 1 (fresh):  serve cached HTML immediately → schedule revalidation
 * Request 2 (stale):  serve OLD cached HTML while new HTML is being generated
 * Request 3 (fresh):  serve the NEW HTML (regeneration completed in background)
 *
 * In diagram form:
 *   [Build] → HTML cached  →  [visitor] → "fresh" (revalidate=60s starts)
 *                              [visitor 61s later] → still served old HTML
 *                                                 → background: regenerate
 *                              [next visitor] → served NEW HTML
 *
 * KEY INSIGHT: The "stale" user never waits — they get the old HTML instantly.
 * Only the GENERATION runs in the background (triggered by the stale request).
 *
 * TWO TYPES OF ISR:
 * ──────────────────
 * 1. TIME-BASED (revalidate: N)
 *    Re-generate every N seconds after the last successful generation.
 *    Simple — just add one export constant.
 *
 * 2. ON-DEMAND (revalidateTag / revalidatePath)
 *    Invalidate the cache explicitly when data changes (e.g., when an editor
 *    publishes a new blog post via CMS webhook). Much more precise than time-based.
 *
 * WHEN TO USE ISR:
 * ─────────────────
 * ✅ News sites / blogs (data updates every hour or so)
 * ✅ E-commerce product pages (prices change, but not per-second)
 * ✅ Social media feeds (show content with slight delay is acceptable)
 * ✅ Any page where "a few seconds stale" is acceptable
 *
 * WHEN NOT TO USE ISR:
 * ─────────────────────
 * ❌ Real-time dashboards (stock prices, live scores) → use SSR
 * ❌ User-specific pages (cart, profile) → use SSR
 * ❌ Pages that must reflect changes within seconds → use SSR or on-demand ISR
 *
 * ISR vs SSG vs SSR summary:
 * ────────────────────────────
 * SSG  → fast, staleness acceptable (only updates on new deploy)
 * ISR  → fast, configurable freshness (updates every N seconds or on-demand)
 * SSR  → always fresh, always a little slower
 */

import Link from "next/link";
import type { Metadata } from "next";

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "03 — Incremental Static Regeneration (ISR)",
  description:
    "Learn how ISR combines CDN speed with configurable freshness using revalidate and revalidateTag in Next.js 15.",
};

// ─── Code Examples ────────────────────────────────────────────────────────────
const CODE_EXAMPLES = [
  {
    id: "time-based-page",
    label: "Time-based ISR — revalidate: N at page level",
    description:
      "Add one export constant to a page file. The entire page re-generates in the background every N seconds. All fetch() calls inside also inherit this revalidation window.",
    code: `// app/news/page.tsx

// OPTION 1: revalidate at page level
// This tells Next.js: "regenerate this page at most every 60 seconds."
// The actual regeneration only happens when a request comes in AFTER
// the 60-second window has passed. If no one visits, it doesn&apos;t regenerate.
export const revalidate = 60; // seconds

export default async function NewsPage() {
  // This fetch also benefits from the 60s revalidation window.
  // Next.js caches the fetch result and the rendered HTML together.
  const articles = await fetch('https://api.example.com/articles').then(r => r.json());

  return (
    <main>
      <h1>Latest News</h1>
      {/* Small timestamp showing when this version was generated */}
      <p className="text-sm text-gray-500">
        Generated: {new Date().toISOString()}
      </p>
      <ul>
        {articles.map((a: { id: string; title: string }) => (
          <li key={a.id}>{a.title}</li>
        ))}
      </ul>
    </main>
  );
}`,
    borderColor: "border-green-500/20",
    bgColor: "bg-green-500/5",
  },
  {
    id: "time-based-fetch",
    label: "Time-based ISR — revalidate on individual fetch()",
    description:
      "Instead of setting revalidation at the page level, you can set it per-fetch call. This lets different data sources have different freshness windows within the same page.",
    code: `// app/dashboard/page.tsx
// NO page-level revalidate export — control per fetch

export default async function DashboardPage() {
  // ── Slow-changing data: refresh every 1 hour ──────────────────────────
  // Company stats don&apos;t change minute-to-minute.
  const stats = await fetch('https://api.example.com/stats', {
    next: { revalidate: 3600 }, // 3600 seconds = 1 hour
  }).then(r => r.json());

  // ── Medium-changing data: refresh every 5 minutes ─────────────────────
  // News headlines update more frequently.
  const headlines = await fetch('https://api.example.com/headlines', {
    next: { revalidate: 300 }, // 300 seconds = 5 minutes
  }).then(r => r.json());

  // ── Real-time data: never cache ────────────────────────────────────────
  // Live visitor count must always be fresh.
  const visitors = await fetch('https://api.example.com/visitors', {
    cache: 'no-store', // skip cache entirely → this makes the page DYNAMIC
  }).then(r => r.json());

  return (
    <main>
      <section>Stats (1h cache): {stats.users} users</section>
      <section>Headlines (5m cache): {headlines[0]?.title}</section>
      <section>Live visitors: {visitors.count}</section>
    </main>
  );
}`,
    borderColor: "border-blue-500/20",
    bgColor: "bg-blue-500/5",
  },
  {
    id: "on-demand-tag",
    label: "On-demand ISR — revalidateTag() triggered by a webhook",
    description:
      "Tag your fetch() calls, then call revalidateTag() from a Server Action or API Route when data changes. The cached page is invalidated immediately — no waiting for a time window.",
    code: `// ── Step 1: Tag the fetch in your page ───────────────────────────────────
// app/blog/[slug]/page.tsx
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const post = await fetch(\`https://cms.example.com/posts/\${slug}\`, {
    // Tag this fetch. When revalidateTag('blog') is called anywhere,
    // ALL fetches tagged 'blog' are invalidated and regenerated.
    next: { tags: ['blog', \`blog-\${slug}\`] },
  }).then(r => r.json());

  return <article>{post.content}</article>;
}

// ── Step 2: Invalidate on demand from an API Route / webhook ──────────────
// app/api/revalidate/route.ts
import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Verify the webhook secret to prevent unauthorized cache busting
  const secret = request.headers.get('x-webhook-secret');
  if (secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { tag } = body; // e.g., { tag: 'blog' } or { tag: 'blog-my-post-slug' }

  // Invalidate ALL pages/fetches tagged with this tag.
  // Next.js will regenerate them on the next request.
  revalidateTag(tag);

  return NextResponse.json({ revalidated: true, tag });
}`,
    borderColor: "border-purple-500/20",
    bgColor: "bg-purple-500/5",
  },
  {
    id: "revalidate-path",
    label: "On-demand ISR — revalidatePath() for a specific route",
    description:
      "revalidatePath() invalidates a specific URL path (or all pages under a path). More targeted than revalidateTag when you know exactly which page changed.",
    code: `// app/api/cms-webhook/route.ts
// Called by your CMS when an editor publishes or updates a page.

import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { slug, type } = await request.json();

  if (type === 'blog-post') {
    // Invalidate only this specific blog post URL
    revalidatePath(\`/blog/\${slug}\`);

    // Also invalidate the blog index (it lists all posts)
    revalidatePath('/blog');
  }

  if (type === 'site-settings') {
    // Invalidate ALL pages (layout-level data changed)
    // Pass 'layout' as the second argument to invalidate all
    // routes that use the layout containing this data.
    revalidatePath('/', 'layout');
  }

  return NextResponse.json({ ok: true });
}

// DIFFERENCE between revalidateTag and revalidatePath:
// revalidateTag('blog') → invalidates ALL fetches tagged 'blog' across ANY route
// revalidatePath('/blog/my-post') → invalidates ONLY the /blog/my-post route
// Use tags for data-oriented invalidation, paths for route-oriented invalidation.`,
    borderColor: "border-cyan-500/20",
    bgColor: "bg-cyan-500/5",
  },
] as const;

// ─── CodeBlock ─────────────────────────────────────────────────────────────────
function CodeBlock({
  code,
  label,
  description,
  borderColor,
  bgColor,
}: {
  code: string;
  label: string;
  description: string;
  borderColor: string;
  bgColor: string;
}) {
  return (
    <div className={`rounded-xl border p-5 ${borderColor} ${bgColor}`}>
      <p className="text-xs font-semibold text-gray-300 mb-2">{label}</p>
      <p className="text-xs text-gray-500 mb-3 leading-relaxed">{description}</p>
      <pre className="bg-black/40 border border-white/10 rounded-lg p-4 font-mono text-sm text-gray-300 overflow-x-auto leading-relaxed">
        {code}
      </pre>
    </div>
  );
}

// ─── Page Component ────────────────────────────────────────────────────────────
export default function ISRPage() {
  return (
    <main className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto">

      {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
      <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
        <span className="mx-2" aria-hidden="true">›</span>
        <Link href="/phase-3" className="hover:text-blue-400 transition-colors">Phase 3</Link>
        <span className="mx-2" aria-hidden="true">›</span>
        <span className="text-gray-300">ISR</span>
      </nav>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl" aria-hidden="true">♻️</span>
          <h1 className="text-3xl font-bold text-white">
            Incremental Static Regeneration (ISR)
          </h1>
        </div>
        <p className="text-gray-400 leading-relaxed max-w-2xl">
          The best of both worlds: CDN-speed delivery AND configurable freshness.
          Pages re-generate in the background while users always get a fast cached response.
        </p>
      </header>

      {/* ── Stale-While-Revalidate Visual ───────────────────────────────────── */}
      {/*
       * The stale-while-revalidate pattern is the heart of ISR.
       * A visual timeline helps beginners grasp the sequence of events
       * better than a text explanation alone.
       */}
      <section className="mb-10" aria-labelledby="swr-heading">
        <h2 id="swr-heading" className="text-lg font-semibold text-white mb-4">
          The Stale-While-Revalidate Pattern
        </h2>
        <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-5">
          {/* Timeline rows */}
          <div className="space-y-3 text-sm">
            {[
              {
                label: "Deploy (t=0)",
                event: "Page pre-rendered. HTML cached. Cache is FRESH.",
                dot: "bg-green-500",
              },
              {
                label: "Visitor at t=10s",
                event: "Served cached HTML instantly. revalidate=60 → still fresh (10s < 60s).",
                dot: "bg-green-500",
              },
              {
                label: "Visitor at t=65s",
                event: "Cache is STALE (65s > 60s). Served OLD HTML instantly. Background regeneration triggered.",
                dot: "bg-yellow-500",
              },
              {
                label: "Background job",
                event: "Next.js re-runs the Server Component, fetches fresh data, saves new HTML.",
                dot: "bg-blue-500",
              },
              {
                label: "Visitor at t=70s",
                event: "Served NEW HTML (regeneration complete). Cache is FRESH again.",
                dot: "bg-green-500",
              },
            ].map((row, i) => (
              <div key={i} className="flex items-start gap-3">
                {/* Timeline dot */}
                <div className="flex flex-col items-center shrink-0 pt-0.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${row.dot}`} />
                  {i < 4 && <div className="w-px h-6 bg-white/10 mt-1" />}
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-300">{row.label}</span>
                  <p className="text-xs text-gray-400 mt-0.5">{row.event}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Key insight callout */}
          <div className="mt-4 rounded-lg border border-green-500/30 bg-black/20 p-3">
            <p className="text-xs text-green-300">
              🔑 <strong>Key Insight:</strong> The visitor at t=65s is NOT blocked. They receive
              the stale (old) cached HTML immediately — zero wait. The regeneration happens
              asynchronously in the background. Only SUBSEQUENT requests get the fresh HTML.
            </p>
          </div>
        </div>
      </section>

      {/* ── ISR Types Comparison ─────────────────────────────────────────────── */}
      <section className="mb-10" aria-labelledby="isr-types">
        <h2 id="isr-types" className="text-lg font-semibold text-white mb-4">
          Time-Based vs On-Demand ISR
        </h2>
        <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
          {/* Time-based */}
          <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
            <h3 className="text-sm font-semibold text-yellow-400 mb-2">
              ⏱️ Time-Based
            </h3>
            <p className="text-xs text-gray-400 mb-3 leading-relaxed">
              Regenerate every N seconds. Simple, no infrastructure needed.
              Best when you know roughly how often data changes.
            </p>
            <pre className="bg-black/40 border border-white/10 rounded p-2 font-mono text-xs text-gray-300 mb-2 overflow-x-auto">
              {`// In your page file:
export const revalidate = 60;

// Or per-fetch:
fetch(url, { next: { revalidate: 3600 } })`}
            </pre>
            <ul className="text-xs text-gray-400 space-y-1">
              <li className="flex gap-1.5"><span className="text-green-400">✓</span> Simple — one line</li>
              <li className="flex gap-1.5"><span className="text-green-400">✓</span> No webhook infrastructure</li>
              <li className="flex gap-1.5"><span className="text-red-400">✗</span> Data may be up to N seconds stale</li>
              <li className="flex gap-1.5"><span className="text-red-400">✗</span> Regenerates even if data hasn&apos;t changed</li>
            </ul>
          </div>

          {/* On-demand */}
          <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4">
            <h3 className="text-sm font-semibold text-purple-400 mb-2">
              🎯 On-Demand
            </h3>
            <p className="text-xs text-gray-400 mb-3 leading-relaxed">
              Invalidate cache exactly when data changes — e.g., when a CMS
              editor publishes a post. Requires a webhook/API route.
            </p>
            <pre className="bg-black/40 border border-white/10 rounded p-2 font-mono text-xs text-gray-300 mb-2 overflow-x-auto">
              {`// Tag the fetch:
fetch(url, { next: { tags: ['blog'] } })

// Invalidate from API route:
revalidateTag('blog');
// or:
revalidatePath('/blog/my-post');`}
            </pre>
            <ul className="text-xs text-gray-400 space-y-1">
              <li className="flex gap-1.5"><span className="text-green-400">✓</span> Cache invalid immediately on change</li>
              <li className="flex gap-1.5"><span className="text-green-400">✓</span> Only regenerates when data actually changed</li>
              <li className="flex gap-1.5"><span className="text-red-400">✗</span> Requires webhook setup</li>
              <li className="flex gap-1.5"><span className="text-red-400">✗</span> More complex than time-based</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── Revalidate Values Quick Reference ────────────────────────────────── */}
      <section className="mb-10" aria-labelledby="values-ref">
        <h2 id="values-ref" className="text-lg font-semibold text-white mb-3">
          revalidate Values Reference
        </h2>
        <div className="rounded-xl border border-white/10 bg-white/2 p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-2 text-gray-400 font-medium">Value</th>
                  <th className="text-left p-2 text-gray-400 font-medium">Meaning</th>
                  <th className="text-left p-2 text-gray-400 font-medium">Equivalent to</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { val: "false", meaning: "Cache forever — never revalidate", eq: "SSG (default)" },
                  { val: "0", meaning: "Never cache — always fetch fresh", eq: "SSR (dynamic)" },
                  { val: "60", meaning: "Re-generate at most every 60 seconds", eq: "ISR (1 minute)" },
                  { val: "3600", meaning: "Re-generate at most every 1 hour", eq: "ISR (1 hour)" },
                  { val: "86400", meaning: "Re-generate at most every 24 hours", eq: "ISR (1 day)" },
                ].map((row) => (
                  <tr key={row.val} className="border-b border-white/5">
                    <td className="p-2 font-mono text-blue-300">{row.val}</td>
                    <td className="p-2 text-gray-400">{row.meaning}</td>
                    <td className="p-2 text-gray-500">{row.eq}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-600 mt-3">
            * Values are in seconds. fetch-level revalidate overrides page-level revalidate
            on a per-fetch basis, but the page cache respects the most conservative (lowest) value.
          </p>
        </div>
      </section>

      {/* ── Code Examples ────────────────────────────────────────────────────── */}
      <section className="mb-10" aria-labelledby="code-examples">
        <h2 id="code-examples" className="text-lg font-semibold text-white mb-4">Code Examples</h2>
        <div className="space-y-4">
          {CODE_EXAMPLES.map((ex) => (
            <CodeBlock key={ex.id} {...ex} />
          ))}
        </div>
      </section>

      {/* ── Common Gotchas ───────────────────────────────────────────────────── */}
      <section className="mb-10 rounded-xl border border-orange-500/20 bg-orange-500/5 p-5" aria-labelledby="gotchas">
        <h2 id="gotchas" className="text-base font-semibold text-white mb-3">
          Common Gotchas
        </h2>
        <ul className="space-y-2 text-xs text-gray-400">
          {[
            "ISR revalidation is TRIGGERED by a request, not a timer. If nobody visits the page after the revalidation window, it won't regenerate.",
            "Using cookies() or headers() in an ISR page makes the WHOLE PAGE dynamic (SSR). The revalidate setting is ignored.",
            "revalidate: 0 is ISR syntax for \"never cache\" — identical to { cache: 'no-store' } and makes the page fully dynamic.",
            "On-demand revalidation (revalidateTag / revalidatePath) only works in Server Actions and Route Handlers — NOT in regular Server Components.",
            "If multiple fetches in one page have different revalidate values, the page cache uses the SHORTEST interval.",
          ].map((gotcha, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-orange-400 shrink-0 mt-0.5">⚠️</span>
              <span>{gotcha}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Lesson Navigation ────────────────────────────────────────────────── */}
      <div className="flex justify-between text-sm">
        <Link href="/phase-3/02-dynamic-rendering" className="text-gray-500 hover:text-blue-400 transition-colors">
          ← Dynamic Rendering
        </Link>
        <Link href="/phase-3/04-streaming-suspense" className="text-blue-400 hover:text-blue-300 transition-colors">
          Streaming →
        </Link>
      </div>
    </main>
  );
}
