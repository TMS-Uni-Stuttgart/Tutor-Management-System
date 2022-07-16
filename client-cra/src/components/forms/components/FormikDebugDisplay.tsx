import { Paper, Portal, Typography } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { useFormikContext } from 'formik';
import React, { useState } from 'react';
import { isDevelopment } from '../../../util/isDevelopmentMode';
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
      maxHeight: '90vh',
      display: 'grid',
      gridTemplateRows: '1fr auto',
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
      marginRight: theme.spacing(-2),
      paddingRight: theme.spacing(0.5),
      flex: 1,
      overflowX: 'auto',
      ...theme.mixins.scrollbar(4),
    },
    code: {
      whiteSpace: 'pre',
    },
  })
);

interface Props {
  showErrors?: boolean;
  collapsed?: boolean;
  disabled?: boolean;
}

function FormikDebugDisplay({
  showErrors,
  collapsed: collapsedFromProps,
  disabled,
}: Props): JSX.Element | null {
  const classes = useStyles();
  const [isCollapsed, setCollapsed] = useState(collapsedFromProps ?? true);
  const { values, errors } = useFormikContext();

  if (!isDevelopment() || disabled) {
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
              {showErrors && (
                <>
                  Form errors: <br />
                  {JSON.stringify(errors, null, 2)}
                </>
              )}
            </code>
          </div>
        )}

        <div className={classes.titleBar} onClick={() => setCollapsed((prev) => !prev)}>
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
