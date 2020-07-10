import {
  Box,
  Button,
  Divider,
  IconButton,
  InputProps,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from '@material-ui/core';
import { createStyles, fade, makeStyles } from '@material-ui/core/styles';
import _ from 'lodash';
import { AccountSearch as SearchIcon, Close as RemoveIcon } from 'mdi-material-ui';
import React, { useCallback, useEffect, useReducer } from 'react';
import { NamedElement } from 'shared/model/Common';
import { getNameOfEntity, sortByName } from 'shared/util/helpers';
import DateOrIntervalText from '../../../components/DateOrIntervalText';
import OutlinedBox from '../../../components/OutlinedBox';
import Placeholder from '../../../components/Placeholder';
import { useSubstituteManagementContext } from '../SubstituteManagement.context';

const useStyles = makeStyles((theme) =>
  createStyles({
    scrollableBox: {
      overflowY: 'auto',
      ...theme.mixins.scrollbar(8),
    },
    selectedSubstitute: {
      display: 'grid',
      gridTemplate: '1fr 1fr / 1fr fit-content(56px)',
      padding: theme.spacing(2),
      marginTop: theme.spacing(2),
    },
    removeSubstituteButton: {
      alignSelf: 'center',
      gridArea: '1 / 2 / span 2',
    },
    divider: {
      margin: theme.spacing(2, 0),
    },
    searchField: {
      flex: 1,
    },
    studentRowBackground: {
      borderColor: fade(theme.palette.text.primary, 0.23),
      '&:hover': {
        background: fade(theme.palette.text.primary, theme.palette.action.hoverOpacity),
      },
    },
  })
);

function filterTutors(filterText: string, tutors: NamedElement[] = []): NamedElement[] {
  return tutors
    .filter((student) => {
      if (!filterText) {
        return true;
      }

      const name = _.deburr(getNameOfEntity(student)).toLowerCase();
      const unifiedFilter = _.deburr(filterText).toLowerCase();

      return name.includes(unifiedFilter);
    })
    .sort(sortByName);
}

interface State {
  filterText: string;
  tutorsToShow: NamedElement[];
  allTutors: NamedElement[];
}

type Action =
  | { type: 'changeFilter'; data: string }
  | { type: 'changeTutors'; data: NamedElement[] };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'changeFilter':
      return {
        ...state,
        filterText: action.data,
        tutorsToShow: filterTutors(action.data, state.allTutors),
      };
    case 'changeTutors':
      return {
        ...state,
        tutorsToShow: filterTutors(state.filterText, action.data),
        allTutors: action.data,
      };
    default:
      return state;
  }
}

function SelectSubstitute(): JSX.Element {
  const classes = useStyles();
  const { tutorial, tutors, selectedDate } = useSubstituteManagementContext();

  const [{ tutorsToShow }, dispatch] = useReducer(
    reducer,
    { filterText: '', tutorsToShow: [], allTutors: [] },
    () => ({
      filterText: '',
      tutorsToShow: filterTutors('', tutors.value),
      allTutors: tutors.value ?? [],
    })
  );

  useEffect(() => {
    console.log('Got new tutors...');
    dispatch({ type: 'changeTutors', data: tutors.value ?? [] });
  }, [tutors.value]);

  const debouncedHandleChange = useCallback(
    _.debounce((filterText: string) => dispatch({ type: 'changeFilter', data: filterText }), 250),
    []
  );

  const handleTextChange: InputProps['onChange'] = (e) => {
    debouncedHandleChange(e.target.value);
  };

  const substitute = selectedDate ? tutorial.value?.getSubstitute(selectedDate) : undefined;

  return (
    <Placeholder
      loading={tutorial.isLoading || tutors.isLoading}
      showPlaceholder={!!tutorial.error || !!tutors.error}
      placeholderText={'Daten konnten nicht abgerufen werden.'}
    >
      {!!selectedDate ? (
        !!tutorial && (
          <>
            <DateOrIntervalText date={selectedDate} prefix='Vertretung für' variant='h6' />

            {!!substitute && (
              <Paper elevation={3} className={classes.selectedSubstitute}>
                <Typography variant='subtitle2'>Aktuelle Vertretung:</Typography>
                <Typography variant='subtitle1'>{getNameOfEntity(substitute)}</Typography>

                <Tooltip title='Vertretung entfernen'>
                  <IconButton className={classes.removeSubstituteButton}>
                    <RemoveIcon />
                  </IconButton>
                </Tooltip>
              </Paper>
            )}

            <Divider className={classes.divider} />

            <Box display='flex' marginBottom={1}>
              <TextField
                variant='outlined'
                label='Suche'
                onChange={handleTextChange}
                // value={filterText}
                className={classes.searchField}
                InputProps={{
                  startAdornment: <SearchIcon color='disabled' />,
                }}
              />

              {/* <CustomSelect
    label='Sortieren nach...'
    emptyPlaceholder='Keine Sortieroptionen vorhanden.'
    className={classes.sortSelect}
    value={sortOption}
    items={Object.values(StudentSortOption)}
    itemToString={(option) => option}
    itemToValue={(option) => option}
    onChange={handleSortOptionChange}
  /> */}
            </Box>

            <Box
              display='grid'
              gridTemplateColumns='1fr'
              gridRowGap={8}
              alignItems='center'
              className={classes.scrollableBox}
            >
              {tutorsToShow.map((student) => (
                <OutlinedBox
                  key={student.id}
                  display='grid'
                  gridTemplateColumns='1fr fit-content(50%)'
                  padding={2}
                  alignItems='center'
                  className={classes.studentRowBackground}
                >
                  <Typography>{getNameOfEntity(student)}</Typography>
                  <Button>Auswählen</Button>
                </OutlinedBox>
              ))}
            </Box>
          </>
        )
      ) : (
        <Typography variant='h6' style={{ margin: 'auto' }}>
          Kein Termin ausgewählt.
        </Typography>
      )}
    </Placeholder>
  );
}

export default SelectSubstitute;
