/**
 * Phase 7 — Database & ORM
 * Route: /phase-7
 *
 * WHAT IS THIS PHASE ABOUT?
 * ──────────────────────────
 * Most real-world web apps need persistent storage — a place to SAVE data
 * so it survives server restarts and is shared across all users.
 *
 * This phase covers how Next.js apps connect to databases, with a focus
 * on three popular approaches:
 *
 * 1. PRISMA ORM
 *    A type-safe ORM that generates TypeScript types directly from your
 *    database schema. You write a schema.prisma file → run `prisma generate`
 *    → get a fully typed `PrismaClient` that autocompletes every table and column.
 *    Best for: teams who want strong type safety and a great DX.
 *
 * 2. DRIZZLE ORM
 *    A lightweight SQL query builder with TypeScript-first design.
 *    Unlike Prisma, there is NO code generation — types are inferred directly
 *    from your schema definitions in TypeScript code.
 *    Best for: developers who want to stay close to SQL while keeping types.
 *
 * 3. SUPABASE
 *    An open-source Firebase alternative that bundles Postgres + Auth +
 *    Storage + Realtime subscriptions into one managed platform.
 *    You can use Supabase with Prisma or Drizzle, or with its own JS client.
 *    Best for: teams who want a full backend without managing infrastructure.
 *
 * ⚠️ IMPORTANT NOTE FOR THIS REPO:
 * ──────────────────────────────────
 * None of these libraries (prisma, drizzle-orm, @supabase/ssr) are installed
 * in this learning project. All code shown in the lessons is for LEARNING
 * PURPOSES — patterns and explanations displayed as strings, not executed.
 *
 * WHY SHOW THE PATTERNS WITHOUT RUNNING THEM?
 * ─────────────────────────────────────────────
 * Installing a database ORM requires a real database connection (DATABASE_URL,
 * schema migrations, etc.). That is beyond the scope of this learning repo.
 * Instead, each lesson teaches the CONCEPTS and CODE PATTERNS you would use
 * in a real project. The mini-project uses in-memory arrays to SIMULATE
 * what the real DB-backed version would look like.
 */

import Link from "next/link";
import type { Metadata } from "next";

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "Phase 7 — Database & ORM",
  description:
    "Learn Prisma ORM, Drizzle ORM, and Supabase with Next.js 15. Understand schema design, type-safe queries, and fullstack data patterns.",
};

// ─── Lesson Data ──────────────────────────────────────────────────────────────
const LESSONS = [
  {
    slug: "01-prisma",
    number: "01",
    title: "Prisma ORM",
    description:
      "Define a schema.prisma file → run prisma generate → get a fully typed PrismaClient. The gold standard for type-safe DB access in Node.js.",
    concepts: [
      "schema.prisma",
      "prisma generate",
      "db push vs migrate",
      "CRUD queries",
      "Relations",
      "$transaction",
    ],
    icon: "🔷",
    color: "border-blue-500/20 bg-blue-500/5 hover:border-blue-400/60",
    badge: "text-blue-400",
  },
  {
    slug: "02-drizzle",
    number: "02",
    title: "Drizzle ORM",
    description:
      "Schema-as-TypeScript, zero code generation, SQL-first query builder. Lightweight alternative to Prisma with excellent type inference.",
    concepts: [
      "drizzle schema",
      "Type inference",
      "Query builder",
      "Raw SQL escape hatch",
      "Drizzle vs Prisma",
    ],
    icon: "💧",
    color: "border-cyan-500/20 bg-cyan-500/5 hover:border-cyan-400/60",
    badge: "text-cyan-400",
  },
  {
    slug: "03-supabase",
    number: "03",
    title: "Supabase + Next.js",
    description:
      "Postgres + Auth + Storage + Realtime in one managed platform. Learn the @supabase/ssr package, server vs client instances, and RLS policies.",
    concepts: [
      "@supabase/ssr",
      "Server vs Client instance",
      "Row Level Security",
      "Supabase Auth",
      "Realtime subscriptions",
    ],
    icon: "🟢",
    color: "border-green-500/20 bg-green-500/5 hover:border-green-400/60",
    badge: "text-green-400",
  },
  {
    slug: "mini-project",
    number: "🎯",
    title: "Mini Project — Blog Post Manager",
    description:
      "A simulated fullstack CRUD app using in-memory data. Demonstrates the architecture you would use with a real DB — Server Components, Server Actions pattern, and a client-side CRUD UI.",
    concepts: [
      "In-memory CRUD simulation",
      "Server Component shell",
      "Client CRUD component",
      "Architecture patterns",
      "Production DB swap-in",
    ],
    icon: "📝",
    color: "border-yellow-500/20 bg-yellow-500/5 hover:border-yellow-400/60",
    badge: "text-yellow-400",
  },
] as const;

// ─── ORM Comparison Table Data ─────────────────────────────────────────────────
const COMPARISON = [
  {
    feature: "Schema definition",
    prisma: ".prisma file (DSL)",
    drizzle: "TypeScript code",
    supabase: "SQL migrations or UI",
  },
  {
    feature: "Type safety",
    prisma: "Generated types",
    drizzle: "Inferred types",
    supabase: "Generated (supabase gen)",
  },
  {
    feature: "Code generation",
    prisma: "✅ Required",
    drizzle: "❌ Not needed",
    supabase: "Optional (CLI)",
  },
  {
    feature: "Migrations",
    prisma: "prisma migrate dev",
    drizzle: "drizzle-kit push/generate",
    supabase: "supabase db push",
  },
  {
    feature: "Bundle size",
    prisma: "Larger (Rust engine)",
    drizzle: "Tiny (~7KB)",
    supabase: "JS client only",
  },
  {
    feature: "Auth built-in",
    prisma: "❌ (use NextAuth)",
    drizzle: "❌ (use NextAuth)",
    supabase: "✅ Full Auth system",
  },
  {
    feature: "Realtime",
    prisma: "❌",
    drizzle: "❌",
    supabase: "✅ WebSocket channels",
  },
  {
    feature: "Hosted DB",
    prisma: "❌ (bring your own)",
    drizzle: "❌ (bring your own)",
    supabase: "✅ Managed Postgres",
  },
] as const;

// ─── Page Component ────────────────────────────────────────────────────────────
export default function Phase7Page() {
  return (
    <main className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto">

      {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
      <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-blue-400 transition-colors">
          Home
        </Link>
        <span className="mx-2" aria-hidden="true">›</span>
        <span className="text-gray-300">Phase 7</span>
      </nav>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl font-bold text-blue-400 font-mono" aria-hidden="true">
            P7
          </span>
          <h1 className="text-3xl font-bold text-white">Database &amp; ORM</h1>
        </div>
        <p className="text-gray-400 max-w-2xl leading-relaxed">
          Connect your Next.js app to a real database. Learn Prisma, Drizzle, and
          Supabase — three popular ways to store, query, and manage persistent data
          in fullstack Next.js applications.
        </p>

        {/* ── Important Notice Banner ──────────────────────────────────────── */}
        {/*
         * This banner is CRITICAL for beginners so they understand
         * why running the code examples won't work in this repo.
         * Honesty here prevents hours of confusion.
         */}
        <div className="mt-4 rounded-xl border border-yellow-500/30 bg-yellow-500/5 px-4 py-3">
          <p className="text-sm text-yellow-300 font-semibold mb-1">
            ⚠️ Code Patterns Only — No DB Libraries Installed
          </p>
          <p className="text-xs text-yellow-200/70 leading-relaxed">
            Prisma, Drizzle, and Supabase are NOT installed in this project.
            All code snippets are educational patterns shown as strings.
            The mini-project uses in-memory arrays to simulate real DB behaviour.
          </p>
        </div>
      </header>

      {/* ── ORM Comparison Table ─────────────────────────────────────────────── */}
      {/*
       * A side-by-side comparison helps beginners decide which tool to
       * reach for in their own projects. Show this BEFORE the lessons
       * so learners can orient themselves.
       */}
      <section className="mb-10" aria-labelledby="comparison-heading">
        <h2
          id="comparison-heading"
          className="text-lg font-semibold text-white mb-3"
        >
          Prisma vs Drizzle vs Supabase — At a Glance
        </h2>
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="text-left p-3 text-gray-400 font-medium">Feature</th>
                <th className="text-left p-3 text-blue-400 font-medium">Prisma</th>
                <th className="text-left p-3 text-cyan-400 font-medium">Drizzle</th>
                <th className="text-left p-3 text-green-400 font-medium">Supabase</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row, i) => (
                <tr
                  key={row.feature}
                  className={`border-b border-white/5 ${i % 2 === 0 ? "" : "bg-white/2"}`}
                >
                  <td className="p-3 text-gray-300 font-medium text-xs">{row.feature}</td>
                  <td className="p-3 text-gray-400 text-xs">{row.prisma}</td>
                  <td className="p-3 text-gray-400 text-xs">{row.drizzle}</td>
                  <td className="p-3 text-gray-400 text-xs">{row.supabase}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          Rule of thumb: Prisma for DX + type safety, Drizzle for minimal bundle + SQL
          control, Supabase when you want a full hosted backend out of the box.
        </p>
      </section>

      {/* ── Lessons ──────────────────────────────────────────────────────────── */}
      <section aria-labelledby="lessons-heading">
        <h2
          id="lessons-heading"
          className="text-lg font-semibold text-white mb-4"
        >
          Lessons
        </h2>
        <div className="space-y-4">
          {LESSONS.map((lesson) => (
            <Link
              key={lesson.slug}
              href={`/phase-7/${lesson.slug}`}
              className={`group block rounded-xl border p-5 transition-all duration-200 ${lesson.color}`}
            >
              {/* Row: number + icon + title */}
              <div className="flex items-start gap-3 mb-2">
                <span className={`font-mono font-bold text-sm ${lesson.badge}`}>
                  {lesson.number}
                </span>
                <span className="text-lg leading-none" aria-hidden="true">
                  {lesson.icon}
                </span>
                <h3 className="text-base font-semibold text-white group-hover:text-blue-300 transition-colors">
                  {lesson.title}
                </h3>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-400 mb-3 ml-10">
                {lesson.description}
              </p>

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
        <Link
          href="/phase-6"
          className="text-gray-500 hover:text-blue-400 transition-colors"
        >
          ← Phase 6
        </Link>
        <Link
          href="/phase-8"
          className="text-blue-400 hover:text-blue-300 transition-colors"
        >
          Phase 8 →
        </Link>
      </div>
    </main>
  );
}
