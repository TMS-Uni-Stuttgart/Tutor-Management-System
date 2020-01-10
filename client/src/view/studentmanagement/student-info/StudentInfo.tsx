import { Box, Paper, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { useSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Sheet } from 'shared/dist/model/Sheet';
import { Student } from 'shared/dist/model/Student';
import { getNameOfEntity } from 'shared/dist/util/helpers';
import BackButton from '../../../components/BackButton';
import CustomSelect, { OnChangeHandler } from '../../../components/CustomSelect';
import Placeholder from '../../../components/Placeholder';
import { getAllSheets } from '../../../hooks/fetching/Sheet';
import { getStudent } from '../../../hooks/fetching/Student';
import { useErrorSnackbar } from '../../../hooks/useErrorSnackbar';
import { getStudentOverviewPath } from '../../../routes/Routing.helpers';
import { getDisplayStringOfSheet } from '../../../util/helperFunctions';

const useStyles = makeStyles(theme =>
  createStyles({
    backButton: {
      marginRight: theme.spacing(2),
      alignSelf: 'center',
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
  const [selectedSheet, setSelectedSheet] = useState('');
  const [student, setStudent] = useState<Student>();

  useEffect(() => {
    getAllSheets()
      .then(response => setSheets(response))
      .catch(() => {
        enqueueSnackbar('Übungsblätter konnten nicht abgerufen werden.', { variant: 'error' });
      });
  }, []);

  useEffect(() => {
    getStudent(studentId)
      .then(response => setStudent(response))
      .catch(() => setError('Studierende/r konnte nicht abgerufen werden.'));
  }, [studentId]);

  const handleSheetSelectionChange: OnChangeHandler = e => {
    if (typeof e.target.value !== 'string') {
      return;
    }

    setSelectedSheet(e.target.value as string);
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
        <Paper variant='outlined'>
          <Box padding={2}>
            <CustomSelect
              label='Übungsblatt'
              emptyPlaceholder='Keine Übungsblätter vorhanden.'
              nameOfNoneItem='Kein Übungsblatt'
              items={sheets}
              itemToString={getDisplayStringOfSheet}
              itemToValue={sheet => sheet.id}
              onChange={handleSheetSelectionChange}
              value={selectedSheet}
            />
          </Box>
        </Paper>
        <code style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(student, null, 2)}</code>
      </Placeholder>
    </Box>
  );
}

export default StudentInfo;
