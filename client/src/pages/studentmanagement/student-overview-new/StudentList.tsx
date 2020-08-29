import { Box } from '@material-ui/core';
import { FormikHelpers } from 'formik';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FixedSizeList } from 'react-window';
import { ScheincriteriaSummaryByStudents } from 'shared/model/ScheinCriteria';
import { IStudentDTO } from 'shared/model/Student';
import StudentForm, {
  convertFormStateToDTO,
  StudentFormState,
} from '../../../components/forms/StudentForm';
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
  additionalTopBarItem?: React.ReactNode;
  teams?: Team[];
  tutorialId?: string;
}

const GUTTER_SIZE = 16;

function StudentList({
  students,
  studentSubtextType,
  summaries,
  teams,
  onStudentEdit,
  onStudentDelete,
  onStudentChangeTutorial,
  tutorialId,
  additionalTopBarItem,
}: Props): JSX.Element {
  const dialog = useDialog();

  const root = useRef<HTMLTableElement>(null);
  const [{ height, width }, setDimensions] = useState({ height: 0, width: 0 });

  const [filterText, setFilterText] = useState('');
  const [sortOption, setSortOption] = useState<StudentSortOption>(StudentSortOption.ALPHABETICAL);
  const filteredStudents = useMemo(() => getFilteredStudents(students, filterText, sortOption), [
    students,
    filterText,
    sortOption,
  ]);

  useEffect(() => {
    const rootElement = root.current;

    if (!rootElement) {
      return;
    }

    function handleResize() {
      if (!rootElement) {
        return;
      }

      const { height, width } = rootElement.getBoundingClientRect();
      setDimensions({ height, width });
    }

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(rootElement);

    return () => resizeObserver.disconnect();
  }, []);

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
    <Box display='flex' flexDirection='column'>
      <StudentListTopBar
        filterText={filterText}
        onFilterTextChanged={setFilterText}
        sortOption={sortOption}
        onSortOptionChanged={setSortOption}
        additionalTopBarItem={additionalTopBarItem}
      />

      <div ref={root} style={{ flex: 1, marginBottom: -8, paddingRight: 16, marginRight: -16 }}>
        <FixedSizeList
          height={height}
          width={width}
          itemCount={filteredStudents.length}
          itemSize={80 + GUTTER_SIZE}
        >
          {({ index, style }) => {
            const student = filteredStudents[index];
            const posTop = Number.parseInt(`${style.top ?? 0}`);
            const elHeight = Number.parseInt(`${style.height ?? 0}`);
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
                style={{
                  ...style,
                  top: posTop + GUTTER_SIZE,
                  height: elHeight - GUTTER_SIZE,
                }}
              />
            );
          }}
        </FixedSizeList>
      </div>
    </Box>
  );
}

export default StudentList;
