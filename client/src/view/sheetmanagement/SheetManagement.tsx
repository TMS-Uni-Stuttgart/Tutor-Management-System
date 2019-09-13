import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import React, { useEffect, useState } from 'react';
import { ExerciseDTO, Sheet, SheetDTO } from 'shared/dist/model/Sheet';
import SheetForm, {
  getInitialSheetFormState,
  SheetFormExercise,
  SheetFormSubmitCallback,
} from '../../components/forms/SheetForm';
import LoadingSpinner from '../../components/LoadingSpinner';
import TableWithForm from '../../components/TableWithForm';
import { useDialog } from '../../hooks/DialogService';
import { useAxios } from '../../hooks/FetchingService';
import SheetRow from './components/SheetRow';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialogDeleteButton: {
      color: theme.palette.error.main,
    },
  })
);

function convertSheetFormExercisesToDTOs(exercises: SheetFormExercise[]): ExerciseDTO[] {
  return exercises.map(ex => ({
    exName: ex.exName,
    maxPoints: Number.parseFloat(ex.maxPoints),
    bonus: ex.bonus,
    subexercises: convertSheetFormExercisesToDTOs(ex.subexercises),
  }));
}

// TODO: Adjust for subexercises.
function SheetManagement({ enqueueSnackbar }: WithSnackbarProps): JSX.Element {
  const classes = useStyles();
  const [isLoading, setIsLoading] = useState(false);
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const {
    getAllSheets,
    createSheet,
    editSheet: editSheetRequest,
    deleteSheet: deleteSheetRequest,
  } = useAxios();
  const dialog = useDialog();

  useEffect(() => {
    setIsLoading(true);
    getAllSheets()
      .then(response => {
        setSheets(response);
        setIsLoading(false);
      })
      .catch(reason => console.error(reason));
  }, [getAllSheets]);

  const handleSubmit: SheetFormSubmitCallback = async (
    { sheetNo, exercises, bonusSheet },
    { setSubmitting, resetForm, setFieldError }
  ) => {
    const isNoInUse = sheets.find(t => t.sheetNo === sheetNo) !== undefined;

    // TODO: Conflicting DRY -- same code in ScheinExamManagement.
    function getIndexOfExerciseWithSameExNo(): number | undefined {
      for (const exercise of exercises) {
        const ex = exercises.find(t => t !== exercise && t.exName === exercise.exName);

        if (ex !== undefined) {
          return exercises.indexOf(ex);
        }
      }

      return undefined;
    }

    const idx = getIndexOfExerciseWithSameExNo();

    if (idx !== undefined) {
      setFieldError(
        'exercises',
        `Die Aufgabenbezeichnung ${exercises[idx].exName} ist mehrfach vergeben.`
      );
      return;
    }

    if (isNoInUse) {
      setFieldError('sheetNo', 'Diese Nummer ist bereits vergeben.');
      return;
    }

    const sheetDTO: SheetDTO = {
      sheetNo,
      exercises: convertSheetFormExercisesToDTOs(exercises),
      bonusSheet,
    };

    try {
      const sheet = await createSheet(sheetDTO);

      setSheets([...sheets, sheet]);
      resetForm({ values: getInitialSheetFormState(undefined, [...sheets, sheet]) });
      enqueueSnackbar(`Blatt #${sheetNo.toString().padStart(2, '0')} wurde erfolgreich erstellt.`, {
        variant: 'success',
      });
    } catch (reason) {
      console.error(reason);
      enqueueSnackbar('Blatt konnte nicht erstellt werden.', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const editSheet: (sheet: Sheet) => SheetFormSubmitCallback = sheet => async (
    { sheetNo, exercises, bonusSheet },
    { setSubmitting }
  ) => {
    const sheetDTO: SheetDTO = {
      sheetNo,
      exercises: convertSheetFormExercisesToDTOs(exercises),
      bonusSheet,
    };

    try {
      const response = await editSheetRequest(sheet.id, sheetDTO);

      setSheets(
        sheets.map(s => {
          if (s.id === sheet.id) {
            return response;
          }

          return s;
        })
      );

      enqueueSnackbar('Blatt wurde erfolgreich gespeichert.', { variant: 'success' });
      dialog.hide();
    } catch (reason) {
      console.error(reason);
      enqueueSnackbar('Blatt konnt nicht gespeichert werden.', { variant: 'error' });
      setSubmitting(false);
    }
  };

  function handleEditSheet(sheet: Sheet) {
    dialog.show({
      title: 'Blatt bearbeiten',
      content: (
        <SheetForm
          sheet={sheet}
          onSubmit={editSheet(sheet)}
          onCancelClicked={() => dialog.hide()}
        />
      ),
    });
  }

  function handleDeleteSheet(sheet: Sheet) {
    const sheetNo: string = sheet.sheetNo.toString().padStart(2, '0');
    dialog.show({
      title: 'Blatt löschen',
      content: `Soll das Blatt #${sheetNo} wirklich gelöscht werden? Dies kann nicht rückgängig gemacht werden.`,
      actions: [
        {
          label: 'Nicht löschen',
          onClick: () => dialog.hide(),
        },
        {
          label: 'Löschen',
          onClick: () => deleteSheet(sheet),
          buttonProps: {
            className: classes.dialogDeleteButton,
          },
        },
      ],
    });
  }

  function deleteSheet(sheet: Sheet) {
    deleteSheetRequest(sheet.id)
      .then(() => {
        setSheets(sheets.filter(s => s.id !== sheet.id));
        enqueueSnackbar('Blatt wurde erfolgreich gelöscht', { variant: 'success' });
      })
      .finally(() => dialog.hide());
  }

  return (
    <div>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <TableWithForm
          title='Neues Übungsblatt erstellen'
          form={<SheetForm sheets={sheets} onSubmit={handleSubmit} />}
          items={sheets}
          createRowFromItem={sheet => (
            <SheetRow
              key={sheet.id}
              sheet={sheet}
              onEditSheetClicked={handleEditSheet}
              onDeleteSheetClicked={handleDeleteSheet}
            />
          )}
          placeholder='Keine Übungsblätter vorhanden.'
        />
      )}
    </div>
  );
}

export default withSnackbar(SheetManagement);
