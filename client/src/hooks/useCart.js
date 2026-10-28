import { useEffect, useMemo, useState } from "react";
import { products } from "../data/products.js";

const storageKey = "legends-demo-cart-v1";
const productLookup = new Map(products.map((product) => [product.id, product]));

function readCart() {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || "[]");
    if (!Array.isArray(stored)) throw new Error("Saved cart has an invalid format.");

    return {
      error: "",
      items: stored.filter((item) => {
        const product = productLookup.get(item.productId);
        return (
          product &&
          product.availableSizes.includes(Number(item.size)) &&
          Number.isInteger(item.quantity) &&
          item.quantity > 0 &&
          item.quantity <= 10
        );
      }),
    };
  } catch {
    return {
      error: "Saved cart data could not be read. A new demo cart has been started.",
      items: [],
    };
  }
}

export function useCart() {
  const [cart, setCart] = useState(readCart);
  const productById = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [],
  );
  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.items.reduce((sum, item) => {
    const product = productById.get(item.productId);
    return sum + (product?.demoPriceInr || 0) * item.quantity;
  }, 0);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(cart.items));
    } catch {
      setCart((current) => ({
        ...current,
        error: "Cart changes cannot be saved in this browser session.",
      }));
    }
  }, [cart.items]);

  function addItem(product, size, quantity = 1) {
    const selectedSize = Number(size);
    if (
      !product ||
      !product.availableSizes.includes(selectedSize) ||
      product.unavailableSizes.includes(selectedSize) ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 10
    ) {
      setCart((current) => ({
        ...current,
        error: "Choose an available shoe size and a quantity from 1 to 10.",
      }));
      return false;
    }

    setCart((current) => {
      const existing = current.items.findIndex(
        (item) => item.productId === product.id && item.size === selectedSize,
      );
      if (existing < 0) {
        return {
          error: "",
          items: [
            ...current.items,
            { productId: product.id, size: selectedSize, quantity },
          ],
        };
      }

      const items = [...current.items];
      items[existing] = {
        ...items[existing],
        quantity: Math.min(10, items[existing].quantity + quantity),
      };
      return { error: "", items };
    });
    return true;
  }

  function updateQuantity(productId, size, quantity) {
    const nextQuantity = Number(quantity);
    if (!Number.isInteger(nextQuantity) || nextQuantity < 1 || nextQuantity > 10) {
      setCart((current) => ({
        ...current,
        error: "Cart quantities must be between 1 and 10.",
      }));
      return;
    }

    setCart((current) => ({
      error: "",
      items: current.items.map((item) =>
        item.productId === productId && item.size === Number(size)
          ? { ...item, quantity: nextQuantity }
          : item,
      ),
    }));
  }

  function removeItem(productId, size) {
    setCart((current) => ({
      error: "",
      items: current.items.filter(
        (item) => !(item.productId === productId && item.size === Number(size)),
      ),
    }));
  }

  return {
    error: cart.error,
    itemCount,
    items: cart.items,
    subtotal,
    addItem,
    removeItem,
    updateQuantity,
  };
}
