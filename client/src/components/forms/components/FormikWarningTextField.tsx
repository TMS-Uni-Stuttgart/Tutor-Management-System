import { Tooltip } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { useField } from 'formik';
import { AlertOutline as AlertIcon } from 'mdi-material-ui';
import React from 'react';
import FormikTextField, { FormikTextFieldProps } from './FormikTextField';

const useStyles = makeStyles((theme) =>
  createStyles({
    warningColor: {
      color: theme.palette.warning.main,
    },
    warningBorder: {
      borderColor: theme.palette.warning.main,
    },
  })
);

interface Props {
  warningLabel: string;
}

type FormikWarningTextFieldProps = FormikTextFieldProps & Props;

function FormikWarningTextField({
  warningLabel,
  InputProps,
  InputLabelProps,
  FormHelperTextProps,
  helperText,
  ...props
}: FormikWarningTextFieldProps): JSX.Element {
  const classes = useStyles();
  const [, { value, touched }] = useField(props.name);

  const showWarning = touched && value === '';

  return (
    <FormikTextField
      {...props}
      variant='outlined'
      helperText={showWarning ? warningLabel : helperText}
      InputProps={{
        endAdornment: (
          <Tooltip title='Sollte eingegeben werden.'>
            <AlertIcon className={clsx(showWarning && classes.warningColor)} />
          </Tooltip>
        ),
        classes: {
          notchedOutline: clsx(showWarning && classes.warningBorder),
        },
        ...InputProps,
      }}
      InputLabelProps={{
        classes: {
          root: clsx(showWarning && classes.warningColor),
        },
        ...InputLabelProps,
      }}
      FormHelperTextProps={{
        classes: {
          root: clsx(showWarning && classes.warningColor),
        },
        ...FormHelperTextProps,
      }}
    />
  );
}

export default FormikWarningTextField;
