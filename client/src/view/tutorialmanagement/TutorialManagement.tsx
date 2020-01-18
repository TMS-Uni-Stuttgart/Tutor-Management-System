import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { compareAsc } from 'date-fns';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import React, { useEffect, useState } from 'react';
import { HasId } from 'shared/dist/model/Common';
import { Role } from 'shared/dist/model/Role';
import { TutorialDTO } from 'shared/dist/model/Tutorial';
import { User } from 'shared/dist/model/User';
import { getNameOfEntity } from 'shared/dist/util/helpers';
import TutorialForm, {
  getInitialTutorialFormValues,
  TutorialFormState,
  TutorialFormSubmitCallback,
} from '../../components/forms/TutorialForm';
import LoadingSpinner from '../../components/loading/LoadingSpinner';
import TableWithForm from '../../components/TableWithForm';
import { useDialog } from '../../hooks/DialogService';
import { useAxios } from '../../hooks/FetchingService';
import { TutorialWithFetchedCorrectors } from '../../typings/types';
import { getDisplayStringForTutorial } from '../../util/helperFunctions';
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
}: TutorialFormState): TutorialDTO {
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
  const [tutorials, setTutorials] = useState<TutorialWithFetchedCorrectors[]>([]);
  const [tutors, setTutors] = useState<User[]>([]);
  const {
    getUsersWithRole,
    getAllTutorialsAndFetchCorrectors,
    createTutorialAndFetchCorrectors,
    editTutorialAndFetchCorrectors: editTutorialRequest,
    deleteTutorial: deleteTutorialRequest,
  } = useAxios();
  const dialog = useDialog();

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      getUsersWithRole(Role.TUTOR).catch(reason => {
        console.error(reason);
        enqueueSnackbar('Nutzer konnten nicht abgerufen werden.', { variant: 'error' });
      }),
      getAllTutorialsAndFetchCorrectors().catch(reason => {
        console.error(reason);
        enqueueSnackbar('Tutorien konnten nicht abgerufen werden.', { variant: 'error' });
      }),
    ]).then(([userResponse, tutorialResponse]) => {
      if (userResponse) {
        setTutors(userResponse);
      }

      if (tutorialResponse) {
        setTutorials(tutorialResponse);
      }

      setIsLoading(false);
    });
  }, [enqueueSnackbar, getUsersWithRole, getAllTutorialsAndFetchCorrectors]);

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
      const response = await createTutorialAndFetchCorrectors(generateCreateTutorialDTO(values));
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

  const editTutorial: (tutorial: HasId) => TutorialFormSubmitCallback = tutorial => async (
    values,
    { setSubmitting }
  ) => {
    try {
      const updatedTutorial = await editTutorialRequest(
        tutorial.id,
        generateCreateTutorialDTO(values)
      );

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

  function handleEditTutorial(tutorial: TutorialWithFetchedCorrectors) {
    dialog.show({
      title: 'Tutorium bearbeiten',
      content: (
        <TutorialForm
          tutorial={tutorial}
          tutors={tutors}
          onSubmit={editTutorial(tutorial)}
          onCancelClicked={() => dialog.hide()}
        />
      ),
      DialogProps: {
        maxWidth: 'lg',
      },
    });
  }

  function handleDeleteTutorial(tutorial: TutorialWithFetchedCorrectors) {
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
          onClick: () => deleteTutorial(tutorial),
          buttonProps: {
            className: classes.dialogDeleteButton,
          },
        },
      ],
    });
  }

  function deleteTutorial(tutorial: TutorialWithFetchedCorrectors) {
    deleteTutorialRequest(tutorial.id)
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
          form={<TutorialForm tutors={tutors} onSubmit={handleCreateTutorial} />}
          items={tutorials}
          createRowFromItem={tutorial => (
            <TutorialTableRow
              tutorial={tutorial}
              correctors={tutorial.correctors.map(corr => getNameOfEntity(corr))}
              substitutes={Object.entries(tutorial.substitutes)
                .map(([date, id]) => {
                  const tutor = tutors.find(t => t.id === id);

                  return {
                    date: new Date(date),
                    name: tutor
                      ? getNameOfEntity(tutor, { lastNameFirst: true })
                      : 'TUTOR_NOT_FOUND',
                  };
                })
                .sort((a, b) => compareAsc(a.date, b.date))}
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
