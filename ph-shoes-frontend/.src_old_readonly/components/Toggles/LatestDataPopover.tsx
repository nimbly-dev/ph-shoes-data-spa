// src/components/LatestDataPopover/LatestDataPopover.tsx

import React from 'react';
import {
  Popover,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  CircularProgress,
  Typography,
  Box,
} from '@mui/material';
import { LatestData } from '../../types/LatestData';


interface Props {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  data: LatestData[] | null;
}

export const LatestDataPopover: React.FC<Props> = ({
  anchorEl,
  onClose,
  data,
}) => {
  const open = Boolean(anchorEl);

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      disableScrollLock
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      PaperProps={{
        sx: { width: 240, maxHeight: 300, overflowY: 'auto', p: 0 },
      }}
    >
      {data == null ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <CircularProgress />
        </Box>
      ) : data.length === 0 ? (
        <Typography sx={{ m: 2 }}>No data available</Typography>
      ) : (
        <List dense disablePadding>
          {data.map(({ brand, latestDate }) => (
            <React.Fragment key={brand}>
              <ListItem disablePadding>
                <ListItemButton onClick={onClose}>
                  <ListItemText primary={brand} secondary={latestDate} />
                </ListItemButton>
              </ListItem>
              <Divider component="li" />
            </React.Fragment>
          ))}
        </List>
      )}
    </Popover>
  );
};
