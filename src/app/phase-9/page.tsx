/**
 * Phase 9 — Deployment
 * Route: /phase-9
 *
 * WHAT IS THIS PHASE ABOUT?
 * ──────────────────────────
 * Writing code is only half of software engineering. The other half is
 * GETTING YOUR APP IN FRONT OF USERS — that is deployment.
 *
 * Deployment means taking your local Next.js project and publishing it
 * to a server that anyone on the internet can reach, 24 hours a day.
 *
 * This phase covers three critical topics:
 *
 * 1. VERCEL (the easiest path)
 *    Vercel is the company that BUILT Next.js. Their platform is designed
 *    specifically for Next.js apps. Push to GitHub → your site is live in
 *    60 seconds. Server Components, Edge Functions, Image Optimization —
 *    all "just work" with zero configuration. This is the right choice
 *    for most projects.
 *
 * 2. DOCKER + VPS (the DIY path)
 *    Build a Docker image of your app and run it on any Linux server
 *    (DigitalOcean, Linode, AWS EC2, etc.). More setup, but YOU control
 *    the server. No vendor lock-in. Can be cheaper at scale. Required
 *    when company policy demands on-premises deployment.
 *
 * 3. ENVIRONMENT VARIABLES (essential for both paths)
 *    Your app needs secrets (API keys, database URLs, JWT secrets) that
 *    must NEVER appear in your source code. Environment variables are the
 *    standard way to inject these secrets at runtime, separately from code.
 *
 * WHICH SHOULD YOU CHOOSE?
 * ─────────────────────────
 * New project, personal app, startup, or team already on Vercel?
 *   → Vercel. Zero ops overhead.
 *
 * Need full server control, running microservices, or company mandates
 * self-hosting?
 *   → Docker + VPS.
 *
 * You will always need to understand environment variables regardless
 * of which deployment platform you choose.
 */

import Link from "next/link";
import type { Metadata } from "next";

// ─── Metadata ─────────────────────────────────────────────────────────────────
// This metadata object feeds the <title> and <meta description> tags in the
// HTML <head>. Search engines and browser tabs read these values.
export const metadata: Metadata = {
  title: "Phase 9 — Deployment",
  description:
    "Learn how to deploy Next.js 15 apps. Covers Vercel, Docker + VPS, environment variables, and a pre-deployment checklist.",
};

// ─── Lesson Data ──────────────────────────────────────────────────────────────
// Define lessons as a data array and render them in a loop.
// This pattern is easier to maintain than repeating JSX blocks.
const LESSONS = [
  {
    slug: "01-vercel-deploy",
    number: "01",
    title: "Deploying to Vercel",
    description:
      "The fastest way to deploy a Next.js app. Connect your GitHub repo, push code, and Vercel handles builds, CDN distribution, SSL, and preview deployments automatically.",
    concepts: [
      "vercel.json",
      "Automatic deploys on push",
      "Preview deployments",
      "Vercel CLI",
      "Environment variables UI",
      "Custom domains",
    ],
    icon: "▲",
    color: "border-blue-500/20 bg-blue-500/5 hover:border-blue-400/60",
    badge: "text-blue-400",
  },
  {
    slug: "02-docker-vps",
    number: "02",
    title: "Docker + VPS",
    description:
      "Build a Docker image using Next.js standalone output and run it on any Linux VPS. Understand multi-stage builds, nginx reverse proxy, and docker-compose for production.",
    concepts: [
      "Dockerfile multi-stage",
      "next build --output standalone",
      ".dockerignore",
      "nginx reverse proxy",
      "docker-compose",
      "PM2 alternative",
    ],
    icon: "🐳",
    color: "border-cyan-500/20 bg-cyan-500/5 hover:border-cyan-400/60",
    badge: "text-cyan-400",
  },
  {
    slug: "03-env-variables",
    number: "03",
    title: "Environment Variables",
    description:
      "Store secrets and configuration outside your code. Understand .env.local vs .env, the NEXT_PUBLIC_ prefix, server-only vs public vars, and validation with Zod.",
    concepts: [
      ".env.local",
      "NEXT_PUBLIC_ prefix",
      "Server-only secrets",
      "Runtime vs build-time",
      "process.env",
      "Zod validation pattern",
    ],
    icon: "🔐",
    color: "border-green-500/20 bg-green-500/5 hover:border-green-400/60",
    badge: "text-green-400",
  },
  {
    slug: "mini-project",
    number: "🎯",
    title: "Mini Project — Deployment Checklist",
    description:
      "An interactive pre-deployment checklist covering Build & Test, Security, Performance, and Monitoring. Track your readiness with a live progress indicator.",
    concepts: [
      "Interactive checklist",
      "useState for progress",
      "Category grouping",
      "Color progress indicator",
      "Deployment best practices",
    ],
    icon: "✅",
    color: "border-yellow-500/20 bg-yellow-500/5 hover:border-yellow-400/60",
    badge: "text-yellow-400",
  },
] as const;

// ─── Vercel vs Docker Comparison Data ─────────────────────────────────────────
// A concise comparison table helps beginners pick the right tool for their
// situation before diving into either lesson.
const COMPARISON = [
  {
    feature: "Setup time",
    vercel: "2 minutes (GitHub connect)",
    docker: "1–2 hours (server config)",
  },
  {
    feature: "Ease of use",
    vercel: "⭐⭐⭐⭐⭐ (GUI driven)",
    docker: "⭐⭐ (CLI + config files)",
  },
  {
    feature: "Cost (hobby)",
    vercel: "Free tier available",
    docker: "$5–$10/month VPS",
  },
  {
    feature: "Cost (at scale)",
    vercel: "Can get expensive",
    docker: "Predictable, cheaper",
  },
  {
    feature: "Scalability",
    vercel: "Automatic (edge network)",
    docker: "Manual (add servers/nodes)",
  },
  {
    feature: "Vendor lock-in",
    vercel: "Yes (Vercel-specific features)",
    docker: "No (run anywhere)",
  },
  {
    feature: "Server control",
    vercel: "Limited (managed platform)",
    docker: "Full root access",
  },
  {
    feature: "Preview deploys",
    vercel: "✅ Automatic per PR",
    docker: "❌ Manual setup",
  },
  {
    feature: "SSL / HTTPS",
    vercel: "✅ Automatic (Let's Encrypt)",
    docker: "Manual (certbot / nginx)",
  },
  {
    feature: "Best for",
    vercel: "Teams, startups, quick launch",
    docker: "Self-hosted, custom infra, scale",
  },
] as const;

// ─── Page Component ────────────────────────────────────────────────────────────
export default function Phase9Page() {
  return (
    <main className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto">

      {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
      {/*
       * Breadcrumbs help users understand where they are in the site hierarchy.
       * Always include a "Home" link so users can easily go back to the root.
       */}
      <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-blue-400 transition-colors">
          Home
        </Link>
        <span className="mx-2" aria-hidden="true">›</span>
        <span className="text-gray-300">Phase 9</span>
      </nav>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl font-bold text-blue-400 font-mono" aria-hidden="true">
            P9
          </span>
          <h1 className="text-3xl font-bold text-white">Deployment</h1>
        </div>
        <p className="text-gray-400 max-w-2xl leading-relaxed">
          Take your Next.js app from local development to production. Learn Vercel
          for the fastest path, Docker + VPS for full control, and environment
          variables to keep your secrets safe on every platform.
        </p>
      </header>

      {/* ── Vercel vs Docker Comparison Table ───────────────────────────────── */}
      {/*
       * Put the comparison BEFORE the lessons so beginners can orient
       * themselves and choose which lesson to prioritize.
       */}
      <section className="mb-10" aria-labelledby="comparison-heading">
        <h2
          id="comparison-heading"
          className="text-lg font-semibold text-white mb-3"
        >
          Vercel vs Docker + VPS — At a Glance
        </h2>
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="text-left p-3 text-gray-400 font-medium">Criterion</th>
                {/* aria-label helps screen readers understand the column context */}
                <th className="text-left p-3 text-blue-400 font-medium">▲ Vercel</th>
                <th className="text-left p-3 text-cyan-400 font-medium">🐳 Docker + VPS</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row, i) => (
                <tr
                  key={row.feature}
                  className={`border-b border-white/5 ${i % 2 === 0 ? "" : "bg-white/2"}`}
                >
                  <td className="p-3 text-gray-300 font-medium text-xs">{row.feature}</td>
                  <td className="p-3 text-gray-400 text-xs">{row.vercel}</td>
                  <td className="p-3 text-gray-400 text-xs">{row.docker}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Quick recommendation */}
        <p className="text-xs text-gray-600 mt-2">
          Rule of thumb: start with Vercel for speed and simplicity. Move to
          Docker + VPS only when you need custom infrastructure or cost
          optimization at scale.
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
              href={`/phase-9/${lesson.slug}`}
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

              {/* Concept tags — show what skills each lesson teaches */}
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
      {/*
       * Bottom navigation lets users move between phases without scrolling
       * back to the top or the home page.
       */}
      <div className="mt-10 flex justify-between text-sm">
        <Link
          href="/phase-8"
          className="text-gray-500 hover:text-blue-400 transition-colors"
        >
          ← Phase 8
        </Link>
        <Link
          href="/phase-10"
          className="text-blue-400 hover:text-blue-300 transition-colors"
        >
          Phase 10 →
        </Link>
      </div>
    </main>
  );
}
