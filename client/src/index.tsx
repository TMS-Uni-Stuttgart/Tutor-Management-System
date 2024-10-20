import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import 'reflect-metadata';
import ContextWrapper from './components/ContextWrapper';
import App from './pages/App';
import { ROUTER_ROUTES } from './routes/RouterRoutes.routes';
import { getRouteWithPrefix } from './util/routePrefix';

const root = createRoot(document.getElementById('root')!);

const router = createBrowserRouter([
  {
    path: getRouteWithPrefix('/'),
    element: (
      <ContextWrapper>
        <App />
      </ContextWrapper>
    ),
    children: ROUTER_ROUTES,
  },
]);

root.render(<RouterProvider router={router} />);
