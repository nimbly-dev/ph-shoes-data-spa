// src/components/FilterControls/FilterControls.tsx

import React, { useState, useEffect } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  FormControlLabel,
  Checkbox,
  SelectChangeEvent,
  Popover,
} from '@mui/material';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';  
import { formatISO } from 'date-fns';
import { UIProductFilters } from '../../types/UIProductFilters';

const BRANDS = ['nike', 'adidas', 'newbalance', 'asics', 'worldbalance', 'hoka'] as const;
const GENDERS = ['male', 'female', 'unisex'] as const;
const CONTROL_MIN_WIDTH = 120;

interface Props {
  filters: UIProductFilters;
  onChange: (newFilters: UIProductFilters) => void;
}

export const FilterControls: React.FC<Props> = ({ filters, onChange }) => {
  // ---- Date‐range state ----
  const [range, setRange] = useState([{
    key: 'selection',
    startDate: filters.startDate ? new Date(filters.startDate) : new Date(),
    endDate:   filters.endDate   ? new Date(filters.endDate)   : new Date(),
  }]);

  // Anchor for popover
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    const sel = range[0];
    onChange({
      ...filters,
      startDate: sel.startDate
        ? formatISO(sel.startDate, { representation: 'date' })
        : undefined,
      endDate:   sel.endDate
        ? formatISO(sel.endDate,   { representation: 'date' })
        : undefined,
      date: undefined,
    });
  }, [range]);

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);

  // Common handlers
  const handleSelect =
    <K extends keyof UIProductFilters>(key: K) =>
    (e: SelectChangeEvent<string>) => {
      onChange({ ...filters, [key]: e.target.value || undefined });
    };

  const handleKeyword = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, keyword: e.target.value || undefined });
  };

  const handleOnSale = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, onSale: e.target.checked || undefined });
  };

  // Format display text: "YYYY-MM-DD → YYYY-MM-DD"
  const displayRange = filters.startDate && filters.endDate
    ? `${filters.startDate} → ${filters.endDate}`
    : '';

  return (
    <Box
      display="flex"
      flexWrap="wrap"
      justifyContent="center"
      alignItems="flex-start"
      gap={2}
      mt={2}
      mb={1}
    >
      {/* Brand */}
      <FormControl size="small" sx={{ minWidth: CONTROL_MIN_WIDTH }}>
        <InputLabel>Brand</InputLabel>
        <Select
          label="Brand"
          value={filters.brand ?? ''}
          onChange={handleSelect('brand')}
          renderValue={v => v || 'All Brands'}
        >
          <MenuItem value=""><em>All Brands</em></MenuItem>
          {BRANDS.map(b => (
            <MenuItem key={b} value={b}>
              {b.charAt(0).toUpperCase() + b.slice(1)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Gender */}
      <FormControl size="small" sx={{ minWidth: CONTROL_MIN_WIDTH }}>
        <InputLabel>Gender</InputLabel>
        <Select
          label="Gender"
          value={filters.gender ?? ''}
          onChange={handleSelect('gender')}
          renderValue={v => v || 'All Genders'}
        >
          <MenuItem value=""><em>All Genders</em></MenuItem>
          {GENDERS.map(g => (
            <MenuItem key={g} value={g}>
              {g.charAt(0).toUpperCase() + g.slice(1)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Date-range dropdown */}
      <Box sx={{ minWidth: CONTROL_MIN_WIDTH * 2, flexGrow: 1, maxWidth: 400 }}>
        <TextField
          size="small"
          label="Collected on Date Range"
          value={displayRange}
          placeholder="Select date range"
          onClick={handleOpen}
          InputProps={{ readOnly: true }}
          fullWidth
        />
          <Popover
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top',    horizontal: 'left' }}


            PaperProps={{
              sx: {
                bgcolor:      'background.paper',
                color:        'text.primary',
                borderRadius: 1,
                boxShadow:    3,
                mt:           1,
                maxHeight:   '80vh',
                overflow:    'auto',
              },
            }}
          >
            <DateRange
              ranges={range}
              onChange={r => setRange([r.selection])}
              showSelectionPreview
              moveRangeOnFirstSelection={false}
              retainEndDateOnFirstSelection
              months={1}
              direction="horizontal"
            />
          </Popover>



      </Box>

      {/* Keyword */}
      <Box sx={{ minWidth: CONTROL_MIN_WIDTH, flexGrow: 1, maxWidth: 400 }}>
        <TextField
          label="Keyword"
          placeholder="e.g. court"
          size="small"
          value={filters.keyword ?? ''}
          onChange={handleKeyword}
          fullWidth
        />
      </Box>

      {/* On Sale Only */}
      <Box sx={{ minWidth: CONTROL_MIN_WIDTH, display: 'flex', alignItems: 'center' }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={!!filters.onSale}
              onChange={handleOnSale}
              size="small"
            />
          }
          label="On Sale Only"
        />
      </Box>
    </Box>
  );
};
