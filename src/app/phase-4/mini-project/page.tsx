/**
 * Phase 4 Mini Project — SEO-Optimised Portfolio
 * Route: /phase-4/mini-project
 *
 * PROJECT GOAL:
 * ──────────────
 * Build a realistic portfolio page that demonstrates Phase 4 concepts:
 *
 * 1. generateMetadata() — Dynamic metadata built from simulated data.
 *    In a real app this would read from a CMS or database using a param like [username].
 *    Here we use a hardcoded "owner" to keep the demo self-contained.
 *
 * 2. Open Graph tags — og:title, og:description, og:image, og:type
 *    These control what the page looks like when shared on social media.
 *
 * 3. Keywords — Added to metadata for SEO discoverability.
 *
 * 4. JSON-LD structured data — Schema.org "Person" type for rich search results.
 *    Google can show your name, job title, and social links directly in search.
 *
 * 5. Clean Server Component layout — No unnecessary 'use client'.
 *    The whole page is rendered on the server for best SEO and performance.
 *
 * ARCHITECTURE:
 * ──────────────
 * - Page is a Server Component (default in App Router)
 * - generateMetadata() is called BEFORE the page renders
 * - All data comes from a simulated in-memory store (PORTFOLIO_DATA)
 * - In a real app, replace PORTFOLIO_DATA lookups with DB queries or API calls
 * - Accessible: uses semantic HTML, ARIA labels, and proper heading hierarchy
 *
 * METADATA STRATEGY:
 * ───────────────────
 * We use generateMetadata() (even though data is static here) to demonstrate
 * the correct pattern for when data IS dynamic (e.g., fetching from a DB).
 * The function signature accepts params — ready for a [username] dynamic route.
 */

import Link from "next/link";
import type { Metadata } from "next";

// ─── Simulated Portfolio Data ─────────────────────────────────────────────────
// In a real app, this would be a DB query:
//   const owner = await db.portfolio.findUnique({ where: { slug: params.slug } });
//
// We keep it as in-memory data to avoid any dependencies.

interface Project {
  id: string;
  title: string;
  description: string;
  tech: string[];
  status: "live" | "wip" | "archived";
  url?: string;
  year: string;
}

interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

interface PortfolioOwner {
  name: string;
  title: string;
  location: string;
  bio: string;
  email: string;
  tagline: string;
  skills: string[];
  projects: Project[];
  social: SocialLink[];
  seoKeywords: string[];
  ogImageUrl: string;
  canonicalUrl: string;
}

// Single source of truth for all portfolio data.
// This object is used by BOTH generateMetadata() and the page component.
// Both functions read from the same data — no duplicate fetch calls.
const PORTFOLIO_DATA: PortfolioOwner = {
  name: "Alex Nguyen",
  title: "Full-Stack Developer",
  location: "Ho Chi Minh City, Vietnam",
  bio: "I build fast, accessible web applications with a focus on clean code and great user experience. Specialising in Next.js, TypeScript, and modern UI systems.",
  email: "hello@alexnguyen.dev",
  tagline: "Building the web, one component at a time.",

  skills: [
    "Next.js 15",
    "React 19",
    "TypeScript",
    "Tailwind CSS",
    "Node.js",
    "PostgreSQL",
    "Prisma",
    "Docker",
    "CI/CD",
    "Figma",
  ],

  projects: [
    {
      id: "devboard",
      title: "DevBoard",
      description:
        "A developer productivity dashboard with GitHub integration, task tracking, and real-time collaboration. Built with Next.js App Router, Server Actions, and Supabase.",
      tech: ["Next.js 15", "TypeScript", "Supabase", "Tailwind CSS", "Realtime"],
      status: "live",
      url: "https://devboard.example.com",
      year: "2025",
    },
    {
      id: "shopkit",
      title: "ShopKit",
      description:
        "An open-source e-commerce starter kit with product listings, cart, checkout, and Stripe integration. Optimised for Core Web Vitals — 99 Lighthouse score.",
      tech: ["Next.js 15", "TypeScript", "Stripe", "Prisma", "PostgreSQL"],
      status: "live",
      url: "https://shopkit.example.com",
      year: "2024",
    },
    {
      id: "logstream",
      title: "LogStream",
      description:
        "Real-time log monitoring tool for deployed Node.js services. Supports filtering by severity, searching by keyword, and alerting via webhook.",
      tech: ["Next.js", "WebSockets", "Redis", "Node.js", "Docker"],
      status: "wip",
      year: "2025",
    },
    {
      id: "markflow",
      title: "MarkFlow",
      description:
        "Markdown-to-rich-HTML converter with live preview, dark/light themes, and export to PDF. Built as a Progressive Web App.",
      tech: ["React 19", "TypeScript", "Tailwind CSS", "PWA"],
      status: "archived",
      year: "2023",
    },
  ],

  social: [
    { platform: "GitHub", url: "https://github.com/alexnguyen", icon: "⌨️" },
    { platform: "LinkedIn", url: "https://linkedin.com/in/alexnguyen", icon: "💼" },
    { platform: "Twitter / X", url: "https://x.com/alexnguyen", icon: "🐦" },
    { platform: "Blog", url: "https://alexnguyen.dev/blog", icon: "✍️" },
  ],

  seoKeywords: [
    "full-stack developer",
    "Next.js developer",
    "TypeScript developer",
    "React developer",
    "Vietnam developer",
    "web development portfolio",
    "hire developer",
  ],

  // In production: use a real absolute URL to a 1200×630px image
  ogImageUrl: "https://alexnguyen.dev/og-portfolio.png",
  canonicalUrl: "https://alexnguyen.dev",
};

// ─── generateMetadata ─────────────────────────────────────────────────────────
// WHY generateMetadata() instead of static metadata?
// ────────────────────────────────────────────────────
// In a real portfolio app, the page might have a dynamic route like [username].
// The metadata (title, description, OG tags) would come from the database for
// each different user. We use generateMetadata() here to show the CORRECT
// pattern for that case — just replace PORTFOLIO_DATA with a DB fetch.
//
// generateMetadata() is called BEFORE the page component renders.
// The returned object is used to build the <head> HTML.
export async function generateMetadata(): Promise<Metadata> {
  // In a real app with dynamic params:
  //   const { username } = await params;
  //   const owner = await db.portfolio.findUnique({ where: { slug: username } });
  //   if (!owner) return { title: 'Portfolio Not Found' };

  const owner = PORTFOLIO_DATA; // use our simulated data

  return {
    // ── Basic metadata ───────────────────────────────────────────────────────
    title: `${owner.name} — ${owner.title}`,
    description: owner.bio,
    keywords: owner.seoKeywords,
    authors: [{ name: owner.name }],

    // ── Canonical URL ────────────────────────────────────────────────────────
    // Tells search engines the "official" URL for this page.
    // Important if your page is accessible at multiple URLs.
    alternates: {
      canonical: owner.canonicalUrl,
    },

    // ── Open Graph ───────────────────────────────────────────────────────────
    // Controls how the page looks when shared on LinkedIn, Facebook, Slack, etc.
    openGraph: {
      type: "profile", // 'profile' is the correct og:type for a person's portfolio
      title: `${owner.name} — ${owner.title}`,
      description: owner.bio,
      url: owner.canonicalUrl,
      siteName: `${owner.name} Portfolio`,
      images: [
        {
          url: owner.ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${owner.name} — ${owner.title} portfolio preview`,
        },
      ],
    },

    // ── Twitter Card ─────────────────────────────────────────────────────────
    // Twitter reads og: tags too, but also its own twitter: tags for fine control.
    // summary_large_image shows a big banner image in the tweet preview.
    twitter: {
      card: "summary_large_image",
      title: `${owner.name} — ${owner.title}`,
      description: owner.tagline,
      images: [owner.ogImageUrl],
    },

    // ── Robots ───────────────────────────────────────────────────────────────
    // This is a public portfolio — we WANT search engines to index it.
    robots: {
      index: true,
      follow: true,
    },
  };
}

// ─── Helper: Status Badge ─────────────────────────────────────────────────────
// A small helper to return the right colour and label for each project status.
// Keeping it as a function avoids repetition in the JSX below.
function StatusBadge({ status }: { status: Project["status"] }) {
  const styles = {
    live: "bg-green-500/15 text-green-400 border-green-500/30",
    wip: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    archived: "bg-gray-500/15 text-gray-400 border-gray-500/30",
  };
  const labels = { live: "Live", wip: "In Progress", archived: "Archived" };

  return (
    <span className={`text-xs font-medium border rounded-full px-2 py-0.5 ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

// ─── Page Component ────────────────────────────────────────────────────────────
// Server Component — no 'use client' needed.
// The JSON-LD structured data is injected as a <script> tag directly.
export default function MiniProjectPortfolioPage() {
  const owner = PORTFOLIO_DATA;

  // ── JSON-LD Structured Data ──────────────────────────────────────────────────
  // Schema.org "Person" type tells Google about the portfolio owner.
  // Google uses this for rich results: showing your name, job title,
  // and social profiles directly in search results.
  //
  // This is NOT set via the metadata export — it is injected as a script tag.
  // JSON.stringify() serialises it safely; Next.js handles the rest.
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: owner.name,
    jobTitle: owner.title,
    description: owner.bio,
    email: owner.email,
    url: owner.canonicalUrl,
    address: {
      "@type": "PostalAddress",
      addressLocality: owner.location,
    },
    sameAs: owner.social.map((s) => s.url), // links all social profiles to the same person
  };

  return (
    <>
      {/* ── JSON-LD script tag ────────────────────────────────────────────────
       * Placed OUTSIDE <main> so it appears in the document root.
       * dangerouslySetInnerHTML is safe here because we control the data —
       * JSON.stringify() prevents script injection.
       */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />

      <main className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto">

        {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
        <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
          <span className="mx-2" aria-hidden="true">›</span>
          <Link href="/phase-4" className="hover:text-blue-400 transition-colors">Phase 4</Link>
          <span className="mx-2" aria-hidden="true">›</span>
          <span className="text-gray-300">Mini Project — SEO Portfolio</span>
        </nav>

        {/* ── Teaching header — explains the mini project ───────────────────── */}
        <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4 mb-8">
          <div className="flex items-start gap-3">
            <span className="text-2xl" aria-hidden="true">🎯</span>
            <div>
              <h2 className="text-sm font-semibold text-green-400 mb-1">
                Mini Project — SEO-Optimised Portfolio
              </h2>
              <p className="text-xs text-gray-400 leading-relaxed">
                This page uses <code className="font-mono text-green-300">generateMetadata()</code> for
                dynamic SEO metadata, Open Graph tags for social sharing previews, keywords for search
                discoverability, and JSON-LD structured data for Google rich results.
                View the page source (<kbd className="text-xs bg-black/30 px-1 py-0.5 rounded">Ctrl+U</kbd>) to see
                all the generated <code className="font-mono">&lt;head&gt;</code> tags.
              </p>
            </div>
          </div>
        </div>

        {/* ── Portfolio Hero Section ──────────────────────────────────────────── */}
        {/*
         * The hero is the first thing visitors and search engines see.
         * h1 should contain the owner's name — the most important heading.
         * The role="banner" on the outer <header> is implicit for the first
         * <header> in <main> context but explicit here for clarity.
         */}
        <header className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-start gap-6">

            {/* Avatar placeholder */}
            {/*
             * In a real app, use next/image with a real photo.
             * We use a CSS gradient placeholder to avoid needing real images.
             */}
            <div
              className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shrink-0"
              aria-hidden="true"
            >
              <span className="text-3xl font-bold text-white">
                {/* Initials — derived from the name */}
                {owner.name.split(" ").map((n) => n[0]).join("")}
              </span>
            </div>

            <div>
              {/* h1 contains the owner's full name for SEO */}
              <h1 className="text-3xl font-bold text-white mb-1">{owner.name}</h1>

              {/* Job title */}
              <p className="text-lg text-blue-400 font-medium mb-1">{owner.title}</p>

              {/* Location */}
              <p className="text-sm text-gray-500 mb-3">
                <span aria-hidden="true">📍</span> {owner.location}
              </p>

              {/* Bio — mirrors the og:description */}
              <p className="text-gray-300 leading-relaxed max-w-xl text-sm">{owner.bio}</p>

              {/* Social links */}
              <div className="flex flex-wrap gap-3 mt-4">
                {owner.social.map((link) => (
                  <a
                    key={link.platform}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-400 transition-colors border border-white/10 hover:border-blue-500/40 rounded-full px-3 py-1.5"
                    aria-label={`${owner.name} on ${link.platform} (opens in new tab)`}
                  >
                    <span aria-hidden="true">{link.icon}</span>
                    {link.platform}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* ── Skills Section ────────────────────────────────────────────────── */}
        <section className="mb-10" aria-labelledby="skills-heading">
          <h2 id="skills-heading" className="text-xl font-semibold text-white mb-4">
            Skills &amp; Technologies
          </h2>
          <div className="flex flex-wrap gap-2">
            {owner.skills.map((skill) => (
              <span
                key={skill}
                className="text-sm bg-blue-500/10 border border-blue-500/20 text-blue-300 px-3 py-1.5 rounded-full"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>

        {/* ── Projects Section ──────────────────────────────────────────────── */}
        {/*
         * Semantic HTML: <section> with an aria-labelledby pointing to the h2.
         * This gives screen readers a clear "Projects section" landmark.
         * Each project card uses <article> because each is self-contained content.
         */}
        <section className="mb-10" aria-labelledby="projects-heading">
          <h2 id="projects-heading" className="text-xl font-semibold text-white mb-4">
            Featured Projects
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {owner.projects.map((project) => (
              <article
                key={project.id}
                className="rounded-xl border border-white/10 hover:border-blue-500/30 hover:bg-blue-500/3 p-5 transition-all duration-200"
                aria-label={`Project: ${project.title}`}
              >
                {/* Project header row: title + status + year */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-base font-semibold text-white leading-tight">
                    {project.title}
                  </h3>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-gray-600">{project.year}</span>
                    <StatusBadge status={project.status} />
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-400 mb-3 leading-relaxed">
                  {project.description}
                </p>

                {/* Tech stack tags */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {project.tech.map((t) => (
                    <span
                      key={t}
                      className="text-xs bg-white/5 border border-white/10 text-gray-500 px-2 py-0.5 rounded"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {/* External link — only shown for live projects */}
                {project.url && (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1"
                    aria-label={`View ${project.title} live project (opens in new tab)`}
                  >
                    View Project
                    <span aria-hidden="true">→</span>
                  </a>
                )}
              </article>
            ))}
          </div>
        </section>

        {/* ── Contact Section ───────────────────────────────────────────────── */}
        <section
          className="mb-10 rounded-xl border border-purple-500/20 bg-purple-500/5 p-6 text-center"
          aria-labelledby="contact-heading"
        >
          <h2 id="contact-heading" className="text-xl font-semibold text-white mb-2">
            Let&apos;s Work Together
          </h2>
          <p className="text-gray-400 text-sm mb-4 max-w-md mx-auto">{owner.tagline}</p>
          {/* Email link — use mailto: for simple contact */}
          <a
            href={`mailto:${owner.email}`}
            className="inline-block bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-colors"
          >
            Get in Touch
          </a>
        </section>

        {/* ── SEO Metadata Summary ──────────────────────────────────────────── */}
        {/*
         * This section shows learners EXACTLY what metadata was generated for this page.
         * In a real portfolio, you would remove this section.
         * It is here purely to make the learning visible.
         */}
        <section className="mb-10 rounded-xl border border-white/10 bg-white/2 p-5" aria-labelledby="meta-summary-heading">
          <h2 id="meta-summary-heading" className="text-base font-semibold text-white mb-1">
            Generated Metadata (Teaching Reference)
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            This is what <code className="font-mono">generateMetadata()</code> returned for this page.
            In a real app, remove this section — it is only here to make the output visible.
          </p>
          <div className="space-y-2 text-xs">
            {[
              { label: "title", value: `${owner.name} — ${owner.title}` },
              { label: "description", value: owner.bio.substring(0, 80) + "…" },
              { label: "keywords", value: owner.seoKeywords.slice(0, 4).join(", ") + "…" },
              { label: "og:type", value: "profile" },
              { label: "og:title", value: `${owner.name} — ${owner.title}` },
              { label: "og:description", value: owner.bio.substring(0, 60) + "…" },
              { label: "og:image", value: owner.ogImageUrl },
              { label: "twitter:card", value: "summary_large_image" },
              { label: "robots", value: "index, follow" },
              { label: "canonical", value: owner.canonicalUrl },
              { label: "JSON-LD @type", value: "schema.org/Person" },
            ].map(({ label, value }) => (
              <div key={label} className="flex gap-3 items-start border-b border-white/5 pb-2">
                <code className="text-blue-400 shrink-0 w-32">{label}</code>
                <span className="text-gray-400 break-all">{value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Lesson Navigation ───────────────────────────────────────────────── */}
        <div className="flex justify-between text-sm">
          <Link
            href="/phase-4/03-loading-error-ui"
            className="text-gray-500 hover:text-blue-400 transition-colors"
          >
            ← Loading/Error UI
          </Link>
          <Link
            href="/phase-5"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            Phase 5 →
          </Link>
        </div>
      </main>
    </>
  );
}
