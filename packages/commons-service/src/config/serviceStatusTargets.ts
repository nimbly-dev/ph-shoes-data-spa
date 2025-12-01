import { ServiceStatusTarget } from '@commons/types/ServiceStatus';

const env = (import.meta as any).env;

const normalizeApiBase = (baseUrl: string | undefined) => {
  if (!baseUrl) return undefined;
  const trimmed = baseUrl.replace(/\/+$/, '');
  return trimmed.endsWith('/api/v1') ? trimmed : `${trimmed}/api/v1`;
};

const rawTargets: Array<[string, string | undefined, string, string | undefined]> = [
  ['accounts', env.VITE_USER_ACCOUNTS_API_BASE_URL, 'User Accounts', '/system/status'],
  ['catalog', env.VITE_CATALOG_API_BASE_URL, 'Shoe Catalog', '/system/status'],
  ['alerts', env.VITE_ALERTS_API_BASE_URL || 'https://ph-shoes-alerts-service.onrender.com', 'Alerts', '/system/status'],
];

export const SERVICE_STATUS_TARGETS: ServiceStatusTarget[] = rawTargets
  .filter(([, baseUrl]) => typeof baseUrl === 'string' && !!baseUrl)
  .map(([id, baseUrl, label, statusPath]) => ({
    id,
    label,
    statusPath,
    baseUrl: normalizeApiBase(baseUrl!), // normalize and trim trailing slash
  }));
