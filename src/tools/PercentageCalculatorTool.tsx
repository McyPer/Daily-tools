import React, { useState } from 'react';
import {
  Percent,
  Copy,
  Check,
  TrendingUp,
  TrendingDown,
  Tag,
  RotateCcw
} from 'lucide-react';
import {
  calculatePercentOf,
  calculateWhatPercent,
  calculatePercentChange,
  calculateDiscountAndTax,
  formatNum
} from '../utils/percentageEngine';

interface PercentageCalculatorToolProps {
  onRecordHistory?: (action: string, detail: string) => void;
}

export const PercentageCalculatorTool: React.FC<PercentageCalculatorToolProps> = ({
  onRecordHistory
}) => {
  // Card 1: What is X% of Y?
  const [c1Percent, setC1Percent] = useState<string>('18');
  const [c1Total, setC1Total] = useState<string>('250');

  // Card 2: X is what % of Y?
  const [c2Part, setC2Part] = useState<string>('65');
  const [c2Whole, setC2Whole] = useState<string>('200');

  // Card 3: Percentage Change from X to Y
  const [c3From, setC3From] = useState<string>('120');
  const [c3To, setC3To] = useState<string>('165');

  // Card 4: Discount & Tax Calculator
  const [dPrice, setDPrice] = useState<string>('150');
  const [dDiscount, setDDiscount] = useState<string>('20');
  const [dTax, setDTax] = useState<string>('8.5');

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const res1 = calculatePercentOf(parseFloat(c1Percent), parseFloat(c1Total));
  const res2 = calculateWhatPercent(parseFloat(c2Part), parseFloat(c2Whole));
  const res3 = calculatePercentChange(parseFloat(c3From), parseFloat(c3To));
  const res4 = calculateDiscountAndTax(
    parseFloat(dPrice),
    parseFloat(dDiscount),
    parseFloat(dTax)
  );

  const handleCopy = (val: string, id: string, label: string) => {
    navigator.clipboard.writeText(val);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
    if (onRecordHistory) {
      onRecordHistory('Percentage Calc', `${label}: ${val}`);
    }
  };

  const resetAll = () => {
    setC1Percent('18');
    setC1Total('250');
    setC2Part('65');
    setC2Whole('200');
    setC3From('120');
    setC3To('165');
    setDPrice('150');
    setDDiscount('20');
    setDTax('8.5');
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Workbench Header */}
      <div className="workbench-header">
        <div className="workbench-title-group">
          <div className="workbench-eyebrow">
            <Percent size={14} />
            <span>QUANTITATIVE ENGINE // MODULE 04</span>
            <span className="tech-badge tech-badge-accent">REACTIVE LIVE INPUTS</span>
          </div>
          <h1 className="workbench-h1">Modular Percentage Calculator</h1>
          <p className="workbench-desc">
            Three simultaneous live percentage instruments plus a commercial discount and tax
            estimator. All outputs update on every keystroke with zero submit delay.
          </p>
        </div>

        <button type="button" onClick={resetAll} className="btn-kinetic">
          <RotateCcw size={14} />
          <span>Reset Defaults</span>
        </button>
      </div>

      {/* 3-Column Bento Grid for Core Percentage Modules */}
      <div className="bento-grid-3">
        {/* MODULE 01: What is X% of Y? */}
        <div className="instrument-card flex flex-col justify-between">
          <div>
            <div className="card-header-bar">
              <div className="card-header-title">
                <span className="tech-badge tech-badge-accent">01</span>
                <span>Percentage of a Value</span>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleCopy(
                    formatNum(res1.result),
                    'c1',
                    `${c1Percent}% of ${c1Total}`
                  )
                }
                className="btn-kinetic btn-sm h-7 px-2.5 text-xs font-mono"
              >
                {copiedId === 'c1' ? <Check size={12} /> : <Copy size={12} />}
                <span>{copiedId === 'c1' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="card-body flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="field-group">
                  <span className="field-label">WHAT IS (%)</span>
                  <div className="input-well">
                    <input
                      type="number"
                      step="any"
                      value={c1Percent}
                      onChange={(e) => setC1Percent(e.target.value)}
                      aria-label="Percentage value"
                    />
                    <span className="input-affix">%</span>
                  </div>
                </div>

                <div className="field-group">
                  <span className="field-label">OF TOTAL VALUE</span>
                  <div className="input-well">
                    <input
                      type="number"
                      step="any"
                      value={c1Total}
                      onChange={(e) => setC1Total(e.target.value)}
                      aria-label="Total base value"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Percentage Chips */}
              <div className="flex flex-wrap gap-1.5">
                {[5, 10, 15, 20, 25, 50].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setC1Percent(String(pct))}
                    className={`btn-kinetic btn-sm px-2 py-0 h-6 text-[11px] font-mono ${
                      Number(c1Percent) === pct ? 'btn-primary' : ''
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>

              {/* Result Readout Well */}
              <div
                className="p-4 rounded-xl border flex flex-col gap-2"
                style={{
                  backgroundColor: 'var(--bg-subtle)',
                  borderColor: 'var(--border-hairline)'
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="field-label">RESULT VALUE</span>
                  <span className="font-mono text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    {res1.formula}
                  </span>
                </div>
                <div
                  className="font-mono text-3xl font-bold tabular-nums"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  {res1.valid ? formatNum(res1.result) : '—'}
                </div>

                {/* Proportional Visual Bar */}
                <div
                  className="w-full h-2 rounded-full overflow-hidden mt-1"
                  style={{ backgroundColor: 'var(--border-hairline)' }}
                >
                  <div
                    className="h-full transition-all duration-150"
                    style={{
                      width: `${Math.min(100, Math.max(0, parseFloat(c1Percent) || 0))}%`,
                      backgroundColor: 'var(--accent-primary)'
                    }}
                  />
                </div>
                <div className="flex justify-between font-mono text-[11px] tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                  <span>Part: {res1.valid ? formatNum(res1.result) : '0'}</span>
                  <span>Remainder: {res1.valid ? formatNum(res1.remainder) : '0'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MODULE 02: X is what % of Y? */}
        <div className="instrument-card flex flex-col justify-between">
          <div>
            <div className="card-header-bar">
              <div className="card-header-title">
                <span className="tech-badge tech-badge-blue">02</span>
                <span>Ratio to Percentage</span>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleCopy(
                    `${formatNum(res2.percentage)}%`,
                    'c2',
                    `${c2Part} is what % of ${c2Whole}`
                  )
                }
                className="btn-kinetic btn-sm h-7 px-2.5 text-xs font-mono"
              >
                {copiedId === 'c2' ? <Check size={12} /> : <Copy size={12} />}
                <span>{copiedId === 'c2' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="card-body flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="field-group">
                  <span className="field-label">PART VALUE (X)</span>
                  <div className="input-well">
                    <input
                      type="number"
                      step="any"
                      value={c2Part}
                      onChange={(e) => setC2Part(e.target.value)}
                      aria-label="Part value X"
                    />
                  </div>
                </div>

                <div className="field-group">
                  <span className="field-label">IS WHAT % OF (Y)</span>
                  <div className="input-well">
                    <input
                      type="number"
                      step="any"
                      value={c2Whole}
                      onChange={(e) => setC2Whole(e.target.value)}
                      aria-label="Whole value Y"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-mono px-1" style={{ color: 'var(--text-muted)' }}>
                <span>DECIMAL RATIO: {res2.valid ? formatNum(res2.ratio, 4) : '—'}x</span>
                <span>COMPLEMENT: {res2.valid ? `${formatNum(res2.complement, 2)}%` : '—'}</span>
              </div>

              {/* Result Readout Well */}
              <div
                className="p-4 rounded-xl border flex flex-col gap-2"
                style={{
                  backgroundColor: 'var(--bg-subtle)',
                  borderColor: 'var(--border-hairline)'
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="field-label">COMPUTED SHARE</span>
                  <span className="font-mono text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    {res2.formula}
                  </span>
                </div>
                <div
                  className="font-mono text-3xl font-bold tabular-nums"
                  style={{ color: 'var(--accent-secondary)' }}
                >
                  {res2.valid ? `${formatNum(res2.percentage)}%` : '—'}
                </div>

                {/* Proportional Visual Bar */}
                <div
                  className="w-full h-2 rounded-full overflow-hidden mt-1"
                  style={{ backgroundColor: 'var(--border-hairline)' }}
                >
                  <div
                    className="h-full transition-all duration-150"
                    style={{
                      width: `${Math.min(100, Math.max(0, res2.percentage || 0))}%`,
                      backgroundColor: 'var(--accent-secondary)'
                    }}
                  />
                </div>
                <div className="flex justify-between font-mono text-[11px] tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                  <span>Share: {res2.valid ? `${formatNum(res2.percentage, 1)}%` : '0%'}</span>
                  <span>Target Base: 100%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MODULE 03: Percentage Change from X to Y */}
        <div className="instrument-card flex flex-col justify-between">
          <div>
            <div className="card-header-bar">
              <div className="card-header-title">
                <span className="tech-badge tech-badge-success">03</span>
                <span>Percentage Change (Δ)</span>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleCopy(
                    `${res3.percentChange >= 0 ? '+' : ''}${formatNum(res3.percentChange)}%`,
                    'c3',
                    `Change ${c3From} → ${c3To}`
                  )
                }
                className="btn-kinetic btn-sm h-7 px-2.5 text-xs font-mono"
              >
                {copiedId === 'c3' ? <Check size={12} /> : <Copy size={12} />}
                <span>{copiedId === 'c3' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="card-body flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="field-group">
                  <span className="field-label">INITIAL VALUE (X)</span>
                  <div className="input-well">
                    <input
                      type="number"
                      step="any"
                      value={c3From}
                      onChange={(e) => setC3From(e.target.value)}
                      aria-label="Initial value X"
                    />
                  </div>
                </div>

                <div className="field-group">
                  <span className="field-label">FINAL VALUE (Y)</span>
                  <div className="input-well">
                    <input
                      type="number"
                      step="any"
                      value={c3To}
                      onChange={(e) => setC3To(e.target.value)}
                      aria-label="Final value Y"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-mono px-1" style={{ color: 'var(--text-muted)' }}>
                <span>
                  NET DELTA:{' '}
                  {res3.valid
                    ? `${res3.absoluteDiff >= 0 ? '+' : ''}${formatNum(res3.absoluteDiff)}`
                    : '—'}
                </span>
                <span>MULTIPLIER: {res3.valid ? `${formatNum(res3.multiplier, 3)}x` : '—'}</span>
              </div>

              {/* Result Readout Well */}
              <div
                className="p-4 rounded-xl border flex flex-col gap-2"
                style={{
                  backgroundColor: 'var(--bg-subtle)',
                  borderColor: 'var(--border-hairline)'
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="field-label">RELATIVE VARIANCE</span>
                  {res3.valid && (
                    <span
                      className={`tech-badge ${
                        res3.direction === 'increase'
                          ? 'tech-badge-success'
                          : res3.direction === 'decrease'
                          ? 'tech-badge-accent'
                          : ''
                      }`}
                    >
                      {res3.direction === 'increase' && <TrendingUp size={11} />}
                      {res3.direction === 'decrease' && <TrendingDown size={11} />}
                      <span>{res3.direction.toUpperCase()}</span>
                    </span>
                  )}
                </div>

                <div
                  className="font-mono text-3xl font-bold tabular-nums"
                  style={{
                    color:
                      res3.direction === 'increase'
                        ? 'var(--status-success)'
                        : res3.direction === 'decrease'
                        ? 'var(--status-danger)'
                        : 'var(--text-primary)'
                  }}
                >
                  {res3.valid
                    ? `${res3.percentChange > 0 ? '+' : ''}${formatNum(res3.percentChange)}%`
                    : '—'}
                </div>

                <div className="font-mono text-[11px] truncate" style={{ color: 'var(--text-secondary)' }}>
                  {res3.formula}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODULE 04: Commercial Discount & Tax Quick Workbench */}
      <div className="instrument-card">
        <div className="card-header-bar">
          <div className="card-header-title">
            <Tag size={15} style={{ color: 'var(--accent-primary)' }} />
            <span>Commercial Discount, Markdown & Sales Tax Calculator</span>
          </div>
          <span className="tech-badge">RETAIL / INVOICE HELPER</span>
        </div>

        <div className="card-body grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Inputs (7 cols) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="field-group">
              <span className="field-label">ORIGINAL PRICE</span>
              <div className="input-well">
                <span className="input-affix mr-1.5">$</span>
                <input
                  type="number"
                  step="any"
                  value={dPrice}
                  onChange={(e) => setDPrice(e.target.value)}
                />
              </div>
            </div>

            <div className="field-group">
              <span className="field-label">DISCOUNT OFF (%)</span>
              <div className="input-well">
                <input
                  type="number"
                  step="any"
                  value={dDiscount}
                  onChange={(e) => setDDiscount(e.target.value)}
                />
                <span className="input-affix">%</span>
              </div>
            </div>

            <div className="field-group">
              <span className="field-label">SALES TAX / VAT (%)</span>
              <div className="input-well">
                <input
                  type="number"
                  step="any"
                  value={dTax}
                  onChange={(e) => setDTax(e.target.value)}
                />
                <span className="input-affix">%</span>
              </div>
            </div>
          </div>

          {/* Live Breakdown Receipt (5 cols) */}
          <div
            className="lg:col-span-5 p-4 rounded-xl border grid grid-cols-3 gap-3 items-center"
            style={{
              backgroundColor: 'var(--bg-subtle)',
              borderColor: 'var(--border-hairline)'
            }}
          >
            <div>
              <div className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>
                YOU SAVE
              </div>
              <div
                className="font-mono text-base font-bold tabular-nums"
                style={{ color: 'var(--status-success)' }}
              >
                -${formatNum(res4.discountAmount, 2)}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>
                TAX ADDED
              </div>
              <div className="font-mono text-base font-bold tabular-nums">
                +${formatNum(res4.taxAmount, 2)}
              </div>
            </div>

            <div className="text-right">
              <div className="text-[11px] font-mono" style={{ color: 'var(--accent-primary)' }}>
                FINAL PAYABLE
              </div>
              <div
                className="font-mono text-xl font-bold tabular-nums"
                style={{ color: 'var(--text-primary)' }}
              >
                ${formatNum(res4.finalPrice, 2)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
