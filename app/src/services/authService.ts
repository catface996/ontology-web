/**
 * Auth-service API calls.
 *
 * All paths go through the Gateway at /auth/api/v1/... (with /auth/ service prefix).
 * The gateway strips the first path segment (/auth/) before forwarding to the auth service.
 */

import { get, post, type ApiResponse } from '../utils/request';

// ---------------------------------------------------------------------------
// Types (aligned with backend DTOs)
// ---------------------------------------------------------------------------

export interface UserDTO {
  id: number;
  username: string;
  nickname: string;
  role: string;
  status: string;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PageResult<T> {
  current: number;
  size: number;
  total: number;
  pages: number;
  records: T[];
}

export interface ListUserRequest {
  page?: number;
  size?: number;
  username?: string;
  role?: string;
  status?: string;
}

export interface RegisterRequest {
  username: string;
  email?: string;
  password: string;
  nickname?: string;
}

export interface UserInfoDTO {
  id: number;
  username: string;
  email: string;
  nickname: string;
  role: string;
}

// ---------------------------------------------------------------------------
// Auth APIs
// ---------------------------------------------------------------------------

export function register(params: RegisterRequest): Promise<ApiResponse<null>> {
  return post<null>('/auth/api/v1/public/auth/register', params, { skipAuth: true });
}

// ---------------------------------------------------------------------------
// Current user APIs (MeController)
// ---------------------------------------------------------------------------

/** Fetch current user profile */
export function fetchCurrentUser(): Promise<ApiResponse<UserInfoDTO>> {
  return get<UserInfoDTO>('/auth/api/v1/me');
}

// ---------------------------------------------------------------------------
// User management APIs (UserController)
// ---------------------------------------------------------------------------

/** List users (admin) */
export function fetchUsers(params: ListUserRequest = {}): Promise<ApiResponse<PageResult<UserDTO>>> {
  return post<PageResult<UserDTO>>('/auth/api/v1/public/auth/user/list', params);
}

// Pre-wired — backend not yet implemented
export function fetchUserDetail(id: number): Promise<ApiResponse<UserDTO>> {
  return post<UserDTO>('/auth/api/v1/public/auth/user/get', { id });
}

export function updateUser(params: { id: number; nickname?: string; role?: string; status?: string }): Promise<ApiResponse<UserDTO>> {
  return post<UserDTO>('/auth/api/v1/public/auth/user/update', params);
}

export function deleteUser(id: number): Promise<ApiResponse<null>> {
  return post<null>('/auth/api/v1/public/auth/user/delete', { id });
}
