import React from 'react';
import { FormControlLabel, Checkbox } from '@mui/material';

type Props = { checked: boolean; onChange: (val: boolean) => void };

export function OnSaleToggle({ checked, onChange }: Props) {
  return (
    <FormControlLabel
      control={<Checkbox size="small" checked={checked} onChange={(e) => onChange(e.target.checked)} />}
      label="On Sale Only"
    />
  );
}
