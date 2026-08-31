/**
 * Lesson 01 — Route Handlers (API Routes)
 * Route: /phase-5/01-route-handlers
 *
 * WHAT ARE ROUTE HANDLERS?
 * ─────────────────────────
 * Route Handlers are server-side functions that handle HTTP requests.
 * They are defined in files named `route.ts` (or `route.js`) inside
 * the `app/` directory, following the same folder-based routing as pages.
 *
 * Unlike page.tsx (which renders UI), route.ts handles raw HTTP.
 * You export functions named after HTTP methods: GET, POST, PUT, DELETE, PATCH, etc.
 * Next.js calls the matching export when a request arrives at that URL.
 *
 * HISTORY — Why did route.ts replace pages/api/?
 * ────────────────────────────────────────────────
 * Before Next.js 13 (Pages Router), API routes lived in:
 *   pages/api/items.ts  →  /api/items
 *
 * They used a single default export receiving (req, res):
 *   export default function handler(req, res) { res.json({}) }
 *
 * With App Router (Next.js 13+), route handlers use:
 *   app/api/items/route.ts  →  /api/items
 *
 * Each HTTP method is its own named export. They use the Web Standard
 * Request / Response API (or the Next.js wrappers NextRequest / NextResponse).
 *
 * BENEFITS OF THE NEW APPROACH:
 * ───────────────────────────────
 * ✅ Web-standard Request / Response API (runs anywhere — Edge, Node, Workers)
 * ✅ Per-method exports → cleaner, easier to read
 * ✅ Same App Router folder conventions (coexists with pages)
 * ✅ Full TypeScript support with NextRequest / NextResponse
 * ✅ Built-in support for cookies, headers, URL search params
 * ✅ Can be statically cached just like Server Components
 *
 * FILE STRUCTURE:
 * ────────────────
 * A route.ts can be placed at any path. Examples:
 *
 *   app/api/users/route.ts          →  GET /api/users
 *   app/api/users/[id]/route.ts     →  GET /api/users/123
 *   app/api/auth/login/route.ts     →  POST /api/auth/login
 *
 * IMPORTANT: A folder can have BOTH page.tsx AND route.ts.
 * They are separate — page.tsx renders HTML, route.ts handles HTTP.
 *
 * CACHING BEHAVIOUR:
 * ───────────────────
 * GET handlers that do NOT read cookies/headers/searchParams are cached
 * by default (like static pages). Add { cache: 'no-store' } to opt out.
 * POST, PUT, DELETE, PATCH are never cached — they always run fresh.
 */

import Link from "next/link";
import type { Metadata } from "next";

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "01 — Route Handlers (API Routes)",
  description:
    "Learn how to create server-side API endpoints with Route Handlers in Next.js 15. Covers GET, POST, PUT, DELETE, NextRequest, NextResponse, and cookies.",
};

// ─── Code Examples ────────────────────────────────────────────────────────────
// Each example demonstrates one aspect of Route Handlers.
// They are plain strings rendered inside <pre> blocks.
const CODE_EXAMPLES = [
  {
    id: "basic-get",
    label: "🟢 Basic GET handler — return JSON",
    description:
      "The simplest route handler: export a GET function that returns a JSON response. This replaces the old pages/api/ pattern. Visit /api/hello in the browser to see the JSON.",
    code: `// app/api/hello/route.ts
//
// Route handlers live in route.ts files inside app/.
// Export a function named after the HTTP method you want to handle.
// The function receives a Request and must return a Response.

import { NextResponse } from 'next/server';
// NextResponse is Next.js's enhanced Response class.
// Use NextResponse.json() to easily return JSON with correct headers.

// This handles: GET /api/hello
export async function GET() {
  // NextResponse.json() sets:
  //   Content-Type: application/json
  //   Status: 200 (default)
  return NextResponse.json({
    message: 'Hello from the API!',
    timestamp: new Date().toISOString(),
  });
}

// If you visit /api/hello in a browser, you'll see:
// {"message":"Hello from the API!","timestamp":"2024-01-01T00:00:00.000Z"}`,
    borderColor: "border-green-500/20",
    bgColor: "bg-green-500/5",
  },
  {
    id: "query-params",
    label: "🟢 GET with query parameters — NextRequest",
    description:
      "Use NextRequest to read URL search params (e.g. ?search=hello). NextRequest extends the web standard Request with extra Next.js utilities like .nextUrl.",
    code: `// app/api/items/route.ts
//
// NextRequest extends the standard Request API.
// It adds .nextUrl (a URL object with parsed params),
// .cookies, .geo, .ip, and other Next.js-specific helpers.

import { NextRequest, NextResponse } from 'next/server';

// This handles: GET /api/items?search=apple&limit=5
export async function GET(request: NextRequest) {
  // request.nextUrl is a URL object — always use this over request.url
  // because it correctly handles relative URLs in Next.js.
  const { searchParams } = request.nextUrl;

  // Read individual query params with .get()
  // Returns null if the param is not present.
  const search = searchParams.get('search') ?? '';     // ?search=apple
  const limit = Number(searchParams.get('limit') ?? 10); // ?limit=5

  // In a real app: query your database here
  const allItems = ['apple', 'banana', 'cherry', 'apricot', 'blueberry'];

  // Filter based on the search param
  const filtered = allItems.filter(item =>
    item.toLowerCase().includes(search.toLowerCase())
  );

  return NextResponse.json({
    items: filtered.slice(0, limit),
    total: filtered.length,
    search,
  });
}`,
    borderColor: "border-green-500/20",
    bgColor: "bg-green-500/5",
  },
  {
    id: "post-handler",
    label: "🟡 POST handler — read request body",
    description:
      "POST handlers receive a JSON body via request.json(). Always validate the body before using it — clients can send anything. Return 400 for invalid input, 201 for successful creation.",
    code: `// app/api/items/route.ts (same file — different export)
//
// In the same route.ts file, you can export both GET and POST.
// Each is a separate function — clean and readable.

import { NextRequest, NextResponse } from 'next/server';

// This handles: POST /api/items
// Client sends: { "name": "apple", "price": 1.99 }
export async function POST(request: NextRequest) {
  // Parse the JSON body sent by the client.
  // If the client sends invalid JSON, this throws → wrap in try/catch.
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    // Return 400 Bad Request if the body isn't valid JSON.
    return NextResponse.json(
      { error: 'Invalid JSON in request body' },
      { status: 400 }
    );
  }

  // Validate the expected shape — never trust client data!
  const { name, price } = body as { name?: string; price?: number };

  if (!name || typeof name !== 'string') {
    return NextResponse.json(
      { error: 'Field "name" is required and must be a string' },
      { status: 400 }
    );
  }

  // In a real app: save to database here
  const newItem = { id: Date.now(), name, price: price ?? 0 };

  // Return 201 Created (not 200) for successful resource creation.
  // Pass the status code as the second argument to NextResponse.json().
  return NextResponse.json(newItem, { status: 201 });
}`,
    borderColor: "border-yellow-500/20",
    bgColor: "bg-yellow-500/5",
  },
  {
    id: "put-delete",
    label: "🟡 PUT and DELETE — dynamic route params",
    description:
      "For updating or deleting a specific resource, use a dynamic route like [id]/route.ts. In Next.js 15, params is a Promise — always await it.",
    code: `// app/api/items/[id]/route.ts
//
// Dynamic segments work the same as in page.tsx — use [id] in the folder name.
// In Next.js 15, params is a Promise. Always destructure after awaiting.

import { NextRequest, NextResponse } from 'next/server';

// Handles: PUT /api/items/42
// Updates an existing item by ID.
export async function PUT(
  request: NextRequest,
  // In Next.js 15, params is wrapped in a Promise.
  // The type annotation uses Promise<{ id: string }>.
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;  // ← must await in Next.js 15
  const body = await request.json() as { name?: string };

  if (!body.name) {
    return NextResponse.json({ error: 'Name required' }, { status: 400 });
  }

  // In a real app: update the DB record with this id
  return NextResponse.json({ id, name: body.name, updated: true });
}

// Handles: DELETE /api/items/42
// Deletes the item with the given ID.
export async function DELETE(
  _request: NextRequest, // underscore prefix = intentionally unused param
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // In a real app: delete the DB record with this id
  // Return 204 No Content — successful deletion, no body needed.
  // OR return 200 with a confirmation message (both are acceptable).
  return NextResponse.json({ id, deleted: true });
}`,
    borderColor: "border-yellow-500/20",
    bgColor: "bg-yellow-500/5",
  },
  {
    id: "cookies",
    label: "🔵 Cookies in Route Handlers",
    description:
      "Use the cookies() helper from next/headers to read and set cookies inside route handlers. Reading cookies automatically opts the handler into dynamic mode (runs on every request, never cached).",
    code: `// app/api/auth/route.ts
//
// next/headers provides cookies() and headers() helpers.
// These are async in Next.js 15 — always await them.
// Reading cookies opts the route out of caching (dynamic mode).

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// GET — read a cookie (e.g. check if user is logged in)
export async function GET() {
  // cookies() is async in Next.js 15 — await it!
  const cookieStore = await cookies();

  // Read a specific cookie by name.
  // Returns an object { name, value, ... } or undefined.
  const sessionCookie = cookieStore.get('session');

  if (!sessionCookie) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    sessionId: sessionCookie.value,
  });
}

// POST — set a cookie (e.g. create a session on login)
export async function POST(request: NextRequest) {
  const { username } = await request.json() as { username?: string };

  if (!username) {
    return NextResponse.json({ error: 'Username required' }, { status: 400 });
  }

  // Create the response first, then set cookies on it.
  const response = NextResponse.json({ success: true, username });

  // Set a cookie on the response.
  // httpOnly: true  → JavaScript cannot read this cookie (XSS protection).
  // secure: true    → Only sent over HTTPS.
  // sameSite: 'lax' → Protects against CSRF attacks.
  // maxAge           → Cookie lifetime in seconds (here: 7 days).
  response.cookies.set('session', \`session_\${username}_\${Date.now()}\`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
  });

  return response;
}`,
    borderColor: "border-blue-500/20",
    bgColor: "bg-blue-500/5",
  },
  {
    id: "custom-headers",
    label: "🔵 Custom response headers & CORS",
    description:
      "Return custom headers in the response for CORS, caching control, or API versioning. Use NextResponse with a headers option or mutate the headers object.",
    code: `// app/api/public-data/route.ts
//
// Route handlers can return any HTTP headers.
// Common use cases: CORS headers, cache-control, API version headers.

import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const data = { items: ['one', 'two', 'three'] };

  return NextResponse.json(data, {
    status: 200,
    headers: {
      // CORS — allow any origin to call this endpoint
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      // Cache — tell CDN to cache for 60 seconds
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
      // Custom API version header
      'X-API-Version': '1.0',
    },
  });
}

// Handle CORS preflight requests (browsers send OPTIONS before cross-origin POST)
export async function OPTIONS() {
  return new Response(null, {
    status: 204, // No Content
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}`,
    borderColor: "border-blue-500/20",
    bgColor: "bg-blue-500/5",
  },
  {
    id: "old-vs-new",
    label: "📚 Old pages/api/ vs New app/api/route.ts",
    description:
      "See exactly how the migration from Pages Router API routes to App Router Route Handlers works. Same URL, different file structure and exports.",
    code: `// ─── OLD (pages/api/) ─────────────────────────────────────────────────
// File: pages/api/items.ts  →  URL: /api/items
// Single default export. Uses Node.js-style (req, res) objects.

import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    res.status(200).json({ items: ['apple', 'banana'] });
  } else if (req.method === 'POST') {
    const { name } = req.body;
    res.status(201).json({ id: 1, name });
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end('Method Not Allowed');
  }
}

// ─── NEW (app/api/route.ts) ────────────────────────────────────────────
// File: app/api/items/route.ts  →  URL: /api/items
// Named exports per HTTP method. Uses web-standard Request / Response.

import { NextRequest, NextResponse } from 'next/server';

// Each method is its own function — much cleaner!
export async function GET() {
  return NextResponse.json({ items: ['apple', 'banana'] });
}

export async function POST(request: NextRequest) {
  const { name } = await request.json() as { name: string };
  return NextResponse.json({ id: 1, name }, { status: 201 });
}

// No need to handle "method not allowed" — Next.js does it automatically.
// If the client sends DELETE but you only export GET and POST, Next.js
// returns 405 Method Not Allowed automatically.`,
    borderColor: "border-orange-500/20",
    bgColor: "bg-orange-500/5",
  },
] as const;

// ─── CodeBlock Component ───────────────────────────────────────────────────────
// Renders a styled code example card. Pure display, no interactivity.
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
      {/* Title of this code snippet */}
      <p className="text-xs font-semibold text-gray-300 mb-2">{label}</p>

      {/* What this snippet demonstrates */}
      <p className="text-xs text-gray-500 mb-3 leading-relaxed">{description}</p>

      {/* The actual code block */}
      <pre className="bg-black/40 border border-white/10 rounded-lg p-4 font-mono text-sm text-gray-300 overflow-x-auto leading-relaxed">
        {code}
      </pre>
    </div>
  );
}

// ─── Page Component ────────────────────────────────────────────────────────────
export default function RouteHandlersPage() {
  return (
    <main className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto">

      {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
      <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
        <span className="mx-2" aria-hidden="true">›</span>
        <Link href="/phase-5" className="hover:text-blue-400 transition-colors">Phase 5</Link>
        <span className="mx-2" aria-hidden="true">›</span>
        <span className="text-gray-300">Route Handlers</span>
      </nav>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl" aria-hidden="true">🔌</span>
          <h1 className="text-3xl font-bold text-white">Route Handlers (API Routes)</h1>
        </div>
        <p className="text-gray-400 leading-relaxed max-w-2xl">
          Build server-side API endpoints inside your Next.js app using{" "}
          <code className="text-blue-300 font-mono">route.ts</code> files.
          Handle any HTTP method, read/write cookies, and return JSON — all without a separate backend.
        </p>
      </header>

      {/* ── Quick Reference ──────────────────────────────────────────────────── */}
      {/*
       * A summary of all HTTP methods and what status codes to use.
       * Beginners often return 200 for everything — this corrects that.
       */}
      <section className="mb-10" aria-labelledby="quick-ref">
        <h2 id="quick-ref" className="text-lg font-semibold text-white mb-4">
          HTTP Methods Quick Reference
        </h2>
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="text-left p-3 text-gray-400 font-medium">Method</th>
                <th className="text-left p-3 text-gray-400 font-medium">Purpose</th>
                <th className="text-left p-3 text-gray-400 font-medium">Typical Status</th>
                <th className="text-left p-3 text-gray-400 font-medium">Has Body?</th>
              </tr>
            </thead>
            <tbody>
              {[
                { method: "GET",    purpose: "Read / fetch data",        status: "200 OK",         body: "Response only" },
                { method: "POST",   purpose: "Create a new resource",    status: "201 Created",    body: "Request + Response" },
                { method: "PUT",    purpose: "Replace a resource",       status: "200 OK",         body: "Request + Response" },
                { method: "PATCH",  purpose: "Update part of a resource",status: "200 OK",         body: "Request + Response" },
                { method: "DELETE", purpose: "Remove a resource",        status: "200 OK / 204",   body: "Response only" },
              ].map((row, i) => (
                <tr key={row.method} className={`border-b border-white/5 ${i % 2 === 0 ? "" : "bg-white/2"}`}>
                  <td className="p-3 font-mono font-semibold text-blue-300">{row.method}</td>
                  <td className="p-3 text-gray-400 text-xs">{row.purpose}</td>
                  <td className="p-3 text-green-400 text-xs font-mono">{row.status}</td>
                  <td className="p-3 text-gray-500 text-xs">{row.body}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Live Example Note ────────────────────────────────────────────────── */}
      {/*
       * Point learners to the ACTUAL working route handler in this phase.
       * It's easier to understand theory when you can see it working live.
       */}
      <section className="mb-10 rounded-xl border border-blue-500/20 bg-blue-500/5 p-5" aria-label="Live example">
        <div className="flex items-start gap-3">
          <span className="text-2xl" aria-hidden="true">⚡</span>
          <div>
            <h2 className="text-base font-semibold text-blue-300 mb-2">
              There&apos;s a real working route handler in this phase!
            </h2>
            <p className="text-sm text-gray-400 mb-3 leading-relaxed">
              This phase includes a live route handler at{" "}
              <code className="text-blue-300 font-mono">/phase-5/api/items</code>.
              You can call it right now:
            </p>
            <div className="space-y-2">
              <pre className="bg-black/40 border border-white/10 rounded p-3 font-mono text-xs text-gray-300 overflow-x-auto">
                {`GET /phase-5/api/items           → all items
GET /phase-5/api/items?search=a  → items containing "a"`}
              </pre>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              See the Mini Project lesson to fetch from it in a client component,
              or open the URL directly in your browser.
            </p>
          </div>
        </div>
      </section>

      {/* ── Code Examples ────────────────────────────────────────────────────── */}
      <section className="mb-10" aria-labelledby="examples-heading">
        <h2 id="examples-heading" className="text-lg font-semibold text-white mb-4">Code Examples</h2>
        <div className="space-y-5">
          {CODE_EXAMPLES.map((ex) => (
            <CodeBlock key={ex.id} {...ex} />
          ))}
        </div>
      </section>

      {/* ── Key Rules Summary ────────────────────────────────────────────────── */}
      <section
        className="mb-10 rounded-xl border border-white/10 bg-white/2 p-5"
        aria-labelledby="rules-heading"
      >
        <h2 id="rules-heading" className="text-base font-semibold text-white mb-4">
          Rules to Remember
        </h2>
        <ul className="space-y-2 text-sm text-gray-400">
          {[
            'The file MUST be named route.ts — any other name is ignored.',
            'Export a function named after the HTTP method: GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS.',
            'The function must return a Response (or NextResponse, which extends Response).',
            'In Next.js 15, route params ({ params }) are a Promise — always await them.',
            'cookies() and headers() from next/headers are also async in Next.js 15 — await them.',
            'Reading cookies/headers opts the GET handler into dynamic mode (no caching).',
            'Next.js returns 405 Method Not Allowed automatically for unexported methods.',
            'page.tsx and route.ts can coexist at the same path — they serve different purposes.',
          ].map((rule) => (
            <li key={rule} className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5 shrink-0">→</span>
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Lesson Navigation ────────────────────────────────────────────────── */}
      <div className="flex justify-between text-sm">
        <Link href="/phase-5" className="text-gray-500 hover:text-blue-400 transition-colors">
          ← Phase 5
        </Link>
        <Link href="/phase-5/02-middleware" className="text-blue-400 hover:text-blue-300 transition-colors">
          Middleware →
        </Link>
      </div>
    </main>
  );
}
