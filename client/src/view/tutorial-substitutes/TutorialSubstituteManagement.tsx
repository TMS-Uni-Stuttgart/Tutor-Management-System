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
import { SelectInputProps } from '@material-ui/core/Select/SelectInput';
import { createStyles, fade, makeStyles } from '@material-ui/core/styles';
import { plainToClass } from 'class-transformer';
import _ from 'lodash';
import { DateTime } from 'luxon';
import {
  AccountSearch as SearchIcon,
  ChevronRight as RightArrow,
  Close as RemoveIcon,
} from 'mdi-material-ui';
import React, { useCallback, useEffect, useState } from 'react';
import { NamedElement } from 'shared/model/Common';
import { ITutorial } from 'shared/model/Tutorial';
import { getNameOfEntity, sortByName } from 'shared/util/helpers';
import BackButton from '../../components/BackButton';
import CustomSelect from '../../components/CustomSelect';
import DateOrIntervalText from '../../components/DateOrIntervalText';
import OutlinedBox from '../../components/OutlinedBox';
import { Tutorial } from '../../model/Tutorial';
import { ROUTES } from '../../routes/Routing.routes';
import { compareDateTimes } from '../../util/helperFunctions';

const useStyles = makeStyles((theme) =>
  createStyles({
    scrollableBox: {
      overflowY: 'auto',
      ...theme.mixins.scrollbar(8),
    },
    backButton: {
      height: 'fit-content',
      marginRight: theme.spacing(1),
    },
    dateButton: {
      marginTop: theme.spacing(1.5),
      '&:first-of-type': {
        marginTop: 0,
      },
    },
    dateButtonIcon: {
      marginLeft: 'auto',
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

enum FilterOption {
  ONLY_FUTURE_DATES = 'Nur zukünftige Termine',
  ALL_DATES = 'Alle Termine',
  WITHOUT_SUBSTITUTE = 'Ohne Vertretung',
  WITH_SUBSTITUTE = 'Mit Vertretung',
}

interface Props {
  tutorial: Tutorial;
  students: NamedElement[];
}

function filterStudents(students: NamedElement[], filterText: string): NamedElement[] {
  return students
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

function filterDates(tutorial: Tutorial, option: FilterOption): DateTime[] {
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

function TutorialSubstituteManagementContent({ tutorial, students }: Props): JSX.Element {
  const classes = useStyles();

  const [filterOption, setFilterOption] = useState<FilterOption>(
    () => FilterOption.ONLY_FUTURE_DATES
  );
  const [filterText, setFilterText] = useState('');

  const [datesToShow, setDatesToShow] = useState<DateTime[]>(() =>
    filterDates(tutorial, filterOption)
  );
  const [studentsToShow, setStudentsToShow] = useState<NamedElement[]>(() =>
    filterStudents(students, filterText)
  );
  const [selectedDate, setSelectedDate] = useState<DateTime>();

  useEffect(() => {
    setDatesToShow(filterDates(tutorial, filterOption));
  }, [tutorial, filterOption]);

  const debouncedHandleChange = useCallback(
    _.debounce(
      (filterText: string) => setStudentsToShow(filterStudents(students, filterText)),
      250
    ),
    []
  );

  const handleChange: SelectInputProps['onChange'] = (e) => {
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
  };

  const handleTextChange: InputProps['onChange'] = (e) => {
    setFilterText(e.target.value);
    debouncedHandleChange(e.target.value);
  };

  return (
    <Box
      flex={1}
      display='grid'
      gridTemplateColumns='fit-content(340px) minmax(0, 1fr)'
      gridTemplateRows='fit-content(80px) 1fr fit-content(80px)'
      gridRowGap={16}
      gridColumnGap={16}
      height='100%'
    >
      <Box display='flex' alignItems='center'>
        <BackButton to={ROUTES.MANAGE_TUTORIALS.create({})} className={classes.backButton} />

        <Typography color='error' style={{ visibility: 'visible' }}>
          Es gibt ungespeicherte Änderungen.
        </Typography>
      </Box>

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
          {datesToShow.map((date) => (
            <Button
              variant='outlined'
              color={date === selectedDate ? 'primary' : 'default'}
              key={date.toISODate()}
              className={classes.dateButton}
              classes={{ endIcon: classes.dateButtonIcon }}
              endIcon={<RightArrow />}
              onClick={() => setSelectedDate(date)}
            >
              <Box
                display='flex'
                flexDirection='column'
                textAlign='left'
                style={{ textTransform: 'none' }}
              >
                <DateOrIntervalText date={date} />
                {
                  <Typography variant='caption'>
                    {!!tutorial.getSubstitute(date)
                      ? `Vertretung: ${getNameOfEntity(tutorial.getSubstitute(date)!)}`
                      : 'Keine Vertretung'}
                  </Typography>
                }
              </Box>
            </Button>
          ))}
          {datesToShow.length === 0 && (
            <Typography align='center'>Keine entsprechenden Termine gefunden.</Typography>
          )}
        </OutlinedBox>
      </Box>

      <Button variant='contained' color='primary' fullWidth>
        Vertretungen speichern
      </Button>

      <OutlinedBox gridArea='1 / 2 / span 3 / span 1' display='flex' flexDirection='column'>
        {!!selectedDate ? (
          <>
            <DateOrIntervalText date={selectedDate} prefix='Vertretung für' variant='h6' />

            {!!tutorial.getSubstitute(selectedDate) && (
              <Paper elevation={3} className={classes.selectedSubstitute}>
                <Typography variant='subtitle2'>Aktuelle Vertretung:</Typography>
                <Typography variant='subtitle1'>
                  {getNameOfEntity(tutorial.getSubstitute(selectedDate)!)}
                </Typography>

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
                value={filterText}
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
              {studentsToShow.map((student) => (
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
        ) : (
          <Typography variant='h6' style={{ margin: 'auto' }}>
            Kein Termin ausgewählt.
          </Typography>
        )}
      </OutlinedBox>
    </Box>
  );
}

function TutorialSubstituteManagement(): JSX.Element {
  const DUMMY_TUTORIAL_DATA: ITutorial = {
    id: 'dev-tutorial-id',
    slot: 'Mi07',
    tutor: { firstname: 'Dev', lastname: 'Tutor', id: 'tutor-id' },
    substitutes: [
      ['2020-07-22', { id: 'subst-id', firstname: 'Firstname of', lastname: 'Substitute' }],
    ],
    dates: ['2020-07-15', '2020-07-08', '2020-06-24', '2020-07-22', '2020-07-01'],
    students: [],
    teams: [],
    startTime: '',
    endTime: '',
    correctors: [],
  };
  const DUMMY_STUDENTS: NamedElement[] = [
    { id: '1', firstname: 'Harry', lastname: 'Potter' },
    { id: '2', firstname: 'Hermine', lastname: 'Granger' },
    { id: '3', firstname: 'Ron', lastname: 'Weasley' },
    { id: '4', firstname: 'Ginny', lastname: 'Weasley' },
  ];
  const DUMMY_TUTORIAL = plainToClass(Tutorial, DUMMY_TUTORIAL_DATA);

  return (
    <TutorialSubstituteManagementContent tutorial={DUMMY_TUTORIAL} students={DUMMY_STUDENTS} />
  );
}

export default TutorialSubstituteManagement;
