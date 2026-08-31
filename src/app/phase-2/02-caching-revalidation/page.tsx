/**
 * Lesson 02 — Caching & Revalidation
 * Route: /phase-2/02-caching-revalidation
 *
 * THE BIG IDEA:
 * ─────────────
 * Next.js extends the native fetch() API with an extra options object:
 *   fetch(url, { cache: '...', next: { revalidate: N, tags: [...] } })
 *
 * This controls how Next.js stores and refreshes the fetched data.
 * Understanding this is critical for performance and freshness trade-offs.
 *
 * THE THREE CACHE STRATEGIES:
 * ────────────────────────────
 *
 * 1. force-cache (default in older Next.js, or when you set it explicitly)
 *    → Data is cached indefinitely until you manually revalidate.
 *    → Like SSG: super fast, but potentially stale.
 *    → Use for: rarely-changing content (blog posts, documentation).
 *
 * 2. no-store
 *    → No caching at all. Fetch fires on EVERY request.
 *    → Like SSR: always fresh, but slower.
 *    → Use for: user-specific data, real-time stock, live scores.
 *
 * 3. next.revalidate: N (ISR — Incremental Static Regeneration)
 *    → Cache for N seconds, then regenerate in the background.
 *    → Best of both worlds: fast + eventually fresh.
 *    → Use for: product listings, news articles, dashboards.
 *
 * ON-DEMAND REVALIDATION:
 * ────────────────────────
 * Instead of time-based expiry, you can manually invalidate cache from a
 * Server Action or API route using:
 *   - revalidatePath('/products') — clear cache for a URL path
 *   - revalidateTag('products-list') — clear cache for a tagged group of fetches
 *
 * ANALOGY FOR ANDROID DEVS:
 * ───────────────────────────
 * - force-cache = Room DB cache, read-through, no expiry
 * - no-store = always fetch from network, bypass cache
 * - revalidate = stale-while-revalidate (like OkHttp cache-control max-stale)
 * - revalidatePath/Tag = manual cache invalidation after a write
 */

import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "02 — Caching & Revalidation",
};

// ─── Cache strategy definitions ───────────────────────────────────────────────
// Used to render the comparison cards and explain each strategy.
const CACHE_STRATEGIES = [
  {
    id: "force-cache",
    label: "force-cache",
    badge: "Static (SSG-like)",
    badgeColor: "text-purple-400 bg-purple-500/20 border-purple-500/30",
    cardBorder: "border-purple-500/20",
    cardBg: "bg-purple-500/5",
    description: "Data is fetched once and cached indefinitely. Fastest response. Use for content that rarely changes.",
    whenToUse: ["Blog posts", "Documentation pages", "Marketing landing pages", "Product descriptions"],
    tradeoff: "May serve stale data until you call revalidatePath() or revalidateTag()",
    code: `const res = await fetch('https://api.example.com/posts', {
  cache: 'force-cache', // ← cached indefinitely
  // Equivalent to: next: { revalidate: Infinity }
});
const posts = await res.json();`,
  },
  {
    id: "no-store",
    label: "no-store",
    badge: "Dynamic (SSR-like)",
    badgeColor: "text-orange-400 bg-orange-500/20 border-orange-500/30",
    cardBorder: "border-orange-500/20",
    cardBg: "bg-orange-500/5",
    description: "No caching. Fetch runs on every single request. Freshest possible data. Slower — every user waits for the fetch.",
    whenToUse: ["User dashboard (personal data)", "Real-time stock prices", "Live sports scores", "Shopping cart"],
    tradeoff: "Slowest option — user waits for fetch on every request",
    code: `const res = await fetch('https://api.example.com/user/me', {
  cache: 'no-store', // ← never cached, always fresh
  // Alternative: next: { revalidate: 0 }
});
const user = await res.json();`,
  },
  {
    id: "revalidate",
    label: "next.revalidate",
    badge: "ISR (Best of both)",
    badgeColor: "text-green-400 bg-green-500/20 border-green-500/30",
    cardBorder: "border-green-500/20",
    cardBg: "bg-green-500/5",
    description: "Serve from cache (fast!), but regenerate in the background after N seconds. The user always gets a fast response.",
    whenToUse: ["Product listings (revalidate: 60)", "News articles (revalidate: 300)", "Leaderboards (revalidate: 30)", "Weather (revalidate: 600)"],
    tradeoff: "Data can be up to N seconds stale before regeneration",
    code: `const res = await fetch('https://api.example.com/products', {
  next: { revalidate: 60 }, // ← refresh cache every 60 seconds
  // First request: fetches + caches
  // Subsequent requests (within 60s): served from cache instantly
  // After 60s: serves stale cache, regenerates in background
});
const products = await res.json();`,
  },
];

// ─── On-demand revalidation code examples ─────────────────────────────────────
// These show how to manually invalidate caches from Server Actions or API routes.
const ONDEMAND_EXAMPLES = [
  {
    id: "revalidatePath",
    title: "revalidatePath() — clear all cache for a URL",
    code: `// In a Server Action (app/actions.ts)
'use server';
import { revalidatePath } from 'next/cache';

export async function updateProduct(id: string, data: FormData) {
  // 1. Write to database
  await db.product.update({ where: { id }, data: parseFormData(data) });

  // 2. Tell Next.js to clear the cache for /products and /products/[id]
  revalidatePath('/products');           // clears the listing page
  revalidatePath(\`/products/\${id}\`);    // clears the detail page
  // Next request to these URLs will fetch fresh data
}`,
  },
  {
    id: "revalidateTag",
    title: "revalidateTag() — clear cache for a named group of fetches",
    code: `// Step 1: Tag your fetches
const res = await fetch('https://api.example.com/products', {
  next: {
    revalidate: 3600,
    tags: ['products-list'], // ← give this fetch a name/tag
  },
});

// Step 2: In a Server Action, invalidate by tag
'use server';
import { revalidateTag } from 'next/cache';

export async function addProduct(data: FormData) {
  await db.product.create({ data: parseFormData(data) });

  // ✅ Clears cache for ALL fetches tagged 'products-list'
  // Even if they're on different pages!
  revalidateTag('products-list');
}`,
  },
  {
    id: "segment-config",
    title: "Route Segment Config — set default behavior for the whole page",
    code: `// At the top of a page.tsx or layout.tsx
// This sets the cache behavior for ALL fetches in this route segment

// Option A: make the whole page dynamic (no cache)
export const dynamic = 'force-dynamic'; // equivalent to cache: 'no-store' everywhere

// Option B: set a default revalidation time for all fetches
export const revalidate = 60; // all fetches in this page refresh every 60s

// Option C: force static (build-time only, like pure SSG)
export const dynamic = 'force-static';`,
  },
];

export default function CachingRevalidationPage() {
  return (
    <main className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto">

      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
        <span className="mx-2">›</span>
        <Link href="/phase-2" className="hover:text-blue-400 transition-colors">Phase 2</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-300">Caching & Revalidation</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Caching & Revalidation</h1>
        <p className="text-gray-400">
          Next.js extends <code className="text-blue-300 bg-white/10 px-1 rounded">fetch()</code> with cache controls.
          Choose between static speed, dynamic freshness, or ISR — the sweet spot in the middle.
        </p>
      </header>

      {/* Quick decision guide */}
      <section className="mb-10 rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">
        <h2 className="text-lg font-semibold text-white mb-3">Quick Decision Guide</h2>
        <div className="font-mono text-xs space-y-1.5 text-gray-400">
          <p>Data changes <span className="text-white">rarely</span> (blog posts)?         → <span className="text-purple-400">force-cache</span> (or omit)</p>
          <p>Data is <span className="text-white">user-specific</span> (cart, profile)?    → <span className="text-orange-400">no-store</span></p>
          <p>Data changes <span className="text-white">periodically</span> (products)?     → <span className="text-green-400">next.revalidate: 60</span></p>
          <p>Need <span className="text-white">instant</span> update after a write?        → <span className="text-blue-400">revalidatePath() / revalidateTag()</span></p>
        </div>
      </section>

      {/* Three cache strategies */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-white mb-4">The Three Cache Strategies</h2>
        <div className="space-y-4">
          {CACHE_STRATEGIES.map((strategy) => (
            <div key={strategy.id} className={`rounded-xl border p-5 ${strategy.cardBorder} ${strategy.cardBg}`}>
              {/* Strategy header */}
              <div className="flex items-center gap-3 mb-3">
                <code className="text-sm font-bold text-white bg-black/30 px-2 py-0.5 rounded">
                  {strategy.label}
                </code>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${strategy.badgeColor}`}>
                  {strategy.badge}
                </span>
              </div>

              <p className="text-sm text-gray-400 mb-3">{strategy.description}</p>

              {/* Use cases */}
              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-500 mb-1">Use for:</p>
                <div className="flex flex-wrap gap-1">
                  {strategy.whenToUse.map((item) => (
                    <span key={item} className="text-xs bg-white/5 border border-white/10 text-gray-400 px-2 py-0.5 rounded-full">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tradeoff */}
              <p className="text-xs text-gray-600 mb-3">
                ⚠️ Trade-off: {strategy.tradeoff}
              </p>

              {/* Code example */}
              <div className="rounded-lg border border-white/10 bg-black/40 p-3">
                <pre className="text-xs text-gray-300 font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap">
                  {strategy.code}
                </pre>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* On-demand revalidation */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-white mb-2">On-Demand Revalidation</h2>
        <p className="text-sm text-gray-400 mb-4">
          Instead of waiting for a time-based expiry, you can manually clear the cache right after a write operation.
          This is the most precise caching strategy.
        </p>
        <div className="space-y-4">
          {ONDEMAND_EXAMPLES.map((example) => (
            <div key={example.id} className="rounded-xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs font-semibold text-gray-400 mb-3">{example.title}</p>
              <div className="rounded-lg border border-white/10 bg-black/40 p-3">
                <pre className="text-xs text-gray-300 font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap">
                  {example.code}
                </pre>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Summary table */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-white mb-4">Comparison Summary</h2>
        <div className="rounded-xl border border-white/10 overflow-hidden">
          <table className="w-full text-xs text-gray-400">
            <thead className="bg-white/5 text-gray-300">
              <tr>
                <th className="text-left p-3 font-semibold">Strategy</th>
                <th className="text-left p-3 font-semibold">Speed</th>
                <th className="text-left p-3 font-semibold">Freshness</th>
                <th className="text-left p-3 font-semibold">Best for</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr>
                <td className="p-3"><code className="text-purple-400">force-cache</code></td>
                <td className="p-3 text-green-400">⚡ Fastest</td>
                <td className="p-3 text-red-400">Manual only</td>
                <td className="p-3">Blog, docs</td>
              </tr>
              <tr>
                <td className="p-3"><code className="text-green-400">next.revalidate: N</code></td>
                <td className="p-3 text-green-400">⚡ Fast</td>
                <td className="p-3 text-yellow-400">Every N seconds</td>
                <td className="p-3">Products, news</td>
              </tr>
              <tr>
                <td className="p-3"><code className="text-orange-400">no-store</code></td>
                <td className="p-3 text-orange-400">🐢 Slower</td>
                <td className="p-3 text-green-400">Always fresh</td>
                <td className="p-3">User data, cart</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Lesson navigation */}
      <div className="flex justify-between text-sm">
        <Link href="/phase-2/01-server-fetch" className="text-gray-500 hover:text-blue-400 transition-colors">
          ← Server Fetch
        </Link>
        <Link href="/phase-2/03-parallel-sequential" className="text-blue-400 hover:text-blue-300 transition-colors">
          Next: Parallel →
        </Link>
      </div>
    </main>
  );
}
