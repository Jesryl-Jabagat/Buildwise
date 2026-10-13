# Profile dropdown redesign

## Goal

Provide a reliable two-item profile menu with visible labels and icons, while removing the large inline-style blocks that are masking the underlying layering issue.

## Design

- Keep the existing avatar button and dropdown placement.
- Use concise semantic markup: a header followed by the Profile and Settings links.
- Scope menu typography and layout to `.profile-dropdown .profile-item` so generic navbar rules do not affect it.
- Keep the dropdown above page content with one z-index on its container; do not use per-link z-index overrides.
- Keep Settings as a normal link. Profile remains a placeholder action (`href="#"`) until a profile page exists.

## Verification

Automated browser regression checks will open the menu and assert that both links, their text, and their SVGs have visible, non-zero boxes on the home and settings pages.
