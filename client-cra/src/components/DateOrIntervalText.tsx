import { Typography, TypographyProps } from '@material-ui/core';
import { DateTime, DateTimeFormatOptions, Interval } from 'luxon';
import React from 'react';

interface Props extends TypographyProps {
  date: DateTime | Interval;
  prefix?: string;
  suffix?: string;
}

function DateOrIntervalText({ prefix, date, suffix, ...props }: Props): JSX.Element {
  const format: DateTimeFormatOptions = {
    weekday: 'short',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  };

  return (
    <Typography {...props}>
      {prefix && `${prefix} `}
      {date instanceof DateTime ? (
        date.toLocaleString(format)
      ) : (
        <>
          <span>{date.start.toLocaleString(format)} - </span>
          <span style={{ whiteSpace: 'pre' }}>{date.end.toLocaleString(format)}</span>
        </>
      )}
      {suffix && `${suffix} `}
    </Typography>
  );
}

export default DateOrIntervalText;
