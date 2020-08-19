import { Box, Button, Chip, Divider, TableCell, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { CheckCircleOutline as CheckIcon } from 'mdi-material-ui';
import React, { useMemo, useState } from 'react';
import { getNameOfEntity } from 'shared/util/helpers';
import { useMapColumnsHelpers } from '../../../components/import-csv/hooks/useMapColumnsHelpers';
import OutlinedBox from '../../../components/OutlinedBox';
import PaperTableRow from '../../../components/PaperTableRow';
import Placeholder from '../../../components/Placeholder';
import TableWithPadding from '../../../components/TableWithPadding';
import { getAllStudents } from '../../../hooks/fetching/Student';
import { useFetchState } from '../../../hooks/useFetchState';
import { Student } from '../../../model/Student';
import { ShortTestColumns } from '../ImportShortTests';

const useStyles = makeStyles((theme) =>
  createStyles({
    header: { marginBottom: theme.spacing(4) },
    subHeader: { marginBottom: theme.spacing(2) },
    divider: { margin: theme.spacing(2, 0) },
    checkIcon: { color: theme.palette.green.main, marginLeft: theme.spacing(2) },
    chipOkay: {
      background: theme.palette.green.main,
      color: theme.palette.getContrastText(theme.palette.green.main),
    },
    chipError: { background: theme.palette.error.main, color: theme.palette.error.contrastText },
  })
);

function MapStudentsToIliasNames(): JSX.Element {
  const classes = useStyles();
  const { data, mappedColumns } = useMapColumnsHelpers<ShortTestColumns>();

  const [isWorking, setWorking] = useState(false);
  const { isLoading, error, value: students } = useFetchState({
    fetchFunction: getAllStudents,
    immediate: true,
    params: [],
  });

  const { iliasNamesWithoutStudent, studentsWithoutResult } = useMemo(() => {
    const iliasNamesWithoutStudent: string[] = [];
    const studentsWithoutResult: Student[] = [];

    if (isLoading || !students) {
      return { iliasNamesWithoutStudent, studentsWithoutResult };
    }

    // TODO: Maybe find a better algorithm for this stuff?
    setWorking(true);
    const iliasNamesInData = data.rows.map(({ data }) => data[mappedColumns.iliasName]);

    iliasNamesInData.forEach((iliasName) => {
      if (iliasName) {
        const idx = students.findIndex((s) => s.iliasName === iliasName);
        if (idx === -1) {
          iliasNamesWithoutStudent.push(iliasName);
        }
      }
    });

    students.forEach((student) => {
      const idx = iliasNamesInData.findIndex((name) => name === student.iliasName);

      if (idx === -1) {
        studentsWithoutResult.push(student);
      }
    });

    setWorking(false);
    return { iliasNamesWithoutStudent, studentsWithoutResult };
  }, [students, isLoading, data.rows, mappedColumns.iliasName]);

  return (
    <Box display='flex' flexDirection='column' flex={1}>
      <Typography variant='h4' className={classes.header}>
        Studierende &amp; Ilias-Namen zuordnen
      </Typography>

      <Placeholder
        placeholderText='Keine Studierenden vorhanden'
        showPlaceholder={students?.length === 0}
        loading={isLoading || isWorking}
      >
        {students && (
          <Box flex={1}>
            {iliasNamesWithoutStudent.length === 0 && studentsWithoutResult.length === 0 ? (
              <OutlinedBox display='flex' alignItems='center' justifyContent='center'>
                <Typography variant='h5'>Alle Ilias-Namen konnten zugeordnet werden.</Typography>
                <CheckIcon className={classes.checkIcon} />
              </OutlinedBox>
            ) : (
              <>
                <Box>
                  <Typography variant='h5' className={classes.subHeader}>
                    Nicht zuordenbare Ilias-Namen
                  </Typography>

                  <TableWithPadding
                    items={iliasNamesWithoutStudent}
                    createRowFromItem={(item) => (
                      <PaperTableRow
                        label={item}
                        buttonCellContent={<Button>Studierenden zuordnen</Button>}
                        elevation={0}
                      >
                        <TableCell>
                          <Chip
                            label='Kein/e Studierende/r zugeordnet'
                            // TODO: Change color depending on if a student got mapped.
                            className={clsx(classes.chipError)}
                          />
                        </TableCell>
                      </PaperTableRow>
                    )}
                  />
                </Box>

                <Divider className={classes.divider} />

                <Box>
                  <Typography variant='h5' className={classes.subHeader}>
                    Studierende ohne Testergebnis
                  </Typography>

                  <TableWithPadding
                    items={studentsWithoutResult}
                    createRowFromItem={(student) => (
                      <PaperTableRow label={getNameOfEntity(student)} elevation={0}></PaperTableRow>
                    )}
                  />
                </Box>
              </>
            )}
          </Box>
        )}
      </Placeholder>
    </Box>
  );
}

export default MapStudentsToIliasNames;
