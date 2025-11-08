import React from 'react';
import { Box, Slider, Typography } from '@mui/material';

type Props = {
  value?: { min?: number; max?: number };
  onChange: (v: { min?: number; max?: number }) => void;
  min?: number;
  max?: number;
  step?: number;
};

export function PriceRange({
  value,
  onChange,
  min = 0,
  max = 20000,
  step = 100,
}: Props) {
  const lo = value?.min ?? min;
  const hi = value?.max ?? max;

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        Price (₱)
      </Typography>
      <Slider
        value={[lo, hi]}
        min={min}
        max={max}
        step={step}
        valueLabelDisplay="auto"
        onChange={(_, v) => {
          const [nlo, nhi] = v as number[];
          onChange({ min: nlo, max: nhi });
        }}
      />
      <Typography variant="caption" color="text.secondary">
        ₱{lo.toLocaleString()} — ₱{hi.toLocaleString()}
      </Typography>
    </Box>
  );
}
