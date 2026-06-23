/* ============================================================
   chb.template.js — CHB House configuration form HTML
   Used by: scripts/configure/configure.js
   ============================================================ */

export function getChbTemplate() {
  return `
    <form class="friendly-form house-config-form chb-config" data-type="chb">
      <div class="form-intro"><p class="eyebrow-soft">Home configuration</p><h2>Configure your CHB House.</h2><p>Set concrete hollow block walls, rooms, finishes, and costing options.</p></div>

      <section class="form-section">
        <div class="section-label"><span>1</span><div><h3>General Settings</h3><p>Shared costing inputs.</p></div></div>
        <div class="row g-3">
          <div class="col-md-6"><div class="bw-toggle-field"><span class="form-label">Include Tools &amp; Consumables</span><label class="bw-toggle"><input type="hidden" name="includeTools" value="No - reference only"><input type="checkbox" class="bw-toggle-input" data-on="Yes" data-off="No - reference only"><span class="bw-toggle-track"></span><span class="bw-toggle-status">No</span></label></div></div>
          <div class="col-md-6"><label class="form-label" for="chbRoofType">Roof Type</label><select class="form-select" id="chbRoofType" name="roofType"><option>Corrugated GI Sheet / Yero</option><option selected>Long Span Pre-Painted Roofing</option><option>Color Roof / Pre-painted Corrugated</option><option>Spandrel Ceiling Roof</option><option>Polycarbonate Sheet Roofing</option><option>Concrete Flat Deck Roof</option><option>Metal Stone-Coated / Tile Roof</option></select></div>
          <div class="col-md-6"><label class="form-label" for="chbMaterialGrade">Material Grade</label><select class="form-select" id="chbMaterialGrade" name="materialGrade"><option>Basic</option><option selected>Standard</option><option>Premium</option></select></div>
          <div class="col-md-6"><label class="form-label" for="chbSoilCondition">Soil Condition</label><select class="form-select" id="chbSoilCondition" name="soilCondition"><option>Firm / Hard Rock (Limestone, Weathered Rock, Hardclay)</option><option selected>Medium / Standard (Typical Inland Soil / Loose Clay)</option><option>Soft / Muddy / Sandy (Swamp, Rice Field, Coastal Sand)</option></select></div>
        </div>
      </section>

      <section class="form-section">
        <div class="section-label"><span>2</span><div><h3>Dimensions &amp; Layout</h3><p>Set lengths, widths and rooms.</p></div></div>
        <div class="row g-3">
          <div class="col-md-6"><label class="form-label" for="chbLength">Length (m)</label><input class="form-control" id="chbLength" name="length" type="number" min="1" step="0.1" value="8" required></div>
          <div class="col-md-6"><label class="form-label" for="chbWidth">Width (m)</label><input class="form-control" id="chbWidth" name="width" type="number" min="1" step="0.1" value="7" required></div>
          <div class="col-md-6"><label class="form-label" for="chbBedrooms1F">Bedrooms (1st Floor)</label><select class="form-select" id="chbBedrooms1F" name="bedrooms1F"><option>1</option><option selected>2</option><option>3</option><option>4</option><option>5</option></select></div>
          <div class="col-md-6"><label class="form-label" for="chbCrs1F">Comfort Rooms (1st Floor)</label><select class="form-select" id="chbCrs1F" name="crs1F"><option selected>1</option><option>2</option><option>3</option></select></div>
          <div class="col-md-6"><label class="form-label" for="chbWallHeight">Wall Height (m)</label><input class="form-control" id="chbWallHeight" name="wallHeight" type="number" min="2" step="0.1" value="2.7" required></div>
          <div class="col-md-6"><label class="form-label" for="chbType">CHB Type</label><select class="form-select" id="chbType" name="chbType"><option selected>4-inch CHB</option><option>6-inch CHB - use 4-inch approximation</option></select><p class="small mt-2 mb-0">Engineer-provided factors not available for 6-inch CHB - estimate will use 4-inch factors as approximation only.</p></div>
        </div>
      </section>

      <section class="form-section">
        <div class="section-label"><span>3</span><div><h3>Plastering, Painting &amp; Ceiling</h3><p>Adjust finishes and ceiling types.</p></div></div>
        <div class="row g-3">
          <div class="col-md-6"><div class="bw-toggle-field"><span class="form-label">Include Plastering</span><label class="bw-toggle"><input type="hidden" name="includePlastering" value="No"><input type="checkbox" class="bw-toggle-input" data-on="Yes" data-off="No"><span class="bw-toggle-track"></span><span class="bw-toggle-status">No</span></label></div></div>
          <div class="col-md-6"><div class="bw-toggle-field"><span class="form-label">Include Painting</span><label class="bw-toggle"><input type="hidden" name="includePainting" value="No"><input type="checkbox" class="bw-toggle-input" data-on="Yes" data-off="No"><span class="bw-toggle-track"></span><span class="bw-toggle-status">No</span></label></div></div>
          <div class="col-md-6"><div class="bw-toggle-field"><span class="form-label">Has Ceiling</span><label class="bw-toggle"><input type="hidden" name="hasCeiling" value="No"><input type="checkbox" class="bw-toggle-input" data-on="Yes" data-off="No"><span class="bw-toggle-track"></span><span class="bw-toggle-status">No</span></label></div></div>
          <div class="col-md-6 conditional-field" data-condition="hasCeiling"><label class="form-label" for="chbCeilingWastage">Ceiling Wastage</label><select class="form-select" id="chbCeilingWastage" name="ceilingWastage"><option>5%</option><option selected>10%</option><option>15%</option><option>20%</option></select></div>
          <div class="col-md-6 conditional-field" data-condition="hasCeiling"><label class="form-label" for="chbBoardType">Board Type</label><select class="form-select" id="chbBoardType" name="boardType"><option>Fiber Cement</option><option selected>Gypsum Board</option><option>PVC Board</option></select></div>
          <div class="col-md-6 conditional-field" data-condition="includePainting"><label class="form-label" for="chbPaintColorTheme">Paint Color Theme</label><select class="form-select" id="chbPaintColorTheme" name="paintColorTheme"><option selected>Classic White &amp; Off-White</option><option>Cream / Warm Beige</option><option>Earth Tones - Terracotta Clay Sandy Brown</option><option>Cool Neutrals - Light Grey Blue-Grey</option><option>Modern Minimalist - Pure White + one dark accent</option></select></div>
        </div>
      </section>

      <section class="form-section">
        <div class="section-label"><span>4</span><div><h3>Tiling</h3><p>Tile sizes and allowances.</p></div></div>
        <div class="row g-3">
          <div class="col-md-6 conditional-field" data-condition="showTiles"><label class="form-label" for="chbTileSize">Tile Size</label><select class="form-select" id="chbTileSize" name="tileSize"><option>7.5x7.5 - 177.8/sqm</option><option>10x10 - 100/sqm</option><option>10.6x10.6 - 88.4/sqm</option><option>10x20 - 50/sqm</option><option>15x15 - 44.44/sqm</option><option>15x20 - 33.33/sqm</option><option>15x30 - 22.22/sqm</option><option>20x20 - 25/sqm</option><option>20x30 - 16.66/sqm</option><option>20x40 - 12.5/sqm</option><option>25x25 - 16/sqm</option><option selected>30x30 - 11/sqm</option><option>30x60 - 5.56/sqm</option><option>40x40 - 6.25/sqm</option><option>50x50 - 4/sqm</option><option>60x60 - 2.78/sqm</option></select></div>
          <div class="col-md-6 conditional-field" data-condition="showTiles"><label class="form-label" for="chbTileBreakage">Tile Breakage</label><select class="form-select" id="chbTileBreakage" name="tileBreakage"><option>5%</option><option selected>10%</option><option>15%</option><option>20%</option></select></div>
          <div class="col-md-6"><div class="bw-toggle-field"><span class="form-label">Apply Tiles on Ground Floor</span><label class="bw-toggle"><input type="hidden" name="applyTilesGround" value="No"><input type="checkbox" class="bw-toggle-input" data-on="Yes" data-off="No"><span class="bw-toggle-track"></span><span class="bw-toggle-status">No</span></label></div></div>
        </div>
      </section>

      <div class="config-footer">
        <div class="config-footer-budget"><label class="form-label" for="chbBudgetInput">Total Budget</label><div class="input-with-unit budget-input-wrap"><span>PHP</span><input class="form-control" id="chbBudgetInput" name="budgetInput" type="text" inputmode="numeric" pattern="[0-9,]*" value="" required></div></div>
        <button class="btn btn-dark create-plan-button" type="submit">Create My Home Plan</button>
      </div>
    </form>
  `;
}
