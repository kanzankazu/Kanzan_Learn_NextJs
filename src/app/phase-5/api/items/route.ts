/**
 * Route Handler — GET /phase-5/api/items
 * File: app/phase-5/api/items/route.ts
 *
 * WHAT IS THIS FILE?
 * ───────────────────
 * This is a REAL working API endpoint built into the Next.js app.
 * It is NOT a React component — it has no JSX, no UI.
 * It handles HTTP GET requests and returns JSON data.
 *
 * WHY IS IT HERE (inside phase-5/api/) AND NOT app/api/?
 * ────────────────────────────────────────────────────────
 * Route handlers follow the same folder-based routing as pages.
 * A route.ts at app/phase-5/api/items/route.ts maps to the URL /phase-5/api/items.
 * We keep it scoped inside phase-5/ so it doesn't pollute the top-level /api/ namespace.
 *
 * In a real production app you'd likely use app/api/items/route.ts → /api/items.
 *
 * WHAT DOES THIS ENDPOINT DO?
 * ────────────────────────────
 * GET /phase-5/api/items           → returns the full list of items
 * GET /phase-5/api/items?search=a  → returns items whose name or category contains "a"
 * GET /phase-5/api/items?limit=3   → returns at most 3 items
 *
 * HOW TO TEST:
 * ─────────────
 * Option 1: Open in browser:
 *   http://localhost:3000/phase-5/api/items
 *   http://localhost:3000/phase-5/api/items?search=fruit
 *
 * Option 2: Use curl in a terminal:
 *   curl http://localhost:3000/phase-5/api/items
 *   curl "http://localhost:3000/phase-5/api/items?search=apple"
 *
 * Option 3: The Mini Project page fetches from this endpoint automatically.
 *
 * STRUCTURE OF THIS FILE:
 * ─────────────────────────
 * 1. Type definitions for our data shape
 * 2. Mock data (simulates a database)
 * 3. GET handler function
 * 4. Helper functions used by the handler
 */

import { NextRequest, NextResponse } from "next/server";
// NextRequest: extends the web standard Request with Next.js helpers
//   - .nextUrl (parsed URL object with searchParams, pathname, etc.)
//   - .cookies (read cookies from the incoming request)
//   - .geo, .ip (when deployed on Vercel Edge)
//
// NextResponse: extends the web standard Response with Next.js helpers
//   - NextResponse.json(data, options) → sets Content-Type: application/json
//   - NextResponse.redirect(url)       → 3xx redirect
//   - NextResponse.rewrite(url)        → internal rewrite (used in middleware)

// ─── Types ────────────────────────────────────────────────────────────────────
// Define the shape of a single item.
// TypeScript interfaces ensure our data is consistent throughout the handler.
interface Item {
  id: number;
  name: string;
  category: string;
  price: number;
  inStock: boolean;
}

// Shape of the JSON response our API returns.
// Having an explicit type makes it easy to write matching types on the client side.
interface ItemsResponse {
  items: Item[];
  total: number;        // how many items matched the search (before limit)
  count: number;        // how many items are in this response (after limit)
  search: string;       // echo back the search param so the client knows what was applied
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
// In a real app, this would be a database query (Prisma, Drizzle, Supabase, etc.).
// We use hardcoded data here so the lesson has no external dependencies.
// The data is varied enough to show meaningful filtering results.
const MOCK_ITEMS: Item[] = [
  { id: 1,  name: "Apple",        category: "fruit",     price: 0.99,  inStock: true  },
  { id: 2,  name: "Banana",       category: "fruit",     price: 0.49,  inStock: true  },
  { id: 3,  name: "Cherry",       category: "fruit",     price: 3.99,  inStock: false },
  { id: 4,  name: "Avocado",      category: "vegetable", price: 1.99,  inStock: true  },
  { id: 5,  name: "Broccoli",     category: "vegetable", price: 1.29,  inStock: true  },
  { id: 6,  name: "Carrot",       category: "vegetable", price: 0.79,  inStock: true  },
  { id: 7,  name: "Almond Milk",  category: "dairy",     price: 3.49,  inStock: true  },
  { id: 8,  name: "Butter",       category: "dairy",     price: 2.99,  inStock: false },
  { id: 9,  name: "Cheddar",      category: "dairy",     price: 4.99,  inStock: true  },
  { id: 10, name: "Bread",        category: "bakery",    price: 2.49,  inStock: true  },
  { id: 11, name: "Bagel",        category: "bakery",    price: 1.99,  inStock: true  },
  { id: 12, name: "Croissant",    category: "bakery",    price: 2.29,  inStock: false },
];

// ─── Helper: Filter Items ─────────────────────────────────────────────────────
/**
 * Filters the items array by a search string.
 *
 * WHAT: Checks if the search term appears in either the item's name or category.
 * WHY:  Extracting this logic into a helper keeps the GET handler clean and readable.
 *       It also makes this logic independently testable.
 *
 * @param items   - The full array of items to search through.
 * @param search  - The search string (case-insensitive). Empty string = no filtering.
 * @returns       - A new array containing only items that match the search.
 */
function filterItems(items: Item[], search: string): Item[] {
  // If search is empty, return all items — no filtering needed.
  if (!search) return items;

  // Convert search to lowercase once (cheaper than converting each item repeatedly).
  const searchLower = search.toLowerCase();

  // .filter() returns a new array — it never mutates the original.
  // We check BOTH name and category so users can search by either.
  return items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchLower) ||
      item.category.toLowerCase().includes(searchLower)
  );
}

// ─── GET Handler ──────────────────────────────────────────────────────────────
/**
 * Handles: GET /phase-5/api/items
 *
 * WHAT: Returns a JSON list of items, optionally filtered by a search term.
 *
 * Query parameters:
 *   ?search=<string>  - Filter items by name or category (case-insensitive)
 *   ?limit=<number>   - Maximum number of items to return (default: 20)
 *
 * Response shape: ItemsResponse
 *   { items: Item[], total: number, count: number, search: string }
 *
 * WHY async?
 * In theory a simple handler doesn't need async, but route handlers can call
 * await (e.g. for DB queries or external API calls) so async is the convention.
 * Next.js handles the Promise resolution for you.
 */
export async function GET(request: NextRequest): Promise<NextResponse<ItemsResponse>> {
  // ── Read Query Parameters ────────────────────────────────────────────────
  // request.nextUrl is a URL object — use it instead of new URL(request.url)
  // because it handles relative URLs correctly in Next.js.
  const { searchParams } = request.nextUrl;

  // .get() returns the value as a string, or null if the param is absent.
  // We use the nullish coalescing operator (??) to provide defaults.
  const search = searchParams.get("search") ?? "";   // default: no filter
  const limitParam = searchParams.get("limit");
  // Parse the limit as a number. If it's not a valid number, use 20.
  // Math.max prevents 0 or negative values; Math.min caps at 100.
  const limit = limitParam
    ? Math.min(Math.max(Number(limitParam), 1), 100)
    : 20;

  // ── Filter the Data ──────────────────────────────────────────────────────
  // In a real app, filtering would happen inside a DB query (WHERE clause).
  // Here we filter in memory for simplicity.
  const filtered = filterItems(MOCK_ITEMS, search);

  // ── Apply Limit ──────────────────────────────────────────────────────────
  // .slice(0, limit) returns the first `limit` items.
  // If filtered.length < limit, it returns all of them (no error).
  const limited = filtered.slice(0, limit);

  // ── Build and Return Response ────────────────────────────────────────────
  // NextResponse.json() automatically:
  //   1. Serialises the object to JSON string
  //   2. Sets Content-Type: application/json header
  //   3. Sets status 200 (default)
  const responseBody: ItemsResponse = {
    items: limited,
    total: filtered.length,  // total matches BEFORE applying limit
    count: limited.length,    // items actually in this response
    search,                   // echo the search param back to the client
  };

  return NextResponse.json(responseBody);

  // ── Caching Note ─────────────────────────────────────────────────────────
  // This GET handler reads searchParams, which Next.js treats as a dynamic
  // value → this handler runs fresh on every request (not cached).
  //
  // If you want explicit control, add to NextResponse.json():
  //   { headers: { 'Cache-Control': 'public, max-age=60' } }
  //
  // Or add this export at the top of the file:
  //   export const dynamic = 'force-dynamic';  ← never cache
  //   export const revalidate = 60;             ← cache for 60 seconds
}
