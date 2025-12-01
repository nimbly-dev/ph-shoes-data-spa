import { useEffect, useState } from 'react';
import { fetchMe, getToken, login as doLogin, logout as doLogout, extractErrorMessage } from '@commons/services/userAccountsService';

type AuthState = {
  user: { email: string } | null;
  loading: boolean;
  error: string | null;
};

export function useAuth() {
  const [state, setState] = useState<AuthState>({ user: null, loading: true, error: null });

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setState({ user: null, loading: false, error: null });
      return;
    }
    fetchMe()
      .then((me) => setState({ user: { email: me.email }, loading: false, error: null }))
      .catch(() => setState({ user: null, loading: false, error: null }));
  }, []);

  const login = async (email: string, password: string) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      await doLogin(email, password);
      const me = await fetchMe();
      setState({ user: { email: me.email }, loading: false, error: null });
    } catch (e) {
      setState({
        user: null,
        loading: false,
        error: extractErrorMessage(e),
      });
    }
  };

  const logout = async () => {
    setState((s) => ({ ...s, loading: true }));
    try {
      await doLogout();
    } finally {
      setState({ user: null, loading: false, error: null });
    }
  };

  return { ...state, login, logout };
}
