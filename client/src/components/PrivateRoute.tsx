import React from 'react';
import { Redirect, Route, RouteComponentProps, RouteProps } from 'react-router';
import { useLogin } from '../hooks/LoginService';
import { ROUTES } from '../routes/Routing.routes';

interface PrivateRouteProps extends RouteProps {
  // Make the component required in a private route!
  component: React.ComponentType<RouteComponentProps<any>> | React.ComponentType<any>;
}

function PrivateRoute(props: PrivateRouteProps): JSX.Element {
  const { component: Component, ...other } = props;
  const { isLoggedIn } = useLogin();

  function render(innerProps: RouteComponentProps) {
    if (!isLoggedIn()) {
      return (
        <Redirect to={{ pathname: ROUTES.LOGIN.create({}) }} from={innerProps.location.pathname} />
      );
    }

    return <Component {...innerProps} />;
  }

  return <Route {...other} render={render} />;
}

export default PrivateRoute;
