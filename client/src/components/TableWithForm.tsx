import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import React, { useState } from 'react';
import OpenableFormWithFab from './OpenableFormWithFab';
import TableWithPadding, { TableWithPaddingProps } from './TableWithPadding';
import clsx from 'clsx';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    topBar: {
      display: 'flex',
      width: '100%',
      height: 48,
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(-8),
    },
    list: {
      marginBottom: theme.spacing(1),
    },
    listWithClosedEditor: {
      marginTop: theme.spacing(8),
    },
    listWithOpenEditor: {
      marginTop: 0,
    },
    tableWithoutBorders: {
      '& td': {
        borderBottom: 'none',
      },
    },
    spacingRow: {
      height: theme.spacing(1.5),
    },
    placeholder: {
      marginTop: 64,
      textAlign: 'center',
    },
  })
);

interface Props<T> extends TableWithPaddingProps<T> {
  title: string;
  form: React.ReactNode;
  topBarContent?: React.ReactNode;
}

function TableWithForm<T>({ title, form, topBarContent, ...other }: Props<T>): JSX.Element {
  const classes = useStyles();
  const [isEditorOpen, setEditorOpen] = useState(false);

  return (
    <>
      <OpenableFormWithFab
        title={title}
        GrowProps={{
          onEnter: () => setEditorOpen(true),
          onExited: () => setEditorOpen(false),
        }}
      >
        {form}
      </OpenableFormWithFab>

      {topBarContent && !isEditorOpen && <div className={classes.topBar}>{topBarContent}</div>}

      <div
        className={clsx(classes.list, {
          [classes.listWithOpenEditor]: isEditorOpen,
          [classes.listWithClosedEditor]: !isEditorOpen,
        })}
      >
        <TableWithPadding {...other} />
      </div>
    </>
  );
}

export default TableWithForm;
