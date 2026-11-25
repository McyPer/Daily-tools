import React, { useState } from 'react';
import {
  ArrowLeftRight,
  Copy,
  Check,
  Ruler,
  Scale,
  Thermometer,
  HardDrive,
  FlaskConical,
  Maximize2,
  Gauge,
  Sparkles
} from 'lucide-react';
import {
  UNIT_CATEGORIES,
  UnitCategoryId,
  convertUnitValue,
  formatConvertedNumber,
  getConversionFormula
} from '../utils/unitEngine';

interface UnitConverterToolProps {
  onRecordHistory?: (action: string, detail: string) => void;
}

const CATEGORY_ICONS: Record<UnitCategoryId, React.ReactNode> = {
  length: <Ruler size={15} />,
  weight: <Scale size={15} />,
  temperature: <Thermometer size={15} />,
  data: <HardDrive size={15} />,
  volume: <FlaskConical size={15} />,
  area: <Maximize2 size={15} />,
  speed: <Gauge size={15} />
};

export const UnitConverterTool: React.FC<UnitConverterToolProps> = ({ onRecordHistory }) => {
  const [categoryId, setCategoryId] = useState<UnitCategoryId>('length');
  const [fromUnit, setFromUnit] = useState<string>('m');
  const [toUnit, setToUnit] = useState<string>('ft');
  const [precision, setPrecision] = useState<number>(4);
  const [fromText, setFromText] = useState<string>('100');
  const [toText, setToText] = useState<string>(() =>
    formatConvertedNumber(convertUnitValue(100, 'length', 'm', 'ft'), 4)
  );
  const [swapRotation, setSwapRotation] = useState<number>(0);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const activeCategory = UNIT_CATEGORIES.find((c) => c.id === categoryId) || UNIT_CATEGORIES[0];

  const handleCategoryChange = (newCatId: UnitCategoryId) => {
    const spec = UNIT_CATEGORIES.find((c) => c.id === newCatId)!;
    setCategoryId(newCatId);
    setFromUnit(spec.defaultFrom);
    setToUnit(spec.defaultTo);
    const num = parseFloat(fromText);
    const baseVal = Number.isFinite(num) ? num : 1;
    setFromText(String(baseVal));
    const converted = convertUnitValue(baseVal, newCatId, spec.defaultFrom, spec.defaultTo);
    setToText(formatConvertedNumber(converted, precision));
  };

  const handleFromValueChange = (raw: string) => {
    setFromText(raw);
    const num = parseFloat(raw);
    if (!Number.isFinite(num)) {
      setToText('');
      return;
    }
    const converted = convertUnitValue(num, categoryId, fromUnit, toUnit);
    setToText(formatConvertedNumber(converted, precision));
  };

  const handleToValueChange = (raw: string) => {
    setToText(raw);
    const num = parseFloat(raw);
    if (!Number.isFinite(num)) {
      setFromText('');
      return;
    }
    // Reverse conversion!
    const reversed = convertUnitValue(num, categoryId, toUnit, fromUnit);
    setFromText(formatConvertedNumber(reversed, precision));
  };

  const handleFromUnitChange = (newFrom: string) => {
    setFromUnit(newFrom);
    const num = parseFloat(fromText);
    if (Number.isFinite(num)) {
      const converted = convertUnitValue(num, categoryId, newFrom, toUnit);
      setToText(formatConvertedNumber(converted, precision));
    }
  };

  const handleToUnitChange = (newTo: string) => {
    setToUnit(newTo);
    const num = parseFloat(fromText);
    if (Number.isFinite(num)) {
      const converted = convertUnitValue(num, categoryId, fromUnit, newTo);
      setToText(formatConvertedNumber(converted, precision));
    }
  };

  const handleSwapUnits = () => {
    setSwapRotation((r) => r + 180);
    const nextFrom = toUnit;
    const nextTo = fromUnit;
    setFromUnit(nextFrom);
    setToUnit(nextTo);
    const num = parseFloat(fromText);
    if (Number.isFinite(num)) {
      const converted = convertUnitValue(num, categoryId, nextFrom, nextTo);
      setToText(formatConvertedNumber(converted, precision));
    }
  };

  const handlePrecisionChange = (newPrec: number) => {
    setPrecision(newPrec);
    const num = parseFloat(fromText);
    if (Number.isFinite(num)) {
      const converted = convertUnitValue(num, categoryId, fromUnit, toUnit);
      setToText(formatConvertedNumber(converted, newPrec));
    }
  };

  const handleApplyPreset = (preset: {
    label: string;
    value: number;
    from: string;
    to: string;
  }) => {
    setFromUnit(preset.from);
    setToUnit(preset.to);
    setFromText(String(preset.value));
    const converted = convertUnitValue(preset.value, categoryId, preset.from, preset.to);
    const formatted = formatConvertedNumber(converted, precision);
    setToText(formatted);
    if (onRecordHistory) {
      onRecordHistory('Unit Convert', `${preset.value} ${preset.from} = ${formatted} ${preset.to}`);
    }
  };

  const copyValue = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1600);
    if (onRecordHistory && key === 'main') {
      const fromDef = activeCategory.units.find((u) => u.id === fromUnit);
      const toDef = activeCategory.units.find((u) => u.id === toUnit);
      onRecordHistory(
        'Unit Convert',
        `${fromText} ${fromDef?.symbol || fromUnit} → ${toText} ${toDef?.symbol || toUnit}`
      );
    }
  };

  const numericFrom = parseFloat(fromText);
  const safeFromVal = Number.isFinite(numericFrom) ? numericFrom : 0;
  const fromUnitObj = activeCategory.units.find((u) => u.id === fromUnit);
  const toUnitObj = activeCategory.units.find((u) => u.id === toUnit);

  return (
    <div className="flex flex-col gap-6">
      {/* Workbench Header */}
      <div className="workbench-header">
        <div className="workbench-title-group">
          <div className="workbench-eyebrow">
            <Ruler size={14} />
            <span>METROLOGY ENGINE // MODULE 03</span>
            <span className="tech-badge tech-badge-accent">IEEE-754 PRECISION</span>
          </div>
          <h1 className="workbench-h1">Bi-Directional Unit Converter</h1>
          <p className="workbench-desc">
            Instant two-way unit conversion across Length, Weight, Temperature, Digital Storage,
            Volume, Area, and Speed with simultaneous multi-unit reference tables.
          </p>
        </div>

        {/* Decimal Precision Selector */}
        <div className="flex items-center gap-2">
          <span className="field-label">DECIMALS:</span>
          <div className="segmented-control">
            {[2, 4, 6, 8].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => handlePrecisionChange(p)}
                className={`segment-btn ${precision === p ? 'active' : ''}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Category Selector Strip */}
      <div className="flex flex-wrap gap-2">
        {UNIT_CATEGORIES.map((cat) => {
          const isActive = cat.id === categoryId;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategoryChange(cat.id)}
              className={`btn-kinetic ${isActive ? 'btn-primary' : ''}`}
            >
              {CATEGORY_ICONS[cat.id]}
              <span>{cat.label}</span>
              <span
                className="font-mono text-[10px] px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'var(--bg-subtle)',
                  color: isActive ? '#FFFFFF' : 'var(--text-muted)'
                }}
              >
                {cat.code}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Bi-Directional Converter Instrument */}
      <div className="instrument-card">
        <div className="card-header-bar">
          <div className="card-header-title">
            {CATEGORY_ICONS[categoryId]}
            <span>{activeCategory.label} Transducer</span>
          </div>
          <span className="tech-badge tech-badge-blue font-mono">
            FORMULA: {getConversionFormula(categoryId, fromUnit, toUnit)}
          </span>
        </div>

        <div className="card-body flex flex-col gap-6">
          {/* Two-Way Input Grid with Swap Center */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 items-center">
            {/* FROM UNIT PANEL */}
            <div
              className="p-4 rounded-xl border flex flex-col gap-3"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border-hairline)'
              }}
            >
              <div className="flex items-center justify-between">
                <span className="field-label">INPUT A (SOURCE)</span>
                <span className="tech-badge">{fromUnitObj?.symbol}</span>
              </div>

              <div className="input-well input-well-lg">
                <input
                  type="number"
                  step="any"
                  value={fromText}
                  onChange={(e) => handleFromValueChange(e.target.value)}
                  placeholder="Enter value..."
                  aria-label="Source value"
                />
                <span className="input-affix ml-2">{fromUnitObj?.symbol}</span>
              </div>

              <div className="input-well">
                <select
                  value={fromUnit}
                  onChange={(e) => handleFromUnitChange(e.target.value)}
                  aria-label="Source unit"
                >
                  {activeCategory.units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.symbol})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* SWAP BUTTON */}
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={handleSwapUnits}
                title="Swap Units (180°)"
                className="btn-kinetic w-12 h-12 rounded-full p-0 flex items-center justify-center shadow-sm"
                style={{
                  borderColor: 'var(--accent-primary)',
                  color: 'var(--accent-primary)'
                }}
              >
                <ArrowLeftRight
                  size={18}
                  style={{
                    transform: `rotate(${swapRotation}deg)`,
                    transition: 'transform 260ms cubic-bezier(0.22, 1, 0.36, 1)'
                  }}
                />
              </button>
            </div>

            {/* TO UNIT PANEL */}
            <div
              className="p-4 rounded-xl border flex flex-col gap-3"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border-hairline)'
              }}
            >
              <div className="flex items-center justify-between">
                <span className="field-label" style={{ color: 'var(--accent-primary)' }}>
                  INPUT B (TARGET — EDITABLE)
                </span>
                <button
                  type="button"
                  onClick={() => copyValue(toText, 'main')}
                  className="btn-kinetic btn-sm h-6 px-2 text-xs font-mono"
                >
                  {copiedKey === 'main' ? (
                    <>
                      <Check size={12} style={{ color: 'var(--status-success)' }} />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div
                className="input-well input-well-lg"
                style={{ borderColor: 'var(--accent-primary-border)' }}
              >
                <input
                  type="number"
                  step="any"
                  value={toText}
                  onChange={(e) => handleToValueChange(e.target.value)}
                  placeholder="Converted value..."
                  aria-label="Target value"
                />
                <span className="input-affix ml-2" style={{ color: 'var(--accent-primary)' }}>
                  {toUnitObj?.symbol}
                </span>
              </div>

              <div className="input-well">
                <select
                  value={toUnit}
                  onChange={(e) => handleToUnitChange(e.target.value)}
                  aria-label="Target unit"
                >
                  {activeCategory.units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.symbol})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Quick Reference Presets */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t" style={{ borderColor: 'var(--border-hairline)' }}>
            <span className="field-label flex items-center gap-1 mr-1">
              <Sparkles size={12} style={{ color: 'var(--accent-primary)' }} />
              <span>QUICK PRESETS:</span>
            </span>
            {activeCategory.presets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="btn-kinetic btn-sm font-mono text-xs"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* All-Units Live Reference Matrix */}
      <div className="instrument-card">
        <div className="card-header-bar">
          <div className="card-header-title">
            <span>Simultaneous All-Units Reference Matrix</span>
          </div>
          <span className="tech-badge tabular-nums">
            BASE: {safeFromVal} {fromUnitObj?.symbol}
          </span>
        </div>

        <div className="card-body">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeCategory.units.map((u) => {
              const converted = convertUnitValue(safeFromVal, categoryId, fromUnit, u.id);
              const formatted = formatConvertedNumber(converted, precision);
              const isCurrentTarget = u.id === toUnit;
              return (
                <div
                  key={u.id}
                  className="p-3.5 rounded-lg border flex items-center justify-between gap-2 transition-colors"
                  style={{
                    backgroundColor: isCurrentTarget
                      ? 'var(--accent-primary-soft)'
                      : 'var(--bg-subtle)',
                    borderColor: isCurrentTarget
                      ? 'var(--accent-primary-border)'
                      : 'var(--border-hairline)'
                  }}
                >
                  <div className="min-w-0">
                    <div className="text-xs font-medium truncate" style={{ color: 'var(--text-secondary)' }}>
                      {u.name}
                    </div>
                    <div className="font-mono text-base font-bold tabular-nums truncate">
                      {formatted}{' '}
                      <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>
                        {u.symbol}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyValue(formatted, u.id)}
                    className="btn-kinetic btn-sm px-2"
                    title={`Copy ${formatted} ${u.symbol}`}
                  >
                    {copiedKey === u.id ? (
                      <Check size={13} style={{ color: 'var(--status-success)' }} />
                    ) : (
                      <Copy size={13} />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
