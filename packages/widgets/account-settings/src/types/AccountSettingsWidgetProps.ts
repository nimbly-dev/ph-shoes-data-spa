import { WidgetRuntimeProps } from '@widget-runtime';
import { UnsubscribeDialogState } from '@commons/types/DialogStates';

export type AccountSettingsWidgetProps = WidgetRuntimeProps & {
  settingsOpen: boolean;
  onCloseSettings: () => void;
  onAccountDeleted?: () => Promise<void> | void;
  email?: string;
  unsubscribeResult: UnsubscribeDialogState | null;
  onCloseUnsubscribeResult: () => void;
};
