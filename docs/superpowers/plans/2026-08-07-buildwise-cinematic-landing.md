# BuildWise Cinematic Landing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static BuildWise landing page with a real-time, scroll-driven Three.js construction story that leads visitors to `pages/setup.html`.

**Architecture:** `index.html` supplies semantic copy and conversion controls above a decorative canvas. `landing-data.js` is the source of truth for narrative/dashboard/gallery content; `landing-cinematic.js` owns WebGL, asset fallbacks, and the GSAP scroll timeline. The existing estimator pages and their scripts are unchanged.

**Tech Stack:** Existing Bootstrap base, vanilla HTML/CSS/ES modules, Three.js, GLTFLoader/RGBELoader, GSAP ScrollTrigger, Node test runner, optional licensed GLTF/HDR assets.

---

## File structure

- Modify `index.html` - replace the old hero/team grid with the semantic cinematic narrative.
- Modify `styles.css` - add scoped `.cinematic-*` tokens and responsive/reduced-motion styles without changing builder-page rules.
- Create `scripts/landing-data.js` - immutable narrative, metrics, gallery, and feature data plus validation.
- Create `scripts/landing-cinematic.js` - renderer, procedural scene, optional asset loading, master ScrollTrigger timeline, fallbacks, and teardown.
- Create `tests/landing-data.test.mjs` - validates the content contract used by the landing.
- Modify `.gitignore` - exclude persistent `.superpowers/` visual-companion files.

### Task 1: Landing data contract

**Files:** Create `scripts/landing-data.js`; Create `tests/landing-data.test.mjs`

- [ ] **Step 1: Write the failing data-contract test**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { LANDING_STAGES, DASHBOARD_METRICS, GALLERY_HOMES } from '../scripts/landing-data.js';

test('landing narrative has ordered construction stages', () => {
  assert.deepEqual(LANDING_STAGES.map(({ id }) => id), ['land', 'blueprint', 'foundation', 'structure', 'finish', 'dashboard', 'gallery', 'cta']);
  assert.ok(LANDING_STAGES.every(({ eyebrow, title }) => eyebrow && title));
});
test('dashboard and gallery supply usable display content', () => {
  assert.equal(DASHBOARD_METRICS.length, 4);
  assert.ok(GALLERY_HOMES.length >= 5);
});
```

- [ ] **Step 2: Run the test and confirm failure**

Run: `node --test tests/landing-data.test.mjs`  
Expected: failure because `scripts/landing-data.js` does not exist.

- [ ] **Step 3: Implement the data module**

```js
export const LANDING_STAGES = [
  { id: 'land', eyebrow: 'BuildWise / AI Planning', title: 'From Blueprint to Reality.', body: 'AI-powered construction planning for modern home builders.' },
  { id: 'blueprint', eyebrow: '01 / Plan', title: 'Every great home starts with a precise plan.', body: 'Bring measurements, budget, and possibility into one clear view.' },
  { id: 'foundation', eyebrow: '02 / Groundwork', title: 'A strong foundation begins with accurate estimation.', body: 'See the cost logic before concrete reaches the site.' },
  { id: 'structure', eyebrow: '03 / Structure', title: 'Structural calculations, intelligently connected.', body: 'Shape layouts with confidence as every component stays in sync.' },
  { id: 'finish', eyebrow: '04 / Reality', title: 'Watch a plan become home.', body: '' },
  { id: 'dashboard', eyebrow: 'BuildWise OS', title: 'The intelligence behind every build.', body: 'Costs, materials, timelines, and visual decisions in one place.' },
  { id: 'gallery', eyebrow: 'Find your starting point', title: 'Built for every kind of vision.', body: '' },
  { id: 'cta', eyebrow: 'Build with clarity', title: 'Your Dream Home Starts Here.', body: '' }
];
export const DASHBOARD_METRICS = [
  ['Projected build', 'PHP 2.48M'], ['Budget confidence', '92%'], ['Build timeline', '28 weeks'], ['Material variance', '-8.4%']
];
export const GALLERY_HOMES = ['Modern', 'Loft', 'Traditional', 'Concrete', 'Metal Cladding'];
```

- [ ] **Step 4: Run the test and confirm pass**

Run: `node --test tests/landing-data.test.mjs`  
Expected: two passing tests.

- [ ] **Step 5: Commit**

Run: `git add scripts/landing-data.js tests/landing-data.test.mjs && git commit -m "feat: add landing narrative data"`

### Task 2: Semantic landing shell and fallback

**Files:** Modify `index.html`; Modify `.gitignore`

- [ ] **Step 1: Replace the current landing markup** with one `main.cinematic-page`, a `#cinematicCanvas` mount, a `#sceneFallback` image fallback, eight `article.cinematic-beat` overlays keyed by `data-stage`, a dashboard aside, gallery, minimal footer/team list, and two anchors to `pages/setup.html` labelled `Launch BuildWise`.

- [ ] **Step 2: Load only required browser modules**

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollTrigger.min.js"></script>
<script type="module" src="scripts/landing-cinematic.js"></script>
```

- [ ] **Step 3: Add `.superpowers/` to `.gitignore`** and preserve all existing ignore entries.

- [ ] **Step 4: Verify semantic fallback**

Run: open `index.html` with JavaScript disabled.  
Expected: headline, explanatory copy, gallery labels, footer team, and both CTAs remain visible and usable.

- [ ] **Step 5: Commit**

Run: `git add index.html .gitignore && git commit -m "feat: add cinematic landing shell"`

### Task 3: Premium responsive visual layer

**Files:** Modify `styles.css`

- [ ] **Step 1: Add scoped tokens and layout** under a `/* Cinematic landing */` heading: dark ink `#071712`, green `#69e0b1`, gold `#d99a34`, sky `#afd9ee`, 100dvh canvas stage, readable content overlays, and a 44px minimum CTA target.
- [ ] **Step 2: Style dashboard/gallery/footer** as translucent technical surfaces with thin borders, tabular metric numerals, no Bootstrap button appearance, and no card-grid feature section.
- [ ] **Step 3: Add breakpoints** at 1024px and 768px; collapse dashboard alongside/below the scene, shorten pinned beats, and make the gallery keyboard-scrollable.
- [ ] **Step 4: Add fallback and motion safeguards**

```css
@media (prefers-reduced-motion: reduce) {
  .cinematic-stage { position: relative; min-height: auto; }
  .cinematic-beat { opacity: 1; transform: none; }
  .cinematic-canvas { display: none; }
  .scene-fallback { display: block; }
}
```

- [ ] **Step 5: Verify** at 1440px, 768px, and 375px with no horizontal overflow and visible keyboard focus. Commit with `git commit -m "feat: style premium cinematic landing"`.

### Task 4: Three.js construction world

**Files:** Create `scripts/landing-cinematic.js`

- [ ] **Step 1: Create graceful capability detection**: if `!window.WebGLRenderingContext` or initialization throws, add `is-fallback` to `#cinematicPage`, show `#sceneFallback`, and return without hiding content.
- [ ] **Step 2: Implement scene factory functions**: `createTerrain()`, `createBlueprint()`, `createFoundation()`, `createStructure()`, `createFinishedHome()`, `createLights()`, each returning an `THREE.Group`. Use procedurally generated boxes/planes as the guaranteed fallback while `GLTFLoader` replaces optional hero geometry when a licensed model exists.
- [ ] **Step 3: Configure renderer** with `alpha: true`, `antialias: true`, `renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75))`, sRGB output, shadow maps, and viewport resize handling.
- [ ] **Step 4: Make rendering lifecycle-safe**: pause via `visibilitychange`, resume when visible, dispose geometry/materials/renderer on `pagehide`, and stop after canvas is outside the viewport.
- [ ] **Step 5: Verify**: browser console has no WebGL errors; deliberately rename the optional model URL and confirm the procedural scene/CTA still works. Commit with `git commit -m "feat: add buildwise three scene"`.

### Task 5: Scroll-driven story and dashboard proof

**Files:** Modify `scripts/landing-cinematic.js`; Modify `index.html`; Modify `styles.css`

- [ ] **Step 1: Register ScrollTrigger and create one master timeline** whose labels match all eight `LANDING_STAGES` ids. Pin only the desktop cinematic stage; use `matchMedia('(min-width: 769px)')`.
- [ ] **Step 2: For each label**, move the camera/look target and transition scene groups in order: land, blueprint opacity, foundation scale, column/wall/roof transforms, landscape/finish fade, quiet home orbit, dashboard, gallery, CTA. Animate only transforms and opacity for DOM overlays.
- [ ] **Step 3: Add dashboard proof interactions**: focus/hover each feature control to highlight its metric and a named scene layer; controls must also work via keyboard and use visible `aria-pressed` state.
- [ ] **Step 4: Implement CSS count-up only after dashboard is entered** with `IntersectionObserver`; use `textContent` updates at 30fps maximum and preserve full final values for screen readers.
- [ ] **Step 5: Verify**: scrub in both directions without stuck opacity, no layout jump on pinning, and reduced-motion mode has no ScrollTrigger pin/scrub. Commit with `git commit -m "feat: choreograph cinematic landing"`.

### Task 6: Gallery, asset optimization, and acceptance pass

**Files:** Modify `index.html`; Modify `scripts/landing-cinematic.js`; Modify `styles.css`; Add licensed files only under `assets/models/` and `assets/environments/`

- [ ] **Step 1: Build the five-house gallery** from `GALLERY_HOMES`; each card uses existing house-type imagery as an immediate image fallback and optionally lazy-loads a GLTF preview only when intersecting.
- [ ] **Step 2: Add asset rules**: use compressed GLB, 2K-or-smaller hero textures, one HDR environment, and no duplicated texture copies. Include a text license/source note beside every new third-party asset.
- [ ] **Step 3: Run verification**

```powershell
node --test tests/landing-data.test.mjs
node --check scripts/landing-cinematic.js
git diff --check
```

Expected: tests pass, JavaScript syntax passes, and no whitespace errors.

- [ ] **Step 4: Perform manual browser QA**: desktop Chrome at 1440px (scroll story/60fps feel), tablet 768px, phone 375px, keyboard-only CTA/gallery, disabled WebGL fallback, unavailable optional asset fallback, and reduced-motion preference.
- [ ] **Step 5: Commit**

Run: `git add index.html styles.css scripts/landing-cinematic.js assets/models assets/environments && git commit -m "feat: complete cinematic buildwise landing"`

## Plan self-review

- **Spec coverage:** Tasks 2-5 cover the continuous construction story and dashboard; Task 6 covers the gallery, asset policy, final CTA, and full validation; Task 2 puts the team only in the footer.
- **No-placeholder check:** all asset behavior has an explicit procedural/static fallback and all implementation files, validations, and commits are named.
- **Consistency check:** stage identifiers, module exports, CTA destination, and fallback paths are consistent across the tasks.
