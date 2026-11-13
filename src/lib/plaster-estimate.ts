export type PropertyType = "residential" | "commercial";

/** Business rules supplied by GYPSOS: quantity = sq. ft. x factor; amount = quantity x rate. */
export const RATE_PER_UNIT = 45;
export const FACTOR: Record<PropertyType, number> = { residential: 3.5, commercial: 3 };
/** Cement plaster rate (Rs per unit) used only for the savings comparison. */
export const CEMENT_RATE_PER_UNIT = 65;
export const MAX_AREA = 10_000_000;

export type EstimateResult =
  | { ok: false; error: string }
  | {
      ok: true;
      type: PropertyType;
      area: number;
      factor: number;
      quantity: number;
      rate: number;
      total: number;
      cementRate: number;
      cementTotal: number;
      savings: number;
      /** Saving as a percentage of the cement plaster cost. */
      savingsPercent: number;
    };

const round2 = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

export function estimate(type: PropertyType, rawArea: string): EstimateResult {
  const trimmed = rawArea.replace(/,/g, "").trim();
  if (trimmed === "") return { ok: false, error: "Enter the total area in sq. ft." };
  if (!/^-?\d*\.?\d+$/.test(trimmed)) return { ok: false, error: "Enter the area as a number, for example 1200." };
  const area = Number(trimmed);
  if (!Number.isFinite(area)) return { ok: false, error: "Enter a valid area in sq. ft." };
  if (area < 0) return { ok: false, error: "Area cannot be negative." };
  if (area === 0) return { ok: false, error: "Area must be greater than zero." };
  if (area > MAX_AREA) return { ok: false, error: "That area looks too large. Please enter a realistic area in sq. ft." };

  const factor = FACTOR[type];
  const quantity = round2(area * factor);
  const total = round2(quantity * RATE_PER_UNIT);
  const cementTotal = round2(quantity * CEMENT_RATE_PER_UNIT);
  return {
    ok: true,
    type,
    area,
    factor,
    quantity,
    rate: RATE_PER_UNIT,
    total,
    cementRate: CEMENT_RATE_PER_UNIT,
    cementTotal,
    savings: round2(cementTotal - total),
    savingsPercent: cementTotal > 0 ? round2(((cementTotal - total) / cementTotal) * 100) : 0,
  };
}

export const inr = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2, minimumFractionDigits: Number.isInteger(value) ? 0 : 2 }).format(value);

export const num = (value: number) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(value);
