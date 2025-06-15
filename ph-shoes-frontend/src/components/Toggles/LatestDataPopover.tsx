// src/components/LatestDataPopover/LatestDataPopover.tsx

import React, { useEffect, useState } from 'react';
import {
  Popover,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  CircularProgress,
  Typography,
} from '@mui/material';
import axios from 'axios';
import { fetchLatestShoeData, LatestData } from '../../services/shoeService';


interface Props {
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

export const LatestDataPopover: React.FC<Props> = ({ anchorEl, onClose }) => {
  const open = Boolean(anchorEl);
  const [data, setData]       = useState<LatestData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string>();

  useEffect(() => {
    if (!open) return;

    setLoading(true);
    setError(undefined);

    fetchLatestShoeData()
      .then(setData)
      .catch(e => setError(e.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, [open]);

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      disableScrollLock       // let the page scroll normally
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top',    horizontal: 'right' }}
      PaperProps={{
        sx: {
          width: 240,
          maxHeight: 300,
          overflowY: 'auto',  // scroll inside popover
          p: 0,
        },
      }}
    >
      {loading ? (
        <CircularProgress sx={{ m: 2 }} />
      ) : error ? (
        <Typography color="error" sx={{ m: 2 }}>
          {error}
        </Typography>
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
