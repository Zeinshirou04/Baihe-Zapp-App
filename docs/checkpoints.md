# Session Checkpoint — 2026-09-24

## Summary of Work Completed

### 1. Episode Editor & Admin API Routes (This Session)

**Episode CRUD API:**
- `POST /api/admin/series/[slug]/episodes` — create episode
- `GET /api/admin/series/[slug]/episodes` — list episodes for series
- `PATCH /api/admin/episodes/[id]` — update episode (title, number, slug, duration, published)
- `DELETE /api/admin/episodes/[id]` — delete episode

**Cast Management API:**
- `POST /api/admin/series/[slug]/cast` — add cast member
- `GET /api/admin/series/[slug]/cast` — list cast for series
- `DELETE /api/admin/series/[slug]/cast/[personId]` — remove cast member

**Contributor Management API:**
- `POST /api/admin/series/[slug]/contributors` — add contributor to episode (TRANSLATOR/EDITOR/PROOFREADER)
- `GET /api/admin/series/[slug]/contributors` — list all contributors across series episodes
- `DELETE /api/admin/series/[slug]/contributors/[contributorId]` — remove contributor

**Episode Editor UI (`/admin/series/[slug]/episodes/[id]`):**
- Added **Contributors tab** alongside Lines tab
- Add/remove contributors per episode with role selector
- Fixed JSX fragment parsing error
- Fixed TypeScript union type for contributor role state
- Line editor: timestamps, hanzi, translation, pinyin display, save via `replaceEpisodeLines` action

### 2. Lint & Build
- `npm run lint` passes clean (0 warnings/errors)
- `npm run build` compiles successfully

---

## Previous Session Summary (2026-09-23)

### 1. GitHub Repository Setup & CI/CD
- **Initialized git repo** with proper `.gitignore` (excludes `.env*`, `.next/`, `node_modules/`, `src/generated/prisma/`, `uploads/`, IDE configs)
- **Created GitHub repo** `Baihe-Zapp-App` (private), pushed `dev` branch
- **CI Workflow** (`.github/workflows/ci.yml`): runs on push/PR to `dev` and `main`
  - Node 22 via `.nvmrc`
  - `npm ci` → `prisma generate` (with dummy `DATABASE_URL`) → `lint` → `test` → `build`

### 2. Vitest Config & Test Suite
- **Fixed vitest.config.ts** — replaced ESM-only `vite-tsconfig-paths` with manual path aliases (`@/lib`, `@/actions`, `@/data`, etc.)
- **Created comprehensive test suite** (21 tests across 4 files):
  - `src/__tests__/slug.test.ts` (10) — slugify/generateSlug edge cases including unicode
  - `src/__tests__/flash.test.ts` (4) — set/get/delete flash cookies, malformed JSON handling
  - `src/__tests__/auth.test.ts` (6) — bcrypt hash/verify, JWT sign/verify, session extraction, admin guard
  - `src/__tests__/upload.test.ts` (3) — path generation, default dir fallback, delete + missing file tolerance
- **All tests passing** locally and in CI

### 3. Slug Function Unicode Support
- **Fixed `src/lib/slug.ts`** — updated regex to preserve CJK characters using Unicode property escapes (`\p{L}\p{N}` with `u` flag)
- **Critical for Chinese drama site** — slugs now support hanzi in titles
- Tests updated and passing

### 4. CI Build Fix — Series Detail Page
- **Problem:** Build failed on CI with "error parsing connection string" — Prisma tried to connect during static generation
- **Root cause:** `generateStaticParams` in `/[locale]/series/[slug]/page.tsx` queried DB at build time
- **Fix:** Added `export const dynamic = 'force-dynamic'` and removed `generateStaticParams` entirely
- **Result:** Build passes — page renders on-demand at request time with real DB credentials

### 5. Agent Configuration Updates (Prevent Code-in-Chat)
- **AGENTS.md** — Added to "Working style": `MUST apply changes directly to files using Edit/Write tools. Never output code in chat — edit the actual file.`
- **github-workflow skill** — Added to Step 3: `Code changes must be applied directly to files using Edit/Write tools. Never output code in chat responses — edit the actual file.`

---

## TODOs for Next Session

### High Priority
1. **Public Episode Reader Integration Verification**
   - Test `/[locale]/series/[slug]/episode/[id]` end-to-end with real data
   - Verify bilingual hanzi/pinyin/English rendering works with new schema
   - Confirm pinyin toggle, ruby annotations, timestamps display correctly

3. **Poster Backfill** — Create `Poster` rows for existing series using legacy `posterPath`

### Medium Priority
4. **Episode List in Detail** — Add duration formatting, slug display, better empty states
5. **Cast Reordering** — Drag-and-drop for `sortOrder` in Actors tab
6. **Episode Search/Filter** — Series list search by title/hanzi/slug

### Low Priority / Nice-to-Have
7. **Image Optimization** — Next.js Image component for posters/thumbnails
8. **Import Script** — Bulk import from Fanjiao CSV (if API available)
9. **Contributor Aggregation** — Series-level contributor summary in Contributors tab

---

## Key Decisions Made

| Decision | Rationale |
|----------|-----------|
| Slug-based edit/detail routes | Human-readable, SEO-friendly, matches public routes |
| Poster gallery model (not single field) | Supports multiple posters, thumbnail selection, future gallery UI |
| Tabs in detail page (not separate routes) | Keeps context, avoids deep nesting, single data fetch |
| Remove global Episodes from sidebar | Episode management is series-scoped; avoids orphaned episodes |
| Keep legacy `posterPath` on Series | Fallback for existing data; can drop after backfill |
| Manual path aliases in vitest.config.ts | Avoids ESM-only `vite-tsconfig-paths` plugin, works in CI |
| Unicode-aware slugify | Required for Chinese drama titles with hanzi |
| `force-dynamic` on series detail | Avoids build-time DB access; renders on-demand in prod |
| Contributor tab in Episode Editor | Episode-scoped credits; matches `EPISODE_CONTRIBUTOR` schema |

---

## Files Modified/Created This Session

### New API Routes
```
src/app/api/admin/series/[slug]/episodes/route.ts
src/app/api/admin/episodes/[id]/route.ts
src/app/api/admin/series/[slug]/cast/route.ts
src/app/api/admin/series/[slug]/cast/[personId]/route.ts
src/app/api/admin/series/[slug]/contributors/route.ts
src/app/api/admin/series/[slug]/contributors/[contributorId]/route.ts
```

### Modified Files
```
src/app/admin/(panel)/series/[slug]/episodes/[id]/EpisodeEditorClient.tsx
src/app/admin/(panel)/series/[slug]/episodes/[id]/page.tsx
```

### Previous Session Files (Lint Fixes)
```
src/app/admin/(panel)/series/SeriesContributorsTab.tsx
src/app/admin/(panel)/series/SeriesDetailClient.tsx
src/app/admin/(panel)/series/SeriesEpisodesTab.tsx
src/app/admin/(panel)/series/SeriesForm.tsx
src/app/admin/(panel)/series/SeriesPostersTab.tsx
src/app/admin/_components/DataTable.tsx
src/app/admin/_components/LayoutShell.tsx
src/app/admin/_components/Sidebar.tsx
src/app/[locale]/series/page.tsx
src/app/[locale]/series/[slug]/episode/[id]/page.tsx
src/lib/auth.ts
```

---

## Next Session Start Commands

```bash
cd D:\Projects\baihe-dev
npm run dev          # Start dev server
npm test             # Verify 21 tests pass
npm run lint         # Verify lint clean
npm run build        # Verify CI build passes
# Ready to build: Bulk-paste transcript / Episode Reader verification
```