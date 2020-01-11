import { Box, Paper, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { useSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { PointMap } from 'shared/dist/model/Points';
import { Sheet } from 'shared/dist/model/Sheet';
import { Student } from 'shared/dist/model/Student';
import { getNameOfEntity } from 'shared/dist/util/helpers';
import BackButton from '../../../components/BackButton';
import CustomSelect, { OnChangeHandler } from '../../../components/CustomSelect';
import Markdown from '../../../components/Markdown';
import Placeholder from '../../../components/Placeholder';
import PointsTable from '../../../components/points-table/PointsTable';
import { getAllSheets } from '../../../hooks/fetching/Sheet';
import { getStudent } from '../../../hooks/fetching/Student';
import { useErrorSnackbar } from '../../../hooks/useErrorSnackbar';
import { getStudentOverviewPath } from '../../../routes/Routing.helpers';
import { getDisplayStringOfSheet } from '../../../util/helperFunctions';
import { getStudentCorrectionCommentMarkdown } from '../../../hooks/fetching/Files';
import LoadingSpinner from '../../../components/LoadingSpinner';

const useStyles = makeStyles(theme =>
  createStyles({
    backButton: {
      marginRight: theme.spacing(2),
      alignSelf: 'center',
    },
    sheetSelect: {
      marginLeft: theme.spacing(2),
      flex: 1,
    },
    evaluationPaper: {
      marginBottom: theme.spacing(1),
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

interface RouteParams {
  studentId: string;
  tutorialId?: string;
}

function StudentInfo(): JSX.Element {
  const classes = useStyles();
  const { studentId, tutorialId } = useParams<RouteParams>();

  const { enqueueSnackbar } = useSnackbar();
  const { setError } = useErrorSnackbar();

  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<Sheet>();
  const [student, setStudent] = useState<Student>();
  const [pointsOfStudent, setPointsOfStudent] = useState<PointMap>();
  const [studentMarkdown, setStudentMarkdown] = useState<string>();

  useEffect(() => {
    getAllSheets()
      .then(response => setSheets(response))
      .catch(() => {
        enqueueSnackbar('Übungsblätter konnten nicht abgerufen werden.', { variant: 'error' });
      });
  }, [enqueueSnackbar]);

  useEffect(() => {
    getStudent(studentId)
      .then(response => setStudent(response))
      .catch(() => setError('Studierende/r konnte nicht abgerufen werden.'));
  }, [studentId, setError]);

  useEffect(() => {
    if (!!student) {
      setPointsOfStudent(new PointMap(student.points));
    } else {
      setPointsOfStudent(undefined);
    }
  }, [student]);

  useEffect(() => {
    setStudentMarkdown(undefined);

    if (!selectedSheet || !student) {
      return;
    }

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
    <Box display='flex' flexDirection='column'>
      <Box display='flex' marginBottom={3}>
        <BackButton to={getStudentOverviewPath(tutorialId)} className={classes.backButton} />

        <Typography variant='h4'>{student && getNameOfEntity(student)}</Typography>
      </Box>

      <Placeholder
        placeholderText='Kein Studierender verfügbar.'
        showPlaceholder={false}
        loading={!student}
      >
        <Paper variant='outlined' className={classes.evaluationPaper}>
          <Box padding={2}>
            <Box display='flex' alignItems='center'>
              <Typography variant='h6'>Bewertung für </Typography>

              <CustomSelect
                label='Übungsblatt'
                emptyPlaceholder='Keine Übungsblätter vorhanden.'
                nameOfNoneItem='Kein Übungsblatt'
                className={classes.sheetSelect}
                items={sheets}
                itemToString={getDisplayStringOfSheet}
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
              {selectedSheet && pointsOfStudent && (
                <Box marginTop={2} display='flex'>
                  <PointsTable
                    className={classes.pointsTable}
                    points={pointsOfStudent}
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
        </Paper>
      </Placeholder>
    </Box>
  );
}

export default StudentInfo;
