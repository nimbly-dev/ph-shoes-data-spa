import React, { useCallback, useState } from 'react';
import { useAccountRedirects } from '@commons/hooks/useAccountRedirects';
import { UnsubscribeDialogState } from '@commons/types/DialogStates';
import { LoginDialog } from './components/LoginDialog';
import { RegisterDialog } from './components/RegisterDialog';
import { VerifyEmailNotice } from './components/VerifyEmailNotice';
import { VerifyResultDialog } from './components/VerifyResultDialog';
import { SessionTimeoutDialog } from './components/SessionTimeoutDialog';
import { AuthGateWidgetProps } from './types/AuthGateWidgetProps';

const Widget: React.FC<AuthGateWidgetProps> = ({
  login,
  register,
  sessionTimeout,
  onRequestLogin,
  onUnsubscribeResult,
}) => {
  const [verifyNoticeOpen, setVerifyNoticeOpen] = useState(false);
  const [verifyResultOpen, setVerifyResultOpen] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState('');
  const [verifyTitle, setVerifyTitle] = useState('Email verified');
  const [verifyMsg, setVerifyMsg] = useState<string | undefined>(undefined);
  const [verifyStatus, setVerifyStatus] = useState<'loading' | 'success' | 'error' | undefined>(undefined);

  const handleVerifyRedirectResult = useCallback(
    ({ title, message, email, status }: { title: string; message?: string; email?: string; status?: 'loading' | 'success' | 'error' }) => {
      setVerifyTitle(title);
      setVerifyMsg(message);
      setVerifyEmail(email ?? '');
      setVerifyStatus(status);
      setVerifyResultOpen(true);
    },
    []
  );

  const handleUnsubscribeRedirectResult = useCallback((state: UnsubscribeDialogState) => {
    onUnsubscribeResult?.(state);
  }, [onUnsubscribeResult]);

  useAccountRedirects({
    onVerifyResult: handleVerifyRedirectResult,
    onUnsubscribeResult: handleUnsubscribeRedirectResult,
  });

  const handleRegistered = (email: string) => {
    register.onClose();
    setVerifyEmail(email);
    setVerifyNoticeOpen(true);
  };

  const closeVerifyNotice = () => setVerifyNoticeOpen(false);
  const closeVerifyResult = () => {
    setVerifyResultOpen(false);
    setVerifyStatus(undefined);
  };

  const handleVerifyLogin = (prefill?: string | null) => {
    setVerifyResultOpen(false);
    onRequestLogin?.(prefill);
  };

  return (
    <>
      <LoginDialog
        open={login.open}
        loading={login.loading}
        error={login.error}
        onClose={login.onClose}
        onLogin={login.onLogin}
        onOpenRegister={login.onOpenRegister}
        prefillEmail={login.prefillEmail}
      />
      <RegisterDialog
        open={register.open}
        onClose={register.onClose}
        onRegistered={handleRegistered}
        onOpenLogin={register.onOpenLogin}
      />
      <VerifyEmailNotice
        open={verifyNoticeOpen}
        email={verifyEmail}
        onClose={closeVerifyNotice}
      />
      <VerifyResultDialog
        open={verifyResultOpen}
        email={verifyEmail}
        title={verifyTitle}
        message={verifyMsg}
        status={verifyStatus}
        onClose={closeVerifyResult}
        onLogin={handleVerifyLogin}
      />
      <SessionTimeoutDialog
        open={sessionTimeout.open}
        onClose={sessionTimeout.onClose}
        onLogin={sessionTimeout.onLogin}
      />
    </>
  );
};

export default Widget;
