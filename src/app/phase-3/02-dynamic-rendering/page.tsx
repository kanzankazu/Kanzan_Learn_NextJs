/**
 * Lesson 02 — Dynamic Rendering (SSR)
 * Route: /phase-3/02-dynamic-rendering
 *
 * WHAT IS DYNAMIC RENDERING?
 * ───────────────────────────
 * Dynamic Rendering means Next.js runs your Server Component on EVERY request
 * and generates fresh HTML each time. There is no cached result.
 *
 * Compare to SSG (Static Rendering):
 *   SSG  → HTML built ONCE at deploy, served from CDN
 *   SSR  → HTML built on EVERY request, served from server
 *
 * ANALOGY:
 * ─────────
 * A restaurant meal (SSR) vs a pre-packaged sandwich (SSG).
 * The meal is cooked fresh for you — exactly what you want — but you wait.
 * The sandwich was made this morning — instant pickup — but it&apos;s the same for everyone.
 *
 * WHEN DOES NEXT.JS OPT INTO DYNAMIC RENDERING?
 * ───────────────────────────────────────────────
 * Next.js automatically detects dynamic rendering when your component uses:
 *
 * 1. cookies()     — reads HTTP cookies (user-specific, can&apos;t be cached)
 * 2. headers()     — reads HTTP request headers (IP, user-agent, auth token)
 * 3. searchParams  — the URL query string (?q=search, ?page=2)
 * 4. fetch() with { cache: 'no-store' } — explicitly opt out of caching
 * 5. unstable_noStore() — programmatic opt-out
 *
 * These are called "Dynamic APIs" because their values differ per request.
 * Next.js cannot pre-render a page that depends on per-request data.
 *
 * YOU CAN ALSO FORCE DYNAMIC RENDERING:
 * ───────────────────────────────────────
 * export const dynamic = 'force-dynamic';
 * This is useful when you import a library that uses a dynamic API internally
 * and Next.js doesn&apos;t automatically detect it.
 *
 * PERFORMANCE IMPLICATIONS:
 * ──────────────────────────
 * Dynamic pages run server-side code on every request:
 *   - Higher server cost (CPU, memory)
 *   - Higher latency (request → server → DB → render → response)
 *   - Cannot be cached at the CDN level
 *
 * Mitigation strategies:
 *   - Use ISR for pages that are "mostly static but need freshness" (Lesson 03)
 *   - Use Streaming to show content progressively (Lesson 04)
 *   - Cache individual fetch() calls even within a dynamic page
 */

import Link from "next/link";
import type { Metadata } from "next";

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "02 — Dynamic Rendering (SSR)",
  description:
    "Learn when Next.js switches to Dynamic Rendering and how to use cookies(), headers(), and searchParams.",
};

// ─── Code Examples ────────────────────────────────────────────────────────────
const CODE_EXAMPLES = [
  {
    id: "cookies",
    label: "Dynamic via cookies() — reading per-user session",
    description:
      "Importing cookies() from next/headers instantly makes the page dynamic. Next.js sees this call and knows it cannot pre-render — the cookie value differs per user.",
    code: `// app/dashboard/page.tsx
// cookies() makes this page DYNAMIC automatically.
// No need for export const dynamic = 'force-dynamic'.

import { cookies } from 'next/headers';

export default async function DashboardPage() {
  // Read a cookie from the incoming HTTP request.
  // This is user-specific → must render fresh each request.
  const cookieStore = await cookies();
  const theme = cookieStore.get('theme')?.value ?? 'dark';
  const userId = cookieStore.get('user_id')?.value;

  if (!userId) {
    // No session cookie → user not logged in
    return <div>Please log in.</div>;
  }

  // Because this page is dynamic, we can fetch user-specific data:
  const user = await fetchUser(userId);

  return (
    <main>
      <h1>Welcome back, {user.name}!</h1>
      <p>Current theme: {theme}</p>
    </main>
  );
}`,
    borderColor: "border-blue-500/20",
    bgColor: "bg-blue-500/5",
  },
  {
    id: "headers",
    label: "Dynamic via headers() — reading request metadata",
    description:
      "headers() lets you read HTTP request headers: Authorization tokens, user-agent strings, IP addresses, Accept-Language for i18n, etc.",
    code: `// app/api-status/page.tsx
// headers() makes this page DYNAMIC automatically.

import { headers } from 'next/headers';

export default async function ApiStatusPage() {
  const headerStore = await headers();

  // Read individual headers — all strings or undefined
  const userAgent = headerStore.get('user-agent') ?? 'unknown';
  const lang = headerStore.get('accept-language') ?? 'en';
  const authToken = headerStore.get('authorization');

  // Example: content negotiation based on language header
  const greeting = lang.startsWith('id') ? 'Selamat datang' : 'Welcome';

  // Example: check for Bearer token in Authorization header
  const isAuthenticated = authToken?.startsWith('Bearer ');

  return (
    <main>
      <h1>{greeting}</h1>
      <p>Your browser: {userAgent.slice(0, 40)}...</p>
      <p>Auth status: {isAuthenticated ? 'Authenticated' : 'Anonymous'}</p>
    </main>
  );
}`,
    borderColor: "border-purple-500/20",
    bgColor: "bg-purple-500/5",
  },
  {
    id: "search-params",
    label: "Dynamic via searchParams — URL query string",
    description:
      "The searchParams prop in a page component contains the current URL query string (?q=nextjs&page=2). Using it opts the page into dynamic rendering because the URL differs per request.",
    code: `// app/search/page.tsx
// Accessing searchParams makes this page DYNAMIC.
// In Next.js 15, searchParams is a Promise — always await it.

type SearchPageProps = {
  searchParams: Promise<{ q?: string; page?: string }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  // Await the searchParams Promise (Next.js 15 requirement)
  const { q = '', page = '1' } = await searchParams;

  const pageNum = parseInt(page, 10);

  // Now fetch search results using the query from the URL
  // Example: /search?q=nextjs&page=2
  const results = await searchProducts(q, pageNum);

  return (
    <main>
      <h1>Search: &quot;{q}&quot;</h1>
      <p>Page {pageNum} — {results.total} results found</p>
      <ul>
        {results.items.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </main>
  );
}

// Dummy helper — replace with real DB query
async function searchProducts(query: string, page: number) {
  return { total: 0, items: [] };
}`,
    borderColor: "border-green-500/20",
    bgColor: "bg-green-500/5",
  },
  {
    id: "force-dynamic",
    label: "force-dynamic — explicit opt-in",
    description:
      "If dynamic rendering isn&apos;t detected automatically (e.g., a 3rd-party lib uses cookies internally), you can force it with this export. It&apos;s also useful during development when you always want fresh data.",
    code: `// app/some-page/page.tsx

// Explicitly force this page to render dynamically on every request.
// Use when:
//   - A library you import uses cookies/headers internally
//   - You always want fresh data during development
//   - You&apos;re migrating from the Pages Router (getServerSideProps behaviour)
export const dynamic = 'force-dynamic';

export default async function SomePage() {
  // Even without explicit cookies()/headers() calls,
  // this page re-renders on every request.
  const data = await fetch('https://api.example.com/data', {
    cache: 'no-store', // combine with force-dynamic for clarity
  }).then(r => r.json());

  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}`,
    borderColor: "border-orange-500/20",
    bgColor: "bg-orange-500/5",
  },
  {
    id: "no-store-fetch",
    label: "fetch() with no-store — opt a single fetch out of cache",
    description:
      "Even inside a static page, one fetch with { cache: 'no-store' } makes the page dynamic. But usually you&apos;d use this to get fresh data inside an already-dynamic page without affecting siblings.",
    code: `// app/prices/page.tsx
// fetch() with cache: 'no-store' makes this page DYNAMIC.

export default async function PricesPage() {
  // This fetch NEVER reads from cache — always hits the network.
  // Result: the page becomes dynamic (rendered on every request).
  const prices = await fetch('https://api.example.com/prices', {
    cache: 'no-store', // ← disables all caching for this request
    // Alternative syntax: next: { revalidate: 0 } (same effect)
  }).then(r => r.json());

  return (
    <ul>
      {prices.map((p: { id: string; name: string; price: number }) => (
        <li key={p.id}>{p.name}: \${p.price}</li>
      ))}
    </ul>
  );
}`,
    borderColor: "border-cyan-500/20",
    bgColor: "bg-cyan-500/5",
  },
] as const;

// ─── CodeBlock ─────────────────────────────────────────────────────────────────
function CodeBlock({
  code,
  label,
  description,
  borderColor,
  bgColor,
}: {
  code: string;
  label: string;
  description: string;
  borderColor: string;
  bgColor: string;
}) {
  return (
    <div className={`rounded-xl border p-5 ${borderColor} ${bgColor}`}>
      <p className="text-xs font-semibold text-gray-300 mb-2">{label}</p>
      <p className="text-xs text-gray-500 mb-3 leading-relaxed">{description}</p>
      <pre className="bg-black/40 border border-white/10 rounded-lg p-4 font-mono text-sm text-gray-300 overflow-x-auto leading-relaxed">
        {code}
      </pre>
    </div>
  );
}

// ─── Page Component ────────────────────────────────────────────────────────────
export default function DynamicRenderingPage() {
  return (
    <main className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto">

      {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
      <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
        <span className="mx-2" aria-hidden="true">›</span>
        <Link href="/phase-3" className="hover:text-blue-400 transition-colors">Phase 3</Link>
        <span className="mx-2" aria-hidden="true">›</span>
        <span className="text-gray-300">Dynamic Rendering</span>
      </nav>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl" aria-hidden="true">⚡</span>
          <h1 className="text-3xl font-bold text-white">Dynamic Rendering (SSR)</h1>
        </div>
        <p className="text-gray-400 leading-relaxed max-w-2xl">
          Fresh HTML on every request. Necessary for personalised content, real-time data,
          and anything that depends on cookies, headers, or search params.
        </p>
      </header>

      {/* ── Trigger Summary ─────────────────────────────────────────────────── */}
      {/*
       * A quick-reference box listing all the things that trigger dynamic rendering.
       * Beginners often accidentally make a page dynamic without realising it —
       * this summary helps them recognise the triggers.
       */}
      <section className="mb-10" aria-labelledby="triggers-heading">
        <h2 id="triggers-heading" className="text-lg font-semibold text-white mb-3">
          What Triggers Dynamic Rendering?
        </h2>
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">
          <p className="text-sm text-gray-400 mb-4 leading-relaxed">
            Next.js detects dynamic rendering automatically. If your page uses ANY of these,
            it switches from static to dynamic:
          </p>
          <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
            {[
              {
                api: "cookies()",
                pkg: "next/headers",
                why: "Cookie values differ per user — cannot be pre-rendered.",
              },
              {
                api: "headers()",
                pkg: "next/headers",
                why: "Request headers (auth token, IP, user-agent) differ per request.",
              },
              {
                api: "searchParams",
                pkg: "page prop",
                why: "URL query string (?q=...) differs per request.",
              },
              {
                api: "fetch({ cache: 'no-store' })",
                pkg: "built-in fetch",
                why: "Explicitly disables cache — must hit origin on every request.",
              },
              {
                api: "dynamic = 'force-dynamic'",
                pkg: "export const",
                why: "Manual override — always render dynamically regardless of usage.",
              },
              {
                api: "unstable_noStore()",
                pkg: "next/cache",
                why: "Programmatic opt-out — useful inside utility functions.",
              },
            ].map((item) => (
              <div key={item.api} className="rounded-lg border border-white/10 bg-black/20 p-3">
                <code className="text-blue-300 text-xs font-mono block mb-0.5">{item.api}</code>
                <span className="text-xs text-gray-600 mb-2 block">{item.pkg}</span>
                <p className="text-xs text-gray-400 leading-relaxed">{item.why}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Performance Mental Model ─────────────────────────────────────────── */}
      <section className="mb-10" aria-labelledby="perf-model">
        <h2 id="perf-model" className="text-lg font-semibold text-white mb-3">
          Performance Trade-offs
        </h2>
        <div className="rounded-xl border border-white/10 bg-white/2 p-5">
          {/*
           * This diagram shows the request lifecycle for a dynamic page.
           * Understanding this helps beginners see WHY dynamic pages are slower.
           */}
          <p className="text-sm text-gray-400 mb-4">
            Dynamic pages follow this lifecycle on <strong className="text-white">every</strong> request:
          </p>
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono mb-4">
            {[
              { label: "Browser request", color: "text-gray-300" },
              { label: "→", color: "text-gray-600" },
              { label: "Server receives", color: "text-blue-300" },
              { label: "→", color: "text-gray-600" },
              { label: "Component runs", color: "text-blue-300" },
              { label: "→", color: "text-gray-600" },
              { label: "DB / API fetch", color: "text-yellow-300" },
              { label: "→", color: "text-gray-600" },
              { label: "HTML rendered", color: "text-blue-300" },
              { label: "→", color: "text-gray-600" },
              { label: "Response sent", color: "text-green-300" },
            ].map((step, i) => (
              <span key={i} className={step.color}>{step.label}</span>
            ))}
          </div>
          <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <div>
              <p className="text-xs font-semibold text-red-400 mb-2">Downsides</p>
              {[
                "Server CPU used on every request",
                "Higher latency vs CDN-served HTML",
                "Costs more at scale (more compute)",
                "Cannot leverage CDN caching",
              ].map((d) => (
                <p key={d} className="text-xs text-gray-400 flex gap-1.5 mb-1">
                  <span className="text-red-400 mt-0.5">✗</span>{d}
                </p>
              ))}
            </div>
            <div>
              <p className="text-xs font-semibold text-green-400 mb-2">Upsides</p>
              {[
                "Always fresh — zero staleness",
                "Personalised per user/session",
                "Access request-time data (cookies, IP)",
                "Consistent with traditional SSR mental model",
              ].map((u) => (
                <p key={u} className="text-xs text-gray-400 flex gap-1.5 mb-1">
                  <span className="text-green-400 mt-0.5">✓</span>{u}
                </p>
              ))}
            </div>
          </div>
          <div className="mt-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3">
            <p className="text-xs text-yellow-300">
              💡 <strong>Tip:</strong> You can still cache individual fetch() calls WITHIN a dynamic page.
              The page re-renders on every request, but individual data calls can be cached.
              Only truly per-request data (cookies, headers) must be fresh every time.
            </p>
          </div>
        </div>
      </section>

      {/* ── Code Examples ────────────────────────────────────────────────────── */}
      <section className="mb-10" aria-labelledby="code-examples">
        <h2 id="code-examples" className="text-lg font-semibold text-white mb-4">Code Examples</h2>
        <div className="space-y-4">
          {CODE_EXAMPLES.map((ex) => (
            <CodeBlock key={ex.id} {...ex} />
          ))}
        </div>
      </section>

      {/* ── Decision Helper ─────────────────────────────────────────────────── */}
      <section className="mb-10 rounded-xl border border-white/10 bg-white/2 p-5" aria-labelledby="decision-heading">
        <h2 id="decision-heading" className="text-base font-semibold text-white mb-3">
          When to Choose Dynamic Rendering
        </h2>
        <div className="grid gap-2 text-xs text-gray-400">
          {[
            { q: "Does the page show different content per user?", a: "→ Use Dynamic (SSR)" },
            { q: "Does the page read cookies or auth tokens?", a: "→ Use Dynamic (SSR)" },
            { q: "Does the page depend on URL query params?", a: "→ Use Dynamic (SSR)" },
            { q: "Is the data the same for all users but updated hourly?", a: "→ Consider ISR (Lesson 03)" },
            { q: "Is the data completely static (marketing page)?", a: "→ Use Static (Lesson 01)" },
          ].map((item) => (
            <div key={item.q} className="flex gap-2">
              <span className="text-gray-500 shrink-0">▸</span>
              <span>
                <span className="text-gray-300">{item.q}</span>{" "}
                <span className="text-blue-400">{item.a}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Lesson Navigation ────────────────────────────────────────────────── */}
      <div className="flex justify-between text-sm">
        <Link href="/phase-3/01-static-rendering" className="text-gray-500 hover:text-blue-400 transition-colors">
          ← Static Rendering
        </Link>
        <Link href="/phase-3/03-isr" className="text-blue-400 hover:text-blue-300 transition-colors">
          ISR →
        </Link>
      </div>
    </main>
  );
}
