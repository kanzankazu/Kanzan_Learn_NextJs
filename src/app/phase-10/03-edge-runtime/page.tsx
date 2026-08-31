/**
 * Lesson 03 — Edge Runtime
 * Route: /phase-10/03-edge-runtime
 *
 * WHAT IS THE EDGE RUNTIME?
 * ──────────────────────────
 * By default, Next.js runs your code in the Node.js runtime on a single
 * origin server (or a handful of servers in a region).
 *
 * The Edge Runtime runs your code at the NETWORK EDGE — meaning on CDN
 * nodes distributed around the world, physically close to each user.
 * When a user in Jakarta makes a request, it is handled by an edge node
 * IN or NEAR Jakarta, not by a server in San Francisco.
 *
 * RESULT:
 * ────────
 * - Latency drops from ~200-300ms (origin round-trip) to ~10-30ms (edge)
 * - Personalisation, A/B tests, and redirects happen before the request
 *   even reaches your origin server
 * - Scales automatically with global CDN capacity
 *
 * ANALOGY:
 * ─────────
 * Imagine a bank with one central headquarters vs a bank with branches
 * in every neighbourhood. The central HQ (Node.js runtime) can do complex
 * back-office work. The branches (Edge runtime) handle simple, fast
 * transactions close to the customer — but they have limited capabilities
 * compared to HQ.
 *
 * HOW TO OPT IN:
 * ───────────────
 * Add one export to any Route Handler or middleware file:
 *
 *   export const runtime = 'edge';
 *
 * That is it. Next.js will deploy that file to edge infrastructure instead
 * of the Node.js origin server.
 *
 * WHAT YOU CAN DO AT THE EDGE:
 * ─────────────────────────────
 * ✅ Read/write request headers and cookies
 * ✅ Return Response objects (redirects, rewrites, JSON, HTML)
 * ✅ Make fetch() calls to external APIs
 * ✅ Read geolocation from request headers (country, region, city, lat/lon)
 * ✅ Run WebAssembly modules (Rust/C compiled to WASM)
 * ✅ Validate JWT tokens (no DB needed — verify signature only)
 * ✅ A/B testing via cookie-based bucketing
 * ✅ Personalisation (show different content based on user attributes)
 * ✅ Rate limiting (with an external state store like Upstash Redis)
 *
 * WHAT YOU CANNOT DO AT THE EDGE:
 * ─────────────────────────────────
 * ❌ Node.js built-in modules: fs, path, crypto, stream, buffer (Node.js globals)
 * ❌ Prisma, Drizzle, or any ORM that uses native Node.js bindings
 * ❌ Direct database connections (TCP sockets not supported)
 * ❌ Heavy computation (edge workers have CPU time limits ~50ms)
 * ❌ Large npm packages that use Node.js-specific APIs
 *
 * EDGE vs NODE.JS RUNTIME:
 * ─────────────────────────
 * Node.js runtime:
 *   + Full Node.js API access (fs, crypto, buffers, native addons)
 *   + Can connect to databases directly (Prisma, pg, mysql2)
 *   + No CPU time limit
 *   - Runs in a single region (or a few)
 *   - Cold starts are slower (~100-500ms)
 *
 * Edge runtime:
 *   + Globally distributed — runs near every user
 *   + Near-zero cold starts (~0-5ms)
 *   + Scales to millions of requests automatically
 *   - No Node.js APIs
 *   - Cannot connect to databases directly
 *   - CPU time limit
 *
 * USE CASES FOR EDGE:
 * ────────────────────
 * 1. GEOLOCATION-BASED LOGIC
 *    Detect the user's country from headers and redirect to the correct
 *    locale URL (/en → /id if the user is in Indonesia).
 *
 * 2. A/B TESTING
 *    Assign the user to experiment group A or B at the edge using a cookie.
 *    Rewrite the URL to serve different page variants — no origin hit needed.
 *
 * 3. PERSONALISATION
 *    Read a JWT from a cookie, decode it at the edge, and inject user
 *    attributes as headers before passing to the origin server.
 *
 * 4. AUTHENTICATION GUARDS
 *    Validate JWT signatures at the edge and redirect unauthenticated
 *    users to /login before the request reaches the origin.
 *    (Still validate on the server too — defence in depth.)
 *
 * 5. FEATURE FLAGS
 *    Check feature flag cookies/headers and rewrite to enabled/disabled
 *    variants of a page without touching the origin.
 */

import Link from "next/link";
import type { Metadata } from "next";

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "03 — Edge Runtime",
  description:
    "Learn the Next.js Edge Runtime: export const runtime = 'edge', geolocation, A/B testing, personalisation, and Edge limitations.",
};

// ─── Code Examples ────────────────────────────────────────────────────────────
const CODE_EXAMPLES = [
  {
    id: "opt-in",
    label: "1. Opt in — export const runtime = 'edge'",
    description:
      "A single export is all it takes. Works in Route Handlers and middleware. Next.js handles the rest — no deploy config needed on Vercel.",
    code: `// app/api/geo/route.ts
// Adding 'export const runtime = 'edge'' makes this Route Handler run on
// Cloudflare Workers / Vercel Edge Functions instead of Node.js servers.

export const runtime = 'edge';   // ← THE ONLY CHANGE NEEDED

export async function GET(request: Request) {
  return Response.json({ message: 'I am running at the edge!' });
}

// ─── You can also set it in middleware ───────────────────────────────────────
// middleware.ts
export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
};

// Middleware runs at the edge by default in Next.js.
// You do NOT need 'export const runtime' in middleware — it is always edge.

// ─── Opt out of edge in a specific page ──────────────────────────────────────
// app/dashboard/page.tsx
// If you have a global edge default but need Node.js for one page:
export const runtime = 'nodejs';  // explicitly use Node.js runtime`,
    borderColor: "border-yellow-500/20",
    bgColor: "bg-yellow-500/5",
  },
  {
    id: "geolocation",
    label: "2. Geolocation — Read user location from headers",
    description:
      "Vercel and Cloudflare inject geolocation into request headers automatically. Read the country, region, city, and even latitude/longitude without any external API call.",
    code: `// app/api/location/route.ts
// Geolocation headers are injected by the CDN platform (Vercel, Cloudflare).
// In local development these headers won't be present — check for undefined.

export const runtime = 'edge';

export async function GET(request: Request) {
  const { headers } = request;

  // Vercel injects these headers automatically on edge deployments:
  const country  = headers.get('x-vercel-ip-country')         ?? 'Unknown';
  const region   = headers.get('x-vercel-ip-country-region')  ?? 'Unknown';
  const city     = headers.get('x-vercel-ip-city')            ?? 'Unknown';
  const latitude = headers.get('x-vercel-ip-latitude')        ?? 'Unknown';
  const longitude = headers.get('x-vercel-ip-longitude')      ?? 'Unknown';

  // Cloudflare Workers use different headers:
  // const country = headers.get('cf-ipcountry') ?? 'Unknown';
  // const city    = request.cf?.city ?? 'Unknown';  (Cloudflare-specific API)

  // Example use: redirect to the right locale
  if (country === 'ID') {
    // User is in Indonesia — redirect to Indonesian locale
    return Response.redirect(new URL('/id', request.url), 307);
  }

  return Response.json({
    country,
    region,
    city,
    coordinates: { latitude, longitude },
    note: 'Headers only available on Vercel/Cloudflare edge deployments.',
  });
}`,
    borderColor: "border-green-500/20",
    bgColor: "bg-green-500/5",
  },
  {
    id: "ab-testing",
    label: "3. A/B Testing at the edge",
    description:
      "Assign users to experiment buckets using cookies. Rewrite the URL to different page variants — the origin never needs to know about the experiment logic.",
    code: `// middleware.ts
// A/B testing runs at the edge — before hitting the origin server.
// Users are bucketed once (cookie persists), ensuring consistent experience.

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Run this middleware only on the home page
export const config = {
  matcher: ['/'],
};

export function middleware(request: NextRequest) {
  // Check if the user already has an experiment bucket assigned
  const existingBucket = request.cookies.get('ab-bucket')?.value;

  // Randomly assign if not yet bucketed (50/50 split)
  const bucket = existingBucket ?? (Math.random() < 0.5 ? 'a' : 'b');

  // Rewrite: the URL stays '/' but Next.js serves /home-a or /home-b
  // The user never sees the rewritten path in their browser URL bar.
  const url = request.nextUrl.clone();
  url.pathname = \`/home-\${bucket}\`;   // app/home-a/page.tsx or app/home-b/page.tsx

  const response = NextResponse.rewrite(url);

  // If this is a new user, set the bucket cookie so they get the same
  // variant on every subsequent visit (consistent experience).
  if (!existingBucket) {
    response.cookies.set('ab-bucket', bucket, {
      maxAge: 60 * 60 * 24 * 30,  // 30 days
      httpOnly: true,
      sameSite: 'lax',
    });
  }

  return response;
}`,
    borderColor: "border-blue-500/20",
    bgColor: "bg-blue-500/5",
  },
  {
    id: "personalisation",
    label: "4. Personalisation — Inject user context via headers",
    description:
      "Decode a JWT at the edge and inject user attributes as custom headers. The origin page reads these headers in a Server Component — no separate auth fetch needed.",
    code: `// middleware.ts
// Decode a JWT at the edge (no DB round-trip needed — just verify signature).
// Inject user attributes as request headers so the origin page can read them.

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: ['/dashboard/:path*'],
};

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    // No token → redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Edge runtime supports subtle crypto — decode the JWT payload
  // (In production, use a proper JWT library compiled for edge, e.g. jose)
  let userId = '';
  let userRole = '';
  try {
    const [, payload] = token.split('.');
    const decoded = JSON.parse(atob(payload));
    userId   = decoded.sub   ?? '';
    userRole = decoded.role  ?? 'user';
  } catch {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Inject user info as custom request headers.
  // The origin Server Component reads these via headers() from next/headers.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id',   userId);
  requestHeaders.set('x-user-role', userRole);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

// ─── Reading the injected headers in a Server Component ──────────────────────
// app/dashboard/page.tsx (Server Component — runs on origin, after edge)
//
// import { headers } from 'next/headers';
//
// export default async function DashboardPage() {
//   const headersList = await headers();
//   const userId   = headersList.get('x-user-id');
//   const userRole = headersList.get('x-user-role');
//   // No second auth fetch needed — the edge already validated the JWT
// }`,
    borderColor: "border-violet-500/20",
    bgColor: "bg-violet-500/5",
  },
  {
    id: "edge-api",
    label: "5. Edge Route Handler — Ultra-fast API response",
    description:
      "A simple edge API route. Use this for lightweight endpoints that need to respond in milliseconds — feature flag checks, health probes, locale detection, etc.",
    code: `// app/api/feature-flags/route.ts
// This edge function returns feature flag state in < 10ms globally.
// In a real app, flags would come from an edge-compatible KV store
// like Vercel Edge Config, Cloudflare KV, or Upstash Redis.

export const runtime = 'edge';

// Simulated feature flags (in production, read from Edge Config or KV store)
const FLAGS: Record<string, boolean> = {
  newCheckoutFlow: true,
  betaDashboard:   false,
  aiAssistant:     true,
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const flagName = url.searchParams.get('name');

  // If a specific flag is requested, return it
  if (flagName) {
    const isEnabled = FLAGS[flagName] ?? false;
    return Response.json({ flag: flagName, enabled: isEnabled });
  }

  // Otherwise return all flags
  return Response.json({
    flags: FLAGS,
    runtime: 'edge',
    // In production: timestamp would show how fresh the data is
    cached: true,
  });
}

// Usage in a Server Component:
// const res = await fetch('/api/feature-flags?name=newCheckoutFlow');
// const { enabled } = await res.json();
// if (enabled) { /* show new checkout */ }`,
    borderColor: "border-cyan-500/20",
    bgColor: "bg-cyan-500/5",
  },
] as const;

// ─── Reusable CodeBlock ────────────────────────────────────────────────────────
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
export default function EdgeRuntimePage() {
  return (
    <main className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto">

      {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
      <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
        <span className="mx-2" aria-hidden="true">›</span>
        <Link href="/phase-10" className="hover:text-blue-400 transition-colors">Phase 10</Link>
        <span className="mx-2" aria-hidden="true">›</span>
        <span className="text-gray-300">Edge Runtime</span>
      </nav>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl" aria-hidden="true">⚡</span>
          <h1 className="text-3xl font-bold text-white">Edge Runtime</h1>
        </div>
        <p className="text-gray-400 leading-relaxed max-w-2xl">
          Run route handlers and middleware at CDN edge nodes worldwide —
          ultra-low latency for geolocation, A/B testing, personalisation,
          and JWT validation. One line of code unlocks global distribution.
        </p>
      </header>

      {/* ── Edge vs Node.js Comparison ───────────────────────────────────────── */}
      <section className="mb-10" aria-labelledby="comparison-heading">
        <h2 id="comparison-heading" className="text-lg font-semibold text-white mb-4">
          Edge Runtime vs Node.js Runtime
        </h2>
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="text-left p-3 text-gray-400 font-medium">Aspect</th>
                <th className="text-left p-3 text-yellow-400 font-medium">Edge Runtime</th>
                <th className="text-left p-3 text-blue-400 font-medium">Node.js Runtime</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Where it runs", "CDN edge nodes worldwide", "Single region origin server"],
                ["Latency", "~10-30ms (near user)", "~200-300ms (origin round-trip)"],
                ["Cold starts", "~0-5ms (near instant)", "~100-500ms"],
                ["Node.js APIs", "❌ Not available", "✅ Full access (fs, crypto…)"],
                ["Database (direct)", "❌ No TCP connections", "✅ Prisma, Drizzle, pg, etc."],
                ["fetch()", "✅ Available", "✅ Available"],
                ["CPU time limit", "~50ms (short)", "No limit"],
                ["WebAssembly", "✅ Supported", "✅ Supported"],
              ].map(([aspect, edge, node], i) => (
                <tr key={aspect} className={`border-b border-white/5 ${i % 2 === 0 ? "" : "bg-white/[0.02]"}`}>
                  <td className="p-3 text-gray-300 text-xs font-medium">{aspect}</td>
                  <td className="p-3 text-gray-400 text-xs">{edge}</td>
                  <td className="p-3 text-gray-400 text-xs">{node}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Best Use Cases ───────────────────────────────────────────────────── */}
      <section className="mb-10" aria-labelledby="usecases-heading">
        <h2 id="usecases-heading" className="text-lg font-semibold text-white mb-4">
          Best Use Cases
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            {
              emoji: "🌍",
              title: "Geolocation-based routing",
              body: "Detect country from request headers and redirect to the correct locale URL before the request reaches the origin.",
              color: "border-green-500/20 bg-green-500/5",
            },
            {
              emoji: "🔬",
              title: "A/B testing",
              body: "Assign users to experiment buckets and rewrite to different page variants. Zero impact on origin server load.",
              color: "border-blue-500/20 bg-blue-500/5",
            },
            {
              emoji: "🎯",
              title: "Personalisation",
              body: "Decode JWT at the edge and inject user attributes as headers. Origin pages get user context without an extra auth fetch.",
              color: "border-violet-500/20 bg-violet-500/5",
            },
            {
              emoji: "🔒",
              title: "Auth guards",
              body: "Verify JWT signatures at the edge and redirect unauthenticated users before touching the origin. Fast and scalable.",
              color: "border-yellow-500/20 bg-yellow-500/5",
            },
          ].map((card) => (
            <div key={card.title} className={`rounded-xl border p-4 ${card.color}`}>
              <p className="text-lg mb-2" aria-hidden="true">{card.emoji}</p>
              <h3 className="text-sm font-semibold text-white mb-1">{card.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{card.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Code Examples ────────────────────────────────────────────────────── */}
      <section className="mb-10" aria-labelledby="code-heading">
        <h2 id="code-heading" className="text-lg font-semibold text-white mb-4">
          Code Examples
        </h2>
        <div className="space-y-4">
          {CODE_EXAMPLES.map((ex) => (
            <CodeBlock key={ex.id} {...ex} />
          ))}
        </div>
      </section>

      {/* ── Edge Limitations Warning ─────────────────────────────────────────── */}
      <section className="mb-10" aria-labelledby="limitations-heading">
        <h2 id="limitations-heading" className="text-lg font-semibold text-white mb-4">
          Edge Limitations — Things That Will NOT Work
        </h2>
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
          <ul className="space-y-2">
            {[
              { item: "Node.js built-ins: fs, path, os, stream, buffer, crypto (Node.js version)", note: "These are not available in the V8 Isolate environment. Use Web Crypto API instead." },
              { item: "Prisma, Drizzle, pg, mysql2 — any direct DB driver", note: "They use native Node.js bindings or TCP connections. Use an HTTP-based DB API (e.g., PlanetScale serverless, Neon serverless) instead." },
              { item: "Large npm packages with Node.js dependencies", note: "If a package imports from 'fs' or 'crypto' (node:crypto), it will fail. Check package.json exports for 'edge' conditions." },
              { item: "Long-running CPU work (> 50ms)", note: "Edge workers have strict CPU time limits. Heavy computation belongs on the origin server." },
            ].map(({ item, note }) => (
              <li key={item} className="space-y-0.5">
                <p className="text-sm text-red-300 flex gap-2">
                  <span aria-hidden="true">✗</span>
                  <span>{item}</span>
                </p>
                <p className="text-xs text-gray-500 ml-4">{note}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Lesson Navigation ────────────────────────────────────────────────── */}
      <div className="flex justify-between text-sm">
        <Link href="/phase-10/02-parallel-routes" className="text-gray-500 hover:text-blue-400 transition-colors">
          ← Parallel Routes
        </Link>
        <Link href="/phase-10/04-internationalization" className="text-blue-400 hover:text-blue-300 transition-colors">
          i18n →
        </Link>
      </div>
    </main>
  );
}
