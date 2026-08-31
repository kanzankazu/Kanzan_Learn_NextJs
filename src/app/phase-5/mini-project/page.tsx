"use client";
/**
 * Mini Project — Live API Demo
 * Route: /phase-5/mini-project
 *
 * WHY 'use client'?
 * ──────────────────
 * This page uses:
 *   1. useState    — to store fetched items + search input value + loading/error state
 *   2. useEffect   — to trigger the fetch when the component mounts or search changes
 *   3. onChange     — to update the search input as the user types
 *
 * All three require a browser environment (client-side React).
 * 'use client' at the top of the file tells Next.js:
 *   "This component runs in the browser — it can use hooks and event handlers."
 *
 * WHAT THIS PAGE DEMONSTRATES:
 * ──────────────────────────────
 * The FULL loop of a Route Handler being consumed by a client component:
 *
 *   1. User types in a search box
 *   2. Component calls fetch('/phase-5/api/items?search=...')
 *   3. The request hits the route handler at app/phase-5/api/items/route.ts
 *   4. The handler filters data and returns JSON
 *   5. Component updates its state with the JSON
 *   6. React re-renders the list with the new items
 *
 * ARCHITECTURE:
 * ──────────────
 * Client Component (this file)
 *   │
 *   │  fetch('/phase-5/api/items?search=...')
 *   ▼
 * Route Handler (app/phase-5/api/items/route.ts)
 *   │  runs on the server
 *   │  filters MOCK_ITEMS
 *   │  returns Response.json({ items, total, count, search })
 *   ▼
 * Component receives JSON → updates state → re-renders UI
 *
 * DEBOUNCING NOTE:
 * ─────────────────
 * We use a small setTimeout (300ms) to debounce the search.
 * Without debouncing, a new fetch would fire on EVERY keystroke.
 * With debouncing, the fetch only fires 300ms after the user STOPS typing.
 * This prevents unnecessary network requests and server load.
 *
 * In a production app, use a library like 'use-debounce' for this.
 * Here we implement it manually with setTimeout/clearTimeout to avoid dependencies.
 */

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────
// These types mirror the response shape from the route handler.
// In a real app, you might share these types via a shared types file.
interface Item {
  id: number;
  name: string;
  category: string;
  price: number;
  inStock: boolean;
}

interface ApiResponse {
  items: Item[];
  total: number;   // how many matched the search (before limit)
  count: number;   // how many items in this response
  search: string;  // the search term that was applied
}

// ─── Category Badge Colors ────────────────────────────────────────────────────
// Map category names to Tailwind color classes for visual variety.
// Object.freeze() prevents accidental mutation (good practice for constants).
const CATEGORY_COLORS = Object.freeze({
  fruit:     "bg-green-500/20 text-green-300 border-green-500/30",
  vegetable: "bg-lime-500/20 text-lime-300 border-lime-500/30",
  dairy:     "bg-blue-500/20 text-blue-300 border-blue-500/30",
  bakery:    "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
} as Record<string, string>);

// Fallback color for unknown categories.
const CATEGORY_COLOR_DEFAULT = "bg-gray-500/20 text-gray-300 border-gray-500/30";

// ─── ItemCard Component ────────────────────────────────────────────────────────
// Renders a single item. Extracted into its own component to keep the page clean.
// This is a regular function component — no hooks, so no 'use client' needed here
// (but it's inside a 'use client' file, so it inherits that directive).
function ItemCard({ item }: { item: Item }) {
  const categoryColor = CATEGORY_COLORS[item.category] ?? CATEGORY_COLOR_DEFAULT;

  return (
    <div className="rounded-xl border border-white/10 bg-white/2 p-4 hover:border-blue-500/30 transition-colors">
      {/* Item name and in-stock badge */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-sm font-semibold text-white">{item.name}</h3>
        <span
          className={`text-xs px-2 py-0.5 rounded-full border shrink-0 ${
            item.inStock
              ? "bg-green-500/20 text-green-300 border-green-500/30"
              : "bg-red-500/20 text-red-300 border-red-500/30"
          }`}
        >
          {/* Use conditional rendering with curly braces to avoid JSX text issues */}
          {item.inStock ? "In Stock" : "Out of Stock"}
        </span>
      </div>

      {/* Category and price row */}
      <div className="flex items-center justify-between">
        <span className={`text-xs px-2 py-0.5 rounded-full border ${categoryColor}`}>
          {item.category}
        </span>
        <span className="text-sm font-mono text-blue-300">
          {/* Format price to always show 2 decimal places: 0.99, 1.00, etc. */}
          ${item.price.toFixed(2)}
        </span>
      </div>

      {/* Item ID — small, subtle, useful for debugging */}
      <p className="text-xs text-gray-600 mt-2">id: {item.id}</p>
    </div>
  );
}

// ─── Page Component ────────────────────────────────────────────────────────────
export default function MiniProjectPage() {
  // ── State ──────────────────────────────────────────────────────────────────
  // What the user has typed in the search box.
  // This updates instantly on each keystroke.
  const [searchInput, setSearchInput] = useState("");

  // The search value we actually send to the API.
  // This is debounced — it only updates 300ms after typing stops.
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // The data returned from the API.
  // null means "we haven't fetched yet or fetch returned no data".
  const [data, setData] = useState<ApiResponse | null>(null);

  // Whether a fetch is currently in progress.
  // Used to show a loading spinner / disable the input.
  const [isLoading, setIsLoading] = useState(false);

  // An error message if the fetch failed.
  // null means no error.
  const [error, setError] = useState<string | null>(null);

  // ── Debounce Effect ────────────────────────────────────────────────────────
  // WHY: Without debouncing, every single keystroke triggers a fetch.
  //      Typing "banana" would fire 6 requests (b, ba, ban, bana, banan, banana).
  //      Debouncing waits until the user stops typing before firing.
  //
  // HOW setTimeout debounce works:
  //   1. On every keystroke, we schedule a timer (300ms)
  //   2. Before scheduling, we CANCEL any pending timer (clearTimeout)
  //   3. Only the LAST timer (after typing stops) actually runs
  //   4. When it runs, it updates debouncedSearch → triggers the fetch effect
  useEffect(() => {
    // Schedule: update debouncedSearch 300ms after the last keystroke
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 300);

    // Cleanup: cancel this timer if the user types again before 300ms
    // This is the "cleanup function" — React calls it before the next run
    return () => clearTimeout(timer);
  }, [searchInput]); // re-run whenever searchInput changes

  // ── Fetch Effect ───────────────────────────────────────────────────────────
  // This effect runs whenever debouncedSearch changes.
  // It calls our route handler at /phase-5/api/items and updates state.
  const fetchItems = useCallback(async (search: string) => {
    // Show loading state
    setIsLoading(true);
    setError(null); // clear any previous error

    try {
      // Build the URL — include search param only if it's not empty.
      // encodeURIComponent() handles special characters (spaces, &, etc.)
      const url = search
        ? `/phase-5/api/items?search=${encodeURIComponent(search)}`
        : "/phase-5/api/items";

      // fetch() is the browser's built-in HTTP client.
      // It returns a Response object — we must call .json() to parse the body.
      const response = await fetch(url);

      // Check if the HTTP status is in the 2xx range.
      // fetch() does NOT throw for 4xx/5xx responses — we must check manually.
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      // Parse the JSON body — this returns the ApiResponse shape.
      const json = (await response.json()) as ApiResponse;
      setData(json);
    } catch (err) {
      // Something went wrong (network error, JSON parse error, etc.)
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      setData(null); // clear stale data
    } finally {
      // Always hide the loading state, whether success or failure.
      // 'finally' runs after try OR catch — guaranteed.
      setIsLoading(false);
    }
  }, []); // empty dep array: this function never changes

  // Trigger the actual fetch whenever the debounced search value changes.
  // This runs once on mount (debouncedSearch starts as "") → initial load.
  // Then runs again whenever the user stops typing.
  useEffect(() => {
    void fetchItems(debouncedSearch);
  }, [debouncedSearch, fetchItems]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto">

      {/* ── Breadcrumb ───────────────────────────────────────────────────────── */}
      <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
        <span className="mx-2" aria-hidden="true">›</span>
        <Link href="/phase-5" className="hover:text-blue-400 transition-colors">Phase 5</Link>
        <span className="mx-2" aria-hidden="true">›</span>
        <span className="text-gray-300">Mini Project</span>
      </nav>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl" aria-hidden="true">⚡</span>
          <h1 className="text-3xl font-bold text-white">Mini Project — Live API Demo</h1>
        </div>
        <p className="text-gray-400 leading-relaxed max-w-2xl">
          This page fetches from the real{" "}
          <code className="text-blue-300 font-mono">/phase-5/api/items</code> route handler
          created in this phase. Type in the search box to filter results in real time.
        </p>
      </header>

      {/* ── Architecture Explanation ─────────────────────────────────────────── */}
      {/*
       * Show learners how this page connects to the route handler.
       * Making the architecture visible is a key teaching moment.
       */}
      <section
        className="mb-8 rounded-xl border border-blue-500/20 bg-blue-500/5 p-5"
        aria-label="Architecture explanation"
      >
        <h2 className="text-sm font-semibold text-blue-300 mb-3">
          🔗 How this page connects to the route handler
        </h2>
        <pre className="font-mono text-xs text-gray-400 leading-loose overflow-x-auto">
{`Client Component (this file)
  │
  │  fetch('/phase-5/api/items?search=...')
  │  ← runs in the BROWSER (window.fetch)
  ▼
Route Handler (phase-5/api/items/route.ts)
  │  ← runs on the NEXT.JS SERVER
  │  filters MOCK_ITEMS array
  │  returns NextResponse.json({ items, total, count })
  ▼
Browser receives JSON → setData(json) → React re-renders`}
        </pre>
      </section>

      {/* ── Search Input ─────────────────────────────────────────────────────── */}
      <section className="mb-6" aria-label="Search">
        <label htmlFor="search-input" className="block text-sm font-medium text-gray-400 mb-2">
          Search items
        </label>
        <div className="relative">
          {/* Search icon (decorative) */}
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none"
            aria-hidden="true"
          >
            🔍
          </span>
          <input
            id="search-input"
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name or category (e.g. fruit, bread, apple)"
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/8 transition-colors"
            // Disable while loading to prevent rapid fire requests
            disabled={isLoading}
            aria-describedby="search-hint"
          />
          {/* Loading spinner inside the input — appears while fetching */}
          {isLoading && (
            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs animate-pulse"
              aria-label="Loading..."
            >
              ⟳
            </span>
          )}
        </div>
        <p id="search-hint" className="text-xs text-gray-600 mt-1.5">
          {/* Show the debounced search value so learners can see the debounce in action */}
          {debouncedSearch
            ? `Searching for: "${debouncedSearch}"`
            : "Showing all items — type to filter"}
        </p>
      </section>

      {/* ── Stats Bar ────────────────────────────────────────────────────────── */}
      {/*
       * Show metadata from the API response: how many items matched,
       * how many are displayed, and what the route URL was.
       * This makes the API response tangible for learners.
       */}
      {data && (
        <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-gray-500">
          <span>
            Showing <span className="text-gray-300 font-semibold">{data.count}</span>{" "}
            of <span className="text-gray-300 font-semibold">{data.total}</span> matching items
          </span>
          <span className="text-gray-700">|</span>
          <code className="text-gray-600 font-mono bg-white/5 px-2 py-0.5 rounded">
            {/* Show the exact URL that was called */}
            GET /phase-5/api/items{data.search ? `?search=${encodeURIComponent(data.search)}` : ""}
          </code>
        </div>
      )}

      {/* ── Error State ──────────────────────────────────────────────────────── */}
      {error && (
        <div
          className="mb-6 rounded-xl border border-red-500/20 bg-red-500/5 p-4"
          role="alert"
          aria-live="polite"
        >
          <p className="text-sm font-semibold text-red-400 mb-1">Fetch failed</p>
          <p className="text-xs text-gray-400">{error}</p>
          <button
            onClick={() => void fetchItems(debouncedSearch)}
            className="mt-3 text-xs text-red-400 hover:text-red-300 underline underline-offset-2 transition-colors"
          >
            Try again
          </button>
        </div>
      )}

      {/* ── Items Grid ───────────────────────────────────────────────────────── */}
      {/*
       * Render the items returned from the API.
       * We handle three states:
       *   1. Loading (no data yet) — show skeleton placeholders
       *   2. Empty results — show a friendly "no results" message
       *   3. Items found — show the grid of ItemCard components
       */}
      {isLoading && !data ? (
        // ── Loading skeleton — shown on the very first load ─────────────────
        // We don't show this on subsequent searches (data stays visible).
        <div
          className="grid gap-4 sm:grid-cols-2 md:grid-cols-3"
          aria-label="Loading items..."
        >
          {Array.from({ length: 6 }).map((_, i) => (
            // Skeleton placeholder cards — pulse animation indicates loading
            <div
              key={i}
              className="rounded-xl border border-white/5 bg-white/2 p-4 animate-pulse"
              aria-hidden="true"
            >
              <div className="h-4 bg-white/10 rounded mb-3 w-3/4" />
              <div className="h-3 bg-white/5 rounded mb-2 w-1/2" />
              <div className="h-3 bg-white/5 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : data?.items.length === 0 ? (
        // ── Empty state — no items matched the search ─────────────────────
        <div className="text-center py-16" aria-live="polite">
          <p className="text-4xl mb-3" aria-hidden="true">🔍</p>
          <p className="text-gray-400 text-sm mb-1">
            No items found for{" "}
            <span className="text-white font-semibold">&quot;{debouncedSearch}&quot;</span>
          </p>
          <p className="text-xs text-gray-600">
            Try searching for: fruit, vegetable, dairy, bakery, apple, bread...
          </p>
        </div>
      ) : (
        // ── Items grid ─────────────────────────────────────────────────────
        // aria-live="polite" tells screen readers to announce when the list updates
        <div
          className="grid gap-4 sm:grid-cols-2 md:grid-cols-3"
          aria-live="polite"
          aria-label={`${data?.count ?? 0} items`}
        >
          {data?.items.map((item) => (
            // Each item gets a unique key (its id) for React reconciliation.
            // React uses keys to know which items changed, were added, or removed.
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* ── How This Works (Code Walkthrough) ──────────────────────────────── */}
      {/*
       * Show the actual fetch code so learners can replicate it.
       * This closes the loop between the lesson (theory) and the demo (practice).
       */}
      <section className="mt-12 space-y-5" aria-labelledby="code-walk-heading">
        <h2 id="code-walk-heading" className="text-lg font-semibold text-white">
          How this page works
        </h2>

        {/* Code: useState setup */}
        <div className="rounded-xl border border-white/10 bg-white/2 p-5">
          <p className="text-xs font-semibold text-gray-300 mb-2">1. State setup</p>
          <pre className="bg-black/40 border border-white/10 rounded-lg p-4 font-mono text-sm text-gray-300 overflow-x-auto leading-relaxed">
{`// What we're keeping track of:
const [searchInput, setSearchInput] = useState("");        // raw input value
const [debouncedSearch, setDebouncedSearch] = useState(""); // delayed search value
const [data, setData] = useState<ApiResponse | null>(null); // API response
const [isLoading, setIsLoading] = useState(false);         // fetch in progress?
const [error, setError] = useState<string | null>(null);   // fetch error?`}
          </pre>
        </div>

        {/* Code: debounce effect */}
        <div className="rounded-xl border border-white/10 bg-white/2 p-5">
          <p className="text-xs font-semibold text-gray-300 mb-2">2. Debounce — wait 300ms after typing stops</p>
          <pre className="bg-black/40 border border-white/10 rounded-lg p-4 font-mono text-sm text-gray-300 overflow-x-auto leading-relaxed">
{`useEffect(() => {
  // Schedule: update debouncedSearch 300ms after the last keystroke.
  const timer = setTimeout(() => {
    setDebouncedSearch(searchInput);
  }, 300);

  // Cleanup: if the user types again before 300ms, cancel the previous timer.
  // This is how manual debouncing works.
  return () => clearTimeout(timer);
}, [searchInput]);`}
          </pre>
        </div>

        {/* Code: fetch effect */}
        <div className="rounded-xl border border-white/10 bg-white/2 p-5">
          <p className="text-xs font-semibold text-gray-300 mb-2">3. Fetch — call the route handler</p>
          <pre className="bg-black/40 border border-white/10 rounded-lg p-4 font-mono text-sm text-gray-300 overflow-x-auto leading-relaxed">
{`useEffect(() => {
  const fetchItems = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Build the URL with the search param.
      const url = debouncedSearch
        ? \`/phase-5/api/items?search=\${encodeURIComponent(debouncedSearch)}\`
        : '/phase-5/api/items';

      // Call the route handler — runs on the Next.js server.
      const response = await fetch(url);

      // fetch() does NOT throw on 4xx/5xx — we must check .ok manually.
      if (!response.ok) throw new Error(\`HTTP \${response.status}\`);

      const json = await response.json();
      setData(json); // ← triggers React re-render with new data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false); // always hide loader
    }
  };

  void fetchItems();
}, [debouncedSearch]); // re-run when debounced search changes`}
          </pre>
        </div>
      </section>

      {/* ── Lesson Navigation ────────────────────────────────────────────────── */}
      <div className="mt-10 flex justify-between text-sm">
        <Link href="/phase-5/02-middleware" className="text-gray-500 hover:text-blue-400 transition-colors">
          ← Middleware
        </Link>
        <Link href="/phase-6" className="text-blue-400 hover:text-blue-300 transition-colors">
          Phase 6 →
        </Link>
      </div>
    </main>
  );
}
