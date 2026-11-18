/** 350000 → "₹3,500" (paise to rupees, Indian digit grouping, no decimals when whole). */
export function formatRupees(paise: number): string {
  const rupees = paise / 100;
  return `₹${rupees.toLocaleString('en-IN', { maximumFractionDigits: Number.isInteger(rupees) ? 0 : 2 })}`;
}

/** Approximate price per class, e.g. ₹2000 for 2×/week over 30 days → "₹233". */
export function perClassPrice(pricePaise: number, classesPerWeek: number, durationDays: number): string {
  const classes = classesPerWeek * (durationDays / 7);
  return formatRupees(Math.round(pricePaise / classes / 100) * 100);
}
