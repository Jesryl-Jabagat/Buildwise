/* ============================================================
   half-metal.template.js — Half Metal Cladding configuration form HTML
   Used by: scripts/configure/configure.js
   ============================================================ */

export function getHalfMetalTemplate() {
  return `
    <form class="friendly-form house-config-form half-metal-config" data-type="half-metal">
      <div class="form-intro"><p class="eyebrow-soft">Home configuration</p><h2>Configure your Half Metal Cladding home.</h2><p>Set CHB base, metal cladding, plastering, painting, and ceiling inputs.</p></div>

      <section class="form-section" data-priority="core"><div class="section-priority-header">
          <div class="priority-badge priority-badge--core">
            <span class="priority-icon">🔒</span>
            <div><strong>Core — Always Included</strong><span>Foundation, structure, roofing, doors & windows</span></div>
          </div>
          <div class="priority-cost-preview" id="coreCostPreview1">Est: --</div>
        </div></div><div class="row g-4">
        <div class="col-md-6"><div class="bw-toggle-field"><span class="form-label">Include Tools &amp; Equipment in Total Cost?</span><label class="bw-toggle"><input type="hidden" name="includeTools" value="No - reference only"><input type="checkbox" class="bw-toggle-input" data-on="Yes" data-off="No - reference only"><span class="bw-toggle-track"></span><span class="bw-toggle-status">No</span></label></div></div>
        <div class="col-md-6"><label class="form-label" for="halfMetalRoofType">Roof Type</label><select class="form-select" id="halfMetalRoofType" name="roofType"><option>Corrugated GI Sheet / Yero</option><option selected>Long Span Pre-Painted Roofing</option><option>Color Roof / Pre-painted Corrugated</option><option>Spandrel Ceiling Roof</option><option>Polycarbonate Sheet Roofing</option><option>Concrete Flat Deck Roof</option><option>Metal Stone-Coated / Tile Roof</option></select></div>
        <div class="col-md-6"><label class="form-label" for="halfMetalMaterialGrade">Material Grade</label><select class="form-select" id="halfMetalMaterialGrade" name="materialGrade"><option>Basic</option><option selected>Standard</option><option>Premium</option></select></div>
        <div class="col-md-6"><label class="form-label" for="halfMetalSoilCondition">Soil Condition</label><select class="form-select" id="halfMetalSoilCondition" name="soilCondition"><option>Firm / Hard Rock (Limestone, Weathered Rock, Hardclay)</option><option selected>Medium / Standard (Typical Inland Soil / Loose Clay)</option><option>Soft / Muddy / Sandy (Swamp, Rice Field, Coastal Sand)</option></select></div>
      </div></section>

      <section class="form-section" data-priority="core"><div class="section-priority-header">
          <div class="priority-badge priority-badge--core">
            <span class="priority-icon">📐</span>
            <div><strong>Dimensions & Rooms</strong><span>Impacts all core material calculations</span></div>
          </div>
          <div class="priority-cost-preview" id="coreCostPreview2">Est: --</div>
        </div></div><div class="row g-4">
          <div class="col-md-6"><label class="form-label" for="halfMetalLength">Length (m)</label><input class="form-control" id="halfMetalLength" name="length" type="number" min="1" step="0.5" value="5" required></div>
          <div class="col-md-6"><label class="form-label" for="halfMetalWidth">Width (m)</label><input class="form-control" id="halfMetalWidth" name="width" type="number" min="1" step="0.5" value="6" required></div>
          <div class="col-md-6"><label class="form-label" for="halfMetalBedrooms1F">Bedrooms (1F)</label><select class="form-select room-picker" id="halfMetalBedrooms1F" name="bedrooms1F"><option>0</option><option selected>1</option><option>2</option><option>3</option><option>4</option><option>5</option></select></div>
        <div class="col-md-6"><label class="form-label" for="halfMetalCrs1F">Number of CRs (1F)</label><select class="form-select" id="halfMetalCrs1F" name="crs1F"><option>1</option><option selected>2</option><option>3</option><option>4</option><option>5</option></select></div>
      </div></section>

      
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
        </div></div><div class="row g-4">
          <div class="col-md-6"><label class="form-label" for="halfMetalChbBaseWallHeight">CHB Base Wall Height (m)</label><input class="form-control" id="halfMetalChbBaseWallHeight" name="chbBaseWallHeight" type="number" min="0" step="0.1" value="0.9" required></div>
        <div class="col-md-6"><label class="form-label" for="halfMetalWallingMaterialType">Walling Material Type</label><select class="form-select" id="halfMetalWallingMaterialType" name="wallingMaterialType"><option>Amakan Sheets</option><option selected>Metal Cladding Sheets</option></select></div>
        <div class="col-md-6"><div class="bw-toggle-field"><span class="form-label">Include Plastering (CHB base only)?</span><label class="bw-toggle"><input type="hidden" name="includePlastering" value="No"><input type="checkbox" class="bw-toggle-input" data-on="Yes" data-off="No"><span class="bw-toggle-track"></span><span class="bw-toggle-status">No</span></label></div></div>
        <div class="col-md-6"><div class="bw-toggle-field"><span class="form-label">Include Painting?</span><label class="bw-toggle"><input type="hidden" name="includePainting" value="No"><input type="checkbox" class="bw-toggle-input" data-on="Yes" data-off="No"><span class="bw-toggle-track"></span><span class="bw-toggle-status">No</span></label></div></div>
        <div class="col-md-6"><div class="bw-toggle-field"><span class="form-label">Has Ceiling?</span><label class="bw-toggle"><input type="hidden" name="hasCeiling" value="No"><input type="checkbox" class="bw-toggle-input" data-on="Yes" data-off="No"><span class="bw-toggle-track"></span><span class="bw-toggle-status">No</span></label></div></div>
        <div class="col-md-6 conditional-field" data-condition="hasCeiling"><label class="form-label" for="halfMetalCeilingWastage">Ceiling Wastage Factor</label><select class="form-select" id="halfMetalCeilingWastage" name="ceilingWastage"><option>5%</option><option>7%</option><option selected>10%</option></select></div>
        <div class="col-md-6 conditional-field" data-condition="hasCeiling"><label class="form-label" for="halfMetalBoardType">Board Type</label><select class="form-select" id="halfMetalBoardType" name="boardType"><option>Fiber Cement</option><option selected>Gypsum Board</option><option>PVC Board</option></select></div>
        <div class="col-md-6 conditional-field" data-condition="includePainting"><label class="form-label" for="halfMetalPaintColorTheme">Paint Color Theme</label><select class="form-select" id="halfMetalPaintColorTheme" name="paintColorTheme"><option selected>Classic White &amp; Off-White</option><option>Cream / Warm Beige</option><option>Earth Tones - Terracotta, Clay, Sandy Brown</option><option>Cool Neutrals - Light Grey, Blue-Grey</option><option>Modern Minimalist - Pure White + one dark accent</option></select></div>
      </div></section>

      <section class="form-section" data-priority="core"><div class="section-priority-header">
          <div class="priority-badge priority-badge--finishes">
            <span class="priority-icon">✨</span>
            <div><strong>Tiling & Extras</strong><span>Additional finish options</span></div>
          </div>
          <div class="priority-cost-preview" id="finishesCostPreview2">Est: --</div>
        </div></div><div class="row g-4">
        <div class="col-md-6 conditional-field" data-condition="showTiles"><label class="form-label" for="halfMetalTileSize">Tile Size</label><select class="form-select" id="halfMetalTileSize" name="tileSize"><option>7.5x7.5 - 177.8/sqm</option><option>10x10 - 100/sqm</option><option>10.6x10.6 - 88.4/sqm</option><option>10x20 - 50/sqm</option><option>15x15 - 44.44/sqm</option><option>15x20 - 33.33/sqm</option><option>15x30 - 22.22/sqm</option><option>20x20 - 25/sqm</option><option>20x30 - 16.66/sqm</option><option>20x40 - 12.5/sqm</option><option>25x25 - 16/sqm</option><option selected>30x30 - 11/sqm</option><option>30x60 - 5.56/sqm</option><option>40x40 - 6.25/sqm</option><option>50x50 - 4/sqm</option><option>60x60 - 2.78/sqm</option></select></div>
        <div class="col-md-6 conditional-field" data-condition="showTiles"><label class="form-label" for="halfMetalTileBreakage">Breakage Allowance</label><select class="form-select" id="halfMetalTileBreakage" name="tileBreakage"><option selected>5%</option><option>7%</option><option>10%</option></select></div>
        <div class="col-md-6"><div class="bw-toggle-field"><span class="form-label">Apply Tiles to Ground Floor?</span><label class="bw-toggle"><input type="hidden" name="applyTilesGround" value="No"><input type="checkbox" class="bw-toggle-input" data-on="Yes" data-off="No"><span class="bw-toggle-track"></span><span class="bw-toggle-status">No</span></label></div></div>
      </div></section>

      <div class="config-footer">
        <div class="config-footer-budget"><label class="form-label" for="halfMetalBudgetInput">Total Budget</label><div class="input-with-unit budget-input-wrap"><span>PHP</span><input class="form-control" id="halfMetalBudgetInput" name="budgetInput" type="text" inputmode="numeric" pattern="[0-9,]*" value="" required></div></div>
        <button class="btn btn-dark create-plan-button" type="submit">Create My Home Plan</button>
      </div>
    </form>
  `;
}
