/**
 * Phase 7 — Mini Project: Blog Post Manager
 * Route: /phase-7/mini-project
 *
 * WHAT IS THIS MINI PROJECT?
 * ───────────────────────────
 * A simulated fullstack blog post manager that demonstrates the ARCHITECTURE
 * you would use with a real database (Prisma + Postgres, Drizzle + SQLite,
 * or Supabase), without requiring any database setup.
 *
 * ARCHITECTURE USED:
 * ───────────────────
 * ┌─────────────────────────────────────────────────────────┐
 * │  page.tsx (Server Component)                            │
 * │  • Renders the page shell (heading, description)        │
 * │  • Imports PostManager from _components/                │
 * │  • In a real app: would fetch initial posts from DB     │
 * │    and pass them to PostManager as initialPosts prop    │
 * └──────────────────────┬──────────────────────────────────┘
 *                        │ imports
 * ┌──────────────────────▼──────────────────────────────────┐
 * │  _components/PostManager.tsx ('use client')             │
 * │  • Manages post list state with useState                │
 * │  • Add, edit title, delete posts                        │
 * │  • In a real app: each mutation would call a Server     │
 * │    Action (prisma.post.create / update / delete)        │
 * └─────────────────────────────────────────────────────────┘
 *
 * WHY SEPARATE SERVER + CLIENT COMPONENTS?
 * ──────────────────────────────────────────
 * The page.tsx Server Component handles:
 *   - Initial data fetching (DB query at render time)
 *   - SEO metadata
 *   - Static parts of the UI that don't need JS
 *
 * The PostManager Client Component handles:
 *   - Interactive CRUD UI (useState, event handlers)
 *   - Form inputs, buttons, live updates
 *   - Only this component ships JavaScript to the browser
 *
 * This pattern minimises the JavaScript bundle size while giving
 * users a fast initial page load (server-rendered) and an
 * interactive UI for mutations (client-side state).
 *
 * HOW YOU WOULD SWAP IN A REAL DATABASE:
 * ────────────────────────────────────────
 * 1. page.tsx: replace the simulated initial data with a real DB query
 *    - Prisma:   const posts = await prisma.post.findMany({ orderBy: { createdAt: 'desc' } })
 *    - Drizzle:  const posts = await db.query.posts.findMany({ orderBy: desc(posts.createdAt) })
 *    - Supabase: const { data: posts } = await supabase.from('posts').select('*')
 *
 * 2. PostManager.tsx: replace useState mutations with Server Actions
 *    - Create: call `createPostAction(formData)` — Server Action using prisma.post.create()
 *    - Update: call `updatePostAction(id, data)` — Server Action using prisma.post.update()
 *    - Delete: call `deletePostAction(id)` — Server Action using prisma.post.delete()
 *    - After each action: call `router.refresh()` or `revalidatePath('/phase-7/mini-project')`
 *      to refetch the updated data from the server
 */

import type { Metadata } from "next";
import Link from "next/link";
import { PostManager } from "./_components/PostManager";

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "Mini Project — Blog Post Manager",
  description:
    "Simulated fullstack blog post manager demonstrating the Server Component + Client Component architecture for real database-backed CRUD apps.",
};

// ─── Simulated "initial data" ──────────────────────────────────────────────────
// In a REAL application, this data would come from a database:
//
//   WITH PRISMA:
//   const initialPosts = await prisma.post.findMany({
//     orderBy: { createdAt: 'desc' },
//     take: 20,
//   });
//
//   WITH DRIZZLE:
//   const initialPosts = await db.query.posts.findMany({
//     orderBy: (posts, { desc }) => [desc(posts.createdAt)],
//     limit: 20,
//   });
//
//   WITH SUPABASE:
//   const { data: initialPosts } = await supabase
//     .from('posts')
//     .select('*')
//     .order('created_at', { ascending: false })
//     .limit(20);
//
// Since no database is installed, we use hardcoded seed data instead.
const SEED_POSTS: Array<{ id: number; title: string; published: boolean; createdAt: string }> = [
  { id: 1, title: "Getting Started with Prisma ORM", published: true,  createdAt: "2024-01-15" },
  { id: 2, title: "Drizzle vs Prisma: Which to Choose?",  published: true,  createdAt: "2024-01-18" },
  { id: 3, title: "Building with Supabase + Next.js",     published: false, createdAt: "2024-01-20" },
  { id: 4, title: "Row Level Security Deep Dive",         published: true,  createdAt: "2024-01-22" },
  { id: 5, title: "Draft: Database Transactions Explained", published: false, createdAt: "2024-01-25" },
];

// ─── Page Component ────────────────────────────────────────────────────────────
// No 'use client' — this is a Server Component.
// It renders the page shell and passes seed data to the interactive PostManager.
export default function MiniProjectPage() {
  return (
    <main className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto">

      {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
      <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
        <span className="mx-2" aria-hidden="true">›</span>
        <Link href="/phase-7" className="hover:text-blue-400 transition-colors">Phase 7</Link>
        <span className="mx-2" aria-hidden="true">›</span>
        <span className="text-gray-300">Mini Project</span>
      </nav>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl" aria-hidden="true">📝</span>
          <h1 className="text-3xl font-bold text-white">Blog Post Manager</h1>
        </div>
        <p className="text-gray-400 leading-relaxed max-w-2xl">
          A simulated fullstack CRUD app. Data lives in React state (no real DB),
          but the architecture mirrors exactly what a production Prisma / Drizzle /
          Supabase app would look like.
        </p>
        {/* Simulation Notice */}
        <div className="mt-4 rounded-xl border border-blue-500/30 bg-blue-500/5 px-4 py-3">
          <p className="text-sm text-blue-300 font-semibold mb-1">
            📦 Simulated DB — in-memory only
          </p>
          <p className="text-xs text-blue-200/70 leading-relaxed">
            All data changes are stored in React state. Refreshing the page resets to
            the seed data. In a production app, each mutation would call a Server Action
            backed by a real database.
          </p>
        </div>
      </header>

      {/* ── Architecture Diagram ─────────────────────────────────────────────── */}
      {/*
       * An ASCII architecture tree helps beginners understand how the pieces
       * fit together before they look at the actual code.
       */}
      <section className="mb-8" aria-labelledby="arch-heading">
        <h2 id="arch-heading" className="text-lg font-semibold text-white mb-3">
          Architecture: This Page
        </h2>
        <pre className="bg-black/40 border border-white/10 rounded-lg p-4 font-mono text-xs text-gray-400 overflow-x-auto leading-relaxed">
{`page.tsx                           ← Server Component
├── Renders: breadcrumb, header, architecture diagram (static HTML)
├── Passes:  initialPosts (SEED_POSTS) to PostManager
└── Imports: PostManager from ./_components/PostManager.tsx

_components/PostManager.tsx        ← Client Component ('use client')
├── useState: post list, input text, editing state
├── Add post: appends to state array
│   └── Real app: await createPostAction(title) → prisma.post.create()
├── Toggle published: updates post in state
│   └── Real app: await updatePostAction(id, { published }) → prisma.post.update()
├── Edit title: updates title in state
│   └── Real app: await updatePostAction(id, { title }) → prisma.post.update()
└── Delete post: removes from state array
    └── Real app: await deletePostAction(id) → prisma.post.delete()`}
        </pre>
      </section>

      {/* ── What Changes in a Real App ────────────────────────────────────────── */}
      <section className="mb-8" aria-labelledby="real-app-heading">
        <h2 id="real-app-heading" className="text-lg font-semibold text-white mb-3">
          Simulation vs Real Production App
        </h2>
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="text-left p-3 text-gray-400 font-medium text-xs">Aspect</th>
                <th className="text-left p-3 text-yellow-400 font-medium text-xs">This Demo</th>
                <th className="text-left p-3 text-green-400 font-medium text-xs">Real Production App</th>
              </tr>
            </thead>
            <tbody>
              {[
                [
                  "Initial data",
                  "Hardcoded SEED_POSTS array",
                  "await prisma.post.findMany() in Server Component",
                ],
                [
                  "Create post",
                  "push() to local state array",
                  "Server Action: await prisma.post.create({ data })",
                ],
                [
                  "Update post",
                  "map() over state array",
                  "Server Action: await prisma.post.update({ where, data })",
                ],
                [
                  "Delete post",
                  "filter() from state array",
                  "Server Action: await prisma.post.delete({ where: { id } })",
                ],
                [
                  "After mutation",
                  "State updates, browser re-renders",
                  "revalidatePath() or router.refresh() re-fetches from DB",
                ],
                [
                  "Persistence",
                  "Lost on page refresh",
                  "Saved to DB, survives restarts and all users see changes",
                ],
                [
                  "ID generation",
                  "Math.random() + Date.now()",
                  "DB auto-increment or UUID (@id @default(autoincrement()))",
                ],
              ].map(([aspect, demo, real]) => (
                <tr key={aspect} className="border-b border-white/5">
                  <td className="p-3 text-gray-300 text-xs font-medium">{aspect}</td>
                  <td className="p-3 text-yellow-200/70 text-xs font-mono">{demo}</td>
                  <td className="p-3 text-green-200/70 text-xs font-mono">{real}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Interactive PostManager ───────────────────────────────────────────── */}
      {/*
       * PostManager is a 'use client' component — it needs useState and event
       * handlers for the CRUD UI. We pass the seed data as a prop so PostManager
       * starts with something to show (in a real app, this would be DB data).
       *
       * WHY NOT JUST PUT EVERYTHING IN A CLIENT COMPONENT?
       * → The static parts above (header, architecture diagram, comparison table)
       *   are rendered as HTML with zero JavaScript. Keeping them in a Server
       *   Component means they don't add to the JS bundle sent to the browser.
       *   Only the interactive PostManager part sends JavaScript.
       */}
      <section aria-labelledby="manager-heading">
        <h2 id="manager-heading" className="text-lg font-semibold text-white mb-4">
          Live Demo — Interact with the Post Manager
        </h2>
        {/*
         * We pass initialPosts from the server to the client component.
         * The type signature of PostManager expects this prop.
         * In a real app, SEED_POSTS would be replaced by a real DB query above.
         */}
        <PostManager initialPosts={SEED_POSTS} />
      </section>

      {/* ── Lesson Navigation ────────────────────────────────────────────────── */}
      <div className="mt-10 flex justify-between text-sm">
        <Link href="/phase-7/03-supabase" className="text-gray-500 hover:text-blue-400 transition-colors">
          ← Supabase
        </Link>
        <Link href="/phase-8" className="text-blue-400 hover:text-blue-300 transition-colors">
          Phase 8 →
        </Link>
      </div>
    </main>
  );
}
