/**
 * Lesson 01 — React Server Components (RSC)
 * Route: /phase-1/01-server-components
 *
 * WHAT ARE SERVER COMPONENTS?
 * ────────────────────────────
 * React Server Components (RSC) run ONLY on the server.
 * They are NEVER sent to the browser as JavaScript.
 * The browser receives only the rendered HTML.
 *
 * THIS IS REVOLUTIONARY because:
 * - You can write async/await directly in JSX (no useEffect needed for data)
 * - You can access databases, file systems, secrets directly
 * - Zero JS bundle impact — the component code never reaches the client
 * - Sensitive data (API keys, DB queries) stays on the server
 *
 * ANALOGY FOR ANDROID DEVS:
 * ──────────────────────────
 * Think of Server Components like your ViewModel fetching data from a Repository —
 * the data fetching logic runs "behind the scenes" and only the result (UI state)
 * reaches the View. Except here, even the rendering happens server-side.
 *
 * RULES:
 * ──────
 * 1. No useState, useReducer, useContext (client-only React)
 * 2. No useEffect, useLayoutEffect
 * 3. No browser APIs (window, document, navigator)
 * 4. No event handlers (onClick, onChange, etc.)
 * 5. Props passed to Client Components must be serializable (JSON-safe)
 *    — no functions, no class instances, no Date objects
 *
 * HOW TO IDENTIFY AN RSC:
 * ─────────────────────────
 * No 'use client' at the top = Server Component (the default).
 */

import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "01 — React Server Components" };

// ─── Simulated data fetch ─────────────────────────────────────────────────────
// In a real app, replace this with a DB query (Prisma, Drizzle, Supabase, etc.)
// or an external API call.
//
// The key point: this runs on the SERVER. The browser never sees this code.
// You could safely use process.env.DATABASE_URL here.
async function getUsers(): Promise<{ id: number; name: string; role: string }[]> {
  // Simulate a 200ms database query delay.
  await new Promise((resolve) => setTimeout(resolve, 200));

  return [
    { id: 1, name: "Alice Johnson", role: "Admin" },
    { id: 2, name: "Bob Smith", role: "Editor" },
    { id: 3, name: "Carol White", role: "Viewer" },
  ];
}

// ─── Server Component that fetches data ──────────────────────────────────────
// Notice: the function is `async`. This is ONLY possible in Server Components.
// Client Components cannot be async.
async function UserList() {
  // Direct await — no useEffect, no useState, no loading state management.
  // Next.js handles streaming/suspense automatically.
  const users = await getUsers();

  return (
    <div className="space-y-2">
      {users.map((user) => (
        <div key={user.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/2 p-3">
          <div>
            <p className="text-sm font-medium text-white">{user.name}</p>
            <p className="text-xs text-gray-500">ID: {user.id}</p>
          </div>
          <span className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full">
            {user.role}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Code examples ────────────────────────────────────────────────────────────
const CODE_EXAMPLES = [
  {
    title: "✅ Valid Server Component — async data fetch",
    code: `// No 'use client' = Server Component by default
// Can be async — fetch runs on the server

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // ✅ Direct database query — totally fine in RSC
  // This code NEVER reaches the browser's JS bundle
  const product = await db.product.findUnique({ where: { id } });

  if (!product) notFound();

  return <h1>{product.name}</h1>;
}`,
    color: "border-green-500/20 bg-green-500/5",
  },
  {
    title: "❌ Invalid — hooks in a Server Component",
    code: `// WRONG — Server Components cannot use React hooks
// This will crash at build time

export default function Counter() {
  // ❌ Error: useState is not available in Server Components
  const [count, setCount] = useState(0);

  // ❌ Error: useEffect is not available in Server Components
  useEffect(() => {
    document.title = \`Count: \${count}\`;
  }, [count]);

  return <button>{count}</button>;
  // Fix: add 'use client' at the top of this file
}`,
    color: "border-red-500/20 bg-red-500/5",
  },
  {
    title: "✅ Correct — move interactivity to Client Component",
    code: `// server-page.tsx (Server Component)
// Fetches data on the server, passes to client widget
import { CounterWidget } from './CounterWidget'; // 'use client' inside

export default async function ServerPage() {
  const initialCount = await db.counter.get(); // ✅ server-only

  // ✅ Pass serializable data (number) to Client Component
  return <CounterWidget initialCount={initialCount} />;
}

// CounterWidget.tsx
'use client'; // ← makes THIS file a Client Component

export function CounterWidget({ initialCount }: { initialCount: number }) {
  const [count, setCount] = useState(initialCount); // ✅ hooks work here
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}`,
    color: "border-green-500/20 bg-green-500/5",
  },
];

function CodeBlock({ code, title, color }: { code: string; title: string; color: string }) {
  return (
    <div className={`rounded-xl border p-4 ${color}`}>
      <p className="text-xs font-semibold text-gray-400 mb-3">{title}</p>
      <pre className="text-xs text-gray-300 font-mono leading-relaxed overflow-x-auto">{code}</pre>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function ServerComponentsPage() {
  return (
    <main className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto">
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-400">Home</Link>
        <span className="mx-2">›</span>
        <Link href="/phase-1" className="hover:text-blue-400">Phase 1</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-300">Server Components</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">React Server Components</h1>
        <p className="text-gray-400">Components that run only on the server — async by nature, zero client JS.</p>
      </header>

      {/* Live demo */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-white mb-2">Live Demo — Async Data Fetch in RSC</h2>
        <p className="text-sm text-gray-400 mb-4">
          The user list below was fetched using <code className="text-blue-300">async/await</code> directly
          inside a Server Component. No useEffect, no loading state, no client JS.
        </p>
        {/* UserList is itself an async Server Component — composed here */}
        <UserList />
        <p className="text-xs text-gray-600 mt-2 italic">
          * In a real app, replace getUsers() with a Prisma/Supabase query.
        </p>
      </section>

      {/* Rules */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-white mb-4">What RSCs Can and Cannot Do</h2>
        <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
            <p className="text-xs font-semibold text-green-400 mb-2 uppercase">Can do ✓</p>
            {["async/await in render", "DB queries (Prisma, Drizzle)", "File system access (fs)", "Read env secrets", "Import server-only packages", "Fetch with no CORS issues"].map((item) => (
              <p key={item} className="text-xs text-gray-400 flex gap-1"><span className="text-green-500">✓</span>{item}</p>
            ))}
          </div>
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
            <p className="text-xs font-semibold text-red-400 mb-2 uppercase">Cannot do ✗</p>
            {["useState / useReducer", "useEffect / useLayoutEffect", "onClick / onChange handlers", "window / document / localStorage", "useContext (client context)", "Be wrapped in Suspense manually"].map((item) => (
              <p key={item} className="text-xs text-gray-400 flex gap-1"><span className="text-red-500">✗</span>{item}</p>
            ))}
          </div>
        </div>
      </section>

      {/* Code examples */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-white mb-4">Code Examples</h2>
        <div className="space-y-4">
          {CODE_EXAMPLES.map((ex) => (
            <CodeBlock key={ex.title} {...ex} />
          ))}
        </div>
      </section>

      <div className="flex justify-between text-sm">
        <Link href="/phase-1" className="text-gray-500 hover:text-blue-400">← Phase 1</Link>
        <Link href="/phase-1/02-client-components" className="text-blue-400 hover:text-blue-300">Next: Client Components →</Link>
      </div>
    </main>
  );
}
