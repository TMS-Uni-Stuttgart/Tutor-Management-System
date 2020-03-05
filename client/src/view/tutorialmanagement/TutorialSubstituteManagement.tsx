import { Button, Typography } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { compareAsc, format } from 'date-fns';
import { Formik } from 'formik';
import React, { useEffect, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { Role } from 'shared/model/Role';
import { ISubstituteDTO, ITutorial } from 'shared/model/Tutorial';
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
import { useAxios } from '../../hooks/FetchingService';
import { FormikSubmitCallback } from '../../types';
import { getDisplayStringForTutorial, parseDateToMapKey } from '../../util/helperFunctions';
import { RoutingPath } from '../../routes/Routing.routes';

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

function getInitialValues(tutorial?: ITutorial): TutorialSubstituteFormState {
  if (!tutorial) {
    return {
      dates: [],
      substitutes: {},
    };
  }

  const dates = tutorial.dates
    .sort((a, b) => compareAsc(new Date(a), new Date(b)))
    .map(date => new Date(date).toDateString());

  const substitutes: { [key: string]: string } = {};

  tutorial.dates.forEach(d => {
    const date = new Date(d);
    substitutes[date.toDateString()] = tutorial.substitutes[parseDateToMapKey(date)] || '';
  });

  return { dates, substitutes };
}

function TutorialSubstituteManagement({ match: { params } }: Props): JSX.Element {
  const classes = useStyles();

  const [tutors, setTutors] = useState<IUser[]>([]);
  const [tutorial, setTutorial] = useState<ITutorial | undefined>(undefined);
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
    const datesWithoutSubstitute: any[] = [];

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
      dates: datesWithoutSubstitute.map(d => new Date(d).toDateString()),
    };

    let response: ITutorial | undefined = await setSubstituteTutor(tutorial.id, noSubDTO);

    for (const [tutor, dates] of Object.entries(datesOfSubstitutes)) {
      const dto: ISubstituteDTO = {
        tutorId: tutor,
        dates: dates.map(d => new Date(d).toDateString()),
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
      {/* TODO: Add dialog if there are unsaved changes and the user wants to go back. -- Move this component insied the Formik component to be able to do this? */}
      <BackButton className={classes.backButton} to={RoutingPath.MANAGE_TUTORIALS} />

      {tutorial ? (
        <Formik initialValues={initialValues} onSubmit={handleSubmit}>
          {({ values, isSubmitting, resetForm, initialValues, handleSubmit }) => (
            <>
              <Typography variant='h6'>{`Gewählt: ${getDisplayStringForTutorial(
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
                        nameOfNoneItem='Keine Vertretung'
                        items={tutors}
                        itemToString={tutor => getNameOfEntity(tutor)}
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
