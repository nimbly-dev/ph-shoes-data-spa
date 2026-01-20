import { WidgetRuntimeProps } from '@widget-runtime';
import { AlertResponse, AlertTarget } from '@commons/types/alerts';

export type AlertRequest = {
  product: AlertTarget;
  existingAlert?: AlertResponse | null;
  returnToList?: boolean;
};

export type AlertsListWidgetProps = WidgetRuntimeProps & {
  isAuthenticated: boolean;
  open: boolean;
  onClose: () => void;
  onOpen: () => void;
  alertRequest?: AlertRequest | null;
  onAlertRequestHandled?: () => void;
  onAlertsChange?: (alerts: AlertResponse[], triggeredCount: number, alertedProductIds: string[]) => void;
};
