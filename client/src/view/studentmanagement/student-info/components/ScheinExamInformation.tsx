import { Box, BoxProps, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React, { useEffect, useState } from 'react';
import { PointMap } from 'shared/dist/model/Points';
import { ScheinExam } from 'shared/dist/model/Scheinexam';
import { Student } from 'shared/dist/model/Student';
import CustomSelect, { OnChangeHandler } from '../../../../components/CustomSelect';
import Placeholder from '../../../../components/Placeholder';
import PointsTable from '../../../../components/points-table/PointsTable';
import { getDisplayStringOfScheinExam } from '../../../../util/helperFunctions';

const useStyles = makeStyles(theme =>
  createStyles({
    sheetSelect: {
      marginLeft: theme.spacing(2),
      flex: 1,
    },
    pointsTable: {
      width: 'unset',
    },
  })
);

interface Props extends BoxProps {
  student: Student;
  exams: ScheinExam[];
}

function ScheinExamInformation({ student, exams, ...props }: Props): JSX.Element {
  const classes = useStyles();

  const [pointsOfStudent, setPointsOfStudent] = useState<PointMap>();
  const [selectedSheet, setSelectedSheet] = useState<ScheinExam>();

  useEffect(() => {
    if (!!student) {
      setPointsOfStudent(new PointMap(student.scheinExamResults));
    } else {
      setPointsOfStudent(undefined);
    }
  }, [student]);

  const handleScheinExamSelectionChange: OnChangeHandler = e => {
    if (typeof e.target.value !== 'string') {
      return;
    }

    const examId = e.target.value as string;
    const exam = exams.find(s => s.id === examId);

    setSelectedSheet(exam);
  };

  return (
    <Box {...props}>
      <Box display='flex' alignItems='center'>
        <Typography variant='h6'>Bewertung für </Typography>

        <CustomSelect
          label='Scheinklausur'
          emptyPlaceholder='Keine Scheinklausuren vorhanden.'
          nameOfNoneItem='Keine Scheinklausur'
          className={classes.sheetSelect}
          items={exams}
          itemToString={getDisplayStringOfScheinExam}
          itemToValue={exam => exam.id}
          onChange={handleScheinExamSelectionChange}
          value={selectedSheet?.id ?? ''}
        />
      </Box>

      <Placeholder
        placeholderText='Kein Übungsblatt ausgewählt.'
        showPlaceholder={!selectedSheet}
        reduceMarginTop
      >
        {selectedSheet && pointsOfStudent && (
          <Box marginTop={2} display='flex'>
            <PointsTable
              className={classes.pointsTable}
              points={pointsOfStudent}
              sheet={selectedSheet}
              size='medium'
              disablePaper
            />
          </Box>
        )}
      </Placeholder>
    </Box>
  );
}

export default ScheinExamInformation;
