import { Box, BoxProps, Button, Paper } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { useField } from 'formik';
import { Plus as AddIcon } from 'mdi-material-ui';
import React, { useEffect, useState } from 'react';
import { useDialog } from '../../../../../hooks/DialogService';
import FormikWeekdaySlot, { WeekdayTimeSlot } from '../FormikWeekdaySlot';
import AddSlotForm, { AddSlotFormData } from './AddSlotForm';

const useStyles = makeStyles((theme) =>
  createStyles({
    weekdayEntry: {
      padding: theme.spacing(1),
      display: 'flex',
      marginTop: theme.spacing(1),
      alignItems: 'center',
      '&:first-of-type': {
        marginTop: 0,
      },
    },
    addNewWeekdayEntry: {
      height: 72,
      display: 'flex',
      marginTop: theme.spacing(1),
      alignItems: 'center',
      justifyContent: 'center',
    },
    addSlotButton: {
      width: '100%',
      height: '100%',
    },
  })
);

interface Props extends BoxProps {
  name: string;
}

function WeekdayBox({ name, ...props }: Props): JSX.Element {
  const classes = useStyles();
  const [, meta, helpers] = useField<WeekdayTimeSlot[] | undefined>(name);
  const [isAddMode, setAddMode] = useState(false);
  const dialog = useDialog();

  const value = meta.value ?? [];

  const setValue = (newValue: WeekdayTimeSlot[]) => {
    // FIXME: Fix sorting to also work if a slot gets edited / changed!
    helpers.setValue(
      [...newValue].sort((a, b) =>
        a.interval.start.toFormat('HH:mm').localeCompare(b.interval.start.toFormat('HH:mm'))
      )
    );
  };

  const deleteSlot = (idx: number) => {
    const newValue = [...value];
    newValue.splice(idx, 1);

    dialog.hide();
    setValue(newValue);
  };

  const handleDeleteSlotClicked = (idx: number) => () => {
    dialog.show({
      title: 'Slot löschen',
      content:
        'Soll der ausgewählte Slot wirklich gelöscht werden? Dies kann nicht rückgängig gemacht werden.',
      actions: [
        {
          label: 'Nicht löschen',
          onClick: () => dialog.hide(),
        },
        {
          label: 'Löschen',
          onClick: () => deleteSlot(idx),
          deleteButton: true,
        },
      ],
    });
  };

  const onAcceptClicked = ({ count, interval }: AddSlotFormData) => {
    const highestId = value.reduce((id, val) => (val._id > id ? val._id : id), -1);
    const newValue: WeekdayTimeSlot[] = [...value, { _id: highestId + 1, count, interval }];

    setValue(newValue);
    setAddMode(false);
  };

  return (
    <Box display='flex' flexDirection='column' {...props}>
      {value.map((val, idx) => (
        <FormikWeekdaySlot
          key={val._id}
          name={`${name}[${idx}]`}
          className={classes.weekdayEntry}
          onDelete={handleDeleteSlotClicked(idx)}
        />
      ))}

      <Paper className={classes.addNewWeekdayEntry}>
        {isAddMode ? (
          <AddSlotForm onAbort={() => setAddMode(false)} onAccept={onAcceptClicked} flex={1} />
        ) : (
          <Button
            className={classes.addSlotButton}
            startIcon={<AddIcon />}
            onClick={() => setAddMode(true)}
          >
            Slot hinzufügen
          </Button>
        )}
      </Paper>
    </Box>
  );
}

export default WeekdayBox;
