'use client';
/**
 * TodoList — Client Component
 * File: /phase-2/mini-project/_components/TodoList.tsx
 *
 * WHY 'use client'?
 * ─────────────────
 * This component manages the full CRUD interaction for todos:
 *   - useState for managing the local todo array
 *   - Event handlers for add, toggle, and delete actions
 *   - Real-time UI updates (checking/unchecking, optimistic deletes)
 *
 * These capabilities require the Client Component model.
 *
 * THE ARCHITECTURE PATTERN:
 * ──────────────────────────
 * 1. Server Component (mini-project/page.tsx):
 *    - Runs async on the server
 *    - Fetches initial todo data
 *    - Renders static layout (title, breadcrumb, nav)
 *    - Passes initialTodos as props to this component
 *
 * 2. This Client Component (TodoList.tsx):
 *    - Receives initialTodos as props (serializable — JSON-safe array)
 *    - Takes over from there: manages state for add/toggle/delete
 *    - Ships as JavaScript to the browser
 *    - Handles all interactive behavior
 *
 * In a production app:
 *   - Add/toggle/delete would call Server Actions (not just local state)
 *   - Server Actions would write to DB + call revalidatePath()
 *   - The page would re-fetch fresh data from the server
 *
 * WHAT IS "initialTodos"?
 * ────────────────────────
 * The server fetches the todo list and passes it as a prop.
 * This is a common RSC pattern:
 *   Server Component: const todos = await db.todo.findMany()
 *   → pass as: <TodoList initialTodos={todos} />
 *
 * The Client Component then "owns" the local state for interactivity,
 * initialized from the server-fetched data.
 */

import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
// The shape of a single todo item.
// 'done' tracks completion state. 'pending' tracks in-progress mutations.
export interface TodoItem {
  id: number;
  title: string;
  done: boolean;
  /** True while a simulated mutation (toggle/delete) is in progress */
  pending?: boolean;
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface TodoListProps {
  /** Initial todo data loaded on the server and passed down as props */
  initialTodos: TodoItem[];
}

// ─── TodoList component ───────────────────────────────────────────────────────
export function TodoList({ initialTodos }: TodoListProps) {
  // Initialize local state from server-fetched data.
  // After this, the client "owns" the todo array for interactivity.
  const [todos, setTodos] = useState<TodoItem[]>(initialTodos);

  // Input field state for the "add new todo" form
  const [newTitle, setNewTitle] = useState("");

  // Whether a new todo is being added (simulates Server Action pending state)
  const [isAdding, setIsAdding] = useState(false);

  // ── handleAdd ──────────────────────────────────────────────────────────────
  // Simulates the full Server Action flow for creating a todo:
  //   validate → show pending → (server: db.create + revalidatePath) → update UI
  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();

    const title = newTitle.trim();
    if (!title) return;

    setIsAdding(true);

    // Simulate server round-trip (Server Action writing to DB)
    await new Promise((r) => setTimeout(r, 400));

    setTodos((prev) => [
      ...prev,
      { id: Date.now(), title, done: false, pending: false },
    ]);
    setNewTitle("");
    setIsAdding(false);
  }

  // ── handleToggle ──────────────────────────────────────────────────────────
  // Simulates toggling a todo's done state via Server Action.
  // Shows optimistic UI: mark as pending immediately, then update after "server" call.
  function handleToggle(id: number) {
    // Immediately show as pending (optimistic — fast feedback)
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, pending: true } : t))
    );

    // Simulate Server Action: toggle in DB, then revalidate
    setTimeout(() => {
      setTodos((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, done: !t.done, pending: false } : t
        )
      );
    }, 200);
  }

  // ── handleDelete ──────────────────────────────────────────────────────────
  // Simulates deleting a todo via Server Action.
  // Marks as pending first, then removes after "server" confirms.
  function handleDelete(id: number) {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, pending: true } : t))
    );

    setTimeout(() => {
      setTodos((prev) => prev.filter((t) => t.id !== id));
    }, 200);
  }

  // ── Derived stats ─────────────────────────────────────────────────────────
  const doneCount = todos.filter((t) => t.done).length;
  const totalCount = todos.length;
  const progressPercent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* Progress bar */}
      <div className="rounded-xl border border-white/10 bg-white/2 p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-400">
            {doneCount} of {totalCount} completed
          </span>
          <span className="text-xs font-mono text-blue-400">{progressPercent}%</span>
        </div>
        {/* Progress bar track */}
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          {/* Progress bar fill — width driven by completion percentage */}
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Add todo form */}
      {/*
       * In a real app:
       *   <form action={createTodoAction}>
       *     <input name="title" />
       *     <SubmitButton />  ← uses useFormStatus() for pending state
       *   </form>
       *
       * We use onSubmit + isAdding state to simulate the same behavior.
       */}
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Add a new todo..."
          disabled={isAdding}
          className="flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isAdding || !newTitle.trim()}
          className="rounded-lg border border-blue-500/40 bg-blue-500/10 text-blue-400 px-4 py-2 text-sm font-medium hover:bg-blue-500/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          {isAdding ? "Adding..." : "Add"}
        </button>
      </form>

      {/* Todo list */}
      <div className="space-y-2">
        {todos.length === 0 && (
          <div className="rounded-xl border border-white/5 bg-white/2 p-6 text-center">
            <p className="text-sm text-gray-600">All done! Add more todos above.</p>
          </div>
        )}

        {todos.map((todo) => (
          <div
            key={todo.id}
            className={`group flex items-center gap-3 rounded-lg border border-white/10 bg-black/20 px-4 py-3 transition-all duration-200 ${
              todo.pending ? "opacity-40" : "hover:border-white/20"
            }`}
          >
            {/*
             * Checkbox for toggling done state.
             * In a real app: onChange would call a Server Action.
             * Here: calls handleToggle() which updates local state.
             */}
            <button
              onClick={() => !todo.pending && handleToggle(todo.id)}
              disabled={todo.pending}
              className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                todo.done
                  ? "bg-blue-500 border-blue-500 text-white"
                  : "border-white/30 hover:border-blue-400"
              }`}
              aria-label={todo.done ? `Mark "${todo.title}" as not done` : `Mark "${todo.title}" as done`}
            >
              {todo.done && (
                <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>

            {/* Todo title — strikethrough when done */}
            <span
              className={`flex-1 text-sm transition-colors ${
                todo.done ? "line-through text-gray-600" : "text-gray-300"
              }`}
            >
              {todo.title}
            </span>

            {/* Delete button — hidden by default, shown on hover */}
            <button
              onClick={() => !todo.pending && handleDelete(todo.id)}
              disabled={todo.pending}
              className="text-xs text-gray-700 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 disabled:cursor-not-allowed"
              aria-label={`Delete "${todo.title}"`}
            >
              {todo.pending ? "..." : "delete"}
            </button>
          </div>
        ))}
      </div>

      {/* Hint about real implementation */}
      <div className="rounded-lg border border-white/5 bg-black/20 p-3">
        <p className="text-xs text-gray-600">
          <span className="text-gray-400">Real app:</span>{" "}
          Each mutation (add/toggle/delete) would call a{" "}
          <code className="text-blue-400 text-xs">&apos;use server&apos;</code> action →
          write to DB → <code className="text-blue-400 text-xs">revalidatePath()</code> →
          Next.js re-fetches fresh data from server.
        </p>
      </div>
    </div>
  );
}
