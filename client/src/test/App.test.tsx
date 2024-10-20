import { createRoot } from 'react-dom/client';
import { createMemoryRouter, RouterProvider } from 'react-router';
import ContextWrapper from '../components/ContextWrapper';
import App from '../pages/App';
import { ROUTER_ROUTES } from '../routes/RouterRoutes.routes';

test('renders without crashing', () => {
  const rootDiv = document.createElement('div');

  const root = createRoot(rootDiv);

  const router = createMemoryRouter([
    {
      path: '/',
      element: (
        <ContextWrapper>
          <App />
        </ContextWrapper>
      ),
      children: ROUTER_ROUTES,
    },
  ]);

  root.render(<RouterProvider router={router} />);
});
