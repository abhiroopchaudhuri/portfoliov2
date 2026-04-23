# Files Identified for Deletion

> **Criteria:** Only files that are 100% confirmed unused are listed below. If there was any doubt, the file was kept.

---

## 1. Build Output (253.55 MB)

| File/Folder | Reason |
|-------------|--------|
| `dist/` | Build output directory. Already listed in `.gitignore`. Contains 2,180 generated files (bundled JS/CSS, font copies, and ~500 frame images). Re-created on every `vite build`. |

---

## 2. Separate Prototype Project (0.18 MB)

| File/Folder | Reason |
|-------------|--------|
| `Sidesheet v3 - Prototype Beta/` | Entirely separate, self-contained prototype with its own `package.json`, `vite.config.ts`, and source tree. Zero references from the main portfolio app. Not part of the root build. |

---

## 3. Unused Media Assets (12.22 MB + small files)

| File | Reason |
|------|--------|
| `public/videos/hero-bg.mp4` (12.22 MB) | Not referenced anywhere in `src/` or `index.html`. The hero section uses `hero.desktop.mp4` / `hero.tablet.mp4` instead. |
| `public/logos/axion-lab-placeholder.svg` | Not referenced anywhere in the codebase. Other 4 logos in the same folder are actively used in `App.tsx`. |
| `public/fonts/.gitkeep` | Directory already contains real font files (`durer-webfont.woff2`, `moniqa.woff2`). The `.gitkeep` serves no purpose. |
| `public/videos/.gitkeep` | Directory contained `hero-bg.mp4` (also being deleted). The `.gitkeep` serves no purpose. |

> **Note:** `hero.atlas.webp` and `hero.atlas.avif` are *not* directly imported in source code, but they **are** dynamically loaded at runtime via `hero-manifest.json` (which `ScrollFramePlayer.tsx` consumes). They are kept.

---

## 4. Unused JSON Data Files

| File | Reason |
|------|--------|
| `src/imports/site_content.json` | Never imported or referenced anywhere in the TypeScript/JSX source. |
| `src/imports/site_content-1.json` | Never imported or referenced anywhere in the TypeScript/JSX source. Only `carousel_projects.json` is actively used. |

---

## 5. Old Development Trackers / Planning Docs / Audits

These files were used during the creation of specific pages or earlier versions but have no runtime purpose and are not referenced by the application code.

| File | Reason |
|------|--------|
| `thrifter_task_tracker.md` | Development task tracker for the Thrifter page. Not referenced by code. |
| `thrifter_enhanced_content.md` | Content draft only referenced by `thrifter_task_tracker.md`. |
| `thrifter_original_content.md` | Content draft only referenced by `thrifter_task_tracker.md`. |
| `monolith-case-study-blueprint.md` | Planning blueprint. Not referenced by code. |
| `PERF_OPTIMIZATION_TRACKER.md` | Performance tracker. Not referenced by code. |
| `RESPONSIVE_AUDIT.md` | Responsive audit notes. Not referenced by code. |

---

## 6. Entire `guidelines/` Folder

All files inside `guidelines/` are planning/verification documents with zero references in the application source.

| File | Reason |
|------|--------|
| `guidelines/Guidelines.md` | General guidelines doc. Not referenced by code. |
| `guidelines/audit-data-analysis.md` | Audit notes. Not referenced by code. |
| `guidelines/benchmark-verification.md` | Benchmark notes. Not referenced by code. |
| `guidelines/mds-branch-verification.md` | Branch verification notes. Not referenced by code. |
| `guidelines/wcag-case-study-plan.md` | Case-study plan. Not referenced by code. |
| `guidelines/wcag-case-study-v2-tracker.md` | Tracker. Not referenced by code. |
| `guidelines/wcag-case-study-v3-tracker.md` | Tracker. Not referenced by code. |

---

## Files Explicitly Kept (Not 100% Sure or Clearly Needed)

| File | Reason |
|------|--------|
| `ATTRIBUTIONS.md` | Could contain legally required attribution text. Kept to be safe. |
| `HERO_SCROLL_LOWEND_FIX.md` | Referenced in a code comment inside `ScrollFramePlayer.tsx`. Kept as linked documentation. |
| `claude-design.md` | Referenced in a code comment inside `MonolithPhase1ProjectPage.tsx`. Kept as linked documentation. |
| `README.md` | Standard project readme. |
| `public/_headers` | Static hosting configuration (Netlify/Cloudflare Pages). Does not need source-code imports to function. |
| `public/hero/hero.atlas.webp` & `.avif` | Dynamically loaded by `hero-manifest.json` at runtime. Required. |
| All `src/app/components/ui/*.tsx` files | Part of the standard shadcn/ui component library setup. Removing unused primitives risks breaking the dev environment or future feature work. |
| `.cursor/` & `.claude/` | IDE/editor configuration folders. |

---

## Estimated Space to be Freed

| Category | Size |
|----------|------|
| `dist/` | ~253.55 MB |
| `public/videos/hero-bg.mp4` | ~12.22 MB |
| `Sidesheet v3 - Prototype Beta/` | ~0.18 MB |
| Everything else | <0.5 MB |
| **Total** | **~266+ MB** |
