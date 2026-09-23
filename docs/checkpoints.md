# Session Checkpoint — 2026-09-22

## Summary of Work Completed

### 1. Fixed Series Edit Page 404
- **Problem:** `/admin/series/cmucn708c0000a4cqlcuz63y9/edit` returned 404
- **Root cause:** Route used `[id]` (cuid) but no `[id]/edit/page.tsx` existed
- **Fix:** Created `/admin/series/[slug]/edit/page.tsx` using slug-based routing
- **Files:** `src/app/admin/(panel)/series/[slug]/edit/page.tsx`

### 2. Fixed Slug Auto-Generation Bug
- **Problem:** Slug only showed first letter of Latin title
- **Root cause:** `SeriesForm.tsx` had `&& !formData.slug` guard preventing updates
- **Fix:** Removed guard — slug now updates whenever Latin title changes
- **Files:** `src/app/admin/(panel)/series/SeriesForm.tsx:50`

### 3. Created Series Detail Page with Tabbed Interface
- **Route:** `/admin/series/[slug]` (replaces direct edit link from series grid)
- **Tabs (default: Actors):**
  - **Actors** — Cast management (add/remove/reorder via `series_cast`)
  - **Episodes** — Episode table with publish toggle, links to episode editor
  - **Posters** — Gallery with upload, thumbnail selection, bulk delete
  - **Contributors** — Per-episode translator/editor/proofreader credits
- **Files:**
  - `src/app/admin/(panel)/series/[slug]/page.tsx` (Server Component)
  - `src/app/admin/(panel)/series/SeriesDetailClient.tsx`
  - `src/app/admin/(panel)/series/SeriesActorsTab.tsx`
  - `src/app/admin/(panel)/series/SeriesEpisodesTab.tsx`
  - `src/app/admin/(panel)/series/SeriesPostersTab.tsx`
  - `src/app/admin/(panel)/series/SeriesContributorsTab.tsx`

### 4. Poster Gallery Schema & Actions
- **Schema change:** Added `Poster` model (path, isThumb, seriesId FK)
- **Migration:** `20260922145217_add_poster_gallery`
- **Actions:** `src/actions/poster.ts` — upload, setThumbnail, deletePoster, bulkDeletePosters
- **Data:** `src/data/poster.ts` — getSeriesPosters, getSeriesThumbnail
- **Upload:** `src/app/api/upload/route.ts` + `src/lib/upload.ts` (uuid-based filenames)

### 5. Navigation Cleanup
- **Sidebar:** Removed global "Episodes" link (now scoped to series detail tab)
- **Series list:** Cards link to detail page (`/admin/series/${slug}`); "Edit" button in detail header
- **Files:** `src/app/admin/(panel)/series/page.tsx`, `src/app/admin/_components/Sidebar.tsx`

### 6. Verification
- `npm run build` ✓ (8 routes generated)
- `npx tsc --noEmit` ✓ (no type errors)
- `npm run lint` ✓ (only pre-existing Prisma-generated warnings)

---

## TODOs for Next Session

### High Priority
1. **Episode Editor** — `/admin/series/[slug]/episodes/[id]`
   - Line editor: bulk-paste transcript, edit timestamps/hanzi/translation
   - Pinyin auto-generation on save
   - Contributors sub-tab (manage `EPISODE_CONTRIBUTOR` for this episode)

2. **API Routes for Tab Data Mutations**
   - `POST/DELETE /api/admin/series/[slug]/cast` — actor management
   - `POST/PATCH/DELETE /api/admin/series/[slug]/episodes` — episode CRUD
   - `POST/DELETE /api/admin/series/[slug]/contributors` — contributor management
   - `POST/DELETE /api/admin/series/[slug]/posters` — poster upload/delete
   - `POST /api/admin/posters/[id]/thumbnail` — set thumbnail
   - `DELETE /api/admin/series/[slug]/posters/bulk` — bulk delete

3. **Public Episode Reader Integration**
   - Ensure `/[locale]/series/[slug]/episode/[id]` reads same data
   - Verify bilingual hanzi/pinyin/English rendering works with new schema

### Medium Priority
4. **Backfill Posters** — Create `Poster` rows for existing series using legacy `posterPath`
5. **Episode List in Detail** — Add duration formatting, slug display, better empty states
6. **Cast Reordering** — Drag-and-drop for `sortOrder` in Actors tab

### Low Priority / Nice-to-Have
7. **Image Optimization** — Next.js Image component for posters/thumbnails
8. **Search/Filter** — Series list search by title/hanzi/slug
9. **Import Script** — Bulk import from Fanjiao CSV (if API available)
10. **Contributor Aggregation** — Series-level contributor summary in Contributors tab

---

## Key Decisions Made

| Decision | Rationale |
|----------|-----------|
| Slug-based edit/detail routes | Human-readable, SEO-friendly, matches public routes |
| Poster gallery model (not single field) | Supports multiple posters, thumbnail selection, future gallery UI |
| Tabs in detail page (not separate routes) | Keeps context, avoids deep nesting, single data fetch |
| Remove global Episodes from sidebar | Episode management is series-scoped; avoids orphaned episodes |
| Keep legacy `posterPath` on Series | Fallback for existing data; can drop after backfill |

---

## Files Modified/Created This Session

### New Files
```
prisma/migrations/20260922145217_add_poster_gallery/
src/data/poster.ts
src/actions/poster.ts
src/lib/upload.ts
src/app/api/upload/route.ts
src/app/admin/(panel)/series/[slug]/edit/page.tsx
src/app/admin/(panel)/series/[slug]/page.tsx
src/app/admin/(panel)/series/SeriesDetailClient.tsx
src/app/admin/(panel)/series/SeriesActorsTab.tsx
src/app/admin/(panel)/series/SeriesEpisodesTab.tsx
src/app/admin/(panel)/series/SeriesPostersTab.tsx
src/app/admin/(panel)/series/SeriesContributorsTab.tsx
```

### Modified Files
```
prisma/schema.prisma          (+ Poster model, Series.posters relation)
src/app/admin/(panel)/series/SeriesForm.tsx        (slug auto-gen fix)
src/app/admin/(panel)/series/page.tsx              (links → detail page)
src/app/admin/_components/Sidebar.tsx              (removed Episodes link)
src/app/admin/(panel)/series/[slug]/edit/page.tsx  (import path fix)
```

---

## Next Session Start Commands

```bash
cd D:\Projects\baihe-dev
npm run dev          # Start dev server
# Test: /admin/series → click series → detail page with tabs
# Test: /admin/series/new → create → edit → detail
# Test: Poster upload + thumbnail set + bulk delete
```