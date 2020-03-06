import { FormControlProps } from '@material-ui/core/FormControl';
import { DateTime } from 'luxon';
import React, { ChangeEvent, useEffect, useState } from 'react';
import CustomSelect from './CustomSelect';

interface Props extends FormControlProps {
  availableDates: DateTime[];
  onDateSelected: (date: DateTime | undefined) => void;
  value?: string;
}

// TODO: Replace Select with a date picker in which one can only select the specific dates!
function DateOfTutorialSelection({
  availableDates,
  onDateSelected,
  value: valueFromProps,
  className,
  ...other
}: Props): JSX.Element {
  const [value, setValue] = useState<string>();

  useEffect(() => {
    setValue(valueFromProps ?? '');
  }, [valueFromProps]);

  function onDateSelection(e: ChangeEvent<{ name?: string; value: unknown }>) {
    if (typeof e.target.value !== 'string') {
      return;
    }

    const date: DateTime | undefined = availableDates.find(d => d.toISODate() === e.target.value);

    onDateSelected(date);
    setValue(e.target.value);
  }

  return (
    <CustomSelect
      label='Datum wählen'
      emptyPlaceholder='Keine Termine vorhanden.'
      value={value}
      onChange={onDateSelection}
      className={className}
      FormControlProps={other}
      items={availableDates}
      itemToString={date => date.toLocaleString(DateTime.DATE_MED)}
      itemToValue={date => date.toISODate()}
    />
  );
}

export default DateOfTutorialSelection;
