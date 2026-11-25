// ==========================================================================
// KINETIC // MODULE 01: PDF TO IMAGES (js/tools/pdf-to-img.js)
// ==========================================================================

export function renderPdfToImgTool(container) {
  container.innerHTML = `
    <section class="workbench-header">
      <div class="workbench-title-group">
        <div class="workbench-eyebrow">DOCUMENT ENGINE // MODULE 01</div>
        <h1 class="workbench-h1">Convert PDF to High-DPI Images</h1>
        <p class="workbench-desc">Render PDF pages to PNG, JPEG, or WebP in browser memory via PDF.js and HTML5 Canvas.</p>
      </div>
    </section>

    <div class="instrument-card">
      <div class="card-header-bar">
        <h2 class="card-header-title">Rasterization Controls</h2>
        <div style="display:flex;gap:8px;">
          <select id="pdf-format" class="btn-kinetic btn-sm">
            <option value="image/png">PNG (Lossless)</option>
            <option value="image/jpeg">JPEG (Compact)</option>
            <option value="image/webp">WebP (Modern)</option>
          </select>
          <select id="pdf-dpi" class="btn-kinetic btn-sm">
            <option value="1">72 DPI (Screen)</option>
            <option value="2.08" selected>150 DPI (High Web)</option>
            <option value="4.16">300 DPI (Print)</option>
          </select>
        </div>
      </div>
      <div class="card-body">
        <label class="kinetic-dropzone" style="display:block;">
          <input type="file" id="pdf-file-input" accept="application/pdf" style="display:none;" />
          <div style="font-weight:700;margin-bottom:4px;">Drop PDF file here or click to browse</div>
          <div style="font-size:0.8rem;color:var(--text-secondary);">100% Client-Side PDF.js Canvas Extraction</div>
        </label>
        <div id="pdf-pages-output" class="bento-grid-3" style="margin-top:20px;"></div>
      </div>
    </div>
  `;

  const fileInput = container.querySelector('#pdf-file-input');
  const outputGrid = container.querySelector('#pdf-pages-output');
  const formatSelect = container.querySelector('#pdf-format');
  const dpiSelect = container.querySelector('#pdf-dpi');

  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file || !window.pdfjsLib) return;
    outputGrid.innerHTML = `<div class="tech-badge">RENDERING PDF PAGES...</div>`;
    const buf = await file.arrayBuffer();
    const pdf = await window.pdfjsLib.getDocument({ data: buf }).promise;
    outputGrid.innerHTML = '';

    const scale = parseFloat(dpiSelect.value);
    const mime = formatSelect.value;

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      await page.render({ canvasContext: ctx, viewport }).promise;
      const dataUrl = canvas.toDataURL(mime, 0.92);

      const card = document.createElement('div');
      card.className = 'instrument-card';
      card.innerHTML = `
        <div class="card-header-bar">
          <span class="tech-badge">PAGE ${i}</span>
          <a href="${dataUrl}" download="page_${i}.png" class="btn-kinetic btn-primary btn-sm">Download</a>
        </div>
        <div class="card-body" style="text-align:center;">
          <img src="${dataUrl}" alt="Page ${i}" style="max-width:100%;height:auto;border:1px solid var(--border-hairline);" />
        </div>
      `;
      outputGrid.appendChild(card);
    }
  });
}
