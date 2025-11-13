import * as React from 'react';
import { Dialog, Box, Typography, Button, CircularProgress } from '@mui/material';

type Props = {
  open: boolean;
  email?: string | null;
  title?: string;
  message?: string;
  onClose: () => void;
  onLogin?: (prefillEmail?: string | null) => void;
  status?: 'loading' | 'success' | 'error';
};

export const VerifyResultDialog: React.FC<Props> = ({
  open, email, title = 'Email verified', message,
  onClose, onLogin, status
}) => {
  const isLoading = status === 'loading';

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { width: 420, maxWidth: '90vw', p: 2 } }}>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          {message ?? (
            <>
              Your account <strong>{email}</strong> is now verified. You can sign in to continue.
            </>
          )}
        </Typography>

        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}

        <Button
          variant="contained"
          fullWidth
          sx={{ mb: 1 }}
          onClick={() => onLogin?.(email)}
          disabled={isLoading}
        >
          Go to login
        </Button>
        <Button variant="text" fullWidth onClick={onClose} disabled={isLoading}>
          Close
        </Button>
      </Box>
    </Dialog>
  );
};
