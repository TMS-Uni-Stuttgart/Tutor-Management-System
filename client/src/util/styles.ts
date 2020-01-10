import { createMuiTheme, Theme, PaletteType } from '@material-ui/core';
import ORANGE from '@material-ui/core/colors/orange';
import { CSSProperties } from '@material-ui/styles';

declare module '@material-ui/core/styles/createPalette' {
  interface Palette {
    green: Omit<SimplePaletteColorOptions, 'contrastText'>;
    orange: Omit<SimplePaletteColorOptions, 'contrastText'>;
    red: Omit<SimplePaletteColorOptions, 'contrastText'>;
  }

  interface PaletteOptions {
    green: Palette['green'];
    orange: Palette['orange'];
    red: Palette['red'];
  }
}

declare module '@material-ui/core/styles/createMixins' {
  interface Mixins {
    scrollbar: (width: number) => CSSProperties;
  }
}

interface ScrollbarCSSOptions {
  type: PaletteType;
  width: number;
}

function generateScrollbarCSS({ type, width }: ScrollbarCSSOptions): CSSProperties {
  return {
    '&::-webkit-scrollbar': {
      width,
    },
    '&::-webkit-scrollbar-track': {
      background: type === 'light' ? '#fff' : '#424242',
    },
    '&::-webkit-scrollbar-thumb': {
      background: '#888',
    },
    '&::-webkit-scrollbar-thumb:hover': {
      background: '#555',
    },
  };
}

export function createTheme(type: PaletteType): Theme {
  return createMuiTheme({
    palette: {
      type,
      primary: {
        main: type === 'light' ? '#004191' : '#00a5fe',
      },
      secondary: {
        main: '#00beff',
      },
      red:
        type === 'light'
          ? {
              light: '#ef9a9a',
              main: '#ef5350',
              dark: '#e53935',
            }
          : {
              // light: '',
              main: '#ff6561',
              // dark: '',
            },
      green:
        type === 'light'
          ? {
              light: '#a5d6a7',
              main: '#66bb6a',
              dark: '#43a047',
            }
          : {
              main: '#7ae07e',
            },
      orange: type === 'light' ? { main: '#ef6c00' } : { main: '#ff8e00' },
      warning: {
        light: ORANGE[300],
        main: ORANGE[500],
        dark: ORANGE[700],
      },
    },
    mixins: {
      scrollbar: width => ({
        ...generateScrollbarCSS({ type, width }),
      }),
    },
  });
}
