import { Box, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { FormikHelpers } from 'formik';
import React, { useCallback, useMemo, useState } from 'react';
import { FixedSizeList } from 'react-window';
import { ScheincriteriaSummaryByStudents } from 'shared/model/ScheinCriteria';
import { IStudentDTO } from 'shared/model/Student';
import StudentForm, {
  convertFormStateToDTO,
  StudentFormState,
} from '../../../components/forms/StudentForm';
import { useDialog } from '../../../hooks/dialog-service/DialogService';
import { useResizeObserver } from '../../../hooks/useResizeObserver';
import { Student } from '../../../model/Student';
import { Team } from '../../../model/Team';
import StudentListRow, { SubtextType } from './components/StudentListRow';
import StudentListTopBar from './components/StudentListTopBar';
import { getFilteredStudents, StudentSortOption } from './StudentList.helpers';

const useStyles = makeStyles((theme) =>
  createStyles({
    lastRow: {
      marginBottom: theme.spacing(1),
    },
    placeholder: {
      marginTop: 64,
      textAlign: 'center',
    },
    list: {
      gridColumn: '1 / span 1',
      marginTop: 2,
      marginBottom: -8,
      marginRight: -16,
    },
  })
);

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

const GUTTER_SIZE = 16;

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
  const classes = useStyles();
  const dialog = useDialog();

  const [root, { height, width }] = useResizeObserver<HTMLDivElement>();

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
      />

      <div ref={root} className={classes.list}>
        {students.length === 0 ? (
          <Typography variant='h6' className={classes.placeholder}>
            Keine Studierenden vorhanden.
          </Typography>
        ) : filteredStudents.length === 0 ? (
          <Typography variant='h6' className={classes.placeholder}>
            Keine Studierenden entsprechen dem Filter.
          </Typography>
        ) : (
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
                  className={clsx(index === filteredStudents.length - 1 && classes.lastRow)}
                  style={{
                    ...style,
                    top: posTop + GUTTER_SIZE,
                    height: elHeight - GUTTER_SIZE,
                    width: 'calc(100% - 16px)',
                  }}
                />
              );
            }}
          </FixedSizeList>
        )}
      </div>
    </Box>
  );
}

export default StudentList;
