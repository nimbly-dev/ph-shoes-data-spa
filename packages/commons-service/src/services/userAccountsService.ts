import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosRequestHeaders,
  AxiosHeaders,
} from 'axios';
import { TokenResponse } from '../types/TokenResponse';
import { AccountMe } from '../types/AccountMe';
import { BackendErrorResponse } from '../types/BackendErrorResponse';
import { RegisterRequest } from '../types/RegisterRequest';

const STORAGE_KEY = 'phshoes.auth.token';

const RAW_BASE_URL = (import.meta as any).env.VITE_USER_ACCOUNTS_API_BASE_URL;

const normalizeBase = (base: string | undefined): string => {
  if (!base) return '';
  return base.replace(/\/+$/, '');
};

const normalizedBaseUrl = normalizeBase(RAW_BASE_URL);
export const USER_ACCOUNTS_API_BASE_URL: string | undefined = normalizedBaseUrl || undefined;
const BASE_HAS_API_PREFIX = normalizedBaseUrl.endsWith('/api/v1');

const stripDuplicateApiPrefix = (url?: string): string | undefined => {
  if (!url || !BASE_HAS_API_PREFIX) return url;
  if (url === '/api/v1') return '/';
  return url.replace(/^\/api\/v1/, '/');
};

export type SubscriptionStatusResponse = {
  email: string;
  suppressed: boolean;
};

export const authClient: AxiosInstance = axios.create({
  baseURL: normalizedBaseUrl || undefined,
  withCredentials: true,
});

const unauthenticatedClient: AxiosInstance = axios.create({
  baseURL: normalizedBaseUrl || undefined,
  withCredentials: true,
});

unauthenticatedClient.interceptors.request.use((config) => {
  if (typeof config.url === 'string') {
    config.url = stripDuplicateApiPrefix(config.url);
  }
  return config;
});

// Attach Bearer automatically
authClient.interceptors.request.use((config) => {
  if (typeof config.url === 'string') {
    config.url = stripDuplicateApiPrefix(config.url);
  }
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

const FRIENDLY_ERROR_MESSAGES: Record<string, string> = {
  'error.account.notFound': 'We could not find your account. Please refresh or sign in again.',
};

export const ACCOUNT_NOT_FOUND_MESSAGE = FRIENDLY_ERROR_MESSAGES['error.account.notFound'];

function toFriendlyMessage(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  const mapped = FRIENDLY_ERROR_MESSAGES[trimmed];
  if (mapped) return mapped;
  if (!trimmed.includes(' ') && /[_.]/.test(trimmed)) {
    return 'Something went wrong. Please try again.';
  }
  return trimmed;
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
  const token = getToken();
  try {
    if (token) {
      await authClient.post('/api/v1/auth/logout');
    }
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
  const { data } = await authClient.post('/api/v1/user-accounts', req);
  return data;
}

// --- Error helpers (flatten backend errors to UI-friendly strings) ---

export function extractErrorMessage(e: unknown): string {
  if (axios.isAxiosError(e)) {
    const data = e.response?.data as BackendErrorResponse | undefined;
    if (data?.errors) {
      const joined = Object.values(data.errors).flat().join(' ');
      return toFriendlyMessage(joined) ?? joined;
    }
    const candidate =
      (typeof data?.error === 'string' && data.error) ? data.error :
      (typeof data?.message === 'string' && data.message) ? data.message :
      undefined;
    const friendly = toFriendlyMessage(candidate);
    if (friendly) return friendly;
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


const TOKEN_KEYS = [
  'unsubscribeToken',
  'token',
  'unsubscribe_token',
  'unsubscribe-token',
  'suppressionToken',
  'suppression_token',
  'suppression-token',
];

const DEFAULT_SETTINGS_PAYLOAD: Record<string, unknown> = {
  Notification_Email_Preferences: {
    Email_Notifications: true,
  },
};

const readUnsubscribeToken = (data: unknown): string | undefined => {
  if (typeof data === 'string') {
    const trimmed = data.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
  if (!data || typeof data !== 'object') return undefined;

  const record = data as Record<string, unknown>;

  for (const key of TOKEN_KEYS) {
    const candidate = record[key];
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim();
    }
  }

  for (const [key, value] of Object.entries(record)) {
    if (typeof value === 'string' && value.trim() && /token|suppression/i.test(key)) {
      return value.trim();
    }
    if (Array.isArray(value)) {
      for (const entry of value) {
        const nested = readUnsubscribeToken(entry);
        if (nested) return nested;
      }
      continue;
    }
    if (value && typeof value === 'object' && value !== data) {
      const nested = readUnsubscribeToken(value);
      if (nested) return nested;
    }
  }

  return undefined;
};

const coerceBoolean = (value: unknown): boolean | undefined => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') return true;
    if (normalized === 'false') return false;
  }
  return undefined;
};

const readEmailSubscribed = (payload: Record<string, unknown>): boolean => {
  const rootCandidates = [
    payload,
    (payload.settings && typeof payload.settings === 'object' ? (payload.settings as Record<string, unknown>) : undefined),
  ].filter(Boolean) as Record<string, unknown>[];

  for (const root of rootCandidates) {
    const direct = coerceBoolean(root.emailSubscribed);
    if (direct !== undefined) return direct;

    const suppressed = coerceBoolean(root.suppressed);
    if (suppressed !== undefined) return !suppressed;

    const legacy = coerceBoolean(root.EmailNotifications ?? root.emailNotifications ?? root.email_notifications);
    if (legacy !== undefined) return legacy;

    const nested =
      (root.Notification_Email_Preferences as Record<string, unknown> | undefined) ??
      (root.notificationEmailPreferences as Record<string, unknown> | undefined);
    if (nested) {
      const nestedValue = coerceBoolean(
        nested.Email_Notifications ?? nested.emailNotifications ?? nested.email_notifications
      );
      if (nestedValue !== undefined) return nestedValue;
    }
  }

  return true;
};

export type EmailPreferences = {
  emailSubscribed: boolean;
  unsubscribeToken?: string;
  settingsPayload?: Record<string, unknown>;
};

export async function getEmailPreferences(): Promise<EmailPreferences> {
  const { data } = await authClient.get('/api/v1/user-accounts/settings');
  const payload = (data && typeof data === 'object' ? (data as Record<string, unknown>) : {}) as Record<string, unknown>;

  const emailSubscribed = readEmailSubscribed(payload);
  const unsubscribeToken = readUnsubscribeToken(data);

  return { emailSubscribed, unsubscribeToken, settingsPayload: payload };
}

async function initializeAccountSettings() {
  await authClient.patch('/api/v1/user-accounts/settings', DEFAULT_SETTINGS_PAYLOAD);
}

const cloneSettingsPayload = (base?: Record<string, unknown>): Record<string, unknown> =>
  JSON.parse(JSON.stringify(base ?? DEFAULT_SETTINGS_PAYLOAD));

const setEmailNotificationsFlag = (payload: Record<string, unknown>, enabled: boolean) => {
  const key = 'Notification_Email_Preferences';
  const nested =
    payload[key] && typeof payload[key] === 'object'
      ? (payload[key] as Record<string, unknown>)
      : (payload[key] = {});
  nested.Email_Notifications = enabled;
  nested.emailNotifications = enabled;
  nested.email_notifications = enabled;
};

export async function updateEmailNotificationPreference(
  enabled: boolean,
  baseSettings?: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const next = cloneSettingsPayload(baseSettings);
  setEmailNotificationsFlag(next, enabled);
  const patchSettings = async () => authClient.patch('/api/v1/user-accounts/settings', next);

  const { data } = await patchSettings();
  const payload = (data && typeof data === 'object' ? (data as Record<string, unknown>) : next) as Record<string, unknown>;
  return payload;
}

export async function getSubscriptionStatus(email: string): Promise<SubscriptionStatusResponse> {
  const normalized = email?.trim();
  if (!normalized) {
    throw new Error('An email address is required to check your subscription status.');
  }
  const { data } = await authClient.get<SubscriptionStatusResponse>('/api/v1/user-accounts/subscription-status', {
    params: { email: normalized },
  });
  return {
    email: typeof data?.email === 'string' ? data.email : normalized,
    suppressed: typeof data?.suppressed === 'boolean' ? data.suppressed : Boolean((data as any)?.isSuppressed),
  };
}

type TokenRequestOptions = {
  allowUnauthenticated?: boolean;
  useAuthTokenFallback?: boolean;
};

const resolveSuppressionToken = (token?: string, options?: TokenRequestOptions): string | undefined => {
  const trimmed = token?.trim();
  if (trimmed) return trimmed;
  if (options?.useAuthTokenFallback) {
    const authToken = getToken()?.trim();
    if (authToken) return authToken;
  }
  return undefined;
};

const withTokenConfig = (token: string, extraHeaders?: Record<string, string>) => {
  const headers = AxiosHeaders.from({
    'X-Unsubscribe-Token': token,
    ...(extraHeaders ?? {}),
  });
  return {
    params: { token },
    headers,
  };
};

const buildAbsoluteUrl = (path: string, token: string) => {
  const base = BASE_URL.endsWith('/') ? BASE_URL : `${BASE_URL}/`;
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  const url = new URL(normalizedPath, base);
  url.searchParams.set('token', token);
  return url.toString();
};

async function triggerRedirectUnsubscribe(token: string) {
  const url = buildAbsoluteUrl('/api/v1/user-accounts/unsubscribe', token);
  await fetch(url, {
    method: 'GET',
    mode: 'cors',
    redirect: 'manual',
  });
}

async function triggerBackgroundSubscribe(token: string) {
  const url = buildAbsoluteUrl('/api/v1/user-accounts/subscribe', token);
  await fetch(url, {
    method: 'POST',
    mode: 'no-cors',
    redirect: 'manual',
    credentials: 'include',
  });
}

const pickClient = (allowUnauthenticated?: boolean) =>
  allowUnauthenticated ? unauthenticatedClient : authClient;

export async function unsubscribeFromAccountEmails(
  token?: string,
  options?: TokenRequestOptions
): Promise<string | undefined> {
  const resolvedToken = resolveSuppressionToken(token, options);
  if (!resolvedToken) {
    throw new Error('A suppression token is required to change your email preferences.');
  }
  const config = withTokenConfig(resolvedToken, { 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' });
  const client = pickClient(options?.allowUnauthenticated);
  try {
    const { data } = await client.post('/api/v1/user-accounts/unsubscribe', null, config);
    return readUnsubscribeToken(data);
  } catch (err) {
    if (axios.isAxiosError(err) && !err.response) {
      await triggerRedirectUnsubscribe(resolvedToken);
      return undefined;
    }
    throw err;
  }
}

export async function subscribeFromAccountEmails(
  token?: string,
  options?: TokenRequestOptions
): Promise<string | undefined> {
  const resolvedToken = resolveSuppressionToken(token, options);
  if (!resolvedToken) {
    throw new Error('A suppression token is required to change your email preferences.');
  }
  const config = withTokenConfig(resolvedToken);
  const client = pickClient(options?.allowUnauthenticated);
  try {
    const { data } = await client.post('/api/v1/user-accounts/subscribe', null, config);
    return readUnsubscribeToken(data);
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      // Already removed or never suppressed; treat as success so UI can proceed.
      return undefined;
    }
    if (axios.isAxiosError(err) && !err.response) {
      await triggerBackgroundSubscribe(resolvedToken);
      return undefined;
    }
    throw err;
  }
}

export async function deleteAccount(): Promise<void> {
  try {
    await authClient.delete('/api/v1/user-accounts');
  } finally {
    clearToken();
  }
}
