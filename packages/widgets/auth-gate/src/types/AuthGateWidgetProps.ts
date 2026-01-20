import { WidgetRuntimeProps } from '@widget-runtime';
import { UnsubscribeDialogState } from '@commons/types/DialogStates';

export type AuthGateWidgetProps = WidgetRuntimeProps & {
  login: {
    open: boolean;
    loading?: boolean;
    error?: string | null;
    prefillEmail?: string;
    onClose: () => void;
    onLogin: (email: string, password: string) => void | Promise<void>;
    onOpenRegister?: () => void;
  };
  register: {
    open: boolean;
    onClose: () => void;
    onOpenLogin?: () => void;
  };
  sessionTimeout: {
    open: boolean;
    onClose: () => void;
    onLogin: () => void;
  };
  onRequestLogin?: (prefill?: string | null) => void;
  onUnsubscribeResult?: (state: UnsubscribeDialogState) => void;
};
