import { Box, Button, Typography } from '@material-ui/core';
import { SelectInputProps } from '@material-ui/core/Select/SelectInput';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { plainToClass } from 'class-transformer';
import { DateTime } from 'luxon';
import { ChevronRight as RightArrow } from 'mdi-material-ui';
import React, { useEffect, useState } from 'react';
import { getNameOfEntity } from 'shared/util/helpers';
import { ITutorial } from '../../../../server/src/shared/model/Tutorial';
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
      ...theme.mixins.scrollbar(4),
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

function TutorialSubstituteManagementContent({ tutorial }: Props): JSX.Element {
  const classes = useStyles();

  const [filterOption, setFilterOption] = useState<FilterOption>(
    () => FilterOption.ONLY_FUTURE_DATES
  );
  const [datesToShow, setDatesToShow] = useState<DateTime[]>(() =>
    filterDates(tutorial, filterOption)
  );

  useEffect(() => {
    setDatesToShow(filterDates(tutorial, filterOption));
  }, [tutorial, filterOption]);

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
              // color={idx % 2 === 1 ? 'secondary' : 'default'}
              key={date.toISODate()}
              className={classes.dateButton}
              classes={{ endIcon: classes.dateButtonIcon }}
              endIcon={<RightArrow />}
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

      <OutlinedBox gridArea='1 / 2 / span 3 / span 1' className={classes.scrollableBox}>
        {/* <div style={{ height: 2000 }}></div> */}
        <span>On the right</span>
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
  const DUMMY_TUTORIAL = plainToClass(Tutorial, DUMMY_TUTORIAL_DATA);

  return <TutorialSubstituteManagementContent tutorial={DUMMY_TUTORIAL} />;
}

export default TutorialSubstituteManagement;
