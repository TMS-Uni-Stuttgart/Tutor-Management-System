import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { DateTime } from 'luxon';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import React, { useEffect, useState } from 'react';
import { HasId } from 'shared/model/Common';
import { Role } from 'shared/model/Role';
import { ITutorialDTO } from 'shared/model/Tutorial';
import { IUser } from 'shared/model/User';
import { getNameOfEntity } from 'shared/util/helpers';
import TutorialForm, {
  getInitialTutorialFormValues,
  TutorialFormState,
  TutorialFormSubmitCallback,
} from '../../components/forms/TutorialForm';
import LoadingSpinner from '../../components/loading/LoadingSpinner';
import TableWithForm from '../../components/TableWithForm';
import { useDialog } from '../../hooks/DialogService';
import {
  createTutorial,
  deleteTutorial,
  editTutorial,
  getAllTutorials,
} from '../../hooks/fetching/Tutorial';
import { getUsersWithRole } from '../../hooks/fetching/User';
import { Tutorial } from '../../model/Tutorial';
import { getDisplayStringForTutorial, compareDateTimes } from '../../util/helperFunctions';
import TutorialTableRow from './components/TutorialTableRow';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      position: 'relative',
    },
    dialogDeleteButton: {
      color: theme.palette.error.main,
    },
  })
);

function generateCreateTutorialDTO({
  slot,
  tutor,
  startTime: startTimeString,
  endTime: endTimeString,
  correctors,
  selectedDates,
}: TutorialFormState): ITutorialDTO {
  const startTime: Date = new Date(startTimeString);
  const endTime: Date = new Date(endTimeString);

  const dates: string[] = selectedDates.map(date => new Date(date)).map(date => date.toISOString());

  return {
    slot,
    tutorId: tutor,
    dates,
    startTime: startTime.toLocaleTimeString(),
    endTime: endTime.toLocaleTimeString(),
    correctorIds: correctors,
  };
}

function TutorialManagement({ enqueueSnackbar }: WithSnackbarProps): JSX.Element {
  const classes = useStyles();
  const [isLoading, setIsLoading] = useState(false);
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [tutors, setTutors] = useState<IUser[]>([]);
  const [correctors, setCorrectors] = useState<IUser[]>([]);
  const dialog = useDialog();

  useEffect(() => {
    setIsLoading(true);
    Promise.all([getUsersWithRole(Role.TUTOR), getUsersWithRole(Role.CORRECTOR), getAllTutorials()])
      .then(([tutorsResponse, correctorsResponse, tutorialResponse]) => {
        setTutors(tutorsResponse || []);
        setCorrectors(correctorsResponse || []);
        setTutorials(tutorialResponse || []);
        setIsLoading(false);
      })
      .catch(() => {
        enqueueSnackbar('Daten konnten nicht abgerufen werden.', { variant: 'error' });
      });
  }, [enqueueSnackbar]);

  const handleCreateTutorial: TutorialFormSubmitCallback = async (
    values,
    { setSubmitting, resetForm, setFieldError }
  ) => {
    const isSlotInUse = tutorials.find(t => t.slot === values.slot) !== undefined;

    if (isSlotInUse) {
      setFieldError('slot', 'Dieser Slot ist bereits vergeben.');
      return;
    }

    try {
      const response = await createTutorial(generateCreateTutorialDTO(values));
      const allTutorials = [...tutorials, response];
      setTutorials(allTutorials);

      enqueueSnackbar('Tutorium wurde erstellt.', { variant: 'success' });
      resetForm({ values: getInitialTutorialFormValues() });
    } catch (reason) {
      console.log(reason);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditTutorialSubmit: (
    tutorial: HasId
  ) => TutorialFormSubmitCallback = tutorial => async (values, { setSubmitting }) => {
    try {
      const updatedTutorial = await editTutorial(tutorial.id, generateCreateTutorialDTO(values));

      setTutorials(
        tutorials.map(t => {
          if (t.id !== updatedTutorial.id) {
            return t;
          }

          return updatedTutorial;
        })
      );
      enqueueSnackbar('Tutorium erfolgreich geändert.', { variant: 'success' });
      dialog.hide();
    } catch {
      enqueueSnackbar('Tutorium konnte nicht geändert werden.', { variant: 'error' });
      setSubmitting(false);
    }
  };

  function handleEditTutorial(tutorial: Tutorial) {
    dialog.show({
      title: 'Tutorium bearbeiten',
      content: (
        <TutorialForm
          tutorial={tutorial}
          correctors={correctors}
          tutors={tutors}
          onSubmit={handleEditTutorialSubmit(tutorial)}
          onCancelClicked={() => dialog.hide()}
        />
      ),
      DialogProps: {
        maxWidth: 'lg',
      },
    });
  }

  function handleDeleteTutorial(tutorial: Tutorial) {
    const tutorialDisplay = getDisplayStringForTutorial(tutorial);

    dialog.show({
      title: 'Tutorium löschen',
      content: `Soll das ${tutorialDisplay} wirklich gelöscht werden? Diese Aktion kann nicht rückgängig gemacht werden.`,
      actions: [
        {
          label: 'Nicht löschen',
          onClick: () => dialog.hide(),
        },
        {
          label: 'Löschen',
          onClick: () => handleDeleteTutorialSubmit(tutorial),
          buttonProps: {
            className: classes.dialogDeleteButton,
          },
        },
      ],
    });
  }

  function handleDeleteTutorialSubmit(tutorial: Tutorial) {
    deleteTutorial(tutorial.id)
      .then(() => {
        setTutorials(tutorials.filter(t => t.id !== tutorial.id));
        enqueueSnackbar(`${getDisplayStringForTutorial(tutorial)} wurde gelöscht.`, {
          variant: 'success',
        });
      })
      .finally(() => dialog.hide());
  }

  return (
    <div className={classes.root}>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <TableWithForm
          title='Neues Tutorium erstellen'
          form={
            <TutorialForm tutors={tutors} correctors={correctors} onSubmit={handleCreateTutorial} />
          }
          items={tutorials}
          createRowFromItem={tutorial => (
            <TutorialTableRow
              tutorial={tutorial}
              correctors={tutorial.correctors.map(corr => getNameOfEntity(corr))}
              substitutes={[...tutorial.substitutes]
                .map(([date, substitute]) => {
                  const tutor = tutors.find(t => t.id === substitute.id);

                  return {
                    date: DateTime.fromISO(date),
                    name: tutor ? getNameOfEntity(tutor) : 'TUTOR_NOT_FOUND',
                  };
                })
                .sort((a, b) => compareDateTimes(a.date, b.date))}
              onEditTutorialClicked={handleEditTutorial}
              onDeleteTutorialClicked={handleDeleteTutorial}
            />
          )}
          placeholder='Keine Tutorien vorhanden.'
        />
      )}
    </div>
  );
}

export default withSnackbar(TutorialManagement);
