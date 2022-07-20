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
