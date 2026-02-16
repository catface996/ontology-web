/**
 * Unified API request layer built on native fetch.
 *
 * Features:
 *  - Automatic Bearer token injection
 *  - Gateway error code handling (AUTH_001–004, SYS_001–004)
 *  - Backend business error code handling (code !== 0)
 *  - Token expiry → auto redirect to /login
 *  - Exposes X-Request-Id / X-Operator-Id from gateway responses
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Standard backend response envelope */
export interface ApiResponse<T = unknown> {
  code: number | string;
  message: string;
  data: T;
}

/** Extra options on top of native RequestInit */
export interface RequestOptions extends Omit<RequestInit, 'body'> {
  /** Will be JSON-serialised automatically */
  body?: unknown;
  /** Skip Authorization header injection (e.g. for public endpoints) */
  skipAuth?: boolean;
}

/** Typed error thrown by the request layer */
export class RequestError extends Error {
  /** Gateway error code string or backend numeric code */
  code: string | number;
  /** Correlation id returned by the gateway */
  requestId?: string;

  constructor(message: string, code: string | number, requestId?: string) {
    super(message);
    this.name = 'RequestError';
    this.code = code;
    this.requestId = requestId;
  }
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? '';

const TOKEN_KEY = 'ontology_token';

/** Gateway error codes that indicate the token is missing / invalid / expired */
const AUTH_REDIRECT_CODES = new Set(['AUTH_001', 'AUTH_002', 'AUTH_003']);

// ---------------------------------------------------------------------------
// Token helpers (read-only – writing is handled by auth.ts)
// ---------------------------------------------------------------------------

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem('ontology_user');
}

// ---------------------------------------------------------------------------
// Core request function
// ---------------------------------------------------------------------------

async function request<T = unknown>(
  url: string,
  options: RequestOptions = {},
): Promise<ApiResponse<T>> {
  const {
    body,
    skipAuth = false,
    headers: customHeaders,
    ...restInit
  } = options;

  // ---- Build headers ----
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customHeaders as Record<string, string>),
  };

  if (!skipAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  // ---- Build request config ----
  const config: RequestInit = { ...restInit, headers };
  if (body !== undefined) {
    config.body = JSON.stringify(body);
  }

  const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;

  // ---- Execute ----
  let response: Response;
  try {
    response = await fetch(fullUrl, config);
  } catch (err) {
    // Network-level failure (DNS, offline, CORS blocked, etc.)
    throw new RequestError(
      err instanceof Error ? err.message : 'Network error',
      'NETWORK_ERROR',
    );
  }

  // ---- Read gateway headers ----
  const requestId = response.headers.get('X-Request-Id') ?? undefined;

  // ---- Handle HTTP-level errors (4xx / 5xx) ----
  if (!response.ok) {
    let errorBody: Record<string, unknown> | undefined;
    try {
      errorBody = (await response.json()) as Record<string, unknown>;
    } catch {
      // non-JSON body
    }

    const errorCode =
      errorBody?.errorCode ?? errorBody?.code ?? response.status;

    // Gateway auth errors → clear token & redirect
    if (
      AUTH_REDIRECT_CODES.has(String(errorCode)) ||
      response.status === 401
    ) {
      clearToken();
      window.location.href = '/login';
      throw new RequestError(
        (errorBody?.message as string) ?? 'Authentication required',
        errorCode as string | number,
        requestId,
      );
    }

    throw new RequestError(
      (errorBody?.message as string) ?? `HTTP ${response.status}`,
      errorCode as string | number,
      requestId,
    );
  }

  // ---- Parse success body ----
  const data: ApiResponse<T> = await response.json();

  // ---- Check business-level errors ----
  // Backend uses String code: "SUCCESS" for success.
  const isSuccess = data.code === 'SUCCESS' || data.code === 0;
  if (!isSuccess) {
    // 401xxx → auth failure from backend
    if (String(data.code).startsWith('401')) {
      clearToken();
      window.location.href = '/login';
    }

    throw new RequestError(data.message, data.code, requestId);
  }

  return data;
}

// ---------------------------------------------------------------------------
// Convenience HTTP method wrappers
// ---------------------------------------------------------------------------

function get<T = unknown>(url: string, options?: RequestOptions) {
  return request<T>(url, { ...options, method: 'GET' });
}

function post<T = unknown>(url: string, body?: unknown, options?: RequestOptions) {
  return request<T>(url, { ...options, method: 'POST', body });
}

function put<T = unknown>(url: string, body?: unknown, options?: RequestOptions) {
  return request<T>(url, { ...options, method: 'PUT', body });
}

function patch<T = unknown>(url: string, body?: unknown, options?: RequestOptions) {
  return request<T>(url, { ...options, method: 'PATCH', body });
}

function del<T = unknown>(url: string, options?: RequestOptions) {
  return request<T>(url, { ...options, method: 'DELETE' });
}

export default request;
export { get, post, put, patch, del };
