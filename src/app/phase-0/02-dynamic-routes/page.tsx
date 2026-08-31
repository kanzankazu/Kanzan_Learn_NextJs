/**
 * Lesson 02 — Dynamic Routes
 * Route: /phase-0/02-dynamic-routes
 *
 * WHAT ARE DYNAMIC ROUTES?
 * ─────────────────────────
 * Sometimes you can't know the URL ahead of time.
 * e.g., /blog/hello-world, /blog/nextjs-is-awesome — the slug changes each time.
 *
 * Next.js solves this with dynamic segments — folder names wrapped in square brackets.
 *
 * THREE VARIANTS:
 * ───────────────
 * 1. [slug]          → matches ONE segment:   /blog/hello   (slug = "hello")
 * 2. [...slug]       → matches ONE OR MORE:   /blog/a/b/c   (slug = ["a","b","c"])
 * 3. [[...slug]]     → matches ZERO OR MORE:  /blog         (slug = undefined)
 *                                              /blog/a/b     (slug = ["a","b"])
 *
 * WHERE DOES THE SLUG VALUE COME FROM?
 * ──────────────────────────────────────
 * Next.js passes it as `params` to your page component.
 * In Next.js 15, params is a Promise — you must await it.
 *
 * EXAMPLE:
 *   // app/blog/[slug]/page.tsx
 *   export default async function BlogPost({ params }) {
 *     const { slug } = await params;   // e.g., "hello-world"
 *     return <h1>{slug}</h1>;
 *   }
 */

import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "02 — Dynamic Routes",
};

// ─── Comparison table data ─────────────────────────────────────────────────────
const VARIANTS = [
  {
    syntax: "[slug]",
    matches: "Exactly one segment",
    examples: ["/blog/hello → { slug: 'hello' }", "/blog/world → { slug: 'world' }"],
    doesNotMatch: "/blog (no segment), /blog/a/b (two segments)",
    color: "text-blue-400",
  },
  {
    syntax: "[...slug]",
    matches: "One or more segments",
    examples: ["/docs/a → { slug: ['a'] }", "/docs/a/b/c → { slug: ['a','b','c'] }"],
    doesNotMatch: "/docs (zero segments — use [[...slug]] for that)",
    color: "text-purple-400",
  },
  {
    syntax: "[[...slug]]",
    matches: "Zero or more segments",
    examples: ["/shop → { slug: undefined }", "/shop/hats → { slug: ['hats'] }", "/shop/hats/blue → { slug: ['hats','blue'] }"],
    doesNotMatch: "Nothing — this catches everything",
    color: "text-green-400",
  },
];

// ─── Code snippet component ────────────────────────────────────────────────────
function CodeBlock({ code, lang = "tsx" }: { code: string; lang?: string }) {
  return (
    <div className="rounded-lg bg-black/40 border border-white/10 overflow-x-auto">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
        <span className="text-xs text-gray-500 font-mono">{lang}</span>
      </div>
      <pre className="p-4 text-sm text-gray-300 font-mono leading-relaxed">{code}</pre>
    </div>
  );
}

export default function Lesson02Page() {
  return (
    <main className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto">

      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
        <span className="mx-2">›</span>
        <Link href="/phase-0" className="hover:text-blue-400 transition-colors">Phase 0</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-300">Dynamic Routes</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dynamic Routes</h1>
        <p className="text-gray-400">
          Match variable URL segments using <code className="text-blue-300 bg-white/10 px-1 rounded">[param]</code> folder names.
        </p>
      </header>

      {/* Variants */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-white mb-4">Three Dynamic Variants</h2>
        <div className="space-y-4">
          {VARIANTS.map((v) => (
            <div key={v.syntax} className="rounded-xl border border-white/10 p-5">
              <code className={`font-mono font-bold text-lg ${v.color} block mb-1`}>{v.syntax}</code>
              <p className="text-sm text-gray-400 mb-2 font-medium">{v.matches}</p>
              <div className="space-y-1 mb-2">
                {v.examples.map((ex) => (
                  <p key={ex} className="text-xs font-mono text-green-400">✓ {ex}</p>
                ))}
              </div>
              <p className="text-xs text-red-400/70">✗ Does not match: {v.doesNotMatch}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Code example: reading params */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-white mb-4">Reading params in a Page</h2>
        <p className="text-sm text-gray-400 mb-3">
          In Next.js 15, <code className="text-blue-300">params</code> is a <strong>Promise</strong>.
          Always <code className="text-blue-300">await</code> it — or TypeScript will complain.
        </p>
        <CodeBlock lang="app/blog/[slug]/page.tsx" code={`// This file lives at: app/blog/[slug]/page.tsx
// It handles routes like: /blog/hello, /blog/nextjs-routing, etc.

import { notFound } from "next/navigation";

// Simulate a database of posts.
// In a real app, you'd fetch this from a DB or CMS.
const POSTS: Record<string, { title: string; body: string }> = {
  hello: { title: "Hello World", body: "My first post!" },
  routing: { title: "Next.js Routing", body: "File-based routing is great." },
};

// The 'params' prop contains the dynamic segment values.
// In Next.js 15, params is a Promise — must be awaited.
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // Await the params before using them.
  const { slug } = await params;

  // Look up the post. If not found, trigger the 404 page.
  const post = POSTS[slug];
  if (!post) {
    notFound(); // renders app/blog/[slug]/not-found.tsx if it exists
  }

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.body}</p>
    </article>
  );
}`} />
      </section>

      {/* generateStaticParams */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-white mb-4">
          <code className="text-green-400">generateStaticParams</code> — Pre-generate at Build Time
        </h2>
        <p className="text-sm text-gray-400 mb-3">
          For SSG (static generation), tell Next.js which slugs exist so it can
          pre-render them at build time instead of on every request.
        </p>
        <CodeBlock lang="app/blog/[slug]/page.tsx" code={`// Export this function alongside your page component.
// Next.js calls it at build time to know which slugs to pre-render.
export async function generateStaticParams() {
  // In a real app, fetch this list from your CMS/database.
  const posts = ["hello", "routing", "nextjs-is-great"];

  // Return an array of param objects.
  // Each object must match the dynamic segment names in your folder.
  return posts.map((slug) => ({ slug }));
  // Result: [{slug:"hello"}, {slug:"routing"}, {slug:"nextjs-is-great"}]
}

// Next.js will pre-render /blog/hello, /blog/routing, /blog/nextjs-is-great
// at build time. Other slugs will 404 (or be rendered on-demand if you set
// dynamicParams = true in the segment config).`} />
      </section>

      {/* searchParams */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-white mb-4">
          <code className="text-yellow-400">searchParams</code> — Query Strings
        </h2>
        <p className="text-sm text-gray-400 mb-3">
          Query string params (<code className="text-gray-300">?page=2&sort=asc</code>) come from
          a separate <code className="text-yellow-300">searchParams</code> prop, not <code className="text-blue-300">params</code>.
        </p>
        <CodeBlock lang="app/products/page.tsx" code={`// Route: /products?page=2&sort=price
// searchParams is also a Promise in Next.js 15.

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; sort?: string }>;
}) {
  const { page = "1", sort = "name" } = await searchParams;

  return (
    <div>
      <p>Page: {page}</p>
      <p>Sort: {sort}</p>
    </div>
  );
}`} />
      </section>

      {/* Navigation */}
      <div className="flex justify-between text-sm mt-8">
        <Link href="/phase-0/01-app-router-structure" className="text-gray-500 hover:text-blue-400 transition-colors">
          ← App Router Structure
        </Link>
        <Link href="/phase-0/03-route-groups" className="text-blue-400 hover:text-blue-300 transition-colors">
          Next: Route Groups →
        </Link>
      </div>
    </main>
  );
}
