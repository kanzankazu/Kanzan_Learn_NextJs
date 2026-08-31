/**
 * Blog Index Page
 * Route: /phase-0/mini-project/blog
 *
 * Lists all categories. Each category is a dynamic segment [category].
 * This is a Server Component — fetches (static) data, no useState needed.
 */

import Link from "next/link";
import { BLOG_DATA } from "../page";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Blog Index — Mini Project" };

export default function BlogIndexPage() {
  return (
    <main className="min-h-screen p-6 md:p-12 max-w-3xl mx-auto">
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/phase-0/mini-project" className="hover:text-blue-400">Mini Project</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-300">Blog</span>
      </nav>

      <h1 className="text-3xl font-bold text-white mb-2">Blog</h1>
      <p className="text-gray-400 mb-8">Browse articles by category.</p>

      {/* Category cards */}
      <div className="space-y-4">
        {Object.entries(BLOG_DATA).map(([slug, data]) => (
          <Link
            key={slug}
            href={`/phase-0/mini-project/blog/${slug}`}
            className="group block rounded-xl border border-white/10 hover:border-blue-500/40 hover:bg-blue-500/5 p-5 transition-all"
          >
            <h2 className="text-lg font-semibold text-white mb-1 group-hover:text-blue-300 transition-colors">
              {data.label}
            </h2>
            <p className="text-sm text-gray-500">
              {data.posts.length} article{data.posts.length !== 1 ? "s" : ""}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
