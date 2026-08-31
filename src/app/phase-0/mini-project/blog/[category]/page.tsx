/**
 * Category Page
 * Route: /phase-0/mini-project/blog/[category]
 *
 * Receives `params.category` — the dynamic segment value.
 * Calls notFound() if the category doesn't exist.
 *
 * NOTE: In Next.js 15, `params` is a Promise. We must `await` it.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { BLOG_DATA, type Category } from "../../page";
import type { Metadata } from "next";

// ─── Dynamic metadata ─────────────────────────────────────────────────────────
// generateMetadata is the async version of the `metadata` export.
// It receives the same params as the page so you can set dynamic titles.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const data = BLOG_DATA[category as Category];
  if (!data) return { title: "Not Found" };
  return { title: `${data.label} Articles — Mini Project` };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  // Always await params in Next.js 15.
  const { category } = await params;

  // Validate: does this category exist in our data?
  const data = BLOG_DATA[category as Category];
  if (!data) {
    // notFound() throws a special error that triggers the nearest not-found.tsx.
    notFound();
  }

  return (
    <main className="min-h-screen p-6 md:p-12 max-w-3xl mx-auto">
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/phase-0/mini-project/blog" className="hover:text-blue-400">Blog</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-300">{data.label}</span>
      </nav>

      <h1 className="text-3xl font-bold text-white mb-2">{data.label}</h1>
      <p className="text-gray-400 mb-8">{data.posts.length} articles in this category.</p>

      <div className="space-y-3">
        {data.posts.map((post) => (
          <Link
            key={post.slug}
            href={`/phase-0/mini-project/blog/${category}/${post.slug}`}
            className="group block rounded-xl border border-white/10 hover:border-blue-500/40 hover:bg-blue-500/5 p-5 transition-all"
          >
            <h2 className="text-base font-semibold text-white mb-1 group-hover:text-blue-300 transition-colors">
              {post.title}
            </h2>
            <p className="text-sm text-gray-500">{post.excerpt}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
