/**
 * Lesson 02 — Font Optimization with next/font
 * Route: /phase-8/02-font-optimization
 *
 * WHY DOES FONT LOADING MATTER?
 * ──────────────────────────────
 * Custom fonts improve your design but can seriously hurt performance if
 * loaded naively. Two specific problems:
 *
 *   1. FOUT (Flash of Unstyled Text)
 *      Your page renders with a system font (Arial, Times New Roman) while
 *      the custom font downloads. When the font arrives, ALL the text reflows
 *      to the new font. Users see a jarring "flash" of the wrong font.
 *
 *   2. CLS (Cumulative Layout Shift)
 *      The system font and custom font have different letter widths.
 *      When the custom font loads and text reflows, elements on the page
 *      physically MOVE to accommodate the new text sizes. CLS is a Core
 *      Web Vital that Google uses as a ranking signal.
 *
 * THE OLD WAY — CSS @import (bad):
 * ──────────────────────────────────
 *   @import url('https://fonts.googleapis.com/css2?family=Inter');
 *
 *   Problems:
 *   - Makes an HTTP request to Google's servers (extra latency)
 *   - User IP is sent to Google on every page load (GDPR concern)
 *   - Font files are served from Google's CDN, not yours (no control)
 *   - Browser waits for the @import to complete before applying styles
 *   - Causes FOUT because the font is not preloaded
 *
 * HOW next/font SOLVES EVERYTHING:
 * ──────────────────────────────────
 *   next/font works at BUILD TIME:
 *
 *   1. Downloads the font files from Google during the build
 *   2. Stores them in your app's static assets (self-hosted)
 *   3. Generates OPTIMISED CSS with font-display:swap
 *   4. Calculates a size-adjust value to match the fallback font's
 *      line heights → near-zero CLS even before the font loads
 *   5. Inlines the @font-face CSS in the <head> — no extra HTTP request
 *
 *   Result: zero runtime requests to Google, zero FOUT, zero CLS.
 *
 * USAGE PATTERNS:
 * ────────────────
 *   Two sub-packages:
 *   - next/font/google  — for Google Fonts (Inter, Roboto, etc.)
 *   - next/font/local   — for self-hosted font files (.woff2, .ttf)
 *
 * CSS VARIABLES:
 * ───────────────
 *   Instead of applying the font class directly, you can expose it as a
 *   CSS variable and use it in Tailwind config. This is the recommended
 *   pattern for Tailwind v4 integration.
 */

import Link from "next/link";
import type { Metadata } from "next";

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "02 — Font Optimization",
  description:
    "Learn next/font: eliminate FOUT and CLS, self-host Google Fonts at build time, and integrate with Tailwind CSS variables.",
};

// ─── Code Examples ────────────────────────────────────────────────────────────
// NOTE: We do NOT actually import next/font here.
// All examples are strings shown in <pre> blocks for learning purposes.
const CODE_EXAMPLES = [
  {
    id: "google-basic",
    label: "1. next/font/google — Basic setup in layout.tsx",
    description:
      "Import a Google Font at build time. The font is downloaded, self-hosted, and the CSS is inlined. No runtime request to Google. Apply the font via className on the <body> element.",
    code: `// app/layout.tsx
import { Inter } from 'next/font/google';
// ^ This import triggers a BUILD-TIME download of the Inter font files.
//   The font is stored in .next/static/media/

// Configure the font: choose weights, subsets, and whether to use a CSS variable
const inter = Inter({
  /*
   * subsets — IMPORTANT for performance!
   * Google Fonts has hundreds of glyphs. You only need the ones for your language.
   *   'latin'          — English, most European languages
   *   'latin-ext'      — Extended Latin (special diacritics)
   *   'cyrillic'       — Russian, Bulgarian, etc.
   *   'greek'          — Greek
   *   'vietnamese'     — Vietnamese
   * Only include what your app actually uses. Every extra subset = more bytes.
   */
  subsets: ['latin'],

  // weights — which font weights to include. Only include what you use.
  // Inter supports: '100', '200', '300', '400', '500', '600', '700', '800', '900'
  // Variable fonts (like Inter) accept 'variable' instead → all weights in one file
  weight: ['400', '500', '600', '700'],

  // display — 'swap' means: show fallback font immediately, swap when custom font loads
  // This is the default and eliminates the invisible-text period.
  display: 'swap',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/*
       * inter.className adds a class like '__className_abc123' that applies:
       *   font-family: 'Inter', sans-serif;
       * Putting it on <body> makes Inter the default font for the entire page.
       */}
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}`,
    borderColor: "border-purple-500/20",
    bgColor: "bg-purple-500/5",
  },
  {
    id: "multiple-fonts",
    label: "2. Multiple fonts — Primary + accent",
    description:
      "Many designs use two fonts: one for body text (readable, neutral) and one for headings (expressive). You can load multiple fonts and apply them to different elements.",
    code: `// app/layout.tsx
import { Inter, Playfair_Display } from 'next/font/google';
// Note: Google Fonts names with spaces use underscores in the import

// Primary font — used for body text
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-body',  // CSS variable name (for Tailwind integration)
});

// Accent font — used for headings only
const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['700', '900'],
  style: ['normal', 'italic'], // Include italic variant too
  variable: '--font-heading',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/*
       * Apply BOTH font classes to the body.
       * The fonts don't conflict — each is exposed as a CSS variable.
       * You can then use var(--font-body) or var(--font-heading) in CSS/Tailwind.
       */}
      <body className={\`\${inter.variable} \${playfair.variable}\`}>
        {children}
      </body>
    </html>
  );
}

// In a component:
// <h1 style={{ fontFamily: 'var(--font-heading)' }}>Title</h1>
// <p  style={{ fontFamily: 'var(--font-body)' }}>Paragraph</p>`,
    borderColor: "border-blue-500/20",
    bgColor: "bg-blue-500/5",
  },
  {
    id: "css-variable-tailwind",
    label: "3. CSS variable + Tailwind v4 integration",
    description:
      "The recommended pattern for Tailwind projects. Expose the font as a CSS variable, then register it in your Tailwind config. This lets you use font-sans or font-heading utility classes anywhere.",
    code: `// Step 1: app/layout.tsx — expose font as CSS variable
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',   // The CSS variable name we will use in Tailwind
  display: 'swap',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        {/*
         * inter.variable adds a class that sets --font-sans to the Inter font.
         * We do NOT use inter.className here — we just expose the variable.
         */}
        {children}
      </body>
    </html>
  );
}

// Step 2: globals.css — register in Tailwind v4 theme
// (Tailwind v4 uses CSS @theme instead of tailwind.config.js)
/*
  @import "tailwindcss";

  @theme {
    --font-family-sans: var(--font-sans), ui-sans-serif, system-ui, sans-serif;
    // Now 'font-sans' Tailwind class uses Inter from next/font
  }
*/

// Step 3: Use in components
// <p className="font-sans">This uses Inter</p>
// <h1 className="font-heading">This uses the heading font</h1>`,
    borderColor: "border-green-500/20",
    bgColor: "bg-green-500/5",
  },
  {
    id: "local-font",
    label: "4. next/font/local — Self-hosted font files",
    description:
      "If you have custom font files (purchased from a type foundry, or a variable font not on Google Fonts), use next/font/local. Place the font files in your /public or /app folder.",
    code: `// app/layout.tsx
import localFont from 'next/font/local';

// next/font/local reads the file from disk at BUILD TIME.
// 'src' path is relative to THIS file (app/layout.tsx).
const customFont = localFont({
  src: [
    {
      path: '../fonts/CustomFont-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/CustomFont-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../fonts/CustomFont-BoldItalic.woff2',
      weight: '700',
      style: 'italic',
    },
  ],
  variable: '--font-custom',
  display: 'swap',
  // fallback — fonts to use while the custom font loads.
  // next/font uses these to calculate size-adjust (the zero-CLS magic).
  fallback: ['Helvetica Neue', 'Arial', 'sans-serif'],
});

// VARIABLE FONT (single file, all weights):
const variableFont = localFont({
  src: '../fonts/Inter-Variable.woff2',
  variable: '--font-sans',
  // No weight needed — variable fonts support all weights in one file
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={customFont.className}>
        {children}
      </body>
    </html>
  );
}`,
    borderColor: "border-orange-500/20",
    bgColor: "bg-orange-500/5",
  },
  {
    id: "component-scoped",
    label: "5. Component-scoped font — Use on a single element",
    description:
      "You don't have to apply fonts globally. You can scope a font to a single component — useful for decorative headings or a section with a unique typographic style.",
    code: `// components/Hero.tsx
// You can use next/font OUTSIDE of layout.tsx — in any Server Component.
// The font is still self-hosted and zero-CLS.

import { Bebas_Neue } from 'next/font/google';

// This font is only loaded when the Hero component is on the page.
// The CSS is scoped to this component's className.
const bebas = Bebas_Neue({
  subsets: ['latin'],
  weight: '400',               // Bebas Neue only has one weight
  display: 'swap',
});

export default function Hero() {
  return (
    <section>
      {/*
       * Apply the font ONLY to the heading, not the whole page.
       * bebas.className adds: font-family: 'Bebas Neue', cursive;
       */}
      <h1 className={\`\${bebas.className} text-7xl uppercase tracking-wider\`}>
        Performance Matters
      </h1>
      {/* This paragraph uses the global body font, not Bebas Neue */}
      <p className="text-gray-600">
        Fast sites win. Slow sites lose.
      </p>
    </section>
  );
}`,
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
export default function FontOptimizationPage() {
  return (
    <main className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto">

      {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
      <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
        <span className="mx-2" aria-hidden="true">›</span>
        <Link href="/phase-8" className="hover:text-blue-400 transition-colors">Phase 8</Link>
        <span className="mx-2" aria-hidden="true">›</span>
        <span className="text-gray-300">Font Optimization</span>
      </nav>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl" aria-hidden="true">🔤</span>
          <h1 className="text-3xl font-bold text-white">Font Optimization</h1>
        </div>
        <p className="text-gray-400 leading-relaxed max-w-2xl">
          Use <code className="text-purple-300">next/font</code> to self-host Google
          Fonts at build time. Zero layout shift, zero external requests, zero FOUT —
          and it works with any font from Google Fonts or your own files.
        </p>
        <div className="mt-4 rounded-xl border border-yellow-500/30 bg-yellow-500/5 px-4 py-3">
          <p className="text-xs text-yellow-200/70">
            ⚠️ next/font is NOT imported in this demo page — code examples are
            shown as strings. In your real app, add these patterns to{" "}
            <code>app/layout.tsx</code>.
          </p>
        </div>
      </header>

      {/* ── FOUT vs next/font Comparison ─────────────────────────────────────── */}
      <section className="mb-10" aria-labelledby="comparison-heading">
        <h2 id="comparison-heading" className="text-lg font-semibold text-white mb-4">
          CSS @import vs next/font
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
            <h3 className="text-sm font-semibold text-red-400 mb-3">
              CSS @import (old way)
            </h3>
            <ol className="space-y-2 text-xs text-gray-400">
              <li className="flex gap-2">
                <span className="text-gray-600 font-mono">1.</span>
                Browser parses HTML, finds @import in CSS
              </li>
              <li className="flex gap-2">
                <span className="text-gray-600 font-mono">2.</span>
                Browser sends request to fonts.googleapis.com
              </li>
              <li className="flex gap-2">
                <span className="text-gray-600 font-mono">3.</span>
                DNS lookup + TCP connection + CSS response
              </li>
              <li className="flex gap-2">
                <span className="text-gray-600 font-mono">4.</span>
                Browser parses @font-face, requests .woff2 files
              </li>
              <li className="flex gap-2">
                <span className="text-gray-600 font-mono">5.</span>
                {"Page shows with system font (FOUT)"}
              </li>
              <li className="flex gap-2">
                <span className="text-gray-600 font-mono">6.</span>
                Font loads → text reflows → CLS recorded
              </li>
            </ol>
            <p className="text-xs text-red-400/60 mt-3">
              Total: 2 extra round trips + layout shift
            </p>
          </div>

          <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-5">
            <h3 className="text-sm font-semibold text-purple-400 mb-3">
              next/font (new way)
            </h3>
            <ol className="space-y-2 text-xs text-gray-400">
              <li className="flex gap-2">
                <span className="text-gray-600 font-mono">1.</span>
                Build: font downloaded from Google, stored locally
              </li>
              <li className="flex gap-2">
                <span className="text-gray-600 font-mono">2.</span>
                size-adjust calculated to match fallback font
              </li>
              <li className="flex gap-2">
                <span className="text-gray-600 font-mono">3.</span>
                @font-face CSS inlined in &lt;head&gt; — no extra request
              </li>
              <li className="flex gap-2">
                <span className="text-gray-600 font-mono">4.</span>
                Browser preloads font in parallel with HTML
              </li>
              <li className="flex gap-2">
                <span className="text-gray-600 font-mono">5.</span>
                Fallback font matches custom font dimensions — no shift
              </li>
              <li className="flex gap-2">
                <span className="text-gray-600 font-mono">6.</span>
                Font swaps in silently — CLS = 0
              </li>
            </ol>
            <p className="text-xs text-purple-400/60 mt-3">
              Total: 0 extra round trips + 0 layout shift
            </p>
          </div>
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
              term: "font.className",
              def: "A unique class string (e.g. '__className_a1b2c3') that sets font-family on the element it is applied to. Use this for direct font application.",
            },
            {
              term: "font.variable",
              def: "A unique class that exposes the font as a CSS custom property (e.g. '--font-sans'). Use this when integrating with Tailwind or your own CSS. Does NOT apply the font directly.",
            },
            {
              term: "subsets",
              def: "Which character sets to include. 'latin' covers English and most European languages. Including unnecessary subsets (like 'cyrillic' for an English-only site) wastes bandwidth.",
            },
            {
              term: "display: 'swap'",
              def: "Controls font-display CSS behaviour. 'swap' = show fallback text immediately, swap to custom font when ready. This is the default and prevents invisible text (FOIT).",
            },
            {
              term: "size-adjust (automatic)",
              def: "next/font automatically calculates size-adjust, ascent-override, descent-override, and line-gap-override values so your fallback font has nearly identical line heights to the custom font. This is why CLS is near zero.",
            },
            {
              term: "fallback",
              def: "Font families to use while the custom font loads. next/font uses these to compute the size-adjust values. Always provide fonts that are similar in width to your custom font.",
            },
          ].map((item) => (
            <div key={item.term} className="rounded-xl border border-white/10 bg-purple-500/5 p-4">
              <code className="text-purple-300 text-sm font-mono">{item.term}</code>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">{item.def}</p>
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
        <Link href="/phase-8/01-image-optimization" className="text-gray-500 hover:text-blue-400 transition-colors">
          ← Image
        </Link>
        <Link href="/phase-8/03-script-optimization" className="text-blue-400 hover:text-blue-300 transition-colors">
          Script →
        </Link>
      </div>
    </main>
  );
}
