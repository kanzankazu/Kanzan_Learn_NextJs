/**
 * Individual Post Page
 * Route: /phase-0/mini-project/blog/[category]/[slug]
 *
 * Two dynamic segments: `category` and `slug`.
 * Both come from `params` (awaited as a Promise in Next.js 15).
 *
 * Real-world equivalent: fetch post from DB using both category and slug.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { BLOG_DATA, type Category } from "../../../page";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}): Promise<Metadata> {
  const { category, slug } = await params;
  const data = BLOG_DATA[category as Category];
  const post = data?.posts.find((p) => p.slug === slug);
  return { title: post?.title ?? "Not Found" };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  // Await both dynamic segments at once via destructuring.
  const { category, slug } = await params;

  const data = BLOG_DATA[category as Category];
  if (!data) notFound();

  const post = data.posts.find((p) => p.slug === slug);
  if (!post) notFound();

  return (
    <main className="min-h-screen p-6 md:p-12 max-w-3xl mx-auto">
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/phase-0/mini-project/blog" className="hover:text-blue-400">Blog</Link>
        <span className="mx-2">›</span>
        <Link href={`/phase-0/mini-project/blog/${category}`} className="hover:text-blue-400">{data.label}</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-300">{post.title}</span>
      </nav>

      {/* Category badge */}
      <span className="inline-block text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full mb-4">
        {data.label}
      </span>

      <h1 className="text-3xl font-bold text-white mb-3">{post.title}</h1>
      <p className="text-gray-400 text-base leading-relaxed mb-8">{post.excerpt}</p>

      {/*
       * In a real app, `post.body` would be MDX or rich text rendered here.
       * For the mini project, we show a placeholder to demonstrate the structure.
       */}
      <div className="rounded-xl border border-white/10 bg-white/2 p-6 text-sm text-gray-500 italic">
        [Full article content would be rendered here — markdown, MDX, or rich text from a CMS.]
      </div>

      <div className="mt-8">
        <Link
          href={`/phase-0/mini-project/blog/${category}`}
          className="text-sm text-gray-500 hover:text-blue-400 transition-colors"
        >
          ← Back to {data.label}
        </Link>
      </div>
    </main>
  );
}
