import { Box, BoxProps, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React, { useEffect, useState } from 'react';
import CustomSelect, { OnChangeHandler } from '../../../../components/CustomSelect';
import Placeholder from '../../../../components/Placeholder';
import PointsTable from '../../../../components/points-table/PointsTable';
import { Grading } from '../../../../model/Grading';
import { Scheinexam } from '../../../../model/Scheinexam';
import { Student } from '../../../../model/Student';

const useStyles = makeStyles((theme) =>
  createStyles({
    sheetSelect: {
      marginLeft: theme.spacing(2),
      flex: 1,
    },
  })
);

interface Props extends BoxProps {
  student: Student;
  exams: Scheinexam[];
}

function ScheinExamInformation({ student, exams, ...props }: Props): JSX.Element {
  const classes = useStyles();

  const [gradingOfSelected, setGradingOfSelected] = useState<Grading>();
  const [selectedExam, setSelectedExam] = useState<Scheinexam>();

  useEffect(() => {
    if (!!selectedExam) {
      setGradingOfSelected(student.getGrading(selectedExam));
    } else {
      setGradingOfSelected(undefined);
    }
  }, [student, selectedExam]);

  const handleScheinExamSelectionChange: OnChangeHandler = (e) => {
    if (typeof e.target.value !== 'string') {
      return;
    }

    const examId = e.target.value as string;
    const exam = exams.find((s) => s.id === examId);

    setSelectedExam(exam);
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
          itemToString={(exam) => exam.toDisplayString()}
          itemToValue={(exam) => exam.id}
          onChange={handleScheinExamSelectionChange}
          value={selectedExam?.id ?? ''}
        />
      </Box>

      <Placeholder
        placeholderText='Keine Scheinklausur ausgewählt.'
        showPlaceholder={!selectedExam}
        reduceMarginTop
      >
        {selectedExam && gradingOfSelected && (
          <Box marginTop={2} display='flex'>
            <PointsTable
              grading={gradingOfSelected}
              sheet={selectedExam}
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
