/**
 * Lesson 02 — Docker + VPS Deployment
 * Route: /phase-9/02-docker-vps
 *
 * WHAT IS DOCKER?
 * ────────────────
 * Docker is a tool that packages your application and ALL its dependencies
 * (Node.js version, npm packages, OS libraries) into a single portable unit
 * called a CONTAINER IMAGE.
 *
 * Think of it like this:
 *   Without Docker → "It works on my machine 🤷" (different OS, Node version, etc.)
 *   With Docker    → Same image runs identically on your laptop, CI server,
 *                    and production VPS. No more environment surprises.
 *
 * KEY DOCKER CONCEPTS:
 * ─────────────────────
 * Dockerfile   → A recipe (set of instructions) to build an image.
 *                Each line is a "layer" that gets cached.
 * Image        → The built, immutable artifact. Like a snapshot.
 * Container    → A running instance of an image. Lightweight, isolated process.
 * Registry     → A storage service for images. Docker Hub, AWS ECR, GitHub Packages.
 *
 * WHY MULTI-STAGE BUILDS?
 * ─────────────────────────
 * A Next.js project has many dev dependencies (TypeScript compiler, ESLint, etc.)
 * that are NOT needed at runtime. A multi-stage Dockerfile:
 * 1. Stage 1 "builder"  → installs ALL deps, runs next build
 * 2. Stage 2 "runner"   → copies ONLY the build output + production deps
 * Result: the final image is much smaller (~100MB vs ~600MB). Smaller images
 * mean faster container starts and lower bandwidth/storage costs.
 *
 * NEXT.JS STANDALONE OUTPUT:
 * ───────────────────────────
 * Enable `output: 'standalone'` in next.config.ts. Next.js then traces
 * all the Node.js files your app actually needs and copies them into
 * .next/standalone. This creates a self-contained server.js file with
 * only the minimal dependencies — perfect for small Docker images.
 *
 * WHAT IS A VPS?
 * ───────────────
 * A VPS (Virtual Private Server) is a Linux VM you rent from a cloud
 * provider (DigitalOcean, Linode, Hetzner, AWS EC2). You get root access,
 * install software, and manage it yourself. You run your Docker container
 * on this VPS and expose it via nginx.
 *
 * NGINX AS REVERSE PROXY:
 * ─────────────────────────
 * Your Next.js app runs on port 3000 inside Docker. nginx sits in front,
 * listening on port 80 (HTTP) and 443 (HTTPS), forwarding requests to
 * your app. nginx also handles SSL termination, compression, caching
 * of static assets, and rate limiting — tasks your Node.js app should
 * not do itself.
 *
 * PM2 ALTERNATIVE:
 * ─────────────────
 * PM2 is a process manager for Node.js. Instead of Docker, you can deploy
 * the Next.js build directly on the VPS and use PM2 to:
 * - Keep the process alive (restart on crash)
 * - Run multiple instances for load balancing (cluster mode)
 * - Stream logs and monitor memory/CPU
 * Simpler than Docker, but less portable and reproducible.
 */

import Link from "next/link";
import type { Metadata } from "next";

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "02 — Docker + VPS Deployment",
  description:
    "Learn how to containerise a Next.js 15 app with Docker. Covers multi-stage Dockerfile, standalone output, .dockerignore, nginx reverse proxy, docker-compose, and PM2.",
};

// ─── Code Examples ────────────────────────────────────────────────────────────
// All code is represented as plain strings for educational display.
// Docker and nginx are NOT running in this repo — these are patterns.
const CODE_EXAMPLES = [
  {
    id: "next-config",
    label: "1. next.config.ts — Enable standalone output",
    description:
      "The very first step. Enable standalone output so Next.js traces and bundles only the files it needs. Without this, your Docker image would include all of node_modules.",
    code: `// next.config.ts
// IMPORTANT: Enable this BEFORE building your Docker image.

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 'standalone' output mode tells Next.js to trace all dependencies
  // and produce a self-contained server in .next/standalone/
  // Result: a server.js that you can run with: node server.js
  // This makes Docker images 5–10x smaller than copying all node_modules.
  output: 'standalone',
};

export default nextConfig;`,
    borderColor: "border-blue-500/20",
    bgColor: "bg-blue-500/5",
  },
  {
    id: "dockerfile",
    label: "2. Dockerfile — Multi-stage build",
    description:
      "The production-grade Dockerfile for Next.js. Three stages: deps (install), builder (compile), runner (minimal final image). Only the runner stage ends up in production.",
    code: `# Dockerfile — place at the project root

# ────────────────────────────────────────────────────────────────────────────
# STAGE 1: deps
# Install production dependencies only. We separate this from the builder
# so Docker can cache the installed modules and skip this slow step
# when only source code changes (no package.json change).
# ────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps

# Install libc-compat for Alpine Linux compatibility with native modules
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy only package files first — Docker caches this layer.
# If package.json doesn't change, npm ci is skipped on next build.
COPY package.json package-lock.json* ./
RUN npm ci


# ────────────────────────────────────────────────────────────────────────────
# STAGE 2: builder
# Copy source code and run the Next.js build with all dependencies.
# ────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy node_modules from the deps stage (already installed)
COPY --from=deps /app/node_modules ./node_modules

# Copy all source code
COPY . .

# Build the Next.js app
# NEXT_TELEMETRY_DISABLED=1 turns off Next.js anonymous telemetry in CI
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build


# ────────────────────────────────────────────────────────────────────────────
# STAGE 3: runner (final production image)
# Only copy what the app needs at runtime. No build tools, no source code,
# no dev dependencies. This is the image that gets pushed to the registry.
# ────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Run as a non-root user for security best practice.
# Never run production services as root — a compromise is more contained.
RUN addgroup --system --gid 1001 nodejs
RUN adduser  --system --uid 1001 nextjs

# Copy the standalone server (includes only needed node_modules)
COPY --from=builder /app/.next/standalone ./

# Copy static assets (CSS, JS chunks, images) into the right location
COPY --from=builder /app/.next/static ./.next/static

# Copy public folder (favicon, robots.txt, etc.)
COPY --from=builder /app/public ./public

# Switch to non-root user
USER nextjs

# The app listens on port 3000 by default
EXPOSE 3000

# PORT env var lets you override at runtime if needed
ENV PORT=3000

# server.js is generated by Next.js standalone output
CMD ["node", "server.js"]`,
    borderColor: "border-cyan-500/20",
    bgColor: "bg-cyan-500/5",
  },
  {
    id: "dockerignore",
    label: "3. .dockerignore — Speed up the build context",
    description:
      "Docker sends your entire project folder to the build daemon. .dockerignore prevents large, unnecessary directories from being sent — dramatically speeding up builds.",
    code: `# .dockerignore — place at the project root

# Build output — Docker rebuilds this in the builder stage
.next/

# Local development server cache
.next/cache

# Dependencies — Docker installs these fresh in the deps stage
node_modules/

# Environment files — secrets must never go into the image
.env
.env.local
.env.*.local

# Git history — not needed inside the image
.git/
.gitignore

# Editor config — not needed
.vscode/
.idea/
*.swp

# OS files
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# Test files — not needed in production image
**/*.test.ts
**/*.spec.ts
**/__tests__/
coverage/

# README and docs — not needed
README.md
*.md`,
    borderColor: "border-green-500/20",
    bgColor: "bg-green-500/5",
  },
  {
    id: "nginx",
    label: "4. nginx.conf — Reverse proxy configuration",
    description:
      "nginx sits in front of your Next.js container, handles SSL termination, and forwards HTTP requests to port 3000. It also serves static files faster than Node.js can.",
    code: `# /etc/nginx/sites-available/myapp
# After editing: sudo nginx -t && sudo systemctl reload nginx

server {
    listen 80;
    server_name myapp.com www.myapp.com;

    # Redirect all HTTP traffic to HTTPS
    # Remove this block if you don't have SSL yet during initial setup
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name myapp.com www.myapp.com;

    # SSL certificates — obtained via: sudo certbot --nginx -d myapp.com
    ssl_certificate     /etc/letsencrypt/live/myapp.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/myapp.com/privkey.pem;

    # ── Proxy to Next.js app (running in Docker on port 3000) ────────────
    location / {
        proxy_pass         http://localhost:3000;
        proxy_http_version 1.1;

        # Required for WebSockets (used by Next.js HMR and some realtime features)
        proxy_set_header Upgrade    $http_upgrade;
        proxy_set_header Connection 'upgrade';

        # Pass real client IP to the app (useful for rate limiting, logs)
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_cache_bypass $http_upgrade;
    }

    # ── Cache static Next.js assets at nginx level ───────────────────────
    # Next.js puts hashed filenames in /_next/static, so they can be
    # cached aggressively — they never change for the same content.
    location /_next/static/ {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}`,
    borderColor: "border-purple-500/20",
    bgColor: "bg-purple-500/5",
  },
  {
    id: "docker-compose",
    label: "5. docker-compose.yml — Orchestrate app + (optional) DB",
    description:
      "docker-compose lets you define your entire stack in one file. Run your Next.js app container and a Postgres database together with a single command.",
    code: `# docker-compose.yml — place at the project root
# Usage:
#   docker compose up -d       (start in background)
#   docker compose down        (stop and remove containers)
#   docker compose logs -f app (stream logs)

version: '3.9'

services:
  # ── Next.js application ─────────────────────────────────────────────────
  app:
    # Build the image from the local Dockerfile
    build:
      context: .
      dockerfile: Dockerfile
    container_name: nextjs-app
    restart: always           # Restart automatically on crash or VPS reboot

    ports:
      - "3000:3000"           # host:container — expose port 3000

    environment:
      # Pass secrets as environment variables (set these in your VPS shell
      # or use a .env file that is NEVER committed to git)
      DATABASE_URL:   __DATABASE_URL__
      JWT_SECRET:     __JWT_SECRET__
      NODE_ENV:       production

    depends_on:
      - db                    # Wait for db to be healthy before starting app

  # ── PostgreSQL database (optional — skip if using hosted DB) ────────────
  db:
    image: postgres:16-alpine
    container_name: postgres-db
    restart: always

    environment:
      POSTGRES_USER:     myuser
      POSTGRES_PASSWORD: __POSTGRES_PASSWORD__
      POSTGRES_DB:       mydb

    volumes:
      # Persist database data across container restarts
      # Without this, data is lost when the container is stopped
      - postgres_data:/var/lib/postgresql/data

    ports:
      - "5432:5432"           # Expose DB port (lock down in production firewall)

# Named volume so Docker manages the data directory lifecycle
volumes:
  postgres_data:`,
    borderColor: "border-orange-500/20",
    bgColor: "bg-orange-500/5",
  },
  {
    id: "pm2",
    label: "6. PM2 — Simpler alternative to Docker",
    description:
      "PM2 is a process manager for Node.js. If Docker feels like too much overhead, PM2 lets you run and manage Next.js directly on the VPS without containers.",
    code: `# ── Setup on a fresh VPS (Ubuntu) ──────────────────────────────────────
# Install Node.js via nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20

# Install PM2 globally
npm install -g pm2

# ── Deploy your Next.js app ────────────────────────────────────────────
# 1. Clone your repo on the VPS
git clone https://github.com/yourname/yourapp.git
cd yourapp

# 2. Install dependencies and build
npm ci
npm run build

# 3. Start with PM2
# ecosystem.config.js defines app name, script, env vars, instances
pm2 start ecosystem.config.js

# ── ecosystem.config.js ────────────────────────────────────────────────
module.exports = {
  apps: [{
    name: 'nextjs-app',

    // next start is the production server command
    script: 'node_modules/.bin/next',
    args: 'start',

    // cluster mode: fork one process per CPU core for better throughput
    instances: 'max',
    exec_mode: 'cluster',

    // Environment variables (store actual values in VPS environment)
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
  }],
};

# ── Useful PM2 commands ─────────────────────────────────────────────────
pm2 status                 # Check running processes
pm2 logs nextjs-app        # Stream logs
pm2 restart nextjs-app     # Restart (e.g., after pulling new code)
pm2 save                   # Save process list to disk
pm2 startup                # Generate systemd script to auto-start on reboot`,
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
export default function DockerVpsPage() {
  return (
    <main className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto">

      {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
      <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
        <span className="mx-2" aria-hidden="true">›</span>
        <Link href="/phase-9" className="hover:text-blue-400 transition-colors">Phase 9</Link>
        <span className="mx-2" aria-hidden="true">›</span>
        <span className="text-gray-300">Docker + VPS</span>
      </nav>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl" aria-hidden="true">🐳</span>
          <h1 className="text-3xl font-bold text-white">Docker + VPS Deployment</h1>
        </div>
        <p className="text-gray-400 leading-relaxed max-w-2xl">
          Package your Next.js app into a Docker container and run it on any Linux
          server. More setup than Vercel, but you get full control over infrastructure,
          no vendor lock-in, and predictable costs at scale.
        </p>
      </header>

      {/* ── Architecture Overview ─────────────────────────────────────────── */}
      <section className="mb-10" aria-labelledby="arch-heading">
        <h2 id="arch-heading" className="text-lg font-semibold text-white mb-4">
          Architecture Overview
        </h2>
        {/* Visual text diagram of the request flow */}
        <div className="rounded-xl border border-white/10 bg-white/2 p-5">
          <pre className="font-mono text-xs text-gray-400 overflow-x-auto leading-relaxed">{`User's Browser
      │
      ▼ HTTPS (port 443)
┌─────────────────────────────────────────┐
│           nginx (reverse proxy)         │
│  - SSL termination (certbot)            │
│  - Static asset caching                 │
│  - Rate limiting                        │
└────────────────┬────────────────────────┘
                 │ HTTP (port 3000, internal only)
                 ▼
┌─────────────────────────────────────────┐
│        Docker Container                 │
│  ┌──────────────────────────────────┐   │
│  │     Next.js server (node.js)     │   │
│  │  - Server Components             │   │
│  │  - API Routes / Server Actions   │   │
│  │  - Static file serving           │   │
│  └──────────────────────────────────┘   │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│    Database (Postgres / MySQL / etc.)   │
│  - Separate container OR hosted service │
│    (e.g., Supabase, PlanetScale)        │
└─────────────────────────────────────────┘`}</pre>
        </div>
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

      {/* ── Docker vs PM2 ────────────────────────────────────────────────────── */}
      <section className="mb-10" aria-labelledby="docker-vs-pm2">
        <h2 id="docker-vs-pm2" className="text-lg font-semibold text-white mb-4">
          Docker vs PM2 — Which to Pick?
        </h2>
        <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
            <h3 className="text-sm font-semibold text-cyan-400 mb-3">🐳 Docker</h3>
            <ul className="space-y-1.5 text-xs text-gray-400">
              <li className="flex gap-2"><span className="text-cyan-400">✓</span> Identical environment everywhere</li>
              <li className="flex gap-2"><span className="text-cyan-400">✓</span> Easy to move between VPS providers</li>
              <li className="flex gap-2"><span className="text-cyan-400">✓</span> Works with Kubernetes at scale</li>
              <li className="flex gap-2"><span className="text-cyan-400">✓</span> Isolated from host OS</li>
              <li className="flex gap-2"><span className="text-red-400">✗</span> More setup complexity</li>
              <li className="flex gap-2"><span className="text-red-400">✗</span> Slight memory overhead per container</li>
            </ul>
          </div>
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
            <h3 className="text-sm font-semibold text-red-400 mb-3">🔄 PM2</h3>
            <ul className="space-y-1.5 text-xs text-gray-400">
              <li className="flex gap-2"><span className="text-green-400">✓</span> Simple — just npm install -g pm2</li>
              <li className="flex gap-2"><span className="text-green-400">✓</span> Cluster mode out of the box</li>
              <li className="flex gap-2"><span className="text-green-400">✓</span> Great log management</li>
              <li className="flex gap-2"><span className="text-green-400">✓</span> Lower memory footprint</li>
              <li className="flex gap-2"><span className="text-red-400">✗</span> Tied to specific Node version on host</li>
              <li className="flex gap-2"><span className="text-red-400">✗</span> Not portable to containers/k8s</li>
            </ul>
          </div>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          Recommendation: use PM2 for solo projects on a single VPS. Use Docker when
          you need consistency across multiple environments or plan to scale with
          container orchestration.
        </p>
      </section>

      {/* ── Lesson Navigation ────────────────────────────────────────────────── */}
      <div className="flex justify-between text-sm">
        <Link href="/phase-9/01-vercel-deploy" className="text-gray-500 hover:text-blue-400 transition-colors">
          ← Vercel
        </Link>
        <Link href="/phase-9/03-env-variables" className="text-blue-400 hover:text-blue-300 transition-colors">
          Env Variables →
        </Link>
      </div>
    </main>
  );
}
