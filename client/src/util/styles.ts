import { createMuiTheme, Theme } from '@material-ui/core';

declare module '@material-ui/core/styles/createPalette' {
  interface Palette {
    red: Omit<SimplePaletteColorOptions, 'contrastText'>;
    green: Omit<SimplePaletteColorOptions, 'contrastText'>;
  }

  interface PaletteOptions {
    red: Omit<SimplePaletteColorOptions, 'contrastText'>;
    green: Omit<SimplePaletteColorOptions, 'contrastText'>;
  }
}

export function createTheme(): Theme {
  return createMuiTheme({
    palette: {
      primary: {
        main: '#004191',
        // main: '#d00',
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
      // },
      // secondary: {
      //   light: '#ffa270',
      //   main: '#ff7043',
      //   dark: '#c63f17'
      // }
    },
  });
}
