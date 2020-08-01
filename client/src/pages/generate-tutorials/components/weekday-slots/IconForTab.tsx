import { Box } from '@material-ui/core';
import { useFormikContext } from 'formik';
import React from 'react';
import { FormState } from '../../GenerateTutorials';
import { WeekdayTimeSlot } from './FormikWeekdaySlot';

interface TabIconProps {
  weekday: string;
  showError: boolean;
}

function IconForTab({ weekday, showError }: TabIconProps): JSX.Element {
  const { values } = useFormikContext<FormState>();

  const weekdayValues: WeekdayTimeSlot[] | undefined = values.weekdays[weekday];
  const slotCountOnWeekday: number =
    weekdayValues?.reduce((sum, current) => {
      const parsed = Number.parseInt(current.count);

      return Number.isSafeInteger(parsed) ? sum + parsed : sum;
    }, 0) ?? 0;

  return (
    <Box
      width={28}
      height={28}
      border={2}
      borderColor='textPrimary'
      borderRadius='50%'
      display='flex'
      alignItems='center'
      justifyContent='center'
    >
      {!showError ? slotCountOnWeekday : '!'}
    </Box>
  );
}

export default IconForTab;
