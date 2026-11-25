import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Image as ImageIcon,
  Ruler,
  Percent,
  Landmark,
  Search,
  Sun,
  Moon,
  LayoutGrid,
  ShieldCheck,
  ArrowUpRight,
  Code2,
  Clock,
  Trash2,
  Zap
} from 'lucide-react';
import { PdfToImagesTool } from './tools/PdfToImagesTool';
import { ImageCompressorTool } from './tools/ImageCompressorTool';
import { UnitConverterTool } from './tools/UnitConverterTool';
import { PercentageCalculatorTool } from './tools/PercentageCalculatorTool';
import { LoanCalculatorTool } from './tools/LoanCalculatorTool';
import { ProjectSourceModal } from './components/ProjectSourceModal';

export type ToolId =
  | 'directory'
  | 'pdf-to-img'
  | 'img-compress'
  | 'unit-converter'
  | 'percentage-calc'
  | 'loan-calc';

interface ToolMetadata {
  id: Exclude<ToolId, 'directory'>;
  number: string;
  code: string;
  title: string;
  shortTitle: string;
  category: 'Document & Media' | 'Math & Measurement' | 'Finance';
  categoryBadge: string;
  description: string;
  keywords: string[];
  icon: React.ReactNode;
}

const TOOLS_CATALOG: ToolMetadata[] = [
  {
    id: 'pdf-to-img',
    number: '01',
    code: 'PDF',
    title: 'Convert PDF to Images',
    shortTitle: 'PDF to Images',
    category: 'Document & Media',
    categoryBadge: 'DOCUMENT ENGINE',
    description:
      'Extract multi-page PDF documents into high-DPI PNG, JPEG, or WebP images with batch ZIP export.',
    keywords: ['pdf', 'image', 'png', 'jpg', 'webp', 'document', 'dpi', 'convert', 'extract'],
    icon: <FileText size={18} />
  },
  {
    id: 'img-compress',
    number: '02',
    code: 'IMG',
    title: 'Compress Images',
    shortTitle: 'Compress Images',
    category: 'Document & Media',
    categoryBadge: 'MEDIA ENGINE',
    description:
      'Reduce PNG, JPEG, and WebP file sizes up to 90% with an interactive Before/After optical split slider.',
    keywords: ['compress', 'image', 'photo', 'resize', 'optimize', 'webp', 'jpg', 'png', 'size'],
    icon: <ImageIcon size={18} />
  },
  {
    id: 'unit-converter',
    number: '03',
    code: 'UNT',
    title: 'Unit Converter',
    shortTitle: 'Unit Converter',
    category: 'Math & Measurement',
    categoryBadge: 'METROLOGY',
    description:
      'Bi-directional live unit conversion across Length, Weight, Temperature, Storage, Volume, Area & Speed.',
    keywords: [
      'unit',
      'convert',
      'length',
      'weight',
      'temperature',
      'celsius',
      'fahrenheit',
      'meters',
      'feet',
      'kg',
      'bytes'
    ],
    icon: <Ruler size={18} />
  },
  {
    id: 'percentage-calc',
    number: '04',
    code: 'PCT',
    title: 'Percentage Calculator',
    shortTitle: 'Percentage Calc',
    category: 'Math & Measurement',
    categoryBadge: 'QUANTITATIVE',
    description:
      'Three simultaneous live calculators for % of value, ratio share, % change delta, and retail discount/tax.',
    keywords: ['percent', 'percentage', 'ratio', 'discount', 'tax', 'change', 'increase', 'math'],
    icon: <Percent size={18} />
  },
  {
    id: 'loan-calc',
    number: '05',
    code: 'FIN',
    title: 'Loan Calculator',
    shortTitle: 'Loan Calculator',
    category: 'Finance',
    categoryBadge: 'AMORTIZATION',
    description:
      'Compute monthly payments, principal vs. interest split, extra payoff savings, and export CSV schedules.',
    keywords: ['loan', 'mortgage', 'finance', 'interest', 'amortization', 'payment', 'apr', 'bank'],
    icon: <Landmark size={18} />
  }
];

interface HistoryItem {
  id: string;
  toolAction: string;
  detail: string;
  timestamp: string;
}

export function App() {
  const [activeTool, setActiveTool] = useState<ToolId>('directory');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('kinetic_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
      return 'dark';
    }
    return 'light';
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSourceModalOpen, setIsSourceModalOpen] = useState<boolean>(false);
  const [history, setHistory] = useState<HistoryItem[]>([
    {
      id: 'init-1',
      toolAction: 'System Ready',
      detail: 'All 5 local client-side engines initialized',
      timestamp: 'NOW'
    }
  ]);

  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('kinetic_theme', theme);
  }, [theme]);

  // Global keyboard shortcut ⌘K or / to focus tool search
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const recordHistory = (toolAction: string, detail: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setHistory((prev) => [
      {
        id: `${Date.now()}-${Math.random()}`,
        toolAction,
        detail,
        timestamp: timeStr
      },
      ...prev.slice(0, 7)
    ]);
  };

  const filteredTools = TOOLS_CATALOG.filter((tool) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      tool.title.toLowerCase().includes(q) ||
      tool.description.toLowerCase().includes(q) ||
      tool.category.toLowerCase().includes(q) ||
      tool.keywords.some((k) => k.includes(q))
    );
  });

  const handleSelectTool = (id: ToolId) => {
    setActiveTool(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-shell">
      {/* ====================================================================
          TOP UTILITY HEADER BAR (64px)
          ==================================================================== */}
      <header className="top-utility-bar">
        <div className="top-utility-inner">
          {/* Brand Insignia */}
          <div
            onClick={() => handleSelectTool('directory')}
            className="brand-cluster"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSelectTool('directory');
            }}
          >
            <div className="brand-mark-box">
              <span>K//5</span>
              <span className="brand-mark-dot" />
            </div>
            <div>
              <div className="brand-title">
                <span>KINETIC</span>
                <span className="tech-badge hidden sm:inline-flex">v2.5 SWISS</span>
              </div>
              <div className="brand-subtitle">DAILY UTILITY WORKBENCH</div>
            </div>
          </div>

          {/* Right Controls: Search Filter + Source Files + Theme Toggle */}
          <div className="flex items-center gap-2.5">
            {/* Search Box */}
            <div className="header-search-box">
              <div className="input-well" style={{ height: 36, padding: '0 10px' }}>
                <Search size={14} style={{ color: 'var(--text-muted)', marginRight: 8 }} />
                <input
                  ref={searchInputRef}
                  type="search"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (activeTool !== 'directory' && e.target.value.trim().length > 0) {
                      setActiveTool('directory');
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && filteredTools.length > 0) {
                      handleSelectTool(filteredTools[0].id);
                      setSearchQuery('');
                    }
                  }}
                  placeholder="Find tool (⌘K)..."
                  aria-label="Filter daily tools"
                  style={{ fontSize: '0.8125rem' }}
                />
                <span className="font-mono text-[10px] hidden sm:inline" style={{ color: 'var(--text-muted)' }}>
                  ⌘K
                </span>
              </div>
            </div>

            {/* Theme Polarity Toggle */}
            <button
              type="button"
              onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
              className="btn-kinetic btn-sm"
              aria-label={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              title={`Switch to ${theme === 'light' ? 'Carbon Dark' : 'Alabaster Light'} Mode`}
            >
              {theme === 'light' ? (
                <>
                  <Moon size={15} />
                  <span className="hidden sm:inline font-mono text-xs">DARK</span>
                </>
              ) : (
                <>
                  <Sun size={15} style={{ color: 'var(--accent-primary)' }} />
                  <span className="hidden sm:inline font-mono text-xs">LIGHT</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ====================================================================
          MOBILE / TABLET HORIZONTAL TOOL STRIP (< 900px)
          ==================================================================== */}
      <nav className="mobile-tool-strip" aria-label="Mobile Tool Navigation">
        <button
          type="button"
          onClick={() => handleSelectTool('directory')}
          className={`btn-kinetic btn-sm shrink-0 ${
            activeTool === 'directory' ? 'btn-primary' : ''
          }`}
        >
          <LayoutGrid size={14} />
          <span>All Tools</span>
        </button>
        {TOOLS_CATALOG.map((tool) => (
          <button
            key={tool.id}
            type="button"
            onClick={() => handleSelectTool(tool.id)}
            className={`btn-kinetic btn-sm shrink-0 ${
              activeTool === tool.id ? 'btn-primary' : ''
            }`}
          >
            {tool.icon}
            <span>{tool.shortTitle}</span>
          </button>
        ))}
      </nav>

      {/* ====================================================================
          MAIN 2-COLUMN WORKSPACE SHELL (Left Rail + Active Workbench)
          ==================================================================== */}
      <div className="workspace-container">
        {/* LEFT NAVIGATION RAIL (260px on Desktop) */}
        <aside className="nav-rail" aria-label="Primary Tool Navigation">
          <div className="flex flex-col gap-5">
            {/* Overview Hub Button */}
            <div>
              <div className="nav-section-label">
                <span>WORKBENCH HUB</span>
                <span>05</span>
              </div>
              <button
                type="button"
                onClick={() => handleSelectTool('directory')}
                className={`nav-item-btn ${activeTool === 'directory' ? 'active' : ''}`}
              >
                <span className="flex items-center gap-2.5">
                  <LayoutGrid size={16} className="nav-item-icon" />
                  <span>All Daily Tools</span>
                </span>
                <span className="nav-item-code">HUB</span>
              </button>
            </div>

            {/* Category 1: Document & Media */}
            <div>
              <div className="nav-section-label">
                <span>DOCUMENT & MEDIA</span>
              </div>
              {TOOLS_CATALOG.filter((t) => t.category === 'Document & Media').map((tool) => (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => handleSelectTool(tool.id)}
                  className={`nav-item-btn ${activeTool === tool.id ? 'active' : ''}`}
                >
                  <span className="flex items-center gap-2.5 truncate">
                    <span className="nav-item-icon">{tool.icon}</span>
                    <span className="truncate">{tool.shortTitle}</span>
                  </span>
                  <span className="nav-item-code">{tool.code}</span>
                </button>
              ))}
            </div>

            {/* Category 2: Math & Measurement */}
            <div>
              <div className="nav-section-label">
                <span>MATH & MEASUREMENT</span>
              </div>
              {TOOLS_CATALOG.filter((t) => t.category === 'Math & Measurement').map((tool) => (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => handleSelectTool(tool.id)}
                  className={`nav-item-btn ${activeTool === tool.id ? 'active' : ''}`}
                >
                  <span className="flex items-center gap-2.5 truncate">
                    <span className="nav-item-icon">{tool.icon}</span>
                    <span className="truncate">{tool.shortTitle}</span>
                  </span>
                  <span className="nav-item-code">{tool.code}</span>
                </button>
              ))}
            </div>

            {/* Category 3: Finance */}
            <div>
              <div className="nav-section-label">
                <span>FINANCE & CREDIT</span>
              </div>
              {TOOLS_CATALOG.filter((t) => t.category === 'Finance').map((tool) => (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => handleSelectTool(tool.id)}
                  className={`nav-item-btn ${activeTool === tool.id ? 'active' : ''}`}
                >
                  <span className="flex items-center gap-2.5 truncate">
                    <span className="nav-item-icon">{tool.icon}</span>
                    <span className="truncate">{tool.shortTitle}</span>
                  </span>
                  <span className="nav-item-code">{tool.code}</span>
                </button>
              ))}
            </div>

            {/* Session Activity Log */}
            <div className="pt-3 border-t" style={{ borderColor: 'var(--border-hairline)' }}>
              <div className="nav-section-label">
                <span className="flex items-center gap-1">
                  <Clock size={11} />
                  <span>SESSION LOG</span>
                </span>
                {history.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setHistory(history.slice(0, 1))}
                    className="bg-transparent border-0 p-0 cursor-pointer text-[10px] font-mono"
                    style={{ color: 'var(--text-muted)' }}
                    title="Clear log"
                  >
                    <Trash2 size={11} />
                  </button>
                )}
              </div>
              <div className="flex flex-col gap-1.5 px-2 max-h-40 overflow-y-auto">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="p-2 rounded border text-[11px] font-mono"
                    style={{
                      backgroundColor: 'var(--bg-subtle)',
                      borderColor: 'var(--border-hairline)'
                    }}
                  >
                    <div className="flex items-center justify-between font-bold" style={{ color: 'var(--text-primary)' }}>
                      <span>{item.toolAction}</span>
                      <span className="text-[10px] font-normal" style={{ color: 'var(--text-muted)' }}>
                        {item.timestamp}
                      </span>
                    </div>
                    <div className="truncate mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      {item.detail}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Rail Footer: Client-Side Security & Architecture Stamp */}
          <div className="flex flex-col gap-2 pt-3 border-t" style={{ borderColor: 'var(--border-hairline)' }}>
            <div
              className="p-3 rounded-lg border flex flex-col gap-1.5"
              style={{
                backgroundColor: 'var(--bg-subtle)',
                borderColor: 'var(--border-hairline)'
              }}
            >
              <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold" style={{ color: 'var(--status-success)' }}>
                <ShieldCheck size={14} />
                <span>ZERO SERVER UPLOAD</span>
              </div>
              <p className="text-[11px] m-0 leading-snug" style={{ color: 'var(--text-secondary)' }}>
                All PDFs, images, and financial inputs execute 100% locally inside your browser
                sandbox.
              </p>
            </div>

          </div>
        </aside>

        {/* ==================================================================
            ACTIVE TOOL WORKBENCH CANVAS
            ================================================================== */}
        <main className="workbench-main">
          {activeTool === 'directory' && (
            <div className="flex flex-col gap-7">
              {/* Directory Header */}
              <div className="workbench-header">
                <div className="workbench-title-group">
                  <div className="workbench-eyebrow">
                    <Zap size={14} />
                    <span>KINETIC // DAILY UTILITY SUITE</span>
                    <span className="tech-badge tech-badge-accent">5 CORE INSTRUMENTS</span>
                  </div>
                  <h1 className="workbench-h1">Tactile Swiss Precision Daily Tools</h1>
                  <p className="workbench-desc">
                    Select an instrument below or press <kbd className="tech-badge">⌘K</kbd> to
                    jump directly to any utility. Every tool runs instantaneously in your browser
                    with zero server latency and full offline privacy.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectTool('pdf-to-img')}
                    className="btn-kinetic btn-primary"
                  >
                    <span>Open PDF to Images</span>
                    <ArrowUpRight size={15} />
                  </button>
                </div>
              </div>

              {/* Bento Directory Grid of All 5 Tools */}
              <section aria-label="Daily Tools Directory">
                <div className="bento-grid-3">
                  {filteredTools.map((tool) => (
                    <article
                      key={tool.id}
                      onClick={() => handleSelectTool(tool.id)}
                      className="instrument-card instrument-card-interactive p-6 flex flex-col justify-between gap-5"
                    >
                      <div className="flex flex-col gap-4">
                        {/* Data Point 1: Icon + Category Tag Pill */}
                        <div className="flex items-center justify-between gap-2">
                          <div
                            className="w-11 h-11 rounded-lg border flex items-center justify-center"
                            style={{
                              backgroundColor: 'var(--bg-subtle)',
                              borderColor: 'var(--border-hairline)',
                              color: 'var(--accent-primary)'
                            }}
                          >
                            {tool.icon}
                          </div>
                          <span className="tech-badge">
                            {tool.number} // {tool.categoryBadge}
                          </span>
                        </div>

                        {/* Data Point 2: Tool Title + Concise Utility Description */}
                        <div>
                          <h2
                            className="text-lg font-bold m-0 mb-1.5 flex items-center justify-between"
                            style={{ fontFamily: 'var(--font-display)' }}
                          >
                            <span>{tool.title}</span>
                            <ArrowUpRight size={17} style={{ color: 'var(--text-muted)' }} />
                          </h2>
                          <p
                            className="text-sm m-0 leading-relaxed"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            {tool.description}
                          </p>
                        </div>
                      </div>

                      {/* Data Point 3: Footer Launch Bar */}
                      <div
                        className="pt-3.5 border-t flex items-center justify-between font-mono text-xs"
                        style={{ borderColor: 'var(--border-hairline)' }}
                      >
                        <span style={{ color: 'var(--text-muted)' }}>MODULE [{tool.code}]</span>
                        <span
                          className="font-semibold flex items-center gap-1"
                          style={{ color: 'var(--accent-primary)' }}
                        >
                          <span>LAUNCH WORKBENCH</span>
                          <ArrowUpRight size={13} />
                        </span>
                      </div>
                    </article>
                  ))}
                </div>

                {filteredTools.length === 0 && (
                  <div className="instrument-card p-10 text-center flex flex-col items-center gap-3">
                    <div className="font-mono text-sm font-bold">
                      NO TOOLS MATCHING "{searchQuery}"
                    </div>
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="btn-kinetic btn-sm"
                    >
                      Reset Filter
                    </button>
                  </div>
                )}
              </section>

              {/* Quick Architecture & Performance Strip */}
              <section
                className="instrument-card p-5 grid grid-cols-1 md:grid-cols-4 gap-4"
                aria-label="System Specifications"
              >
                <div className="flex flex-col gap-1">
                  <span className="field-label">01 // PRIVACY ARCHITECTURE</span>
                  <span className="font-mono text-sm font-bold">100% Client-Side Execution</span>
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    Files never leave your device memory.
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="field-label">02 // RASTER & MEDIA ENGINE</span>
                  <span className="font-mono text-sm font-bold">PDF.js + HTML5 Canvas</span>
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    Up to 300 DPI extraction & WebP quantization.
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="field-label">03 // NUMERICAL PRECISION</span>
                  <span className="font-mono text-sm font-bold">Tabular-Nums IEEE 754</span>
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    Zero-jitter real-time reactive calculations.
                  </span>
                </div>
              </section>
            </div>
          )}

          {activeTool === 'pdf-to-img' && <PdfToImagesTool onRecordHistory={recordHistory} />}
          {activeTool === 'img-compress' && (
            <ImageCompressorTool onRecordHistory={recordHistory} />
          )}
          {activeTool === 'unit-converter' && (
            <UnitConverterTool onRecordHistory={recordHistory} />
          )}
          {activeTool === 'percentage-calc' && (
            <PercentageCalculatorTool onRecordHistory={recordHistory} />
          )}
          {activeTool === 'loan-calc' && <LoanCalculatorTool onRecordHistory={recordHistory} />}
        </main>
      </div>

      {/* ====================================================================
          PROJECT SOURCE CODE & STRUCTURE INSPECTOR MODAL
          ==================================================================== */}
      <ProjectSourceModal
        isOpen={isSourceModalOpen}
        onClose={() => setIsSourceModalOpen(false)}
      />
    </div>
  );
}

export default App;
