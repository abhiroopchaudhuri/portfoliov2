# MDS feat-ally Branch Verification Report

**Repo:** `/Users/abhiroop.chaudhuri/Desktop/DEVELOPMENT/MDS/design-system`
**Baseline:** `0c68064` — tag `v4.19.1` on `master` (pre-accessibility work)
**Tip:** `upstream/feat-ally` — HEAD at `3b273ba1b` (fix(link): update disabled state #3080)
**Method:** `git diff 0c68064..upstream/feat-ally` + targeted `git grep` + `git show` of key files. No guessing, no training-data recall; every claim below is a literal read from the branch.

---

## 0. Scope of change at a glance

| Metric | Value |
|---|---:|
| Commits on feat-ally since v4.19.1 | **214** |
| Commits that mention `wcag / a11y / accessibility / aria / keyboard` in subject | **99** (46%) |
| Files changed | 1,357 |
| Lines added | 478,654 |
| Lines removed | 330,154 |
| Files added | 54 |
| Files deleted | 512 |
| Files modified | 791 |
| Unique components modified under `core/components/` | **99** |
| jest-axe test files on feat-ally (`toHaveNoViolations` / `jest-axe` / `testAxe` imports) | **119** |
| jest-axe test files on baseline v4.19.1 | **0** |
| New component-level `accessibility.mdx` docs pages | **11** |

**Correction for the portfolio:** current page claims `109 components rebuilt`. The actual diff touches **99 unique components**. Round down to "99 components" or use "~100 components." The 119 figure is correct.

---

## 1. New accessibility utilities created on feat-ally

Verified as "new in feat-ally, not present at v4.19.1" by `git ls-tree` cross-check.

| Path | Purpose |
|---|---|
| `core/accessibility/utils/useAccessibilityProps.ts` | The "interactivity gate" hook — gates `role` + `tabIndex` + keyboard handler on presence of `onClick`. |
| `core/accessibility/utils/isEnterKey.ts` | Keyboard-event helper. |
| `core/accessibility/utils/isSpaceKey.ts` | Keyboard-event helper. |
| `core/accessibility/utils/index.ts` | Barrel export for the above. |
| `core/accessibility/utils/__tests__/*.test.tsx` | Tests for the hooks. |
| `core/utils/OverlayManager.tsx` | Singleton stack of overlay elements; tracks top-of-stack for Escape dismissal. |
| `core/utils/overlayHelper.ts` | Focus-trap + `closeOnEscapeKeypress` + `getFocusableElements` (skips `[inert]`, `aria-hidden`, `aria-disabled`). |
| `core/utils/testAxe.ts` | jest-axe configured wrapper: disables `region` rule, toggles real timers around axe calls. |
| `core/utils/docPage/AccessibilityPropTable.tsx` | Docs utility — renders a11y props per component on the docs site. |
| `core/utils/docPage/accessibilityProps.ts` | Data file for the above. |
| `docs/src/pages/components/*/accessibility.mdx` | **11** component-specific a11y docs pages (badges, breadcrumbs, checkbox, chips, icons, inlineEditableFields, inputs, linkButton, links, radio, select). |

**Also new in the repo (authoring / tooling):**
- `.claude/skills/a11y/SKILL.md` + references (`vercel-a11y-guidelines.md`, `wcag-as-json.json`, `wcag-audit-patterns.md`, `web-interface-a11y-guidelines.md`) — the custom Claude skill used for the audit.
- `.cursor/rules/` — mirror of the above for Cursor IDE.
- `a11y-context/` — WCAG-as-JSON reference data at repo root.

**Package dependencies added** (verified in `package.json` at feat-ally):
- `jest-axe` ^10.0.0
- `@types/jest-axe` ^3.5.9
- `axe-core` 4.10.2
- `@storybook/addon-a11y` 6.4.8
- `eslint-plugin-jsx-a11y` ^6.4.1

---

## 2. Verification of the 8 portfolio patterns

### Pattern 1 — Auto-labelled clear buttons
**Status: VERIFIED · exact match to portfolio snippet.**
- File: `core/components/atoms/input/Input.tsx` lines **221–225**.
- Real code:
  ```tsx
  const resolvedClearButtonAriaLabel = props['aria-label']
    ? `Clear ${props['aria-label']}`
    : placeholder
    ? `Clear ${placeholder}`
    : 'Clear input';
  ```
  Referenced at Input.tsx:347 as `aria-label={resolvedClearButtonAriaLabel}` on the clear-button div.

### Pattern 2 — useAccessibilityProps (interactivity gate)
**Status: VERIFIED · actual code is slightly different from portfolio snippet.**
- File: `core/accessibility/utils/useAccessibilityProps.ts` (not `core/src/accessibility/...` — **portfolio path is wrong**).
- The "gate on `onClick`" behaviour is real:
  ```ts
  if (!onClick) { return { ...ariaProps }; }
  return {
    onClick, role, tabIndex: tabIndex ?? 0, ...ariaProps,
    onKeyDown: (e) => { /* inlined key-allowlist logic; NO `mapSpaceEnterToClick` helper */ },
  };
  ```
- **Action:** replace portfolio snippet's `mapSpaceEnterToClick(role)` with the real logic (inlined key-allowlist per role, maps `Enter/Space` → onClick for `button`, `Enter` → onClick for `link`, nothing for `checkbox/radio` because onChange handles them).

### Pattern 3 — OverlayManager singleton stack
**Status: VERIFIED · singleton confirmed.**
- File: `core/utils/OverlayManager.tsx`.
- Final two lines: `const instance = new OverlayManager(); Object.freeze(instance); export default instance;` — it is a module-singleton frozen instance.
- Methods: `add`, `remove`, `isTopOverlay`.
- Portfolio's `closeOnEscapeKeypress(e, overlay, onClose)` lives in a different file: `core/utils/overlayHelper.ts`. Signature is `closeOnEscapeKeypress(event, isTopOverlay, onClose)` — the second argument is already the boolean, not the overlay. The portfolio snippet is a simplification.
- **Action:** fix portfolio snippet to either show the real `overlayHelper.ts` signature or label it as pseudocode.

### Pattern 4 — Focus trap respecting `[inert]`
**Status: VERIFIED.**
- File: `core/utils/overlayHelper.ts`.
- `getFocusableElements(container)` filters out `[inert]` subtrees via `el.closest('[inert]') !== null`. Also filters `visibility: hidden`, `display: none`, `aria-hidden="true"`, `aria-disabled="true"`, `tabindex="-1"`.
- Has separate `getListboxOptionElements` for combobox-style `[role="option"]` items (which use `tabindex="-1"` for roving focus).

### Pattern 5 — View-aware calendar nav labels
**Status: VERIFIED · exact match.**
- File: `core/components/organisms/calendar/Calendar.tsx` lines **677–679**.
- Real code:
  ```tsx
  if (view === 'date') ariaLabel = type === 'prev' ? 'Previous month' : 'Next month';
  else if (view === 'month') ariaLabel = type === 'prev' ? 'Previous year' : 'Next year';
  else if (view === 'year') ariaLabel = type === 'prev' ? 'Previous year block' : 'Next year block';
  ```

### Pattern 6 — Hydration-safe unique IDs
**Status: VERIFIED.**
- File: `core/components/atoms/input/Input.tsx`.
- Line 10 imports `uidGenerator from '@/utils/uidGenerator'`.
- Line 197 (inside render/effect): `inlineLabelIdRef.current = \`Input-inlineLabel-${uidGenerator()}\``.
- Line 320–321: used in `aria-describedby={ [rest['aria-describedby'], inlineLabel && !ariaLabelledBy ? inlineLabelId : undefined] ... }`.
- **Note:** the real code uses `inlineLabelIdRef` not `idRef` as the portfolio claims. Tiny discrepancy — both are valid names, just rename the variable in the snippet to match reality.

### Pattern 7 — Adaptive touch-target padding
**Status: VERIFIED.**
- File: `core/components/atoms/input/Input.tsx` lines **262–263**.
- Real code:
  ```tsx
  ['p-3-5']: size === 'tiny',
  ['p-3']: size === 'regular' || size === 'large',
  ```
- `p-3-5` = 14px padding (on a 12px glyph → ≥ 24x24 hit area). Confirms the portfolio claim.

### Pattern 8 — role="switch" on native checkbox
**Status: VERIFIED · exact match.**
- File: `core/components/atoms/switchInput/Switch.tsx` lines **115–126**.
- Real code:
  ```tsx
  type="checkbox"
  role="switch"
  aria-checked={checked}
  ...
  onKeyDown={onChangeHandler}
  ```

### ⚠ Portfolio file-path correction across ALL patterns
All 8 patterns list `core/src/components/...` or `core/src/accessibility/...` as paths. The real path prefix is `core/components/...` and `core/accessibility/...` — **no `src/`**. This affects every `paths:` array in `PATTERNS[]` in `WcagProjectPage.tsx`. Fix before publish.

---

## 3. Bonus pattern discovered — Windows High Contrast Mode (WHCM)

**Commit:** `ecf0cff4d · "feat: add windows high contrast mode support in component" · Anuradha Aggarwal · 2026-04-14`.

Adds `@media (forced-colors: active)` blocks to **19 component CSS module files** (+421 lines, -0):

avatarGroup · avatarSelection · button · calendar · card · chip · dropdown · dropzone · horizontalNav · listbox · metricInput · modal · select · selectionCard · sidesheet · slider · switch · tabs · toast

Paths live under `css/src/components/*.module.css` — this is why an earlier grep against `*.scss *.tsx` returned zero hits. **WHCM support is real; it lives in CSS modules, not TSX.**

**One representative comment from the commit:** `/* box-shadow is stripped in forced-colors; add a real border so the card boundary is visible */` — aligns exactly with the user's note about "box-shadow-based focus rings failing in WHCM."

**Status:** should be surfaced as a 9th pattern card on the portfolio. It's a substantive, reviewable, cross-component pattern that directly addresses user-raised WHCM concern.

---

## 4. Release cadence — corrections to portfolio

Portfolio currently lists:

| Portfolio label | Portfolio date | Reality (CHANGELOG.md on feat-ally) |
|---|---|---|
| `v4.20.0` — First wave, 64 fixes | Feb 25 2026 | **v4.20.0 · 2026-02-24** (one day earlier; changelog only lists 1 `feat(a11y)` headline) |
| `v4.22.0` — Second wave, 142 fixes · focus rings, touch targets | Mar 19 2026 | **Actually v4.21.0 · 2026-03-19** — "add accessibility in design system components based on WCAG 2.2 AA guidelines" (the bulk a11y wave) |
| `v4.23.0` — ARIA overhaul · 87 relationship fixes | Mar 30 2026 | **Actually v4.22.0 · 2026-03-30** — WCAG coverage on Table, FileList, Breadcrumbs, Pagination, ProgressRing, Modal, Calendar, Tooltip, Slider, Avatar + primitive color tokens |
| `v4.23.x` — jest-axe baselines | Apr 09 2026 | **v4.23.0 · 2026-04-10** — jest-axe introduced + WCAG 2.2 AA extended across Dropdown, ChipInput, Input, Nav, Editable, Listbox, Radio, Calendar, Select, Combobox, Menu |

**Action:** portfolio release labels are all off-by-one. Relabel as:
1. v4.20.0 · 2026-02-24 · initial a11y groundwork
2. v4.21.0 · 2026-03-19 · bulk WCAG 2.2 AA wave
3. v4.22.0 · 2026-03-30 · second wave (tables, breadcrumbs, pagination, etc.) + color tokens
4. v4.23.0 · 2026-04-10 · jest-axe baseline + final AT/keyboard pass on listbox/combobox/menu family

(Also: WHCM commit landed 2026-04-14 — post v4.23.0 — which means it's either in v4.23.x patch or v4.24 when released.)

The "142 fixes, 87 relationship fixes, 64 fixes" counts in the portfolio are unsourced (nothing in the commits or changelog tallies those specific numbers). Either replace with "XX commits in this release" (derivable from `git log v4.20.0..v4.21.0 --oneline | wc -l` etc.) or drop the counts and keep the qualitative summary.

---

## 5. Section 508 specific language

- **Section 508 literal mentions in the feat-ally tree:** only in `.claude/skills/a11y/references/wcag-audit-patterns.md` and `.cursor/rules/wcag-audit-patterns.md` — i.e. the audit skill references §508 as context, but no component source / test / doc explicitly claims §508 compliance.
- **Implication for the portfolio:** the §508 framing on the page is by-virtue-of-WCAG-2.2-AA (2017 ICT Refresh maps §508 onto WCAG 2.0 AA; WCAG 2.2 is a strict superset). That's a defensible and accurate claim. Any stronger claim — e.g. "VPAT published" or "audited against §508.22 specifically" — needs evidence we don't have in this repo. Keep the framing: **"WCAG 2.2 AA conformance → §508 ICT compliance by construction."**

---

## 6. jest-axe baseline — full verification

- **119** test files on feat-ally import `jest-axe` / call `toHaveNoViolations` / import `testAxe`.
- **0** on baseline v4.19.1. Every one of the 119 is net-new in this branch.
- Test wrapper file: `core/utils/testAxe.ts` — matches the portfolio's snippet character-for-character (disables `region` rule, real-timers toggle with try/finally). **Verified exact.**
- **CI enforcement:** `package.json` has `"test": "jest"` and jest-axe runs inside the normal test suite, so any missing `toHaveNoViolations` assertion on a new component wouldn't be automatically detected without a lint rule / code-review gate. Current branch does not ship an automated "component without axe test fails CI" check — the enforcement is via code review + 100% current-coverage. **Portfolio claim "enforced in CI" is slightly overstated** — downgrade to "enforced via review; baseline exists on 100% of shipping components" OR add a CI script before publish.

---

## 7. Top-modified components (by file-change count in feat-ally)

Useful for the `TOP_COMPONENTS` chart. Most-touched component directories:

| Component | Files changed |
|---|---:|
| select | 8 |
| menu | 8 |
| grid | 8 |
| trigger (shared) | 7 |
| option (shared) | 6 |
| forms (shared) | 6 |
| table | 4 |
| fileUploader | 4 |
| dropzone | 4 |
| combobox | 4 |
| avatarGroup | 4 |
| textField | 3 |
| multiSlider | 3 |
| dropdown | 3 |
| chatBubble | 3 |
| avatarsSelection | 3 |

The portfolio's current `TOP_COMPONENTS` includes DatePicker, Listbox, FullscreenModal, Calendar, Input — all of which are in the long tail (1–2 changes each). After the v2 rework, consider whether to order by "most-changed" or by "most-issues-per-our-audit." The latter is the story-correct ordering; pull it from `audit-data-analysis.md` when rebuilding the chart.

---

## 8. Commit themes (top 10 by keyword frequency in subjects)

From `git log 0c68064..upstream/feat-ally --oneline`:

| Keyword | Subject count |
|---|---:|
| aria / aria-label / aria attributes | ~44 |
| keyboard / keyboard-navigation / keyboard accessibility | ~22 |
| focus / focus-ring / focus state / focus visible | ~20 |
| a11y | ~18 |
| wcag | ~9 |
| role (role="switch", role=... aria) | ~8 |
| Listbox / combobox / menu / select (the "listbox family" refactor) | ~14 |
| forced-colors / high contrast | 1 (but 19 component CSS files touched) |

---

## 9. Summary of corrections the portfolio must absorb

| # | Current portfolio claim | Corrected / verified |
|---|---|---|
| 1 | `core/src/components/...` paths on all 8 pattern cards | `core/components/...` — remove the `src/` |
| 2 | `core/src/accessibility/utils/useAccessibilityProps.ts` | `core/accessibility/utils/useAccessibilityProps.ts` |
| 3 | `109 components rebuilt` | **99 components** (verified diff) |
| 4 | `119 axe test files` | **119** ✓ correct — no change |
| 5 | v4.20 / v4.22 / v4.23 release labels | Shift by one: v4.20 / v4.21 / v4.22 / v4.23 (dates also off-by-one in two cases) |
| 6 | `64 fixes / 142 fixes / 87 relationship fixes` per-release counts | Unsourced — replace with commit counts or drop |
| 7 | Pattern 2 snippet uses `mapSpaceEnterToClick(role)` | That helper doesn't exist — real code inlines key-allowlist |
| 8 | Pattern 6 variable named `idRef` | Real name is `inlineLabelIdRef` |
| 9 | "jest-axe enforced in CI" | Baseline exists on 100% of components; CI doesn't auto-block new components without tests |
| 10 | No WHCM / forced-colors narrative | Should add a 9th pattern: `@media (forced-colors: active)` across 19 components |
| 11 | "automated rule-engines" framing for DEQUE | DEQUE audit mixed automated + manual; reframe axis as "page-rendered vs source-aware" |

---

## 10. Suggested NEW sections for the portfolio (sourced)

1. **WHCM pattern card (Pattern #9)** — cite the 19 components, the 421-line commit, the representative comment about box-shadow stripping.
2. **Custom Claude skill itself** — the `.claude/skills/a11y/SKILL.md` file is real and in the repo. This is the "we shipped our audit tool with the DS" moment. Strong proof for the Method section.
3. **Component-level accessibility docs** — 11 net-new `accessibility.mdx` pages under `docs/src/pages/components/*/`. Worth calling out: the DS ships a dedicated a11y doc page *per component*, not just a top-level accessibility statement.
4. **AccessibilityPropTable** — `core/utils/docPage/AccessibilityPropTable.tsx` — a reusable docs-site utility that auto-renders each component's a11y props. Could be a Method-section artifact.
5. **eslint-plugin-jsx-a11y + storybook a11y-addon** — a11y is enforced at authoring-time (lint) and inspection-time (Storybook a11y tab), not just test-time (jest-axe). Three rings of defense.

---

## 11. What we *cannot* claim from this repo

- Any number about "downstream product compliance %" — those come from the DEQUE product audits (see `audit-data-analysis.md`), not from this repo.
- A CI-enforced "new component without axe test = build fails" guarantee — baseline is 100% right now but nothing in the codebase prevents the next new component from being added without a test.
- Section 508 VPAT publication — no VPAT in this repo.
- Specific WCAG 2.2 AAA conformance — the CHANGELOG consistently says "WCAG 2.2 AA." Do not upgrade.
