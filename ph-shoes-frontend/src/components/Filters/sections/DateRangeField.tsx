import React, { useMemo, useState, useEffect } from 'react';
import { Box, TextField, Popover } from '@mui/material';
import { DateRange } from 'react-date-range';
import { formatISO } from 'date-fns';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

type Props = {
  startDate?: string;
  endDate?: string;
  onChange: (startISO?: string, endISO?: string) => void;
};

const getYesterday = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d;
};

export function DateRangeField({ startDate, endDate, onChange }: Props) {
  const initialStart = startDate ? new Date(startDate) : getYesterday();
  const initialEnd   = endDate   ? new Date(endDate)   : getYesterday();

  const [range, setRange] = useState([{ key: 'sel', startDate: initialStart, endDate: initialEnd }]);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const r = range[0];
    onChange(
      r.startDate ? formatISO(r.startDate, { representation: 'date' }) : undefined,
      r.endDate   ? formatISO(r.endDate,   { representation: 'date' }) : undefined
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  const label = useMemo(() => {
    if (startDate && endDate) return `${startDate} → ${endDate}`;
    return '';
  }, [startDate, endDate]);

  return (
    <Box>
      <TextField
        size="small"
        label="Collected Date Range"
        value={label}
        placeholder="Select date range"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        InputProps={{ readOnly: true }}
        fullWidth
      />
      <Popover
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top',    horizontal: 'left' }}
        PaperProps={{ sx: { bgcolor: 'background.paper', color: 'text.primary', mt: 1 } }}
      >
        <DateRange
          ranges={range as any}
          onChange={(r: any) => setRange([r.selection])}
          showSelectionPreview
          moveRangeOnFirstSelection={false}
          retainEndDateOnFirstSelection
          months={1}
          direction="horizontal"
        />
      </Popover>
    </Box>
  );
}
