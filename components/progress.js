/* ============================================================
   BuildWise Progress Stepper — <bw-progress>
   Usage: <bw-progress current="1"></bw-progress>
   current: active step number — 1, 2, or 3.

   Steps:
     1 — Design Selection / Model Type
     2 — Infrastructure / Internal Config
     3 — Estimation / Final Blueprint
   ============================================================ */

class BuildWiseProgress extends HTMLElement {
  connectedCallback() {
    const current = Number(this.getAttribute("current") || 1);
    const steps = [
      ["Design Selection", "Model Type"],
      ["Infrastructure",   "Internal Config"],
      ["Estimation",       "Final Blueprint"],
    ];

    this.innerHTML = `
      <ol class="stepper">
        ${steps
          .map((step, index) => {
            const number = index + 1;
            const active = number === current ? "active" : "";
            return `
            <li class="${active}">
              <span>${number}</span>
              <strong>${step[0]}</strong>
              <em>${step[1]}</em>
            </li>
          `;
          })
          .join("")}
      </ol>
    `;
  }
}

customElements.define("bw-progress", BuildWiseProgress);
