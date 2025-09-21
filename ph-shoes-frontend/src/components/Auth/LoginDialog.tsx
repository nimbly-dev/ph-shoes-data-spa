import * as React from 'react';
import {
  Dialog, IconButton, Box, Typography, TextField, Button, CircularProgress, Link as MUILink
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

type Props = {
  open: boolean;
  loading?: boolean;
  error?: string | null;
  onClose: () => void;
  onLogin: (email: string, password: string) => void | Promise<void>;
  brand?: React.ReactNode;
  onOpenRegister?: () => void;
};

export const LoginDialog: React.FC<Props> = ({
  open, loading = false, error = null, onClose, onLogin, brand, onOpenRegister,
}) => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  React.useEffect(() => {
    if (!open) { setEmail(''); setPassword(''); }
  }, [open]);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !loading;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onLogin(email.trim(), password);
  };

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { width: 420, maxWidth: '90vw', p: 2 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        {brand ?? <Typography variant="h6" sx={{ fontWeight: 800 }}>PH-Shoes</Typography>}
        <IconButton onClick={onClose} aria-label="Close"><CloseIcon /></IconButton>
      </Box>

      <Box component="form" onSubmit={submit}>
        <TextField
          size="small" type="email" label="Email" fullWidth margin="dense"
          value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" autoFocus required
        />
        <TextField
          size="small" type="password" label="Password" fullWidth margin="dense"
          value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required
        />

        {error && (
          <Typography color="error" variant="caption" sx={{ display: 'block', mt: 0.5 }}>
            {error}
          </Typography>
        )}

        <Button
          type="submit" variant="contained" fullWidth sx={{ mt: 2 }} disabled={!canSubmit}
          startIcon={loading ? <CircularProgress size={16} /> : undefined}
        >
          {loading ? 'Signing in…' : 'Login'}
        </Button>

        <Box sx={{ mt: 1.5, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            No account?{' '}
            <MUILink component="button" type="button" onClick={onOpenRegister} sx={{ fontSize: '0.8rem' }}>
              Create one
            </MUILink>
          </Typography>
        </Box>
      </Box>
    </Dialog>
  );
};
