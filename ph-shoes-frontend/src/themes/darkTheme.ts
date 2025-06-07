// src/themes/darkTheme.ts
import { createTheme } from '@mui/material/styles';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',

    primary: {
      main: '#90caf9',    // light blue
    },
    secondary: {
      main: '#f48fb1',    // light pink
    },
    background: {
      default: '#121212',
      paper:    '#1e1e1e',
    },
    text: {
      primary: '#fff',
      secondary: '#bbb',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif'
    ].join(','),
    h1: { fontSize: '2rem', fontWeight: 700 },
    h2: { fontSize: '1.75rem', fontWeight: 600 },
    body1: { fontSize: '1rem' },
  },
});

export default darkTheme;
