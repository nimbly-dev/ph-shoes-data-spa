import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  Stack,
  TextField,
  Typography,
  Chip,
  Paper,
} from '@mui/material';
import {
  AlertCreateRequest,
  AlertResponse,
  AlertUpdateRequest,
  AlertTarget,
} from '@commons/types/alerts';
import { WidgetRuntimeProps } from '@widget-runtime';

type Props = WidgetRuntimeProps & {
  open: boolean;
  onClose: () => void;
  product: AlertTarget | null;
  existingAlert?: AlertResponse | null;
  onSave: (req: AlertCreateRequest | AlertUpdateRequest, productId: string) => Promise<void>;
  onDelete: (productId: string) => Promise<void>;
};

type FormState = {
  desiredPrice?: number;
  desiredPercent?: number;
  alertIfSale: boolean;
  channels: string[];
  resetStatus: boolean;
  productBrand?: string;
  productImage?: string;
  productImageUrl?: string;
  productUrl?: string;
};

const defaultForm: FormState = {
  desiredPrice: undefined,
  desiredPercent: undefined,
  alertIfSale: false,
  channels: ['APP_WIDGET'],
  resetStatus: false,
  productBrand: undefined,
  productImage: undefined,
  productImageUrl: undefined,
  productUrl: undefined,
};

const Widget: React.FC<Props> = ({ open, onClose, product, existingAlert, onSave, onDelete }) => {
  const [form, setForm] = useState<FormState>(defaultForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!product) return;
    if (existingAlert) {
      setForm({
        desiredPrice: existingAlert.desiredPrice,
        desiredPercent: existingAlert.desiredPercent,
        alertIfSale: !!existingAlert.alertIfSale,
        channels: existingAlert.channels && existingAlert.channels.length > 0 ? existingAlert.channels : ['APP_WIDGET'],
        resetStatus: existingAlert.status === 'TRIGGERED',
        productBrand: existingAlert.productBrand,
        productImage: existingAlert.productImage,
        productImageUrl: existingAlert.productImageUrl,
        productUrl: existingAlert.productUrl,
      });
    } else {
      setForm({
        ...defaultForm,
        productBrand: product.brand,
        productImage: product.image,
        productImageUrl: product.productImageUrl,
        productUrl: product.url,
      });
    }
  }, [product, existingAlert]);

  const hasAnyTrigger = useMemo(() => {
    const hasPrice = !!form.desiredPrice && form.desiredPrice > 0;
    const hasPercent = !!form.desiredPercent && form.desiredPercent > 0;
    const hasSale = form.alertIfSale;
    return hasPrice || hasPercent || hasSale;
  }, [form]);

  const handleSave = async () => {
    if (!product || !hasAnyTrigger) return;
    setSubmitting(true);
    const payload: AlertCreateRequest | AlertUpdateRequest = {
      productId: product.id,
      productName: product.title,
      productBrand: form.productBrand ?? product.brand,
      productImage: form.productImage ?? product.image,
      productImageUrl: form.productImageUrl ?? product.productImageUrl ?? product.image,
      productUrl: form.productUrl ?? product.url,
      productCurrentPrice: product.priceSale,
      productOriginalPrice: product.priceOriginal,
      desiredPrice: form.desiredPrice,
      desiredPercent: form.desiredPercent,
      alertIfSale: form.alertIfSale,
      channels: form.channels,
      ...(existingAlert ? { resetStatus: form.resetStatus } : {}),
    };
    try {
      await onSave(payload, product.id);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!product || !existingAlert) return;
    setSubmitting(true);
    try {
      await onDelete(product.id);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const toggleChannel = (channel: string) => {
    setForm((prev) => {
      const exists = prev.channels.includes(channel);
      if (exists) return { ...prev, channels: prev.channels.filter((c) => c !== channel) };
      return { ...prev, channels: [...prev.channels, channel] };
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ pb: 1.5 }}>Set Alert</DialogTitle>
      <DialogContent sx={{ pb: 1 }}>
        {product && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              {product.title}
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Chip
                size="small"
                label={`Current: ₱${product.priceSale.toLocaleString()}`}
                color="primary"
                variant="outlined"
              />
              {product.priceOriginal > product.priceSale && (
                <Chip
                  size="small"
                  label={`Orig: ₱${product.priceOriginal.toLocaleString()}`}
                  color="default"
                  variant="outlined"
                />
              )}
              {existingAlert?.status === 'TRIGGERED' && (
                <Chip size="small" color="warning" label="Triggered" />
              )}
            </Stack>
          </Box>
        )}

        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2" fontWeight={700} gutterBottom>
            Triggers
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Desired price (₱)"
                type="number"
                fullWidth
                size="small"
                value={form.desiredPrice ?? ''}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    desiredPrice: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Desired discount (%)"
                type="number"
                fullWidth
                size="small"
                value={form.desiredPercent ?? ''}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    desiredPercent: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
                inputProps={{ min: 0, max: 100 }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.alertIfSale}
                    onChange={(e) => setForm((prev) => ({ ...prev, alertIfSale: e.target.checked }))}
                  />
                }
                label="Alert when on sale"
              />
            </Grid>
          </Grid>
          {!hasAnyTrigger && (
            <Typography variant="caption" color="error" display="block" mt={1}>
              Set at least one trigger (price, percent, or on sale).
            </Typography>
          )}
        </Paper>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" fontWeight={700} gutterBottom>
            Channels
          </Typography>
          <Stack direction="row" spacing={3} alignItems="center">
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.channels.includes('APP_WIDGET')}
                  onChange={() => toggleChannel('APP_WIDGET')}
                />
              }
              label="App widget"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.channels.includes('EMAIL')}
                  onChange={() => toggleChannel('EMAIL')}
                />
              }
              label="Email"
            />
          </Stack>
          {existingAlert?.status === 'TRIGGERED' && (
            <Box sx={{ mt: 2, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.resetStatus}
                    onChange={(e) => setForm((prev) => ({ ...prev, resetStatus: e.target.checked }))}
                  />
                }
                label="Re-enable this alert"
              />
            </Box>
          )}
        </Paper>
      </DialogContent>

      <Divider />
      <DialogActions sx={{ px: 3, py: 2 }}>
        {existingAlert && (
          <Button color="error" onClick={handleDelete} disabled={submitting}>
            Delete
          </Button>
        )}
        <Box sx={{ flex: 1 }} />
        <Button onClick={onClose} disabled={submitting}>
          Back
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={submitting || !hasAnyTrigger}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Widget;
