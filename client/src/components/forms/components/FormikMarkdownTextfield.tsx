import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import clsx from 'clsx';
import { useField, useFormikContext } from 'formik';
import 'github-markdown-css/github-markdown.css';
import { FileFind as PreviewIcon } from 'mdi-material-ui';
import React, { useState } from 'react';
import AnimatedButton from '../../AnimatedButton';
import Markdown from '../../Markdown';
import FormikTextField, { FormikTextFieldProps } from './FormikTextField';

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
      height: 32,
      marginLeft: theme.spacing(0.75),
      overflow: 'hidden',
    },
    markdownContainer: {
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
  const { handleSubmit, dirty } = useFormikContext();
  const [{ value }] = useField(name);

  const [isPreview, setPreview] = useState(false);

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = event => {
    if (event.ctrlKey && event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();

      if (dirty) {
        handleSubmit();
      }
    }
  };

  return (
    <div className={clsx(className, classes.root)}>
      <AnimatedButton
        label={isPreview ? 'Schließen' : 'Vorschau'}
        icon={<PreviewIcon />}
        className={classes.button}
        onClick={() => setPreview(!isPreview)}
        color={isPreview ? 'secondary' : 'default'}
        disabled={!value}
      />

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
          onKeyDown={handleKeyDown}
        />
      )}
    </div>
  );
}

export default FormikMarkdownTextfield;
