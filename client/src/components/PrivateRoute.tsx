import React from 'react';
import { Navigate } from 'react-router';
import { useLogin } from '../hooks/LoginService';
import { ROUTES } from '../routes/Routing.routes';

interface PrivateRouteProps {
  element: React.ReactElement;
}

function PrivateRoute({ element }: PrivateRouteProps): JSX.Element {
  const { isLoggedIn } = useLogin();

  if (!isLoggedIn()) {
    return <Navigate to={ROUTES.LOGIN.buildPath({})} replace />;
  }

  return element;
}

export default PrivateRoute;
