import { Button } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { useField } from 'formik';
import 'github-markdown-css/github-markdown.css';
import React, { useState } from 'react';
import FormikTextField, { FormikTextFieldProps } from './FormikTextField';
import Markdown from '../../Markdown';
import clsx from 'clsx';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      position: 'relative',
      flex: 1,
      overflowY: 'auto',
      paddingRight: theme.spacing(1),
      ...theme.mixins.scrollbar(8),
    },
    button: {
      position: 'absolute',
      right: theme.spacing(2),
      top: theme.spacing(1),
      zIndex: 10,
      minWidth: 0,
      height: 32,
      width: 32,
      marginLeft: theme.spacing(0.75),
    },
    markdownContainer: {
      background: theme.palette.common.white,
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: theme.shape.borderRadius,
      padding: theme.spacing(2),
    },
    textFieldContainer: {
      minHeight: '100%',
    },
    textField: {
      flex: 1,
      alignItems: 'flex-start',
    },
  })
);

function FormikMarkdownTextfield({ name, className, ...other }: FormikTextFieldProps): JSX.Element {
  const classes = useStyles();
  const [isPreview, setPreview] = useState(false);
  const [{ value }] = useField(name);

  return (
    <div className={clsx(className, classes.root)}>
      <Button
        variant='outlined'
        className={classes.button}
        onClick={() => setPreview(!isPreview)}
        color={isPreview ? 'secondary' : 'default'}
        disabled={!value}
      >
        P
      </Button>

      {isPreview ? (
        <div className={classes.markdownContainer}>
          <Markdown markdown={value} />
        </div>
      ) : (
        <FormikTextField
          name={name}
          multiline
          disableSelectAllOnFocus
          {...other}
          className={classes.textFieldContainer}
          InputProps={{
            ...other.InputProps,
            className: classes.textField,
          }}
        />
      )}
    </div>
  );
}

export default FormikMarkdownTextfield;
