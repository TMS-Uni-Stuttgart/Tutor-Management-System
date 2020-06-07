import { Typography } from '@material-ui/core';
import { DateTime, DateTimeFormatOptions } from 'luxon';
import React from 'react';
import { FormExcludedDate } from './FormikExcludedDates';

interface Props {
  excluded: FormExcludedDate;
}

function ExcludedDateDisplay({ excluded }: Props): JSX.Element {
  const format: DateTimeFormatOptions = {
    weekday: 'short',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  };

  return (
    <Typography>
      {excluded instanceof DateTime
        ? excluded.toLocaleString(format)
        : `${excluded.start.toLocaleString(format)} - ${excluded.end.toLocaleString(format)}`}
    </Typography>
  );
}

export default ExcludedDateDisplay;
