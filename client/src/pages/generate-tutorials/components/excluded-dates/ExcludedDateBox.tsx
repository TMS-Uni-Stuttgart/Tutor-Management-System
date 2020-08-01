import { Box, IconButton } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { Delete as DeleteIcon, SquareEditOutline as EditIcon } from 'mdi-material-ui';
import React from 'react';
import DateOrIntervalText from '../../../../components/DateOrIntervalText';
import OutlinedBox from '../../../../components/OutlinedBox';
import { FormExcludedDate } from './FormikExcludedDates';

const useStyles = makeStyles((theme) =>
  createStyles({
    deleteButton: {
      color: theme.palette.red.main,
    },
  })
);

interface Props {
  excluded: FormExcludedDate;
  onEdit: () => void;
  onDelete: () => void;
}

function ExcludedDateBox({ excluded, onEdit, onDelete }: Props): JSX.Element {
  const classes = useStyles();

  return (
    <OutlinedBox display='flex' alignItems='center'>
      <DateOrIntervalText date={excluded} />

      <Box marginLeft='auto'>
        <IconButton size='small' onClick={onEdit}>
          <EditIcon />
        </IconButton>

        <IconButton size='small' className={classes.deleteButton} onClick={onDelete}>
          <DeleteIcon />
        </IconButton>
      </Box>
    </OutlinedBox>
  );
}

export default ExcludedDateBox;
