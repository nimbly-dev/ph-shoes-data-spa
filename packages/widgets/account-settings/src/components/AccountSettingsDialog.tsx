import React from 'react';
import axios from 'axios';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  Divider,
  CircularProgress,
  Alert,
  Chip,
  Stack,
} from '@mui/material';
import {
  getEmailPreferences,
  unsubscribeFromAccountEmails,
  subscribeFromAccountEmails,
  deleteAccount,
  extractErrorMessage,
  updateEmailNotificationPreference,
  getSubscriptionStatus,
} from '@commons/services/userAccountsService';

type Props = {
  open: boolean;
  onClose: () => void;
  onAccountDeleted?: () => Promise<void> | void;
  email?: string;
};

type Prefs = { emailSubscribed: boolean; unsubscribeToken?: string; settingsPayload?: Record<string, unknown> };
const DEFAULT_PREFS: Prefs = { emailSubscribed: true, unsubscribeToken: undefined, settingsPayload: undefined };

type SuppressionStatusState = {
  suppressed: boolean | null;
  loading: boolean;
  error: string | null;
};

const DEFAULT_SUPPRESSION_STATUS: SuppressionStatusState = {
  suppressed: null,
  loading: false,
  error: null,
};

const shouldForceLogout = (err: unknown) =>
  axios.isAxiosError(err) && [401, 403].includes(err.response?.status ?? 0);

export const AccountSettingsDialog: React.FC<Props> = ({ open, onClose, onAccountDeleted, email }) => {
  const [tab, setTab] = React.useState<'notifications' | 'account'>('notifications');
  const [prefs, setPrefs] = React.useState<Prefs>({ ...DEFAULT_PREFS });
  const [prefsReady, setPrefsReady] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [deleteConfirming, setDeleteConfirming] = React.useState(false);
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const [unsubscribeLoading, setUnsubscribeLoading] = React.useState(false);
  const [resubscribing, setResubscribing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);
  const [suppressionStatus, setSuppressionStatus] = React.useState<SuppressionStatusState>({
    ...DEFAULT_SUPPRESSION_STATUS,
  });

  const patchPrefs = React.useCallback((partial: Partial<Prefs>) => {
    setPrefs((prev) => ({ ...prev, ...partial }));
  }, []);

  const resetPrefs = React.useCallback(() => setPrefs({ ...DEFAULT_PREFS }), []);
  const resetSuppressionStatus = React.useCallback(
    () => setSuppressionStatus({ ...DEFAULT_SUPPRESSION_STATUS }),
    []
  );

  const refreshPreferences = React.useCallback(
    async (handleError: (msg: string) => void = setError) => {
      try {
        const next = await getEmailPreferences();
        patchPrefs(next);
        setPrefsReady(true);
        return next;
      } catch (e) {
        const msg = extractErrorMessage(e);
        handleError(msg);
        setPrefsReady(false);
        if (shouldForceLogout(e) && onAccountDeleted) onAccountDeleted();
        throw e;
      }
    },
    [onAccountDeleted, patchPrefs]
  );

  const refreshSuppressionStatus = React.useCallback(async () => {
    if (!email) {
      setSuppressionStatus({
        suppressed: null,
        loading: false,
        error: 'We could not determine which email to check. Sign in again to refresh.',
      });
      return;
    }
    setSuppressionStatus({ suppressed: null, loading: true, error: null });
    try {
      const status = await getSubscriptionStatus(email);
      setSuppressionStatus({ suppressed: status.suppressed, loading: false, error: null });
    } catch (err) {
      const msg = extractErrorMessage(err) || 'Unable to load suppression status.';
      setSuppressionStatus({ suppressed: null, loading: false, error: msg });
      if (shouldForceLogout(err) && onAccountDeleted) onAccountDeleted();
    }
  }, [email, onAccountDeleted]);

  React.useEffect(() => {
    if (!open) {
      setTab('notifications');
      setDeleteConfirming(false);
      setError(null);
      setDeleteError(null);
      setPrefsReady(false);
      setLoading(false);
      setUnsubscribeLoading(false);
      setDeleteLoading(false);
      resetPrefs();
      resetSuppressionStatus();
      return;
    }
    setError(null);
    setDeleteError(null);
    setPrefsReady(false);
    setLoading(true);
    refreshPreferences().finally(() => setLoading(false));
    refreshSuppressionStatus();
  }, [open, refreshPreferences, refreshSuppressionStatus, resetPrefs, resetSuppressionStatus]);

  const handleUnsubscribeNow = async () => {
    setError(null);
    setUnsubscribeLoading(true);
    try {
      const nextToken = await unsubscribeFromAccountEmails(prefs.unsubscribeToken, {
        useAuthTokenFallback: true,
        allowUnauthenticated: true,
      });
      const updatedSettings = await updateEmailNotificationPreference(false, prefs.settingsPayload);
      patchPrefs({
        emailSubscribed: false,
        unsubscribeToken: nextToken ?? prefs.unsubscribeToken,
        settingsPayload: updatedSettings,
      });
      await refreshPreferences();
      await refreshSuppressionStatus();
    } catch (e) {
      const msg = extractErrorMessage(e);
      setError(msg);
      if (shouldForceLogout(e) && onAccountDeleted) onAccountDeleted();
    } finally {
      setUnsubscribeLoading(false);
    }
  };

  const handleResubscribe = async () => {
    setError(null);
    setResubscribing(true);
    try {
      const nextToken = await subscribeFromAccountEmails(prefs.unsubscribeToken, {
        useAuthTokenFallback: true,
        allowUnauthenticated: true,
      });
      const updatedSettings = await updateEmailNotificationPreference(true, prefs.settingsPayload);
      patchPrefs({
        emailSubscribed: true,
        unsubscribeToken: nextToken ?? prefs.unsubscribeToken,
        settingsPayload: updatedSettings,
      });
      await refreshPreferences();
      await refreshSuppressionStatus();
    } catch (e) {
      const msg = extractErrorMessage(e);
      setError(msg);
      if (shouldForceLogout(e) && onAccountDeleted) onAccountDeleted();
    } finally {
      setResubscribing(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deleteConfirming) {
      setDeleteConfirming(true);
      return;
    }
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await deleteAccount();
      await onAccountDeleted?.();
    } catch (err) {
      setDeleteError(extractErrorMessage(err));
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Account</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
          <Box sx={{ minWidth: { sm: 220 }, borderRight: { sm: '1px solid', xs: 'none' }, borderColor: 'divider' }}>
            <List dense>
              <ListItemButton selected={tab === 'notifications'} onClick={() => setTab('notifications')}>
                <ListItemText primary="Email notifications" />
              </ListItemButton>
              <ListItemButton selected={tab === 'account'} onClick={() => setTab('account')}>
                <ListItemText primary="Account" />
              </ListItemButton>
            </List>
          </Box>
          <Box sx={{ flex: 1 }}>
            {tab === 'notifications' && (
              <>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                  Email notifications
                </Typography>
                {!prefsReady ? (
                  <CircularProgress size={18} />
                ) : (
                  <>
                    <Alert severity={prefs.emailSubscribed ? 'success' : 'warning'} sx={{ mb: 2 }}>
                      {prefs.emailSubscribed
                        ? 'You are currently subscribed to product alerts and updates.'
                        : 'You are currently unsubscribed.'}
                    </Alert>
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="contained"
                        onClick={handleUnsubscribeNow}
                        disabled={unsubscribeLoading || resubscribing || !prefs.emailSubscribed}
                      >
                        {unsubscribeLoading ? 'Unsubscribing…' : 'Unsubscribe'}
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={handleResubscribe}
                        disabled={resubscribing || unsubscribeLoading || prefs.emailSubscribed}
                      >
                        {resubscribing ? 'Resubscribing…' : 'Resubscribe'}
                      </Button>
                    </Stack>
                    {error && (
                      <Typography variant="caption" color="error.main" display="block" sx={{ mt: 1 }}>
                        {error}
                      </Typography>
                    )}
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" gutterBottom>
                      Suppression status
                    </Typography>
                    {suppressionStatus.loading ? (
                      <CircularProgress size={18} />
                    ) : suppressionStatus.error ? (
                      <Typography variant="body2" color="error.main">
                        {suppressionStatus.error}
                      </Typography>
                    ) : (
                      <Chip
                        label={
                          suppressionStatus.suppressed === true
                            ? 'Suppressed'
                            : suppressionStatus.suppressed === false
                              ? 'Active'
                              : 'Unknown'
                        }
                        color={
                          suppressionStatus.suppressed === true
                            ? 'warning'
                            : suppressionStatus.suppressed === false
                              ? 'success'
                              : 'default'
                        }
                      />
                    )}
                  </>
                )}
              </>
            )}
            {tab === 'account' && (
              <>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                  Account actions
                </Typography>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Deleting your account removes your alerts and preferences permanently.
                </Alert>
                {deleteError && (
                  <Typography variant="body2" color="error.main" sx={{ mb: 1 }}>
                    {deleteError}
                  </Typography>
                )}
                <Button
                  variant="contained"
                  color={deleteConfirming ? 'error' : 'primary'}
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading}
                  startIcon={deleteLoading ? <CircularProgress size={16} /> : undefined}
                >
                  {deleteLoading ? 'Deleting…' : deleteConfirming ? 'Confirm delete' : 'Delete account'}
                </Button>
              </>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};
