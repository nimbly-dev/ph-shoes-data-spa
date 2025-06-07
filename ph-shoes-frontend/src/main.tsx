import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AppThemeProvider } from './themes/ThemeContext';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <AppThemeProvider>
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <App />
    </LocalizationProvider>
  </AppThemeProvider>
);
