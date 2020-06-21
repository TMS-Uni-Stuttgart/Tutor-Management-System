import { Typography } from '@material-ui/core';
import { DateTime, DateTimeFormatOptions } from 'luxon';
import React from 'react';
import { FormExcludedDate } from './FormikExcludedDates';

interface Props {
  excluded: FormExcludedDate;
}

function ExcludedDateText({ excluded }: Props): JSX.Element {
  const format: DateTimeFormatOptions = {
    weekday: 'short',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  };

  return (
    <Typography>
      {excluded instanceof DateTime ? (
        excluded.toLocaleString(format)
      ) : (
        <>
          <span>{excluded.start.toLocaleString(format)} - </span>
          <span style={{ whiteSpace: 'pre' }}>{excluded.end.toLocaleString(format)}</span>
        </>
      )}
    </Typography>
  );
}

export default ExcludedDateText;
