/**
 * Lesson 04 — Streaming & Suspense
 * Route: /phase-3/04-streaming-suspense
 *
 * WHAT IS STREAMING?
 * ───────────────────
 * Streaming means the server sends HTML to the browser in CHUNKS, progressively,
 * instead of waiting for ALL data to be ready before sending anything.
 *
 * Without streaming:
 *   Browser waits → Server fetches all data (e.g., 3 seconds) → Server renders HTML → Browser gets everything at once
 *   TTFB (Time To First Byte): 3+ seconds → bad UX
 *
 * With streaming:
 *   Browser gets HTML shell instantly (< 100ms) → Slow parts stream in as they resolve
 *   TTFB: < 100ms → user sees content immediately
 *
 * ANALOGY:
 * ─────────
 * Imagine a restaurant that streams your meal in courses:
 * - Bread arrives immediately (HTML shell / static parts)
 * - Salad arrives 30s later (fast data sections)
 * - Main course arrives 2 minutes later (slow data sections)
 * vs. a restaurant that makes you wait until everything is ready.
 *
 * HOW REACT SUSPENSE ENABLES STREAMING:
 * ───────────────────────────────────────
 * <Suspense> is a React component that lets you define a "boundary":
 * - Everything INSIDE the Suspense boundary can be deferred
 * - The fallback (usually a skeleton/spinner) shows immediately
 * - When the async component resolves, React streams the real content
 *   and replaces the fallback via a script tag in the HTML stream
 *
 * WHAT IS loading.tsx?
 * ─────────────────────
 * loading.tsx is a special Next.js file convention.
 * Place it next to a page.tsx to automatically wrap that page in a Suspense boundary.
 *
 * File structure:
 *   app/
 *   └── dashboard/
 *       ├── loading.tsx  ← shown instantly while page.tsx is loading
 *       └── page.tsx     ← the actual page (can be slow/async)
 *
 * Next.js automatically does:
 *   <Suspense fallback={<Loading />}>
 *     <DashboardPage />
 *   </Suspense>
 *
 * WHY STREAMING IMPROVES TTFB:
 * ─────────────────────────────
 * TTFB = Time To First Byte = how long before the browser receives any HTML.
 * With streaming, the server sends the HTML skeleton immediately, then
 * streams the rest. The browser starts parsing and rendering while
 * the slow parts are still being fetched on the server.
 *
 * GRANULAR SUSPENSE BOUNDARIES:
 * ───────────────────────────────
 * You can nest multiple Suspense boundaries on one page:
 *   - Fast sections render immediately
 *   - Medium sections stream in after a few hundred milliseconds
 *   - Slow sections (heavy DB queries) stream in last
 * The user sees SOMETHING immediately and watches the page fill in.
 *
 * STREAMING vs POLLING vs WEBSOCKETS:
 * ─────────────────────────────────────
 * Streaming (this lesson) = server streams the initial HTML render
 * Polling = client periodically refetches data (useEffect + interval)
 * WebSockets = persistent bidirectional connection for real-time updates
 * → Streaming is for the INITIAL PAGE LOAD, not live updates after that.
 */

import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "04 — Streaming & Suspense",
  description:
    "Learn how to stream HTML chunks with React Suspense and loading.tsx to improve perceived performance.",
};

// ─── Simulated Async Components ───────────────────────────────────────────────
// These simulate Server Components that take different amounts of time.
// In a real app, the delay would come from DB queries or API calls.

/**
 * A fast section — resolves quickly (e.g., cached or simple query).
 * Wrap in <Suspense> so it can stream independently of slower sections.
 */
async function FastSection() {
  // Simulate a 200ms database query
  await new Promise((resolve) => setTimeout(resolve, 200));
  return (
    <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" aria-hidden="true" />
        <span className="text-xs font-semibold text-green-400">Fast Section (~200ms)</span>
      </div>
      <p className="text-sm text-gray-300">User profile loaded. Welcome back!</p>
      <p className="text-xs text-gray-500 mt-1">This section streamed in first.</p>
    </div>
  );
}

/**
 * A slow section — takes longer to resolve (heavy query, external API).
 * Users see the skeleton while waiting for this section.
 */
async function SlowSection() {
  // Simulate a 1200ms external API call
  await new Promise((resolve) => setTimeout(resolve, 1200));
  return (
    <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-2 h-2 rounded-full bg-blue-500" aria-hidden="true" />
        <span className="text-xs font-semibold text-blue-400">Slow Section (~1200ms)</span>
      </div>
      <p className="text-sm text-gray-300">Analytics data loaded. Revenue: $12,430</p>
      <p className="text-xs text-gray-500 mt-1">This section streamed in after the slow query finished.</p>
    </div>
  );
}

// ─── Skeleton Components (Fallbacks) ──────────────────────────────────────────
// These show INSTANTLY as the Suspense fallback while async components load.
// They give users visual feedback that something is loading.

function FastSectionSkeleton() {
  return (
    <div className="rounded-xl border border-white/10 bg-white/2 p-4 animate-pulse">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 rounded-full bg-white/20" />
        <div className="h-3 w-32 bg-white/10 rounded" />
      </div>
      <div className="h-4 w-48 bg-white/10 rounded mb-1" />
      <div className="h-3 w-36 bg-white/10 rounded" />
    </div>
  );
}

function SlowSectionSkeleton() {
  return (
    <div className="rounded-xl border border-white/10 bg-white/2 p-4 animate-pulse">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 rounded-full bg-white/20" />
        <div className="h-3 w-32 bg-white/10 rounded" />
      </div>
      <div className="h-4 w-56 bg-white/10 rounded mb-1" />
      <div className="h-3 w-44 bg-white/10 rounded" />
    </div>
  );
}

// ─── Code Examples ────────────────────────────────────────────────────────────
const CODE_EXAMPLES = [
  {
    id: "loading-tsx",
    label: "loading.tsx — automatic Suspense wrapper for a route",
    description:
      "Create a loading.tsx file next to page.tsx. Next.js automatically wraps page.tsx in a <Suspense> boundary using your loading.tsx as the fallback. Users see the loading UI instantly.",
    code: `// app/dashboard/loading.tsx
// This file is the fallback shown while dashboard/page.tsx is loading.
// It renders INSTANTLY — no waiting for any data.
//
// Next.js auto-generates:
//   <Suspense fallback={<Loading />}>
//     <DashboardPage />
//   </Suspense>

export default function Loading() {
  // Skeleton matching the layout of the actual page
  return (
    <div className="p-8 animate-pulse">
      {/* Header skeleton */}
      <div className="h-8 w-48 bg-white/10 rounded mb-4" />

      {/* Card skeletons */}
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-white/5 rounded-xl border border-white/10" />
        ))}
      </div>

      {/* Table skeleton */}
      <div className="mt-6 space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-10 bg-white/5 rounded" />
        ))}
      </div>
    </div>
  );
}`,
    borderColor: "border-yellow-500/20",
    bgColor: "bg-yellow-500/5",
  },
  {
    id: "suspense-manual",
    label: "Manual <Suspense> boundaries — granular streaming",
    description:
      "Instead of a single loading.tsx for the whole page, wrap individual sections in <Suspense>. Fast sections appear immediately; slow sections stream in when ready. Users see progressive content.",
    code: `// app/dashboard/page.tsx
import { Suspense } from 'react';
import { UserProfile } from './UserProfile';   // fast: 200ms
import { Analytics } from './Analytics';       // slow: 1200ms
import { RecentOrders } from './RecentOrders'; // medium: 600ms

export default function DashboardPage() {
  // The page shell renders INSTANTLY (no async here).
  // Each <Suspense> boundary resolves independently.
  return (
    <main>
      <h1>Dashboard</h1>

      {/* Fast section: streams in ~200ms */}
      <Suspense fallback={<div className="animate-pulse h-16 bg-white/5 rounded-xl" />}>
        <UserProfile />
        {/*
         * UserProfile is async — it fetches user data.
         * While it loads, the fallback (gray box) shows.
         * When done, React streams the real component HTML
         * and replaces the fallback without any client JS fetch.
         */}
      </Suspense>

      {/* Medium section: streams in ~600ms */}
      <Suspense fallback={<div className="animate-pulse h-24 bg-white/5 rounded-xl" />}>
        <RecentOrders />
      </Suspense>

      {/* Slow section: streams in ~1200ms */}
      <Suspense fallback={<div className="animate-pulse h-48 bg-white/5 rounded-xl" />}>
        <Analytics />
      </Suspense>
    </main>
  );
}

// ── Each section is its own async Server Component ────────────────────────────
async function UserProfile() {
  const user = await fetchUser(); // ~200ms
  return <div>Welcome, {user.name}!</div>;
}

async function RecentOrders() {
  const orders = await fetchRecentOrders(); // ~600ms
  return <ul>{orders.map(o => <li key={o.id}>{o.item}</li>)}</ul>;
}

async function Analytics() {
  const stats = await fetchAnalytics(); // ~1200ms
  return <div>Revenue: \${stats.revenue}</div>;
}`,
    borderColor: "border-cyan-500/20",
    bgColor: "bg-cyan-500/5",
  },
  {
    id: "streaming-no-streaming",
    label: "Without vs With streaming — the timing difference",
    description:
      "This example shows exactly why streaming matters. Without Suspense, the whole page blocks on the slowest component. With Suspense, fast parts appear immediately.",
    code: `// ── WITHOUT streaming ─────────────────────────────────────────────────────
// app/products/page-without-streaming.tsx
// The page awaits ALL data before rendering ANY HTML.
// If one query takes 2 seconds, the user sees NOTHING for 2 seconds.

export default async function ProductsPageNoStream() {
  const [featured, reviews, recommendations] = await Promise.all([
    fetchFeatured(),        // 200ms
    fetchReviews(),         // 400ms
    fetchRecommendations(), // 2000ms ← slowest, blocks everything
  ]);
  // TTFB: 2000ms (blocked by the slowest fetch)
  return (
    <div>
      <Featured data={featured} />
      <Reviews data={reviews} />
      <Recommendations data={recommendations} />
    </div>
  );
}

// ── WITH streaming ─────────────────────────────────────────────────────────
// app/products/page.tsx
// Each section renders independently as data resolves.
// Fast parts appear at 200ms, slow parts stream in at 2000ms.

import { Suspense } from 'react';

export default function ProductsPage() {
  // Note: this page component itself is NOT async.
  // The async work is inside the child Server Components.
  return (
    <div>
      {/* TTFB: < 50ms (just the shell) */}
      
      <Suspense fallback={<FeaturedSkeleton />}>
        <Featured />          {/* 200ms — streams in fast */}
      </Suspense>

      <Suspense fallback={<ReviewsSkeleton />}>
        <Reviews />           {/* 400ms — streams in medium */}
      </Suspense>

      <Suspense fallback={<RecommendationsSkeleton />}>
        <Recommendations />   {/* 2000ms — streams in last */}
      </Suspense>
    </div>
  );
}`,
    borderColor: "border-purple-500/20",
    bgColor: "bg-purple-500/5",
  },
  {
    id: "error-boundary",
    label: "Error Boundaries with Suspense — error.tsx",
    description:
      "Pair Suspense with error.tsx (or React&apos;s ErrorBoundary) to gracefully handle failures in streamed sections. If a slow section fails, only that section shows an error — the rest of the page still works.",
    code: `// app/dashboard/error.tsx
// This file catches errors thrown by any Server Component in dashboard/*.
// It MUST be a Client Component (needs React error boundary lifecycle).
'use client';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void; // retry the failed component subtree
}) {
  return (
    <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
      <p className="text-sm text-red-400 mb-2">Something went wrong loading this section.</p>
      <p className="text-xs text-gray-500 mb-3">{error.message}</p>
      <button
        onClick={reset} // Retries rendering the failed component
        className="text-xs text-blue-400 hover:text-blue-300"
      >
        Try again
      </button>
    </div>
  );
}

// Per-section error boundary (more granular than route-level error.tsx):
// Wrap individual slow sections in their own error boundaries
import { ErrorBoundary } from 'react-error-boundary'; // optional library

function DashboardPage() {
  return (
    <div>
      <Suspense fallback={<Skeleton />}>
        {/* If Analytics throws, only this section shows an error */}
        <Analytics />
      </Suspense>
    </div>
  );
}`,
    borderColor: "border-red-500/20",
    bgColor: "bg-red-500/5",
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
// This page USES Suspense to demonstrate streaming live.
// The FastSection and SlowSection above are real async Server Components —
// they will actually stream in at different times on the server.
export default function StreamingSuspensePage() {
  return (
    <main className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto">

      {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
      <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
        <span className="mx-2" aria-hidden="true">›</span>
        <Link href="/phase-3" className="hover:text-blue-400 transition-colors">Phase 3</Link>
        <span className="mx-2" aria-hidden="true">›</span>
        <span className="text-gray-300">Streaming & Suspense</span>
      </nav>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl" aria-hidden="true">🌊</span>
          <h1 className="text-3xl font-bold text-white">Streaming & Suspense</h1>
        </div>
        <p className="text-gray-400 leading-relaxed max-w-2xl">
          Stream HTML in chunks as data resolves. Users see content immediately
          while slow sections trickle in — dramatically improving perceived performance.
        </p>
      </header>

      {/* ── Live Demo ───────────────────────────────────────────────────────── */}
      {/*
       * LIVE DEMO: This section demonstrates actual streaming.
       * When you load this page, the shell and the heading render instantly.
       * FastSection streams in ~200ms, SlowSection ~1200ms.
       * During loading, the skeleton fallbacks show.
       *
       * NOTE: In development mode, React Strict Mode may affect timing.
       * The effect is clearest in production builds.
       */}
      <section className="mb-10" aria-labelledby="live-demo">
        <h2 id="live-demo" className="text-lg font-semibold text-white mb-2">
          Live Demo — Streaming in Action
        </h2>
        <p className="text-sm text-gray-400 mb-4">
          The two sections below are wrapped in individual{" "}
          <code className="text-cyan-300 font-mono text-xs">{"<Suspense>"}</code>{" "}
          boundaries. They resolve independently — watch them stream in at different times.
        </p>

        <div className="space-y-3">
          {/*
           * Suspense wraps an async Server Component.
           * fallback= is shown WHILE the async component is resolving.
           * Once resolved, React streams the real HTML and swaps it in.
           */}
          <Suspense fallback={<FastSectionSkeleton />}>
            <FastSection />
          </Suspense>

          <Suspense fallback={<SlowSectionSkeleton />}>
            <SlowSection />
          </Suspense>
        </div>

        <div className="mt-3 rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3">
          <p className="text-xs text-cyan-300">
            👆 This page shell rendered instantly. FastSection took ~200ms, SlowSection ~1200ms.
            The HTML was streamed in 3 chunks — try viewing source to see the deferred content markers.
          </p>
        </div>
      </section>

      {/* ── How It Works Technically ─────────────────────────────────────────── */}
      {/*
       * Explaining the mechanics helps beginners understand WHY this works
       * without needing client-side JS for the initial load.
       */}
      <section className="mb-10" aria-labelledby="how-it-works">
        <h2 id="how-it-works" className="text-lg font-semibold text-white mb-4">
          How Streaming Works Under the Hood
        </h2>
        <div className="rounded-xl border border-white/10 bg-white/2 p-5">
          <div className="space-y-3 text-sm">
            {[
              {
                step: "1",
                title: "Server sends HTML shell immediately",
                body: "The outer page component renders instantly (no async). The browser receives the <html>, <head>, nav, headers, and Suspense fallbacks within milliseconds.",
                color: "text-blue-400",
              },
              {
                step: "2",
                title: "Browser starts rendering the shell",
                body: "While the server is still processing slow components, the browser is already parsing and rendering what it has. Users see the skeleton/loading state.",
                color: "text-purple-400",
              },
              {
                step: "3",
                title: "Async components resolve on the server",
                body: "As each async Server Component finishes (fetches data, runs queries), Next.js renders it to HTML and adds it to the response stream.",
                color: "text-green-400",
              },
              {
                step: "4",
                title: "Streamed HTML replaces the fallback",
                body: "Next.js sends a small <script> tag with the resolved HTML. React uses this to swap out the fallback with the real content — no client fetch needed.",
                color: "text-yellow-400",
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-3">
                <span className={`font-mono font-bold text-sm shrink-0 ${item.color}`}>
                  {item.step}.
                </span>
                <div>
                  <p className="font-medium text-white text-sm">{item.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Suspense vs loading.tsx ───────────────────────────────────────────── */}
      <section className="mb-10" aria-labelledby="suspense-vs-loading">
        <h2 id="suspense-vs-loading" className="text-lg font-semibold text-white mb-4">
          {"<Suspense>"} vs loading.tsx
        </h2>
        <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
            <h3 className="text-sm font-semibold text-yellow-400 mb-2">loading.tsx</h3>
            <ul className="space-y-1.5 text-xs text-gray-400">
              <li className="flex gap-1.5"><span className="text-yellow-400">✓</span> Zero configuration</li>
              <li className="flex gap-1.5"><span className="text-yellow-400">✓</span> Auto-wraps the entire page</li>
              <li className="flex gap-1.5"><span className="text-yellow-400">✓</span> Works with layouts too</li>
              <li className="flex gap-1.5"><span className="text-gray-500">—</span> One loading state per route</li>
              <li className="flex gap-1.5"><span className="text-gray-500">—</span> Whole page is blocked by slowest part</li>
            </ul>
          </div>
          <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
            <h3 className="text-sm font-semibold text-cyan-400 mb-2">{"<Suspense>"} boundary</h3>
            <ul className="space-y-1.5 text-xs text-gray-400">
              <li className="flex gap-1.5"><span className="text-cyan-400">✓</span> Granular — per section</li>
              <li className="flex gap-1.5"><span className="text-cyan-400">✓</span> Multiple boundaries per page</li>
              <li className="flex gap-1.5"><span className="text-cyan-400">✓</span> Independent streaming timelines</li>
              <li className="flex gap-1.5"><span className="text-gray-500">—</span> Must write JSX manually</li>
              <li className="flex gap-1.5"><span className="text-gray-500">—</span> Need to create skeleton components</li>
            </ul>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Recommendation: use <strong className="text-gray-400">loading.tsx</strong> for simple routes,{" "}
          <strong className="text-gray-400">{"<Suspense>"}</strong> when a page has multiple
          independent slow sections that should stream independently.
        </p>
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

      {/* ── Key Rules ────────────────────────────────────────────────────────── */}
      <section className="mb-10 rounded-xl border border-white/10 bg-white/2 p-5" aria-labelledby="rules">
        <h2 id="rules" className="text-base font-semibold text-white mb-3">Rules & Gotchas</h2>
        <ul className="space-y-2 text-xs text-gray-400">
          {[
            "Suspense only works with async Server Components — Client Components need their own loading state (useState).",
            "The page component that CONTAINS Suspense should NOT be async. Move async work into the child components wrapped by Suspense.",
            "loading.tsx automatically wraps the page in Suspense — no need to add Suspense manually if you just want a single full-page loader.",
            "Nested Suspense boundaries: inner boundaries resolve before outer ones. The outermost boundary shows until ALL nested boundaries resolve.",
            "Streaming works in production by default. In development, Next.js may behave slightly differently due to Strict Mode double-rendering.",
          ].map((rule, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-cyan-400 shrink-0 mt-0.5">›</span>
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Lesson Navigation ────────────────────────────────────────────────── */}
      <div className="flex justify-between text-sm">
        <Link href="/phase-3/03-isr" className="text-gray-500 hover:text-blue-400 transition-colors">
          ← ISR
        </Link>
        <Link href="/phase-3/mini-project" className="text-blue-400 hover:text-blue-300 transition-colors">
          Mini Project →
        </Link>
      </div>
    </main>
  );
}
