import { Box, BoxProps, Button, IconButton, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { useField } from 'formik';
import { DateTime, Interval } from 'luxon';
import { Delete as DeleteIcon, SquareEditOutline as EditIcon } from 'mdi-material-ui';
import React, { useState } from 'react';
import ExcludedDateDialog from './ExcludedDateDialog';
import ExcludedDateDisplay from './ExcludedDateDisplay';
import { useDialog } from '../../../../hooks/DialogService';

const useStyles = makeStyles((theme) =>
  createStyles({
    addButton: {
      marginLeft: 'auto',
    },
    paper: {
      padding: theme.spacing(1),
    },
    deleteButton: {
      color: theme.palette.red.main,
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
          buttonProps: {
            className: classes.deleteButton,
          },
        },
      ],
    });
  };

  return (
    <Box
      border={2}
      borderColor='divider'
      borderRadius='borderRadius'
      padding={1}
      position='relative'
      display='flex'
      flexDirection='column'
      {...props}
    >
      <Box display='flex' marginBottom={1}>
        <Typography variant='h6'>Ausgeschlossene Zeitspannen</Typography>
        <Button
          variant='outlined'
          color='secondary'
          className={classes.addButton}
          onClick={() => setDialogState({ isShowDialog: true, onAccept: addExcludedDate })}
        >
          Hinzufügen
        </Button>
      </Box>

      <Box
        overflow='auto'
        flex={1}
        display='grid'
        gridTemplateColumns='1fr 1fr'
        gridRowGap={8}
        gridColumnGap={8}
        maxHeight='max-content'
      >
        {value.map((val, idx) => (
          <Box
            key={val.toISODate() + idx}
            border={1}
            borderColor='divider'
            borderRadius='borderRadius'
            padding={1}
            display='flex'
            alignItems='center'
          >
            <ExcludedDateDisplay excluded={val} />

            <Box marginLeft='auto'>
              <IconButton
                size='small'
                onClick={() => {
                  setDialogState({
                    isShowDialog: true,
                    excludedDate: val,
                    onAccept: replaceExcludedDate(idx),
                  });
                }}
              >
                <EditIcon />
              </IconButton>

              <IconButton
                size='small'
                className={classes.deleteButton}
                onClick={handleDeleteExcludedDateClicked(idx)}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>
        ))}
      </Box>

      {dialogState.isShowDialog && (
        <ExcludedDateDialog
          open={dialogState.isShowDialog}
          excluded={dialogState.excludedDate}
          onClose={() => setDialogState({ isShowDialog: false })}
          onAccept={dialogState.onAccept}
        />
      )}
    </Box>
  );
}

export default FormikExcludedDates;
