import { Box, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { useFormikContext } from 'formik';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router';
import { IExerciseGradingDTO, IGradingDTO } from 'shared/model/Gradings';
import ShortTestForm, { ShortTestFormState } from '../../../components/forms/ShortTestForm';
import { useMapColumnsHelpers } from '../../../components/import-csv/hooks/useMapColumnsHelpers';
import LoadingModal from '../../../components/loading/LoadingModal';
import Placeholder from '../../../components/Placeholder';
import { useStepper } from '../../../components/stepper-with-buttons/context/StepperContext';
import {
  createShortTest,
  editShortTest,
  getAllShortTests,
} from '../../../hooks/fetching/ShortTests';
import { setPointsOfMultipleStudents } from '../../../hooks/fetching/Student';
import { useCustomSnackbar } from '../../../hooks/snackbar/useCustomSnackbar';
import { useFetchState } from '../../../hooks/useFetchState';
import { ShortTest } from '../../../model/ShortTest';
import { Student } from '../../../model/Student';
import { ROUTES } from '../../../routes/Routing.routes';
import { FormikSubmitCallback } from '../../../types';
import { Logger, useLogger } from '../../../util/Logger';
import { convertFormStateToDTO } from '../../hand-ins/short-test-management/ShortTestManagement';
import { ShortTestColumns } from '../ImportShortTests';
import { useIliasMappingContext } from './map-students-ilias-names/IliasMapping.context';

const useStyles = makeStyles((theme) =>
  createStyles({
    form: {
      marginTop: theme.spacing(4),
    },
  })
);

function HookUpStepper(): null {
  const history = useHistory();
  const { submitForm } = useFormikContext<ShortTestFormState>();

  const { setNextCallback, removeNextCallback } = useStepper();

  useEffect(() => {
    setNextCallback(async () => {
      const isSuccess: any = await submitForm();

      if (!!isSuccess) {
        return {
          goToNext: true,
          runAfterFinished: () => {
            history.push(ROUTES.MANAGE_HAND_INS.create({ location: '1' }));
          },
        };
      } else {
        return { goToNext: false, error: true };
      }
    });

    return () => removeNextCallback();
  }, [setNextCallback, removeNextCallback, submitForm, history]);

  return null;
}

interface Params {
  iliasName: string | undefined;
  testResultOfStudent: string | undefined;
  logger: Logger;
  iliasNameMapping: Map<string, Student>;
  shortTest: ShortTest;
}

function parseTestResultToNumber(testResultOfStudent: string | undefined): number {
  if (!testResultOfStudent) {
    return 0;
  }

  const parsed = Number.parseInt(testResultOfStudent);

  return Number.isNaN(parsed) ? 0 : parsed;
}

function getShortTestGradingForStudent({
  logger,
  iliasNameMapping,
  shortTest,
  testResultOfStudent,
  iliasName,
}: Params): { grading: IGradingDTO; student: Student } | undefined {
  // Skip "empty" rows which only contain some data about previous test runs of a student. "Empty" is determined by the 'iliasNameColumn' because those fields are not present in those rows.
  if (!iliasName) {
    return undefined;
  }

  const student = iliasNameMapping.get(iliasName);

  // Only warn of not mapped ilias names bc if a name is not mapped the result is simply ignored.
  if (!student) {
    logger.warn(`No student mapped to the ilias name "${iliasName}"`);
    return undefined;
  }

  const pointsOfStudent = parseTestResultToNumber(testResultOfStudent);
  const prevGrading = student.getGrading(shortTest.id);
  const exerciseGradings = new Map<string, IExerciseGradingDTO>();

  exerciseGradings.set(shortTest.exercises[0].id, { points: pointsOfStudent });

  const grading: IGradingDTO = {
    shortTestId: shortTest.id,
    exerciseGradings: [...exerciseGradings],
    createNewGrading: !prevGrading,
    // comment: '', // TODO: Write a comment -- maybe one can include the exact result in here?
  };

  return { grading, student };
}

function AdjustGeneratedShortTest(): JSX.Element {
  const classes = useStyles();
  const logger = useLogger('AdjustGeneratedShortTest');

  const { enqueueSnackbar } = useCustomSnackbar();
  const { data, mappedColumns } = useMapColumnsHelpers<ShortTestColumns>();
  const { iliasNameMapping, shortTest } = useIliasMappingContext();
  const { isLoading, value: shortTests } = useFetchState({
    fetchFunction: getAllShortTests,
    immediate: true,
    params: [],
  });

  const [isImporting, setImporting] = useState(false);

  const initialValues: ShortTestFormState | undefined = useMemo(() => {
    if (shortTest) {
      return undefined;
    }

    const nextShortTestNo: number | undefined =
      shortTests && shortTests.length > 0
        ? shortTests[shortTests.length - 1].shortTestNo + 1
        : undefined;

    return {
      shortTestNo: nextShortTestNo?.toString(10) ?? '1',
      percentageNeeded: 0.5,
      exercises: [
        {
          exName: 'Gesamter Test',
          maxPoints: data.rows[0]?.data[mappedColumns.testMaximumPoints] ?? '0',
          bonus: false,
          subexercises: [],
        },
      ],
    };
  }, [shortTests, data.rows, mappedColumns.testMaximumPoints, shortTest]);

  const handleSubmit: FormikSubmitCallback<ShortTestFormState> = useCallback(
    async (values) => {
      try {
        setImporting(true);
        const generatedShortTest = !!shortTest
          ? await editShortTest(shortTest.id, convertFormStateToDTO(values))
          : await createShortTest(convertFormStateToDTO(values));

        const {
          iliasName: iliasNameColumn,
          testResultStudent: testResultStudentColumn,
        } = mappedColumns;
        const gradings: Map<string, IGradingDTO> = new Map();

        for (const row of data.rows) {
          const result = getShortTestGradingForStudent({
            iliasName: row.data[iliasNameColumn],
            testResultOfStudent: row.data[testResultStudentColumn],
            shortTest: generatedShortTest,
            iliasNameMapping,
            logger,
          });

          if (result) {
            gradings.set(result.student.id, result.grading);
          }
        }

        await setPointsOfMultipleStudents(gradings);
        enqueueSnackbar('Kurztestergebnisse wurden erfolgreich importiert.', {
          variant: 'success',
        });
      } catch (err) {
        setImporting(false);
        return false;
      }

      return true;
    },
    [data.rows, mappedColumns, iliasNameMapping, logger, enqueueSnackbar, shortTest]
  );

  return (
    <Box display='flex' flexDirection='column' flex={1}>
      <Typography variant='h4'>Importierten Kurztest anpassen</Typography>

      <Placeholder
        placeholderText='Keine Anpassung möglich'
        showPlaceholder={false}
        loading={isLoading}
      >
        <ShortTestForm
          onSubmit={handleSubmit}
          initialValues={initialValues}
          shortTest={shortTest}
          className={classes.form}
          hideSaveButton
        >
          <HookUpStepper />
        </ShortTestForm>
      </Placeholder>

      <LoadingModal modalText='Importiere Kurztestergebnisse...' open={isImporting} />
    </Box>
  );
}

export default AdjustGeneratedShortTest;
