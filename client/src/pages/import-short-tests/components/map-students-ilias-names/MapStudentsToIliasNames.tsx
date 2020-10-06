import { Box, Button, Chip, Divider, TableCell, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { CheckCircleOutline as CheckIcon } from 'mdi-material-ui';
import React, { useCallback } from 'react';
import { getNameOfEntity } from 'shared/util/helpers';
import OutlinedBox from '../../../../components/OutlinedBox';
import PaperTableRow from '../../../../components/PaperTableRow';
import Placeholder from '../../../../components/Placeholder';
import TableWithPadding from '../../../../components/TableWithPadding';
import { SelectionDialogChildrenProps } from '../../../../hooks/dialog-service/components/SelectionDialogContent';
import { useDialog } from '../../../../hooks/dialog-service/DialogService';
import { Student } from '../../../../model/Student';
import { useIliasMappingContext } from './IliasMapping.context';
import MappingDialog from './MappingDialog';

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
    removeMappingButton: { marginRight: theme.spacing(1) },
  })
);

function MapStudentsToIliasNames(): JSX.Element {
  const classes = useStyles();
  const { showSelectionDialog, showConfirmationDialog } = useDialog();
  const {
    value: students,
    isLoading,
    iliasNamesWithoutStudent,
    studentsWithoutResult,
    iliasNameMapping,
    addMapping,
    removeMapping,
  } = useIliasMappingContext();

  const handleMapNameToStudent = useCallback(
    async (iliasName: string) => {
      const result = await showSelectionDialog({
        title: `Studierenden zuordnen ("${iliasName}")`,
        content: (props: SelectionDialogChildrenProps<Student>) => (
          <MappingDialog
            students={studentsWithoutResult ?? []}
            iliasName={iliasName}
            initiallySelected={iliasNameMapping.get(iliasName)}
            {...props}
          />
        ),
        disableSelectIfNoneSelected: true,
        DialogProps: { maxWidth: 'lg' },
      });

      if (result) {
        addMapping(iliasName, result);
      }
    },
    [showSelectionDialog, studentsWithoutResult, addMapping, iliasNameMapping]
  );

  const handleRemoveStudentMapping = useCallback(
    async (iliasName: string) => {
      const result = await showConfirmationDialog({
        title: 'Zuordnung entfernen',
        content: `Soll die Zuordnung für den Iliasname "${iliasName}" wirklich entfernt werden? Dies kann nicht rückgängig gemacht werden.`,
        acceptProps: { label: 'Entfernen', deleteButton: true },
        cancelProps: { label: 'Abbrechen' },
      });

      if (result) {
        removeMapping(iliasName);
      }
    },
    [showConfirmationDialog, removeMapping]
  );

  return (
    <Box display='flex' flexDirection='column' flex={1}>
      <Typography variant='h4' className={classes.header}>
        Studierende &amp; Ilias-Namen zuordnen
      </Typography>

      <Placeholder
        placeholderText='Keine Studierenden vorhanden'
        showPlaceholder={students?.length === 0}
        loading={isLoading}
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
                    placeholder='Alle Iliasnamen konnten zugeordnet werden.'
                    createRowFromItem={(iliasName) => {
                      const mappedStudent = iliasNameMapping.get(iliasName);

                      return (
                        <PaperTableRow
                          label={iliasName}
                          buttonCellContent={
                            <>
                              {mappedStudent && (
                                <Button
                                  onClick={() => handleRemoveStudentMapping(iliasName)}
                                  className={classes.removeMappingButton}
                                >
                                  Zuordnung entfernen
                                </Button>
                              )}
                              <Button onClick={() => handleMapNameToStudent(iliasName)}>
                                Studierenden zuordnen
                              </Button>
                            </>
                          }
                          elevation={0}
                        >
                          <TableCell>
                            <Chip
                              label={
                                mappedStudent
                                  ? mappedStudent.name
                                  : 'Kein/e Studierende/r zugeordnet'
                              }
                              className={mappedStudent ? classes.chipOkay : classes.chipError}
                            />
                          </TableCell>
                        </PaperTableRow>
                      );
                    }}
                  />
                </Box>

                <Divider className={classes.divider} />

                <Box>
                  <Typography variant='h5' className={classes.subHeader}>
                    Studierende ohne Testergebnis
                  </Typography>

                  <TableWithPadding
                    items={studentsWithoutResult}
                    placeholder='Alle Studierende haben ein Testergebnis.'
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
