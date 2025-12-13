import axios, { AxiosHeaders, AxiosInstance } from 'axios';
import { getToken } from './userAccountsService';
import { AlertCreateRequest, AlertResponse, AlertUpdateRequest } from '../types/alerts';

const rawBase = (import.meta as any).env.VITE_ALERTS_API_BASE_URL as string | undefined;

const env = (import.meta as any).env;

const alertsBaseURL = env.VITE_ALERTS_API_BASE_URL ?? env.VITE_API_BASE_URL;

if (!alertsBaseURL) {
  throw new Error('Alerts API base URL is not configured.');
}

const normalizedBase = (() => {
  const normalize = (val: string) => {
    const trimmed = val.replace(/\/+$/, '');
    return trimmed.endsWith('/api/v1') ? trimmed : `${trimmed}/api/v1`;
  };

  return normalize(alertsBaseURL);
})();

const client: AxiosInstance = axios.create({
  baseURL: normalizedBase,
  withCredentials: true,
});

// Attach Bearer automatically
client.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    const headers = AxiosHeaders.from(config.headers ?? {});
    headers.set('Authorization', `Bearer ${token}`);
    config.headers = headers;
  }
  return config;
});

export const AlertsService = {
  async list(): Promise<AlertResponse[]> {
    const { data } = await client.get<AlertResponse[]>('/alerts');
    return data;
  },
  async search(params: { q?: string; brand?: string; page?: number; size?: number }): Promise<any> {
    const { data } = await client.get('/alerts/search', { params });
    return data;
  },
  async get(productId: string): Promise<AlertResponse> {
    const { data } = await client.get<AlertResponse>(`/alerts/${productId}`);
    return data;
  },
  async create(req: AlertCreateRequest): Promise<AlertResponse> {
    const { data } = await client.post<AlertResponse>('/alerts', req);
    return data;
  },
  async update(productId: string, req: AlertUpdateRequest): Promise<AlertResponse> {
    const { data } = await client.put<AlertResponse>(`/alerts/${productId}`, req);
    return data;
  },
  async remove(productId: string): Promise<void> {
    await client.delete(`/alerts/${productId}`);
  },
};
