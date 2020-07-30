import { Button, PropTypes, TextField } from '@material-ui/core';
import { ButtonBaseProps } from '@material-ui/core/ButtonBase';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { TextFieldProps } from '@material-ui/core/TextField';
import Tooltip, { TooltipProps } from '@material-ui/core/Tooltip';
import { ErrorMessage, Field, FieldProps } from 'formik';
import React from 'react';
import { SvgIconComponent } from '../../../typings/SvgIconComponent';

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
  tooltip?: TooltipProps['title'];
}

interface Props {
  name: string;
  label: string;
  buttons: ButtonItem[];
  DivProps?: React.ComponentProps<'div'>;
}

export type FormikTextFieldWithButtonsProps = Props & Omit<TextFieldProps, 'error'>;

export function FormikTextFieldWithButtons({
  name,
  label,
  buttons,
  DivProps,
  disabled,
  ...TextFieldProps
}: FormikTextFieldWithButtonsProps): JSX.Element {
  const classes = useStyles();
  const buttonComps = buttons.map(({ key, Icon, onClick, color, tooltip }) => {
    const buttonComp = (
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
    );

    return tooltip ? (
      <Tooltip key={key} title={tooltip}>
        {buttonComp}
      </Tooltip>
    ) : (
      buttonComp
    );
  });

  return (
    <Field name={name}>
      {({ field, meta: { touched, error } }: FieldProps) => (
        <div {...DivProps}>
          <TextField
            label={label}
            variant='outlined'
            fullWidth
            {...field}
            {...(TextFieldProps as any)}
            error={touched && !!error}
            onFocus={(e) => e.target.select()}
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
