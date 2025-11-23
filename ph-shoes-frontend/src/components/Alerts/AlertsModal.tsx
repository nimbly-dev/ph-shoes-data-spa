import React, { useMemo, useState, useEffect } from 'react';
import {
  Box,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  Pagination,
  Stack,
  TextField,
  Tooltip,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
} from '@mui/material';
import { Close, Edit, Delete, Search, Refresh } from '@mui/icons-material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { AlertResponse } from '../../types/alerts';

type Props = {
  open: boolean;
  onClose: () => void;
  alerts: AlertResponse[];
  loading?: boolean;
  onEdit: (alert: AlertResponse) => void;
  onDelete: (alert: AlertResponse) => void;
  onReset?: (alert: AlertResponse) => void;
  onRefresh?: () => void;
  search: string;
  page: number;
  totalPages: number;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
};

const statusColor: Record<string, 'default' | 'success' | 'warning' | 'error'> = {
  ACTIVE: 'success',
  TRIGGERED: 'warning',
  PAUSED: 'default',
};

const PAGE_SIZE = 6;

export function AlertsModal({
  open,
  onClose,
  alerts,
  loading,
  onEdit,
  onDelete,
  onReset,
  onRefresh,
  search,
  page,
  totalPages,
  onSearchChange,
  onPageChange,
}: Props) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      PaperProps={{ sx: { minHeight: 500, maxHeight: '90vh', pb: 0 } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pr: 6 }}>
        <Typography variant="h6" fontWeight={700} sx={{ flex: 1 }}>
          Alerts
        </Typography>
        {onRefresh && (
            <Tooltip title="Reload alerts">
              <span>
                <IconButton size="small" onClick={onRefresh} disabled={loading}>
                  <Refresh fontSize="small" />
                </IconButton>
              </span>
          </Tooltip>
        )}
        <IconButton
          aria-label="Close"
          edge="end"
          onClick={onClose}
          sx={{ position: 'absolute', right: 12, top: 12 }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 2, pb: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Stack spacing={2}>
          <TextField
            size="small"
            placeholder="Search by shoe name or brand…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          <Stack direction="row" spacing={1} alignItems="center">
            <Chip label={`Triggered ${alerts.filter((a) => a.status === 'TRIGGERED').length}`} size="small" />
            <Chip label={`Active ${alerts.filter((a) => a.status !== 'TRIGGERED').length}`} size="small" />
            <Chip label={`Total ${alerts.length}`} size="small" />
          </Stack>

          <Divider />

          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {loading ? (
              <Typography variant="body2">Loading alerts…</Typography>
            ) : alerts.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                {search ? 'No alerts match this search.' : 'No alerts yet.'}
              </Typography>
            ) : (
              <>
                <Box
                  sx={{
                    display: 'grid',
                    gap: 2,
                    gridTemplateColumns: { xs: 'repeat(1, minmax(0, 1fr))', sm: 'repeat(2, minmax(0, 1fr))' },
                  }}
                >
                  {alerts.map((a) => {
                    const hasDiscount =
                      a.productOriginalPrice != null &&
                      a.productCurrentPrice != null &&
                      a.productCurrentPrice < a.productOriginalPrice;
                    return (
                      <Card key={a.productId} variant="outlined" sx={{ height: '100%' }}>
                        <CardActionArea
                          onClick={() => onEdit(a)}
                          sx={{ display: 'flex', alignItems: 'stretch', justifyContent: 'flex-start', gap: 2, p: 1 }}
                        >
                          <CardMedia
                            component="img"
                            image={a.productImageUrl || a.productImage || '/NoImagePlaceholder.png'}
                            alt={a.productName}
                            sx={{ width: 96, height: 96, objectFit: 'contain', borderRadius: 1, flexShrink: 0 }}
                            onError={(e) => {
                              const img = e.currentTarget as HTMLImageElement;
                              if (img.src !== '/NoImagePlaceholder.png') img.src = '/NoImagePlaceholder.png';
                            }}
                          />
                          <CardContent sx={{ p: 1, flex: 1, minWidth: 0 }}>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                              <Typography variant="subtitle1" fontWeight={700} noWrap>
                                {a.productName}
                              </Typography>
                              <Chip
                                size="small"
                                label={a.status}
                                color={statusColor[a.status] || 'default'}
                                sx={{ textTransform: 'capitalize' }}
                              />
                            </Stack>
                            {a.productBrand && (
                              <Typography variant="caption" color="text.secondary" display="block">
                                Brand: {a.productBrand}
                              </Typography>
                            )}
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                              <Typography variant="body2" fontWeight={700}>
                                ₱{(a.productCurrentPrice ?? 0).toLocaleString()}
                              </Typography>
                              {hasDiscount && (
                                <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'text.disabled' }}>
                                  ₱{(a.productOriginalPrice ?? 0).toLocaleString()}
                                </Typography>
                              )}
                            </Stack>
                            <Stack spacing={0.25} sx={{ mt: 0.5 }}>
                              {a.desiredPrice && (
                                <Typography variant="caption">Target: ₱{a.desiredPrice.toLocaleString()}</Typography>
                              )}
                              {a.desiredPercent && (
                                <Typography variant="caption">Discount: {a.desiredPercent}%</Typography>
                              )}
                              {a.alertIfSale && <Typography variant="caption">Alert when on sale</Typography>}
                            </Stack>
                          </CardContent>
                        </CardActionArea>
                      <Stack direction="row" spacing={1} justifyContent="flex-end" px={1} pb={1}>
                        {a.productUrl && (
                          <Tooltip title="Open product">
                            <IconButton size="small" component="a" href={a.productUrl} target="_blank" rel="noopener">
                              <OpenInNewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {a.status === 'TRIGGERED' && onReset && (
                          <Tooltip title="Mark as seen and re-enable this alert">
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => onReset(a)}
                              sx={{ textTransform: 'none' }}
                            >
                              Acknowledge
                            </Button>
                          </Tooltip>
                        )}
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
                        </Stack>
                      </Card>
                    );
                  })}
                </Box>

                {totalPages > 1 && (
                  <Box display="flex" justifyContent="center" mt={1}>
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={(_, p) => onPageChange(p)}
                      shape="rounded"
                      size="small"
                    />
                  </Box>
                )}
              </>
            )}
          </Box>

          <Box display="flex" justifyContent="flex-end" pt={2} borderTop="1px solid" borderColor="divider">
            <Button onClick={onClose}>Close</Button>
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
