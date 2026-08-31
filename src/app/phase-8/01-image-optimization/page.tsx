/**
 * Lesson 01 — Image Optimization with next/image
 * Route: /phase-8/01-image-optimization
 *
 * WHY DO IMAGES NEED OPTIMIZATION?
 * ──────────────────────────────────
 * Images are typically 60-80% of a page's total download size.
 * A single unoptimized hero image can be 3-5 MB and take 5+ seconds
 * to load on a mobile connection. That kills your:
 *
 *   - LCP (Largest Contentful Paint): Google measures how fast the biggest
 *     visible element appears. A slow-loading hero image = bad LCP score.
 *
 *   - CLS (Cumulative Layout Shift): If you don't reserve space for an image
 *     before it loads, the page "jumps" when the image pops in.
 *     This is incredibly annoying for users and penalised by Google.
 *
 *   - User experience: 53% of mobile users abandon a page that takes
 *     more than 3 seconds to load (Google research).
 *
 * HOW DOES next/image SOLVE THESE?
 * ─────────────────────────────────
 * The <Image> component from 'next/image' automatically:
 *
 *   1. RESIZES: Generates multiple sizes at build time / on demand.
 *      A desktop browser downloads a large image; a mobile browser
 *      downloads a small one. Native <img> always downloads full size.
 *
 *   2. FORMAT CONVERSION: Converts images to WebP (or AVIF), which is
 *      25-34% smaller than JPEG at the same quality. Done automatically
 *      based on what the browser supports.
 *
 *   3. LAZY LOADING: Images below the fold are NOT loaded until the user
 *      scrolls near them. This makes the initial page load much faster.
 *
 *   4. PREVENTS CLS: Requires you to provide width and height (or use fill).
 *      This lets the browser reserve the correct space BEFORE the image loads,
 *      so the page never jumps.
 *
 *   5. BLUR PLACEHOLDER: Shows a tiny blurred version of the image while
 *      the full image loads. Much better UX than an empty white box.
 *
 * KEY PROPS:
 * ──────────
 *   src        — The image URL (local import or remote string)
 *   width      — The intrinsic width in pixels (required unless using fill)
 *   height     — The intrinsic height in pixels (required unless using fill)
 *   alt        — Accessibility alt text (ALWAYS required)
 *   priority   — Set to true for above-the-fold images (hero, LCP image)
 *                Disables lazy loading and adds preload link in <head>
 *   sizes      — Responsive hints for the browser (like srcset)
 *   fill       — Makes image fill its parent container (use for background-style images)
 *   quality    — JPEG quality 1-100, default 75. Higher = larger file.
 *   placeholder — 'blur' shows blurred preview. 'empty' shows nothing.
 *
 * REMOTE PATTERNS (next.config.ts):
 * ───────────────────────────────────
 * For security, Next.js only optimizes remote images from domains you explicitly
 * allow in next.config.ts. Without this config, remote images throw an error.
 */

import Link from "next/link";
import type { Metadata } from "next";

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "01 — Image Optimization",
  description:
    "Learn next/image: automatic resizing, WebP conversion, lazy loading, and CLS prevention. Fix your LCP score.",
};

// ─── Code Examples ────────────────────────────────────────────────────────────
// IMPORTANT: We show code as STRINGS in <pre> blocks.
// We do NOT import next/image here because this is a learning demo —
// no actual images exist in this repo to display.
const CODE_EXAMPLES = [
  {
    id: "basic",
    label: "1. Basic usage — width + height required",
    description:
      "The most common pattern. Always provide width and height so the browser can reserve space before the image loads (prevents CLS). The values should match the image's intrinsic dimensions, not the CSS display size.",
    code: `// app/blog/page.tsx
import Image from 'next/image';

// WHY: next/image needs width + height to calculate the aspect ratio
// and reserve the correct amount of space in the layout BEFORE the
// image finishes downloading. This prevents CLS (layout jump).
//
// These values are the NATURAL size of the image file, NOT the CSS size.
// CSS size is controlled separately via className.

export default function BlogPage() {
  return (
    <article>
      <Image
        src="/photos/hero.jpg"        // Local: place in /public folder
        alt="A mountain landscape"    // ALWAYS required — screen reader text
        width={1200}                  // Natural width of the image file
        height={630}                  // Natural height of the image file
        className="w-full h-auto"     // CSS display size (Tailwind)
      />
    </article>
  );
}`,
    borderColor: "border-blue-500/20",
    bgColor: "bg-blue-500/5",
  },
  {
    id: "priority",
    label: "2. priority prop — Fix your LCP score",
    description:
      "Any image visible when the page first loads (above the fold) should have priority. This disables lazy loading for that image and adds a <link rel='preload'> to the <head>, telling the browser to fetch it immediately — critical for LCP.",
    code: `// app/page.tsx — Hero image above the fold
import Image from 'next/image';

export default function HomePage() {
  return (
    <section>
      {/*
       * WHY priority?
       * Without it: the browser discovers this image AFTER parsing HTML,
       *             so it starts loading late → slow LCP.
       * With it:    Next.js injects <link rel="preload"> in <head>, so
       *             the browser fetches the image IMMEDIATELY, in parallel
       *             with HTML parsing → fast LCP.
       *
       * RULE: Use priority on the FIRST visible image on every page.
       * Never use priority on images below the fold (wastes bandwidth).
       */}
      <Image
        src="/hero.jpg"
        alt="App hero banner"
        width={1440}
        height={800}
        priority            // Preload this image — it is the LCP element
        className="w-full h-64 object-cover"
      />
    </section>
  );
}`,
    borderColor: "border-green-500/20",
    bgColor: "bg-green-500/5",
  },
  {
    id: "sizes",
    label: "3. sizes prop — Responsive images",
    description:
      "The sizes prop tells the browser how wide the image will be at different viewport sizes. Next.js uses this to generate and serve the correct image size, avoiding downloading a full 1400px image on a 375px phone.",
    code: `// Card component that is full-width on mobile, 1/3 on desktop
import Image from 'next/image';

export default function ProductCard() {
  return (
    <div className="md:w-1/3">
      <Image
        src="/product.jpg"
        alt="Product photo"
        width={600}
        height={400}

        /*
         * WHAT sizes means:
         * "At viewport ≥ 768px (md), this image takes 33vw (33% of viewport).
         *  Below that, it takes 100vw (full width)."
         *
         * WHY this matters:
         * Without sizes: Next.js assumes 100vw → always downloads a large image.
         * With sizes:    On a 375px phone, image is 375px wide → downloads ~400px
         *               version. On a 1200px desktop, 1/3 of 1200px = 400px wide
         *               → downloads ~400px version. Major bandwidth savings.
         */
        sizes="(min-width: 768px) 33vw, 100vw"

        className="w-full h-auto object-cover"
      />
    </div>
  );
}`,
    borderColor: "border-purple-500/20",
    bgColor: "bg-purple-500/5",
  },
  {
    id: "fill",
    label: "4. fill layout — Background-style images",
    description:
      "When you want an image to fill its parent container (like CSS background-size: cover), use fill instead of width/height. The parent MUST have position: relative and a defined height.",
    code: `// Full-bleed cover image pattern
import Image from 'next/image';

export default function CoverImage() {
  return (
    /*
     * WHY these styles on the parent?
     *   position: relative  — fill uses absolute positioning internally
     *   height + width      — the container MUST have defined dimensions
     *                         so fill knows how big to make the image
     *
     * The 'fill' prop makes the image absolutely positioned to cover
     * its nearest position:relative ancestor.
     */
    <div className="relative w-full h-64">
      <Image
        src="/cover.jpg"
        alt="Cover image"
        fill                              // No width/height — fills the parent
        sizes="100vw"                     // This image spans the full viewport width
        className="object-cover"          // CSS: cover (crop to fill) vs contain (letterbox)
        priority
      />
    </div>
  );
}

// COMMON MISTAKE — forgetting position:relative on parent:
// <div className="h-64">          ← WRONG: no position:relative
//   <Image fill ... />            ← Image will position relative to the page!
// </div>`,
    borderColor: "border-orange-500/20",
    bgColor: "bg-orange-500/5",
  },
  {
    id: "placeholder",
    label: "5. placeholder='blur' — Smooth loading experience",
    description:
      "For local images, Next.js generates a tiny blurred preview automatically. For remote images, you must provide the blurDataURL yourself (a base64 string). Much better UX than a jarring empty-to-full transition.",
    code: `import Image from 'next/image';
// For LOCAL images, Next.js auto-generates the blur placeholder
import localImage from '@/public/photo.jpg';

// ── Local image — blur is automatic ─────────────────────────────────────────
export function LocalWithBlur() {
  return (
    <Image
      src={localImage}             // Static import — Next.js analyses the file at build time
      alt="Local photo"
      placeholder="blur"           // Next.js auto-generates blurDataURL from the imported image
      className="w-full h-auto"
    />
  );
}

// ── Remote image — you must provide blurDataURL manually ─────────────────────
// Generate a base64 placeholder at: https://blurha.sh or any online tool
const blurPlaceholder =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDA...'; // truncated

export function RemoteWithBlur() {
  return (
    <Image
      src="https://images.unsplash.com/photo-123?w=1200"
      alt="Remote photo"
      width={1200}
      height={800}
      placeholder="blur"
      blurDataURL={blurPlaceholder} // Required for remote images
    />
  );
}`,
    borderColor: "border-cyan-500/20",
    bgColor: "bg-cyan-500/5",
  },
  {
    id: "remote-patterns",
    label: "6. Remote patterns in next.config.ts — Security allowlist",
    description:
      "Next.js blocks remote image optimization by default to prevent abuse (anyone could use your server to optimize their images). You must explicitly allowlist the domains your app fetches images from.",
    code: `// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    /*
     * WHY remotePatterns?
     * Without this config, any <Image src="https://..." /> throws:
     *   Error: Invalid src ... hostname ... is not configured under images.remotePatterns
     *
     * Each pattern object specifies which URLs are allowed.
     * Use the MOST SPECIFIC pattern you can (hostname + pathname prefix).
     */
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        // No pathname = any path on this hostname is allowed
      },
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',  // ** = wildcard subdomain
        pathname: '/my-account/**',      // Only images under /my-account/
      },
      {
        protocol: 'https',
        hostname: 'cdn.example.com',
        port: '',                        // Empty string = default port (443)
        pathname: '/images/**',          // Only /images/ folder
      },
    ],
  },
};

export default nextConfig;

// MIGRATION NOTE:
// The old 'domains' array config is DEPRECATED.
// Always use 'remotePatterns' — it is more precise and secure.`,
    borderColor: "border-red-500/20",
    bgColor: "bg-red-500/5",
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
export default function ImageOptimizationPage() {
  return (
    <main className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto">

      {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
      <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
        <span className="mx-2" aria-hidden="true">›</span>
        <Link href="/phase-8" className="hover:text-blue-400 transition-colors">Phase 8</Link>
        <span className="mx-2" aria-hidden="true">›</span>
        <span className="text-gray-300">Image Optimization</span>
      </nav>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl" aria-hidden="true">🖼️</span>
          <h1 className="text-3xl font-bold text-white">Image Optimization</h1>
        </div>
        <p className="text-gray-400 leading-relaxed max-w-2xl">
          Replace plain &lt;img&gt; tags with the Next.js{" "}
          <code className="text-blue-300">&lt;Image&gt;</code> component and get
          automatic resizing, WebP conversion, lazy loading, and CLS prevention
          — all with a single import.
        </p>
        <div className="mt-4 rounded-xl border border-yellow-500/30 bg-yellow-500/5 px-4 py-3">
          <p className="text-xs text-yellow-200/70">
            ⚠️ Code examples below are shown as strings — no actual images are
            loaded in this demo. In your real project, place images in{" "}
            <code>/public</code> and import or reference them normally.
          </p>
        </div>
      </header>

      {/* ── How It Works ─────────────────────────────────────────────────────── */}
      <section className="mb-10" aria-labelledby="how-it-works">
        <h2 id="how-it-works" className="text-lg font-semibold text-white mb-4">
          How next/image Works Under the Hood
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            {
              step: "1. Request comes in",
              body: "A browser requests your page. The HTML includes an <Image> with src='/hero.jpg'.",
            },
            {
              step: "2. Next.js generates a URL",
              body: "The rendered HTML contains a URL like /_next/image?url=/hero.jpg&w=828&q=75. The w and q params specify size and quality.",
            },
            {
              step: "3. Image API responds",
              body: "Next.js has a built-in image optimization API. It reads the original file, resizes it to w=828, converts to WebP if the browser supports it, and serves the result.",
            },
            {
              step: "4. Result is cached",
              body: "The optimized image is cached in .next/cache/images/. Next requests for the same image + size + format are served from cache — near-zero cost.",
            },
          ].map((card) => (
            <div key={card.step} className="rounded-xl border border-white/10 bg-white/2 p-4">
              <p className="text-blue-400 font-mono font-bold text-xs mb-1">{card.step}</p>
              <p className="text-xs text-gray-400 leading-relaxed">{card.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Common Mistakes ───────────────────────────────────────────────────── */}
      <section className="mb-10" aria-labelledby="mistakes-heading">
        <h2 id="mistakes-heading" className="text-lg font-semibold text-white mb-4">
          Common Mistakes
        </h2>
        <div className="space-y-3">
          {[
            {
              mistake: "Using priority on every image",
              fix: "Use priority ONLY on the first visible image (your LCP element). Using it on all images defeats the purpose — the browser must download them all on initial load.",
              color: "border-red-500/20 bg-red-500/5",
            },
            {
              mistake: "Forgetting position:relative on fill parent",
              fix: "The fill prop uses position:absolute internally. Without position:relative on the parent, the image will position itself relative to the entire page body.",
              color: "border-orange-500/20 bg-orange-500/5",
            },
            {
              mistake: "Using wrong width/height values",
              fix: "width and height should be the NATURAL dimensions of the image file, not the CSS display size. CSS sizing is done via className with Tailwind (e.g., w-full h-64).",
              color: "border-yellow-500/20 bg-yellow-500/5",
            },
            {
              mistake: "Skipping the sizes prop on responsive images",
              fix: "Without sizes, Next.js assumes the image is always 100vw wide. This causes it to serve oversized images on mobile. Always add sizes when the image is not full-width.",
              color: "border-purple-500/20 bg-purple-500/5",
            },
          ].map((item) => (
            <div key={item.mistake} className={`rounded-xl border p-4 ${item.color}`}>
              <p className="text-sm font-semibold text-white mb-1">
                ❌ {item.mistake}
              </p>
              <p className="text-xs text-gray-400 leading-relaxed">
                ✅ {item.fix}
              </p>
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

      {/* ── Lesson Navigation ────────────────────────────────────────────────── */}
      <div className="flex justify-between text-sm mt-4">
        <Link href="/phase-8" className="text-gray-500 hover:text-blue-400 transition-colors">
          ← Phase 8
        </Link>
        <Link href="/phase-8/02-font-optimization" className="text-blue-400 hover:text-blue-300 transition-colors">
          Font Optimization →
        </Link>
      </div>
    </main>
  );
}
