import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import React, { useState } from 'react';
import OpenableFormWithFab from './OpenableFormWithFab';
import TableWithPadding, { TableWithPaddingProps } from './TableWithPadding';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    topBar: {
      display: 'flex',
      width: '100%',
      height: 48,
      marginTop: theme.spacing(1),
    },
    listWithClosedEditor: {
      marginTop: theme.spacing(4),
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

function TableWithForm<T>({
  title,
  form,
  topBarContent,
  items,
  createRowFromItem,
  placeholder,
  ...other
}: Props<T>): JSX.Element {
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

      <div className={isEditorOpen ? classes.listWithOpenEditor : classes.listWithClosedEditor}>
        <TableWithPadding
          items={items}
          createRowFromItem={createRowFromItem}
          placeholder={placeholder}
          {...other}
        />
      </div>
    </>
  );
}

export default TableWithForm;
