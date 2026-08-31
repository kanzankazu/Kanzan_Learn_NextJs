# ▲ Kanzan Learn Next.js

A structured Next.js learning repository — from zero to production-ready. Follows the roadmap in [PANDUAN_ZERO_TO_HERO_NEXTJS.md](./doc/PANDUAN_ZERO_TO_HERO_NEXTJS.md).

> **Prerequisite:** Completed [Kanzan Learn React](../Kanzan_Learn_React) and [Kanzan Learn TypeScript](../Kanzan_Learn_Typescript)

---

## 🚀 Getting Started

```bash
npm install
npm run dev        # open http://localhost:3000
npm run build      # production build
npm run lint       # run ESLint
```

---

## 📋 Progress

| Phase | Topic | Status | Route |
|-------|-------|--------|-------|
| **Phase 0** | File-based Routing | ✅ Done | `/phase-0` |
| **Phase 1** | Server vs Client Components | ✅ Done | `/phase-1` |
| **Phase 2** | Data Fetching | ✅ Done | `/phase-2` |
| **Phase 3** | Rendering Strategies (SSG/SSR/ISR) | ✅ Done | `/phase-3` |
| **Phase 4** | Navigation & Metadata | ✅ Done | `/phase-4` |
| **Phase 5** | Route Handlers & API | ✅ Done | `/phase-5` |
| **Phase 6** | Authentication | ✅ Done | `/phase-6` |
| **Phase 7** | Database & ORM | ✅ Done | `/phase-7` |
| **Phase 8** | Performance & Optimization | ✅ Done | `/phase-8` |
| **Phase 9** | Deployment | ✅ Done | `/phase-9` |
| **Phase 10** | Advanced Next.js | ✅ Done | `/phase-10` |

> **Legend:** ✅ Done · 🔄 In Progress · ⏳ Planned

---

## 📁 Project Structure

```
src/app/
├── page.tsx                                  # Home — phase navigator (/)
├── layout.tsx                                # Root layout
├── globals.css                               # Global styles (Tailwind v4)
│
├── phase-0/                                  # File-based Routing
│   ├── page.tsx                              # /phase-0 index
│   ├── 01-app-router-structure/page.tsx      # app/ folder → URL mapping
│   ├── 02-dynamic-routes/page.tsx            # [slug], [...slug], [[...slug]]
│   ├── 03-route-groups/page.tsx              # (group) folders, @slot
│   └── mini-project/                         # 🎯 Blog Routes
│       ├── page.tsx
│       └── blog/[category]/[slug]/page.tsx   # Nested dynamic routes
│
├── phase-1/                                  # Server vs Client Components
│   ├── page.tsx
│   ├── 01-server-components/page.tsx         # RSC — async, no hooks
│   ├── 02-client-components/page.tsx         # 'use client' — interactivity
│   ├── 03-composition-patterns/page.tsx      # Server wraps Client
│   └── mini-project/                         # 🎯 Dashboard
│       ├── page.tsx
│       └── _components/LikeButton.tsx        # Client Component leaf
│
├── phase-2/                                  # Data Fetching
│   ├── page.tsx
│   ├── 01-server-fetch/page.tsx              # fetch() in RSC
│   ├── 02-caching-revalidation/page.tsx      # cache, revalidatePath/Tag
│   ├── 03-parallel-sequential/page.tsx       # Promise.all vs waterfall
│   ├── 04-server-actions/                    # 'use server', form actions
│   │   ├── page.tsx
│   │   └── _components/AddTodoForm.tsx
│   └── mini-project/                         # 🎯 Todo App
│       ├── page.tsx
│       └── _components/TodoList.tsx
│
├── phase-3/                                  # Rendering Strategies
│   ├── page.tsx
│   ├── 01-static-rendering/page.tsx          # SSG, generateStaticParams
│   ├── 02-dynamic-rendering/page.tsx         # SSR, cookies(), headers()
│   ├── 03-isr/page.tsx                       # revalidate: N, on-demand ISR
│   ├── 04-streaming-suspense/page.tsx        # Suspense, loading.tsx
│   └── mini-project/page.tsx                 # 🎯 News Site
│
├── phase-4/                                  # Navigation & Metadata
│   ├── page.tsx
│   ├── 01-link-router/                       # Link, useRouter, usePathname
│   │   ├── page.tsx
│   │   └── _components/RouterDemo.tsx
│   ├── 02-metadata-api/page.tsx              # generateMetadata, OG, JSON-LD
│   ├── 03-loading-error-ui/page.tsx          # loading.tsx, error.tsx, not-found.tsx
│   └── mini-project/page.tsx                 # 🎯 SEO Portfolio
│
├── phase-5/                                  # Route Handlers & API
│   ├── page.tsx
│   ├── 01-route-handlers/page.tsx            # GET/POST/PUT/DELETE patterns
│   ├── 02-middleware/page.tsx                # middleware.ts, matcher config
│   ├── api/items/route.ts                    # ⚡ Real working API endpoint
│   └── mini-project/page.tsx                 # 🎯 Live API Demo (fetches /phase-5/api/items)
│
├── phase-6/                                  # Authentication
│   ├── page.tsx
│   ├── 01-nextauth-setup/page.tsx            # Auth.js providers, session, callbacks
│   ├── 02-middleware-protection/page.tsx     # withAuth, getToken, RBAC
│   └── mini-project/                         # 🎯 Simulated Auth Demo
│       ├── page.tsx
│       └── _components/LoginSimulator.tsx
│
├── phase-7/                                  # Database & ORM
│   ├── page.tsx
│   ├── 01-prisma/page.tsx                    # schema.prisma, CRUD, $transaction
│   ├── 02-drizzle/page.tsx                   # Drizzle schema, query builder
│   ├── 03-supabase/page.tsx                  # @supabase/ssr, RLS, realtime
│   └── mini-project/                         # 🎯 Blog Post Manager
│       ├── page.tsx
│       └── _components/PostManager.tsx
│
├── phase-8/                                  # Performance & Optimization
│   ├── page.tsx
│   ├── 01-image-optimization/page.tsx        # next/image, sizes, priority
│   ├── 02-font-optimization/page.tsx         # next/font, CLS elimination
│   ├── 03-script-optimization/page.tsx       # next/script, loading strategy
│   ├── 04-bundle-analysis/page.tsx           # @next/bundle-analyzer, tree shaking
│   └── mini-project/                         # 🎯 Optimization Checklist
│       ├── page.tsx
│       └── _components/ChecklistClient.tsx
│
├── phase-9/                                  # Deployment
│   ├── page.tsx
│   ├── 01-vercel-deploy/page.tsx             # vercel.json, preview deploys, CLI
│   ├── 02-docker-vps/page.tsx                # Dockerfile, nginx, docker-compose
│   ├── 03-env-variables/page.tsx             # .env.local, NEXT_PUBLIC_, secrets
│   └── mini-project/                         # 🎯 Deployment Checklist
│       ├── page.tsx
│       └── _components/DeployChecklist.tsx
│
└── phase-10/                                 # Advanced Next.js
    ├── page.tsx
    ├── 01-intercepting-routes/page.tsx       # (.) (..) (...) modal patterns
    ├── 02-parallel-routes/page.tsx           # @slot, default.tsx, split-screen
    ├── 03-edge-runtime/page.tsx              # runtime = 'edge', geo, A/B
    ├── 04-internationalization/page.tsx      # next-intl, locale routing
    └── mini-project/                         # 🎯 Advanced Patterns Explorer
        ├── page.tsx
        └── _components/AdvancedPatternsSummary.tsx
```

---

## 🗂️ Phase Details

### ✅ Phase 0 — File-based Routing

| Route | Topic | Concepts |
|-------|-------|----------|
| `01-app-router-structure` | App Router | `app/` folder, `page.tsx`, `layout.tsx`, `template.tsx`, nested layouts |
| `02-dynamic-routes` | Dynamic Routes | `[slug]`, `[...slug]`, `[[...slug]]`, `generateStaticParams`, `searchParams` |
| `03-route-groups` | Route Groups | `(group)` folders, parallel routes `@slot`, when to use each |
| `mini-project` | 🎯 Blog Routes | Multi-level nesting `[category]/[slug]`, `notFound()`, catch-all routes |

### ✅ Phase 1 — Server vs Client Components

| Route | Topic | Concepts |
|-------|-------|----------|
| `01-server-components` | React Server Components | async/await in JSX, no hooks, direct DB access, zero JS to browser |
| `02-client-components` | Client Components | `'use client'`, useState/useEffect, browser APIs, event handlers |
| `03-composition-patterns` | Composition | Server wraps Client, children as slot, client boundary best practices |
| `mini-project` | 🎯 Dashboard | Server shell + async data fetch, Client `LikeButton` leaf component |

### ✅ Phase 2 — Data Fetching

| Route | Topic | Concepts |
|-------|-------|----------|
| `01-server-fetch` | Server Fetch | `fetch()` in RSC, `async` page, deduplication, no useEffect needed |
| `02-caching-revalidation` | Cache Control | `force-cache` / `no-store`, `revalidatePath()`, `revalidateTag()` |
| `03-parallel-sequential` | Fetch Patterns | `Promise.all` parallel, waterfall sequential, timing comparison |
| `04-server-actions` | Server Actions | `'use server'`, form `action`, `useFormStatus`, mutations |
| `mini-project` | 🎯 Todo App | `TodoList` client CRUD, simulated Server Actions pattern |

### ✅ Phase 3 — Rendering Strategies

| Route | Topic | Concepts |
|-------|-------|----------|
| `01-static-rendering` | SSG | `generateStaticParams`, static at build time, `dynamicParams` |
| `02-dynamic-rendering` | SSR | `cookies()`, `headers()`, `searchParams`, opt-out of static cache |
| `03-isr` | ISR | `revalidate: N` (time-based), `revalidateTag()` (on-demand), stale-while-revalidate |
| `04-streaming-suspense` | Streaming | `loading.tsx`, `<Suspense>` boundaries, streaming HTML, TTFB improvement |
| `mini-project` | 🎯 News Site | SSG hero + dynamic breaking news + static article grid + Suspense |

### ✅ Phase 4 — Navigation & Metadata

| Route | Topic | Concepts |
|-------|-------|----------|
| `01-link-router` | Navigation | `<Link>` prefetch, `useRouter`, `usePathname`, `useSearchParams`, `redirect()` |
| `02-metadata-api` | Metadata | `export const metadata`, `generateMetadata()`, Open Graph, robots, JSON-LD |
| `03-loading-error-ui` | Special Files | `loading.tsx` (Suspense), `error.tsx` (Error Boundary), `not-found.tsx` |
| `mini-project` | 🎯 SEO Portfolio | `generateMetadata()`, og:image, keywords, JSON-LD `schema.org/Person` |

### ✅ Phase 5 — Route Handlers & API

| Route | Topic | Concepts |
|-------|-------|----------|
| `01-route-handlers` | Route Handlers | `app/api/route.ts`, GET/POST/PUT/DELETE, `NextRequest`/`NextResponse`, cookies |
| `02-middleware` | Middleware | `middleware.ts`, `matcher` config, auth guard, rewrite, headers, locale |
| `api/items` | ⚡ Live API | Real working endpoint — `GET /phase-5/api/items?search=&limit=` |
| `mini-project` | 🎯 Live API Demo | Client fetches from route handler, debounced search, loading skeleton |

### ✅ Phase 6 — Authentication

| Route | Topic | Concepts |
|-------|-------|----------|
| `01-nextauth-setup` | Auth.js | Providers (Google, GitHub, Credentials), session/JWT strategy, callbacks |
| `02-middleware-protection` | Route Protection | `withAuth`, `getToken`, role-based access, `matcher` config |
| `mini-project` | 🎯 Auth Demo | Simulated login/logout with role-based UI (user vs admin), session JSON display |

### ✅ Phase 7 — Database & ORM

| Route | Topic | Concepts |
|-------|-------|----------|
| `01-prisma` | Prisma | `schema.prisma`, `prisma generate`, `db push`, CRUD, relations, `$transaction` |
| `02-drizzle` | Drizzle | Type-safe schema, `drizzle-orm`, query builder, `$inferSelect` / `$inferInsert` |
| `03-supabase` | Supabase | `@supabase/ssr`, server vs browser client, RLS, Auth, Realtime |
| `mini-project` | 🎯 Post Manager | Client CRUD with `PostManager`, inline edit, two-step delete, draft/publish |

### ✅ Phase 8 — Performance & Optimization

| Route | Topic | Concepts |
|-------|-------|----------|
| `01-image-optimization` | Images | `next/image`, `sizes`, `priority`, `placeholder="blur"`, remote patterns |
| `02-font-optimization` | Fonts | `next/font/google`, `next/font/local`, CLS elimination, CSS variable |
| `03-script-optimization` | Scripts | `next/script`, `strategy` (beforeInteractive / afterInteractive / lazyOnload / worker) |
| `04-bundle-analysis` | Bundle | `@next/bundle-analyzer`, dynamic imports, tree shaking, barrel file anti-pattern |
| `mini-project` | 🎯 Optimization Checklist | Interactive checklist with progress score, 12 optimization items |

### ✅ Phase 9 — Deployment

| Route | Topic | Concepts |
|-------|-------|----------|
| `01-vercel-deploy` | Vercel | `vercel.json`, env vars, preview deployments, Vercel CLI, custom domains |
| `02-docker-vps` | Docker / VPS | Multi-stage `Dockerfile`, `standalone` output, nginx, `docker-compose` |
| `03-env-variables` | Env Vars | `.env.local`, `NEXT_PUBLIC_` prefix, server-only secrets, Zod validation pattern |
| `mini-project` | 🎯 Deploy Checklist | Interactive pre-deploy checklist (Build, Security, Performance, Monitoring) |

### ✅ Phase 10 — Advanced Next.js

| Route | Topic | Concepts |
|-------|-------|----------|
| `01-intercepting-routes` | Intercepting Routes | `(.)`, `(..)`, `(...)` patterns, modal-as-route, `default.tsx` requirement |
| `02-parallel-routes` | Parallel Routes | `@slot`, `default.tsx` fallback, split-screen dashboards, modals |
| `03-edge-runtime` | Edge Runtime | `export const runtime = 'edge'`, geo-based logic, A/B testing, limitations |
| `04-internationalization` | i18n | `next-intl` patterns, locale routing middleware, `useTranslations` |
| `mini-project` | 🎯 Advanced Patterns | Expand/collapse summary of all Phase 10 patterns with use cases |

---

## 📦 Dependencies

```
Runtime:
  next@15              Next.js framework
  react@19             React core
  react-dom@19         React DOM
  typescript@5         Type safety

Styling:
  tailwindcss@4        Utility-first CSS (v4 — uses @import "tailwindcss")
  @tailwindcss/postcss PostCSS plugin for Tailwind v4

Dev:
  eslint               Linting
  eslint-config-next   Next.js ESLint rules
```

> **Note:** Phase 6 (Auth.js), Phase 7 (Prisma/Drizzle/Supabase), and Phase 8 (@next/bundle-analyzer) show **code pattern examples only** — those libraries are not installed. The focus is understanding the patterns, not running the libraries.

---

## 🔗 References

- [Full Learning Guide](./doc/PANDUAN_ZERO_TO_HERO_NEXTJS.md)
- [nextjs.org/docs](https://nextjs.org/docs) — Official Next.js docs
- [Kanzan Learn React](../Kanzan_Learn_React) — Prerequisite repo
- [Kanzan Learn TypeScript](../Kanzan_Learn_Typescript) — Prerequisite repo
