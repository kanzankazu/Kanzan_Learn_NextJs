/**
 * Lesson 03 — Route Groups & Parallel Routes
 * Route: /phase-0/03-route-groups
 *
 * ROUTE GROUPS — (group) folders
 * ────────────────────────────────
 * Problem: You want different layouts for different parts of your app,
 * but you don't want those layout folders to appear in the URL.
 *
 * Example:
 *   app/(marketing)/page.tsx         → /       ← uses marketing layout
 *   app/(marketing)/about/page.tsx   → /about  ← uses marketing layout
 *   app/(dashboard)/dash/page.tsx    → /dash   ← uses dashboard layout
 *
 * The (marketing) and (dashboard) folders are INVISIBLE in the URL.
 * They only affect which layout.tsx is used.
 *
 * HOW TO CREATE A ROUTE GROUP:
 * ─────────────────────────────
 * Just wrap the folder name in parentheses: (name)
 * That's it. Next.js sees the parentheses and skips that segment in the URL.
 *
 * PARALLEL ROUTES — @slot folders
 * ─────────────────────────────────
 * Allows rendering multiple pages simultaneously in the same layout.
 * Use case: side-by-side views, modals, split-screen dashboards.
 *
 * Folder naming: @slotName
 * Usage in layout: function Layout({ children, @team, @analytics }) {...}
 * (TypeScript: `team` and `analytics` as props — the @ is not in the prop name)
 */

import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "03 — Route Groups & Parallel Routes",
};

function CodeBlock({ code, label }: { code: string; label?: string }) {
  return (
    <div className="rounded-lg bg-black/40 border border-white/10 overflow-x-auto">
      {label && (
        <div className="px-4 py-2 border-b border-white/10">
          <span className="text-xs text-gray-500 font-mono">{label}</span>
        </div>
      )}
      <pre className="p-4 text-sm text-gray-300 font-mono leading-relaxed">{code}</pre>
    </div>
  );
}

export default function Lesson03Page() {
  return (
    <main className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto">

      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
        <span className="mx-2">›</span>
        <Link href="/phase-0" className="hover:text-blue-400 transition-colors">Phase 0</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-300">Route Groups & Parallel Routes</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Route Groups & Parallel Routes</h1>
        <p className="text-gray-400">
          Organise your app without affecting URLs, and render multiple pages simultaneously.
        </p>
      </header>

      {/* Route Groups */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-white mb-2">
          Route Groups — <code className="text-yellow-400">(group)</code>
        </h2>
        <p className="text-sm text-gray-400 mb-4">
          Wrap a folder name in parentheses to exclude it from the URL.
          Use it to apply different layouts to different sections of your app.
        </p>

        {/* Visual tree */}
        <div className="rounded-xl border border-white/10 bg-black/30 p-5 font-mono text-sm mb-4">
          <p className="text-gray-500 mb-2">{"// Folder structure"}</p>
          <div className="space-y-0.5 text-sm">
            <p><span className="text-yellow-400">app/</span></p>
            <p><span className="text-gray-600">├── </span><span className="text-yellow-400">(marketing)/</span>    <span className="text-gray-600">← route group (not in URL)</span></p>
            <p><span className="text-gray-600">│   ├── </span><span className="text-blue-300">layout.tsx</span>     <span className="text-gray-600">← marketing-specific layout</span></p>
            <p><span className="text-gray-600">│   ├── </span><span className="text-yellow-400">page.tsx</span>       <span className="text-gray-600">← route: /</span></p>
            <p><span className="text-gray-600">│   └── </span><span className="text-yellow-400">about/</span></p>
            <p><span className="text-gray-600">│       └── </span><span className="text-yellow-400">page.tsx</span>   <span className="text-gray-600">← route: /about</span></p>
            <p><span className="text-gray-600">└── </span><span className="text-yellow-400">(dashboard)/</span>    <span className="text-gray-600">← another route group</span></p>
            <p><span className="text-gray-600">    ├── </span><span className="text-blue-300">layout.tsx</span>     <span className="text-gray-600">← dashboard sidebar layout</span></p>
            <p><span className="text-gray-600">    └── </span><span className="text-yellow-400">settings/</span></p>
            <p><span className="text-gray-600">        └── </span><span className="text-yellow-400">page.tsx</span>   <span className="text-gray-600">← route: /settings (NOT /dashboard/settings)</span></p>
          </div>
        </div>

        <CodeBlock label="app/(marketing)/layout.tsx" code={`// This layout only wraps routes inside (marketing).
// Routes inside (dashboard) will NOT use this layout.

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="marketing-shell">
      {/* Marketing-specific header, e.g., a big hero nav */}
      <header>Marketing Nav</header>
      <main>{children}</main>
      <footer>Marketing Footer</footer>
    </div>
  );
}`} />
      </section>

      {/* Parallel Routes */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-white mb-2">
          Parallel Routes — <code className="text-blue-400">@slot</code>
        </h2>
        <p className="text-sm text-gray-400 mb-4">
          Render two (or more) pages at the same time inside the same layout.
          Each slot is an independent route — it can have its own loading, error,
          and not-found states.
        </p>

        <div className="rounded-xl border border-white/10 bg-black/30 p-5 font-mono text-sm mb-4">
          <p className="text-gray-500 mb-2">{"// Parallel routes folder structure"}</p>
          <div className="space-y-0.5">
            <p><span className="text-yellow-400">app/dashboard/</span></p>
            <p><span className="text-gray-600">├── </span><span className="text-blue-300">layout.tsx</span>        <span className="text-gray-600">← receives children + team + analytics as props</span></p>
            <p><span className="text-gray-600">├── </span><span className="text-green-300">page.tsx</span>          <span className="text-gray-600">← default slot (children)</span></p>
            <p><span className="text-gray-600">├── </span><span className="text-purple-300">@team/</span>           <span className="text-gray-600">{"← slot named \"team\""}</span></p>
            <p><span className="text-gray-600">│   └── </span><span className="text-green-300">page.tsx</span>      <span className="text-gray-600">{"← rendered in the \"team\" slot"}</span></p>
            <p><span className="text-gray-600">└── </span><span className="text-orange-300">@analytics/</span>     <span className="text-gray-600">{"← slot named \"analytics\""}</span></p>
            <p><span className="text-gray-600">    └── </span><span className="text-green-300">page.tsx</span>      <span className="text-gray-600">{"← rendered in the \"analytics\" slot"}</span></p>
          </div>
        </div>

        <CodeBlock label="app/dashboard/layout.tsx" code={`// The layout receives each @slot as a prop.
// Notice: the @ sign is NOT included in the prop name.

export default function DashboardLayout({
  children,    // ← comes from app/dashboard/page.tsx
  team,        // ← comes from app/dashboard/@team/page.tsx
  analytics,   // ← comes from app/dashboard/@analytics/page.tsx
}: {
  children: React.ReactNode;
  team: React.ReactNode;
  analytics: React.ReactNode;
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
      {/* Render all slots simultaneously */}
      <section>{children}</section>
      <aside>{team}</aside>
      <aside>{analytics}</aside>
    </div>
  );
}`} />
      </section>

      {/* When to use each */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-white mb-4">When to Use What</h2>
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
          {[
            {
              title: "Route Groups (group)",
              use: "Different layouts per section (marketing vs dashboard), organise large codebases",
              color: "border-yellow-500/30 bg-yellow-500/5",
            },
            {
              title: "Parallel Routes @slot",
              use: "Split-screen dashboards, modals rendered alongside page, tab panels",
              color: "border-blue-500/30 bg-blue-500/5",
            },
          ].map((item) => (
            <div key={item.title} className={`rounded-xl border p-4 ${item.color}`}>
              <h3 className="text-sm font-semibold text-white mb-1">{item.title}</h3>
              <p className="text-xs text-gray-400">{item.use}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Navigation */}
      <div className="flex justify-between text-sm mt-8">
        <Link href="/phase-0/02-dynamic-routes" className="text-gray-500 hover:text-blue-400 transition-colors">
          ← Dynamic Routes
        </Link>
        <Link href="/phase-0/mini-project" className="text-blue-400 hover:text-blue-300 transition-colors">
          Next: Mini Project →
        </Link>
      </div>
    </main>
  );
}
