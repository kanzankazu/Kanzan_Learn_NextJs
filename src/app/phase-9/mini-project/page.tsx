/**
 * Mini Project — Deployment Checklist
 * Route: /phase-9/mini-project
 *
 * WHAT IS THIS MINI PROJECT?
 * ───────────────────────────
 * An interactive pre-deployment checklist that walks you through everything
 * you should verify before pushing your Next.js app to production.
 *
 * WHY A CHECKLIST?
 * ─────────────────
 * Deployment mistakes are expensive. A forgotten secret, an uncached image,
 * a default admin password — any of these can cause downtime, data breaches,
 * or performance problems in production.
 *
 * Experienced developers use checklists because they trust the process,
 * not their memory. This checklist covers four key areas:
 *
 * 1. BUILD & TEST
 *    Does the project actually compile? Do tests pass? Are there TypeScript errors?
 *
 * 2. SECURITY
 *    Are all secrets in environment variables? Auth secrets rotated? HTTPS on?
 *
 * 3. PERFORMANCE
 *    Are images optimised? Is caching configured? Is the bundle size reasonable?
 *
 * 4. MONITORING
 *    Will you know when something breaks? Are error logs set up? Alerts configured?
 *
 * ARCHITECTURE PATTERN:
 * ──────────────────────
 * This page is a Server Component (no 'use client').
 * It handles static metadata and layout, then delegates interactivity to
 * the DeployChecklist Client Component.
 *
 * This is the standard Next.js pattern:
 *   Server Component  → metadata, layout, non-interactive UI
 *   Client Component  → useState, event handlers, real-time updates
 *
 * The Server Component imports the Client Component — Next.js handles
 * the boundary automatically. The client component is hydrated in the browser.
 */

import Link from "next/link";
import type { Metadata } from "next";
import { DeployChecklist } from "./_components/DeployChecklist";

// ─── Metadata ─────────────────────────────────────────────────────────────────
// Server Components can export metadata. This is tree-shaken from the
// client bundle — the browser never downloads this object.
export const metadata: Metadata = {
  title: "Mini Project — Deployment Checklist",
  description:
    "An interactive pre-deployment checklist for Next.js 15 apps. Covers Build & Test, Security, Performance, and Monitoring categories with live progress tracking.",
};

// ─── Page Component ────────────────────────────────────────────────────────────
// This is a Server Component (no 'use client' at the top).
// It renders static structure and imports the interactive Client Component.
export default function MiniProjectPage() {
  return (
    <main className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto">

      {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
      {/*
       * Breadcrumb helps users understand their current position in the
       * lesson hierarchy and navigate back quickly.
       */}
      <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
        <span className="mx-2" aria-hidden="true">›</span>
        <Link href="/phase-9" className="hover:text-blue-400 transition-colors">Phase 9</Link>
        <span className="mx-2" aria-hidden="true">›</span>
        <span className="text-gray-300">Mini Project</span>
      </nav>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl" aria-hidden="true">🚀</span>
          <h1 className="text-3xl font-bold text-white">Deployment Checklist</h1>
        </div>
        <p className="text-gray-400 leading-relaxed max-w-2xl">
          A pre-flight checklist before you push to production. Tick off items across
          Build &amp; Test, Security, Performance, and Monitoring. A progress bar
          shows how ready your app is.
        </p>
      </header>

      {/* ── Architecture Note ────────────────────────────────────────────────── */}
      {/*
       * This callout explains WHY the page is split into Server + Client.
       * Beginners often think 'use client' belongs at the page level —
       * this clarifies the recommended pattern.
       */}
      <div className="mb-8 rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-3">
        <p className="text-sm text-blue-300 font-semibold mb-1">
          💡 Architecture note — Server + Client split
        </p>
        <p className="text-xs text-blue-200/70 leading-relaxed">
          This page is a <strong className="text-blue-300">Server Component</strong>.
          It handles static metadata and layout. The interactive checklist below is
          a <strong className="text-blue-300">Client Component</strong> (
          <code className="bg-black/30 px-1 rounded">DeployChecklist.tsx</code>) with{" "}
          <code className="bg-black/30 px-1 rounded">useState</code> for tracking
          checked items. This is the standard Next.js pattern: push interactivity
          to the leaf nodes, keep the tree server-rendered by default.
        </p>
      </div>

      {/* ── Interactive Checklist ────────────────────────────────────────────── */}
      {/*
       * DeployChecklist is a Client Component imported into this Server Component.
       * Next.js automatically creates the server/client boundary here.
       * The checklist handles its own state — this parent page stays server-rendered.
       */}
      <DeployChecklist />

      {/* ── What You Learned ─────────────────────────────────────────────────── */}
      <section className="mt-10 mb-8" aria-labelledby="learned-heading">
        <h2 id="learned-heading" className="text-lg font-semibold text-white mb-4">
          What you built in this mini project
        </h2>
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
          {[
            {
              icon: "🏗️",
              title: "Server + Client Component split",
              body: "Server Component for layout and metadata, Client Component for interactive state — the correct Next.js pattern.",
            },
            {
              icon: "✅",
              title: "useState for checklist state",
              body: "A Set<string> tracks which items are checked. Toggling adds or removes IDs from the Set.",
            },
            {
              icon: "📊",
              title: "Derived progress percentage",
              body: "Progress is calculated from state — not stored separately. Derived state is simpler and always in sync.",
            },
            {
              icon: "🎨",
              title: "Dynamic colour based on progress",
              body: "Red below 50%, yellow 50–79%, green at 80%+. A single helper function maps the number to a Tailwind class.",
            },
          ].map((card) => (
            <div key={card.title} className="rounded-xl border border-white/10 bg-white/2 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span aria-hidden="true">{card.icon}</span>
                <h3 className="text-sm font-semibold text-white">{card.title}</h3>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">{card.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Phase Navigation ─────────────────────────────────────────────────── */}
      <div className="flex justify-between text-sm">
        <Link href="/phase-9/03-env-variables" className="text-gray-500 hover:text-blue-400 transition-colors">
          ← Env Variables
        </Link>
        <Link href="/phase-10" className="text-blue-400 hover:text-blue-300 transition-colors">
          Phase 10 →
        </Link>
      </div>
    </main>
  );
}
