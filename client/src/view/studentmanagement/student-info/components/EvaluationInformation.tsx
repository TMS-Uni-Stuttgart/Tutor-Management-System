import { Box, BoxProps, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { useSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import CustomSelect, { OnChangeHandler } from '../../../../components/CustomSelect';
import LoadingSpinner from '../../../../components/loading/LoadingSpinner';
import Markdown from '../../../../components/Markdown';
import Placeholder from '../../../../components/Placeholder';
import PointsTable from '../../../../components/points-table/PointsTable';
import { getStudentCorrectionCommentMarkdown } from '../../../../hooks/fetching/Files';
import { Grading } from '../../../../model/Grading';
import { Sheet } from '../../../../model/Sheet';
import { Student } from '../../../../model/Student';

const useStyles = makeStyles(theme =>
  createStyles({
    sheetSelect: {
      marginLeft: theme.spacing(2),
      flex: 1,
    },
    pointsTable: {
      width: 'unset',
    },
    markdownBox: {
      flex: 1,
      marginLeft: theme.spacing(2),
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: theme.shape.borderRadius,
      padding: theme.spacing(1.5),
    },
  })
);

interface Props extends BoxProps {
  student: Student;
  sheets: Sheet[];
}

function EvaluationInformation({ student, sheets, ...props }: Props): JSX.Element {
  const classes = useStyles();

  const { enqueueSnackbar } = useSnackbar();

  const [gradingOfSelected, setGradingOfSelected] = useState<Grading>();
  const [selectedSheet, setSelectedSheet] = useState<Sheet>();
  const [studentMarkdown, setStudentMarkdown] = useState<string>();

  useEffect(() => {
    setStudentMarkdown(undefined);

    if (!selectedSheet) {
      setGradingOfSelected(undefined);
      return;
    }

    setGradingOfSelected(student.getGrading(selectedSheet));

    getStudentCorrectionCommentMarkdown(selectedSheet.id, student.id)
      .then(response => {
        setStudentMarkdown(response);
      })
      .catch(() => {
        enqueueSnackbar('Bewertungskommentar konnte nicht abgerufen werden.', { variant: 'error' });
        setStudentMarkdown('');
      });
  }, [selectedSheet, student, enqueueSnackbar]);

  const handleSheetSelectionChange: OnChangeHandler = e => {
    if (typeof e.target.value !== 'string') {
      return;
    }

    const sheetId = e.target.value as string;
    const sheet = sheets.find(s => s.id === sheetId);

    setSelectedSheet(sheet);
  };

  return (
    <Box {...props}>
      <Box display='flex' alignItems='center'>
        <Typography variant='h6'>Bewertung für </Typography>

        <CustomSelect
          label='Übungsblatt'
          emptyPlaceholder='Keine Übungsblätter vorhanden.'
          nameOfNoneItem='Kein Übungsblatt'
          className={classes.sheetSelect}
          items={sheets}
          itemToString={sheet => sheet.toDisplayString()}
          itemToValue={sheet => sheet.id}
          onChange={handleSheetSelectionChange}
          value={selectedSheet?.id ?? ''}
        />
      </Box>

      <Placeholder
        placeholderText='Kein Übungsblatt ausgewählt.'
        showPlaceholder={!selectedSheet}
        reduceMarginTop
      >
        {selectedSheet && gradingOfSelected && (
          <Box marginTop={2} display='flex'>
            <PointsTable
              className={classes.pointsTable}
              grading={gradingOfSelected}
              sheet={selectedSheet}
              size='medium'
              disablePaper
            />

            <Box className={classes.markdownBox}>
              {studentMarkdown === undefined ? (
                <LoadingSpinner />
              ) : (
                <Markdown markdown={studentMarkdown} />
              )}
            </Box>
          </Box>
        )}
      </Placeholder>
    </Box>
  );
}

export default EvaluationInformation;
