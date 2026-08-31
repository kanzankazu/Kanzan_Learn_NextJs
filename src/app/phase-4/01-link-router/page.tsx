/**
 * Phase 4 — Lesson 01: Link & Router
 * Route: /phase-4/01-link-router
 *
 * WHAT YOU WILL LEARN:
 * ─────────────────────
 * Next.js provides several ways to navigate between pages. This lesson
 * covers all of them, from the simplest (the <Link> component) to the
 * most powerful (programmatic navigation with useRouter).
 *
 * 1. <Link> COMPONENT
 *    The primary way to navigate in Next.js. It renders as a standard
 *    <a> tag in HTML but adds superpowers: automatic prefetching,
 *    client-side navigation (no full page reload), and scroll restoration.
 *
 *    // Basic usage:
 *    import Link from 'next/link';
 *    <Link href="/about">Go to About</Link>
 *
 *    // The rendered HTML is simply:
 *    // <a href="/about">Go to About</a>
 *    // But internally Next.js intercepts the click and uses the History API.
 *
 * 2. PREFETCHING
 *    When a <Link> is in the viewport (visible on screen), Next.js
 *    automatically fetches the destination page in the background.
 *    This means navigation feels instantaneous — the data is already there.
 *
 *    // Disable prefetching (rarely needed):
 *    <Link href="/about" prefetch={false}>About</Link>
 *
 *    // Note: prefetching only works in production builds.
 *    // In development (npm run dev), it doesn't prefetch.
 *
 * 3. useRouter — PROGRAMMATIC NAVIGATION
 *    For cases where navigation is triggered by code (not a user click on
 *    a link), use the useRouter hook. It gives you methods to push routes,
 *    replace routes, go back, go forward, and refresh.
 *
 *    // 'use client' is REQUIRED for useRouter
 *    import { useRouter } from 'next/navigation';
 *    const router = useRouter();
 *    router.push('/dashboard');    // add to history
 *    router.replace('/login');     // replace history entry
 *    router.back();                // go back
 *    router.refresh();             // re-run server components
 *
 * 4. usePathname — READ THE CURRENT PATH
 *    Returns the current URL pathname as a string.
 *    Perfect for highlighting active nav items or breadcrumbs.
 *
 *    // 'use client' is REQUIRED for usePathname
 *    import { usePathname } from 'next/navigation';
 *    const pathname = usePathname(); // "/phase-4/01-link-router"
 *
 * 5. useSearchParams — READ QUERY STRING
 *    Reads the ?key=value part of the URL.
 *    Must be used inside a Client Component AND inside a <Suspense> boundary.
 *
 *    // 'use client' is REQUIRED for useSearchParams
 *    import { useSearchParams } from 'next/navigation';
 *    const params = useSearchParams();
 *    const tab = params.get('tab'); // reads ?tab=something
 *
 * 6. redirect() — SERVER-SIDE REDIRECT
 *    For redirects that happen on the SERVER (inside Server Components
 *    or Server Actions), use the redirect() function.
 *    It throws a special error that Next.js intercepts to redirect.
 *
 *    // Only valid in Server Components or Server Actions
 *    import { redirect } from 'next/navigation';
 *    if (!user) redirect('/login');
 *
 * <LINK> vs <A> — THE KEY DIFFERENCE:
 * ──────────────────────────────────────
 * Using a plain <a href="/about"> causes a FULL PAGE RELOAD:
 *   - The browser discards all JavaScript state
 *   - The entire page is re-fetched from scratch
 *   - Any client-side state (open modals, scroll position) is lost
 *
 * Using <Link href="/about"> does a CLIENT-SIDE NAVIGATION:
 *   - JavaScript stays running
 *   - Only the changed parts of the page re-render
 *   - State is preserved across pages (in shared layouts)
 *   - Much faster (feels like a SPA)
 *
 * ALWAYS use <Link> inside your Next.js app.
 * Only use <a href> when linking to EXTERNAL websites (outside your app).
 */

import Link from "next/link";
import type { Metadata } from "next";
import RouterDemo from "./_components/RouterDemo";

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "01 — Link & Router | Phase 4",
  description:
    "Learn the Link component, prefetching, useRouter, usePathname, useSearchParams, and redirect() in Next.js 15.",
};

// ─── Code examples as strings ─────────────────────────────────────────────────
// We define code examples as template literal strings here.
// They are rendered in <pre> blocks on the page.
// This is a common teaching pattern for documentation sites.

const CODE_LINK_BASIC = `import Link from 'next/link';

// Basic link — renders as <a href="/about">
<Link href="/about">About Page</Link>

// With className (Tailwind)
<Link href="/about" className="text-blue-400 hover:underline">
  About Page
</Link>

// Link to an external URL — use plain <a> instead
<a href="https://nextjs.org" target="_blank" rel="noopener noreferrer">
  Next.js Docs
</a>`.trim();

const CODE_LINK_PREFETCH = `// Prefetching is ON by default.
// When the <Link> enters the viewport, Next.js fetches the destination page.
// This makes navigation feel instantaneous.

// Disable prefetching for a specific link (rare):
<Link href="/heavy-page" prefetch={false}>Heavy Page</Link>

// prefetch={true}  → always prefetch even if not in viewport
// prefetch={false} → never prefetch
// prefetch        → (default) prefetch when in viewport`.trim();

const CODE_LINK_ACTIVE = `// Highlight the active nav link based on the current pathname.
// usePathname() returns the current URL path.
// MUST be in a 'use client' component.

"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={isActive ? 'text-blue-400 font-bold' : 'text-gray-400 hover:text-white'}
    >
      {children}
    </Link>
  );
}`.trim();

const CODE_ROUTER_BASIC = `// Programmatic navigation — navigate from code, not from a click.
// 'use client' is REQUIRED — useRouter uses browser History API.
// IMPORTANT: import from 'next/navigation', NOT 'next/router'.

"use client";
import { useRouter } from 'next/navigation';

function LoginButton() {
  const router = useRouter();

  async function handleLogin() {
    await loginUser();           // do the async work first
    router.push('/dashboard');   // then navigate on success
  }

  return <button onClick={handleLogin}>Login</button>;
}`.trim();

const CODE_SEARCH_PARAMS = `// Read query string params: /search?q=nextjs&page=2
// useSearchParams MUST be inside a 'use client' component
// AND the component should be wrapped in <Suspense> in its parent.

"use client";
import { useSearchParams } from 'next/navigation';

function SearchResults() {
  const params = useSearchParams();
  const query = params.get('q');    // "nextjs"
  const page  = params.get('page'); // "2" (always a string, not number)

  return <p>Results for: {query} (page {page})</p>;
}

// In Server Components, use the searchParams prop instead:
// export default function Page({ searchParams }) {
//   const { q, page } = await searchParams; // Next.js 15: searchParams is a Promise
// }`.trim();

const CODE_REDIRECT = `// redirect() is for SERVER-SIDE redirects.
// Use it inside Server Components, Route Handlers, or Server Actions.
// It throws a special error that Next.js intercepts — do NOT wrap in try/catch.

import { redirect } from 'next/navigation';

// Example: protect a server component by checking auth
async function ProfilePage() {
  const user = await getUser(); // your auth check
  if (!user) {
    redirect('/login'); // user is not logged in — send to login page
  }
  return <div>Hello, {user.name}</div>;
}

// redirect() vs router.push():
// - redirect()     → SERVER-SIDE, in Server Components/Actions, never in event handlers
// - router.push()  → CLIENT-SIDE, in 'use client' components, in event handlers`.trim();

// ─── Page Component ────────────────────────────────────────────────────────────
// This page is a Server Component — no 'use client' needed here.
// The interactive part (useRouter / usePathname demo) is in RouterDemo.tsx,
// which has 'use client' and is imported as a child component.
export default function LinkRouterPage() {
  return (
    <main className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto">

      {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
      <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
        <span className="mx-2" aria-hidden="true">›</span>
        <Link href="/phase-4" className="hover:text-blue-400 transition-colors">Phase 4</Link>
        <span className="mx-2" aria-hidden="true">›</span>
        <span className="text-gray-300">Link &amp; Router</span>
      </nav>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl font-bold text-blue-400 font-mono" aria-hidden="true">01</span>
          <span className="text-3xl" aria-hidden="true">🔗</span>
          <h1 className="text-3xl font-bold text-white">Link &amp; Router</h1>
        </div>
        <p className="text-gray-400 max-w-2xl leading-relaxed">
          The <code className="text-blue-300 font-mono text-sm">&lt;Link&gt;</code> component
          is the building block of all navigation in Next.js. Combine it with{" "}
          <code className="text-blue-300 font-mono text-sm">useRouter</code> and{" "}
          <code className="text-blue-300 font-mono text-sm">usePathname</code> for full
          control over how users move around your app.
        </p>
      </header>

      {/* ── Section 1: Link component basics ─────────────────────────────── */}
      <section className="mb-10" aria-labelledby="link-basic-heading">
        <h2 id="link-basic-heading" className="text-xl font-semibold text-white mb-1">
          1. The <code className="text-blue-300 font-mono">&lt;Link&gt;</code> Component
        </h2>
        <p className="text-gray-400 text-sm mb-4 leading-relaxed">
          Import from <code className="text-blue-300 font-mono text-xs">next/link</code>.
          It renders as a standard HTML <code className="font-mono text-xs text-gray-300">&lt;a&gt;</code> tag,
          but intercepts clicks to perform client-side navigation — no full page reload.
          Use plain <code className="font-mono text-xs text-gray-300">&lt;a href&gt;</code> only for
          links that leave your app entirely (external URLs).
        </p>
        <pre className="bg-black/40 border border-white/10 rounded-lg p-4 overflow-x-auto font-mono text-sm text-gray-300">
          <code>{CODE_LINK_BASIC}</code>
        </pre>
      </section>

      {/* ── Section 2: Prefetching ────────────────────────────────────────── */}
      <section className="mb-10" aria-labelledby="prefetch-heading">
        <h2 id="prefetch-heading" className="text-xl font-semibold text-white mb-1">
          2. Prefetching
        </h2>
        <p className="text-gray-400 text-sm mb-3 leading-relaxed">
          When a <code className="font-mono text-xs text-blue-300">&lt;Link&gt;</code> scrolls
          into the user&apos;s viewport, Next.js silently fetches the destination page&apos;s
          JavaScript and data in the background. By the time the user clicks, the page is
          already loaded — navigation feels instant.
        </p>
        {/* Key point callout */}
        <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3 mb-4 text-xs text-yellow-300">
          <strong>Note:</strong> Prefetching only works in production builds (<code className="font-mono">npm run build &amp;&amp; npm start</code>).
          In development (<code className="font-mono">npm run dev</code>), prefetching is disabled so you can
          see actual loading states.
        </div>
        <pre className="bg-black/40 border border-white/10 rounded-lg p-4 overflow-x-auto font-mono text-sm text-gray-300">
          <code>{CODE_LINK_PREFETCH}</code>
        </pre>
      </section>

      {/* ── Section 3: Active links with usePathname ────────────────────── */}
      <section className="mb-10" aria-labelledby="active-link-heading">
        <h2 id="active-link-heading" className="text-xl font-semibold text-white mb-1">
          3. Active Links with <code className="text-blue-300 font-mono">usePathname()</code>
        </h2>
        <p className="text-gray-400 text-sm mb-4 leading-relaxed">
          A common pattern is to highlight the navigation link that matches the current page.
          <code className="font-mono text-xs text-blue-300 ml-1">usePathname()</code> returns
          the current URL path, so you can compare it to each link&apos;s href and apply an
          active style. This hook requires{" "}
          <code className="font-mono text-xs text-gray-300">&apos;use client&apos;</code>.
        </p>
        <pre className="bg-black/40 border border-white/10 rounded-lg p-4 overflow-x-auto font-mono text-sm text-gray-300">
          <code>{CODE_LINK_ACTIVE}</code>
        </pre>
      </section>

      {/* ── Section 4: useRouter programmatic navigation ─────────────────── */}
      <section className="mb-10" aria-labelledby="router-heading">
        <h2 id="router-heading" className="text-xl font-semibold text-white mb-1">
          4. Programmatic Navigation with <code className="text-blue-300 font-mono">useRouter()</code>
        </h2>
        <p className="text-gray-400 text-sm mb-4 leading-relaxed">
          When you need to navigate as a result of code (not a direct click on a Link),
          use <code className="font-mono text-xs text-blue-300">useRouter()</code>.
          Common scenarios: navigate after form submission, redirect on login/logout,
          or navigate after an async operation completes.
        </p>

        {/* Important import warning */}
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 mb-4 text-xs text-red-300">
          <strong>Common mistake:</strong> Do NOT import from{" "}
          <code className="font-mono">&apos;next/router&apos;</code> — that is the OLD Pages Router.
          Always import from <code className="font-mono">&apos;next/navigation&apos;</code> in the App Router.
        </div>

        <pre className="bg-black/40 border border-white/10 rounded-lg p-4 overflow-x-auto font-mono text-sm text-gray-300 mb-4">
          <code>{CODE_ROUTER_BASIC}</code>
        </pre>
      </section>

      {/* ── Section 5: useSearchParams ────────────────────────────────────── */}
      <section className="mb-10" aria-labelledby="search-params-heading">
        <h2 id="search-params-heading" className="text-xl font-semibold text-white mb-1">
          5. Reading Query Strings with <code className="text-blue-300 font-mono">useSearchParams()</code>
        </h2>
        <p className="text-gray-400 text-sm mb-4 leading-relaxed">
          Query strings (the <code className="font-mono text-xs text-gray-300">?key=value</code> part of a URL)
          are common for filtering, sorting, and pagination.{" "}
          <code className="font-mono text-xs text-blue-300">useSearchParams()</code> reads them
          on the client. In Server Components, use the{" "}
          <code className="font-mono text-xs text-gray-300">searchParams</code> prop instead.
        </p>
        <pre className="bg-black/40 border border-white/10 rounded-lg p-4 overflow-x-auto font-mono text-sm text-gray-300">
          <code>{CODE_SEARCH_PARAMS}</code>
        </pre>
      </section>

      {/* ── Section 6: redirect() (server-side) ─────────────────────────── */}
      <section className="mb-10" aria-labelledby="redirect-heading">
        <h2 id="redirect-heading" className="text-xl font-semibold text-white mb-1">
          6. Server-Side Redirects with <code className="text-blue-300 font-mono">redirect()</code>
        </h2>
        <p className="text-gray-400 text-sm mb-4 leading-relaxed">
          For redirects that happen before the page is sent to the browser
          (e.g., auth guards in Server Components), use{" "}
          <code className="font-mono text-xs text-blue-300">redirect()</code> from{" "}
          <code className="font-mono text-xs text-gray-300">&apos;next/navigation&apos;</code>.
          It works on the server and throws internally — never wrap it in try/catch.
        </p>
        <pre className="bg-black/40 border border-white/10 rounded-lg p-4 overflow-x-auto font-mono text-sm text-gray-300">
          <code>{CODE_REDIRECT}</code>
        </pre>
      </section>

      {/* ── Section 7: Interactive Demo ─────────────────────────────────────
       * RouterDemo is a 'use client' component — it uses usePathname and useRouter.
       * The page itself stays a Server Component; only the demo island is client-side.
       * This is the "Server Shell + Client Island" pattern.
       */}
      <section className="mb-10" aria-labelledby="demo-heading">
        <h2 id="demo-heading" className="text-xl font-semibold text-white mb-3">
          Live Demo — Router Hooks in Action
        </h2>
        <p className="text-gray-400 text-sm mb-5 leading-relaxed">
          The component below is a{" "}
          <code className="font-mono text-xs text-blue-300">&apos;use client&apos;</code> component
          imported into this Server Component page. It demonstrates{" "}
          <code className="font-mono text-xs text-blue-300">usePathname()</code> and all four{" "}
          <code className="font-mono text-xs text-blue-300">useRouter()</code> methods.
        </p>
        {/* RouterDemo is the Client Component — see _components/RouterDemo.tsx */}
        <RouterDemo />
      </section>

      {/* ── Summary ─────────────────────────────────────────────────────────── */}
      <section className="mb-10 rounded-xl border border-white/10 bg-white/2 p-5" aria-labelledby="summary-heading">
        <h2 id="summary-heading" className="text-base font-semibold text-white mb-3">
          Quick Reference
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-2 text-gray-500 font-medium">Tool</th>
                <th className="text-left p-2 text-gray-500 font-medium">Where</th>
                <th className="text-left p-2 text-gray-500 font-medium">Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[
                ["<Link href='...'>", "Server or Client", "Declarative navigation (renders <a>)"],
                ["usePathname()", "Client only", "Read current URL path"],
                ["useRouter().push()", "Client only", "Navigate forward (adds to history)"],
                ["useRouter().replace()", "Client only", "Navigate, replace history entry"],
                ["useRouter().back()", "Client only", "Go back in browser history"],
                ["useRouter().refresh()", "Client only", "Re-run Server Components on current page"],
                ["useSearchParams()", "Client only", "Read ?key=value query string"],
                ["redirect(href)", "Server only", "Server-side redirect before page renders"],
              ].map(([tool, where, purpose]) => (
                <tr key={tool}>
                  <td className="p-2 font-mono text-blue-300">{tool}</td>
                  <td className="p-2 text-gray-500">{where}</td>
                  <td className="p-2 text-gray-400">{purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Lesson Navigation ────────────────────────────────────────────────── */}
      <div className="flex justify-between text-sm">
        <Link href="/phase-4" className="text-gray-500 hover:text-blue-400 transition-colors">
          ← Phase 4
        </Link>
        <Link href="/phase-4/02-metadata-api" className="text-blue-400 hover:text-blue-300 transition-colors">
          Metadata API →
        </Link>
      </div>
    </main>
  );
}
