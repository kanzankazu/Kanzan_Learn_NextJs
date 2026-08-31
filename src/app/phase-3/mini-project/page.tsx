/**
 * Phase 3 Mini Project — News Site
 * Route: /phase-3/mini-project
 *
 * PROJECT GOAL:
 * ─────────────
 * Build a simulated news site that demonstrates all four rendering strategies
 * from Phase 3 on a SINGLE page. This shows how real-world apps combine
 * multiple strategies rather than using just one.
 *
 * RENDERING STRATEGY MAP:
 * ────────────────────────
 * ┌─────────────────────────────────────────────────────────────────┐
 * │ Section               │ Strategy   │ Why                        │
 * ├─────────────────────────────────────────────────────────────────┤
 * │ 1. Hero Headline      │ ISR (60s)  │ Big story — needs freshness│
 * │                       │            │ but not per-second updates │
 * ├─────────────────────────────────────────────────────────────────┤
 * │ 2. Category Articles  │ Static     │ Pre-built at deploy time.  │
 * │    (Tech, World, etc) │            │ Same for all users.        │
 * ├─────────────────────────────────────────────────────────────────┤
 * │ 3. Breaking News      │ Dynamic    │ Must be fresh every        │
 * │    (simulated via     │ (SSR)      │ request (uses no-store)    │
 * │     random data)      │            │                            │
 * ├─────────────────────────────────────────────────────────────────┤
 * │ 4. Comment Count      │ Streaming  │ Slow query — streams in    │
 * │    (slow component)   │ (Suspense) │ while rest of page loads   │
 * └─────────────────────────────────────────────────────────────────┘
 *
 * NOTE: All data is simulated (no real API calls).
 * In production, replace the helper functions with real DB queries or API fetches.
 * The rendering strategy comments show HOW you would configure each section.
 *
 * ARCHITECTURE PATTERN:
 * ──────────────────────
 * This mini project uses the "Server Component Shell" pattern:
 * - The main page is a Server Component (no 'use client')
 * - Slow/independent sections are isolated into separate async components
 * - Each section declares its own fetch + Suspense boundary
 * - Client Components are only used where interactivity is required
 *
 * This is the recommended pattern for Next.js App Router applications.
 */

import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "Mini Project — News Site | Phase 3",
  description:
    "A simulated news site demonstrating Static, Dynamic, ISR, and Streaming rendering strategies in one page.",
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface Article {
  id: string;
  title: string;
  category: string;
  author: string;
  readTime: string;
  summary: string;
  publishedAt: string;
  isFeatured?: boolean;
}

interface BreakingNews {
  id: string;
  headline: string;
  urgency: "high" | "medium" | "low";
}

// ─── Simulated Data Sources ───────────────────────────────────────────────────
// In a real app, these would be fetch() calls or Prisma/Drizzle queries.
// The comments show WHICH rendering strategy would apply to each.

/**
 * STATIC DATA — articles that don't change often.
 * In production: fetch with no revalidate (SSG) or revalidate: 86400 (ISR daily).
 */
const STATIC_ARTICLES: Article[] = [
  {
    id: "tech-001",
    title: "Next.js 15 Ships with Turbopack as Default Bundler",
    category: "Technology",
    author: "Alex Chen",
    readTime: "4 min read",
    summary: "The React framework reaches a milestone with full Turbopack support, bringing dramatically faster local development and build times.",
    publishedAt: "2 hours ago",
    isFeatured: true,
  },
  {
    id: "tech-002",
    title: "TypeScript 5.8 Brings Improved Type Narrowing",
    category: "Technology",
    author: "Maria Santos",
    readTime: "3 min read",
    summary: "The latest TypeScript release introduces smarter control flow analysis and better support for discriminated unions.",
    publishedAt: "5 hours ago",
  },
  {
    id: "world-001",
    title: "Climate Summit Reaches Historic Carbon Reduction Agreement",
    category: "World",
    author: "James Wright",
    readTime: "6 min read",
    summary: "Representatives from 150 nations signed a landmark deal targeting a 45% reduction in carbon emissions by 2035.",
    publishedAt: "1 day ago",
  },
  {
    id: "world-002",
    title: "Southeast Asia Economic Partnership Expands to 12 Nations",
    category: "World",
    author: "Priya Patel",
    readTime: "5 min read",
    summary: "The regional trade bloc announced a sweeping expansion that will lower tariffs on goods and services across member states.",
    publishedAt: "1 day ago",
  },
  {
    id: "science-001",
    title: "Researchers Achieve Room-Temperature Superconductivity",
    category: "Science",
    author: "Dr. Kim Tan",
    readTime: "7 min read",
    summary: "A team at MIT demonstrated sustained superconductivity at 20°C using a novel hydrogen-rich compound, potentially transforming energy transmission.",
    publishedAt: "3 hours ago",
  },
  {
    id: "science-002",
    title: "JWST Captures First Direct Image of Earth-Sized Exoplanet",
    category: "Science",
    author: "Sarah Okonkwo",
    readTime: "5 min read",
    summary: "The James Webb Space Telescope has resolved a rocky planet in the habitable zone of its star, marking a new era in exoplanet research.",
    publishedAt: "6 hours ago",
  },
];

/**
 * ISR DATA — hero headline. Changes every hour in this simulation.
 * In production: export const revalidate = 3600 on the component,
 * or fetch with next: { revalidate: 3600 }.
 */
async function getHeroHeadline(): Promise<Article> {
  // Simulate a 300ms CMS API call
  await new Promise((resolve) => setTimeout(resolve, 300));
  // In a real ISR setup, this data would be stale by up to 60 seconds.
  return STATIC_ARTICLES[0]; // Use the featured article as the hero
}

/**
 * DYNAMIC DATA — breaking news ticker. Must be fresh on every request.
 * In production: use fetch({ cache: 'no-store' }) or cookies()/headers()
 * to trigger dynamic rendering for this section.
 *
 * We simulate "freshness" here by using Math.random() to pick different
 * breaking news items — this is what would happen if the data came from
 * a real-time source.
 */
async function getBreakingNews(): Promise<BreakingNews[]> {
  // Simulate a 150ms real-time news feed
  await new Promise((resolve) => setTimeout(resolve, 150));

  // All available breaking news items
  const allBreaking: BreakingNews[] = [
    { id: "b1", headline: "Markets update: Major indices up 1.2% in afternoon trading", urgency: "medium" },
    { id: "b2", headline: "BREAKING: Emergency summit called following diplomatic incident", urgency: "high" },
    { id: "b3", headline: "Tech stocks rally on strong earnings reports from sector leaders", urgency: "low" },
    { id: "b4", headline: "Weather alert: Severe storms expected across coastal regions this weekend", urgency: "medium" },
    { id: "b5", headline: "Central bank signals potential rate decision at upcoming meeting", urgency: "medium" },
  ];

  // Simulate dynamic (per-request) selection — in real SSR this would be
  // a real-time query that returns different results per request.
  // Math.random() here simulates that freshness.
  const startIndex = Math.floor(Math.random() * 2); // always 2-3 items
  return allBreaking.slice(startIndex, startIndex + 3);
}

/**
 * SLOW DATA — comment counts from a separate analytics service.
 * Simulates a slow 1500ms query — perfect candidate for Streaming.
 * In production: this would be a separate DB query or third-party API.
 */
async function getCommentCounts(): Promise<Record<string, number>> {
  // Simulate a slow 1500ms analytics query
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return {
    "tech-001": 243,
    "tech-002": 87,
    "world-001": 519,
    "world-002": 134,
    "science-001": 312,
    "science-002": 198,
  };
}

// ─── Component: Hero Section (ISR) ────────────────────────────────────────────
// This async component fetches the hero headline.
// In a real app it would have export const revalidate = 3600 at the module level
// or use fetch with next: { revalidate: 3600 }.
//
// WHY ISR FOR THE HERO?
// The hero headline is the same for ALL visitors at any given time.
// It changes maybe once per hour. ISR gives us CDN speed (fast TTFB)
// while ensuring the headline is refreshed every hour automatically.
async function HeroSection() {
  const article = await getHeroHeadline();

  return (
    <section
      className="rounded-xl border border-blue-500/40 bg-blue-500/5 p-6 mb-8"
      aria-label="Featured article"
    >
      {/* Strategy badge */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full font-medium">
          ♻️ ISR — revalidate: 3600
        </span>
        <span className="text-xs text-gray-600">Re-generates every hour in background</span>
      </div>

      <span className="text-xs font-medium text-blue-400 uppercase tracking-wider">
        {article.category} · Featured
      </span>
      <h2 className="text-2xl font-bold text-white mt-1 mb-2 leading-tight">
        {article.title}
      </h2>
      <p className="text-gray-400 text-sm leading-relaxed mb-3">{article.summary}</p>
      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span>By {article.author}</span>
        <span aria-hidden="true">·</span>
        <span>{article.readTime}</span>
        <span aria-hidden="true">·</span>
        <span>{article.publishedAt}</span>
      </div>
    </section>
  );
}

// ─── Component: Hero Skeleton ─────────────────────────────────────────────────
function HeroSkeleton() {
  return (
    <div className="rounded-xl border border-white/10 bg-white/2 p-6 mb-8 animate-pulse">
      <div className="h-4 w-48 bg-white/10 rounded mb-3" />
      <div className="h-3 w-24 bg-white/10 rounded mb-2" />
      <div className="h-7 w-3/4 bg-white/10 rounded mb-2" />
      <div className="h-4 w-full bg-white/10 rounded mb-1" />
      <div className="h-4 w-5/6 bg-white/10 rounded mb-3" />
      <div className="flex gap-3">
        <div className="h-3 w-20 bg-white/10 rounded" />
        <div className="h-3 w-16 bg-white/10 rounded" />
        <div className="h-3 w-24 bg-white/10 rounded" />
      </div>
    </div>
  );
}

// ─── Component: Breaking News Ticker (Dynamic / SSR) ──────────────────────────
// This component would trigger SSR in a real app because the data is
// different on every request (real-time feed).
//
// WHY DYNAMIC/SSR FOR BREAKING NEWS?
// Breaking news must be current. A stale ticker showing yesterday&apos;s "breaking"
// story is worse than no ticker at all. SSR guarantees the server fetches
// fresh data on every page load.
async function BreakingNewsTicker() {
  const items = await getBreakingNews();

  return (
    <section
      className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 mb-8"
      aria-label="Breaking news"
    >
      {/* Strategy badge */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full font-medium">
          ⚡ Dynamic (SSR) — cache: no-store
        </span>
        <span className="text-xs text-gray-600">Fresh on every request</span>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" aria-hidden="true" />
        <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Breaking News</span>
      </div>

      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id} className="flex items-start gap-2">
            {/* Urgency indicator */}
            <span
              className={`shrink-0 mt-1 w-1.5 h-1.5 rounded-full ${
                item.urgency === "high"
                  ? "bg-red-500"
                  : item.urgency === "medium"
                  ? "bg-yellow-500"
                  : "bg-gray-500"
              }`}
              aria-hidden="true"
            />
            <span className="text-sm text-gray-300 leading-relaxed">{item.headline}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ─── Component: Static Article Grid ───────────────────────────────────────────
// This section uses static data — no async needed.
// In a real app: fetch with no revalidate = fully static SSG.
//
// WHY STATIC FOR THE ARTICLE GRID?
// These are editorial articles published by the newsroom. They update
// only when a new article is published (handled by on-demand ISR or redeploy).
// CDN-serving these saves server resources.
function StaticArticleGrid() {
  // Group articles by category for display
  const categories = ["Technology", "World", "Science"] as const;

  return (
    <section className="mb-10" aria-labelledby="articles-heading">
      {/* Strategy badge */}
      <div className="flex items-center gap-2 mb-4">
        <h2 id="articles-heading" className="text-lg font-semibold text-white">Latest Stories</h2>
        <span className="text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded-full font-medium">
          🏗️ Static (SSG)
        </span>
        <span className="text-xs text-gray-600">Pre-built at deploy</span>
      </div>

      <div className="space-y-8">
        {categories.map((cat) => {
          const catArticles = STATIC_ARTICLES.filter((a) => a.category === cat);
          return (
            <div key={cat}>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 border-b border-white/10 pb-2">
                {cat}
              </h3>
              <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
                {catArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ─── Component: Article Card ───────────────────────────────────────────────────
// Pure display component — receives article data from parent.
// No async needed here (data already fetched by parent).
function ArticleCard({ article }: { article: Article }) {
  return (
    <div className="rounded-xl border border-white/10 hover:border-blue-500/40 hover:bg-blue-500/5 p-4 transition-all duration-200 group">
      <span className="text-xs text-blue-400 font-medium">{article.category}</span>
      <h4 className="text-sm font-semibold text-white mt-1 mb-1 leading-snug group-hover:text-blue-300 transition-colors">
        {article.title}
      </h4>
      <p className="text-xs text-gray-500 mb-2 leading-relaxed line-clamp-2">{article.summary}</p>
      <div className="flex items-center justify-between text-xs text-gray-600">
        <span>{article.author}</span>
        <span>{article.readTime}</span>
      </div>
      {/* Comment count placeholder — will be filled by the Streaming section */}
      <div
        className="mt-2 text-xs text-gray-600 flex items-center gap-1"
        data-article-id={article.id}
      >
        <span aria-hidden="true">💬</span>
        <span>Loading comments...</span>
      </div>
    </div>
  );
}

// ─── Component: Comment Count Summary (Streaming / Suspense) ──────────────────
// This async component fetches comment counts from a slow analytics service.
// It&apos;s wrapped in <Suspense> so the article grid renders immediately and
// the comment data streams in when the slow query completes.
//
// WHY STREAMING FOR COMMENT COUNTS?
// The analytics service is slow (1.5s+). Without Streaming, the entire page
// would block for 1.5s. With Streaming + Suspense, the page renders immediately
// and the comment section streams in after the slow query finishes.
async function CommentCountSummary() {
  const counts = await getCommentCounts();
  const totalComments = Object.values(counts).reduce((sum, n) => sum + n, 0);
  const topArticle = Object.entries(counts).sort(([, a], [, b]) => b - a)[0];

  return (
    <section
      className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-5 mb-8"
      aria-label="Community engagement"
    >
      {/* Strategy badge */}
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-base font-semibold text-white">Community Engagement</h2>
        <span className="text-xs bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded-full font-medium">
          🌊 Streaming (Suspense)
        </span>
        <span className="text-xs text-gray-600">Slow query — streamed when ready</span>
      </div>

      <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}>
        {/* Total comments stat */}
        <div className="rounded-lg border border-white/10 bg-black/20 p-3 text-center">
          <p className="text-2xl font-bold text-cyan-400 font-mono">{totalComments.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">Total Comments Today</p>
        </div>

        {/* Per-article comment counts */}
        {Object.entries(counts).map(([id, count]) => {
          const article = STATIC_ARTICLES.find((a) => a.id === id);
          if (!article) return null;
          return (
            <div key={id} className="rounded-lg border border-white/10 bg-black/20 p-3">
              <p className="text-sm font-bold text-white font-mono">{count.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-tight line-clamp-2">
                {article.title}
              </p>
            </div>
          );
        })}
      </div>

      {topArticle && (
        <p className="text-xs text-gray-500 mt-3">
          Most discussed:{" "}
          <span className="text-gray-300">
            {STATIC_ARTICLES.find((a) => a.id === topArticle[0])?.title ?? topArticle[0]}
          </span>{" "}
          with <span className="text-cyan-400">{topArticle[1].toLocaleString()}</span> comments
        </p>
      )}
    </section>
  );
}

// ─── Component: Comment Counts Skeleton ───────────────────────────────────────
function CommentCountSkeleton() {
  return (
    <div className="rounded-xl border border-white/10 bg-white/2 p-5 mb-8 animate-pulse">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-5 w-48 bg-white/10 rounded" />
        <div className="h-4 w-36 bg-white/10 rounded" />
      </div>
      <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border border-white/10 bg-white/5 p-3 h-16" />
        ))}
      </div>
    </div>
  );
}

// ─── Component: Rendering Strategy Legend ─────────────────────────────────────
// A summary card shown at the top of the mini project to help learners
// identify which section uses which strategy.
function StrategyLegend() {
  const items = [
    { icon: "🏗️", name: "Static (SSG)", color: "text-purple-400", badge: "bg-purple-500/10 border-purple-500/20", section: "Article Grid" },
    { icon: "⚡", name: "Dynamic (SSR)", color: "text-blue-400", badge: "bg-blue-500/10 border-blue-500/20", section: "Breaking News" },
    { icon: "♻️", name: "ISR (60s)", color: "text-green-400", badge: "bg-green-500/10 border-green-500/20", section: "Hero Headline" },
    { icon: "🌊", name: "Streaming", color: "text-cyan-400", badge: "bg-cyan-500/10 border-cyan-500/20", section: "Comment Counts" },
  ] as const;

  return (
    <div className="rounded-xl border border-white/10 bg-white/2 p-4 mb-8">
      <h2 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
        Rendering Strategies Used on This Page
      </h2>
      <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
        {items.map((item) => (
          <div
            key={item.name}
            className={`rounded-lg border p-3 flex items-start gap-2 ${item.badge}`}
          >
            <span className="text-lg" aria-hidden="true">{item.icon}</span>
            <div>
              <p className={`text-xs font-semibold ${item.color}`}>{item.name}</p>
              <p className="text-xs text-gray-500">{item.section}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page Component ────────────────────────────────────────────────────────────
// No 'use client' — everything is a Server Component.
// The page itself is NOT async — async work lives in child components.
// This is important: if the page were async and awaited all data,
// we&apos;d lose the streaming benefit (nothing renders until all awaits resolve).
//
// PATTERN: Let child components be async, keep the parent page synchronous.
// This is what enables granular Suspense boundaries.
export default function MiniProjectNewsPage() {
  return (
    <main className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto">

      {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
      <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
        <span className="mx-2" aria-hidden="true">›</span>
        <Link href="/phase-3" className="hover:text-blue-400 transition-colors">Phase 3</Link>
        <span className="mx-2" aria-hidden="true">›</span>
        <span className="text-gray-300">Mini Project — News Site</span>
      </nav>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl" aria-hidden="true">📰</span>
          <h1 className="text-3xl font-bold text-white">Mini Project — News Site</h1>
        </div>
        <p className="text-gray-400 leading-relaxed max-w-2xl">
          A simulated news site combining all four rendering strategies.
          Each section is annotated with its strategy and the reasoning behind the choice.
        </p>
      </header>

      {/* ── Strategy Legend ───────────────────────────────────────────────────
       * This legend helps learners map each badge they see in the sections below
       * back to the rendering strategy concept.
       */}
      <StrategyLegend />

      {/* ── Hero Headline (ISR) ───────────────────────────────────────────────
       * Uses Suspense so the page shell renders before the hero data loads.
       * ISR revalidation means the hero refreshes every hour automatically.
       */}
      <Suspense fallback={<HeroSkeleton />}>
        <HeroSection />
      </Suspense>

      {/* ── Breaking News Ticker (Dynamic SSR) ────────────────────────────────
       * No Suspense needed here — it&apos;s fast (150ms).
       * But we still isolate it as its own async component so the
       * dynamic behavior is contained and doesn&apos;t force the whole page dynamic.
       *
       * NOTE: In practice, this component would use fetch({ cache: 'no-store' })
       * or read a cookie/header, which would make it (and therefore the page) dynamic.
       * In this demo we simulate that behavior without the actual API call.
       */}
      <Suspense fallback={
        <div className="rounded-xl border border-white/10 bg-white/2 p-4 mb-8 animate-pulse">
          <div className="h-4 w-48 bg-white/10 rounded mb-3" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-4 bg-white/10 rounded mb-2" />
          ))}
        </div>
      }>
        <BreakingNewsTicker />
      </Suspense>

      {/* ── Static Article Grid (SSG) ─────────────────────────────────────────
       * No async, no Suspense needed — renders synchronously from static data.
       * In production this data would come from a static fetch() call.
       */}
      <StaticArticleGrid />

      {/* ── Comment Counts (Streaming + Suspense) ────────────────────────────
       * The slowest section — 1500ms query.
       * Wrapped in Suspense so the rest of the page renders without waiting.
       * Users see the skeleton immediately; counts stream in ~1.5 seconds later.
       */}
      <Suspense fallback={<CommentCountSkeleton />}>
        <CommentCountSummary />
      </Suspense>

      {/* ── Architecture Summary ──────────────────────────────────────────────
       * A teaching note visible at the bottom of the mini project.
       * Reinforces the key patterns used.
       */}
      <section className="mb-10 rounded-xl border border-white/10 bg-white/2 p-5" aria-labelledby="arch-summary">
        <h2 id="arch-summary" className="text-base font-semibold text-white mb-3">
          Architecture Notes
        </h2>
        <ul className="space-y-2 text-xs text-gray-400">
          {[
            "The page component itself is NOT async — keeping it synchronous allows all <Suspense> boundaries to work in parallel.",
            "Each async child component owns its own data fetching — no prop drilling, no global state, no context needed.",
            "The strategy for each section was chosen based on how often the data changes and whether it&apos;s user-specific.",
            "In production, replace the simulated delays with real fetch() calls, DB queries, or CMS API calls.",
            "Static sections (article grid) could use on-demand ISR (revalidateTag) so the cache invalidates when editors publish.",
          ].map((note, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-blue-400 shrink-0">›</span>
              <span>{note}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Page Navigation ──────────────────────────────────────────────────── */}
      <div className="flex justify-between text-sm">
        <Link href="/phase-3/04-streaming-suspense" className="text-gray-500 hover:text-blue-400 transition-colors">
          ← Streaming & Suspense
        </Link>
        <Link href="/phase-4" className="text-blue-400 hover:text-blue-300 transition-colors">
          Phase 4 →
        </Link>
      </div>
    </main>
  );
}
