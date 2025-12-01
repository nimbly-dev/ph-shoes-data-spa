import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Link as MuiLink,
  CardActionArea,
  Box,
  IconButton,
  Tooltip,
  Chip,
  Stack,
} from '@mui/material';
import { ProductShoe } from '@commons/types/ProductShoe';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';

interface Props {
  shoe: ProductShoe;
  onAlert?: (shoe: ProductShoe) => void;
  isAlerted?: boolean;
}

const PLACEHOLDER = '/NoImagePlaceholder.png';

export const ProductShoeItem: React.FC<Props> = ({ shoe, onAlert, isAlerted }) => {
  const src = shoe.image || PLACEHOLDER;
  const productUrl = shoe.url || '#';
  const hasCollectedDate =
    typeof shoe.year === 'number' &&
    typeof shoe.month === 'number' &&
    typeof shoe.day === 'number';
  const collectedOn = hasCollectedDate
    ? `${String(shoe.year).padStart(4, '0')}-${String(shoe.month).padStart(2, '0')}-${String(shoe.day).padStart(2, '0')}`
    : null;

  return (
    <Card
      elevation={0}
      sx={{
        width: 1,
        border: 'none',                 // 💡 no outline
        boxShadow: 'none',              // 💡 no shadow by default
        backgroundColor: 'transparent', // make it feel like a tile, not a card
        transition: 'transform .18s ease, box-shadow .18s ease, background-color .18s ease',
        '&:hover': {
          backgroundColor: 'background.paper',
          boxShadow: (t) => t.shadows[2],   // subtle hover lift (Nike-ish)
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardActionArea
        component={MuiLink}
        href={productUrl}
        target="_blank"
        rel="noopener"
        sx={{ alignItems: 'stretch', position: 'relative' }}
      >
        {onAlert && (
          <Tooltip title={isAlerted ? 'Alert set' : 'Set alert'}>
            <IconButton
              size="small"
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: isAlerted ? 'rgba(46, 204, 113, 0.18)' : 'rgba(255,255,255,0.85)',
                color: isAlerted ? 'success.main' : 'inherit',
                boxShadow: isAlerted ? '0 0 0 6px rgba(46,204,113,0.12)' : 'none',
                transition: 'all .2s ease',
                '&:hover': {
                  bgcolor: isAlerted ? 'rgba(46, 204, 113, 0.24)' : 'rgba(255,255,255,1)',
                  boxShadow: isAlerted ? '0 0 0 8px rgba(46,204,113,0.16)' : 'none',
                },
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAlert(shoe);
              }}
            >
              {isAlerted ? <NotificationsActiveIcon fontSize="small" /> : <NotificationsNoneIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        )}
        {/* Image block */}
        <Box sx={{ px: 2, pt: 2 }}>
          <CardMedia
            component="img"
            src={src}
            alt={shoe.title}
            sx={{ height: 240, objectFit: 'contain' }}  // (tweak to 260 if you want bigger imagery)
            onError={(e) => {
              const img = e.currentTarget;
              if (img.src !== PLACEHOLDER) img.src = PLACEHOLDER;
            }}
          />
        </Box>

        {/* Text block */}
        <CardContent sx={{ px: 2, pb: 2, pt: 1.25 }}>
          <Typography
            variant="subtitle1"
            fontWeight="bold"
            gutterBottom
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: 48,
            }}
          >
            {shoe.title}
          </Typography>

          {shoe.subtitle && (
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {shoe.subtitle}
            </Typography>
          )}

          <Typography variant="caption" color="text.secondary" display="block">
            Brand: {shoe.brand}
          </Typography>
          <Typography variant="caption" color="text.disabled" display="block" sx={{ fontStyle: 'italic', mb: 0.5 }}>
            {collectedOn ? `Collected on: ${collectedOn}` : 'Sourced via AI search'}
          </Typography>

          {/* Price + alert inline */}
          <Stack direction="row" spacing={1} alignItems="center">
            {shoe.priceSale < shoe.priceOriginal ? (
              <Box component="span">
                <Typography component="span" variant="body2" fontWeight="bold" color="primary">
                  ₱{shoe.priceSale.toLocaleString()}
                </Typography>{' '}
                <Typography component="span" variant="body2" sx={{ textDecoration: 'line-through', color: 'text.disabled' }}>
                  ₱{shoe.priceOriginal.toLocaleString()}
                </Typography>
              </Box>
            ) : (
              <Typography component="span" variant="body2" fontWeight="bold">
                ₱{shoe.priceSale.toLocaleString()}
              </Typography>
            )}
            {isAlerted && (
              <Chip
                label="Alert set"
                size="small"
                color="success"
                sx={{ fontWeight: 700, letterSpacing: 0.3 }}
              />
            )}
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
