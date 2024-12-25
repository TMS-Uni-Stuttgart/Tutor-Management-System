import { createTheme as createMuiTheme, PaletteMode, Theme } from '@mui/material';
import ORANGE from '@mui/material/colors/orange';
import { PaletteOptions } from '@mui/material/styles/createPalette';
import { CSSProperties } from '@mui/styles';

interface ChartStyle {
    backgroundColor: string;
    colors: string[];
    fontStyle: {
        fontName?: string;
        fontSize: number;
        textStyle: {
            color: string;
        };
        titleTextStyle: {
            color: string;
        };
    };
}

declare module '@mui/material/styles/createPalette' {
    interface TypeBackground {
        default: string;
        paper: string;
        appBar: string;
    }

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

declare module '@mui/material/styles/createMixins' {
    interface Mixins {
        scrollbar: (width: number) => CSSProperties;
        chart: (theme: Theme) => ChartStyle;
    }
}

interface ScrollbarCSSOptions {
    mode: PaletteMode;
    width: number;
}

function generateScrollbarCSS({ mode, width }: ScrollbarCSSOptions): CSSProperties {
    return {
        '&::-webkit-scrollbar': {
            width,
        },
        '&::-webkit-scrollbar-track': {
            background: mode === 'light' ? '#fff' : '#424242',
        },
        '&::-webkit-scrollbar-thumb': {
            background: '#888',
        },
        '&::-webkit-scrollbar-thumb:hover': {
            background: '#555',
        },
    };
}

function generateChartStyle(theme: Theme): ChartStyle {
    const backgroundColor = theme.palette.background.paper;
    const fontColor = theme.palette.getContrastText(backgroundColor);
    const dataColor = theme.palette.primary.main;

    return {
        backgroundColor: theme.palette.background.paper,
        colors: [dataColor, '#EF0107'],
        fontStyle: {
            fontName: theme.typography.fontFamily,
            fontSize: theme.typography.fontSize,
            textStyle: {
                color: fontColor,
            },
            titleTextStyle: {
                color: fontColor,
            },
        },
    };
}

export function createTheme(mode: PaletteMode): Theme {
    const palette: PaletteOptions = {
        mode,
        primary: {
            main: mode === 'light' ? '#004191' : '#00a5fe',
        },
        secondary: {
            main: '#00beff',
        },
        background: {
            appBar: '#004191',
        },
        red:
            mode === 'light'
                ? { light: '#ef9a9a', main: '#ef5350', dark: '#e53935' }
                : { light: '#ff988f', main: '#ff6561', dark: '#c63037' },
        green:
            mode === 'light'
                ? { light: '#a5d6a7', main: '#66bb6a', dark: '#43a047' }
                : { light: '#aeffae', main: '#7ae07e', dark: '#46ad50' },
        orange:
            mode === 'light'
                ? { light: '#ff9d3f', main: '#ef6c00', dark: '#b53d00' }
                : { light: '#ffbf45', main: '#ff8e00', dark: '#c55f00' },
        warning: {
            light: ORANGE[300],
            main: ORANGE[500],
            dark: ORANGE[700],
        },
    };

    return createMuiTheme({
        palette,
        mixins: {
            scrollbar: (width) => ({
                ...generateScrollbarCSS({ mode, width }),
            }),
            chart: generateChartStyle,
        },
        components: {
            MuiButton: {
                defaultProps: {
                    variant: 'outlined',
                },
            },
            MuiTextField: {
                defaultProps: {
                    variant: 'outlined',
                },
            },
            MuiChip: {
                styleOverrides: {
                    root: {
                        borderRadius: 8,
                    },
                },
            },
            MuiOutlinedInput: {
                styleOverrides: {
                    root: {
                        '&$disabled': {
                            '&$disabled': {
                                '& > fieldset': {
                                    borderStyle: 'dotted',
                                },
                            },
                        },
                    },
                },
            },
        },
    });
}
