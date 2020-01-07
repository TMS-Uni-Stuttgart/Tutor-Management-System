import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import React, { useEffect, useState } from 'react';
import { ScheinExam, ScheinExamDTO } from 'shared/dist/model/Scheinexam';
import ScheinExamForm, {
  getInitialExamFormState,
  ScheinExamFormState,
  ScheinExamFormSubmitCallback,
} from '../../components/forms/ScheinExamForm';
import LoadingSpinner from '../../components/LoadingSpinner';
import TableWithForm from '../../components/TableWithForm';
import { useDialog } from '../../hooks/DialogService';
import { useAxios } from '../../hooks/FetchingService';
import { getDisplayStringOfScheinExam } from '../../util/helperFunctions';
import ScheinExamRow from './components/ScheinExamRow';
import { getDuplicateExerciseName } from '../points/util/helper';
import { convertFormExercisesToDTOs } from '../../components/forms/SheetForm';

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

type Props = WithSnackbarProps;

function generateScheinExamDTO(values: ScheinExamFormState): ScheinExamDTO {
  const date = new Date(values.date);

  return {
    scheinExamNo: Number.parseFloat(values.scheinExamNo),
    exercises: convertFormExercisesToDTOs(values.exercises),
    percentageNeeded: values.percentageNeeded,
    date: date.toDateString(),
  };
}

function ScheinExamManagement({ enqueueSnackbar }: Props): JSX.Element {
  const classes = useStyles();

  const [isLoading, setIsLoading] = useState(false);
  const [exams, setExams] = useState<ScheinExam[]>([]);
  const dialog = useDialog();
  const { getAllScheinExams, createScheinExam, editScheinExam, deleteScheinExam } = useAxios();

  useEffect(() => {
    setIsLoading(true);
    getAllScheinExams().then(exams => {
      setExams(exams);
      setIsLoading(false);
    });
  }, [getAllScheinExams]);

  const handleSubmit: ScheinExamFormSubmitCallback = async (
    values,
    { resetForm, setSubmitting, setFieldError }
  ) => {
    const isNotInUse =
      exams.find(t => t.scheinExamNo.toString() === values.scheinExamNo) !== undefined;
    const duplicateName = getDuplicateExerciseName(values.exercises);

    if (duplicateName) {
      setFieldError('exercises', `Die Aufgabenbezeichnung ${duplicateName} ist mehrfach vergeben.`);
      return;
    }

    if (isNotInUse) {
      setFieldError('scheinExamNo', 'Diese Nummer ist bereits vergeben.');
      return;
    }
    try {
      const exam = await createScheinExam(generateScheinExamDTO(values));

      setExams([...exams, exam]);
      resetForm({ values: getInitialExamFormState(undefined, [...exams, exam]) });
      enqueueSnackbar('Scheinklausur erfolgreich erstellt.', { variant: 'success' });
    } catch (reason) {
      console.error(reason);
      enqueueSnackbar('Erstellen der Scheinklausur fehlgeschlagen.', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const editExam: (exam: ScheinExam) => ScheinExamFormSubmitCallback = exam => async (
    values,
    { setSubmitting }
  ) => {
    try {
      const updatedExam = await editScheinExam(exam.id, generateScheinExamDTO(values));

      setExams(exams.map(e => (e.id === exam.id ? updatedExam : e)));
      enqueueSnackbar('Scheinklausur erfolgreich bearbeitet.', { variant: 'success' });
      dialog.hide();
    } catch (reason) {
      console.error(reason);
      enqueueSnackbar('Bearbeiten der Scheinklausur fehlgeschlagen.', { variant: 'error' });
      setSubmitting(false);
    }
  };

  const deleteExam: (exam: ScheinExam) => void = async exam => {
    try {
      await deleteScheinExam(exam.id);

      setExams(exams.filter(e => e.id !== exam.id));
      enqueueSnackbar(`Scheinklausur wurde erfolgreich gelöscht.`, { variant: 'success' });
    } catch (reason) {
      enqueueSnackbar(`Scheinklausur konnte nicht gelöscht werden.`, { variant: 'error' });
    } finally {
      dialog.hide();
    }
  };

  function handleEditExam(exam: ScheinExam) {
    dialog.show({
      title: 'Scheinklausur bearbeiten',
      content: (
        <ScheinExamForm exam={exam} onSubmit={editExam(exam)} onCancelClicked={dialog.hide} />
      ),
    });
  }

  function handleDeleteExam(exam: ScheinExam) {
    dialog.show({
      title: 'Nutzer löschen',
      content: `Soll ${getDisplayStringOfScheinExam(
        exam
      )} wirklich gelöscht werden? Diese Aktion kann nicht rückgängig gemacht werden!`,
      actions: [
        {
          label: 'Nicht löschen',
          onClick: () => dialog.hide(),
        },
        {
          label: 'Löschen',
          onClick: () => deleteExam(exam),
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
          title='Neue Scheinklausur erstellen'
          form={<ScheinExamForm exams={exams} onSubmit={handleSubmit} />}
          items={exams}
          createRowFromItem={exam => (
            <ScheinExamRow
              key={exam.id}
              exam={exam}
              onEditExamClicked={handleEditExam}
              onDeleteExamClicked={handleDeleteExam}
            />
          )}
          placeholder='Keine Scheinklausuren vorhanden.'
        />
      )}
    </div>
  );
}

export default withSnackbar(ScheinExamManagement);
