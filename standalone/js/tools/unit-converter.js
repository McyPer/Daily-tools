// ==========================================================================
// KINETIC // MODULE 03: UNIT CONVERTER (js/tools/unit-converter.js)
// ==========================================================================

const UNITS = {
  length: { m: 1, km: 1000, cm: 0.01, mm: 0.001, ft: 0.3048, in: 0.0254, mi: 1609.344 },
  weight: { kg: 1, g: 0.001, lb: 0.45359237, oz: 0.02834952 },
  data: { B: 1, KB: 1024, MB: 1048576, GB: 1073741824, TB: 1099511627776 }
};

export function renderUnitConverterTool(container) {
  container.innerHTML = `
    <section class="workbench-header">
      <div class="workbench-title-group">
        <div class="workbench-eyebrow">METROLOGY ENGINE // MODULE 03</div>
        <h1 class="workbench-h1">Bi-Directional Unit Converter</h1>
      </div>
    </section>

    <div class="instrument-card">
      <div class="card-header-bar">
        <h2 class="card-header-title">Unit Transducer</h2>
        <select id="unit-cat" class="btn-kinetic btn-sm">
          <option value="length">Length</option>
          <option value="weight">Weight & Mass</option>
          <option value="data">Digital Storage</option>
        </select>
      </div>
      <div class="card-body bento-grid-2">
        <div class="field-group">
          <label class="field-label">INPUT A</label>
          <div class="input-well"><input type="number" id="u-val-a" value="100" /></div>
          <div class="input-well"><select id="u-sel-a"></select></div>
        </div>
        <div class="field-group">
          <label class="field-label">INPUT B</label>
          <div class="input-well"><input type="number" id="u-val-b" /></div>
          <div class="input-well"><select id="u-sel-b"></select></div>
        </div>
      </div>
    </div>
  `;

  const catSel = container.querySelector('#unit-cat');
  const valA = container.querySelector('#u-val-a');
  const valB = container.querySelector('#u-val-b');
  const selA = container.querySelector('#u-sel-a');
  const selB = container.querySelector('#u-sel-b');

  function populateUnits() {
    const map = UNITS[catSel.value];
    const keys = Object.keys(map);
    selA.innerHTML = keys.map((k) => `<option value="${k}">${k}</option>`).join('');
    selB.innerHTML = keys.map((k, i) => `<option value="${k}" ${i === 1 ? 'selected' : ''}>${k}</option>`).join('');
    calcForward();
  }

  function calcForward() {
    const map = UNITS[catSel.value];
    const v = parseFloat(valA.value) || 0;
    const res = (v * map[selA.value]) / map[selB.value];
    valB.value = Number(res.toFixed(4));
  }

  catSel.addEventListener('change', populateUnits);
  valA.addEventListener('input', calcForward);
  selA.addEventListener('change', calcForward);
  selB.addEventListener('change', calcForward);
  populateUnits();
}
