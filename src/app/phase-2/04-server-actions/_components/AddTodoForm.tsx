'use client';
/**
 * AddTodoForm — Client Component
 * File: /phase-2/04-server-actions/_components/AddTodoForm.tsx
 *
 * WHY 'use client'?
 * ─────────────────
 * This component needs:
 *   - useState (to manage the local todo list and input value)
 *   - Event handlers (onChange, onSubmit)
 *   - Simulated async behavior (setTimeout to fake a server round-trip)
 *
 * In a real app with actual Server Actions, this component would:
 *   1. Accept an `action` prop from the parent Server Component
 *   2. Call that action on form submit
 *   3. Use useFormStatus() to track pending state
 *   4. The server action would write to DB and call revalidatePath()
 *
 * WHY IS THIS IN _components/?
 * ──────────────────────────────
 * The underscore prefix (_components) is a Next.js convention for
 * "private" folders — they don't create routes, they just organize files.
 * This keeps the client component close to the page that uses it.
 *
 * THE PATTERN THIS DEMONSTRATES:
 * ────────────────────────────────
 * Real Server Action flow:
 *   form.submit → Server Action runs on server → DB write → revalidatePath()
 *                → Next.js re-fetches page data → React updates the UI
 *
 * This simulation:
 *   form.submit → setTimeout(500ms) → local useState update
 *                → shows the same UX pattern without a real server
 */

import { useState } from "react";

// ─── Type definition ──────────────────────────────────────────────────────────
// Represents a single todo item in our local state.
interface Todo {
  id: number;
  title: string;
  // 'pending' represents the state where a Server Action is processing the item.
  // In a real app, this would be true while await db.todo.create() is running.
  pending: boolean;
}

// ─── AddTodoForm component ────────────────────────────────────────────────────
// Manages the todo list entirely in client-side state.
// Simulates the Server Action round-trip with a 500ms setTimeout.
export function AddTodoForm() {
  // Local state: the list of todos displayed in this demo
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, title: "Learn Server Components", pending: false },
    { id: 2, title: "Understand fetch() caching", pending: false },
    { id: 3, title: "Practice Server Actions", pending: false },
  ]);

  // The current value of the text input
  const [inputValue, setInputValue] = useState("");

  // Whether the "add" operation is in progress (simulates pending Server Action)
  const [isAdding, setIsAdding] = useState(false);

  // ── handleSubmit ────────────────────────────────────────────────────────────
  // Simulates what happens when a Server Action processes a form submission.
  //
  // Real Server Action flow would be:
  //   1. form submits → Server Action fires
  //   2. Server Action writes to DB
  //   3. Server Action calls revalidatePath('/todos')
  //   4. Next.js re-fetches and updates the UI
  //
  // Our simulation:
  //   1. Validate input
  //   2. Show "pending" state (isAdding = true)
  //   3. setTimeout 500ms (mimics server latency)
  //   4. Add to local state
  //   5. Clear input
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); // prevent browser default form navigation

    const title = inputValue.trim();
    if (!title) return; // Server Action would also validate this

    setIsAdding(true); // start "pending" state — button shows "Adding..."

    // Simulate the ~500ms round-trip of a real Server Action:
    //   browser → server (POST) → DB write → revalidatePath → response → re-render
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Add the new todo to local state (replaces: revalidatePath + server re-fetch)
    setTodos((prev) => [
      ...prev,
      {
        id: Date.now(), // use timestamp as a simple unique ID
        title,
        pending: false,
      },
    ]);

    // Reset form state
    setInputValue("");
    setIsAdding(false);
  }

  // ── handleDelete ─────────────────────────────────────────────────────────────
  // Simulates a Server Action for deletion.
  // Real: async function deleteTodo(id) { 'use server'; await db.todo.delete() }
  function handleDelete(id: number) {
    // Mark as pending first to show "deleting" UX
    setTodos((prev) =>
      prev.map((todo) => (todo.id === id ? { ...todo, pending: true } : todo))
    );

    // Simulate server round-trip (200ms for delete — usually faster than create)
    setTimeout(() => {
      setTodos((prev) => prev.filter((todo) => todo.id !== id));
    }, 200);
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/2 p-5">
      {/* Component label */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs font-mono bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded">
          &apos;use client&apos;
        </span>
        <span className="text-xs text-gray-500">AddTodoForm.tsx</span>
      </div>

      {/* Add todo form */}
      {/*
       * In a real app, this <form> would use:
       *   <form action={addTodoServerAction}>
       * where addTodoServerAction is a 'use server' function imported from actions.ts
       *
       * We use onSubmit here because we're simulating with setTimeout (no real server).
       */}
      <form onSubmit={handleSubmit} className="flex gap-2 mb-5">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Add a new todo..."
          disabled={isAdding}
          className="flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 disabled:opacity-50"
        />
        {/*
         * This button mimics useFormStatus behavior.
         * In a real form with Server Actions:
         *   - Move this button to a <SubmitButton> Client Component
         *   - Use const { pending } = useFormStatus() inside that component
         *   - pending automatically becomes true while the Server Action runs
         *
         * Here we manually manage isAdding to simulate the same UX.
         */}
        <button
          type="submit"
          disabled={isAdding || !inputValue.trim()}
          className="rounded-lg border border-blue-500/40 bg-blue-500/10 text-blue-400 px-4 py-2 text-sm font-medium hover:bg-blue-500/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {/* Show "Adding..." while the simulated Server Action is "running" */}
          {isAdding ? "Adding..." : "Add Todo"}
        </button>
      </form>

      {/* Todo list */}
      <div className="space-y-2">
        {todos.length === 0 && (
          <p className="text-sm text-gray-600 text-center py-4">
            No todos yet. Add one above!
          </p>
        )}
        {todos.map((todo) => (
          <div
            key={todo.id}
            className={`flex items-center justify-between rounded-lg border border-white/10 bg-black/20 px-3 py-2.5 transition-opacity ${
              todo.pending ? "opacity-40" : "opacity-100"
            }`}
          >
            <div className="flex items-center gap-2">
              {/* Pending spinner — shown when delete is "processing" */}
              {todo.pending ? (
                <span className="text-xs text-gray-600 font-mono">...</span>
              ) : (
                <span className="text-xs text-gray-600">✓</span>
              )}
              <span className="text-sm text-gray-300">{todo.title}</span>
            </div>

            {/* Delete button — simulates deleteTodo Server Action */}
            <button
              onClick={() => handleDelete(todo.id)}
              disabled={todo.pending}
              className="text-xs text-gray-600 hover:text-red-400 transition-colors disabled:cursor-not-allowed px-1"
              aria-label={`Delete todo: ${todo.title}`}
            >
              delete
            </button>
          </div>
        ))}
      </div>

      {/* Status info */}
      <p className="text-xs text-gray-600 mt-4 pt-3 border-t border-white/5">
        {isAdding
          ? "⏳ Simulating Server Action... (500ms round-trip)"
          : `${todos.length} todo${todos.length !== 1 ? "s" : ""}. Add or delete items above.`}
      </p>

      {/* Pattern note */}
      <div className="mt-3 rounded-lg border border-white/5 bg-black/20 p-3">
        <p className="text-xs text-gray-600">
          <span className="text-gray-400">Real app pattern:</span>{" "}
          Replace <code className="text-blue-400">onSubmit + setTimeout</code> with{" "}
          <code className="text-blue-400">form action=&#123;addTodoAction&#125;</code> where{" "}
          <code className="text-blue-400">addTodoAction</code> is a{" "}
          <code className="text-blue-400">&apos;use server&apos;</code> function that writes to your DB.
        </p>
      </div>
    </div>
  );
}
