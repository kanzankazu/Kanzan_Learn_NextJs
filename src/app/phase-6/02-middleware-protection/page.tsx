/**
 * Phase 6 — Lesson 02: Middleware Route Protection
 * Route: /phase-6/02-middleware-protection
 *
 * WHAT IS MIDDLEWARE?
 * ─────────────────────
 * Middleware is a function that runs BEFORE a request reaches your page or API route.
 * In Next.js, middleware runs on the Edge Runtime — a lightweight V8 sandbox that is
 * very fast and globally distributed.
 *
 * WHY USE MIDDLEWARE FOR AUTH?
 * - It intercepts the request BEFORE the page component even starts rendering
 * - Unauthenticated users are redirected without any HTML being generated
 * - No server load wasted on users who should not see the page
 * - The check runs at the CDN edge — sub-millisecond latency worldwide
 *
 * NOTE: Code below is a reading reference — next-auth is not installed.
 */

import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "02 — Middleware Protection | Phase 6",
  description: "Learn how to protect Next.js routes with middleware before they render.",
};

export default function MiddlewareProtectionPage() {
  return (
    <main className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto">
      {/* ── Breadcrumb ── */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
        <span className="mx-2">›</span>
        <Link href="/phase-6" className="hover:text-blue-400 transition-colors">Phase 6</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-300">Middleware Protection</span>
      </nav>

      {/* ── Title ── */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="font-mono text-purple-400 text-sm border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 rounded">02</span>
          <h1 className="text-3xl font-bold text-white">Middleware Route Protection</h1>
        </div>
        <p className="text-gray-400 max-w-2xl">
          Middleware intercepts every request before it reaches your pages.
          Learn how to guard routes, redirect unauthenticated users, and enforce role-based access.
        </p>
        <div className="mt-4 rounded-lg border border-yellow-500/30 bg-yellow-500/5 px-4 py-2 text-xs text-yellow-300">
          📚 All code below is a reading reference — next-auth is not installed in this repo.
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 1 — Request lifecycle
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-3">1. Where Middleware Fits in the Request Lifecycle</h2>

        {/* Flow diagram */}
        <div className="rounded-xl border border-white/10 bg-black/20 p-5 mb-4">
          <div className="font-mono text-xs space-y-1 text-gray-400">
            <p><span className="text-blue-400">Browser request</span> → <span className="text-yellow-400">Edge Network</span></p>
            <p className="pl-6">↳ <span className="text-purple-400">middleware.ts</span> runs here (before any page or API)</p>
            <p className="pl-12">↳ if unauthenticated → <span className="text-red-400">redirect to /login</span></p>
            <p className="pl-12">↳ if authenticated → <span className="text-green-400">continue to page</span></p>
            <p className="pl-18 pl-[72px]">↳ <span className="text-blue-400">page.tsx</span> renders</p>
            <p className="pl-18 pl-[72px]">↳ <span className="text-blue-400">API route</span> responds</p>
          </div>
        </div>

        <p className="text-sm text-gray-400">
          Because middleware runs at the edge — before the page component — it adds zero
          rendering overhead. The redirect happens at the network layer, not in React.
        </p>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 2 — middleware.ts placement
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-3">2. File Placement</h2>
        <p className="text-sm text-gray-400 mb-3">
          Middleware lives in a single file at the root of your project (or inside{" "}
          <code className="text-blue-300 bg-white/10 px-1 rounded">src/</code> if you use the src directory).
          Next.js automatically detects it.
        </p>
        <pre className="bg-black/40 border border-white/10 rounded-lg p-4 overflow-x-auto font-mono text-sm text-gray-300">
          {`project/
├── src/
│   ├── middleware.ts   ← HERE (if using src/ directory)
│   └── app/
│       └── ...
└── middleware.ts       ← or HERE (project root, no src/)`}
        </pre>
        <p className="text-xs text-gray-600 mt-2">
          Only ONE middleware.ts file is allowed. It applies to every route unless you filter
          with the <code className="text-gray-400">matcher</code> config.
        </p>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 3 — Basic auth middleware
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-3">3. Basic Auth Guard</h2>
        <p className="text-sm text-gray-400 mb-3">
          The simplest pattern: redirect to{" "}
          <code className="text-blue-300 bg-white/10 px-1 rounded">/login</code> if no session
          is found. Auth.js v5 exposes{" "}
          <code className="text-blue-300 bg-white/10 px-1 rounded">auth</code> as middleware directly.
        </p>
        <pre className="bg-black/40 border border-white/10 rounded-lg p-4 overflow-x-auto font-mono text-sm text-gray-300">
          {`// src/middleware.ts  (Auth.js v5 — simplest form)
export { auth as middleware } from "@/auth";

// The matcher tells Next.js WHICH routes the middleware runs on.
// Without a matcher, middleware runs on EVERY request (including static files — slow!).
export const config = {
  matcher: [
    // Apply to all routes EXCEPT these:
    // - Static files (_next/static, _next/image, favicon.ico)
    // - API routes that do not need auth
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};`}
        </pre>
        <p className="text-xs text-gray-600 mt-2">
          When exported as middleware this way, Auth.js automatically redirects
          unauthenticated users to <code className="text-gray-400">pages.signIn</code> (from your auth.ts config).
        </p>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 4 — withAuth HOC pattern (v4 style, common in codebases)
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-3">4. withAuth HOC Pattern (Auth.js v4)</h2>
        <p className="text-sm text-gray-400 mb-3">
          NextAuth.js v4 used a <code className="text-blue-300 bg-white/10 px-1 rounded">withAuth</code> higher-order
          function to wrap your middleware. You will see this in many existing codebases.
        </p>
        <pre className="bg-black/40 border border-white/10 rounded-lg p-4 overflow-x-auto font-mono text-sm text-gray-300">
          {`// src/middleware.ts  (NextAuth.js v4 style — common in existing projects)
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  // This function runs AFTER withAuth has verified the token exists.
  // At this point, req.nextauth.token is available.
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Role-based access: only admins can access /admin/*
    if (pathname.startsWith("/admin") && token?.role !== "admin") {
      // Redirect non-admins to a "forbidden" page instead of login
      return NextResponse.redirect(new URL("/forbidden", req.url));
    }

    // Allow the request to continue
    return NextResponse.next();
  },
  {
    // callbacks.authorized decides whether the user is "authorized at all"
    // (before our custom logic above runs).
    // Return true if the token exists → user is logged in.
    // Return false → withAuth redirects to the signIn page.
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/profile/:path*"],
};`}
        </pre>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 5 — getToken() for custom middleware logic
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-3">5. getToken() — Custom Middleware Logic</h2>
        <p className="text-sm text-gray-400 mb-3">
          For maximum flexibility, use{" "}
          <code className="text-blue-300 bg-white/10 px-1 rounded">getToken()</code> directly.
          It decrypts the JWT cookie and returns the token payload (what you set in your{" "}
          <code className="text-blue-300 bg-white/10 px-1 rounded">jwt()</code> callback).
        </p>
        <pre className="bg-black/40 border border-white/10 rounded-lg p-4 overflow-x-auto font-mono text-sm text-gray-300">
          {`// src/middleware.ts  (manual approach — most flexible)
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // getToken() decrypts the JWT from the request cookies.
  // Returns null if the cookie is missing or invalid.
  // "secret" must match AUTH_SECRET in your environment.
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
  });

  // ── Route guards ──────────────────────────────────────────────────────

  // 1. Public routes — always allow
  const publicRoutes = ["/", "/login", "/register", "/api/auth"];
  const isPublic = publicRoutes.some((r) => pathname.startsWith(r));
  if (isPublic) return NextResponse.next();

  // 2. All other routes — require a valid token
  if (!token) {
    // Preserve the original URL so we can redirect back after login
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Admin routes — require admin role specifically
  if (pathname.startsWith("/admin") && token.role !== "admin") {
    return NextResponse.redirect(new URL("/forbidden", req.url));
  }

  // 4. Moderator routes — require admin OR moderator
  if (pathname.startsWith("/moderate")) {
    const allowed = ["admin", "moderator"].includes(token.role as string);
    if (!allowed) return NextResponse.redirect(new URL("/forbidden", req.url));
  }

  // ── Add user info to request headers (optional) ───────────────────────
  // This lets your Server Components read user data from headers
  // without calling auth() again.
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-user-id", token.id as string);
  requestHeaders.set("x-user-role", token.role as string);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};`}
        </pre>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 6 — Role-based access patterns
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-4">6. Role-Based Access — Patterns</h2>

        {/* Pattern comparison */}
        <div className="space-y-4">
          {[
            {
              title: "Pattern A: Middleware only (redirect at the edge)",
              desc: "Best for hard gates — user should never see any part of the page. Fastest.",
              code: `// middleware.ts
if (token.role !== "admin") {
  return NextResponse.redirect(new URL("/forbidden", req.url));
}`,
            },
            {
              title: "Pattern B: Middleware + Server Component check",
              desc: "Belt-and-suspenders approach. Middleware blocks the route; page double-checks for safety.",
              code: `// middleware.ts (coarse gate)
if (!token) redirect("/login");

// page.tsx (fine-grained check)
const session = await auth();
if (session.user.role !== "admin") redirect("/forbidden");`,
            },
            {
              title: "Pattern C: Server Component only (no middleware)",
              desc: "Simpler but slower — the page starts rendering before the redirect happens.",
              code: `// page.tsx
const session = await auth();
if (!session) redirect("/login");
if (session.user.role !== "admin") redirect("/forbidden");`,
            },
          ].map(({ title, desc, code }) => (
            <div key={title}>
              <p className="text-sm font-semibold text-white mb-1">{title}</p>
              <p className="text-xs text-gray-500 mb-2">{desc}</p>
              <pre className="bg-black/40 border border-white/10 rounded-lg p-4 overflow-x-auto font-mono text-sm text-gray-300">
                {code}
              </pre>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 7 — matcher config cheat sheet
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-3">7. Matcher Config Cheat Sheet</h2>
        <pre className="bg-black/40 border border-white/10 rounded-lg p-4 overflow-x-auto font-mono text-sm text-gray-300">
          {`export const config = {
  matcher: [
    // Match a single path exactly
    "/dashboard",

    // Match a path and ALL sub-paths
    "/dashboard/:path*",

    // Match multiple specific paths
    "/dashboard/:path*",
    "/admin/:path*",
    "/profile",

    // Match everything EXCEPT specific patterns (negative lookahead)
    // This is the most common pattern — skip static assets
    "/((?!_next/static|_next/image|favicon.ico|api/auth).*)",
  ],
};`}
        </pre>
      </section>

      {/* ── Lesson navigation ── */}
      <div className="mt-10 flex justify-between text-sm">
        <Link href="/phase-6/01-nextauth-setup" className="text-gray-500 hover:text-blue-400 transition-colors">
          ← NextAuth Setup
        </Link>
        <Link href="/phase-6/mini-project" className="text-blue-400 hover:text-blue-300 transition-colors">
          Mini Project →
        </Link>
      </div>
    </main>
  );
}
