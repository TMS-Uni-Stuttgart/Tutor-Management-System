import DateFnsUtils from '@date-io/date-fns';
import { Theme } from '@material-ui/core';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { ThemeProvider } from '@material-ui/styles';
import deLocale from 'date-fns/locale/de';
import { SnackbarProvider } from 'notistack';
import React, { PropsWithChildren } from 'react';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouterProps } from 'react-router';
import { BrowserRouterProps } from 'react-router-dom';
import DialogService from '../hooks/DialogService';
import { LoginContextProvider } from '../hooks/LoginService';
import i18n from '../util/lang/configI18N';

interface Props {
  theme: Theme;
  Router: React.ComponentType<MemoryRouterProps | BrowserRouterProps>;
}

function ContextWrapper({ children, theme, Router }: PropsWithChildren<Props>): JSX.Element {
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider theme={theme}>
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
      </ThemeProvider>
    </I18nextProvider>
  );
}

export default ContextWrapper;
