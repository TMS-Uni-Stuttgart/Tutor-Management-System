import { PaletteMode, useMediaQuery } from '@mui/material';
import { StyledEngineProvider, Theme, ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { SnackbarProvider } from 'notistack';
import React, { PropsWithChildren, useContext, useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import DialogService, { getDialogOutsideContext } from '../hooks/dialog-service/DialogService';
import { LoginContextProvider } from '../hooks/LoginService';
import { SettingsProvider } from '../hooks/useSettings';
import { RequireChildrenProp } from '../typings/RequireChildrenProp';
import i18n from '../util/lang/configI18N';
import { createTheme } from '../util/styles';

declare module '@mui/styles/defaultTheme' {
  interface DefaultTheme extends Theme {}
}

interface Props {}

type ChangeThemeTypeFunction = (mode: PaletteMode) => void;

const ThemeTypeContext = React.createContext<ChangeThemeTypeFunction>(() => {
  throw new Error(
    `Cannot use useChangeTheme without adding the ContextWrapper somewhere in the app.`
  );
});

function CustomThemeProvider({ children }: RequireChildrenProp): JSX.Element {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [themeType, setThemeType] = useState<PaletteMode>(() => {
    const savedTheme = localStorage.getItem('themeType');
    return savedTheme === 'light' || savedTheme === 'dark'
      ? (savedTheme as PaletteMode)
      : prefersDarkMode
        ? 'dark'
        : 'light';
  });
  const theme = createTheme(themeType);

  useEffect(() => {
    localStorage.setItem('themeType', themeType);
  }, [themeType]);

  return (
    <ThemeTypeContext.Provider value={setThemeType}>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
      </StyledEngineProvider>
    </ThemeTypeContext.Provider>
  );
}

function handleUserConfirmation(message: string, callback: (ok: boolean) => void) {
  const dialog = getDialogOutsideContext();

  dialog.show({
    title: 'Seite verlassen?',
    content: message,
    actions: [
      {
        label: 'Abbrechen',
        onClick: () => {
          dialog.hide();
          callback(false);
        },
        buttonProps: {
          color: 'primary',
          variant: 'outlined',
        },
      },
      {
        label: 'Verlassen',
        onClick: () => {
          dialog.hide();
          callback(true);
        },
        buttonProps: {
          color: 'primary',
          variant: 'contained',
        },
      },
    ],
    DialogProps: {},
  });
}

function ContextWrapper({ children }: PropsWithChildren<Props>): JSX.Element {
  return (
    <I18nextProvider i18n={i18n}>
      <CustomThemeProvider>
        <LoginContextProvider>
          <SettingsProvider>
            <LocalizationProvider dateAdapter={AdapterLuxon}>
              <SnackbarProvider
                maxSnack={3}
                anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
              >
                <DialogService>{children}</DialogService>
              </SnackbarProvider>
            </LocalizationProvider>
          </SettingsProvider>
        </LoginContextProvider>
      </CustomThemeProvider>
    </I18nextProvider>
  );
}

export function useChangeTheme(): ChangeThemeTypeFunction {
  const changeTheme = useContext(ThemeTypeContext);

  return changeTheme;
}

export default ContextWrapper;
