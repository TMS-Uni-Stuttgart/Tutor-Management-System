import { Box, Button, Paper, TextField, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { AccountSearch as SearchIcon, InformationOutline as InfoIcon } from 'mdi-material-ui';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FixedSizeList } from 'react-window';
import { ScheincriteriaSummaryByStudents } from 'shared/model/ScheinCriteria';
import CustomSelect from '../../../components/CustomSelect';
import EntityListItemMenu from '../../../components/list-item-menu/EntityListItemMenu';
import StudentAvatar from '../../../components/student-icon/StudentAvatar';
import { Student } from '../../../model/Student';
import { ROUTES } from '../../../routes/Routing.routes';
import ScheinStatusBox from '../../student-info/components/ScheinStatusBox';
import { getFilteredStudents, StudentSortOption } from './StudentList.helpers';

const useStyles = makeStyles((theme) =>
  createStyles({
    studentBar: {
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
  onStudentEdit: (student: Student) => void;
  onStudentDelete: (student: Student) => void;
  additionalTopBarItem?: React.ReactNode;
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

function StudentList({
  students,
  studentSubtextType,
  summaries,
  onStudentEdit,
  onStudentDelete,
  tutorialId,
}: Props): JSX.Element {
  const classes = useStyles();

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
              <Paper
                style={{
                  ...style,
                  top: posTop + GUTTER_SIZE,
                  height: elHeight - GUTTER_SIZE,
                  display: 'flex',
                  alignItems: 'center',
                }}
                className={classes.studentBar}
              >
                <StudentAvatar student={student} />

                <Box marginLeft={2} minWidth={250} display='flex' flexDirection='column'>
                  <Typography>{student.name}</Typography>

                  <Typography variant='body2' color='textSecondary'>
                    {getSubtext({ student, subTextType: studentSubtextType })}
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
                  onEditClicked={() => onStudentEdit(student)}
                  onDeleteClicked={() => onStudentDelete(student)}
                  // additionalItems={additionalMenuItems}
                />
              </Paper>
            );
          }}
        </FixedSizeList>
      </div>
    </Box>
  );
}

export default StudentList;
