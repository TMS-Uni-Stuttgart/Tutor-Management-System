import { Box, BoxProps, Button, IconButton, Paper, Tooltip } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { useField } from 'formik';
import { Plus as AddIcon, SortAscending as SortIcon } from 'mdi-material-ui';
import React, { useState } from 'react';
import FormikTextField from '../../../../components/forms/components/FormikTextField';
import { useDialog } from '../../../../hooks/dialog-service/DialogService';
import AddSlotForm, { AddSlotFormData } from './AddSlotForm';
import FormikWeekdaySlot, { WeekdayTimeSlot } from './FormikWeekdaySlot';

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
      minHeight: 72,
      display: 'flex',
      marginTop: theme.spacing(1),
      alignItems: 'center',
      justifyContent: 'center',
    },
    addSlotButton: {
      width: '100%',
      height: '100%',
      minHeight: 'inherit',
    },
    sortButton: {
      marginLeft: theme.spacing(1),
    },
  })
);

interface Props extends BoxProps {
  name: string;
  prefixName: string;
}

function sortSlots(intervals: WeekdayTimeSlot[]): WeekdayTimeSlot[] {
  return [...intervals].sort((a, b) => {
    if (!a.interval.isValid || !b.interval.isValid) {
      return -1;
    }

    return a.interval.start.toFormat('HH:mm').localeCompare(b.interval.start.toFormat('HH:mm'));
  });
}

function WeekdayBox({ name, prefixName, ...props }: Props): JSX.Element {
  const classes = useStyles();
  const [, meta, helpers] = useField<WeekdayTimeSlot[] | undefined>(name);
  const [, { value: prefixValue }] = useField<string>(prefixName);
  const [isAddMode, setAddMode] = useState(false);
  const dialog = useDialog();

  const value = meta.value ?? [];

  const setValue = (newValue: WeekdayTimeSlot[]) => {
    helpers.setValue(sortSlots(newValue));
  };

  const deleteSlot = (id: number) => {
    const newValue = [...value];
    const idx = newValue.findIndex((val) => val._id === id);
    newValue.splice(idx, 1);

    dialog.hide();
    setValue(newValue);
  };

  const handleDeleteSlotClicked = (id: number) => () => {
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
          onClick: () => deleteSlot(id),
          deleteButton: true,
        },
      ],
    });
  };

  const onAcceptClicked = ({ count, interval }: AddSlotFormData) => {
    const highestId = value.reduce((id, val) => (val._id > id ? val._id : id), -1);
    const newValue: WeekdayTimeSlot[] = [
      ...value,
      { _id: highestId + 1, count: `${count}`, interval },
    ];

    setValue(newValue);
    setAddMode(false);
  };

  const handleSortClicked = () => {
    helpers.setValue(sortSlots(value));
  };

  return (
    <Box display='flex' flexDirection='column' {...props}>
      <Box display='flex' alignItems='flex-start'>
        <FormikTextField
          name={prefixName}
          label='Präfix'
          helperText={`Präfix für Tutorien. Beispiel: "${prefixValue}01"`}
          required
        />

        <Tooltip title='Nach Startzeit sortieren (aufsteigend)'>
          <IconButton
            onClick={handleSortClicked}
            className={classes.sortButton}
            // disabled={value.length === 0}
          >
            <SortIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {value.map((val, idx) => (
        <FormikWeekdaySlot
          key={val._id}
          name={`${name}[${idx}]`}
          className={classes.weekdayEntry}
          onDelete={handleDeleteSlotClicked(val._id)}
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
