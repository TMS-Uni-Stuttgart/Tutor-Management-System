import LuxonUtils from '@date-io/luxon';
import { PaletteType, useMediaQuery } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/core/styles';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { SnackbarProvider } from 'notistack';
import React, { PropsWithChildren, useContext, useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouterProps } from 'react-router';
import { BrowserRouterProps } from 'react-router-dom';
import DialogService, { getDialogOutsideContext } from '../hooks/DialogService';
import { LoginContextProvider } from '../hooks/LoginService';
import i18n from '../util/lang/configI18N';
import { createTheme } from '../util/styles';
import { getRouteWithPrefix } from '../util/routePrefix';

interface Props {
  Router: React.ComponentType<MemoryRouterProps | BrowserRouterProps>;
}

type ChangeThemeTypeFunction = (type: PaletteType) => void;

const ThemeTypeContext = React.createContext<ChangeThemeTypeFunction>(() => {
  throw new Error(
    `Cannot use useChangeTheme without adding the ContextWrapper somewhere in the app.`
  );
});

function CustomThemeProvider({ children }: PropsWithChildren<{}>): JSX.Element {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [themeType, setThemeType] = useState<PaletteType>(prefersDarkMode ? 'dark' : 'light');
  const theme = createTheme(themeType);

  useEffect(() => {
    setThemeType(prefersDarkMode ? 'dark' : 'light');
  }, [prefersDarkMode]);

  return (
    <ThemeTypeContext.Provider value={setThemeType}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
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

function ContextWrapper({ children, Router }: PropsWithChildren<Props>): JSX.Element {
  return (
    <Router getUserConfirmation={handleUserConfirmation} basename={getRouteWithPrefix('')}>
      <I18nextProvider i18n={i18n}>
        <CustomThemeProvider>
          <LoginContextProvider>
            <MuiPickersUtilsProvider locale={navigator.language ?? 'de'} utils={LuxonUtils}>
              <SnackbarProvider maxSnack={3}>
                <DialogService>{children}</DialogService>
              </SnackbarProvider>
            </MuiPickersUtilsProvider>
          </LoginContextProvider>
        </CustomThemeProvider>
      </I18nextProvider>
    </Router>
  );
}

export function useChangeTheme() {
  const changeTheme = useContext(ThemeTypeContext);

  return changeTheme;
}

export default ContextWrapper;
