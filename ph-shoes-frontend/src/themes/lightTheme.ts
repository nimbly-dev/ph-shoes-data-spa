// src/themes/lightTheme.ts
import { createTheme } from '@mui/material/styles';

const lightTheme = createTheme({
  palette: {
    mode: 'light',

    primary: {
      main: '#1976d2',    // classic blue
    },
    secondary: {
      main: '#dc004e',    // pinkish-red
    },
    background: {
      default: '#fafafa',
      paper:    '#fff',
    },
    text: {
      primary: '#212121',
      secondary: '#555',
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

export default lightTheme;
