import { createMuiTheme, Theme, PaletteType } from '@material-ui/core';
import ORANGE from '@material-ui/core/colors/orange';

declare module '@material-ui/core/styles/createPalette' {
  interface Palette {
    warning: Omit<SimplePaletteColorOptions, 'contrastText'>;
    red: Omit<SimplePaletteColorOptions, 'contrastText'>;
    green: Omit<SimplePaletteColorOptions, 'contrastText'>;
  }

  interface PaletteOptions {
    warning: Palette['warning'];
    red: Palette['red'];
    green: Palette['green'];
  }
}

export function createTheme(type: PaletteType): Theme {
  return createMuiTheme({
    palette: {
      type,
      primary: {
        main: type === 'light' ? '#004191' : '#00beff',
      },
      secondary: {
        main: '#00beff',
      },
      red: {
        light: '#ef9a9a',
        main: '#ef5350',
        dark: '#e53935',
      },
      green: {
        light: '#a5d6a7',
        main: '#66bb6a',
        dark: '#43a047',
      },
      warning: {
        light: ORANGE[300],
        main: ORANGE[500],
        dark: ORANGE[700],
      },
    },
  });
}
