import { Typography } from '@material-ui/core';
import { DateTime, DateTimeFormatOptions, Interval } from 'luxon';
import React from 'react';

interface Props {
  date: DateTime | Interval;
}

function DateOrIntervalText({ date }: Props): JSX.Element {
  const format: DateTimeFormatOptions = {
    weekday: 'short',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  };

  return (
    <Typography>
      {date instanceof DateTime ? (
        date.toLocaleString(format)
      ) : (
        <>
          <span>{date.start.toLocaleString(format)} - </span>
          <span style={{ whiteSpace: 'pre' }}>{date.end.toLocaleString(format)}</span>
        </>
      )}
    </Typography>
  );
}

export default DateOrIntervalText;
