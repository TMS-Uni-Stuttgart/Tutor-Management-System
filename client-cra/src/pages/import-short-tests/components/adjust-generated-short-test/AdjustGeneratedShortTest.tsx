import { Box, Typography } from '@material-ui/core';
import { FormikErrors } from 'formik';
import _ from 'lodash';
import React, { useCallback, useMemo, useState } from 'react';
import { IExerciseGradingDTO, IGradingDTO } from 'shared/model/Gradings';
import ShortTestForm, { ShortTestFormState } from '../../../../components/forms/ShortTestForm';
import { useImportCSVContext } from '../../../../components/import-csv/ImportCSV.context';
import { CSVDataRow, CSVMappedColumns } from '../../../../components/import-csv/ImportCSV.types';
import InformationButton from '../../../../components/information-box/InformationButton';
import LoadingModal from '../../../../components/loading/LoadingModal';
import Placeholder from '../../../../components/Placeholder';
import HookUpStepperWithFormik from '../../../../components/stepper-with-buttons/HookUpStepperWithFormik';
import { createShortTest, editShortTest } from '../../../../hooks/fetching/ShortTests';
import { setPointsOfMultipleStudents } from '../../../../hooks/fetching/Student';
import { useCustomSnackbar } from '../../../../hooks/snackbar/useCustomSnackbar';
import { useFetchState } from '../../../../hooks/useFetchState';
import { ShortTest } from '../../../../model/ShortTest';
import { Student } from '../../../../model/Student';
import { FormikSubmitCallback } from '../../../../types';
import { Logger } from '../../../../util/Logger';
import { convertFormStateToDTO } from '../../../hand-ins/short-test-management/ShortTestManagement';
import { ShortTestColumns } from '../ImportShortTests';
import { useIliasMappingContext } from '../map-students-ilias-names/IliasMapping.context';
import { generateInitialValues, validateExercises, validateShortTestNumber } from './formHelpers';

type ShortTestValidator = (values: ShortTestFormState) => FormikErrors<ShortTestFormState>;

interface Params {
  csvRow: CSVDataRow;
  shortTest: ShortTest;
  mappedColumns: CSVMappedColumns<ShortTestColumns>;
  getStudentMapping: (iliasName: string) => Student | undefined;
}

function getShortTestGradingForStudent({
  csvRow,
  shortTest,
  mappedColumns,
  getStudentMapping,
}: Params): { grading: IGradingDTO; student: Student } | undefined {
  const iliasNameColumns = mappedColumns.iliasName;

  if (Array.isArray(iliasNameColumns)) {
    Logger.logger.warn('Iliasname must NOT be a dynamic column.', {
      context: 'getShortTestGradingForStudent',
    });
    return undefined;
  }

  const iliasName: string = csvRow.data[iliasNameColumns];

  if (!iliasName) {
    // Skip "empty" rows which only contain some data about previous test runs of a student. "Empty" is determined by the 'iliasNameColumn' because those fields are not present in those rows.
    return undefined;
  }

  const student = getStudentMapping(iliasName);

  if (!student) {
    Logger.logger.warn(`No student mapped to the ilias name "${iliasName}"`, {
      context: 'getShortTestGradingForStudent',
    });
    return undefined;
  }

  const exerciseGradings = new Map<string, IExerciseGradingDTO>();

  for (const exercise of shortTest.exercises) {
    let pointsOfExercise: number = Number.parseFloat(
      csvRow.data[exercise.exName].replace(/,/g, '.')
    );

    if (Number.isNaN(pointsOfExercise)) {
      Logger.logger.error(
        `Could not find points for exercise "${exercise.exName}" for student "${student.name}". Grading this exercise with 0 points.`,
        {
          context: 'getShortTestGradingForStudent',
        }
      );
      pointsOfExercise = 0;
    }

    exerciseGradings.set(exercise.id, { points: pointsOfExercise });
  }

  const grading: IGradingDTO = {
    shortTestId: shortTest.id,
    exerciseGradings: [...exerciseGradings],
    createNewGrading: !student.getGrading(shortTest.id),
  };

  return { grading, student };
}

function AdjustGeneratedShortTest(): JSX.Element {
  const { enqueueSnackbar, enqueueSnackbarWithList } = useCustomSnackbar();

  const {
    csvData,
    mapColumnsHelpers: { mappedColumns },
  } = useImportCSVContext<ShortTestColumns, string>();
  const { getMapping, shortTest } = useIliasMappingContext();
  const [isImporting, setImporting] = useState(false);
  const [value, isLoading] = useFetchState({
    fetchFunction: generateInitialValues,
    immediate: true,
    params: [shortTest, mappedColumns, csvData.rows],
  });

  const totalPointsOfTest: number = useMemo(() => {
    const key = mappedColumns.testMaximumPoints;

    if (Array.isArray(key)) {
      return 0;
    }

    const points: number = Number.parseInt(csvData.rows[0]?.data[key] ?? 0, 10);

    return Number.isNaN(points) ? 0 : points;
  }, [csvData.rows, mappedColumns.testMaximumPoints]);

  const validateShortTest: ShortTestValidator = useCallback(
    (values) => {
      const result = {
        shortTestNo: validateShortTestNumber(values, shortTest, value?.shortTests ?? []),
        exercises: validateExercises(values, totalPointsOfTest),
      };

      // Formik checks, if a key is present to determine if it's an error. However, the validation functions above return undefined if the corresponding part was validated successfully.
      return _.pickBy(result, (v) => v !== undefined);
    },
    [totalPointsOfTest, value?.shortTests, shortTest]
  );

  const handleSubmit: FormikSubmitCallback<ShortTestFormState> = useCallback(
    async (values) => {
      let success: boolean = false;

      try {
        setImporting(true);
        const generatedShortTest = !!shortTest
          ? await editShortTest(shortTest.id, convertFormStateToDTO(values))
          : await createShortTest(convertFormStateToDTO(values));
        const gradings: Map<string, IGradingDTO> = new Map();

        for (const csvRow of csvData.rows) {
          const result = getShortTestGradingForStudent({
            csvRow,
            shortTest: generatedShortTest,
            mappedColumns,
            getStudentMapping: getMapping,
          });

          if (result) {
            gradings.set(result.student.id, result.grading);
          }
        }

        await setPointsOfMultipleStudents(gradings);
        enqueueSnackbar('Kurztestergebnisse wurden erfolgreich importiert.', {
          variant: 'success',
        });
        success = true;
      } catch (err) {
        enqueueSnackbarWithList({
          title: 'Kurztestergebnisse konnten nicht importiert werden',
          textBeforeList: err.message ?? 'NO_ERR_MESSAGE',
          items: [],
          variant: 'error',
          persist: false,
        });
        success = false;
      } finally {
        setImporting(false);
      }

      return success;
    },
    [csvData.rows, shortTest, enqueueSnackbar, enqueueSnackbarWithList, getMapping, mappedColumns]
  );

  return (
    <Box display='grid' gridRowGap={32} width='100%' gridTemplateRows='auto 1fr'>
      <Box display='grid' gridTemplateColumns='1fr auto'>
        <Typography variant='h4'>Importierten Kurztest anpassen</Typography>
        <InformationButton
          title='Generierter Kurztest'
          information='Werden Ergebnisse neu (!) importiert, so wird versucht, einen möglichst guten Test zu generieren. Dafür müssen allerdings pro Aufgabe die maximale Punktzahl, die von einem/r Studierenden erreicht wurde, genommen werden (der Iliasexport enthält die Punkte für die Aufgaben nicht). Deshalb kann es sein, dass die generierte Bepunktung der Aufgaben nicht zu 100% mit der realen Bepunktung übereinstimmt und diese angepasst werden muss.'
          dialogWidth='md'
        >
          Info
        </InformationButton>
      </Box>

      <Placeholder
        loading={isLoading}
        placeholderText='Generiere Kurztest...'
        showPlaceholder={!shortTest && !value?.initialValues}
      >
        <ShortTestForm
          onSubmit={handleSubmit}
          initialValues={value?.initialValues}
          shortTest={shortTest}
          editorProps={{
            disableAutofocus: true,
            disableSubExercises: true,
            disableAddExercise: true,
            disableExerciseNameChange: true,
          }}
          validate={validateShortTest}
          initialTouched={{ exercises: [] }}
          validateOnMount
          hideSaveButton
          enableErrorsInDebug
        >
          <HookUpStepperWithFormik />
        </ShortTestForm>
      </Placeholder>

      <LoadingModal modalText='Importiere Kurztestergebnisse...' open={isImporting} />
    </Box>
  );
}

export default AdjustGeneratedShortTest;
