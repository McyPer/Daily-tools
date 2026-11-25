// ==========================================================================
// KINETIC // BI-DIRECTIONAL UNIT CONVERSION ENGINE
// ==========================================================================

export type UnitCategoryId =
  | 'length'
  | 'weight'
  | 'temperature'
  | 'data'
  | 'volume'
  | 'area'
  | 'speed';

export interface UnitDefinition {
  id: string;
  name: string;
  symbol: string;
  toBaseFactor: number; // For linear conversions: 1 unit = X base units
}

export interface UnitCategorySpec {
  id: UnitCategoryId;
  label: string;
  code: string;
  baseUnitId: string;
  defaultFrom: string;
  defaultTo: string;
  presets: { label: string; value: number; from: string; to: string }[];
  units: UnitDefinition[];
}

export const UNIT_CATEGORIES: UnitCategorySpec[] = [
  {
    id: 'length',
    label: 'Length & Distance',
    code: 'LEN',
    baseUnitId: 'm',
    defaultFrom: 'm',
    defaultTo: 'ft',
    presets: [
      { label: '100 Meters → Feet', value: 100, from: 'm', to: 'ft' },
      { label: 'Marathon (42.195 km → mi)', value: 42.195, from: 'km', to: 'mi' },
      { label: '1 Inch → Millimeters', value: 1, from: 'in', to: 'mm' },
      { label: '6 Feet → Centimeters', value: 6, from: 'ft', to: 'cm' }
    ],
    units: [
      { id: 'mm', name: 'Millimeter', symbol: 'mm', toBaseFactor: 0.001 },
      { id: 'cm', name: 'Centimeter', symbol: 'cm', toBaseFactor: 0.01 },
      { id: 'm', name: 'Meter', symbol: 'm', toBaseFactor: 1 },
      { id: 'km', name: 'Kilometer', symbol: 'km', toBaseFactor: 1000 },
      { id: 'in', name: 'Inch', symbol: 'in', toBaseFactor: 0.0254 },
      { id: 'ft', name: 'Foot', symbol: 'ft', toBaseFactor: 0.3048 },
      { id: 'yd', name: 'Yard', symbol: 'yd', toBaseFactor: 0.9144 },
      { id: 'mi', name: 'Mile', symbol: 'mi', toBaseFactor: 1609.344 },
      { id: 'nmi', name: 'Nautical Mile', symbol: 'nmi', toBaseFactor: 1852 }
    ]
  },
  {
    id: 'weight',
    label: 'Weight & Mass',
    code: 'MAS',
    baseUnitId: 'kg',
    defaultFrom: 'kg',
    defaultTo: 'lb',
    presets: [
      { label: '75 kg → Pounds', value: 75, from: 'kg', to: 'lb' },
      { label: '16 Ounces → Grams', value: 16, from: 'oz', to: 'g' },
      { label: '1 Metric Ton → lbs', value: 1, from: 't', to: 'lb' },
      { label: '14 Stone → kg', value: 14, from: 'st', to: 'kg' }
    ],
    units: [
      { id: 'mg', name: 'Milligram', symbol: 'mg', toBaseFactor: 0.000001 },
      { id: 'g', name: 'Gram', symbol: 'g', toBaseFactor: 0.001 },
      { id: 'kg', name: 'Kilogram', symbol: 'kg', toBaseFactor: 1 },
      { id: 't', name: 'Metric Ton', symbol: 't', toBaseFactor: 1000 },
      { id: 'oz', name: 'Ounce', symbol: 'oz', toBaseFactor: 0.028349523125 },
      { id: 'lb', name: 'Pound', symbol: 'lb', toBaseFactor: 0.45359237 },
      { id: 'st', name: 'Stone', symbol: 'st', toBaseFactor: 6.35029318 }
    ]
  },
  {
    id: 'temperature',
    label: 'Temperature',
    code: 'TMP',
    baseUnitId: 'c',
    defaultFrom: 'c',
    defaultTo: 'f',
    presets: [
      { label: 'Water Boiling (100 °C → °F)', value: 100, from: 'c', to: 'f' },
      { label: 'Room Temp (22 °C → °F)', value: 22, from: 'c', to: 'f' },
      { label: 'Body Temp (98.6 °F → °C)', value: 98.6, from: 'f', to: 'c' },
      { label: 'Absolute Zero (0 K → °C)', value: 0, from: 'k', to: 'c' }
    ],
    units: [
      { id: 'c', name: 'Celsius', symbol: '°C', toBaseFactor: 1 },
      { id: 'f', name: 'Fahrenheit', symbol: '°F', toBaseFactor: 1 },
      { id: 'k', name: 'Kelvin', symbol: 'K', toBaseFactor: 1 },
      { id: 'r', name: 'Rankine', symbol: '°R', toBaseFactor: 1 }
    ]
  },
  {
    id: 'data',
    label: 'Digital Storage',
    code: 'DAT',
    baseUnitId: 'byte',
    defaultFrom: 'gb',
    defaultTo: 'mb',
    presets: [
      { label: '16 GB → Megabytes', value: 16, from: 'gb', to: 'mb' },
      { label: '2 TB → Gigabytes', value: 2, from: 'tb', to: 'gb' },
      { label: '100 MB → Megabits', value: 100, from: 'mb', to: 'bit' },
      { label: '1 PB → Terabytes', value: 1, from: 'pb', to: 'tb' }
    ],
    units: [
      { id: 'bit', name: 'Bit', symbol: 'b', toBaseFactor: 0.125 },
      { id: 'byte', name: 'Byte', symbol: 'B', toBaseFactor: 1 },
      { id: 'kb', name: 'Kilobyte (1024 B)', symbol: 'KB', toBaseFactor: 1024 },
      { id: 'mb', name: 'Megabyte (1024 KB)', symbol: 'MB', toBaseFactor: Math.pow(1024, 2) },
      { id: 'gb', name: 'Gigabyte (1024 MB)', symbol: 'GB', toBaseFactor: Math.pow(1024, 3) },
      { id: 'tb', name: 'Terabyte (1024 GB)', symbol: 'TB', toBaseFactor: Math.pow(1024, 4) },
      { id: 'pb', name: 'Petabyte (1024 TB)', symbol: 'PB', toBaseFactor: Math.pow(1024, 5) }
    ]
  },
  {
    id: 'volume',
    label: 'Volume & Capacity',
    code: 'VOL',
    baseUnitId: 'l',
    defaultFrom: 'l',
    defaultTo: 'gal',
    presets: [
      { label: '1 US Gallon → Liters', value: 1, from: 'gal', to: 'l' },
      { label: '500 mL → US Fluid Oz', value: 500, from: 'ml', to: 'floz' },
      { label: '2 Cups → Milliliters', value: 2, from: 'cup', to: 'ml' },
      { label: '1 Cubic Meter → Gallons', value: 1, from: 'm3', to: 'gal' }
    ],
    units: [
      { id: 'ml', name: 'Milliliter', symbol: 'mL', toBaseFactor: 0.001 },
      { id: 'l', name: 'Liter', symbol: 'L', toBaseFactor: 1 },
      { id: 'm3', name: 'Cubic Meter', symbol: 'm³', toBaseFactor: 1000 },
      { id: 'tsp', name: 'US Teaspoon', symbol: 'tsp', toBaseFactor: 0.00492892159 },
      { id: 'tbsp', name: 'US Tablespoon', symbol: 'tbsp', toBaseFactor: 0.0147867648 },
      { id: 'floz', name: 'US Fluid Ounce', symbol: 'fl oz', toBaseFactor: 0.0295735296 },
      { id: 'cup', name: 'US Cup', symbol: 'cup', toBaseFactor: 0.2365882365 },
      { id: 'pt', name: 'US Pint', symbol: 'pt', toBaseFactor: 0.473176473 },
      { id: 'qt', name: 'US Quart', symbol: 'qt', toBaseFactor: 0.946352946 },
      { id: 'gal', name: 'US Gallon', symbol: 'gal', toBaseFactor: 3.785411784 }
    ]
  },
  {
    id: 'area',
    label: 'Area & Land',
    code: 'ARE',
    baseUnitId: 'm2',
    defaultFrom: 'm2',
    defaultTo: 'ft2',
    presets: [
      { label: '120 m² Apartment → sq ft', value: 120, from: 'm2', to: 'ft2' },
      { label: '1 Acre → Square Meters', value: 1, from: 'ac', to: 'm2' },
      { label: '1 Hectare → Acres', value: 1, from: 'ha', to: 'ac' }
    ],
    units: [
      { id: 'mm2', name: 'Square Millimeter', symbol: 'mm²', toBaseFactor: 0.000001 },
      { id: 'cm2', name: 'Square Centimeter', symbol: 'cm²', toBaseFactor: 0.0001 },
      { id: 'm2', name: 'Square Meter', symbol: 'm²', toBaseFactor: 1 },
      { id: 'ha', name: 'Hectare', symbol: 'ha', toBaseFactor: 10000 },
      { id: 'km2', name: 'Square Kilometer', symbol: 'km²', toBaseFactor: 1000000 },
      { id: 'in2', name: 'Square Inch', symbol: 'in²', toBaseFactor: 0.00064516 },
      { id: 'ft2', name: 'Square Foot', symbol: 'ft²', toBaseFactor: 0.09290304 },
      { id: 'yd2', name: 'Square Yard', symbol: 'yd²', toBaseFactor: 0.83612736 },
      { id: 'ac', name: 'Acre', symbol: 'ac', toBaseFactor: 4046.8564224 },
      { id: 'mi2', name: 'Square Mile', symbol: 'mi²', toBaseFactor: 2589988.110336 }
    ]
  },
  {
    id: 'speed',
    label: 'Velocity & Speed',
    code: 'SPD',
    baseUnitId: 'ms',
    defaultFrom: 'kmh',
    defaultTo: 'mph',
    presets: [
      { label: '100 km/h → mph', value: 100, from: 'kmh', to: 'mph' },
      { label: '60 mph → km/h', value: 60, from: 'mph', to: 'kmh' },
      { label: 'Mach 1 → km/h', value: 1, from: 'mach', to: 'kmh' }
    ],
    units: [
      { id: 'ms', name: 'Meters per second', symbol: 'm/s', toBaseFactor: 1 },
      { id: 'kmh', name: 'Kilometers per hour', symbol: 'km/h', toBaseFactor: 0.2777777778 },
      { id: 'mph', name: 'Miles per hour', symbol: 'mph', toBaseFactor: 0.44704 },
      { id: 'kn', name: 'Knot (Nautical)', symbol: 'kn', toBaseFactor: 0.5144444444 },
      { id: 'fts', name: 'Feet per second', symbol: 'ft/s', toBaseFactor: 0.3048 },
      { id: 'mach', name: 'Mach (Sea Level)', symbol: 'M', toBaseFactor: 340.29 }
    ]
  }
];

function convertTemperature(value: number, from: string, to: string): number {
  if (from === to) return value;
  // Convert input to Celsius first
  let celsius = value;
  if (from === 'f') celsius = ((value - 32) * 5) / 9;
  else if (from === 'k') celsius = value - 273.15;
  else if (from === 'r') celsius = ((value - 491.67) * 5) / 9;

  // Convert from Celsius to target
  if (to === 'c') return celsius;
  if (to === 'f') return (celsius * 9) / 5 + 32;
  if (to === 'k') return celsius + 273.15;
  if (to === 'r') return ((celsius + 273.15) * 9) / 5;
  return celsius;
}

export function convertUnitValue(
  value: number,
  categoryId: UnitCategoryId,
  fromUnitId: string,
  toUnitId: string
): number {
  if (!Number.isFinite(value)) return 0;
  if (fromUnitId === toUnitId) return value;

  if (categoryId === 'temperature') {
    return convertTemperature(value, fromUnitId, toUnitId);
  }

  const category = UNIT_CATEGORIES.find((c) => c.id === categoryId);
  if (!category) return value;

  const fromUnit = category.units.find((u) => u.id === fromUnitId);
  const toUnit = category.units.find((u) => u.id === toUnitId);
  if (!fromUnit || !toUnit) return value;

  const valueInBase = value * fromUnit.toBaseFactor;
  return valueInBase / toUnit.toBaseFactor;
}

export function formatConvertedNumber(val: number, precision = 4): string {
  if (!Number.isFinite(val)) return '0';
  if (val === 0) return '0';
  const abs = Math.abs(val);
  if (abs >= 1e9 || (abs > 0 && abs < Math.pow(10, -precision))) {
    return val.toExponential(precision);
  }
  return Number(val.toFixed(precision)).toString();
}

export function getConversionFormula(
  categoryId: UnitCategoryId,
  fromUnitId: string,
  toUnitId: string
): string {
  if (categoryId === 'temperature') {
    const key = `${fromUnitId}->${toUnitId}`;
    const map: Record<string, string> = {
      'c->f': '°F = (°C × 9/5) + 32',
      'f->c': '°C = (°F − 32) × 5/9',
      'c->k': 'K = °C + 273.15',
      'k->c': '°C = K − 273.15',
      'f->k': 'K = (°F − 32) × 5/9 + 273.15',
      'k->f': '°F = (K − 273.15) × 9/5 + 32'
    };
    return map[key] || `Convert via Celsius base point (0 °C = 273.15 K)`;
  }

  const category = UNIT_CATEGORIES.find((c) => c.id === categoryId);
  if (!category) return '';
  const fromUnit = category.units.find((u) => u.id === fromUnitId);
  const toUnit = category.units.find((u) => u.id === toUnitId);
  if (!fromUnit || !toUnit) return '';

  const factor = fromUnit.toBaseFactor / toUnit.toBaseFactor;
  return `1 ${fromUnit.symbol} = ${formatConvertedNumber(factor, 6)} ${toUnit.symbol}`;
}
