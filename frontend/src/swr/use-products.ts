import { useCustomSWR } from "@/src/swr/use-custom-swr";
import { Product } from "@/src/types";

export function useProducts(
  params: {
    q?: string;
    mine?: boolean;
    minPrice?: string;
    maxPrice?: string;
    ordering?: string;
  } = {},
) {
  const search = new URLSearchParams();
  if (params.q) search.set("search", params.q);
  if (params.minPrice) search.set("min_price", params.minPrice);
  if (params.maxPrice) search.set("max_price", params.maxPrice);
  if (params.ordering) search.set("ordering", params.ordering);
  const suffix = search.toString() ? `?${search.toString()}` : "";
  const basePath = params.mine ? "/api/products/" : "/api/marketplace/";
  return useCustomSWR<Product[]>(`${basePath}${suffix}`);
}
