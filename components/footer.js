/* ============================================================
   BuildWise Footer — <bw-footer>
   Usage: <bw-footer base-path="../"></bw-footer>
   base-path: relative path from the current page back to root.
              Leave empty (or omit) when used on index.html at root.
   NOTE: base-path support added here — unlike the original
         components.js which hardcoded assets/logo/logo.png
         and would break from inside pages/ subfolder.
   ============================================================ */

class BuildWiseFooter extends HTMLElement {
  connectedCallback() {
    const basePath = this.getAttribute("base-path") || "";

    this.innerHTML = `
      <footer class="bw-footer" id="about">
        <div class="container footer-grid">
          <div>
            <a class="bw-brand" href="${basePath}index.html" aria-label="BuildWise home">
              <img src="${basePath}assets/logo/logo.png" alt="BuildWise Logo" class="bw-logo-img">
              <span>BUILDWISE</span>
            </a>
            <p>Autonomous construction estimation and optimization leveraging generative design logic.</p>
          </div>
          <div>
            <h2>Legal</h2>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
          <div>
            <h2>Support</h2>
            <a href="#">Help Center</a>
            <a href="#">Contact Us</a>
          </div>
        </div>
      </footer>
    `;
  }
}

customElements.define("bw-footer", BuildWiseFooter);
