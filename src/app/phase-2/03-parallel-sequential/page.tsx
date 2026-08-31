/**
 * Lesson 03 — Parallel vs Sequential Data Fetching
 * Route: /phase-2/03-parallel-sequential
 *
 * THE WATERFALL PROBLEM:
 * ──────────────────────
 * "Waterfall" means: fetch B cannot start until fetch A finishes.
 * Each fetch waits for the previous one, creating a chain/waterfall of delays.
 *
 * Example of accidental waterfall:
 *   const user = await fetchUser(id);          // takes 300ms
 *   const posts = await fetchPosts(user.id);   // starts at 300ms, takes 200ms
 *   const likes = await fetchLikes(user.id);   // starts at 500ms, takes 150ms
 *   // Total: 300 + 200 + 150 = 650ms ← SLOW
 *
 * If posts and likes are INDEPENDENT (don't need each other's data),
 * they could run in parallel:
 *   const [posts, likes] = await Promise.all([
 *     fetchPosts(user.id),
 *     fetchLikes(user.id),
 *   ]);
 *   // Total: 300 (user) + max(200, 150) = 500ms ← 23% faster
 *
 * WHEN TO USE EACH:
 * ─────────────────
 * Use PARALLEL (Promise.all) when:
 *   - Fetches are independent of each other
 *   - You need data from multiple sources
 *   - Performance matters (and it usually does)
 *
 * Use SEQUENTIAL (await A, then await B) when:
 *   - Fetch B needs data FROM fetch A to construct its URL/params
 *   - Example: fetch user → use user.shopId → fetch shop details
 *   - Example: fetch order → use order.productIds → fetch products
 *
 * ANALOGY FOR ANDROID DEVS:
 * ───────────────────────────
 * This is exactly like Kotlin Coroutines:
 *   - Parallel = launch { } + launch { } + joinAll(), or async { } + awaitAll()
 *   - Sequential = simple sequential suspend function calls
 *
 * Promise.all in JavaScript ≈ coroutineScope { async { } + async { } + awaitAll() }
 */

import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "03 — Parallel vs Sequential Fetching",
};

// ─── Simulated fetch functions ────────────────────────────────────────────────
// Each function simulates a separate API/DB call with its own latency.
// Latency values are chosen to make the timing comparison clear.

/** Simulates fetching a user profile — 300ms */
async function fetchUserProfile(userId: number) {
  await new Promise((r) => setTimeout(r, 300));
  return { id: userId, name: "Alex Kim", email: "alex@example.com", shopId: "shop-42" };
}

/** Simulates fetching user posts — 250ms */
async function fetchUserPosts(userId: number) {
  await new Promise((r) => setTimeout(r, 250));
  return [
    { id: 1, title: "Getting Started with Next.js", likes: 42 },
    { id: 2, title: "Why I Love TypeScript", likes: 88 },
    { id: 3, title: "Tailwind CSS Tips", likes: 31 },
  ];
}

/** Simulates fetching user stats — 200ms */
async function fetchUserStats(userId: number) {
  await new Promise((r) => setTimeout(r, 200));
  return { totalPosts: 3, totalLikes: 161, followers: 1204 };
}

/** Simulates fetching a shop, NEEDS userId from fetchUserProfile — 150ms */
async function fetchShopDetails(shopId: string) {
  await new Promise((r) => setTimeout(r, 150));
  return { shopId, name: "Alex's Workshop", products: 24, rating: 4.8 };
}

// ─── Timing utility ──────────────────────────────────────────────────────────
// Measures how long an async operation takes, in milliseconds.
// Used for the live demo to show the actual timing difference.
async function timed<T>(label: string, fn: () => Promise<T>): Promise<{ result: T; durationMs: number }> {
  const start = Date.now();
  const result = await fn();
  const durationMs = Date.now() - start;
  return { result, durationMs };
}

// ─── Code examples ─────────────────────────────────────────────────────────────
const CODE_EXAMPLES = [
  {
    id: "sequential-bad",
    title: "❌ Accidental waterfall — sequential awaits for independent data",
    borderColor: "border-red-500/20",
    bgColor: "bg-red-500/5",
    code: `// ANTI-PATTERN: these two fetches are independent,
// but the sequential awaits create an unnecessary waterfall
export default async function ProfilePage({ params }) {
  const user = await fetchUser(params.id);    // 300ms → waits
  const posts = await fetchPosts(params.id);  // 250ms → starts at 300ms
  const stats = await fetchStats(params.id);  // 200ms → starts at 550ms
  //                              Total: 300 + 250 + 200 = 750ms ❌

  // posts and stats don't need 'user' to fetch — they could run in parallel!
  return <Profile user={user} posts={posts} stats={stats} />;
}`,
  },
  {
    id: "parallel-good",
    title: "✅ Parallel with Promise.all — independent fetches run simultaneously",
    borderColor: "border-green-500/20",
    bgColor: "bg-green-500/5",
    code: `// RECOMMENDED: use Promise.all for independent fetches
export default async function ProfilePage({ params }) {
  // All three start at the same time!
  const [user, posts, stats] = await Promise.all([
    fetchUser(params.id),    // 300ms ┐
    fetchPosts(params.id),   // 250ms ├── all run in parallel
    fetchStats(params.id),   // 200ms ┘
  ]);
  //    Total: max(300, 250, 200) = 300ms ✅ — 2.5x faster!

  return <Profile user={user} posts={posts} stats={stats} />;
}`,
  },
  {
    id: "sequential-correct",
    title: "✅ Sequential — when fetch B genuinely needs data from fetch A",
    borderColor: "border-blue-500/20",
    bgColor: "bg-blue-500/5",
    code: `// CORRECT USE of sequential: we need 'user.shopId' to fetch the shop
export default async function ShopPage({ params }) {
  // Must be sequential: we don't know shopId until user is fetched
  const user = await fetchUser(params.id);           // 300ms
  const shop = await fetchShop(user.shopId);         // 150ms (needs user.shopId)
  //                             Total: 300 + 150 = 450ms
  // ← This waterfall is INTENTIONAL because of the data dependency

  return <ShopPage user={user} shop={shop} />;
}`,
  },
  {
    id: "mixed",
    title: "✅ Mixed pattern — parallel where possible, sequential where required",
    borderColor: "border-green-500/20",
    bgColor: "bg-green-500/5",
    code: `export default async function DashboardPage({ params }) {
  // Step 1: fetch user (required for shop — must be first)
  const user = await fetchUser(params.id);           // 300ms

  // Step 2: fetch remaining data in parallel
  // posts/stats are independent. shop needs user.shopId — but we have it now.
  const [posts, stats, shop] = await Promise.all([
    fetchPosts(user.id),        // 250ms ┐
    fetchStats(user.id),        // 200ms ├── parallel after user
    fetchShop(user.shopId),     // 150ms ┘
  ]);
  // Total: 300 + max(250, 200, 150) = 300 + 250 = 550ms
  // vs fully sequential: 300+250+200+150 = 900ms — 39% faster!

  return <Dashboard user={user} posts={posts} stats={stats} shop={shop} />;
}`,
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function ParallelSequentialPage() {
  // ── Live demo: run both strategies and capture timing ──────────────────────

  // STRATEGY A: Sequential (waterfall) — posts then stats one after another
  const sequentialStart = Date.now();
  // These awaits are intentionally sequential for demo purposes
  const sequentialPosts = await fetchUserPosts(1);  // 250ms
  const sequentialStats = await fetchUserStats(1);  // 200ms (starts AFTER posts)
  const sequentialMs = Date.now() - sequentialStart;

  // STRATEGY B: Parallel — posts and stats start at the same time
  const parallelStart = Date.now();
  const [parallelPosts, parallelStats] = await Promise.all([
    fetchUserPosts(1),   // 250ms ─┐ both start simultaneously
    fetchUserStats(1),   // 200ms ─┘
  ]);
  const parallelMs = Date.now() - parallelStart;

  // STRATEGY C: Sequential with dependency — user → shop (needs user.shopId)
  const user = await fetchUserProfile(1);  // 300ms
  const shop = await fetchShopDetails(user.shopId);  // 150ms (needs user.shopId)

  // Calculate the speedup ratio for display
  const speedupPercent = Math.round(((sequentialMs - parallelMs) / sequentialMs) * 100);

  // Suppress unused variable warning for demo data
  void sequentialPosts;
  void parallelPosts;

  return (
    <main className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto">

      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
        <span className="mx-2">›</span>
        <Link href="/phase-2" className="hover:text-blue-400 transition-colors">Phase 2</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-300">Parallel vs Sequential</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Parallel vs Sequential Fetching</h1>
        <p className="text-gray-400">
          Independent fetches should run in parallel with{" "}
          <code className="text-blue-300 bg-white/10 px-1 rounded">Promise.all()</code>.
          Sequential fetch is only for when fetch B needs data from fetch A.
        </p>
      </header>

      {/* Live timing demo */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-white mb-2">Live Demo — Timing Comparison</h2>
        <p className="text-sm text-gray-400 mb-4">
          Both strategies fetched the same data (posts + stats) on the server just now.
          The timings below are real measurements from this request.
        </p>

        <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
          {/* Sequential result */}
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
            <p className="text-xs font-semibold text-red-400 mb-1 uppercase tracking-wide">Sequential (waterfall)</p>
            <p className="text-3xl font-bold text-white font-mono">{sequentialMs}ms</p>
            <p className="text-xs text-gray-500 mt-1">posts (250ms) → stats (200ms)</p>
            <p className="text-xs text-gray-600 mt-2">Each fetch waited for the previous to finish</p>
          </div>

          {/* Parallel result */}
          <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
            <p className="text-xs font-semibold text-green-400 mb-1 uppercase tracking-wide">Parallel (Promise.all)</p>
            <p className="text-3xl font-bold text-white font-mono">{parallelMs}ms</p>
            <p className="text-xs text-gray-500 mt-1">posts (250ms) ‖ stats (200ms)</p>
            <p className="text-xs text-gray-600 mt-2">Both fetches ran simultaneously</p>
          </div>
        </div>

        {/* Speedup banner */}
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3 flex items-center gap-3">
          <span className="text-2xl font-bold text-blue-400">{speedupPercent}%</span>
          <p className="text-sm text-gray-300">
            faster with parallel fetching — and this was only 2 small fetches.
            Real apps with 3-5 fetches see much bigger gains.
          </p>
        </div>
      </section>

      {/* Dependency demo */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-white mb-2">When Sequential is Correct — Data Dependency</h2>
        <p className="text-sm text-gray-400 mb-4">
          Shop details below required <code className="text-blue-300">user.shopId</code>, which we only knew after
          fetching the user. This waterfall is intentional.
        </p>
        <div className="rounded-xl border border-white/10 bg-white/2 p-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs text-gray-500 font-mono w-20">Step 1</span>
            <div className="flex-1 rounded-lg border border-white/10 bg-black/30 p-2">
              <p className="text-xs text-gray-300">
                <span className="text-blue-400">fetchUser(1)</span> →{" "}
                <span className="text-gray-500">shopId: </span>
                <span className="text-white">&quot;{user.shopId}&quot;</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 font-mono w-20">Step 2</span>
            <div className="flex-1 rounded-lg border border-white/10 bg-black/30 p-2">
              <p className="text-xs text-gray-300">
                <span className="text-blue-400">fetchShop(&quot;{user.shopId}&quot;)</span> →{" "}
                <span className="text-white">{shop.name}</span>
                <span className="text-gray-500"> · {shop.products} products · ⭐ {shop.rating}</span>
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-3">
            ← shopId came from Step 1. There was no way to run these in parallel.
          </p>
        </div>
      </section>

      {/* Code examples */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-white mb-4">Code Examples</h2>
        <div className="space-y-4">
          {CODE_EXAMPLES.map((example) => (
            <div key={example.id} className={`rounded-xl border p-4 ${example.borderColor} ${example.bgColor}`}>
              <p className="text-xs font-semibold text-gray-400 mb-3">{example.title}</p>
              <div className="rounded-lg border border-white/10 bg-black/40 p-3">
                <pre className="text-xs text-gray-300 font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap">
                  {example.code}
                </pre>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Summary rule */}
      <section className="mb-10 rounded-xl border border-white/10 bg-black/20 p-5">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">The Golden Rule</h2>
        <div className="font-mono text-xs space-y-2 text-gray-400">
          <p className="text-white">Ask: &quot;Does fetch B need data from fetch A?&quot;</p>
          <p><span className="text-red-400">YES</span> → sequential is unavoidable (but minimize what comes first)</p>
          <p><span className="text-green-400">NO</span>  → always use <span className="text-blue-300">Promise.all()</span></p>
        </div>
      </section>

      {/* Lesson navigation */}
      <div className="flex justify-between text-sm">
        <Link href="/phase-2/02-caching-revalidation" className="text-gray-500 hover:text-blue-400 transition-colors">
          ← Caching
        </Link>
        <Link href="/phase-2/04-server-actions" className="text-blue-400 hover:text-blue-300 transition-colors">
          Next: Server Actions →
        </Link>
      </div>
    </main>
  );
}
