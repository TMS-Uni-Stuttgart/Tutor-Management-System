import { Button } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { DateTime } from 'luxon';
import { AutoFix as GenerateIcon } from 'mdi-material-ui';
import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { HasId } from 'shared/model/Common';
import { ITutorialDTO } from 'shared/model/Tutorial';
import { getNameOfEntity } from 'shared/util/helpers';
import TutorialForm, {
  getInitialTutorialFormValues,
  TutorialFormState,
  TutorialFormSubmitCallback,
} from '../../components/forms/TutorialForm';
import LoadingSpinner from '../../components/loading/LoadingSpinner';
import TableWithForm from '../../components/TableWithForm';
import { useDialog } from '../../hooks/dialog-service/DialogService';
import { createTutorial, deleteTutorial, editTutorial } from '../../hooks/fetching/Tutorial';
import { useLoggedInUser } from '../../hooks/LoginService';
import { useCustomSnackbar } from '../../hooks/snackbar/useCustomSnackbar';
import { Tutorial } from '../../model/Tutorial';
import { ROUTES } from '../../routes/Routing.routes';
import { compareDateTimes } from '../../util/helperFunctions';
import { useLogger } from '../../util/Logger';
import TutorialTableRow from './components/TutorialTableRow';
import TutorialManagementContextProvider, {
  useTutorialManagementContext,
} from './TutorialManagement.context';

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
  const startTime = DateTime.fromISO(startTimeString).set({ second: 0, millisecond: 0 });
  const endTime = DateTime.fromISO(endTimeString).set({ second: 0, millisecond: 0 });

  const dates: string[] = selectedDates
    .map((date) => DateTime.fromISO(date))
    .map((date) => date.toISODate() ?? 'DATE_NOT_PARSABLE');

  return {
    slot,
    tutorId: tutor,
    dates,
    startTime: startTime.toISOTime() ?? 'DATE_NOT_PARSABLE',
    endTime: endTime.toISOTime() ?? 'DATE_NOT_PARSABLE',
    correctorIds: correctors,
  };
}

function TutorialManagementContent(): JSX.Element {
  const classes = useStyles();
  const dialog = useDialog();
  const user = useLoggedInUser();
  const { enqueueSnackbar } = useCustomSnackbar();
  const logger = useLogger('TutorialManagement');

  const {
    tutorials,
    tutors,
    correctors,
    isLoading,
    fetchTutorials,
  } = useTutorialManagementContext();

  const handleCreateTutorial: TutorialFormSubmitCallback = useCallback(
    async (values, { setSubmitting, resetForm, setFieldError }) => {
      const isSlotInUse = tutorials.find((t) => t.slot === values.slot) !== undefined;

      if (isSlotInUse) {
        setFieldError('slot', 'Dieser Slot ist bereits vergeben.');
        return;
      }

      try {
        await createTutorial(generateCreateTutorialDTO(values));
        await fetchTutorials();

        enqueueSnackbar('Tutorium wurde erstellt.', { variant: 'success' });
        resetForm({ values: getInitialTutorialFormValues() });
      } catch (reason) {
        logger.log(reason);
      } finally {
        setSubmitting(false);
      }
    },
    [enqueueSnackbar, logger, fetchTutorials, tutorials]
  );

  const handleEditTutorialSubmit: (tutorial: HasId) => TutorialFormSubmitCallback = useCallback(
    (tutorial) => async (values, { setSubmitting }) => {
      try {
        await editTutorial(tutorial.id, generateCreateTutorialDTO(values));
        await fetchTutorials();
        enqueueSnackbar('Tutorium erfolgreich geändert.', { variant: 'success' });
        dialog.hide();
      } catch {
        enqueueSnackbar('Tutorium konnte nicht geändert werden.', { variant: 'error' });
        setSubmitting(false);
      }
    },
    [enqueueSnackbar, fetchTutorials, dialog]
  );

  const handleDeleteTutorialSubmit = useCallback(
    async (tutorial: Tutorial) => {
      await deleteTutorial(tutorial.id);
      await fetchTutorials();
      enqueueSnackbar(`${tutorial.toDisplayString()} wurde gelöscht.`, {
        variant: 'success',
      });
      dialog.hide();
    },
    [dialog, fetchTutorials, enqueueSnackbar]
  );

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
    dialog.show({
      title: 'Tutorium löschen',
      content: `Soll das ${tutorial.toDisplayString()} wirklich gelöscht werden? Diese Aktion kann nicht rückgängig gemacht werden.`,
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
          topBarContent={
            <Button
              variant='outlined'
              component={Link}
              to={ROUTES.GENERATE_TUTORIALS.create({})}
              startIcon={<GenerateIcon />}
            >
              Generieren
            </Button>
          }
          items={tutorials}
          createRowFromItem={(tutorial) => (
            <TutorialTableRow
              tutorial={tutorial}
              disableManageTutorialButton={!user.isAdmin()}
              correctors={tutorial.correctors.map((corr) => getNameOfEntity(corr))}
              substitutes={[...tutorial.substitutes]
                .map(([date, substituteId]) => {
                  const tutor = tutors.find((t) => t.id === substituteId);

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

function TutorialManagement(): JSX.Element {
  return (
    <TutorialManagementContextProvider>
      <TutorialManagementContent />
    </TutorialManagementContextProvider>
  );
}

export default TutorialManagement;
