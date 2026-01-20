import { WidgetRuntimeProps } from '@widget-runtime';
import { ServiceStatusEntry } from '@commons/types/ServiceStatus';

export type TopNavWidgetProps = WidgetRuntimeProps & {
  mode: 'light' | 'dark';
  onToggleMode: () => void;

  // AI search hooks
  activeQuery: string;
  onSearch: (q: string) => void;
  onClear: () => void;

  // optional actions
  onOpenNotifications?: (anchor?: HTMLElement) => void;
  onOpenAccount?: (anchor: HTMLElement) => void;
  onOpenStatus?: () => void;

  unread?: number;
  serviceStatuses?: ServiceStatusEntry[];
  onRefreshStatuses?: () => void;
  refreshingStatuses?: boolean;
};
