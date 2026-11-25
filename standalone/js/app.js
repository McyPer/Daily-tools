// ==========================================================================
// KINETIC // MAIN ROUTER, THEME MANAGER & SEARCH CONTROLLER (app.js)
// ==========================================================================

import { renderPdfToImgTool } from './tools/pdf-to-img.js';
import { renderImgCompressTool } from './tools/img-compress.js';
import { renderUnitConverterTool } from './tools/unit-converter.js';
import { renderPercentageCalcTool } from './tools/percentage-calc.js';
import { renderLoanCalcTool } from './tools/loan-calc.js';

const TOOL_ROUTES = {
  'pdf-to-img': renderPdfToImgTool,
  'img-compress': renderImgCompressTool,
  'unit-converter': renderUnitConverterTool,
  'percentage-calc': renderPercentageCalcTool,
  'loan-calc': renderLoanCalcTool
};

let currentTool = 'pdf-to-img';

function initTheme() {
  const saved = localStorage.getItem('kinetic_theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (prefersDark ? 'dark' : 'light');
  applyTheme(theme);

  const btn = document.getElementById('theme-toggle-btn');
  if (btn) {
    btn.addEventListener('click', () => {
      const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
    });
  }
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('kinetic_theme', theme);
  const label = document.getElementById('theme-toggle-label');
  if (label) {
    label.textContent = theme === 'dark' ? 'LIGHT MODE' : 'DARK MODE';
  }
}

function navigateToTool(toolId) {
  if (!TOOL_ROUTES[toolId]) return;
  currentTool = toolId;

  document.querySelectorAll('.nav-item-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.tool === toolId);
  });

  const root = document.getElementById('workbench-root');
  if (root) {
    root.innerHTML = '';
    TOOL_ROUTES[toolId](root);
  }
}

function initNavigation() {
  document.querySelectorAll('.nav-item-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      navigateToTool(btn.dataset.tool);
    });
  });

  const searchInput = document.getElementById('tool-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      document.querySelectorAll('.nav-item-btn').forEach((btn) => {
        const match = btn.textContent.toLowerCase().includes(q);
        btn.style.display = match ? 'flex' : 'none';
      });
    });

    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInput.focus();
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavigation();
  navigateToTool(currentTool);
});
