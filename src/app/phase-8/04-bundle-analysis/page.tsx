/**
 * Lesson 04 — Bundle Analysis & Optimization
 * Route: /phase-8/04-bundle-analysis
 *
 * WHAT IS A "BUNDLE"?
 * ────────────────────
 * When you build a Next.js app, webpack (the bundler) takes ALL your
 * JavaScript files — your code, React, and every npm package you import —
 * and combines them into a small number of files called "bundles".
 *
 * These bundles are what the browser downloads when a user visits your site.
 * Smaller bundles = faster download = better performance.
 *
 * WHY DOES BUNDLE SIZE MATTER?
 * ─────────────────────────────
 * - Parsing JavaScript is expensive. Every 100KB of JS takes ~300ms to parse
 *   on a mid-range phone.
 * - JavaScript blocks rendering. The browser cannot show the page until
 *   it finishes executing the JavaScript.
 * - Bandwidth is not free. On mobile plans, large bundles burn data.
 *
 * COMMON BUNDLE BLOAT CAUSES:
 * ────────────────────────────
 *   1. Importing large libraries when only one function is needed
 *      (e.g., import _ from 'lodash' — imports ALL of lodash, ~71KB gzipped)
 *   2. Barrel files (index.ts re-exporting everything) break tree shaking
 *   3. Importing a library for server-only code in a Client Component
 *   4. Not code-splitting (loading ALL pages upfront instead of on demand)
 *
 * WHAT IS TREE SHAKING?
 * ──────────────────────
 * Tree shaking = the bundler removes code that is NEVER imported/used.
 * This is why `import { formatDate } from 'date-fns'` only bundles the
 * formatDate function, not all 200+ date-fns functions.
 *
 * For tree shaking to work:
 *   - The library must use ES modules (import/export, NOT CommonJS require/module.exports)
 *   - You must import NAMED exports, not default imports of the whole module
 *   - You must avoid barrel files that create a wall of re-exports
 *
 * WHAT IS CODE SPLITTING?
 * ────────────────────────
 * Code splitting = breaking the bundle into smaller chunks that are loaded
 * ON DEMAND, only when needed.
 *
 * Next.js does this automatically for each page route. When a user visits
 * /about, only the /about bundle is loaded, not /dashboard's code.
 *
 * But you can do MORE granular splitting with dynamic imports:
 *   const HeavyChart = dynamic(() => import('./HeavyChart'));
 *
 * The HeavyChart bundle is downloaded only when <HeavyChart /> is rendered.
 *
 * DYNAMIC IMPORT vs STATIC IMPORT:
 * ──────────────────────────────────
 *   Static: import HeavyChart from './HeavyChart'
 *     → HeavyChart's code is ALWAYS included in the bundle, even if the
 *       component is behind a tab or modal that 90% of users never open.
 *
 *   Dynamic: const HeavyChart = dynamic(() => import('./HeavyChart'))
 *     → HeavyChart's code is in a SEPARATE chunk, downloaded only when
 *       the component actually renders on screen.
 *
 * BARREL FILE ANTI-PATTERN:
 * ──────────────────────────
 * A barrel file is an index.ts that re-exports everything from a folder.
 * Barrel files are CONVENIENT but they KILL tree shaking.
 *
 * WHY?  When you import one thing from a barrel file, the bundler must
 * load the ENTIRE barrel (all the files it re-exports) just to find the
 * one thing you wanted. This is because the barrel's side effects are
 * unknown until all files are evaluated.
 */

import Link from "next/link";
import type { Metadata } from "next";

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "04 — Bundle Analysis",
  description:
    "Learn bundle analysis: @next/bundle-analyzer, tree shaking, dynamic imports, and how to eliminate barrel file bloat.",
};

// ─── Code Examples ────────────────────────────────────────────────────────────
const CODE_EXAMPLES = [
  {
    id: "bundle-analyzer",
    label: "1. @next/bundle-analyzer — Visualise your bundle",
    description:
      "The bundle analyzer generates an interactive treemap that shows every package in your bundle and how much space it takes. Use it to find unexpected heavy packages.",
    code: `// Step 1: Install
// npm install @next/bundle-analyzer --save-dev

// Step 2: next.config.ts — wrap your config with the analyzer
import type { NextConfig } from 'next';
import bundleAnalyzer from '@next/bundle-analyzer';

// The analyzer is enabled via the ANALYZE env variable.
// We do NOT enable it all the time — only when explicitly requested.
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  // ... your existing config
};

export default withBundleAnalyzer(nextConfig);

// Step 3: Run the analyzer
// ANALYZE=true npm run build
//
// This opens two browser tabs:
//   client.html  — the JavaScript sent to the browser (client bundle)
//   server.html  — the JavaScript used on the server (SSR bundle)
//
// WHAT TO LOOK FOR in the treemap:
//   - Unexpectedly large boxes (e.g., moment.js at 500KB)
//   - Libraries you thought were server-only appearing in client bundle
//   - Duplicate versions of the same package
//   - node_modules taking 90% of your bundle (your code should dominate)`,
    borderColor: "border-blue-500/20",
    bgColor: "bg-blue-500/5",
  },
  {
    id: "tree-shaking",
    label: "2. Tree shaking — Import only what you use",
    description:
      "The difference between a named import and a default import can be the difference between 500 bytes and 70KB in your bundle. Always use named imports from large libraries.",
    code: `// ── BAD: Imports the ENTIRE lodash library (~71KB gzipped) ─────────────────
import _ from 'lodash';
const result = _.groupBy(users, 'department');

// ── GOOD: Imports only groupBy (~2KB gzipped) ──────────────────────────────
import { groupBy } from 'lodash-es'; // lodash-es = ESM version, tree-shakable
const result = groupBy(users, 'department');

// Even better: use the individual function package
import groupBy from 'lodash/groupBy'; // Only that one function

// ── date-fns example ────────────────────────────────────────────────────────
// BAD — imports everything
import * as dateFns from 'date-fns';
const formatted = dateFns.format(new Date(), 'yyyy-MM-dd');

// GOOD — tree-shakable, only bundles the format function
import { format } from 'date-fns';
const formatted = format(new Date(), 'yyyy-MM-dd');

// ── Icon libraries — a VERY common source of bundle bloat ──────────────────

// BAD: React Icons — this imports the ENTIRE icon library
import { FiSearch, FiUser } from 'react-icons/fi';
// ^ Despite appearances, this can import 500+ icons depending on how
//   the library is set up. Check with the bundle analyzer.

// GOOD: Heroicons — tree-shakable by design
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
// ^ Only the MagnifyingGlassIcon SVG is bundled.

// ── RULE: When adding a library, check its bundle size first ───────────────
// Visit https://bundlephobia.com and search for any npm package.
// It shows: minified size, gzipped size, and whether it is tree-shakable.`,
    borderColor: "border-green-500/20",
    bgColor: "bg-green-500/5",
  },
  {
    id: "dynamic-import",
    label: "3. Dynamic imports — Load heavy components on demand",
    description:
      "Use next/dynamic to lazy-load components that are heavy, below the fold, or conditionally rendered. The component's code is downloaded in a separate chunk, only when it renders.",
    code: `// app/dashboard/page.tsx
import dynamic from 'next/dynamic';

/*
 * WHY dynamic import here?
 * <LineChart> depends on a charting library (e.g., recharts, ~300KB).
 * The chart is below the fold — users don't see it immediately.
 * Without dynamic import: recharts is ALWAYS downloaded, even if the
 * user leaves the page before scrolling to the chart.
 * With dynamic import: recharts is downloaded ONLY when the chart renders.
 */

// The () => import() syntax is a dynamic import — returns a Promise<Component>
// next/dynamic resolves this Promise and returns a React component.
const LineChart = dynamic(
  () => import('@/components/LineChart'),
  {
    loading: () => (
      // Show a skeleton while the component chunk downloads
      <div className="h-64 rounded-xl bg-gray-800 animate-pulse" />
    ),
    ssr: false, // Set to false if the component uses browser-only APIs
               // (e.g., window, document, localStorage)
               // Charts often need ssr: false because they measure DOM size
  }
);

// Modal example — only load when modal is open
const HeavyModal = dynamic(() => import('@/components/HeavyModal'), {
  loading: () => null,  // No placeholder needed — modal isn't visible anyway
});

export default function DashboardPage() {
  return (
    <main>
      <h1>Dashboard</h1>

      {/* This code is downloaded immediately (above the fold) */}
      <SummaryStats />

      {/* This code downloads only when it scrolls into view OR renders */}
      <LineChart data={salesData} />
    </main>
  );
}`,
    borderColor: "border-purple-500/20",
    bgColor: "bg-purple-500/5",
  },
  {
    id: "barrel-file-antipattern",
    label: "4. Barrel file anti-pattern — Why index.ts hurts tree shaking",
    description:
      "Barrel files feel like clean organization but they silently import entire folders into your bundle. This is one of the most common causes of unexpected bundle bloat in large projects.",
    code: `// ── The barrel file pattern (LOOKS CLEAN but can hurt performance) ──────────

// components/index.ts  (barrel file — re-exports everything)
export { Button } from './Button';
export { Modal } from './Modal';
export { DataTable } from './DataTable';     // DataTable imports ag-grid (heavy!)
export { SimpleIcon } from './SimpleIcon';  // SimpleIcon is tiny

// In a page component:
import { Button } from '@/components';      // Looks clean!
// But webpack must process ALL of components/index.ts to find Button.
// This means DataTable (and its ag-grid dependency) gets bundled too,
// even though you only imported Button. 😱

// ── THE FIX: Direct imports ─────────────────────────────────────────────────
import { Button } from '@/components/Button'; // Only Button.tsx is processed
// Now DataTable is NOT in this bundle at all.

// ── When barrel files ARE safe ───────────────────────────────────────────────
// Barrel files are fine when:
// 1. All the re-exported modules are roughly the same size (no giant outlier)
// 2. The library is properly marked "sideEffects: false" in package.json
// 3. You ALWAYS import everything from that barrel (nothing left unused)

// ── The sideEffects flag in package.json ────────────────────────────────────
// {
//   "name": "my-ui-library",
//   "sideEffects": false   // Tells bundlers: "none of my modules have side effects"
//                          // This allows complete tree shaking of barrel files
// }
//
// A "side effect" = code that runs on import even if you don't use the export.
// CSS files are side effects (they apply styles just by being imported).
// class definitions and pure functions are NOT side effects.`,
    borderColor: "border-orange-500/20",
    bgColor: "bg-orange-500/5",
  },
  {
    id: "server-only",
    label: "5. server-only — Prevent server code leaking to the client",
    description:
      "Sometimes you have server-only code (database queries, secret API keys) that should NEVER be shipped to the browser. The server-only package makes the build fail if that code is accidentally imported in a Client Component.",
    code: `// lib/db.ts — server-only module
import 'server-only';
// ^ This import does NOTHING at runtime.
//   But if a Client Component tries to import this file,
//   the BUILD will FAIL with a clear error:
//     "server-only package was imported in a client component"
//
// Without this guard, a developer might accidentally import db.ts
// in a 'use client' file, causing database credentials to be
// shipped in the JavaScript bundle sent to the browser. 💀

import { prisma } from './prisma';

export async function getUsers() {
  return prisma.user.findMany();
}

// ── client-only (the opposite) ───────────────────────────────────────────────
import 'client-only';
// ^ Fails the build if imported in a Server Component.
// Use this for code that uses browser APIs (localStorage, window, etc.)

// ── How Next.js splits server vs client code ─────────────────────────────────
// Server Components (no 'use client'):
//   → Code NEVER sent to browser. Can safely import db, fs, secrets.
//   → Importing server-only here is fine — it will never reach the browser.
//
// Client Components ('use client' at top):
//   → Code IS sent to the browser. Never import db credentials here.
//   → Next.js will error if you import a 'server-only' module here.`,
    borderColor: "border-cyan-500/20",
    bgColor: "bg-cyan-500/5",
  },
  {
    id: "next-bundle-report",
    label: "6. next build output — Built-in size reporting",
    description:
      "You don't always need the full bundle analyzer. The standard next build output already shows you route sizes. Use this as a quick health check.",
    code: `// Run: npm run build
// Next.js prints a table like this:

/*
Route (app)                              Size     First Load JS
┌ ○ /                                   5.1 kB         87.1 kB
├ ○ /about                              2.3 kB         84.3 kB
├ ○ /blog                               3.4 kB         85.4 kB
├ ƒ /blog/[slug]                        1.8 kB         83.8 kB
└ ƒ /api/users                          0 B            0 B

+ First Load JS shared by all           82 kB
  ├ chunks/framework-abc123.js          44.2 kB
  ├ chunks/main-def456.js               30.1 kB
  └ chunks/pages/_app-ghi789.js         7.7 kB
*/

// WHAT EACH COLUMN MEANS:
//   Size           — the JavaScript for THAT ROUTE ONLY (e.g., 5.1 kB for /)
//   First Load JS  — Size + the shared chunks (React, Next.js runtime)
//
// SIZE TARGETS (approximate):
//   < 10 kB   per route   → green (excellent)
//   10-50 kB  per route   → yellow (acceptable)
//   > 50 kB   per route   → red (investigate with bundle analyzer)
//
//   < 100 kB  First Load JS → green
//   100-200   First Load JS → yellow
//   > 200 kB  First Load JS → red (trim your dependencies!)
//
// SYMBOLS:
//   ○ = static (pre-rendered at build time)
//   ƒ = dynamic (rendered at request time or uses dynamic route params)`,
    borderColor: "border-yellow-500/20",
    bgColor: "bg-yellow-500/5",
  },
] as const;

// ─── Reusable CodeBlock ────────────────────────────────────────────────────────
function CodeBlock({
  code,
  label,
  description,
  borderColor,
  bgColor,
}: {
  code: string;
  label: string;
  description: string;
  borderColor: string;
  bgColor: string;
}) {
  return (
    <div className={`rounded-xl border p-5 ${borderColor} ${bgColor}`}>
      <p className="text-xs font-semibold text-gray-300 mb-2">{label}</p>
      <p className="text-xs text-gray-500 mb-3 leading-relaxed">{description}</p>
      <pre className="bg-black/40 border border-white/10 rounded-lg p-4 font-mono text-sm text-gray-300 overflow-x-auto leading-relaxed">
        {code}
      </pre>
    </div>
  );
}

// ─── Page Component ────────────────────────────────────────────────────────────
export default function BundleAnalysisPage() {
  return (
    <main className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto">

      {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
      <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
        <span className="mx-2" aria-hidden="true">›</span>
        <Link href="/phase-8" className="hover:text-blue-400 transition-colors">Phase 8</Link>
        <span className="mx-2" aria-hidden="true">›</span>
        <span className="text-gray-300">Bundle Analysis</span>
      </nav>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl" aria-hidden="true">📦</span>
          <h1 className="text-3xl font-bold text-white">Bundle Analysis</h1>
        </div>
        <p className="text-gray-400 leading-relaxed max-w-2xl">
          Find what is making your JavaScript bundle fat and fix it.
          Learn to use <code className="text-orange-300">@next/bundle-analyzer</code>,
          apply tree shaking, split heavy components with dynamic imports,
          and avoid the barrel file trap.
        </p>
      </header>

      {/* ── Key Techniques Overview ───────────────────────────────────────────── */}
      <section className="mb-10" aria-labelledby="techniques-heading">
        <h2 id="techniques-heading" className="text-lg font-semibold text-white mb-4">
          Four Techniques to Reduce Bundle Size
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            {
              num: "01",
              title: "Bundle Analyzer",
              body: "Visualise your bundle as a treemap. Find which package is unexpectedly large. Run: ANALYZE=true npm run build.",
              color: "text-blue-400",
            },
            {
              num: "02",
              title: "Tree Shaking",
              body: "Import only named exports from libraries. Never import the entire lodash/moment/date-fns — just the functions you need.",
              color: "text-green-400",
            },
            {
              num: "03",
              title: "Dynamic Import",
              body: "Wrap heavy components in dynamic() from next/dynamic. The component loads in a separate chunk — only when it renders.",
              color: "text-purple-400",
            },
            {
              num: "04",
              title: "Avoid Barrel Files",
              body: "Import directly from the source file, not from an index.ts barrel. This lets the bundler tree-shake precisely.",
              color: "text-orange-400",
            },
          ].map((t) => (
            <div key={t.num} className="rounded-xl border border-white/10 bg-white/2 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className={`font-mono font-bold text-sm ${t.color}`}>{t.num}</span>
                <h3 className="text-sm font-semibold text-white">{t.title}</h3>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">{t.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Static vs Dynamic Import Comparison ──────────────────────────────── */}
      <section className="mb-10" aria-labelledby="import-compare-heading">
        <h2 id="import-compare-heading" className="text-lg font-semibold text-white mb-4">
          Static vs Dynamic Import
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
            <h3 className="text-sm font-semibold text-red-400 mb-3">Static import</h3>
            <pre className="bg-black/40 border border-white/10 rounded p-3 font-mono text-xs text-gray-300 overflow-x-auto">
              {`import HeavyChart from './HeavyChart';
// HeavyChart is ALWAYS in the bundle
// even if hidden behind a modal`}
            </pre>
            <ul className="mt-3 space-y-1 text-xs text-gray-500">
              <li>❌ Always downloaded on page load</li>
              <li>❌ Increases initial bundle size</li>
              <li>✅ Available immediately — no loading state needed</li>
            </ul>
          </div>
          <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
            <h3 className="text-sm font-semibold text-green-400 mb-3">Dynamic import</h3>
            <pre className="bg-black/40 border border-white/10 rounded p-3 font-mono text-xs text-gray-300 overflow-x-auto">
              {`const HeavyChart = dynamic(
  () => import('./HeavyChart')
);
// Downloaded ONLY when it renders`}
            </pre>
            <ul className="mt-3 space-y-1 text-xs text-gray-500">
              <li>✅ Separate chunk — downloaded on demand</li>
              <li>✅ Reduces initial bundle size</li>
              <li>⚠️ Shows loading state while chunk downloads</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── Code Examples ────────────────────────────────────────────────────── */}
      <section className="mb-10" aria-labelledby="code-heading">
        <h2 id="code-heading" className="text-lg font-semibold text-white mb-4">
          Code Examples
        </h2>
        <div className="space-y-4">
          {CODE_EXAMPLES.map((ex) => (
            <CodeBlock key={ex.id} {...ex} />
          ))}
        </div>
      </section>

      {/* ── Lesson Navigation ────────────────────────────────────────────────── */}
      <div className="flex justify-between text-sm mt-4">
        <Link href="/phase-8/03-script-optimization" className="text-gray-500 hover:text-blue-400 transition-colors">
          ← Script
        </Link>
        <Link href="/phase-8/mini-project" className="text-blue-400 hover:text-blue-300 transition-colors">
          Mini Project →
        </Link>
      </div>
    </main>
  );
}
