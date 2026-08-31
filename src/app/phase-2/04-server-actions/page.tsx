/**
 * Lesson 04 — Server Actions
 * Route: /phase-2/04-server-actions
 *
 * WHAT ARE SERVER ACTIONS?
 * ─────────────────────────
 * Server Actions are async functions that run on the server
 * but can be called from the client (form submissions, button clicks).
 *
 * Before Server Actions existed, you needed:
 *   1. An API route (app/api/todos/route.ts) to handle the mutation
 *   2. A client-side fetch() or axios call to that route
 *   3. Manual state management after the response
 *
 * With Server Actions:
 *   1. Define the function with 'use server' directive
 *   2. Pass it to a <form action={myAction}> or call it directly
 *   3. Next.js handles the network call automatically
 *
 * HOW THEY WORK UNDER THE HOOD:
 * ──────────────────────────────
 * When you mark a function with 'use server', Next.js:
 *   1. Extracts the function into a server endpoint
 *   2. Generates a unique ID for it
 *   3. When the form submits, sends a POST request to that endpoint
 *   4. Runs the function on the server
 *   5. Returns the result (or triggers revalidation)
 *
 * No manual API routes. No fetch() boilerplate. Clean.
 *
 * THREE WAYS TO DEFINE SERVER ACTIONS:
 * ───────────────────────────────────────
 * 1. Inline in a Server Component — add 'use server' inside the function body
 * 2. In a separate file — add 'use server' at the top of the file
 * 3. Passed as prop to a Client Component — define server-side, use client-side
 *
 * THIS PAGE IS A SERVER COMPONENT.
 * The interactive demo (AddTodoForm) lives in ./_components/AddTodoForm.tsx
 * because it needs useState. It is imported here and rendered as a child.
 *
 * ANALOGY FOR ANDROID DEVS:
 * ───────────────────────────
 * Server Actions are like Retrofit interface methods but without the interface.
 * You define what needs to happen on the server, and the framework
 * handles the HTTP transport layer for you.
 *
 * useFormStatus is like LiveData<LoadingState> — it tracks the pending state
 * of the enclosing form submission automatically.
 */

import Link from "next/link";
import type { Metadata } from "next";
import { AddTodoForm } from "./_components/AddTodoForm";

export const metadata: Metadata = {
  title: "04 — Server Actions",
};

// ─── Code pattern examples ────────────────────────────────────────────────────
// These are displayed as formatted code blocks for learning.
const CODE_PATTERNS = [
  {
    id: "inline-server-action",
    title: "Pattern 1 — Inline Server Action in a Server Component",
    description:
      "Define the action directly inside the Server Component. The 'use server' directive goes INSIDE the function body.",
    borderColor: "border-blue-500/20",
    bgColor: "bg-blue-500/5",
    code: `// app/todos/page.tsx — Server Component
export default function TodoPage() {
  // ✅ 'use server' inside the function body marks it as a Server Action
  // This function runs on the server when the form is submitted
  async function addTodo(formData: FormData) {
    'use server';
    // Everything here runs on the server!
    const title = formData.get('title') as string;
    await db.todo.create({ data: { title } });
    revalidatePath('/todos'); // ← refresh the page data
  }

  return (
    // ✅ Pass the server action directly to the form's action prop
    // No onClick, no fetch(), no API route needed
    <form action={addTodo}>
      <input name="title" placeholder="New todo..." />
      <button type="submit">Add</button>
    </form>
  );
}`,
  },
  {
    id: "separate-file",
    title: "Pattern 2 — Separate actions file",
    description:
      "For reusable actions or large codebases, define actions in a dedicated file with 'use server' at the top. All exports become Server Actions.",
    borderColor: "border-purple-500/20",
    bgColor: "bg-purple-500/5",
    code: `// app/actions.ts — dedicated server actions file
'use server'; // ← at the top: ALL exports are Server Actions

import { revalidatePath } from 'next/cache';

// This function is automatically a Server Action
export async function addTodo(formData: FormData) {
  const title = formData.get('title') as string;
  if (!title?.trim()) return { error: 'Title is required' };

  await db.todo.create({ data: { title, done: false } });
  revalidatePath('/todos');
  return { success: true };
}

export async function toggleTodo(id: string) {
  const todo = await db.todo.findUnique({ where: { id } });
  await db.todo.update({
    where: { id },
    data: { done: !todo?.done },
  });
  revalidatePath('/todos');
}

export async function deleteTodo(id: string) {
  await db.todo.delete({ where: { id } });
  revalidatePath('/todos');
}`,
  },
  {
    id: "use-form-status",
    title: "Pattern 3 — useFormStatus for pending state",
    description:
      "useFormStatus() gives you the pending state of the nearest enclosing form. It must be used inside a component that is a child of the form.",
    borderColor: "border-green-500/20",
    bgColor: "bg-green-500/5",
    code: `// _components/SubmitButton.tsx
'use client'; // ← useFormStatus is a client-side hook

import { useFormStatus } from 'react-dom';

// This component MUST be a child of the <form> that calls a Server Action
// It cannot be the form itself — must be a child component
export function SubmitButton() {
  const { pending } = useFormStatus(); // ← reads form state from React context

  return (
    <button
      type="submit"
      disabled={pending}  // ← automatically disabled while server action runs
      className={pending ? 'opacity-50 cursor-not-allowed' : ''}
    >
      {pending ? 'Adding...' : 'Add Todo'}
    </button>
  );
}

// Usage in a form:
// <form action={addTodo}>
//   <input name="title" />
//   <SubmitButton />   ← useFormStatus works here because it's inside the form
// </form>`,
  },
  {
    id: "mutation-revalidate",
    title: "Pattern 4 — Mutation + revalidation (the complete flow)",
    description:
      "The typical Server Action flow: validate input → write to DB → revalidate the affected paths → Next.js re-fetches fresh data.",
    borderColor: "border-orange-500/20",
    bgColor: "bg-orange-500/5",
    code: `// Complete Server Action with validation, DB write, and cache invalidation
'use server';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function createProduct(formData: FormData) {
  // Step 1: Extract and validate input
  const name = formData.get('name') as string;
  const price = Number(formData.get('price'));

  if (!name?.trim()) return { error: 'Name is required' };
  if (isNaN(price) || price <= 0) return { error: 'Price must be positive' };

  // Step 2: Write to database
  const product = await db.product.create({
    data: { name: name.trim(), price },
  });

  // Step 3: Invalidate all pages that show product data
  revalidatePath('/products');              // ← listing page
  revalidatePath(\`/products/\${product.id}\`); // ← detail page
  revalidateTag('product-list');            // ← any fetch tagged 'product-list'

  // Step 4: Return result (optional — for client-side feedback)
  return { success: true, product };
}`,
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
// This is a Server Component — no 'use client' at the top.
// The interactive AddTodoForm is imported from _components/ where it's marked 'use client'.
export default function ServerActionsPage() {
  return (
    <main className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto">

      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
        <span className="mx-2">›</span>
        <Link href="/phase-2" className="hover:text-blue-400 transition-colors">Phase 2</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-300">Server Actions</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Server Actions</h1>
        <p className="text-gray-400">
          Run server-side code from forms and buttons — no API routes needed.
          Define with <code className="text-blue-300 bg-white/10 px-1 rounded">&apos;use server&apos;</code>,
          pass to <code className="text-blue-300 bg-white/10 px-1 rounded">form action=&#123;&#125;</code>.
        </p>
      </header>

      {/* Before vs After comparison */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-white mb-4">Before vs After Server Actions</h2>
        <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
            <p className="text-xs font-semibold text-red-400 mb-3 uppercase">Before (3 files)</p>
            <div className="space-y-1.5 text-xs text-gray-400">
              <p>1. <code className="text-gray-300">app/api/todos/route.ts</code></p>
              <p className="pl-3 text-gray-600">→ export POST handler</p>
              <p>2. <code className="text-gray-300">lib/api.ts</code></p>
              <p className="pl-3 text-gray-600">→ fetch(&apos;/api/todos&apos;, &#123; method: &apos;POST&apos; &#125;)</p>
              <p>3. <code className="text-gray-300">components/Form.tsx</code></p>
              <p className="pl-3 text-gray-600">→ useState + handleSubmit + loading</p>
            </div>
          </div>
          <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
            <p className="text-xs font-semibold text-green-400 mb-3 uppercase">After (1 function)</p>
            <div className="space-y-1.5 text-xs text-gray-400">
              <p>1. <code className="text-gray-300">app/actions.ts</code></p>
              <p className="pl-3 text-gray-600">→ &apos;use server&apos; + async function</p>
              <p className="text-gray-600 mt-2 pt-2 border-t border-white/5">
                No API route needed. Next.js generates the endpoint automatically.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Live interactive demo */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-white mb-2">Live Demo — Todo Form</h2>
        <p className="text-sm text-gray-400 mb-4">
          The form below is a{" "}
          <code className="text-blue-300 bg-white/10 px-1 rounded">&apos;use client&apos;</code>{" "}
          component (
          <code className="text-gray-300 text-xs">_components/AddTodoForm.tsx</code>
          ) that simulates the Server Action pattern with local state.
          In a real app, the submit handler would call a{" "}
          <code className="text-blue-300 bg-white/10 px-1 rounded">&apos;use server&apos;</code> action.
        </p>
        {/*
         * AddTodoForm is a Client Component imported from _components/.
         * This Server Component page simply renders it here.
         * The 'use client' boundary lives inside AddTodoForm.tsx.
         */}
        <AddTodoForm />
      </section>

      {/* Code patterns */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-white mb-4">Code Patterns</h2>
        <div className="space-y-4">
          {CODE_PATTERNS.map((pattern) => (
            <div key={pattern.id} className={`rounded-xl border p-5 ${pattern.borderColor} ${pattern.bgColor}`}>
              <h3 className="text-sm font-semibold text-white mb-1">{pattern.title}</h3>
              <p className="text-xs text-gray-400 mb-3">{pattern.description}</p>
              <div className="rounded-lg border border-white/10 bg-black/40 p-3">
                <pre className="text-xs text-gray-300 font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap">
                  {pattern.code}
                </pre>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Key rules summary */}
      <section className="mb-10 rounded-xl border border-white/10 bg-black/20 p-5">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Key Rules</h2>
        <div className="space-y-2 text-xs text-gray-400">
          <p><span className="text-blue-400">1.</span> Server Actions must be <code className="text-blue-300">async</code> functions</p>
          <p><span className="text-blue-400">2.</span> Mark with <code className="text-blue-300">&apos;use server&apos;</code> — either inside the function body or at the top of a dedicated file</p>
          <p><span className="text-blue-400">3.</span> Can only be defined in Server Components or separate &apos;use server&apos; files</p>
          <p><span className="text-blue-400">4.</span> Can be passed as props to Client Components (functions are serializable as references)</p>
          <p><span className="text-blue-400">5.</span> Form input is passed as <code className="text-blue-300">FormData</code> — use <code className="text-blue-300">formData.get(&apos;fieldName&apos;)</code></p>
          <p><span className="text-blue-400">6.</span> Always call <code className="text-blue-300">revalidatePath()</code> or <code className="text-blue-300">revalidateTag()</code> after mutations</p>
          <p><span className="text-blue-400">7.</span> <code className="text-blue-300">useFormStatus()</code> must be in a <em>child</em> of the form, not the form itself</p>
        </div>
      </section>

      {/* Lesson navigation */}
      <div className="flex justify-between text-sm">
        <Link href="/phase-2/03-parallel-sequential" className="text-gray-500 hover:text-blue-400 transition-colors">
          ← Parallel
        </Link>
        <Link href="/phase-2/mini-project" className="text-blue-400 hover:text-blue-300 transition-colors">
          Mini Project →
        </Link>
      </div>
    </main>
  );
}
