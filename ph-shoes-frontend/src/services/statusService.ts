import { ServiceStatusTarget } from '../config/serviceStatusTargets';

export type ServiceState = 'UP' | 'DEGRADED' | 'DOWN';

export type ServiceStatusResponse = {
  serviceId: string;
  displayName?: string;
  environment?: string;
  version?: string;
  description?: string;
  region?: string;
  state: ServiceState;
  checkedAt: string;
  uptimeSeconds: number;
};

export async function fetchServiceStatus(target: ServiceStatusTarget): Promise<ServiceStatusResponse> {
  const path = target.statusPath ?? '/system/status';
  const res = await fetch(`${target.baseUrl}${path}`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error(`Status ${res.status}`);
  }

  return res.json() as Promise<ServiceStatusResponse>;
}
