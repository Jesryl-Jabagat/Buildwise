/* ============================================================
   utils.js — Shared DOM helpers
   Loaded by: configure.html, result.html
   ============================================================ */

/**
 * Sets the textContent of an element by ID.
 * Silently does nothing if the element is not found.
 * @param {string} id
 * @param {string} text
 */
export function setText(id, text) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = text;
  }
}
