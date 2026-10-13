# Hard-coded admin profile and pricing settings

## Goal

Create a fresh hard-coded administrator profile experience and a settings page that edits the item prices used by result calculations, without a database or dependency on removed code.

## Pages and navigation

- The navbar avatar displays a profile picture (with initials as its accessible fallback) and opens a two-item menu: Profile and Settings.
- `/pages/profile.html` is a new read-only profile page for the mock administrator. It shows the picture, name, role, email, and a short status card.
- `/pages/settings.html` is rebuilt as the single settings destination. It contains only material-price editing and reset controls.

## Price model

- `scripts/estimator/prices.js` remains the source of immutable hard-coded defaults.
- A small shared price-settings module reads the saved price map from `localStorage` and merges it over the defaults.
- Settings Save validates finite non-negative prices and writes the override map to `localStorage`.
- Reset removes the saved override map and repopulates the form from the hard-coded defaults.
- Result calculations obtain their prices through the shared module, so refreshed result pages use saved edits without any database connection.

## Verification

- Regression tests confirm the profile and settings links resolve correctly from root and nested pages.
- Price-settings tests confirm valid saves override defaults, invalid values are rejected, and Reset restores original prices.
- Browser checks confirm the menu, profile page, settings form, and saved values render correctly.
