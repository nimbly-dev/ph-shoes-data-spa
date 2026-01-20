import { WidgetRuntimeProps } from '@widget-runtime';

export type AccountMenuWidgetProps = WidgetRuntimeProps & {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  email: string;
  onLogout: () => void;
  onOpenSettings?: () => void;
};
