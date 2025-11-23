export type ServiceStatusTarget = {
  id: string;
  label: string;
  baseUrl: string;
  statusPath?: string;
};

const env = (import.meta as any).env;

const rawTargets: Array<[string, string | undefined, string, string | undefined]> = [
  ['accounts', env.VITE_USER_ACCOUNTS_API_BASE_URL, 'User Accounts', '/api/v1/system/status'],
  ['catalog', env.VITE_CATALOG_API_BASE_URL, 'Shoe Catalog', '/api/v1/system/status'],
  ['alerts', env.VITE_ALERTS_API_BASE_URL, 'Alerts', '/system/status'],
];

export const SERVICE_STATUS_TARGETS: ServiceStatusTarget[] = rawTargets
  .filter(([, baseUrl]) => typeof baseUrl === 'string' && !!baseUrl)
  .map(([id, baseUrl, label, statusPath]) => ({
    id,
    label,
    statusPath,
    baseUrl: baseUrl!.replace(/\/+$/, ''), // trim trailing slash
  }));
