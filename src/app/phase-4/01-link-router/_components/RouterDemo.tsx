"use client";
/**
 * RouterDemo.tsx
 * Location: /phase-4/01-link-router/_components/RouterDemo.tsx
 *
 * WHY 'use client' HERE?
 * ──────────────────────
 * The hooks used in this file — useRouter, usePathname, and useSearchParams —
 * are CLIENT-ONLY hooks. They rely on browser APIs (the History API, the URL
 * bar) that do not exist on the server.
 *
 * If you try to use them in a Server Component (without 'use client'),
 * you will get a build error:
 *   "useRouter only works in Client Components. Add the 'use client' directive."
 *
 * The pattern used here is: keep the page.tsx as a Server Component
 * (for metadata, SEO, initial HTML), and isolate the interactive/hook-based
 * parts into small Client Components like this one.
 *
 * This pattern is called the "Server Shell + Client Island" pattern.
 * It keeps the page mostly static and SEO-friendly while allowing
 * targeted interactivity where needed.
 *
 * WHAT THIS COMPONENT DEMONSTRATES:
 * ───────────────────────────────────
 * 1. usePathname()     → Read the current URL path (e.g., /phase-4/01-link-router)
 * 2. useRouter()       → Get the router object for programmatic navigation
 * 3. router.push()     → Navigate forward (adds to browser history)
 * 4. router.replace()  → Navigate without adding to history
 * 5. router.back()     → Go back like the browser back button
 * 6. router.refresh()  → Re-fetch server data without losing client state
 */

import { usePathname, useRouter } from "next/navigation";

// ─── RouterDemo Component ─────────────────────────────────────────────────────
// This is a pure Client Component — it uses hooks and handles button clicks.
// It receives no props because all data comes from the hooks themselves.
export default function RouterDemo() {
  // ── usePathname ────────────────────────────────────────────────────────────
  // Returns the current URL pathname as a string.
  // Updates automatically when the route changes (no need to manually sync it).
  // Does NOT include search params (?key=value) or the hash (#section).
  //
  // Example: if the URL is /phase-4/01-link-router?tab=demo
  // usePathname() returns: "/phase-4/01-link-router"
  const pathname = usePathname();

  // ── useRouter ──────────────────────────────────────────────────────────────
  // Returns the router object which has methods for programmatic navigation.
  // Only import from "next/navigation" (NOT "next/router" — that is Pages Router).
  //
  // Methods available:
  //   router.push(href)     — navigate forward, adds entry to browser history
  //   router.replace(href)  — navigate but REPLACE current history entry
  //   router.back()         — go back (same as clicking the browser back button)
  //   router.forward()      — go forward
  //   router.refresh()      — re-run server components on the current page
  //   router.prefetch(href) — manually prefetch a route in advance
  const router = useRouter();

  return (
    <div className="space-y-6">

      {/* ── Section 1: Current Pathname Display ──────────────────────────────
       * Shows the value returned by usePathname() in real time.
       * This is useful for: active link highlighting, breadcrumbs,
       * analytics tracking, conditional rendering based on route.
       */}
      <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">
        <h3 className="text-sm font-semibold text-blue-400 mb-2 uppercase tracking-wider">
          usePathname() — Current Route
        </h3>
        <p className="text-xs text-gray-400 mb-3">
          The hook reads the URL path. It updates automatically when the route changes.
          No useEffect or event listeners needed.
        </p>
        {/* Display the live pathname value */}
        <div className="flex items-center gap-3 rounded-lg bg-black/40 border border-white/10 p-3">
          <span className="text-gray-500 text-xs font-mono">pathname =</span>
          <code className="text-green-400 font-mono text-sm">&quot;{pathname}&quot;</code>
        </div>
      </div>

      {/* ── Section 2: useRouter Buttons ─────────────────────────────────────
       * Demonstrates the three most common router methods.
       * Each button shows: the method name, what it does, and when to use it.
       */}
      <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-5">
        <h3 className="text-sm font-semibold text-purple-400 mb-2 uppercase tracking-wider">
          useRouter() — Programmatic Navigation
        </h3>
        <p className="text-xs text-gray-400 mb-4">
          Use router methods when navigation is triggered by logic (after login, after
          form submit, etc.) rather than a user clicking a link directly.
        </p>

        <div className="space-y-3">

          {/* router.push() */}
          {/*
           * router.push(href) — the most common method.
           * Navigates to the given href AND adds a new entry to the browser history.
           * The user can click the browser Back button to return to this page.
           *
           * WHEN TO USE: After successfully submitting a form, after login,
           * when reacting to a state change that should change the page.
           */}
          <div className="flex items-start gap-4 rounded-lg border border-white/10 bg-black/20 p-3">
            <button
              type="button"
              onClick={() => router.push("/phase-4")}
              className="shrink-0 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 transition-colors"
            >
              router.push()
            </button>
            <div>
              <code className="text-blue-300 font-mono text-xs block mb-1">
                router.push(&apos;/phase-4&apos;)
              </code>
              <p className="text-xs text-gray-400">
                Navigate to /phase-4. Adds to browser history — the Back button still works.
              </p>
            </div>
          </div>

          {/* router.replace() */}
          {/*
           * router.replace(href) — navigate WITHOUT adding to history.
           * The current entry in the browser history is replaced.
           * The user CANNOT go back to the current page with the Back button.
           *
           * WHEN TO USE: After login redirects (so users can&apos;t go "back" to
           * the login page), when updating a URL to reflect filter state without
           * polluting history.
           */}
          <div className="flex items-start gap-4 rounded-lg border border-white/10 bg-black/20 p-3">
            <button
              type="button"
              onClick={() => router.replace("/phase-4")}
              className="shrink-0 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold px-4 py-2 transition-colors"
            >
              router.replace()
            </button>
            <div>
              <code className="text-purple-300 font-mono text-xs block mb-1">
                router.replace(&apos;/phase-4&apos;)
              </code>
              <p className="text-xs text-gray-400">
                Navigate to /phase-4. Replaces history — the Back button skips this page.
              </p>
            </div>
          </div>

          {/* router.back() */}
          {/*
           * router.back() — equivalent to clicking the browser&apos;s Back button.
           * No href needed. Goes to the previous entry in the browser history.
           *
           * WHEN TO USE: Custom Back buttons in UI (e.g., in a modal or slide-over
           * panel that overlays the previous page), cancel buttons in multi-step flows.
           */}
          <div className="flex items-start gap-4 rounded-lg border border-white/10 bg-black/20 p-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="shrink-0 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-xs font-semibold px-4 py-2 transition-colors"
            >
              router.back()
            </button>
            <div>
              <code className="text-gray-300 font-mono text-xs block mb-1">
                router.back()
              </code>
              <p className="text-xs text-gray-400">
                Go back to the previous page. Equivalent to the browser Back button.
              </p>
            </div>
          </div>

          {/* router.refresh() */}
          {/*
           * router.refresh() — re-runs Server Components on the current page.
           * Does NOT do a full browser reload. Client state (useState) is preserved.
           * Useful when you want fresh server data without losing interactive state.
           *
           * WHEN TO USE: After a mutation (e.g., after adding a comment, to refresh
           * the comment list from the server without a full page reload).
           */}
          <div className="flex items-start gap-4 rounded-lg border border-white/10 bg-black/20 p-3">
            <button
              type="button"
              onClick={() => router.refresh()}
              className="shrink-0 rounded-lg bg-cyan-700 hover:bg-cyan-600 text-white text-xs font-semibold px-4 py-2 transition-colors"
            >
              router.refresh()
            </button>
            <div>
              <code className="text-cyan-300 font-mono text-xs block mb-1">
                router.refresh()
              </code>
              <p className="text-xs text-gray-400">
                Re-fetch server data on this page. Client state (hooks) is preserved.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* ── Section 3: Key Reminders ──────────────────────────────────────────
       * A brief summary to reinforce the important rules learners should remember.
       */}
      <div className="rounded-xl border border-white/10 bg-white/2 p-4">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Key Rules to Remember
        </h3>
        <ul className="space-y-2">
          {[
            { icon: "📦", text: "Import from \"next/navigation\", NOT \"next/router\" (that's the old Pages Router)." },
            { icon: "🖥️", text: "useRouter and usePathname only work inside 'use client' components." },
            { icon: "🔗", text: "For regular links, always prefer <Link> over router.push() — it handles prefetching automatically." },
            { icon: "📜", text: "router.push() adds to history (Back works); router.replace() overwrites history (Back skips)." },
            { icon: "🔄", text: "router.refresh() re-runs Server Components only — useState and useRef values are NOT reset." },
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-gray-400">
              <span aria-hidden="true" className="shrink-0">{item.icon}</span>
              <span>{item.text}</span>
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
}
