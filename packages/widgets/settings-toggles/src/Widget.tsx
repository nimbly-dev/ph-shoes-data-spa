import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Switch,
  FormControlLabel,
  Typography,
  Box,
} from '@mui/material';
import { SettingsTogglesWidgetProps } from './types/SettingsTogglesWidgetProps';

const Widget: React.FC<SettingsTogglesWidgetProps> = ({ open, useVector, onChange, onClose }) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>Search Settings</DialogTitle>
    <DialogContent>
      <Box mb={2}>
        <FormControlLabel
          control={
            <Switch
              checked={useVector}
              onChange={(e) => onChange(e.target.checked)}
            />
          }
          label="Use Vector Fallback"
        />
      </Box>
      <Typography variant="body2" color="text.secondary">
        When enabled, if no exact or tokenized match is found, the AI-powered vector search will
        return semantically similar products. Disable to only show deterministic JPA results.
      </Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Close</Button>
    </DialogActions>
  </Dialog>
);

export default Widget;
