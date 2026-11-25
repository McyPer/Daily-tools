// ==========================================================================
// KINETIC // IMAGE COMPRESSION & TRANSCODING ENGINE (HTML5 Canvas API)
// ==========================================================================

export type CompressOutputFormat = 'jpeg' | 'webp' | 'png';

export interface CompressedImageResult {
  originalFile: File;
  originalUrl: string;
  originalWidth: number;
  originalHeight: number;
  originalBytes: number;
  compressedUrl: string;
  compressedBlob: Blob;
  compressedWidth: number;
  compressedHeight: number;
  compressedBytes: number;
  savingsPercent: number;
  outputFormat: CompressOutputFormat;
  quality: number;
}

function getMimeFromFormat(format: CompressOutputFormat): string {
  if (format === 'webp') return 'image/webp';
  if (format === 'png') return 'image/png';
  return 'image/jpeg';
}

export function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

/**
 * Compresses an image File using HTML5 Canvas with quality, format, and max dimension controls.
 */
export async function compressImageFile(
  file: File,
  qualityPercent: number, // 1 to 100
  outputFormat: CompressOutputFormat,
  maxDimension: number // 0 = keep original
): Promise<CompressedImageResult> {
  const originalUrl = URL.createObjectURL(file);
  const img = await loadImageElement(originalUrl);

  const originalWidth = img.naturalWidth || img.width;
  const originalHeight = img.naturalHeight || img.height;

  let targetWidth = originalWidth;
  let targetHeight = originalHeight;

  if (maxDimension > 0 && (originalWidth > maxDimension || originalHeight > maxDimension)) {
    if (originalWidth >= originalHeight) {
      targetWidth = maxDimension;
      targetHeight = Math.round((originalHeight * maxDimension) / originalWidth);
    } else {
      targetHeight = maxDimension;
      targetWidth = Math.round((originalWidth * maxDimension) / originalHeight);
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d')!;

  // White background for JPEG so transparent pixels don't turn black
  if (outputFormat === 'jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  // If PNG is selected and quality < 92, apply subtle color bit-depth quantization
  // so PNG output achieves genuine byte reduction similar to TinyPNG
  if (outputFormat === 'png' && qualityPercent < 92) {
    const imgData = ctx.getImageData(0, 0, targetWidth, targetHeight);
    const data = imgData.data;
    const levels = Math.max(4, Math.round((qualityPercent / 100) * 48));
    const step = 255 / levels;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.round(Math.round(data[i] / step) * step);
      data[i + 1] = Math.round(Math.round(data[i + 1] / step) * step);
      data[i + 2] = Math.round(Math.round(data[i + 2] / step) * step);
    }
    ctx.putImageData(imgData, 0, 0);
  }

  const mime = getMimeFromFormat(outputFormat);
  const normalizedQuality = Math.min(1, Math.max(0.02, qualityPercent / 100));

  const compressedDataUrl = canvas.toDataURL(mime, normalizedQuality);
  const compressedBlob = dataUrlToBlob(compressedDataUrl);

  const savingsPercent =
    file.size > 0 ? ((file.size - compressedBlob.size) / file.size) * 100 : 0;

  return {
    originalFile: file,
    originalUrl,
    originalWidth,
    originalHeight,
    originalBytes: file.size,
    compressedUrl: compressedDataUrl,
    compressedBlob,
    compressedWidth: targetWidth,
    compressedHeight: targetHeight,
    compressedBytes: compressedBlob.size,
    savingsPercent,
    outputFormat,
    quality: qualityPercent
  };
}

function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(',');
  const mimeMatch = parts[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const bstr = atob(parts[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Generates a realistic, high-resolution (1600x1000) detailed architectural & industrial design canvas photo
 * so users can immediately test real image compression & split-screen comparison.
 */
export async function createSampleHighResImageFile(): Promise<File> {
  const width = 1600;
  const height = 1000;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Rich atmospheric gradient background
  const skyGrad = ctx.createLinearGradient(0, 0, width, height);
  skyGrad.addColorStop(0, '#141923');
  skyGrad.addColorStop(0.45, '#1E293B');
  skyGrad.addColorStop(0.75, '#C2410C');
  skyGrad.addColorStop(1, '#F59E0B');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, width, height);

  // Subtle architectural grid & fine texture for realistic photographic entropy
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
  ctx.lineWidth = 1;
  for (let x = 0; x < width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Sun / Solar disk
  const sunGrad = ctx.createRadialGradient(1150, 340, 20, 1150, 340, 260);
  sunGrad.addColorStop(0, '#FFFBEB');
  sunGrad.addColorStop(0.3, '#FB923C');
  sunGrad.addColorStop(1, 'rgba(251, 146, 60, 0)');
  ctx.fillStyle = sunGrad;
  ctx.beginPath();
  ctx.arc(1150, 340, 260, 0, Math.PI * 2);
  ctx.fill();

  // Brutalist / Swiss Pavilion Architectural Geometry
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(140, 420, 620, 580);

  // Facade windows with warm interior lighting gradients
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 8; c++) {
      const wx = 178 + c * 70;
      const wy = 460 + r * 84;
      const lit = (r * 3 + c * 7) % 5 !== 0;
      if (lit) {
        const winGrad = ctx.createLinearGradient(wx, wy, wx + 48, wy + 60);
        winGrad.addColorStop(0, '#FDE68A');
        winGrad.addColorStop(1, '#EA580C');
        ctx.fillStyle = winGrad;
      } else {
        ctx.fillStyle = '#1E293B';
      }
      ctx.fillRect(wx, wy, 48, 60);
    }
  }

  // Cantilevered concrete wing
  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(580, 540, 880, 110);
  ctx.fillStyle = '#CBD5E1';
  ctx.fillRect(580, 650, 880, 24);

  // Structural columns
  ctx.fillStyle = '#334155';
  ctx.fillRect(680, 674, 36, 326);
  ctx.fillRect(1020, 674, 36, 326);
  ctx.fillRect(1340, 674, 36, 326);

  // Fine grain texture overlay to give realistic ~900KB PNG file size
  const imgData = ctx.getImageData(0, 0, width, height);
  const d = imgData.data;
  let seed = 42;
  for (let i = 0; i < d.length; i += 4) {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff;
    const noise = ((seed >>> 24) & 0x0f) - 7;
    d[i] = Math.min(255, Math.max(0, d[i] + noise));
    d[i + 1] = Math.min(255, Math.max(0, d[i + 1] + noise));
    d[i + 2] = Math.min(255, Math.max(0, d[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  // Technical HUD Stamp on the sample image
  ctx.fillStyle = 'rgba(20, 20, 19, 0.82)';
  ctx.fillRect(60, 60, 510, 96);
  ctx.strokeStyle = '#F97316';
  ctx.lineWidth = 2;
  ctx.strokeRect(60, 60, 510, 96);

  ctx.fillStyle = '#F97316';
  ctx.font = 'bold 14px monospace';
  ctx.fillText('KINETIC TEST CHART // ZURICH PAVILION RAW', 84, 94);
  ctx.fillStyle = '#F8FAFC';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('1600 × 1000 PX HIGH-ENTROPY SAMPLE', 84, 128);

  const dataUrl = canvas.toDataURL('image/png');
  const blob = dataUrlToBlob(dataUrl);
  return new File([blob], 'Zurich_Architectural_Pavilion_1600x1000.png', {
    type: 'image/png',
    lastModified: Date.now()
  });
}
