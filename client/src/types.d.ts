import { FormikConfig } from 'formik';

export type FormikSubmitCallback<VALUES> = FormikConfig<VALUES>['onSubmit'];
