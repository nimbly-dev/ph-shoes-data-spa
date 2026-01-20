import React from 'react';
import { AccountSettingsDialog } from './components/AccountSettingsDialog';
import { UnsubscribeResultDialog } from './components/UnsubscribeResultDialog';
import { AccountSettingsWidgetProps } from './types/AccountSettingsWidgetProps';

const Widget: React.FC<AccountSettingsWidgetProps> = ({
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
