# BuildWise Estimation Engine — Integration Guide

A rule-based, client-side JS calculation engine implementing every formula
from `CAPSTONE.pdf`, `BuildWise_Final_v3.docx`, and
`BuildWise_Roofing_Formula.docx`, priced against
`Construction_Materials_Price_List.docx`.

No backend, no ML, no Python. Pure functions you import directly into
your existing `scripts/` folder.

---

## 1. Directory Structure

Drop the `scripts/` folder contents below into your existing BuildWise
`scripts/` directory (it's organized to sit alongside `configure.js`,
`result.js`, `house-data.js`, `utils.js`):

```
scripts/
├── estimator.js              # <- MAIN ENTRY POINT (dispatcher)
│
├── data/
│   ├── material-constants.js # All CAPSTONE.pdf ratios (footings, columns,
│   │                          #   beams, slabs, masonry, bedrooms, CRs, stairs)
│   ├── price-list.js          # Construction_Materials_Price_List.docx,
│   │                          #   with Basic/Standard/Premium grade resolver
│   └── category-map.js        # Material name -> writeMaterialsTable category
│
├── formulas/
│   ├── structural.js          # Footings, columns, beams
│   ├── slabs.js                # Ground floor / 2nd floor / mezzanine slabs
│   ├── masonry.js              # CHB, mortar, plaster, paint, reinforcement
│   │                          #   + door/window opening deduction
│   ├── tiling.js               # Floor tile count, mortar, adhesive
│   ├── ceiling.js              # Boards, wall angle, channel, furring
│   ├── rooms.js                # Bedroom / CR / stairs material packages
│   ├── amakan-cladding.js      # Amakan / Metal Cladding sheets + tubing
│   ├── roofing.js              # All 7 roof types
│   └── pricing.js              # Apply price-list, group into categories,
│                                #   compute totals + tools & equipment
│
├── estimators/                 # One file per house type (the orchestrators)
│   ├── two-storey.js           # Type 6 — fullest reference implementation
│   ├── loft.js                 # Type 4
│   ├── bungalow.js              # Type 5
│   ├── chb.js                  # Type 3
│   ├── metal-cladding.js        # Type 1
│   ├── semi-concrete.js         # Type 2
│   ├── shared-one-storey-concrete.js  # shared core for chb.js + bungalow.js
│   └── shared-amakan-house.js         # shared core for metal-cladding.js + semi-concrete.js
│
├── utils/
│   └── calc-helpers.js         # roundUp, round2, mergeMaterials, scaleMaterials
│
└── test/                       # Node sanity scripts (not part of the app)
    ├── two-storey.test.mjs
    ├── roofing.test.mjs
    ├── all-types.test.mjs
    └── edge-cases.test.mjs
```

Everything is plain ES modules (`import`/`export`) — works directly in
the browser via `<script type="module">` or bundled with whatever your
frontend already uses.

---

## 2. How to Run the Test Scripts (optional, sanity check)

```bash
node scripts/test/all-types.test.mjs     # runs all 6 estimators, default inputs
node scripts/test/two-storey.test.mjs    # detailed Two-Storey breakdown
node scripts/test/roofing.test.mjs       # all 7 roof types for a 10x8 building
node scripts/test/edge-cases.test.mjs    # 6" CHB warning, Future 2F, mezzanine >50%
```

These require Node 18+ (you have v22) and have zero dependencies.

---

## 3. Integration Point #1 — `configure.js` (`wireFormSubmit`)

Replace (or augment) the current localStorage write with a call to
`runEstimate()`:

```javascript
import { runEstimate } from "./estimator.js";

function wireFormSubmit(form, typeKey) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = parseFormToInputObject(form); // your existing logic,
                                                     // shaped per the
                                                     // getDefaultInputs()
                                                     // for this typeKey

    const result = runEstimate(typeKey, formData);

    localStorage.setItem("buildwiseResult", JSON.stringify(result));
    window.location.href = `result.html?type=${typeKey}`;
  });
}
```

### What `formData` needs to contain

Each estimator's `getDefaultInputs()` (or `getDefaultOneStoreyInputs()` /
`getDefaultAmakanInputs()` for the shared ones) is the authoritative
shape — every key shown there is read by that estimator. Spread your
form data over the defaults so partially-filled forms still compute:

```javascript
import { getDefaultsFor, runEstimate } from "./estimator.js";

const defaults = getDefaultsFor(typeKey);
const result = runEstimate(typeKey, { ...defaults, ...formData });
```

This means your `configs/*.config.js` form schemas need fields matching
those keys. Cross-reference against Final_v3's per-house-type tables —
every `[NEW]`/`[CORRECTED]` field there has a corresponding input key.

### Gap-fill fields your forms currently don't have

Per the earlier gap analysis, these inputs exist in the engine but are
**not** in Final_v3 / your current configs — add them to the relevant
forms (sensible defaults are provided if omitted):

| Field(s) | Where used | Default if omitted |
|---|---|---|
| `doors`, `windows` (or per-floor: `doors1F`/`windows1F`, etc.) | Masonry opening deduction | 0 (no deduction — overstates CHB/paint by ~15-20%) |
| `chbType: "4-inch"|"6-inch"` | Masonry (Types 3/4/5/6) | `"4-inch"` |

---

## 4. Integration Point #2 — `result.js`

The stored result already matches the `window.BuildWiseResult` contract
from `SYSTEM_SUMMARY.md` almost exactly:

```javascript
const result = JSON.parse(localStorage.getItem("buildwiseResult"));

// 1. Materials table — DIRECT MAPPING, no transformation needed
window.BuildWiseResult.writeMaterialsTable(result.pricing.materialsTable);

// 2. Grand total / budget comparison
renderTotals(result.pricing.grandTotal, result.budgetComparison);

// 3. Tools & equipment line (placeholder — see Section 6 below)
renderToolsLine(result.pricing.toolsAndEquipment);

// 4. Warnings (6" CHB approximation, mezzanine >50%, etc.)
renderWarnings(result.warnings);

// 5. Construction phases — NOT YET IMPLEMENTED (see Section 6 below)
// window.BuildWiseResult.writeConstructionPhases(...)

// 6. Generated images — explicitly deferred per your instructions
// window.BuildWiseResult.setGeneratedImages(...)
```

`result.pricing.materialsTable` is already shaped as:
```javascript
[
  { category: "Foundation & Framing", items: [{ name, qty, unit, unitCost, total, ... }] },
  { category: "Walling & Masonry", items: [...] },
  // ...
]
```
— exactly what `writeMaterialsTable()` expects. The extra fields per
item (`source`, `unsourced`, `unitMismatch`, `missing`) are there for
your own debugging/UI tooltips; ignore them if you just want the core
`name/qty/unit/unitCost/total` fields.

---

## 5. House Type Key Mapping — PLEASE CONFIRM

`SYSTEM_SUMMARY.md` lists 5 configs (`loft`, `two-storey`, `half-metal`,
`half-amakan`, `chb`), but `Final_v3.docx` specifies 6 house types. Our
best-guess alignment (used by `scripts/estimator.js`):

| Your config key | Final_v3 Type | Estimator |
|---|---|---|
| `loft` | Type 4 — Loft Style | `estimators/loft.js` |
| `two-storey` | Type 6 — Two-Storey | `estimators/two-storey.js` |
| `half-metal` | Type 1 — Metal Cladding | `estimators/metal-cladding.js` |
| `half-amakan` | Type 2 — Semi-Concrete/Amakan | `estimators/semi-concrete.js` |
| `chb` | Type 5 — Bungalow (1-Storey Concrete, incl. Future-2F toggle) | `estimators/bungalow.js` |
| *(not in your configs)* | Type 3 — Full CHB (4"/6" selector, no Future-2F) | `estimators/chb.js`, available as `runEstimate("chb-strict", ...)` |

If `chb` in your configs is meant to be the **stricter** Type 3 (with
the 4"/6" CHB selector) instead of Type 5 (Bungalow with Future-2F),
just swap the dispatcher entry in `estimator.js`:

```javascript
chb: { run: estimateCHB, defaults: defaultsCHB, label: "Full CHB (Type 3)" },
```

---

## 6. What's Still Missing (carried over from the gap analysis)

These were flagged before coding started and remain open — none of them
block what's built here, but they're needed before the estimate is
"complete":

1. **Construction phases / labor (`writeConstructionPhases`)** — no
   day/worker-count formula exists in any source doc. Your memory
   mentions an earlier DOLE-wage-calibrated labor estimator from prior
   BuildWise work; if you still have that logic, it can be ported into
   a new `formulas/labor.js` that derives phase durations from the
   material quantities this engine already produces (e.g., CHB count →
   masonry days based on a mason's daily output).

2. **Lot/land area & setback validation** — not implemented. Would be a
   new `formulas/lot.js` taking lot L×W and a setback margin, validating
   the building footprint fits.

3. **Floor plan generation** — explicitly out of scope per your
   instruction, not touched.

4. **Image generation (`setGeneratedImages`)** — explicitly deferred per
   your instruction, not touched. Your existing Gemini API system can be
   wired in later; nothing here needs to change for that.

5. **Tools & Equipment cost** — `formulas/pricing.js` includes a
   **3% of materials subtotal placeholder** (`TOOLS_EQUIPMENT_RATE`),
   clearly flagged as `isPlaceholder: true` in the output. No source doc
   provides real data for this — replace with a real
   quote/percentage when available.

6. **Unsourced material prices** — a handful of items (Handrail, Newel
   Post, Phenolic Board, Coco Lumber, Furring Channel) have no dedicated
   price-list entry and use approximated PH market prices in
   `price-list.js`, flagged with `unsourced: true`. These show up in
   `result.pricing.flags`.

7. **Corrugated GI Sheet pricing unit mismatch** — the price list quotes
   this **per kilo** (₱195/kg), but the formula produces a **sheet
   count**. `pricing.js` flags this as `unitMismatch: true` for Roof
   Types 1 and 3 — the displayed line-item cost for this material will
   be wrong until either (a) a per-sheet price is sourced, or (b) a
   sheet-to-kg conversion factor is added.

---

## 7. Assumptions Flagged for Panel Review

Every non-obvious judgment call is commented at its source, but the
full list (so you can address them in your defense / documentation) is:

- **Beam count = column count** (`formulas/structural.js`) — no beam
  count formula exists in CAPSTONE.pdf; beams are assumed to form a
  perimeter tie-beam grid matching the column grid.
- **Door/window opening deduction** (`formulas/masonry.js`) — entirely
  new (not in source docs), using standard PH residential sizes
  (0.9×2.1m door, 1.2×1.2m window) as defaults.
- **Sand pricing** (`price-list.js`) — the generic "Sand" material
  (used in footings/columns/beams/slabs) has no dedicated price-list
  entry; approximated using the Screened Sand price range.
- **Long Span sheet ordering length** (`formulas/roofing.js`, Type 2) —
  doc says "order 6m, cut to rafter length"; this module reports the
  cut length (rafter length) and prices by linear meter accordingly.
- **Concrete Flat Deck reinforcement off-by-one** (`formulas/roofing.js`,
  Type 6) — formula gives 92 bars for a 10×8m building; source doc's
  worked example states 93. Formula-consistent value (92) is used.
- **Type 5/7 default pitch** — Spandrel (Type 4) defaults to 1:6,
  Polycarbonate (Type 5) to 1:4, Metal Tile (Type 7) to 1:2, per each
  type's "typical use" in the Slope Factor table. Types 1/3 default to
  1:2.5 ("GI/Yero common"). Type 2 (Long Span, the BuildWise default)
  uses 1:3. All are overridable via the `pitch` input.
- **Loft mezzanine wall height** (`estimators/loft.js`) — assumed equal
  to Ground Wall Height (2.7m default); Final_v3 doesn't define a
  separate mezzanine wall height field.
- **Loft roofing geometry** (`estimators/loft.js`) — based on the ground
  floor footprint, since the mezzanine sits inside the main roof volume
  rather than having its own roof.
- **Loft mezzanine bedroom/CR package** (`estimators/loft.js`) — uses
  the "twoStoreySecondFloor" (2nd floor) material table, per the
  engineer's note that mezzanine quantities follow "the second floor
  method."
- **House Type 1 vs 2 structural identity** (`estimators/shared-amakan-house.js`)
  — Final_v3 gives both types the same footing/column/beam specs and
  CHB-base formula; the only difference modeled is the default walling
  material (Metal Cladding Sheets vs Amakan Sheets).

---

## 8. Suggested Next Steps

1. Confirm the house-type key mapping in Section 5.
2. Update `configs/*.config.js` form schemas to collect the gap-fill
   fields (doors/windows counts, CHB type where applicable).
3. Wire `runEstimate()` into `configure.js` per Section 3.
4. Wire `result.pricing.materialsTable` into `writeMaterialsTable()` per
   Section 4 — this alone gets you a fully working, formula-traceable
   materials breakdown end-to-end.
5. Tackle labor/phasing (`writeConstructionPhases`) once you decide how
   to handle Section 6, item 1.
6. Image generation last, as planned.
