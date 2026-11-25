import React, { useState } from 'react';
import { Copy, Check, Download, FolderTree, FileCode, X } from 'lucide-react';

import rawIndexHtml from '../../standalone/index.html?raw';
import rawVariablesCss from '../styles/variables.css?raw';
import rawLayoutCss from '../styles/layout.css?raw';
import rawComponentsCss from '../styles/components.css?raw';
import rawAppJs from '../../standalone/js/app.js?raw';
import rawPdfJs from '../../standalone/js/tools/pdf-to-img.js?raw';
import rawImgJs from '../../standalone/js/tools/img-compress.js?raw';
import rawUnitJs from '../../standalone/js/tools/unit-converter.js?raw';
import rawPctJs from '../../standalone/js/tools/percentage-calc.js?raw';
import rawLoanJs from '../../standalone/js/tools/loan-calc.js?raw';

interface SourceFileEntry {
  path: string;
  category: 'HTML' | 'CSS' | 'JS';
  description: string;
  content: string;
}

const PROJECT_FILES: SourceFileEntry[] = [
  {
    path: 'index.html',
    category: 'HTML',
    description: 'Semantic SEO HTML5 document shell, JSON-LD schema & navigation layout',
    content: rawIndexHtml
  },
  {
    path: 'css/variables.css',
    category: 'CSS',
    description: 'Design tokens, Warm Alabaster light mode & Carbon Slate dark mode variables',
    content: rawVariablesCss
  },
  {
    path: 'css/layout.css',
    category: 'CSS',
    description: '2-column Swiss precision grid, top utility bar, sticky rail & breakpoints',
    content: rawLayoutCss
  },
  {
    path: 'css/components.css',
    category: 'CSS',
    description: 'Tactile input wells, sliders, dropzones, split-screen comparator & tables',
    content: rawComponentsCss
  },
  {
    path: 'js/app.js',
    category: 'JS',
    description: 'Main ES6 router, theme persistence (localStorage), and ⌘K tool filter',
    content: rawAppJs
  },
  {
    path: 'js/tools/pdf-to-img.js',
    category: 'JS',
    description: 'Client-side PDF.js page extraction & multi-DPI HTML5 Canvas rasterizer',
    content: rawPdfJs
  },
  {
    path: 'js/tools/img-compress.js',
    category: 'JS',
    description: 'HTML5 Canvas image compression & format transcoding engine',
    content: rawImgJs
  },
  {
    path: 'js/tools/unit-converter.js',
    category: 'JS',
    description: 'Bi-directional unit converter across measurement categories',
    content: rawUnitJs
  },
  {
    path: 'js/tools/percentage-calc.js',
    category: 'JS',
    description: '3-way modular live percentage calculation engine',
    content: rawPctJs
  },
  {
    path: 'js/tools/loan-calc.js',
    category: 'JS',
    description: 'Loan & mortgage amortization calculator with principal/interest split',
    content: rawLoanJs
  }
];

interface ProjectSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectSourceModal: React.FC<ProjectSourceModalProps> = ({ isOpen, onClose }) => {
  const [selectedPath, setSelectedPath] = useState<string>('index.html');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const activeFile =
    PROJECT_FILES.find((f) => f.path === selectedPath) || PROJECT_FILES[0];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([activeFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeFile.path.split('/').pop() || 'file.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 3000);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="instrument-card max-w-5xl w-full max-h-[88vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Modal Header */}
        <div className="card-header-bar">
          <div className="card-header-title">
            <FolderTree size={16} style={{ color: 'var(--accent-primary)' }} />
            <span>Modular Project Architecture & Separate HTML/CSS/JS Files</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="tech-badge tech-badge-accent">10 SEPARATE FILES</span>
            <button type="button" onClick={onClose} className="btn-kinetic btn-sm">
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Body: Left Directory Tree + Right Source Code Viewer */}
        <div
          className="grid grid-cols-1 md:grid-cols-[270px_1fr] flex-1 overflow-hidden"
          style={{ minHeight: 460 }}
        >
          {/* Left File Tree */}
          <div
            className="p-3 border-r overflow-y-auto flex flex-col gap-1"
            style={{
              borderColor: 'var(--border-hairline)',
              backgroundColor: 'var(--bg-primary)'
            }}
          >
            <div className="font-mono text-[11px] font-bold px-2 py-1.5" style={{ color: 'var(--text-muted)' }}>
              daily-tools-web/
            </div>
            {PROJECT_FILES.map((file) => {
              const isSelected = file.path === activeFile.path;
              return (
                <button
                  key={file.path}
                  type="button"
                  onClick={() => setSelectedPath(file.path)}
                  className={`nav-item-btn text-xs font-mono ${isSelected ? 'active' : ''}`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <FileCode size={13} className="nav-item-icon shrink-0" />
                    <span className="truncate">{file.path}</span>
                  </span>
                  <span className="nav-item-code">{file.category}</span>
                </button>
              );
            })}
          </div>

          {/* Right Code Inspector */}
          <div className="flex flex-col overflow-hidden" style={{ backgroundColor: 'var(--bg-elevated)' }}>
            <div
              className="px-4 py-2.5 border-b flex flex-wrap items-center justify-between gap-2"
              style={{
                borderColor: 'var(--border-hairline)',
                backgroundColor: 'var(--bg-subtle)'
              }}
            >
              <div>
                <div className="font-mono text-xs font-bold">{activeFile.path}</div>
                <div className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                  {activeFile.description}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={handleCopyCode} className="btn-kinetic btn-sm">
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copied ? 'Copied File' : 'Copy Code'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadFile}
                  className="btn-kinetic btn-primary btn-sm"
                >
                  <Download size={13} />
                  <span>Download</span>
                </button>
              </div>
            </div>

            <pre
              className="p-4 m-0 overflow-auto flex-1 font-mono text-xs leading-relaxed"
              style={{
                backgroundColor: 'var(--bg-subtle)',
                color: 'var(--text-primary)',
                maxHeight: 'calc(88vh - 130px)'
              }}
            >
              <code>{activeFile.content}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
