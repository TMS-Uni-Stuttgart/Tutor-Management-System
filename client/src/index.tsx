import { Theme } from '@material-ui/core';
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import ContextWrapper from './components/ContextWrapper';
import * as serviceWorker from './serviceWorker';
import { createTheme } from './util/styles';
import App from './view/App';

const theme: Theme = createTheme();

ReactDOM.render(
  <ContextWrapper theme={theme} Router={BrowserRouter}>
    <App />
  </ContextWrapper>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
