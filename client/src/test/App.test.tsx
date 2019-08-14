import { createMuiTheme } from '@material-ui/core';
import React from 'react';
import ReactDOM from 'react-dom';
import { MemoryRouter } from 'react-router';
import ContextWrapper from '../components/ContextWrapper';
import App from '../view/App';

test('renders without crashing', () => {
  const rootDiv = document.createElement('div');
  const theme = createMuiTheme();

  ReactDOM.render(
    <ContextWrapper theme={theme} Router={MemoryRouter}>
      <App />
    </ContextWrapper>,
    rootDiv
  );
  ReactDOM.unmountComponentAtNode(rootDiv);
});
