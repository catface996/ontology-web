/**
 * Authentication utilities.
 *
 * Token and user profile are persisted in localStorage so they survive page
 * refreshes.  The API calls go through the unified request layer which
 * automatically handles gateway errors and token injection.
 */

import { post, type ApiResponse } from './request';

// ---------------------------------------------------------------------------
// Storage keys
// ---------------------------------------------------------------------------

const TOKEN_KEY = 'ontology_token';
const USER_KEY = 'ontology_user';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AuthUser {
  userId: number;
  username: string;
  nickname: string;
  role: string;
}

export interface LoginParams {
  username: string;
  password: string;
}

/** Shape returned by the POST /login endpoint's `data` field */
interface LoginResponseData {
  token: string;
  userId: number;
  username: string;
  nickname: string;
  role: string;
}

// ---------------------------------------------------------------------------
// Token helpers
// ---------------------------------------------------------------------------

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// ---------------------------------------------------------------------------
// User helpers
// ---------------------------------------------------------------------------

export function getUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

function setUser(user: AuthUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearUser(): void {
  localStorage.removeItem(USER_KEY);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function isAuthenticated(): boolean {
  return getToken() !== null;
}

/**
 * Call the login endpoint and persist the returned token + user info.
 *
 * @returns The authenticated user profile.
 * @throws  {RequestError} on network / gateway / business errors.
 */
export async function login(params: LoginParams): Promise<AuthUser> {
  const res: ApiResponse<LoginResponseData> = await post<LoginResponseData>(
    '/auth/api/v1/public/auth/login',
    params,
    { skipAuth: true },
  );

  const { token, userId, username, nickname, role } = res.data;

  setToken(token);
  const user: AuthUser = { userId, username, nickname, role };
  setUser(user);

  return user;
}

/**
 * Call the logout endpoint and clear local auth state.
 *
 * The request is fire-and-forget: even if the backend call fails we still
 * clear the local token so the user is effectively logged out.
 */
export async function logout(): Promise<void> {
  try {
    await post('/auth/api/v1/public/auth/logout');
  } catch {
    // Ignore – we clear locally regardless
  } finally {
    clearToken();
    clearUser();
  }
}

/**
 * Clear all auth state without calling the backend.
 * Used internally by the request layer on token expiry.
 */
export function clearAuth(): void {
  clearToken();
  clearUser();
}
