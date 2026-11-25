// ==========================================================================
// KINETIC // LOAN & MORTGAGE AMORTIZATION ENGINE
// ==========================================================================

export interface MonthlyAmortizationRow {
  month: number;
  year: number;
  payment: number;
  principal: number;
  interest: number;
  extraPayment: number;
  balance: number;
  cumulativeInterest: number;
  cumulativePrincipal: number;
}

export interface YearlyAmortizationRow {
  year: number;
  totalPayment: number;
  principalPaid: number;
  interestPaid: number;
  endingBalance: number;
  equityPercent: number;
}

export interface LoanCalculationSummary {
  principal: number;
  annualRate: number;
  totalMonths: number;
  extraMonthlyPayment: number;
  baseMonthlyPayment: number;
  effectiveMonthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  principalSharePercent: number;
  interestSharePercent: number;
  interestSavedWithExtra: number;
  monthsSavedWithExtra: number;
  actualPayoffMonths: number;
  monthlySchedule: MonthlyAmortizationRow[];
  yearlySchedule: YearlyAmortizationRow[];
}

export function calculateLoanAmortization(
  principalInput: number,
  annualRatePercent: number,
  termMonthsInput: number,
  extraMonthlyInput = 0
): LoanCalculationSummary {
  const principal = Math.max(0, Number.isFinite(principalInput) ? principalInput : 0);
  const annualRate = Math.max(0, Number.isFinite(annualRatePercent) ? annualRatePercent : 0);
  const totalMonths = Math.max(1, Math.min(600, Math.round(termMonthsInput || 1)));
  const extraMonthlyPayment = Math.max(0, Number.isFinite(extraMonthlyInput) ? extraMonthlyInput : 0);

  if (principal === 0) {
    return {
      principal: 0,
      annualRate,
      totalMonths,
      extraMonthlyPayment,
      baseMonthlyPayment: 0,
      effectiveMonthlyPayment: 0,
      totalPayment: 0,
      totalInterest: 0,
      principalSharePercent: 100,
      interestSharePercent: 0,
      interestSavedWithExtra: 0,
      monthsSavedWithExtra: 0,
      actualPayoffMonths: 0,
      monthlySchedule: [],
      yearlySchedule: []
    };
  }

  const monthlyRate = annualRate / 100 / 12;

  let baseMonthlyPayment = 0;
  if (monthlyRate === 0) {
    baseMonthlyPayment = principal / totalMonths;
  } else {
    const factor = Math.pow(1 + monthlyRate, totalMonths);
    baseMonthlyPayment = (principal * (monthlyRate * factor)) / (factor - 1);
  }

  // Baseline total interest (without extra payment)
  const baselineTotalPayment = baseMonthlyPayment * totalMonths;
  const baselineTotalInterest = Math.max(0, baselineTotalPayment - principal);

  // Build actual schedule with optional extraMonthlyPayment
  const monthlySchedule: MonthlyAmortizationRow[] = [];
  let balance = principal;
  let cumulativeInterest = 0;
  let cumulativePrincipal = 0;
  let month = 0;

  while (balance > 0.005 && month < totalMonths) {
    month++;
    const year = Math.ceil(month / 12);
    const interestForMonth = balance * monthlyRate;
    let scheduledPrincipal = baseMonthlyPayment - interestForMonth;
    if (scheduledPrincipal < 0) scheduledPrincipal = 0;

    let extra = extraMonthlyPayment;
    if (scheduledPrincipal + extra > balance) {
      if (scheduledPrincipal >= balance) {
        scheduledPrincipal = balance;
        extra = 0;
      } else {
        extra = balance - scheduledPrincipal;
      }
    }

    const totalPrincipalForMonth = scheduledPrincipal + extra;
    const actualPayment = interestForMonth + totalPrincipalForMonth;
    balance = Math.max(0, balance - totalPrincipalForMonth);

    cumulativeInterest += interestForMonth;
    cumulativePrincipal += totalPrincipalForMonth;

    monthlySchedule.push({
      month,
      year,
      payment: actualPayment,
      principal: totalPrincipalForMonth,
      interest: interestForMonth,
      extraPayment: extra,
      balance,
      cumulativeInterest,
      cumulativePrincipal
    });
  }

  // Aggregate by year
  const yearlyMap = new Map<number, YearlyAmortizationRow>();
  for (const row of monthlySchedule) {
    const existing = yearlyMap.get(row.year);
    if (!existing) {
      yearlyMap.set(row.year, {
        year: row.year,
        totalPayment: row.payment,
        principalPaid: row.principal,
        interestPaid: row.interest,
        endingBalance: row.balance,
        equityPercent: principal > 0 ? (row.cumulativePrincipal / principal) * 100 : 100
      });
    } else {
      existing.totalPayment += row.payment;
      existing.principalPaid += row.principal;
      existing.interestPaid += row.interest;
      existing.endingBalance = row.balance;
      existing.equityPercent =
        principal > 0 ? (row.cumulativePrincipal / principal) * 100 : 100;
    }
  }

  const yearlySchedule = Array.from(yearlyMap.values());
  const totalInterest = cumulativeInterest;
  const totalPayment = principal + totalInterest;

  const principalSharePercent = totalPayment > 0 ? (principal / totalPayment) * 100 : 100;
  const interestSharePercent = totalPayment > 0 ? (totalInterest / totalPayment) * 100 : 0;

  const interestSavedWithExtra = Math.max(0, baselineTotalInterest - totalInterest);
  const monthsSavedWithExtra = Math.max(0, totalMonths - monthlySchedule.length);

  return {
    principal,
    annualRate,
    totalMonths,
    extraMonthlyPayment,
    baseMonthlyPayment,
    effectiveMonthlyPayment: baseMonthlyPayment + extraMonthlyPayment,
    totalPayment,
    totalInterest,
    principalSharePercent,
    interestSharePercent,
    interestSavedWithExtra,
    monthsSavedWithExtra,
    actualPayoffMonths: monthlySchedule.length,
    monthlySchedule,
    yearlySchedule
  };
}

export function formatCurrency(amount: number, currencySymbol = '$', decimals = 2): string {
  if (!Number.isFinite(amount)) return `${currencySymbol}0.00`;
  return (
    currencySymbol +
    amount.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })
  );
}

export function generateAmortizationCsv(summary: LoanCalculationSummary): string {
  const headers = [
    'Month',
    'Year',
    'Payment',
    'Principal Paid',
    'Interest Paid',
    'Extra Payment',
    'Remaining Balance',
    'Cumulative Interest'
  ];
  const lines = [headers.join(',')];
  for (const r of summary.monthlySchedule) {
    lines.push(
      [
        r.month,
        r.year,
        r.payment.toFixed(2),
        r.principal.toFixed(2),
        r.interest.toFixed(2),
        r.extraPayment.toFixed(2),
        r.balance.toFixed(2),
        r.cumulativeInterest.toFixed(2)
      ].join(',')
    );
  }
  return lines.join('\n');
}
