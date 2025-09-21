import * as React from 'react';
import { Menu, Box, Typography, Divider, Button } from '@mui/material';

type Props = {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  email: string;
  onLogout: () => void;
};

export const AccountMenu: React.FC<Props> = ({ anchorEl, onClose, email, onLogout }) => {
  const open = Boolean(anchorEl);
  return (
    <Menu
      open={open}
      onClose={onClose}
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      disableScrollLock
      PaperProps={{ sx: { p: 2, width: 260 } }}
    >
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
          Account
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {email}
        </Typography>
        <Divider sx={{ my: 1 }} />
        <Button onClick={onLogout} variant="outlined" fullWidth>
          Logout
        </Button>
      </Box>
    </Menu>
  );
};
