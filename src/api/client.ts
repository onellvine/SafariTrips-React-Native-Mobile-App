import * as SecureStore from "expo-secure-store";
import { API_URL } from "../config";

const ACCESS = "access_token";
const REFRESH = "refresh_token";

export class ApiError extends Error {
  constructor(
    public status: number,
    public data: any,
    message: string,
  ) {
    super(message);
  }
}

/** Readable message for any thrown error (DRF payloads are flattened in ApiError). */
export function describeError(e: unknown): string {
  if (e instanceof ApiError) return e.message;

  return (e as Error)?.message?.includes("Network")
    ? "Cannot reach the server. Check your connection."
    : "Something went wrong.";
}

function flatten(data: any): string {
  if (!data) return "Request failed.";
  if (typeof data === "string") return data;
  if (data.detail) return String(data.detail);
  return Object.entries(data)
    .map(([k, v]) => {
      const msg = Array.isArray(v)
        ? v.join(" ")
        : typeof v === "object"
          ? flatten(v)
          : String(v);
      return k === "non_field_errors" ? msg : `${k.replace(/_/g, " ")}: ${msg}`;
    })
    .join("\n");
}

let onSessionExpired: (() => void) | undefined;
export const setSessionExpiredHandler = (fn: () => void) => {
  onSessionExpired = fn;
};

export const tokens = {
  get: () => SecureStore.getItemAsync(ACCESS),
  async set(access: string, refresh?: string) {
    await SecureStore.setItemAsync(ACCESS, access);
    if (refresh) await SecureStore.setItemAsync(REFRESH, refresh);
  },
  async clear() {
    await SecureStore.deleteItemAsync(ACCESS);
    await SecureStore.deleteItemAsync(REFRESH);
  },
};

let refreshing: Promise<boolean> | null = null;
async function refreshAccess(): Promise<boolean> {
  refreshing ??= (async () => {
    const refresh = await SecureStore.getItemAsync(REFRESH);
    if (!refresh) return false;
    try {
      const r = await fetch(`${API_URL}/auth/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      });
      if (!r.ok) return false;
      const d = await r.json();
      await tokens.set(d.access, d.refresh);
      return true;
    } catch {
      return false;
    }
  })().finally(() => {
    refreshing = null;
  });
  return refreshing;
}

type Query = Record<string, string | number | boolean | undefined | null>;

export async function api<T>(
  path: string,
  opts: { method?: string; body?: unknown; query?: Query; auth?: boolean } = {},
  retry = true,
): Promise<T> {
  const qs = opts.query
    ? "?" +
      Object.entries(opts.query)
        .filter(([, v]) => v !== undefined && v !== null && v !== "")
        .map(
          ([k, v]) =>
            `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`,
        )
        .join("&")
    : "";
  const headers: Record<string, string> = { Accept: "application/json" };
  if (opts.body !== undefined) {
    const hasFile =
      (opts.body as any)?.cover_image != null ||
      (opts.body as any)?.poster_image != null;

    if (hasFile) {
      // Convert JSON -> FormData
      const form = new FormData();
      const body = opts.body as any;

      for (const key in body) {
        const value = body[key];

        if ((key === "cover_image" || key === "poster_image") && value) {
          // value is a local uri string like file://... or an expo File
          // If it's already a File instance, just append it
          if (typeof value === "object" && value.uri) {
            // old {uri, name, type} object - convert to new File
            const { File } = require("expo-file-system");
            form.append(
              key,
              new File(value.uri),
              value.fileName ?? `${key}.jpg`,
            );
          } else if (typeof value === "string") {
            const { File } = require("expo-file-system");
            form.append(key, new File(value), `${key}.jpg`);
          } else {
            form.append(key, value); // it's already a File
          }
        } else if (value !== null && value !== undefined) {
          form.append(key, String(value));
        }
      }
      opts.body = form;
      // DO NOT SET Content-Type here. Let fetch set boundary.
    } else {
      // Normal JSON request
      headers["Content-Type"] = "application/json";
    }
  }

  const isForm = typeof FormData !== undefined && opts.body instanceof FormData;
  if (opts.body !== undefined && !isForm)
    headers["Content-Type"] = "application/json";

  const token = await tokens.get();
  if (token && opts.auth !== false) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}${qs}`, {
    method: opts.method ?? "GET",
    headers,
    // body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    body:
      opts.body === undefined
        ? undefined
        : isForm
          ? (opts.body as FormData)
          : JSON.stringify(opts.body),
  });

  if (res.status === 401 && retry && token && opts.auth !== false) {
    if (await refreshAccess()) return api<T>(path, opts, false);
    await tokens.clear();
    onSessionExpired?.();
  }
  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, data, flatten(data));
  return data as T;
}
