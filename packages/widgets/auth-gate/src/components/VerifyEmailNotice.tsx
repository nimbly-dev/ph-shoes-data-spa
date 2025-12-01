import React from 'react';
import { Dialog, Box, Typography, Button } from '@mui/material';

type Props = {
  open: boolean;
  email: string;
  onClose: () => void;
};

export const VerifyEmailNotice: React.FC<Props> = ({ open, email, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { width: 420, maxWidth: '90vw', p: 2 } }}>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
          Verify your email
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          We sent a verification link to <strong>{email}</strong>. Please check your inbox (and spam folder). Click
          the link to activate your account.
        </Typography>
        <Button onClick={onClose} variant="contained" fullWidth>
          Got it
        </Button>
      </Box>
    </Dialog>
  );
};
