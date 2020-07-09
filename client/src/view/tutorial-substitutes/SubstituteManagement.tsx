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
import { plainToClass } from 'class-transformer';
import _ from 'lodash';
import { DateTime } from 'luxon';
import { AccountSearch as SearchIcon, Close as RemoveIcon } from 'mdi-material-ui';
import React, { useCallback, useState } from 'react';
import { NamedElement } from 'shared/model/Common';
import { ITutorial } from 'shared/model/Tutorial';
import { getNameOfEntity, sortByName } from 'shared/util/helpers';
import BackButton from '../../components/BackButton';
import DateOrIntervalText from '../../components/DateOrIntervalText';
import OutlinedBox from '../../components/OutlinedBox';
import { Tutorial } from '../../model/Tutorial';
import { ROUTES } from '../../routes/Routing.routes';
import DateBox from './components/DateBox';

const useStyles = makeStyles((theme) =>
  createStyles({
    backButton: {
      height: 'fit-content',
      marginRight: theme.spacing(1),
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

function SubstituteManagementContent({ tutorial, students }: Props): JSX.Element {
  const classes = useStyles();

  const [filterText, setFilterText] = useState('');

  const [studentsToShow, setStudentsToShow] = useState<NamedElement[]>(() =>
    filterStudents(students, filterText)
  );
  const [selectedDate, setSelectedDate] = useState<DateTime>();

  const debouncedHandleChange = useCallback(
    _.debounce(
      (filterText: string) => setStudentsToShow(filterStudents(students, filterText)),
      250
    ),
    []
  );

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

      <DateBox />

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

function SubstituteManagement(): JSX.Element {
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

  return <SubstituteManagementContent tutorial={DUMMY_TUTORIAL} students={DUMMY_STUDENTS} />;
}

export default SubstituteManagement;
