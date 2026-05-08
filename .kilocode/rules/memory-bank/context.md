# Active Context: Next.js Starter Template

## Current State

**Template Status**: ✅ Ready for development

The template is a clean Next.js 16 starter with TypeScript and Tailwind CSS 4. It's ready for AI-assisted expansion to build any type of application.

## Recently Completed

- [x] Base Next.js 16 setup with App Router
- [x] TypeScript configuration with strict mode
- [x] Tailwind CSS 4 integration
- [x] ESLint configuration
- [x] Memory bank documentation
- [x] Recipe system for common features
- [x] Built "Get Your Company on Kilo Code" microsite (single `KiloMicrosite.tsx` component)

## Current Structure

| File/Directory | Purpose | Status |
|----------------|---------|--------|
| `src/app/page.tsx` | Renders KiloMicrosite | ✅ Ready |
| `src/app/layout.tsx` | Root layout | ✅ Ready |
| `src/app/globals.css` | Global styles | ✅ Ready |
| `src/components/KiloMicrosite.tsx` | Full microsite component | ✅ Ready |
| `.kilocode/` | AI context & recipes | ✅ Ready |

## Current Focus

Microsite is live. All sections use placeholder text labeled with `data-placeholder-id` attributes, ready for copy to be dropped in.

### Microsite Sections
1. **Sticky Nav** — anchor links, active section highlight on scroll
2. **Hero** — headline + subhead placeholders
3. **Social Proof Strip** — 6 logo placeholders + 3 stat pills
4. **Stakeholder Selector** — 2×2 grid, animated panel (fade + slide-up, 300ms)
5. **Comparison Table** — Kilo vs Cursor vs Copilot vs Claude Code
6. **ROI Calculator** — 3 inputs, count-up animation on output
7. **Objection Accordion** — 5 rows, smooth expand/collapse (200ms)
8. **Templates** — tabs (desktop) / dropdown (mobile), copy-to-clipboard
9. **Footer CTA** — headline + 2 buttons

## Quick Start Guide

### To add a new page:

Create a file at `src/app/[route]/page.tsx`:
```tsx
export default function NewPage() {
  return <div>New page content</div>;
}
```

### To add components:

Create `src/components/` directory and add components:
```tsx
// src/components/ui/Button.tsx
export function Button({ children }: { children: React.ReactNode }) {
  return <button className="px-4 py-2 bg-blue-600 text-white rounded">{children}</button>;
}
```

### To add a database:

Follow `.kilocode/recipes/add-database.md`

### To add API routes:

Create `src/app/api/[route]/route.ts`:
```tsx
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Hello" });
}
```

## Available Recipes

| Recipe | File | Use Case |
|--------|------|----------|
| Add Database | `.kilocode/recipes/add-database.md` | Data persistence with Drizzle + SQLite |

## Pending Improvements

- [ ] Add more recipes (auth, email, etc.)
- [ ] Add example components
- [ ] Add testing setup recipe

## Session History

| Date | Changes |
|------|---------|
| Initial | Template created with base setup |
| 2026-05-08 | Built full "Get Your Company on Kilo Code" microsite |
