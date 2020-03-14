import { FormikValues, FormikErrors } from 'formik';
import React, { useState } from 'react';
import { isDevelopment } from '../../../util/isDevelopmentMode';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { Paper, Portal, Typography } from '@material-ui/core';
import CollapseButton from '../../CollapseButton';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      position: 'absolute',
      bottom: 50,
      left: 50,
      zIndex: theme.zIndex.modal + 1000,
      padding: theme.spacing(2),
      maxWidth: '35vw',
      overflowX: 'auto',
      ...theme.mixins.scrollbar(4),
    },
    titleBar: {
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer',
    },
    collapseButton: {
      marginLeft: 'auto',
    },
    codeContainer: {
      marginTop: theme.spacing(1),
    },
    code: {
      whiteSpace: 'pre',
    },
  })
);

interface Props {
  values: FormikValues;
  errors?: FormikErrors<any>;
  collapsed?: boolean;
}

function FormikDebugDisplay({
  values,
  errors,
  collapsed: collapsedFromProps,
}: Props): JSX.Element | null {
  const classes = useStyles();
  const [isCollapsed, setCollapsed] = useState(collapsedFromProps ?? true);

  if (!isDevelopment()) {
    return null;
  }

  return (
    <Portal container={document.body}>
      <Paper className={classes.root} elevation={24}>
        {!isCollapsed && (
          <div className={classes.codeContainer}>
            <code className={classes.code}>
              Form values: <br />
              {JSON.stringify(values, null, 2)}
              <br />
              {errors && (
                <>
                  Form errors: <br />
                  {JSON.stringify(errors, null, 2)}
                </>
              )}
            </code>
          </div>
        )}

        <div className={classes.titleBar} onClick={() => setCollapsed(prev => !prev)}>
          <Typography variant='h6' color='error'>
            Formik Debug Display
          </Typography>

          <CollapseButton isCollapsed={isCollapsed} className={classes.collapseButton} />
        </div>
      </Paper>
    </Portal>
  );
}

export default FormikDebugDisplay;
