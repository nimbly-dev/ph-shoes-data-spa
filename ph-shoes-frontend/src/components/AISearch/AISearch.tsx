import React, { useState } from 'react';
import { Stack, TextField, Button } from '@mui/material';
import { Search } from '@mui/icons-material';

interface AISearchProps {
  onSearch: (nlQuery: string) => void;
  onClear: () => void;
  activeQuery: string;
}

export const AISearch: React.FC<AISearchProps> = ({
  onSearch,
  onClear,
  activeQuery,
}) => {
  const [text, setText] = useState<string>('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && text.trim()) {
      onSearch(text.trim());
    }
  };

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1}
      alignItems="center"
      justifyContent="center"
      mb={3}
      sx={{
        width: '100%',
        px: { xs: 2, sm: 0 }, // small horizontal padding on xs
      }}
    >
      <TextField
        label="AI Search…"
        placeholder="e.g. “Adidas men’s running shoes under ₱5000”"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        size="small"
        fullWidth
        sx={{
          maxWidth: { xs: '100%', sm: 400 },
        }}
      />

      <Button
        variant="contained"
        startIcon={<Search />}
        onClick={() => {
          if (text.trim()) {
            onSearch(text.trim());
          }
        }}
        disabled={!text.trim()}
        sx={{
          width: { xs: '100%', sm: 'auto' },
        }}
      >
        Search AI
      </Button>

      {activeQuery && (
        <Button
          onClick={onClear}
          color="secondary"
          sx={{
            width: { xs: '100%', sm: 'auto' },
          }}
        >
          Clear AI
        </Button>
      )}
    </Stack>
  );
};
