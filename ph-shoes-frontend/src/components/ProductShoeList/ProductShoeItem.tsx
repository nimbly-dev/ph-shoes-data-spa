import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Link as MuiLink
} from '@mui/material';
import { ProductShoe } from '../../types/ProductShoe';

interface Props {
  shoe: ProductShoe;
}

const PLACEHOLDER = '/NoImagePlaceholder.png';

export const ProductShoeItem: React.FC<Props> = ({ shoe }) => {
  const src = shoe.image || PLACEHOLDER;
  const productUrl = shoe.url;

  // 1) Build an ISO-ish date string
  const collectedOn = `${shoe.year.toString().padStart(4,'0')}-` +
                      `${shoe.month.toString().padStart(2,'0')}-` +
                      `${shoe.day.toString().padStart(2,'0')}`;

  return (
    <Card sx={{ width: 1, maxWidth: 250 }}>
      <MuiLink href={productUrl} target="_blank" rel="noopener">
        <CardMedia
          component="img"
          src={src}
          alt={shoe.title}
          sx={{ height: 200, objectFit: 'contain' }}
          onError={(e) => {
            const img = e.currentTarget;
            if (img.src !== PLACEHOLDER) img.src = PLACEHOLDER;
          }}
        />
      </MuiLink>

      <CardContent>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          <MuiLink
            href={productUrl}
            target="_blank"
            rel="noopener"
            underline="hover"
            color="inherit"
          >
            {shoe.title}
          </MuiLink>
        </Typography>

        {shoe.subtitle && (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {shoe.subtitle}
          </Typography>
        )}

        <Typography
          variant="caption"
          color="text.secondary"
          display="block"
          gutterBottom
        >
          Brand: {shoe.brand}
        </Typography>

        {/*  Collected-on date, small and muted */}
        <Typography
          variant="caption"
          color="text.disabled"
          display="block"
          gutterBottom
          sx={{ fontStyle: 'italic' }}
        >
          Collected on: {collectedOn}
        </Typography>

        {/* Price Display */}
        <Typography variant="body2" component="div">
          {shoe.priceSale < shoe.priceOriginal ? (
            <>
              <Typography
                component="span"
                variant="body2"
                fontWeight="bold"
                color="primary"
              >
                ₱{shoe.priceSale.toLocaleString()}
              </Typography>{' '}
              <Typography
                component="span"
                variant="body2"
                sx={{ textDecoration: 'line-through', color: 'text.disabled' }}
              >
                ₱{shoe.priceOriginal.toLocaleString()}
              </Typography>
            </>
          ) : (
            <Typography component="span" variant="body2" fontWeight="bold">
              ₱{shoe.priceSale.toLocaleString()}
            </Typography>
          )}
        </Typography>
      </CardContent>
    </Card>
  );
};