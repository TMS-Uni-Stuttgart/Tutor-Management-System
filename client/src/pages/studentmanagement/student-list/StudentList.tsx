import { Box } from '@material-ui/core';
import { FormikHelpers } from 'formik';
import React, { useCallback, useMemo, useState } from 'react';
import { ScheincriteriaSummaryByStudents } from 'shared/model/ScheinCriteria';
import { IStudentDTO } from 'shared/model/Student';
import StudentForm, {
  convertFormStateToDTO,
  StudentFormState,
} from '../../../components/forms/StudentForm';
import VirtualizedList from '../../../components/virtualized-list/VirtualizedList';
import { useDialog } from '../../../hooks/dialog-service/DialogService';
import { Student } from '../../../model/Student';
import { Team } from '../../../model/Team';
import StudentListRow, { SubtextType } from './components/StudentListRow';
import StudentListTopBar from './components/StudentListTopBar';
import { getFilteredStudents, StudentSortOption } from './StudentList.helpers';

interface Props {
  students: Student[];
  studentSubtextType: SubtextType;
  summaries: ScheincriteriaSummaryByStudents;
  onStudentEdit: (
    student: Student,
    newData: IStudentDTO,
    helpers: FormikHelpers<StudentFormState>
  ) => Promise<void>;
  onStudentDelete: (student: Student) => Promise<void>;
  onStudentChangeTutorial?: (student: Student) => void;
  hideDefaultTopBarContent?: boolean;
  additionalTopBarItem?: React.ReactNode;
  teams?: Team[];
  tutorialId?: string;
}

function StudentList({
  students,
  studentSubtextType,
  summaries,
  teams,
  onStudentEdit,
  onStudentDelete,
  onStudentChangeTutorial,
  hideDefaultTopBarContent,
  tutorialId,
  additionalTopBarItem,
}: Props): JSX.Element {
  const dialog = useDialog();

  const [filterText, setFilterText] = useState('');
  const [sortOption, setSortOption] = useState<StudentSortOption>(StudentSortOption.ALPHABETICAL);
  const filteredStudents = useMemo(() => getFilteredStudents(students, filterText, sortOption), [
    students,
    filterText,
    sortOption,
  ]);

  const handleStudentEdit = useCallback(
    (student: Student) => {
      dialog.show({
        title: 'Student bearbeiten',
        content: (
          <StudentForm
            student={student}
            otherStudents={students.filter((s) => s.id !== student.id)}
            teams={teams}
            onSubmit={async (values, helpers) => {
              const newData: IStudentDTO = convertFormStateToDTO(values, student.tutorial.id);
              await onStudentEdit(student, newData, helpers);

              dialog.hide();
            }}
            onCancelClicked={() => dialog.hide()}
          />
        ),
        DialogProps: {
          maxWidth: 'lg',
        },
      });
    },
    [dialog, onStudentEdit, students, teams]
  );

  const handleStudentDelete = useCallback(
    async (student: Student) => {
      const result = await dialog.showConfirmationDialog({
        title: `${student.nameFirstnameFirst} löschen?`,
        content: `Soll ${student.nameFirstnameFirst} wirklich gelöscht werden? Dies kann nicht rückgängig gemacht werden!`,
        acceptProps: { label: 'Löschen', deleteButton: true },
        cancelProps: { label: 'Nicht löschen' },
      });

      if (result) {
        onStudentDelete(student);
      }
    },
    [onStudentDelete, dialog]
  );

  return (
    <Box
      flex={1}
      height='100%'
      display='grid'
      gridTemplateColumns='1fr'
      gridTemplateRows='auto minmax(350px, 1fr)'
    >
      <StudentListTopBar
        filterText={filterText}
        onFilterTextChanged={setFilterText}
        sortOption={sortOption}
        onSortOptionChanged={setSortOption}
        additionalTopBarItem={additionalTopBarItem}
        hideDefaultTopBarContent={hideDefaultTopBarContent}
        marginBottom={1}
      />
      <VirtualizedList
        items={filteredStudents}
        placeholder={
          students.length === 0
            ? '  Keine Studierenden vorhanden.'
            : 'Keine Studierenden entsprechen dem Filter.'
        }
      >
        {({ item: student }) => {
          const scheinStatus = summaries[student.id];
          return (
            <StudentListRow
              student={student}
              subTextType={studentSubtextType}
              scheinStatus={scheinStatus}
              tutorialId={tutorialId}
              onEdit={handleStudentEdit}
              onDelete={handleStudentDelete}
              onChangeTutorial={onStudentChangeTutorial}
            />
          );
        }}
      </VirtualizedList>
    </Box>
  );
}

export default StudentList;
