import {
  Checkbox,
  Chip,
  CircularProgress,
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
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLogger } from '../util/Logger';

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

export interface ItemDisabledInformation {
  isDisabled: boolean;
  reason?: string;
}

export interface ItemDisplayInformation {
  primary: string;
  secondary?: string;
}

export type ItemToValue<T> = (item: T) => string;
export type ItemToString<T> = (item: T) => string | ItemDisplayInformation;
export type ItemToBoolean<T> = (item: T) => boolean;
export type IsItemDisabledFunction<T> = (item: T) => ItemDisabledInformation;

export interface CustomSelectProps<T>
  extends Omit<SelectProps, 'variant' | 'input' | 'children' | 'renderValue'> {
  name?: string;
  label: string;
  emptyPlaceholder?: string;
  nameOfNoneItem?: string;
  helperText?: React.ReactNode;
  items: T[];
  itemToString: ItemToString<T>;
  itemToValue: ItemToValue<T>;
  isItemDisabled?: IsItemDisabledFunction<T>;
  isItemSelected?: ItemToBoolean<T>;
  FormControlProps?: Omit<FormControlProps, 'variant' | 'className'>;
  showLoadingIndicator?: boolean;
}

export type OnChangeHandler = CustomSelectProps<unknown>['onChange'];

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

      const label = itemToString(item);
      return (
        <Chip
          key={selValue}
          label={typeof label === 'string' ? label : label.primary}
          className={chipClassName}
        />
      );
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
  isItemDisabled,
  isItemSelected,
  multiple,
  FormControlProps,
  classes: classesFromProps,
  showLoadingIndicator,
  ...other
}: CustomSelectProps<T>): JSX.Element {
  const logger = useLogger('CustomSelect');
  if (multiple && !isItemSelected) {
    logger.warn(
      `You have set the Select '${name}' to allow multiple selections but you have not passed an isItemSelected function via props. Therefore Checkboxes won't be shown for the items.`
    );
  }

  if (multiple && !!nameOfNoneItem) {
    throw new Error(
      `[CustomSelect] -- You have set the Select '${name}' to allow multiple selections and you also provided 'nameOfNoneItem'. This combination of properties is not supported because 'multiple = true' Selects do not need an extra 'none item'.`
    );
  }

  const classes = useStyles();
  const inputLabel = useRef<HTMLLabelElement>(null);
  const itemCache = useRef<Map<string, T>>(new Map());
  const [labelWidth, setLabelWidth] = useState(0);

  const NONE_ITEM = useMemo(() => new EmptyItem('NONE', 'NONE_NAME'), []);
  const items: (T | EmptyItem)[] = useMemo(
    () => (!!nameOfNoneItem ? [NONE_ITEM, ...itemsFromProps] : itemsFromProps),
    [NONE_ITEM, itemsFromProps, nameOfNoneItem]
  );

  useEffect(() => {
    const label = inputLabel.current;
    setLabelWidth(label ? label.offsetWidth : 0);
  }, []);

  useEffect(() => {
    logger.debug(`Rebuilding item cache of select ${name}`);
    itemCache.current.clear();

    items.forEach((item) => {
      if (!(item instanceof EmptyItem)) {
        itemCache.current.set(itemToValue(item), item);
      }
    });
  }, [items, itemToValue, logger, name]);

  return (
    <FormControl {...FormControlProps} className={className} variant='outlined' error={error}>
      <InputLabel required={other.required} ref={inputLabel}>
        {label}
      </InputLabel>
      <Select
        fullWidth
        IconComponent={
          showLoadingIndicator
            ? (props: any) => <CircularProgress {...props} size={24} />
            : undefined
        }
        defaultValue={''}
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
            : (value) => {
                if (typeof value !== 'string') {
                  throw new Error('Non string values are not supported.');
                }

                const selectedItem: T | undefined = itemCache.current.get(value);
                return selectedItem === undefined ? '' : itemToString(selectedItem);
              }
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

          const itemString = itemToString(item);
          const itemValue: string = itemToValue(item);
          const { isDisabled, reason }: ItemDisabledInformation = isItemDisabled?.(item) ?? {
            isDisabled: false,
          };

          const text: ItemDisplayInformation =
            typeof itemString === 'string'
              ? {
                  primary: itemString,
                  secondary: isDisabled ? reason : undefined,
                }
              : {
                  primary: itemString.primary,
                  secondary: isDisabled ? reason ?? itemString.secondary : itemString.secondary,
                };

          return (
            <MenuItem key={itemValue} value={itemValue} disabled={isDisabled}>
              {multiple ? (
                <>
                  {isItemSelected && <Checkbox checked={isItemSelected(item)} />}
                  <ListItemText {...text} />
                </>
              ) : (
                <ListItemText {...text} />
              )}
            </MenuItem>
          );
        })}

        {items.length === 0 && (
          <MenuItem value='' disabled>
            <ListItemText primary={emptyPlaceholder ?? 'Keine Items verfügbar'} />
          </MenuItem>
        )}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
}

export default CustomSelect;
