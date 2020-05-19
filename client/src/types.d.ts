import { FormikConfig } from 'formik';

export type FormikSubmitCallback<VALUES> = FormikConfig<VALUES>['onSubmit'];

declare global {
  /**
   * Prefix of the route set by the server.
   */
  const ROUTE_PREFIX: string | undefined | null;
}
