import { FormikHelpers } from 'formik';

export type FormikSubmitCallback<VALUES> = (values: VALUES, actions: FormikHelpers<VALUES>) => void;
