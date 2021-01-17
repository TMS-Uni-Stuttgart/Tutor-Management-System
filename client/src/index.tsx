import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import 'reflect-metadata';
import ContextWrapper from './components/ContextWrapper';
import App from './pages/App';

ReactDOM.render(
  <ContextWrapper Router={BrowserRouter}>
    <App />
  </ContextWrapper>,
  document.getElementById('root')
);

// Hot Module Replacement (HMR) - Remove this snippet to remove HMR.
// Learn more: https://www.snowpack.dev/#hot-module-replacement
if (import.meta.hot) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  import.meta.hot!.accept();
}

export function isDevelopment(): boolean {
  return import.meta.env.NODE_ENV === 'development';
}
