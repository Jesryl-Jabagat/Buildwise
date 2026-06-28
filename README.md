# BuildWise — System Architecture & Integration Guide

BuildWise is a frontend-driven construction estimation and architectural platform. It allows users to select a budget, pick an architectural model, configure materials, and get an immediate base construction estimate including material costs, labor scheduling, and budget feasibility.

This document explains how the current system actually works, its folder structure, and the responsibilities of each component.

---

## 1. System Workflow & Data Flow

The platform relies entirely on client-side state management using `localStorage` to pass user configurations between pages without needing a backend database.

1. **User Journey**: `index.html` (Landing) → `pages/budget.html` (Budget Select) → `pages/designs.html` (Model Select) → `pages/configure.html` (Customization Form).
2. **Data Extraction**: On the configuration page, `scripts/configure.js` parses the dynamic form and saves the user's choices as a JSON object into `localStorage.setItem("buildwiseResult", ...)`.
3. **Estimation Trigger**: The user submits the form and is redirected to `pages/result.html`.
4. **Result Rendering**: The result script (`scripts/result.js`) reads the configuration from `localStorage`, runs it through the core estimation engine (`scripts/estimator/aggregator.js`), and populates the UI with material lists, total costs, labor schedules, and budget feasibility alerts.

---

## 2. Directory Structure & Responsibilities

### Pages (`pages/` and Root)
- **`index.html`**: Main entry point and marketing landing page.
- **`pages/budget.html`**: Phase 1 — User sets their target budget.
- **`pages/designs.html`**: Phase 1b — User selects their desired architectural style.
- **`pages/configure.html`**: Phase 2 — Dynamic form where users adjust building dimensions, floor types, ceilings, and finishes.
- **`pages/result.html`**: Phase 3 — The estimate summary screen. Displays the total cost, feasibility, construction timeline, and materials table.

### Shared Components & Styling
- **`components/`**: Custom web components like `<bw-navbar>`, `<bw-footer>`, and `<bw-progress>` to keep the HTML DRY and layouts consistent across the flow.
- **`styles.css`**: The global CSS stylesheet containing design tokens, structural layouts, custom UI inputs, and skeleton shimmers.

### Core Frontend Scripts (`scripts/`)
- **`configure.js`**: Form builder and parser. Reads the configuration schema, builds the UI for `configure.html`, processes conditional fields, and writes the sanitized `buildwiseResult` object to `localStorage`.
- **`result.js`**: The renderer for `result.html`. It pulls the configuration from local storage, calls the estimation engine (`generateEstimate`), and manipulates the DOM to render charts, totals, and tables.
- **`house-data.js`**: Contains the catalog data (titles, descriptions, default properties) for the different house models.
- **`utils.js`**: Common utilities (e.g., DOM manipulation, currency formatting).

### Estimation Engine (`scripts/estimator/`)
This is the "backend" of the application, running entirely in the browser. It translates raw dimensions and form choices into priced material quantities and labor estimations.

- **`aggregator.js`**: The main dispatcher. `result.js` calls `generateEstimate(data)` from here. It routes the data to the correct house configuration, gathers raw quantities, applies prices, computes the labor multiplier (30-50%), adds a contingency buffer (5-10%), and structures the data for the UI.
- **`prices.js`**: Contains the price list and logic for mapping materials to their respective local costs based on material grades (e.g., Basic, Standard, Premium).
- **`configs/`**: (`chb.config.js`, `loft.config.js`, `half-metal.config.js`, etc.) Specifies the exact estimation flow and rules specific to each house model.
- **`formulas/`**: (`finishes.js`, `structural.js`, `walling.js`, `roofing.js`, etc.) Pure engineering and mathematical functions. For example, calculating how many hollow blocks and bags of cement are needed for a given wall area.

---

## 3. Current Limitations & Deferred Features

- **Interactive 3D Render**: Instead of a dynamic AI image generation API, the `result.html` page uses an interactive 3D WebGL viewer for the exterior render and floor plans, allowing users to rotate, pan, and zoom their selected house type.
- **Tools & Equipment**: The current implementation in `aggregator.js` calculates materials, labor, and contingency, but does not explicitly isolate "Tools & Equipment" as a separate calculable line item.
