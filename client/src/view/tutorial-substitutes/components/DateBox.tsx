import { Box, Typography } from '@material-ui/core';
import { SelectInputProps } from '@material-ui/core/Select/SelectInput';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { DateTime } from 'luxon';
import React, { useCallback, useEffect, useState } from 'react';
import CustomSelect from '../../../components/CustomSelect';
import OutlinedBox from '../../../components/OutlinedBox';
import Placeholder from '../../../components/Placeholder';
import { Tutorial } from '../../../model/Tutorial';
import { compareDateTimes } from '../../../util/helperFunctions';
import { useSubstituteManagementContext } from '../SubstituteManagement.context';
import { FilterOption } from '../SubstituteManagement.types';
import DateButton from './DateButton';

const useStyles = makeStyles((theme) =>
  createStyles({
    scrollableBox: {
      overflowY: 'auto',
      ...theme.mixins.scrollbar(8),
    },
  })
);

type CallbackType = NonNullable<SelectInputProps['onChange']>;

function filterDates(tutorial: Tutorial | undefined, option: FilterOption): DateTime[] {
  if (!tutorial) {
    return [];
  }

  return tutorial.dates
    .filter((date) => {
      switch (option) {
        case FilterOption.ONLY_FUTURE_DATES:
          const diff = date.startOf('days').diffNow('days').days;
          return Math.ceil(diff) >= 0;
        case FilterOption.ALL_DATES:
          return true;
        case FilterOption.WITH_SUBSTITUTE:
          return tutorial.getSubstitute(date) !== undefined;
        case FilterOption.WITHOUT_SUBSTITUTE:
          return tutorial.getSubstitute(date) === undefined;
        default:
          return true;
      }
    })
    .sort(compareDateTimes);
}

function DateBox(): JSX.Element {
  const classes = useStyles();
  const { tutorial, selectedDate, setSelectedDate } = useSubstituteManagementContext();

  const [filterOption, setFilterOption] = useState<FilterOption>(
    () => FilterOption.ONLY_FUTURE_DATES
  );
  const [datesToShow, setDatesToShow] = useState<DateTime[]>(() =>
    filterDates(tutorial.value, filterOption)
  );

  useEffect(() => {
    setDatesToShow(filterDates(tutorial.value, filterOption));
  }, [tutorial, filterOption]);

  const handleChange = useCallback<CallbackType>((e) => {
    if (typeof e.target.value !== 'string') {
      return;
    }

    const selectedOption: FilterOption | undefined = Object.values(FilterOption).find(
      (op) => op === e.target.value
    );

    if (!selectedOption) {
      throw new Error('Selected filter option is not a valid one.');
    }

    setFilterOption(selectedOption);
  }, []);

  return (
    <Box display='flex' flexDirection='column' className={classes.scrollableBox}>
      <Typography variant='h6' style={{ marginBottom: 8 * 1.5 }}>
        Datum auswählen
      </Typography>

      <CustomSelect
        label='Filtern'
        items={Object.values(FilterOption)}
        itemToValue={(item) => item}
        itemToString={(item) => item}
        value={filterOption}
        onChange={handleChange}
      />

      <OutlinedBox
        flex={1}
        display='flex'
        flexDirection='column'
        marginTop={1.5}
        padding={1}
        className={classes.scrollableBox}
      >
        <Placeholder
          loading={tutorial.isLoading}
          placeholderText={'Es ist ein Fehler aufgetreten'}
          showPlaceholder={!!tutorial.error && !tutorial.isLoading}
        >
          {tutorial.value &&
            datesToShow.map((date) => (
              <DateButton
                key={date.toISODate()}
                date={date}
                tutorial={tutorial.value}
                isSelected={!!selectedDate && date.equals(selectedDate)}
                onClick={() => setSelectedDate(date)}
              />
            ))}
          {datesToShow.length === 0 && (
            <Typography align='center'>Keine entsprechenden Termine gefunden.</Typography>
          )}
        </Placeholder>
      </OutlinedBox>
    </Box>
  );
}

export default DateBox;
