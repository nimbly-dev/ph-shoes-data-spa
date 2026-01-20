import { WidgetRuntimeProps } from '@widget-runtime';
import { ServiceStatusEntry } from '@commons/types/ServiceStatus';

export type ServiceStatusWidgetProps = WidgetRuntimeProps & {
  open: boolean;
  onClose: () => void;
  entries: ServiceStatusEntry[];
  refreshing?: boolean;
  onRefresh: () => void;
  cooldownMsLeft?: number;
};
