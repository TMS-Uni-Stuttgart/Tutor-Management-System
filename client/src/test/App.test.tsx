import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router';
import ContextWrapper from '../components/ContextWrapper';
import App from '../pages/App';

test('renders without crashing', () => {
  const rootDiv = document.createElement('div');

  const root = createRoot(rootDiv);

  root.render(
    <ContextWrapper Router={MemoryRouter}>
      <App />
    </ContextWrapper>
  );
});
