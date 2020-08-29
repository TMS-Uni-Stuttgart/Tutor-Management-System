import { Box, Button, Paper, PaperProps, TextField, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { FormikHelpers } from 'formik';
import {
  AccountSearch as SearchIcon,
  AccountSwitch as ChangeTutorialIcon,
  InformationOutline as InfoIcon,
  Mail as MailIcon,
} from 'mdi-material-ui';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FixedSizeList } from 'react-window';
import {
  ScheinCriteriaSummary,
  ScheincriteriaSummaryByStudents,
} from 'shared/model/ScheinCriteria';
import { IStudentDTO } from 'shared/model/Student';
import CustomSelect from '../../../components/CustomSelect';
import StudentForm, {
  convertFormStateToDTO,
  StudentFormState,
} from '../../../components/forms/StudentForm';
import EntityListItemMenu from '../../../components/list-item-menu/EntityListItemMenu';
import { ListItem } from '../../../components/list-item-menu/ListItemMenu';
import StudentAvatar from '../../../components/student-icon/StudentAvatar';
import { useDialog } from '../../../hooks/dialog-service/DialogService';
import { Student } from '../../../model/Student';
import { Team } from '../../../model/Team';
import { ROUTES } from '../../../routes/Routing.routes';
import ScheinStatusBox from '../../student-info/components/ScheinStatusBox';
import { getFilteredStudents, StudentSortOption } from './StudentList.helpers';

const useStyles = makeStyles((theme) =>
  createStyles({
    studentBar: {
      display: 'flex',
      alignItems: 'center',
      padding: theme.spacing(2),
      '&:hover': {
        background: theme.palette.action.hover,
      },
    },
    searchField: {
      flex: 1,
    },
    sortSelect: {
      marginLeft: theme.spacing(2),
      minWidth: '20%',
    },
  })
);

type SubtextType = 'team' | 'tutorial';

interface TopBarProps {
  filterText: string;
  onFilterTextChanged: (newText: string) => void;
  sortOption: StudentSortOption;
  onSortOptionChanged: (newOption: StudentSortOption) => void;
  additionalTopBarItem?: React.ReactNode;
}

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

function StudentListTopBar({
  filterText,
  onFilterTextChanged,
  sortOption,
  onSortOptionChanged,
  additionalTopBarItem,
}: TopBarProps): JSX.Element {
  const classes = useStyles();

  const handleSortOptionChanged = useCallback(
    (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
      if (typeof e.target.value !== 'string') {
        return;
      }

      if (e.target.value === sortOption) {
        return;
      }

      const selectedOption: StudentSortOption | undefined = Object.values(StudentSortOption).find(
        (op) => op === e.target.value
      );

      if (!selectedOption) {
        throw new Error('Selected filter option is not a valid one.');
      }

      onSortOptionChanged(selectedOption);
    },
    [sortOption, onSortOptionChanged]
  );

  return (
    <Box display='flex'>
      <TextField
        variant='outlined'
        label='Suche'
        value={filterText}
        onChange={(e) => onFilterTextChanged(e.target.value)}
        className={classes.searchField}
        InputProps={{
          startAdornment: <SearchIcon color='disabled' />,
        }}
      />

      <CustomSelect
        label='Sortieren nach...'
        emptyPlaceholder='Keine Sortieroptionen vorhanden.'
        className={classes.sortSelect}
        value={sortOption}
        items={Object.values(StudentSortOption)}
        itemToString={(option) => option}
        itemToValue={(option) => option}
        onChange={handleSortOptionChanged}
      />

      {additionalTopBarItem}
    </Box>
  );
}

const GUTTER_SIZE = 16;

interface GetSubtextParams {
  student: Student;
  subTextType: SubtextType;
}

function getSubtext({ student, subTextType }: GetSubtextParams): string {
  const { team, tutorial } = student ?? { team: undefined, tutorial: undefined };

  switch (subTextType) {
    case 'team':
      return team ? `Team: #${team.teamNo.toString().padStart(2, '0')}` : 'Kein Team.';

    case 'tutorial':
      return tutorial ? `Tutorium: ${tutorial.slot}` : 'In keinem Tutorium.';
  }
}

interface StudentListRowProps extends PaperProps {
  student: Student;
  scheinStatus: ScheinCriteriaSummary;
  subTextType: SubtextType;
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
  onChangeTutorial?: (student: Student) => void;
  tutorialId?: string;
}

function StudentListRow({
  student,
  scheinStatus,
  subTextType,
  tutorialId,
  onEdit,
  onDelete,
  onChangeTutorial,
  ...props
}: StudentListRowProps): JSX.Element {
  const classes = useStyles();
  const additionalMenuItems: ListItem[] = useMemo(() => {
    const items: ListItem[] = [
      {
        primary: 'E-Mail',
        Icon: MailIcon,
        disabled: !student.email,
        onClick: () => {
          window.location.href = `mailto:${student.email}`;
        },
      },
    ];

    if (!!onChangeTutorial) {
      items.push({
        primary: 'Tutorium wechseln',
        onClick: () => onChangeTutorial(student),
        Icon: ChangeTutorialIcon,
      });
    }

    return items;
  }, [onChangeTutorial, student]);

  return (
    <Paper {...props} className={classes.studentBar}>
      <StudentAvatar student={student} />

      <Box marginLeft={2} minWidth={250} display='flex' flexDirection='column'>
        <Typography>{student.name}</Typography>

        <Typography variant='body2' color='textSecondary'>
          {getSubtext({ student, subTextType })}
        </Typography>
      </Box>

      <ScheinStatusBox scheinStatus={scheinStatus} marginLeft={2} marginRight='auto' />

      <Button
        variant='outlined'
        component={Link}
        to={ROUTES.STUDENT_INFO.create({
          tutorialId,
          studentId: student.id,
        })}
        startIcon={<InfoIcon />}
        style={{ marginRight: 16 }}
      >
        Informationen
      </Button>

      <EntityListItemMenu
        onEditClicked={() => onEdit(student)}
        onDeleteClicked={() => onDelete(student)}
        additionalItems={additionalMenuItems}
      />
    </Paper>
  );
}

function StudentList({
  students,
  studentSubtextType,
  summaries,
  teams,
  onStudentEdit,
  onStudentDelete,
  onStudentChangeTutorial,
  tutorialId,
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
              //   <StudentAvatar student={student} />

              //   <Box marginLeft={2} minWidth={250} display='flex' flexDirection='column'>
              //     <Typography>{student.name}</Typography>

              //     <Typography variant='body2' color='textSecondary'>
              //       {getSubtext({ student, subTextType: studentSubtextType })}
              //     </Typography>
              //   </Box>

              //   <ScheinStatusBox scheinStatus={scheinStatus} marginLeft={2} marginRight='auto' />

              //   <Button
              //     variant='outlined'
              //     component={Link}
              //     to={ROUTES.STUDENT_INFO.create({
              //       tutorialId,
              //       studentId: student.id,
              //     })}
              //     startIcon={<InfoIcon />}
              //     style={{ marginRight: 16 }}
              //   >
              //     Informationen
              //   </Button>

              //   <EntityListItemMenu
              //     onEditClicked={() => handleStudentEdit(student)}
              //     onDeleteClicked={() => handleStudentDelete(student)}
              //     // additionalItems={additionalMenuItems}
              //   />
              // </Paper>
            );
          }}
        </FixedSizeList>
      </div>
    </Box>
  );
}

export default StudentList;
