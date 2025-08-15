import * as React from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

interface AISearchProps {
  onSearch: (nlQuery: string) => void;
  onClear: () => void;
  activeQuery: string;
  placeholder?: string;
  sx?: any;                  // allow parent to pass extra styles
}

export const AISearch: React.FC<AISearchProps> = ({
  onSearch,
  onClear,
  activeQuery,
  placeholder = 'AI Search… e.g. "adidas men’s running under ₱5000"',
  sx,
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [text, setText] = React.useState(activeQuery ?? '');

  React.useEffect(() => {
    setText(activeQuery ?? '');
  }, [activeQuery]);

  const submit = () => {
    const q = text.trim();
    if (q) onSearch(q);
  };

  const clear = () => {
    setText('');
    onClear();
    inputRef.current?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') submit();
    if (e.key === 'Escape') clear();
  };

  const hasText = text.trim().length > 0;

  return (
    <Box
      sx={{
        width: '100%',             // stretch across the content area
        display: 'flex',
        justifyContent: 'flex-start',
        mb: 2,
        ...sx,
      }}
    >
      <TextField
        fullWidth
        size="small"
        variant="outlined"
        inputRef={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        InputLabelProps={{ shrink: false }}
        sx={{
          // taller, clickable field; remove any artificial maxWidth
          maxWidth: '100%',
          '& .MuiOutlinedInput-root': { height: 44 },
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              {/* Clear (X) first, then Search — per your previous layout */}
              {hasText && (
                <IconButton
                  size="small"
                  aria-label="Clear search"
                  onClick={clear}
                  edge="end"
                  sx={{ mr: 0.5 }}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              )}
              <IconButton
                size="small"
                aria-label="Search"
                onClick={submit}
                edge="end"
                disabled={!hasText}
              >
                <SearchIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
};
