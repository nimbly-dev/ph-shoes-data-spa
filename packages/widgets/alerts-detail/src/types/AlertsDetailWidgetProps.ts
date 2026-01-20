import { WidgetRuntimeProps } from '@widget-runtime';
import {
  AlertCreateRequest,
  AlertResponse,
  AlertTarget,
  AlertUpdateRequest,
} from '@commons/types/alerts';

export type AlertsDetailWidgetProps = WidgetRuntimeProps & {
  open: boolean;
  onClose: () => void;
  product: AlertTarget | null;
  existingAlert?: AlertResponse | null;
  onSave: (req: AlertCreateRequest | AlertUpdateRequest, productId: string) => Promise<void>;
  onDelete: (productId: string) => Promise<void>;
};
