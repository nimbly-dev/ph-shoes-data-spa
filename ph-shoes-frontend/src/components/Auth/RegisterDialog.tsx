import * as React from 'react';
import {
  Dialog, IconButton, Box, Typography, TextField, Button, CircularProgress, Link as MUILink
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { registerAccount, extractErrorMessage, extractFieldErrors } from '../../services/userAccountsService';
import { isEmail, passwordLengthOK, passwordComplexOK } from '../../utils/validators';

type Props = {
  open: boolean;
  onClose: () => void;
  onRegistered: (email: string) => void;
  onOpenLogin?: () => void;
};

export const RegisterDialog: React.FC<Props> = ({ open, onClose, onRegistered, onOpenLogin }) => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirm, setConfirm] = React.useState('');

  const [loading, setLoading] = React.useState(false);
  const [globalError, setGlobalError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});

  const [touched, setTouched] = React.useState<{ email: boolean; password: boolean; confirm: boolean }>({
    email: false, password: false, confirm: false,
  });
  const [submitted, setSubmitted] = React.useState(false);

  React.useEffect(() => {
    if (!open) {
      setEmail(''); setPassword(''); setConfirm('');
      setGlobalError(null); setFieldErrors({});
      setTouched({ email: false, password: false, confirm: false });
      setSubmitted(false);
    }
  }, [open]);

  // frontend validations (computed; shown only if touched or submitted)
  const fe: Record<string, string> = {};
  if (!email.trim()) fe.email = 'This field is required';
  else if (!isEmail(email.trim())) fe.email = 'Must be a valid email address';

  if (!password) fe.password = 'This field is required';
  else if (!passwordLengthOK(password)) fe.password = 'Password must be at least 12 characters long';
  else if (!passwordComplexOK(password)) fe.password = 'Password must include uppercase, lowercase, number, and special character';

  if (!confirm) fe.confirm = 'This field is required';
  else if (password !== confirm) fe.confirm = 'Passwords do not match';

  const showErr = (key: 'email' | 'password' | 'confirm') =>
    (submitted || touched[key]) && (fe[key] || fieldErrors[key]);

  const helper = (key: 'email' | 'password' | 'confirm') =>
    (submitted || touched[key]) ? (fe[key] || fieldErrors[key] || '') : '';

  const buttonEnabled = !!email && !!password && !!confirm && !loading;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setGlobalError(null);
    setFieldErrors({});

    if (Object.keys(fe).length > 0) return;

    try {
      setLoading(true);
      await registerAccount({ email: email.trim(), password });
      setLoading(false);
      onRegistered(email.trim());
    } catch (err) {
      setLoading(false);
      const perField = extractFieldErrors(err);
      if (Object.keys(perField).length > 0) setFieldErrors(perField);
      else setGlobalError(extractErrorMessage(err));
    }
  }

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { width: 420, maxWidth: '90vw', p: 2 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>Create account</Typography>
        <IconButton onClick={onClose} aria-label="Close"><CloseIcon /></IconButton>
      </Box>

      <Box component="form" onSubmit={submit} noValidate>
        <TextField
          size="small"
          type="email"
          label="Email"
          fullWidth
          margin="dense"
          required
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          error={Boolean(showErr('email'))}
          helperText={helper('email')}
          autoComplete="email"
        />

        <TextField
          size="small"
          type="password"
          label="Password"
          fullWidth
          margin="dense"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}  
          onBlur={() => setTouched((t) => ({ ...t, password: true }))}
          error={Boolean(showErr('password'))}
          helperText={helper('password')}
          autoComplete="new-password"
        />

        <TextField
          size="small"
          type="password"
          label="Confirm Password"
          fullWidth
          margin="dense"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}    
          onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
          error={Boolean(showErr('confirm'))}
          helperText={helper('confirm')}
          autoComplete="new-password"
        />

        {globalError && (
          <Typography color="error" variant="caption" sx={{ display: 'block', mt: 0.5 }}>
            {globalError}
          </Typography>
        )}

        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ mt: 2 }}
          disabled={!buttonEnabled}
          startIcon={loading ? <CircularProgress size={16} /> : undefined}
        >
          {loading ? 'Creating…' : 'Create account'}
        </Button>

        <Box sx={{ mt: 1.5, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Already have an account?{' '}
            <MUILink component="button" type="button" onClick={onOpenLogin} sx={{ fontSize: '0.8rem' }}>
              Sign in
            </MUILink>
          </Typography>
        </Box>
      </Box>
    </Dialog>
  );
};
