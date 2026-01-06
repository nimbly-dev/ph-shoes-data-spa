import React from 'react';
import { Dialog, Box, Typography, Button } from '@mui/material';

type Props = {
  open: boolean;
  onClose: () => void;
  onLogin: () => void;
};

export const SessionTimeoutDialog: React.FC<Props> = ({ open, onClose, onLogin }) => {
  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { width: 420, maxWidth: '90vw', p: 2 } }}>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
          Session expired
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Your session timed out. Please sign in again to continue.
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button onClick={onClose} variant="outlined" fullWidth>
            Not now
          </Button>
          <Button onClick={onLogin} variant="contained" fullWidth>
            Sign in
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};
