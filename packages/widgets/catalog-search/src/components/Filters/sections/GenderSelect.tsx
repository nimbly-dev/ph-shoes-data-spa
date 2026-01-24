import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const GENDERS = ['male', 'female', 'unisex'] as const;

type Props = {
  value?: string;
  onChange: (gender?: string) => void;
};

export function GenderSelect({ value, onChange }: Props) {
  return (
    <FormControl size="small" fullWidth>
      <InputLabel shrink>Gender</InputLabel>
      <Select
        label="Gender"
        value={value ?? ''}
        onChange={(e) => onChange((e.target.value as string) || undefined)}
        displayEmpty
      >
        <MenuItem value=""><em>All Genders</em></MenuItem>
        {GENDERS.map((g) => (
          <MenuItem key={g} value={g}>
            {g.charAt(0).toUpperCase() + g.slice(1)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
