/**
 * Phase 4 — Lesson 02: Metadata API
 * Route: /phase-4/02-metadata-api
 *
 * WHAT IS THE METADATA API?
 * ──────────────────────────
 * The Metadata API is Next.js&apos;s built-in system for managing everything
 * that goes inside the HTML <head> tag:
 *   - <title>         → The page title shown in browser tabs and search results
 *   - <meta name="description">  → SEO description (shown under the title in Google)
 *   - Open Graph tags → Control how your link looks when shared on social media
 *   - Twitter Cards   → Twitter-specific sharing preview
 *   - robots          → Tell search engines what to crawl or index
 *   - viewport        → Control mobile display (already handled by Next.js defaults)
 *   - canonical URL   → Prevent duplicate content issues
 *   - JSON-LD         → Structured data for rich search result cards
 *
 * WHY IS THIS BETTER THAN MANAGING <HEAD> MANUALLY?
 * ────────────────────────────────────────────────────
 * In older React apps (e.g. with Create React App), you had to use a library
 * like react-helmet to manage <head> tags. It was error-prone and required
 * careful deduplication.
 *
 * Next.js handles ALL of this for you. You just export a `metadata` object
 * (or a `generateMetadata` function for dynamic cases), and Next.js merges,
 * deduplicates, and injects the correct tags automatically.
 *
 * THE TWO PATTERNS:
 * ──────────────────
 *
 * PATTERN 1: Static Metadata (most common)
 * ─────────────────────────────────────────
 * Use when the metadata is the SAME every time the page loads.
 * (e.g., the About page always has the same title)
 *
 *   export const metadata: Metadata = {
 *     title: 'About Us',
 *     description: 'Learn about our company.',
 *   };
 *
 * PATTERN 2: Dynamic Metadata
 * ────────────────────────────
 * Use when metadata depends on the ROUTE PARAMS or external DATA.
 * (e.g., a blog post page: title should be the post&apos;s title from DB)
 *
 *   export async function generateMetadata({ params }) {
 *     const post = await fetchPost(params.slug);
 *     return {
 *       title: post.title,
 *       description: post.excerpt,
 *     };
 *   }
 *
 * METADATA INHERITANCE (IMPORTANT):
 * ───────────────────────────────────
 * Metadata is MERGED from parent to child. You define base metadata in
 * your root layout.tsx, and each page/layout can OVERRIDE specific fields.
 * Fields not overridden in a child are inherited from the parent.
 *
 * Example:
 *   // app/layout.tsx (root)
 *   export const metadata = { title: { template: '%s | My Site', default: 'My Site' } }
 *
 *   // app/about/page.tsx
 *   export const metadata = { title: 'About' }
 *   // → Final title: "About | My Site"  (template is applied automatically)
 */

import Link from "next/link";
import type { Metadata } from "next";

// ─── Page Metadata ────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "02 — Metadata API | Phase 4",
  description:
    "Learn static metadata, generateMetadata(), Open Graph tags, robots, and JSON-LD structured data in Next.js 15.",
};

// ─── Code Examples ─────────────────────────────────────────────────────────────
// Each example is a template literal string rendered in a <pre> block.
// Keeping them as constants makes the JSX below clean and readable.

const CODE_STATIC_METADATA = `// app/about/page.tsx
// Static metadata — defined at module level, resolved at BUILD TIME.
// Use this for pages where the title/description never changes.

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',                           // → <title>About Us</title>
  description: 'Learn about our company.',     // → <meta name="description">

  // keywords — used by some search engines (minor SEO impact)
  keywords: ['nextjs', 'react', 'web development'],

  // authors — gives credit and can appear in search snippets
  authors: [{ name: 'John Doe', url: 'https://johndoe.dev' }],

  // canonical URL — prevents duplicate content if page is accessible at multiple URLs
  alternates: {
    canonical: '/about',
  },
};

export default function AboutPage() {
  return <main>...</main>;
}`.trim();

const CODE_TITLE_TEMPLATE = `// app/layout.tsx
// Set a title template in the root layout so every page gets "Page | Site Name"
// automatically. The '%s' is replaced by each page's own title.

export const metadata: Metadata = {
  title: {
    template: '%s | My Awesome Site',  // "%s" is replaced by the page's title
    default: 'My Awesome Site',         // fallback if a page has no title
  },
  description: 'Building great web apps with Next.js.',
};

// app/blog/page.tsx
// Now this page just sets 'title: "Blog"' and gets "Blog | My Awesome Site"
export const metadata: Metadata = {
  title: 'Blog',  // → final: "Blog | My Awesome Site"
};`.trim();

const CODE_GENERATE_METADATA = `// app/blog/[slug]/page.tsx
// Dynamic metadata — fetches data based on route params to build the metadata.
// Works just like an async Server Component — you can fetch, await, etc.

import type { Metadata } from 'next';

// Next.js calls generateMetadata() BEFORE rendering the page component.
// It receives the same params object as the page component.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;   // Next.js 15: params is a Promise
}): Promise<Metadata> {
  const { slug } = await params;       // await the params
  const post = await fetchPost(slug);  // fetch data needed for metadata

  if (!post) {
    // Return minimal metadata for 404 pages
    return { title: 'Post Not Found' };
  }

  return {
    title: post.title,
    description: post.excerpt,

    // Open Graph uses the post data for social sharing previews
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [{ url: post.heroImage, alt: post.title }],
      type: 'article',
      publishedTime: post.publishedAt,
    },
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = await fetchPost(slug);
  // ...render the post
}`.trim();

const CODE_OPEN_GRAPH = `// Open Graph (og:) tags control how your page looks when shared
// on Facebook, LinkedIn, Slack, iMessage, and most social platforms.
// Without OG tags, social platforms show a plain text link with no preview.

export const metadata: Metadata = {
  title: 'My Product Launch',

  openGraph: {
    // og:title — headline shown in the preview card
    title: 'My Product Launch',

    // og:description — summary text in the preview card
    description: 'The next-generation tool for web developers.',

    // og:url — canonical URL for this page
    url: 'https://mysite.com/launch',

    // og:site_name — shown as the site source in some platforms
    siteName: 'My Site',

    // og:image — the preview image (aim for 1200×630px)
    images: [
      {
        url: 'https://mysite.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'My Product Launch hero image',
      },
    ],

    // og:type — the content type
    // 'website' for pages, 'article' for blog posts
    type: 'website',

    locale: 'en_US',
  },

  // Twitter Card — Twitter uses its own tags (though it also reads og: tags)
  twitter: {
    card: 'summary_large_image', // shows a big image in the tweet preview
    title: 'My Product Launch',
    description: 'The next-generation tool for web developers.',
    images: ['https://mysite.com/og-image.png'],
    creator: '@mytwitter',       // your Twitter handle
  },
};`.trim();

const CODE_ROBOTS = `// robots metadata controls what search engine crawlers are allowed to do.

export const metadata: Metadata = {
  title: 'Admin Panel',

  // Tell crawlers NOT to index this page and NOT to follow its links.
  // Use for: admin pages, staging sites, thank-you pages after forms.
  robots: {
    index: false,    // false → adds <meta name="robots" content="noindex">
    follow: false,   // false → adds "nofollow"
  },
};

// For public pages you want indexed (this is the default — you don't need to
// explicitly set this unless overriding a parent layout that set noindex):
export const metadata: Metadata = {
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,   // no limit on video preview length
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

// You can also generate a /robots.txt file from Next.js:
// Create app/robots.ts and export a default function that returns a Robots object.`.trim();

const CODE_JSON_LD = `// JSON-LD (Linked Data) structured data helps Google show "rich results"
// in search — things like star ratings, FAQ cards, event cards, breadcrumbs.
// You embed it as a <script type="application/ld+json"> tag.
//
// In Next.js, add it directly in your page/layout component:

export default function ProductPage() {
  // Define the structured data object (schema.org vocabulary)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Wireless Headphones Pro',
    description: 'Premium noise-cancelling wireless headphones.',
    brand: { '@type': 'Brand', name: 'AudioCo' },
    offers: {
      '@type': 'Offer',
      price: '299.99',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '2491',
    },
  };

  return (
    <>
      {/* Inject the JSON-LD script — Next.js handles safe serialisation */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main>{/* page content */}</main>
    </>
  );
}`.trim();

const CODE_METADATA_FIELDS = `// Full reference — all commonly used fields in the Metadata type:

export const metadata: Metadata = {
  // ── Basic ──────────────────────────────────────────────────────
  title: 'Page Title',
  description: 'Page description (160 chars max for SEO).',
  keywords: ['keyword1', 'keyword2'],
  authors: [{ name: 'Jane Doe' }],

  // ── Open Graph ────────────────────────────────────────────────
  openGraph: { title, description, url, siteName, images, type, locale },

  // ── Twitter ───────────────────────────────────────────────────
  twitter: { card, title, description, images, creator },

  // ── Robots ────────────────────────────────────────────────────
  robots: { index: true, follow: true },

  // ── Canonical / alternates ────────────────────────────────────
  alternates: {
    canonical: '/en/page',
    languages: { 'en-US': '/en/page', 'fr-FR': '/fr/page' },
  },

  // ── Icons ─────────────────────────────────────────────────────
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },

  // ── Verification (for Search Console, Bing Webmaster, etc) ────
  verification: {
    google: 'your-google-verification-token',
  },
};`.trim();

// ─── Page Component ────────────────────────────────────────────────────────────
// Server Component — no interactivity needed, pure content display.
export default function MetadataApiPage() {
  return (
    <main className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto">

      {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
      <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
        <span className="mx-2" aria-hidden="true">›</span>
        <Link href="/phase-4" className="hover:text-blue-400 transition-colors">Phase 4</Link>
        <span className="mx-2" aria-hidden="true">›</span>
        <span className="text-gray-300">Metadata API</span>
      </nav>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl font-bold text-blue-400 font-mono" aria-hidden="true">02</span>
          <span className="text-3xl" aria-hidden="true">🏷️</span>
          <h1 className="text-3xl font-bold text-white">Metadata API</h1>
        </div>
        <p className="text-gray-400 max-w-2xl leading-relaxed">
          Control your page&apos;s{" "}
          <code className="text-blue-300 font-mono text-sm">&lt;title&gt;</code>,{" "}
          <code className="text-blue-300 font-mono text-sm">&lt;meta&gt;</code> tags,
          Open Graph previews, and structured data — all from TypeScript, without
          touching HTML directly.
        </p>
      </header>

      {/* ── How Next.js Metadata Works ─────────────────────────────────────── */}
      <section className="mb-10 rounded-xl border border-blue-500/20 bg-blue-500/5 p-5" aria-labelledby="how-heading">
        <h2 id="how-heading" className="text-base font-semibold text-blue-400 mb-3">
          How It Works
        </h2>
        <ul className="space-y-2 text-sm text-gray-300">
          {[
            "You export a `metadata` object (static) or a `generateMetadata()` function (dynamic) from any page.tsx or layout.tsx.",
            "Next.js reads these exports and generates the correct <head> tags at build time or request time.",
            "Metadata is merged from parent layouts down to child pages — you only override what changes.",
            "The root layout.tsx is the best place to set site-wide defaults (title template, base description, Open Graph site name).",
            "You never write <head> tags manually — Next.js handles all deduplication and ordering.",
          ].map((point, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-blue-400 shrink-0 font-bold">{i + 1}.</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Section 1: Static Metadata ─────────────────────────────────────── */}
      <section className="mb-10" aria-labelledby="static-meta-heading">
        <h2 id="static-meta-heading" className="text-xl font-semibold text-white mb-1">
          1. Static Metadata
        </h2>
        <p className="text-gray-400 text-sm mb-4 leading-relaxed">
          The simplest pattern: export a{" "}
          <code className="font-mono text-xs text-blue-300">metadata</code> constant from your page.
          Next.js resolves it once at build time. Use this for pages where the title
          and description are always the same (About, Contact, Pricing, etc.).
        </p>
        <pre className="bg-black/40 border border-white/10 rounded-lg p-4 overflow-x-auto font-mono text-sm text-gray-300">
          <code>{CODE_STATIC_METADATA}</code>
        </pre>
      </section>

      {/* ── Section 2: Title Templates ─────────────────────────────────────── */}
      <section className="mb-10" aria-labelledby="template-heading">
        <h2 id="template-heading" className="text-xl font-semibold text-white mb-1">
          2. Title Templates
        </h2>
        <p className="text-gray-400 text-sm mb-4 leading-relaxed">
          Define a title template in the root layout and every page automatically gets
          &quot;Page Title | Site Name&quot; format. The{" "}
          <code className="font-mono text-xs text-gray-300">%s</code> placeholder is replaced
          by each page&apos;s own title. This is much cleaner than duplicating the site
          name on every page.
        </p>
        <pre className="bg-black/40 border border-white/10 rounded-lg p-4 overflow-x-auto font-mono text-sm text-gray-300">
          <code>{CODE_TITLE_TEMPLATE}</code>
        </pre>
      </section>

      {/* ── Section 3: Dynamic Metadata ────────────────────────────────────── */}
      <section className="mb-10" aria-labelledby="dynamic-meta-heading">
        <h2 id="dynamic-meta-heading" className="text-xl font-semibold text-white mb-1">
          3. Dynamic Metadata with <code className="text-blue-300 font-mono">generateMetadata()</code>
        </h2>
        <p className="text-gray-400 text-sm mb-4 leading-relaxed">
          When the metadata depends on data from a database, CMS, or API — use{" "}
          <code className="font-mono text-xs text-blue-300">generateMetadata()</code>.
          It is an async function that receives the same{" "}
          <code className="font-mono text-xs text-gray-300">params</code> as the page component.
          Next.js calls it before rendering the page and uses the returned object to build
          the <code className="font-mono text-xs text-gray-300">&lt;head&gt;</code>.
        </p>
        {/* Important note about request deduplication */}
        <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3 mb-4 text-xs text-green-300">
          <strong>Performance note:</strong> If{" "}
          <code className="font-mono">generateMetadata()</code> and the page component call the
          same <code className="font-mono">fetch()</code> URL, Next.js automatically deduplicates
          the request — it only hits the network once, even though both functions call it.
        </div>
        <pre className="bg-black/40 border border-white/10 rounded-lg p-4 overflow-x-auto font-mono text-sm text-gray-300">
          <code>{CODE_GENERATE_METADATA}</code>
        </pre>
      </section>

      {/* ── Section 4: Open Graph ──────────────────────────────────────────── */}
      <section className="mb-10" aria-labelledby="og-heading">
        <h2 id="og-heading" className="text-xl font-semibold text-white mb-1">
          4. Open Graph &amp; Twitter Cards
        </h2>
        <p className="text-gray-400 text-sm mb-3 leading-relaxed">
          Open Graph (OG) tags control the preview card that appears when someone shares
          your URL on social media, Slack, or messaging apps. Without OG tags, platforms
          show a plain text link — with them, you get a rich card with image, title, and description.
        </p>
        {/* Visual explanation of what OG tags produce */}
        <div className="rounded-lg border border-white/10 bg-white/2 p-4 mb-4">
          <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wider">Preview card that OG tags produce:</p>
          <div className="rounded-lg border border-white/20 bg-black/40 overflow-hidden max-w-sm">
            {/* Simulated OG image placeholder */}
            <div className="h-24 bg-gradient-to-br from-blue-900/60 to-purple-900/60 flex items-center justify-center">
              <span className="text-gray-400 text-xs">og:image (1200×630px)</span>
            </div>
            <div className="p-3">
              <p className="text-xs text-gray-500">mysite.com</p>
              <p className="text-sm font-semibold text-white">og:title goes here</p>
              <p className="text-xs text-gray-400">og:description — brief summary of the page.</p>
            </div>
          </div>
        </div>
        <pre className="bg-black/40 border border-white/10 rounded-lg p-4 overflow-x-auto font-mono text-sm text-gray-300">
          <code>{CODE_OPEN_GRAPH}</code>
        </pre>
      </section>

      {/* ── Section 5: Robots ────────────────────────────────────────────────── */}
      <section className="mb-10" aria-labelledby="robots-heading">
        <h2 id="robots-heading" className="text-xl font-semibold text-white mb-1">
          5. Robots Meta &amp; Sitemap
        </h2>
        <p className="text-gray-400 text-sm mb-4 leading-relaxed">
          Control which pages search engines are allowed to index.
          Use <code className="font-mono text-xs text-gray-300">robots: &#123; index: false &#125;</code> to
          hide pages like admin panels, staging sites, or post-form thank-you pages from
          search results.
        </p>
        <pre className="bg-black/40 border border-white/10 rounded-lg p-4 overflow-x-auto font-mono text-sm text-gray-300">
          <code>{CODE_ROBOTS}</code>
        </pre>
      </section>

      {/* ── Section 6: JSON-LD Structured Data ─────────────────────────────── */}
      <section className="mb-10" aria-labelledby="jsonld-heading">
        <h2 id="jsonld-heading" className="text-xl font-semibold text-white mb-1">
          6. JSON-LD Structured Data
        </h2>
        <p className="text-gray-400 text-sm mb-3 leading-relaxed">
          JSON-LD (JavaScript Object Notation for Linked Data) is how you tell Google
          about the semantic meaning of your content — whether it&apos;s a product, an
          article, a person, an event, or an FAQ. This powers{" "}
          <em className="text-gray-300">rich results</em> (star ratings, FAQ cards,
          product prices) directly in Google search.
        </p>
        {/* Note: JSON-LD is injected as a script tag, NOT via the metadata export */}
        <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3 mb-4 text-xs text-yellow-300">
          <strong>Note:</strong> JSON-LD is NOT set via the{" "}
          <code className="font-mono">metadata</code> export. It is injected as a{" "}
          <code className="font-mono">&lt;script type=&quot;application/ld+json&quot;&gt;</code> tag
          inside your page or layout JSX.
        </div>
        <pre className="bg-black/40 border border-white/10 rounded-lg p-4 overflow-x-auto font-mono text-sm text-gray-300">
          <code>{CODE_JSON_LD}</code>
        </pre>
      </section>

      {/* ── Section 7: Full Metadata Reference ─────────────────────────────── */}
      <section className="mb-10" aria-labelledby="reference-heading">
        <h2 id="reference-heading" className="text-xl font-semibold text-white mb-1">
          7. Full Metadata Reference
        </h2>
        <p className="text-gray-400 text-sm mb-4 leading-relaxed">
          A quick overview of all the main fields available in the{" "}
          <code className="font-mono text-xs text-blue-300">Metadata</code> type.
        </p>
        <pre className="bg-black/40 border border-white/10 rounded-lg p-4 overflow-x-auto font-mono text-sm text-gray-300">
          <code>{CODE_METADATA_FIELDS}</code>
        </pre>
      </section>

      {/* ── Static vs Dynamic Summary ────────────────────────────────────────── */}
      <section className="mb-10 rounded-xl border border-white/10 bg-white/2 p-5" aria-labelledby="comparison-heading">
        <h2 id="comparison-heading" className="text-base font-semibold text-white mb-4">
          Static vs Dynamic Metadata
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-2 text-gray-500 font-medium text-xs">Aspect</th>
                <th className="text-left p-2 text-blue-400 font-medium text-xs">export const metadata</th>
                <th className="text-left p-2 text-purple-400 font-medium text-xs">generateMetadata()</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {[
                ["When resolved", "Build time (once)", "Per request (dynamic)"],
                ["Can fetch data?", "❌ No async allowed", "✅ Yes, fully async"],
                ["Can read params?", "❌ No access to params", "✅ Yes, via argument"],
                ["Performance", "⚡ Fastest (static)", "Same as page component"],
                ["Use case", "About, Contact, Home", "Blog post, Product, User profile"],
              ].map(([aspect, staticVal, dynamicVal]) => (
                <tr key={aspect}>
                  <td className="p-2 text-gray-500 font-medium">{aspect}</td>
                  <td className="p-2 text-gray-300">{staticVal}</td>
                  <td className="p-2 text-gray-300">{dynamicVal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Lesson Navigation ────────────────────────────────────────────────── */}
      <div className="flex justify-between text-sm">
        <Link href="/phase-4/01-link-router" className="text-gray-500 hover:text-blue-400 transition-colors">
          ← Link &amp; Router
        </Link>
        <Link href="/phase-4/03-loading-error-ui" className="text-blue-400 hover:text-blue-300 transition-colors">
          Loading/Error UI →
        </Link>
      </div>
    </main>
  );
}
