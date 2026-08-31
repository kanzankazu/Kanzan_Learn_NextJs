/**
 * Home Page — app/page.tsx
 *
 * This is the root page of the app, rendered at the "/" route.
 *
 * KEY CONCEPTS:
 * ─────────────
 * • This is a SERVER COMPONENT — it runs on the server, zero JS sent to browser.
 * • No useState, no useEffect, no event handlers here (those need 'use client').
 * • The file name `page.tsx` is special — Next.js uses it to create a route.
 *   Any folder inside `app/` with a `page.tsx` becomes a publicly accessible URL.
 *
 * ROUTING RULE:
 *   app/page.tsx             → "/"
 *   app/about/page.tsx       → "/about"
 *   app/phase-0/page.tsx     → "/phase-0"
 *   app/blog/[id]/page.tsx   → "/blog/123", "/blog/abc", etc.
 *
 * WHY NO 'use client' HERE:
 * ─────────────────────────
 * This page only renders static HTML — no interactivity, no browser APIs.
 * Keeping it as a Server Component means zero JS is shipped to the browser for
 * this page, which is great for performance and initial load time.
 */

import Link from "next/link";

// ─── Type Definitions ─────────────────────────────────────────────────────────
// Define the possible status values for a phase.
// Using a union type ensures TypeScript catches typos like "dne" or "progres".
type PhaseStatus = "done" | "in-progress" | "planned";

// The shape of a single phase entry in our PHASES array.
interface Phase {
  number: number;
  title: string;
  description: string;
  topics: readonly string[];
  status: PhaseStatus;
  href: string;
  duration: string;
}

// ─── Phase Data ───────────────────────────────────────────────────────────────
// All 11 phases defined as a plain array.
// This is static data — no database, no API call needed.
// Since this is a Server Component, we can define it directly in the file.
const PHASES: Phase[] = [
  {
    number: 0,
    title: "File-based Routing",
    description:
      "Understand how folders and files in app/ become URLs. Learn dynamic routes, nested layouts, and route groups.",
    topics: ["App Router structure", "Dynamic routes [slug]", "Route groups (group)", "Nested layouts"],
    status: "done",
    href: "/phase-0",
    duration: "~1 week",
  },
  {
    number: 1,
    title: "Server vs Client Components",
    description:
      "The most important mental model in Next.js 13+. Know when to render on the server vs the browser.",
    topics: ["React Server Components", "'use client' directive", "Composition patterns", "Server/Client boundary"],
    status: "done",
    href: "/phase-1",
    duration: "~1–2 weeks",
  },
  {
    number: 2,
    title: "Data Fetching",
    description:
      "Fetch data directly in Server Components. No useEffect, no useState for data — just async/await.",
    topics: ["fetch() in RSC", "Caching & revalidation", "Parallel fetching", "Server Actions"],
    status: "done",
    href: "/phase-2",
    duration: "~2 weeks",
  },
  {
    number: 3,
    title: "Rendering Strategies",
    description:
      "Control when your pages are rendered — at build time (SSG), on each request (SSR), or periodically (ISR).",
    topics: ["Static Rendering (SSG)", "Dynamic Rendering (SSR)", "ISR (revalidate)", "Streaming & Suspense"],
    status: "done",
    href: "/phase-3",
    duration: "~2 weeks",
  },
  {
    number: 4,
    title: "Navigation & Metadata",
    description:
      "Navigate between pages, handle loading/error states, and generate SEO-friendly metadata.",
    topics: ["<Link> & useRouter", "generateMetadata()", "loading.tsx / error.tsx", "not-found.tsx"],
    status: "done",
    href: "/phase-4",
    duration: "~1 week",
  },
  {
    number: 5,
    title: "Route Handlers & API",
    description:
      "Build backend API endpoints inside your Next.js app. No separate Express server needed.",
    topics: ["app/api/route.ts", "GET/POST/PUT/DELETE", "Middleware", "NextRequest / NextResponse"],
    status: "done",
    href: "/phase-5",
    duration: "~2 weeks",
  },
  {
    number: 6,
    title: "Authentication",
    description:
      "Add login/logout with Auth.js (NextAuth). Protect routes with middleware and manage sessions.",
    topics: ["Auth.js providers", "Session management", "Middleware protection", "Role-based access"],
    status: "done",
    href: "/phase-6",
    duration: "~2 weeks",
  },
  {
    number: 7,
    title: "Database & ORM",
    description:
      "Connect a real database using Prisma, Drizzle, or Supabase. Run queries directly in Server Components.",
    topics: ["Prisma ORM", "Drizzle ORM", "Supabase + Next.js", "Server-side queries"],
    status: "done",
    href: "/phase-7",
    duration: "~2 weeks",
  },
  {
    number: 8,
    title: "Performance & Optimization",
    description:
      "Optimise images, fonts, scripts, and bundle size. Aim for Lighthouse scores above 90.",
    topics: ["next/image", "next/font", "next/script", "Bundle analysis"],
    status: "done",
    href: "/phase-8",
    duration: "~2 weeks",
  },
  {
    number: 9,
    title: "Deployment",
    description:
      "Deploy your Next.js app to Vercel (one click) or a VPS with Docker. Manage environment variables safely.",
    topics: ["Vercel deploy", "Docker + nginx", "Environment variables", "CI/CD with GitHub Actions"],
    status: "done",
    href: "/phase-9",
    duration: "~1 week",
  },
  {
    number: 10,
    title: "Advanced Next.js",
    description:
      "Deep dive into intercepting routes, parallel routes, edge runtime, and internationalisation.",
    topics: ["Intercepting routes", "Parallel routes @slot", "Edge runtime", "i18n with next-intl"],
    status: "done",
    href: "/phase-10",
    duration: "Ongoing",
  },
];

// ─── StatusBadge Component ────────────────────────────────────────────────────
// A tiny pure-display component that renders a coloured status pill.
// No interactivity → no 'use client' needed.
function StatusBadge({ status }: { status: PhaseStatus }) {
  const styles: Record<PhaseStatus, string> = {
    done: "bg-green-500/20 text-green-400 border border-green-500/30",
    "in-progress": "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
    planned: "bg-gray-500/20 text-gray-400 border border-gray-500/30",
  };
  const labels: Record<PhaseStatus, string> = {
    done: "✅ Done",
    "in-progress": "🔄 In Progress",
    planned: "⏳ Planned",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

// ─── PhaseCardInner Component ─────────────────────────────────────────────────
// The shared visual content inside each phase card.
// Extracted so it can be reused by both the <Link> variant (done) and
// the plain <div> variant (planned/in-progress).
function PhaseCardInner({ phase }: { phase: Phase }) {
  return (
    <>
      {/* Row: phase number + status badge */}
      <div className="flex items-start justify-between mb-3 gap-2">
        <span className="text-2xl font-bold text-blue-400 font-mono">
          P{phase.number}
        </span>
        <StatusBadge status={phase.status} />
      </div>

      {/* Phase title — highlighted on hover via parent's group-hover */}
      <h2 className="text-base font-semibold text-white mb-1 group-hover:text-blue-300 transition-colors">
        {phase.title}
      </h2>

      {/* Estimated duration */}
      <p className="text-xs text-gray-500 mb-2">{phase.duration}</p>

      {/* Short description */}
      <p className="text-sm text-gray-400 leading-relaxed mb-3">{phase.description}</p>

      {/* Topic bullet list */}
      <ul className="space-y-1">
        {phase.topics.map((topic) => (
          <li key={topic} className="text-xs text-gray-500 flex items-center gap-1.5">
            {/* Decorative chevron — purely visual */}
            <span className="text-blue-500/60" aria-hidden="true">›</span>
            {topic}
          </li>
        ))}
      </ul>
    </>
  );
}

// ─── PhaseCard Component ──────────────────────────────────────────────────────
// Renders either a clickable <Link> card (done phases) or
// a non-interactive <div> card (planned/in-progress phases).
//
// IMPORTANT: Server Components cannot have event handlers (onClick, onChange, etc.).
// That's why we DON'T use onClick to block navigation for planned phases —
// instead we simply don't render a <Link> at all.
function PhaseCard({ phase }: { phase: Phase }) {
  if (phase.status === "done") {
    // ── Done phase: navigable Link card ─────────────────────────────────────
    // <Link> is Next.js's enhanced anchor tag. It:
    //   1. Prefetches the target page in the background when visible
    //   2. Does client-side navigation (no full page reload)
    //   3. Falls back to a plain <a> if JS is disabled
    return (
      <Link
        href={phase.href}
        className="group block rounded-xl border border-blue-500/40 hover:border-blue-400 hover:bg-blue-500/5 p-5 transition-all duration-200"
      >
        <PhaseCardInner phase={phase} />
      </Link>
    );
  }

  // ── Planned / in-progress phase: non-navigable div card ───────────────────
  // We render a <div> instead of <Link> so the card is visible but not clickable.
  // The `cursor-not-allowed` + `opacity-60` gives a visual "disabled" hint.
  return (
    <div
      className="group block rounded-xl border border-white/10 p-5 opacity-60 cursor-not-allowed"
      role="article"
      aria-label={`Phase ${phase.number}: ${phase.title} — ${phase.status}`}
    >
      <PhaseCardInner phase={phase} />
    </div>
  );
}

// ─── Home Page (default export) ───────────────────────────────────────────────
// `export default` marks this as the page component for this route.
// Next.js calls this function on the server and sends the resulting HTML.
export default function HomePage() {
  // Compute progress stats at render time (server-side).
  const doneCount = PHASES.filter((p) => p.status === "done").length;
  const totalCount = PHASES.length;
  const progressPercent = Math.round((doneCount / totalCount) * 100);

  return (
    // `<main>` is the semantic HTML5 landmark for the primary content area.
    // max-w-6xl + mx-auto centres the content on wide screens.
    <main className="min-h-screen p-6 md:p-12 max-w-6xl mx-auto">

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <header className="mb-10">
        {/* Logo + title row */}
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl" aria-hidden="true">▲</span>
          <h1 className="text-3xl font-bold text-white">Kanzan Learn Next.js</h1>
        </div>

        <p className="text-gray-400 text-base mb-4 max-w-xl">
          A structured Next.js learning journey — from zero to production-ready.
          Each phase builds on the previous one.
        </p>

        {/* Progress bar — shows how many phases are complete */}
        <div className="flex items-center gap-3">
          <div
            className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden max-w-sm"
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Learning progress"
          >
            {/*
             * The inner bar width is driven by an inline style.
             * We use inline style here because Tailwind purges dynamic class names
             * that aren't in the source at build time — `w-[${n}%]` won't work
             * unless the exact string is present. Inline style is the safe choice.
             */}
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-sm text-gray-400">
            {doneCount}/{totalCount} phases complete
          </span>
        </div>
      </header>

      {/* ── Phase Grid ───────────────────────────────────────────────────── */}
      {/*
       * CSS Grid with auto-fill columns.
       * minmax(280px, 1fr) means: each column is at least 280px wide.
       * auto-fill: create as many columns as fit the container width.
       * Result: responsive grid with no media queries.
       */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
      >
        {PHASES.map((phase) => (
          <PhaseCard key={phase.number} phase={phase} />
        ))}
      </div>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="mt-12 pt-6 border-t border-white/10 text-center text-xs text-gray-600">
        <p>
          Built by{" "}
          <a
            href="https://github.com/kanzankazu"
            className="text-blue-500 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            kanzankazu
          </a>{" "}
          · MIT License ·{" "}
          <a
            href="https://github.com/kanzankazu/Kanzan_Learn_NextJs"
            className="text-blue-500 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </p>
      </footer>
    </main>
  );
}
