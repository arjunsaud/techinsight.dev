import { getPublicEnv } from "@/lib/env";

type Method = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

interface RequestOptions {
  method?: Method;
  body?: unknown;
  accessToken?: string;
  query?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
}

const API_FUNCTION_NAME = "api";

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const env = getPublicEnv();
  const normalizedPath = path.replace(/^\/+/, "");
  const url = new URL(
    `${env.supabaseUrl}/functions/v1/${API_FUNCTION_NAME}/${normalizedPath}`,
  );

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === "") {
        return;
      }
      url.searchParams.set(key, String(value));
    });
  }

  return url.toString();
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const env = getPublicEnv();

  const response = await fetch(buildUrl(path, options.query), {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      apikey: env.supabaseAnonKey,
      ...(options.accessToken ? { Authorization: `Bearer ${options.accessToken}` } : {}),
      ...(options.headers ?? {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store"
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Request failed");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
