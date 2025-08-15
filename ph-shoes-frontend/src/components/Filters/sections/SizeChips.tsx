import React from 'react';
import { Box, Chip } from '@mui/material';

const US_SIZES = [
  '3','3.5','4','4.5','5','5.5','6','6.5','7','7.5','8','8.5','9','9.5',
  '10','10.5','11','11.5','12','12.5','13','14','15'
];

type Props = {
  value?: string[];
  onChange: (sizes?: string[]) => void;
  columns?: number; // NEW
};

export function SizeChips({ value = [], onChange, columns = 5 }: Props) {
  const toggle = (s: string) => {
    const next = value.includes(s) ? value.filter(x => x !== s) : [...value, s];
    onChange(next.length ? next : undefined);
  };

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 1 }}>
      {US_SIZES.map((s) => (
        <Chip
          key={s}
          label={s}
          size="small"
          color={value.includes(s) ? 'primary' : 'default'}
          variant={value.includes(s) ? 'filled' : 'outlined'}
          onClick={() => toggle(s)}
          sx={{ justifySelf: 'stretch' }}
        />
      ))}
    </Box>
  );
}
