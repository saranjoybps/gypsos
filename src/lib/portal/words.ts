const ONES = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function below1000(n: number): string {
  const parts: string[] = [];
  if (n >= 100) {
    parts.push(`${ONES[Math.floor(n / 100)]} Hundred`);
    n %= 100;
  }
  if (n >= 20) {
    parts.push(TENS[Math.floor(n / 10)] + (n % 10 ? ` ${ONES[n % 10]}` : ""));
  } else if (n > 0) {
    parts.push(ONES[n]);
  }
  return parts.join(" ");
}

/** Indian numbering (lakh / crore) amount in words, e.g. "Rupees One Thousand Two Hundred Only". */
export function rupeesInWords(amount: number): string {
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);
  const chunks: [number, string][] = [
    [Math.floor(rupees / 10_000_000), "Crore"],
    [Math.floor((rupees % 10_000_000) / 100_000), "Lakh"],
    [Math.floor((rupees % 100_000) / 1000), "Thousand"],
    [rupees % 1000, ""],
  ];
  const words = chunks
    .filter(([n]) => n > 0)
    .map(([n, unit]) => `${below1000(n)}${unit ? ` ${unit}` : ""}`)
    .join(" ");
  const main = `Rupees ${words || "Zero"}`;
  return paise > 0 ? `${main} and ${below1000(paise)} Paise Only` : `${main} Only`;
}
