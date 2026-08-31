/**
 * Lesson 02 — Client Components
 * Route: /phase-1/02-client-components
 *
 * HOW TO CREATE A CLIENT COMPONENT:
 * ────────────────────────────────────
 * Add 'use client' as the VERY FIRST LINE of the file (before imports).
 * This tells Next.js: "this module and everything it imports client-side."
 *
 * IMPORTANT: 'use client' marks a BOUNDARY in the component tree.
 * - Everything ABOVE the boundary: Server
 * - This file and everything it imports: Client
 *
 * 'use client' is NOT needed in every client component — only in the
 * topmost component that needs client features. Its children inherit
 * the client context automatically.
 *
 * WHEN DO YOU NEED 'use client'?
 * ────────────────────────────────
 * ✓ useState, useReducer (local state)
 * ✓ useEffect, useLayoutEffect (side effects)
 * ✓ onClick, onChange, onSubmit (event handlers)
 * ✓ window, document, localStorage, navigator (browser APIs)
 * ✓ useRef for DOM manipulation
 * ✓ Context consumers (useContext)
 * ✓ Third-party libs that use browser APIs internally (e.g., react-map-gl)
 *
 * WHEN DON'T YOU NEED IT?
 * ────────────────────────
 * ✗ A component that just renders props (pure display)
 * ✗ A component that calls async functions
 * ✗ Any component that doesn't need interactivity
 * → Keep as Server Component for better performance!
 */

// ── 'use client' must be the first line — before ALL imports ──────────────────
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
// Note: Metadata export is NOT allowed in Client Components.
// It must be in a Server Component (layout.tsx or page.tsx without 'use client').

// ─── Demo 1: useState counter ─────────────────────────────────────────────────
// The simplest client component — tracks local state.
function Counter() {
  // useState works because this is a Client Component.
  const [count, setCount] = useState(0);

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={() => setCount((c) => c - 1)}
        className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold transition-colors"
        aria-label="Decrease count"
      >
        −
      </button>
      <span className="text-2xl font-bold text-white w-8 text-center">{count}</span>
      <button
        onClick={() => setCount((c) => c + 1)}
        className="w-8 h-8 rounded-lg bg-blue-500 hover:bg-blue-400 text-white font-bold transition-colors"
        aria-label="Increase count"
      >
        +
      </button>
      <button
        onClick={() => setCount(0)}
        className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
      >
        Reset
      </button>
    </div>
  );
}

// ─── Demo 2: useEffect + browser API ─────────────────────────────────────────
// Shows current window width — only possible client-side.
function WindowSizeDisplay() {
  // Initialize with undefined because window doesn't exist on the server.
  // On the server, this component renders null / placeholder.
  const [width, setWidth] = useState<number | undefined>(undefined);

  useEffect(() => {
    // This runs only in the browser — never on the server.
    // window is available here.
    setWidth(window.innerWidth);

    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);

    // Cleanup: remove listener when the component unmounts.
    // Without this, you'd get a memory leak.
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty dependency array = run once on mount

  return (
    <div className="rounded-lg border border-white/10 bg-white/2 p-4 text-center">
      <p className="text-xs text-gray-500 mb-1">Window width (browser API)</p>
      <p className="text-2xl font-bold text-blue-400">
        {width !== undefined ? `${width}px` : "Loading..."}
      </p>
      <p className="text-xs text-gray-600 mt-1">Resize the window to see it update</p>
    </div>
  );
}

// ─── Demo 3: useRef for DOM access ────────────────────────────────────────────
// Focus an input element programmatically.
function FocusDemo() {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex gap-3 items-center">
      <input
        ref={inputRef}
        type="text"
        placeholder="Click button to focus me..."
        className="flex-1 bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
      />
      <button
        onClick={() => inputRef.current?.focus()}
        className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white text-sm rounded-lg transition-colors"
      >
        Focus
      </button>
    </div>
  );
}

// ─── Demo 4: Local storage ────────────────────────────────────────────────────
function LocalStorageDemo() {
  const [saved, setSaved] = useState("");
  const [input, setInput] = useState("");

  useEffect(() => {
    // Read from localStorage on mount (client-side only).
    const stored = localStorage.getItem("demo-value") ?? "";
    setSaved(stored);
    setInput(stored);
  }, []);

  const handleSave = () => {
    localStorage.setItem("demo-value", input);
    setSaved(input);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type something..."
          className="flex-1 bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
        />
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm rounded-lg transition-colors"
        >
          Save
        </button>
      </div>
      {saved && (
        <p className="text-xs text-gray-400">
          Saved in localStorage: <code className="text-green-400">{saved}</code>
        </p>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
// This whole file is a Client Component because of 'use client' at the top.
export default function ClientComponentsPage() {
  return (
    <main className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto">
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-400">Home</Link>
        <span className="mx-2">›</span>
        <Link href="/phase-1" className="hover:text-blue-400">Phase 1</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-300">Client Components</span>
      </nav>

      <header className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <code className="text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-2 py-0.5 rounded text-sm font-mono">
            &apos;use client&apos;
          </code>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Client Components</h1>
        <p className="text-gray-400">
          Add <code className="text-yellow-300">&apos;use client&apos;</code> at the top of a file to enable
          React hooks, event handlers, and browser APIs.
        </p>
      </header>

      {/* Demo 1: Counter */}
      <section className="rounded-xl border border-white/10 p-5 mb-4">
        <h2 className="text-sm font-semibold text-white mb-1">Demo 1 — useState Counter</h2>
        <p className="text-xs text-gray-500 mb-4">Local state with increment/decrement buttons.</p>
        <Counter />
      </section>

      {/* Demo 2: Window size */}
      <section className="rounded-xl border border-white/10 p-5 mb-4">
        <h2 className="text-sm font-semibold text-white mb-1">Demo 2 — useEffect + Browser API</h2>
        <p className="text-xs text-gray-500 mb-4">Reads window.innerWidth — only available in the browser.</p>
        <WindowSizeDisplay />
      </section>

      {/* Demo 3: Focus */}
      <section className="rounded-xl border border-white/10 p-5 mb-4">
        <h2 className="text-sm font-semibold text-white mb-1">Demo 3 — useRef DOM Access</h2>
        <p className="text-xs text-gray-500 mb-4">Programmatically focus an input using useRef.</p>
        <FocusDemo />
      </section>

      {/* Demo 4: localStorage */}
      <section className="rounded-xl border border-white/10 p-5 mb-4">
        <h2 className="text-sm font-semibold text-white mb-1">Demo 4 — localStorage</h2>
        <p className="text-xs text-gray-500 mb-4">
          Persists a value across page refreshes using the browser&apos;s localStorage API.
        </p>
        <LocalStorageDemo />
      </section>

      <div className="flex justify-between text-sm mt-8">
        <Link href="/phase-1/01-server-components" className="text-gray-500 hover:text-blue-400">← Server Components</Link>
        <Link href="/phase-1/03-composition-patterns" className="text-blue-400 hover:text-blue-300">Next: Composition Patterns →</Link>
      </div>
    </main>
  );
}
