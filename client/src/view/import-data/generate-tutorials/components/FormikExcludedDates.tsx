import { Box, BoxProps, Button, IconButton, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { useField } from 'formik';
import { DateTime, Interval } from 'luxon';
import { Delete as DeleteIcon, SquareEditOutline as EditIcon } from 'mdi-material-ui';
import React, { useState } from 'react';
import ExcludedDateDialog from './ExcludedDateDialog';
import ExcludedDateDisplay from './ExcludedDateDisplay';

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

interface Props extends BoxProps {
  name: string;
}

function FormikExcludedDates({ name, ...props }: Props): JSX.Element {
  const classes = useStyles();
  const [field, meta, helpers] = useField<FormExcludedDate[]>(name);
  const [isShowAddDialog, setShowAddDialog] = useState(false);

  const { value } = meta;

  const setFieldValue = (newValue: FormExcludedDate[]) => {
    newValue.sort((a, b) => {
      const dateA = a instanceof Interval ? a.start : a;
      const dateB = b instanceof Interval ? b.start : b;

      return dateA.toMillis() - dateB.toMillis();
    });

    helpers.setValue(newValue);
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
          onClick={() => setShowAddDialog(true)}
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
              <IconButton size='small'>
                <EditIcon />
              </IconButton>

              <IconButton
                size='small'
                className={classes.deleteButton}
                onClick={() => {
                  const newValues = [...value];
                  newValues.splice(idx, 1);

                  setFieldValue(newValues);
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>
        ))}
      </Box>

      {isShowAddDialog && (
        <ExcludedDateDialog
          open={isShowAddDialog}
          onClose={() => setShowAddDialog(false)}
          onAccept={(excluded) => {
            setFieldValue([...value, excluded]);
            setShowAddDialog(false);
          }}
        />
      )}
    </Box>
  );
}

export default FormikExcludedDates;
