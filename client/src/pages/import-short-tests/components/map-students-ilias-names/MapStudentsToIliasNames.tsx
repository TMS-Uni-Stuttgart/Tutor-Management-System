import { Box, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { CheckCircleOutline as CheckIcon } from 'mdi-material-ui';
import React, { useCallback } from 'react';
import OutlinedBox from '../../../../components/OutlinedBox';
import Placeholder from '../../../../components/Placeholder';
import VirtualizedList from '../../../../components/virtualized-list/VirtualizedList';
import { SelectionDialogChildrenProps } from '../../../../hooks/dialog-service/components/SelectionDialogContent';
import { useDialog } from '../../../../hooks/dialog-service/DialogService';
import { Student } from '../../../../model/Student';
import { useIliasMappingContext } from './IliasMapping.context';
import MappingDialog from './MappingDialog';
import MapStudentRow from './MapStudentRow';

const useStyles = makeStyles((theme) =>
  createStyles({
    checkIcon: { color: theme.palette.green.main, marginLeft: theme.spacing(2) },
    studentList: { flex: 1 },
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
    addMapping,
    getMapping,
    removeMapping,
  } = useIliasMappingContext();

  const handleMapNameToStudent = useCallback(
    async (iliasName: string) => {
      const result = await showSelectionDialog({
        title: `Studierende/n zuordnen (${iliasName})`,
        content: (props: SelectionDialogChildrenProps<Student>) => (
          <MappingDialog
            students={studentsWithoutResult}
            iliasName={iliasName}
            initiallySelected={getMapping(iliasName)}
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
    [showSelectionDialog, studentsWithoutResult, getMapping, addMapping]
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
    <Box
      display='grid'
      width='100%'
      gridRowGap={32}
      gridTemplateColumns='1fr'
      gridTemplateRows='auto minmax(350px, 1fr)'
    >
      <Typography variant='h4'>Studierende &amp; Ilias-Namen zuordnen</Typography>

      <Placeholder
        placeholderText='Keine Studierenden verfügbar'
        showPlaceholder={!students || students.length === 0}
        loading={isLoading}
      >
        {students &&
          (iliasNamesWithoutStudent.length === 0 ? (
            <OutlinedBox
              display='flex'
              paddingX={3}
              justifySelf='center'
              alignItems='center'
              justifyContent='center'
              width='fit-content'
            >
              <Typography variant='h5'>Alle Ilias-Namen konnten zugeordnet werden.</Typography>
              <CheckIcon className={classes.checkIcon} />
            </OutlinedBox>
          ) : (
            <Box display='flex' flexDirection='column' maxWidth='100%'>
              <Typography variant='h5'>Nicht zuordenbare Ilias-Namen</Typography>

              <VirtualizedList
                items={iliasNamesWithoutStudent}
                placeholder='Alle Ilias-Namen konnten zugeordnet werden.'
                className={classes.studentList}
              >
                {({ item: iliasName }) => (
                  <MapStudentRow
                    iliasName={iliasName}
                    mappedStudent={getMapping(iliasName)}
                    onMapStudent={() => handleMapNameToStudent(iliasName)}
                    onRemoveMapping={() => handleRemoveStudentMapping(iliasName)}
                  />
                )}
              </VirtualizedList>
            </Box>
          ))}
      </Placeholder>
    </Box>
  );
}

export default MapStudentsToIliasNames;
