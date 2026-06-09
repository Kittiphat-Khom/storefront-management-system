import { Product } from "@/src/types";

export function formatPrice(value: string | number) {
  return Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function decorateProduct(product: Product) {
  return {
    ...product,
    displayPrice: `${formatPrice(product.unit_price)}฿`,
    displayStock:
      product.available_quantity > 0
        ? `${product.available_quantity} available`
        : "Out of stock",
  };
}

