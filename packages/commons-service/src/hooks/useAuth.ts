import { useCallback, useEffect, useRef, useState } from 'react';
import {
  clearToken,
  decodeJwtExpiryMs,
  extractErrorMessage,
  fetchMe,
  getToken,
  login as doLogin,
  logout as doLogout,
  onSessionTimeout,
  resetSessionTimeoutNotification,
  triggerSessionTimeout,
} from '@commons/services/userAccountsService';

type AuthState = {
  user: { email: string } | null;
  loading: boolean;
  error: string | null;
};

type LogoutReason = 'session-timeout' | null;

export function useAuth() {
  const [state, setState] = useState<AuthState>({ user: null, loading: true, error: null });
  const [logoutReason, setLogoutReason] = useState<LogoutReason>(null);
  const sessionTimeoutId = useRef<number | null>(null);

  const clearSessionTimeoutTimer = useCallback(() => {
    if (sessionTimeoutId.current) {
      window.clearTimeout(sessionTimeoutId.current);
      sessionTimeoutId.current = null;
    }
  }, []);

  const scheduleSessionTimeout = useCallback((token: string | null) => {
    clearSessionTimeoutTimer();
    if (!token) return;
    const expiresAt = decodeJwtExpiryMs(token);
    if (!expiresAt) return;
    const delayMs = Math.max(expiresAt - Date.now(), 0);
    if (delayMs === 0) {
      triggerSessionTimeout();
      return;
    }
    sessionTimeoutId.current = window.setTimeout(() => {
      triggerSessionTimeout();
    }, delayMs);
  }, [clearSessionTimeoutTimer]);

  const handleSessionTimeout = useCallback(() => {
    clearToken();
    setLogoutReason('session-timeout');
    setState({ user: null, loading: false, error: null });
  }, []);

  useEffect(() => {
    const unsubscribe = onSessionTimeout(handleSessionTimeout);
    const token = getToken();
    if (!token) {
      setState({ user: null, loading: false, error: null });
      return () => {
        unsubscribe();
        clearSessionTimeoutTimer();
      };
    }
    scheduleSessionTimeout(token);
    fetchMe()
      .then((me) => setState({ user: { email: me.email }, loading: false, error: null }))
      .catch(() => setState({ user: null, loading: false, error: null }));
    return () => {
      unsubscribe();
      clearSessionTimeoutTimer();
    };
  }, [clearSessionTimeoutTimer, handleSessionTimeout, scheduleSessionTimeout]);

  const login = async (email: string, password: string) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      await doLogin(email, password);
      const me = await fetchMe();
      setState({ user: { email: me.email }, loading: false, error: null });
      setLogoutReason(null);
      resetSessionTimeoutNotification();
      scheduleSessionTimeout(getToken());
    } catch (e) {
      setState({
        user: null,
        loading: false,
        error: extractErrorMessage(e),
      });
    }
  };

  const logout = async (reason: 'user' | 'session-timeout' = 'user') => {
    setState((s) => ({ ...s, loading: true }));
    if (reason === 'session-timeout') {
      clearToken();
      setLogoutReason('session-timeout');
      setState({ user: null, loading: false, error: null });
      return;
    }
    try {
      await doLogout();
    } finally {
      clearSessionTimeoutTimer();
      resetSessionTimeoutNotification();
      setLogoutReason(null);
      setState({ user: null, loading: false, error: null });
    }
  };

  const acknowledgeSessionTimeout = () => {
    if (logoutReason !== 'session-timeout') return;
    setLogoutReason(null);
    resetSessionTimeoutNotification();
    clearSessionTimeoutTimer();
  };

  return { ...state, login, logout, logoutReason, acknowledgeSessionTimeout };
}
