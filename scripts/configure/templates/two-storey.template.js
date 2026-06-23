/* ============================================================
   two-storey.template.js — Two Storey configuration form HTML
   Used by: scripts/configure/configure.js
   ============================================================ */

export function getTwoStoreyTemplate() {
  return `
    <form class="friendly-form house-config-form two-storey-config" data-type="two-storey">
      <div class="form-intro">
        <p class="eyebrow-soft">Home configuration</p>
        <h2>Configure your Two Storey home.</h2>
        <p>Set both floor footprints, rooms, slabs, ceiling, plaster, and paint separately.</p>
      </div>

      <section class="form-section">
        <div class="section-label"><span>1</span><div><h3>Shared costing inputs</h3><p>Applies to every house type.</p></div></div>
        <div class="row g-3">
          <div class="col-md-6"><div class="bw-toggle-field"><span class="form-label">Include Tools &amp; Equipment in Total Cost?</span><label class="bw-toggle"><input type="hidden" name="includeTools" value="No - reference only"><input type="checkbox" class="bw-toggle-input" data-on="Yes" data-off="No - reference only"><span class="bw-toggle-track"></span><span class="bw-toggle-status">No</span></label></div></div>
          <div class="col-md-6"><label class="form-label" for="twoStoreyRoofType">Roof Type</label><select class="form-select" id="twoStoreyRoofType" name="roofType"><option>Corrugated GI Sheet / Yero</option><option selected>Long Span Pre-Painted Roofing</option><option>Color Roof / Pre-painted Corrugated</option><option>Spandrel Ceiling Roof</option><option>Polycarbonate Sheet Roofing</option><option>Concrete Flat Deck Roof</option><option>Metal Stone-Coated / Tile Roof</option></select></div>
          <div class="col-md-6"><label class="form-label" for="twoStoreyMaterialGrade">Material Grade</label><select class="form-select" id="twoStoreyMaterialGrade" name="materialGrade"><option>Basic</option><option selected>Standard</option><option>Premium</option></select></div>
          <div class="col-md-6"><label class="form-label" for="twoStoreySoilCondition">Soil Condition</label><select class="form-select" id="twoStoreySoilCondition" name="soilCondition"><option>Firm / Hard Rock (Limestone, Weathered Rock, Hardclay)</option><option selected>Medium / Standard (Typical Inland Soil / Loose Clay)</option><option>Soft / Muddy / Sandy (Swamp, Rice Field, Coastal Sand)</option></select></div>
        </div>
      </section>

      <section class="form-section">
        <div class="section-label"><span>2</span><div><h3>Ground and second floor dimensions</h3><p>Separate L and W are required for footing, slab, perimeter, and ceiling formulas.</p></div></div>
        <div class="row g-3">
          <div class="col-md-6"><label class="form-label" for="twoStoreyLength">Ground Floor Length - L1</label><div class="input-with-unit"><input class="form-control" id="twoStoreyLength" name="length" type="number" min="1" step="0.1" value="10" required><span>m</span></div></div>
          <div class="col-md-6"><label class="form-label" for="twoStoreyWidth">Ground Floor Width - W1</label><div class="input-with-unit"><input class="form-control" id="twoStoreyWidth" name="width" type="number" min="1" step="0.1" value="8" required><span>m</span></div></div>
          <div class="col-md-6"><label class="form-label" for="twoStoreySecondFloorLength">2nd Floor Length - L2</label><div class="input-with-unit"><input class="form-control" id="twoStoreySecondFloorLength" name="secondFloorLength" type="number" min="1" step="0.1" value="9"><span>m</span></div></div>
          <div class="col-md-6"><label class="form-label" for="twoStoreySecondFloorWidth">2nd Floor Width - W2</label><div class="input-with-unit"><input class="form-control" id="twoStoreySecondFloorWidth" name="secondFloorWidth" type="number" min="1" step="0.1" value="8"><span>m</span></div></div>
          <div class="col-md-6"><label class="form-label" for="twoStoreyGroundWallHeight">Ground Wall Height</label><div class="input-with-unit"><input class="form-control" id="twoStoreyGroundWallHeight" name="groundWallHeight" type="number" min="2" step="0.1" value="2.7"><span>m</span></div></div>
          <div class="col-md-6"><label class="form-label" for="twoStoreySecondFloorWallHeight">2nd Floor Wall Height</label><div class="input-with-unit"><input class="form-control" id="twoStoreySecondFloorWallHeight" name="secondFloorWallHeight" type="number" min="2" step="0.1" value="2.7"><span>m</span></div></div>
          <div class="col-md-6"><label class="form-label" for="twoStoreyHasStairs">Has Stairs?</label><select class="form-select" id="twoStoreyHasStairs" name="hasStairs"><option selected>Yes - locked on</option></select></div>
        </div>
      </section>

      <section class="form-section">
        <div class="section-label"><span>3</span><div><h3>Rooms</h3><p>2-storey bedroom and CR quantities differ per floor.</p></div></div>
        <div class="room-picker">
          <label><span>Number of Bedrooms (1F)</span><select class="form-select" name="bedrooms1F"><option>1</option><option selected>2</option><option>3</option><option>4</option><option>5</option></select></label>
          <label><span>Number of Bedrooms (2F)</span><select class="form-select" name="bedrooms2F"><option>0</option><option selected>1</option><option>2</option><option>3</option><option>4</option><option>5</option></select></label>
          <label><span>Number of CRs (1F)</span><select class="form-select" name="crs1F"><option selected>1</option><option>2</option><option>3</option><option>4</option><option>5</option></select></label>
          <label><span>Number of CRs (2F)</span><select class="form-select" name="crs2F"><option>0</option><option selected>1</option><option>2</option><option>3</option><option>4</option><option>5</option></select></label>
        </div>
      </section>

      <section class="form-section">
        <div class="section-label"><span>4</span><div><h3>Tiles, ceiling, plaster, and paint</h3><p>Plaster and paint are split per floor.</p></div></div>
        <div class="row g-3">
          <div class="col-md-6 conditional-field" data-condition="showTiles"><label class="form-label" for="twoStoreyTileSize">Tile Size</label><select class="form-select" id="twoStoreyTileSize" name="tileSize"><option>7.5x7.5 - 177.8/sqm</option><option>10x10 - 100/sqm</option><option>10.6x10.6 - 88.4/sqm</option><option>10x20 - 50/sqm</option><option>15x15 - 44.44/sqm</option><option>15x20 - 33.33/sqm</option><option>15x30 - 22.22/sqm</option><option>20x20 - 25/sqm</option><option>20x30 - 16.66/sqm</option><option>20x40 - 12.5/sqm</option><option>25x25 - 16/sqm</option><option selected>30x30 - 11/sqm</option><option>30x60 - 5.56/sqm</option><option>40x40 - 6.25/sqm</option><option>50x50 - 4/sqm</option><option>60x60 - 2.78/sqm</option></select></div>
          <div class="col-md-6 conditional-field" data-condition="showTiles"><label class="form-label" for="twoStoreyTileBreakage">Breakage Allowance</label><select class="form-select" id="twoStoreyTileBreakage" name="tileBreakage"><option selected>5%</option><option>7%</option><option>10%</option></select></div>
          <div class="col-md-6"><div class="bw-toggle-field"><span class="form-label">Apply Tiles to Ground Floor?</span><label class="bw-toggle"><input type="hidden" name="applyTilesGround" value="No"><input type="checkbox" class="bw-toggle-input" data-on="Yes" data-off="No"><span class="bw-toggle-track"></span><span class="bw-toggle-status">No</span></label></div></div>
          <div class="col-md-6"><div class="bw-toggle-field"><span class="form-label">Apply Tiles to 2nd Floor?</span><label class="bw-toggle"><input type="hidden" name="applyTilesSecond" value="No"><input type="checkbox" class="bw-toggle-input" data-on="Yes" data-off="No"><span class="bw-toggle-track"></span><span class="bw-toggle-status">No</span></label></div></div>
          <div class="col-md-6"><div class="bw-toggle-field"><span class="form-label">Plaster Ground Floor?</span><label class="bw-toggle"><input type="hidden" name="plasterGroundFloor" value="No"><input type="checkbox" class="bw-toggle-input" data-on="Yes" data-off="No"><span class="bw-toggle-track"></span><span class="bw-toggle-status">No</span></label></div></div>
          <div class="col-md-6"><div class="bw-toggle-field"><span class="form-label">Paint Ground Floor?</span><label class="bw-toggle"><input type="hidden" name="paintGroundFloor" value="No"><input type="checkbox" class="bw-toggle-input" data-on="Yes" data-off="No"><span class="bw-toggle-track"></span><span class="bw-toggle-status">No</span></label></div></div>
          <div class="col-md-6"><div class="bw-toggle-field"><span class="form-label">Plaster 2nd Floor?</span><label class="bw-toggle"><input type="hidden" name="plasterSecondFloor" value="No"><input type="checkbox" class="bw-toggle-input" data-on="Yes" data-off="No"><span class="bw-toggle-track"></span><span class="bw-toggle-status">No</span></label></div></div>
          <div class="col-md-6"><div class="bw-toggle-field"><span class="form-label">Paint 2nd Floor?</span><label class="bw-toggle"><input type="hidden" name="paintSecondFloor" value="No"><input type="checkbox" class="bw-toggle-input" data-on="Yes" data-off="No"><span class="bw-toggle-track"></span><span class="bw-toggle-status">No</span></label></div></div>
          <div class="col-md-6"><div class="bw-toggle-field"><span class="form-label">Ceiling on Ground Floor?</span><label class="bw-toggle"><input type="hidden" name="ceilingGroundFloor" value="No"><input type="checkbox" class="bw-toggle-input" data-on="Yes" data-off="No"><span class="bw-toggle-track"></span><span class="bw-toggle-status">No</span></label></div></div>
          <div class="col-md-6"><div class="bw-toggle-field"><span class="form-label">Ceiling on 2nd Floor?</span><label class="bw-toggle"><input type="hidden" name="ceilingSecondFloor" value="No"><input type="checkbox" class="bw-toggle-input" data-on="Yes" data-off="No"><span class="bw-toggle-track"></span><span class="bw-toggle-status">No</span></label></div></div>
          <div class="col-md-6 conditional-field" data-condition="showTwoStoreyCeiling"><label class="form-label" for="twoStoreyCeilingWastage">Ceiling Wastage Factor</label><select class="form-select" id="twoStoreyCeilingWastage" name="ceilingWastage"><option>5%</option><option>7%</option><option selected>10%</option></select></div>
          <div class="col-md-6 conditional-field" data-condition="showTwoStoreyCeiling"><label class="form-label" for="twoStoreyBoardType">Board Type</label><select class="form-select" id="twoStoreyBoardType" name="boardType"><option>Fiber Cement</option><option selected>Gypsum Board</option><option>PVC Board</option></select></div>
          <div class="col-md-6 conditional-field" data-condition="paintGroundFloor"><label class="form-label" for="twoStoreyPaintColorThemeGround">Paint Color Theme - Ground Floor</label><select class="form-select" id="twoStoreyPaintColorThemeGround" name="paintColorThemeGround"><option selected>Classic White &amp; Off-White</option><option>Cream / Warm Beige</option><option>Cool Neutrals - Light Grey, Blue-Grey</option><option>Modern Minimalist - Pure White + one dark accent</option></select></div>
          <div class="col-md-6 conditional-field" data-condition="paintSecondFloor"><label class="form-label" for="twoStoreyPaintColorThemeSecond">Paint Color Theme - 2nd Floor</label><select class="form-select" id="twoStoreyPaintColorThemeSecond" name="paintColorThemeSecond"><option selected>Classic White &amp; Off-White</option><option>Cream / Warm Beige</option><option>Cool Neutrals - Light Grey, Blue-Grey</option><option>Modern Minimalist - Pure White + one dark accent</option></select></div>
        </div>
      </section>

      <div class="config-footer">
        <div class="config-footer-budget"><label class="form-label" for="twoStoreyBudgetInput">Total Budget</label><div class="input-with-unit budget-input-wrap"><span>PHP</span><input class="form-control" id="twoStoreyBudgetInput" name="budgetInput" type="text" inputmode="numeric" pattern="[0-9,]*" value="" required></div></div>
        <button class="btn btn-dark create-plan-button" type="submit">Create My Home Plan</button>
      </div>
    </form>
  `;
}
