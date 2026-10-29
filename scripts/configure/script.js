const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/jayve/Desktop/backup - Copy/scripts/configure/templates';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));

const utilsSection = \
      <section class="form-section" data-priority="utilities">
        <div class="section-priority-header">
          <div class="priority-badge priority-badge--utilities">
            <span class="priority-icon">??</span>
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
\;

files.forEach(file => {
  let content = fs.readFileSync(path.join(dir, file), 'utf8');
  
  content = content.replace(/<div class="section-label"><span>1<\\/span>.*?<\\/div>/, \
        <div class="section-priority-header">
          <div class="priority-badge priority-badge--core">
            <span class="priority-icon">??</span>
            <div><strong>Core — Always Included</strong><span>Foundation, structure, roofing, doors & windows</span></div>
          </div>
          <div class="priority-cost-preview" id="coreCostPreview1">Est: --</div>
        </div>\.trim());
        
  content = content.replace(/<div class="section-label"><span>2<\\/span>.*?<\\/div>/, \
        <div class="section-priority-header">
          <div class="priority-badge priority-badge--core">
            <span class="priority-icon">??</span>
            <div><strong>Dimensions & Rooms</strong><span>Impacts all core material calculations</span></div>
          </div>
          <div class="priority-cost-preview" id="coreCostPreview2">Est: --</div>
        </div>\.trim());

  content = content.replace(/<section class="form-section">\\s*<div class="section-label"><span>3<\\/span>/, utilsSection + '\\n      <section class="form-section" data-priority="finishes">\\n        <div class="section-label"><span>3</span>');

  content = content.replace(/<div class="section-label"><span>3<\\/span>.*?<\\/div>/, \
        <div class="section-priority-header">
          <div class="priority-badge priority-badge--finishes">
            <span class="priority-icon">??</span>
            <div><strong>Finishes — Cut first if tight</strong><span>Paint, tiles, ceiling upgrades</span></div>
          </div>
          <div class="priority-cost-preview" id="finishesCostPreview1">Est: --</div>
        </div>\.trim());

  content = content.replace(/<div class="section-label"><span>4<\\/span>.*?<\\/div>/, \
        <div class="section-priority-header">
          <div class="priority-badge priority-badge--finishes">
            <span class="priority-icon">?</span>
            <div><strong>Tiling & Extras</strong><span>Additional finish options</span></div>
          </div>
          <div class="priority-cost-preview" id="finishesCostPreview2">Est: --</div>
        </div>\.trim());

  content = content.replace(/<section class="form-section">/g, '<section class="form-section" data-priority="core">');

  fs.writeFileSync(path.join(dir, file), content);
});
console.log("Templates updated.");
