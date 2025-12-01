import React, { createContext, useMemo, useState, ReactNode } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import lightTheme from './lightTheme';
import darkTheme from './darkTheme';

interface Context {
  mode: 'light' | 'dark';
  toggleMode: () => void;
}

export const ColorModeContext = createContext<Context>({
  mode: 'light',
  toggleMode: () => {},
});

export const AppThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  const colorMode = useMemo(
    () => ({
      mode,
      toggleMode: () => {
        setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
      },
    }),
    [mode],
  );

  const theme = useMemo(() => (mode === 'light' ? lightTheme : darkTheme), [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};
