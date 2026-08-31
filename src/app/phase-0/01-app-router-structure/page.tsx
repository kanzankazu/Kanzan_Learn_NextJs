/**
 * Lesson 01 — App Router Structure
 * Route: /phase-0/01-app-router-structure
 *
 * WHAT THIS LESSON COVERS:
 * ─────────────────────────
 * The App Router (introduced in Next.js 13) uses the file system as a router.
 * Every folder inside `app/` can become a route segment if it contains
 * a `page.tsx` file.
 *
 * SPECIAL FILES IN THE APP ROUTER:
 * ──────────────────────────────────
 * ┌─────────────────┬─────────────────────────────────────────────────────────┐
 * │ File            │ Purpose                                                 │
 * ├─────────────────┼─────────────────────────────────────────────────────────┤
 * │ page.tsx        │ The UI for a route — makes the folder publicly visible  │
 * │ layout.tsx      │ Wraps child routes — persists across navigation         │
 * │ template.tsx    │ Like layout, but re-mounts on every navigation          │
 * │ loading.tsx     │ Instant loading UI (React Suspense boundary)            │
 * │ error.tsx       │ Error UI (React Error Boundary) — must be 'use client'  │
 * │ not-found.tsx   │ UI for 404 — rendered when notFound() is called         │
 * │ route.ts        │ API endpoint (no UI) — replaces pages/api/              │
 * └─────────────────┴─────────────────────────────────────────────────────────┘
 *
 * KEY INSIGHT:
 * Only `page.tsx` makes a folder publicly accessible.
 * You can have a folder with only `layout.tsx` — it participates in nesting
 * but has no standalone URL.
 */

import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "01 — App Router Structure",
};

// ─── Data: file roles explained ───────────────────────────────────────────────
const SPECIAL_FILES = [
  {
    file: "page.tsx",
    required: true,
    role: "Defines the UI for this route. Without it, the folder has no public URL.",
    example: "export default function Page() { return <h1>Hello</h1> }",
    color: "text-green-400",
  },
  {
    file: "layout.tsx",
    required: false,
    role: "Wraps all child pages. Stays mounted as you navigate between children (like a persistent shell).",
    example: "export default function Layout({ children }) { return <div>{children}</div> }",
    color: "text-blue-400",
  },
  {
    file: "template.tsx",
    required: false,
    role: "Like layout.tsx but re-mounts on every navigation. Use for animations or per-page effects.",
    example: "export default function Template({ children }) { return <>{children}</> }",
    color: "text-purple-400",
  },
  {
    file: "loading.tsx",
    required: false,
    role: "Shown instantly while the page is loading. Wraps the page in a React Suspense boundary automatically.",
    example: "export default function Loading() { return <p>Loading...</p> }",
    color: "text-yellow-400",
  },
  {
    file: "error.tsx",
    required: false,
    role: "Catches runtime errors in the route segment. Must be a Client Component ('use client').",
    example: "'use client'\\nexport default function Error({ error, reset }) { ... }",
    color: "text-red-400",
  },
  {
    file: "not-found.tsx",
    required: false,
    role: "Rendered when notFound() is called inside a Server Component. The 404 page for this segment.",
    example: "export default function NotFound() { return <p>404 — Not Found</p> }",
    color: "text-orange-400",
  },
  {
    file: "route.ts",
    required: false,
    role: "HTTP endpoint (no React UI). Export GET, POST, etc. functions. Lives inside app/api/ by convention.",
    example: "export async function GET() { return Response.json({ ok: true }) }",
    color: "text-cyan-400",
  },
];

// ─── Visual tree component ─────────────────────────────────────────────────────
// A static code-like display showing folder → URL mapping.
function FileTree() {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-5 font-mono text-sm overflow-x-auto">
      <p className="text-gray-500 mb-3">{"// Example app/ structure → URLs"}</p>
      <div className="space-y-0.5">
        <p><span className="text-yellow-400">app/</span></p>
        <p><span className="text-gray-600">├── </span><span className="text-blue-300">layout.tsx</span>          <span className="text-gray-600">← root layout (wraps everything)</span></p>
        <p><span className="text-gray-600">├── </span><span className="text-green-300">page.tsx</span>            <span className="text-gray-600">← route: /</span></p>
        <p><span className="text-gray-600">├── </span><span className="text-yellow-400">about/</span></p>
        <p><span className="text-gray-600">│   └── </span><span className="text-green-300">page.tsx</span>        <span className="text-gray-600">← route: /about</span></p>
        <p><span className="text-gray-600">├── </span><span className="text-yellow-400">blog/</span></p>
        <p><span className="text-gray-600">│   ├── </span><span className="text-blue-300">layout.tsx</span>      <span className="text-gray-600">← shared blog shell</span></p>
        <p><span className="text-gray-600">│   ├── </span><span className="text-green-300">page.tsx</span>        <span className="text-gray-600">← route: /blog</span></p>
        <p><span className="text-gray-600">│   └── </span><span className="text-yellow-400">[slug]/</span></p>
        <p><span className="text-gray-600">│       └── </span><span className="text-green-300">page.tsx</span>    <span className="text-gray-600">← route: /blog/any-slug</span></p>
        <p><span className="text-gray-600">└── </span><span className="text-yellow-400">(auth)/</span>           <span className="text-gray-600">← route GROUP: (auth) is NOT in the URL</span></p>
        <p><span className="text-gray-600">    ├── </span><span className="text-yellow-400">login/</span></p>
        <p><span className="text-gray-600">    │   └── </span><span className="text-green-300">page.tsx</span>    <span className="text-gray-600">← route: /login (not /auth/login!)</span></p>
        <p><span className="text-gray-600">    └── </span><span className="text-yellow-400">register/</span></p>
        <p><span className="text-gray-600">        └── </span><span className="text-green-300">page.tsx</span>    <span className="text-gray-600">← route: /register</span></p>
      </div>
    </div>
  );
}

// ─── Page Component ───────────────────────────────────────────────────────────
export default function Lesson01Page() {
  return (
    <main className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto">

      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
        <span className="mx-2">›</span>
        <Link href="/phase-0" className="hover:text-blue-400 transition-colors">Phase 0</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-300">App Router Structure</span>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">App Router Structure</h1>
        <p className="text-gray-400">
          How Next.js turns your file system into a router — no config needed.
        </p>
      </header>

      {/* Folder → URL visual */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-white mb-4">Folder Structure → URLs</h2>
        <FileTree />
        <p className="text-sm text-gray-500 mt-3">
          Notice: <code className="text-yellow-300">(auth)/</code> is a route group — the parentheses tell
          Next.js to use it for organisation only and exclude it from the URL.
        </p>
      </section>

      {/* Special files */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-white mb-4">Special File Conventions</h2>
        <div className="space-y-3">
          {SPECIAL_FILES.map((f) => (
            <div key={f.file} className="rounded-lg border border-white/10 bg-white/2 p-4">
              <div className="flex items-center gap-2 mb-1">
                <code className={`font-mono font-semibold text-sm ${f.color}`}>{f.file}</code>
                {f.required && (
                  <span className="text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">
                    required for public route
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-400 mb-2">{f.role}</p>
              <pre className="text-xs text-gray-600 font-mono overflow-x-auto">{f.example}</pre>
            </div>
          ))}
        </div>
      </section>

      {/* Key rules */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-white mb-4">Rules to Remember</h2>
        <ul className="space-y-2">
          {[
            "Only page.tsx makes a folder a public URL — other files are private.",
            "layout.tsx persists across child navigations (great for sidebars, navbars).",
            "(group) folders never appear in the URL — use them to co-locate layouts.",
            "Every file in app/ is a Server Component by default — add 'use client' to opt in.",
            "You can have multiple layouts nested inside each other — they compose automatically.",
          ].map((rule, i) => (
            <li key={i} className="flex gap-2 text-sm text-gray-400">
              <span className="text-blue-500 mt-0.5 shrink-0">•</span>
              {rule}
            </li>
          ))}
        </ul>
      </section>

      {/* Navigation */}
      <div className="flex justify-between text-sm">
        <Link href="/phase-0" className="text-gray-500 hover:text-blue-400 transition-colors">
          ← Back to Phase 0
        </Link>
        <Link href="/phase-0/02-dynamic-routes" className="text-blue-400 hover:text-blue-300 transition-colors">
          Next: Dynamic Routes →
        </Link>
      </div>
    </main>
  );
}
