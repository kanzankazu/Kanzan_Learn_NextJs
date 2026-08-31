/**
 * Lesson 02 — Parallel Routes
 * Route: /phase-10/02-parallel-routes
 *
 * WHAT ARE PARALLEL ROUTES?
 * ──────────────────────────
 * Parallel routes let you render MULTIPLE PAGES simultaneously inside a
 * single layout. Each "slot" is an independent sub-page that can have its
 * own loading state, error boundary, and navigation history.
 *
 * ANALOGY:
 * ─────────
 * Think of a newspaper with multiple independent columns on the same page.
 * Each column has different content, but they all share the same page layout.
 * In Next.js terms: each column is a parallel route slot, and the newspaper
 * page is the layout.tsx that stitches them together.
 *
 * WHY IS THIS USEFUL?
 * ────────────────────
 * Without parallel routes, if you want a dashboard with a sidebar AND a
 * main content area that BOTH load independently, you need complex client-side
 * logic (multiple useEffect calls, manual loading states, etc.).
 *
 * With parallel routes:
 * ✅ Each slot fetches its own data independently on the server
 * ✅ One slot being slow does NOT block the others from rendering
 * ✅ Each slot can have its own loading.tsx and error.tsx
 * ✅ You can conditionally show/hide slots based on authentication, role, etc.
 *
 * THE @SLOT NAMING CONVENTION:
 * ─────────────────────────────
 * Parallel route slots are created by naming a folder with an @ prefix:
 *
 *   @team        → a slot named "team"
 *   @analytics   → a slot named "analytics"
 *   @notifications → a slot named "notifications"
 *
 * The @ prefix tells Next.js: "this is a slot, not a URL segment."
 * @team does NOT create the URL /team — the folder is invisible to the URL.
 *
 * HOW LAYOUT RECEIVES SLOTS:
 * ───────────────────────────
 * The layout.tsx in the same directory as the @slot folders automatically
 * receives each slot as a named prop:
 *
 *   export default function Layout({
 *     children,    // the default slot (from page.tsx in the same folder)
 *     team,        // from @team/page.tsx
 *     analytics,   // from @analytics/page.tsx
 *   }: {
 *     children: React.ReactNode;
 *     team: React.ReactNode;
 *     analytics: React.ReactNode;
 *   }) { ... }
 *
 * THE default.tsx REQUIREMENT:
 * ──────────────────────────────
 * When a slot has no matching route for the current URL, Next.js needs a
 * fallback. Without default.tsx → runtime error.
 * With default.tsx → renders the fallback (usually null or a placeholder).
 *
 * When IS a slot "unmatched"?
 * - The slot has sub-routes (e.g., @analytics/overview/page.tsx), and
 *   the user navigates to a sibling route that does NOT have an analytics
 *   sub-route defined.
 * - The initial render before any navigation has happened.
 *
 * CONDITIONAL SLOTS:
 * ───────────────────
 * Because slots are just React nodes received as props, you can show/hide
 * them with regular JavaScript logic:
 *
 *   {user.role === 'admin' ? analytics : null}
 *
 * This is how you build role-based layouts: the admin sees an analytics
 * panel, regular users don't — all from the same route structure.
 *
 * PARALLEL ROUTES vs COMPONENTS:
 * ────────────────────────────────
 * Use PARALLEL ROUTES when:
 * - Each section needs its own loading/error boundary
 * - Each section has its own nested sub-navigation (own URL segments)
 * - Sections are truly independent pages/views
 *
 * Use regular COMPONENTS when:
 * - Sections are tightly coupled (share data, no own loading state)
 * - Sections don't need their own URLs
 * - Simple layout composition (sidebar + content)
 */

import Link from "next/link";
import type { Metadata } from "next";

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "02 — Parallel Routes",
  description:
    "Learn Next.js parallel routes: @slot naming, layout.tsx props, default.tsx fallback, and independent loading states.",
};

// ─── Code Examples ────────────────────────────────────────────────────────────
const CODE_EXAMPLES = [
  {
    id: "folder-structure",
    label: "1. Folder structure — Dashboard with parallel slots",
    description:
      "Each @slot folder is an independent sub-page. The @symbol makes it a slot (not a URL segment). The layout in the same directory receives all slots as props.",
    code: `app/
├── dashboard/
│   ├── page.tsx                   ← /dashboard (the default "children" slot)
│   ├── layout.tsx                 ← receives { children, team, analytics } as props
│   │
│   ├── @team/                     ← slot named "team" (NOT a URL segment)
│   │   ├── page.tsx               ← renders at /dashboard (team section)
│   │   ├── default.tsx            ← fallback when slot is unmatched
│   │   └── members/
│   │       └── page.tsx           ← navigates to /dashboard/members (team slot)
│   │
│   └── @analytics/                ← slot named "analytics"
│       ├── page.tsx               ← renders at /dashboard (analytics section)
│       ├── default.tsx            ← fallback when slot is unmatched
│       ├── loading.tsx            ← independent loading state for analytics
│       ├── error.tsx              ← independent error boundary for analytics
│       └── revenue/
│           └── page.tsx           ← navigates to /dashboard/revenue (analytics slot)

# IMPORTANT: @team and @analytics do NOT create /team or /analytics URLs.
# The URL is still just /dashboard. The slots are rendered ALONGSIDE children.`,
    borderColor: "border-blue-500/20",
    bgColor: "bg-blue-500/5",
  },
  {
    id: "layout",
    label: "2. dashboard/layout.tsx — Receiving and placing slots",
    description:
      "The layout receives each slot as a named prop. You control exactly where each slot renders in the UI. Slots can go side-by-side, stacked, or hidden behind conditions.",
    code: `// app/dashboard/layout.tsx
// This layout simultaneously renders:
//   children   → from dashboard/page.tsx (the main content area)
//   team       → from @team/page.tsx (the team sidebar)
//   analytics  → from @analytics/page.tsx (the analytics panel)
//
// ALL THREE load in parallel on the server. No sequential waterfall.

export default function DashboardLayout({
  children,
  team,
  analytics,
}: {
  children: React.ReactNode;
  team: React.ReactNode;      // ← automatically bound to @team slot
  analytics: React.ReactNode; // ← automatically bound to @analytics slot
}) {
  return (
    <div className="dashboard-layout">
      {/*
       * Main content area — renders children (dashboard/page.tsx)
       * AND the analytics panel side by side
       */}
      <div className="main-area">
        <div className="content">{children}</div>
        <div className="analytics-panel">{analytics}</div>
      </div>

      {/*
       * Team sidebar — always visible alongside the main content
       */}
      <aside className="team-sidebar">
        {team}
      </aside>
    </div>
  );
}`,
    borderColor: "border-violet-500/20",
    bgColor: "bg-violet-500/5",
  },
  {
    id: "slot-page",
    label: "3. @team/page.tsx — A slot page (Server Component)",
    description:
      "A slot page is just a regular Next.js page. It can be async, fetch its own data, and has its own loading/error boundaries. It knows nothing about the other slots.",
    code: `// app/dashboard/@team/page.tsx
// This is a regular Server Component — it can fetch data independently.
// It has NO knowledge of @analytics or children.
// If this fetch is slow, it only delays the "team" section,
// not the entire dashboard.

// Simulate a slow team data fetch
async function getTeamMembers() {
  await new Promise((r) => setTimeout(r, 500)); // 500ms simulated delay
  return [
    { id: 1, name: 'Alice Chen', role: 'Engineering Lead' },
    { id: 2, name: 'Bob Park',   role: 'Designer' },
    { id: 3, name: 'Carol Smith', role: 'Product Manager' },
  ];
}

export default async function TeamSlot() {
  // This fetch happens in PARALLEL with @analytics/page.tsx fetch.
  // Next.js renders both slots concurrently, not sequentially.
  const members = await getTeamMembers();

  return (
    <section>
      <h2 className="text-lg font-semibold mb-3">Team</h2>
      <ul className="space-y-2">
        {members.map((member) => (
          <li key={member.id} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
              <span className="text-xs text-blue-300">{member.name[0]}</span>
            </div>
            <div>
              <p className="text-sm text-white">{member.name}</p>
              <p className="text-xs text-gray-400">{member.role}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}`,
    borderColor: "border-cyan-500/20",
    bgColor: "bg-cyan-500/5",
  },
  {
    id: "default",
    label: "4. @team/default.tsx — Required fallback",
    description:
      "When the slot has no matching page for the current URL, Next.js renders default.tsx. Without this file, you get a runtime error during navigation.",
    code: `// app/dashboard/@team/default.tsx
// WHY THIS IS REQUIRED:
// If the user navigates to /dashboard/revenue (which only matches @analytics),
// there is no @team/revenue/page.tsx → the team slot is "unmatched".
// Next.js needs a fallback. Without default.tsx → error.
// With default.tsx → renders the default team view (or null).

// OPTION 1: Return null (slot disappears when unmatched)
export default function TeamDefault() {
  return null;
}

// OPTION 2: Return a placeholder or the same content as page.tsx
// This keeps the team section visible even when @analytics navigates
// to a sub-route. Choose based on your UI requirements.
//
// export default function TeamDefault() {
//   return <TeamSlot />;  // re-render the same content as page.tsx
// }`,
    borderColor: "border-green-500/20",
    bgColor: "bg-green-500/5",
  },
  {
    id: "conditional",
    label: "5. Conditional slots — Role-based dashboard",
    description:
      "Because slots are React nodes, you can conditionally render them based on user role, feature flags, or any JavaScript condition.",
    code: `// app/dashboard/layout.tsx — role-based conditional slots
// This is one of the most powerful use cases for parallel routes:
// showing completely different layouts to different user roles.

import { getCurrentUser } from '@/lib/auth'; // your auth helper

export default async function DashboardLayout({
  children,
  team,
  analytics,
  adminPanel,
}: {
  children: React.ReactNode;
  team: React.ReactNode;
  analytics: React.ReactNode;
  adminPanel: React.ReactNode; // from @adminPanel slot
}) {
  // Fetch the current user on the server
  const user = await getCurrentUser();

  return (
    <div className="dashboard">
      {/* Everyone sees the main content */}
      <main>{children}</main>

      {/* Everyone sees the team panel */}
      <aside>{team}</aside>

      {/* Only users with analytics permission see this panel */}
      {user.permissions.includes('view_analytics') ? (
        <section className="analytics-panel">{analytics}</section>
      ) : null}

      {/* Only admins see the admin panel slot */}
      {user.role === 'admin' ? (
        <section className="admin-panel">{adminPanel}</section>
      ) : null}
    </div>
  );
}

// Note: Each slot still needs a default.tsx even if it is conditionally
// hidden — Next.js validates the slot exists at build time.`,
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
export default function ParallelRoutesPage() {
  return (
    <main className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto">

      {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
      <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
        <span className="mx-2" aria-hidden="true">›</span>
        <Link href="/phase-10" className="hover:text-blue-400 transition-colors">Phase 10</Link>
        <span className="mx-2" aria-hidden="true">›</span>
        <span className="text-gray-300">Parallel Routes</span>
      </nav>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl" aria-hidden="true">🔀</span>
          <h1 className="text-3xl font-bold text-white">Parallel Routes</h1>
        </div>
        <p className="text-gray-400 leading-relaxed max-w-2xl">
          Render multiple independent sub-pages simultaneously in a single layout.
          Each slot has its own loading, error, and navigation state — perfect
          for dashboards, split-panel UIs, and role-based layouts.
        </p>
      </header>

      {/* ── How Slots Work ───────────────────────────────────────────────────── */}
      <section className="mb-10" aria-labelledby="slots-heading">
        <h2 id="slots-heading" className="text-lg font-semibold text-white mb-4">
          How Slots Work
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            {
              step: "1. Create @slot folders",
              body: "Name a folder with @ prefix: @team, @analytics, @sidebar. The @ makes it a slot — invisible to the URL router.",
              color: "border-blue-500/20 bg-blue-500/5",
              badge: "text-blue-400",
            },
            {
              step: "2. Add page.tsx inside each slot",
              body: "Each @slot/page.tsx renders when its parent route matches. It can be async, fetch data, and has full Server Component capabilities.",
              color: "border-violet-500/20 bg-violet-500/5",
              badge: "text-violet-400",
            },
            {
              step: "3. Add default.tsx inside each slot",
              body: "Required fallback for when the slot has no matching route. Without it, navigation to unmatched URLs throws a runtime error.",
              color: "border-yellow-500/20 bg-yellow-500/5",
              badge: "text-yellow-400",
            },
            {
              step: "4. Receive slots in layout.tsx",
              body: "The layout in the same directory receives each @slot as a named prop. You decide where and whether to render each slot in the JSX.",
              color: "border-green-500/20 bg-green-500/5",
              badge: "text-green-400",
            },
          ].map((card) => (
            <div key={card.step} className={`rounded-xl border p-4 ${card.color}`}>
              <p className={`text-xs font-semibold mb-2 ${card.badge}`}>{card.step}</p>
              <p className="text-xs text-gray-400 leading-relaxed">{card.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Key Concepts ─────────────────────────────────────────────────────── */}
      <section className="mb-10" aria-labelledby="concepts-heading">
        <h2 id="concepts-heading" className="text-lg font-semibold text-white mb-4">
          Key Concepts
        </h2>
        <div className="space-y-3">
          {[
            {
              term: "@slot folder",
              def: "A folder prefixed with @ creates a named slot. It does NOT add a URL segment. @team renders at /dashboard (not /dashboard/team). The name after @ becomes the prop name in layout.tsx.",
            },
            {
              term: "default.tsx",
              def: "Required fallback rendered when a slot has no page matching the current URL. Return null to hide the slot gracefully, or render a default view to keep it visible.",
            },
            {
              term: "Independent loading states",
              def: "Add loading.tsx inside a @slot folder and it shows a loading spinner only for that slot while its data is fetching. The rest of the dashboard renders immediately.",
            },
            {
              term: "Independent error boundaries",
              def: "Add error.tsx inside a @slot folder and errors in that slot are caught there without breaking the rest of the layout. Other slots continue working.",
            },
            {
              term: "Slot sub-navigation",
              def: "Slots can have their own nested routes: @analytics/revenue/page.tsx renders at /dashboard/revenue but only inside the @analytics slot — other slots stay as-is.",
            },
          ].map((item) => (
            <div key={item.term} className="rounded-xl border border-white/10 bg-blue-500/5 p-4">
              <code className="text-blue-300 text-sm font-mono">{item.term}</code>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">{item.def}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Code Examples ────────────────────────────────────────────────────── */}
      <section className="mb-10" aria-labelledby="code-heading">
        <h2 id="code-heading" className="text-lg font-semibold text-white mb-4">
          Code Examples — Dashboard with Parallel Slots
        </h2>
        <div className="space-y-4">
          {CODE_EXAMPLES.map((ex) => (
            <CodeBlock key={ex.id} {...ex} />
          ))}
        </div>
      </section>

      {/* ── Parallel Routes vs Regular Components ───────────────────────────── */}
      <section className="mb-10" aria-labelledby="vs-heading">
        <h2 id="vs-heading" className="text-lg font-semibold text-white mb-4">
          Parallel Routes vs Regular Components
        </h2>
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="text-left p-3 text-gray-400 font-medium">Need</th>
                <th className="text-left p-3 text-blue-400 font-medium">Parallel Routes</th>
                <th className="text-left p-3 text-violet-400 font-medium">Components</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Independent loading states", "✅ Each slot has own loading.tsx", "❌ Manual state management"],
                ["Independent error boundaries", "✅ Each slot has own error.tsx", "❌ One error.tsx for all"],
                ["Own URL sub-navigation", "✅ @slot/sub-page/page.tsx", "❌ No URL support"],
                ["Conditional show/hide", "✅ Conditional in layout", "✅ Conditional in JSX"],
                ["Simple layout composition", "⚠️ Overkill", "✅ Simple and clear"],
                ["Tightly coupled sections", "⚠️ Over-complicated", "✅ Share state easily"],
              ].map(([need, parallel, component], i) => (
                <tr key={need} className={`border-b border-white/5 ${i % 2 === 0 ? "" : "bg-white/[0.02]"}`}>
                  <td className="p-3 text-gray-300 text-xs">{need}</td>
                  <td className="p-3 text-gray-400 text-xs">{parallel}</td>
                  <td className="p-3 text-gray-400 text-xs">{component}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Lesson Navigation ────────────────────────────────────────────────── */}
      <div className="flex justify-between text-sm">
        <Link href="/phase-10/01-intercepting-routes" className="text-gray-500 hover:text-blue-400 transition-colors">
          ← Intercepting Routes
        </Link>
        <Link href="/phase-10/03-edge-runtime" className="text-blue-400 hover:text-blue-300 transition-colors">
          Edge Runtime →
        </Link>
      </div>
    </main>
  );
}
