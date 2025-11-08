import React from 'react';
import {
  Card, CardContent, CardMedia, Typography, Link as MuiLink, CardActionArea, Box
} from '@mui/material';
import { ProductShoe } from '../../types/ProductShoe';

interface Props { shoe: ProductShoe; }

const PLACEHOLDER = '/NoImagePlaceholder.png';

export const ProductShoeItem: React.FC<Props> = ({ shoe }) => {
  const src = shoe.image || PLACEHOLDER;
  const productUrl = shoe.url;
  const collectedOn = `${String(shoe.year).padStart(4,'0')}-${String(shoe.month).padStart(2,'0')}-${String(shoe.day).padStart(2,'0')}`;

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
      <CardActionArea component={MuiLink} href={productUrl} target="_blank" rel="noopener" sx={{ alignItems: 'stretch' }}>
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
            Collected on: {collectedOn}
          </Typography>

          {/* Price */}
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
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
