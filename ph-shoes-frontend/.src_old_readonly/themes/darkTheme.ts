import { createTheme } from '@mui/material/styles';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      light: '#a6c8ff',     
      main:  '#90caf9',
      dark:  '#1976d2',    
      contrastText: '#000', // black text on your light button
    },
    secondary: { main: '#f48fb1' },
    background: {
      default: '#121212',
      paper:   '#1e1e1e',
    },
    text: {
      primary:   '#ffffff',
      secondary: '#bbbbbb',
    },
  },
  typography: {
    fontFamily: ['Roboto','"Helvetica Neue"','Arial','sans-serif'].join(','),
    h1:   { fontSize: '2rem',   fontWeight: 700 },
    h2:   { fontSize: '1.75rem', fontWeight: 600 },
    body1:{ fontSize: '1rem' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '.MuiOutlinedInput-input, .MuiFilledInput-input': {
          caretColor: '#90caf9',
        },
        '::selection': {
          backgroundColor: '#90caf9',
          color: '#000',
        },
        '::-moz-selection': {             // Firefox
          backgroundColor: '#90caf9',
          color: '#000',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e1e1e',        
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#888888',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#90caf9',
          },
        },
        input: {
          userSelect: 'none',
          color: '#ffffff',
          '&::placeholder': {                 
            color: '#777777',
            opacity: 1,
          },
          '&::selection': {
            backgroundColor: '#90caf9',   
            color: '#000',
          },
        },
      },
    },
    MuiFilledInput: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e1e1e',
          '&:hover': {
            backgroundColor: '#2c2c2c',
          },
          '&.Mui-focused': {
            backgroundColor: '#2c2c2c',
          },
        },
        input: {
          color: '#ffffff',
          '&::placeholder': {
            color: '#777777',
            opacity: 1,
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: '#bbbbbb',
          '&.Mui-focused': {
            color: '#ffffff',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          color: '#ffffff',
        },
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1e1e1e',
          color:           '#ffffff',
        },
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        label: {
          color: '#ffffff',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        containedPrimary: ({ theme }) => ({
          backgroundColor: theme.palette.primary.dark,
          color:           theme.palette.primary.contrastText,
          '&:hover': {
            backgroundColor: theme.palette.primary.main,
          },
        }),
      },
    },
  },
});

export default darkTheme;
