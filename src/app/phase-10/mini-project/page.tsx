/**
 * Mini Project — Advanced Patterns Explorer
 * Route: /phase-10/mini-project
 *
 * WHAT IS THIS MINI PROJECT?
 * ───────────────────────────
 * A Server Component page that serves as an interactive reference for all
 * four advanced patterns covered in Phase 10:
 *   1. Intercepting Routes
 *   2. Parallel Routes
 *   3. Edge Runtime
 *   4. Internationalization (i18n)
 *
 * HOW IT IS BUILT:
 * ─────────────────
 * This file is a SERVER COMPONENT (no 'use client' directive).
 * It handles:
 *   - Page metadata (SEO)
 *   - Static data (pattern definitions — no fetching needed)
 *   - HTML structure (breadcrumb, header, nav)
 *
 * The interactive expand/collapse behaviour is handled by a CLIENT COMPONENT:
 *   _components/AdvancedPatternsSummary.tsx
 * It receives the pattern data as props so it does NOT need to know about
 * the data source — it only handles UI state.
 *
 * WHY SPLIT SERVER + CLIENT THIS WAY?
 * ─────────────────────────────────────
 * The "push interactivity to the leaves" principle:
 *
 * ┌─────────────────────────────────────────┐
 * │ page.tsx (Server Component)             │
 * │  - Zero JS bundle cost                  │
 * │  - Static data defined here             │
 * │  - Passes data down as props            │
 * │                                         │
 * │  └── AdvancedPatternsSummary (Client)   │
 * │       - Interactive cards (useState)    │
 * │       - Only THIS component adds JS     │
 * └─────────────────────────────────────────┘
 *
 * Only the component that NEEDS interactivity becomes a Client Component.
 * Everything else (layout, breadcrumb, header, nav) stays on the server
 * and contributes zero JavaScript to the browser bundle.
 */

import Link from "next/link";
import type { Metadata } from "next";
import { AdvancedPatternsSummary } from "./_components/AdvancedPatternsSummary";

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "Mini Project — Advanced Patterns Explorer",
  description:
    "Interactive reference for Phase 10 advanced patterns: intercepting routes, parallel routes, Edge Runtime, and i18n.",
};

// ─── Pattern Data ─────────────────────────────────────────────────────────────
// Defined in the Server Component — zero cost at runtime.
// Passed to the client component as props.
export type Pattern = {
  id: string;
  number: string;
  emoji: string;
  title: string;
  tagline: string;
  bestFor: string[];
  folderStructure: string;
  keyFiles: { file: string; purpose: string }[];
  notes: string[];
  learnMoreHref: string;
  accentColor: {
    border: string;
    bg: string;
    text: string;
    badge: string;
  };
};

const PATTERNS: Pattern[] = [
  {
    id: "intercepting-routes",
    number: "01",
    emoji: "🪟",
    title: "Intercepting Routes",
    tagline: "Modal with a real, shareable URL",
    bestFor: [
      "Photo/media gallery with modal preview",
      "E-commerce product quick-view modals",
      "Login/signup modals that have their own URL",
      "Any detail page that should also be an overlay",
    ],
    folderStructure: `app/photos/
├── page.tsx               ← gallery grid
├── [id]/page.tsx          ← full page (hard nav)
├── @modal/
│   ├── default.tsx        ← null fallback
│   └── (.)id/page.tsx     ← modal version (soft nav)
└── layout.tsx             ← renders { children, modal }`,
    keyFiles: [
      { file: "(.)id/page.tsx", purpose: "Intercepted route — renders as modal on soft nav" },
      { file: "photos/[id]/page.tsx", purpose: "Real route — renders as full page on hard nav" },
      { file: "@modal/default.tsx", purpose: "Required null fallback when no modal is active" },
      { file: "layout.tsx", purpose: "Stitches children + modal slot together" },
    ],
    notes: [
      "Always create BOTH the intercepting route AND the real route — they serve different navigation contexts.",
      "Requires Parallel Routes (@modal slot) — intercepting routes and parallel routes work together.",
      "The (.) notation counts ROUTE SEGMENTS, not file system depth.",
      "Hard navigation (refresh, shared link) always shows the real full-page route.",
    ],
    learnMoreHref: "/phase-10/01-intercepting-routes",
    accentColor: {
      border: "border-violet-500/30",
      bg: "bg-violet-500/5",
      text: "text-violet-300",
      badge: "bg-violet-500/20 text-violet-300",
    },
  },
  {
    id: "parallel-routes",
    number: "02",
    emoji: "🔀",
    title: "Parallel Routes",
    tagline: "Multiple independent pages in one layout",
    bestFor: [
      "Dashboards with independent data panels",
      "Split-screen UIs with separate loading states",
      "Role-based layouts (admin sees more slots than user)",
      "Pages with independent error boundaries per section",
    ],
    folderStructure: `app/dashboard/
├── page.tsx               ← main content (children)
├── layout.tsx             ← receives { children, team, analytics }
├── @team/
│   ├── page.tsx           ← team slot content
│   └── default.tsx        ← required fallback
└── @analytics/
    ├── page.tsx           ← analytics slot content
    ├── loading.tsx        ← independent loading state
    ├── error.tsx          ← independent error boundary
    └── default.tsx        ← required fallback`,
    keyFiles: [
      { file: "@slot/page.tsx", purpose: "The slot content — a normal async Server Component" },
      { file: "@slot/default.tsx", purpose: "Required: rendered when slot has no matching route" },
      { file: "@slot/loading.tsx", purpose: "Independent loading UI shown only while this slot loads" },
      { file: "layout.tsx", purpose: "Receives all slots as named props — decides where to render them" },
    ],
    notes: [
      "@slot folders are invisible to the URL — @team does NOT create /team.",
      "All slots load in PARALLEL on the server — no sequential waterfall.",
      "Each slot can have its own loading.tsx and error.tsx — fully independent.",
      "Conditional rendering: { user.role === 'admin' ? analytics : null } for role-based layouts.",
    ],
    learnMoreHref: "/phase-10/02-parallel-routes",
    accentColor: {
      border: "border-blue-500/30",
      bg: "bg-blue-500/5",
      text: "text-blue-300",
      badge: "bg-blue-500/20 text-blue-300",
    },
  },
  {
    id: "edge-runtime",
    number: "03",
    emoji: "⚡",
    title: "Edge Runtime",
    tagline: "Run code on CDN nodes worldwide",
    bestFor: [
      "Geolocation-based redirects (country → locale URL)",
      "A/B testing with cookie bucketing",
      "JWT validation without origin round-trip",
      "Feature flag checks with ultra-low latency",
    ],
    folderStructure: `// Opt in with one line in any Route Handler or middleware:

// app/api/geo/route.ts
export const runtime = 'edge';

// app/api/flags/route.ts
export const runtime = 'edge';

// middleware.ts runs at edge by default — no export needed`,
    keyFiles: [
      { file: "export const runtime = 'edge'", purpose: "Opt any Route Handler into the Edge Runtime" },
      { file: "middleware.ts", purpose: "Always runs at the edge by default — no export needed" },
      { file: "x-vercel-ip-country header", purpose: "Geolocation injected by Vercel CDN" },
      { file: "NextResponse.rewrite()", purpose: "Rewrite URL at the edge without touching origin" },
    ],
    notes: [
      "No Node.js APIs at the edge — no fs, no Prisma, no direct DB connections.",
      "Use fetch() to call external APIs or HTTP-based DB drivers (Neon serverless, PlanetScale serverless).",
      "CPU time is limited (~50ms). Edge is for fast, lightweight logic — not heavy computation.",
      "Cold starts are near zero (<5ms) — the edge never 'sleeps'.",
    ],
    learnMoreHref: "/phase-10/03-edge-runtime",
    accentColor: {
      border: "border-yellow-500/30",
      bg: "bg-yellow-500/5",
      text: "text-yellow-300",
      badge: "bg-yellow-500/20 text-yellow-300",
    },
  },
  {
    id: "internationalization",
    number: "04",
    emoji: "🌍",
    title: "Internationalization (i18n)",
    tagline: "Locale-based routing and translations",
    bestFor: [
      "Apps targeting users in multiple countries/languages",
      "Serving different currency/date formats per region",
      "SEO-optimised locale URLs (/en/..., /id/..., /ja/...)",
      "Marketing sites with full localisation",
    ],
    folderStructure: `app/
├── [locale]/              ← all routes live inside here
│   ├── layout.tsx         ← sets html lang, NextIntlClientProvider
│   ├── page.tsx           ← home (per locale)
│   └── about/page.tsx     ← about (per locale)
├── middleware.ts          ← detects locale, redirects / → /en
└── messages/
    ├── en.json            ← English strings
    ├── id.json            ← Indonesian strings
    └── ja.json            ← Japanese strings`,
    keyFiles: [
      { file: "app/[locale]/", purpose: "Dynamic segment that holds all locale-aware routes" },
      { file: "middleware.ts", purpose: "Detects language from cookie/Accept-Language and redirects" },
      { file: "messages/[locale].json", purpose: "Translation strings — one JSON file per language" },
      { file: "getTranslations() / useTranslations()", purpose: "next-intl hooks for accessing translations" },
    ],
    notes: [
      "next-intl is NOT installed in this repo — all code is patterns only. Install: npm install next-intl",
      "Moving all routes inside app/[locale]/ is the primary structural change for i18n.",
      "Server Components use getTranslations() (async). Client Components use useTranslations() (sync hook).",
      "Set the html lang attribute in [locale]/layout.tsx — critical for accessibility and SEO.",
    ],
    learnMoreHref: "/phase-10/04-internationalization",
    accentColor: {
      border: "border-green-500/30",
      bg: "bg-green-500/5",
      text: "text-green-300",
      badge: "bg-green-500/20 text-green-300",
    },
  },
];

// ─── Page Component (Server Component) ────────────────────────────────────────
// No 'use client' — this is intentionally a Server Component.
// The interactive parts are inside AdvancedPatternsSummary (Client Component).
export default function MiniProjectPage() {
  return (
    <main className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto">

      {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
      <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
        <span className="mx-2" aria-hidden="true">›</span>
        <Link href="/phase-10" className="hover:text-blue-400 transition-colors">Phase 10</Link>
        <span className="mx-2" aria-hidden="true">›</span>
        <span className="text-gray-300">Mini Project</span>
      </nav>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl" aria-hidden="true">🗺️</span>
          <h1 className="text-3xl font-bold text-white">Advanced Patterns Explorer</h1>
        </div>
        <p className="text-gray-400 leading-relaxed max-w-2xl">
          Your Phase 10 reference card. Expand each pattern to see what it is
          best for, the folder structure it requires, the key files involved,
          and practical notes to remember when using it.
        </p>

        {/* ── Architecture Note ────────────────────────────────────────────── */}
        <div className="mt-4 rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-3">
          <p className="text-xs text-blue-300 font-semibold mb-1">
            🏗️ Server + Client Architecture
          </p>
          <p className="text-xs text-blue-200/70 leading-relaxed">
            This page is a Server Component — it defines the pattern data and
            passes it as props to AdvancedPatternsSummary (Client Component).
            Only the interactive component adds JavaScript to the browser bundle.
            The breadcrumb, header, and navigation stay server-rendered.
          </p>
        </div>
      </header>

      {/* ── Interactive Patterns Summary (Client Component) ───────────────── */}
      {/*
       * WHY IMPORT A CLIENT COMPONENT FROM A SERVER COMPONENT?
       * ─────────────────────────────────────────────────────────
       * This is the standard Next.js pattern for interactive islands.
       * The Server Component (this file) renders first on the server,
       * then streams the AdvancedPatternsSummary component to the client.
       * React hydrates only the client component, not the entire page.
       *
       * The 'patterns' prop passes the static data from the server to the
       * client. No useEffect fetch needed — the data is already here.
       */}
      <AdvancedPatternsSummary patterns={PATTERNS} />

      {/* ── Phase Completion Banner ──────────────────────────────────────────── */}
      <div className="mt-10 rounded-xl border border-green-500/20 bg-green-500/5 p-6 text-center">
        <p className="text-2xl mb-2" aria-hidden="true">🎓</p>
        <h2 className="text-lg font-bold text-white mb-2">
          You have completed Phase 10!
        </h2>
        <p className="text-sm text-gray-400 max-w-md mx-auto">
          You now know intercepting routes, parallel routes, Edge Runtime,
          and i18n — the advanced patterns that power professional Next.js
          applications. Well done making it through all 10 phases.
        </p>
      </div>

      {/* ── Lesson Navigation ────────────────────────────────────────────────── */}
      <div className="mt-8 flex justify-between text-sm">
        <Link href="/phase-10/04-internationalization" className="text-gray-500 hover:text-blue-400 transition-colors">
          ← i18n
        </Link>
        <Link href="/" className="text-blue-400 hover:text-blue-300 transition-colors">
          Home →
        </Link>
      </div>
    </main>
  );
}
