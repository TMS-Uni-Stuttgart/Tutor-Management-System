import { Box, BoxProps, TextField } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { AccountSearch as SearchIcon } from 'mdi-material-ui';
import React, { useCallback } from 'react';
import CustomSelect from '../../../../components/CustomSelect';
import { StudentSortOption } from '../StudentList.helpers';

const useStyles = makeStyles((theme) =>
  createStyles({
    searchField: {
      flex: 1,
    },
    sortSelect: {
      marginLeft: theme.spacing(2),
      minWidth: '20%',
    },
  })
);

interface TopBarProps extends BoxProps {
  filterText: string;
  onFilterTextChanged: (newText: string) => void;
  sortOption: StudentSortOption;
  onSortOptionChanged: (newOption: StudentSortOption) => void;
  additionalTopBarItem?: React.ReactNode;
  hideDefaultTopBarContent?: boolean;
}

function StudentListTopBar({
  filterText,
  onFilterTextChanged,
  sortOption,
  onSortOptionChanged,
  additionalTopBarItem,
  hideDefaultTopBarContent,
  ...props
}: TopBarProps): JSX.Element {
  const classes = useStyles();

  const handleSortOptionChanged = useCallback(
    (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
      if (typeof e.target.value !== 'string') {
        return;
      }

      if (e.target.value === sortOption) {
        return;
      }

      const selectedOption: StudentSortOption | undefined = Object.values(StudentSortOption).find(
        (op) => op === e.target.value
      );

      if (!selectedOption) {
        throw new Error('Selected filter option is not a valid one.');
      }

      onSortOptionChanged(selectedOption);
    },
    [sortOption, onSortOptionChanged]
  );

  return (
    <Box display='flex' position='relative' {...props}>
      {!hideDefaultTopBarContent && (
        <>
          <TextField
            variant='outlined'
            label='Suche'
            value={filterText}
            onChange={(e) => onFilterTextChanged(e.target.value)}
            className={classes.searchField}
            InputProps={{
              startAdornment: <SearchIcon color='disabled' />,
            }}
          />
          <CustomSelect
            label='Sortieren nach...'
            emptyPlaceholder='Keine Sortieroptionen vorhanden.'
            className={classes.sortSelect}
            value={sortOption}
            items={Object.values(StudentSortOption)}
            itemToString={(option) => option}
            itemToValue={(option) => option}
            onChange={handleSortOptionChanged}
          />
        </>
      )}

      {additionalTopBarItem}
    </Box>
  );
}

export default StudentListTopBar;
