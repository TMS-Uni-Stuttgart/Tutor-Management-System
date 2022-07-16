import { Box, Button } from '@material-ui/core';
import { FileImportOutline as ImportIcon } from 'mdi-material-ui';
import { useSnackbar } from 'notistack';
import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { IShortTestDTO } from 'shared/model/ShortTest';
import { convertFormExercisesToDTOs } from '../../../components/forms/SheetForm';
import ShortTestForm, {
  getInitialShortTestFormState,
  ShortTestFormState,
  ShortTestFormSubmitCallback,
} from '../../../components/forms/ShortTestForm';
import LoadingSpinner from '../../../components/loading/LoadingSpinner';
import TableWithForm from '../../../components/TableWithForm';
import { useDialog } from '../../../hooks/dialog-service/DialogService';
import {
  createShortTest,
  deleteShortTest as deleteShortTestRequest,
  editShortTest as editShortTestRequest,
  getAllShortTests,
} from '../../../hooks/fetching/ShortTests';
import { useFetchState } from '../../../hooks/useFetchState';
import { ShortTest } from '../../../model/ShortTest';
import { ROUTES } from '../../../routes/Routing.routes';
import { useLogger } from '../../../util/Logger';
import { getDuplicateExerciseName } from '../../points-sheet/util/helper';
import ShortTestRow from './components/ShortTestRow';

export function convertFormStateToDTO(values: ShortTestFormState): IShortTestDTO {
  return {
    shortTestNo: Number.parseInt(values.shortTestNo),
    percentageNeeded: values.percentageNeeded,
    exercises: convertFormExercisesToDTOs(values.exercises),
  };
}

function ShortTestManagement(): JSX.Element {
  const logger = useLogger('ShortTestManagement');
  const dialog = useDialog();
  const { enqueueSnackbar } = useSnackbar();

  const [value, isLoading] = useFetchState({
    fetchFunction: getAllShortTests,
    immediate: true,
    params: [],
  });
  const [shortTests, setShortTests] = useState(value);

  useEffect(() => {
    setShortTests(value);
  }, [value]);

  const handleSubmit: ShortTestFormSubmitCallback = useCallback(
    async (values, { resetForm, setSubmitting, setFieldError }) => {
      const isNoAlreadyInUse =
        shortTests?.find((t) => t.shortTestNo.toString(10) === values.shortTestNo) !== undefined;
      const duplicateName = getDuplicateExerciseName(values.exercises);

      if (duplicateName) {
        setFieldError(
          'exercises',
          `Die Aufgabenbezeichnung ${duplicateName} ist mehrfach vergeben.`
        );
        return;
      }

      if (isNoAlreadyInUse) {
        setFieldError('scheinExamNo', 'Diese Nummer ist bereits vergeben.');
        return;
      }

      try {
        const shortTest = await createShortTest(convertFormStateToDTO(values));
        const newShortTests = [...(shortTests ?? []), shortTest];

        setShortTests(newShortTests);
        resetForm({ values: getInitialShortTestFormState(undefined, newShortTests) });
        enqueueSnackbar(`${shortTest.toDisplayString()} erfolgreich erstellt.`, {
          variant: 'success',
        });
      } catch (error) {
        logger.error(error);
        enqueueSnackbar('Erstellen des Kurztests fehlgeschlagen.', { variant: 'error' });
      } finally {
        setSubmitting(false);
      }
    },
    [enqueueSnackbar, shortTests, logger]
  );

  const editShortTest: (shortTest: ShortTest) => ShortTestFormSubmitCallback = useCallback(
    (shortTest) => {
      return async (values, { setSubmitting }) => {
        try {
          const updatedShortTest = await editShortTestRequest(
            shortTest.id,
            convertFormStateToDTO(values)
          );

          setShortTests(
            (shortTests ?? []).map((s) => (s.id === shortTest.id ? updatedShortTest : s))
          );
          enqueueSnackbar(`${updatedShortTest.toDisplayString()} erfolgreich gespeichert.`, {
            variant: 'success',
          });
          dialog.hide();
        } catch (error) {
          logger.error(error);
          enqueueSnackbar('Speichern des Kurztests fehlgeschlagen.', {
            variant: 'error',
          });
          setSubmitting(false);
        }
      };
    },
    [dialog, logger, enqueueSnackbar, shortTests]
  );

  const deleteShortTest = useCallback(
    async (shortTest: ShortTest) => {
      const isOkay = await dialog.showConfirmationDialog({
        title: 'Kurztest löschen?',
        content: `Soll der ${shortTest.toDisplayString()} wirklich gelöscht werden? Dies kann nicht rückgängig gemacht werden.`,
        cancelProps: {
          label: 'Nicht löschen',
        },
        acceptProps: {
          label: 'Löschen',
          deleteButton: true,
        },
      });

      if (isOkay) {
        try {
          await deleteShortTestRequest(shortTest.id);

          setShortTests((shortTests ?? []).filter((s) => s.id !== shortTest.id));
          enqueueSnackbar(`${shortTest.toDisplayString()} wurde erfolgreich gelöscht.`, {
            variant: 'success',
          });
        } catch (error) {
          logger.error(error);
          enqueueSnackbar(`${shortTest.toDisplayString()} konnte nicht gelöscht werden.`, {
            variant: 'error',
          });
        } finally {
          dialog.hide();
        }
      }
    },
    [shortTests, logger, dialog, enqueueSnackbar]
  );

  const handleEditShortTest = useCallback(
    (shortTest: ShortTest) => {
      dialog.show({
        title: 'Kurztest bearbeiten',
        content: (
          <ShortTestForm
            shortTest={shortTest}
            onSubmit={editShortTest(shortTest)}
            onCancelClicked={dialog.hide}
          />
        ),
        DialogProps: {
          maxWidth: 'lg',
        },
      });
    },
    [dialog, editShortTest]
  );

  return (
    <Box height='inherit'>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <TableWithForm
            title='Neuen Kurztest erstellen'
            form={<ShortTestForm allShortTests={shortTests} onSubmit={handleSubmit} />}
            items={shortTests ?? []}
            createRowFromItem={(shortTest) => (
              <ShortTestRow
                key={shortTest.id}
                shortTest={shortTest}
                onEditClicked={handleEditShortTest}
                onDeleteClicked={deleteShortTest}
              />
            )}
            placeholder='Keine Kurztests vorhanden.'
            topBarContent={
              <>
                <Button
                  component={Link}
                  to={ROUTES.IMPORT_SHORT_TEST_RESULTS.create({})}
                  startIcon={<ImportIcon />}
                >
                  Importiere neue Ergebnisse
                </Button>
              </>
            }
          />
        </>
      )}
    </Box>
  );
}

export default ShortTestManagement;
