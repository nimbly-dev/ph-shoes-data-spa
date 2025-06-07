// src/themes/darkTheme.ts
import { createTheme } from '@mui/material/styles';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',

    primary: { main: '#90caf9' },
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
    // 1) Global CSS overrides (via CssBaseline) for react-date-range
    MuiCssBaseline: {
      styleOverrides: {
        // Outermost wrapper
        '.rdrCalendarWrapper, .rdrDateRangeWrapper': {
          backgroundColor: '#1e1e1e',
          color:           '#ffffff',
        },
        // Month header
        '.rdrMonthAndYearWrapper': {
          backgroundColor: '#1e1e1e',
          color:           '#ffffff',
        },
        '.rdrNextPrevButton': {
          color: '#ffffff',
        },
        // Day cells
        '.rdrDay': {
          color: '#cccccc',
        },
        '.rdrDayNumber span': {
          color: '#cccccc',
        },
        '.rdrDayDisabled .rdrDayNumber': {
          color: '#555555',
        },
        '.rdrDaySelected .rdrDayNumber, .rdrDayInRange .rdrDayNumber': {
          backgroundColor: '#90caf9',
          color:           '#000000',
        },
        '.rdrDayToday .rdrDayNumber': {
          borderColor:     '#f48fb1',
          color:           '#ffffff',
        },
        // Inputs inside the date picker display
        '.rdrDateDisplayWrapper, .rdrDateDisplayItem, .rdrDateDisplayItem input': {
          backgroundColor: '#121212',
          color:           '#ffffff',
        },
      },
    },

    // 2) Outlined inputs (used by TextField and Select)
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#555555',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#888888',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#90caf9',
          },
        },
        input: {
          color: '#ffffff',
        },
      },
    },

    // 3) Select text color
    MuiSelect: {
      styleOverrides: {
        root: {
          color: '#ffffff',
        },
      },
    },

    // 4) Popover background (the wrapper around the date-range)
    MuiPopover: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1e1e1e',
          color:           '#ffffff',
        },
      },
    },

    // 5) Checkbox label color
    MuiFormControlLabel: {
      styleOverrides: {
        label: {
          color: '#ffffff',
        },
      },
    },
  },
});

export default darkTheme;
