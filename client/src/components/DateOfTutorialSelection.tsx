import { FormControlProps } from '@material-ui/core/FormControl';
import { format } from 'date-fns';
import deLocale from 'date-fns/locale/de';
import React, { ChangeEvent, useEffect, useState } from 'react';
import CustomSelect from './CustomSelect';

interface Props extends FormControlProps {
  // tutorial: Tutorial | undefined;
  availableDates: Date[];
  onDateSelected: (date: Date | undefined) => void;
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
  const [value, setValue] = useState<string>(valueFromProps || '');

  useEffect(() => {
    setValue(valueFromProps || '');
  }, [valueFromProps]);

  function onDateSelection(e: ChangeEvent<{ name?: string; value: unknown }>) {
    if (typeof e.target.value !== 'string') {
      return;
    }

    const date: Date | undefined = availableDates.find(d => d.toISOString() === e.target.value);

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
      itemToString={date => format(date, 'dd. MMMM yyyy', { locale: deLocale })}
      itemToValue={date => date.toISOString()}
    />
  );
}

export default DateOfTutorialSelection;
