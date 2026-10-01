/**
 * One place that knows how to talk to the REST API.
 * Every screen uses `apiGet` / `apiSend` so cookie handling,
 * error shapes and auth redirects are never repeated.
 */

// By default requests go to "/api/...", which Next.js rewrites to the Express
// server (see next.config.ts). That keeps the browser on a single origin, so the
// httpOnly session cookie is first party and CORS never gets in the way.
// Set NEXT_PUBLIC_API_URL to call the API directly instead.
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export class ApiError extends Error {
  status: number;
  details?: { field: string; message: string }[];

  constructor(status: number, message: string, details?: { field: string; message: string }[]) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

type Options = Omit<RequestInit, 'body'> & { body?: unknown; auth?: boolean };

async function request<T>(path: string, { body, auth = true, ...options }: Options = {}): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
    body: body === undefined ? undefined : JSON.stringify(body),
    // Sends the httpOnly cookie on every call.
    credentials: 'include',
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    // The session is gone: send the user back to the login screen.
    if (auth && response.status === 401 && typeof window !== 'undefined') {
      if (window.location.pathname !== '/login') window.location.replace('/login');
    }
    throw new ApiError(response.status, payload.message || 'Request failed', payload.details);
  }

  return payload as T;
}

export const apiGet = <T,>(path: string, signal?: AbortSignal) => request<T>(path, { signal });
export const apiPost = <T,>(path: string, body: unknown) => request<T>(path, { method: 'POST', body });
export const apiPut = <T,>(path: string, body: unknown) => request<T>(path, { method: 'PUT', body });
export const apiDelete = <T,>(path: string) => request<T>(path, { method: 'DELETE' });

/** Turns filter state into a query string, skipping empty values. */
export function toQueryString(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '' && value !== null) search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : '';
}
