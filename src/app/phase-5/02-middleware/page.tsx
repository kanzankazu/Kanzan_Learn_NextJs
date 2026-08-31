/**
 * Lesson 02 — Middleware
 * Route: /phase-5/02-middleware
 *
 * WHAT IS MIDDLEWARE?
 * ────────────────────
 * Middleware is code that runs BEFORE a request is completed — before the page
 * renders or the route handler executes. It intercepts every incoming request
 * that matches its configuration and can:
 *
 *   1. REDIRECT   — send the user to a different URL (auth guards, old URL aliases)
 *   2. REWRITE    — serve a different page/API without changing the URL
 *   3. SET HEADERS — add or modify HTTP headers (CSP, auth tokens, feature flags)
 *   4. RETURN EARLY — respond immediately without rendering the page
 *   5. MODIFY REQUEST — add data to the request before the handler sees it
 *
 * WHERE DOES THE FILE LIVE?
 * ──────────────────────────
 * Middleware is defined in a SINGLE file at the project root:
 *
 *   my-app/
 *   ├── middleware.ts     ← HERE (next to the app/ directory)
 *   ├── app/
 *   │   └── page.tsx
 *   └── package.json
 *
 * There is only ONE middleware.ts per project.
 * You cannot have separate middleware per route — instead, use the matcher
 * config to control which routes the middleware runs on.
 *
 * RUNTIME — Edge vs Node.js:
 * ───────────────────────────
 * Middleware runs on the EDGE runtime by default.
 * Edge = lightweight V8-based environment (NOT full Node.js).
 * This means:
 *   ✅ Super fast — runs close to the user (CDN edge nodes)
 *   ✅ Low latency — no cold start overhead
 *   ❌ Cannot use Node.js built-ins (fs, crypto module, native addons)
 *   ❌ Cannot use most npm packages that rely on Node.js APIs
 *   ❌ Cannot directly query databases (use a fetch to an API route instead)
 *
 * PERFORMANCE:
 * ─────────────
 * Because middleware runs on the Edge, it can intercept and redirect/rewrite
 * requests with almost zero latency — the user never waits for a server response.
 * This makes it ideal for auth guards and locale detection.
 *
 * NOTE ABOUT THIS LESSON:
 * ────────────────────────
 * We do NOT create a real middleware.ts in this learning repo.
 * Middleware affects ALL matching routes across the ENTIRE app.
 * Creating one here could interfere with other phases.
 * All examples below are educational code samples — not live code.
 */

import Link from "next/link";
import type { Metadata } from "next";

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "02 — Middleware",
  description:
    "Learn how Next.js Middleware intercepts requests before they reach a page or API handler. Covers redirects, rewrites, auth guards, and locale detection.",
};

// ─── Code Examples ────────────────────────────────────────────────────────────
const CODE_EXAMPLES = [
  {
    id: "basic-structure",
    label: "📄 Basic middleware.ts structure",
    description:
      "A middleware file exports a single middleware function and optionally a config object. The function receives a NextRequest and returns a NextResponse (or nothing to continue the request).",
    code: `// middleware.ts (at the project root, next to the app/ folder)
//
// This file is AUTOMATICALLY picked up by Next.js — no registration needed.
// Export a function named 'middleware'. That is the convention.

import { NextRequest, NextResponse } from 'next/server';

// The middleware function is called for every request that matches the config.
// It receives: request (NextRequest)
// It must return: a NextResponse (or nothing — then the request continues normally)
export function middleware(request: NextRequest) {
  // request.nextUrl contains the parsed URL: pathname, searchParams, host, etc.
  const { pathname } = request.nextUrl;

  // Example: log every request (for debugging)
  console.log(\`[middleware] \${request.method} \${pathname}\`);

  // If you return nothing (or return NextResponse.next()), the request
  // proceeds normally — the page/handler renders as usual.
  return NextResponse.next();
}

// config controls WHICH routes this middleware runs on.
// Without a matcher, middleware runs on EVERY request (including
// static files like _next/static/ — which is usually NOT what you want).
export const config = {
  matcher: [
    // Match all routes EXCEPT:
    //   - _next/static (built JS/CSS files)
    //   - _next/image (image optimisation)
    //   - favicon.ico, robots.txt
    //   - public folder files (images, fonts, etc.)
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|.*\\.(?:png|jpg|svg|ico)$).*)',
  ],
};`,
    borderColor: "border-gray-500/20",
    bgColor: "bg-gray-500/5",
  },
  {
    id: "auth-guard",
    label: "🔐 Auth guard — redirect unauthenticated users",
    description:
      "The most common middleware use case: check for a session cookie and redirect to /login if the user isn't authenticated. This happens on the edge before any page renders.",
    code: `// middleware.ts
//
// Auth guard pattern:
// 1. Check if the request is for a protected route
// 2. Look for a session cookie
// 3. Redirect to /login if no valid session exists

import { NextRequest, NextResponse } from 'next/server';

// List of routes that require authentication.
// In a real app, you'd typically protect everything under /dashboard, /account, etc.
const PROTECTED_ROUTES = ['/dashboard', '/account', '/settings', '/admin'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the current path is a protected route.
  // startsWith catches nested routes: /dashboard/profile is also protected.
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  // If the route is not protected, let the request through — do nothing.
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Try to read the session cookie.
  // In a real app this would be a JWT or session ID.
  const sessionCookie = request.cookies.get('session');
  const hasSession = !!sessionCookie?.value;

  if (!hasSession) {
    // Build the redirect URL — keep the original path as a 'redirect' param
    // so we can send the user back after they log in.
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);

    // NextResponse.redirect() returns a 3xx response.
    // Default status is 307 (Temporary Redirect).
    return NextResponse.redirect(loginUrl);
    // Use status: 308 for permanent redirects (e.g. old URL aliases)
  }

  // Session exists — let the request continue to the page.
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/account/:path*', '/settings/:path*'],
};`,
    borderColor: "border-red-500/20",
    bgColor: "bg-red-500/5",
  },
  {
    id: "rewrite",
    label: "🔄 URL rewrite — serve different content without changing the URL",
    description:
      "A rewrite changes which page is rendered internally while keeping the URL the user sees unchanged. Useful for A/B testing, feature flags, or multi-tenant apps.",
    code: `// middleware.ts
//
// Rewrite example: A/B testing
// Half of users see the old homepage, half see the new redesign.
// The URL stays the same (/), but the content differs.

import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only apply A/B testing on the homepage
  if (pathname === '/') {
    // Check if the user already has a bucket assignment cookie.
    // This ensures the same user always sees the same variant.
    const bucket = request.cookies.get('ab-bucket')?.value;

    // Assign a new bucket if they don't have one.
    // Math.random() < 0.5 → ~50% chance of each variant.
    const assignedBucket = bucket ?? (Math.random() < 0.5 ? 'a' : 'b');

    if (assignedBucket === 'b') {
      // Rewrite: serve the /home-redesign page but keep the URL as /
      // The user sees / in their browser — they have no idea about /home-redesign.
      const response = NextResponse.rewrite(new URL('/home-redesign', request.url));

      // Set the bucket cookie so this user always sees variant B.
      if (!bucket) {
        response.cookies.set('ab-bucket', 'b', {
          maxAge: 60 * 60 * 24 * 30, // 30 days
        });
      }
      return response;
    }
  }

  return NextResponse.next();
}

// ─── Multi-tenant rewrite example ───────────────────────────────────────────
// Rewrite requests from a subdomain to a specific team's dashboard.
// store-a.myapp.com → /teams/store-a  (still shows store-a.myapp.com in URL)

export function multiTenantMiddleware(request: NextRequest) {
  const hostname = request.headers.get('host') ?? '';
  const subdomain = hostname.split('.')[0]; // e.g. 'store-a' from 'store-a.myapp.com'

  if (subdomain && subdomain !== 'www') {
    const url = request.nextUrl.clone();
    url.pathname = \`/teams/\${subdomain}\${url.pathname}\`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}`,
    borderColor: "border-green-500/20",
    bgColor: "bg-green-500/5",
  },
  {
    id: "headers",
    label: "📋 Set request and response headers",
    description:
      "Middleware can read/modify request headers and add headers to the response. Common uses: inject the current user ID, add Content Security Policy headers, or pass feature flag values.",
    code: `// middleware.ts
//
// Setting headers in middleware:
// 1. Request headers — modified before the page/handler sees the request
// 2. Response headers — added to every response (e.g. security headers)

import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Clone the request headers so we can modify them.
  // (Headers are immutable — we must create a new object.)
  const requestHeaders = new Headers(request.headers);

  // Example: inject the current pathname so Server Components can read it
  // without needing to parse the URL themselves.
  requestHeaders.set('x-pathname', request.nextUrl.pathname);

  // Example: forward a fake user ID (in production, verify a JWT first)
  const sessionToken = request.cookies.get('session')?.value;
  if (sessionToken) {
    requestHeaders.set('x-user-id', \`user_from_\${sessionToken}\`);
  }

  // Create a response that continues the request with the modified headers.
  const response = NextResponse.next({
    request: {
      headers: requestHeaders, // these headers are forwarded to the page/handler
    },
  });

  // Add security headers to EVERY response from this middleware.
  // These protect against common web attacks.
  response.headers.set('X-Frame-Options', 'DENY');         // prevent clickjacking
  response.headers.set('X-Content-Type-Options', 'nosniff'); // prevent MIME sniffing
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline';"
  );

  return response;
}

// ── Reading the injected header in a Server Component ──────────────────────
// In a page or layout, use headers() from next/headers to read what middleware set:
//
// import { headers } from 'next/headers';
//
// export default async function DashboardPage() {
//   const headersList = await headers();
//   const userId = headersList.get('x-user-id');
//   return <div>User: {userId}</div>;
// }`,
    borderColor: "border-blue-500/20",
    bgColor: "bg-blue-500/5",
  },
  {
    id: "locale",
    label: "🌍 Locale detection — redirect to the right language",
    description:
      "Detect the user's preferred language from the Accept-Language header and redirect to the correct locale prefix (/en/, /fr/, etc.).",
    code: `// middleware.ts
//
// Locale detection pattern:
// 1. Check if URL already has a locale prefix (/en/, /fr/, etc.)
// 2. If not, read the Accept-Language header
// 3. Redirect to the appropriate locale prefix

import { NextRequest, NextResponse } from 'next/server';

const SUPPORTED_LOCALES = ['en', 'fr', 'de', 'id'] as const;
type Locale = (typeof SUPPORTED_LOCALES)[number];
const DEFAULT_LOCALE: Locale = 'en';

function getPreferredLocale(request: NextRequest): Locale {
  // The Accept-Language header looks like: "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7"
  const acceptLanguage = request.headers.get('accept-language') ?? '';

  // Split by comma, get the language codes, try to match each one.
  for (const part of acceptLanguage.split(',')) {
    const lang = part.split(';')[0].trim().slice(0, 2).toLowerCase();
    if (SUPPORTED_LOCALES.includes(lang as Locale)) {
      return lang as Locale;
    }
  }

  return DEFAULT_LOCALE;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the URL already starts with a supported locale.
  // /en/about → has locale, skip
  // /about    → no locale, detect and redirect
  const hasLocalePrefix = SUPPORTED_LOCALES.some(
    (locale) => pathname.startsWith(\`/\${locale}/\`) || pathname === \`/\${locale}\`
  );

  if (!hasLocalePrefix) {
    const locale = getPreferredLocale(request);
    // Redirect /about → /en/about (or /fr/about, etc.)
    const redirectUrl = new URL(\`/\${locale}\${pathname}\`, request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Run on all routes except static files and API routes.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};`,
    borderColor: "border-purple-500/20",
    bgColor: "bg-purple-500/5",
  },
  {
    id: "matcher-syntax",
    label: "⚙️ Matcher config — control which routes get middleware",
    description:
      "The config.matcher array uses path patterns to specify which routes trigger middleware. Getting the matcher right is critical — wrong patterns can slow down your whole app.",
    code: `// middleware.ts — matcher examples
//
// The matcher controls which URLs trigger your middleware.
// Use it to avoid running middleware on static assets — that would be slow
// because even /favicon.ico would trigger middleware.

export const config = {
  matcher: [
    // ── Simple exact match ──────────────────────────────────────────────
    '/about',                      // matches /about only
    '/dashboard',                  // matches /dashboard only

    // ── Wildcard subtree ────────────────────────────────────────────────
    '/dashboard/:path*',           // /dashboard, /dashboard/settings, /dashboard/a/b
    '/api/:path*',                 // all API routes

    // ── Negative lookahead (exclude certain paths) ───────────────────
    // This is the most common pattern: run on everything EXCEPT static assets.
    '/((?!_next/static|_next/image|favicon.ico|robots.txt).*)',

    // ── Multiple patterns ───────────────────────────────────────────────
    // You can provide multiple patterns — middleware runs if ANY matches.
    '/dashboard/:path*',
    '/account/:path*',
    '/admin/:path*',
  ],
};

// ── Common mistake: forgetting to exclude _next/static ──────────────────────
//
// BAD — runs middleware on EVERY file request, including JS chunks:
// matcher: ['/:path*']
//
// GOOD — excludes Next.js internals and static assets:
// matcher: ['/((?!_next/static|_next/image|_next/favicon.ico).*)']
//
// ── matcher vs checking inside middleware ────────────────────────────────────
//
// Use matcher to EXCLUDE paths (avoid running at all → best performance).
// Use if statements INSIDE middleware to apply different logic per path.
//
// Example: run middleware on everything except static, but inside the
// function only apply auth guard to /dashboard routes:
//
// export function middleware(req: NextRequest) {
//   if (req.nextUrl.pathname.startsWith('/dashboard')) {
//     // auth guard logic
//   }
//   // other paths: just return NextResponse.next()
//   return NextResponse.next();
// }`,
    borderColor: "border-orange-500/20",
    bgColor: "bg-orange-500/5",
  },
] as const;

// ─── CodeBlock Component ───────────────────────────────────────────────────────
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
export default function MiddlewarePage() {
  return (
    <main className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto">

      {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
      <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
        <span className="mx-2" aria-hidden="true">›</span>
        <Link href="/phase-5" className="hover:text-blue-400 transition-colors">Phase 5</Link>
        <span className="mx-2" aria-hidden="true">›</span>
        <span className="text-gray-300">Middleware</span>
      </nav>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl" aria-hidden="true">🛡️</span>
          <h1 className="text-3xl font-bold text-white">Middleware</h1>
        </div>
        <p className="text-gray-400 leading-relaxed max-w-2xl">
          Intercept every request before it reaches a page or API handler.
          Redirect, rewrite, inject headers — all on the Edge with near-zero latency.
        </p>
      </header>

      {/* ── Warning Banner ───────────────────────────────────────────────────── */}
      {/*
       * This banner is important for learners using this repo.
       * Creating a real middleware.ts would affect ALL phases, not just phase-5.
       * We explain why we only show code samples here.
       */}
      <section
        className="mb-8 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4"
        aria-label="Notice"
      >
        <div className="flex items-start gap-3">
          <span className="text-xl shrink-0" aria-hidden="true">⚠️</span>
          <div>
            <p className="text-sm font-semibold text-yellow-300 mb-1">
              Educational code only — no real middleware.ts created
            </p>
            <p className="text-xs text-gray-400 leading-relaxed">
              Middleware affects ALL matching routes across the ENTIRE app.
              Creating one here could interfere with other phases of this learning repo.
              All examples below are code samples you can copy into a real project.
              In production, place <code className="text-yellow-300 font-mono">middleware.ts</code>{" "}
              next to the <code className="text-yellow-300 font-mono">app/</code> directory.
            </p>
          </div>
        </div>
      </section>

      {/* ── Request Flow Diagram ─────────────────────────────────────────────── */}
      {/*
       * Visual flow showing exactly when middleware runs in the request lifecycle.
       * This is the key mental model — middleware is a "before" hook.
       */}
      <section className="mb-10" aria-labelledby="flow-heading">
        <h2 id="flow-heading" className="text-lg font-semibold text-white mb-4">
          Request Lifecycle with Middleware
        </h2>
        <div className="rounded-xl border border-white/10 bg-white/2 p-5">
          <pre className="font-mono text-sm text-gray-300 overflow-x-auto leading-loose">
{`Browser  ──────────────────────────────────────────────────▶  Browser
   │                                                              ▲
   │ HTTP Request                                                 │ HTML / JSON
   ▼                                                              │
CDN / Edge
   │
   ▼
┌────────────────────────────────┐
│  middleware.ts  (Edge runtime) │  ← runs HERE, before EVERYTHING
│                                │
│  Can: redirect, rewrite,       │
│       set headers, return      │
│       early                    │
└────────────┬───────────────────┘
             │  NextResponse.next() → continue to page/handler
             ▼
┌────────────────────────────────┐
│  Next.js App Router            │
│                                │
│  page.tsx  → renders HTML      │
│  route.ts  → returns JSON      │
└────────────────────────────────┘`}
          </pre>
        </div>
      </section>

      {/* ── What Middleware Can and Cannot Do ────────────────────────────────── */}
      <section className="mb-10" aria-labelledby="capabilities-heading">
        <h2 id="capabilities-heading" className="text-lg font-semibold text-white mb-4">
          Capabilities &amp; Limitations
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Can do */}
          <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
            <h3 className="text-sm font-semibold text-green-400 mb-3">✅ Middleware CAN</h3>
            <ul className="space-y-1.5 text-xs text-gray-400">
              <li className="flex gap-2"><span className="text-green-400 shrink-0">→</span> Redirect to a different URL</li>
              <li className="flex gap-2"><span className="text-green-400 shrink-0">→</span> Rewrite the URL internally</li>
              <li className="flex gap-2"><span className="text-green-400 shrink-0">→</span> Set / read cookies</li>
              <li className="flex gap-2"><span className="text-green-400 shrink-0">→</span> Add / modify request headers</li>
              <li className="flex gap-2"><span className="text-green-400 shrink-0">→</span> Add / modify response headers</li>
              <li className="flex gap-2"><span className="text-green-400 shrink-0">→</span> Return a Response directly (skip page)</li>
              <li className="flex gap-2"><span className="text-green-400 shrink-0">→</span> Call external APIs via fetch()</li>
              <li className="flex gap-2"><span className="text-green-400 shrink-0">→</span> Verify JWT tokens (from a cookie)</li>
            </ul>
          </div>

          {/* Cannot do */}
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
            <h3 className="text-sm font-semibold text-red-400 mb-3">❌ Middleware CANNOT</h3>
            <ul className="space-y-1.5 text-xs text-gray-400">
              <li className="flex gap-2"><span className="text-red-400 shrink-0">→</span> Use Node.js built-ins (fs, path, crypto)</li>
              <li className="flex gap-2"><span className="text-red-400 shrink-0">→</span> Query a database directly (no Prisma/Drizzle)</li>
              <li className="flex gap-2"><span className="text-red-400 shrink-0">→</span> Use most npm packages (Edge ≠ Node)</li>
              <li className="flex gap-2"><span className="text-red-400 shrink-0">→</span> Access the response body of the page</li>
              <li className="flex gap-2"><span className="text-red-400 shrink-0">→</span> Modify the HTML output of a page</li>
              <li className="flex gap-2"><span className="text-red-400 shrink-0">→</span> Use server-only APIs like cache()</li>
              <li className="flex gap-2"><span className="text-red-400 shrink-0">→</span> Run very long tasks (Edge has strict timeout)</li>
            </ul>
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

      {/* ── Key Rules ────────────────────────────────────────────────────────── */}
      <section
        className="mb-10 rounded-xl border border-white/10 bg-white/2 p-5"
        aria-labelledby="rules-heading"
      >
        <h2 id="rules-heading" className="text-base font-semibold text-white mb-4">
          Rules to Remember
        </h2>
        <ul className="space-y-2 text-sm text-gray-400">
          {[
            "Only ONE middleware.ts per project — at the project root (not inside app/).",
            "The file exports a function named 'middleware' and optionally a 'config' object.",
            "Always configure a matcher to avoid running on static files (performance).",
            "Middleware runs on the Edge — no Node.js APIs, no direct DB queries.",
            "Use NextResponse.redirect() for 3xx redirects, .rewrite() for silent URL changes.",
            "Use NextResponse.next() to continue the request (most common return value).",
            "Cookies are available via request.cookies.get() — no need for next/headers.",
            "For complex auth logic: verify a lightweight token (JWT) in middleware, not a DB lookup.",
          ].map((rule) => (
            <li key={rule} className="flex items-start gap-2">
              <span className="text-purple-400 mt-0.5 shrink-0">→</span>
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Lesson Navigation ────────────────────────────────────────────────── */}
      <div className="flex justify-between text-sm">
        <Link href="/phase-5/01-route-handlers" className="text-gray-500 hover:text-blue-400 transition-colors">
          ← Route Handlers
        </Link>
        <Link href="/phase-5/mini-project" className="text-blue-400 hover:text-blue-300 transition-colors">
          Mini Project →
        </Link>
      </div>
    </main>
  );
}
