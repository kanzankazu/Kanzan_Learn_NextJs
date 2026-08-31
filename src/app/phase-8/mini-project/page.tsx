/**
 * Phase 8 Mini Project — Optimization Checklist
 * Route: /phase-8/mini-project
 *
 * WHAT IS THIS MINI PROJECT?
 * ───────────────────────────
 * An interactive checklist that consolidates ALL the optimization techniques
 * from Phase 8. Each item maps to a real Lighthouse metric improvement.
 *
 * ARCHITECTURE:
 * ─────────────
 * This page is a SERVER COMPONENT — it has no 'use client' directive.
 *
 * But the checklist itself needs to be interactive (useState for checkboxes).
 * Solution: split into two parts:
 *
 *   - page.tsx (Server Component)
 *       Renders static content: header, intro, Lighthouse tip callout.
 *       Imports <ChecklistClient> and passes the checklist items as props.
 *
 *   - _components/ChecklistClient.tsx (Client Component)
 *       Has 'use client' at the top.
 *       Manages checked state with useState.
 *       Renders the interactive checkboxes and score counter.
 *
 * WHY THIS SPLIT?
 * ────────────────
 * The header text, phase navigation, and intro copy are STATIC — they never
 * change. Rendering them as a Server Component means:
 *   - They are pre-rendered as HTML on the server (fast FCP)
 *   - Their JavaScript is NOT sent to the browser (smaller bundle)
 *
 * Only the interactive part (checkboxes, score) requires client-side JS,
 * so only that part is a Client Component.
 *
 * This is the "push 'use client' as far down the tree as possible" pattern —
 * a core performance best practice in Next.js App Router.
 */

import Link from "next/link";
import type { Metadata } from "next";
import { ChecklistClient } from "./_components/ChecklistClient";

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "Mini Project — Optimization Checklist",
  description:
    "An interactive checklist of all Phase 8 optimization techniques with their Lighthouse impact. Check off items as you apply them to your projects.",
};

// ─── Checklist Items ───────────────────────────────────────────────────────────
// Defined here (Server Component) and passed to ChecklistClient as props.
// The data itself is static — only the "checked" state is client-side.
//
// Each item has:
//   id          — unique identifier for useState key
//   title       — short label shown in the checkbox row
//   description — one-line explanation of what to do
//   metric      — which Lighthouse/Web Vital this impacts
//   lesson      — which lesson covers this topic
//   impact      — how much it typically improves performance
const CHECKLIST_ITEMS = [
  {
    id: "next-image",
    title: "Use next/image for all images",
    description:
      "Replace every <img> tag with the Next.js <Image> component to get automatic resizing, WebP conversion, and lazy loading.",
    metric: "LCP + CLS",
    lesson: "Lesson 01",
    impact: "HIGH",
  },
  {
    id: "priority-hero",
    title: "Add priority to hero / LCP image",
    description:
      "Find the largest image visible on first load and add priority prop to preload it. This is the single most impactful LCP fix.",
    metric: "LCP",
    lesson: "Lesson 01",
    impact: "HIGH",
  },
  {
    id: "sizes-responsive",
    title: "Add sizes prop to responsive images",
    description:
      "For images that are not full-width, add sizes='(min-width: 768px) 33vw, 100vw' so mobile devices download smaller images.",
    metric: "LCP + bandwidth",
    lesson: "Lesson 01",
    impact: "MEDIUM",
  },
  {
    id: "next-font",
    title: "Replace CSS @import with next/font",
    description:
      "Remove @import url('https://fonts.googleapis.com/...') from your CSS and use next/font/google instead. Zero FOUT, zero layout shift.",
    metric: "CLS",
    lesson: "Lesson 02",
    impact: "HIGH",
  },
  {
    id: "font-subset",
    title: "Only include necessary font subsets",
    description:
      "In your next/font configuration, only include the subsets your app uses (e.g., 'latin' for English). Each extra subset adds bytes.",
    metric: "Bandwidth",
    lesson: "Lesson 02",
    impact: "LOW",
  },
  {
    id: "gtm-after-interactive",
    title: "Load analytics with afterInteractive strategy",
    description:
      "Move Google Analytics / GTM to next/script with strategy='afterInteractive'. It loads after hydration and doesn't block user interaction.",
    metric: "INP + TBT",
    lesson: "Lesson 03",
    impact: "MEDIUM",
  },
  {
    id: "chat-lazy",
    title: "Load chat widgets with lazyOnload strategy",
    description:
      "Intercom, Zendesk, and similar chat widgets should use strategy='lazyOnload'. They only run during browser idle time.",
    metric: "INP + FID",
    lesson: "Lesson 03",
    impact: "MEDIUM",
  },
  {
    id: "bundle-analyzer",
    title: "Run bundle analyzer to find heavy packages",
    description:
      "Install @next/bundle-analyzer and run ANALYZE=true npm run build at least once to find unexpected heavy dependencies.",
    metric: "First Load JS",
    lesson: "Lesson 04",
    impact: "HIGH",
  },
  {
    id: "dynamic-import",
    title: "Dynamic import for heavy / conditional components",
    description:
      "Use next/dynamic for chart libraries, rich text editors, modals, and any component that is not always visible on first load.",
    metric: "First Load JS",
    lesson: "Lesson 04",
    impact: "HIGH",
  },
  {
    id: "named-imports",
    title: "Use named imports from large libraries",
    description:
      "Import { format } from 'date-fns', not import * as dateFns. Named imports enable tree shaking — unused code is dropped from the bundle.",
    metric: "Bundle size",
    lesson: "Lesson 04",
    impact: "MEDIUM",
  },
  {
    id: "no-barrel-files",
    title: "Avoid barrel file imports for heavy modules",
    description:
      "Import from the direct source file, not from an index.ts barrel, when the barrel re-exports heavy modules alongside lightweight ones.",
    metric: "Bundle size",
    lesson: "Lesson 04",
    impact: "MEDIUM",
  },
  {
    id: "server-only",
    title: "Mark server-only modules with server-only package",
    description:
      "Add import 'server-only' to files with DB queries or API secrets. This prevents them from accidentally leaking into the client bundle.",
    metric: "Security + bundle",
    lesson: "Lesson 04",
    impact: "LOW",
  },
] as const;

// TypeScript type — lets ChecklistClient know the shape of each item.
// Inferred from the const assertion above (CHECKLIST_ITEMS).
export type ChecklistItem = (typeof CHECKLIST_ITEMS)[number];

// ─── Page Component (Server Component) ────────────────────────────────────────
export default function MiniProjectPage() {
  return (
    <main className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto">

      {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
      <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
        <span className="mx-2" aria-hidden="true">›</span>
        <Link href="/phase-8" className="hover:text-blue-400 transition-colors">Phase 8</Link>
        <span className="mx-2" aria-hidden="true">›</span>
        <span className="text-gray-300">Mini Project</span>
      </nav>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl" aria-hidden="true">✅</span>
          <h1 className="text-3xl font-bold text-white">
            Optimization Checklist
          </h1>
        </div>
        <p className="text-gray-400 leading-relaxed max-w-2xl">
          Check off each optimization as you apply it to your project.
          Each item links back to the lesson that covers it in detail.
          Aim for all 12 items on your next real project.
        </p>
      </header>

      {/* ── Architecture Note ─────────────────────────────────────────────────── */}
      <div className="mb-8 rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">
        <h2 className="text-sm font-semibold text-blue-300 mb-2">
          Architecture Note — Server + Client Split
        </h2>
        <p className="text-xs text-gray-400 leading-relaxed mb-3">
          This page demonstrates the recommended Next.js pattern: keep the outer
          page as a Server Component and push interactivity into a small Client
          Component subtree. The static header, description, and items array
          are defined here (server) and passed as props to the checklist below.
        </p>
        <div className="grid gap-2 sm:grid-cols-2 text-xs">
          <div className="rounded-lg border border-white/10 bg-white/5 p-3">
            <p className="text-gray-300 font-medium mb-1">
              page.tsx (Server Component)
            </p>
            <ul className="text-gray-500 space-y-0.5">
              <li>✓ No &apos;use client&apos; directive</li>
              <li>✓ Static content + metadata</li>
              <li>✓ Defines CHECKLIST_ITEMS array</li>
              <li>✓ Zero client-side JavaScript</li>
            </ul>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-3">
            <p className="text-gray-300 font-medium mb-1">
              ChecklistClient.tsx (Client Component)
            </p>
            <ul className="text-gray-500 space-y-0.5">
              <li>✓ &apos;use client&apos; at top</li>
              <li>✓ Manages checked state (useState)</li>
              <li>✓ Handles checkbox interactions</li>
              <li>✓ Shows score counter</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── Lighthouse Impact Legend ──────────────────────────────────────────── */}
      <div className="mb-6 flex flex-wrap gap-3">
        <span className="text-xs text-gray-500 self-center">Impact:</span>
        {[
          { label: "HIGH", color: "bg-green-500/20 text-green-300 border-green-500/30" },
          { label: "MEDIUM", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
          { label: "LOW", color: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
        ].map((b) => (
          <span
            key={b.label}
            className={`text-xs border px-2 py-0.5 rounded-full ${b.color}`}
          >
            {b.label}
          </span>
        ))}
      </div>

      {/* ── Interactive Checklist (Client Component) ─────────────────────────── */}
      {/*
       * We pass the items from this Server Component to ChecklistClient.
       * Props crossing the Server → Client boundary must be serialisable:
       *   - ✅ Plain objects, arrays, strings, numbers, booleans
       *   - ❌ Functions, class instances, Promises
       * Our CHECKLIST_ITEMS array is plain objects → serialisable → safe.
       */}
      <ChecklistClient items={CHECKLIST_ITEMS} />

      {/* ── Lesson Navigation ────────────────────────────────────────────────── */}
      <div className="mt-10 flex justify-between text-sm">
        <Link href="/phase-8/04-bundle-analysis" className="text-gray-500 hover:text-blue-400 transition-colors">
          ← Bundle Analysis
        </Link>
        <Link href="/phase-9" className="text-blue-400 hover:text-blue-300 transition-colors">
          Phase 9 →
        </Link>
      </div>
    </main>
  );
}
