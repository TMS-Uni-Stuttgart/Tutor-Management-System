import { TextField, Button, PropTypes } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { TextFieldProps } from '@material-ui/core/TextField';
import { ErrorMessage, Field, FieldProps } from 'formik';
import React from 'react';
import { SvgIconComponent } from '@material-ui/icons';
import { ButtonBaseProps } from '@material-ui/core/ButtonBase';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    textFieldWithButtonsContainer: {
      display: 'flex',
      alignItems: 'center',
    },
    button: {
      minWidth: 0,
      height: 32,
      width: 32,
      marginLeft: theme.spacing(0.75),
    },
    errorMessage: {
      color: theme.palette.error.main,
      margin: theme.spacing(1, 1.5, 0),
      fontSize: '0.75rem',
    },
  })
);

interface ButtonItem {
  key: string;
  Icon: SvgIconComponent;
  onClick: ButtonBaseProps['onClick'];
  color?: PropTypes.Color;
}

interface Props {
  name: string;
  label: string;
  buttons: ButtonItem[];
  DivProps?: React.ComponentProps<'div'>;
}

type PropType = Props & Omit<TextFieldProps, 'error'>;

export function FormikTextFieldWithButtons({
  name,
  label,
  buttons,
  DivProps,
  disabled,
  ...TextFieldProps
}: PropType) {
  const classes = useStyles();
  const buttonComps = buttons.map(({ key, Icon, onClick, color }) => (
    <Button
      key={key}
      variant='outlined'
      className={classes.button}
      disabled={disabled}
      onClick={onClick}
      color={color}
    >
      <Icon fontSize='small' />
    </Button>
  ));

  return (
    <Field name={name}>
      {({ field, form }: FieldProps) => (
        <div {...DivProps}>
          <TextField
            label={label}
            variant='outlined'
            fullWidth
            {...field}
            {...(TextFieldProps as any)}
            error={Boolean(form.touched[field.name]) && Boolean(form.errors[field.name])}
            onFocus={e => e.target.select()}
            InputProps={{
              endAdornment: <>{buttonComps}</>,
            }}
            disabled={disabled}
          />

          <ErrorMessage name={field.name} component='span' className={classes.errorMessage} />
        </div>
      )}
    </Field>
  );
}
