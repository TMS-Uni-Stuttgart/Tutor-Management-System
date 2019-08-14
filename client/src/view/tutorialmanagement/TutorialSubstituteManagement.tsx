import { Button, Typography } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { ChevronLeft as BackIcon } from '@material-ui/icons';
import { format, compareAsc } from 'date-fns';
import { Formik } from 'formik';
import React, { useEffect, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { renderLink } from '../../components/drawer/components/renderLink';
import FormikMultipleDatesPicker, {
  DateClickedHandler,
  getDateString,
} from '../../components/forms/components/FormikMultipleDatesPicker';
import FormikSelect from '../../components/forms/components/FormikSelect';
import SubmitButton from '../../components/forms/components/SubmitButton';
import { useAxios } from '../../hooks/FetchingService';
import { FormikSubmitCallback } from '../../types';
import { Role, Tutorial, User } from '../../typings/ServerResponses';
import {
  getDisplayStringForTutorial,
  getNameOfEntity,
  parseDateToMapKey,
} from '../../util/helperFunctions';
import { RoutingPath } from '../../util/RoutingPath';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      position: 'relative',
      // display: 'flex',
      // flexDirection: 'column',
    },
    backIcon: {
      marginLeft: theme.spacing(-0.5),
      marginRight: theme.spacing(0.5),
    },
    backButton: {
      width: 'max-content',
      marginBottom: theme.spacing(2),
    },
    formDiv: {
      display: 'flex',
    },
    unsavedChangesLabel: {
      marginBottom: theme.spacing(2),
    },
    substituteSelection: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      marginLeft: theme.spacing(2),
    },
    chooseDateFirstLabel: {
      flex: 1,
      textAlign: 'center',
    },
    choosenDateLabel: {
      marginBottom: theme.spacing(2),
    },
    buttonBox: {
      marginTop: 'auto',
      display: 'flex',
      justifyContent: 'flex-end',
    },
    cancelButton: {
      marginRight: theme.spacing(1),
    },
  })
);

interface TutorialSubstituteFormState {
  dates: string[];
  substitutes: {
    [date: string]: string;
  };
}

interface Params {
  tutorialid: string;
}

type Props = RouteComponentProps<Params>;

function getInitialValues(tutorial?: Tutorial): TutorialSubstituteFormState {
  if (!tutorial) {
    return {
      dates: [],
      substitutes: {},
    };
  }

  const dates = tutorial.dates.sort((a, b) => compareAsc(a, b)).map(date => date.toDateString());
  const substitutes: { [key: string]: string } = {};

  tutorial.dates.forEach(date => {
    substitutes[date.toDateString()] = tutorial.substitutes[parseDateToMapKey(date)] || '';
  });

  return { dates, substitutes };
}

function TutorialSubstituteManagement({ match: { params } }: Props): JSX.Element {
  const classes = useStyles();

  const [tutors, setTutors] = useState<User[]>([]);
  const [tutorial, setTutorial] = useState<Tutorial | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const { getTutorial, getUsersWithRole, setSubstituteTutor } = useAxios();

  useEffect(() => {
    getTutorial(params.tutorialid)
      .then(tutorial => setTutorial(tutorial))
      .catch(reason => console.log(reason));

    getUsersWithRole(Role.TUTOR).then(tutors => setTutors(tutors));
  }, [getTutorial, getUsersWithRole, params.tutorialid]);

  const initialValues: TutorialSubstituteFormState = getInitialValues(tutorial);

  const handleDateClicked: DateClickedHandler = (date, selectedDays) => {
    if (!Array.isArray(selectedDays) || selectedDays.findIndex(d => d === date) === -1) {
      return;
    }

    setSelectedDate(new Date(date));
  };

  const handleSubmit: FormikSubmitCallback<TutorialSubstituteFormState> = async (
    { dates, substitutes },
    { resetForm }
  ) => {
    if (!tutorial) {
      return;
    }

    const datesOfSubstitutes: { [tutor: string]: string[] } = {};

    Object.entries(substitutes).forEach(([date, tutor]) => {
      if (tutor) {
        const prevDates: string[] = datesOfSubstitutes[tutor] || [];

        datesOfSubstitutes[tutor] = [...prevDates, date];
      }
    });

    let response: Tutorial | undefined = undefined;

    for (let [tutor, dates] of Object.entries(datesOfSubstitutes)) {
      response = await setSubstituteTutor(tutorial.id, {
        tutorId: tutor,
        dates: dates.map(d => new Date(d).toISOString()),
      });
    }

    if (response) {
      setTutorial(tutorial);
      resetForm({ values: { dates, substitutes } });
      setSelectedDate(undefined);
    }
  };

  return (
    <div className={classes.root}>
      {/* TODO: Add dialog if there are unsaved changes and the user wants to go back. -- Move this component insied the Formik component to be able to do this? */}
      <Button
        variant='outlined'
        component={renderLink(RoutingPath.MANAGE_TUTORIALS)}
        className={classes.backButton}
      >
        <BackIcon className={classes.backIcon} />
        Zurück
      </Button>

      {tutorial ? (
        <Formik initialValues={initialValues} onSubmit={handleSubmit}>
          {({ values, isSubmitting, resetForm, initialValues, handleSubmit }) => (
            <>
              <Typography variant='h6'>{`Gewähltes Tutorium: ${getDisplayStringForTutorial(
                tutorial
              )}`}</Typography>

              <Typography
                variant='subtitle1'
                className={classes.unsavedChangesLabel}
                color={values !== initialValues ? 'error' : 'inherit'}
              >
                {values !== initialValues ? 'Ungespeicherte Änderungen.' : 'Keine Änderungen.'}
              </Typography>

              <form onSubmit={handleSubmit} className={classes.formDiv}>
                <FormikMultipleDatesPicker
                  name='dates'
                  onDateClicked={handleDateClicked}
                  highlightDate={selectedDate ? getDateString(selectedDate) : undefined}
                />

                <div className={classes.substituteSelection}>
                  {selectedDate ? (
                    <>
                      <Typography className={classes.choosenDateLabel}>
                        Gewähltes Datum: {format(selectedDate, 'dd.MM.yy')}
                      </Typography>

                      <FormikSelect
                        name={`substitutes.${selectedDate.toDateString()}`}
                        label='Ersatztutor'
                        emptyPlaceholder='Keine Tutoren vorhanden.'
                        items={tutors}
                        itemToString={getNameOfEntity}
                        itemToValue={t => t.id}
                      />
                    </>
                  ) : (
                    <Typography variant='h6' className={classes.chooseDateFirstLabel}>
                      Wähle zuerst ein Datum aus.
                    </Typography>
                  )}

                  <div className={classes.buttonBox}>
                    <Button
                      variant='outlined'
                      className={classes.cancelButton}
                      disabled={!selectedDate || isSubmitting}
                      onClick={() => {
                        setSelectedDate(undefined);
                        resetForm();
                      }}
                    >
                      Abbrechen
                    </Button>

                    <SubmitButton
                      variant='outlined'
                      color='primary'
                      disabled={!selectedDate || isSubmitting}
                      isSubmitting={isSubmitting}
                    >
                      Speichern
                    </SubmitButton>
                  </div>
                </div>
              </form>
            </>
          )}
        </Formik>
      ) : (
        <Typography variant='h6'>Tutorial wird geladen...</Typography>
      )}
    </div>
  );
}

export default withRouter(TutorialSubstituteManagement);
