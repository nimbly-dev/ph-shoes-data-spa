import React from 'react';
import { TextField } from '@mui/material';

type Props = { value?: string; onChange: (keyword?: string) => void };

export function KeywordField({ value, onChange }: Props) {
  return (
    <TextField
      size="small"
      label="Keyword"
      placeholder="e.g. court, trail, leather"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value || undefined)}
      fullWidth
    />
  );
}
