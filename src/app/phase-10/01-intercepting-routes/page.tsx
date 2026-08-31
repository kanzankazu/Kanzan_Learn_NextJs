/**
 * Lesson 01 — Intercepting Routes
 * Route: /phase-10/01-intercepting-routes
 *
 * WHAT ARE INTERCEPTING ROUTES?
 * ──────────────────────────────
 * Intercepting routes let you "intercept" a URL and render it differently
 * depending on HOW the user navigated there:
 *
 * - Soft navigation (clicking a <Link> inside your app)
 *   → The route is INTERCEPTED and rendered as a modal/overlay
 *     while the background page stays visible.
 *
 * - Hard navigation (typing the URL in the browser, refreshing, or opening
 *   a shared link)
 *   → The route renders as its own FULL PAGE — no modal, no background.
 *
 * THE CLASSIC USE CASE — Photo Gallery Modal:
 * ─────────────────────────────────────────────
 * Instagram/Pinterest style:
 * - You browse /photos (the gallery grid)
 * - You click a photo → URL becomes /photos/42 but you see a MODAL
 *   overlaid on the gallery — background is still visible
 * - Refresh the page at /photos/42 → you see the FULL photo page
 * - Share /photos/42 → the recipient sees the full photo page
 *
 * This gives you the best of both worlds:
 * ✅ Shareable URLs (SEO, direct links work)
 * ✅ Smooth in-app experience (modal feels instant, no full-page reload)
 *
 * HOW THE (.) NOTATION WORKS:
 * ────────────────────────────
 * Next.js uses special folder prefixes to tell the router how far "up"
 * the route tree to intercept from. It mirrors relative file path notation:
 *
 *   (.)  — intercept a segment at the SAME level in the route tree
 *           app/photos/(.)[slug]  intercepts  app/photos/[slug]
 *
 *   (..) — intercept a segment ONE level UP in the route tree
 *           app/(..)photos        intercepts  app/photos
 *
 *   (...) — intercept a segment at the ROOT of the app
 *           app/gallery/(...)photos  intercepts  app/photos
 *           (no matter how deep gallery is nested)
 *
 *   (..)(..)/   — intercept TWO levels up (double dot, double dot)
 *
 * IMPORTANT: The (.) notation counts ROUTE SEGMENTS, not file system folders.
 * Route groups like (marketing) and _private folders don't count.
 *
 * THE @modal SLOT PATTERN:
 * ─────────────────────────
 * Intercepting routes are almost always used TOGETHER with Parallel Routes.
 * The intercepted route is rendered into an @modal slot so it overlays
 * the existing page without replacing it.
 *
 * You need a default.tsx file in the @modal slot so Next.js knows what to
 * render when the slot is NOT active (i.e., no modal is open).
 *
 * HARD NAV vs SOFT NAV:
 * ──────────────────────
 * Soft navigation = Next.js <Link> click = client-side routing
 *   → Interceptor fires, modal shows
 *
 * Hard navigation = browser URL bar / F5 refresh / shared link
 *   → Interceptor is NOT triggered
 *   → Next.js renders the ACTUAL route file at that path instead
 *   → This is why you need BOTH the intercepting route AND the real route:
 *       app/photos/[id]/page.tsx       ← full page (hard nav)
 *       app/photos/(.)[id]/page.tsx    ← modal version (soft nav)
 *
 * WHEN TO USE INTERCEPTING ROUTES:
 * ──────────────────────────────────
 * ✅ Photo/media galleries with modal previews
 * ✅ Product quick-view modals (e-commerce)
 * ✅ Login/signup modals that have their own shareable URL
 * ✅ Any detail page that should also be viewable as an overlay
 *
 * ❌ NOT for: simple dialogs/confirmations that don't need a URL
 *             (use regular React state for those)
 */

import Link from "next/link";
import type { Metadata } from "next";

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "01 — Intercepting Routes",
  description:
    "Learn Next.js intercepting routes: the (.) (..) (...) notation, modal-as-route pattern, and the @modal slot setup.",
};

// ─── Code Examples ────────────────────────────────────────────────────────────
// These are plain strings — they show the folder structure and code patterns.
// The actual feature requires setting up the folder tree in a real project.
const CODE_EXAMPLES = [
  {
    id: "folder-structure",
    label: "1. Folder structure — Full photo gallery with modal",
    description:
      "The key insight: you have TWO page.tsx files for /photos/[id]. One renders the full page (hard nav), one renders into the modal slot (soft nav).",
    code: `app/
├── layout.tsx                          ← root layout
├── photos/
│   ├── page.tsx                        ← /photos  (gallery grid)
│   ├── [id]/
│   │   └── page.tsx                    ← /photos/42 FULL PAGE (hard nav / refresh)
│   │
│   ├── @modal/                         ← Parallel route slot for the modal
│   │   ├── default.tsx                 ← REQUIRED: renders null when no modal is open
│   │   └── (.)id/                      ← (.) = intercept sibling segment [id]
│   │       └── page.tsx                ← /photos/42 AS MODAL (soft nav / Link click)
│   │
│   └── layout.tsx                      ← receives { children, modal } as props`,
    borderColor: "border-violet-500/20",
    bgColor: "bg-violet-500/5",
  },
  {
    id: "layout",
    label: "2. photos/layout.tsx — Receive the @modal slot",
    description:
      "The layout in the same directory as @modal automatically receives the slot as a prop. Render it alongside children so the modal overlays the gallery.",
    code: `// app/photos/layout.tsx
// This layout receives TWO slots:
//   children = the main content (the gallery grid from photos/page.tsx)
//   modal    = whatever is rendered in @modal (null or the intercepted route)

export default function PhotosLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;   // ← receives @modal slot output
}) {
  return (
    <>
      {/*
       * The main gallery content renders normally in the background.
       * When a photo is clicked, this stays visible behind the modal.
       */}
      {children}

      {/*
       * The modal slot renders on top of children.
       * When no photo is selected, @modal/default.tsx returns null
       * so this renders nothing.
       * When /photos/42 is reached via soft nav, @modal/(.)42/page.tsx
       * renders here — overlaid on the gallery.
       */}
      {modal}
    </>
  );
}`,
    borderColor: "border-blue-500/20",
    bgColor: "bg-blue-500/5",
  },
  {
    id: "modal-page",
    label: "3. @modal/(.)id/page.tsx — The intercepted modal version",
    description:
      "This page.tsx renders when the user clicks a Link inside the app. It shows the photo in a modal overlay. It has access to the same params as the full-page version.",
    code: "// app/photos/@modal/(.)id/page.tsx\n"
      + "// 'use client' because we need onClick to close the modal via router.back()\n"
      + "'use client';\n\n"
      + "import { useRouter } from 'next/navigation';\n\n"
      + "export default function PhotoModal({\n"
      + "  params,\n"
      + "}: {\n"
      + "  params: { id: string };\n"
      + "}) {\n"
      + "  const router = useRouter();\n\n"
      + "  return (\n"
      + "    <div\n"
      + "      className=\"fixed inset-0 bg-black/80 z-50 flex items-center justify-center\"\n"
      + "      onClick={() => router.back()}\n"
      + "    >\n"
      + "      <div className=\"bg-zinc-900 rounded-xl p-6 max-w-lg w-full mx-4\"\n"
      + "           onClick={(e) => e.stopPropagation()}>\n"
      + "        <p>Photo #{params.id}</p>\n"
      + "        <button onClick={() => router.back()}>← Back to gallery</button>\n"
      + "        <a href={`/photos/${params.id}`}>Open full page →</a>\n"
      + "      </div>\n"
      + "    </div>\n"
      + "  );\n"
      + "}",
    borderColor: "border-cyan-500/20",
    bgColor: "bg-cyan-500/5",
  },
  {
    id: "default",
    label: "4. @modal/default.tsx — Required null fallback",
    description:
      "Without default.tsx Next.js throws a runtime error because the @modal slot has no content when no photo is selected. Return null to render nothing.",
    code: `// app/photos/@modal/default.tsx
// WHY THIS FILE IS REQUIRED:
// When the user is on /photos (no photo selected), the @modal slot
// has no matching route to render. Next.js needs a fallback.
// Without this file → error: "No matching route found for @modal"
// With this file → null is rendered (no modal visible).

export default function ModalDefault() {
  // Return null = render nothing = no modal overlay
  return null;
}`,
    borderColor: "border-green-500/20",
    bgColor: "bg-green-500/5",
  },
  {
    id: "full-page",
    label: "5. photos/[id]/page.tsx — The real full-page version",
    description:
      "This page renders when the user navigates directly (hard nav), refreshes, or opens a shared link. It is the 'source of truth' full-page view.",
    code: "// app/photos/[id]/page.tsx\n"
      + "// This renders when user navigates directly or refreshes.\n\n"
      + "import type { Metadata } from 'next';\n\n"
      + "export async function generateMetadata({ params }) {\n"
      + "  return {\n"
      + "    title: `Photo #${params.id}`,\n"
      + "    description: `Full-page view of photo #${params.id}`,\n"
      + "  };\n"
      + "}\n\n"
      + "export default function PhotoPage({ params }: { params: { id: string } }) {\n"
      + "  return (\n"
      + "    <main className=\"min-h-screen p-8\">\n"
      + "      <h1>Photo #{params.id}</h1>\n"
      + "      <div>Full photo content here</div>\n"
      + "    </main>\n"
      + "  );\n"
      + "}",
    borderColor: "border-orange-500/20",
    bgColor: "bg-orange-500/5",
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
export default function InterceptingRoutesPage() {
  return (
    <main className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto">

      {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
      <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
        <span className="mx-2" aria-hidden="true">›</span>
        <Link href="/phase-10" className="hover:text-blue-400 transition-colors">Phase 10</Link>
        <span className="mx-2" aria-hidden="true">›</span>
        <span className="text-gray-300">Intercepting Routes</span>
      </nav>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl" aria-hidden="true">🪟</span>
          <h1 className="text-3xl font-bold text-white">Intercepting Routes</h1>
        </div>
        <p className="text-gray-400 leading-relaxed max-w-2xl">
          Render a URL as a modal when navigating within the app, but as a full
          page when accessed directly. One URL — two different render contexts.
        </p>
      </header>

      {/* ── Navigation Behaviour Comparison ──────────────────────────────────── */}
      <section className="mb-10" aria-labelledby="nav-behaviour-heading">
        <h2 id="nav-behaviour-heading" className="text-lg font-semibold text-white mb-4">
          Soft Nav vs Hard Nav
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-5">
            <h3 className="text-sm font-semibold text-violet-300 mb-3">
              Soft Navigation (Link click)
            </h3>
            <ul className="space-y-2 text-xs text-gray-400">
              <li className="flex gap-2">
                <span className="text-violet-400 shrink-0">→</span>
                User clicks <code className="text-gray-300">&lt;Link href=&quot;/photos/42&quot;&gt;</code>
              </li>
              <li className="flex gap-2">
                <span className="text-violet-400 shrink-0">→</span>
                Next.js detects an intercepting route exists
              </li>
              <li className="flex gap-2">
                <span className="text-violet-400 shrink-0">→</span>
                Renders <code className="text-gray-300">@modal/(.)id/page.tsx</code>
              </li>
              <li className="flex gap-2">
                <span className="text-violet-400 shrink-0">→</span>
                URL becomes <code className="text-gray-300">/photos/42</code>
              </li>
              <li className="flex gap-2">
                <span className="text-violet-400 shrink-0">→</span>
                Background gallery stays visible
              </li>
            </ul>
          </div>
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">
            <h3 className="text-sm font-semibold text-blue-300 mb-3">
              Hard Navigation (direct URL / refresh)
            </h3>
            <ul className="space-y-2 text-xs text-gray-400">
              <li className="flex gap-2">
                <span className="text-blue-400 shrink-0">→</span>
                User types <code className="text-gray-300">/photos/42</code> in address bar
              </li>
              <li className="flex gap-2">
                <span className="text-blue-400 shrink-0">→</span>
                No client-side state → interceptor is bypassed
              </li>
              <li className="flex gap-2">
                <span className="text-blue-400 shrink-0">→</span>
                Renders <code className="text-gray-300">photos/[id]/page.tsx</code> (real route)
              </li>
              <li className="flex gap-2">
                <span className="text-blue-400 shrink-0">→</span>
                Full page render — no modal, no background
              </li>
              <li className="flex gap-2">
                <span className="text-blue-400 shrink-0">→</span>
                Shared links always open the full page
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── Notation Reference ───────────────────────────────────────────────── */}
      <section className="mb-10" aria-labelledby="notation-heading">
        <h2 id="notation-heading" className="text-lg font-semibold text-white mb-4">
          The <code className="text-violet-300">(.) (..) (...)</code> Notation
        </h2>
        <div className="space-y-3">
          {[
            {
              notation: "(.)",
              meaning: "Same level — intercept a sibling segment",
              example: "app/photos/(.)[id]  →  intercepts  app/photos/[id]",
              note: "The intercepting folder is inside the same parent as the target.",
            },
            {
              notation: "(..)",
              meaning: "One level up — intercept a segment in the parent directory",
              example: "app/feed/(..)photo  →  intercepts  app/photo",
              note: "The intercepting folder is nested one level deeper than the target.",
            },
            {
              notation: "(...)",
              meaning: "Root level — intercept a segment from the app root",
              example: "app/gallery/(...)photo  →  intercepts  app/photo",
              note: "Use when the intercepting route is deeply nested.",
            },
            {
              notation: "(..)(..)/",
              meaning: "Two levels up",
              example: "app/a/b/(..)(..)/c  →  intercepts  app/c",
              note: "Rarely needed. Counts route segments, not file system depth.",
            },
          ].map((row) => (
            <div key={row.notation} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <div className="flex items-center gap-3 mb-2">
                <code className="text-violet-300 font-mono font-bold text-base bg-violet-500/10 px-2 py-0.5 rounded">
                  {row.notation}
                </code>
                <span className="text-sm text-gray-300">{row.meaning}</span>
              </div>
              <code className="text-xs text-green-400 font-mono block mb-1">{row.example}</code>
              <p className="text-xs text-gray-500">{row.note}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-600 mt-3">
          ⚠️ Notation counts ROUTE SEGMENTS, not file system folders.
          Route groups <code className="text-gray-500">(group)</code> and
          private folders <code className="text-gray-500">_folder</code> are not counted.
        </p>
      </section>

      {/* ── Code Examples ────────────────────────────────────────────────────── */}
      <section className="mb-10" aria-labelledby="code-heading">
        <h2 id="code-heading" className="text-lg font-semibold text-white mb-4">
          Code Examples — Photo Gallery Modal
        </h2>
        <div className="space-y-4">
          {CODE_EXAMPLES.map((ex) => (
            <CodeBlock key={ex.id} {...ex} />
          ))}
        </div>
      </section>

      {/* ── When to Use ──────────────────────────────────────────────────────── */}
      <section className="mb-10" aria-labelledby="when-heading">
        <h2 id="when-heading" className="text-lg font-semibold text-white mb-4">
          When to Use Intercepting Routes
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            {
              emoji: "✅",
              title: "Use it for",
              items: [
                "Photo/media gallery with preview modal",
                "E-commerce product quick-view",
                "Login/signup modal with own URL",
                "Any detail that also needs a shareable full page",
              ],
              color: "border-green-500/20 bg-green-500/5",
              textColor: "text-green-400",
            },
            {
              emoji: "❌",
              title: "Avoid it for",
              items: [
                "Simple confirmation dialogs (use React state)",
                "Tooltips or popovers (no URL needed)",
                "Inline form validation feedback",
                "Any overlay that does not need a unique URL",
              ],
              color: "border-red-500/20 bg-red-500/5",
              textColor: "text-red-400",
            },
          ].map((card) => (
            <div key={card.title} className={`rounded-xl border p-4 ${card.color}`}>
              <h3 className={`text-sm font-semibold mb-3 ${card.textColor}`}>
                {card.emoji}{" "}{card.title}
              </h3>
              <ul className="space-y-1.5">
                {card.items.map((item) => (
                  <li key={item} className="text-xs text-gray-400 flex gap-2">
                    <span className={card.textColor} aria-hidden="true">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── Lesson Navigation ────────────────────────────────────────────────── */}
      <div className="flex justify-between text-sm">
        <Link href="/phase-10" className="text-gray-500 hover:text-blue-400 transition-colors">
          ← Phase 10
        </Link>
        <Link href="/phase-10/02-parallel-routes" className="text-blue-400 hover:text-blue-300 transition-colors">
          Parallel Routes →
        </Link>
      </div>
    </main>
  );
}
