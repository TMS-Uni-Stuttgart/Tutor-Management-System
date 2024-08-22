import { Button } from '@mui/material';
import { TableArrowDown as ImportIcon } from 'mdi-material-ui';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import StudentForm, {
  convertFormStateToDTO,
  StudentFormSubmitCallback,
} from '../../components/forms/StudentForm';
import LoadingSpinner from '../../components/loading/LoadingSpinner';
import OpenableFormWithFab, { EditorOpenState } from '../../components/OpenableFormWithFab';
import { ROUTES } from '../../routes/Routing.routes';
import StudentList from './student-list/StudentList';
import { useStudentsForStudentList } from './student-list/StudentList.helpers';

interface Params {
  tutorialId: string;
}

function TutorStudentmanagement(): JSX.Element {
  const { tutorialId } = useParams<Params>();
  const [editorState, setEditorState] = useState<EditorOpenState>({
    isAnimating: false,
    isEditorOpen: false,
  });

  const { students, teams, summaries, isLoading, createStudent, editStudent, deleteStudent } =
    useStudentsForStudentList({ tutorialId });

  useEffect(() => {
    setEditorState({ isAnimating: false, isEditorOpen: false });
  }, [students]);

  const handleCreateSubmit: StudentFormSubmitCallback = useCallback(
    async (values, helpers) => {
      const dto = convertFormStateToDTO(values, tutorialId);
      await createStudent(dto);

      helpers.resetForm();
    },
    [tutorialId, createStudent]
  );

  return isLoading ? (
    <LoadingSpinner text='Lade Studierende' />
  ) : (
    <StudentList
      students={students}
      summaries={summaries}
      tutorialId={tutorialId}
      teams={teams}
      onStudentEdit={editStudent}
      onStudentDelete={deleteStudent}
      studentSubtextType='team'
      hideDefaultTopBarContent={editorState.isAnimating || editorState.isEditorOpen}
      additionalTopBarItem={
        <>
          {!(editorState.isAnimating || editorState.isEditorOpen) && (
            <Button
              variant='outlined'
              component={Link}
              to={ROUTES.IMPORT_STUDENTS.create({ tutorialId })}
              startIcon={<ImportIcon />}
              style={{ marginLeft: 8 }}
            >
              Importieren
            </Button>
          )}
          <OpenableFormWithFab
            title='Neue/n Studierende/n anlegen'
            onOpenChange={(state) => setEditorState(state)}
          >
            <StudentForm teams={teams} otherStudents={students} onSubmit={handleCreateSubmit} />
          </OpenableFormWithFab>
        </>
      }
    />
  );
}

export default TutorStudentmanagement;
