export function rupeesToPaisa(amount: number): number {
  return Math.round(amount * 100);
}

export function paisaToRupees(amount: number): number {
  return amount / 100;
}

export function formatPKR(amountPaisa: number): string {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 2,
  }).format(paisaToRupees(amountPaisa));
}