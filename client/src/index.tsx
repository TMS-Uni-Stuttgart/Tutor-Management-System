import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import 'reflect-metadata';
import ContextWrapper from './components/ContextWrapper';
import App from './pages/App';

const root = createRoot(document.getElementById('root')!);

root.render(
  <ContextWrapper Router={BrowserRouter}>
    <App />
  </ContextWrapper>
);
