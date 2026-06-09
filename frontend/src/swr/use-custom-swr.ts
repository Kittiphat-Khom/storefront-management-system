import { apiFetch } from "@/src/helpers/api";
import { useAuth } from "@/src/hooks/use-auth";
import useSWR from "swr";

export function useCustomSWR<T>(path: string | null) {
  const { accessToken } = useAuth();
  const key: [string, string] | null = accessToken && path ? [path, accessToken] : null;

  return useSWR<T, Error, [string, string] | null>(
    key,
    ([url, token]) => apiFetch<T>(url, { token }),
    {
      revalidateOnFocus: false,
      revalidateOnMount: true,
    },
  );
}
