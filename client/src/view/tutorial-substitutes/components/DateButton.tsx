import React from 'react';
import { ChevronRight as RightArrowIcon } from 'mdi-material-ui';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import { Button, ButtonProps, Box, Typography } from '@material-ui/core';
import DateOrIntervalText from '../../../components/DateOrIntervalText';
import { Tutorial } from '../../../model/Tutorial';
import { DateTime } from 'luxon';
import { getNameOfEntity } from 'shared/util/helpers';

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
  })
);

interface Props extends ButtonProps {
  date: DateTime;
  isSelected: boolean;
  tutorial?: Tutorial;
}

function DateButton({ isSelected, tutorial, date, ...props }: Props): JSX.Element | null {
  const classes = useStyles();

  if (!tutorial) {
    return null;
  }

  const substitute = tutorial.getSubstitute(date);

  return (
    <Button
      variant='outlined'
      color={isSelected ? 'primary' : 'default'}
      className={classes.dateButton}
      classes={{ endIcon: classes.dateButtonIcon }}
      endIcon={<RightArrowIcon />}
      {...props}
    >
      <Box display='flex' flexDirection='column' textAlign='left' style={{ textTransform: 'none' }}>
        <DateOrIntervalText date={date} />
        {
          <Typography variant='caption'>
            {!!substitute ? `Vertretung: ${getNameOfEntity(substitute)}` : 'Keine Vertretung'}
          </Typography>
        }
      </Box>
    </Button>
  );
}

export default DateButton;
