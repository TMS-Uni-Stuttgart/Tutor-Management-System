import { TextField } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { TextFieldProps } from '@material-ui/core/TextField';
import { ErrorMessage, Field, FieldProps } from 'formik';
import React from 'react';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    textFieldWithButtonsContainer: {
      display: 'flex',
      alignItems: 'center',
    },
    errorMessage: {
      color: theme.palette.error.main,
      margin: theme.spacing(1, 1.5, 0),
      fontSize: '0.75rem',
    },
  })
);

interface Props {
  name: string;
  label: string;
  buttons: React.ReactNodeArray;
  DivProps?: React.ComponentProps<'div'>;
}

type PropType = Props & Omit<TextFieldProps, 'error'>;

export function FormikTextFieldWithButtons({
  name,
  label,
  buttons,
  DivProps,
  ...TextFieldProps
}: PropType) {
  const classes = useStyles();

  return (
    <Field name={name}>
      {({ field, form }: FieldProps) => (
        <div {...DivProps}>
          <div className={classes.textFieldWithButtonsContainer}>
            <TextField
              label={label}
              variant='outlined'
              fullWidth
              {...field}
              {...(TextFieldProps as any)}
              error={Boolean(form.touched[field.name]) && Boolean(form.errors[field.name])}
              onFocus={e => e.target.select()}
            />
            {buttons}
          </div>
          <ErrorMessage name={field.name} component='span' className={classes.errorMessage} />
        </div>
      )}
    </Field>
  );
}
