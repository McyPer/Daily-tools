// ==========================================================================
// KINETIC // MODULE 04: PERCENTAGE CALCULATOR (js/tools/percentage-calc.js)
// ==========================================================================

export function renderPercentageCalcTool(container) {
  container.innerHTML = `
    <section class="workbench-header">
      <div class="workbench-title-group">
        <div class="workbench-eyebrow">QUANTITATIVE ENGINE // MODULE 04</div>
        <h1 class="workbench-h1">Modular Percentage Calculator</h1>
      </div>
    </section>

    <div class="bento-grid-3">
      <div class="instrument-card">
        <div class="card-header-bar"><h2 class="card-header-title">1. What is X% of Y?</h2></div>
        <div class="card-body" style="display:flex;flex-direction:column;gap:12px;">
          <div class="input-well"><input type="number" id="p1-x" value="18" /><span class="input-affix">%</span></div>
          <div class="input-well"><input type="number" id="p1-y" value="250" /></div>
          <div class="tech-badge tech-badge-accent" id="p1-out" style="font-size:1.1rem;padding:8px;">Result: 45</div>
        </div>
      </div>

      <div class="instrument-card">
        <div class="card-header-bar"><h2 class="card-header-title">2. X is what % of Y?</h2></div>
        <div class="card-body" style="display:flex;flex-direction:column;gap:12px;">
          <div class="input-well"><input type="number" id="p2-x" value="65" /></div>
          <div class="input-well"><input type="number" id="p2-y" value="200" /></div>
          <div class="tech-badge tech-badge-blue" id="p2-out" style="font-size:1.1rem;padding:8px;">Result: 32.5%</div>
        </div>
      </div>

      <div class="instrument-card">
        <div class="card-header-bar"><h2 class="card-header-title">3. % Change X → Y</h2></div>
        <div class="card-body" style="display:flex;flex-direction:column;gap:12px;">
          <div class="input-well"><input type="number" id="p3-x" value="120" /></div>
          <div class="input-well"><input type="number" id="p3-y" value="165" /></div>
          <div class="tech-badge tech-badge-success" id="p3-out" style="font-size:1.1rem;padding:8px;">Result: +37.5%</div>
        </div>
      </div>
    </div>
  `;

  const update = () => {
    const x1 = parseFloat(container.querySelector('#p1-x').value) || 0;
    const y1 = parseFloat(container.querySelector('#p1-y').value) || 0;
    container.querySelector('#p1-out').textContent = `Result: ${((x1 / 100) * y1).toFixed(2)}`;

    const x2 = parseFloat(container.querySelector('#p2-x').value) || 0;
    const y2 = parseFloat(container.querySelector('#p2-y').value) || 1;
    container.querySelector('#p2-out').textContent = `Result: ${((x2 / y2) * 100).toFixed(2)}%`;

    const x3 = parseFloat(container.querySelector('#p3-x').value) || 1;
    const y3 = parseFloat(container.querySelector('#p3-y').value) || 0;
    const chg = ((y3 - x3) / Math.abs(x3)) * 100;
    container.querySelector('#p3-out').textContent = `Result: ${chg >= 0 ? '+' : ''}${chg.toFixed(2)}%`;
  };

  container.querySelectorAll('input').forEach((inp) => inp.addEventListener('input', update));
}
