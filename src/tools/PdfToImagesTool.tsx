import React, { useState, useRef, useEffect } from 'react';
import {
  FileText,
  Upload,
  Download,
  Archive,
  Sparkles,
  CheckSquare,
  Square,
  ZoomIn,
  RefreshCw,
  Trash2,
  X,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import {
  ImageOutputFormat,
  PdfDpiOption,
  RenderedPdfPage,
  renderPdfFileToImages,
  createSamplePdfFile,
  createZipFromPages,
  formatBytes
} from '../utils/pdfEngine';

interface PdfToImagesToolProps {
  onRecordHistory?: (action: string, detail: string) => void;
}

export const PdfToImagesTool: React.FC<PdfToImagesToolProps> = ({ onRecordHistory }) => {
  const [activeFile, setActiveFile] = useState<File | null>(null);
  const [pages, setPages] = useState<RenderedPdfPage[]>([]);
  const [format, setFormat] = useState<ImageOutputFormat>('png');
  const [dpi, setDpi] = useState<PdfDpiOption>(150);
  const [quality, setQuality] = useState<number>(92);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ current: number; total: number }>({
    current: 0,
    total: 0
  });
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [zoomPage, setZoomPage] = useState<RenderedPdfPage | null>(null);
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const processPdf = async (
    fileToRender: File,
    targetDpi: PdfDpiOption,
    targetFormat: ImageOutputFormat,
    targetQuality: number
  ) => {
    setIsProcessing(true);
    setErrorMsg(null);
    setProgress({ current: 0, total: 1 });
    try {
      const rendered = await renderPdfFileToImages(
        fileToRender,
        targetDpi,
        targetFormat,
        targetQuality / 100,
        (current, total) => setProgress({ current, total })
      );
      setPages(rendered);
      if (onRecordHistory) {
        onRecordHistory(
          'PDF → Images',
          `${fileToRender.name} (${rendered.length} pages @ ${targetDpi} DPI ${targetFormat.toUpperCase()})`
        );
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unable to parse PDF file. Please try another PDF document.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Re-render when DPI, format, or quality changes while a file is loaded
  useEffect(() => {
    if (!activeFile) return;
    const timer = setTimeout(() => {
      processPdf(activeFile, dpi, format, quality);
    }, 150);
    return () => clearTimeout(timer);
  }, [dpi, format, quality]);

  const handleFileSelect = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setErrorMsg('Please select a valid .PDF document.');
      return;
    }
    setActiveFile(file);
    processPdf(file, dpi, format, quality);
  };

  const handleLoadSample = () => {
    const sample = createSamplePdfFile();
    setActiveFile(sample);
    processPdf(sample, dpi, format, quality);
  };

  const toggleSelectPage = (pageNumber: number) => {
    setPages((prev) =>
      prev.map((p) => (p.pageNumber === pageNumber ? { ...p, selected: !p.selected } : p))
    );
  };

  const toggleSelectAll = () => {
    const allSelected = pages.every((p) => p.selected);
    setPages((prev) => prev.map((p) => ({ ...p, selected: !allSelected })));
  };

  const downloadSinglePage = (page: RenderedPdfPage) => {
    const ext = page.format === 'jpeg' ? 'jpg' : page.format;
    const baseName = (activeFile?.name || 'document').replace(/\.pdf$/i, '');
    const pageStr = String(page.pageNumber).padStart(2, '0');
    const a = document.createElement('a');
    a.href = page.dataUrl;
    a.download = `${baseName}_page_${pageStr}_${page.dpi}dpi.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadSelectedAsZip = async () => {
    const selectedPages = pages.filter((p) => p.selected);
    if (selectedPages.length === 0) return;
    setIsZipping(true);
    try {
      const zipBlob = await createZipFromPages(selectedPages, activeFile?.name || 'document.pdf');
      const url = URL.createObjectURL(zipBlob);
      const baseName = (activeFile?.name || 'document').replace(/\.pdf$/i, '');
      const a = document.createElement('a');
      a.href = url;
      a.download = `${baseName}_${dpi}dpi_${format.toUpperCase()}_pages.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } finally {
      setIsZipping(false);
    }
  };

  const selectedCount = pages.filter((p) => p.selected).length;
  const totalRenderedBytes = pages.reduce((acc, p) => acc + p.sizeBytes, 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Workbench Header */}
      <div className="workbench-header">
        <div className="workbench-title-group">
          <div className="workbench-eyebrow">
            <FileText size={14} />
            <span>DOCUMENT ENGINE // MODULE 01</span>
            <span className="tech-badge tech-badge-accent">100% LOCAL CANVAS</span>
          </div>
          <h1 className="workbench-h1">Convert PDF to High-DPI Images</h1>
          <p className="workbench-desc">
            Extract every page of any PDF document into crisp PNG, JPEG, or WebP raster graphics
            at up to 300 DPI print resolution directly in your browser. Zero server uploads.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleLoadSample}
            className="btn-kinetic btn-secondary-subtle"
          >
            <Sparkles size={15} style={{ color: 'var(--accent-primary)' }} />
            <span>Load Sample 4-Page PDF</span>
          </button>
          {activeFile && (
            <button
              type="button"
              onClick={() => {
                setActiveFile(null);
                setPages([]);
                setErrorMsg(null);
              }}
              className="btn-kinetic"
            >
              <Trash2 size={15} />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Parameter Control Bar */}
      <div className="instrument-card">
        <div className="card-header-bar">
          <div className="card-header-title">
            <Sliders size={16} style={{ color: 'var(--accent-primary)' }} />
            <span>Rasterization & Output Parameters</span>
          </div>
          <span className="tech-badge">
            SCALE FACTOR: {(dpi / 72).toFixed(2)}x ({dpi} DPI)
          </span>
        </div>

        <div className="card-body grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Format Selector */}
          <div className="field-group">
            <div className="field-label-row">
              <span className="field-label">Output Image Format</span>
              <span className="tech-badge">.{format === 'jpeg' ? 'JPG' : format.toUpperCase()}</span>
            </div>
            <div className="segmented-control w-full">
              {(['png', 'jpeg', 'webp'] as ImageOutputFormat[]).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setFormat(fmt)}
                  className={`segment-btn flex-1 ${format === fmt ? 'active' : ''}`}
                >
                  {fmt === 'jpeg' ? 'JPG' : fmt.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* DPI Selector */}
          <div className="field-group">
            <div className="field-label-row">
              <span className="field-label">Optical Resolution (DPI)</span>
              <span className="tech-badge">
                {dpi === 72 ? 'SCREEN' : dpi === 150 ? 'HIGH WEB' : 'PRINT GRADE'}
              </span>
            </div>
            <div className="segmented-control w-full">
              {([72, 150, 300] as PdfDpiOption[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDpi(d)}
                  className={`segment-btn flex-1 ${dpi === d ? 'active' : ''}`}
                >
                  {d} DPI
                </button>
              ))}
            </div>
          </div>

          {/* Quality Slider (Applicable to JPEG / WebP) */}
          <div className="field-group">
            <div className="field-label-row">
              <span className="field-label">
                {format === 'png' ? 'Encoding Mode' : 'Encoder Quality'}
              </span>
              <span className="font-mono text-xs font-semibold tabular-nums">
                {format === 'png' ? 'LOSSLESS 24-BIT' : `${quality}%`}
              </span>
            </div>
            {format === 'png' ? (
              <div className="input-well justify-between text-xs font-mono" style={{ height: 36 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Uncompressed Pixel Exact</span>
                <CheckCircle2 size={14} style={{ color: 'var(--status-success)' }} />
              </div>
            ) : (
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="range"
                  min={40}
                  max={100}
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="kinetic-slider"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {errorMsg && (
        <div
          className="instrument-card p-4 flex items-center justify-between"
          style={{
            borderColor: 'var(--status-danger)',
            backgroundColor: 'var(--status-danger-soft)'
          }}
        >
          <span className="text-sm font-medium" style={{ color: 'var(--status-danger)' }}>
            {errorMsg}
          </span>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="btn-kinetic btn-sm"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Dropzone when no file is loaded */}
      {!activeFile && !isProcessing && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            const droppedFile = e.dataTransfer.files?.[0];
            if (droppedFile) handleFileSelect(droppedFile);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`kinetic-dropzone ${isDragOver ? 'drag-over' : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFileSelect(f);
            }}
          />
          <div className="max-w-md mx-auto flex flex-col items-center gap-4">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center border"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderColor: 'var(--border-hairline)',
                color: 'var(--accent-primary)'
              }}
            >
              <Upload size={26} />
            </div>
            <div>
              <h3 className="text-base font-bold mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                Drop your PDF file here, or click to browse
              </h3>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Supports multi-page PDF documents of any size. Processed 100% locally in browser
                memory.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="btn-kinetic btn-primary"
              >
                <Upload size={15} />
                <span>Select PDF File</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLoadSample();
                }}
                className="btn-kinetic"
              >
                <Sparkles size={15} style={{ color: 'var(--accent-primary)' }} />
                <span>Try with 4-Page Sample PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="instrument-card p-8 flex flex-col items-center justify-center gap-4 text-center">
          <RefreshCw
            size={28}
            className="animate-spin"
            style={{ color: 'var(--accent-primary)' }}
          />
          <div>
            <div className="font-mono text-sm font-semibold">
              RASTERIZING PAGE {progress.current} OF {progress.total} AT {dpi} DPI...
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              Rendering vector paths onto high-density HTML5 Canvas buffer
            </p>
          </div>
        </div>
      )}

      {/* Rendered Pages Grid */}
      {pages.length > 0 && !isProcessing && (
        <div className="flex flex-col gap-4">
          {/* Batch Actions Bar */}
          <div className="instrument-card px-5 py-3.5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={toggleSelectAll} className="btn-kinetic btn-sm">
                {selectedCount === pages.length ? (
                  <CheckSquare size={14} style={{ color: 'var(--accent-primary)' }} />
                ) : (
                  <Square size={14} />
                )}
                <span>
                  {selectedCount === pages.length ? 'Deselect All' : 'Select All'} ({selectedCount}/
                  {pages.length})
                </span>
              </button>
              <span className="tech-badge tabular-nums">
                SOURCE: {activeFile?.name}
              </span>
              <span className="tech-badge tech-badge-success tabular-nums">
                TOTAL OUTPUT: {formatBytes(totalRenderedBytes)}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-kinetic btn-sm"
              >
                <Upload size={14} />
                <span>Upload Another PDF</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileSelect(f);
                }}
              />
              <button
                type="button"
                disabled={selectedCount === 0 || isZipping}
                onClick={downloadSelectedAsZip}
                className="btn-kinetic btn-primary btn-sm"
              >
                <Archive size={14} />
                <span>
                  {isZipping
                    ? 'Packaging .ZIP...'
                    : `Download ${selectedCount} Page${selectedCount === 1 ? '' : 's'} (.ZIP)`}
                </span>
              </button>
            </div>
          </div>

          {/* Page Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {pages.map((page) => (
              <div
                key={page.pageNumber}
                className="instrument-card flex flex-col justify-between"
                style={{
                  borderColor: page.selected ? 'var(--accent-primary)' : 'var(--border-hairline)'
                }}
              >
                {/* Card Top Bar */}
                <div className="px-3.5 py-2.5 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-hairline)' }}>
                  <button
                    type="button"
                    onClick={() => toggleSelectPage(page.pageNumber)}
                    className="flex items-center gap-2 text-xs font-mono font-bold cursor-pointer bg-transparent border-0 p-0"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {page.selected ? (
                      <CheckSquare size={15} style={{ color: 'var(--accent-primary)' }} />
                    ) : (
                      <Square size={15} style={{ color: 'var(--text-muted)' }} />
                    )}
                    <span>PAGE {String(page.pageNumber).padStart(2, '0')}</span>
                  </button>
                  <span className="tech-badge tabular-nums">{formatBytes(page.sizeBytes)}</span>
                </div>

                {/* Page Thumbnail Preview */}
                <div
                  className="relative group flex items-center justify-center p-4 overflow-hidden cursor-pointer"
                  style={{ backgroundColor: 'var(--bg-subtle)', height: 240 }}
                  onClick={() => setZoomPage(page)}
                >
                  <img
                    src={page.dataUrl}
                    alt={`Page ${page.pageNumber}`}
                    className="max-h-full max-w-full object-contain shadow-md transition-transform duration-200 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="btn-kinetic btn-sm">
                      <ZoomIn size={14} />
                      <span>Inspect {page.width}×{page.height}</span>
                    </span>
                  </div>
                </div>

                {/* Page Footer Meta & Download */}
                <div
                  className="p-3.5 border-t flex items-center justify-between gap-2"
                  style={{ borderColor: 'var(--border-hairline)' }}
                >
                  <div className="font-mono text-[11px] tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                    {page.width} × {page.height} px • {page.format.toUpperCase()}
                  </div>
                  <button
                    type="button"
                    onClick={() => downloadSinglePage(page)}
                    className="btn-kinetic btn-sm"
                  >
                    <Download size={13} />
                    <span>Save</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* High-Res Lightbox Modal */}
      {zoomPage && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setZoomPage(null)}
        >
          <div
            className="instrument-card max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card-header-bar">
              <div className="card-header-title font-mono">
                <span>
                  PAGE {String(zoomPage.pageNumber).padStart(2, '0')} // {zoomPage.width} ×{' '}
                  {zoomPage.height} PX ({zoomPage.dpi} DPI {zoomPage.format.toUpperCase()})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => downloadSinglePage(zoomPage)}
                  className="btn-kinetic btn-primary btn-sm"
                >
                  <Download size={14} />
                  <span>Download ({formatBytes(zoomPage.sizeBytes)})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setZoomPage(null)}
                  className="btn-kinetic btn-sm"
                >
                  <X size={15} />
                </button>
              </div>
            </div>
            <div
              className="p-6 overflow-auto flex items-center justify-center"
              style={{ backgroundColor: 'var(--bg-subtle)', maxHeight: 'calc(90vh - 64px)' }}
            >
              <img
                src={zoomPage.dataUrl}
                alt={`Page ${zoomPage.pageNumber} full preview`}
                className="max-w-full h-auto shadow-xl border"
                style={{ borderColor: 'var(--border-hairline)' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
