// src/themes/lightTheme.ts
import { createTheme } from '@mui/material/styles';

const lightTheme = createTheme({
  palette: {
    mode: 'light',

    primary:   { main: '#1976d2' }, // classic blue
    secondary: { main: '#dc004e' }, // pinkish-red

    background: {
      default: '#fafafa',
      paper:   '#ffffff',
    },
    text: {
      primary:   '#212121',
      secondary: '#555555',
    },
  },

  typography: {
    fontFamily: ['Roboto','"Helvetica Neue"','Arial','sans-serif'].join(','),
    h1:   { fontSize: '2rem',   fontWeight: 700 },
    h2:   { fontSize: '1.75rem', fontWeight: 600 },
    body1:{ fontSize: '1rem' },
  },

  components: {
    // 1) (Optional) CssBaseline overrides for react-date-range in light mode
    //    The library ships its own default.css, but you can reinforce
    //    backgrounds and text color to blend with MUI's light palette.
    MuiCssBaseline: {
      styleOverrides: {
        '.rdrCalendarWrapper, .rdrDateRangeWrapper': {
          backgroundColor: '#ffffff',
          color:           '#212121',
        },
        '.rdrMonthAndYearWrapper': {
          backgroundColor: '#f5f5f5',
          color:           '#212121',
        },
        '.rdrNextPrevButton': {
          color: '#1976d2',
        },
        '.rdrDay': {
          color: '#212121',
        },
        '.rdrDayDisabled .rdrDayNumber': {
          color: '#cccccc',
        },
        '.rdrDaySelected .rdrDayNumber, .rdrDayInRange .rdrDayNumber': {
          backgroundColor: '#1976d2',
          color:           '#ffffff',
        },
        '.rdrDayToday .rdrDayNumber': {
          borderColor: '#dc004e',
        },
        '.rdrDateDisplayWrapper, .rdrDateDisplayItem, .rdrDateDisplayItem input': {
          backgroundColor: '#fafafa',
          color:           '#212121',
        },
      },
    },

    // 2) Outlined inputs (TextField & Select) in light mode
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#cccccc',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#aaaaaa',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#1976d2',
          },
        },
        input: {
          color: '#212121',
        },
      },
    },

    // 3) Select text color
    MuiSelect: {
      styleOverrides: {
        root: {
          color: '#212121',
        },
      },
    },

    // 4) Popover background for light mode (if you want to override it)
    MuiPopover: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
          color:           '#212121',
        },
      },
    },

    // 5) Checkbox label color
    MuiFormControlLabel: {
      styleOverrides: {
        label: {
          color: '#212121',
        },
      },
    },
  },
});

export default lightTheme;
