import { Box, Button } from '@material-ui/core';
import { FileImportOutline as ImportIcon } from 'mdi-material-ui';
import { useSnackbar } from 'notistack';
import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { convertFormExercisesToDTOs } from '../../../components/forms/SheetForm';
import ShortTestForm, {
  getInitialShortTestFormState,
  ShortTestFormSubmitCallback,
} from '../../../components/forms/ShortTestForm';
import LoadingSpinner from '../../../components/loading/LoadingSpinner';
import TableWithForm from '../../../components/TableWithForm';
import { createShortTest, getAllShortTests } from '../../../hooks/fetching/ShortTests';
import { useFetchState } from '../../../hooks/useFetchState';
import { ROUTES } from '../../../routes/Routing.routes';
import { useLogger } from '../../../util/Logger';
import { getDuplicateExerciseName } from '../../points-sheet/util/helper';

function ShortTestManagement(): JSX.Element {
  const logger = useLogger('ShortTestManagement');
  const { enqueueSnackbar } = useSnackbar();
  const { isLoading, value } = useFetchState({
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
        shortTests?.find((t) => t.shortTestNo === values.shortTestNo) !== undefined;
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
        const shortTest = await createShortTest({
          shortTestNo: values.shortTestNo,
          percentageNeeded: values.percentageNeeded,
          exercises: convertFormExercisesToDTOs(values.exercises),
        });
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
            createRowFromItem={(shortTest) => <div key={shortTest.id}>Work in Progress</div>}
            placeholder='Keine Kurztests vorhanden.'
            topBarContent={
              <>
                <Button
                  component={Link}
                  to={ROUTES.IMPORT_SHORT_TEST_RESULTS.create({})}
                  startIcon={<ImportIcon />}
                >
                  Importiere Ergebnisse
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
