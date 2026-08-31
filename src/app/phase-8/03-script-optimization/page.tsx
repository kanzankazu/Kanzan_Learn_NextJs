/**
 * Lesson 03 — Script Optimization with next/script
 * Route: /phase-8/03-script-optimization
 *
 * WHY DO THIRD-PARTY SCRIPTS HURT PERFORMANCE?
 * ─────────────────────────────────────────────
 * Third-party scripts are code written by SOMEONE ELSE that you include
 * on your page. Common examples:
 *   - Analytics: Google Analytics, Mixpanel, Segment
 *   - Ads: Google AdSense
 *   - Chat: Intercom, Zendesk
 *   - Tag managers: Google Tag Manager
 *   - A/B testing: Optimizely
 *
 * The problem: every third-party script you add:
 *   1. Makes an extra HTTP request (DNS + TCP + download)
 *   2. Runs JavaScript that blocks the main thread
 *   3. Can delay your OWN JavaScript from running
 *   4. May trigger more scripts (GTM loading GA, Hotjar, etc.)
 *
 * A Google study found that for every 1 second of script load time,
 * conversions drop by 12%. Third-party scripts are often the biggest
 * culprit behind slow INP (Interaction to Next Paint) scores.
 *
 * HOW next/script HELPS:
 * ───────────────────────
 * The <Script> component from 'next/script' gives you a strategy prop
 * that controls EXACTLY WHEN the script is loaded and executed.
 *
 * Without next/script, you rely on manual async/defer attributes and
 * have no guarantee about ordering or where the script runs.
 *
 * FOUR LOADING STRATEGIES:
 * ─────────────────────────
 *
 * 1. beforeInteractive
 *    WHEN: Before the page becomes interactive (before React hydration)
 *    USE FOR: Scripts that MUST be ready before any user interaction
 *    EXAMPLE: Polyfills, consent management (GDPR cookie banner)
 *    COST: Blocks hydration — use sparingly! This is the most expensive strategy.
 *
 * 2. afterInteractive (DEFAULT)
 *    WHEN: After React hydration completes — page is interactive
 *    USE FOR: Analytics, tag managers — things that track but don't block
 *    EXAMPLE: Google Analytics, Google Tag Manager
 *    COST: Small delay — does not block initial page load
 *
 * 3. lazyOnload
 *    WHEN: During browser idle time, after ALL other resources load
 *    USE FOR: Low-priority scripts that run in the background
 *    EXAMPLE: Chat widgets, social share buttons, A/B testing
 *    COST: Minimal — loaded when browser has nothing else to do
 *
 * 4. worker (experimental)
 *    WHEN: In a Web Worker (off the main thread)
 *    USE FOR: Heavy scripts that would cause janky UI if run on main thread
 *    EXAMPLE: Heavy analytics, ML inference
 *    COST: Requires Partytown integration. Experimental.
 *
 * CALLBACKS:
 * ───────────
 *   onLoad   — fires when the script finishes loading (fires once)
 *   onReady  — fires when script loads AND on every page navigation
 *   onError  — fires if the script fails to load
 */

import Link from "next/link";
import type { Metadata } from "next";

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "03 — Script Optimization",
  description:
    "Learn next/script: control when third-party scripts load with beforeInteractive, afterInteractive, lazyOnload, and worker strategies.",
};

// ─── Strategy Reference Data ───────────────────────────────────────────────────
// Used to render the comparison cards before the code examples.
const STRATEGIES = [
  {
    name: "beforeInteractive",
    timing: "Before hydration",
    priority: "HIGHEST",
    useFor: "Consent banners, critical polyfills",
    warning: "Blocks page load — use only when absolutely necessary",
    color: "border-red-500/20 bg-red-500/5",
    badgeColor: "text-red-400",
    icon: "🔴",
  },
  {
    name: "afterInteractive",
    timing: "After hydration (default)",
    priority: "HIGH",
    useFor: "Analytics, Google Tag Manager",
    warning: "Does not block — safe for tracking scripts",
    color: "border-orange-500/20 bg-orange-500/5",
    badgeColor: "text-orange-400",
    icon: "🟡",
  },
  {
    name: "lazyOnload",
    timing: "Browser idle time",
    priority: "LOW",
    useFor: "Chat widgets, social buttons, A/B testing",
    warning: "Best performance impact — use for non-critical third parties",
    color: "border-green-500/20 bg-green-500/5",
    badgeColor: "text-green-400",
    icon: "🟢",
  },
  {
    name: "worker",
    timing: "Web Worker (off main thread)",
    priority: "OFFLOADED",
    useFor: "Heavy analytics, ML inference",
    warning: "Experimental — requires Partytown setup in next.config.ts",
    color: "border-purple-500/20 bg-purple-500/5",
    badgeColor: "text-purple-400",
    icon: "🔵",
  },
] as const;

// ─── Code Examples ────────────────────────────────────────────────────────────
// NOTE: We do NOT import next/script here — all code is shown as strings.
const CODE_EXAMPLES = [
  {
    id: "after-interactive",
    label: "1. afterInteractive — Analytics (most common pattern)",
    description:
      "The default strategy. The script loads after the page is interactive — users can click and interact normally before the analytics script runs. Use this for Google Analytics, GA4, Segment, and similar tracking scripts.",
    code: `// app/layout.tsx
import Script from 'next/script';

// afterInteractive is the DEFAULT strategy — you can omit it,
// but it's good practice to be explicit about your intent.

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}

        {/* Google Analytics 4 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
          strategy="afterInteractive"
          // onLoad fires when the script file finishes downloading
          onLoad={() => console.log('GA4 script loaded')}
        />
        {/* Inline script that configures GA4 — also afterInteractive */}
        <Script
          id="ga4-config"               // id is REQUIRED for inline scripts
          strategy="afterInteractive"
        >
          {/*
           * Use the template literal curly brace pattern to inject
           * JavaScript code into a <Script> tag.
           */}
          {\`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XXXXXXXXXX');
          \`}
        </Script>
      </body>
    </html>
  );
}`,
    borderColor: "border-orange-500/20",
    bgColor: "bg-orange-500/5",
  },
  {
    id: "before-interactive",
    label: "2. beforeInteractive — Consent management (GDPR)",
    description:
      "GDPR laws require user consent before loading analytics or ads. The consent management script MUST run before React hydration so the consent UI is visible immediately and no tracking starts without permission.",
    code: `// app/layout.tsx
import Script from 'next/script';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/*
         * WHY beforeInteractive here?
         * The consent platform's script needs to:
         *   1. Read cookies to check existing consent
         *   2. Block other scripts until consent is given
         *   3. Show the consent banner before any tracking starts
         *
         * If we used afterInteractive, GA might run before the user
         * sees the consent banner — illegal in GDPR regions.
         *
         * ⚠️ Only use this strategy when you MUST. It blocks everything.
         */}
        <Script
          src="https://cdn.cookielaw.org/scripttemplates/otSDKStub.js"
          strategy="beforeInteractive"
          data-domain-script="YOUR-DOMAIN-SCRIPT-ID"
        />

        {children}
      </body>
    </html>
  );
}

// IMPORTANT: beforeInteractive scripts MUST be placed in layout.tsx
// (not in individual page components). They are injected into the
// initial HTML <head> during Server-Side Rendering.`,
    borderColor: "border-red-500/20",
    bgColor: "bg-red-500/5",
  },
  {
    id: "lazy-onload",
    label: "3. lazyOnload — Chat widget and low-priority scripts",
    description:
      "Chat widgets like Intercom or Crisp are not needed until a user decides to click them. Loading them lazily during browser idle time means zero impact on your LCP or INP scores.",
    code: `// app/layout.tsx
import Script from 'next/script';

// Intercom chat widget — loads after everything else is done
// lazyOnload uses requestIdleCallback internally.
// The browser loads the script when it has nothing else to do.

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}

        {/* Intercom — loads during idle time */}
        <Script
          id="intercom-config"
          strategy="lazyOnload"
          onLoad={() => {
            // This fires when Intercom's script finally loads.
            // We can now call window.Intercom() safely.
            if (typeof window !== 'undefined' && window.Intercom) {
              window.Intercom('boot', {
                app_id: 'your-app-id',
              });
            }
          }}
        >
          {/*
           * Intercom's standard install snippet.
           * Using strategy="lazyOnload" means this runs LAST,
           * after the page is fully loaded and idle.
           */}
          {\`
            (function(){var w=window;var ic=w.Intercom;
            if(typeof ic==="function"){ic('reattach_activator');
            ic('update',w.intercomSettings);}
            else{var d=document;var i=function(){i.c(arguments);};
            i.q=[];i.c=function(args){i.q.push(args);};
            w.Intercom=i;}})();
          \`}
        </Script>
      </body>
    </html>
  );
}`,
    borderColor: "border-green-500/20",
    bgColor: "bg-green-500/5",
  },
  {
    id: "worker",
    label: "4. worker — Off-main-thread execution (experimental)",
    description:
      "Web Workers run JavaScript in a separate thread, keeping the main thread free for UI interactions. The worker strategy uses Partytown to proxy third-party scripts to a worker. Experimental but powerful for heavy analytics.",
    code: `// Step 1: next.config.ts — enable experimental worker strategy
// (Requires @builder.io/partytown package)

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    nextScriptWorkers: true,
  },
};

export default nextConfig;

// Step 2: Install Partytown
// npm install @builder.io/partytown

// Step 3: app/layout.tsx — use strategy="worker"
import Script from 'next/script';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        {/*
         * WHY worker strategy?
         * Heavy analytics scripts make synchronous calls to document/window.
         * Partytown intercepts these calls and proxies them to a Web Worker.
         * The analytics runs in a separate thread → zero main thread blocking.
         * Result: smoother animations and faster INP scores.
         *
         * NOTE: Not all third-party scripts work with Partytown.
         * Scripts that need direct DOM manipulation may break.
         * Test thoroughly before deploying.
         */}
        <Script
          src="https://cdn.example.com/heavy-analytics.js"
          strategy="worker"
        />
      </body>
    </html>
  );
}`,
    borderColor: "border-purple-500/20",
    bgColor: "bg-purple-500/5",
  },
  {
    id: "on-ready",
    label: "5. onReady — Re-initialize on route change (SPA navigation)",
    description:
      "Next.js is a Single-Page Application. When the user navigates between pages, the scripts do not re-load (they are already loaded). Some scripts (like chat widgets) need to re-initialize on every navigation. Use onReady for this.",
    code: `// app/layout.tsx
import Script from 'next/script';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}

        <Script
          id="hotjar"
          strategy="afterInteractive"

          /*
           * onLoad vs onReady:
           *
           * onLoad  — fires ONCE when the script file finishes downloading.
           *           Good for one-time initialization.
           *
           * onReady — fires when script loads AND every time the component
           *           mounts (= every Next.js route change in SPA mode).
           *           Good for scripts that need to re-run on navigation.
           *
           * Hotjar needs to track each "virtual page view" separately,
           * so we use onReady to call hj('stateChange') on each navigation.
           */
          onReady={() => {
            if (typeof window !== 'undefined' && window.hj) {
              window.hj('stateChange', window.location.pathname);
            }
          }}
          onError={(error) => {
            console.error('Hotjar failed to load:', error);
          }}
        >
          {\`
            (function(h,o,t,j,a,r){
              h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
              h._hjSettings={hjid:YOUR_SITE_ID,hjsv:6};
              // ... rest of Hotjar snippet
            })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
          \`}
        </Script>
      </body>
    </html>
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
export default function ScriptOptimizationPage() {
  return (
    <main className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto">

      {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
      <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
        <span className="mx-2" aria-hidden="true">›</span>
        <Link href="/phase-8" className="hover:text-blue-400 transition-colors">Phase 8</Link>
        <span className="mx-2" aria-hidden="true">›</span>
        <span className="text-gray-300">Script Optimization</span>
      </nav>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl" aria-hidden="true">📜</span>
          <h1 className="text-3xl font-bold text-white">Script Optimization</h1>
        </div>
        <p className="text-gray-400 leading-relaxed max-w-2xl">
          Use <code className="text-green-300">next/script</code> to take control of
          when third-party scripts load. The right strategy can save hundreds of
          milliseconds and dramatically improve your INP score.
        </p>
        <div className="mt-4 rounded-xl border border-yellow-500/30 bg-yellow-500/5 px-4 py-3">
          <p className="text-xs text-yellow-200/70">
            ⚠️ Code examples are shown as strings — next/script is NOT imported
            here. Add these patterns to your <code>app/layout.tsx</code> in a real project.
          </p>
        </div>
      </header>

      {/* ── Strategy Comparison Cards ─────────────────────────────────────────── */}
      <section className="mb-10" aria-labelledby="strategies-heading">
        <h2 id="strategies-heading" className="text-lg font-semibold text-white mb-4">
          Loading Strategy Reference
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {STRATEGIES.map((s) => (
            <div key={s.name} className={`rounded-xl border p-4 ${s.color}`}>
              <div className="flex items-center gap-2 mb-2">
                <span aria-hidden="true">{s.icon}</span>
                <code className={`text-sm font-mono font-bold ${s.badgeColor}`}>
                  {s.name}
                </code>
                <span className="text-xs text-gray-600 ml-auto">{s.priority}</span>
              </div>
              <p className="text-xs text-gray-500 mb-1">
                <span className="text-gray-400 font-medium">Timing:</span> {s.timing}
              </p>
              <p className="text-xs text-gray-500 mb-1">
                <span className="text-gray-400 font-medium">Use for:</span> {s.useFor}
              </p>
              <p className="text-xs text-gray-600 mt-2 italic">{s.warning}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Decision Tree ─────────────────────────────────────────────────────── */}
      <section className="mb-10" aria-labelledby="decision-heading">
        <h2 id="decision-heading" className="text-lg font-semibold text-white mb-4">
          Which Strategy Should I Use?
        </h2>
        <div className="rounded-xl border border-white/10 bg-white/2 p-5">
          <pre className="font-mono text-sm text-gray-400 leading-loose overflow-x-auto">
            {`Does this script BLOCK user interaction if missing?
├─ YES → beforeInteractive  (consent management, critical polyfills)
└─ NO
   └─ Is this script heavy / low priority?
      ├─ YES → lazyOnload   (chat widgets, A/B testing, social buttons)
      └─ NO
         └─ Does it need to run off the main thread?
            ├─ YES → worker (experimental, heavy analytics)
            └─ NO  → afterInteractive  ← most scripts land here`}
          </pre>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          When in doubt, use <code className="text-gray-400">afterInteractive</code>.
          It is the default and correct choice for 80% of third-party scripts.
        </p>
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
        <Link href="/phase-8/02-font-optimization" className="text-gray-500 hover:text-blue-400 transition-colors">
          ← Font
        </Link>
        <Link href="/phase-8/04-bundle-analysis" className="text-blue-400 hover:text-blue-300 transition-colors">
          Bundle Analysis →
        </Link>
      </div>
    </main>
  );
}
