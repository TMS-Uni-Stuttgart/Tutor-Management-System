import DateFnsUtils from '@date-io/date-fns';
import { PaletteType } from '@material-ui/core';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { ThemeProvider } from '@material-ui/styles';
import deLocale from 'date-fns/locale/de';
import { SnackbarProvider } from 'notistack';
import React, { PropsWithChildren, useState, useContext } from 'react';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouterProps } from 'react-router';
import { BrowserRouterProps } from 'react-router-dom';
import DialogService from '../hooks/DialogService';
import { LoginContextProvider } from '../hooks/LoginService';
import i18n from '../util/lang/configI18N';
import { createTheme } from '../util/styles';

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
  // TODO: Get user preferences via media query
  const [themeType, setThemeType] = useState<PaletteType>('light');
  const theme = createTheme(themeType);

  return (
    <ThemeTypeContext.Provider value={setThemeType}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeTypeContext.Provider>
  );
}

function ContextWrapper({ children, Router }: PropsWithChildren<Props>): JSX.Element {
  return (
    <I18nextProvider i18n={i18n}>
      <CustomThemeProvider>
        <LoginContextProvider>
          <MuiPickersUtilsProvider utils={DateFnsUtils} locale={deLocale}>
            <SnackbarProvider
              maxSnack={3}
              // anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
              <DialogService>
                <Router>{children}</Router>
              </DialogService>
            </SnackbarProvider>
          </MuiPickersUtilsProvider>
        </LoginContextProvider>
      </CustomThemeProvider>
    </I18nextProvider>
  );
}

export function useChangeTheme() {
  const changeTheme = useContext(ThemeTypeContext);

  return changeTheme;
}

export default ContextWrapper;
