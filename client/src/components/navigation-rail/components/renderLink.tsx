import React from 'react';
import { Link, LinkProps } from 'react-router-dom';

/**
 * Returns a component which can get a ref. That's needed because the 'component' prop of the ListItem needs to be able to pass a ref down.
 *
 * @param to Path of the Link
 * @returns Functional component which is a Link with the given path.
 */
export const renderLink = (to: LinkProps['to']) =>
  React.forwardRef<Link, any>((props, ref) => <Link innerRef={ref} to={to} {...props} />);
