import React, { useState, useMemo } from 'react';
import {
  Landmark,
  Download,
  Calendar,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Copy,
  Check
} from 'lucide-react';
import {
  calculateLoanAmortization,
  formatCurrency,
  generateAmortizationCsv
} from '../utils/loanEngine';

interface LoanCalculatorToolProps {
  onRecordHistory?: (action: string, detail: string) => void;
}

export const LoanCalculatorTool: React.FC<LoanCalculatorToolProps> = ({ onRecordHistory }) => {
  const [currency, setCurrency] = useState<string>('$');
  const [principal, setPrincipal] = useState<number>(320000);
  const [annualRate, setAnnualRate] = useState<number>(6.25);
  const [termUnit, setTermUnit] = useState<'years' | 'months'>('years');
  const [termValue, setTermValue] = useState<number>(30);
  const [extraMonthly, setExtraMonthly] = useState<number>(0);
  const [scheduleMode, setScheduleMode] = useState<'yearly' | 'monthly'>('yearly');
  const [showSchedule, setShowSchedule] = useState<boolean>(true);
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);

  const totalMonths = termUnit === 'years' ? Math.round(termValue * 12) : Math.round(termValue);

  const summary = useMemo(
    () => calculateLoanAmortization(principal, annualRate, totalMonths, extraMonthly),
    [principal, annualRate, totalMonths, extraMonthly]
  );

  const handleTermUnitSwitch = (newUnit: 'years' | 'months') => {
    if (newUnit === termUnit) return;
    if (newUnit === 'months') {
      setTermValue(Math.round(termValue * 12));
    } else {
      setTermValue(Math.max(1, Math.round(termValue / 12)));
    }
    setTermUnit(newUnit);
  };

  const applyPreset = (p: number, r: number, yrs: number, extra = 0, label: string) => {
    setPrincipal(p);
    setAnnualRate(r);
    setTermUnit('years');
    setTermValue(yrs);
    setExtraMonthly(extra);
    if (onRecordHistory) {
      onRecordHistory('Loan Calc', `${label}: ${currency}${p.toLocaleString()} @ ${r}% (${yrs}y)`);
    }
  };

  const handleDownloadCsv = () => {
    const csv = generateAmortizationCsv(summary);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KINETIC_Loan_Schedule_${principal}_${annualRate}pct.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  };

  const handleCopySummary = () => {
    const text = `Loan: ${formatCurrency(principal, currency)} | Rate: ${annualRate}% | Term: ${totalMonths} mos | Monthly Payment: ${formatCurrency(
      summary.baseMonthlyPayment,
      currency
    )} | Total Interest: ${formatCurrency(summary.totalInterest, currency)}`;
    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 1600);
    if (onRecordHistory) {
      onRecordHistory(
        'Loan Summary',
        `${formatCurrency(summary.baseMonthlyPayment, currency)}/mo (${formatCurrency(
          principal,
          currency
        )} @ ${annualRate}%)`
      );
    }
  };

  // Build SVG path points for remaining balance & cumulative interest chart
  const chartPoints = useMemo(() => {
    const rows = summary.yearlySchedule;
    if (rows.length === 0 || summary.principal <= 0) return null;
    const width = 560;
    const height = 150;
    const padX = 12;
    const padY = 14;
    const innerW = width - padX * 2;
    const innerH = height - padY * 2;
    const maxVal = Math.max(summary.totalPayment, summary.principal, 1);

    const balanceCoords = rows.map((r, i) => {
      const x = padX + (rows.length === 1 ? innerW / 2 : (i / (rows.length - 1)) * innerW);
      const y = padY + innerH - (r.endingBalance / maxVal) * innerH;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    // Add initial point at year 0
    const startY = padY + innerH - (summary.principal / maxVal) * innerH;
    const fullBalanceLine = `${padX},${startY.toFixed(1)} ` + balanceCoords.join(' ');

    return {
      width,
      height,
      fullBalanceLine
    };
  }, [summary]);

  return (
    <div className="flex flex-col gap-6">
      {/* Workbench Header */}
      <div className="workbench-header">
        <div className="workbench-title-group">
          <div className="workbench-eyebrow">
            <Landmark size={14} />
            <span>FINANCIAL ENGINE // MODULE 05</span>
            <span className="tech-badge tech-badge-accent">AMORTIZATION SCHEDULE</span>
          </div>
          <h1 className="workbench-h1">Loan & Mortgage Amortization Calculator</h1>
          <p className="workbench-desc">
            Calculate exact monthly payments, total interest cost, and principal payoff trajectories
            with interactive extra-payment modeling and full schedule export.
          </p>
        </div>

        {/* Currency & Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="segmented-control">
            {['$', '€', '£', '¥'].map((sym) => (
              <button
                key={sym}
                type="button"
                onClick={() => setCurrency(sym)}
                className={`segment-btn ${currency === sym ? 'active' : ''}`}
              >
                {sym}
              </button>
            ))}
          </div>
          <button type="button" onClick={handleCopySummary} className="btn-kinetic btn-sm">
            {copiedSummary ? <Check size={14} /> : <Copy size={14} />}
            <span>{copiedSummary ? 'Copied Summary' : 'Copy Summary'}</span>
          </button>
        </div>
      </div>

      {/* Quick Scenario Presets Strip */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="field-label flex items-center gap-1 mr-1">
          <Sparkles size={13} style={{ color: 'var(--accent-primary)' }} />
          <span>SCENARIO PRESETS:</span>
        </span>
        <button
          type="button"
          onClick={() => applyPreset(350000, 6.5, 30, 0, '30-Yr Mortgage')}
          className="btn-kinetic btn-sm font-mono text-xs"
        >
          30-Yr Mortgage ({currency}350k @ 6.5%)
        </button>
        <button
          type="button"
          onClick={() => applyPreset(350000, 6.5, 30, 300, 'Accelerated Mortgage')}
          className="btn-kinetic btn-sm font-mono text-xs"
        >
          +{currency}300/mo Extra Payoff
        </button>
        <button
          type="button"
          onClick={() => applyPreset(36000, 5.4, 5, 0, '5-Yr Auto Loan')}
          className="btn-kinetic btn-sm font-mono text-xs"
        >
          5-Yr Auto ({currency}36k @ 5.4%)
        </button>
        <button
          type="button"
          onClick={() => applyPreset(120000, 7.25, 10, 0, '10-Yr Commercial')}
          className="btn-kinetic btn-sm font-mono text-xs"
        >
          10-Yr Business ({currency}120k @ 7.25%)
        </button>
      </div>

      {/* Split Asymmetric Workbench: Left 40% Inputs / Right 60% Breakdown */}
      <div className="workbench-split-asymmetric">
        {/* LEFT COLUMN: TACTILE INPUT CONTROLS */}
        <div className="instrument-card">
          <div className="card-header-bar">
            <div className="card-header-title">
              <span>Loan Parameters</span>
            </div>
            <span className="tech-badge">{totalMonths} PAYMENTS</span>
          </div>

          <div className="card-body flex flex-col gap-6">
            {/* 1. Loan Principal Amount */}
            <div className="field-group">
              <div className="field-label-row">
                <span className="field-label">Loan Principal Amount</span>
                <span className="font-mono text-xs font-semibold tabular-nums" style={{ color: 'var(--accent-secondary)' }}>
                  {formatCurrency(principal, currency, 0)}
                </span>
              </div>
              <div className="input-well">
                <span className="input-affix mr-2">{currency}</span>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  value={principal}
                  onChange={(e) => setPrincipal(Math.max(0, Number(e.target.value)))}
                  aria-label="Loan principal amount"
                />
              </div>
              <input
                type="range"
                min={5000}
                max={1500000}
                step={5000}
                value={Math.min(1500000, principal)}
                onChange={(e) => setPrincipal(Number(e.target.value))}
                className="kinetic-slider mt-1"
              />
              <div className="flex justify-between font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>
                <span>{currency}5,000</span>
                <span>{currency}750,000</span>
                <span>{currency}1.5M</span>
              </div>
            </div>

            {/* 2. Annual Interest Rate */}
            <div className="field-group">
              <div className="field-label-row">
                <span className="field-label">Annual Interest Rate (APR)</span>
                <span className="font-mono text-xs font-semibold tabular-nums" style={{ color: 'var(--accent-primary)' }}>
                  {annualRate}%
                </span>
              </div>
              <div className="input-well">
                <input
                  type="number"
                  min={0}
                  max={50}
                  step={0.05}
                  value={annualRate}
                  onChange={(e) => setAnnualRate(Math.max(0, Number(e.target.value)))}
                  aria-label="Annual interest rate"
                />
                <span className="input-affix">%</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={18}
                step={0.125}
                value={Math.min(18, annualRate)}
                onChange={(e) => setAnnualRate(Number(e.target.value))}
                className="kinetic-slider mt-1"
              />
              <div className="flex justify-between font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>
                <span>0.5%</span>
                <span>6.0%</span>
                <span>12.0%</span>
                <span>18.0%</span>
              </div>
            </div>

            {/* 3. Loan Term (Years / Months) */}
            <div className="field-group">
              <div className="field-label-row">
                <span className="field-label">Amortization Term</span>
                <div className="segmented-control">
                  <button
                    type="button"
                    onClick={() => handleTermUnitSwitch('years')}
                    className={`segment-btn py-0.5 px-2 text-[11px] ${
                      termUnit === 'years' ? 'active' : ''
                    }`}
                  >
                    YEARS
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTermUnitSwitch('months')}
                    className={`segment-btn py-0.5 px-2 text-[11px] ${
                      termUnit === 'months' ? 'active' : ''
                    }`}
                  >
                    MONTHS
                  </button>
                </div>
              </div>
              <div className="input-well">
                <input
                  type="number"
                  min={1}
                  max={termUnit === 'years' ? 50 : 600}
                  value={termValue}
                  onChange={(e) => setTermValue(Math.max(1, Number(e.target.value)))}
                  aria-label="Loan term"
                />
                <span className="input-affix">
                  {termUnit === 'years' ? 'YRS' : 'MOS'}
                </span>
              </div>
              <input
                type="range"
                min={termUnit === 'years' ? 1 : 12}
                max={termUnit === 'years' ? 40 : 480}
                step={termUnit === 'years' ? 1 : 6}
                value={termValue}
                onChange={(e) => setTermValue(Number(e.target.value))}
                className="kinetic-slider mt-1"
              />
            </div>

            {/* 4. Optional Extra Monthly Payment */}
            <div className="field-group pt-2 border-t" style={{ borderColor: 'var(--border-hairline)' }}>
              <div className="field-label-row">
                <span className="field-label">Extra Monthly Principal (Optional)</span>
                <span className="tech-badge tech-badge-success">PAYOFF ACCELERATOR</span>
              </div>
              <div className="input-well">
                <span className="input-affix mr-2">+{currency}</span>
                <input
                  type="number"
                  min={0}
                  step={50}
                  value={extraMonthly}
                  onChange={(e) => setExtraMonthly(Math.max(0, Number(e.target.value)))}
                  aria-label="Extra monthly payment"
                />
                <span className="input-affix">/MO</span>
              </div>
              <input
                type="range"
                min={0}
                max={2000}
                step={25}
                value={Math.min(2000, extraMonthly)}
                onChange={(e) => setExtraMonthly(Number(e.target.value))}
                className="kinetic-slider mt-1"
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: HERO BREAKDOWN & VISUALIZATION */}
        <div className="flex flex-col gap-5">
          {/* Hero Payment & KPI Summary Card */}
          <div className="instrument-card p-6 flex flex-col gap-6">
            <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b" style={{ borderColor: 'var(--border-hairline)' }}>
              <div>
                <div className="field-label mb-1">ESTIMATED MONTHLY PAYMENT</div>
                <div
                  className="font-mono text-4xl font-bold tabular-nums tracking-tight"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {formatCurrency(summary.baseMonthlyPayment, currency)}
                  <span className="text-sm font-normal ml-1.5" style={{ color: 'var(--text-muted)' }}>
                    / month
                  </span>
                </div>
                {extraMonthly > 0 && (
                  <div className="font-mono text-xs mt-1.5" style={{ color: 'var(--status-success)' }}>
                    With +{formatCurrency(extraMonthly, currency)} extra:{' '}
                    <strong>{formatCurrency(summary.effectiveMonthlyPayment, currency)}/mo</strong>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-end gap-1.5">
                <span className="tech-badge tech-badge-blue">
                  EFFECTIVE PAYOFF: {summary.actualPayoffMonths} MONTHS (
                  {(summary.actualPayoffMonths / 12).toFixed(1)} YRS)
                </span>
                {summary.interestSavedWithExtra > 0 && (
                  <span className="tech-badge tech-badge-success">
                    <TrendingDown size={12} />
                    <span>
                      SAVES {formatCurrency(summary.interestSavedWithExtra, currency)} INTEREST (
                      {summary.monthsSavedWithExtra} MOS FASTER)
                    </span>
                  </span>
                )}
              </div>
            </div>

            {/* 3-Column Financial Totals */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div
                className="p-3.5 rounded-lg border"
                style={{
                  backgroundColor: 'var(--bg-subtle)',
                  borderColor: 'var(--border-hairline)'
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="field-label">TOTAL PRINCIPAL</span>
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: 'var(--accent-secondary)' }}
                  />
                </div>
                <div className="font-mono text-lg font-bold tabular-nums">
                  {formatCurrency(summary.principal, currency, 0)}
                </div>
                <div className="font-mono text-[11px] tabular-nums" style={{ color: 'var(--text-muted)' }}>
                  {summary.principalSharePercent.toFixed(1)}% of total cost
                </div>
              </div>

              <div
                className="p-3.5 rounded-lg border"
                style={{
                  backgroundColor: 'var(--bg-subtle)',
                  borderColor: 'var(--border-hairline)'
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="field-label">TOTAL INTEREST</span>
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: 'var(--accent-primary)' }}
                  />
                </div>
                <div
                  className="font-mono text-lg font-bold tabular-nums"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  {formatCurrency(summary.totalInterest, currency, 0)}
                </div>
                <div className="font-mono text-[11px] tabular-nums" style={{ color: 'var(--text-muted)' }}>
                  {summary.interestSharePercent.toFixed(1)}% of total cost
                </div>
              </div>

              <div
                className="p-3.5 rounded-lg border"
                style={{
                  backgroundColor: 'var(--bg-subtle)',
                  borderColor: 'var(--border-hairline)'
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="field-label">TOTAL COST OF LOAN</span>
                </div>
                <div className="font-mono text-lg font-bold tabular-nums">
                  {formatCurrency(summary.totalPayment, currency, 0)}
                </div>
                <div className="font-mono text-[11px] tabular-nums" style={{ color: 'var(--text-muted)' }}>
                  Principal + Cumulative Interest
                </div>
              </div>
            </div>

            {/* Stacked Principal vs. Interest Ratio Bar */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span style={{ color: 'var(--accent-secondary)' }}>
                  ■ PRINCIPAL ({summary.principalSharePercent.toFixed(1)}%)
                </span>
                <span style={{ color: 'var(--accent-primary)' }}>
                  ■ INTEREST ({summary.interestSharePercent.toFixed(1)}%)
                </span>
              </div>
              <div
                className="w-full h-4 rounded-md overflow-hidden flex p-0.5 gap-0.5"
                style={{ backgroundColor: 'var(--bg-subtle)' }}
              >
                <div
                  className="h-full rounded-l-sm transition-all duration-200"
                  style={{
                    width: `${summary.principalSharePercent}%`,
                    backgroundColor: 'var(--accent-secondary)'
                  }}
                />
                <div
                  className="h-full rounded-r-sm transition-all duration-200"
                  style={{
                    width: `${summary.interestSharePercent}%`,
                    backgroundColor: 'var(--accent-primary)'
                  }}
                />
              </div>
            </div>

            {/* Balance Payoff Trajectory SVG Curve */}
            {chartPoints && (
              <div
                className="p-4 rounded-xl border flex flex-col gap-2"
                style={{
                  backgroundColor: 'var(--bg-subtle)',
                  borderColor: 'var(--border-hairline)'
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="field-label">PRINCIPAL BALANCE DECAY TRAJECTORY</span>
                  <span className="font-mono text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    YEAR 0 → YEAR {summary.yearlySchedule.length}
                  </span>
                </div>
                <svg
                  viewBox={`0 0 ${chartPoints.width} ${chartPoints.height}`}
                  className="w-full h-32 overflow-visible"
                >
                  {/* Horizontal Reference Lines */}
                  {[0.25, 0.5, 0.75].map((ratio, idx) => (
                    <line
                      key={idx}
                      x1={12}
                      x2={chartPoints.width - 12}
                      y1={chartPoints.height * ratio}
                      y2={chartPoints.height * ratio}
                      stroke="var(--border-hairline)"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />
                  ))}
                  {/* Balance Decay Curve */}
                  <polyline
                    fill="none"
                    stroke="var(--accent-secondary)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={chartPoints.fullBalanceLine}
                  />
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Collapsible Amortization Schedule Table */}
      <div className="instrument-card">
        <div className="card-header-bar flex-wrap">
          <div className="card-header-title">
            <Calendar size={16} style={{ color: 'var(--accent-primary)' }} />
            <span>Amortization Payment Schedule</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="segmented-control">
              <button
                type="button"
                onClick={() => setScheduleMode('yearly')}
                className={`segment-btn ${scheduleMode === 'yearly' ? 'active' : ''}`}
              >
                Yearly ({summary.yearlySchedule.length})
              </button>
              <button
                type="button"
                onClick={() => setScheduleMode('monthly')}
                className={`segment-btn ${scheduleMode === 'monthly' ? 'active' : ''}`}
              >
                Monthly ({summary.monthlySchedule.length})
              </button>
            </div>

            <button type="button" onClick={handleDownloadCsv} className="btn-kinetic btn-sm">
              <Download size={14} />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={() => setShowSchedule((s) => !s)}
              className="btn-kinetic btn-sm"
            >
              {showSchedule ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              <span>{showSchedule ? 'Hide' : 'Show'}</span>
            </button>
          </div>
        </div>

        {showSchedule && (
          <div className="card-body">
            <div className="kinetic-table-wrap max-h-[420px] overflow-y-auto">
              {scheduleMode === 'yearly' ? (
                <table className="kinetic-table tabular-nums">
                  <thead className="sticky top-0 z-10">
                    <tr>
                      <th>Year</th>
                      <th>Total Paid</th>
                      <th>Principal Paid</th>
                      <th>Interest Paid</th>
                      <th>Equity Owned</th>
                      <th>Ending Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.yearlySchedule.map((row) => (
                      <tr key={row.year}>
                        <td className="font-bold">Year {row.year}</td>
                        <td>{formatCurrency(row.totalPayment, currency)}</td>
                        <td style={{ color: 'var(--accent-secondary)' }}>
                          {formatCurrency(row.principalPaid, currency)}
                        </td>
                        <td style={{ color: 'var(--accent-primary)' }}>
                          {formatCurrency(row.interestPaid, currency)}
                        </td>
                        <td>{row.equityPercent.toFixed(1)}%</td>
                        <td className="font-bold">{formatCurrency(row.endingBalance, currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="kinetic-table tabular-nums">
                  <thead className="sticky top-0 z-10">
                    <tr>
                      <th>Month</th>
                      <th>Payment</th>
                      <th>Principal</th>
                      <th>Interest</th>
                      <th>Cumulative Interest</th>
                      <th>Remaining Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.monthlySchedule.map((row) => (
                      <tr key={row.month}>
                        <td className="font-bold">
                          Mo {row.month}{' '}
                          <span className="text-[11px] font-normal" style={{ color: 'var(--text-muted)' }}>
                            (Y{row.year})
                          </span>
                        </td>
                        <td>{formatCurrency(row.payment, currency)}</td>
                        <td style={{ color: 'var(--accent-secondary)' }}>
                          {formatCurrency(row.principal, currency)}
                        </td>
                        <td style={{ color: 'var(--accent-primary)' }}>
                          {formatCurrency(row.interest, currency)}
                        </td>
                        <td>{formatCurrency(row.cumulativeInterest, currency)}</td>
                        <td className="font-bold">{formatCurrency(row.balance, currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
