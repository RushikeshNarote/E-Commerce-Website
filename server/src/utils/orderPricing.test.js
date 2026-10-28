import assert from "node:assert/strict";
import test from "node:test";
import { calculateOrderPricing } from "./orderPricing.js";

test("online discount uses the pre-discount item subtotal and strict threshold", () => {
  assert.deepEqual(calculateOrderPricing(100, "ONLINE"), {
    codFeeInr: 0,
    onlineDiscountInr: 0,
    totalInr: 100,
  });
  assert.deepEqual(calculateOrderPricing(101, "ONLINE"), {
    codFeeInr: 0,
    onlineDiscountInr: 30,
    totalInr: 71,
  });
  assert.deepEqual(calculateOrderPricing(500, "ONLINE"), {
    codFeeInr: 0,
    onlineDiscountInr: 30,
    totalInr: 470,
  });
});

test("COD fee applies once and online discount never applies to COD", () => {
  assert.deepEqual(calculateOrderPricing(100, "COD"), {
    codFeeInr: 40,
    onlineDiscountInr: 0,
    totalInr: 140,
  });
  assert.deepEqual(calculateOrderPricing(3000, "COD"), {
    codFeeInr: 40,
    onlineDiscountInr: 0,
    totalInr: 3040,
  });
});

test("rejects fractional, nonpositive, unsafe subtotals and invalid methods", () => {
  assert.throws(() => calculateOrderPricing(0, "COD"), RangeError);
  assert.throws(() => calculateOrderPricing(100.5, "ONLINE"), RangeError);
  assert.throws(() => calculateOrderPricing(Number.MAX_SAFE_INTEGER + 1, "ONLINE"), RangeError);
  assert.throws(() => calculateOrderPricing(101, "CARD"), TypeError);
});
