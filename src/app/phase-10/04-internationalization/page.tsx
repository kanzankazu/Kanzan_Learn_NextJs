/**
 * Lesson 04 — Internationalization (i18n)
 * Route: /phase-10/04-internationalization
 *
 * WHAT IS INTERNATIONALIZATION (i18n)?
 * ──────────────────────────────────────
 * Internationalization (abbreviated i18n — 18 letters between i and n)
 * is the process of designing your app so it can be adapted to different
 * languages and regions without requiring engineering changes.
 *
 * In a Next.js context, i18n means:
 * 1. ROUTING: Each locale gets its own URL prefix
 *      /en/about     (English)
 *      /id/about     (Indonesian / Bahasa Indonesia)
 *      /ja/about     (Japanese)
 *
 * 2. CONTENT: Text is stored in translation files (messages) and loaded
 *    based on the active locale.
 *
 * 3. FORMATTING: Dates, numbers, and currencies are formatted differently
 *    per locale (e.g., 1.000,50 in Germany vs 1,000.50 in the US).
 *
 * HOW NEXT.JS HANDLES i18n ROUTING:
 * ───────────────────────────────────
 * Next.js does NOT have built-in i18n routing in the App Router
 * (it was removed from the Pages Router approach). Instead, the
 * recommended pattern is:
 *
 * 1. Use middleware to DETECT the user's preferred locale
 *    (from Accept-Language header, cookie, or IP geolocation)
 *
 * 2. REDIRECT the user to the correct locale-prefixed URL
 *    /        →  /en
 *    /about   →  /en/about   (if default locale is 'en')
 *
 * 3. Use a [locale] DYNAMIC SEGMENT as the root of your app:
 *    app/[locale]/page.tsx         →  /en, /id, /ja
 *    app/[locale]/about/page.tsx   →  /en/about, /id/about, etc.
 *
 * THE next-intl PATTERN:
 * ──────────────────────
 * next-intl is the most popular i18n library for Next.js App Router.
 * It provides:
 * - Middleware for locale detection and routing
 * - Server and client hooks (useTranslations, getTranslations)
 * - Type-safe message keys
 * - Formatting utilities (dates, numbers, plurals)
 *
 * ⚠️ IMPORTANT NOTE FOR THIS REPO:
 * ──────────────────────────────────
 * next-intl is NOT installed in this learning project.
 * All code shown below is for LEARNING PURPOSES — shown as strings,
 * not executed. The patterns are accurate to next-intl v3+.
 *
 * WHY SHOW THE PATTERN WITHOUT RUNNING IT?
 * ──────────────────────────────────────────
 * Setting up i18n requires restructuring the entire app (all routes move
 * inside app/[locale]/) plus creating translation JSON files. That is
 * beyond the scope of this learning repo. Instead, this lesson teaches
 * the CONCEPTS and FILE PATTERNS you would use in a real project.
 *
 * LOCALE DETECTION ORDER (next-intl default):
 * ─────────────────────────────────────────────
 * 1. Cookie (user's explicit language preference from a switcher)
 * 2. Accept-Language header (browser's language setting)
 * 3. Default locale (fallback if nothing else matches)
 *
 * LOCALE vs LANGUAGE:
 * ────────────────────
 * Locale = language + region: 'en-US', 'en-GB', 'zh-CN', 'zh-TW'
 * Language = just language: 'en', 'zh', 'id'
 * Usually you work with 2-letter language codes: 'en', 'id', 'ja', 'ko'
 * But you can use full locales for region-specific formatting.
 */

import Link from "next/link";
import type { Metadata } from "next";

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "04 — Internationalization (i18n)",
  description:
    "Learn Next.js i18n routing with the next-intl pattern: locale-based URLs, middleware detection, message files, and useTranslations.",
};

// ─── Code Examples ────────────────────────────────────────────────────────────
// All examples are strings — next-intl is NOT installed in this project.
const CODE_EXAMPLES = [
  {
    id: "folder-structure",
    label: "1. Folder structure — [locale] dynamic segment",
    description:
      "All routes move inside app/[locale]/. This single change makes every route locale-aware. The [locale] param is available to every page and layout inside.",
    code: `app/
├── [locale]/                     ← the locale prefix for ALL routes
│   ├── layout.tsx                ← root layout receives locale in params
│   ├── page.tsx                  ← / (home) per locale
│   ├── about/
│   │   └── page.tsx              ← /about per locale
│   └── products/
│       ├── page.tsx              ← /products per locale
│       └── [id]/
│           └── page.tsx          ← /products/[id] per locale
│
├── middleware.ts                  ← detects locale, redirects / to /en
│
└── messages/                      ← translation files
    ├── en.json                    ← English messages
    ├── id.json                    ← Indonesian messages
    └── ja.json                    ← Japanese messages

# URL examples after setup:
#   /en         → English home
#   /id         → Indonesian home
#   /ja/about   → Japanese about page
#   /           → redirects to /en (middleware handles this)`,
    borderColor: "border-green-500/20",
    bgColor: "bg-green-500/5",
  },
  {
    id: "middleware",
    label: "2. middleware.ts — Locale detection and redirect",
    description:
      "The middleware runs on every request and ensures the URL always has a locale prefix. It reads the Accept-Language header and falls back to the default locale.",
    code: `// middleware.ts
// next-intl provides a createMiddleware helper that handles all of this.
// Here is what it does under the hood (simplified):

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Supported locales in your app
const locales = ['en', 'id', 'ja', 'ko'];
const defaultLocale = 'en';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the URL already has a valid locale prefix
  // e.g., /en/about → locale is 'en', already prefixed
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(\`/\${locale}/\`) || pathname === \`/\${locale}\`
  );

  // If URL already has a valid locale, let the request through
  if (pathnameHasLocale) return NextResponse.next();

  // --- Detect the user's preferred locale ---

  // 1. Check for a previously saved preference cookie
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  if (cookieLocale && locales.includes(cookieLocale)) {
    return NextResponse.redirect(new URL(\`/\${cookieLocale}\${pathname}\`, request.url));
  }

  // 2. Parse the Accept-Language header from the browser
  // Example header: "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7"
  const acceptLanguage = request.headers.get('accept-language') ?? '';
  const preferredLanguage = acceptLanguage
    .split(',')
    .map((part) => part.split(';')[0].trim().slice(0, 2).toLowerCase())
    .find((lang) => locales.includes(lang));

  // 3. Use detected locale or fall back to default
  const locale = preferredLanguage ?? defaultLocale;

  // Redirect /about → /en/about (or /id/about based on detection)
  return NextResponse.redirect(new URL(\`/\${locale}\${pathname}\`, request.url));
}

// Run on all routes EXCEPT Next.js internals and static files
export const config = {
  matcher: ['/((?!_next|api|favicon.ico|.*\\..*).*)'],
};

// ---
// With next-intl installed, the above becomes just:
// import createMiddleware from 'next-intl/middleware';
// export default createMiddleware({ locales, defaultLocale });
// export const config = { matcher: ['/((?!_next|api|.*\\..*).*)', '/'] };`,
    borderColor: "border-blue-500/20",
    bgColor: "bg-blue-500/5",
  },
  {
    id: "messages",
    label: "3. messages/en.json and id.json — Translation files",
    description:
      "Translation messages are stored in JSON files — one per locale. Keys are namespaced to avoid collisions between different parts of the app.",
    code: `// messages/en.json — English translations
{
  "HomePage": {
    "title": "Welcome to our store",
    "subtitle": "Discover amazing products",
    "cta": "Shop now"
  },
  "Navigation": {
    "home": "Home",
    "about": "About",
    "products": "Products",
    "contact": "Contact"
  },
  "ProductCard": {
    "addToCart": "Add to cart",
    "outOfStock": "Out of stock",
    "price": "{amount} {currency}",
    "reviews": "{count, plural, =0 {No reviews} =1 {1 review} other {# reviews}}"
  },
  "Errors": {
    "notFound": "Page not found",
    "serverError": "Something went wrong. Please try again."
  }
}

// messages/id.json — Indonesian translations
{
  "HomePage": {
    "title": "Selamat datang di toko kami",
    "subtitle": "Temukan produk-produk menakjubkan",
    "cta": "Belanja sekarang"
  },
  "Navigation": {
    "home": "Beranda",
    "about": "Tentang",
    "products": "Produk",
    "contact": "Kontak"
  },
  "ProductCard": {
    "addToCart": "Tambah ke keranjang",
    "outOfStock": "Stok habis",
    "price": "{amount} {currency}",
    "reviews": "{count, plural, =0 {Belum ada ulasan} =1 {1 ulasan} other {# ulasan}}"
  },
  "Errors": {
    "notFound": "Halaman tidak ditemukan",
    "serverError": "Terjadi kesalahan. Silakan coba lagi."
  }
}`,
    borderColor: "border-yellow-500/20",
    bgColor: "bg-yellow-500/5",
  },
  {
    id: "server-component",
    label: "4. getTranslations — Using messages in a Server Component",
    description:
      "In Server Components, use the async getTranslations() function to access translated strings. The locale comes from the [locale] URL segment.",
    code: `// app/[locale]/page.tsx
// Server Component — uses getTranslations (async, server-only)
// next-intl reads the locale from the [locale] param automatically.

import { getTranslations } from 'next-intl/server';  // server-side import
import type { Metadata } from 'next';

// Generate locale-specific metadata
export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  // getTranslations is async — must await it
  const t = await getTranslations({ locale: params.locale, namespace: 'HomePage' });
  return { title: t('title') };
}

export default async function HomePage({
  params,
}: {
  params: { locale: string };
}) {
  // Load the 'HomePage' namespace from messages/[locale].json
  const t = await getTranslations({ locale: params.locale, namespace: 'HomePage' });

  return (
    <main>
      {/* t('title') returns the translated string for the active locale */}
      <h1>{t('title')}</h1>
      <p>{t('subtitle')}</p>
      <button>{t('cta')}</button>
    </main>
  );
}

// ─── generateStaticParams — pre-render all locale variants ─────────────────
// Without this, Next.js would not know which locales to pre-render at build.
export function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'id' },
    { locale: 'ja' },
  ];
}`,
    borderColor: "border-violet-500/20",
    bgColor: "bg-violet-500/5",
  },
  {
    id: "client-component",
    label: "5. useTranslations — Using messages in a Client Component",
    description:
      "In Client Components, use the useTranslations() hook (synchronous). The messages for the active locale are pre-fetched and injected by the Server Component parent.",
    code: `// app/[locale]/_components/LocaleSwitcher.tsx
'use client';
// 'use client' because this component uses event handlers (onChange)

import { useTranslations } from 'next-intl';        // client-side hook
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';

export function LocaleSwitcher() {
  const t       = useTranslations('Navigation');  // access Navigation namespace
  const locale  = useLocale();                    // current active locale ('en', 'id', ...)
  const router  = useRouter();
  const pathname = usePathname();

  const LOCALES = [
    { code: 'en', label: 'English' },
    { code: 'id', label: 'Bahasa Indonesia' },
    { code: 'ja', label: '日本語' },
  ];

  function handleChange(newLocale: string) {
    // Replace the locale prefix in the current pathname
    // e.g., /en/about → /id/about
    const newPath = pathname.replace(\`/\${locale}\`, \`/\${newLocale}\`);
    router.push(newPath);

    // Save the preference in a cookie so middleware remembers it
    document.cookie = \`NEXT_LOCALE=\${newLocale}; path=/; max-age=31536000\`;
  }

  return (
    <select value={locale} onChange={(e) => handleChange(e.target.value)}>
      {LOCALES.map(({ code, label }) => (
        <option key={code} value={code}>{label}</option>
      ))}
    </select>
  );
}

// ─── Using useTranslations in a regular Client Component ─────────────────────
// ProductCard.tsx
'use client';
import { useTranslations } from 'next-intl';

export function ProductCard({ name, price, inStock }: {
  name: string;
  price: number;
  inStock: boolean;
}) {
  const t = useTranslations('ProductCard');

  return (
    <div>
      <h2>{name}</h2>
      {/* Interpolation: {amount} and {currency} are replaced at runtime */}
      <p>{t('price', { amount: price, currency: 'USD' })}</p>
      <button disabled={!inStock}>
        {inStock ? t('addToCart') : t('outOfStock')}
      </button>
    </div>
  );
}`,
    borderColor: "border-cyan-500/20",
    bgColor: "bg-cyan-500/5",
  },
  {
    id: "root-layout",
    label: "6. app/[locale]/layout.tsx — Root layout with locale provider",
    description:
      "The [locale] layout wraps the entire app. It sets the HTML lang attribute and provides messages to all child Client Components via the NextIntlClientProvider.",
    code: `// app/[locale]/layout.tsx
// This is the root layout for the localised app.
// It does two critical things:
//   1. Sets <html lang={locale}> for accessibility and SEO
//   2. Wraps children in NextIntlClientProvider so Client Components
//      can access translations via useTranslations()

import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';

const locales = ['en', 'id', 'ja'];

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;

  // If the locale is not in our supported list, show 404
  if (!locales.includes(locale)) {
    notFound();
  }

  // Load the messages JSON for the current locale
  // next-intl reads from messages/[locale].json automatically
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        {/*
         * NextIntlClientProvider passes messages to all Client Components.
         * Without this, useTranslations() in Client Components would fail.
         * The messages are serialised into the HTML so they are available
         * immediately without an extra network fetch.
         */}
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}`,
    borderColor: "border-orange-500/20",
    bgColor: "bg-orange-500/5",
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
export default function InternationalizationPage() {
  return (
    <main className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto">

      {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
      <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
        <span className="mx-2" aria-hidden="true">›</span>
        <Link href="/phase-10" className="hover:text-blue-400 transition-colors">Phase 10</Link>
        <span className="mx-2" aria-hidden="true">›</span>
        <span className="text-gray-300">Internationalization</span>
      </nav>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl" aria-hidden="true">🌍</span>
          <h1 className="text-3xl font-bold text-white">Internationalization (i18n)</h1>
        </div>
        <p className="text-gray-400 leading-relaxed max-w-2xl">
          Serve different languages from locale-prefixed URLs. Learn the
          next-intl pattern: middleware detection, message files, and both
          server and client translation hooks.
        </p>

        {/* ── Library Notice ───────────────────────────────────────────────── */}
        <div className="mt-4 rounded-xl border border-yellow-500/30 bg-yellow-500/5 px-4 py-3">
          <p className="text-sm text-yellow-300 font-semibold mb-1">
            ⚠️ Code Patterns Only — next-intl is NOT installed
          </p>
          <p className="text-xs text-yellow-200/70 leading-relaxed">
            All code shown below uses the next-intl v3 API. next-intl is not
            installed in this project — snippets are shown as educational
            strings only. To use in a real project:{" "}
            <code className="text-yellow-300">npm install next-intl</code>
          </p>
        </div>
      </header>

      {/* ── i18n Concepts Overview ───────────────────────────────────────────── */}
      <section className="mb-10" aria-labelledby="concepts-overview-heading">
        <h2 id="concepts-overview-heading" className="text-lg font-semibold text-white mb-4">
          The Three Pillars of i18n in Next.js
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            {
              emoji: "🗺️",
              title: "Routing",
              body: "Each locale gets a URL prefix: /en/..., /id/..., /ja/... Middleware detects the user's language and redirects bare URLs to the correct prefix.",
              color: "border-blue-500/20 bg-blue-500/5",
            },
            {
              emoji: "💬",
              title: "Translations",
              body: "Text strings are stored in JSON files — one per locale. Components load the right file based on the active locale, never hardcoding UI text.",
              color: "border-green-500/20 bg-green-500/5",
            },
            {
              emoji: "🔢",
              title: "Formatting",
              body: "Dates, numbers, and currencies are formatted per locale. 1000.5 becomes '1,000.50' in en-US, '1.000,50' in de-DE. The Intl API handles this.",
              color: "border-violet-500/20 bg-violet-500/5",
            },
          ].map((card) => (
            <div key={card.title} className={`rounded-xl border p-4 ${card.color}`}>
              <p className="text-2xl mb-2" aria-hidden="true">{card.emoji}</p>
              <h3 className="text-sm font-semibold text-white mb-1">{card.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{card.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Locale Detection Order ───────────────────────────────────────────── */}
      <section className="mb-10" aria-labelledby="detection-heading">
        <h2 id="detection-heading" className="text-lg font-semibold text-white mb-4">
          Locale Detection Order
        </h2>
        <ol className="space-y-3">
          {[
            {
              step: "1",
              title: "Cookie (NEXT_LOCALE)",
              desc: "The user has previously chosen a language via a locale switcher. Their explicit preference is saved in a cookie and respected on all subsequent visits.",
              priority: "Highest priority",
              color: "text-yellow-400",
            },
            {
              step: "2",
              title: "Accept-Language header",
              desc: "The browser sends this header automatically based on the user's OS language settings. It contains a prioritised list of preferred languages.",
              priority: "Second priority",
              color: "text-blue-400",
            },
            {
              step: "3",
              title: "Default locale",
              desc: "If neither the cookie nor the Accept-Language header matches a supported locale, fall back to the configured default (usually 'en').",
              priority: "Fallback",
              color: "text-gray-400",
            },
          ].map((item) => (
            <li key={item.step} className="flex gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <span className="text-lg font-bold text-white font-mono w-6 shrink-0">{item.step}</span>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                  <span className={`text-xs ${item.color}`}>{item.priority}</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ── Key API Reference ────────────────────────────────────────────────── */}
      <section className="mb-10" aria-labelledby="api-heading">
        <h2 id="api-heading" className="text-lg font-semibold text-white mb-4">
          next-intl API at a Glance
        </h2>
        <div className="space-y-3">
          {[
            {
              api: "getTranslations({ locale, namespace })",
              context: "Server Component (async)",
              desc: "Returns a t() function that translates keys in the given namespace. Must be awaited.",
            },
            {
              api: "useTranslations(namespace)",
              context: "Client Component (sync hook)",
              desc: "Returns a t() function for use in client components. Messages must be provided by NextIntlClientProvider higher in the tree.",
            },
            {
              api: "useLocale()",
              context: "Client Component",
              desc: "Returns the currently active locale string: 'en', 'id', 'ja', etc.",
            },
            {
              api: "getLocale()",
              context: "Server Component (async)",
              desc: "Returns the active locale on the server. Useful for formatting dates/numbers on the server.",
            },
            {
              api: "NextIntlClientProvider messages={messages}",
              context: "Root layout (Server Component)",
              desc: "Provides translated messages to all Client Components below. Must wrap the entire app in the [locale] layout.",
            },
            {
              api: "getMessages()",
              context: "Server (async)",
              desc: "Loads the messages JSON for the current locale. Used in the root layout to pass messages to NextIntlClientProvider.",
            },
          ].map((item) => (
            <div key={item.api} className="rounded-xl border border-white/10 bg-green-500/5 p-4">
              <div className="flex items-start justify-between gap-4 mb-1">
                <code className="text-green-300 text-xs font-mono break-all">{item.api}</code>
                <span className="text-xs text-gray-500 shrink-0">{item.context}</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Code Examples ────────────────────────────────────────────────────── */}
      <section className="mb-10" aria-labelledby="code-heading">
        <h2 id="code-heading" className="text-lg font-semibold text-white mb-4">
          Code Examples — next-intl Pattern (code only, not installed)
        </h2>
        <div className="space-y-4">
          {CODE_EXAMPLES.map((ex) => (
            <CodeBlock key={ex.id} {...ex} />
          ))}
        </div>
      </section>

      {/* ── Lesson Navigation ────────────────────────────────────────────────── */}
      <div className="flex justify-between text-sm">
        <Link href="/phase-10/03-edge-runtime" className="text-gray-500 hover:text-blue-400 transition-colors">
          ← Edge Runtime
        </Link>
        <Link href="/phase-10/mini-project" className="text-blue-400 hover:text-blue-300 transition-colors">
          Mini Project →
        </Link>
      </div>
    </main>
  );
}
