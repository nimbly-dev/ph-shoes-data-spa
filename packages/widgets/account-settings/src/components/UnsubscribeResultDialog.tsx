import React from 'react';
import { Dialog, Box, Typography, CircularProgress, Button } from '@mui/material';

type Props = {
  open: boolean;
  status: 'loading' | 'success' | 'error';
  title: string;
  message: string;
  email?: string;
  onClose: () => void;
};

export const UnsubscribeResultDialog: React.FC<Props> = ({
  open,
  status,
  title,
  message,
  email,
  onClose,
}) => {
  const isLoading = status === 'loading';

  return (
    <Dialog
      open={open}
      onClose={isLoading ? undefined : onClose}
      PaperProps={{ sx: { width: 420, maxWidth: '90vw', p: 2.5 } }}
    >
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
          {title}
        </Typography>

        {isLoading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={18} />
            <Typography variant="body2">Updating your preferences…</Typography>
          </Box>
        ) : (
          <>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {message}
            </Typography>
            {email && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Affected email: <strong>{email}</strong>
              </Typography>
            )}
            <Button variant="contained" fullWidth onClick={onClose}>
              Close
            </Button>
          </>
        )}
      </Box>
    </Dialog>
  );
};
