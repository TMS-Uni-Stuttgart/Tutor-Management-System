import {
  Autocomplete,
  Checkbox,
  Chip,
  CircularProgress,
  FormControl,
  FormHelperText,
  ListItemText,
  MenuItem,
  TextField,
} from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import { Field, FieldProps } from 'formik';
import React, { useEffect, useRef } from 'react';
import { useLogger } from '../../../util/Logger';

const useStyles = makeStyles((theme) =>
  createStyles({
    chip: {
      marginLeft: theme.spacing(0.5),
      marginRight: theme.spacing(0.5),
      marginTop: -12,
      marginBottom: -12,
    },
    dropdownItem: {
      display: 'flex',
      alignItems: 'center',
    },
    checkbox: {
      marginRight: theme.spacing(1),
    },
    customDropdown: {
      backgroundColor: theme.palette.background.paper,
    },
  })
);

interface FormikAutocompleteSelectProps<T> {
  name: string;
  label: string;
  emptyPlaceholder?: string;
  items: T[];
  itemToString: (item: T) => string;
  itemToValue: (item: T) => string | number;
  multiple?: boolean;
  fullWidth?: boolean;
  helperText?: string;
  error?: boolean;
  showLoadingIndicator?: boolean;
}

function FormikAutocompleteSelect<T>({
  name,
  label,
  emptyPlaceholder,
  items: itemsFromProps,
  itemToString,
  itemToValue,
  multiple,
  fullWidth,
  helperText,
  error,
  showLoadingIndicator,
}: FormikAutocompleteSelectProps<T>): JSX.Element {
  const classes = useStyles();
  const logger = useLogger('FormikAutocompleteSelect');

  const itemCache = useRef<Map<string | number, T>>(new Map());

  useEffect(() => {
    logger.debug(`Rebuilding item cache of autocomplete select ${name}`);
    itemCache.current.clear();
    itemsFromProps.forEach((item) => {
      itemCache.current.set(itemToValue(item), item);
    });
  }, [itemsFromProps, itemToValue, logger, name]);

  return (
    <Field name={name}>
      {({ field, form, meta }: FieldProps) => {
        const handleChange = (_event: React.SyntheticEvent, newValue: T[] | T | null) => {
          const value = multiple
            ? (newValue as T[]).map(itemToValue)
            : newValue
              ? itemToValue(newValue as T)
              : null;
          form.setFieldValue(name, value);
        };

        const selectedValue = multiple
          ? itemsFromProps.filter((item) => (field.value as any[]).includes(itemToValue(item)))
          : itemsFromProps.find((item) => itemToValue(item) === field.value);

        return (
          <FormControl fullWidth={fullWidth} error={error || Boolean(meta.error)}>
            <Autocomplete
              slotProps={{ paper: { className: classes.customDropdown } }}
              multiple={multiple}
              options={itemsFromProps}
              getOptionLabel={itemToString}
              isOptionEqualToValue={(option, value) => itemToValue(option) === itemToValue(value)}
              value={selectedValue}
              onChange={handleChange}
              disableCloseOnSelect
              renderTags={(selected) =>
                selected.map((option) => (
                  <Chip
                    key={itemToValue(option)}
                    label={itemToString(option)}
                    className={classes.chip}
                  />
                ))
              }
              renderOption={(props, option, { selected }) => {
                const { key, ...restProps } = props;
                return (
                  <MenuItem
                    key={itemToValue(option)}
                    {...restProps}
                    className={classes.dropdownItem}
                  >
                    {multiple && <Checkbox checked={selected} className={classes.checkbox} />}
                    <ListItemText primary={itemToString(option)} />
                  </MenuItem>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  name={name}
                  label={label}
                  variant='outlined'
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {showLoadingIndicator && <CircularProgress size={20} />}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                  error={Boolean(meta.touched && meta.error)}
                  helperText={meta.touched && meta.error ? meta.error : helperText}
                />
              )}
              noOptionsText={emptyPlaceholder}
            />
            {helperText && <FormHelperText>{helperText}</FormHelperText>}
          </FormControl>
        );
      }}
    </Field>
  );
}

export default FormikAutocompleteSelect;
