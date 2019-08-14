import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import React, { useState } from 'react';
import OpenableFormWithFab from './OpenableFormWithFab';
import TableWithPadding, { TableWithPaddingProps } from './TableWithPadding';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    listWithClosedEditor: {
      marginTop: 64,
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
}

function TableWithForm<T>({
  title,
  form,
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
