// ==========================================================================
// KINETIC // MODULE 02: IMAGE COMPRESSOR (js/tools/img-compress.js)
// ==========================================================================

export function renderImgCompressTool(container) {
  container.innerHTML = `
    <section class="workbench-header">
      <div class="workbench-title-group">
        <div class="workbench-eyebrow">MEDIA ENGINE // MODULE 02</div>
        <h1 class="workbench-h1">Compress & Resize Images</h1>
        <p class="workbench-desc">HTML5 Canvas lossy/lossless image compression with live byte reduction telemetry.</p>
      </div>
    </section>

    <div class="instrument-card">
      <div class="card-header-bar">
        <h2 class="card-header-title">Compression Quality & Format</h2>
        <div style="display:flex;align-items:center;gap:12px;">
          <label class="field-label">QUALITY: <span id="q-val">78</span>%</label>
          <input type="range" id="img-quality" min="5" max="100" value="78" class="kinetic-slider" style="width:140px;" />
          <select id="img-format" class="btn-kinetic btn-sm">
            <option value="image/webp">WebP</option>
            <option value="image/jpeg">JPEG</option>
            <option value="image/png">PNG</option>
          </select>
        </div>
      </div>
      <div class="card-body">
        <label class="kinetic-dropzone" style="display:block;">
          <input type="file" id="img-input" accept="image/*" style="display:none;" />
          <div style="font-weight:700;">Drop PNG, JPG, or WebP image to compress</div>
        </label>
        <div id="img-result" style="margin-top:20px;"></div>
      </div>
    </div>
  `;

  let activeFile = null;
  const input = container.querySelector('#img-input');
  const qSlider = container.querySelector('#img-quality');
  const qVal = container.querySelector('#q-val');
  const fmtSelect = container.querySelector('#img-format');
  const resultBox = container.querySelector('#img-result');

  async function compress() {
    if (!activeFile) return;
    qVal.textContent = qSlider.value;
    const url = URL.createObjectURL(activeFile);
    const img = new Image();
    img.src = url;
    await new Promise((r) => (img.onload = r));

    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const mime = fmtSelect.value;
    const outUrl = canvas.toDataURL(mime, Number(qSlider.value) / 100);
    const approxBytes = Math.round((outUrl.length * 3) / 4);
    const savedPct = (((activeFile.size - approxBytes) / activeFile.size) * 100).toFixed(1);

    resultBox.innerHTML = `
      <div class="instrument-card" style="padding:16px;display:flex;justify-content:space-between;align-items:center;">
        <div class="tabular-nums">
          <strong>Original:</strong> ${(activeFile.size / 1024).toFixed(1)} KB →
          <strong>Compressed:</strong> ${(approxBytes / 1024).toFixed(1)} KB
          <span class="tech-badge tech-badge-success">${savedPct}% SAVED</span>
        </div>
        <a href="${outUrl}" download="compressed_image.webp" class="btn-kinetic btn-primary btn-sm">Download Optimized</a>
      </div>
    `;
  }

  input.addEventListener('change', (e) => {
    activeFile = e.target.files?.[0];
    compress();
  });
  qSlider.addEventListener('input', compress);
  fmtSelect.addEventListener('change', compress);
}
