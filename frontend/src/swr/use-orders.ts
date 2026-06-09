import { useCustomSWR } from "@/src/swr/use-custom-swr";
import { Order } from "@/src/types";

export function useOrders() {
  return useCustomSWR<Order[]>("/api/orders/");
}
