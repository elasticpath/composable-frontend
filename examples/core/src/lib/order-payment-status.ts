export function paymentStatusLabel(
  payment: string | undefined,
): string | undefined {
  if (!payment) return undefined;
  if (payment === "unpaid") return "Payment pending";
  const spaced = payment.replaceAll("_", " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}
