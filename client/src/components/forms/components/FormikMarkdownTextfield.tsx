import { Button } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { useField } from 'formik';
import 'github-markdown-css/github-markdown.css';
import React, { useState } from 'react';
import Markdown from 'react-markdown';
import FormikTextField, { FormikTextFieldProps } from './FormikTextField';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      position: 'relative',
    },
    button: {
      position: 'absolute',
      right: theme.spacing(1),
      top: theme.spacing(1),
      zIndex: 10,
      minWidth: 0,
      height: 32,
      width: 32,
      marginLeft: theme.spacing(0.75),
    },
    markdownContainer: {
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: theme.shape.borderRadius,
      padding: theme.spacing(2),
    },
  })
);

function FormikMarkdownTextfield({ name, ...other }: FormikTextFieldProps): JSX.Element {
  const classes = useStyles();
  const [isPreview, setPreview] = useState(false);
  const [{ value }] = useField(name);

  return (
    <div className={classes.root}>
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
          <Markdown source={value} className='markdown-body' />
        </div>
      ) : (
        <FormikTextField name={name} multiline {...other} />
      )}
    </div>
  );
}

export default FormikMarkdownTextfield;
