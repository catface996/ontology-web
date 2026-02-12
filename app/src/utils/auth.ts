const AUTH_KEY = 'ontology_auth';

interface AuthUser {
  name: string;
  email: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser;
}

export function login(user: AuthUser): void {
  localStorage.setItem(AUTH_KEY, JSON.stringify({ isAuthenticated: true, user }));
}

export function logout(): void {
  localStorage.removeItem(AUTH_KEY);
}

export function getAuth(): AuthState | null {
  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  const auth = getAuth();
  return auth?.isAuthenticated === true;
}
