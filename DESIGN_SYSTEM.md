# BuildWise Design System

This version follows the UI reference in `C:\Users\jayve\Desktop\UI.docx`, then extends it with a warmer BuildWise brand system: construction green, gold accents, blueprint blue, clean white cards, and responsive phone-first spacing.

## Token Layers

Primitive tokens live in `styles.css`: `--color-primary`, `--color-primary-dark`, `--color-primary-soft`, `--color-accent`, `--color-blueprint`, `--color-ink`, `--color-muted`, `--color-line`, `--color-panel`, and `--color-page`.

Semantic tokens define usage: page background, text, muted labels, borders, status color, and information callouts.

Component tokens are applied through reusable classes for navigation, stepper, model cards, forms, result panels, and footer. Primary actions use green, active progress uses green, recommendations use soft green, and generated blueprint previews use blue.

## Components

`<bw-navbar>` renders the shared BuildWise header.

`<bw-footer>` renders the shared footer.

`<bw-progress current="1">` renders the three-step builder tracker: Design Selection, Infrastructure, and Estimation.

Model cards use a preview image, bold title, short description, and small uppercase action label.

The configuration form now uses a friendly guided flow: home basics, rooms, look and feel, nice-to-have features, and a budget planner. Inputs should feel conversational and easy to answer, not like engineering settings.

The result page displays a readable home plan: a hero summary, selected house image, budget and room stats, recommended layout, budget bars, selected feature chips, and next steps.

## Responsive Rules

The landing page uses `100dvh` so the first screen stays focused on the hero and the footer starts below the viewport.

Phone layouts use larger 44-48px touch targets, 16px form text to avoid mobile zoom, single-column cards and forms, stacked footer content, and no horizontal overflow.
