import { useCustomSWR } from "@/src/swr/use-custom-swr";
import { Cart } from "@/src/types";

export function useCart(enabled = true) {
  return useCustomSWR<Cart>(enabled ? "/api/cart/" : null);
}
