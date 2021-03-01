import { Box, Button, ButtonProps, Tooltip, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { DateTime } from 'luxon';
import {
  AccountEditOutline as EditIcon,
  AccountOutline as SubstituteIcon,
  ChevronRight as RightArrowIcon,
} from 'mdi-material-ui';
import React from 'react';
import { NamedElement } from 'shared/model/Common';
import { getNameOfEntity } from 'shared/util/helpers';
import DateOrIntervalText from '../../../components/DateOrIntervalText';

const useStyles = makeStyles((theme) =>
  createStyles({
    dateButton: {
      marginTop: theme.spacing(1.5),
      '&:first-of-type': {
        marginTop: 0,
      },
    },
    dateButtonIcon: {
      marginLeft: 'auto',
    },
    changed: {
      color: theme.palette.orange.main,
    },
  })
);

interface Props extends ButtonProps {
  date: DateTime;
  isSelected: boolean;
  substitute?: NamedElement;
  isChanged?: boolean;
}

function DateButton({
  isSelected,
  substitute,
  date,
  isChanged,
  ...props
}: Props): JSX.Element | null {
  const classes = useStyles();

  return (
    <Button
      variant='outlined'
      color={isSelected ? 'primary' : 'default'}
      className={classes.dateButton}
      classes={{ endIcon: classes.dateButtonIcon }}
      endIcon={
        <Box display='flex'>
          {isChanged && (
            <Tooltip title='Ungespeicherte Änderungen'>
              <EditIcon className={classes.changed} />
            </Tooltip>
          )}
          {!isChanged && !!substitute && (
            <Tooltip title='Vertretung'>
              <SubstituteIcon />
            </Tooltip>
          )}
          <RightArrowIcon />
        </Box>
      }
      {...props}
    >
      <Box
        display='flex'
        flexDirection='column'
        textAlign='left'
        style={{ textTransform: 'none' }}
        marginRight={2}
      >
        <DateOrIntervalText date={date} suffix={isChanged ? '*' : undefined} />
        {
          <Typography variant='caption' className={clsx(isChanged && classes.changed)}>
            {!!substitute ? `Vertretung: ${getNameOfEntity(substitute)}` : 'Keine Vertretung'}
          </Typography>
        }
      </Box>
    </Button>
  );
}

export default DateButton;
