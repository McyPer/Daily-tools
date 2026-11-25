// ==========================================================================
// KINETIC // MODULE 05: LOAN CALCULATOR (js/tools/loan-calc.js)
// ==========================================================================

export function renderLoanCalcTool(container) {
  container.innerHTML = `
    <section class="workbench-header">
      <div class="workbench-title-group">
        <div class="workbench-eyebrow">FINANCIAL ENGINE // MODULE 05</div>
        <h1 class="workbench-h1">Loan & Mortgage Amortization</h1>
      </div>
    </section>

    <div class="workbench-split-asymmetric">
      <div class="instrument-card">
        <div class="card-header-bar"><h2 class="card-header-title">Loan Inputs</h2></div>
        <div class="card-body" style="display:flex;flex-direction:column;gap:14px;">
          <div class="field-group">
            <label class="field-label">PRINCIPAL ($)</label>
            <div class="input-well"><input type="number" id="ln-p" value="320000" /></div>
          </div>
          <div class="field-group">
            <label class="field-label">ANNUAL INTEREST RATE (%)</label>
            <div class="input-well"><input type="number" id="ln-r" step="0.1" value="6.25" /></div>
          </div>
          <div class="field-group">
            <label class="field-label">TERM (YEARS)</label>
            <div class="input-well"><input type="number" id="ln-y" value="30" /></div>
          </div>
        </div>
      </div>

      <div class="instrument-card">
        <div class="card-header-bar"><h2 class="card-header-title">Payment Breakdown</h2></div>
        <div class="card-body" id="ln-summary"></div>
      </div>
    </div>
  `;

  function compute() {
    const P = parseFloat(container.querySelector('#ln-p').value) || 0;
    const annual = parseFloat(container.querySelector('#ln-r').value) || 0;
    const years = parseFloat(container.querySelector('#ln-y').value) || 1;
    const n = Math.max(1, Math.round(years * 12));
    const r = annual / 100 / 12;
    const M = r === 0 ? P / n : (P * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);
    const totalPay = M * n;
    const totalInt = totalPay - P;

    container.querySelector('#ln-summary').innerHTML = `
      <div style="font-family:var(--font-mono);font-size:2rem;font-weight:700;" class="tabular-nums">
        $${M.toFixed(2)} <span style="font-size:0.9rem;color:var(--text-muted);">/ month</span>
      </div>
      <div style="margin-top:12px;display:flex;gap:16px;" class="tabular-nums">
        <div><strong>Total Principal:</strong> $${P.toFixed(0)}</div>
        <div><strong>Total Interest:</strong> $${totalInt.toFixed(0)}</div>
        <div><strong>Total Cost:</strong> $${totalPay.toFixed(0)}</div>
      </div>
    `;
  }

  container.querySelectorAll('input').forEach((inp) => inp.addEventListener('input', compute));
  compute();
}
