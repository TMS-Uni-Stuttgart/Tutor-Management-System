import { Box } from '@material-ui/core';
import { Formik, useFormikContext } from 'formik';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo } from 'react';
import { useHistory } from 'react-router';
import { ICreateStudentsDTO, IStudent, StudentStatus } from 'shared/model/Student';
import FormikDebugDisplay from '../../../components/forms/components/FormikDebugDisplay';
import { useImportCSVContext } from '../../../components/import-csv/ImportCSV.context';
import {
  NextStepInformation,
  useStepper,
} from '../../../components/stepper-with-buttons/context/StepperContext';
import { createManyStudents } from '../../../hooks/fetching/Student';
import { useCustomSnackbar } from '../../../hooks/snackbar/useCustomSnackbar';
import { FormikSubmitCallback } from '../../../types';
import { StudentColumns } from '../ImportStudents';
import StudentDataBox from './components/StudentDataBox';
import { convertCSVDataToFormData } from './components/StudentDataBox.helpers';

export interface StudentFormStateValue {
  rowNr: number;
  firstname: string;
  lastname: string;
  email?: string;
  status: StudentStatus;
  team?: string;
  iliasName?: string;
  matriculationNo?: string;
  courseOfStudies?: string;
}

export interface StudentFormState {
  [id: string]: StudentFormStateValue;
}

interface Props {
  tutorialId: string;
}

function convertValuesToDTO(values: StudentFormState, tutorialId: string): ICreateStudentsDTO {
  return {
    tutorial: tutorialId,
    students: Object.values(values),
  };
}

function AdjustImportedUserDataFormContent(): JSX.Element {
  const { setNextCallback, removeNextCallback } = useStepper();
  const { values, isValid, validateForm, submitForm } = useFormikContext<StudentFormState>();
  const { enqueueSnackbar } = useSnackbar();
  const history = useHistory();

  useEffect(() => {
    setNextCallback(async (): Promise<NextStepInformation> => {
      const errors = await validateForm();

      if (Object.entries(errors).length > 0) {
        enqueueSnackbar('Nutzerdaten sind ungültig.', { variant: 'error' });
        return { goToNext: false, error: true };
      }

      const isSuccess: any = await submitForm();

      if (!!isSuccess) {
        return { goToNext: true };
      } else {
        return { goToNext: false, error: true };
      }
    });

    return () => removeNextCallback();
  }, [
    setNextCallback,
    removeNextCallback,
    isValid,
    values,
    enqueueSnackbar,
    history,
    submitForm,
    validateForm,
  ]);

  return (
    <Box display='flex' flex={1}>
      <StudentDataBox />

      <FormikDebugDisplay showErrors />
    </Box>
  );
}

function AdjustImportedStudentDataForm({ tutorialId }: Props): JSX.Element {
  const {
    csvData,
    mapColumnsHelpers: { mappedColumns },
  } = useImportCSVContext<StudentColumns, string>();
  const { enqueueSnackbar, enqueueSnackbarWithList } = useCustomSnackbar();

  const initialValues: StudentFormState = useMemo(() => {
    return convertCSVDataToFormData({
      data: csvData,
      values: mappedColumns,
    });
  }, [csvData, mappedColumns]);

  const handleSubmit: FormikSubmitCallback<StudentFormState> = async (values) => {
    const dto: ICreateStudentsDTO = convertValuesToDTO(values, tutorialId);

    try {
      const response: IStudent[] = await createManyStudents(dto);

      enqueueSnackbar(`${response.length} Studierende wurden erstellt.`, {
        variant: 'success',
      });
      return true;
    } catch (errors) {
      if (Array.isArray(errors)) {
        enqueueSnackbarWithList({
          title: 'Studierende konnten nicht erstellt werden.',
          textBeforeList:
            'Da bei einigen Studierenden ein Fehler aufgetreten ist, wurde kein/e Studierende erstellt. Folgende Studierende konnte nicht erstellt werden:',
          items: errors,
          variant: 'error',
        });
      } else {
        enqueueSnackbar(`Es konnten keine Studierenden erstellt werden.`, {
          variant: 'error',
        });
      }
      return false;
    }
  };

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      <AdjustImportedUserDataFormContent />
    </Formik>
  );
}

export default AdjustImportedStudentDataForm;
