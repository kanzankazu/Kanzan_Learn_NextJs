/**
 * Mini Project — Dashboard (Phase 1)
 * Route: /phase-1/mini-project
 *
 * ARCHITECTURE:
 * ─────────────
 * This page is a Server Component that:
 * 1. Fetches data asynchronously (simulated)
 * 2. Renders a static layout
 * 3. Embeds a tiny Client Component (LikeButton) only where interactivity is needed
 *
 * This demonstrates the ideal pattern:
 * - The expensive data fetching stays on the server
 * - Only the interactive "like" button ships as client JS
 * - Everything else: zero JS to the browser
 */

import Link from "next/link";
import { LikeButton } from "./_components/LikeButton";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "🎯 Mini Project — Dashboard" };

// ─── Simulated server data ────────────────────────────────────────────────────
async function getArticles() {
  await new Promise((r) => setTimeout(r, 100)); // simulate DB latency
  return [
    { id: 1, title: "Getting Started with Next.js 15", category: "Next.js", likes: 142, readTime: "5 min" },
    { id: 2, title: "Server Actions Deep Dive", category: "Next.js", likes: 89, readTime: "8 min" },
    { id: 3, title: "TypeScript Generics in Practice", category: "TypeScript", likes: 204, readTime: "6 min" },
    { id: 4, title: "React 19 New Features", category: "React", likes: 317, readTime: "4 min" },
  ];
}

async function getStats() {
  await new Promise((r) => setTimeout(r, 50));
  return { totalArticles: 4, totalLikes: 752, avgReadTime: "5.75 min" };
}

// ─── Server Component: stat card ─────────────────────────────────────────────
// Pure display — no interactivity, stays as Server Component.
function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/2 p-4 text-center">
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

// ─── Page (Server Component) ──────────────────────────────────────────────────
export default async function DashboardMiniProject() {
  // Both fetches run in parallel on the server.
  // No useState([]), no useEffect — just async/await.
  const [articles, stats] = await Promise.all([getArticles(), getStats()]);

  return (
    <main className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto">
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-400">Home</Link>
        <span className="mx-2">›</span>
        <Link href="/phase-1" className="hover:text-blue-400">Phase 1</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-300">Mini Project</span>
      </nav>

      <header className="mb-8">
        <div className="flex items-center gap-2 mb-2"><span className="text-2xl">🎯</span>
          <h1 className="text-3xl font-bold text-white">Dashboard — Mixed RSC + Client</h1>
        </div>
        <p className="text-gray-400">
          Server Component fetches data. Client Component handles interactivity (likes only).
        </p>
      </header>

      {/* Stats — pure Server Components */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Overview (Server-rendered)</h2>
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
          <StatCard label="Articles" value={stats.totalArticles} />
          <StatCard label="Total Likes" value={stats.totalLikes} />
          <StatCard label="Avg Read Time" value={stats.avgReadTime} />
        </div>
      </section>

      {/* Articles — Server Component layout + Client Component like buttons */}
      <section>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Articles</h2>
        <div className="space-y-3">
          {articles.map((article) => (
            <div key={article.id} className="rounded-xl border border-white/10 bg-white/2 p-4">
              {/* This part is Server Component — static display */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full">
                      {article.category}
                    </span>
                    <span className="text-xs text-gray-600">{article.readTime} read</span>
                  </div>
                  <h3 className="text-sm font-semibold text-white">{article.title}</h3>
                </div>
                {/*
                 * LikeButton is a Client Component.
                 * It receives serializable props (number, string) from the server.
                 * Only this small component ships as JavaScript to the browser.
                 */}
                <LikeButton initialLikes={article.likes} label={article.title} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Component tree diagram */}
      <section className="mt-8 rounded-xl border border-white/10 bg-black/20 p-5">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Component Tree</h2>
        <div className="font-mono text-xs space-y-0.5">
          <p><span className="text-purple-400">DashboardPage</span> <span className="text-gray-600">(Server Component — async, fetches data)</span></p>
          <p><span className="text-gray-600">├── </span><span className="text-purple-400">StatCard</span> <span className="text-gray-600">× 3 (Server Component — pure display)</span></p>
          <p><span className="text-gray-600">└── </span><span className="text-purple-400">ArticleRow</span> <span className="text-gray-600">× N (Server Component — pure display)</span></p>
          <p><span className="text-gray-600">    └── </span><span className="text-blue-400">LikeButton</span> <span className="text-gray-600">(Client Component — useState, onClick)</span></p>
        </div>
        <p className="text-xs text-gray-600 mt-3">
          Blue = ships as JS to browser. Purple = server-only HTML. Only LikeButton is interactive.
        </p>
      </section>

      <div className="flex justify-between text-sm mt-8">
        <Link href="/phase-1/03-composition-patterns" className="text-gray-500 hover:text-blue-400">← Composition Patterns</Link>
        <Link href="/phase-2" className="text-blue-400 hover:text-blue-300">Phase 2: Data Fetching →</Link>
      </div>
    </main>
  );
}
