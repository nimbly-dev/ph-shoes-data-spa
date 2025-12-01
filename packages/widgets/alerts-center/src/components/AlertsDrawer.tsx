import React from 'react';
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Stack,
  Typography,
  Chip,
  Tooltip,
  Button,
} from '@mui/material';
import { Close, Edit, Delete } from '@mui/icons-material';
import { AlertResponse } from '@commons/types/alerts';

type Props = {
  open: boolean;
  onClose: () => void;
  alerts: AlertResponse[];
  loading?: boolean;
  onEdit: (alert: AlertResponse) => void;
  onDelete: (alert: AlertResponse) => void;
};

const statusColor: Record<string, 'default' | 'success' | 'warning' | 'error'> = {
  ACTIVE: 'success',
  TRIGGERED: 'warning',
  PAUSED: 'default',
};

export function AlertsDrawer({ open, onClose, alerts, loading, onEdit, onDelete }: Props) {
  const triggered = alerts.filter((a) => a.status === 'TRIGGERED');
  const active = alerts.filter((a) => a.status !== 'TRIGGERED');

  const renderList = (items: AlertResponse[], emptyLabel: string) => (
    <List dense>
      {items.length === 0 && (
        <ListItem>
          <ListItemText primary={emptyLabel} />
        </ListItem>
      )}
      {items.map((a) => (
        <ListItem key={a.productId} alignItems="flex-start">
          <ListItemText
            primary={
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="body1" fontWeight={600}>{a.productName}</Typography>
                <Chip size="small" label={a.status} color={statusColor[a.status] || 'default'} />
              </Stack>
            }
            secondary={
              <>
                {a.desiredPrice && (
                  <Typography variant="caption" display="block">Price target: ₱{a.desiredPrice.toLocaleString()}</Typography>
                )}
                {a.desiredPercent && (
                  <Typography variant="caption" display="block">Discount: {a.desiredPercent}%</Typography>
                )}
                {a.alertIfSale && (
                  <Typography variant="caption" display="block">Alert when on sale</Typography>
                )}
              </>
            }
          />
          <ListItemSecondaryAction>
            <Tooltip title="Edit">
              <IconButton size="small" onClick={() => onEdit(a)}>
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton size="small" onClick={() => onDelete(a)}>
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          </ListItemSecondaryAction>
        </ListItem>
      ))}
    </List>
  );

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 420 } } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
        <Typography variant="h6" sx={{ flex: 1, fontWeight: 700 }}>Alerts</Typography>
        <IconButton onClick={onClose}><Close /></IconButton>
      </Box>
      <Divider />
      <Box sx={{ p: 2, overflowY: 'auto', height: '100%' }}>
        {loading && <Typography variant="body2">Loading alerts…</Typography>}

        <Stack spacing={2}>
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="subtitle2" fontWeight={700} letterSpacing={0.2}>Triggered</Typography>
              <Chip size="small" label={triggered.length} />
            </Stack>
            {renderList(triggered, 'No triggered alerts yet.')}
          </Box>

          <Divider />

          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="subtitle2" fontWeight={700} letterSpacing={0.2}>Active</Typography>
              <Chip size="small" label={active.length} />
            </Stack>
            {renderList(active, 'No active alerts yet.')}
          </Box>
        </Stack>

        <Button fullWidth sx={{ mt: 2 }} onClick={onClose}>Close</Button>
      </Box>
    </Drawer>
  );
}
