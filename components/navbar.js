/* ============================================================
   BuildWise Navbar — <bw-navbar>
   Usage: <bw-navbar base-path="../"></bw-navbar>
   base-path: relative path from the current page back to root.
              Leave empty (or omit) when used on index.html at root.
   ============================================================ */

class BuildWiseNavbar extends HTMLElement {
  connectedCallback() {
    const basePath = this.getAttribute("base-path") || "";

    this.innerHTML = `
      <header class="bw-navbar">
        <nav class="container">
          <a class="bw-brand" href="${basePath}index.html" aria-label="BuildWise home">
            <img src="${basePath}assets/logo/logo.png" alt="BuildWise Logo" class="bw-logo-img">
            <span>BUILDWISE</span>
          </a>
          <button class="bw-hamburger" aria-label="Toggle navigation">
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
          </button>
          <div class="bw-nav-links">
            <a href="${basePath}pages/how-it-works.html">How it Works</a>
            <a href="${basePath}pages/about.html">About</a>
          </div>
        </nav>
      </header>
    `;

    const hamburger = this.querySelector(".bw-hamburger");
    const navLinks = this.querySelector(".bw-nav-links");
    if (hamburger && navLinks) {
      hamburger.addEventListener("click", () => {
        navLinks.classList.toggle("bw-open");
        hamburger.classList.toggle("bw-open");
      });
    }
  }
}

customElements.define("bw-navbar", BuildWiseNavbar);
