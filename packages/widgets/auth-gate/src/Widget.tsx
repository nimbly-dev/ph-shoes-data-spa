import React from 'react';
import { WidgetRuntimeProps } from '@widget-runtime';
import { LoginDialog } from './components/LoginDialog';
import { RegisterDialog } from './components/RegisterDialog';
import { VerifyEmailNotice } from './components/VerifyEmailNotice';
import { VerifyResultDialog } from './components/VerifyResultDialog';
import { SessionTimeoutDialog } from './components/SessionTimeoutDialog';

type AuthGateWidgetProps = WidgetRuntimeProps & {
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
    onRegistered: (email: string) => void;
    onOpenLogin?: () => void;
  };
  verifyNotice: {
    open: boolean;
    email: string;
    onClose: () => void;
  };
  verifyResult: {
    open: boolean;
    email?: string;
    title?: string;
    message?: string;
    status?: 'loading' | 'success' | 'error';
    onClose: () => void;
    onLogin?: (prefill?: string | null) => void;
  };
  sessionTimeout: {
    open: boolean;
    onClose: () => void;
    onLogin: () => void;
  };
};

const Widget: React.FC<AuthGateWidgetProps> = ({
  login,
  register,
  verifyNotice,
  verifyResult,
  sessionTimeout,
}) => {
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
        onRegistered={register.onRegistered}
        onOpenLogin={register.onOpenLogin}
      />
      <VerifyEmailNotice
        open={verifyNotice.open}
        email={verifyNotice.email}
        onClose={verifyNotice.onClose}
      />
      <VerifyResultDialog
        open={verifyResult.open}
        email={verifyResult.email}
        title={verifyResult.title}
        message={verifyResult.message}
        status={verifyResult.status}
        onClose={verifyResult.onClose}
        onLogin={verifyResult.onLogin}
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
