import { Box, Button, Divider, InputProps, TextField, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import _ from 'lodash';
import { AccountSearch as SearchIcon } from 'mdi-material-ui';
import React, { useCallback, useEffect, useReducer } from 'react';
import { NamedElement } from 'shared/model/Common';
import { getNameOfEntity } from 'shared/util/helpers';
import DateOrIntervalText from '../../../components/DateOrIntervalText';
import Placeholder from '../../../components/Placeholder';
import { useSubstituteManagementContext } from '../SubstituteManagement.context';
import ListOfTutors from './ListOfTutors';
import SelectedSubstituteBar from './SelectedSubstituteBar';
import { useLoggedInUser } from '../../../hooks/LoginService';
import { LoggedInUser } from '../../../model/LoggedInUser';

const useStyles = makeStyles((theme) =>
  createStyles({
    divider: {
      margin: theme.spacing(2, 0),
    },
    searchField: {
      flex: 1,
      marginRight: theme.spacing(1.5),
    },
  })
);

function filterTutors(
  filterText: string,
  currentUser: LoggedInUser,
  tutors: NamedElement[] = []
): NamedElement[] {
  return tutors.filter((tutor) => {
    if (currentUser.id === tutor.id) {
      return false;
    }

    if (!filterText) {
      return true;
    }

    const name = _.deburr(getNameOfEntity(tutor)).toLowerCase();
    const unifiedFilter = _.deburr(filterText).toLowerCase();

    return name.includes(unifiedFilter);
  });
}

interface State {
  filterText: string;
  tutorsToShow: NamedElement[];
  allTutors: NamedElement[];
  currentUser: LoggedInUser;
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
        tutorsToShow: filterTutors(action.data, state.currentUser, state.allTutors),
      };
    case 'changeTutors':
      return {
        ...state,
        tutorsToShow: filterTutors(state.filterText, state.currentUser, action.data),
        allTutors: action.data,
      };
    default:
      return state;
  }
}

function SelectSubstitute(): JSX.Element {
  const classes = useStyles();
  const currentUser = useLoggedInUser();
  const {
    tutorial,
    tutors,
    selectedDate,
    getSelectedSubstitute,
    setSelectedSubstitute,
    removeSelectedSubstitute,
    resetSelectedSubstitute,
  } = useSubstituteManagementContext();

  const [{ tutorsToShow }, dispatch] = useReducer(
    reducer,
    { filterText: '', tutorsToShow: [], allTutors: [], currentUser },
    () => ({
      filterText: '',
      tutorsToShow: filterTutors('', currentUser, tutors.value),
      allTutors: tutors.value ?? [],
      currentUser,
    })
  );

  useEffect(() => {
    dispatch({ type: 'changeTutors', data: tutors.value ?? [] });
  }, [tutors.value]);

  const debouncedHandleChange = useCallback(
    _.debounce((filterText: string) => dispatch({ type: 'changeFilter', data: filterText }), 250),
    []
  );

  const handleTextChange: InputProps['onChange'] = (e) => {
    debouncedHandleChange(e.target.value);
  };

  const selectedSubstitute = selectedDate ? getSelectedSubstitute(selectedDate) : undefined;

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

            <SelectedSubstituteBar
              substitute={selectedSubstitute}
              onRemoveClicked={() => removeSelectedSubstitute(selectedDate)}
            />

            <Divider className={classes.divider} />

            <Box display='flex' marginBottom={1}>
              <TextField
                variant='outlined'
                label='Suche'
                onChange={handleTextChange}
                onKeyDown={(e) => e.key !== 'Enter'}
                className={classes.searchField}
                InputProps={{
                  startAdornment: <SearchIcon color='disabled' />,
                }}
              />

              <Button variant='outlined' onClick={() => resetSelectedSubstitute(selectedDate)}>
                Zurücksetzen
              </Button>
            </Box>

            <ListOfTutors
              tutorsToShow={tutorsToShow}
              onSelect={(tutor) => setSelectedSubstitute(tutor, selectedDate)}
              selectedSubstitute={selectedSubstitute}
            />
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
