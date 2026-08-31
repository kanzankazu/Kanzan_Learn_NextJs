/**
 * Mini Project — Todo App (Phase 2)
 * Route: /phase-2/mini-project
 *
 * WHAT THIS DEMONSTRATES:
 * ─────────────────────────
 * This mini project brings together ALL the Phase 2 concepts:
 *
 * 1. Server fetch (Lesson 01):
 *    - The page is async and fetches initial todos on the server
 *    - No useEffect, no loading state for initial data
 *
 * 2. Caching (Lesson 02):
 *    - Initial data uses next.revalidate (ISR-like pattern)
 *    - Comments show which cache strategy to use for which operation
 *
 * 3. Parallel fetch (Lesson 03):
 *    - Fetches todos AND stats in parallel with Promise.all
 *
 * 4. Server Actions (Lesson 04):
 *    - CRUD operations (add/toggle/delete) are simulated in TodoList (client)
 *    - Comments show exactly how to replace each with a real Server Action
 *
 * ARCHITECTURE:
 * ─────────────
 * page.tsx (Server Component, async):
 *   - Fetches initialTodos + stats in parallel
 *   - Renders static layout (title, breadcrumb, stats, explanation)
 *   - Renders <TodoList initialTodos={...} /> (Client Component)
 *
 * _components/TodoList.tsx ('use client'):
 *   - Receives initialTodos from server as props
 *   - Manages CRUD interactions via local state
 *   - Would call Server Actions in a real app
 *
 * ANALOGY FOR ANDROID DEVS:
 * ───────────────────────────
 * page.tsx is like a ViewModel + Activity setup:
 *   - Page loads → server runs async fetch (like init { viewModel.fetchTodos() })
 *   - Passes data down to UI
 *
 * TodoList is like the actual RecyclerView + Adapter:
 *   - Owns the mutable state
 *   - Handles user interactions
 *   - Updates the UI reactively
 */

import Link from "next/link";
import type { Metadata } from "next";
import { TodoList } from "./_components/TodoList";
import type { TodoItem } from "./_components/TodoList";

export const metadata: Metadata = {
  title: "🎯 Mini Project — Todo App",
};

// ─── Simulated server data ────────────────────────────────────────────────────
// In production, replace these with real DB queries.
// Using Promise.all to demonstrate parallel fetching (Lesson 03).

/**
 * Fetches the initial todo list from the "server".
 * Real version: await db.todo.findMany({ orderBy: { createdAt: 'desc' } })
 *
 * Cache strategy: next.revalidate (ISR).
 * The list is somewhat fresh but doesn't need to be real-time.
 */
async function getTodos(): Promise<TodoItem[]> {
  // Simulate 250ms DB query
  await new Promise((r) => setTimeout(r, 250));

  return [
    { id: 1, title: "Learn Server Components (Phase 1)", done: true },
    { id: 2, title: "Understand fetch() in Server Components", done: true },
    { id: 3, title: "Master caching strategies", done: false },
    { id: 4, title: "Practice parallel fetching with Promise.all", done: false },
    { id: 5, title: "Build a form with Server Actions", done: false },
    { id: 6, title: "Complete Phase 2 mini project", done: false },
  ];
}

/**
 * Fetches aggregate stats about the todo list.
 * Real version: await db.todo.aggregate({ _count: true, where: { done: true } })
 *
 * Cache strategy: same ISR — these numbers update when todos change.
 */
async function getTodoStats(): Promise<{ total: number; done: number; streak: number }> {
  // Simulate 100ms — lighter query than fetching all rows
  await new Promise((r) => setTimeout(r, 100));

  return {
    total: 6,
    done: 2,
    streak: 3, // days in a row with at least one todo completed
  };
}

// ─── StatCard: pure Server Component ─────────────────────────────────────────
// Stateless display component. No interactivity needed, so no 'use client'.
// This stays on the server — zero JS shipped for this component.
function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/2 p-4 text-center">
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-600 mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
// Async Server Component: fetches data, renders static shell, delegates
// interactive parts to the TodoList Client Component.
export default async function TodoMiniProject() {
  // Parallel fetch — both run simultaneously (Lesson 03 pattern)
  // If these were sequential, we'd waste 250ms waiting for todos before
  // even starting the stats query. With Promise.all: max(250, 100) = 250ms.
  const [todos, stats] = await Promise.all([
    getTodos(),
    getTodoStats(),
  ]);

  const completionPercent = Math.round((stats.done / stats.total) * 100);

  return (
    <main className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto">

      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
        <span className="mx-2">›</span>
        <Link href="/phase-2" className="hover:text-blue-400 transition-colors">Phase 2</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-300">Mini Project</span>
      </nav>

      <header className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">🎯</span>
          <h1 className="text-3xl font-bold text-white">Todo App — Phase 2 Mini Project</h1>
        </div>
        <p className="text-gray-400">
          Server-fetched initial data + Client Component for CRUD interactions.
          All Phase 2 concepts combined.
        </p>
      </header>

      {/* Stats — pure Server Component render, no JS shipped */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Stats (server-rendered)
        </h2>
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
          <StatCard label="Total Todos" value={stats.total} sub="fetched server-side" />
          <StatCard label="Completed" value={`${stats.done}/${stats.total}`} sub={`${completionPercent}% done`} />
          <StatCard label="Day Streak" value={stats.streak} sub="days with activity" />
        </div>
      </section>

      {/* TodoList — Client Component for interactive CRUD */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Todos (interactive — client component)
        </h2>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-mono bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded">
            &apos;use client&apos;
          </span>
          <span className="text-xs text-gray-500">
            TodoList receives{" "}
            <code className="text-gray-400">{todos.length} todos</code> from server as props
          </span>
        </div>

        {/*
         * Pass server-fetched todos as props to the Client Component.
         * IMPORTANT: Props crossing the Server→Client boundary must be serializable:
         *   ✓ string, number, boolean, array, plain object
         *   ✗ functions, class instances, Date, Map, Set
         *
         * Our TodoItem[] is a plain JSON-serializable array — safe to pass.
         */}
        <TodoList initialTodos={todos} />
      </section>

      {/* Architecture diagram */}
      <section className="mb-8 rounded-xl border border-white/10 bg-black/20 p-5">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
          Component Architecture
        </h2>
        <div className="font-mono text-xs space-y-0.5">
          <p>
            <span className="text-purple-400">TodoMiniProject</span>{" "}
            <span className="text-gray-600">(Server Component — async, fetches data)</span>
          </p>
          <p>
            <span className="text-gray-600">├── </span>
            <span className="text-purple-400">StatCard</span>{" "}
            <span className="text-gray-600">× 3 (Server Component — pure display, no JS)</span>
          </p>
          <p>
            <span className="text-gray-600">└── </span>
            <span className="text-blue-400">TodoList</span>{" "}
            <span className="text-gray-600">(Client Component — useState, event handlers)</span>
          </p>
          <p>
            <span className="text-gray-600">    ├── Add form — </span>
            <span className="text-yellow-600">simulates Server Action (addTodo)</span>
          </p>
          <p>
            <span className="text-gray-600">    ├── Toggle — </span>
            <span className="text-yellow-600">simulates Server Action (toggleTodo)</span>
          </p>
          <p>
            <span className="text-gray-600">    └── Delete — </span>
            <span className="text-yellow-600">simulates Server Action (deleteTodo)</span>
          </p>
        </div>
        <p className="text-xs text-gray-600 mt-3 pt-3 border-t border-white/5">
          Purple = server HTML only. Blue = ships as JavaScript. Yellow = would be &apos;use server&apos; in production.
        </p>
      </section>

      {/* CRUD pattern reference */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">CRUD → Server Action Mapping</h2>
        <div className="rounded-xl border border-white/10 overflow-hidden">
          <table className="w-full text-xs text-gray-400">
            <thead className="bg-white/5 text-gray-300">
              <tr>
                <th className="text-left p-3 font-semibold">Operation</th>
                <th className="text-left p-3 font-semibold">Simulated with</th>
                <th className="text-left p-3 font-semibold">Real Server Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr>
                <td className="p-3"><span className="text-green-400">Create</span> Add Todo</td>
                <td className="p-3 font-mono text-gray-500">setTimeout(400ms)</td>
                <td className="p-3 font-mono text-blue-300">createTodo(formData)</td>
              </tr>
              <tr>
                <td className="p-3"><span className="text-blue-400">Update</span> Toggle Done</td>
                <td className="p-3 font-mono text-gray-500">setTimeout(200ms)</td>
                <td className="p-3 font-mono text-blue-300">toggleTodo(id)</td>
              </tr>
              <tr>
                <td className="p-3"><span className="text-red-400">Delete</span> Remove</td>
                <td className="p-3 font-mono text-gray-500">setTimeout(200ms)</td>
                <td className="p-3 font-mono text-blue-300">deleteTodo(id)</td>
              </tr>
              <tr>
                <td className="p-3"><span className="text-purple-400">Read</span> Initial Load</td>
                <td className="p-3 font-mono text-gray-500">await getTodos()</td>
                <td className="p-3 font-mono text-blue-300">db.todo.findMany()</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Lesson navigation */}
      <div className="flex justify-between text-sm">
        <Link href="/phase-2/04-server-actions" className="text-gray-500 hover:text-blue-400 transition-colors">
          ← Server Actions
        </Link>
        <Link href="/phase-3" className="text-blue-400 hover:text-blue-300 transition-colors">
          Phase 3 →
        </Link>
      </div>
    </main>
  );
}
