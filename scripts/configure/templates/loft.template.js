/* ============================================================
   loft.template.js — Loft Style configuration form HTML
   Used by: scripts/configure/configure.js
   ============================================================ */

export function getLoftTemplate() {
  return `
    <form class="friendly-form house-config-form loft-style-config" data-type="loft">
      <div class="form-intro">
        <p class="eyebrow-soft">Home configuration</p>
        <h2>Configure your Loft Style home.</h2>
        <p>Set the ground floor, mezzanine, finishes, ceiling, and costing options.</p>
      </div>

      <section class="form-section" data-priority="core">
        <div class="section-priority-header">
          <div class="priority-badge priority-badge--core">
            <span class="priority-icon">🔒</span>
            <div><strong>Core — Always Included</strong><span>Foundation, structure, roofing, doors & windows</span></div>
          </div>
          <div class="priority-cost-preview" id="coreCostPreview1">Est: --</div>
        </div></div>
        <div class="row g-4">
          <div class="col-md-6"><div class="bw-toggle-field"><span class="form-label">Include Tools &amp; Equipment in Total Cost?</span><label class="bw-toggle"><input type="hidden" name="includeTools" value="No - reference only"><input type="checkbox" class="bw-toggle-input" data-on="Yes" data-off="No - reference only"><span class="bw-toggle-track"></span><span class="bw-toggle-status">No</span></label></div></div>
          <div class="col-md-6"><label class="form-label" for="loftRoofType">Roof Type</label><select class="form-select" id="loftRoofType" name="roofType"><option>Corrugated GI Sheet / Yero</option><option selected>Long Span Pre-Painted Roofing</option><option>Color Roof / Pre-painted Corrugated</option><option>Spandrel Ceiling Roof</option><option>Polycarbonate Sheet Roofing</option><option>Concrete Flat Deck Roof</option><option>Metal Stone-Coated / Tile Roof</option></select></div>
          <div class="col-md-6"><label class="form-label" for="loftMaterialGrade">Material Grade</label><select class="form-select" id="loftMaterialGrade" name="materialGrade"><option>Basic</option><option selected>Standard</option><option>Premium</option></select></div>
          <div class="col-md-6"><label class="form-label" for="loftSoilCondition">Soil Condition</label><select class="form-select" id="loftSoilCondition" name="soilCondition"><option>Firm / Hard Rock (Limestone, Weathered Rock, Hardclay)</option><option selected>Medium / Standard (Typical Inland Soil / Loose Clay)</option><option>Soft / Muddy / Sandy (Swamp, Rice Field, Coastal Sand)</option></select></div>
        </div>
      </section>

      <section class="form-section" data-priority="core">
        <div class="section-priority-header">
          <div class="priority-badge priority-badge--core">
            <span class="priority-icon">📐</span>
            <div><strong>Dimensions & Rooms</strong><span>Impacts all core material calculations</span></div>
          </div>
          <div class="priority-cost-preview" id="coreCostPreview2">Est: --</div>
        </div></div>
        <div class="row g-4">
          <div class="col-md-6"><label class="form-label" for="loftLength">Ground Floor Length - L</label><div class="input-with-unit"><input class="form-control" id="loftLength" name="length" type="number" min="1" step="0.1" value="5" required><span>m</span></div></div>
          <div class="col-md-6"><label class="form-label" for="loftWidth">Ground Floor Width - W</label><div class="input-with-unit"><input class="form-control" id="loftWidth" name="width" type="number" min="1" step="0.1" value="6" required><span>m</span></div></div>
          <div class="col-md-6"><label class="form-label" for="loftMezzanineLength">Mezzanine Length</label><div class="input-with-unit"><input class="form-control" id="loftMezzanineLength" name="mezzanineLength" type="number" min="0" step="0.1" value="2.5"><span>m</span></div></div>
          <div class="col-md-6"><label class="form-label" for="loftMezzanineWidth">Mezzanine Width</label><div class="input-with-unit"><input class="form-control" id="loftMezzanineWidth" name="mezzanineWidth" type="number" value="6" readonly style="background-color: color-mix(in srgb, var(--surface) 80%, var(--border)); cursor: not-allowed;"><span style="background-color: color-mix(in srgb, var(--surface) 80%, var(--border));">m</span></div><p class="small mt-1 text-muted" style="line-height: 1.2;">Locked to ground floor width.</p></div>
          <div class="col-md-6"><label class="form-label" for="loftGroundWallHeight">Ground Wall Height</label><div class="input-with-unit"><input class="form-control" id="loftGroundWallHeight" name="groundWallHeight" type="number" min="2" step="0.1" value="2.7"><span>m</span></div></div>
          <div class="col-md-6"><label class="form-label" for="loftHasStairs">Has Stairs?</label><select class="form-select" id="loftHasStairs" name="hasStairs"><option selected>Yes - locked on</option></select></div>
        </div>
      </section>

      
      <section class="form-section" data-priority="utilities">
        <div class="section-priority-header">
          <div class="priority-badge priority-badge--utilities">
            <span class="priority-icon">🔌</span>
            <div><strong>Utilities — Recommended</strong><span>Electrical wiring and plumbing.</span></div>
          </div>
          <div class="priority-cost-preview" id="utilsCostPreview">Est: --</div>
        </div>
        <div class="row g-4">
          <div class="col-md-6"><div class="bw-toggle-field"><span class="form-label">Include Electrical Wiring</span><label class="bw-toggle"><input type="hidden" name="includeElectrical" value="Yes"><input type="checkbox" class="bw-toggle-input" data-on="Yes" data-off="No" checked><span class="bw-toggle-track"></span><span class="bw-toggle-status">Yes</span></label></div></div>
          <div class="col-md-6"><div class="bw-toggle-field"><span class="form-label">Include Plumbing</span><label class="bw-toggle"><input type="hidden" name="includePlumbing" value="Yes"><input type="checkbox" class="bw-toggle-input" data-on="Yes" data-off="No" checked><span class="bw-toggle-track"></span><span class="bw-toggle-status">Yes</span></label></div></div>
          <div class="col-md-6 conditional-field" data-condition="includeElectrical"><div class="bw-toggle-field"><span class="form-label">Include AC Wiring Circuit</span><label class="bw-toggle"><input type="hidden" name="includeACwiring" value="No"><input type="checkbox" class="bw-toggle-input" data-on="Yes" data-off="No"><span class="bw-toggle-track"></span><span class="bw-toggle-status">No</span></label></div></div>
        </div>
      </section>

      <section class="form-section" data-priority="finishes">
        <div class="section-priority-header">
          <div class="priority-badge priority-badge--finishes">
            <span class="priority-icon">🎨</span>
            <div><strong>Finishes — Cut first if tight</strong><span>Paint, tiles, ceiling upgrades</span></div>
          </div>
          <div class="priority-cost-preview" id="finishesCostPreview1">Est: --</div>
        </div></div>
        <div class="room-picker">
          <label><span>Number of Bedrooms (1F)</span><select class="form-select" name="bedrooms1F"><option>0</option><option selected>1</option><option>2</option><option>3</option><option>4</option><option>5</option></select></label>
          <label><span>Number of Bedrooms (2F)</span><select class="form-select" name="bedrooms2F"><option selected>0</option><option>1</option><option>2</option><option>3</option></select></label>
          <label><span>Number of CRs (1F)</span><select class="form-select" name="crs1F"><option>0</option><option selected>1</option><option>2</option><option>3</option><option>4</option><option>5</option></select></label>
          <label><span>Number of CRs (2F)</span><select class="form-select" name="crs2F"><option selected>0</option><option>1</option><option>2</option><option>3</option></select></label>
        </div>
      </section>

      <section class="form-section" data-priority="core">
        <div class="section-priority-header">
          <div class="priority-badge priority-badge--finishes">
            <span class="priority-icon">✨</span>
            <div><strong>Tiling & Extras</strong><span>Additional finish options</span></div>
          </div>
          <div class="priority-cost-preview" id="finishesCostPreview2">Est: --</div>
        </div></div>
        <div class="row g-4">
          <div class="col-md-6 conditional-field" data-condition="showTiles"><label class="form-label" for="loftTileSize">Tile Size</label><select class="form-select" id="loftTileSize" name="tileSize"><option>7.5x7.5 - 177.8/sqm</option><option>10x10 - 100/sqm</option><option>10.6x10.6 - 88.4/sqm</option><option>10x20 - 50/sqm</option><option>15x15 - 44.44/sqm</option><option>15x20 - 33.33/sqm</option><option>15x30 - 22.22/sqm</option><option>20x20 - 25/sqm</option><option>20x30 - 16.66/sqm</option><option>20x40 - 12.5/sqm</option><option>25x25 - 16/sqm</option><option selected>30x30 - 11/sqm</option><option>30x60 - 5.56/sqm</option><option>40x40 - 6.25/sqm</option><option>50x50 - 4/sqm</option><option>60x60 - 2.78/sqm</option></select></div>
          <div class="col-md-6 conditional-field" data-condition="showTiles"><label class="form-label" for="loftTileBreakage">Breakage Allowance</label><select class="form-select" id="loftTileBreakage" name="tileBreakage"><option selected>5%</option><option>7%</option><option>10%</option></select></div>
          <div class="col-md-6"><div class="bw-toggle-field"><span class="form-label">Apply Tiles to Ground Floor?</span><label class="bw-toggle"><input type="hidden" name="applyTilesGround" value="No"><input type="checkbox" class="bw-toggle-input" data-on="Yes" data-off="No"><span class="bw-toggle-track"></span><span class="bw-toggle-status">No</span></label></div></div>
          <div class="col-md-6"><div class="bw-toggle-field"><span class="form-label">Apply Tiles to Mezzanine?</span><label class="bw-toggle"><input type="hidden" name="applyTilesSecond" value="No"><input type="checkbox" class="bw-toggle-input" data-on="Yes" data-off="No"><span class="bw-toggle-track"></span><span class="bw-toggle-status">No</span></label></div></div>
          <div class="col-md-6"><div class="bw-toggle-field"><span class="form-label">Ground Floor Ceiling?</span><label class="bw-toggle"><input type="hidden" name="groundFloorCeiling" value="No"><input type="checkbox" class="bw-toggle-input" data-on="Yes" data-off="No"><span class="bw-toggle-track"></span><span class="bw-toggle-status">No</span></label></div></div>
          <div class="col-md-6"><div class="bw-toggle-field"><span class="form-label">Mezzanine Ceiling?</span><label class="bw-toggle"><input type="hidden" name="mezzanineCeiling" value="No"><input type="checkbox" class="bw-toggle-input" data-on="Yes" data-off="No"><span class="bw-toggle-track"></span><span class="bw-toggle-status">No</span></label></div></div>
          <div class="col-md-6 conditional-field" data-condition="showLoftCeiling"><label class="form-label" for="loftCeilingWastage">Ceiling Wastage Factor</label><select class="form-select" id="loftCeilingWastage" name="ceilingWastage"><option>5%</option><option>7%</option><option selected>10%</option></select></div>
          <div class="col-md-6 conditional-field" data-condition="showLoftCeiling"><label class="form-label" for="loftBoardType">Board Type</label><select class="form-select" id="loftBoardType" name="boardType"><option>Fiber Cement</option><option selected>Gypsum Board</option><option>PVC Board</option></select></div>
          <div class="col-md-6"><div class="bw-toggle-field"><span class="form-label">Include Plastering?</span><label class="bw-toggle"><input type="hidden" name="includePlastering" value="No"><input type="checkbox" class="bw-toggle-input" data-on="Yes" data-off="No"><span class="bw-toggle-track"></span><span class="bw-toggle-status">No</span></label></div></div>
          <div class="col-md-6"><div class="bw-toggle-field"><span class="form-label">Include Painting?</span><label class="bw-toggle"><input type="hidden" name="includePainting" value="No"><input type="checkbox" class="bw-toggle-input" data-on="Yes" data-off="No"><span class="bw-toggle-track"></span><span class="bw-toggle-status">No</span></label></div></div>
          <div class="col-md-12 conditional-field" data-condition="includePainting"><label class="form-label" for="loftPaintColorTheme">Paint Color Theme</label><select class="form-select" id="loftPaintColorTheme" name="paintColorTheme"><option selected>Classic White &amp; Off-White</option><option>Cream / Warm Beige</option><option>Earth Tones - Terracotta, Clay, Sandy Brown</option><option>Cool Neutrals - Light Grey, Blue-Grey</option><option>Pastel Collection - Soft Blue, Mint, Peach, Lavender</option><option>Tropical Accent - Yellow, Coral, Teal with white base</option><option>Modern Minimalist - Pure White + one dark accent</option><option>Custom / User-defined</option></select></div>
        </div>
      </section>

      <div class="config-footer">
        <div class="config-footer-budget"><label class="form-label" for="loftBudgetInput">Total Budget</label><div class="input-with-unit budget-input-wrap"><span>PHP</span><input class="form-control" id="loftBudgetInput" name="budgetInput" type="text" inputmode="numeric" pattern="[0-9,]*" value="" required></div></div>
        <button class="btn btn-dark create-plan-button" type="submit">Create My Home Plan</button>
      </div>
    </form>
  `;
}
