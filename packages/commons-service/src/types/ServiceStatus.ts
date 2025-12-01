export type ServiceState = 'UP' | 'DEGRADED' | 'DOWN';

export type ServiceStatusTarget = {
  id: string;
  label: string;
  baseUrl: string;
  statusPath?: string;
};

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

export type ServiceStatusEntry = {
  target: ServiceStatusTarget;
  state: 'idle' | 'loading' | 'success' | 'error';
  serviceState?: ServiceState;
  response?: ServiceStatusResponse;
  error?: string;
  lastChecked?: Date;
};
