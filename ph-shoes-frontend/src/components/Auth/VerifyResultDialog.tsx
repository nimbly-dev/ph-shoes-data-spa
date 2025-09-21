import * as React from 'react';
import { Dialog, Box, Typography, Button } from '@mui/material';

type Props = {
  open: boolean;
  email?: string | null;
  title?: string;
  message?: string;
  onClose: () => void;
  onLogin?: (prefillEmail?: string | null) => void;
};

export const VerifyResultDialog: React.FC<Props> = ({
  open, email, title = 'Email verified', message,
  onClose, onLogin
}) => {
  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { width: 420, maxWidth: '90vw', p: 2 } }}>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          {message ?? (
            <>Your account <strong>{email}</strong> is now verified. You can sign in to continue.</>
          )}
        </Typography>
        <Button variant="contained" fullWidth sx={{ mb: 1 }} onClick={() => onLogin?.(email)}>
          Go to login
        </Button>
        <Button variant="text" fullWidth onClick={onClose}>Close</Button>
      </Box>
    </Dialog>
  );
};
