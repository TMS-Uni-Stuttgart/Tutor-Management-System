import {
  Checkbox,
  Chip,
  FormControl,
  FormHelperText,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  Theme,
} from '@material-ui/core';
import { FormControlProps } from '@material-ui/core/FormControl';
import { SelectProps } from '@material-ui/core/Select';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import React, { useEffect, useRef, useState } from 'react';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    chip: {
      marginLeft: theme.spacing(0.5),
      marginRight: theme.spacing(0.5),
      // These prevent the box to get bigger if a chip is shown.
      marginTop: -12,
      marginBottom: -12,
    },
    dropdownIcon: {
      right: 8,
    },
  })
);

type ItemToString<T> = (item: T) => string;

export interface CustomSelectProps<T>
  extends Omit<SelectProps, 'variant' | 'input' | 'children' | 'renderValue'> {
  name?: string;
  label: string;
  emptyPlaceholder: string;
  nameOfNoneItem?: string;
  helperText?: React.ReactNode;
  items: T[];
  itemToString: ItemToString<T>;
  itemToValue: ItemToString<T>;
  isItemSelected?: (item: T) => boolean;
  FormControlProps?: Omit<FormControlProps, 'variant' | 'className'>;
}

export type OnChangeHandler = CustomSelectProps<{}>['onChange'];

class EmptyItem {
  constructor(readonly id: string, readonly name: string) {}
}

function renderValue<T>(
  items: T[],
  itemToString: ItemToString<T>,
  itemToValue: ItemToString<T>,
  chipClassName: string
): (selected: unknown) => JSX.Element | null {
  return function (selected: unknown) {
    if (!Array.isArray(selected)) {
      return null;
    }

    if (!selected.every((item) => typeof item === 'string')) {
      return null;
    }

    const chipsToRender = selected.map((selValue) => {
      const item = items.find((i) => itemToValue(i) === selValue);

      if (!item) {
        return null;
      }

      return <Chip key={selValue} label={itemToString(item)} className={chipClassName} />;
    });

    return <>{chipsToRender}</>;
  };
}

function CustomSelect<T>({
  name,
  label,
  emptyPlaceholder,
  helperText,
  error,
  className,
  onChange,
  items: itemsFromProps,
  itemToString,
  itemToValue,
  nameOfNoneItem,
  isItemSelected,
  multiple,
  FormControlProps,
  classes: classesFromProps,
  ...other
}: CustomSelectProps<T>): JSX.Element {
  if (multiple && !isItemSelected) {
    console.error(
      `[CustomSelect] -- You have set the Select '${name}' to allow multiple selections but you have not passed an isItemSelected function via props. Therefore Checkboxes won't be shown for the items.`
    );
  }

  if (multiple && !!nameOfNoneItem) {
    throw new Error(
      `[CustomSelect] -- You have set the Select '${name}' to allow multiple selections and you also provided 'nameOfNoneItem'. This combination of properties is not supported because 'multiple = true' Selects do not need an extra 'none item'.`
    );
  }

  const NONE_ITEM = new EmptyItem('NONE', 'NONE_NAME');

  const classes = useStyles();
  const inputLabel = useRef<HTMLLabelElement>(null);
  const [labelWidth, setLabelWidth] = useState(0);

  const items: (T | EmptyItem)[] = !!nameOfNoneItem
    ? [NONE_ITEM, ...itemsFromProps]
    : itemsFromProps;

  useEffect(() => {
    const label = inputLabel.current;
    setLabelWidth(label ? label.offsetWidth : 0);
  }, []);

  return (
    <FormControl {...FormControlProps} className={className} variant='outlined' error={error}>
      <InputLabel ref={inputLabel}>{label}</InputLabel>
      <Select
        fullWidth
        {...other}
        name={name}
        onChange={onChange}
        variant='outlined'
        labelWidth={labelWidth}
        multiple={multiple}
        renderValue={
          multiple
            ? renderValue(
                items.filter((i) => !(i instanceof EmptyItem)) as T[],
                itemToString,
                itemToValue,
                classes.chip
              )
            : undefined
        }
        classes={{
          ...classesFromProps,
          icon: clsx(classesFromProps && classesFromProps.icon, classes.dropdownIcon),
        }}
      >
        {items.map((item) => {
          if (item instanceof EmptyItem) {
            return (
              <MenuItem key={NONE_ITEM.id} value={''}>
                <i>{nameOfNoneItem}</i>
              </MenuItem>
            );
          }

          const itemString: string = itemToString(item);
          const itemValue: string = itemToValue(item);

          return (
            <MenuItem key={itemValue} value={itemValue}>
              {multiple ? (
                <>
                  {isItemSelected && <Checkbox checked={isItemSelected(item)} />}
                  <ListItemText primary={itemString} />
                </>
              ) : (
                itemString
              )}
            </MenuItem>
          );
        })}

        {items.length === 0 && (
          <MenuItem value='' disabled>
            <ListItemText primary={emptyPlaceholder} />
          </MenuItem>
        )}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
}

export default CustomSelect;
