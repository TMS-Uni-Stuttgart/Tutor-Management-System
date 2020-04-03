import { Button, Typography } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { Formik } from 'formik';
import { DateTime } from 'luxon';
import React, { useEffect, useState } from 'react';
import { Prompt, RouteComponentProps, withRouter } from 'react-router';
import { Role } from 'shared/model/Role';
import { ISubstituteDTO } from 'shared/model/Tutorial';
import { IUser } from 'shared/model/User';
import { getNameOfEntity } from 'shared/util/helpers';
import BackButton from '../../components/BackButton';
import FormikDebugDisplay from '../../components/forms/components/FormikDebugDisplay';
import FormikMultipleDatesPicker, {
  DateClickedHandler,
  getDateString,
} from '../../components/forms/components/FormikMultipleDatesPicker';
import FormikSelect from '../../components/forms/components/FormikSelect';
import SubmitButton from '../../components/loading/SubmitButton';
import { getTutorial, setSubstituteTutor } from '../../hooks/fetching/Tutorial';
import { getUsersWithRole } from '../../hooks/fetching/User';
import { Tutorial } from '../../model/Tutorial';
import { RoutingPath } from '../../routes/Routing.routes';
import { FormikSubmitCallback } from '../../types';
import { compareDateTimes, parseDateToMapKey } from '../../util/helperFunctions';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      position: 'relative',
    },
    backButton: {
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

  const dates = tutorial.dates.sort(compareDateTimes).map(parseDateToMapKey);
  const substitutes: { [key: string]: string } = {};

  tutorial.dates.forEach((date) => {
    substitutes[parseDateToMapKey(date)] = tutorial.getSubstitute(date)?.id || '';
  });

  return { dates, substitutes };
}

function TutorialSubstituteManagement({ match: { params } }: Props): JSX.Element {
  const classes = useStyles();

  const [tutors, setTutors] = useState<IUser[]>([]);
  const [tutorial, setTutorial] = useState<Tutorial | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState<DateTime | undefined>(undefined);

  useEffect(() => {
    getTutorial(params.tutorialid)
      .then((tutorial) => setTutorial(tutorial))
      .catch((reason) => console.log(reason));

    getUsersWithRole(Role.TUTOR).then((tutors) => setTutors(tutors));
  }, [params.tutorialid]);

  const initialValues: TutorialSubstituteFormState = getInitialValues(tutorial);

  const handleDateClicked: DateClickedHandler = (date, selectedDays) => {
    if (!Array.isArray(selectedDays) || selectedDays.findIndex((d) => d === date) === -1) {
      return;
    }

    setSelectedDate(DateTime.fromISO(date));
  };

  const handleSubmit: FormikSubmitCallback<TutorialSubstituteFormState> = async (
    { dates, substitutes },
    { resetForm }
  ) => {
    if (!tutorial) {
      return;
    }

    const datesOfSubstitutes: { [tutor: string]: string[] } = {};
    const datesWithoutSubstitute: string[] = [];

    Object.entries(substitutes).forEach(([date, tutor]) => {
      if (!!tutor) {
        const prevDates: string[] = datesOfSubstitutes[tutor] || [];

        datesOfSubstitutes[tutor] = [...prevDates, date];
      } else {
        datesWithoutSubstitute.push(date);
      }
    });

    const noSubDTO: ISubstituteDTO = {
      tutorId: undefined,
      dates: datesWithoutSubstitute,
    };

    let response: Tutorial | undefined = await setSubstituteTutor(tutorial.id, noSubDTO);

    for (const [tutor, dates] of Object.entries(datesOfSubstitutes)) {
      const dto: ISubstituteDTO = {
        tutorId: tutor,
        dates,
      };

      response = await setSubstituteTutor(tutorial.id, dto);
    }

    if (response) {
      setTutorial(tutorial);
      resetForm({ values: { dates, substitutes } });
      setSelectedDate(undefined);
    }
  };

  return (
    <div className={classes.root}>
      <BackButton className={classes.backButton} to={RoutingPath.MANAGE_TUTORIALS} />

      {tutorial ? (
        <Formik initialValues={initialValues} onSubmit={handleSubmit}>
          {({ values, isSubmitting, resetForm, initialValues, handleSubmit, dirty }) => (
            <>
              <Prompt
                when={dirty}
                message='Es gibt ungespeichert Änderungen. Soll die Seite wirklich verlassen werden?'
              />

              <Typography variant='h6'>{`Gewählt: ${tutorial.toDisplayString()}`}</Typography>

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
                        Gewähltes Datum: {selectedDate.toFormat('dd.MM.yy')}
                      </Typography>

                      <FormikSelect
                        name={`substitutes.${parseDateToMapKey(selectedDate)}`}
                        label='Ersatztutor'
                        emptyPlaceholder='Keine Tutoren vorhanden.'
                        nameOfNoneItem='Keine Vertretung'
                        items={tutors}
                        itemToString={(tutor) => getNameOfEntity(tutor)}
                        itemToValue={(t) => t.id}
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

              <FormikDebugDisplay values={values} />
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
