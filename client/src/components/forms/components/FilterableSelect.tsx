import {
  Box,
  BoxProps,
  Checkbox,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
} from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import _ from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { FixedSizeList } from 'react-window';
import { Dimensions, useResizeObserver } from '../../../hooks/useResizeObserver';
import { useLogger } from '../../../util/Logger';
import { ItemDisplayInformation } from '../../CustomSelect';
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

type ItemToString<T> = (item: T) => string | ItemDisplayInformation;
type ItemToValue<T> = (item: T) => string;

export interface FilterableSelectProps<T> extends Omit<BoxProps, 'onChange'> {
  label: string;
  emptyPlaceholder: string;
  items: T[];
  itemToString: ItemToString<T>;
  itemToValue: ItemToValue<T>;
  filterPlaceholder: string;
  onChange?: (newValue: string[], oldValue: string[]) => void;
  value?: string[];
  singleSelect?: boolean;
  listStartDimensions?: Dimensions;
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
  listStartDimensions,
  ...other
}: FilterableSelectProps<T>): JSX.Element {
  const classes = useStyles();
  const logger = useLogger('FilterableSelect');
  const [list, dimensions] = useResizeObserver<HTMLDivElement>(listStartDimensions);

  const [filter, setFilterText] = useState('');
  const [value, setValue] = useState<string[]>(valueFromProps ?? []);
  const [filteredItems, setFilteredItems] = useState<T[]>([]);

  const isItemMatchingFilter = useCallback(
    (item: T) => {
      if (!filter) {
        return true;
      }

      const itemString = itemToString(item);
      const primaryString = typeof itemString === 'string' ? itemString : itemString.primary;
      const deburredString = _.deburr(primaryString.trim().toLowerCase());

      return deburredString.indexOf(filter) > -1;
    },
    [filter, itemToString]
  );

  const handleFilterChanged = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const filterText = _.deburr(e.target.value.trim().toLowerCase());

      setFilterText(filterText);
      setFilteredItems(items.filter(isItemMatchingFilter));
    },
    [items, isItemMatchingFilter]
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

  useEffect(() => {
    setValue(valueFromProps ?? []);
  }, [valueFromProps]);

  useEffect(() => {
    setFilteredItems(items.filter(isItemMatchingFilter));
  }, [items, isItemMatchingFilter]);

  if (singleSelect && value.length > 1) {
    logger.error(
      `The values of the FilterableSelect should have length 1 or 0 if 'singleSelect' is true (current length: ${value.length}).`
    );
  }

  return (
    <OutlinedBox display='flex' flexDirection='column' position='relative' {...other}>
      <Box bgcolor='paper' position='absolute' zIndex={4} top={-10} left={8} paddingX={0.5}>
        {label}
      </Box>

      <TextField
        variant='standard'
        placeholder={filterPlaceholder}
        className={classes.textField}
        onChange={handleFilterChanged}
        InputProps={{
          className: classes.inputField,
        }}
      />

      <div ref={list} className={classes.list}>
        {filteredItems.length === 0 ? (
          <ListItem style={{ height: dimensions.height }}>
            <ListItemText primary={emptyPlaceholder} />
          </ListItem>
        ) : (
          <FixedSizeList
            height={dimensions.height}
            width={dimensions.width}
            itemCount={filteredItems.length}
            itemSize={50}
          >
            {({ index, style }) => {
              const item = filteredItems[index];
              const itemValue = itemToValue(item);
              const itemString = itemToString(item);
              const text: ItemDisplayInformation =
                typeof itemString === 'string'
                  ? {
                      primary: itemString,
                    }
                  : {
                      primary: itemString.primary,
                      secondary: itemString.secondary,
                    };

              return (
                <ListItem
                  key={itemValue}
                  button
                  onClick={() => handleItemClicked(itemValue)}
                  style={{ ...style }}
                >
                  <ListItemIcon>
                    <Checkbox edge='start' checked={isItemSelected(item)} disableRipple />
                  </ListItemIcon>
                  <ListItemText {...text} />
                </ListItem>
              );
            }}
          </FixedSizeList>
        )}
      </div>
    </OutlinedBox>
  );
}

export default FilterableSelect;
