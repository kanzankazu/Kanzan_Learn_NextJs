/**
 * Phase 4 — Lesson 03: Loading & Error UI
 * Route: /phase-4/03-loading-error-ui
 *
 * WHAT YOU WILL LEARN:
 * ─────────────────────
 * Next.js App Router has a set of SPECIAL FILENAMES that hook into the framework
 * and create specific UI behaviors automatically:
 *
 * 1. loading.tsx — Automatic loading skeleton
 * 2. error.tsx   — Automatic error boundary
 * 3. not-found.tsx — Custom 404 / "not found" page
 *
 * These files follow the "colocation" principle: you put them NEXT TO the
 * route segment they should affect. Their scope is limited to their folder
 * and all nested folders.
 *
 * ┌────────────────────────────────────────────────────────────────┐
 * │ File             │ What it does                                 │
 * ├────────────────────────────────────────────────────────────────┤
 * │ loading.tsx      │ Shown while page.tsx or layout.tsx is async │
 * │                  │ loading (wraps the route in a Suspense)      │
 * ├────────────────────────────────────────────────────────────────┤
 * │ error.tsx        │ Shown when a runtime error is thrown by the  │
 * │                  │ route segment. Acts as an Error Boundary.    │
 * │                  │ MUST be 'use client' (Error Boundaries are   │
 * │                  │ a React client-side feature)                  │
 * ├────────────────────────────────────────────────────────────────┤
 * │ not-found.tsx    │ Shown when notFound() is called, or when a   │
 * │                  │ URL matches no route in the folder           │
 * └────────────────────────────────────────────────────────────────┘
 *
 * SCOPE AND HIERARCHY:
 * ──────────────────────
 * These files only cover their own folder and nested folders.
 *
 *   app/
 *   ├── error.tsx           → catches errors in ALL routes (global fallback)
 *   ├── loading.tsx         → shows while app/page.tsx loads
 *   └── blog/
 *       ├── loading.tsx     → shows while blog/page.tsx loads (overrides global)
 *       ├── error.tsx       → catches errors in /blog and /blog/[slug]
 *       └── [slug]/
 *           ├── page.tsx    → the actual blog post page
 *           └── loading.tsx → shows while this specific post loads
 *
 * The closer a special file is to the route, the more specific its scope.
 * A global app/error.tsx catches anything not caught by a closer error.tsx.
 */

import Link from "next/link";
import type { Metadata } from "next";

// ─── Page Metadata ────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "03 — Loading & Error UI | Phase 4",
  description:
    "Learn how loading.tsx, error.tsx, and not-found.tsx work as special files in Next.js App Router.",
};

// ─── Code Examples ─────────────────────────────────────────────────────────────

const CODE_LOADING = `// app/blog/loading.tsx
//
// WHAT: A React component that Next.js shows while the page in the same
//       folder is loading (i.e., while its async functions are awaiting).
//
// HOW: Next.js wraps your page in a <Suspense> boundary automatically.
//      loading.tsx is the fallback — it renders immediately while the
//      real page component awaits its data.
//
// WHY: Without loading.tsx, the user sees a blank white screen while the
//      server fetches data. loading.tsx shows a skeleton/spinner instead.
//
// WHEN: Created automatically as a Suspense boundary — you don't need to
//       write <Suspense> yourself. Just create the file and export a component.
//
// IMPORTANT: loading.tsx does NOT need 'use client'.
//            It is a Server Component by default.
//            The file name is case-sensitive — must be loading.tsx (lowercase).

export default function BlogLoading() {
  return (
    <div className="animate-pulse space-y-4 p-8">
      {/* Simulated skeleton for the blog post header */}
      <div className="h-8 bg-gray-700 rounded w-2/3" />
      <div className="h-4 bg-gray-800 rounded w-1/3" />

      {/* Simulated skeleton for the blog post body */}
      <div className="space-y-2 mt-6">
        <div className="h-4 bg-gray-800 rounded" />
        <div className="h-4 bg-gray-800 rounded w-5/6" />
        <div className="h-4 bg-gray-800 rounded w-4/6" />
      </div>
    </div>
  );
}`.trim();

const CODE_LOADING_SUSPENSE = `// What Next.js does internally when you create loading.tsx:
//
// Before loading.tsx:
//   <Layout>
//     <Page />   ← blocks until ALL data is ready (blank screen)
//   </Layout>
//
// After loading.tsx:
//   <Layout>
//     <Suspense fallback={<Loading />}>  ← Next.js adds this automatically
//       <Page />                         ← your page streams in when ready
//     </Suspense>
//   </Layout>
//
// This means: the layout renders IMMEDIATELY, and the page content
// fills in when the data is ready. Users see your layout (nav, header)
// right away, with the loading skeleton in the content area.
//
// NOTE: loading.tsx wraps the ENTIRE route segment.
// For more granular control (wrap only PART of a page), use <Suspense>
// manually inside your page component:

import { Suspense } from 'react';

async function SlowSection() {
  const data = await fetchSlowData();
  return <div>{data.content}</div>;
}

export default function Page() {
  return (
    <main>
      <h1>Loads immediately</h1>
      <Suspense fallback={<p>Loading slow section...</p>}>
        <SlowSection />
      </Suspense>
    </main>
  );
}`.trim();

const CODE_ERROR = `// app/blog/error.tsx
//
// WHAT: A component that catches JavaScript errors thrown anywhere in
//       the route segment and its children (acts as an Error Boundary).
//
// HOW: React Error Boundaries are a client-side React feature.
//      Next.js wraps your route in an Error Boundary using this component.
//      If the page throws an error (e.g., a failed fetch, a null access),
//      error.tsx renders instead of the broken page.
//
// WHY: Without error.tsx, an unhandled error crashes the entire app.
//      error.tsx shows a friendly fallback UI and keeps the rest of the
//      app (other routes, layouts) fully functional.
//
// CRITICAL: error.tsx MUST have 'use client'.
//           Error Boundaries are implemented using the componentDidCatch
//           lifecycle which only exists in React client-side code.
//           Next.js enforces this — you will get a build error if you forget.

"use client";

import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };  // digest = server-side error ID for logging
  reset: () => void;                   // reset() retries rendering the failed segment
}

export default function BlogError({ error, reset }: ErrorProps) {
  // Log the error to an external service (e.g., Sentry, Datadog)
  useEffect(() => {
    console.error('Blog section error:', error);
    // reportToSentry(error); // ← your error tracking call here
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-64 gap-4 text-center p-8">
      <span className="text-4xl">⚠️</span>
      <h2 className="text-xl font-bold text-white">Something went wrong</h2>
      <p className="text-gray-400 max-w-sm">{error.message}</p>

      {/*
        reset() tells Next.js to re-render the failed route segment.
        This gives the user a chance to retry without a full page reload.
        The Error Boundary is cleared and the page component is tried again.
      */}
      <button
        onClick={reset}
        className="px-4 py-2 bg-blue-600 rounded-lg text-white text-sm hover:bg-blue-500"
      >
        Try again
      </button>
    </div>
  );
}`.trim();

const CODE_GLOBAL_ERROR = `// app/global-error.tsx
//
// A special error file that catches errors in the ROOT layout (app/layout.tsx).
// Regular error.tsx cannot catch errors thrown by its parent layout.
// global-error.tsx handles the most critical failures.
//
// IMPORTANT: global-error.tsx replaces the root layout when it renders —
// that means YOU are responsible for rendering <html> and <body>.

"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <main style={{ textAlign: 'center', padding: '4rem' }}>
          <h1>Critical Application Error</h1>
          <p>{error.message}</p>
          <button onClick={reset}>Reload App</button>
        </main>
      </body>
    </html>
  );
}`.trim();

const CODE_NOT_FOUND = `// app/blog/not-found.tsx
//
// WHAT: A component rendered when notFound() is called from the route segment,
//       or when a dynamic route segment cannot find its resource.
//
// HOW: You call notFound() inside a Server Component. Next.js intercepts
//      this call (it throws internally) and renders the nearest not-found.tsx
//      instead of the page.
//
// WHY: Provides a contextual "not found" UI instead of a generic 404.
//      A blog-level not-found.tsx can say "Article not found" instead of
//      the generic site-level "Page not found".
//
// NOTE: not-found.tsx does NOT need 'use client'.
//       It is a Server Component by default.
//       It does NOT receive any props (unlike error.tsx).

export default function BlogPostNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-64 gap-4 p-8 text-center">
      <span className="text-5xl">📭</span>
      <h2 className="text-2xl font-bold">Article Not Found</h2>
      <p className="text-gray-400 max-w-sm">
        The article you are looking for may have been moved, deleted, or never existed.
      </p>
      <a href="/blog" className="text-blue-400 hover:underline">
        ← Back to Blog
      </a>
    </div>
  );
}`.trim();

const CODE_NOT_FOUND_USAGE = `// app/blog/[slug]/page.tsx
// HOW TO TRIGGER not-found.tsx: call the notFound() function.
// It throws a special error that Next.js catches and handles by
// rendering the nearest not-found.tsx file.

import { notFound } from 'next/navigation';

async function fetchPost(slug: string) {
  // Simulate DB lookup — returns null if article doesn't exist
  const posts: Record<string, { title: string; content: string }> = {
    'hello-world': { title: 'Hello World', content: 'First post!' },
  };
  return posts[slug] ?? null;
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await fetchPost(slug);

  // If the post doesn't exist, render the not-found.tsx UI instead.
  // notFound() throws internally — do NOT wrap in try/catch.
  // Code after notFound() is never reached.
  if (!post) {
    notFound(); // → renders app/blog/not-found.tsx (or app/not-found.tsx)
  }

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  );
}`.trim();

// ─── File hierarchy display data ──────────────────────────────────────────────
// Shown as a visual folder tree to help learners understand file placement.
const FILE_EXAMPLES = [
  {
    file: "loading.tsx",
    emoji: "⏳",
    color: "border-blue-500/30 bg-blue-500/5",
    badge: "text-blue-400",
    needsClient: false,
    description: "Wrap the route segment in a Suspense boundary. Shown while the page awaits async data.",
    props: "None — receives no props.",
    trigger: "The page component is async and has not yet resolved.",
    tip: "Keep it simple — a skeleton that matches the page layout, using animate-pulse.",
  },
  {
    file: "error.tsx",
    emoji: "⚠️",
    color: "border-red-500/30 bg-red-500/5",
    badge: "text-red-400",
    needsClient: true,
    description: "Wrap the route segment in an Error Boundary. Shown when the page throws an unhandled error.",
    props: "error: Error (the thrown error), reset: () => void (retry function)",
    trigger: "Any unhandled JavaScript error thrown inside the route segment.",
    tip: "Always log the error (to console or Sentry), and always provide a reset() button.",
  },
  {
    file: "not-found.tsx",
    emoji: "🔍",
    color: "border-yellow-500/30 bg-yellow-500/5",
    badge: "text-yellow-400",
    needsClient: false,
    description: "Shown when notFound() is called from the route segment or no matching route is found.",
    props: "None — receives no props.",
    trigger: "Calling notFound() from 'next/navigation' inside the route segment.",
    tip: "Provide a helpful message and a link back to the parent section (not just the homepage).",
  },
] as const;

// ─── Page Component ────────────────────────────────────────────────────────────
// Server Component — no 'use client' needed.
export default function LoadingErrorUiPage() {
  return (
    <main className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto">

      {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
      <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
        <span className="mx-2" aria-hidden="true">›</span>
        <Link href="/phase-4" className="hover:text-blue-400 transition-colors">Phase 4</Link>
        <span className="mx-2" aria-hidden="true">›</span>
        <span className="text-gray-300">Loading &amp; Error UI</span>
      </nav>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl font-bold text-blue-400 font-mono" aria-hidden="true">03</span>
          <span className="text-3xl" aria-hidden="true">⚠️</span>
          <h1 className="text-3xl font-bold text-white">Loading &amp; Error UI</h1>
        </div>
        <p className="text-gray-400 max-w-2xl leading-relaxed">
          Next.js App Router uses special reserved filenames to automatically handle
          loading states, runtime errors, and missing resources — no manual wiring needed.
          Just create the file and export a component.
        </p>
      </header>

      {/* ── Quick Overview Cards ────────────────────────────────────────────── */}
      <section className="mb-10 grid gap-4 sm:grid-cols-3" aria-labelledby="overview-heading">
        <h2 id="overview-heading" className="sr-only">Special files overview</h2>
        {FILE_EXAMPLES.map((item) => (
          <div
            key={item.file}
            className={`rounded-xl border p-4 ${item.color}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl" aria-hidden="true">{item.emoji}</span>
              <code className={`font-mono text-sm font-bold ${item.badge}`}>{item.file}</code>
            </div>

            {/* Client requirement badge */}
            <div className="mb-2">
              {item.needsClient ? (
                <span className="text-xs bg-orange-500/20 text-orange-300 border border-orange-500/30 px-2 py-0.5 rounded-full">
                  Requires &apos;use client&apos;
                </span>
              ) : (
                <span className="text-xs bg-gray-500/20 text-gray-400 border border-gray-500/30 px-2 py-0.5 rounded-full">
                  Server Component OK
                </span>
              )}
            </div>

            <p className="text-xs text-gray-400 leading-relaxed mb-2">{item.description}</p>

            <div className="space-y-1">
              <p className="text-xs text-gray-600"><span className="text-gray-500">Props:</span> {item.props}</p>
              <p className="text-xs text-gray-600"><span className="text-gray-500">Trigger:</span> {item.trigger}</p>
              <p className="text-xs text-yellow-600"><span className="text-yellow-500">Tip:</span> {item.tip}</p>
            </div>
          </div>
        ))}
      </section>

      {/* ── Section 1: loading.tsx ────────────────────────────────────────── */}
      <section className="mb-10" aria-labelledby="loading-heading">
        <h2 id="loading-heading" className="text-xl font-semibold text-white mb-1">
          1. <code className="text-blue-300 font-mono">loading.tsx</code> — Automatic Suspense
        </h2>
        <p className="text-gray-400 text-sm mb-4 leading-relaxed">
          Create a <code className="font-mono text-xs text-gray-300">loading.tsx</code> file next to your
          <code className="font-mono text-xs text-gray-300 ml-1">page.tsx</code>.
          Next.js automatically wraps the page in a{" "}
          <code className="font-mono text-xs text-blue-300">&lt;Suspense&gt;</code> boundary using
          your loading component as the fallback. Users see the skeleton immediately while the
          server awaits async data.
        </p>

        <pre className="bg-black/40 border border-white/10 rounded-lg p-4 overflow-x-auto font-mono text-sm text-gray-300 mb-4">
          <code>{CODE_LOADING}</code>
        </pre>

        <h3 className="text-base font-semibold text-white mt-6 mb-2">
          How loading.tsx relates to Suspense
        </h3>
        <pre className="bg-black/40 border border-white/10 rounded-lg p-4 overflow-x-auto font-mono text-sm text-gray-300">
          <code>{CODE_LOADING_SUSPENSE}</code>
        </pre>
      </section>

      {/* ── Section 2: error.tsx ───────────────────────────────────────────── */}
      <section className="mb-10" aria-labelledby="error-heading">
        <h2 id="error-heading" className="text-xl font-semibold text-white mb-1">
          2. <code className="text-blue-300 font-mono">error.tsx</code> — Error Boundary
        </h2>

        {/* Critical requirement callout */}
        <div className="rounded-lg border border-orange-500/20 bg-orange-500/5 p-3 mb-4 text-xs text-orange-300">
          <strong>Critical:</strong> <code className="font-mono">error.tsx</code> MUST have{" "}
          <code className="font-mono">&apos;use client&apos;</code> at the top.
          Error Boundaries are a React client-side feature (they use{" "}
          <code className="font-mono">componentDidCatch</code> under the hood).
          Next.js enforces this and will throw a build error if you forget.
        </div>

        <p className="text-gray-400 text-sm mb-4 leading-relaxed">
          If your page throws an unhandled error (failed fetch, null reference, etc.),{" "}
          <code className="font-mono text-xs text-gray-300">error.tsx</code> catches it and renders
          a friendly fallback. The error is isolated — other routes and the parent layout remain
          fully functional. The <code className="font-mono text-xs text-blue-300">reset()</code> prop
          lets users retry without a full page reload.
        </p>
        <pre className="bg-black/40 border border-white/10 rounded-lg p-4 overflow-x-auto font-mono text-sm text-gray-300 mb-6">
          <code>{CODE_ERROR}</code>
        </pre>

        <h3 className="text-base font-semibold text-white mb-2">
          Global Error — <code className="text-red-300 font-mono">global-error.tsx</code>
        </h3>
        <p className="text-gray-400 text-sm mb-4 leading-relaxed">
          A regular <code className="font-mono text-xs text-gray-300">error.tsx</code> cannot catch errors
          thrown by its <em>parent</em> layout. For errors in the root{" "}
          <code className="font-mono text-xs text-gray-300">app/layout.tsx</code>, create{" "}
          <code className="font-mono text-xs text-red-300">app/global-error.tsx</code> instead.
          This replaces the root layout — you must render{" "}
          <code className="font-mono text-xs text-gray-300">&lt;html&gt;</code> and{" "}
          <code className="font-mono text-xs text-gray-300">&lt;body&gt;</code> yourself.
        </p>
        <pre className="bg-black/40 border border-white/10 rounded-lg p-4 overflow-x-auto font-mono text-sm text-gray-300">
          <code>{CODE_GLOBAL_ERROR}</code>
        </pre>
      </section>

      {/* ── Section 3: not-found.tsx ───────────────────────────────────────── */}
      <section className="mb-10" aria-labelledby="notfound-heading">
        <h2 id="notfound-heading" className="text-xl font-semibold text-white mb-1">
          3. <code className="text-blue-300 font-mono">not-found.tsx</code> — Custom 404
        </h2>
        <p className="text-gray-400 text-sm mb-4 leading-relaxed">
          When your page determines that the requested resource doesn&apos;t exist
          (e.g., a blog slug that isn&apos;t in your database), call{" "}
          <code className="font-mono text-xs text-blue-300">notFound()</code> from{" "}
          <code className="font-mono text-xs text-gray-300">&apos;next/navigation&apos;</code>.
          Next.js renders the nearest <code className="font-mono text-xs text-gray-300">not-found.tsx</code>.
          Unlike <code className="font-mono text-xs text-gray-300">error.tsx</code>, this file does
          NOT need <code className="font-mono text-xs text-gray-300">&apos;use client&apos;</code>.
        </p>
        <pre className="bg-black/40 border border-white/10 rounded-lg p-4 overflow-x-auto font-mono text-sm text-gray-300 mb-6">
          <code>{CODE_NOT_FOUND}</code>
        </pre>

        <h3 className="text-base font-semibold text-white mb-2">
          Triggering not-found.tsx with <code className="text-blue-300 font-mono">notFound()</code>
        </h3>
        <pre className="bg-black/40 border border-white/10 rounded-lg p-4 overflow-x-auto font-mono text-sm text-gray-300">
          <code>{CODE_NOT_FOUND_USAGE}</code>
        </pre>
      </section>

      {/* ── Section 4: File Hierarchy Reference ─────────────────────────────── */}
      <section className="mb-10 rounded-xl border border-white/10 bg-white/2 p-5" aria-labelledby="hierarchy-heading">
        <h2 id="hierarchy-heading" className="text-base font-semibold text-white mb-4">
          How Scope Works — Folder Hierarchy
        </h2>
        <p className="text-gray-400 text-xs mb-4">
          Each special file only affects its own folder and nested folders.
          Files lower in the tree override files higher up.
        </p>

        {/* ASCII folder tree */}
        <pre className="bg-black/40 border border-white/10 rounded-lg p-4 overflow-x-auto font-mono text-xs text-gray-400">
          <code>{`app/
├── loading.tsx       ← affects ALL routes (global fallback)
├── error.tsx         ← catches ALL unhandled errors (global fallback)
├── not-found.tsx     ← global 404 page
├── global-error.tsx  ← catches errors in root layout.tsx
│
└── blog/
    ├── loading.tsx   ← affects /blog and /blog/[slug] (overrides global)
    ├── error.tsx     ← catches errors in /blog/* (overrides global error.tsx)
    ├── not-found.tsx ← "Article not found" (more specific than global 404)
    ├── page.tsx
    └── [slug]/
        ├── loading.tsx  ← affects only this specific post page
        └── page.tsx     ← calls notFound() if post doesn't exist`}
          </code>
        </pre>
      </section>

      {/* ── Summary Comparison Table ──────────────────────────────────────────── */}
      <section className="mb-10 rounded-xl border border-white/10 bg-white/2 p-5" aria-labelledby="summary-heading">
        <h2 id="summary-heading" className="text-base font-semibold text-white mb-4">
          Quick Comparison
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-2 text-gray-500 font-medium">File</th>
                <th className="text-left p-2 text-gray-500 font-medium">Client?</th>
                <th className="text-left p-2 text-gray-500 font-medium">Receives Props?</th>
                <th className="text-left p-2 text-gray-500 font-medium">Triggered By</th>
                <th className="text-left p-2 text-gray-500 font-medium">Can use reset()?</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[
                ["loading.tsx", "❌ No", "None", "Page is awaiting async data", "❌ No"],
                ["error.tsx", "✅ Required", "error, reset", "Unhandled JS error thrown", "✅ Yes"],
                ["not-found.tsx", "❌ No", "None", "notFound() called", "❌ No"],
                ["global-error.tsx", "✅ Required", "error, reset", "Error in root layout.tsx", "✅ Yes"],
              ].map(([file, client, props, trigger, canReset]) => (
                <tr key={file}>
                  <td className="p-2 font-mono text-blue-300">{file}</td>
                  <td className="p-2 text-gray-400">{client}</td>
                  <td className="p-2 text-gray-400 font-mono text-xs">{props}</td>
                  <td className="p-2 text-gray-400">{trigger}</td>
                  <td className="p-2 text-gray-400">{canReset}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Lesson Navigation ────────────────────────────────────────────────── */}
      <div className="flex justify-between text-sm">
        <Link href="/phase-4/02-metadata-api" className="text-gray-500 hover:text-blue-400 transition-colors">
          ← Metadata API
        </Link>
        <Link href="/phase-4/mini-project" className="text-blue-400 hover:text-blue-300 transition-colors">
          Mini Project →
        </Link>
      </div>
    </main>
  );
}
