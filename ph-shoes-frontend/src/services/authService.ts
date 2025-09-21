import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosRequestHeaders,
} from 'axios';
import { TokenResponse } from '../types/TokenResponse';
import { AccountMe } from '../types/AccountMe';
import { BackendErrorResponse } from '../types/BackendErrorResponse';
import { RegisterRequest } from '../types/RegisterRequest';

const STORAGE_KEY = 'phshoes.auth.token';

const BASE_URL =
  (import.meta as any).env.VITE_USER_ACCOUNTS_API_BASE_URL 

export const authClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
});

// Attach Bearer automatically
authClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    const headers = (config.headers ?? {}) as AxiosRequestHeaders;
    headers['Authorization'] = `Bearer ${token}`;
    config.headers = headers;
  }
  return config;
});

export function saveToken(token: string) {
  localStorage.setItem(STORAGE_KEY, token);
}
export function getToken(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}
export function clearToken() {
  localStorage.removeItem(STORAGE_KEY);
}

// Decode JWT (base64url) to pull "email" claim as a graceful fallback
function base64UrlDecode(input: string): string {
  const b64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4 === 2 ? '==' : b64.length % 4 === 3 ? '=' : '';
  return atob(b64 + pad);
}
export function decodeJwtEmail(token: string): string | null {
  try {
    const [, payload] = token.split('.');
    const json = JSON.parse(base64UrlDecode(payload));
    return typeof json?.email === 'string' ? json.email : null;
  } catch {
    return null;
  }
}

// --- Auth API ---

export async function login(email: string, password: string): Promise<TokenResponse> {
  // Expects /api/v1/auth/login under the configured base URL
  const { data } = await authClient.post<TokenResponse>('/api/v1/auth/login', { email, password });

  // Accept snake_case or camelCase token fields
  const token =
    (data as any).access_token ??
    (data as any).accessToken ??
    (data as any).token ??
    '';

  if (!token) throw new Error('No access token returned by server.');
  saveToken(token);
  return data;
}

export async function logout(): Promise<void> {
  try {
    await authClient.post('/api/v1/auth/logout');
  } finally {
    clearToken();
  }
}

export async function fetchMe(): Promise<AccountMe> {
  const { data } = await authClient.get<AccountMe>('/api/v1/user-accounts');
  return data;
}

export async function registerAccount(req: RegisterRequest) {
  // Registration lives in the same microservice (user-accounts)
  const { data } = await authClient.post('/api/v1/user-accounts/register', req);
  return data;
}

// --- Error helpers (flatten backend errors to UI-friendly strings) ---

export function extractErrorMessage(e: unknown): string {
  if (axios.isAxiosError(e)) {
    const data = e.response?.data as BackendErrorResponse | undefined;
    if (data?.errors) return Object.values(data.errors).flat().join(' ');
    if (data?.error) return data.error;
  }
  return 'Something went wrong. Please try again.';
}

export function extractFieldErrors(e: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (axios.isAxiosError(e)) {
    const data = e.response?.data as BackendErrorResponse | undefined;
    if (data?.errors) for (const [k, v] of Object.entries(data.errors)) out[k] = v.join(' ');
  }
  return out;
}
