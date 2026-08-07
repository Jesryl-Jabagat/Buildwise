# BuildWise Cinematic Landing Design

## Goal

Transform the existing BuildWise landing page into a premium, scroll-driven product showcase that makes construction planning feel tangible and intelligent. The experience must carry visitors from an empty plot through planning, construction, a completed home, and BuildWise's estimating interface. The sole conversion action is **Launch BuildWise**, which links to the existing `pages/setup.html` flow.

## Scope and constraints

- Preserve the existing static Bootstrap / HTML / CSS / JavaScript project and existing builder pages.
- Do not introduce React, Vite, or Tailwind.
- Use Three.js for the persistent visual world and GSAP ScrollTrigger for scroll-synchronized motion.
- Use licensed, optimized GLTF and HDR assets where they provide meaningful realism.
- Use real-time rendering only; do not use video.
- Keep the page usable when 3D assets, JavaScript, or reduced-motion preferences prevent the cinematic layer from running.

## Story and interaction model

The landing page is one continuous visual narrative. A Three.js canvas is pinned behind semantic HTML overlay content while a GSAP master timeline maps scroll progress to scene state.

1. **Empty land:** grass, sky, light cloud motion, and a subtle blueprint projection. Headline: "From Blueprint to Reality."
2. **Blueprint:** measured grid and architectural annotations resolve on the ground. Copy: "Every great home starts with a precise plan."
3. **Foundation:** footings and concrete build in with restrained dust and texture. Copy: "A strong foundation begins with accurate estimation."
4. **Structure:** columns, reinforcement, walls, openings, and roof appear in a physically believable order. Copy connects the stages to structural calculation and confident customization.
5. **Finished home:** glazing, landscaping, driveway, and warm lighting turn the construction scene into a desirable home. The camera holds a quiet orbit with no copy for a short breathing interval.
6. **BuildWise dashboard:** a DOM-based dashboard slides beside the completed home. It reveals estimated cost, material mix, schedule, budget visibility, floor plan/3D preview, and AI suggestions.
7. **Feature proof:** the dashboard itself highlights materials, budget optimization, timeline planning, compliance, and visualization. No generic feature-card grid.
8. **Gallery:** premium house types appear in a horizontally scrollable/reduced-motion-safe gallery.
9. **Final CTA:** golden-hour return to the original house with "Your Dream Home Starts Here." and the same `pages/setup.html` CTA.

The team belongs only in the footer as compact, professional profile links/cards.

## Visual direction

The interface uses a dark technical presentation layer around a natural, warm real-time scene:

- Primary construction green, warm gold, concrete gray, white, soft sky blue, grass green, and golden sunlight.
- Large, sparse typography and thin blueprint lines; no Bootstrap-looking components on the landing itself.
- Dashboard visuals are premium SaaS UI: controlled depth, high-contrast data, subtle borders, generous whitespace, and concise labels.
- The Three.js scene provides the emotional spectacle; the DOM overlay provides legibility, performance, accessibility, and conversion clarity.

## Architecture

### Files

- `index.html`: landing semantic structure, scene mount, content overlays, gallery, footer, and links to landing scripts.
- `styles.css`: landing-specific tokens and visual layers, responsive styles, dashboard appearance, gallery, fallback, and reduced-motion rules.
- `scripts/landing-cinematic.js`: scene setup, renderer lifecycle, loaders, construction-stage groups, GSAP timeline, ScrollTrigger, resize/lifecycle code, and fallbacks.
- `scripts/landing-data.js`: immutable scene copy, dashboard values, gallery metadata, and feature-highlight data.
- `assets/models/`: compressed GLTF/GLB model assets.
- `assets/environments/`: HDR lighting environment(s).

### Scene composition

The scene has separately addressable groups: terrain/sky, blueprint, foundation, structure, enclosure, finish/landscape, and hero home. The master timeline animates transform, opacity/material properties, and camera interpolation for those groups. Construction elements must enter in a believable sequence rather than instant pop-ins.

The canvas is presentation-only (`aria-hidden="true"`). All messaging, links, and CTA content exist in HTML. Dashboard metrics use HTML and CSS, allowing accessible text and responsive behavior without canvas hit testing.

## Motion and performance

- Pin the visual stage and scrub a single GSAP ScrollTrigger timeline against scroll progress.
- Use camera position/look-target interpolation, opacity, transforms, restrained particles, and short DOM transitions for spatial continuity.
- Limit expensive passes, cap renderer pixel ratio, enable effects only on sufficiently capable devices, and stop the render loop when the page is not visible.
- Defer gallery models and non-critical assets with `IntersectionObserver`.
- Use GLTF compression and appropriately sized textures; reserve dimensions for all HTML media to avoid layout shifts.
- For `prefers-reduced-motion`, disable scrubbed camera/particle motion and present static, progressively revealed scenes with the same copy and CTA.
- On mobile, reduce model detail/effects and replace the deep pinned sequence with shorter, stable stages while preserving the premium story.

## Failure handling

- If WebGL is unsupported, the main renderer errors, or required hero assets fail, show the existing house imagery/blueprint artwork inside the hero fallback and retain every CTA.
- Loading state uses a lightweight initial progress treatment; it never blocks page navigation.
- A missing optional gallery model degrades to its static image rather than leaving a blank card.

## Acceptance criteria

- The landing clearly communicates the full Empty Land -> Blueprint -> Foundation -> House -> Dream Home -> Dashboard narrative.
- A visitor can reach `pages/setup.html` from the hero and final CTA whether or not 3D loads.
- Construction progress, camera movement, and text changes feel continuous rather than section-based or abrupt.
- The landing has a premium, architectural visual language without generic card grids or visible Bootstrap styling.
- The existing estimator experience remains intact.
- The page works at desktop, tablet, and mobile widths, respects reduced motion, maintains keyboard-focus visibility, and provides meaningful fallback behavior.
