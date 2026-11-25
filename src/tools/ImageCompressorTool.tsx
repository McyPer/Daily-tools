import React, { useState, useRef, useEffect } from 'react';
import {
  Image as ImageIcon,
  Upload,
  Download,
  Sparkles,
  Sliders,
  MoveHorizontal,
  Trash2,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import {
  CompressOutputFormat,
  CompressedImageResult,
  compressImageFile,
  createSampleHighResImageFile
} from '../utils/imageEngine';
import { formatBytes } from '../utils/pdfEngine';

interface ImageCompressorToolProps {
  onRecordHistory?: (action: string, detail: string) => void;
}

export const ImageCompressorTool: React.FC<ImageCompressorToolProps> = ({ onRecordHistory }) => {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [quality, setQuality] = useState<number>(76);
  const [outputFormat, setOutputFormat] = useState<CompressOutputFormat>('webp');
  const [maxDimension, setMaxDimension] = useState<number>(0); // 0 = original
  const [result, setResult] = useState<CompressedImageResult | null>(null);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [splitPercent, setSplitPercent] = useState<number>(50);
  const [isDraggingSplit, setIsDraggingSplit] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);

  const runCompression = async (
    file: File,
    q: number,
    fmt: CompressOutputFormat,
    maxDim: number
  ) => {
    setIsCompressing(true);
    try {
      const res = await compressImageFile(file, q, fmt, maxDim);
      setResult(res);
      if (onRecordHistory) {
        onRecordHistory(
          'Compress Image',
          `${file.name}: ${formatBytes(res.originalBytes)} → ${formatBytes(
            res.compressedBytes
          )} (${res.savingsPercent >= 0 ? '-' : '+'}${Math.abs(res.savingsPercent).toFixed(1)}%)`
        );
      }
    } finally {
      setIsCompressing(false);
    }
  };

  useEffect(() => {
    if (!sourceFile) return;
    const timer = setTimeout(() => {
      runCompression(sourceFile, quality, outputFormat, maxDimension);
    }, 100);
    return () => clearTimeout(timer);
  }, [sourceFile, quality, outputFormat, maxDimension]);

  const handleSelectFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setSourceFile(file);
  };

  const handleLoadSampleImage = async () => {
    setIsCompressing(true);
    const sample = await createSampleHighResImageFile();
    setSourceFile(sample);
  };

  const handleDownloadCompressed = () => {
    if (!result) return;
    const ext = result.outputFormat === 'jpeg' ? 'jpg' : result.outputFormat;
    const baseName = result.originalFile.name.replace(/\.[^.]+$/, '');
    const a = document.createElement('a');
    a.href = result.compressedUrl;
    a.download = `${baseName}_compressed_q${result.quality}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Interactive Before/After split slider pointer handler
  const updateSplitFromClientX = (clientX: number) => {
    if (!viewportRef.current) return;
    const rect = viewportRef.current.getBoundingClientRect();
    const relX = clientX - rect.left;
    const pct = Math.max(4, Math.min(96, (relX / rect.width) * 100));
    setSplitPercent(pct);
  };

  useEffect(() => {
    if (!isDraggingSplit) return;
    const onMove = (e: MouseEvent) => updateSplitFromClientX(e.clientX);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) updateSplitFromClientX(e.touches[0].clientX);
    };
    const onUp = () => setIsDraggingSplit(false);

    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchend', onUp);
    };
  }, [isDraggingSplit]);

  return (
    <div className="flex flex-col gap-6">
      {/* Workbench Header */}
      <div className="workbench-header">
        <div className="workbench-title-group">
          <div className="workbench-eyebrow">
            <ImageIcon size={14} />
            <span>MEDIA ENGINE // MODULE 02</span>
            <span className="tech-badge tech-badge-accent">HTML5 CANVAS QUANTIZER</span>
          </div>
          <h1 className="workbench-h1">Compress & Transcode Images</h1>
          <p className="workbench-desc">
            Reduce image file sizes up to 90% with real-time visual quality inspection. Convert
            between WebP, JPEG, and PNG with optional dimension scaling.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleLoadSampleImage}
            className="btn-kinetic btn-secondary-subtle"
          >
            <Sparkles size={15} style={{ color: 'var(--accent-primary)' }} />
            <span>Load Sample High-Res Photo</span>
          </button>
          {sourceFile && (
            <button
              type="button"
              onClick={() => {
                setSourceFile(null);
                setResult(null);
              }}
              className="btn-kinetic"
            >
              <Trash2 size={15} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Dropzone if no image loaded */}
      {!sourceFile && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            const f = e.dataTransfer.files?.[0];
            if (f) handleSelectFile(f);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`kinetic-dropzone ${isDragOver ? 'drag-over' : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleSelectFile(f);
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
                Drop PNG, JPG, or WebP image here
              </h3>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Instant local compression with interactive Before/After split-screen optical
                comparison.
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
                <span>Choose Image File</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLoadSampleImage();
                }}
                className="btn-kinetic"
              >
                <Sparkles size={15} style={{ color: 'var(--accent-primary)' }} />
                <span>Try with 1600×1000 Sample Photo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Split Workspace when image is active */}
      {sourceFile && result && (
        <div className="workbench-split-asymmetric">
          {/* Left 40%: Compression Controls & Byte Telemetry */}
          <div className="flex flex-col gap-5">
            {/* Savings Readout Hero Card */}
            <div className="instrument-card p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="field-label">BYTE REDUCTION TELEMETRY</span>
                <span
                  className={`tech-badge ${
                    result.savingsPercent > 0 ? 'tech-badge-success' : 'tech-badge-accent'
                  } tabular-nums`}
                >
                  {result.savingsPercent >= 0
                    ? `-${result.savingsPercent.toFixed(1)}% SAVED`
                    : `+${Math.abs(result.savingsPercent).toFixed(1)}% SIZE`}
                </span>
              </div>

              <div className="flex items-baseline justify-between gap-2">
                <div>
                  <div className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                    ORIGINAL
                  </div>
                  <div className="text-lg font-mono font-bold tabular-nums">
                    {formatBytes(result.originalBytes)}
                  </div>
                </div>
                <ArrowRight size={18} style={{ color: 'var(--text-muted)' }} />
                <div className="text-right">
                  <div className="text-xs font-mono" style={{ color: 'var(--accent-primary)' }}>
                    COMPRESSED ({result.outputFormat.toUpperCase()})
                  </div>
                  <div
                    className="text-2xl font-mono font-bold tabular-nums"
                    style={{ color: 'var(--status-success)' }}
                  >
                    {formatBytes(result.compressedBytes)}
                  </div>
                </div>
              </div>

              {/* Visual Bar Comparing Compressed vs Original */}
              <div
                className="w-full h-2.5 rounded-full overflow-hidden"
                style={{ backgroundColor: 'var(--bg-subtle)' }}
              >
                <div
                  className="h-full transition-all duration-200"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(4, (result.compressedBytes / result.originalBytes) * 100)
                    )}%`,
                    backgroundColor: 'var(--status-success)'
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                <div>
                  SOURCE: {result.originalWidth}×{result.originalHeight}px
                </div>
                <div className="text-right">
                  OUTPUT: {result.compressedWidth}×{result.compressedHeight}px
                </div>
              </div>

              <button
                type="button"
                onClick={handleDownloadCompressed}
                className="btn-kinetic btn-primary w-full mt-1"
              >
                <Download size={16} />
                <span>
                  Download Optimized .{result.outputFormat === 'jpeg' ? 'JPG' : result.outputFormat.toUpperCase()} (
                  {formatBytes(result.compressedBytes)})
                </span>
              </button>
            </div>

            {/* Encoder Controls Card */}
            <div className="instrument-card">
              <div className="card-header-bar">
                <div className="card-header-title">
                  <Sliders size={15} style={{ color: 'var(--accent-primary)' }} />
                  <span>Compression Parameters</span>
                </div>
                {isCompressing && (
                  <span className="tech-badge tech-badge-accent">ENCODING...</span>
                )}
              </div>

              <div className="card-body flex flex-col gap-5">
                {/* Quality Slider */}
                <div className="field-group">
                  <div className="field-label-row">
                    <span className="field-label">Target Quality Factor</span>
                    <span
                      className="font-mono text-sm font-bold tabular-nums"
                      style={{ color: 'var(--accent-primary)' }}
                    >
                      {quality}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={100}
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="kinetic-slider my-1"
                  />
                  <div className="flex items-center justify-between gap-1.5 mt-1">
                    {[
                      { label: 'Max Savings (50%)', q: 50 },
                      { label: 'Balanced (76%)', q: 76 },
                      { label: 'High (90%)', q: 90 }
                    ].map((preset) => (
                      <button
                        key={preset.q}
                        type="button"
                        onClick={() => setQuality(preset.q)}
                        className="btn-kinetic btn-sm flex-1 text-[11px] font-mono"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Output Format */}
                <div className="field-group">
                  <div className="field-label-row">
                    <span className="field-label">Target Format</span>
                    <span className="tech-badge">
                      {outputFormat === 'webp' ? 'RECOMMENDED' : 'STANDARD'}
                    </span>
                  </div>
                  <div className="segmented-control w-full">
                    {(['webp', 'jpeg', 'png'] as CompressOutputFormat[]).map((fmt) => (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() => setOutputFormat(fmt)}
                        className={`segment-btn flex-1 ${outputFormat === fmt ? 'active' : ''}`}
                      >
                        {fmt === 'jpeg' ? 'JPEG' : fmt.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Max Dimension Resize */}
                <div className="field-group">
                  <div className="field-label-row">
                    <span className="field-label">Max Dimension Constraint</span>
                    <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                      {maxDimension === 0 ? '1:1 Native' : `Max ${maxDimension}px`}
                    </span>
                  </div>
                  <div className="segmented-control w-full">
                    {[
                      { label: 'Original', val: 0 },
                      { label: '1920px', val: 1920 },
                      { label: '1280px', val: 1280 },
                      { label: '800px', val: 800 }
                    ].map((dim) => (
                      <button
                        key={dim.val}
                        type="button"
                        onClick={() => setMaxDimension(dim.val)}
                        className={`segment-btn flex-1 ${
                          maxDimension === dim.val ? 'active' : ''
                        }`}
                      >
                        {dim.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Upload Another Image button */}
                <div className="pt-2 border-t" style={{ borderColor: 'var(--border-hairline)' }}>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-kinetic w-full"
                  >
                    <Upload size={14} />
                    <span>Load Different Image</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleSelectFile(f);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right 60%: Interactive Before / After Optical Split-Screen Inspector */}
          <div className="instrument-card flex flex-col">
            <div className="card-header-bar">
              <div className="card-header-title">
                <MoveHorizontal size={16} style={{ color: 'var(--accent-primary)' }} />
                <span>Interactive Optical Split Comparison</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="tech-badge">DRAG DIVIDER TO COMPARE</span>
              </div>
            </div>

            <div className="card-body flex flex-col gap-3">
              <div
                ref={viewportRef}
                onMouseDown={(e) => {
                  setIsDraggingSplit(true);
                  updateSplitFromClientX(e.clientX);
                }}
                onTouchStart={(e) => {
                  setIsDraggingSplit(true);
                  if (e.touches[0]) updateSplitFromClientX(e.touches[0].clientX);
                }}
                className="comparison-viewport cursor-ew-resize"
              >
                {/* Bottom Layer: Compressed Result (Full Width) */}
                <div className="comparison-layer">
                  <img src={result.compressedUrl} alt="Compressed preview" />
                </div>

                {/* Top Layer: Original Image (Clipped to splitPercent) */}
                <div
                  className="comparison-layer"
                  style={{
                    clipPath: `inset(0 ${100 - splitPercent}% 0 0)`
                  }}
                >
                  <img src={result.originalUrl} alt="Original preview" />
                </div>

                {/* Corner HUD Labels */}
                <div className="absolute top-3 left-3 z-20 pointer-events-none">
                  <span className="tech-badge" style={{ backgroundColor: 'var(--bg-elevated)' }}>
                    ORIGINAL • {formatBytes(result.originalBytes)}
                  </span>
                </div>
                <div className="absolute top-3 right-3 z-20 pointer-events-none">
                  <span
                    className="tech-badge tech-badge-success"
                    style={{ backgroundColor: 'var(--bg-elevated)' }}
                  >
                    COMPRESSED • {formatBytes(result.compressedBytes)}
                  </span>
                </div>

                {/* Split Handle Line & Tactile Knob */}
                <div
                  className="comparison-handle-line"
                  style={{ left: `${splitPercent}%` }}
                >
                  <div className="comparison-handle-knob">
                    <MoveHorizontal size={16} />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} style={{ color: 'var(--status-success)' }} />
                  <span>FILE: {result.originalFile.name}</span>
                </div>
                <div>SPLIT POSITION: {Math.round(splitPercent)}%</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
