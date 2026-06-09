const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

type ApiOptions = RequestInit & {
  token?: string | null;
  isFormData?: boolean;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function extractErrorMessage(data: unknown): string {
  if (!data || typeof data !== "object") return "Request failed";
  const d = data as Record<string, unknown>;
  for (const key of ["detail", "non_field_errors", "cart", "quantity"]) {
    const val = d[key];
    if (val) return Array.isArray(val) ? String(val[0]) : String(val);
  }
  for (const val of Object.values(d)) {
    if (Array.isArray(val) && val.length > 0) return String(val[0]);
    if (typeof val === "string" && val) return val;
  }
  return "Request failed";
}

export async function apiFetch<T>(path: string, options: ApiOptions = {}) {
  const headers = new Headers(options.headers);
  if (!options.isFormData) {
    headers.set("content-type", "application/json");
  }
  if (options.token) {
    headers.set("authorization", `Bearer ${options.token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });
  const data = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(extractErrorMessage(data), response.status);
  }
  return data as T;
}

export function getMediaUrl(path: string | null) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_BASE_URL}${path}`;
}
