import { Checkbox, List, ListItem, ListItemIcon, ListItemText, TextField } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import clsx from 'clsx';
import { FieldArray, useField } from 'formik';
import { deburr } from 'lodash';
import React, { useState } from 'react';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      // borderWidth: 1,
      // borderStyle: 'solid',
      // borderColor: theme.palette.divider,
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: theme.shape.borderRadius,
      maxHeight: 400,
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
    },
    label: {
      background: theme.palette.background.paper,
      position: 'absolute',
      zIndex: 5,
      top: -10,
      left: 8,
      padding: theme.spacing(0, 0.5),
    },
    textField: {
      margin: theme.spacing(2, 0, 1, 0),
    },
    inputField: {
      padding: theme.spacing(1, 1, 0, 1),
    },
    list: {
      flex: 1,
      overflowY: 'auto',
    },
  })
);

type ItemToString<T> = (item: T) => string;

interface Props<T> extends React.ComponentProps<'div'> {
  name: string;
  label: string;
  emptyPlaceholder: string;
  items: T[];
  itemToString: ItemToString<T>;
  itemToValue: ItemToString<T>;
  isItemSelected: (item: T) => boolean;
  filterPlaceholder: string;
  singleSelect?: boolean;
}

function FormikFilterableSelect<T>({
  name,
  label,
  emptyPlaceholder,
  items,
  itemToString,
  itemToValue,
  isItemSelected,
  filterPlaceholder,
  className,
  singleSelect,
  ...other
}: Props<T>): JSX.Element {
  const classes = useStyles();
  const [filter, setFilter] = useState('');
  const [, meta] = useField<string[]>(name);

  if (!Array.isArray(meta.value)) {
    throw new Error(
      `FormikFilterableSelect -- The values object of the Formik form should be an array at property '${name}'. This is not the case. The current type is ${typeof meta.value}`
    );
  }

  if (singleSelect && meta.value.length > 1) {
    throw new Error(
      `FormikFilterableSelect -- The values object of the Formik form should have length 1 (or 0) if 'singleSelect' is true (current length: ${meta.value.length}).`
    );
  }

  function isItemMatchingFilter(item: T) {
    if (!filter) {
      return true;
    }

    const itemString = deburr(itemToString(item).trim().toLowerCase());

    return itemString.indexOf(filter) > -1;
  }

  return (
    <FieldArray
      name={name}
      render={(arrayHelpers) => (
        <div {...other} className={clsx(classes.root, className)}>
          <div className={classes.label}>{label}</div>

          <TextField
            variant='standard'
            placeholder={filterPlaceholder}
            className={classes.textField}
            onChange={(e) => setFilter(deburr(e.target.value.trim().toLowerCase()))}
            InputProps={{
              className: classes.inputField,
            }}
          />

          <div className={classes.list}>
            <List>
              {items.filter(isItemMatchingFilter).map((item) => {
                const itemValue = itemToValue(item);
                const itemString = itemToString(item);

                return (
                  <ListItem
                    key={itemValue}
                    button
                    onClick={() => {
                      const idx = meta.value.indexOf(itemValue);
                      if (idx === -1) {
                        if (singleSelect) {
                          arrayHelpers.replace(0, itemValue);
                        } else {
                          arrayHelpers.insert(meta.value.length - 1, itemValue);
                        }
                      } else {
                        arrayHelpers.remove(idx);
                      }
                    }}
                  >
                    <ListItemIcon>
                      <Checkbox edge='start' checked={isItemSelected(item)} disableRipple />
                    </ListItemIcon>
                    <ListItemText primary={itemString} />
                  </ListItem>
                );
              })}

              {items.length === 0 && (
                <ListItem>
                  <ListItemText primary={emptyPlaceholder} />
                </ListItem>
              )}
            </List>
          </div>
        </div>
      )}
    />
  );
}

export default FormikFilterableSelect;
