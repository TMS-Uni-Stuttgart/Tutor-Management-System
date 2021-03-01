import React from 'react';
import ReactDOM from 'react-dom';
import { MemoryRouter } from 'react-router';
import ContextWrapper from '../components/ContextWrapper';
import App from '../pages/App';

test('renders without crashing', () => {
  const rootDiv = document.createElement('div');

  ReactDOM.render(
    <ContextWrapper Router={MemoryRouter}>
      <App />
    </ContextWrapper>,
    rootDiv
  );
  ReactDOM.unmountComponentAtNode(rootDiv);
});
