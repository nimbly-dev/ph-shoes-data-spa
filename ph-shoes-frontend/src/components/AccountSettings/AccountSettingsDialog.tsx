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
} from '@mui/material';
import {
  getEmailPreferences,
  unsubscribeFromAccountEmails,
  subscribeFromAccountEmails,
  deleteAccount,
  extractErrorMessage,
  updateEmailNotificationPreference,
  getSubscriptionStatus,
} from '../../services/userAccountsService';

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

export default function AccountSettingsDialog({ open, onClose, onAccountDeleted, email }: Props) {
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
  const [suppressionStatus, setSuppressionStatus] = React.useState<SuppressionStatusState>({ ...DEFAULT_SUPPRESSION_STATUS });

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
    refreshPreferences()
      .catch(() => {
        /* handled upstream */
      })
      .finally(() => setLoading(false));
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

  const handleResubscribeNow = async () => {
    setError(null);
    setResubscribing(true);
    try {
      await subscribeFromAccountEmails(prefs.unsubscribeToken, {
        useAuthTokenFallback: true,
        allowUnauthenticated: true,
      });
      const updatedSettings = await updateEmailNotificationPreference(true, prefs.settingsPayload);
      patchPrefs({ emailSubscribed: true, unsubscribeToken: undefined, settingsPayload: updatedSettings });
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
    setDeleteError(null);
    setDeleteLoading(true);
    try {
      await deleteAccount();
      setDeleteConfirming(false);
      if (onAccountDeleted) {
        await onAccountDeleted();
      }
      onClose();
    } catch (e) {
      const msg = extractErrorMessage(e);
      setDeleteError(msg);
      if (shouldForceLogout(e) && onAccountDeleted) await onAccountDeleted();
    } finally {
      setDeleteLoading(false);
    }
  };

  const isUnsubscribed = !prefs.emailSubscribed;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Settings</DialogTitle>
      <DialogContent dividers sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '220px 1fr' }, p: 0 }}>
        {/* Left nav */}
        <Box sx={{ borderRight: { md: '1px solid' }, borderColor: { md: 'divider' }, p: 2 }}>
          <List dense>
            <ListItemButton selected={tab === 'notifications'} onClick={() => setTab('notifications')}>
              <ListItemText primary="Notifications" secondary="Email preferences" />
            </ListItemButton>
            <ListItemButton selected={tab === 'account'} onClick={() => setTab('account')}>
              <ListItemText primary="Account" secondary="Danger zone" />
            </ListItemButton>
          </List>
        </Box>

        {/* Content */}
        <Box sx={{ p: 2.5 }}>
          {loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={18} /> <Typography variant="body2">Loading…</Typography>
            </Box>
          ) : tab === 'notifications' ? (
            <>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Notifications</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Control whether this email can receive verification or account-related emails.
                Use the quick actions below to opt in or out.
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Chip
                label={prefs.emailSubscribed ? 'Email delivery: Enabled' : 'Email delivery: Disabled'}
                color={prefs.emailSubscribed ? 'success' : 'default'}
                sx={{ mb: 2, fontWeight: 600, borderRadius: 999, px: 1.5, height: 30 }}
              />

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Box
                sx={{
                  mt: 2,
                  border: '1px solid',
                  borderColor: 'warning.light',
                  borderRadius: 2,
                  p: 2.5,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                }}
              >
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Email suppression</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Choose one of the actions below to control account-related emails.
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5 }}>
                  {suppressionStatus.loading ? (
                    <>
                      <CircularProgress size={16} />
                      <Typography variant="body2" color="text.secondary">
                        Checking suppression status…
                      </Typography>
                    </>
                  ) : suppressionStatus.error ? (
                    <Typography variant="body2" color="error">
                      {suppressionStatus.error}
                    </Typography>
                  ) : suppressionStatus.suppressed !== null ? (
                    <>
                      <Typography variant="body2" color="text.secondary">
                        {suppressionStatus.suppressed
                          ? 'Notifications are currently blocked for this email.'
                          : 'This email can receive account notifications.'}
                      </Typography>
                    </>
                  ) : null}
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <Button
                    variant="contained"
                    color="warning"
                    onClick={handleUnsubscribeNow}
                    disabled={unsubscribeLoading || loading || (prefsReady && !prefs.emailSubscribed)}
                  >
                    {unsubscribeLoading ? 'Processing…' : !prefs.emailSubscribed ? 'Already unsubscribed' : 'Unsubscribe now'}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleResubscribeNow}
                    disabled={resubscribing || loading || (prefsReady && prefs.emailSubscribed)}
                  >
                    {resubscribing ? 'Processing…' : 'Re-enable email notifications'}
                  </Button>
                </Box>
                {!prefsReady && (
                  <Typography variant="body2" color="text.secondary">
                    We couldn&apos;t confirm your latest email preferences yet. Try again in a moment.
                  </Typography>
                )}
              </Box>
            </>
          ) : (
            <>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Account</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Manage account-level actions. These operations affect your ability to receive emails or keep your account active.
              </Typography>

              {deleteError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {deleteError}
                </Alert>
              )}

              <Box sx={{ mt: 3, border: '1px solid', borderColor: 'error.light', borderRadius: 1, p: 2.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Delete account</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Permanently remove your account and all associated preferences. This cannot be undone.
                </Typography>

                {!deleteConfirming ? (
                  <Button
                    variant="outlined"
                    color="error"
                    sx={{ mt: 2 }}
                    onClick={() => setDeleteConfirming(true)}
                  >
                    Delete my account
                  </Button>
                ) : (
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={handleDeleteAccount}
                      disabled={deleteLoading}
                    >
                      {deleteLoading ? 'Deleting...' : 'Confirm delete'}
                    </Button>
                    <Button onClick={() => setDeleteConfirming(false)} disabled={deleteLoading}>
                      Cancel
                    </Button>
                  </Box>
                )}
              </Box>
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
