import { Box, BoxProps, Button, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { useField } from 'formik';
import { DateTime, Interval } from 'luxon';
import React, { useState } from 'react';
import OutlinedBox from '../../../../components/OutlinedBox';
import { useDialog } from '../../../../hooks/dialog-service/DialogService';
import ExcludedDateBox from './ExcludedDateBox';
import ExcludedDateDialog from './ExcludedDateDialog';

const useStyles = makeStyles((theme) =>
  createStyles({
    addButton: {
      height: 'fit-content',
    },
    paper: {
      padding: theme.spacing(1),
    },
  })
);

export type FormExcludedDate = DateTime | Interval;

interface DialogClosedState {
  isShowDialog: false;
}

interface DialogOpenState {
  isShowDialog: true;
  onAccept: (excluded: FormExcludedDate) => void;
  excludedDate?: FormExcludedDate;
}

type DialogState = DialogOpenState | DialogClosedState;

interface Props extends BoxProps {
  name: string;
}

function FormikExcludedDates({ name, ...props }: Props): JSX.Element {
  const classes = useStyles();
  const [, meta, helpers] = useField<FormExcludedDate[]>(name);
  const [dialogState, setDialogState] = useState<DialogState>({ isShowDialog: false });
  const dialog = useDialog();

  const { value } = meta;

  const setFieldValue = (newValue: FormExcludedDate[]) => {
    newValue.sort((a, b) => {
      const dateA = a instanceof Interval ? a.start : a;
      const dateB = b instanceof Interval ? b.start : b;

      return dateA.toMillis() - dateB.toMillis();
    });

    helpers.setValue(newValue);
  };

  const addExcludedDate = (excluded: FormExcludedDate) => {
    setFieldValue([...value, excluded]);
    setDialogState({ isShowDialog: false });
  };

  const replaceExcludedDate = (idx: number) => (excluded: FormExcludedDate) => {
    const newValue = [...value];
    newValue[idx] = excluded;

    setFieldValue([...newValue]);
    setDialogState({ isShowDialog: false });
  };

  const deleteExcludedDate = (idx: number) => {
    const newValues = [...value];
    newValues.splice(idx, 1);

    dialog.hide();
    setFieldValue(newValues);
  };

  const handleDeleteExcludedDateClicked = (idx: number) => () => {
    dialog.show({
      title: 'Ausgeschlossene Zeitspanne löschen',
      content:
        'Soll die ausgewählte Zeitspanne wirklich gelöscht werden? Dies kann nicht rückgängig gemacht werden.',
      actions: [
        {
          label: 'Nicht löschen',
          onClick: () => dialog.hide(),
        },
        {
          label: 'Löschen',
          onClick: () => deleteExcludedDate(idx),
          deleteButton: true,
        },
      ],
    });
  };

  return (
    <OutlinedBox position='relative' display='flex' flexDirection='column' {...props}>
      <Box marginBottom={1}>
        <Typography variant='h6'>Ausgeschlossene Zeiten</Typography>
      </Box>

      <Box
        overflow='auto'
        flex={1}
        display='grid'
        gridTemplateColumns='1fr'
        gridTemplateRows='max-content'
        gridRowGap={8}
        gridColumnGap={8}
        maxHeight='max-content'
      >
        {value.map((val, idx) => (
          <ExcludedDateBox
            key={(val.toISODate() ?? '') + idx}
            excluded={val}
            onEdit={() => {
              setDialogState({
                isShowDialog: true,
                excludedDate: val,
                onAccept: replaceExcludedDate(idx),
              });
            }}
            onDelete={handleDeleteExcludedDateClicked(idx)}
          />
        ))}

        <Button
          variant='outlined'
          className={classes.addButton}
          onClick={() => setDialogState({ isShowDialog: true, onAccept: addExcludedDate })}
          fullWidth
        >
          Hinzufügen
        </Button>
      </Box>

      {dialogState.isShowDialog && (
        <ExcludedDateDialog
          open={dialogState.isShowDialog}
          excluded={dialogState.excludedDate}
          onClose={() => setDialogState({ isShowDialog: false })}
          onAccept={dialogState.onAccept}
        />
      )}
    </OutlinedBox>
  );
}

export default FormikExcludedDates;
