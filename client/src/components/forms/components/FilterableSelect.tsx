import {
  Box,
  BoxProps,
  Checkbox,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
} from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { deburr } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { useLogger } from '../../../util/Logger';
import OutlinedBox from '../../OutlinedBox';

const useStyles = makeStyles((theme) =>
  createStyles({
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

export interface FilterableSelectProps<T> extends Omit<BoxProps, 'onChange'> {
  label: string;
  emptyPlaceholder: string;
  items: T[];
  itemToString: ItemToString<T>;
  itemToValue: ItemToString<T>;
  filterPlaceholder: string;
  onChange?: (newValue: string[], oldValue: string[]) => void;
  value?: string[];
  singleSelect?: boolean;
}

function FilterableSelect<T>({
  label,
  emptyPlaceholder,
  items,
  itemToString,
  itemToValue,
  filterPlaceholder,
  singleSelect,
  value: valueFromProps,
  onChange,
  ...other
}: FilterableSelectProps<T>): JSX.Element {
  const classes = useStyles();
  const logger = useLogger('FilterableSelect');

  const [filter, setFilter] = useState('');
  const [value, setValue] = useState<string[]>(valueFromProps ?? []);

  useEffect(() => {
    setValue(valueFromProps ?? []);
  }, [valueFromProps]);

  const isItemMatchingFilter = useCallback(
    (item: T) => {
      if (!filter) {
        return true;
      }

      const itemString = deburr(itemToString(item).trim().toLowerCase());

      return itemString.indexOf(filter) > -1;
    },
    [filter, itemToString]
  );

  const isItemSelected = useCallback(
    (item: T) => {
      const valueOfItem = itemToValue(item);
      return value.indexOf(valueOfItem) > -1;
    },
    [itemToValue, value]
  );

  const handleItemClicked = useCallback(
    (itemValue: string) => {
      const idx = value.indexOf(itemValue);
      const newValue = [...value];

      if (idx === -1) {
        if (singleSelect) {
          newValue[0] = itemValue;
        } else {
          newValue.push(itemValue);
        }
      } else {
        newValue.splice(idx, 1);
      }

      if (onChange) {
        onChange(newValue, value);
      } else {
        setValue(newValue);
      }
    },
    [singleSelect, value, onChange]
  );

  if (singleSelect && value.length > 1) {
    logger.error(
      `The values of the FilterableSelect should have length 1 (or 0) if 'singleSelect' is true (current length: ${value.length}).`
    );
  }

  return (
    <OutlinedBox
      maxHeight={400}
      display='flex'
      flexDirection='column'
      position='relative'
      {...other}
    >
      <Box bgcolor='paper' position='absolute' zIndex={4} top={-10} left={8} paddingX={0.5}>
        {label}
      </Box>

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
              <ListItem key={itemValue} button onClick={() => handleItemClicked(itemValue)}>
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
    </OutlinedBox>
  );
}

export default FilterableSelect;
