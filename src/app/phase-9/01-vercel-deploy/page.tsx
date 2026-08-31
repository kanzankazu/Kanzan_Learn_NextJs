/**
 * Lesson 01 — Deploying to Vercel
 * Route: /phase-9/01-vercel-deploy
 *
 * WHAT IS VERCEL?
 * ────────────────
 * Vercel is the company that CREATED and MAINTAINS Next.js. Because of that,
 * their hosting platform has first-class support for every Next.js feature:
 * - Server Components stream directly from the edge
 * - API Routes become serverless functions automatically
 * - Image Optimization is zero-config
 * - Incremental Static Regeneration (ISR) works out of the box
 * - Preview Deployments are created automatically for every Pull Request
 *
 * HOW VERCEL WORKS (HIGH LEVEL):
 * ────────────────────────────────
 * 1. You connect your GitHub / GitLab / Bitbucket repository to Vercel.
 * 2. Every push to any branch triggers a new build.
 * 3. Vercel runs `npm run build` in a cloud environment.
 * 4. The output is deployed globally across Vercel's Edge Network (CDN).
 * 5. Your visitors are served from the nearest edge location — fast worldwide.
 *
 * PREVIEW DEPLOYMENTS:
 * ─────────────────────
 * This is one of Vercel's killer features. Every Pull Request gets its OWN
 * unique URL (e.g., myapp-git-feat-login-username.vercel.app).
 * Team members and stakeholders can preview changes BEFORE merging to main.
 * This eliminates "it worked on my machine" issues in code review.
 *
 * ENVIRONMENT VARIABLES IN VERCEL:
 * ──────────────────────────────────
 * In the Vercel dashboard → Project Settings → Environment Variables.
 * You can set different values for:
 *   - Production  (main branch)
 *   - Preview     (all other branches)
 *   - Development (local `vercel dev` command)
 * Vercel injects these at build time AND runtime — no .env file needed
 * in your repository.
 *
 * VERCEL CLI:
 * ────────────
 * The Vercel CLI lets you deploy from your terminal without touching
 * the web dashboard. Useful for CI/CD pipelines or power users.
 */

import Link from "next/link";
import type { Metadata } from "next";

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "01 — Deploying to Vercel",
  description:
    "Learn how to deploy a Next.js 15 app to Vercel. Covers GitHub integration, preview deployments, vercel.json config, CLI commands, and environment variables in the dashboard.",
};

// ─── Code Examples ────────────────────────────────────────────────────────────
// All code is represented as plain strings.
// These are patterns you would use in a real project — not executable here.
const CODE_EXAMPLES = [
  {
    id: "project-structure",
    label: "1. Recommended project structure for Vercel deployment",
    description:
      "Vercel auto-detects Next.js and needs no configuration for standard projects. This structure shows which files Vercel looks for and what each does.",
    code: `my-next-app/
├── src/
│   └── app/               # App Router pages and layouts
├── public/                # Static assets (images, fonts, favicons)
├── next.config.ts         # Next.js configuration (Vercel reads this)
├── package.json           # Build scripts: "build": "next build"
├── .env.local             # Local secrets — NEVER commit this file!
├── .gitignore             # Must include: .env.local, .next/, node_modules/
└── vercel.json            # Optional: Vercel-specific overrides (see below)

# .gitignore minimum entries:
# .env.local         ← secrets stay off GitHub
# .next/             ← build output, not needed in git
# node_modules/      ← npm install recreates this`,
    borderColor: "border-blue-500/20",
    bgColor: "bg-blue-500/5",
  },
  {
    id: "vercel-json",
    label: "2. vercel.json — Optional Vercel configuration",
    description:
      "vercel.json lets you customise Vercel's behaviour for your project. For most Next.js apps you do NOT need this file — Vercel's defaults are excellent. Only add it when you need specific overrides.",
    code: `// vercel.json — place at the project root (same level as package.json)
// This file is OPTIONAL. Remove sections you don't need.

{
  // Override the framework auto-detection (usually not needed for Next.js)
  "framework": "nextjs",

  // Custom build command (default: "next build")
  "buildCommand": "npm run build",

  // Directory Vercel serves static files from (default: ".next")
  "outputDirectory": ".next",

  // Redirect rules — useful for SEO or legacy URL migrations
  "redirects": [
    {
      "source": "/old-blog/:slug",    // Incoming URL pattern
      "destination": "/blog/:slug",   // Where to send them
      "permanent": true               // 308 permanent redirect (good for SEO)
    }
  ],

  // Header rules — add security headers to all responses
  "headers": [
    {
      "source": "/(.*)",              // Apply to ALL routes
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "SAMEORIGIN"
        }
      ]
    }
  ],

  // Regions to deploy serverless functions to
  // Default: iad1 (US East). Add more for global low-latency.
  "regions": ["iad1", "sin1", "syd1"]
}`,
    borderColor: "border-purple-500/20",
    bgColor: "bg-purple-500/5",
  },
  {
    id: "cli-deploy",
    label: "3. Vercel CLI commands — Deploy from your terminal",
    description:
      "Install the Vercel CLI once globally, then use it to deploy, preview, and manage your projects without opening a browser.",
    code: `# ── Install Vercel CLI ─────────────────────────────────────────────────────
npm install -g vercel

# ── Link your project to Vercel (run once per project) ─────────────────────
# Walks you through an interactive setup: select team, project name, etc.
vercel link

# ── Deploy to PREVIEW environment ──────────────────────────────────────────
# Creates a unique preview URL. Does NOT affect production.
# Use this to share a work-in-progress build with teammates.
vercel

# ── Deploy to PRODUCTION ───────────────────────────────────────────────────
# Replaces the live app at your production domain.
# Only do this when you are confident the build is ready.
vercel --prod

# ── Run locally with Vercel environment variables ──────────────────────────
# Pulls your Vercel env vars and runs next dev with them loaded.
# Useful to test production-level config locally.
vercel dev

# ── Pull environment variables to a local .env.local file ──────────────────
# Syncs your Vercel env vars to your machine for local development.
vercel env pull .env.local

# ── View deployment logs ───────────────────────────────────────────────────
# Opens the Vercel dashboard in your browser for the latest deployment.
vercel inspect

# ── List recent deployments ─────────────────────────────────────────────────
vercel ls`,
    borderColor: "border-green-500/20",
    bgColor: "bg-green-500/5",
  },
  {
    id: "env-dashboard",
    label: "4. Setting environment variables in the Vercel dashboard",
    description:
      "The Vercel dashboard UI is the recommended way to manage secrets for production. Variables set here are encrypted at rest and injected at build/runtime.",
    code: `# ── Dashboard path ────────────────────────────────────────────────────────
# vercel.com → Your Project → Settings → Environment Variables

# ── Add a variable ─────────────────────────────────────────────────────────
# Name:       DATABASE_URL
# Value:      postgresql://user:pass@host:5432/mydb
# Environments: ✅ Production  ✅ Preview  ✅ Development

# ── NEXT_PUBLIC_ prefix ────────────────────────────────────────────────────
# Variables starting with NEXT_PUBLIC_ are embedded in the browser bundle.
# Safe to expose:    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
# NEVER expose:      DATABASE_URL, JWT_SECRET, STRIPE_SECRET_KEY

# ── Accessing in code ──────────────────────────────────────────────────────

// In a Server Component or API Route (server-only, never sent to browser):
const dbUrl = process.env.DATABASE_URL;        // ✅ Works on server
const secret = process.env.JWT_SECRET;         // ✅ Works on server

// In a Client Component (runs in the browser):
const key = process.env.NEXT_PUBLIC_API_KEY;   // ✅ Embedded at build time
const db  = process.env.DATABASE_URL;          // ❌ undefined on client!

# ── Vercel-specific system variables (auto-injected) ──────────────────────
# VERCEL                   = "1"                       (always set on Vercel)
# VERCEL_ENV               = "production" | "preview" | "development"
# VERCEL_URL               = "myapp-abc123.vercel.app" (deployment URL)
# NEXT_PUBLIC_VERCEL_URL   = same, exposed to browser

// Use VERCEL_URL to build absolute URLs in Server Components:
const baseUrl = process.env.VERCEL_URL
  ? \`https://\${process.env.VERCEL_URL}\`
  : 'http://localhost:3000';`,
    borderColor: "border-orange-500/20",
    bgColor: "bg-orange-500/5",
  },
  {
    id: "preview-deploys",
    label: "5. Preview deployments — How they work with Git branches",
    description:
      "Every branch and pull request gets its own live URL automatically. No extra configuration required. This is one of Vercel's most valuable features for teams.",
    code: `# ── How preview deployments are triggered ─────────────────────────────────

# main branch pushed → Production deployment → yourapp.com
# feature/login pushed → Preview deployment → yourapp-git-feature-login-you.vercel.app
# PR opened → Preview deployment → yourapp-abc123-team.vercel.app

# Vercel posts the preview URL as a comment in your GitHub Pull Request.
# Teammates can click the link and test the live build — no local setup needed.

# ── Useful patterns ────────────────────────────────────────────────────────

# Check which environment the code is running in:
if (process.env.VERCEL_ENV === 'production') {
  // Enable analytics, error tracking, etc.
}
if (process.env.VERCEL_ENV === 'preview') {
  // Show a "preview mode" banner to testers
}

# ── next.config.ts adjustments for Vercel ─────────────────────────────────
// next.config.ts

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Allow images from Vercel's own CDN (for next/image with remote sources)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.vercel.app',    // Preview deployments
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com', // Example: your image CDN
      },
    ],
  },
};

export default nextConfig;`,
    borderColor: "border-cyan-500/20",
    bgColor: "bg-cyan-500/5",
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
export default function VercelDeployPage() {
  return (
    <main className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto">

      {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
      <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
        <span className="mx-2" aria-hidden="true">›</span>
        <Link href="/phase-9" className="hover:text-blue-400 transition-colors">Phase 9</Link>
        <span className="mx-2" aria-hidden="true">›</span>
        <span className="text-gray-300">Deploying to Vercel</span>
      </nav>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl" aria-hidden="true">▲</span>
          <h1 className="text-3xl font-bold text-white">Deploying to Vercel</h1>
        </div>
        <p className="text-gray-400 leading-relaxed max-w-2xl">
          Vercel is the company behind Next.js. Their hosting platform is
          purpose-built for Next.js — zero config, automatic preview deployments,
          global CDN, and built-in support for Server Components and Edge Functions.
        </p>
      </header>

      {/* ── Why Vercel ───────────────────────────────────────────────────────── */}
      <section className="mb-10" aria-labelledby="why-vercel-heading">
        <h2 id="why-vercel-heading" className="text-lg font-semibold text-white mb-4">
          Why Vercel for Next.js?
        </h2>
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
          {[
            {
              icon: "🏗️",
              title: "Built by the creators",
              body: "Vercel created Next.js. Every new Next.js feature is designed with Vercel as the primary deployment target. They test against each other.",
            },
            {
              icon: "⚡",
              title: "Zero configuration",
              body: "Push to GitHub and your app is live. Vercel auto-detects Next.js, runs next build, and distributes output across its global CDN. No YAML files, no server setup.",
            },
            {
              icon: "👁️",
              title: "Preview deployments",
              body: "Every branch and PR gets a unique live URL. Share with teammates and clients before merging. Eliminates 'it worked locally' surprises.",
            },
            {
              icon: "🌐",
              title: "Edge Network",
              body: "Static assets and Edge Functions are cached at ~100 edge locations worldwide. Users in Tokyo get the same sub-100ms response as users in New York.",
            },
            {
              icon: "🔒",
              title: "Automatic HTTPS",
              body: "Vercel provisions and renews TLS certificates from Let's Encrypt automatically. No certbot, no nginx, no manual renewal.",
            },
            {
              icon: "📊",
              title: "Built-in analytics",
              body: "Vercel provides Core Web Vitals monitoring, real-user performance metrics, and deployment analytics with zero instrumentation code.",
            },
          ].map((card) => (
            <div key={card.title} className="rounded-xl border border-white/10 bg-white/2 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span aria-hidden="true">{card.icon}</span>
                <h3 className="text-sm font-semibold text-white">{card.title}</h3>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">{card.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Deploy Steps ─────────────────────────────────────────────────────── */}
      <section className="mb-10" aria-labelledby="steps-heading">
        <h2 id="steps-heading" className="text-lg font-semibold text-white mb-4">
          Deployment Steps (GitHub → Vercel)
        </h2>
        <ol className="space-y-3">
          {[
            {
              step: "1",
              title: 'Push your project to GitHub',
              body: 'Create a GitHub repository and push your Next.js app. Make sure .env.local is in .gitignore — secrets must never go to GitHub.',
            },
            {
              step: "2",
              title: 'Sign up at vercel.com and import your repo',
              body: 'Click "Add New Project", select your GitHub repo, and Vercel auto-detects the framework and build settings.',
            },
            {
              step: "3",
              title: 'Add environment variables',
              body: 'In the import wizard (or later in Settings → Env Vars), add all your secrets: DATABASE_URL, JWT_SECRET, etc.',
            },
            {
              step: "4",
              title: 'Click Deploy',
              body: 'Vercel runs npm run build in a cloud environment and deploys the output globally. First deploy usually takes 60–120 seconds.',
            },
            {
              step: "5",
              title: 'Future deploys are automatic',
              body: 'Every git push to main triggers a new production deployment. Pushes to other branches create preview deployments with unique URLs.',
            },
          ].map((item) => (
            <li key={item.step} className="flex gap-4 rounded-xl border border-white/10 bg-white/2 p-4">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-bold flex items-center justify-center">
                {item.step}
              </span>
              <div>
                <p className="text-sm font-semibold text-white mb-0.5">{item.title}</p>
                <p className="text-xs text-gray-400 leading-relaxed">{item.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ── Code Examples ────────────────────────────────────────────────────── */}
      <section className="mb-10" aria-labelledby="code-heading">
        <h2 id="code-heading" className="text-lg font-semibold text-white mb-4">
          Code Examples &amp; Configuration
        </h2>
        <div className="space-y-4">
          {CODE_EXAMPLES.map((ex) => (
            <CodeBlock key={ex.id} {...ex} />
          ))}
        </div>
      </section>

      {/* ── Key Concepts ─────────────────────────────────────────────────────── */}
      <section className="mb-10" aria-labelledby="concepts-heading">
        <h2 id="concepts-heading" className="text-lg font-semibold text-white mb-4">
          Key Concepts
        </h2>
        <div className="space-y-3">
          {[
            {
              term: "Serverless Functions",
              def: "Each Next.js API Route and Server Action becomes an isolated serverless function on Vercel. They scale to zero when idle and spin up on demand — no server management needed.",
            },
            {
              term: "Edge Functions",
              def: "Middleware and Edge API Routes run on Vercel's Edge Runtime, which is closer to the user than a traditional server. Sub-millisecond cold starts, global distribution.",
            },
            {
              term: "ISR (Incremental Static Regeneration)",
              def: "Pages built with fetch revalidation (revalidate: 3600) are regenerated in the background on Vercel. Stale-while-revalidate keeps the site fast while content stays fresh.",
            },
            {
              term: "Build cache",
              def: "Vercel caches npm packages and the .next/cache directory between deployments. Subsequent deploys skip unchanged modules — much faster rebuild times.",
            },
            {
              term: "Deployment aliases",
              def: "Vercel assigns multiple URLs to each deployment: a unique immutable URL (abc123.vercel.app), a branch URL, and your production domain. Older deployments remain accessible via their immutable URL.",
            },
          ].map((item) => (
            <div key={item.term} className="rounded-xl border border-white/10 bg-blue-500/5 p-4">
              <code className="text-blue-300 text-sm font-mono">{item.term}</code>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">{item.def}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Lesson Navigation ────────────────────────────────────────────────── */}
      <div className="flex justify-between text-sm">
        <Link href="/phase-9" className="text-gray-500 hover:text-blue-400 transition-colors">
          ← Phase 9
        </Link>
        <Link href="/phase-9/02-docker-vps" className="text-blue-400 hover:text-blue-300 transition-colors">
          Docker / VPS →
        </Link>
      </div>
    </main>
  );
}
