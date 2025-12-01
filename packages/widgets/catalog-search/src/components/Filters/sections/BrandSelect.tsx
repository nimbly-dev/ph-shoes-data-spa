import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const BRANDS = ['nike', 'adidas', 'newbalance', 'asics', 'worldbalance', 'hoka'] as const;

type Props = {
  value?: string;
  onChange: (brand?: string) => void;
};

export function BrandSelect({ value, onChange }: Props) {
  return (
    <FormControl size="small" fullWidth>
      <InputLabel>Brand</InputLabel>
      <Select
        label="Brand"
        value={value ?? ''}
        onChange={(e) => onChange((e.target.value as string) || undefined)}
        renderValue={(v) => (v ? v : 'All Brands')}
      >
        <MenuItem value=""><em>All Brands</em></MenuItem>
        {BRANDS.map((b) => (
          <MenuItem key={b} value={b}>
            {b.charAt(0).toUpperCase() + b.slice(1)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
