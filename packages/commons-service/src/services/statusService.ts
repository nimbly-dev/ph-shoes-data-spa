import { ServiceStatusTarget, ServiceStatusResponse } from '../types/ServiceStatus';

export async function fetchServiceStatus(target: ServiceStatusTarget): Promise<ServiceStatusResponse> {
  const path = target.statusPath ?? '/system/status';
  const res = await fetch(`${target.baseUrl}${path}`, {
    method: 'GET',
    credentials: 'omit', 
  });

  if (!res.ok) {
    throw new Error(`Status ${res.status}`);
  }

  return res.json() as Promise<ServiceStatusResponse>;
}
