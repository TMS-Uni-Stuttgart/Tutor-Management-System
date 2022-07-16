import { IconButton } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { DatePicker, DatePickerProps } from '@material-ui/pickers';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import { OutterCalendarProps } from '@material-ui/pickers/views/Calendar/Calendar';
import clsx from 'clsx';
import { ArrayHelpers, FieldArray, FieldProps, useField } from 'formik';
import { DateTime } from 'luxon';
import React, { useState } from 'react';
import DateList, { DateInList } from './DateList';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      height: 344,
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: `${theme.shape.borderRadius}px`,
      '& > div:first-child': {
        borderRadius: `${theme.shape.borderRadius}px 0 0 ${theme.shape.borderRadius}px`,
      },
      '& > div:last-child': {
        borderRadius: `0 ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0`,
      },
    },
    dateList: {
      width: 'max-content',
      padding: theme.spacing(1),
      background: theme.palette.primary.main,
      color: theme.palette.getContrastText(theme.palette.primary.main),
      height: '100%',
      overflowY: 'auto',
    },
    label: {
      fontWeight: 'normal',
      fontFamily: theme.typography.fontFamily,
      margin: 0,
    },
    day: {
      width: 36,
      height: 36,
      fontSize: theme.typography.caption.fontSize,
      margin: '0 2px',
      color: 'inherit',
      // FIXME: Background color gets animated on hover aswell.
      transition: theme.transitions.create(['background-color', 'color'], {
        duration: 2000,
        easing: theme.transitions.easing.easeOut,
      }),
      backgroundColor: theme.palette.background.paper,
    },
    nonCurrentMonthDay: {
      color: theme.palette.text.disabled,
    },
    currentValue: {
      border: `1px solid ${theme.palette.secondary.main}`,
    },
    highlightNonCurrentMonthDay: {
      opacity: 0.6,
    },
    highlight: {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.getContrastText(theme.palette.primary.main),
      borderRadius: '50%',
      margin: '0 2px',
      '&:hover': {
        background: theme.palette.primary.light,
      },
    },
    highlightSpecial: {
      backgroundColor: theme.palette.secondary.main,
      color: theme.palette.getContrastText(theme.palette.secondary.main),
      '&:hover': {
        background: theme.palette.secondary.light,
      },
    },
  })
);

export type DateClickedHandler = (
  date: string,
  selectedDays: unknown,
  arrayHelpers: ArrayHelpers
) => void;

interface Props {
  name: string;
  onDateClicked?: DateClickedHandler;
  highlightDate?: string;
}

type PropType = Props & Omit<DatePickerProps, keyof FieldProps['field']>;

function isStringArray(array: unknown): array is string[] {
  return Array.isArray(array);
}

export function getDateString(date: DateTime): string {
  return date.toISODate() ?? 'DATE_NOTE_PARSEABLE';
}

function FormikMultipleDatesPicker({
  name,
  className,
  onDateClicked,
  highlightDate,
  ...other
}: PropType): JSX.Element {
  const classes = useStyles();
  const [{ value: valueOfField }] = useField(name);

  // Initialize the value to be the first date in the list of selected days (instead of 'today').
  // It'll be still 'today' if the list is empty.
  const [value, setValue] = useState<MaterialUiPickersDate>(
    valueOfField && Array.isArray(valueOfField) && valueOfField.length > 0
      ? DateTime.fromISO(valueOfField[0])
      : null
  );

  const renderDay: (
    selectedDays: unknown,
    arrayHelpers: ArrayHelpers
  ) => OutterCalendarProps['renderDay'] = (selectedDays, arrayHelpers) => {
    return (date, _selectedDate, dayInCurrentMonth) => {
      if (!date) {
        return <></>;
      }

      if (!isStringArray(selectedDays)) {
        return <></>;
      }

      const dayIsSelected = selectedDays.includes(getDateString(date));

      const dayClassName = clsx(classes.day, {
        [classes.highlight]: dayIsSelected,
        [classes.nonCurrentMonthDay]: !dayInCurrentMonth,
        [classes.highlightNonCurrentMonthDay]: !dayInCurrentMonth && dayIsSelected,
        [classes.highlightSpecial]: highlightDate === getDateString(date),
      });

      const labelClassName = clsx(classes.label, {
        [classes.label]: dayIsSelected,
      });

      return (
        <IconButton
          className={dayClassName}
          onClick={() => {
            if (onDateClicked) {
              onDateClicked(getDateString(date), selectedDays, arrayHelpers);
              return;
            }

            const idx = selectedDays.indexOf(getDateString(date));

            if (idx !== -1) {
              arrayHelpers.remove(idx);
            } else {
              arrayHelpers.insert(0, getDateString(date));
            }
          }}
        >
          <p className={labelClassName}> {date.toFormat('dd')} </p>
        </IconButton>
      );
    };
  };

  const onDateInListClicked: (
    selectedDays: unknown,
    arrayHelpers: ArrayHelpers
  ) => (date: string) => void = (selectedDays, arrayHelpers) => {
    return (date) => {
      if (!date) {
        return <></>;
      }

      if (!isStringArray(selectedDays)) {
        return <></>;
      }

      const idx = selectedDays.indexOf(date);

      if (idx > -1) {
        setValue(DateTime.fromISO(date));

        if (onDateClicked) {
          onDateClicked(date, selectedDays, arrayHelpers);
          return;
        }

        setTimeout(() => arrayHelpers.remove(idx), 100);
      }
    };
  };

  return (
    <FieldArray name={name}>
      {({ form, name, ...arrayHelpers }) => (
        <div className={classes.root}>
          <div className={classes.dateList}>
            <DateList
              dates={(form.values[name] as string[]).map<DateInList>((date) => ({
                dateValueString: date,
                dateDisplayString:
                  DateTime.fromISO(date).toLocaleString(DateTime.DATE_MED) ?? 'DATE_NOTE_PARSEABLE',
              }))}
              onDateClicked={onDateInListClicked(form.values[name], arrayHelpers)}
            />
          </div>

          <DatePicker
            variant='static'
            orientation='landscape'
            format='EE, dd MMMM yyyy'
            autoOk
            fullWidth
            {...other}
            name={name}
            value={value}
            disableToolbar
            onChange={(date) => setValue(date)}
            renderDay={renderDay(form.values[name], arrayHelpers)}
          />
        </div>
      )}
    </FieldArray>
  );
}

export default FormikMultipleDatesPicker;
