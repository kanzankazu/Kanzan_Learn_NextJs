/**
 * Phase 5 — Route Handlers & API
 * Route: /phase-5
 *
 * WHAT IS THIS PHASE ABOUT?
 * ──────────────────────────
 * Next.js is not just a frontend framework — it can ALSO handle backend API requests.
 * Route Handlers let you define server-side HTTP endpoints (GET, POST, PUT, DELETE)
 * inside the same project as your UI, without needing a separate backend server.
 *
 * This phase covers three key areas:
 *
 * 1. ROUTE HANDLERS (API Routes)
 *    Files named `route.ts` inside the `app/` directory become API endpoints.
 *    They replace the old `pages/api/` directory from Next.js 12/13.
 *    These run on the server — they can query databases, call external APIs,
 *    set cookies, and return JSON or any other format.
 *
 * 2. MIDDLEWARE
 *    A special `middleware.ts` file at the project root that runs BEFORE
 *    every matched request. Use it for: auth checks, redirects, locale detection,
 *    setting headers, A/B testing, and more.
 *    Middleware runs on the Edge runtime — super fast, close to the user.
 *
 * 3. MINI PROJECT — Live API Demo
 *    A client component that fetches from a real route handler in this phase.
 *    Demonstrates the full loop: server endpoint → client fetch → UI display.
 *
 * KEY CONCEPT — app/api/route.ts is NOT a React page:
 * ─────────────────────────────────────────────────────
 * Route handlers export HTTP method functions (GET, POST, etc.), NOT React components.
 * They receive a Request object and return a Response.
 * You cannot visit them in a browser like a normal page (you get raw JSON).
 *
 *   app/
 *   ├── page.tsx          ← React component, renders HTML in browser
 *   └── api/
 *       └── route.ts      ← NOT a React component, handles HTTP requests
 *
 * HOW THEY WORK TOGETHER:
 * ────────────────────────
 *   Browser ──fetch──▶ /api/items  ──▶  route.ts (runs on server)
 *                                        ↓ query DB / call API / compute
 *                      Response.json()  ──▶  Browser receives JSON
 */

import Link from "next/link";
import type { Metadata } from "next";

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "Phase 5 — Route Handlers & API",
  description:
    "Learn how to build server-side API endpoints with Route Handlers and control request flow with Middleware in Next.js 15.",
};

// ─── Lesson Data ──────────────────────────────────────────────────────────────
// Each entry maps to one route inside /phase-5/.
const LESSONS = [
  {
    slug: "01-route-handlers",
    number: "01",
    title: "Route Handlers (API Routes)",
    description:
      "Create server-side HTTP endpoints using app/api/route.ts. Handle GET, POST, PUT, DELETE — no separate backend needed.",
    concepts: [
      "app/api/route.ts",
      "GET / POST / PUT / DELETE",
      "NextRequest & NextResponse",
      "Cookies in handlers",
      "Replaces pages/api/",
    ],
    icon: "🔌",
    color: "border-blue-500/20 bg-blue-500/5 hover:border-blue-400/60",
    badge: "text-blue-400",
  },
  {
    slug: "02-middleware",
    number: "02",
    title: "Middleware",
    description:
      "Run code before a request completes. Redirect, rewrite, set headers, or guard routes — all on the Edge, super fast.",
    concepts: [
      "middleware.ts location",
      "matcher config",
      "Redirect & rewrite",
      "Auth guard pattern",
      "Locale detection",
    ],
    icon: "🛡️",
    color: "border-purple-500/20 bg-purple-500/5 hover:border-purple-400/60",
    badge: "text-purple-400",
  },
  {
    slug: "mini-project",
    number: "🎯",
    title: "Mini Project — Live API Demo",
    description:
      "A client component that fetches from the real /phase-5/api/items route handler. Search, filter, and display live data.",
    concepts: [
      "Client fetch to route handler",
      "Search query param",
      "useState + useEffect",
      "Loading & error states",
    ],
    icon: "⚡",
    color: "border-yellow-500/20 bg-yellow-500/5 hover:border-yellow-400/60",
    badge: "text-yellow-400",
  },
] as const;

// ─── Quick Concept Cards ───────────────────────────────────────────────────────
// A summary panel at the top of the phase index so learners know the
// core mental model before they dive into individual lessons.
const CONCEPTS = [
  {
    icon: "📄",
    title: "app/api/route.ts",
    body: "A file that exports HTTP method functions. NOT a React component. Returns JSON or any Response. Lives inside the app/ directory.",
    color: "border-blue-500/20 bg-blue-500/5",
    textColor: "text-blue-300",
  },
  {
    icon: "🌐",
    title: "Route Handler vs Page",
    body: "page.tsx renders HTML for a browser. route.ts handles HTTP requests and returns data. Both live in app/ but they serve completely different purposes.",
    color: "border-green-500/20 bg-green-500/5",
    textColor: "text-green-300",
  },
  {
    icon: "⚙️",
    title: "Middleware (middleware.ts)",
    body: "Runs before every matched request — before the page or handler. Lives at the project root. Perfect for auth guards, redirects, and header injection.",
    color: "border-purple-500/20 bg-purple-500/5",
    textColor: "text-purple-300",
  },
  {
    icon: "🔁",
    title: "Full Loop",
    body: "Client calls fetch('/api/items') → route.ts runs on server → queries data → returns Response.json() → client receives JSON → updates UI.",
    color: "border-orange-500/20 bg-orange-500/5",
    textColor: "text-orange-300",
  },
] as const;

// ─── Page Component ────────────────────────────────────────────────────────────
// Server Component — no hooks, no interactivity needed here.
export default function Phase5Page() {
  return (
    <main className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto">

      {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
      <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
        <span className="mx-2" aria-hidden="true">›</span>
        <span className="text-gray-300">Phase 5</span>
      </nav>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl font-bold text-blue-400 font-mono" aria-hidden="true">P5</span>
          <h1 className="text-3xl font-bold text-white">Route Handlers &amp; API</h1>
        </div>
        <p className="text-gray-400 max-w-2xl leading-relaxed">
          Build server-side API endpoints directly inside your Next.js app — no separate
          backend needed. Then control every incoming request with Middleware.
        </p>
      </header>

      {/* ── Quick Concepts ──────────────────────────────────────────────────── */}
      {/*
       * These four cards give beginners the mental model BEFORE they
       * read the detailed lessons. The goal: "I know what this phase is about"
       * after reading just these cards.
       */}
      <section className="mb-10" aria-labelledby="concepts-heading">
        <h2 id="concepts-heading" className="text-lg font-semibold text-white mb-4">
          Core Concepts
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {CONCEPTS.map((c) => (
            <div key={c.title} className={`rounded-xl border p-4 ${c.color}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl" aria-hidden="true">{c.icon}</span>
                <h3 className={`text-sm font-semibold ${c.textColor}`}>{c.title}</h3>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Key Distinction Box ──────────────────────────────────────────────── */}
      {/*
       * This is the single most important thing to understand in this phase.
       * Beginners often confuse page.tsx and route.ts — this box makes it crystal clear.
       */}
      <section className="mb-10 rounded-xl border border-white/10 bg-white/2 p-5" aria-label="Key distinction">
        <h2 className="text-base font-semibold text-white mb-3">
          🔑 Key Distinction: <code className="text-blue-300 font-mono">page.tsx</code> vs{" "}
          <code className="text-purple-300 font-mono">route.ts</code>
        </h2>
        <pre className="bg-black/40 border border-white/10 rounded-lg p-4 font-mono text-sm text-gray-300 overflow-x-auto leading-relaxed">
{`app/
├── page.tsx             ← React component, renders HTML for the browser
├── about/
│   └── page.tsx         ← Another React component
└── api/
    └── items/
        └── route.ts     ← HTTP handler, returns JSON — NOT a React component

// VISITING /api/items in a browser → you see raw JSON, not a page
// FETCHING /api/items from code   → you get structured data back`}
        </pre>
        <p className="text-xs text-gray-500 mt-3 leading-relaxed">
          Both files live inside <code className="text-gray-400">app/</code> and follow the same
          folder-based routing rules — but they serve completely different purposes.
          A folder can have BOTH a <code className="text-gray-400">page.tsx</code> AND a{" "}
          <code className="text-gray-400">route.ts</code> at the same path.
        </p>
      </section>

      {/* ── Lessons List ────────────────────────────────────────────────────── */}
      <section aria-labelledby="lessons-heading">
        <h2 id="lessons-heading" className="text-lg font-semibold text-white mb-4">Lessons</h2>
        <div className="space-y-4">
          {LESSONS.map((lesson) => (
            <Link
              key={lesson.slug}
              href={`/phase-5/${lesson.slug}`}
              className={`group block rounded-xl border p-5 transition-all duration-200 ${lesson.color}`}
            >
              {/* Row: number + icon + title */}
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
        <Link href="/phase-4" className="text-gray-500 hover:text-blue-400 transition-colors">
          ← Phase 4
        </Link>
        <Link href="/phase-6" className="text-blue-400 hover:text-blue-300 transition-colors">
          Phase 6 →
        </Link>
      </div>
    </main>
  );
}
