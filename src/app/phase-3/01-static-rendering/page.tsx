/**
 * Lesson 01 — Static Rendering (SSG)
 * Route: /phase-3/01-static-rendering
 *
 * WHAT IS STATIC RENDERING?
 * ──────────────────────────
 * Static Rendering means Next.js generates the HTML for a page ONCE —
 * during the `next build` step — and stores it as a static file.
 * Every user who visits that URL receives the exact same pre-built HTML,
 * served directly from a CDN (Content Delivery Network).
 *
 * No server computation happens at request time. The HTML file already exists.
 *
 * ANALOGY:
 * ─────────
 * Imagine a book that&apos;s printed once and shipped to bookstores worldwide.
 * Every reader gets the same printed book. If the author wants to change
 * something, they must print a new edition (= new deploy).
 *
 * WHEN TO USE SSG:
 * ─────────────────
 * ✅ Marketing/landing pages (content rarely changes)
 * ✅ Blog posts / articles (static content per slug)
 * ✅ Documentation sites
 * ✅ Product catalogue (if prices don&apos;t change in real time)
 * ✅ Any page where ALL users see the SAME content
 *
 * WHEN NOT TO USE SSG:
 * ─────────────────────
 * ❌ User-specific data (dashboard, profile, cart)
 * ❌ Pages with real-time data (live scores, stock prices)
 * ❌ Pages requiring auth headers / cookies to personalise
 *
 * HOW IT DIFFERS FROM SSR:
 * ─────────────────────────
 * SSG: HTML built ONCE at deploy → super fast, CDN-cached
 * SSR: HTML built on EVERY request → always fresh, slower per request
 *
 * In Next.js App Router, STATIC is the DEFAULT.
 * You don&apos;t need to do anything special to get static rendering —
 * Next.js is static unless you use a "dynamic API" (cookies, headers, etc.).
 *
 * KEY EXPORTS FOR STATIC PAGES:
 * ───────────────────────────────
 * 1. generateStaticParams()  — tell Next.js which dynamic slugs to pre-render
 * 2. dynamicParams = false   — throw 404 for slugs NOT in the pre-rendered list
 * 3. dynamic = 'force-static' — explicitly lock a page to static mode
 */

import Link from "next/link";
import type { Metadata } from "next";

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "01 — Static Rendering (SSG)",
  description: "Learn how Next.js pre-renders pages at build time using Static Rendering and generateStaticParams.",
};

// ─── Code Examples ────────────────────────────────────────────────────────────
// These are plain strings displayed as code snippets.
// In a real repo, you might import them from .txt or use a syntax highlighter.
const CODE_EXAMPLES = [
  {
    id: "default-static",
    label: "✅ Default static page — no config needed",
    description:
      "Any page that doesn&apos;t use cookies(), headers(), searchParams, or uncached fetch() is automatically static. Next.js detects this at build time.",
    code: `// app/about/page.tsx
// No 'use client', no dynamic APIs → automatically STATIC

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about our company.',
};

// This page is pre-rendered ONCE at build time.
// Every visitor gets the same cached HTML from the CDN.
export default function AboutPage() {
  return (
    <main>
      <h1>About Us</h1>
      <p>We build great software.</p>
    </main>
  );
}`,
    borderColor: "border-green-500/20",
    bgColor: "bg-green-500/5",
  },
  {
    id: "generate-static-params",
    label: "✅ generateStaticParams — pre-render dynamic routes at build time",
    description:
      "Dynamic routes like /blog/[slug] need generateStaticParams() to tell Next.js WHICH slugs to pre-render. Without it, the page falls back to dynamic rendering on first request.",
    code: `// app/blog/[slug]/page.tsx

// generateStaticParams() runs at BUILD TIME.
// It returns an array of param objects — one per page to pre-render.
// Next.js will call your page component with each of these params.
export async function generateStaticParams() {
  // In a real app: fetch your list of slugs from a CMS or DB
  const posts = await fetch('https://api.example.com/posts').then(r => r.json());

  // Return format: array of objects matching your [slug] segment
  return posts.map((post: { slug: string }) => ({
    slug: post.slug,
    // If your route is /blog/[year]/[slug], return { year, slug }
  }));
}

// dynamicParams controls what happens when a user requests a slug
// that was NOT returned by generateStaticParams():
//   true  (default) → generate that page dynamically at request time
//   false           → return 404 immediately
export const dynamicParams = false; // ← "only known slugs exist"

// In Next.js 15, params is a Promise — always await it.
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // Fetch this post's data — runs at BUILD time, not request time
  const post = await fetch(\`https://api.example.com/posts/\${slug}\`).then(r => r.json());

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.body}</p>
    </article>
  );
}`,
    borderColor: "border-green-500/20",
    bgColor: "bg-green-500/5",
  },
  {
    id: "force-static",
    label: "✅ force-static — lock a page to static even with dynamic API usage",
    description:
      "If you accidentally import something that triggers dynamic rendering, you can force static mode. Dynamic APIs (cookies, etc.) will return empty values instead of throwing.",
    code: `// app/some-page/page.tsx

// Force this page to be statically rendered at build time.
// Warning: cookies() and headers() will return empty/default values.
// Use this only when you KNOW the page doesn&apos;t need real runtime data.
export const dynamic = 'force-static';

export default function SomePage() {
  return <div>This is always static.</div>;
}`,
    borderColor: "border-yellow-500/20",
    bgColor: "bg-yellow-500/5",
  },
  {
    id: "dynamic-params-false",
    label: "⚠️ dynamicParams = false — strict mode for pre-rendered slugs",
    description:
      "Setting dynamicParams = false is a safety net: any slug not pre-rendered at build time returns 404. This guarantees your pages are always CDN-served, never dynamically generated.",
    code: `// app/docs/[slug]/page.tsx

// Pre-render only these specific documentation pages.
export async function generateStaticParams() {
  return [
    { slug: 'getting-started' },
    { slug: 'installation' },
    { slug: 'configuration' },
  ];
  // /docs/getting-started → ✅ pre-rendered
  // /docs/unknown-page    → ❌ 404 (because dynamicParams = false)
}

// dynamicParams = false means:
// "If a visitor requests a slug I didn&apos;t pre-render, show 404."
// dynamicParams = true (default) means:
// "If a slug is unknown, generate it dynamically on first request."
export const dynamicParams = false;

export default async function DocsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <article>Documentation for: {slug}</article>;
}`,
    borderColor: "border-orange-500/20",
    bgColor: "bg-orange-500/5",
  },
] as const;

// ─── Reusable CodeBlock ────────────────────────────────────────────────────────
// A component that renders a syntax-highlighted-style code block.
// Pure display — no interactivity, so no 'use client' needed.
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
      {/* Label — acts as a visual title for this code snippet */}
      <p className="text-xs font-semibold text-gray-300 mb-2">{label}</p>

      {/* Description — explains what this snippet demonstrates */}
      <p className="text-xs text-gray-500 mb-3 leading-relaxed">{description}</p>

      {/* Code block — bg-black/40 makes it slightly darker than the card background */}
      <pre className="bg-black/40 border border-white/10 rounded-lg p-4 font-mono text-sm text-gray-300 overflow-x-auto leading-relaxed">
        {code}
      </pre>
    </div>
  );
}

// ─── InfoCard ──────────────────────────────────────────────────────────────────
// Simple coloured info card used in the "How SSG works" section.
function InfoCard({
  step,
  title,
  body,
}: {
  step: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/2 p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-blue-400 font-mono font-bold text-sm">{step}</span>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      <p className="text-xs text-gray-400 leading-relaxed">{body}</p>
    </div>
  );
}

// ─── Page Component ────────────────────────────────────────────────────────────
// This page itself is statically rendered — no dynamic APIs used.
export default function StaticRenderingPage() {
  return (
    <main className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto">

      {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
      <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
        <span className="mx-2" aria-hidden="true">›</span>
        <Link href="/phase-3" className="hover:text-blue-400 transition-colors">Phase 3</Link>
        <span className="mx-2" aria-hidden="true">›</span>
        <span className="text-gray-300">Static Rendering</span>
      </nav>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          {/* Visual icon for this lesson */}
          <span className="text-3xl" aria-hidden="true">🏗️</span>
          <h1 className="text-3xl font-bold text-white">Static Rendering (SSG)</h1>
        </div>
        <p className="text-gray-400 leading-relaxed max-w-2xl">
          Generate HTML once at build time, serve from CDN forever.
          The fastest possible delivery — zero server computation per request.
        </p>
      </header>

      {/* ── How SSG Works ───────────────────────────────────────────────────── */}
      <section className="mb-10" aria-labelledby="how-it-works">
        <h2 id="how-it-works" className="text-lg font-semibold text-white mb-4">
          How Static Rendering Works
        </h2>
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
          <InfoCard
            step="Step 1"
            title="Build time: next build"
            body="When you run `next build`, Next.js crawls all your pages and identifies which ones are static. It calls generateStaticParams() for dynamic routes to know which slugs to pre-render."
          />
          <InfoCard
            step="Step 2"
            title="HTML generation"
            body="For each static page/slug, Next.js runs the Server Component, executes any fetch() calls, and renders the component tree into a complete HTML file. This HTML is stored on disk."
          />
          <InfoCard
            step="Step 3"
            title="Deploy to CDN"
            body="The pre-built HTML files are deployed to a CDN (Content Delivery Network). Copies exist in data centres worldwide, close to your users."
          />
          <InfoCard
            step="Step 4"
            title="Request time: instant"
            body="When a user visits the URL, the CDN serves the pre-built HTML immediately — no server needed, no data fetching, no component rendering. ~1ms response time."
          />
        </div>
      </section>

      {/* ── SSG vs SSR Quick Comparison ─────────────────────────────────────── */}
      <section className="mb-10" aria-labelledby="ssg-vs-ssr">
        <h2 id="ssg-vs-ssr" className="text-lg font-semibold text-white mb-4">
          SSG vs SSR at a Glance
        </h2>
        <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
          {/* SSG column */}
          <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4">
            <h3 className="text-sm font-semibold text-purple-400 mb-3">
              SSG — Static Site Generation
            </h3>
            <ul className="space-y-1.5 text-xs text-gray-400">
              <li className="flex gap-2"><span className="text-purple-400">✓</span> HTML built once at deploy</li>
              <li className="flex gap-2"><span className="text-purple-400">✓</span> Served from CDN (globally fast)</li>
              <li className="flex gap-2"><span className="text-purple-400">✓</span> Zero server load at runtime</li>
              <li className="flex gap-2"><span className="text-purple-400">✓</span> Works offline / edge-ready</li>
              <li className="flex gap-2"><span className="text-red-400">✗</span> Stale until next deploy</li>
              <li className="flex gap-2"><span className="text-red-400">✗</span> Not suitable for user-specific data</li>
            </ul>
          </div>
          {/* SSR column */}
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
            <h3 className="text-sm font-semibold text-blue-400 mb-3">
              SSR — Server-Side Rendering
            </h3>
            <ul className="space-y-1.5 text-xs text-gray-400">
              <li className="flex gap-2"><span className="text-blue-400">✓</span> Fresh HTML on every request</li>
              <li className="flex gap-2"><span className="text-blue-400">✓</span> Access cookies, headers, session</li>
              <li className="flex gap-2"><span className="text-blue-400">✓</span> Personalised per user</li>
              <li className="flex gap-2"><span className="text-red-400">✗</span> Server runs on every request</li>
              <li className="flex gap-2"><span className="text-red-400">✗</span> Higher latency than CDN</li>
              <li className="flex gap-2"><span className="text-red-400">✗</span> Higher infrastructure cost</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── Key Exports Summary ──────────────────────────────────────────────── */}
      <section className="mb-10" aria-labelledby="exports-summary">
        <h2 id="exports-summary" className="text-lg font-semibold text-white mb-4">
          Key Exports for Static Pages
        </h2>

        {/*
         * Explanation grid — each card explains one export.
         * These are the three SSG-specific tools in Next.js App Router.
         */}
        <div className="space-y-3">
          {[
            {
              name: "generateStaticParams()",
              type: "async function",
              summary: "Run at build time. Returns an array of param objects for a dynamic route. Next.js pre-renders one page per returned object.",
              example: "export async function generateStaticParams() {\n  return [{ slug: 'hello' }, { slug: 'world' }];\n}",
            },
            {
              name: "dynamicParams",
              type: "export const",
              summary: "Controls behaviour for slugs NOT listed in generateStaticParams(). true = generate on demand (default). false = return 404.",
              example: "export const dynamicParams = false; // 404 for unknown slugs",
            },
            {
              name: "dynamic = 'force-static'",
              type: "export const",
              summary: "Lock a page to static mode even if dynamic APIs are imported. Cookies / headers return empty values. Use sparingly.",
              example: "export const dynamic = 'force-static';",
            },
          ].map((item) => (
            <div key={item.name} className="rounded-xl border border-white/10 bg-blue-500/5 p-4">
              <div className="flex items-start gap-2 mb-2">
                <code className="text-blue-300 text-sm font-mono">{item.name}</code>
                <span className="text-xs text-gray-600 bg-white/5 px-2 py-0.5 rounded-full border border-white/10 mt-0.5">
                  {item.type}
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-2 leading-relaxed">{item.summary}</p>
              <pre className="bg-black/40 border border-white/10 rounded p-2 font-mono text-xs text-gray-400 overflow-x-auto">
                {item.example}
              </pre>
            </div>
          ))}
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

      {/* ── Build Output Note ────────────────────────────────────────────────── */}
      {/*
       * This section explains what `next build` output means.
       * Beginners often see the symbols (○, ●, λ) in the build log
       * and don&apos;t know what they mean — this demystifies them.
       */}
      <section className="mb-10 rounded-xl border border-white/10 bg-white/2 p-5" aria-label="Build output legend">
        <h2 className="text-base font-semibold text-white mb-3">Reading the Build Output</h2>
        <p className="text-sm text-gray-400 mb-4">
          When you run <code className="text-blue-300 font-mono">next build</code>, Next.js prints a table showing
          each route and how it will be rendered. Look for these symbols:
        </p>
        <div className="space-y-2">
          {[
            { symbol: "○", color: "text-gray-400", meaning: "Static  — pre-rendered at build time (SSG or ISR)" },
            { symbol: "●", color: "text-yellow-400", meaning: "ISR     — revalidated on a schedule or on-demand" },
            { symbol: "ƒ", color: "text-blue-400", meaning: "Dynamic — rendered at request time (SSR)" },
          ].map((row) => (
            <div key={row.symbol} className="flex items-center gap-3 text-sm">
              <code className={`font-mono text-lg font-bold ${row.color} w-6 text-center`}>{row.symbol}</code>
              <span className="text-gray-400">{row.meaning}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Lesson Navigation ────────────────────────────────────────────────── */}
      {/*
       * Lesson-level navigation links back to the phase index and forward
       * to the next lesson. Consistent across all lesson pages.
       */}
      <div className="flex justify-between text-sm">
        <Link href="/phase-3" className="text-gray-500 hover:text-blue-400 transition-colors">
          ← Phase 3
        </Link>
        <Link href="/phase-3/02-dynamic-rendering" className="text-blue-400 hover:text-blue-300 transition-colors">
          Dynamic Rendering →
        </Link>
      </div>
    </main>
  );
}
