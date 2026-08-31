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

| Phase | Topic | Status | Folder |
|-------|-------|--------|--------|
| **Phase 0** | File-based Routing | ⏳ Planned | `src/phase-0/` |
| **Phase 1** | Server vs Client Components | ⏳ Planned | `src/phase-1/` |
| **Phase 2** | Data Fetching | ⏳ Planned | `src/phase-2/` |
| **Phase 3** | Rendering Strategies (SSG/SSR/ISR) | ⏳ Planned | `src/phase-3/` |
| **Phase 4** | Navigation & Metadata | ⏳ Planned | `src/phase-4/` |
| **Phase 5** | Route Handlers & API | ⏳ Planned | `src/phase-5/` |
| **Phase 6** | Authentication | ⏳ Planned | `src/phase-6/` |
| **Phase 7** | Database & ORM | ⏳ Planned | `src/phase-7/` |
| **Phase 8** | Performance & Optimization | ⏳ Planned | `src/phase-8/` |
| **Phase 9** | Deployment | ⏳ Planned | `src/phase-9/` |
| **Phase 10** | Advanced Next.js | ⏳ Planned | `src/phase-10/` |

> **Legend:** ✅ Done · 🔄 In Progress · ⏳ Planned

---

## 📁 Project Structure

```
src/
├── phase-0/                            # File-based Routing
│   ├── 01_app_router_structure.tsx     # Folder → route mapping
│   ├── 02_dynamic_routes.tsx          # [slug], [...slug], [[...slug]]
│   ├── 03_route_groups.tsx            # (group) folders, parallel routes
│   └── mini_project_blog_routes.tsx   # Blog with dynamic + nested routes
│
├── phase-1/                            # Server vs Client Components
│   ├── 01_server_components.tsx       # RSC — async, no useState/useEffect
│   ├── 02_client_components.tsx       # 'use client' — interactivity
│   ├── 03_composition_pattern.tsx     # Server wraps Client, slot pattern
│   └── mini_project_dashboard.tsx    # Server shell + Client widgets
│
├── phase-2/                            # Data Fetching
│   ├── 01_server_fetch.tsx            # fetch() in RSC, async/await
│   ├── 02_caching_revalidation.tsx    # cache(), revalidatePath(), tags
│   ├── 03_parallel_sequential.tsx     # Promise.all vs waterfall
│   ├── 04_server_actions.tsx          # 'use server', form actions, mutations
│   └── mini_project_todo_app.tsx     # Full CRUD with Server Actions
│
├── phase-3/                            # Rendering Strategies
│   ├── 01_static_rendering.tsx        # generateStaticParams, SSG
│   ├── 02_dynamic_rendering.tsx       # cookies(), headers(), SSR
│   ├── 03_isr.tsx                     # revalidate: N, on-demand ISR
│   ├── 04_streaming_suspense.tsx      # loading.tsx, Suspense boundaries
│   └── mini_project_news_site.tsx    # SSG list + SSR detail + ISR cache
│
├── phase-4/                            # Navigation & Metadata
│   ├── 01_link_router.tsx             # <Link>, useRouter, usePathname
│   ├── 02_metadata_api.tsx            # generateMetadata, opengraph, robots
│   ├── 03_loading_error_ui.tsx        # loading.tsx, error.tsx, not-found.tsx
│   └── mini_project_portfolio.tsx    # SEO-optimised portfolio with metadata
│
├── phase-5/                            # Route Handlers & API
│   ├── 01_route_handlers.tsx          # GET/POST/PUT/DELETE in app/api/
│   ├── 02_middleware.tsx              # middleware.ts, matcher config
│   └── mini_project_rest_api.tsx     # Full REST API with route handlers
│
├── phase-6/                            # Authentication
│   ├── 01_nextauth_setup.tsx          # Auth.js providers, session
│   ├── 02_middleware_protection.tsx   # Protected routes via middleware
│   └── mini_project_auth_app.tsx     # Login/logout + protected dashboard
│
├── phase-7/                            # Database & ORM
│   ├── 01_prisma.tsx                  # Schema, client, CRUD queries
│   ├── 02_drizzle.tsx                 # Drizzle schema, type-safe queries
│   ├── 03_supabase.tsx                # Supabase client + RLS
│   └── mini_project_fullstack_app.tsx # Auth + DB + API combined
│
├── phase-8/                            # Performance & Optimization
│   ├── 01_image_optimization.tsx      # next/image, sizes, priority
│   ├── 02_font_optimization.tsx       # next/font, display swap
│   ├── 03_script_optimization.tsx     # next/script, strategy
│   ├── 04_bundle_analysis.tsx         # @next/bundle-analyzer, tree shaking
│   └── mini_project_optimized_site.tsx # All optimizations combined
│
├── phase-9/                            # Deployment
│   ├── 01_vercel_deploy.tsx           # vercel.json, env vars, preview
│   ├── 02_docker_vps.tsx              # Dockerfile, nginx, PM2
│   ├── 03_env_variables.tsx           # .env.local, public vs private
│   └── mini_project_ci_cd.tsx        # GitHub Actions → Vercel pipeline
│
└── phase-10/                           # Advanced Next.js
    ├── 01_intercepting_routes.tsx     # (.) (..) (...) intercept patterns
    ├── 02_parallel_routes.tsx         # @slot, modals, tabs
    ├── 03_edge_runtime.tsx            # Edge functions, geo, A/B testing
    ├── 04_internationalization.tsx    # i18n routing, next-intl
    └── mini_project_advanced_app.tsx  # Intercepting modals + i18n + edge
```

---

## 🗂️ Phase Details

### ⏳ Phase 0 — File-based Routing

| File | Topic | Concepts |
|------|-------|----------|
| `01_app_router_structure.tsx` | App Router | `app/` folder, `page.tsx`, `layout.tsx`, `template.tsx`, nested layouts |
| `02_dynamic_routes.tsx` | Dynamic Routes | `[slug]`, `[...slug]`, `[[...slug]]`, `generateStaticParams` |
| `03_route_groups.tsx` | Route Groups | `(group)` folders, parallel routes `@slot`, intercepting routes |
| `mini_project_blog_routes.tsx` | 🎯 Blog Routes | Multi-level nesting, dynamic slugs, catch-all routes |

### ⏳ Phase 1 — Server vs Client Components

| File | Topic | Concepts |
|------|-------|----------|
| `01_server_components.tsx` | React Server Components | async/await in JSX, no hooks, direct DB access, serializable props |
| `02_client_components.tsx` | Client Components | `'use client'`, useState/useEffect, browser APIs, event handlers |
| `03_composition_pattern.tsx` | Composition | Server wraps Client, children as slot, passing RSC as prop to Client |
| `mini_project_dashboard.tsx` | 🎯 Dashboard | Server shell fetches data, Client widgets handle interactivity |

### ⏳ Phase 2 — Data Fetching

| File | Topic | Concepts |
|------|-------|----------|
| `01_server_fetch.tsx` | Server Fetch | `fetch()` in RSC, `async` page, deduplication, no useEffect needed |
| `02_caching_revalidation.tsx` | Cache Control | `cache: 'force-cache'` / `'no-store'`, `revalidatePath()`, `revalidateTag()` |
| `03_parallel_sequential.tsx` | Fetch Patterns | `Promise.all` parallel, waterfall sequential, when to use each |
| `04_server_actions.tsx` | Server Actions | `'use server'`, form `action`, `useFormStatus`, mutations + revalidate |
| `mini_project_todo_app.tsx` | 🎯 Todo App | Full CRUD — Server Actions for create/update/delete, RSC for read |

### ⏳ Phase 3 — Rendering Strategies

| File | Topic | Concepts |
|------|-------|----------|
| `01_static_rendering.tsx` | SSG | `generateStaticParams`, static at build time, `dynamicParams` |
| `02_dynamic_rendering.tsx` | SSR | `cookies()`, `headers()`, `searchParams`, opt-out of static |
| `03_isr.tsx` | ISR | `revalidate: N` (time-based), `revalidateTag()` (on-demand) |
| `04_streaming_suspense.tsx` | Streaming | `loading.tsx`, `<Suspense>` boundaries, streaming HTML to browser |
| `mini_project_news_site.tsx` | 🎯 News Site | SSG list page + SSR article detail + ISR for cached content |

### ⏳ Phase 4 — Navigation & Metadata

| File | Topic | Concepts |
|------|-------|----------|
| `01_link_router.tsx` | Navigation | `<Link>` prefetch, `useRouter`, `usePathname`, `useSearchParams`, `redirect()` |
| `02_metadata_api.tsx` | Metadata | `export const metadata`, `generateMetadata()`, Open Graph, robots, sitemap |
| `03_loading_error_ui.tsx` | Special Files | `loading.tsx` (instant loading state), `error.tsx` (error boundary), `not-found.tsx` |
| `mini_project_portfolio.tsx` | 🎯 Portfolio | Per-page SEO metadata, og:image, structured data (JSON-LD) |

### ⏳ Phase 5 — Route Handlers & API

| File | Topic | Concepts |
|------|-------|----------|
| `01_route_handlers.tsx` | Route Handlers | `app/api/route.ts`, GET/POST/PUT/DELETE, `NextRequest`/`NextResponse`, cookies |
| `02_middleware.tsx` | Middleware | `middleware.ts`, `matcher` config, auth guard, redirect, A/B testing header |
| `mini_project_rest_api.tsx` | 🎯 REST API | CRUD endpoints, JWT validation in middleware, rate limiting |

### ⏳ Phase 6 — Authentication

| File | Topic | Concepts |
|------|-------|----------|
| `01_nextauth_setup.tsx` | Auth.js | Providers (Google, GitHub, Credentials), session strategy, callbacks |
| `02_middleware_protection.tsx` | Route Protection | `withAuth`, `getToken`, protect routes in middleware, role-based access |
| `mini_project_auth_app.tsx` | 🎯 Auth App | Google Sign-In + protected dashboard + session in RSC + client |

### ⏳ Phase 7 — Database & ORM

| File | Topic | Concepts |
|------|-------|----------|
| `01_prisma.tsx` | Prisma | `schema.prisma`, `prisma generate`, `db push`, CRUD, relations, `$transaction` |
| `02_drizzle.tsx` | Drizzle | Type-safe schema, `drizzle-orm`, query builder, migrations |
| `03_supabase.tsx` | Supabase | `@supabase/ssr`, server vs client instance, RLS policies |
| `mini_project_fullstack_app.tsx` | 🎯 Fullstack | Auth (Phase 6) + DB (Prisma/Supabase) + Server Actions + UI |

### ⏳ Phase 8 — Performance & Optimization

| File | Topic | Concepts |
|------|-------|----------|
| `01_image_optimization.tsx` | Images | `next/image`, `sizes`, `priority`, `placeholder="blur"`, remote patterns |
| `02_font_optimization.tsx` | Fonts | `next/font/google`, `next/font/local`, `display: swap`, CSS variable |
| `03_script_optimization.tsx` | Scripts | `next/script`, `strategy` (beforeInteractive / afterInteractive / lazyOnload) |
| `04_bundle_analysis.tsx` | Bundle | `@next/bundle-analyzer`, dynamic imports, tree shaking, `sideEffects: false` |
| `mini_project_optimized_site.tsx` | 🎯 Optimized Site | Lighthouse 90+ — image + font + script + bundle combined |

### ⏳ Phase 9 — Deployment

| File | Topic | Concepts |
|------|-------|----------|
| `01_vercel_deploy.tsx` | Vercel | `vercel.json`, env vars, preview deployments, domain config |
| `02_docker_vps.tsx` | Docker / VPS | `Dockerfile`, `standalone` output, nginx reverse proxy, PM2 |
| `03_env_variables.tsx` | Env Vars | `.env.local`, `NEXT_PUBLIC_` prefix, server-only secrets, runtime config |
| `mini_project_ci_cd.tsx` | 🎯 CI/CD | GitHub Actions workflow → lint → build → deploy to Vercel |

### ⏳ Phase 10 — Advanced Next.js

| File | Topic | Concepts |
|------|-------|----------|
| `01_intercepting_routes.tsx` | Intercepting Routes | `(.)`, `(..)`, `(...)` patterns, modal-as-route, photo viewer pattern |
| `02_parallel_routes.tsx` | Parallel Routes | `@slot`, default.tsx, conditional UI, modals, tab panels |
| `03_edge_runtime.tsx` | Edge Runtime | `export const runtime = 'edge'`, geo-based logic, feature flags |
| `04_internationalization.tsx` | i18n | `next-intl`, locale routing, `generateStaticParams` for locales |
| `mini_project_advanced_app.tsx` | 🎯 Advanced App | Intercepting modal gallery + i18n + edge A/B test combined |

---

## 📦 Dependencies

```
Runtime:
  next                        Next.js framework
  react, react-dom            React core
  typescript                  Type safety

Auth & DB (Phase 6-7):
  next-auth / auth.js         Authentication
  @prisma/client              Database ORM
  @supabase/ssr               Supabase integration

Styling (optional):
  tailwindcss                 Utility-first CSS
  @tailwindcss/typography     Prose styles

Dev:
  eslint, eslint-config-next  Linting
  @next/bundle-analyzer       Bundle analysis
```

---

## 🔗 References

- [Full Learning Guide](./doc/PANDUAN_ZERO_TO_HERO_NEXTJS.md)
- [nextjs.org/docs](https://nextjs.org/docs) — Official Next.js docs
- [Kanzan Learn React](../Kanzan_Learn_React) — Prerequisite repo
- [Kanzan Learn TypeScript](../Kanzan_Learn_Typescript) — Prerequisite repo
