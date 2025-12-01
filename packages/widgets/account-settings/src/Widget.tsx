import React from 'react';
import { WidgetRuntimeProps } from '@widget-runtime';
import { UnsubscribeDialogState } from '@commons/types/DialogStates';
import { AccountSettingsDialog } from './components/AccountSettingsDialog';
import { UnsubscribeResultDialog } from './components/UnsubscribeResultDialog';

type Props = WidgetRuntimeProps & {
  settingsOpen: boolean;
  onCloseSettings: () => void;
  onAccountDeleted?: () => Promise<void> | void;
  email?: string;
  unsubscribeResult: UnsubscribeDialogState | null;
  onCloseUnsubscribeResult: () => void;
};

const Widget: React.FC<Props> = ({
  settingsOpen,
  onCloseSettings,
  onAccountDeleted,
  email,
  unsubscribeResult,
  onCloseUnsubscribeResult,
}) => {
  return (
    <>
      <AccountSettingsDialog
        open={settingsOpen}
        onClose={onCloseSettings}
        onAccountDeleted={onAccountDeleted}
        email={email}
      />

      {unsubscribeResult && (
        <UnsubscribeResultDialog
          open={unsubscribeResult.open}
          status={unsubscribeResult.status}
          title={unsubscribeResult.title}
          message={unsubscribeResult.message}
          email={unsubscribeResult.email}
          onClose={onCloseUnsubscribeResult}
        />
      )}
    </>
  );
};

export default Widget;
