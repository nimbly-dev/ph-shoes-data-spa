import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  Chip,
  CircularProgress,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorIcon from '@mui/icons-material/Error';
import { ServiceStatusWidgetProps } from './types/ServiceStatusWidgetProps';

const iconForState = (state?: string) => {
  switch (state) {
    case 'UP':
      return <CheckCircleIcon color="success" fontSize="small" />;
    case 'DEGRADED':
      return <WarningAmberIcon color="warning" fontSize="small" />;
    default:
      return <ErrorIcon color="error" fontSize="small" />;
  }
};

const Widget: React.FC<ServiceStatusWidgetProps> = ({
  open,
  onClose,
  entries,
  refreshing,
  onRefresh,
  cooldownMsLeft = 0,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Service status</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={1.5}>
          {entries.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              No services configured yet.
            </Typography>
          )}
          {entries.map((entry) => (
            <Stack
              key={entry.target.id}
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              spacing={2}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                {iconForState(entry.serviceState)}
                <Typography variant="body2" fontWeight={600}>
                  {entry.response?.displayName ?? entry.target.label}
                </Typography>
                {entry.response?.version && (
                  <Chip size="small" label={`v${entry.response.version}`} variant="outlined" />
                )}
              </Stack>
              <Stack alignItems="flex-end" spacing={0.25}>
                <Typography
                  variant="body2"
                  color={
                    entry.serviceState === 'UP'
                      ? 'success.main'
                      : entry.serviceState === 'DEGRADED'
                        ? 'warning.main'
                        : 'error.main'
                  }
                >
                  {entry.serviceState ?? 'UNKNOWN'}
                </Typography>
                {entry.lastChecked && (
                  <Typography variant="caption" color="text.secondary">
                    Checked {entry.lastChecked.toLocaleTimeString()}
                  </Typography>
                )}
                {entry.error && (
                  <Typography variant="caption" color="error.main">
                    {entry.error}
                  </Typography>
                )}
              </Stack>
            </Stack>
          ))}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: 1 }}>
          <Button
            startIcon={refreshing ? <CircularProgress size={16} /> : <RefreshIcon fontSize="small" />}
            onClick={onRefresh}
            disabled={refreshing || cooldownMsLeft > 0}
          >
            Refresh
          </Button>
          {cooldownMsLeft > 0 && (
            <Typography variant="caption" color="text.secondary">
              Available in {(cooldownMsLeft / 1000).toFixed(1)}s
            </Typography>
          )}
        </Stack>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default Widget;
