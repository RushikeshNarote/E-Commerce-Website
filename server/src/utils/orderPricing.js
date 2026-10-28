export function calculateOrderPricing(subtotalInr, paymentMethod) {
  if (!Number.isSafeInteger(subtotalInr) || subtotalInr < 1) {
    throw new RangeError("Order subtotal must be a positive whole number of rupees.");
  }
  if (paymentMethod !== "COD" && paymentMethod !== "ONLINE") {
    throw new TypeError("Payment method must be COD or ONLINE.");
  }
  const codFeeInr = paymentMethod === "COD" ? 40 : 0;
  const onlineDiscountInr =
    paymentMethod === "ONLINE" && subtotalInr > 100 ? 30 : 0;
  return {
    codFeeInr,
    onlineDiscountInr,
    totalInr: Math.max(0, subtotalInr + codFeeInr - onlineDiscountInr),
  };
}
