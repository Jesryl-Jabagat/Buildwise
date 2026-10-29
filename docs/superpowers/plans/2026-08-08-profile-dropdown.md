# Profile Dropdown Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the profile dropdown as a compact, isolated menu whose Profile and Settings rows remain visible and usable.

**Architecture:** The navbar keeps its existing fetch/injection mechanism and avatar click handler. The component HTML contains no inline visual overrides; `components.css` owns the dropdown layout and layering, and its selectors are explicitly scoped so broad navigation rules cannot leak into menu rows.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, browser-based regression check.

---

### Task 1: Add a failing browser regression check

**Files:**
- Create: `tests/profile-dropdown.browser.mjs`
- Test: `tests/profile-dropdown.browser.mjs`

- [ ] **Step 1: Write the failing test**

```js
import { test, expect } from '@playwright/test';

for (const path of ['/index.html', '/pages/settings.html']) {
  test(`profile dropdown shows both actions on ${path}`, async ({ page }) => {
    await page.goto(`http://127.0.0.1:4173${path}`);
    await page.locator('#profile-avatar').click();

    for (const id of ['#btn-profile-view', '#btn-profile-settings']) {
      const item = page.locator(id);
      await expect(item).toBeVisible();
      await expect(item.locator('span')).toBeVisible();
      await expect(item.locator('svg')).toBeVisible();
    }
  });
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx playwright test tests/profile-dropdown.browser.mjs`

Expected: failure before the clean dropdown implementation is in place or a clear message that the browser test runner is not configured.

### Task 2: Rebuild the component markup and isolate its styling

**Files:**
- Modify: `components/navbar.html:19-32`
- Modify: `styles/components.css:147-160`
- Modify: `styles/components.css:305-405`

- [ ] **Step 1: Replace the dropdown rows with concise markup**

```html
<a class="profile-item" href="#" id="btn-profile-view">
  <svg aria-hidden="true" viewBox="0 0 24 24">...</svg>
  <span>Profile</span>
</a>
<a class="profile-item" href="/pages/settings.html" id="btn-profile-settings">
  <svg aria-hidden="true" viewBox="0 0 24 24">...</svg>
  <span>Settings</span>
</a>
```

- [ ] **Step 2: Scope the top-level navigation selector and declare dropdown layers once**

```css
.nav > ul > li > a { /* existing top-navigation typography */ }

.profile-dropdown { z-index: 1100; }
.profile-dropdown .profile-item {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 46px;
  padding: 12px 16px;
  color: var(--color-text);
  text-decoration: none;
}
.profile-dropdown .profile-item svg { flex: 0 0 16px; }
```

- [ ] **Step 3: Run the browser test to verify it passes**

Run: `npx playwright test tests/profile-dropdown.browser.mjs`

Expected: two passing checks; every action row, label, and SVG is visible on both pages.

### Task 3: Verify functional menu behavior

**Files:**
- Modify: `scripts/app.js:99-122` only if the existing handler does not preserve the desired behavior.
- Test: `tests/profile-dropdown.browser.mjs`

- [ ] **Step 1: Extend the test for interaction behavior**

```js
test('avatar toggles the menu and Settings targets the settings page', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173/index.html');
  await page.locator('#profile-avatar').click();
  await expect(page.locator('#profile-dropdown')).toBeVisible();
  await expect(page.locator('#btn-profile-settings')).toHaveAttribute('href', './pages/settings.html');
});
```

- [ ] **Step 2: Run test to verify it fails if behavior is not already preserved**

Run: `npx playwright test tests/profile-dropdown.browser.mjs`

Expected: failure only if the existing handler or rewritten relative link does not meet the assertion.

- [ ] **Step 3: Make the smallest required JavaScript adjustment**

```js
profileAvatar.addEventListener('click', (event) => {
  event.stopPropagation();
  profileDropdown.classList.toggle('active');
});
```

- [ ] **Step 4: Run all dropdown checks**

Run: `npx playwright test tests/profile-dropdown.browser.mjs`

Expected: all checks pass with no console errors.
